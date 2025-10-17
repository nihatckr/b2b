import { intArg, nonNull, stringArg } from "nexus";
import { productionScheduler } from "../utils/productionScheduler";

export const notificationMutations = (t: any) => {
  // Mark a notification as read
  t.field("markNotificationAsRead", {
    type: "Notification",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_parent: any, args: any, context: any) => {
      const userId = context.userId;

      if (!userId) {
        throw new Error("Not authenticated");
      }

      // Check if notification belongs to user
      const notification = await context.prisma.notification.findUnique({
        where: { id: args.id },
      });

      if (!notification || notification.userId !== userId) {
        throw new Error("Notification not found or access denied");
      }

      return context.prisma.notification.update({
        where: { id: args.id },
        data: { isRead: true },
      });
    },
  });

  // Mark all notifications as read
  t.nonNull.int("markAllNotificationsAsRead", {
    resolve: async (_parent: any, _args: any, context: any) => {
      const userId = context.userId;

      if (!userId) {
        throw new Error("Not authenticated");
      }

      const result = await context.prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return result.count;
    },
  });

  // Delete a notification
  t.field("deleteNotification", {
    type: "Notification",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_parent: any, args: any, context: any) => {
      const userId = context.userId;

      if (!userId) {
        throw new Error("Not authenticated");
      }

      // Check if notification belongs to user
      const notification = await context.prisma.notification.findUnique({
        where: { id: args.id },
      });

      if (!notification || notification.userId !== userId) {
        throw new Error("Notification not found or access denied");
      }

      return context.prisma.notification.delete({
        where: { id: args.id },
      });
    },
  });

  // Create a notification (internal use by other mutations)
  t.field("createNotification", {
    type: "Notification",
    args: {
      type: nonNull(stringArg()),
      title: nonNull(stringArg()),
      message: nonNull(stringArg()),
      link: stringArg(),
      userId: nonNull(intArg()),
      orderId: intArg(),
      sampleId: intArg(),
      productionTrackingId: intArg(),
    },
    resolve: async (_parent: any, args: any, context: any) => {
      // This mutation is typically called internally by other mutations
      // We might want to restrict this to admin only or remove it from the schema
      const currentUserId = context.userId;

      if (!currentUserId) {
        throw new Error("Not authenticated");
      }

      return context.prisma.notification.create({
        data: {
          type: args.type as any,
          title: args.title,
          message: args.message,
          link: args.link || undefined,
          userId: args.userId,
          orderId: args.orderId || undefined,
          sampleId: args.sampleId || undefined,
          productionTrackingId: args.productionTrackingId || undefined,
        },
      });
    },
  });

  // Manually trigger production deadline check (Admin only)
  t.nonNull.boolean("checkProductionDeadlines", {
    resolve: async (_parent: any, _args: any, context: any) => {
      const userId = context.userId;

      if (!userId) {
        throw new Error("Not authenticated");
      }

      // Get user to check if admin
      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (user?.role !== "ADMIN") {
        throw new Error("Only administrators can manually trigger production checks");
      }

      // Trigger manual check
      await productionScheduler.triggerManualCheck();

      return true;
    },
  });
};
