import { booleanArg, floatArg, intArg, stringArg } from "nexus";
import { Context } from "../../../context";
import { getUserId } from "../../../utils/userUtils";

export const orderQueries = (t: any) => {
  t.list.field("orders", {
    type: "Order",
    args: {
      search: stringArg(),
      status: stringArg(),
      customerId: intArg(),
      collectionId: intArg(),
      manufactureId: intArg(),
      minPrice: floatArg(),
      maxPrice: floatArg(),
      take: intArg(),
      skip: intArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);

      // Build where clause
      const where: any = {};

      if (args.search) {
        where.OR = [
          { orderNumber: { contains: args.search, mode: "insensitive" } },
          { customerNote: { contains: args.search, mode: "insensitive" } },
          {
            collection: {
              name: { contains: args.search, mode: "insensitive" },
            },
          },
        ];
      }

      if (args.status) {
        where.status = args.status;
      }

      if (args.customerId) {
        where.customerId = args.customerId;
      }

      if (args.collectionId) {
        where.collectionId = args.collectionId;
      }

      if (args.manufactureId) {
        where.manufactureId = args.manufactureId;
      }

      if (args.minPrice || args.maxPrice) {
        where.totalPrice = {};
        if (args.minPrice) where.totalPrice.gte = args.minPrice;
        if (args.maxPrice) where.totalPrice.lte = args.maxPrice;
      }

      // Non-admin users can only see their own orders (as customer or manufacture)
      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId || 0 },
        select: { role: true },
      });

      if (userId && currentUser?.role !== "ADMIN") {
        where.OR = [{ customerId: userId }, { manufactureId: userId }];
      }

      return context.prisma.order.findMany({
        where,
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: args.take || 50,
        skip: args.skip || 0,
      });
    },
  });

  t.field("order", {
    type: "Order",
    args: {
      id: intArg(),
      orderNumber: stringArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);

      if (!args.id && !args.orderNumber) {
        throw new Error("Either id or orderNumber must be provided.");
      }

      const where = args.id
        ? { id: args.id }
        : { orderNumber: args.orderNumber };

      const order = await context.prisma.order.findUnique({
        where,
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          productionHistory: {
            include: {
              updatedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found.");
      }

      // Check access permissions
      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId || 0 },
        select: { role: true },
      });

      // Admin can see all, users can see their own orders (as customer or manufacture)
      if (
        userId &&
        currentUser?.role !== "ADMIN" &&
        order.customerId !== userId &&
        order.manufactureId !== userId
      ) {
        throw new Error("Access denied.");
      }

      return order;
    },
  });

  t.list.field("myOrders", {
    type: "Order",
    args: {
      status: stringArg(),
      collectionId: intArg(),
      asCustomer: booleanArg(), // true: müşteri olarak verdiğim siparişler, false: üretici olarak aldığım siparişler
      take: intArg(),
      skip: intArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      const where: any = {};

      // Kullanıcı müşteri veya üretici olarak orders'ları alabilir
      if (args.asCustomer !== undefined) {
        where[args.asCustomer ? "customerId" : "manufactureId"] = userId;
      } else {
        // Varsayılan: hem müşteri hem üretici olarak olan orders
        where.OR = [{ customerId: userId }, { manufactureId: userId }];
      }

      if (args.status) {
        where.status = args.status;
      }

      if (args.collectionId) {
        where.collectionId = args.collectionId;
      }

      return context.prisma.order.findMany({
        where,
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: args.take || 20,
        skip: args.skip || 0,
      });
    },
  });

  t.field("orderStats", {
    type: "OrderStats",
    resolve: async (_parent: any, _args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      // Build base filter for non-admin users
      let baseFilter: any = {};
      if (currentUser?.role !== "ADMIN") {
        baseFilter.OR = [{ customerId: userId }, { manufactureId: userId }];
      }

      const [
        totalOrders,
        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
        inProductionOrders,
        totalRevenue,
      ] = await Promise.all([
        context.prisma.order.count({ where: baseFilter }),
        context.prisma.order.count({
          where: { ...baseFilter, status: "PENDING" },
        }),
        context.prisma.order.count({
          where: { ...baseFilter, status: "CONFIRMED" },
        }),
        context.prisma.order.count({
          where: { ...baseFilter, status: "SHIPPED" },
        }),
        context.prisma.order.count({
          where: { ...baseFilter, status: "DELIVERED" },
        }),
        context.prisma.order.count({
          where: { ...baseFilter, status: "IN_PRODUCTION" },
        }),
        context.prisma.order.aggregate({
          where: {
            ...baseFilter,
            status: { in: ["DELIVERED", "SHIPPED", "PRODUCTION_COMPLETE"] },
          },
          _sum: { totalPrice: true },
        }),
      ]);

      return {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
        inProductionOrders,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
      };
    },
  });
};
