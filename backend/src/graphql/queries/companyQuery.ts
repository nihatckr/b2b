/**
 * Company Queries - PUBLIC BROWSING & MANAGEMENT
 *
 * 🎯 Purpose: Public company directory and management queries
 *
 * 📋 Available Queries:
 *
 * PUBLIC QUERIES:
 * - companies: Public company listing with filters (public)
 * - company: Single company by ID (public)
 * - companiesCount: Count for pagination (public)
 *
 * USER-SPECIFIC:
 * - myCompany: Current user's company (authenticated)
 *
 * ANALYTICS (Admin):
 * - companyStats: Aggregate statistics (admin)
 * - companiesBySubscriptionPlan: Distribution by plan (admin)
 * - companiesByType: Distribution by type (admin)
 * - topCompaniesByUsage: Top companies by usage metrics (admin)
 *
 * SEARCH & AUTOCOMPLETE:
 * - searchCompanies: Fast search with autocomplete (public)
 * - suggestCompanies: Name suggestions for typeahead (public)
 *
 * GEOGRAPHIC:
 * - companiesNearLocation: Location-based search with radius (public)
 * - companiesByRegion: Companies in specific region (public)
 *
 * USAGE MONITORING (Admin):
 * - getUsageLimitsStatus: Single company usage status (admin/owner)
 * - companiesNearingLimits: Companies approaching limits (admin)
 *
 * 🔒 Security:
 * - Public queries: Open to all (isActive filter applied)
 * - myCompany: Authenticated users only (company owner/employee)
 * - Admin can view inactive companies
 * - Analytics queries: Admin only
 *
 * 💡 Integration:
 * - Subscription system: FREE, STARTER, PROFESSIONAL, ENTERPRISE, CUSTOM plans
 * - Company types: MANUFACTURER, BUYER, BOTH
 * - Public profile system with custom slugs
 */

import builder from "../builder";

/**
 * Company Filter Input
 * Used for filtering company lists with various criteria
 */
const CompanyFilterInput = builder.inputType("CompanyFilterInput", {
  fields: (t) => ({
    search: t.string(), // Fulltext search (name, email)
    type: t.string(), // MANUFACTURER, BUYER, BOTH
    isActive: t.boolean(), // Filter by active status (Admin only)
    city: t.string(), // Filter by city
    country: t.string(), // Filter by country
    subscriptionPlan: t.string(), // FREE, STARTER, PROFESSIONAL, ENTERPRISE, CUSTOM
    isPublicProfile: t.boolean(), // Only companies with public profiles
  }),
});

/**
 * Company Sort Input
 * Sorting options for company lists
 */
const CompanySortInput = builder.inputType("CompanySortInput", {
  fields: (t) => ({
    field: t.string(), // createdAt, updatedAt, name, currentUsers, currentSamples
    order: t.string(), // asc, desc
  }),
});

/**
 * Pagination Input
 * Standard pagination parameters
 */
const CompanyPaginationInput = builder.inputType("CompanyPaginationInput", {
  fields: (t) => ({
    skip: t.int(), // Offset
    take: t.int(), // Limit
  }),
});

// ========================================
// 1️⃣ PUBLIC COMPANY QUERIES
// ========================================

/**
 * Get all companies
 * ✅ Input Type: CompanyFilterInput + PaginationInput + SortInput
 * ✅ Permission: Public (no auth required)
 * ✅ Scope: Active companies only (Admin can see inactive)
 */
