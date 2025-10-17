import { extendType, objectType, stringArg } from "nexus";

// Dashboard Stats Type
export const DashboardStats = objectType({
  name: "DashboardStats",
  definition(t) {
    // Overview
    t.nonNull.int("totalCollections");
    t.nonNull.int("totalSamples");
    t.nonNull.int("totalOrders");
    t.nonNull.int("totalProductions");

    // Status breakdowns
    t.nonNull.int("pendingSamples");
    t.nonNull.int("activeSamples");
    t.nonNull.int("completedSamples");

    t.nonNull.int("pendingOrders");
    t.nonNull.int("activeOrders");
    t.nonNull.int("completedOrders");

    t.nonNull.int("activeProductions");
    t.nonNull.int("completedProductions");

    // Quality
    t.nonNull.int("passedQC");
    t.nonNull.int("failedQC");
    t.nonNull.float("qcPassRate");

    // Messages
    t.nonNull.int("unreadMessages");
    t.nonNull.int("totalMessages");

    // Recent activity
    t.list.field("recentSamples", {
      type: "Sample",
    });
    t.list.field("recentOrders", {
      type: "Order",
    });
    t.list.field("recentProductions", {
      type: "ProductionTracking",
    });

    // Monthly trends
    t.list.field("monthlyStats", {
      type: "MonthlyStats",
    });
  },
});

// Monthly Stats Type
export const MonthlyStats = objectType({
  name: "MonthlyStats",
  definition(t) {
    t.nonNull.string("month"); // "2025-01"
    t.nonNull.int("samples");
    t.nonNull.int("orders");
    t.nonNull.int("completedProductions");
    t.nonNull.float("revenue"); // Tahmini gelir
  },
});

