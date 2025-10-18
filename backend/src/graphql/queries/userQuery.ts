import builder from "../builder";

// Get current user (authenticated)
builder.queryField("me", (t) =>
  t.prismaField({
    type: "User",
    authScopes: { user: true },
    resolve: async (query, _root, _args, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      return context.prisma.user.findUniqueOrThrow({
        ...query,
        where: { id: context.user.id },
      });
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
