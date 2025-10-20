import builder from "../builder";

// Company Dashboard Statistics - Comprehensive analytics for dashboard
builder.queryField("companyDashboardStats", (t) =>
  t.field({
    type: "JSON",
    args: {
      startDate: t.arg.string(),
      endDate: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (_root, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const companyId = context.user?.companyId;
      if (!companyId) throw new Error("User is not associated with a company");

      try {
        // Date range setup
        const now = new Date();
        const startDate = args.startDate ? new Date(args.startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = args.endDate ? new Date(args.endDate) : now;

        const dateFilter = {
          gte: startDate,
          lte: endDate,
        };

        const companyFilter = {
          companyId,
          createdAt: dateFilter,
        };

        // Order Statistics
        const [
          totalOrders,
          pendingOrders,
          confirmedOrders,
          completedOrders,
          cancelledOrders,
        ] = await Promise.all([
          context.prisma.order.count({ where: { companyId } }),
          context.prisma.order.count({ where: { companyId, status: "PENDING" } }),
          context.prisma.order.count({ where: { companyId, status: "CONFIRMED" } }),
          context.prisma.order.count({ where: { companyId, status: "DELIVERED" } }),
          context.prisma.order.count({ where: { companyId, status: "CANCELLED" } }),
        ]);

        // Sample Statistics
        const [
          totalSamples,
          pendingSamples,
          approvedSamples,
          rejectedSamples,
          inProductionSamples,
        ] = await Promise.all([
          context.prisma.sample.count({ where: { companyId } }),
          context.prisma.sample.count({ where: { companyId, status: { in: ["PENDING", "REVIEWED"] } } }),
          context.prisma.sample.count({ where: { companyId, status: "CONFIRMED" } }),
          context.prisma.sample.count({ where: { companyId, status: { in: ["REJECTED", "REJECTED_BY_CUSTOMER", "REJECTED_BY_MANUFACTURER"] } } }),
          context.prisma.sample.count({ where: { companyId, status: "IN_PRODUCTION" } }),
        ]);

        // Revenue Analytics
        const revenueData = await context.prisma.order.aggregate({
          where: { companyId, status: { in: ["DELIVERED", "CONFIRMED"] } },
          _sum: { totalPrice: true },
          _avg: { totalPrice: true },
        });

        const totalRevenue = revenueData._sum?.totalPrice || 0;
        const averageOrderValue = revenueData._avg?.totalPrice || 0;

        // Recent Activities (last 10)
        const recentOrders = await context.prisma.order.findMany({
          where: { companyId },
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            quantity: true,
            totalPrice: true,
            createdAt: true,
            collection: { select: { name: true } },
          },
        });

        const recentSamples = await context.prisma.sample.findMany({
          where: { companyId },
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            sampleNumber: true,
            name: true,
            status: true,
            createdAt: true,
            collection: { select: { name: true } },
          },
        });

        // Collections Count
        const totalCollections = await context.prisma.collection.count({
          where: { companyId, isActive: true },
        });

        // Task Statistics
        const [totalTasks, pendingTasks, completedTasks, overdueTasks] = await Promise.all([
          context.prisma.task.count({ where: { userId: context.user.id } }),
          context.prisma.task.count({ where: { userId: context.user.id, status: "TODO" } }),
          context.prisma.task.count({ where: { userId: context.user.id, status: "COMPLETED" } }),
          context.prisma.task.count({
            where: {
              userId: context.user.id,
              status: "TODO",
              dueDate: { lt: now },
            },
          }),
        ]);

        return {
          // Order Stats
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            confirmed: confirmedOrders,
            completed: completedOrders,
            cancelled: cancelledOrders,
            completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
          },
          // Sample Stats
          samples: {
            total: totalSamples,
            pending: pendingSamples,
            approved: approvedSamples,
            rejected: rejectedSamples,
            inProduction: inProductionSamples,
            approvalRate: totalSamples > 0 ? Math.round((approvedSamples / totalSamples) * 100) : 0,
          },
          // Revenue Stats
          revenue: {
            total: totalRevenue,
            average: averageOrderValue,
            currency: "USD",
          },
          // Collections
          collections: {
            total: totalCollections,
          },
          // Tasks
          tasks: {
            total: totalTasks,
            pending: pendingTasks,
            completed: completedTasks,
            overdue: overdueTasks,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          },
          // Recent Activities
          recentActivities: {
            orders: recentOrders,
            samples: recentSamples,
          },
          // Date Range
          period: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        };
      } catch (error) {
        console.error("Error in companyDashboardStats:", error);
        throw new Error("Failed to fetch company dashboard stats");
      }
    },
  })
);

// Dashboard statistics - overall system stats (legacy - kept for backward compatibility)
builder.queryField("dashboardStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: async (_root, _args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      try {
        const totalUsers = await context.prisma.user.count();
        const totalCompanies = await context.prisma.company.count();
        const totalSamples = await context.prisma.sample.count();
        const totalOrders = await context.prisma.order.count();
        const totalCollections = await context.prisma.collection.count();

        const recentSamples = await context.prisma.sample.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, createdAt: true, status: true },
        });

        const recentOrders = await context.prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, orderNumber: true, createdAt: true, status: true, quantity: true },
        });

        return {
          totalUsers,
          totalCompanies,
          totalSamples,
          totalOrders,
          totalCollections,
          recentSamples,
          recentOrders,
        };
      } catch (error) {
        console.error("Error in dashboardStats:", error);
        throw new Error("Failed to fetch dashboard stats");
      }
    },
  })
);