// Analytics Query
export const AnalyticsQuery = extendType({
  type: "Query",
  definition(t) {
    // Dashboard Statistics
    t.field("dashboardStats", {
      type: "DashboardStats",
      args: {
        period: stringArg(), // "week", "month", "year", "all"
      },
      resolve: async (_, { period = "month" }, ctx) => {
        const userId = ctx.userId;

        if (!userId) {
          throw new Error("Giriş yapmalısınız");
        }

        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
          include: { company: true },
        });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        // Date range calculation
        const now = new Date();
        let startDate = new Date();

        switch (period) {
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          case "all":
            startDate = new Date(0); // Beginning of time
            break;
        }

        // Filter by company if not admin
        const companyFilter =
          user.role !== "ADMIN" && user.companyId
            ? { companyId: user.companyId }
            : {};

        // Get all counts in parallel
        const [
          totalCollections,
          totalSamples,
          totalOrders,
          totalProductions,
          pendingSamples,
          activeSamples,
          completedSamples,
          pendingOrders,
          activeOrders,
          completedOrders,
          activeProductions,
          completedProductions,
          passedQC,
          failedQC,
          unreadMessages,
          totalMessages,
          recentSamples,
          recentOrders,
          recentProductions,
        ] = await Promise.all([
          // Collections
          ctx.prisma.collection.count({
            where: {
              ...companyFilter,
              createdAt: { gte: startDate },
            },
          }),

          // Samples
          ctx.prisma.sample.count({
            where: {
              ...companyFilter,
              createdAt: { gte: startDate },
            },
          }),

          // Orders
          ctx.prisma.order.count({
            where: {
              ...companyFilter,
              createdAt: { gte: startDate },
            },
          }),

          // Productions
          ctx.prisma.productionTracking.count({
            where: {
              ...companyFilter,
              createdAt: { gte: startDate },
            },
          }),

          // Sample statuses
          ctx.prisma.sample.count({
            where: {
              ...companyFilter,
              status: "REQUESTED",
              createdAt: { gte: startDate },
            },
          }),
          ctx.prisma.sample.count({
            where: {
              ...companyFilter,
              status: { in: ["IN_PRODUCTION", "QUALITY_CHECK"] },
              createdAt: { gte: startDate },
            },
          }),
          ctx.prisma.sample.count({
            where: {
              ...companyFilter,
              status: { in: ["COMPLETED", "SHIPPED"] },
              createdAt: { gte: startDate },
            },
          }),

          // Order statuses
          ctx.prisma.order.count({
            where: {
              ...companyFilter,
              status: { in: ["PENDING", "REVIEWED"] },
              createdAt: { gte: startDate },
            },
          }),
          ctx.prisma.order.count({
            where: {
              ...companyFilter,
              status: { in: ["CONFIRMED", "IN_PRODUCTION", "QUALITY_CHECK"] },
              createdAt: { gte: startDate },
            },
          }),
          ctx.prisma.order.count({
            where: {
              ...companyFilter,
              status: { in: ["SHIPPED", "DELIVERED"] },
              createdAt: { gte: startDate },
            },
          }),

          // Production statuses
          ctx.prisma.productionTracking.count({
            where: {
              ...companyFilter,
              overallStatus: "IN_PROGRESS",
              createdAt: { gte: startDate },
            },
          }),
          ctx.prisma.productionTracking.count({
            where: {
              ...companyFilter,
              overallStatus: "COMPLETED",
              createdAt: { gte: startDate },
            },
          }),

          // Quality Control
          ctx.prisma.qualityControl.count({
            where: {
              result: "PASSED",
              createdAt: { gte: startDate },
            },
          }),
          ctx.prisma.qualityControl.count({
            where: {
              result: "FAILED",
              createdAt: { gte: startDate },
            },
          }),

          // Messages
          ctx.prisma.message.count({
            where: {
              receiver: user.email,
              isRead: false,
            },
          }),
          ctx.prisma.message.count({
            where: {
              OR: [
                { senderId: userId },
                { receiver: user.email },
              ],
            },
          }),

          // Recent items
          ctx.prisma.sample.findMany({
            where: companyFilter,
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              customer: true,
              manufacture: true,
              collection: true,
            },
          }),
          ctx.prisma.order.findMany({
            where: companyFilter,
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              customer: true,
              manufacture: true,
              collection: true,
            },
          }),
          ctx.prisma.productionTracking.findMany({
            where: companyFilter,
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              order: true,
              sample: true,
            },
          }),
        ]);

        // Calculate monthly stats for last 6 months
        const monthlyStats = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date();
          monthDate.setMonth(now.getMonth() - i);
          monthDate.setDate(1);
          monthDate.setHours(0, 0, 0, 0);

          const nextMonth = new Date(monthDate);
          nextMonth.setMonth(monthDate.getMonth() + 1);

          const [samples, orders, productions, ordersForRevenue] = await Promise.all([
            ctx.prisma.sample.count({
              where: {
                ...companyFilter,
                createdAt: {
                  gte: monthDate,
                  lt: nextMonth,
                },
              },
            }),
            ctx.prisma.order.count({
              where: {
                ...companyFilter,
                createdAt: {
                  gte: monthDate,
                  lt: nextMonth,
                },
              },
            }),
            ctx.prisma.productionTracking.count({
              where: {
                ...companyFilter,
                overallStatus: "COMPLETED",
                actualEndDate: {
                  gte: monthDate,
                  lt: nextMonth,
                },
              },
            }),
            ctx.prisma.order.findMany({
              where: {
                ...companyFilter,
                status: { in: ["SHIPPED", "DELIVERED"] },
                createdAt: {
                  gte: monthDate,
                  lt: nextMonth,
                },
              },
              select: {
                totalPrice: true,
              },
            }),
          ]);

          const revenue = ordersForRevenue.reduce(
            (sum: number, order: any) => sum + order.totalPrice,
            0
          );

          monthlyStats.push({
            month: monthDate.toISOString().slice(0, 7), // "2025-01"
            samples,
            orders,
            completedProductions: productions,
            revenue,
          });
        }

        // Calculate QC pass rate
        const totalQC = passedQC + failedQC;
        const qcPassRate = totalQC > 0 ? (passedQC / totalQC) * 100 : 0;

        return {
          totalCollections,
          totalSamples,
          totalOrders,
          totalProductions,
          pendingSamples,
          activeSamples,
          completedSamples,
          pendingOrders,
          activeOrders,
          completedOrders,
          activeProductions,
          completedProductions,
          passedQC,
          failedQC,
          qcPassRate: Math.round(qcPassRate * 100) / 100,
          unreadMessages,
          totalMessages,
          recentSamples,
          recentOrders,
          recentProductions,
          monthlyStats,
        };
      },
    });

    // Production Analytics
    t.field("productionAnalytics", {
      type: "ProductionAnalytics",
      resolve: async (_, __, ctx) => {
        const userId = ctx.userId;

        if (!userId) {
          throw new Error("Giriş yapmalısınız");
        }

        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        const companyFilter =
          user.role !== "ADMIN" && user.companyId
            ? { companyId: user.companyId }
            : {};

        // Stage-wise breakdown
        const stages = [
          "PLANNING",
          "FABRIC",
          "CUTTING",
          "SEWING",
          "QUALITY",
          "PACKAGING",
          "SHIPPING",
        ];

        const stageBreakdown = await Promise.all(
          stages.map(async (stage) => {
            const count = await ctx.prisma.productionTracking.count({
              where: {
                ...companyFilter,
                currentStage: stage as any,
                overallStatus: "IN_PROGRESS",
              },
            });
            return { stage, count };
          })
        );

        // Average production time
        const completedProductions = await ctx.prisma.productionTracking.findMany({
          where: {
            ...companyFilter,
            overallStatus: "COMPLETED",
            actualStartDate: { not: null },
            actualEndDate: { not: null },
          },
          select: {
            actualStartDate: true,
            actualEndDate: true,
          },
        });

        let avgProductionDays = 0;
        if (completedProductions.length > 0) {
          const totalDays = completedProductions.reduce((sum: number, prod: any) => {
            const start = new Date(prod.actualStartDate!);
            const end = new Date(prod.actualEndDate!);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0);
          avgProductionDays = Math.round(totalDays / completedProductions.length);
        }

        return {
          stageBreakdown,
          avgProductionDays,
          totalInProgress: stageBreakdown.reduce((sum, s) => sum + s.count, 0),
          totalCompleted: completedProductions.length,
        };
      },
    });
  },
});

