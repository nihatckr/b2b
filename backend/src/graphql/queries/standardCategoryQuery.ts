import builder from "../builder";

// ========================================
// ADMIN STANDARD CATEGORY QUERIES
// ========================================

// Get all standard categories (admin only - includes inactive)
builder.queryField("adminStandardCategories", (t) =>
  t.prismaField({
    type: ["StandardCategory"],
    args: {
      search: t.arg.string(),
      level: t.arg.string(),
      isActive: t.arg.boolean(),
      isPublic: t.arg.boolean(),
      skip: t.arg.int(),
      take: t.arg.int(),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {};

      if (args.search) {
        where.OR = [
          { name: { contains: args.search, mode: "insensitive" } },
          { code: { contains: args.search, mode: "insensitive" } },
          { description: { contains: args.search, mode: "insensitive" } },
        ];
      }

      if (args.level) {
        where.level = args.level;
      }

      if (args.isActive !== undefined && args.isActive !== null) {
        where.isActive = args.isActive;
      }

      if (args.isPublic !== undefined && args.isPublic !== null) {
        where.isPublic = args.isPublic;
      }

      return context.prisma.standardCategory.findMany({
        ...query,
        where,
        ...(args.skip !== null && args.skip !== undefined ? { skip: args.skip } : {}),
        ...(args.take !== null && args.take !== undefined ? { take: args.take } : {}),
        orderBy: [{ level: "asc" }, { order: "asc" }, { name: "asc" }],
      });
    },
  })
);

// Get standard categories count (admin only)
builder.queryField("adminStandardCategoriesCount", (t) =>
  t.field({
    type: "Int",
    args: {
      search: t.arg.string(),
      level: t.arg.string(),
      isActive: t.arg.boolean(),
      isPublic: t.arg.boolean(),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const where: any = {};

      if (args.search) {
        where.OR = [
          { name: { contains: args.search, mode: "insensitive" } },
          { code: { contains: args.search, mode: "insensitive" } },
          { description: { contains: args.search, mode: "insensitive" } },
        ];
      }

      if (args.level) {
        where.level = args.level;
      }

      if (args.isActive !== undefined && args.isActive !== null) {
        where.isActive = args.isActive;
      }

      if (args.isPublic !== undefined && args.isPublic !== null) {
        where.isPublic = args.isPublic;
      }

      return context.prisma.standardCategory.count({ where });
    },
  })
);

// Get single standard category (admin only)
builder.queryField("adminStandardCategory", (t) =>
  t.prismaField({
    type: "StandardCategory",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      return context.prisma.standardCategory.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

// Get root standard categories (admin only)
builder.queryField("adminRootStandardCategories", (t) =>
  t.prismaField({
    type: ["StandardCategory"],
    authScopes: { admin: true },
    resolve: async (query, _root, _args, context) => {
      return context.prisma.standardCategory.findMany({
        ...query,
        where: { parentId: null },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });
    },
  })
);

// Get standard category tree (admin only)
builder.queryField("adminStandardCategoryTree", (t) =>
  t.field({
    type: "JSON",
    authScopes: { admin: true },
    resolve: async (_root, _args, context) => {
      const rootCategories = await context.prisma.standardCategory.findMany({
        where: { parentId: null },
        include: {
          subCategories: {
            include: {
              subCategories: {
                include: {
                  subCategories: true, // 4 seviye derinlik
                },
              },
            },
          },
        },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });

      const buildTree = (category: any): any => ({
        id: category.id,
        code: category.code,
        name: category.name,
        description: category.description,
        level: category.level,
        order: category.order,
        icon: category.icon,
        image: category.image,
        isActive: category.isActive,
        isPublic: category.isPublic,
        children: category.subCategories
          ? category.subCategories.map(buildTree)
          : [],
      });

      return rootCategories.map(buildTree);
    },
  })
);

// Get standard category statistics (admin only)
builder.queryField("adminStandardCategoryStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { admin: true },
    resolve: async (_root, _args, context) => {
      const [total, active, inactive, byLevel] = await Promise.all([
        context.prisma.standardCategory.count(),
        context.prisma.standardCategory.count({ where: { isActive: true } }),
        context.prisma.standardCategory.count({ where: { isActive: false } }),
        context.prisma.standardCategory.groupBy({
          by: ["level"],
          _count: true,
        }),
      ]);

      return {
        total,
        active,
        inactive,
        byLevel: byLevel.map((item) => ({
          level: item.level,
          count: item._count,
        })),
      };
    },
  })
);
