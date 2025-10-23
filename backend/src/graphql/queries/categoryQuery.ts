import builder from "../builder";

// Get all categories
builder.queryField("categories", (t) =>
  t.prismaField({
    type: ["Category"],
    args: {
      search: t.arg.string(),
      skip: t.arg.int(),
      take: t.arg.int(),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {};

      if (args.search) {
        where.OR = [
          { name: { contains: args.search, mode: "insensitive" } },
          { description: { contains: args.search, mode: "insensitive" } },
        ];
      }

      return context.prisma.category.findMany({
        ...query,
        where,
        ...(args.skip !== null && args.skip !== undefined
          ? { skip: args.skip }
          : {}),
        ...(args.take !== null && args.take !== undefined
          ? { take: args.take }
          : {}),
      });
    },
  })
);

// Get total category count
builder.queryField("categoriesCount", (t) =>
  t.field({
    type: "Int",
    args: {
      search: t.arg.string(),
    },
    authScopes: { public: true },
    resolve: async (_root, args, context) => {
      const where: any = {};

      if (args.search) {
        where.OR = [
          { name: { contains: args.search, mode: "insensitive" } },
          { description: { contains: args.search, mode: "insensitive" } },
        ];
      }

      return context.prisma.category.count({ where });
    },
  })
);

// Get category by ID
builder.queryField("category", (t) =>
  t.prismaField({
    type: "Category",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      return context.prisma.category.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

// Alias for categories
builder.queryField("allCategories", (t) =>
  t.prismaField({
    type: ["Category"],
    args: {
      search: t.arg.string(),
      skip: t.arg.int(),
      take: t.arg.int(),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {};

      if (args.search) {
        where.OR = [
          { name: { contains: args.search, mode: "insensitive" } },
          { description: { contains: args.search, mode: "insensitive" } },
        ];
      }

      return context.prisma.category.findMany({
        ...query,
        where,
        ...(args.skip !== null && args.skip !== undefined
          ? { skip: args.skip }
          : {}),
        ...(args.take !== null && args.take !== undefined
          ? { take: args.take }
          : {}),
      });
    },
  })
);

// Get root categories (no parent)
builder.queryField("rootCategories", (t) =>
  t.prismaField({
    type: ["Category"],
    authScopes: { public: true },
    resolve: async (query, _root, _args, context: any) => {
      return context.prisma.category.findMany({
        ...query,
        where: { parentCategoryId: null },
        orderBy: { name: "asc" },
      });
    },
  })
);

// Get category tree (all categories with nested structure)
builder.queryField("categoryTree", (t) =>
  t.field({
    type: "JSON",
    authScopes: { public: true },
    resolve: async (_root: any, _args: any, context: any) => {
      const rootCategories = await context.prisma.category.findMany({
        where: { parentCategoryId: null },
        include: { subCategories: { include: { subCategories: true } } },
        orderBy: { name: "asc" },
      });

      return rootCategories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        children: cat.subCategories.map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          description: sub.description,
          children: sub.subCategories.map((child: any) => ({
            id: child.id,
            name: child.name,
            description: child.description,
          })),
        })),
      }));
    },
  })
);
