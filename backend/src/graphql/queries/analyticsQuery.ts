import builder from "../builder";

// Dashboard statistics - overall system stats
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
