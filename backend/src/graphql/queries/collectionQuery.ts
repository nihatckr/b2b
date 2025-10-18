import builder from "../builder";

// Get all collections
builder.queryField("collections", (t) =>
  t.prismaField({
    type: ["Collection"],
    args: {
      skip: t.arg.int(),
      take: t.arg.int(),
      search: t.arg.string(),
      featured: t.arg.boolean(),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const where: any = { isActive: true };

      if (args.search) {
        where.OR = [
          { name: { contains: args.search, mode: "insensitive" } },
          { modelCode: { contains: args.search, mode: "insensitive" } },
        ];
      }

      if (args.featured) {
        where.isFeatured = true;
      }

      return context.prisma.collection.findMany({
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

// Get collection by ID
builder.queryField("collection", (t) =>
  t.prismaField({
    type: "Collection",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      return context.prisma.collection.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

// Get featured collections
builder.queryField("featuredCollections", (t) =>
  t.prismaField({
    type: ["Collection"],
    args: {
      skip: t.arg.int(),
      take: t.arg.int({ defaultValue: 10 }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context: any) => {
      return context.prisma.collection.findMany({
        ...query,
        where: { isActive: true, isFeatured: true },
        ...(args.skip !== null && args.skip !== undefined
          ? { skip: args.skip }
          : {}),
        ...(args.take !== null && args.take !== undefined
          ? { take: args.take }
          : {}),
        orderBy: { likesCount: "desc" },
      });
    },
  })
);
