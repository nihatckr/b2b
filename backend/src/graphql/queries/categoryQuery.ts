/**
 * Category Queries - STANDARDIZED GLOBAL SYSTEM
 *
 * 🎯 Purpose: Public category browsing and filtering
 * - All users can view categories (public access)
 * - Categories are managed only by ADMIN (see categoryMutation.ts)
 * - Global standardized categories shared across all companies
 *
 * 📋 Available Queries:
 * 1. categories - Full list with filters and pagination
 * 2. categoriesCount - Total count with filters
 * 3. category - Single category by ID
 * 4. allCategories - Alias for categories (backward compatibility)
 * 5. rootCategories - Top-level categories only
 * 6. categoryTree - Nested structure with children
 * 7. categoriesByLevel - Filter by level (ROOT, MAIN, SUB, DETAIL)
 *
 * 🔒 Security: All queries are public (no authentication required)
 */

import builder from "../builder";
import { CategoryLevel } from "../enums/CategoryLevel";

// ========================================
// INPUT TYPES
// ========================================

/**
 * Category Filter Input
 * Used for filtering categories by multiple criteria
 */
const CategoryFilterInput = builder.inputType("CategoryFilterInput", {
  fields: (t) => ({
    search: t.string(), // Fulltext search (name, description, keywords, tags)
    level: t.field({ type: CategoryLevel }), // ROOT | MAIN | SUB | DETAIL
    parentId: t.int(), // Filter by parent category
    isActive: t.boolean(), // Active/inactive status
    isPublic: t.boolean(), // Public visibility
  }),
});

/**
 * Pagination Input
 * Standard pagination for list queries
 */
const PaginationInput = builder.inputType("PaginationInput", {
  fields: (t) => ({
    skip: t.int(), // Offset
    take: t.int(), // Limit
  }),
});

// ========================================
// QUERIES (Using InputTypes)
// ========================================

