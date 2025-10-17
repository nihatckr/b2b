import { arg } from "nexus";
import { Context } from "../context";
import { requireAuth } from "../utils/user-role-helper";

export const messageQueries = (t: any) => {
  // Get User Messages
  t.list.field("myMessages", {
    type: "Message",
    args: {
      filter: arg({ type: "MessageFilterInput" }),
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

      const where: any = {
        OR: [
          { senderId: userId }, // Messages I sent
          { receiverId: userId }, // Messages sent to me
        ],
      };

      // Apply filters
      if (args.filter) {
        if (args.filter.unreadOnly) {
          where.isRead = false;
          where.receiverId = userId; // Sadece bana gelen okunmamışları
        }
        if (args.filter.type) {
          where.type = args.filter.type;
        }
        if (args.filter.orderId) {
          where.orderId = args.filter.orderId;
        }
        if (args.filter.sampleId) {
          where.sampleId = args.filter.sampleId;
        }
        if (args.filter.companyId) {
          where.companyId = args.filter.companyId;
        }
      }

      const messages = await context.prisma.message.findMany({
        where,
        include: {
          sender: true,
          receiver: true,
          order: true,
          sample: true,
          company: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return messages;
    },
  });

  // Get Company Messages (for company owners/admins)
  t.list.field("companyMessages", {
    type: "Message",
    args: {
      companyId: "Int",
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

      // Admin can see all, company owner can see their company's messages
      const targetCompanyId = args.companyId || user.companyId;

      if (user.role !== "ADMIN" && user.companyId !== targetCompanyId) {
        throw new Error("Not authorized to view these messages");
      }

      const messages = await context.prisma.message.findMany({
        where: {
          companyId: targetCompanyId,
        },
        include: {
          sender: true,
          receiver: true,
          order: true,
          sample: true,
          company: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return messages;
    },
  });

  // Get Unread Count
  t.int("unreadMessageCount", {
    resolve: async (_parent: unknown, _args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const count = await context.prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false,
        },
      });

      return count;
    },
  });

  // Get Product Messages (Order or Sample based)
  t.list.field("productMessages", {
    type: "Message",
    args: {
      orderId: "Int",
      sampleId: "Int",
    },
    resolve: async (_parent: unknown, args: any, context: Context) => {
      const userId = requireAuth(context);

      if (!args.orderId && !args.sampleId) {
        throw new Error("Either orderId or sampleId must be provided");
      }

      const where: any = {};

      if (args.orderId) {
        where.orderId = args.orderId;

        // Verify user has access to this order
        const order = await context.prisma.order.findUnique({
          where: { id: args.orderId },
        });

        if (!order) {
          throw new Error("Order not found");
        }

        const user = await context.prisma.user.findUnique({
          where: { id: userId },
        });

        if (
          order.customerId !== userId &&
          order.manufactureId !== userId &&
          user?.role !== "ADMIN"
        ) {
          throw new Error("Not authorized to view messages for this order");
        }
      }

      if (args.sampleId) {
        where.sampleId = args.sampleId;

        // Verify user has access to this sample
        const sample = await context.prisma.sample.findUnique({
          where: { id: args.sampleId },
        });

        if (!sample) {
          throw new Error("Sample not found");
        }

        const user = await context.prisma.user.findUnique({
          where: { id: userId },
        });

        if (
          sample.customerId !== userId &&
          sample.manufactureId !== userId &&
          user?.role !== "ADMIN"
        ) {
          throw new Error("Not authorized to view messages for this sample");
        }
      }

      const messages = await context.prisma.message.findMany({
        where,
        include: {
          sender: true,
          receiver: true,
          order: true,
          sample: true,
          company: true,
        },
        orderBy: { createdAt: "asc" }, // Kronolojik sıra
      });

      return messages;
    },
  });
};
