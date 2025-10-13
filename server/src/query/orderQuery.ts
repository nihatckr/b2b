import { intArg, nonNull, stringArg } from "nexus";
import { Context } from "../context";
import { getUserRole, requireAuth } from "../utils/user-role-helper";

export const orderQueries = (t: any) => {
  // Get all orders with filtering
  t.list.field("orders", {
    type: "Order",
    args: {
      status: "OrderStatus",
      customerId: intArg(),
      manufactureId: intArg(),
      companyId: intArg(),
      search: stringArg(),
      limit: intArg(),
      offset: intArg(),
    },
    resolve: async (_parent: unknown, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      // Build where clause
      const where: any = {};

      // Role-based filtering
      if (userRole === "CUSTOMER") {
        where.customerId = userId;
      } else if (userRole === "MANUFACTURE") {
        where.OR = [
          { manufactureId: userId },
          { companyId: user.companyId || -1 },
        ];
      }
      // Admins see all

      // Apply filters
      if (args.status) where.status = args.status;
      if (args.customerId && userRole === "ADMIN") {
        where.customerId = args.customerId;
      }
      if (args.manufactureId) {
        if (userRole === "ADMIN" || args.manufactureId === userId) {
          where.manufactureId = args.manufactureId;
        }
      }
      if (args.companyId) {
        if (
          userRole === "ADMIN" ||
          (userRole === "MANUFACTURE" && args.companyId === user.companyId)
        ) {
          where.companyId = args.companyId;
        }
      }

      if (args.search) {
        where.OR = [
          { orderNumber: { contains: args.search, mode: "insensitive" } },
          { customerNote: { contains: args.search, mode: "insensitive" } },
        ];
      }

      return context.prisma.order.findMany({
        where,
        include: {
          collection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
        orderBy: { createdAt: "desc" },
        take: args.limit || undefined,
        skip: args.offset || undefined,
      });
    },
  });

  // Get single order
  t.field("order", {
    type: "Order",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (
      _parent: unknown,
      { id }: { id: number },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      const order = await context.prisma.order.findUnique({
        where: { id },
        include: {
          collection: true,
          customer: true,
          manufacture: true,
          company: true,
          productionHistory: {
            orderBy: { createdAt: "desc" },
            include: { updatedBy: true },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Permission check
      const isCustomer = order.customerId === userId;
      const isManufacture = order.manufactureId === userId;
      const isCompanyMember =
        userRole === "MANUFACTURE" && order.companyId === user.companyId;
      const isAdmin = userRole === "ADMIN";

      if (!isCustomer && !isManufacture && !isCompanyMember && !isAdmin) {
        throw new Error("Not authorized to view this order");
      }

      return order;
    },
  });

  // Get my orders (customer)
  t.list.field("myOrders", {
    type: "Order",
    args: {
      status: "OrderStatus",
    },
    resolve: async (
      _parent: unknown,
      args: { status?: string },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const where: any = {
        customerId: userId,
      };

      if (args.status) {
        where.status = args.status;
      }

      return context.prisma.order.findMany({
        where,
        include: {
          collection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
  });

  // Get assigned orders (manufacturer)
  t.list.field("assignedOrders", {
    type: "Order",
    args: {
      status: "OrderStatus",
    },
    resolve: async (
      _parent: unknown,
      args: { status?: string },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      if (userRole !== "MANUFACTURE" && userRole !== "ADMIN") {
        throw new Error(
          "Only manufacturers and admins can access assigned orders"
        );
      }

      const where: any = {
        OR: [{ manufactureId: userId }, { companyId: user.companyId || -1 }],
      };

      if (args.status) {
        where.status = args.status;
      }

      return context.prisma.order.findMany({
        where,
        include: {
          collection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
  });
};
