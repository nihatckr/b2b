import { arg, extendType, intArg, stringArg } from "nexus";
import type { Context } from "../../context";
import { requireAuth, requireRole } from "../../utils/userUtils";

export const AnalyticsQueries = extendType({
  type: "Query",
  definition(t) {
    // SLA Dashboard - main performance overview
    t.field("slaScore", {
      type: "Float",
      args: {
        manufacturerId: intArg(),
        period: stringArg(), // "WEEK", "MONTH", "QUARTER", "YEAR"
      },
      resolve: async (_parent, args, ctx: Context) => {
        requireAuth(ctx);

        // Calculate SLA score based on multiple factors
        const slaScore = await calculateSLAScore(
          ctx,
          args.manufacturerId as any,
          args.period as any
        );
        return slaScore;
      },
    });

    // Comprehensive SLA Dashboard
    t.field("slaDashboard", {
      type: "String", // Return as JSON string for now
      args: {
        manufacturerId: intArg(),
        period: stringArg(),
      },
      resolve: async (_parent, args, ctx: Context) => {
        requireAuth(ctx);

        const dashboard = await generateSLADashboard(
          ctx,
          args.manufacturerId as any,
          args.period as any
        );
        return JSON.stringify(dashboard);
      },
    });

    // Business Analytics Overview
    t.field("businessAnalytics", {
      type: "String", // Return as JSON string for now
      args: {
        filters: arg({ type: "String" }), // JSON string of filters
      },
      resolve: async (_parent, args, ctx: Context) => {
        await requireRole(ctx, ["ADMIN", "MANUFACTURE"]);

        const filters = args.filters ? JSON.parse(args.filters) : {};
        const analytics = await generateBusinessAnalytics(ctx, filters);
        return JSON.stringify(analytics);
      },
    });

    // Revenue Analytics
    t.field("revenueAnalytics", {
      type: "String",
      args: {
        startDate: stringArg(),
        endDate: stringArg(),
        manufacturerId: intArg(),
      },
      resolve: async (_parent, args, ctx: Context) => {
        await requireRole(ctx, ["ADMIN", "MANUFACTURE"]);

        const analytics = await calculateRevenueAnalytics(ctx, args);
        return JSON.stringify(analytics);
      },
    });

    // Order Analytics & Trends
    t.field("orderAnalytics", {
      type: "String",
      args: {
        period: stringArg(),
        manufacturerId: intArg(),
      },
      resolve: async (_parent, args, ctx: Context) => {
        requireAuth(ctx);

        const analytics = await calculateOrderAnalytics(ctx, args);
        return JSON.stringify(analytics);
      },
    });

    // Performance Metrics by Category
    t.field("categoryPerformance", {
      type: "String",
      args: {
        manufacturerId: intArg(),
        period: stringArg(),
      },
      resolve: async (_parent, args, ctx: Context) => {
        requireAuth(ctx);

        const performance = await analyzeCategoryPerformance(ctx, args);
        return JSON.stringify(performance);
      },
    });

    // Customer Satisfaction Metrics
    t.field("customerSatisfactionMetrics", {
      type: "String",
      args: {
        manufacturerId: intArg(),
        period: stringArg(),
      },
      resolve: async (_parent, args, ctx: Context) => {
        requireAuth(ctx);

        const metrics = await calculateCustomerSatisfactionMetrics(ctx, args);
        return JSON.stringify(metrics);
      },
    });

    // Revision Analysis
    t.field("revisionAnalytics", {
      type: "String",
      args: {
        manufacturerId: intArg(),
        period: stringArg(),
      },
      resolve: async (_parent, args, ctx: Context) => {
        requireAuth(ctx);

        const analytics = await analyzeRevisionPatterns(ctx, args);
        return JSON.stringify(analytics);
      },
    });

    // Quality Metrics
    t.field("qualityMetrics", {
      type: "String",
      args: {
        manufacturerId: intArg(),
        period: stringArg(),
      },
      resolve: async (_parent, args, ctx: Context) => {
        requireAuth(ctx);

        const metrics = await calculateQualityMetrics(ctx, args);
        return JSON.stringify(metrics);
      },
    });
  },
});

// SLA Calculation Functions