// Production Analytics Type
export const ProductionAnalytics = objectType({
  name: "ProductionAnalytics",
  definition(t) {
    t.nonNull.list.field("stageBreakdown", {
      type: "StageBreakdown",
    });
    t.nonNull.int("avgProductionDays");
    t.nonNull.int("totalInProgress");
    t.nonNull.int("totalCompleted");
  },
});

export const StageBreakdown = objectType({
  name: "StageBreakdown",
  definition(t) {
    t.nonNull.string("stage");
    t.nonNull.int("count");
  },
});

// Public Platform Stats Type (for landing page)
export const PublicPlatformStats = objectType({
  name: "PublicPlatformStats",
  definition(t) {
    // Ecosystem Overview
    t.nonNull.int("totalProducts");
    t.nonNull.int("activeManufacturers");
    t.nonNull.int("activeWorkshops");
    t.nonNull.int("totalCollections");
    t.nonNull.int("totalOrders");

    // Collection Breakdown by Gender
    t.nonNull.field("collectionsByGender", {
      type: "CollectionGenderBreakdown",
    });

    // Collection Breakdown by Category
    t.list.field("collectionsByCategory", {
      type: "CategoryBreakdown",
    });

    // Sustainability Metrics
    t.nonNull.field("sustainability", {
      type: "SustainabilityMetrics",
    });

    // Supplier Network by Country
    t.list.field("suppliersByCountry", {
      type: "CountrySuppliers",
    });

    // Platform Features
    t.list.field("platformFeatures", {
      type: "PlatformFeature",
    });

    // Recent Activity
    t.nonNull.field("recentActivity", {
      type: "RecentActivity",
    });

    // Customer Testimonials
    t.list.field("testimonials", {
      type: "Testimonial",
    });

    // Growth Metrics
    t.nonNull.field("growthMetrics", {
      type: "GrowthMetrics",
    });
  },
});

export const CollectionGenderBreakdown = objectType({
  name: "CollectionGenderBreakdown",
  definition(t) {
    t.nonNull.int("men");
    t.nonNull.int("women");
    t.nonNull.int("unisex");
  },
});

export const CategoryBreakdown = objectType({
  name: "CategoryBreakdown",
  definition(t) {
    t.nonNull.string("category"); // "Dış Giyim", "Üst Giyim", "Alt Giyim", "İç Giyim"
    t.nonNull.int("count");
    t.nonNull.int("men");
    t.nonNull.int("women");
    t.nonNull.int("unisex");
  },
});

