/**
 * Library Queries - UNIFIED LIBRARY SYSTEM
 *
 * 🎯 Purpose: Textile industry library management (fabrics, materials, colors, etc.)
 *
 * 📋 Available Queries:
 *
 * STANDARD QUERIES:
 * - libraryItems: All library items with filters (public)
 * - libraryItem: Single item by ID (public)
 * - libraryItemByCode: Single item by code (public)
 * - platformStandards: Platform-wide standard items (public)
 * - myCompanyLibrary: Company custom items (employee/owner)
 *
 * ANALYTICS (Admin):
 * - libraryStats: Aggregate statistics
 * - libraryItemsByCategory: Distribution by category
 * - libraryItemsByScope: Distribution by scope (platform/company)
 * - popularLibraryItems: Most used items
 *
 * SEARCH & AUTOCOMPLETE:
 * - searchLibraryItems: Fast search with autocomplete (public)
 * - suggestLibraryItems: Name suggestions for typeahead (public)
 *
 * 🔒 Security:
 * - Public queries: PLATFORM_STANDARD items visible to all
 * - Company queries: COMPANY_CUSTOM items visible to company members only
 * - Admin queries: Full access with statistics
 *
 * 💡 Categories:
 * - SEASON, COLOR, FIT, TREND, SIZE_GROUP, SIZE_BREAKDOWN
 * - FABRIC, MATERIAL, PRINT, WASH_EFFECT, CERTIFICATION
 * - PACKAGING_TYPE, LABELING_TYPE, PAYMENT_TERMS, QUALITY_STANDARD
 */

import { LibraryCategory, LibraryScope } from "../../../lib/generated";
import builder from "../builder";

// ========================================
// UNIFIED LIBRARY QUERIES
// ========================================

