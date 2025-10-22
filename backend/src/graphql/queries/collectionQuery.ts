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
      categoryId: t.arg.int(),
      season: t.arg.string(),
      gender: t.arg.string(),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const where: any = { isActive: true };

      if (args.search) {
        where.OR = [
          { name: { contains: args.search } },
          { modelCode: { contains: args.search } },
        ];
      }

      if (args.featured) {
        where.isFeatured = true;
      }

      if (args.categoryId) {
        where.categoryId = args.categoryId;
      }

      if (args.season) {
        where.season = args.season;
      }

      if (args.gender) {
        where.gender = args.gender;
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

// Get collections by company (for library integration)
builder.queryField("collectionsByCompany", (t) =>
  t.prismaField({
    type: ["Collection"],
    args: {
      companyId: t.arg.int({ required: true }),
      skip: t.arg.int(),
      take: t.arg.int({ defaultValue: 20 }),
      search: t.arg.string(),
      season: t.arg.string(),
      gender: t.arg.string(),
      categoryId: t.arg.int(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {
        companyId: args.companyId,
        isActive: true,
      };

      if (args.search) {
        where.OR = [
          { name: { contains: args.search } },
          { modelCode: { contains: args.search } },
          { description: { contains: args.search } },
        ];
      }

      if (args.season) {
        where.season = args.season;
      }

      if (args.gender) {
        where.gender = args.gender;
      }

      if (args.categoryId) {
        where.categoryId = args.categoryId;
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

// Get collection count by filters (for pagination)
builder.queryField("collectionsCount", (t) =>
  t.field({
    type: "Int",
    args: {
      companyId: t.arg.int(),
      search: t.arg.string(),
      featured: t.arg.boolean(),
      season: t.arg.string(),
      gender: t.arg.string(),
      categoryId: t.arg.int(),
      isActive: t.arg.boolean({ defaultValue: true }),
    },
    authScopes: { public: true },
    resolve: async (_root, args, context) => {
      const where: any = {};

      if (args.companyId) {
        where.companyId = args.companyId;
      }

      if (args.isActive !== null && args.isActive !== undefined) {
        where.isActive = args.isActive;
      }

      if (args.search) {
        where.OR = [
          { name: { contains: args.search } },
          { modelCode: { contains: args.search } },
          { description: { contains: args.search } },
        ];
      }

      if (args.featured) {
        where.isFeatured = true;
      }

      if (args.season) {
        where.season = args.season;
      }

      if (args.gender) {
        where.gender = args.gender;
      }

      if (args.categoryId) {
        where.categoryId = args.categoryId;
      }

      return context.prisma.collection.count({ where });
    },
  })
);
