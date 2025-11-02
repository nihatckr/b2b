/**
 * Order Queries - ORDER MANAGEMENT SYSTEM
 *
 * 🎯 Purpose: Order lifecycle management and analytics
 *
 * 📋 Available Queries:
 *
 * STANDARD QUERIES:
 * - orders: All orders with filters (role-based access)
 * - order: Single order by ID (permission-checked)
 * - orderChangeLogs: Change history for an order
 *
 * ANALYTICS (User/Admin):
 * - orderStats: User's or company's order statistics
 * - ordersByStatus: Distribution by status (pending, confirmed, production, etc.)
 * - ordersByCompany: Orders grouped by company (admin only)
 * - recentOrders: Latest orders with filters
 *
 * SEARCH & FILTER:
 * - searchOrders: Search in order number, collection name, customer
 * - getOrdersByDateRange: Orders within specific date range
 * - getOrdersByManufacturer: All orders for a manufacturer
 * - getOrdersByCustomer: All orders for a customer
 *
 * 🔒 Security:
 * - All queries require authentication
 * - Users see only their orders (customer or manufacturer role)
 * - Company employees see company orders
 * - Admin sees all orders
 *
 * 💡 Features:
 * - Role-based filtering (BUYER, MANUFACTURER, BOTH)
 * - Status tracking (40+ statuses across lifecycle)
 * - Change log tracking
 * - Negotiation history
 * - Real-time updates support
 */

import builder from "../builder";

// ========================================
// INPUT TYPES
// ========================================

const OrderFilterInput = builder.inputType("OrderFilterInput", {
  fields: (t) => ({
    status: t.string(),
    customerId: t.int(),
    manufactureId: t.int(),
    companyId: t.int(),
    collectionId: t.int(),
    startDate: t.string(),
    endDate: t.string(),
  }),
});

const OrderPaginationInput = builder.inputType("OrderPaginationInput", {
  fields: (t) => ({
    skip: t.int(),
    take: t.int(),
  }),
});

const OrderSearchInput = builder.inputType("OrderSearchInput", {
  fields: (t) => ({
    query: t.string({ required: true }),
    status: t.string(),
    limit: t.int(),
  }),
});

const OrderDateRangeInput = builder.inputType("OrderDateRangeInput", {
  fields: (t) => ({
    startDate: t.string({ required: true }),
    endDate: t.string({ required: true }),
  }),
});

// ========================================
// STANDARD ORDER QUERIES
// ========================================

