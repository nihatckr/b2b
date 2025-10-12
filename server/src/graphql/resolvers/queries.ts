import { arg, booleanArg, intArg, nonNull, objectType, stringArg } from "nexus";
import type { Context } from "../../context";
import { getUserId, requireAdmin } from "../../utils/userUtils";

export const Query = objectType({
  name: "Query",
  definition(t) {
    // 👥 User Queries
    t.nonNull.list.nonNull.field("allUsers", {
      type: "User",
      args: {
        searchString: stringArg(),
        role: arg({ type: "Role" }),
        skip: intArg(),
        take: intArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        // Only admin can access all users
        await requireAdmin(context);

        // Build where conditions
        const searchConditions: any = {};

        // Company scope filtering
        const userId = getUserId(context);
        if (userId) {
          const currentUser = await context.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, companyId: true },
          });

          // Non-admin users can only see users from their own company
          if (currentUser?.role !== "ADMIN" && currentUser?.companyId) {
            searchConditions.companyId = currentUser.companyId;
          }
        }

        // Role filter
        if (args.role) {
          searchConditions.role = args.role;
        }

        // Search in name, email, username, firstName, lastName
        if (args.searchString) {
          searchConditions.OR = [
            { email: { contains: args.searchString, mode: "insensitive" } },
            { name: { contains: args.searchString, mode: "insensitive" } },
            { username: { contains: args.searchString, mode: "insensitive" } },
            { firstName: { contains: args.searchString, mode: "insensitive" } },
            { lastName: { contains: args.searchString, mode: "insensitive" } },
          ];
        }

        return context.prisma.user.findMany({
          where: searchConditions,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            isActive: true,
            username: true,
            firstName: true,
            lastName: true,
            businessLicense: true,
          },
          orderBy: { createdAt: "desc" },
          skip: args.skip || undefined,
          take: args.take || undefined,
        });
      },
    });

    // 📊 User Statistics
    t.field("userStats", {
      type: "UserStats",
      resolve: async (_parent, _args, context: Context) => {
        await requireAdmin(context);

        const [totalUsers, customerCount, manufactureCount, adminCount] =
          await Promise.all([
            context.prisma.user.count(),
            context.prisma.user.count({ where: { role: "CUSTOMER" } }),
            context.prisma.user.count({ where: { role: "MANUFACTURE" } }),
            context.prisma.user.count({ where: { role: "ADMIN" } }),
          ]);

        return {
          totalUsers,
          customerCount,
          manufactureCount,
          adminCount,
        };
      },
    });

    // 🏷️ Category Queries
    t.nonNull.list.nonNull.field("categories", {
      type: "Category",
      args: {
        searchString: stringArg(),
        skip: intArg(),
        take: intArg(),
      },
      resolve: (_parent, args, context: Context) => {
        const where: any = {};

        if (args.searchString) {
          where.OR = [
            { name: { contains: args.searchString, mode: "insensitive" } },
            {
              description: { contains: args.searchString, mode: "insensitive" },
            },
          ];
        }

        return context.prisma.category.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: args.skip || undefined,
          take: args.take || undefined,
        });
      },
    });

    // 💬 Message Queries
    t.nonNull.list.nonNull.field("myMessages", {
      type: "Message",
      args: {
        withUserId: intArg(),
        messageType: arg({ type: "MessageType" }),
        skip: intArg(),
        take: intArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const where: any = {
          OR: [{ senderId: userId }, { receiverId: userId }],
        };

        if (args.withUserId) {
          where.OR = [
            { senderId: userId, receiverId: args.withUserId },
            { senderId: args.withUserId, receiverId: userId },
          ];
        }

        if (args.messageType) {
          where.messageType = args.messageType;
        }

        return await context.prisma.message.findMany({
          where,
          include: {
            sender: {
              select: { id: true, name: true, email: true, role: true },
            },
            receiver: {
              select: { id: true, name: true, email: true, role: true },
            },
            relatedSample: {
              select: { id: true, sampleNumber: true, status: true },
            },
            relatedOrder: {
              select: { id: true, quantity: true },
            },
            relatedCollection: {
              select: { id: true, name: true, description: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: args.skip || undefined,
          take: args.take || 50,
        });
      },
    });

    t.field("unreadMessageCount", {
      type: "Int",
      resolve: async (_parent, _args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          return 0;
        }

        return await context.prisma.message.count({
          where: {
            receiverId: userId,
            isRead: false,
          },
        });
      },
    });

    // 🏭 Production Queries
    t.nonNull.list.nonNull.field("productionTrackings", {
      type: "ProductionTracking",
      args: {
        orderId: intArg(),
        stage: arg({ type: "ProductionStage" }),
        status: arg({ type: "ProductionStatus" }),
        skip: intArg(),
        take: intArg(),
      },
      // @ts-ignore - Temporary fix for enum type mismatch
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const where: any = {};

        if (args.orderId) {
          where.orderId = args.orderId;
        }

        if (args.stage) {
          where.currentStage = args.stage;
        }

        if (args.status) {
          where.overallStatus = args.status;
        }

        return await context.prisma.productionTracking.findMany({
          where,
          include: {
            order: {
              select: {
                id: true,
                quantity: true,
                customer: { select: { name: true, email: true } },
                manufacture: { select: { name: true, email: true } },
              },
            },
            workshop: {
              select: { id: true, name: true, location: true, capacity: true },
            },
            stageUpdates: {
              include: {
                updatedBy: { select: { name: true, role: true } },
              },
              orderBy: { createdAt: "desc" },
            },
            revisions: {
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { updatedAt: "desc" },
          skip: args.skip || undefined,
          take: args.take || 50,
        });
      },
    });

    // 📊 CRITICAL READ QUERIES
    t.nonNull.list.nonNull.field("collections", {
      type: "Collection",
      args: {
        userId: intArg(),
        categoryId: intArg(),
        isActive: booleanArg(),
        skip: intArg(),
        take: intArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const where: any = {};

        // Company scope filtering for non-public queries
        const userId = getUserId(context);
        if (userId) {
          const currentUser = await context.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, companyId: true },
          });

          // Non-admin users can only see collections from their company
          if (currentUser?.role !== "ADMIN" && currentUser?.companyId) {
            where.companyId = currentUser.companyId;
          }
        }

        if (args.userId) where.userId = args.userId;
        if (args.categoryId) where.categoryId = args.categoryId;
        if (args.isActive !== undefined) where.isActive = args.isActive;

        const collections = await context.prisma.collection.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: args.skip || 0,
          take: args.take || 20,
        });

        return collections.map((collection) => ({
          ...collection,
          images: collection.images ? JSON.stringify(collection.images) : null,
          tags: collection.tags ? JSON.stringify(collection.tags) : null,
        }));
      },
    });

    t.nonNull.list.nonNull.field("samples", {
      type: "Sample",
      args: {
        customerId: intArg(),
        manufactureId: intArg(),
        collectionId: intArg(),
        skip: intArg(),
        take: intArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const where: any = {};

        // Get current user for company scope filtering
        const currentUser = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true, companyId: true },
        });

        // Company scope filtering - non-admin users can only see samples from their company
        if (currentUser?.role !== "ADMIN" && currentUser?.companyId) {
          where.companyId = currentUser.companyId;
        }

        // Users can only see their own samples
        if (args.customerId && args.customerId === userId) {
          where.customerId = args.customerId;
        } else if (args.manufactureId && args.manufactureId === userId) {
          where.manufactureId = args.manufactureId;
        } else {
          // Default: show user's samples based on role
          where.OR = [{ customerId: userId }, { manufactureId: userId }];
        }

        if (args.collectionId) where.collectionId = args.collectionId;

        return context.prisma.sample.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: args.skip || 0,
          take: args.take || 20,
        });
      },
    });

    t.nonNull.list.nonNull.field("orders", {
      type: "Order",
      args: {
        customerId: intArg(),
        manufactureId: intArg(),
        collectionId: intArg(),
        skip: intArg(),
        take: intArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const where: any = {};

        // Get current user for company scope filtering
        const currentUser = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true, companyId: true },
        });

        // Company scope filtering - non-admin users can only see orders from their company
        if (currentUser?.role !== "ADMIN" && currentUser?.companyId) {
          where.companyId = currentUser.companyId;
        }

        // Users can only see their own orders
        if (args.customerId && args.customerId === userId) {
          where.customerId = args.customerId;
        } else if (args.manufactureId && args.manufactureId === userId) {
          where.manufactureId = args.manufactureId;
        } else {
          // Default: show user's orders
          where.OR = [{ customerId: userId }, { manufactureId: userId }];
        }

        if (args.collectionId) where.collectionId = args.collectionId;

        return context.prisma.order.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: args.skip || 0,
          take: args.take || 20,
        });
      },
    });

    t.nonNull.list.nonNull.field("allCategories", {
      type: "Category",
      resolve: async (_parent, _args, context: Context) => {
        return context.prisma.category.findMany({
          orderBy: { name: "asc" },
        });
      },
    });

    // ⭐ REVIEW QUERIES
    t.nonNull.list.nonNull.field("reviews", {
      type: "Review",
      args: {
        customerId: intArg(),
        rating: intArg(),
        skip: intArg(),
        take: intArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const where: any = {};

        // Users can only see their own reviews unless admin
        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (user?.role === "ADMIN") {
          // Admin can see all reviews
          if (args.customerId) where.customerId = args.customerId;
        } else {
          // Users can only see their own reviews
          where.customerId = userId;
        }

        if (args.rating) where.rating = args.rating;

        return context.prisma.review.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: args.skip || 0,
          take: args.take || 20,
        });
      },
    });

    t.field("review", {
      type: "Review",
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const review = await context.prisma.review.findUnique({
          where: { id: args.id },
        });

        if (!review) {
          throw new Error("Review not found");
        }

        // Check ownership unless admin
        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (user?.role !== "ADMIN" && review.customerId !== userId) {
          throw new Error("Not authorized to view this review");
        }

        return review;
      },
    });

    // ❓ QUESTION QUERIES
    t.nonNull.list.nonNull.field("questions", {
      type: "Question",
      args: {
        customerId: intArg(),
        manufactureId: intArg(),
        isAnswered: booleanArg(),
        isPublic: booleanArg(),
        skip: intArg(),
        take: intArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const where: any = {};

        // Users can only see their own questions unless admin or public questions
        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (user?.role === "ADMIN") {
          // Admin can see all questions
          if (args.customerId) where.customerId = args.customerId;
          if (args.manufactureId) where.manufactureId = args.manufactureId;
        } else {
          // Users can see their own questions or public ones
          where.OR = [
            { customerId: userId },
            { manufactureId: userId },
            { isPublic: true },
          ];
        }

        if (args.isAnswered !== undefined) where.isAnswered = args.isAnswered;
        if (args.isPublic !== undefined) where.isPublic = args.isPublic;

        return context.prisma.question.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: args.skip || 0,
          take: args.take || 20,
        });
      },
    });

    t.field("question", {
      type: "Question",
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const question = await context.prisma.question.findUnique({
          where: { id: args.id },
        });

        if (!question) {
          throw new Error("Question not found");
        }

        // Check visibility
        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        const canView =
          user?.role === "ADMIN" ||
          question.customerId === userId ||
          question.manufactureId === userId ||
          question.isPublic;

        if (!canView) {
          throw new Error("Not authorized to view this question");
        }

        return question;
      },
    });

    // 🏭 WORKSHOP QUERIES
    t.nonNull.list.nonNull.field("workshops", {
      type: "Workshop",
      args: {
        ownerId: intArg(),
        isActive: booleanArg(),
        skip: intArg(),
        take: intArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const where: any = {};

        // Users can only see their own workshops unless admin
        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (user?.role === "ADMIN") {
          // Admin can see all workshops
          if (args.ownerId) where.ownerId = args.ownerId;
        } else {
          // Users can only see their own workshops
          where.ownerId = userId;
        }

        if (args.isActive !== undefined) where.isActive = args.isActive;

        return context.prisma.workshop.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: args.skip || 0,
          take: args.take || 20,
        });
      },
    });

    t.field("workshop", {
      type: "Workshop",
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const workshop = await context.prisma.workshop.findUnique({
          where: { id: args.id },
        });

        if (!workshop) {
          throw new Error("Workshop not found");
        }

        // Check ownership unless admin
        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (user?.role !== "ADMIN" && workshop.ownerId !== userId) {
          throw new Error("Not authorized to view this workshop");
        }

        return workshop;
      },
    });

    // 🔍 QUALITY CONTROL QUERIES
    t.nonNull.list.nonNull.field("qualityControls", {
      type: "QualityControl",
      args: {
        productionTrackingId: intArg(),
        testType: arg({ type: "QualityTestType" }),
        result: arg({ type: "QualityResult" }),
        skip: intArg(),
        take: intArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const where: any = {};

        // Only manufacturers can see quality controls
        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (user?.role !== "MANUFACTURE" && user?.role !== "ADMIN") {
          throw new Error(
            "Only manufacturers and admins can view quality controls"
          );
        }

        if (args.productionTrackingId)
          where.productionTrackingId = args.productionTrackingId;
        if (args.testType) where.testType = args.testType;
        if (args.result) where.result = args.result;

        return context.prisma.qualityControl.findMany({
          where,
          orderBy: { testDate: "desc" },
          skip: args.skip || 0,
          take: args.take || 20,
        });
      },
    });

    t.field("qualityControl", {
      type: "QualityControl",
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (user?.role !== "MANUFACTURE" && user?.role !== "ADMIN") {
          throw new Error(
            "Only manufacturers and admins can view quality controls"
          );
        }

        const qualityControl = await context.prisma.qualityControl.findUnique({
          where: { id: args.id },
        });

        if (!qualityControl) {
          throw new Error("Quality control not found");
        }

        return qualityControl;
      },
    });

    // 📊 ANALYTICS & REPORTING
    t.field("dashboardStats", {
      type: "String",
      resolve: async (_parent, _args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (user?.role === "CUSTOMER") {
          // Customer dashboard
          const [myOrders, myReviews, myQuestions, myMessages] =
            await Promise.all([
              context.prisma.order.count({ where: { customerId: userId } }),
              context.prisma.review.count({ where: { customerId: userId } }),
              context.prisma.question.count({ where: { customerId: userId } }),
              context.prisma.message.count({
                where: {
                  OR: [{ senderId: userId }, { receiverId: userId }],
                },
              }),
            ]);

          return JSON.stringify({
            totalOrders: myOrders,
            totalReviews: myReviews,
            totalQuestions: myQuestions,
            totalMessages: myMessages,
            userType: "CUSTOMER",
          });
        } else if (user?.role === "MANUFACTURE") {
          // Manufacturer dashboard
          const [
            myCollections,
            myOrders,
            myQuestions,
            myWorkshops,
            myProductions,
          ] = await Promise.all([
            context.prisma.collection.count({ where: { userId: userId } }),
            context.prisma.order.count({ where: { manufactureId: userId } }),
            context.prisma.question.count({ where: { manufactureId: userId } }),
            context.prisma.workshop.count({ where: { ownerId: userId } }),
            context.prisma.productionTracking.count({
              where: {
                order: { manufactureId: userId },
              },
            }),
          ]);

          return JSON.stringify({
            totalCollections: myCollections,
            totalOrders: myOrders,
            totalQuestions: myQuestions,
            totalWorkshops: myWorkshops,
            totalProductions: myProductions,
            userType: "MANUFACTURE",
          });
        } else {
          // Admin dashboard
          const [
            totalUsers,
            totalOrders,
            totalCollections,
            totalReviews,
            totalQuestions,
            totalMessages,
          ] = await Promise.all([
            context.prisma.user.count(),
            context.prisma.order.count(),
            context.prisma.collection.count(),
            context.prisma.review.count(),
            context.prisma.question.count(),
            context.prisma.message.count(),
          ]);

          return JSON.stringify({
            totalUsers,
            totalOrders,
            totalCollections,
            totalReviews,
            totalQuestions,
            totalMessages,
            userType: "ADMIN",
          });
        }
      },
    });

    t.field("orderAnalytics", {
      type: "String",
      resolve: async (_parent, _args, context: Context) => {
        await requireAdmin(context);

        const [ordersByStatus, ordersByMonth, topManufacturers, recentOrders] =
          await Promise.all([
            // Orders by status
            context.prisma.order.groupBy({
              by: ["status"],
              _count: {
                status: true,
              },
            }),

            // Orders by month (last 6 months)
            context.prisma.order.findMany({
              where: {
                createdAt: {
                  gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                },
              },
              select: {
                createdAt: true,
                status: true,
              },
            }),

            // Top manufacturers by order count
            context.prisma.order.groupBy({
              by: ["manufactureId"],
              _count: {
                manufactureId: true,
              },
              orderBy: {
                _count: {
                  manufactureId: "desc",
                },
              },
              take: 5,
            }),

            // Recent orders
            context.prisma.order.findMany({
              take: 10,
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                status: true,
                quantity: true,
                createdAt: true,
                customer: {
                  select: { name: true },
                },
                manufacture: {
                  select: { name: true },
                },
              },
            }),
          ]);

        return JSON.stringify({
          ordersByStatus,
          ordersByMonth,
          topManufacturers,
          recentOrders,
        });
      },
    });

    t.field("productionAnalytics", {
      type: "String",
      resolve: async (_parent, _args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (user?.role !== "MANUFACTURE" && user?.role !== "ADMIN") {
          throw new Error(
            "Only manufacturers and admins can view production analytics"
          );
        }

        const whereClause =
          user?.role === "ADMIN"
            ? {}
            : {
                order: { manufactureId: userId },
              };

        const [productionsByStatus, avgProductionTime, qualityControlStats] =
          await Promise.all([
            // Productions by status
            context.prisma.productionTracking.groupBy({
              by: ["overallStatus"],
              where: whereClause,
              _count: {
                overallStatus: true,
              },
            }),

            // Average production time
            context.prisma.productionTracking.aggregate({
              where: {
                ...whereClause,
                overallStatus: "COMPLETED",
              },
              _avg: {
                estimatedTotalDays: true,
              },
            }),

            // Quality control stats
            context.prisma.qualityControl.groupBy({
              by: ["result"],
              _count: {
                result: true,
              },
            }),
          ]);

        return JSON.stringify({
          productionsByStatus,
          avgProductionTime: avgProductionTime._avg.estimatedTotalDays || 0,
          qualityControlStats,
          userType: user?.role,
        });
      },
    });

    // 📄 REPORT GENERATION APIs
    t.field("generateSalesReport", {
      type: "String",
      args: {
        startDate: arg({ type: "DateTime" }),
        endDate: arg({ type: "DateTime" }),
        manufactureId: intArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        await requireAdmin(context);

        const startDate =
          args.startDate ||
          new Date(new Date().setMonth(new Date().getMonth() - 3));
        const endDate = args.endDate || new Date();

        const whereClause: any = {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        };

        if (args.manufactureId) {
          whereClause.manufactureId = args.manufactureId;
        }

        const [
          totalOrders,
          totalRevenue,
          ordersByStatus,
          topManufacturers,
          topCollections,
        ] = await Promise.all([
          context.prisma.order.count({ where: whereClause }),

          context.prisma.order.aggregate({
            where: { ...whereClause, status: "DELIVERED" },
            _sum: { totalPrice: true },
          }),

          context.prisma.order.groupBy({
            by: ["status"],
            where: whereClause,
            _count: { status: true },
            _sum: { totalPrice: true },
          }),

          context.prisma.order.groupBy({
            by: ["manufactureId"],
            where: whereClause,
            _count: { manufactureId: true },
            _sum: { totalPrice: true },
            orderBy: { _sum: { totalPrice: "desc" } },
            take: 10,
          }),

          context.prisma.order.groupBy({
            by: ["collectionId"],
            where: whereClause,
            _count: { collectionId: true },
            _sum: { totalPrice: true },
            orderBy: { _sum: { totalPrice: "desc" } },
            take: 10,
          }),
        ]);

        return JSON.stringify({
          period: { startDate, endDate },
          summary: {
            totalOrders,
            totalRevenue: totalRevenue._sum.totalPrice || 0,
            averageOrderValue:
              totalOrders > 0
                ? (totalRevenue._sum.totalPrice || 0) / totalOrders
                : 0,
          },
          ordersByStatus,
          topManufacturers,
          topCollections,
          reportGeneratedAt: new Date(),
        });
      },
    });

    t.field("generateCustomerReport", {
      type: "String",
      args: {
        customerId: intArg(),
        startDate: arg({ type: "DateTime" }),
        endDate: arg({ type: "DateTime" }),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        // Admin can see all customers, customers can only see their own data
        const targetCustomerId = args.customerId || userId;

        if (user?.role !== "ADMIN" && targetCustomerId !== userId) {
          throw new Error("Not authorized to view this customer report");
        }

        const startDate =
          args.startDate ||
          new Date(new Date().setMonth(new Date().getMonth() - 12));
        const endDate = args.endDate || new Date();

        const [
          customerInfo,
          orderStats,
          reviewStats,
          messageStats,
          questionStats,
        ] = await Promise.all([
          context.prisma.user.findUnique({
            where: { id: targetCustomerId },
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          }),

          context.prisma.order.aggregate({
            where: {
              customerId: targetCustomerId,
              createdAt: { gte: startDate, lte: endDate },
            },
            _count: { id: true },
            _sum: { totalPrice: true },
            _avg: { totalPrice: true },
          }),

          context.prisma.review.aggregate({
            where: {
              customerId: targetCustomerId,
              createdAt: { gte: startDate, lte: endDate },
            },
            _count: { id: true },
            _avg: { rating: true },
          }),

          context.prisma.message.count({
            where: {
              OR: [
                { senderId: targetCustomerId },
                { receiverId: targetCustomerId },
              ],
              createdAt: { gte: startDate, lte: endDate },
            },
          }),

          context.prisma.question.count({
            where: {
              customerId: targetCustomerId,
              createdAt: { gte: startDate, lte: endDate },
            },
          }),
        ]);

        return JSON.stringify({
          customer: customerInfo,
          period: { startDate, endDate },
          orderActivity: {
            totalOrders: orderStats._count.id,
            totalSpent: orderStats._sum.totalPrice || 0,
            averageOrderValue: orderStats._avg.totalPrice || 0,
          },
          engagementStats: {
            totalReviews: reviewStats._count.id,
            averageRating: reviewStats._avg.rating || 0,
            totalMessages: messageStats,
            totalQuestions: questionStats,
          },
          reportGeneratedAt: new Date(),
        });
      },
    });

    t.field("generateManufacturerReport", {
      type: "String",
      args: {
        manufactureId: intArg(),
        startDate: arg({ type: "DateTime" }),
        endDate: arg({ type: "DateTime" }),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error("Authentication required");
        }

        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        // Admin can see all manufacturers, manufacturers can only see their own data
        const targetManufactureId = args.manufactureId || userId;

        if (user?.role !== "ADMIN" && targetManufactureId !== userId) {
          throw new Error("Not authorized to view this manufacturer report");
        }

        const startDate =
          args.startDate ||
          new Date(new Date().setMonth(new Date().getMonth() - 12));
        const endDate = args.endDate || new Date();

        const [
          manufacturerInfo,
          orderStats,
          collectionStats,
          workshopStats,
          productionStats,
        ] = await Promise.all([
          context.prisma.user.findUnique({
            where: { id: targetManufactureId },
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          }),

          context.prisma.order.aggregate({
            where: {
              manufactureId: targetManufactureId,
              createdAt: { gte: startDate, lte: endDate },
            },
            _count: { id: true },
            _sum: { totalPrice: true },
            _avg: { totalPrice: true },
          }),

          context.prisma.collection.count({
            where: {
              userId: targetManufactureId,
              createdAt: { gte: startDate, lte: endDate },
            },
          }),

          context.prisma.workshop.count({
            where: {
              ownerId: targetManufactureId,
              isActive: true,
            },
          }),

          context.prisma.productionTracking.count({
            where: {
              order: { manufactureId: targetManufactureId },
              createdAt: { gte: startDate, lte: endDate },
            },
          }),
        ]);

        return JSON.stringify({
          manufacturer: manufacturerInfo,
          period: { startDate, endDate },
          businessStats: {
            totalOrders: orderStats._count.id,
            totalRevenue: orderStats._sum.totalPrice || 0,
            averageOrderValue: orderStats._avg.totalPrice || 0,
            totalCollections: collectionStats,
            activeWorkshops: workshopStats,
            totalProductions: productionStats,
          },
          reportGeneratedAt: new Date(),
        });
      },
    });

    t.field("generateInventoryReport", {
      type: "String",
      resolve: async (_parent, _args, context: Context) => {
        await requireAdmin(context);

        const [
          totalCollections,
          totalSamples,
          collectionsByCategory,
          samplesByStatus,
          topViewedCollections,
        ] = await Promise.all([
          context.prisma.collection.count({ where: { isActive: true } }),

          context.prisma.sample.count(),

          context.prisma.collection.groupBy({
            by: ["categoryId"],
            where: { isActive: true },
            _count: { categoryId: true },
            orderBy: { _count: { categoryId: "desc" } },
          }),

          context.prisma.sample.groupBy({
            by: ["status"],
            _count: { status: true },
          }),

          context.prisma.collection.findMany({
            where: { isActive: true },
            orderBy: { viewCount: "desc" },
            take: 10,
            select: {
              id: true,
              name: true,
              viewCount: true,
              createdAt: true,
              category: {
                select: { name: true },
              },
            },
          }),
        ]);

        return JSON.stringify({
          inventory: {
            totalCollections,
            totalSamples,
            collectionsByCategory,
            samplesByStatus,
            topViewedCollections,
          },
          reportGeneratedAt: new Date(),
        });
      },
    });
  },
});
