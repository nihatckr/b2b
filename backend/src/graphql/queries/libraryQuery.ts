import { LibraryCategory, LibraryScope } from "../../../lib/generated";
import builder from "../builder";

// ========================================
// UNIFIED LIBRARY QUERIES
// ========================================

// Input for filtering library items
const LibraryFilterInput = builder.inputType('LibraryFilterInput', {
  fields: (t) => ({
    category: t.field({ type: 'String', required: false }),
    scope: t.field({ type: 'String', required: false }),
    companyId: t.int({ required: false }),
    search: t.string({ required: false }),
    isActive: t.boolean({ required: false }),
    isPopular: t.boolean({ required: false }),
  }),
});

// Get All Library Items (with filters)
builder.queryField("libraryItems", (t) =>
  t.prismaField({
    type: ["LibraryItem"],
    args: {
      filter: t.arg({ type: LibraryFilterInput, required: false }),
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
    },
    resolve: async (query, _root, args, context) => {
      const where: any = {};

      if (args.filter?.category) {
        where.category = args.filter.category as LibraryCategory;
      }

      if (args.filter?.scope) {
        where.scope = args.filter.scope as LibraryScope;
      }

      if (args.filter?.companyId) {
        where.companyId = args.filter.companyId;
      }

      if (args.filter?.isActive !== undefined) {
        where.isActive = args.filter.isActive;
      }

      if (args.filter?.isPopular !== undefined) {
        where.isPopular = args.filter.isPopular;
      }

      if (args.filter?.search) {
        where.OR = [
          { name: { contains: args.filter.search } },
          { description: { contains: args.filter.search } },
          { code: { contains: args.filter.search } },
        ];
      }

      return context.prisma.libraryItem.findMany({
        ...query,
        where,
        orderBy: { name: "asc" },
        ...(args.limit && { take: args.limit }),
        ...(args.offset && { skip: args.offset }),
      });
    },
  })
);

// Get Platform Standards (all users can see)
builder.queryField("platformStandards", (t) =>
  t.prismaField({
    type: ["LibraryItem"],
    args: {
      category: t.arg.string({ required: false }),
    },
    resolve: async (query, _root, args, context) => {
      const where: any = {
        scope: LibraryScope.PLATFORM_STANDARD,
        isActive: true,
      };

      if (args.category) {
        where.category = args.category as LibraryCategory;
      }

      return context.prisma.libraryItem.findMany({
        ...query,
        where,
        orderBy: [
          { isPopular: "desc" },
          { name: "asc" },
        ],
      });
    },
  })
);

// Get Company Custom Library (company members only)
builder.queryField("myCompanyLibrary", (t) =>
  t.prismaField({
    type: ["LibraryItem"],
    authScopes: { companyOwner: true, employee: true },
    args: {
      category: t.arg.string({ required: false }),
    },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      const where: any = {
        scope: LibraryScope.COMPANY_CUSTOM,
        companyId: context.user.companyId,
        isActive: true,
      };

      if (args.category) {
        where.category = args.category as LibraryCategory;
      }

      return context.prisma.libraryItem.findMany({
        ...query,
        where,
        orderBy: { name: "asc" },
      });
    },
  })
);

// Get Library Item by ID
builder.queryField("libraryItem", (t) =>
  t.prismaField({
    type: "LibraryItem",
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, context) => {
      return context.prisma.libraryItem.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

// Get Library Item by Code
builder.queryField("libraryItemByCode", (t) =>
  t.prismaField({
    type: "LibraryItem",
    nullable: true,
    args: {
      code: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, context) => {
      return context.prisma.libraryItem.findUnique({
        ...query,
        where: { code: args.code },
      });
    },
  })
);

// ========================================
// CATEGORY QUERIES
// ========================================

// Get Standard Categories (with hierarchy)
builder.queryField("standardCategories", (t) =>
  t.prismaField({
    type: ["StandardCategory"],
    args: {
      level: t.arg.string({ required: false }),
      parentId: t.arg.int({ required: false }),
    },
    resolve: async (query, _root, args, context) => {
      const where: any = {
        isActive: true,
        isPublic: true,
      };

      if (args.level) {
        where.level = args.level;
      }

      if (args.parentId !== undefined) {
        where.parentId = args.parentId;
      }

      return context.prisma.standardCategory.findMany({
        ...query,
        where,
        orderBy: { order: "asc" },
      });
    },
  })
);

// Get Company Categories
builder.queryField("myCompanyCategories", (t) =>
  t.prismaField({
    type: ["CompanyCategory"],
    authScopes: { companyOwner: true, employee: true },
    resolve: async (query, _root, _args, context) => {
      if (!context.user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.companyCategory.findMany({
        ...query,
        where: {
          companyId: context.user.companyId,
          isActive: true,
        },
        orderBy: { order: "asc" },
      });
    },
  })
);