async function calculateSLAScore(
  ctx: Context,
  manufacturerId?: number,
  period?: string
): Promise<number> {
  try {
    // Get orders in the specified period
    const whereClause: any = {};
    if (manufacturerId) {
      whereClause.manufactureId = manufacturerId;
    }

    // Add date filtering based on period
    const dateFilter = getDateFilter(period || "MONTH");
    if (dateFilter) {
      whereClause.createdAt = dateFilter;
    }

    const orders = await ctx.prisma.order.findMany({
      where: whereClause,
      include: {
        revisionRequests: true,
        stageTrackings: true,
      },
    });

    if (orders.length === 0) return 0;

    // Calculate delivery performance (40% weight)
    const onTimeOrders = orders.filter(
      (order) =>
        order.status === "DELIVERED" &&
        (!order.estimatedDelivery ||
          new Date(order.updatedAt) <= new Date(order.estimatedDelivery))
    ).length;
    const deliveryScore = (onTimeOrders / orders.length) * 100;

    // Calculate quality score (30% weight) - based on revisions
    const ordersWithoutRevisions = orders.filter(
      (order) => !order.revisionRequests || order.revisionRequests.length === 0
    ).length;
    const qualityScore = (ordersWithoutRevisions / orders.length) * 100;

    // Calculate communication score (20% weight) - response time based
    const communicationScore = 85; // Mock implementation

    // Calculate process efficiency (10% weight)
    const avgStages =
      orders.reduce(
        (sum, order) => sum + (order.stageTrackings?.length || 0),
        0
      ) / orders.length;
    const efficiencyScore = Math.max(0, 100 - (avgStages - 5) * 10);

    // Weighted SLA score
    const slaScore =
      deliveryScore * 0.4 +
      qualityScore * 0.3 +
      communicationScore * 0.2 +
      efficiencyScore * 0.1;

    return Math.round(slaScore * 100) / 100;
  } catch (error) {
    console.error("SLA calculation error:", error);
    return 0;
  }
}

async function generateSLADashboard(
  ctx: Context,
  manufacturerId?: number,
  period?: string
) {
  const slaScore = await calculateSLAScore(ctx, manufacturerId, period);

  return {
    overallScore: slaScore,
    performanceLevel: getPerformanceLevel(slaScore),
    deliveryPerformance: {
      metricName: "On-Time Delivery",
      value: 87.5,
      target: 95.0,
      unit: "percentage",
      status: "WARNING",
      trend: "UP",
      calculatedAt: new Date(),
    },
    qualityPerformance: {
      metricName: "First-Time Quality",
      value: 92.3,
      target: 98.0,
      unit: "percentage",
      status: "GOOD",
      trend: "STABLE",
      calculatedAt: new Date(),
    },
    communicationScore: {
      metricName: "Response Time",
      value: 4.2,
      target: 2.0,
      unit: "hours",
      status: "WARNING",
      trend: "DOWN",
      calculatedAt: new Date(),
    },
    revisionRate: {
      metricName: "Revision Rate",
      value: 15.2,
      target: 5.0,
      unit: "percentage",
      status: "CRITICAL",
      trend: "UP",
      calculatedAt: new Date(),
    },
    lastUpdated: new Date(),
  };
}

async function generateBusinessAnalytics(ctx: Context, filters: any) {
  // Mock comprehensive business analytics
  return {
    revenue: await calculateRevenueAnalytics(ctx, filters),
    orders: await calculateOrderAnalytics(ctx, filters),
    customers: await calculateCustomerAnalytics(ctx, filters),
    manufacturers: await calculateManufacturerAnalytics(ctx, filters),
    marketTrends: await calculateMarketTrends(ctx, filters),
    reportDate: new Date(),
    reportPeriod: filters.period || "MONTHLY",
  };
}

async function calculateRevenueAnalytics(ctx: Context, args: any) {
  try {
    const orders = await ctx.prisma.order.findMany({
      where: {
        status: "DELIVERED",
        // Add date filters if provided
      },
      include: {
        orderItems: true,
        collection: {
          include: { category: true },
        },
      },
    });

    const totalRevenue = orders.reduce(
      (sum, order) =>
        sum +
        order.orderItems.reduce(
          (itemSum, item) => itemSum + item.finalPrice,
          0
        ),
      0
    );

    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      totalRevenue,
      monthlyGrowth: 12.5, // Mock data
      avgOrderValue,
      totalOrders: orders.length,
      revenueByCategory: calculateRevenueByCategory(orders),
      monthlyRevenue: calculateMonthlyRevenue(orders),
    };
  } catch (error) {
    console.error("Revenue analytics error:", error);
    return {
      totalRevenue: 0,
      monthlyGrowth: 0,
      avgOrderValue: 0,
      totalOrders: 0,
    };
  }
}

