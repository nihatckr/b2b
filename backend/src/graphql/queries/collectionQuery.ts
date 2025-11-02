/**
 * Collection Queries - PUBLIC BROWSING & FILTERING
 *
 * 🎯 Purpose: Public collection browsing and company-specific collection management
 *
 * 📋 Available Queries:
 * - collections: Public collection listing with filters (public)
 * - collection: Single collection by ID (public)
 * - featuredCollections: Featured collections showcase (public)
 * - collectionsByCompany: Company-specific collections (authenticated)
 * - collectionsCount: Count for pagination (public)
 *
 * 🔒 Security:
 * - Public queries: Open to all (isActive filter applied)
 * - Company queries: Authenticated users only
 * - No permission checks needed (read-only public data)
 *
 * 💡 Integration:
 * - Category system: Uses global standardized categories
 * - Library system: season, fit, trend, fabric, color relations
 * - RFQ system: Customer requests, manufacturer responses
 */

import builder from "../builder";

/**
 * Collection Filter Input
 * Used for filtering collection lists with various criteria
 */
const CollectionFilterInput = builder.inputType("CollectionFilterInput", {
  fields: (t) => ({
    search: t.string(), // Fulltext search (name, modelCode)
    featured: t.boolean(), // Featured collections only
    categoryId: t.int(), // Filter by global category
    seasonId: t.int(), // LibraryItem relation
    gender: t.string(), // WOMEN, MEN, GIRLS, BOYS, UNISEX
    isActive: t.boolean(), // Filter by active status
    minPrice: t.float(), // Minimum target price
    maxPrice: t.float(), // Maximum target price
    minMoq: t.int(), // Minimum order quantity
    maxMoq: t.int(), // Maximum order quantity
  }),
});

/**
 * Company Collection Filter Input
 * Extended filter for company-specific collection queries
 */
const CompanyCollectionFilterInput = builder.inputType(
  "CompanyCollectionFilterInput",
  {
    fields: (t) => ({
      companyId: t.int({ required: true }), // Company ID (required)
      search: t.string(), // Fulltext search (name, modelCode, description)
      seasonId: t.int(), // LibraryItem relation
      gender: t.string(), // WOMEN, MEN, GIRLS, BOYS, UNISEX
      categoryId: t.int(), // Filter by global category
      minPrice: t.float(), // Minimum target price
      maxPrice: t.float(), // Maximum target price
      minMoq: t.int(), // Minimum order quantity
      maxMoq: t.int(), // Maximum order quantity
    }),
  }
);

/**
 * Collection Sort Input
 * Sorting options for collection lists
 */
const CollectionSortInput = builder.inputType("CollectionSortInput", {
  fields: (t) => ({
    field: t.string(), // createdAt, updatedAt, likesCount, viewCount, targetPrice, name
    order: t.string(), // asc, desc
  }),
});

/**
 * Pagination Input
 * Standard pagination parameters
 */
const PaginationInput = builder.inputType("CollectionPaginationInput", {
  fields: (t) => ({
    skip: t.int(), // Offset
    take: t.int(), // Limit
  }),
});

// ========================================
// 1️⃣ PUBLIC COLLECTION QUERIES
// ========================================

/**
 * Get all collections
 * ✅ Input Type: CollectionFilterInput + PaginationInput + SortInput
 * ✅ Permission: Public (no auth required)
 * ✅ Scope: Active collections only
 */
