/**
 * Analytics Queries - ANALYTICS & DASHBOARD SYSTEM
 *
 * 🎯 Amaç: Dashboard istatistikleri, raporlama, trend analizi
 *
 * 📋 Mevcut Query'ler:
 *
 * DASHBOARD QUERIES:
 * - companyDashboardStats: Firma dashboard istatistikleri (orders, revenue, production)
 * - userDashboardStats: Kullanıcı dashboard istatistikleri (my orders, samples, tasks)
 *
 * TREND QUERIES:
 * - orderTrends: Sipariş trendi (zaman serisi)
 * - productionMetrics: Üretim metrikleri (verimlilik, gecikmeler)
 * - revenueReport: Gelir raporu (aylık/yıllık)
 *
 * PERFORMANCE QUERIES:
 * - supplierPerformance: Tedarikçi performans analizi (kalite, teslimat süreleri)
 * - customerAnalytics: Müşteri analizi (sipariş hacmi, ödeme performansı)
 *
 * 🔒 Güvenlik:
 * - Tüm query'ler doğrulanmış kullanıcı gerektirir
 * - Kullanıcılar sadece kendi firma verilerini görür
 * - Admin tüm verileri görür
 *
 * 💡 Özellikler:
 * - Gerçek zamanlı istatistikler
 * - Zaman serisi analizi
 * - Karşılaştırmalı raporlama
 * - Performans metrikleri
 */

import { handleError, requireAuth } from "../../utils/errors";
import { createTimer, logInfo } from "../../utils/logger";
import { sanitizeInt } from "../../utils/sanitize";
import builder from "../builder";

// ========================================
// INPUT TYPES
// ========================================

const DateRangeInput = builder.inputType("DateRangeInput", {
  fields: (t) => ({
    startDate: t.string({ required: true }),
    endDate: t.string({ required: true }),
  }),
});

const TrendPeriodInput = builder.inputType("TrendPeriodInput", {
  fields: (t) => ({
    period: t.string({ required: true }), // DAILY, WEEKLY, MONTHLY, YEARLY
    startDate: t.string({ required: true }),
    endDate: t.string({ required: true }),
  }),
});

// ========================================
// DASHBOARD QUERIES
// ========================================

/**
 * QUERY: companyDashboardStats
 *
 * Açıklama: Firma dashboard istatistikleri (CEO/Owner görünümü)
 * Güvenlik: Doğrulanmış kullanıcı (firma üyesi)
 * Döner: JSON (orders, revenue, production, users, samples)
 */