builder.queryField("companies", (t) =>
  t.prismaField({
    type: ["Company"],
    args: {
      filter: t.arg({ type: CompanyFilterInput }),
      pagination: t.arg({ type: CompanyPaginationInput }),
      sort: t.arg({ type: CompanySortInput }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {};

      // ✅ Active status filter (Admin can see inactive companies)
      if (args.filter?.isActive !== undefined) {
        if (context.user?.role === "ADMIN") {
          where.isActive = args.filter.isActive;
        } else {
          where.isActive = true; // Non-admins always see only active
        }
      } else {
        where.isActive = true; // Default: only active
      }

      // ✅ Fulltext search
      if (args.filter?.search) {
        where.OR = [
          { name: { contains: args.filter.search, mode: "insensitive" } },
          { email: { contains: args.filter.search, mode: "insensitive" } },
          {
            description: { contains: args.filter.search, mode: "insensitive" },
          },
        ];
      }

      // ✅ Type filter
      if (args.filter?.type) {
        where.type = args.filter.type;
      }

      // ✅ Location filters
      if (args.filter?.city) {
        where.city = { contains: args.filter.city, mode: "insensitive" };
      }

      if (args.filter?.country) {
        where.country = { contains: args.filter.country, mode: "insensitive" };
      }

      // ✅ Subscription filter (Admin only)
      if (args.filter?.subscriptionPlan && context.user?.role === "ADMIN") {
        where.subscriptionPlan = args.filter.subscriptionPlan;
      }

      // ✅ Public profile filter
      if (args.filter?.isPublicProfile !== undefined) {
        where.isPublicProfile = args.filter.isPublicProfile;
      }

      // ✅ Sorting logic
      let orderBy: any = { createdAt: "desc" }; // Default sort
      if (args.sort?.field && args.sort?.order) {
        const validFields = [
          "createdAt",
          "updatedAt",
          "name",
          "currentUsers",
          "currentSamples",
          "currentOrders",
          "currentCollections",
        ];
        const validOrders = ["asc", "desc"];

        if (
          validFields.includes(args.sort.field) &&
          validOrders.includes(args.sort.order)
        ) {
          orderBy = { [args.sort.field]: args.sort.order };
        }
      }

      return context.prisma.company.findMany({
        ...query,
        where,
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 20,
        orderBy,
      });
    },
  })
);

/**
 * Get company by ID
 * ✅ Input Type: id (required)
 * ✅ Permission: Public (no auth required)
 * ✅ Scope: Single company lookup
 */
builder.queryField("company", (t) =>
  t.prismaField({
    type: "Company",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      return context.prisma.company.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

// ========================================
// 2️⃣ USER-SPECIFIC QUERIES
// ========================================

/**
 * Get my company (for company owner/employee)
 * ✅ Input Type: None (uses context.user.companyId)
 * ✅ Permission: Authenticated employee/owner only
 * ✅ Scope: Current user's company
 */
builder.queryField("myCompany", (t) =>
  t.prismaField({
    type: "Company",
    nullable: true,
    authScopes: { employee: true, companyOwner: true },
    resolve: async (query, _root, _args, context) => {
      if (!context.user?.companyId) {
        return null;
      }

      const company = await context.prisma.company.findUnique({
        ...query,
        where: { id: context.user.companyId },
      });

      if (!company) {
        return null;
      }

      return company;
    },
  })
);

// ========================================
// 3️⃣ UTILITY QUERIES
// ========================================

/**
 * Company Count Filter Input
 * Extended filter for count queries
 */
const CompanyCountFilterInput = builder.inputType("CompanyCountFilterInput", {
  fields: (t) => ({
    search: t.string(), // Fulltext search
    type: t.string(), // MANUFACTURER, BUYER, BOTH
    isActive: t.boolean(), // Filter by active status
    city: t.string(), // Filter by city
    country: t.string(), // Filter by country
    subscriptionPlan: t.string(), // Subscription plan filter
    isPublicProfile: t.boolean(), // Public profile filter
  }),
});

/**
 * Get company count by filters (for pagination)
 * ✅ Input Type: CompanyCountFilterInput
 * ✅ Permission: Public (no auth required)
 * ✅ Scope: Count for pagination logic
 */
builder.queryField("companiesCount", (t) =>
  t.field({
    type: "Int",
    args: {
      filter: t.arg({
        type: CompanyCountFilterInput,
        defaultValue: { isActive: true },
      }),
    },
    authScopes: { public: true },
    resolve: async (_root, args, context) => {
      const where: any = {};

      // ✅ Active status filter (Admin can see inactive)
      if (args.filter?.isActive !== undefined) {
        if (context.user?.role === "ADMIN") {
          where.isActive = args.filter.isActive;
        } else {
          where.isActive = true;
        }
      } else {
        where.isActive = true;
      }

      // ✅ Fulltext search
      if (args.filter?.search) {
        where.OR = [
          { name: { contains: args.filter.search, mode: "insensitive" } },
          { email: { contains: args.filter.search, mode: "insensitive" } },
          {
            description: { contains: args.filter.search, mode: "insensitive" },
          },
        ];
      }

      // ✅ Type filter
      if (args.filter?.type) {
        where.type = args.filter.type;
      }

      // ✅ Location filters
      if (args.filter?.city) {
        where.city = { contains: args.filter.city, mode: "insensitive" };
      }

      if (args.filter?.country) {
        where.country = { contains: args.filter.country, mode: "insensitive" };
      }

      // ✅ Subscription filter (Admin only)
      if (args.filter?.subscriptionPlan && context.user?.role === "ADMIN") {
        where.subscriptionPlan = args.filter.subscriptionPlan;
      }

      // ✅ Public profile filter
      if (args.filter?.isPublicProfile !== undefined) {
        where.isPublicProfile = args.filter.isPublicProfile;
      }

      return context.prisma.company.count({ where });
    },
  })
);

// ========================================
// 4️⃣ ANALYTICS QUERIES (Admin Only)
// ========================================

/**
 * Get aggregate company statistics
 * ✅ Permission: Admin only
 * ✅ Input: Optional filter
 */
builder.queryField("companyStats", (t) =>
  t.field({
    type: "JSON",
    args: {
      filter: t.arg({ type: CompanyFilterInput }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const where: any = {};

      // Apply filters if provided
      if (args.filter?.isActive !== undefined) {
        where.isActive = args.filter.isActive;
      }
      if (args.filter?.type) {
        where.type = args.filter.type;
      }
      if (args.filter?.subscriptionPlan) {
        where.subscriptionPlan = args.filter.subscriptionPlan;
      }

      const [
        totalCompanies,
        activeCompanies,
        inactiveCompanies,
        manufacturersCount,
        buyersCount,
        bothTypeCount,
        aggregateStats,
      ] = await Promise.all([
        context.prisma.company.count({ where }),
        context.prisma.company.count({ where: { ...where, isActive: true } }),
        context.prisma.company.count({ where: { ...where, isActive: false } }),
        context.prisma.company.count({
          where: { ...where, type: "MANUFACTURER" },
        }),
        context.prisma.company.count({ where: { ...where, type: "BUYER" } }),
        context.prisma.company.count({ where: { ...where, type: "BOTH" } }),
        context.prisma.company.aggregate({
          where,
          _sum: {
            currentUsers: true,
            currentSamples: true,
            currentOrders: true,
          },
          _avg: {
            currentUsers: true,
            currentSamples: true,
            currentOrders: true,
          },
        }),
      ]);

      return {
        totalCompanies,
        activeCompanies,
        inactiveCompanies,
        manufacturersCount,
        buyersCount,
        bothTypeCount,
        averageUsers: aggregateStats._avg.currentUsers || 0,
        averageSamples: aggregateStats._avg.currentSamples || 0,
        averageOrders: aggregateStats._avg.currentOrders || 0,
        totalUsers: aggregateStats._sum.currentUsers || 0,
        totalSamples: aggregateStats._sum.currentSamples || 0,
        totalOrders: aggregateStats._sum.currentOrders || 0,
      };
    },
  })
);

/**
 * Get companies distribution by subscription plan
 * ✅ Permission: Admin only
 */
builder.queryField("companiesBySubscriptionPlan", (t) =>
  t.field({
    type: "JSON",
    authScopes: { admin: true },
    resolve: async (_root, _args, context) => {
      const totalCompanies = await context.prisma.company.count();

      const planCounts = await context.prisma.company.groupBy({
        by: ["subscriptionPlan"],
        _count: {
          subscriptionPlan: true,
        },
      });

      return planCounts.map((item) => ({
        plan: item.subscriptionPlan,
        count: item._count.subscriptionPlan,
        percentage:
          totalCompanies > 0
            ? (item._count.subscriptionPlan / totalCompanies) * 100
            : 0,
      }));
    },
  })
);

/**
 * Get companies distribution by type
 * ✅ Permission: Admin only
 */
builder.queryField("companiesByType", (t) =>
  t.field({
    type: "JSON",
    authScopes: { admin: true },
    resolve: async (_root, _args, context) => {
      const totalCompanies = await context.prisma.company.count();

      const typeCounts = await context.prisma.company.groupBy({
        by: ["type"],
        _count: {
          type: true,
        },
      });

      return typeCounts.map((item) => ({
        type: item.type,
        count: item._count.type,
        percentage:
          totalCompanies > 0 ? (item._count.type / totalCompanies) * 100 : 0,
      }));
    },
  })
);

/**
 * Get top companies by usage metrics
 * ✅ Permission: Admin only
 * ✅ Input: limit (default 10), sortBy (users, samples, orders, collections)
 */
builder.queryField("topCompaniesByUsage", (t) =>
  t.prismaField({
    type: ["Company"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      sortBy: t.arg.string({ defaultValue: "currentUsers" }), // users, samples, orders, collections
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const validSortFields = [
        "currentUsers",
        "currentSamples",
        "currentOrders",
        "currentCollections",
      ];
      const sortField = validSortFields.includes(args.sortBy || "")
        ? args.sortBy
        : "currentUsers";

      return context.prisma.company.findMany({
        ...query,
        where: { isActive: true },
        orderBy: { [sortField!]: "desc" },
        take: args.limit || 10,
      });
    },
  })
);

// ========================================
// 5️⃣ SEARCH & AUTOCOMPLETE QUERIES
// ========================================

/**
 * Fast search for companies (autocomplete/typeahead)
 * ✅ Permission: Public
 * ✅ Input: query (search string), limit (default 10)
 * ✅ Returns: Simplified company list with id, name, type, city, country
 */
builder.queryField("searchCompanies", (t) =>
  t.field({
    type: "JSON",
    args: {
      query: t.arg.string({ required: true }),
      limit: t.arg.int({ defaultValue: 10 }),
      type: t.arg.string(), // Optional: filter by MANUFACTURER, BUYER, BOTH
    },
    authScopes: { public: true },
    resolve: async (_root, args, context) => {
      const where: any = {
        isActive: true,
        OR: [
          { name: { contains: args.query, mode: "insensitive" } },
          { email: { contains: args.query, mode: "insensitive" } },
          { description: { contains: args.query, mode: "insensitive" } },
        ],
      };

      if (args.type) {
        where.type = args.type;
      }

      const companies = await context.prisma.company.findMany({
        where,
        select: {
          id: true,
          name: true,
          type: true,
          city: true,
          country: true,
          logo: true,
        },
        take: args.limit || 10,
        orderBy: { name: "asc" },
      });

      return companies;
    },
  })
);

/**
 * Suggest company names for typeahead
 * ✅ Permission: Public
 * ✅ Input: partial (partial name string)
 * ✅ Returns: Array of company names
 */
builder.queryField("suggestCompanies", (t) =>
  t.field({
    type: "JSON",
    args: {
      partial: t.arg.string({ required: true }),
      limit: t.arg.int({ defaultValue: 5 }),
    },
    authScopes: { public: true },
    resolve: async (_root, args, context) => {
      const companies = await context.prisma.company.findMany({
        where: {
          isActive: true,
          name: { contains: args.partial },
        },
        select: { name: true },
        take: args.limit || 5,
        orderBy: { name: "asc" },
      });

      return companies.map((c) => c.name);
    },
  })
);

// ========================================
// 6️⃣ GEOGRAPHIC QUERIES
// ========================================

/**
 * Find companies near a location
 * ✅ Permission: Public
 * ✅ Input: city/country filters (simplified - without lat/lng for now)
 * 💡 Future: Add PostGIS integration for real geo queries
 */
builder.queryField("companiesNearLocation", (t) =>
  t.prismaField({
    type: ["Company"],
    args: {
      city: t.arg.string(),
      country: t.arg.string(),
      limit: t.arg.int({ defaultValue: 20 }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const where: any = { isActive: true };

      if (args.city) {
        where.city = { contains: args.city, mode: "insensitive" };
      }

      if (args.country) {
        where.country = { contains: args.country, mode: "insensitive" };
      }

      return context.prisma.company.findMany({
        ...query,
        where,
        take: args.limit || 20,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

/**
 * Get companies by region (city or country)
 * ✅ Permission: Public
 * ✅ Returns: JSON with grouped companies by region
 */
builder.queryField("companiesByRegion", (t) =>
  t.field({
    type: "JSON",
    args: {
      groupBy: t.arg.string({ defaultValue: "country" }), // "city" or "country"
    },
    authScopes: { public: true },
    resolve: async (_root, args, context) => {
      const groupField = args.groupBy === "city" ? "city" : "country";

      const companies = await context.prisma.company.groupBy({
        by: [groupField as any],
        where: { isActive: true },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
      });

      return companies.map((item: any) => ({
        region: item[groupField],
        count: item._count.id,
      }));
    },
  })
);

// ========================================
// 7️⃣ USAGE MONITORING QUERIES (Admin/Owner)
// ========================================

/**
 * Get usage limits status for a company
 * ✅ Permission: Admin or Company Owner
 * ✅ Returns: Current usage vs limits with warnings
 */
builder.queryField("getUsageLimitsStatus", (t) =>
  t.field({
    type: "JSON",
    args: {
      companyId: t.arg.int({ required: true }),
    },
    authScopes: { admin: true, companyOwner: true },
    resolve: async (_root, args, context) => {
      // Authorization: Admin or company owner only
      if (
        context.user?.role !== "ADMIN" &&
        context.user?.companyId !== args.companyId
      ) {
        throw new Error("Bu şirketin kullanım bilgilerini görme yetkiniz yok");
      }

      const company = await context.prisma.company.findUnique({
        where: { id: args.companyId },
        select: {
          name: true,
          maxUsers: true,
          maxSamples: true,
          maxOrders: true,
          maxCollections: true,
          maxStorageGB: true,
          currentUsers: true,
          currentSamples: true,
          currentOrders: true,
          currentCollections: true,
          currentStorageGB: true,
        },
      });

      if (!company) {
        throw new Error("Şirket bulunamadı");
      }

      const calculateStatus = (current: number, max: number) => {
        const percentage = max > 0 ? (current / max) * 100 : 0;
        if (percentage >= 100) return "exceeded";
        if (percentage >= 90) return "critical";
        if (percentage >= 75) return "warning";
        return "ok";
      };

      return {
        companyName: company.name,
        users: {
          current: company.currentUsers,
          max: company.maxUsers,
          percentage:
            company.maxUsers > 0
              ? (company.currentUsers / company.maxUsers) * 100
              : 0,
          status: calculateStatus(company.currentUsers, company.maxUsers),
        },
        samples: {
          current: company.currentSamples,
          max: company.maxSamples,
          percentage:
            company.maxSamples > 0
              ? (company.currentSamples / company.maxSamples) * 100
              : 0,
          status: calculateStatus(company.currentSamples, company.maxSamples),
        },
        orders: {
          current: company.currentOrders,
          max: company.maxOrders,
          percentage:
            company.maxOrders > 0
              ? (company.currentOrders / company.maxOrders) * 100
              : 0,
          status: calculateStatus(company.currentOrders, company.maxOrders),
        },
        collections: {
          current: company.currentCollections,
          max: company.maxCollections,
          percentage:
            company.maxCollections > 0
              ? (company.currentCollections / company.maxCollections) * 100
              : 0,
          status: calculateStatus(
            company.currentCollections,
            company.maxCollections
          ),
        },
        storage: {
          current: company.currentStorageGB,
          max: company.maxStorageGB,
          percentage:
            company.maxStorageGB > 0
              ? (company.currentStorageGB / company.maxStorageGB) * 100
              : 0,
          status: calculateStatus(
            company.currentStorageGB,
            company.maxStorageGB
          ),
        },
      };
    },
  })
);

/**
 * Get companies nearing their usage limits
 * ✅ Permission: Admin only
 * ✅ Returns: Companies with usage >= 75%
 */
builder.queryField("companiesNearingLimits", (t) =>
  t.field({
    type: "JSON",
    args: {
      threshold: t.arg.int({ defaultValue: 75 }), // Percentage threshold
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const companies = await context.prisma.company.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionPlan: true,
          maxUsers: true,
          maxSamples: true,
          maxOrders: true,
          maxCollections: true,
          maxStorageGB: true,
          currentUsers: true,
          currentSamples: true,
          currentOrders: true,
          currentCollections: true,
          currentStorageGB: true,
        },
      });

      const threshold = args.threshold || 75;
      const nearingLimits = companies
        .map((company) => {
          const warnings: string[] = [];

          const checkLimit = (
            current: number,
            max: number,
            name: string
          ): boolean => {
            const percentage = max > 0 ? (current / max) * 100 : 0;
            if (percentage >= threshold) {
              warnings.push(`${name}: ${percentage.toFixed(0)}%`);
              return true;
            }
            return false;
          };

          const hasWarnings =
            checkLimit(company.currentUsers, company.maxUsers, "Users") ||
            checkLimit(company.currentSamples, company.maxSamples, "Samples") ||
            checkLimit(company.currentOrders, company.maxOrders, "Orders") ||
            checkLimit(
              company.currentCollections,
              company.maxCollections,
              "Collections"
            ) ||
            checkLimit(
              company.currentStorageGB,
              company.maxStorageGB,
              "Storage"
            );

          return hasWarnings
            ? {
                id: company.id,
                name: company.name,
                email: company.email,
                subscriptionPlan: company.subscriptionPlan,
                warnings,
              }
            : null;
        })
        .filter((c) => c !== null);

      return nearingLimits;
    },
  })
);