// Input for filtering library items
const LibraryFilterInput = builder.inputType("LibraryFilterInput", {
  fields: (t) => ({
    category: t.field({ type: "String", required: false }),
    scope: t.field({ type: "String", required: false }),
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
        orderBy: [{ isPopular: "desc" }, { name: "asc" }],
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
// ANALYTICS QUERIES (Admin Only)
// ========================================

/**
 * Get aggregate library statistics
 * ✅ Permission: Admin only
 */
builder.queryField("libraryStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { admin: true },
    resolve: async (_root, _args, context) => {
      const [
        totalItems,
        platformStandards,
        companyCustoms,
        activeItems,
        inactiveItems,
        popularItems,
        itemsByCategory,
      ] = await Promise.all([
        context.prisma.libraryItem.count(),
        context.prisma.libraryItem.count({
          where: { scope: LibraryScope.PLATFORM_STANDARD },
        }),
        context.prisma.libraryItem.count({
          where: { scope: LibraryScope.COMPANY_CUSTOM },
        }),
        context.prisma.libraryItem.count({ where: { isActive: true } }),
        context.prisma.libraryItem.count({ where: { isActive: false } }),
        context.prisma.libraryItem.count({ where: { isPopular: true } }),
        context.prisma.libraryItem.groupBy({
          by: ["category"],
          _count: { category: true },
        }),
      ]);

      return {
        totalItems,
        platformStandards,
        companyCustoms,
        activeItems,
        inactiveItems,
        popularItems,
        categoryCounts: itemsByCategory.map((item) => ({
          category: item.category,
          count: item._count.category,
        })),
      };
    },
  })
);

/**
 * Get library items distribution by category
 * ✅ Permission: Admin only
 */
builder.queryField("libraryItemsByCategory", (t) =>
  t.field({
    type: "JSON",
    authScopes: { admin: true },
    resolve: async (_root, _args, context) => {
      const totalItems = await context.prisma.libraryItem.count();

      const categoryCounts = await context.prisma.libraryItem.groupBy({
        by: ["category"],
        _count: { category: true },
      });

      return categoryCounts.map((item) => ({
        category: item.category,
        count: item._count.category,
        percentage:
          totalItems > 0 ? (item._count.category / totalItems) * 100 : 0,
      }));
    },
  })
);

/**
 * Get library items distribution by scope
 * ✅ Permission: Admin only
 */
builder.queryField("libraryItemsByScope", (t) =>
  t.field({
    type: "JSON",
    authScopes: { admin: true },
    resolve: async (_root, _args, context) => {
      const totalItems = await context.prisma.libraryItem.count();

      const scopeCounts = await context.prisma.libraryItem.groupBy({
        by: ["scope"],
        _count: { scope: true },
      });

      return scopeCounts.map((item) => ({
        scope: item.scope,
        count: item._count.scope,
        percentage: totalItems > 0 ? (item._count.scope / totalItems) * 100 : 0,
      }));
    },
  })
);

/**
 * Get popular library items
 * ✅ Permission: Public
 * ✅ Input: category filter, limit
 */
builder.queryField("popularLibraryItems", (t) =>
  t.prismaField({
    type: ["LibraryItem"],
    args: {
      category: t.arg.string(),
      limit: t.arg.int({ defaultValue: 20 }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {
        isActive: true,
        isPopular: true,
        scope: LibraryScope.PLATFORM_STANDARD, // Only platform standards
      };

      if (args.category) {
        where.category = args.category as LibraryCategory;
      }

      return context.prisma.libraryItem.findMany({
        ...query,
        where,
        take: args.limit || 20,
        orderBy: [{ name: "asc" }],
      });
    },
  })
);

// ========================================
// SEARCH & AUTOCOMPLETE QUERIES
// ========================================

/**
 * Fast search for library items (autocomplete/typeahead)
 * ✅ Permission: Public
 * ✅ Returns: Simplified list with id, name, category, code
 */
builder.queryField("searchLibraryItems", (t) =>
  t.field({
    type: "JSON",
    args: {
      query: t.arg.string({ required: true }),
      category: t.arg.string(),
      scope: t.arg.string(),
      limit: t.arg.int({ defaultValue: 10 }),
    },
    authScopes: { public: true },
    resolve: async (_root, args, context) => {
      const where: any = {
        isActive: true,
        OR: [
          { name: { contains: args.query } },
          { description: { contains: args.query } },
          { code: { contains: args.query } },
        ],
      };

      // Public users see only platform standards
      if (!context.user) {
        where.scope = LibraryScope.PLATFORM_STANDARD;
      } else if (args.scope) {
        where.scope = args.scope as LibraryScope;
        // If searching company custom, filter by user's company
        if (
          args.scope === LibraryScope.COMPANY_CUSTOM &&
          context.user.companyId
        ) {
          where.companyId = context.user.companyId;
        }
      }

      if (args.category) {
        where.category = args.category as LibraryCategory;
      }

      const items = await context.prisma.libraryItem.findMany({
        where,
        select: {
          id: true,
          name: true,
          category: true,
          code: true,
          scope: true,
        },
        take: args.limit || 10,
        orderBy: { name: "asc" },
      });

      return items;
    },
  })
);

/**
 * Suggest library item names for typeahead
 * ✅ Permission: Public
 */
builder.queryField("suggestLibraryItems", (t) =>
  t.field({
    type: "JSON",
    args: {
      partial: t.arg.string({ required: true }),
      category: t.arg.string(),
      limit: t.arg.int({ defaultValue: 5 }),
    },
    authScopes: { public: true },
    resolve: async (_root, args, context) => {
      const where: any = {
        isActive: true,
        name: { contains: args.partial },
        scope: LibraryScope.PLATFORM_STANDARD, // Only platform standards for suggestions
      };

      if (args.category) {
        where.category = args.category as LibraryCategory;
      }

      const items = await context.prisma.libraryItem.findMany({
        where,
        select: { name: true },
        take: args.limit || 5,
        orderBy: { name: "asc" },
      });

      return items.map((item) => item.name);
    },
  })
);

// ========================================
// CATEGORY QUERIES
// ========================================

// Categories replaced with unified Category system - see categoryQuery.ts