// Production analytics
builder.queryField("productionAnalytics", (t) =>
  t.field({
    type: "JSON",
    args: {
      orderId: t.arg.int(),
      sampleId: t.arg.int(),
    },
    authScopes: { user: true },
    resolve: async (_root, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      try {
        const where: any = {};
        if (args.orderId) where.orderId = args.orderId;
        if (args.sampleId) where.sampleId = args.sampleId;

        const productionData = await context.prisma.productionTracking.findMany({
          where: where.length === 0 ? undefined : where,
          include: {
            updates: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        });

        const stageCounts = {
          PLANNING: 0,
          CUTTING: 0,
          SEWING: 0,
          QUALITY_CHECK: 0,
          PACKAGING: 0,
          SHIPPED: 0,
          COMPLETED: 0,
        };

        productionData.forEach((prod: any) => {
          const stage = prod.currentStage || "PLANNING";
          if (stage in stageCounts) {
            stageCounts[stage as keyof typeof stageCounts]++;
          }
        });

        return {
          totalProductions: productionData.length,
          stageCounts,
          recentUpdates: productionData.slice(0, 5).map((p: any) => ({
            id: p.id,
            stage: p.currentStage,
            progress: p.progressPercentage,
            updates: p.updates?.length || 0,
          })),
        };
      } catch (error) {
        console.error("Error in productionAnalytics:", error);
        throw new Error("Failed to fetch production analytics");
      }
    },
  })
);

// Public platform statistics (anonymous access)
builder.queryField("publicPlatformStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { public: true },
    resolve: async (_root, _args, context: any) => {
      try {
        const totalPublicCollections = await context.prisma.collection.count({
          where: { isActive: true },
        });

        const totalPublicQuestions = await context.prisma.question.count();
        const totalApprovedReviews = await context.prisma.review.count({
          where: { isApproved: true },
        });

        const topCollections = await context.prisma.collection.findMany({
          take: 5,
          where: { isActive: true },
          orderBy: { likesCount: "desc" },
          select: { id: true, name: true, likesCount: true, viewCount: true },
        });

        const averageRating = await context.prisma.review.aggregate({
          _avg: { rating: true },
          where: { isApproved: true },
        });

        return {
          totalPublicCollections,
          totalPublicQuestions,
          totalApprovedReviews,
          averageRating: averageRating._avg?.rating || 0,
          topCollections,
        };
      } catch (error) {
        console.error("Error in publicPlatformStats:", error);
        throw new Error("Failed to fetch public platform stats");
      }
    },
  })
);

// Task analytics
builder.queryField("taskAnalytics", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: async (_root, _args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      try {
        const totalTasks = await context.prisma.task.count({
          where: { userId: context.user.id },
        });

        const completedTasks = await context.prisma.task.count({
          where: { userId: context.user.id, status: "COMPLETED" },
        });

        const pendingTasks = await context.prisma.task.count({
          where: { userId: context.user.id, status: "TODO" },
        });

        const tasksByPriority = {
          HIGH: await context.prisma.task.count({
            where: { userId: context.user.id, priority: "HIGH" },
          }),
          MEDIUM: await context.prisma.task.count({
            where: { userId: context.user.id, priority: "MEDIUM" },
          }),
          LOW: await context.prisma.task.count({
            where: { userId: context.user.id, priority: "LOW" },
          }),
        };

        const overdueTasks = await context.prisma.task.count({
          where: {
            userId: context.user.id,
            status: "TODO",
            dueDate: {
              lt: new Date(),
            },
          },
        });

        return {
          totalTasks,
          completedTasks,
          pendingTasks,
          tasksByPriority,
          overdueTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        };
      } catch (error) {
        console.error("Error in taskAnalytics:", error);
        throw new Error("Failed to fetch task analytics");
      }
    },
  })
);

// Workshop utilization analytics
builder.queryField("workshopAnalytics", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: async (_root, _args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      try {
        const totalWorkshops = await context.prisma.workshop.count();

        const activeProductions = await context.prisma.productionTracking.count({
          where: {
            status: { in: ["IN_PROGRESS"] },
          },
        });

        const workshopTypes = await context.prisma.workshop.groupBy({
          by: ["type"],
          _count: { id: true },
        });

        const workshopStats = workshopTypes.map((ws: any) => ({
          type: ws.type,
          count: ws._count?.id || 0,
        }));

        const recentWorkshops = await context.prisma.workshop.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, type: true, capacity: true, createdAt: true },
        });

        return {
          totalWorkshops,
          activeProductions,
          workshopStats,
          recentWorkshops,
        };
      } catch (error) {
        console.error("Error in workshopAnalytics:", error);
        throw new Error("Failed to fetch workshop analytics");
      }
    },
  })
);