export const SustainabilityMetrics = objectType({
  name: "SustainabilityMetrics",
  definition(t) {
    t.nonNull.float("carbonFootprintReduction"); // Percentage
    t.nonNull.float("recycledMaterialUsage"); // Percentage
    t.nonNull.int("certifiedOrganicProducts");
    t.nonNull.int("gotsChronumCertified");
    t.nonNull.int("waterSavedLiters");
  },
});

export const CountrySuppliers = objectType({
  name: "CountrySuppliers",
  definition(t) {
    t.nonNull.string("country");
    t.nonNull.int("count");
    t.list.field("companies", {
      type: "SupplierInfo",
    });
  },
});

export const SupplierInfo = objectType({
  name: "SupplierInfo",
  definition(t) {
    t.nonNull.string("name");
    t.string("city");
  },
});

export const PlatformFeature = objectType({
  name: "PlatformFeature",
  definition(t) {
    t.nonNull.string("title");
    t.nonNull.string("description");
    t.nonNull.string("icon"); // lucide icon name
  },
});

export const RecentActivity = objectType({
  name: "RecentActivity",
  definition(t) {
    t.nonNull.int("newCollectionsThisWeek");
    t.nonNull.int("completedOrdersThisMonth");
    t.nonNull.int("newManufacturersThisMonth");
    t.nonNull.int("activeProductionsNow");
    t.list.field("latestCollections", {
      type: "LatestCollection",
    });
  },
});

export const LatestCollection = objectType({
  name: "LatestCollection",
  definition(t) {
    t.nonNull.string("name");
    t.nonNull.string("gender");
    t.nonNull.string("createdAt");
  },
});

export const Testimonial = objectType({
  name: "Testimonial",
  definition(t) {
    t.nonNull.string("name");
    t.nonNull.string("role");
    t.nonNull.int("rating");
    t.nonNull.string("comment");
  },
});

export const GrowthMetrics = objectType({
  name: "GrowthMetrics",
  definition(t) {
    t.nonNull.float("monthlyGrowthRate"); // Percentage
    t.nonNull.int("totalTransactionVolume"); // Number of completed orders
    t.nonNull.float("avgDeliveryDays");
    t.nonNull.float("customerSatisfactionRate"); // Percentage from reviews
  },
});