builder.queryField("collections", (t) =>
  t.prismaField({
    type: ["Collection"],
    args: {
      filter: t.arg({ type: CollectionFilterInput }),
      pagination: t.arg({ type: PaginationInput }),
      sort: t.arg({ type: CollectionSortInput }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {
        isActive:
          args.filter?.isActive !== undefined ? args.filter.isActive : true,
      };

      if (args.filter?.search) {
        where.OR = [
          { name: { contains: args.filter.search, mode: "insensitive" } },
          { modelCode: { contains: args.filter.search, mode: "insensitive" } },
        ];
      }

      if (args.filter?.featured) {
        where.isFeatured = true;
      }

      if (args.filter?.categoryId) {
        where.categoryId = args.filter.categoryId;
      }

      if (args.filter?.seasonId) {
        where.seasonId = args.filter.seasonId;
      }

      if (args.filter?.gender) {
        where.gender = args.filter.gender;
      }

      // ✅ Price range filter
      if (
        args.filter?.minPrice !== undefined ||
        args.filter?.maxPrice !== undefined
      ) {
        where.targetPrice = {};
        if (args.filter?.minPrice !== undefined) {
          where.targetPrice.gte = args.filter.minPrice;
        }
        if (args.filter?.maxPrice !== undefined) {
          where.targetPrice.lte = args.filter.maxPrice;
        }
      }

      // ✅ MOQ range filter
      if (
        args.filter?.minMoq !== undefined ||
        args.filter?.maxMoq !== undefined
      ) {
        where.moq = {};
        if (args.filter?.minMoq !== undefined) {
          where.moq.gte = args.filter.minMoq;
        }
        if (args.filter?.maxMoq !== undefined) {
          where.moq.lte = args.filter.maxMoq;
        }
      }

      // ✅ Sorting logic
      let orderBy: any = { createdAt: "desc" }; // Default sort
      if (args.sort?.field && args.sort?.order) {
        const validFields = [
          "createdAt",
          "updatedAt",
          "likesCount",
          "viewCount",
          "targetPrice",
          "name",
        ];
        const validOrders = ["asc", "desc"];

        if (
          validFields.includes(args.sort.field) &&
          validOrders.includes(args.sort.order)
        ) {
          orderBy = { [args.sort.field]: args.sort.order };
        }
      }

      return context.prisma.collection.findMany({
        ...query,
        where,
        ...(args.pagination?.skip !== null &&
        args.pagination?.skip !== undefined
          ? { skip: args.pagination.skip }
          : {}),
        ...(args.pagination?.take !== null &&
        args.pagination?.take !== undefined
          ? { take: args.pagination.take }
          : {}),
        orderBy,
      });
    },
  })
);

/**
 * Get collection by ID
 * ✅ Input Type: id (required)
 * ✅ Permission: Public (no auth required)
 * ✅ Scope: Single collection lookup
 */
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

/**
 * Get featured collections
 * ✅ Input Type: PaginationInput + SortInput
 * ✅ Permission: Public (no auth required)
 * ✅ Scope: Featured & active collections, sorted by likes (default)
 */
builder.queryField("featuredCollections", (t) =>
  t.prismaField({
    type: ["Collection"],
    args: {
      pagination: t.arg({
        type: PaginationInput,
        defaultValue: { skip: 0, take: 10 },
      }),
      sort: t.arg({ type: CollectionSortInput }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context: any) => {
      // ✅ Sorting logic (default: likesCount desc)
      let orderBy: any = { likesCount: "desc" };
      if (args.sort?.field && args.sort?.order) {
        const validFields = [
          "createdAt",
          "updatedAt",
          "likesCount",
          "viewCount",
          "targetPrice",
          "name",
        ];
        const validOrders = ["asc", "desc"];

        if (
          validFields.includes(args.sort.field) &&
          validOrders.includes(args.sort.order)
        ) {
          orderBy = { [args.sort.field]: args.sort.order };
        }
      }

      return context.prisma.collection.findMany({
        ...query,
        where: { isActive: true, isFeatured: true },
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 10,
        orderBy,
      });
    },
  })
);

// ========================================
// 2️⃣ COMPANY-SPECIFIC QUERIES
// ========================================

/**
 * Get collections by company (for library integration)
 * ✅ Input Type: CompanyCollectionFilterInput + PaginationInput + SortInput
 * ✅ Permission: Authenticated users only
 * ✅ Scope: Company-specific collections with filters
 * ✅ Security: Users can only view their own company's collections (ADMIN can view all)
 */
builder.queryField("collectionsByCompany", (t) =>
  t.prismaField({
    type: ["Collection"],
    args: {
      filter: t.arg({ type: CompanyCollectionFilterInput, required: true }),
      pagination: t.arg({
        type: PaginationInput,
        defaultValue: { skip: 0, take: 20 },
      }),
      sort: t.arg({ type: CollectionSortInput }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      // ✅ Security: Company isolation check
      if (
        context.user?.role !== "ADMIN" &&
        args.filter.companyId !== context.user?.companyId
      ) {
        throw new Error(
          "Yalnızca kendi şirketinizin koleksiyonlarını görüntüleyebilirsiniz"
        );
      }

      const where: any = {
        companyId: args.filter.companyId,
        isActive: true,
      };

      if (args.filter.search) {
        where.OR = [
          { name: { contains: args.filter.search, mode: "insensitive" } },
          { modelCode: { contains: args.filter.search, mode: "insensitive" } },
          {
            description: { contains: args.filter.search, mode: "insensitive" },
          },
        ];
      }

      if (args.filter.seasonId) {
        where.seasonId = args.filter.seasonId;
      }

      if (args.filter.gender) {
        where.gender = args.filter.gender;
      }

      if (args.filter.categoryId) {
        where.categoryId = args.filter.categoryId;
      }

      // ✅ Price range filter
      if (
        args.filter.minPrice !== undefined ||
        args.filter.maxPrice !== undefined
      ) {
        where.targetPrice = {};
        if (args.filter.minPrice !== undefined) {
          where.targetPrice.gte = args.filter.minPrice;
        }
        if (args.filter.maxPrice !== undefined) {
          where.targetPrice.lte = args.filter.maxPrice;
        }
      }

      // ✅ MOQ range filter
      if (
        args.filter.minMoq !== undefined ||
        args.filter.maxMoq !== undefined
      ) {
        where.moq = {};
        if (args.filter.minMoq !== undefined) {
          where.moq.gte = args.filter.minMoq;
        }
        if (args.filter.maxMoq !== undefined) {
          where.moq.lte = args.filter.maxMoq;
        }
      }

      // ✅ Sorting logic
      let orderBy: any = { createdAt: "desc" }; // Default sort
      if (args.sort?.field && args.sort?.order) {
        const validFields = [
          "createdAt",
          "updatedAt",
          "likesCount",
          "viewCount",
          "targetPrice",
          "name",
        ];
        const validOrders = ["asc", "desc"];

        if (
          validFields.includes(args.sort.field) &&
          validOrders.includes(args.sort.order)
        ) {
          orderBy = { [args.sort.field]: args.sort.order };
        }
      }

      return context.prisma.collection.findMany({
        ...query,
        where,
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 20,
        orderBy,
      });
    },
  })
);

// ========================================
// 3️⃣ UTILITY QUERIES
// ========================================

/**
 * Collection Count Filter Input
 * Extended filter for count queries (includes companyId)
 */
const CollectionCountFilterInput = builder.inputType(
  "CollectionCountFilterInput",
  {
    fields: (t) => ({
      companyId: t.int(), // Optional company filter
      search: t.string(), // Fulltext search (name, modelCode, description)
      featured: t.boolean(), // Featured collections only
      seasonId: t.int(), // LibraryItem relation
      gender: t.string(), // WOMEN, MEN, GIRLS, BOYS, UNISEX
      categoryId: t.int(), // Filter by global category
      isActive: t.boolean(), // Filter by active status
      minPrice: t.float(), // Minimum target price
      maxPrice: t.float(), // Maximum target price
      minMoq: t.int(), // Minimum order quantity
      maxMoq: t.int(), // Maximum order quantity
    }),
  }
);

/**
 * Get collection count by filters (for pagination)
 * ✅ Input Type: CollectionCountFilterInput
 * ✅ Permission: Public (no auth required)
 * ✅ Scope: Count for pagination logic
 */
builder.queryField("collectionsCount", (t) =>
  t.field({
    type: "Int",
    args: {
      filter: t.arg({
        type: CollectionCountFilterInput,
        defaultValue: { isActive: true },
      }),
    },
    authScopes: { public: true },
    resolve: async (_root, args, context) => {
      const where: any = {};

      if (args.filter?.companyId) {
        where.companyId = args.filter.companyId;
      }

      if (
        args.filter?.isActive !== null &&
        args.filter?.isActive !== undefined
      ) {
        where.isActive = args.filter.isActive;
      }

      if (args.filter?.search) {
        where.OR = [
          { name: { contains: args.filter.search, mode: "insensitive" } },
          { modelCode: { contains: args.filter.search, mode: "insensitive" } },
          {
            description: { contains: args.filter.search, mode: "insensitive" },
          },
        ];
      }

      if (args.filter?.featured) {
        where.isFeatured = true;
      }

      if (args.filter?.seasonId) {
        where.seasonId = args.filter.seasonId;
      }

      if (args.filter?.gender) {
        where.gender = args.filter.gender;
      }

      if (args.filter?.categoryId) {
        where.categoryId = args.filter.categoryId;
      }

      // ✅ Price range filter
      if (
        args.filter?.minPrice !== undefined ||
        args.filter?.maxPrice !== undefined
      ) {
        where.targetPrice = {};
        if (args.filter?.minPrice !== undefined) {
          where.targetPrice.gte = args.filter.minPrice;
        }
        if (args.filter?.maxPrice !== undefined) {
          where.targetPrice.lte = args.filter.maxPrice;
        }
      }

      // ✅ MOQ range filter
      if (
        args.filter?.minMoq !== undefined ||
        args.filter?.maxMoq !== undefined
      ) {
        where.moq = {};
        if (args.filter?.minMoq !== undefined) {
          where.moq.gte = args.filter.minMoq;
        }
        if (args.filter?.maxMoq !== undefined) {
          where.moq.lte = args.filter.maxMoq;
        }
      }

      return context.prisma.collection.count({ where });
    },
  })
);