// Get all categories with filters
builder.queryField("categories", (t) =>
  t.prismaField({
    type: ["Category"],
    args: {
      filter: t.arg({ type: CategoryFilterInput }),
      pagination: t.arg({ type: PaginationInput }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {};

      if (args.filter) {
        // Search: Fulltext search across multiple fields
        if (args.filter.search) {
          where.OR = [
            { name: { contains: args.filter.search, mode: "insensitive" } },
            {
              description: {
                contains: args.filter.search,
                mode: "insensitive",
              },
            },
            {
              keywords: { contains: args.filter.search, mode: "insensitive" },
            },
            { tags: { contains: args.filter.search, mode: "insensitive" } },
          ];
        }

        // Level filter
        if (args.filter.level !== null && args.filter.level !== undefined) {
          where.level = args.filter.level;
        }

        // Parent filter
        if (
          args.filter.parentId !== null &&
          args.filter.parentId !== undefined
        ) {
          where.parentId = args.filter.parentId;
        }

        // Active status filter
        if (
          args.filter.isActive !== null &&
          args.filter.isActive !== undefined
        ) {
          where.isActive = args.filter.isActive;
        }

        // Public status filter
        if (
          args.filter.isPublic !== null &&
          args.filter.isPublic !== undefined
        ) {
          where.isPublic = args.filter.isPublic;
        }
      }

      return context.prisma.category.findMany({
        ...query,
        where,
        orderBy: { order: "asc" },
        ...(args.pagination?.skip !== null &&
        args.pagination?.skip !== undefined
          ? { skip: args.pagination.skip }
          : {}),
        ...(args.pagination?.take !== null &&
        args.pagination?.take !== undefined
          ? { take: args.pagination.take }
          : {}),
      });
    },
  })
);

// Get total category count with filters
builder.queryField("categoriesCount", (t) =>
  t.field({
    type: "Int",
    args: {
      filter: t.arg({ type: CategoryFilterInput }),
    },
    authScopes: { public: true },
    resolve: async (_root, args, context) => {
      const where: any = {};

      if (args.filter) {
        // Search with extended fields
        if (args.filter.search) {
          where.OR = [
            { name: { contains: args.filter.search, mode: "insensitive" } },
            {
              description: {
                contains: args.filter.search,
                mode: "insensitive",
              },
            },
            {
              keywords: { contains: args.filter.search, mode: "insensitive" },
            },
            { tags: { contains: args.filter.search, mode: "insensitive" } },
          ];
        }

        // Additional filters
        if (args.filter.level !== null && args.filter.level !== undefined) {
          where.level = args.filter.level;
        }
        if (
          args.filter.parentId !== null &&
          args.filter.parentId !== undefined
        ) {
          where.parentId = args.filter.parentId;
        }
        if (
          args.filter.isActive !== null &&
          args.filter.isActive !== undefined
        ) {
          where.isActive = args.filter.isActive;
        }
        if (
          args.filter.isPublic !== null &&
          args.filter.isPublic !== undefined
        ) {
          where.isPublic = args.filter.isPublic;
        }
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

// Alias for categories (backward compatibility)
builder.queryField("allCategories", (t) =>
  t.prismaField({
    type: ["Category"],
    args: {
      filter: t.arg({ type: CategoryFilterInput }),
      pagination: t.arg({ type: PaginationInput }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {};

      if (args.filter) {
        // Search with extended fields
        if (args.filter.search) {
          where.OR = [
            { name: { contains: args.filter.search, mode: "insensitive" } },
            {
              description: {
                contains: args.filter.search,
                mode: "insensitive",
              },
            },
            {
              keywords: { contains: args.filter.search, mode: "insensitive" },
            },
            { tags: { contains: args.filter.search, mode: "insensitive" } },
          ];
        }

        // Additional filters
        if (args.filter.level !== null && args.filter.level !== undefined) {
          where.level = args.filter.level;
        }
        if (
          args.filter.parentId !== null &&
          args.filter.parentId !== undefined
        ) {
          where.parentId = args.filter.parentId;
        }
        if (
          args.filter.isActive !== null &&
          args.filter.isActive !== undefined
        ) {
          where.isActive = args.filter.isActive;
        }
        if (
          args.filter.isPublic !== null &&
          args.filter.isPublic !== undefined
        ) {
          where.isPublic = args.filter.isPublic;
        }
      }

      return context.prisma.category.findMany({
        ...query,
        where,
        orderBy: { order: "asc" },
        ...(args.pagination?.skip !== null &&
        args.pagination?.skip !== undefined
          ? { skip: args.pagination.skip }
          : {}),
        ...(args.pagination?.take !== null &&
        args.pagination?.take !== undefined
          ? { take: args.pagination.take }
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
        where: { parentId: null },
        orderBy: { name: "asc" },
      });
    },
  })
);

// Get category tree (all categories with nested structure)
builder.queryField("categoryTree", (t) =>
  t.field({
    type: "JSON",
    args: {
      isActive: t.arg.boolean(), // ✅ Filter by active status
    },
    authScopes: { public: true },
    resolve: async (_root: any, args: any, context: any) => {
      const where: any = { parentId: null };

      // ✅ Filter by active status if provided
      if (args.isActive !== null && args.isActive !== undefined) {
        where.isActive = args.isActive;
      }

      const rootCategories = await context.prisma.category.findMany({
        where,
        include: {
          subCategories: {
            include: { subCategories: true },
            orderBy: { order: "asc" }, // ✅ Order subcategories
          },
        },
        orderBy: { order: "asc" }, // ✅ Order root categories
      });

      return rootCategories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        level: cat.level,
        icon: cat.icon,
        image: cat.image,
        order: cat.order,
        isActive: cat.isActive,
        children: cat.subCategories.map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          description: sub.description,
          level: sub.level,
          icon: sub.icon,
          image: sub.image,
          order: sub.order,
          isActive: sub.isActive,
          children: sub.subCategories.map((child: any) => ({
            id: child.id,
            name: child.name,
            description: child.description,
            level: child.level,
            icon: child.icon,
            image: child.image,
            order: child.order,
            isActive: child.isActive,
          })),
        })),
      }));
    },
  })
);

// Get categories by specific level
builder.queryField("categoriesByLevel", (t) =>
  t.prismaField({
    type: ["Category"],
    args: {
      level: t.arg({ type: CategoryLevel, required: true }),
      isActive: t.arg.boolean(),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const where: any = { level: args.level };

      if (args.isActive !== null && args.isActive !== undefined) {
        where.isActive = args.isActive;
      }

      return context.prisma.category.findMany({
        ...query,
        where,
        orderBy: { order: "asc" },
      });
    },
  })
);
