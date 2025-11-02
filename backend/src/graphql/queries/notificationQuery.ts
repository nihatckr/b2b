/**
 * Notification Queries - NOTIFICATION SYSTEM
 *
 * 🎯 Purpose: User notification management and analytics
 *
 * 📋 Available Queries:
 *
 * STANDARD QUERIES:
 * - notifications: All notifications with filters (authenticated)
 * - unreadNotificationCount: Count of unread notifications (authenticated)
 *
 * ANALYTICS (User):
 * - notificationStats: User's notification statistics
 * - notificationsByType: Distribution by type (order, sample, message, etc.)
 * - recentNotifications: Latest notifications with grouping
 *
 * SEARCH & FILTER:
 * - searchNotifications: Search in notification content (authenticated)
 * - getNotificationsByContext: Get notifications for specific order/sample (authenticated)
 *
 * 🔒 Security:
 * - All queries require authentication
 * - Users see only their own notifications
 * - Admin can see all notifications (optional)
 *
 * 💡 Features:
 * - Context-based notifications (order, sample, production)
 * - Real-time subscriptions (newNotification, notificationRead)
 * - Read/unread status tracking
 * - Bulk operations support
 * - Automatic cleanup of old notifications
 */

import builder from "../builder";

// ========================================
// INPUT TYPES
// ========================================

const NotificationFilterInput = builder.inputType("NotificationFilterInput", {
  fields: (t) => ({
    isRead: t.boolean(),
    type: t.string(),
    orderId: t.int(),
    sampleId: t.int(),
    productionTrackingId: t.int(),
  }),
});

const NotificationPaginationInput = builder.inputType(
  "NotificationPaginationInput",
  {
    fields: (t) => ({
      skip: t.int(),
      take: t.int(),
    }),
  }
);

const NotificationSearchInput = builder.inputType("NotificationSearchInput", {
  fields: (t) => ({
    query: t.string({ required: true }),
    type: t.string(),
    limit: t.int(),
  }),
});

const NotificationContextInput = builder.inputType("NotificationContextInput", {
  fields: (t) => ({
    orderId: t.int(),
    sampleId: t.int(),
    productionTrackingId: t.int(),
  }),
});

// ========================================
// STANDARD NOTIFICATION QUERIES
// ========================================

// Get notifications (user-specific)
builder.queryField("notifications", (t) =>
  t.prismaField({
    type: ["Notification"],
    args: {
      filter: t.arg({ type: NotificationFilterInput }),
      pagination: t.arg({ type: NotificationPaginationInput }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {
        userId: context.user?.id || 0,
      };

      if (args.filter?.isRead !== null && args.filter?.isRead !== undefined)
        where.isRead = args.filter.isRead;
      if (args.filter?.type) where.type = args.filter.type;
      if (args.filter?.orderId) where.orderId = args.filter.orderId;
      if (args.filter?.sampleId) where.sampleId = args.filter.sampleId;
      if (args.filter?.productionTrackingId)
        where.productionTrackingId = args.filter.productionTrackingId;

      return context.prisma.notification.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
        ...(args.pagination?.skip !== null &&
        args.pagination?.skip !== undefined
          ? { skip: args.pagination.skip }
          : {}),
        ...(args.pagination?.take !== null &&
        args.pagination?.take !== undefined
          ? { take: args.pagination.take }
          : {}),
      });
    },
  })
);

// Get unread notification count
builder.queryField("unreadNotificationCount", (t) =>
  t.field({
    type: "Int",
    authScopes: { user: true },
    resolve: async (_root, _args, context) => {
      const count = await context.prisma.notification.count({
        where: {
          userId: context.user?.id || 0,
          isRead: false,
        },
      });
      return count;
    },
  })
);

// ========================================
// ANALYTICS QUERIES (User)
// ========================================

/**
 * Get user's notification statistics
 * ✅ Permission: Authenticated users
 */
builder.queryField("notificationStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: async (_root, _args, context) => {
      const userId = context.user!.id;

      const [total, unread, byType, recentCount] = await Promise.all([
        context.prisma.notification.count({ where: { userId } }),
        context.prisma.notification.count({
          where: { userId, isRead: false },
        }),
        context.prisma.notification.groupBy({
          by: ["type"],
          where: { userId },
          _count: { type: true },
        }),
        context.prisma.notification.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ]);

      return {
        total,
        unread,
        read: total - unread,
        byType: byType.map((item) => ({
          type: item.type,
          count: item._count.type,
        })),
        recentCount, // Last 7 days
      };
    },
  })
);

/**
 * Get notifications distribution by type
 * ✅ Permission: Authenticated users
 */
builder.queryField("notificationsByType", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: async (_root, _args, context) => {
      const userId = context.user!.id;

      const total = await context.prisma.notification.count({
        where: { userId },
      });

      const typeCounts = await context.prisma.notification.groupBy({
        by: ["type"],
        where: { userId },
        _count: { type: true },
      });

      return typeCounts.map((item) => ({
        type: item.type,
        count: item._count.type,
        percentage: total > 0 ? (item._count.type / total) * 100 : 0,
      }));
    },
  })
);

/**
 * Get recent notifications with grouping
 * ✅ Permission: Authenticated users
 */
builder.queryField("recentNotifications", (t) =>
  t.field({
    type: "JSON",
    args: {
      pagination: t.arg({ type: NotificationPaginationInput }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const userId = context.user!.id;

      const notifications = await context.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: args.pagination?.take || 20,
        skip: args.pagination?.skip || 0,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          link: true,
          isRead: true,
          createdAt: true,
          orderId: true,
          sampleId: true,
          productionTrackingId: true,
        },
      });

      // Group by date
      const groupedByDate: Record<string, any[]> = {};
      for (const notif of notifications) {
        const dateKey = notif.createdAt.toISOString().split("T")[0]!;
        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(notif);
      }

      return {
        notifications,
        groupedByDate,
        total: notifications.length,
      };
    },
  })
);

// ========================================
// SEARCH & FILTER QUERIES
// ========================================

/**
 * Search notifications by content
 * ✅ Permission: Authenticated users
 */
builder.queryField("searchNotifications", (t) =>
  t.field({
    type: "JSON",
    args: {
      input: t.arg({ type: NotificationSearchInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const userId = context.user!.id;
      const where: any = {
        userId,
        OR: [
          { title: { contains: args.input.query } },
          { message: { contains: args.input.query } },
        ],
      };

      if (args.input.type) {
        where.type = args.input.type;
      }

      const notifications = await context.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: args.input.limit || 20,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          link: true,
          isRead: true,
          createdAt: true,
          orderId: true,
          sampleId: true,
          productionTrackingId: true,
        },
      });

      return notifications;
    },
  })
);

/**
 * Get notifications for specific context (order/sample/production)
 * ✅ Permission: Authenticated users
 */
builder.queryField("getNotificationsByContext", (t) =>
  t.prismaField({
    type: ["Notification"],
    args: {
      filter: t.arg({ type: NotificationContextInput, required: true }),
      pagination: t.arg({ type: NotificationPaginationInput }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const userId = context.user!.id;
      const where: any = { userId };

      if (args.filter.orderId) {
        where.orderId = args.filter.orderId;
      } else if (args.filter.sampleId) {
        where.sampleId = args.filter.sampleId;
      } else if (args.filter.productionTrackingId) {
        where.productionTrackingId = args.filter.productionTrackingId;
      } else {
        throw new Error(
          "orderId, sampleId veya productionTrackingId gereklidir"
        );
      }

      return context.prisma.notification.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);
