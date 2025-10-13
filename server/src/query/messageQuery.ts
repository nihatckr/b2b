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
          { receiver: userId.toString() }, // Messages sent to me
          { receiver: "all", companyId: user.companyId }, // Company-wide messages
        ],
      };

      // Apply filters
      if (args.filter) {
        if (args.filter.unreadOnly) {
          where.isRead = false;
        }
        if (args.filter.type) {
          where.type = args.filter.type;
        }
        if (args.filter.companyId) {
          where.companyId = args.filter.companyId;
        }
      }

      const messages = await context.prisma.message.findMany({
        where,
        include: {
          sender: true,
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
          OR: [
            { receiver: userId.toString() },
            { receiver: "all", companyId: user.companyId },
          ],
          isRead: false,
        },
      });

      return count;
    },
  });
};
