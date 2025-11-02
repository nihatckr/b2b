/**
 * Payment Queries - PAYMENT MANAGEMENT SYSTEM
 *
 * 🎯 Purpose: Payment lifecycle tracking and analytics
 *
 * 📋 Available Queries:
 *
 * STANDARD QUERIES:
 * - orderPayments: All payments for an order (role-based access)
 * - payment: Single payment by ID (permission-checked)
 * - pendingPayments: Pending receipts for manufacturer review
 * - myPaymentsDue: Customer's due payments
 *
 * ANALYTICS (User/Admin):
 * - paymentStats: User's or company's payment statistics
 * - paymentsByStatus: Distribution by status (pending, confirmed, rejected)
 * - paymentsByType: Distribution by type (deposit, progress, balance, full)
 * - overduePayments: Overdue payments report
 *
 * SEARCH & FILTER:
 * - searchPayments: Search in transaction details
 * - getPaymentsByDateRange: Payments within specific date range
 * - getPaymentsByOrder: All payments for specific order
 *
 * 🔒 Security:
 * - All queries require authentication
 * - Users see only their payments (customer or manufacturer role)
 * - Admin sees all payments
 *
 * 💡 Features:
 * - Payment type tracking (DEPOSIT, PROGRESS, BALANCE, FULL)
 * - Status tracking (PENDING, RECEIPT_UPLOADED, CONFIRMED, REJECTED, OVERDUE, CANCELLED)
 * - Method tracking (BANK_TRANSFER, WIRE_TRANSFER, CHECK, CASH, OTHER)
 * - Receipt upload and verification
 * - Due date monitoring
 */

import builder from "../builder";

// ========================================
// INPUT TYPES
// ========================================

const PaymentFilterInput = builder.inputType("PaymentFilterInput", {
  fields: (t) => ({
    orderId: t.int(),
    status: t.string(),
    type: t.string(),
    method: t.string(),
    minAmount: t.float(),
    maxAmount: t.float(),
    startDate: t.string(),
    endDate: t.string(),
  }),
});

const PaymentPaginationInput = builder.inputType("PaymentPaginationInput", {
  fields: (t) => ({
    skip: t.int(),
    take: t.int(),
  }),
});

const PaymentSearchInput = builder.inputType("PaymentSearchInput", {
  fields: (t) => ({
    query: t.string({ required: true }),
    status: t.string(),
    type: t.string(),
    limit: t.int(),
  }),
});

const PaymentDateRangeInput = builder.inputType("PaymentDateRangeInput", {
  fields: (t) => ({
    startDate: t.string({ required: true }),
    endDate: t.string({ required: true }),
  }),
});

// ========================================
// STANDARD PAYMENT QUERIES
// ========================================

