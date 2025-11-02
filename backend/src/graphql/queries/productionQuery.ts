/**
 * Production Tracking Queries - PRODUCTION MANAGEMENT SYSTEM
 *
 * 🎯 Purpose: Production planning, tracking, and analytics
 *
 * 📋 Available Queries:
 *
 * STANDARD QUERIES:
 * - allProductionTracking: All productions with role-based filtering
 * - productionTracking: Single production by ID (permission-checked)
 * - myProductions: User's productions (customer or manufacturer role)
 * - pendingApprovals: Productions awaiting customer approval
 *
 * ANALYTICS (User/Admin):
 * - productionStats: Production statistics and metrics
 * - productionsByStage: Distribution by stage (planning, fabric, cutting, etc.)
 * - productionsByStatus: Distribution by status (in progress, completed, delayed)
 * - delayedProductions: Productions with delays
 * - overdueProductions: Productions past their deadline
 *
 * SEARCH & FILTER:
 * - searchProductions: Search in notes and related data
 * - getProductionsByDateRange: Productions within specific date range
 * - getProductionsByOrder: Production for specific order
 *
 * 🔒 Security:
 * - All queries require authentication
 * - Users see only their productions (customer or manufacturer role)
 * - Admin sees all productions
 *
 * 💡 Features:
 * - Stage tracking (PLANNING, FABRIC, CUTTING, SEWING, QUALITY, PACKAGING, SHIPPING)
 * - Status tracking (IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED, DELAYED)
 * - Plan approval workflow (DRAFT, PENDING, APPROVED, REJECTED, REVISION)
 * - Progress percentage calculation
 * - Delay tracking and reporting
 */

import builder from "../builder";

// ========================================
// INPUT TYPES
// ========================================

const ProductionFilterInput = builder.inputType("ProductionFilterInput", {
  fields: (t) => ({
    orderId: t.int(),
    sampleId: t.int(),
    currentStage: t.string(),
    overallStatus: t.string(),
    planStatus: t.string(),
    minProgress: t.int(),
    maxProgress: t.int(),
    startDate: t.string(),
    endDate: t.string(),
    hasDelay: t.boolean(),
  }),
});

const ProductionPaginationInput = builder.inputType(
  "ProductionPaginationInput",
  {
    fields: (t) => ({
      skip: t.int(),
      take: t.int(),
    }),
  }
);

const ProductionSearchInput = builder.inputType("ProductionSearchInput", {
  fields: (t) => ({
    query: t.string({ required: true }),
    currentStage: t.string(),
    overallStatus: t.string(),
    limit: t.int(),
  }),
});

const ProductionDateRangeInput = builder.inputType("ProductionDateRangeInput", {
  fields: (t) => ({
    startDate: t.string({ required: true }),
    endDate: t.string({ required: true }),
  }),
});

// ========================================
// STANDARD PRODUCTION QUERIES
// ========================================

// All Production Tracking
builder.queryField("allProductionTracking", (t) =>
  t.prismaField({
    type: ["ProductionTracking"],
    authScopes: { user: true },
    args: {
      filter: t.arg({ type: ProductionFilterInput, required: false }),
      pagination: t.arg({ type: ProductionPaginationInput, required: false }),
    },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      // Admin sees all, others see only their productions
      const where: any =
        context.user.role === "ADMIN"
          ? {}
          : {
              OR: [
                { order: { customerId: context.user.id } },
                { order: { manufactureId: context.user.id } },
                { sample: { customerId: context.user.id } },
                { sample: { manufactureId: context.user.id } },
              ],
            };

      // Apply filters
      if (args.filter?.orderId) where.orderId = args.filter.orderId;
      if (args.filter?.sampleId) where.sampleId = args.filter.sampleId;
      if (args.filter?.currentStage)
        where.currentStage = args.filter.currentStage;
      if (args.filter?.overallStatus)
        where.overallStatus = args.filter.overallStatus;
      if (args.filter?.planStatus) where.planStatus = args.filter.planStatus;
      if (args.filter?.minProgress || args.filter?.maxProgress) {
        where.progress = {};
        if (args.filter.minProgress)
          where.progress.gte = args.filter.minProgress;
        if (args.filter.maxProgress)
          where.progress.lte = args.filter.maxProgress;
      }
      if (args.filter?.startDate || args.filter?.endDate) {
        where.createdAt = {};
        if (args.filter.startDate)
          where.createdAt.gte = new Date(args.filter.startDate);
        if (args.filter.endDate)
          where.createdAt.lte = new Date(args.filter.endDate);
      }

      return context.prisma.productionTracking.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);

// Get Single Production Tracking
builder.queryField("productionTracking", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    nullable: true,
    args: { id: t.arg.int({ required: true }) },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const production = await context.prisma.productionTracking.findUnique({
        ...query,
        where: { id: args.id },
      });

      if (!production) {
        return null;
      }

      // Check authorization
      if (context.user?.role !== "ADMIN") {
        const order = production.orderId
          ? await context.prisma.order.findUnique({
              where: { id: production.orderId },
            })
          : null;
        const sample = production.sampleId
          ? await context.prisma.sample.findUnique({
              where: { id: production.sampleId },
            })
          : null;

        const hasAccess =
          (order &&
            (order.customerId === context.user?.id ||
              order.manufactureId === context.user?.id)) ||
          (sample &&
            (sample.customerId === context.user?.id ||
              sample.manufactureId === context.user?.id));

        if (!hasAccess) {
          throw new Error("Not authorized to view this production");
        }
      }

      return production;
    },
  })
);