builder.queryField("companyDashboardStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: async (_root, _args, ctx) => {
      const timer = createTimer("companyDashboardStats");
      try {
        requireAuth(ctx.user?.id);

        const companyId = sanitizeInt(ctx.user?.companyId);
        if (!companyId) {
          throw new Error("Kullanıcı bir firmaya bağlı değil");
        }

        // Get company role (manufacturer or customer)
        const company = await ctx.prisma.company.findUnique({
          where: { id: companyId },
          select: { type: true },
        });

        if (!company) {
          throw new Error("Firma bulunamadı");
        }

        const isManufacturer = company.type === "MANUFACTURER";

        // Parallel queries for better performance
        const [
          totalOrders,
          activeOrders,
          completedOrders,
          totalSamples,
          activeSamples,
          totalProductions,
          activeProductions,
          completedProductions,
          totalUsers,
          totalRevenue,
          pendingPayments,
          overduePayments,
        ] = await Promise.all([
          // Orders
          ctx.prisma.order.count({
            where: isManufacturer
              ? { manufactureId: companyId }
              : { customerId: companyId },
          }),
          ctx.prisma.order.count({
            where: {
              ...(isManufacturer
                ? { manufactureId: companyId }
                : { customerId: companyId }),
              status: {
                in: [
                  "PENDING",
                  "IN_PRODUCTION",
                  "QUALITY_CHECK",
                  "SHIPPED",
                  "IN_TRANSIT",
                ],
              },
            },
          }),
          ctx.prisma.order.count({
            where: {
              ...(isManufacturer
                ? { manufactureId: companyId }
                : { customerId: companyId }),
              status: "DELIVERED",
            },
          }),

          // Samples
          ctx.prisma.sample.count({
            where: isManufacturer
              ? { manufactureId: companyId }
              : { customerId: companyId },
          }),
          ctx.prisma.sample.count({
            where: {
              ...(isManufacturer
                ? { manufactureId: companyId }
                : { customerId: companyId }),
              status: {
                in: ["PENDING", "IN_PRODUCTION", "QUALITY_CHECK"],
              },
            },
          }),

          // Productions (manufacturer only)
          isManufacturer
            ? ctx.prisma.productionTracking.count({
                where: {
                  order: { manufactureId: companyId },
                },
              })
            : 0,
          isManufacturer
            ? ctx.prisma.productionTracking.count({
                where: {
                  order: { manufactureId: companyId },
                  overallStatus: "IN_PROGRESS",
                },
              })
            : 0,
          isManufacturer
            ? ctx.prisma.productionTracking.count({
                where: {
                  order: { manufactureId: companyId },
                  overallStatus: "COMPLETED",
                },
              })
            : 0,

          // Users
          ctx.prisma.user.count({
            where: { companyId },
          }),

          // Revenue (manufacturer only)
          isManufacturer
            ? ctx.prisma.payment.aggregate({
                where: {
                  order: { manufactureId: companyId },
                  status: "CONFIRMED",
                },
                _sum: { amount: true },
              })
            : { _sum: { amount: null } },

          // Pending payments
          ctx.prisma.payment.count({
            where: {
              ...(isManufacturer
                ? { order: { manufactureId: companyId } }
                : { order: { customerId: companyId } }),
              status: {
                in: ["PENDING", "RECEIPT_UPLOADED"],
              },
            },
          }),

          // Overdue payments
          ctx.prisma.payment.count({
            where: {
              ...(isManufacturer
                ? { order: { manufactureId: companyId } }
                : { order: { customerId: companyId } }),
              status: "OVERDUE",
            },
          }),
        ]);

        const stats = {
          orders: {
            total: totalOrders,
            active: activeOrders,
            completed: completedOrders,
            completionRate:
              totalOrders > 0
                ? Math.round((completedOrders / totalOrders) * 100)
                : 0,
          },
          samples: {
            total: totalSamples,
            active: activeSamples,
          },
          production: isManufacturer
            ? {
                total: totalProductions,
                active: activeProductions,
                completed: completedProductions,
                completionRate:
                  totalProductions > 0
                    ? Math.round(
                        (completedProductions / totalProductions) * 100
                      )
                    : 0,
              }
            : null,
          users: {
            total: totalUsers,
          },
          revenue: isManufacturer
            ? {
                total: totalRevenue._sum.amount || 0,
                currency: "USD",
              }
            : null,
          payments: {
            pending: pendingPayments,
            overdue: overduePayments,
          },
        };

        logInfo("Company dashboard stats retrieved", {
          metadata: timer.end(),
          companyId,
          userId: ctx.user!.id,
          isManufacturer,
        });

        return stats;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

/**
 * QUERY: userDashboardStats
 *
 * Açıklama: Kullanıcı dashboard istatistikleri (my orders, my samples, my tasks)
 * Güvenlik: Doğrulanmış kullanıcı
 * Döner: JSON
 */
builder.queryField("userDashboardStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: async (_root, _args, ctx) => {
      const timer = createTimer("userDashboardStats");
      try {
        requireAuth(ctx.user?.id);
        const userId = ctx.user!.id;

        // Get user's role and company
        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
          select: {
            role: true,
            department: true,
            companyId: true,
            company: {
              select: { type: true },
            },
          },
        });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        // Parallel queries
        const [
          myOrders,
          myActiveOrders,
          mySamples,
          myActiveSamples,
          unreadNotifications,
          unreadMessages,
          pendingApprovals,
        ] = await Promise.all([
          // My orders (if customer company)
          user.company?.type === "BUYER"
            ? ctx.prisma.order.count({
                where: {
                  customerId: user.companyId!,
                },
              })
            : 0,

          user.company?.type === "BUYER"
            ? ctx.prisma.order.count({
                where: {
                  customerId: user.companyId!,
                  status: {
                    in: ["PENDING", "IN_PRODUCTION"],
                  },
                },
              })
            : 0,

          // My samples
          user.company?.type === "BUYER"
            ? ctx.prisma.sample.count({
                where: {
                  customerId: user.companyId!,
                },
              })
            : 0,

          user.company?.type === "BUYER"
            ? ctx.prisma.sample.count({
                where: {
                  customerId: user.companyId!,
                  status: {
                    in: ["REQUESTED", "IN_PRODUCTION"],
                  },
                },
              })
            : 0,

          // Unread notifications
          ctx.prisma.notification.count({
            where: { userId, isRead: false },
          }),

          // Unread messages
          ctx.prisma.message.count({
            where: { receiverId: userId, isRead: false },
          }),

          // Pending approvals (if owner or admin)
          user.role === "ADMIN" || user.role === "COMPANY_OWNER"
            ? ctx.prisma.productionTracking.count({
                where: {
                  planStatus: "PENDING",
                  order: { customerId: user.companyId! },
                },
              })
            : 0,
        ]);

        const stats = {
          orders: {
            total: myOrders,
            active: myActiveOrders,
          },
          samples: {
            total: mySamples,
            active: myActiveSamples,
          },
          notifications: {
            unread: unreadNotifications,
          },
          messages: {
            unread: unreadMessages,
          },
          tasks: {
            pendingApprovals,
          },
        };

        logInfo("User dashboard stats retrieved", {
          metadata: timer.end(),
          userId,
        });

        return stats;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

// ========================================
// TREND QUERIES
// ========================================

/**
 * QUERY: orderTrends
 *
 * Açıklama: Sipariş trendi (zaman serisi)
 * Güvenlik: Doğrulanmış kullanıcı (firma üyesi)
 * Döner: JSON (time series data)
 */
builder.queryField("orderTrends", (t) =>
  t.field({
    type: "JSON",
    args: {
      input: t.arg({ type: TrendPeriodInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, ctx) => {
      const timer = createTimer("orderTrends");
      try {
        requireAuth(ctx.user?.id);

        const companyId = sanitizeInt(ctx.user?.companyId);
        if (!companyId) {
          throw new Error("Kullanıcı bir firmaya bağlı değil");
        }

        const company = await ctx.prisma.company.findUnique({
          where: { id: companyId },
          select: { type: true },
        });

        if (!company) {
          throw new Error("Firma bulunamadı");
        }

        const isManufacturer = company.type === "MANUFACTURER";
        const startDate = new Date(args.input.startDate);
        const endDate = new Date(args.input.endDate);

        // Get orders in date range
        const orders = await ctx.prisma.order.findMany({
          where: {
            ...(isManufacturer
              ? { manufactureId: companyId }
              : { customerId: companyId }),
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            id: true,
            createdAt: true,
            totalPrice: true,
            status: true,
          },
          orderBy: { createdAt: "asc" },
        });

        // Group by period
        const periodMap = new Map<string, any>();

        orders.forEach((order) => {
          let periodKey: string;
          const date = new Date(order.createdAt);

          if (args.input.period === "DAILY") {
            periodKey = date.toISOString().split("T")[0]!;
          } else if (args.input.period === "WEEKLY") {
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            periodKey = weekStart.toISOString().split("T")[0]!;
          } else if (args.input.period === "MONTHLY") {
            periodKey = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;
          } else {
            // YEARLY
            periodKey = String(date.getFullYear());
          }

          if (!periodMap.has(periodKey)) {
            periodMap.set(periodKey, {
              period: periodKey,
              count: 0,
              revenue: 0,
              orders: [],
            });
          }

          const periodData = periodMap.get(periodKey);
          periodData.count++;
          periodData.revenue += order.totalPrice;
          periodData.orders.push(order.id);
        });

        // Convert to array and sort
        const trends = Array.from(periodMap.values()).sort((a, b) =>
          a.period.localeCompare(b.period)
        );

        logInfo("Order trends retrieved", {
          metadata: timer.end(),
          companyId,
          userId: ctx.user!.id,
          period: args.input.period,
          dataPoints: trends.length,
        });

        return {
          period: args.input.period,
          startDate: args.input.startDate,
          endDate: args.input.endDate,
          data: trends,
          summary: {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, o) => sum + o.totalPrice, 0),
            averageOrderValue:
              orders.length > 0
                ? orders.reduce((sum, o) => sum + o.totalPrice, 0) /
                  orders.length
                : 0,
          },
        };
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

/**
 * QUERY: productionMetrics
 *
 * Açıklama: Üretim metrikleri (verimlilik, gecikmeler, on-time %)
 * Güvenlik: Doğrulanmış kullanıcı (manufacturer only)
 * Döner: JSON
 */
builder.queryField("productionMetrics", (t) =>
  t.field({
    type: "JSON",
    args: {
      dateRange: t.arg({ type: DateRangeInput }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, ctx) => {
      const timer = createTimer("productionMetrics");
      try {
        requireAuth(ctx.user?.id);

        const companyId = sanitizeInt(ctx.user?.companyId);
        if (!companyId) {
          throw new Error("Kullanıcı bir firmaya bağlı değil");
        }

        const company = await ctx.prisma.company.findUnique({
          where: { id: companyId },
          select: { type: true },
        });

        if (!company || company.type !== "MANUFACTURER") {
          throw new Error(
            "Sadece üretici firmalar üretim metriklerini görebilir"
          );
        }

        const whereClause: any = {
          order: { manufactureId: companyId },
        };

        if (args.dateRange) {
          whereClause.createdAt = {
            gte: new Date(args.dateRange.startDate),
            lte: new Date(args.dateRange.endDate),
          };
        }

        const [totalProductions, completedProductions, productions] =
          await Promise.all([
            ctx.prisma.productionTracking.count({ where: whereClause }),
            ctx.prisma.productionTracking.count({
              where: { ...whereClause, overallStatus: "COMPLETED" },
            }),
            ctx.prisma.productionTracking.findMany({
              where: whereClause,
              select: {
                id: true,
                overallStatus: true,
                currentStage: true,
                estimatedStartDate: true,
                estimatedEndDate: true,
                actualStartDate: true,
                actualEndDate: true,
              },
            }),
          ]);

        const delayedProductions = productions.filter(
          (p) =>
            p.actualEndDate &&
            p.estimatedEndDate &&
            p.actualEndDate > p.estimatedEndDate
        ).length;

        // Calculate metrics
        const onTimeProductions = productions.filter(
          (p) =>
            p.overallStatus === "COMPLETED" &&
            p.actualEndDate &&
            p.estimatedEndDate &&
            p.actualEndDate <= p.estimatedEndDate
        ).length;

        const onTimePercentage =
          completedProductions > 0
            ? Math.round((onTimeProductions / completedProductions) * 100)
            : 0;

        const averageCompletionTime =
          completedProductions > 0
            ? productions
                .filter(
                  (p) =>
                    p.overallStatus === "COMPLETED" &&
                    p.actualEndDate &&
                    p.actualStartDate
                )
                .reduce((sum, p) => {
                  const start = new Date(p.actualStartDate!);
                  const end = new Date(p.actualEndDate!);
                  return sum + (end.getTime() - start.getTime());
                }, 0) /
              completedProductions /
              (1000 * 60 * 60 * 24) // Convert to days
            : 0;

        // Stage distribution
        const stageDistribution = productions.reduce((acc, p) => {
          const stage = p.currentStage || "PLANNING";
          acc[stage] = (acc[stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const metrics = {
          total: totalProductions,
          completed: completedProductions,
          delayed: delayedProductions,
          inProgress: totalProductions - completedProductions,
          onTimePercentage,
          onTimeCount: onTimeProductions,
          averageCompletionDays: Math.round(averageCompletionTime * 10) / 10,
          stageDistribution,
        };

        logInfo("Production metrics retrieved", {
          metadata: timer.end(),
          companyId,
          userId: ctx.user!.id,
          totalProductions,
        });

        return metrics;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

/**
 * QUERY: revenueReport
 *
 * Açıklama: Gelir raporu (aylık/yıllık breakdown)
 * Güvenlik: Doğrulanmış kullanıcı (manufacturer only)
 * Döner: JSON
 */
builder.queryField("revenueReport", (t) =>
  t.field({
    type: "JSON",
    args: {
      dateRange: t.arg({ type: DateRangeInput, required: true }),
      groupBy: t.arg.string({ required: true }), // MONTH or YEAR
    },
    authScopes: { user: true },
    resolve: async (_root, args, ctx) => {
      const timer = createTimer("revenueReport");
      try {
        requireAuth(ctx.user?.id);

        const companyId = sanitizeInt(ctx.user?.companyId);
        if (!companyId) {
          throw new Error("Kullanıcı bir firmaya bağlı değil");
        }

        const company = await ctx.prisma.company.findUnique({
          where: { id: companyId },
          select: { type: true },
        });

        if (!company || company.type !== "MANUFACTURER") {
          throw new Error("Sadece üretici firmalar gelir raporunu görebilir");
        }

        const startDate = new Date(args.dateRange.startDate);
        const endDate = new Date(args.dateRange.endDate);

        // Get confirmed payments in range
        const payments = await ctx.prisma.payment.findMany({
          where: {
            order: { manufactureId: companyId },
            status: "CONFIRMED",
            confirmedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            id: true,
            amount: true,
            currency: true,
            type: true,
            confirmedAt: true,
            order: {
              select: {
                id: true,
                orderNumber: true,
              },
            },
          },
          orderBy: { confirmedAt: "asc" },
        });

        // Group by period
        const periodMap = new Map<string, any>();

        payments.forEach((payment) => {
          if (!payment.confirmedAt) return;

          const date = new Date(payment.confirmedAt);
          let periodKey: string;

          if (args.groupBy === "MONTH") {
            periodKey = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;
          } else {
            // YEAR
            periodKey = String(date.getFullYear());
          }

          if (!periodMap.has(periodKey)) {
            periodMap.set(periodKey, {
              period: periodKey,
              totalRevenue: 0,
              paymentCount: 0,
              byType: {
                DEPOSIT: 0,
                PROGRESS: 0,
                BALANCE: 0,
                FULL: 0,
              },
              payments: [],
            });
          }

          const periodData = periodMap.get(periodKey);
          periodData.totalRevenue += payment.amount;
          periodData.paymentCount++;
          periodData.byType[payment.type] += payment.amount;
          periodData.payments.push({
            id: payment.id,
            amount: payment.amount,
            orderId: payment.order.id,
            orderNumber: payment.order.orderNumber,
          });
        });

        // Convert to array and sort
        const report = Array.from(periodMap.values()).sort((a, b) =>
          a.period.localeCompare(b.period)
        );

        const summary = {
          totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
          totalPayments: payments.length,
          averagePayment:
            payments.length > 0
              ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length
              : 0,
          currency: payments[0]?.currency || "USD",
        };

        logInfo("Revenue report retrieved", {
          metadata: timer.end(),
          companyId,
          userId: ctx.user!.id,
          groupBy: args.groupBy,
          periodsCount: report.length,
        });

        return {
          groupBy: args.groupBy,
          startDate: args.dateRange.startDate,
          endDate: args.dateRange.endDate,
          data: report,
          summary,
        };
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

// ========================================
// PERFORMANCE QUERIES
// ========================================

/**
 * QUERY: supplierPerformance
 *
 * Açıklama: Tedarikçi performans analizi (kalite, teslimat süreleri)
 * Güvenlik: Doğrulanmış kullanıcı (customer only)
 * Döner: JSON
 */
builder.queryField("supplierPerformance", (t) =>
  t.field({
    type: "JSON",
    args: {
      supplierId: t.arg.int(),
      dateRange: t.arg({ type: DateRangeInput }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, ctx) => {
      const timer = createTimer("supplierPerformance");
      try {
        requireAuth(ctx.user?.id);

        const companyId = sanitizeInt(ctx.user?.companyId);
        if (!companyId) {
          throw new Error("Kullanıcı bir firmaya bağlı değil");
        }

        const company = await ctx.prisma.company.findUnique({
          where: { id: companyId },
          select: { type: true },
        });

        if (!company || company.type !== "BUYER") {
          throw new Error(
            "Sadece müşteri firmalar tedarikçi performansını görebilir"
          );
        }

        const whereClause: any = {
          customerId: companyId,
          ...(args.supplierId && { manufactureId: args.supplierId }),
        };

        if (args.dateRange) {
          whereClause.createdAt = {
            gte: new Date(args.dateRange.startDate),
            lte: new Date(args.dateRange.endDate),
          };
        }

        // Get orders from suppliers with production tracking
        const orders = await ctx.prisma.order.findMany({
          where: whereClause,
          select: {
            id: true,
            manufactureId: true,
            status: true,
            createdAt: true,
            deadline: true,
            shippingDate: true,
            productionTracking: {
              select: {
                overallStatus: true,
                actualEndDate: true,
                estimatedEndDate: true,
              },
            },
          },
        });

        // Get manufacturer details
        const manufacturerIds = Array.from(
          new Set(orders.map((o) => o.manufactureId))
        );
        const manufacturers = await ctx.prisma.user.findMany({
          where: { id: { in: manufacturerIds } },
          select: { id: true, name: true },
        });

        const manufacturerMap = new Map(
          manufacturers.map((m) => [m.id, m.name])
        );

        // Group by manufacturer
        const supplierMap = new Map<number, any>();

        orders.forEach((order) => {
          const supplierId = order.manufactureId;
          if (!supplierMap.has(supplierId)) {
            supplierMap.set(supplierId, {
              supplierId,
              supplierName:
                manufacturerMap.get(supplierId) || `Manufacturer ${supplierId}`,
              totalOrders: 0,
              completedOrders: 0,
              delayedOrders: 0,
              onTimeOrders: 0,
              orders: [],
            });
          }

          const supplierData = supplierMap.get(supplierId);
          supplierData.totalOrders++;

          if (order.status === "DELIVERED") {
            supplierData.completedOrders++;

            // Check if on time (based on productionTracking)
            const tracking = order.productionTracking;
            if (
              tracking &&
              tracking.actualEndDate &&
              tracking.estimatedEndDate &&
              tracking.actualEndDate <= tracking.estimatedEndDate
            ) {
              supplierData.onTimeOrders++;
            }
          }

          // Check if delayed
          const tracking = order.productionTracking;
          if (
            tracking &&
            tracking.actualEndDate &&
            tracking.estimatedEndDate &&
            tracking.actualEndDate > tracking.estimatedEndDate
          ) {
            supplierData.delayedOrders++;
          }

          supplierData.orders.push({
            orderId: order.id,
            status: order.status,
          });
        });

        // Calculate percentages
        const performanceData = Array.from(supplierMap.values()).map(
          (supplier) => ({
            ...supplier,
            onTimePercentage:
              supplier.completedOrders > 0
                ? Math.round(
                    (supplier.onTimeOrders / supplier.completedOrders) * 100
                  )
                : 0,
            completionRate:
              supplier.totalOrders > 0
                ? Math.round(
                    (supplier.completedOrders / supplier.totalOrders) * 100
                  )
                : 0,
            delayRate:
              supplier.totalOrders > 0
                ? Math.round(
                    (supplier.delayedOrders / supplier.totalOrders) * 100
                  )
                : 0,
          })
        );

        logInfo("Supplier performance retrieved", {
          metadata: timer.end(),
          companyId,
          userId: ctx.user!.id,
          suppliersCount: performanceData.length,
        });

        return {
          suppliers: performanceData,
          summary: {
            totalOrders: orders.length,
            suppliersCount: performanceData.length,
          },
        };
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);
