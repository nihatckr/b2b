import builder from "../builder";

// Get current user (authenticated)
builder.queryField("me", (t) =>
  t.prismaField({
    type: "User",
    authScopes: { user: true },
    resolve: async (query, _root, _args, context) => {
      console.log("🔍 ME Query Debug:", {
        hasContext: !!context,
        hasUser: !!context.user,
        userId: context.user?.id,
        userIdType: typeof context.user?.id,
      });

      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const user = await context.prisma.user.findUniqueOrThrow({
        ...query,
        where: { id: context.user.id },
      });

      console.log("✅ ME Query: User found", {
        userId: user.id,
        name: user.name,
        email: user.email,
      });

      return user;
    },
  })
);

// Get all users (admin only)
builder.queryField("users", (t) =>
  t.prismaField({
    type: ["User"],
    args: {
      skip: t.arg.int(),
      take: t.arg.int(),
      role: t.arg.string(),
      search: t.arg.string(),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {};

      if (args.role) {
        where.role = args.role;
      }

      if (args.search) {
        where.OR = [
          { email: { contains: args.search, mode: "insensitive" } },
          { name: { contains: args.search, mode: "insensitive" } },
        ];
      }

      return context.prisma.user.findMany({
        ...query,
        where,
        ...(args.skip !== null && args.skip !== undefined
          ? { skip: args.skip }
          : {}),
        ...(args.take !== null && args.take !== undefined
          ? { take: args.take }
          : {}),
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// Get user by ID
builder.queryField("user", (t) =>
  t.prismaField({
    type: "User",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      return context.prisma.user.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

// Get all manufacturers (companies)
builder.queryField("allManufacturers", (t) =>
  t.prismaField({
    type: ["User"],
    args: {
      skip: t.arg.int(),
      take: t.arg.int(),
      search: t.arg.string(),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context: any) => {
      const where: any = {
        role: { in: ["COMPANY_OWNER", "COMPANY_EMPLOYEE"] },
      };

      if (args.search) {
        where.OR = [
          { email: { contains: args.search, mode: "insensitive" } },
          { name: { contains: args.search, mode: "insensitive" } },
        ];
      }

      return context.prisma.user.findMany({
        ...query,
        where,
        ...(args.skip !== null && args.skip !== undefined
          ? { skip: args.skip }
          : {}),
        ...(args.take !== null && args.take !== undefined
          ? { take: args.take }
          : {}),
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// Get user stats (authenticated)
builder.queryField("userStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: async (_root: any, _args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const totalSamples = await context.prisma.sample.count({
        where: {
          OR: [
            { customerId: context.user.id },
            { manufactureId: context.user.id },
          ],
        },
      });

      const totalOrders = await context.prisma.order.count({
        where: {
          OR: [
            { customerId: context.user.id },
            { manufactureId: context.user.id },
          ],
        },
      });

      const totalCollections = await context.prisma.collection.count({
        where: { authorId: context.user.id },
      });

      const pendingSamples = await context.prisma.sample.count({
        where: {
          customerId: context.user.id,
          status: { in: ["PENDING", "REVIEWED"] },
        },
      });

      const favoriteCollections =
        await context.prisma.userFavoriteCollection.count({
          where: { userId: context.user.id },
        });

      return {
        totalSamples,
        totalOrders,
        totalCollections,
        pendingSamples,
        favoriteCollections,
      };
    },
  })
);

// Admin: Get users count by role
builder.queryField("usersCountByRole", (t) =>
  t.field({
    type: "JSON",
    authScopes: { admin: true },
    resolve: async (_root: any, _args: any, context: any) => {
      const [
        totalUsers,
        admins,
        companyOwners,
        companyEmployees,
        individualCustomers,
        activeUsers,
        inactiveUsers,
        pendingApproval,
      ] = await Promise.all([
        context.prisma.user.count(),
        context.prisma.user.count({ where: { role: "ADMIN" } }),
        context.prisma.user.count({ where: { role: "COMPANY_OWNER" } }),
        context.prisma.user.count({ where: { role: "COMPANY_EMPLOYEE" } }),
        context.prisma.user.count({ where: { role: "INDIVIDUAL_CUSTOMER" } }),
        context.prisma.user.count({ where: { isActive: true } }),
        context.prisma.user.count({ where: { isActive: false } }),
        context.prisma.user.count({ where: { isPendingApproval: true } }),
      ]);

      return {
        total: totalUsers,
        byRole: {
          ADMIN: admins,
          COMPANY_OWNER: companyOwners,
          COMPANY_EMPLOYEE: companyEmployees,
          INDIVIDUAL_CUSTOMER: individualCustomers,
        },
        byStatus: {
          active: activeUsers,
          inactive: inactiveUsers,
          pendingApproval,
        },
      };
    },
  })
);

// Admin: Get user activity details
builder.queryField("userActivity", (t) =>
  t.field({
    type: "JSON",
    args: {
      userId: t.arg.int({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root: any, args: any, context: any) => {
      const user = await context.prisma.user.findUnique({
        where: { id: args.userId },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      });

      if (!user) throw new Error("User not found");

      const [
        totalSamples,
        totalOrders,
        totalCollections,
        totalTasks,
        completedTasks,
        sentMessages,
        receivedMessages,
      ] = await Promise.all([
        context.prisma.sample.count({
          where: {
            OR: [{ customerId: args.userId }, { manufactureId: args.userId }],
          },
        }),
        context.prisma.order.count({
          where: {
            OR: [{ customerId: args.userId }, { manufactureId: args.userId }],
          },
        }),
        context.prisma.collection.count({
          where: { authorId: args.userId },
        }),
        context.prisma.task.count({
          where: { userId: args.userId },
        }),
        context.prisma.task.count({
          where: { userId: args.userId, status: "COMPLETED" },
        }),
        context.prisma.message.count({
          where: { senderId: args.userId },
        }),
        context.prisma.message.count({
          where: { receiverId: args.userId },
        }),
      ]);

      // Recent activity
      const recentOrders = await context.prisma.order.findMany({
        where: {
          OR: [{ customerId: args.userId }, { manufactureId: args.userId }],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          createdAt: true,
        },
      });

      const recentSamples = await context.prisma.sample.findMany({
        where: {
          OR: [{ customerId: args.userId }, { manufactureId: args.userId }],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          sampleNumber: true,
          status: true,
          createdAt: true,
        },
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          isActive: user.isActive,
          createdAt: user.createdAt,
          company: user.company,
        },
        statistics: {
          samples: totalSamples,
          orders: totalOrders,
          collections: totalCollections,
          tasks: {
            total: totalTasks,
            completed: completedTasks,
            completionRate:
              totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0,
          },
          messages: {
            sent: sentMessages,
            received: receivedMessages,
            total: sentMessages + receivedMessages,
          },
        },
        recentActivity: {
          orders: recentOrders,
          samples: recentSamples,
        },
      };
    },
  })
);