// Add Public Platform Stats Query
export const PublicAnalyticsQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("publicPlatformStats", {
      type: "PublicPlatformStats",
      resolve: async (_, __, ctx) => {
        // No auth required for public stats

        // Count total products (collections)
        const totalProducts = await ctx.prisma.collection.count({
          where: { isActive: true },
        });

        // Count active manufacturers
        const activeManufacturers = await ctx.prisma.company.count({
          where: {
            type: "MANUFACTURER",
            isActive: true,
          },
        });

        // Count active workshops
        const activeWorkshops = await ctx.prisma.workshop.count({
          where: { isActive: true },
        });

        // Count total collections
        const totalCollections = await ctx.prisma.collection.count();

        // Count total orders
        const totalOrders = await ctx.prisma.order.count();

        // Collections by gender
        const menCollections = await ctx.prisma.collection.count({
          where: { gender: "MEN", isActive: true },
        });
        const womenCollections = await ctx.prisma.collection.count({
          where: { gender: "WOMEN", isActive: true },
        });
        const unisexCollections = await ctx.prisma.collection.count({
          where: { gender: "UNISEX", isActive: true },
        });

        // Collections by category (simulate category breakdown)
        const allCollections = await ctx.prisma.collection.findMany({
          where: { isActive: true },
          select: {
            name: true,
            gender: true,
          },
        });

        const categoryMap: Record<string, { men: number; women: number; unisex: number }> = {
          "Dış Giyim": { men: 0, women: 0, unisex: 0 },
          "Üst Giyim": { men: 0, women: 0, unisex: 0 },
          "Alt Giyim": { men: 0, women: 0, unisex: 0 },
          "İç Giyim": { men: 0, women: 0, unisex: 0 },
          "Spor Giyim": { men: 0, women: 0, unisex: 0 },
        };

        allCollections.forEach((col: any) => {
          const name = col.name.toLowerCase();
          let category = "Üst Giyim"; // default

          if (name.includes("dış giyim") || name.includes("jacket") || name.includes("eco-friendly dış")) {
            category = "Dış Giyim";
          } else if (name.includes("pantolon") || name.includes("jean") || name.includes("alt giyim")) {
            category = "Alt Giyim";
          } else if (name.includes("iç giyim") || name.includes("underwear")) {
            category = "İç Giyim";
          } else if (name.includes("spor") || name.includes("sport")) {
            category = "Spor Giyim";
          }

          const gender = col.gender?.toLowerCase() || "unisex";
          if (categoryMap[category]) {
            if (gender === "men") categoryMap[category]!.men++;
            else if (gender === "women") categoryMap[category]!.women++;
            else categoryMap[category]!.unisex++;
          }
        });

        const collectionsByCategory = Object.entries(categoryMap).map(([category, counts]) => ({
          category,
          count: counts.men + counts.women + counts.unisex,
          ...counts,
        })).filter(c => c.count > 0);

        // Sustainability metrics (calculated from eco-friendly products)
        const ecoCollections = await ctx.prisma.collection.count({
          where: {
            OR: [
              { fabricComposition: { contains: "Geri Dönüştürülmüş" } },
              { fabricComposition: { contains: "Organik" } },
              { fabricComposition: { contains: "Recycled" } },
              { fabricComposition: { contains: "Organic" } },
            ],
          },
        });

        const certifiedProducts = await ctx.prisma.collection.count({
          where: {
            notes: {
              contains: "sertifika",
            },
          },
        });

        const sustainability = {
          carbonFootprintReduction: totalProducts > 0 ? Math.round((ecoCollections / totalProducts) * 35) : 0, // 35% max
          recycledMaterialUsage: totalProducts > 0 ? Math.round((ecoCollections / totalProducts) * 100) : 0,
          certifiedOrganicProducts: ecoCollections,
          gotsChronumCertified: certifiedProducts,
          waterSavedLiters: totalProducts * 2500, // Estimate: 2500L per product
        };

        // Suppliers by country
        const companies = await ctx.prisma.company.findMany({
          where: {
            type: "MANUFACTURER",
            isActive: true,
          },
          select: {
            name: true,
            address: true,
          },
        });

        const countryMap: Record<string, { count: number; companies: { name: string; city: string | null }[] }> = {};

        companies.forEach((company: any) => {
          // Extract country from address
          const addressParts = company.address?.split(",") || [];
          const country = addressParts[addressParts.length - 1]?.trim() || "Unknown";
          const city = addressParts[0]?.trim() || null;

          if (!countryMap[country]) {
            countryMap[country] = { count: 0, companies: [] };
          }
          countryMap[country]!.count++;
          countryMap[country]!.companies.push({ name: company.name, city });
        });

        const suppliersByCountry = Object.entries(countryMap).map(([country, data]) => ({
          country,
          count: data.count,
          companies: data.companies,
        }));

        // Platform Features (static data)
        const platformFeatures = [
          {
            title: "AI Destekli Tasarım Analizi",
            description: "Görsellerden otomatik teknik özellik çıkarımı ve 5 farklı analiz türü",
            icon: "Sparkles",
          },
          {
            title: "Gerçek Zamanlı Takip",
            description: "Numune ve sipariş süreçlerinizi 7 aşamalı timeline ile anlık izleyin",
            icon: "TrendingUp",
          },
          {
            title: "Kalite Kontrol Sistemi",
            description: "Detaylı QA raporları, fotoğraflı denetim ve otomatik onay süreçleri",
            icon: "Award",
          },
          {
            title: "Akıllı Mesajlaşma",
            description: "Firmalar arası güvenli iletişim, dosya paylaşımı ve bildirim sistemi",
            icon: "MessageSquare",
          },
          {
            title: "Üretim Yönetimi",
            description: "Atölye ataması, aşama güncellemeleri ve performans analizi",
            icon: "Factory",
          },
          {
            title: "Sürdürülebilirlik Takibi",
            description: "Karbon ayak izi, geri dönüştürülmüş malzeme kullanımı ve sertifika yönetimi",
            icon: "Leaf",
          },
        ];

        // Recent Activity
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const newCollectionsThisWeek = await ctx.prisma.collection.count({
          where: {
            createdAt: { gte: oneWeekAgo },
          },
        });

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const completedOrdersThisMonth = await ctx.prisma.order.count({
          where: {
            status: { in: ["PRODUCTION_COMPLETE", "SHIPPED", "DELIVERED"] },
            updatedAt: { gte: oneMonthAgo },
          },
        });

        const newManufacturersThisMonth = await ctx.prisma.company.count({
          where: {
            type: "MANUFACTURER",
            createdAt: { gte: oneMonthAgo },
          },
        });

        const activeProductionsNow = await ctx.prisma.productionTracking.count({
          where: {
            overallStatus: "IN_PROGRESS",
          },
        });

        const latestCollectionsData = await ctx.prisma.collection.findMany({
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            name: true,
            gender: true,
            createdAt: true,
          },
        });

        const latestCollections = latestCollectionsData.map((col: any) => ({
          name: col.name,
          gender: col.gender,
          createdAt: col.createdAt.toISOString(),
        }));

        const recentActivity = {
          newCollectionsThisWeek,
          completedOrdersThisMonth,
          newManufacturersThisMonth,
          activeProductionsNow,
          latestCollections,
        };

        // Customer Testimonials
        const reviewsData = await ctx.prisma.review.findMany({
          where: {
            isApproved: true,
            rating: { gte: 4 },
          },
          take: 6,
          orderBy: { createdAt: "desc" },
          include: {
            customer: {
              select: {
                name: true,
                firstName: true,
                lastName: true,
                company: {
                  select: { name: true },
                },
              },
            },
          },
        });

        const testimonials = reviewsData.map((review: any) => ({
          name: review.customer.firstName && review.customer.lastName
            ? `${review.customer.firstName} ${review.customer.lastName}`
            : review.customer.name,
          role: review.customer.company?.name || "Müşteri",
          rating: review.rating,
          comment: review.comment,
        }));

        // Growth Metrics
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

        const lastMonthOrders = await ctx.prisma.order.count({
          where: {
            createdAt: {
              gte: twoMonthsAgo,
              lt: oneMonthAgo,
            },
          },
        });

        const thisMonthOrders = await ctx.prisma.order.count({
          where: {
            createdAt: { gte: oneMonthAgo },
          },
        });

        const monthlyGrowthRate = lastMonthOrders > 0
          ? Math.round(((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100)
          : 100;

        const completedOrders = await ctx.prisma.order.count({
          where: { status: { in: ["PRODUCTION_COMPLETE", "SHIPPED", "DELIVERED"] } },
        });

        // Calculate average delivery days from production tracking
        const completedProductions = await ctx.prisma.productionTracking.findMany({
          where: {
            overallStatus: "COMPLETED",
            orderId: { not: null }, // Only count order productions
          },
          select: {
            createdAt: true,
            updatedAt: true,
          },
        });

        let totalDays = 0;
        completedProductions.forEach((prod: any) => {
          const days = Math.ceil((prod.updatedAt - prod.createdAt) / (1000 * 60 * 60 * 24));
          totalDays += days;
        });

        const avgDeliveryDays = completedProductions.length > 0
          ? Math.round((totalDays / completedProductions.length) * 10) / 10
          : 30;

        // Customer satisfaction from reviews
        const allReviews = await ctx.prisma.review.findMany({
          where: { isApproved: true },
          select: { rating: true },
        });

        const avgRating = allReviews.length > 0
          ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length
          : 4.5;

        const customerSatisfactionRate = Math.round((avgRating / 5) * 100);

        const growthMetrics = {
          monthlyGrowthRate,
          totalTransactionVolume: completedOrders,
          avgDeliveryDays,
          customerSatisfactionRate,
        };

        return {
          totalProducts,
          activeManufacturers,
          activeWorkshops,
          totalCollections,
          totalOrders,
          collectionsByGender: {
            men: menCollections,
            women: womenCollections,
            unisex: unisexCollections,
          },
          collectionsByCategory,
          sustainability,
          suppliersByCountry,
          platformFeatures,
          recentActivity,
          testimonials,
          growthMetrics,
        };
      },
    });
  },
});
