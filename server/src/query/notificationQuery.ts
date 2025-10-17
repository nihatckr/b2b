import { booleanArg, intArg, nonNull } from "nexus";

export const notificationQueries = (t: any) => {
  // Get all notifications for the current user
  t.nonNull.list.nonNull.field("myNotifications", {
    type: "Notification",
    args: {
      limit: intArg({ default: 50 }),
      offset: intArg({ default: 0 }),
      unreadOnly: booleanArg(),
    },
    resolve: async (_parent: any, args: any, context: any) => {
      const userId = context.userId;

      if (!userId) {
        throw new Error("Not authenticated");
      }

      const where: any = {
        userId,
      };

      if (args.unreadOnly) {
        where.isRead = false;
      }

      const notifications = await context.prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        take: args.limit || 50,
        skip: args.offset || 0,
      });

      return notifications;
    },
  });

  // Get unread notification count
  t.nonNull.int("unreadNotificationCount", {
    resolve: async (_parent: any, _args: any, context: any) => {
      const userId = context.userId;

      if (!userId) {
        throw new Error("Not authenticated");
      }

      const count = await context.prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return count;
    },
  });

  // Get a single notification by ID
  t.field("notification", {
    type: "Notification",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_parent: any, args: any, context: any) => {
      const userId = context.userId;

      if (!userId) {
        throw new Error("Not authenticated");
      }

      const notification = await context.prisma.notification.findUnique({
        where: { id: args.id },
      });

      // Check if the notification belongs to the current user
      if (!notification || notification.userId !== userId) {
        throw new Error("Notification not found or access denied");
      }

      return notification;
    },
  });
};