// === QUERY: myProductions ===
/**
 * Returns current user's productions.
 * Customer sees productions for their orders, manufacturer sees their productions.
 */
builder.queryField("myProductions", (t) =>
  t.prismaField({
    type: ["ProductionTracking"],
    authScopes: { user: true },
    args: {
      pagination: t.arg({ type: ProductionPaginationInput, required: false }),
      filter: t.arg({ type: ProductionFilterInput, required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const where: any = {
        OR: [
          { order: { customerId: ctx.user.id } },
          { order: { manufactureId: ctx.user.id } },
          { sample: { customerId: ctx.user.id } },
          { sample: { manufactureId: ctx.user.id } },
        ],
      };

      // Apply filters
      if (args.filter?.currentStage)
        where.currentStage = args.filter.currentStage;
      if (args.filter?.overallStatus)
        where.overallStatus = args.filter.overallStatus;
      if (args.filter?.planStatus) where.planStatus = args.filter.planStatus;

      return ctx.prisma.productionTracking.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);

// === QUERY: pendingApprovals ===
/**
 * Returns productions awaiting customer approval.
 * Manufacturer sees pending approvals for their productions.
 */
builder.queryField("pendingApprovals", (t) =>
  t.prismaField({
    type: ["ProductionTracking"],
    authScopes: { user: true },
    args: {
      pagination: t.arg({ type: ProductionPaginationInput, required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const where: any = {
        planStatus: "PENDING",
      };

      // Manufacturer sees their pending approvals
      if (ctx.user.role !== "ADMIN") {
        where.OR = [
          { order: { manufactureId: ctx.user.id } },
          { sample: { manufactureId: ctx.user.id } },
        ];
      }

      return ctx.prisma.productionTracking.findMany({
        ...query,
        where,
        orderBy: { planSentAt: "desc" },
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);

// ========================================================
// === ANALYTICS QUERIES (Admin/Company insights) ===
// ========================================================

// === QUERY: productionStats ===
/**
 * Returns comprehensive production statistics.
 * Provides total counts, stage distribution, status breakdown.
 */
builder.queryField("productionStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    args: {
      filter: t.arg({ type: ProductionFilterInput, required: false }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const where: any = {};

      // Role-based filtering
      if (ctx.user.role !== "ADMIN") {
        where.OR = [
          { order: { customerId: ctx.user.id } },
          { order: { manufactureId: ctx.user.id } },
          { sample: { customerId: ctx.user.id } },
          { sample: { manufactureId: ctx.user.id } },
        ];
      }

      // Apply filters
      if (args.filter?.currentStage)
        where.currentStage = args.filter.currentStage;
      if (args.filter?.overallStatus)
        where.overallStatus = args.filter.overallStatus;
      if (args.filter?.startDate || args.filter?.endDate) {
        where.createdAt = {};
        if (args.filter.startDate)
          where.createdAt.gte = new Date(args.filter.startDate);
        if (args.filter.endDate)
          where.createdAt.lte = new Date(args.filter.endDate);
      }

      const [total, stageBreakdown, statusBreakdown, avgProgress] =
        await Promise.all([
          ctx.prisma.productionTracking.count({ where }),
          ctx.prisma.productionTracking.groupBy({
            by: ["currentStage"],
            where,
            _count: true,
          }),
          ctx.prisma.productionTracking.groupBy({
            by: ["overallStatus"],
            where,
            _count: true,
          }),
          ctx.prisma.productionTracking.aggregate({
            where,
            _avg: { progress: true },
          }),
        ]);

      return {
        total,
        averageProgress: avgProgress._avg.progress || 0,
        stageBreakdown: stageBreakdown.map((s) => ({
          stage: s.currentStage,
          count: s._count,
        })),
        statusBreakdown: statusBreakdown.map((s) => ({
          status: s.overallStatus,
          count: s._count,
        })),
      };
    },
  })
);

// === QUERY: productionsByStage ===
/**
 * Returns production count grouped by stage.
 */
builder.queryField("productionsByStage", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    args: {
      filter: t.arg({ type: ProductionFilterInput, required: false }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const where: any = {};

      // Role-based filtering
      if (ctx.user.role !== "ADMIN") {
        where.OR = [
          { order: { customerId: ctx.user.id } },
          { order: { manufactureId: ctx.user.id } },
        ];
      }

      if (args.filter?.overallStatus)
        where.overallStatus = args.filter.overallStatus;

      const result = await ctx.prisma.productionTracking.groupBy({
        by: ["currentStage"],
        where,
        _count: true,
      });

      return result.map((r) => ({
        stage: r.currentStage,
        count: r._count,
      }));
    },
  })
);

// === QUERY: productionsByStatus ===
/**
 * Returns production count grouped by status.
 */
builder.queryField("productionsByStatus", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    args: {
      filter: t.arg({ type: ProductionFilterInput, required: false }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const where: any = {};

      // Role-based filtering
      if (ctx.user.role !== "ADMIN") {
        where.OR = [
          { order: { customerId: ctx.user.id } },
          { order: { manufactureId: ctx.user.id } },
        ];
      }

      if (args.filter?.currentStage)
        where.currentStage = args.filter.currentStage;

      const result = await ctx.prisma.productionTracking.groupBy({
        by: ["overallStatus"],
        where,
        _count: true,
      });

      return result.map((r) => ({
        status: r.overallStatus,
        count: r._count,
      }));
    },
  })
);

// === QUERY: delayedProductions ===
/**
 * Returns productions with delays (actual end date > estimated end date).
 */
builder.queryField("delayedProductions", (t) =>
  t.prismaField({
    type: ["ProductionTracking"],
    authScopes: { user: true },
    args: {
      pagination: t.arg({ type: ProductionPaginationInput, required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const where: any = {
        overallStatus: "DELAYED",
      };

      // Role-based filtering
      if (ctx.user.role !== "ADMIN") {
        where.OR = [
          { order: { customerId: ctx.user.id } },
          { order: { manufactureId: ctx.user.id } },
        ];
      }

      return ctx.prisma.productionTracking.findMany({
        ...query,
        where,
        orderBy: { estimatedEndDate: "asc" },
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);

// === QUERY: overdueProductions ===
/**
 * Returns productions past their estimated end date.
 */
builder.queryField("overdueProductions", (t) =>
  t.prismaField({
    type: ["ProductionTracking"],
    authScopes: { user: true },
    args: {
      pagination: t.arg({ type: ProductionPaginationInput, required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const where: any = {
        estimatedEndDate: { lt: new Date() },
        overallStatus: { not: "COMPLETED" },
      };

      // Role-based filtering
      if (ctx.user.role !== "ADMIN") {
        where.OR = [
          { order: { customerId: ctx.user.id } },
          { order: { manufactureId: ctx.user.id } },
        ];
      }

      return ctx.prisma.productionTracking.findMany({
        ...query,
        where,
        orderBy: { estimatedEndDate: "asc" },
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);

// ========================================================
// === SEARCH & FILTER QUERIES ===
// ========================================================

// === QUERY: searchProductions ===
/**
 * Searches productions by notes or related data.
 */
builder.queryField("searchProductions", (t) =>
  t.prismaField({
    type: ["ProductionTracking"],
    authScopes: { user: true },
    args: {
      search: t.arg({ type: ProductionSearchInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const where: any = {};

      // Search in notes
      if (args.search.query) {
        where.OR = [
          { notes: { contains: args.search.query, mode: "insensitive" } },
          {
            customerNote: { contains: args.search.query, mode: "insensitive" },
          },
        ];
      }

      // Apply filters
      if (args.search.currentStage)
        where.currentStage = args.search.currentStage;
      if (args.search.overallStatus)
        where.overallStatus = args.search.overallStatus;

      // Role-based filtering
      if (ctx.user.role !== "ADMIN") {
        where.AND = {
          OR: [
            { order: { customerId: ctx.user.id } },
            { order: { manufactureId: ctx.user.id } },
          ],
        };
      }

      return ctx.prisma.productionTracking.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
        take: args.search.limit || 20,
      });
    },
  })
);

// === QUERY: getProductionsByDateRange ===
/**
 * Returns productions within a specific date range.
 */
builder.queryField("getProductionsByDateRange", (t) =>
  t.prismaField({
    type: ["ProductionTracking"],
    authScopes: { user: true },
    args: {
      dateRange: t.arg({ type: ProductionDateRangeInput, required: true }),
      pagination: t.arg({ type: ProductionPaginationInput, required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const where: any = {
        createdAt: {
          gte: new Date(args.dateRange.startDate),
          lte: new Date(args.dateRange.endDate),
        },
      };

      // Role-based filtering
      if (ctx.user.role !== "ADMIN") {
        where.OR = [
          { order: { customerId: ctx.user.id } },
          { order: { manufactureId: ctx.user.id } },
        ];
      }

      return ctx.prisma.productionTracking.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);

// === QUERY: getProductionsByOrder ===
/**
 * Returns production for a specific order.
 */
builder.queryField("getProductionByOrder", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    nullable: true,
    authScopes: { user: true },
    args: {
      orderId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      // Verify order access
      const order = await ctx.prisma.order.findUnique({
        where: { id: args.orderId },
        select: {
          customerId: true,
          manufactureId: true,
        },
      });

      if (!order) throw new Error("Order not found");

      // Check authorization
      const isAuthorized =
        ctx.user.id === order.customerId ||
        ctx.user.id === order.manufactureId ||
        ctx.user.role === "ADMIN";

      if (!isAuthorized)
        throw new Error("Not authorized to view this production");

      return ctx.prisma.productionTracking.findUnique({
        ...query,
        where: { orderId: args.orderId },
      });
    },
  })
);