async function calculateOrderAnalytics(ctx: Context, args: any) {
  try {
    const orders = await ctx.prisma.order.findMany({
      where: {},
      include: { revisionRequests: true },
    });

    const completedOrders = orders.filter(
      (o) => o.status === "DELIVERED"
    ).length;
    const pendingOrders = orders.filter((o) =>
      ["PENDING", "IN_PRODUCTION", "REVIEWED"].includes(o.status)
    ).length;
    const revisingOrders = orders.filter(
      (o) => o.revisionRequests?.length > 0
    ).length;

    return {
      totalOrders: orders.length,
      completedOrders,
      pendingOrders,
      completionRate:
        orders.length > 0 ? (completedOrders / orders.length) * 100 : 0,
      avgCompletionTime: 18, // Mock: days
      revisingOrders,
      revisionRate:
        orders.length > 0 ? (revisingOrders / orders.length) * 100 : 0,
      ordersByStatus: calculateOrdersByStatus(orders),
    };
  } catch (error) {
    console.error("Order analytics error:", error);
    return { totalOrders: 0, completedOrders: 0, pendingOrders: 0 };
  }
}

// Helper functions
function getDateFilter(period: string) {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case "WEEK":
      startDate.setDate(now.getDate() - 7);
      break;
    case "MONTH":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "QUARTER":
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "YEAR":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1);
  }

  return {
    gte: startDate,
    lte: now,
  };
}

function getPerformanceLevel(score: number): string {
  if (score >= 95) return "EXCELLENT";
  if (score >= 85) return "GOOD";
  if (score >= 70) return "NEEDS_IMPROVEMENT";
  return "CRITICAL";
}

function calculateRevenueByCategory(orders: any[]) {
  // Group revenue by category
  const categoryRevenue = new Map();

  orders.forEach((order) => {
    const categoryName = order.collection?.category?.name || "Other";
    const orderRevenue =
      order.orderItems?.reduce(
        (sum: number, item: any) => sum + item.finalPrice,
        0
      ) || 0;

    categoryRevenue.set(
      categoryName,
      (categoryRevenue.get(categoryName) || 0) + orderRevenue
    );
  });

  return Array.from(categoryRevenue.entries()).map(
    ([categoryName, revenue]) => ({
      categoryName,
      revenue,
      percentage:
        ((revenue as number) /
          orders.reduce(
            (sum, o) =>
              sum +
              (o.orderItems?.reduce(
                (s: number, i: any) => s + i.finalPrice,
                0
              ) || 0),
            0
          )) *
        100,
    })
  );
}

function calculateMonthlyRevenue(orders: any[]) {
  // Mock monthly revenue calculation
  return [
    { month: "2024-01", revenue: 45000, orders: 23, growthRate: 12.5 },
    { month: "2024-02", revenue: 52000, orders: 28, growthRate: 15.6 },
    { month: "2024-03", revenue: 48000, orders: 25, growthRate: -7.7 },
  ];
}

function calculateOrdersByStatus(orders: any[]) {
  const statusCounts = new Map();

  orders.forEach((order) => {
    statusCounts.set(order.status, (statusCounts.get(order.status) || 0) + 1);
  });

  return Array.from(statusCounts.entries()).map(([status, count]) => ({
    status,
    count,
    percentage: ((count as number) / orders.length) * 100,
  }));
}

// Additional analytics functions (simplified implementations)
async function calculateCustomerAnalytics(ctx: Context, filters: any) {
  return { totalCustomers: 45, activeCustomers: 32, newCustomers: 8 };
}

async function calculateManufacturerAnalytics(ctx: Context, filters: any) {
  return {
    totalManufacturers: 12,
    activeManufacturers: 9,
    avgPerformanceScore: 87.2,
  };
}

async function calculateMarketTrends(ctx: Context, filters: any) {
  return [
    {
      trendName: "Sustainable Fashion",
      category: "Market",
      trend: "UP",
      changePercentage: 23.5,
    },
    {
      trendName: "Fast Fashion Demand",
      category: "Market",
      trend: "DOWN",
      changePercentage: -8.2,
    },
  ];
}

async function analyzeCategoryPerformance(ctx: Context, args: any) {
  return { categories: [] };
}

async function calculateCustomerSatisfactionMetrics(ctx: Context, args: any) {
  return { avgSatisfaction: 4.2, responseRate: 78.5 };
}

async function analyzeRevisionPatterns(ctx: Context, args: any) {
  return { avgRevisionsPerOrder: 1.3, mostCommonReason: "Design Change" };
}

async function calculateQualityMetrics(ctx: Context, args: any) {
  return { firstPassRate: 89.2, defectRate: 2.1 };
}