// Get all orders
builder.queryField("orders", (t) =>
  t.prismaField({
    type: ["Order"],
    args: {
      filter: t.arg({ type: OrderFilterInput }),
      pagination: t.arg({ type: OrderPaginationInput }),
      search: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const user = context.user;
      if (!user) throw new Error("Unauthorized");

      const where: any = {};

      // Get user's company info if they have one
      let userCompanyType: string | null = null;
      if (user.companyId) {
        const company = await context.prisma.company.findUnique({
          where: { id: user.companyId },
          select: { type: true },
        });
        userCompanyType = company?.type || null;
      }

      // Filter by user role and company type
      if (user.role === "INDIVIDUAL_CUSTOMER") {
        // Individual customers see only their own orders
        where.customerId = user.id;
      } else if (userCompanyType === "BUYER") {
        // Buyer company users see their company's orders
        where.customer = {
          companyId: user.companyId,
        };
      } else if (userCompanyType === "MANUFACTURER") {
        // Manufacturer sees orders for their collections
        where.collection = {
          companyId: user.companyId,
        };
      } else if (user.role === "ADMIN") {
        // Admin sees all orders (no filter)
      } else {
        // Default: user's own orders
        where.customerId = user.id;
      }

      // Apply filters
      if (args.filter?.status) {
        where.status = args.filter.status;
      }
      if (args.filter?.customerId) {
        where.customerId = args.filter.customerId;
      }
      if (args.filter?.manufactureId) {
        where.manufactureId = args.filter.manufactureId;
      }
      if (args.filter?.companyId) {
        where.companyId = args.filter.companyId;
      }
      if (args.filter?.collectionId) {
        where.collectionId = args.filter.collectionId;
      }
      if (args.filter?.startDate || args.filter?.endDate) {
        where.createdAt = {};
        if (args.filter.startDate) {
          where.createdAt.gte = new Date(args.filter.startDate);
        }
        if (args.filter.endDate) {
          where.createdAt.lte = new Date(args.filter.endDate);
        }
      }

      if (args.search) {
        where.OR = [
          { orderNumber: { contains: args.search, mode: "insensitive" } },
          {
            collection: {
              name: { contains: args.search, mode: "insensitive" },
            },
          },
        ];
      }

      return context.prisma.order.findMany({
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
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// Get order by ID
builder.queryField("order", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const user = context.user;
      if (!user) throw new Error("Unauthorized");

      // First, get the order
      const order = await context.prisma.order.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
        include: {
          customer: true,
          collection: {
            include: {
              company: true,
            },
          },
        },
      });

      // Check if user has permission to view this order
      let hasAccess = false;

      if (user.role === "ADMIN") {
        // Admin can see all orders
        hasAccess = true;
      } else if (user.role === "INDIVIDUAL_CUSTOMER") {
        // Individual customer can only see their own orders
        hasAccess = order.customerId === user.id;
      } else if (user.companyId) {
        // Get user's company info
        const company = await context.prisma.company.findUnique({
          where: { id: user.companyId },
          select: { type: true },
        });

        if (company?.type === "BUYER") {
          // Buyer company users can see orders from their company
          hasAccess = order.customer?.companyId === user.companyId;
        } else if (company?.type === "MANUFACTURER") {
          // Manufacturer can see orders for their collections
          hasAccess = order.collection?.companyId === user.companyId;
        }
      }

      if (!hasAccess) {
        throw new Error("You don't have permission to view this order");
      }

      return order;
    },
  })
);

// Get order change logs for an order
builder.queryField("orderChangeLogs", (t) =>
  t.prismaField({
    type: ["OrderChangeLog"],
    args: {
      orderId: t.arg.int({ required: true }),
      pagination: t.arg({ type: OrderPaginationInput }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const user = context.user;
      if (!user) throw new Error("Unauthorized");

      // First check if user has access to this order
      const order = await context.prisma.order.findUniqueOrThrow({
        where: { id: args.orderId },
        include: {
          customer: true,
          collection: {
            include: { company: true },
          },
        },
      });

      // Check permissions (same logic as order query)
      let hasAccess = false;

      if (user.role === "ADMIN") {
        hasAccess = true;
      } else if (user.role === "INDIVIDUAL_CUSTOMER") {
        hasAccess = order.customerId === user.id;
      } else if (user.companyId) {
        const company = await context.prisma.company.findUnique({
          where: { id: user.companyId },
          select: { type: true },
        });

        if (company?.type === "BUYER") {
          hasAccess = order.customer?.companyId === user.companyId;
        } else if (company?.type === "MANUFACTURER") {
          hasAccess = order.collection?.companyId === user.companyId;
        }
      }

      if (!hasAccess) {
        throw new Error("You don't have permission to view order change logs");
      }

      return context.prisma.orderChangeLog.findMany({
        ...query,
        where: { orderId: args.orderId },
        ...(args.pagination?.skip !== null &&
        args.pagination?.skip !== undefined
          ? { skip: args.pagination.skip }
          : {}),
        ...(args.pagination?.take !== null &&
        args.pagination?.take !== undefined
          ? { take: args.pagination.take }
          : {}),
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// ========================================
// ANALYTICS QUERIES (User/Admin)
// ========================================

/**
 * Get user's or company's order statistics
 * ✅ Permission: Authenticated users
 */
builder.queryField("orderStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: async (_root, _args, context) => {
      const user = context.user!;
      let where: any = {};

      // Apply role-based filtering
      if (user.role === "INDIVIDUAL_CUSTOMER") {
        where.customerId = user.id;
      } else if (user.companyId) {
        const company = await context.prisma.company.findUnique({
          where: { id: user.companyId },
          select: { type: true },
        });

        if (company?.type === "BUYER") {
          where.customer = { companyId: user.companyId };
        } else if (company?.type === "MANUFACTURER") {
          where.collection = { companyId: user.companyId };
        }
      } else if (user.role !== "ADMIN") {
        where.customerId = user.id;
      }

      const [total, byStatus, recentCount, totalValue] = await Promise.all([
        context.prisma.order.count({ where }),
        context.prisma.order.groupBy({
          by: ["status"],
          where,
          _count: { status: true },
        }),
        context.prisma.order.count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
        context.prisma.order.aggregate({
          where,
          _sum: { totalPrice: true },
        }),
      ]);

      return {
        total,
        byStatus: byStatus.map((item) => ({
          status: item.status,
          count: item._count.status,
        })),
        recentCount, // Last 30 days
        totalValue: totalValue._sum.totalPrice || 0,
      };
    },
  })
);

/**
 * Get orders distribution by status
 * ✅ Permission: Authenticated users
 */
builder.queryField("ordersByStatus", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: async (_root, _args, context) => {
      const user = context.user!;
      let where: any = {};

      // Apply role-based filtering (same as orderStats)
      if (user.role === "INDIVIDUAL_CUSTOMER") {
        where.customerId = user.id;
      } else if (user.companyId) {
        const company = await context.prisma.company.findUnique({
          where: { id: user.companyId },
          select: { type: true },
        });

        if (company?.type === "BUYER") {
          where.customer = { companyId: user.companyId };
        } else if (company?.type === "MANUFACTURER") {
          where.collection = { companyId: user.companyId };
        }
      } else if (user.role !== "ADMIN") {
        where.customerId = user.id;
      }

      const total = await context.prisma.order.count({ where });
      const statusCounts = await context.prisma.order.groupBy({
        by: ["status"],
        where,
        _count: { status: true },
        _sum: { totalPrice: true },
      });

      return statusCounts.map((item) => ({
        status: item.status,
        count: item._count.status,
        percentage: total > 0 ? (item._count.status / total) * 100 : 0,
        totalValue: item._sum.totalPrice || 0,
      }));
    },
  })
);

/**
 * Get orders grouped by company (Admin only)
 * ✅ Permission: Admin only
 */
builder.queryField("ordersByCompany", (t) =>
  t.field({
    type: "JSON",
    authScopes: { admin: true },
    resolve: async (_root, _args, context) => {
      const orders = await context.prisma.order.findMany({
        select: {
          id: true,
          totalPrice: true,
          status: true,
          companyId: true,
          collection: {
            select: {
              company: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      });

      // Group by company
      const groupedByCompany: Record<number, any> = {};
      for (const order of orders) {
        const companyId = order.collection?.company?.id || order.companyId || 0;
        if (!groupedByCompany[companyId]) {
          groupedByCompany[companyId] = {
            companyId,
            companyName: order.collection?.company?.name || "Unknown",
            companyType: order.collection?.company?.type || null,
            orderCount: 0,
            totalValue: 0,
          };
        }
        groupedByCompany[companyId].orderCount++;
        groupedByCompany[companyId].totalValue += order.totalPrice || 0;
      }

      return Object.values(groupedByCompany);
    },
  })
);

/**
 * Get recent orders with optional filters
 * ✅ Permission: Authenticated users
 */
builder.queryField("recentOrders", (t) =>
  t.prismaField({
    type: ["Order"],
    args: {
      filter: t.arg({ type: OrderFilterInput }),
      pagination: t.arg({ type: OrderPaginationInput }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const user = context.user!;
      let where: any = {};

      // Apply role-based filtering
      if (user.role === "INDIVIDUAL_CUSTOMER") {
        where.customerId = user.id;
      } else if (user.companyId) {
        const company = await context.prisma.company.findUnique({
          where: { id: user.companyId },
          select: { type: true },
        });

        if (company?.type === "BUYER") {
          where.customer = { companyId: user.companyId };
        } else if (company?.type === "MANUFACTURER") {
          where.collection = { companyId: user.companyId };
        }
      } else if (user.role !== "ADMIN") {
        where.customerId = user.id;
      }

      // Apply additional filters
      if (args.filter?.status) where.status = args.filter.status;

      return context.prisma.order.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
        take: args.pagination?.take || 10,
        skip: args.pagination?.skip || 0,
      });
    },
  })
);

// ========================================
// SEARCH & FILTER QUERIES
// ========================================

/**
 * Search orders by order number, collection name, customer
 * ✅ Permission: Authenticated users
 */
builder.queryField("searchOrders", (t) =>
  t.field({
    type: "JSON",
    args: {
      input: t.arg({ type: OrderSearchInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const user = context.user!;
      let where: any = {
        OR: [
          { orderNumber: { contains: args.input.query, mode: "insensitive" } },
          {
            collection: {
              name: { contains: args.input.query, mode: "insensitive" },
            },
          },
          {
            customer: {
              name: { contains: args.input.query, mode: "insensitive" },
            },
          },
        ],
      };

      // Apply role-based filtering
      if (user.role === "INDIVIDUAL_CUSTOMER") {
        where.customerId = user.id;
      } else if (user.companyId) {
        const company = await context.prisma.company.findUnique({
          where: { id: user.companyId },
          select: { type: true },
        });

        if (company?.type === "BUYER") {
          where.customer = { companyId: user.companyId };
        } else if (company?.type === "MANUFACTURER") {
          where.collection = { companyId: user.companyId };
        }
      } else if (user.role !== "ADMIN") {
        where.customerId = user.id;
      }

      if (args.input.status) {
        where.status = args.input.status;
      }

      const orders = await context.prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          quantity: true,
          totalPrice: true,
          createdAt: true,
          collection: {
            select: {
              id: true,
              name: true,
              modelCode: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: args.input.limit || 20,
      });

      return orders;
    },
  })
);

/**
 * Get orders within specific date range
 * ✅ Permission: Authenticated users
 */
builder.queryField("getOrdersByDateRange", (t) =>
  t.prismaField({
    type: ["Order"],
    args: {
      input: t.arg({ type: OrderDateRangeInput, required: true }),
      pagination: t.arg({ type: OrderPaginationInput }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const user = context.user!;
      let where: any = {
        createdAt: {
          gte: new Date(args.input.startDate),
          lte: new Date(args.input.endDate),
        },
      };

      // Apply role-based filtering
      if (user.role === "INDIVIDUAL_CUSTOMER") {
        where.customerId = user.id;
      } else if (user.companyId) {
        const company = await context.prisma.company.findUnique({
          where: { id: user.companyId },
          select: { type: true },
        });

        if (company?.type === "BUYER") {
          where.customer = { companyId: user.companyId };
        } else if (company?.type === "MANUFACTURER") {
          where.collection = { companyId: user.companyId };
        }
      } else if (user.role !== "ADMIN") {
        where.customerId = user.id;
      }

      return context.prisma.order.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);

/**
 * Get all orders for a specific manufacturer
 * ✅ Permission: Authenticated users
 */
builder.queryField("getOrdersByManufacturer", (t) =>
  t.prismaField({
    type: ["Order"],
    args: {
      manufactureId: t.arg.int({ required: true }),
      pagination: t.arg({ type: OrderPaginationInput }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const user = context.user!;

      // Permission check: only manufacturer themselves or admin
      if (user.id !== args.manufactureId && user.role !== "ADMIN") {
        throw new Error("Bu siparişleri görme yetkiniz yok");
      }

      return context.prisma.order.findMany({
        ...query,
        where: { manufactureId: args.manufactureId },
        orderBy: { createdAt: "desc" },
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);

/**
 * Get all orders for a specific customer
 * ✅ Permission: Authenticated users
 */
builder.queryField("getOrdersByCustomer", (t) =>
  t.prismaField({
    type: ["Order"],
    args: {
      customerId: t.arg.int({ required: true }),
      pagination: t.arg({ type: OrderPaginationInput }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const user = context.user!;

      // Permission check: only customer themselves or admin
      if (user.id !== args.customerId && user.role !== "ADMIN") {
        throw new Error("Bu siparişleri görme yetkiniz yok");
      }

      return context.prisma.order.findMany({
        ...query,
        where: { customerId: args.customerId },
        orderBy: { createdAt: "desc" },
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);