builder.queryField("orderPayments", (t) =>
  t.prismaField({
    type: ["Payment"],
    description: "Get all payments for a specific order",
    args: {
      orderId: t.arg.int({ required: true }),
      filter: t.arg({ type: PaymentFilterInput }),
      pagination: t.arg({ type: PaymentPaginationInput }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const order = await ctx.prisma.order.findUnique({
        where: { id: args.orderId },
        select: { customerId: true, manufactureId: true },
      });

      if (!order) throw new Error("Order not found");

      // Only customer or manufacturer can view payments
      const isAuthorized =
        ctx.user.id === order.customerId ||
        ctx.user.id === order.manufactureId ||
        ctx.user.role === "ADMIN";

      if (!isAuthorized) throw new Error("Not authorized to view payments");

      const where: any = { orderId: args.orderId };

      // Apply filters
      if (args.filter?.status) where.status = args.filter.status;
      if (args.filter?.type) where.type = args.filter.type;
      if (args.filter?.method) where.method = args.filter.method;
      if (args.filter?.minAmount || args.filter?.maxAmount) {
        where.amount = {};
        if (args.filter.minAmount) where.amount.gte = args.filter.minAmount;
        if (args.filter.maxAmount) where.amount.lte = args.filter.maxAmount;
      }
      if (args.filter?.startDate || args.filter?.endDate) {
        where.createdAt = {};
        if (args.filter.startDate)
          where.createdAt.gte = new Date(args.filter.startDate);
        if (args.filter.endDate)
          where.createdAt.lte = new Date(args.filter.endDate);
      }

      return ctx.prisma.payment.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);

builder.queryField("payment", (t) =>
  t.prismaField({
    type: "Payment",
    nullable: true,
    description: "Get a specific payment by ID",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const payment = await ctx.prisma.payment.findUnique({
        where: { id: args.id },
        include: {
          order: {
            select: { customerId: true, manufactureId: true },
          },
        },
      });

      if (!payment) return null;

      // Only customer or manufacturer can view payment
      const isAuthorized =
        ctx.user.id === payment.order.customerId ||
        ctx.user.id === payment.order.manufactureId ||
        ctx.user.role === "ADMIN";

      if (!isAuthorized) throw new Error("Not authorized to view payment");

      return ctx.prisma.payment.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

builder.queryField("pendingPayments", (t) =>
  t.prismaField({
    type: ["Payment"],
    description: "Get pending payments (for manufacturers to review receipts)",
    authScopes: { user: true },
    args: {
      pagination: t.arg({ type: PaymentPaginationInput, required: false }),
      filter: t.arg({ type: PaymentFilterInput, required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) throw new Error("Unauthorized");

      // Only manufacturers can see pending payments
      const orders = await ctx.prisma.order.findMany({
        where: { manufactureId: ctx.user.id },
        select: { id: true },
      });

      const orderIds = orders.map((o) => o.id);

      const where: any = {
        orderId: { in: orderIds },
        status: "RECEIPT_UPLOADED",
      };

      // Apply additional filters
      if (args.filter?.type) where.type = args.filter.type;
      if (args.filter?.method) where.method = args.filter.method;
      if (args.filter?.startDate || args.filter?.endDate) {
        where.createdAt = {};
        if (args.filter.startDate)
          where.createdAt.gte = new Date(args.filter.startDate);
        if (args.filter.endDate)
          where.createdAt.lte = new Date(args.filter.endDate);
      }

      return ctx.prisma.payment.findMany({
        ...query,
        where,
        orderBy: { receiptUploadedAt: "desc" },
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);

builder.queryField("myPaymentsDue", (t) =>
  t.prismaField({
    type: ["Payment"],
    description: "Get payments due for current user (customer perspective)",
    authScopes: { user: true },
    args: {
      pagination: t.arg({ type: PaymentPaginationInput, required: false }),
      filter: t.arg({ type: PaymentFilterInput, required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) throw new Error("Unauthorized");

      // Get customer's orders
      const orders = await ctx.prisma.order.findMany({
        where: { customerId: ctx.user.id },
        select: { id: true },
      });

      const orderIds = orders.map((o) => o.id);

      const where: any = {
        orderId: { in: orderIds },
        status: { in: ["PENDING", "REJECTED", "OVERDUE"] },
      };

      // Apply additional filters
      if (args.filter?.type) where.type = args.filter.type;
      if (args.filter?.method) where.method = args.filter.method;
      if (args.filter?.status) {
        where.status = args.filter.status;
      }
      if (args.filter?.startDate || args.filter?.endDate) {
        where.dueDate = {};
        if (args.filter.startDate)
          where.dueDate.gte = new Date(args.filter.startDate);
        if (args.filter.endDate)
          where.dueDate.lte = new Date(args.filter.endDate);
      }

      return ctx.prisma.payment.findMany({
        ...query,
        where,
        orderBy: [{ status: "desc" }, { dueDate: "asc" }],
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);

// ========================================================
// === ANALYTICS QUERIES (Admin/Company insights) ===
// ========================================================

// === QUERY: paymentStats ===
/**
 * Returns comprehensive payment statistics.
 * Provides total counts, amount aggregations, status breakdown.
 * Admin sees all, users see only their company's payments.
 */
builder.queryField("paymentStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    args: {
      filter: t.arg({ type: PaymentFilterInput, required: false }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const where: any = {};

      // Role-based filtering
      if (ctx.user.role === "MANUFACTURER") {
        where.order = {
          manufacturerCompanyId: ctx.user.companyId,
        };
      } else if (ctx.user.role === "BUYER") {
        where.order = {
          buyerCompanyId: ctx.user.companyId,
        };
      }

      // Apply filters
      if (args.filter?.status) where.status = args.filter.status;
      if (args.filter?.type) where.type = args.filter.type;
      if (args.filter?.method) where.method = args.filter.method;
      if (args.filter?.orderId) where.orderId = args.filter.orderId;
      if (args.filter?.startDate || args.filter?.endDate) {
        where.createdAt = {};
        if (args.filter.startDate)
          where.createdAt.gte = new Date(args.filter.startDate);
        if (args.filter.endDate)
          where.createdAt.lte = new Date(args.filter.endDate);
      }

      const [total, totalAmount, statusBreakdown, typeBreakdown] =
        await Promise.all([
          ctx.prisma.payment.count({ where }),
          ctx.prisma.payment.aggregate({
            where,
            _sum: { amount: true },
          }),
          ctx.prisma.payment.groupBy({
            by: ["status"],
            where,
            _count: true,
            _sum: { amount: true },
          }),
          ctx.prisma.payment.groupBy({
            by: ["type"],
            where,
            _count: true,
            _sum: { amount: true },
          }),
        ]);

      return {
        total,
        totalAmount: totalAmount._sum.amount || 0,
        statusBreakdown: statusBreakdown.map((s) => ({
          status: s.status,
          count: s._count,
          totalAmount: s._sum.amount || 0,
        })),
        typeBreakdown: typeBreakdown.map((t) => ({
          type: t.type,
          count: t._count,
          totalAmount: t._sum.amount || 0,
        })),
      };
    },
  })
);

// === QUERY: paymentsByStatus ===
/**
 * Returns payment count and amount aggregations grouped by status.
 * Useful for dashboard visualizations (pie charts, status badges).
 */
builder.queryField("paymentsByStatus", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    args: {
      filter: t.arg({ type: PaymentFilterInput, required: false }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const where: any = {};

      // Role-based filtering
      if (ctx.user.role === "MANUFACTURER") {
        where.order = {
          manufacturerCompanyId: ctx.user.companyId,
        };
      } else if (ctx.user.role === "BUYER") {
        where.order = {
          buyerCompanyId: ctx.user.companyId,
        };
      }

      // Apply filters
      if (args.filter?.type) where.type = args.filter.type;
      if (args.filter?.method) where.method = args.filter.method;
      if (args.filter?.orderId) where.orderId = args.filter.orderId;
      if (args.filter?.startDate || args.filter?.endDate) {
        where.createdAt = {};
        if (args.filter.startDate)
          where.createdAt.gte = new Date(args.filter.startDate);
        if (args.filter.endDate)
          where.createdAt.lte = new Date(args.filter.endDate);
      }

      const result = await ctx.prisma.payment.groupBy({
        by: ["status"],
        where,
        _count: true,
        _sum: { amount: true },
      });

      return result.map((r) => ({
        status: r.status,
        count: r._count,
        totalAmount: r._sum.amount || 0,
      }));
    },
  })
);

// === QUERY: paymentsByType ===
/**
 * Returns payment count and amount aggregations grouped by type.
 * Shows breakdown of DEPOSIT, PROGRESS, BALANCE, FULL payments.
 */
builder.queryField("paymentsByType", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    args: {
      filter: t.arg({ type: PaymentFilterInput, required: false }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const where: any = {};

      // Role-based filtering
      if (ctx.user.role === "MANUFACTURER") {
        where.order = {
          manufacturerCompanyId: ctx.user.companyId,
        };
      } else if (ctx.user.role === "BUYER") {
        where.order = {
          buyerCompanyId: ctx.user.companyId,
        };
      }

      // Apply filters
      if (args.filter?.status) where.status = args.filter.status;
      if (args.filter?.method) where.method = args.filter.method;
      if (args.filter?.orderId) where.orderId = args.filter.orderId;
      if (args.filter?.startDate || args.filter?.endDate) {
        where.createdAt = {};
        if (args.filter.startDate)
          where.createdAt.gte = new Date(args.filter.startDate);
        if (args.filter.endDate)
          where.createdAt.lte = new Date(args.filter.endDate);
      }

      const result = await ctx.prisma.payment.groupBy({
        by: ["type"],
        where,
        _count: true,
        _sum: { amount: true },
      });

      return result.map((r) => ({
        type: r.type,
        count: r._count,
        totalAmount: r._sum.amount || 0,
      }));
    },
  })
);

// === QUERY: overduePayments ===
/**
 * Returns payments that are overdue or past their due date.
 * Critical for tracking payment delays and follow-ups.
 */
builder.queryField("overduePayments", (t) =>
  t.prismaField({
    type: ["Payment"],
    authScopes: { user: true },
    args: {
      pagination: t.arg({ type: PaymentPaginationInput, required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const where: any = {
        OR: [
          { status: "OVERDUE" },
          {
            status: "PENDING",
            dueDate: { lt: new Date() },
          },
        ],
      };

      // Role-based filtering
      if (ctx.user.role === "MANUFACTURER") {
        where.order = {
          manufacturerCompanyId: ctx.user.companyId,
        };
      } else if (ctx.user.role === "BUYER") {
        where.order = {
          buyerCompanyId: ctx.user.companyId,
        };
      }

      return ctx.prisma.payment.findMany({
        ...query,
        where,
        orderBy: { dueDate: "asc" },
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);

// ========================================================
// === SEARCH & FILTER QUERIES ===
// ========================================================

// === QUERY: searchPayments ===
/**
 * Searches payments by description, notes, or related order information.
 * Supports full-text search with role-based filtering.
 */
builder.queryField("searchPayments", (t) =>
  t.prismaField({
    type: ["Payment"],
    authScopes: { user: true },
    args: {
      search: t.arg({ type: PaymentSearchInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const where: any = {};

      // Search in description and notes
      if (args.search.query) {
        where.OR = [
          { description: { contains: args.search.query, mode: "insensitive" } },
          { notes: { contains: args.search.query, mode: "insensitive" } },
        ];
      }

      // Apply filters
      if (args.search.status) where.status = args.search.status;
      if (args.search.type) where.type = args.search.type;

      // Role-based filtering
      if (ctx.user.role === "MANUFACTURER") {
        where.order = {
          manufacturerCompanyId: ctx.user.companyId,
        };
      } else if (ctx.user.role === "BUYER") {
        where.order = {
          buyerCompanyId: ctx.user.companyId,
        };
      }

      return ctx.prisma.payment.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
        take: args.search.limit || 20,
      });
    },
  })
);

// === QUERY: getPaymentsByDateRange ===
/**
 * Returns payments within a specific date range.
 * Useful for financial reporting and period-based analytics.
 */
builder.queryField("getPaymentsByDateRange", (t) =>
  t.prismaField({
    type: ["Payment"],
    authScopes: { user: true },
    args: {
      dateRange: t.arg({ type: PaymentDateRangeInput, required: true }),
      pagination: t.arg({ type: PaymentPaginationInput, required: false }),
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
      if (ctx.user.role === "MANUFACTURER") {
        where.order = {
          manufacturerCompanyId: ctx.user.companyId,
        };
      } else if (ctx.user.role === "BUYER") {
        where.order = {
          buyerCompanyId: ctx.user.companyId,
        };
      }

      return ctx.prisma.payment.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);

// === QUERY: getPaymentsByOrder ===
/**
 * Returns all payments for a specific order with full details.
 * Includes complete payment history and timeline.
 */
builder.queryField("getPaymentsByOrder", (t) =>
  t.prismaField({
    type: ["Payment"],
    authScopes: { user: true },
    args: {
      orderId: t.arg.int({ required: true }),
      status: t.arg.string({ required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      // Verify order access
      const order = await ctx.prisma.order.findUnique({
        where: { id: args.orderId },
        select: {
          customerId: true,
          manufactureId: true,
          companyId: true,
        },
      });

      if (!order) throw new Error("Order not found");

      // Check authorization
      const isAuthorized =
        ctx.user.id === order.customerId ||
        ctx.user.id === order.manufactureId ||
        ctx.user.companyId === order.companyId ||
        ctx.user.role === "ADMIN";

      if (!isAuthorized) throw new Error("Not authorized to view payments");

      const where: any = { orderId: args.orderId };
      if (args.status) where.status = args.status;

      return ctx.prisma.payment.findMany({
        ...query,
        where,
        orderBy: { createdAt: "asc" },
      });
    },
  })
);
