import { handleError, requireAuth, ValidationError } from "../../utils/errors";
import { createTimer, logInfo } from "../../utils/logger";
import { pubsub } from "../../utils/pubsub";
import { sanitizeInt, sanitizeString } from "../../utils/sanitize";
import {
  validateEnum,
  validateRequired,
  validateStringLength,
} from "../../utils/validation";
import builder from "../builder";

// ========================================
// NOTIFICATION MUTATION - PRODUCTION READY
// Full sanitization, validation, structured logging, Turkish errors
// 6 mutations: create, markAsRead, markAllAsRead, delete, deleteAllRead, deleteAll
// ========================================

// Valid Notification Types (from schema)
const ValidNotificationTypes = [
  "ORDER",
  "SAMPLE",
  "MESSAGE",
  "PRODUCTION",
  "QUALITY",
  "SYSTEM",
  "USER_MANAGEMENT",
  "ORDER_UPDATE",
  "ORDER_CHANGE_RESPONSE",
];

// Input for creating a notification
const CreateNotificationInput = builder.inputType("CreateNotificationInput", {
  fields: (t) => ({
    // Schema: NotificationType (Enum - Required)
    type: t.string({ required: true }),
    // Schema: String (Required)
    title: t.string({ required: true }),
    // Schema: String @db.Text (Required)
    message: t.string({ required: true }),
    // Schema: String? (Optional - İlgili sayfanın URL'i)
    link: t.string({ required: false }),
    // Schema: Json? (Optional - Ek veri)
    data: t.string({ required: false }), // JSON string
    // Schema: Int (Required - Foreign key to User)
    userId: t.int({ required: true }),
    // Schema: Int? (Optional - Foreign key to Order)
    orderId: t.int({ required: false }),
    // Schema: Int? (Optional - Foreign key to Sample)
    sampleId: t.int({ required: false }),
    // Schema: Int? (Optional - Foreign key to ProductionTracking)
    productionTrackingId: t.int({ required: false }),
  }),
});

// Create notification (Admin/System only)
builder.mutationField("createNotification", (t) =>
  t.prismaField({
    type: "Notification",
    args: {
      input: t.arg({ type: CreateNotificationInput, required: true }),
    },
    authScopes: { admin: true }, // Only admin can create manual notifications
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("createNotification");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);
        const adminId = context.user!.id;

        // ========================================
        // SANITIZATION
        // ========================================
        const type = sanitizeString(args.input.type);
        const title = sanitizeString(args.input.title);
        const message = sanitizeString(args.input.message);
        const link = args.input.link
          ? sanitizeString(args.input.link)
          : undefined;
        const dataString = args.input.data
          ? sanitizeString(args.input.data)
          : undefined;
        const userId = sanitizeInt(args.input.userId);
        const orderId = args.input.orderId
          ? sanitizeInt(args.input.orderId)
          : undefined;
        const sampleId = args.input.sampleId
          ? sanitizeInt(args.input.sampleId)
          : undefined;
        const productionTrackingId = args.input.productionTrackingId
          ? sanitizeInt(args.input.productionTrackingId)
          : undefined;

        // ========================================
        // VALIDATION
        // ========================================
        validateRequired(type, "Bildirim tipi");
        validateRequired(title, "Başlık");
        validateRequired(message, "Mesaj");
        validateRequired(userId, "Kullanıcı ID");

        // Enum validation
        validateEnum(type!, "Bildirim tipi", ValidNotificationTypes);

        // String length validations
        validateStringLength(title!, "Başlık", 1, 255);
        validateStringLength(message!, "Mesaj", 1, 5000);

        if (link) {
          validateStringLength(link, "Link", 1, 500);
        }

        // JSON validation
        let parsedData: any = null;
        if (dataString) {
          try {
            parsedData = JSON.parse(dataString);
          } catch (e) {
            throw new ValidationError("Geçersiz JSON formatı (data alanı)");
          }
        }

        // ========================================
        // EXISTENCE CHECKS
        // ========================================
        // Check user exists
        const targetUser = await context.prisma.user.findUnique({
          where: { id: userId! },
        });

        if (!targetUser) {
          throw new ValidationError("Hedef kullanıcı bulunamadı");
        }

        // Check order exists (if provided)
        if (orderId) {
          const order = await context.prisma.order.findUnique({
            where: { id: orderId },
          });
          if (!order) {
            throw new ValidationError("Sipariş bulunamadı");
          }
        }

        // Check sample exists (if provided)
        if (sampleId) {
          const sample = await context.prisma.sample.findUnique({
            where: { id: sampleId },
          });
          if (!sample) {
            throw new ValidationError("Numune bulunamadı");
          }
        }

        // Check production tracking exists (if provided)
        if (productionTrackingId) {
          const tracking = await context.prisma.productionTracking.findUnique({
            where: { id: productionTrackingId },
          });
          if (!tracking) {
            throw new ValidationError("Üretim takibi bulunamadı");
          }
        }

        // ========================================
        // CREATE NOTIFICATION
        // ========================================
        const notification = await context.prisma.notification.create({
          ...query,
          data: {
            type: type! as any,
            title: title!,
            message: message!,
            link: link || null,
            data: parsedData,
            userId: userId!,
            orderId: orderId || null,
            sampleId: sampleId || null,
            productionTrackingId: productionTrackingId || null,
            isRead: false,
          },
        });

        // ========================================
        // REAL-TIME NOTIFICATION
        // ========================================
        try {
          pubsub.publish("notification:new", userId!, notification);
        } catch (pubsubError) {
          logInfo("Real-time bildirim yayını başarısız oldu", {
            notificationId: notification.id,
          });
          // Don't block the operation if pubsub fails
        }

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Bildirim oluşturuldu", {
          notificationId: notification.id,
          adminId,
          userId: notification.userId,
          type: notification.type,
          metadata: timer.end(),
        });

        return notification;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// Mark notification as read
builder.mutationField("markNotificationAsRead", (t) =>
  t.prismaField({
    type: "Notification",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("markNotificationAsRead");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);
        const userId = context.user!.id;

        // ========================================
        // SANITIZATION
        // ========================================
        const notificationId = sanitizeInt(args.id);

        // ========================================
        // VALIDATION
        // ========================================
        validateRequired(notificationId, "Bildirim ID");

        // ========================================
        // EXISTENCE CHECK
        // ========================================
        const notification = await context.prisma.notification.findUnique({
          where: { id: notificationId! },
        });

        if (!notification) {
          throw new ValidationError("Bildirim bulunamadı");
        }

        // ========================================
        // PERMISSION CHECK
        // ========================================
        // Only owner or admin can mark as read
        if (notification.userId !== userId && context.user?.role !== "ADMIN") {
          throw new ValidationError(
            "Bu bildirimi okundu olarak işaretleme yetkiniz yok"
          );
        }

        // ========================================
        // UPDATE NOTIFICATION
        // ========================================
        const updated = await context.prisma.notification.update({
          ...query,
          where: { id: notificationId! },
          data: { isRead: true },
        });

        // ========================================
        // REAL-TIME NOTIFICATION
        // ========================================
        try {
          pubsub.publish("notification:read", notification.userId, {
            notificationId: updated.id,
            isRead: updated.isRead,
          });
        } catch (pubsubError) {
          logInfo("Real-time bildirim yayını başarısız oldu", {
            notificationId: updated.id,
          });
          // Don't block the operation if pubsub fails
        }

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Bildirim okundu olarak işaretlendi", {
          notificationId: updated.id,
          userId,
          metadata: timer.end(),
        });

        return updated;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// Mark all notifications as read
builder.mutationField("markAllNotificationsAsRead", (t) =>
  t.field({
    type: "Int",
    authScopes: { user: true },
    resolve: async (_root, _args, context) => {
      const timer = createTimer("markAllNotificationsAsRead");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);
        const userId = context.user!.id;

        // ========================================
        // UPDATE ALL UNREAD NOTIFICATIONS
        // ========================================
        const result = await context.prisma.notification.updateMany({
          where: {
            userId,
            isRead: false,
          },
          data: { isRead: true },
        });

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Tüm bildirimler okundu olarak işaretlendi", {
          userId,
          count: result.count,
          metadata: timer.end(),
        });

        return result.count;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// Delete notification (New mutation)
builder.mutationField("deleteNotification", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("deleteNotification");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);
        const userId = context.user!.id;

        // ========================================
        // SANITIZATION
        // ========================================
        const notificationId = sanitizeInt(args.id);

        // ========================================
        // VALIDATION
        // ========================================
        validateRequired(notificationId, "Bildirim ID");

        // ========================================
        // EXISTENCE CHECK
        // ========================================
        const notification = await context.prisma.notification.findUnique({
          where: { id: notificationId! },
        });

        if (!notification) {
          throw new ValidationError("Bildirim bulunamadı");
        }

        // ========================================
        // PERMISSION CHECK
        // ========================================
        // Only owner or admin can delete
        if (notification.userId !== userId && context.user?.role !== "ADMIN") {
          throw new ValidationError("Bu bildirimi silme yetkiniz yok");
        }

        // ========================================
        // DELETE NOTIFICATION
        // ========================================
        await context.prisma.notification.delete({
          where: { id: notificationId! },
        });

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Bildirim silindi", {
          notificationId,
          userId,
          notificationType: notification.type,
          metadata: timer.end(),
        });

        return true;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// Delete all read notifications
builder.mutationField("deleteAllReadNotifications", (t) =>
  t.field({
    type: "Int",
    authScopes: { user: true },
    resolve: async (_root, _args, context) => {
      const timer = createTimer("deleteAllReadNotifications");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);
        const userId = context.user!.id;

        // ========================================
        // DELETE ALL READ NOTIFICATIONS
        // ========================================
        const result = await context.prisma.notification.deleteMany({
          where: {
            userId,
            isRead: true,
          },
        });

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Okunmuş bildirimler silindi", {
          userId,
          count: result.count,
          metadata: timer.end(),
        });

        return result.count;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// Delete all notifications (read + unread)
builder.mutationField("deleteAllNotifications", (t) =>
  t.field({
    type: "Int",
    authScopes: { user: true },
    resolve: async (_root, _args, context) => {
      const timer = createTimer("deleteAllNotifications");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);
        const userId = context.user!.id;

        // ========================================
        // DELETE ALL NOTIFICATIONS (READ + UNREAD)
        // ========================================
        const result = await context.prisma.notification.deleteMany({
          where: {
            userId,
          },
        });

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Tüm bildirimler silindi", {
          userId,
          count: result.count,
          metadata: timer.end(),
        });

        return result.count;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// ========================================
// BULK OPERATIONS (User)
// ========================================

const BulkNotificationInput = builder.inputType("BulkNotificationInput", {
  fields: (t) => ({
    ids: t.intList({ required: true }),
  }),
});

/**
 * Bulk Mark Notifications as Read
 * ✅ Permission: Authenticated users
 * ✅ Input: Array of notification IDs
 * ✅ User can only mark their own notifications as read
 */
builder.mutationField("bulkMarkNotificationsAsRead", (t) =>
  t.field({
    type: "JSON",
    args: {
      input: t.arg({ type: BulkNotificationInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("bulkMarkNotificationsAsRead");

      try {
        requireAuth(context.user?.id);

        const userId = context.user!.id;

        logInfo("Toplu bildirim okundu işareti başlatılıyor", {
          userId,
          notificationIds: args.input.ids,
        });

        // Only mark user's own notifications
        const results = await context.prisma.notification.updateMany({
          where: {
            id: { in: args.input.ids },
            userId, // Security: Only mark user's notifications
          },
          data: {
            isRead: true,
          },
        });

        // Publish real-time updates
        try {
          for (const notificationId of args.input.ids) {
            await pubsub.publish("notification:read", userId, {
              notificationId,
              isRead: true,
            });
          }
        } catch (pubsubError) {
          logInfo("Toplu okundu real-time yayını başarısız oldu", {
            error: pubsubError,
          });
        }

        logInfo("Toplu bildirim okundu işareti tamamlandı", {
          metadata: timer.end(),
          userId,
          updatedCount: results.count,
        });

        return {
          success: true,
          updatedCount: results.count,
          message: `${results.count} bildirim okundu olarak işaretlendi`,
        };
      } catch (error) {
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

/**
 * Bulk Delete Notifications
 * ✅ Permission: Authenticated users
 * ✅ User can only delete their own notifications or admin can delete any
 */
builder.mutationField("bulkDeleteNotifications", (t) =>
  t.field({
    type: "JSON",
    args: {
      input: t.arg({ type: BulkNotificationInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("bulkDeleteNotifications");

      try {
        requireAuth(context.user?.id);

        const userId = context.user!.id;
        const isAdmin = context.user?.role === "ADMIN";

        logInfo("Toplu bildirim silme başlatılıyor", {
          userId,
          notificationIds: args.input.ids,
          isAdmin,
        });

        // Build where clause based on permissions
        const where: any = { id: { in: args.input.ids } };

        if (!isAdmin) {
          // Regular users can only delete their own notifications
          where.userId = userId;
        }
        // Admin can delete any notification (no additional where clause)

        const results = await context.prisma.notification.deleteMany({
          where,
        });

        logInfo("Toplu bildirim silme tamamlandı", {
          metadata: timer.end(),
          userId,
          deletedCount: results.count,
          isAdmin,
        });

        return {
          success: true,
          deletedCount: results.count,
          message: `${results.count} bildirim silindi`,
        };
      } catch (error) {
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

/**
 * Bulk Delete Notifications by Type
 * ✅ Permission: Authenticated users
 * ✅ Delete all notifications of specific type
 */
builder.mutationField("bulkDeleteNotificationsByType", (t) =>
  t.field({
    type: "JSON",
    args: {
      type: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("bulkDeleteNotificationsByType");

      try {
        requireAuth(context.user?.id);

        const userId = context.user!.id;
        const isAdmin = context.user?.role === "ADMIN";

        logInfo("Tipe göre toplu bildirim silme başlatılıyor", {
          userId,
          type: args.type,
          isAdmin,
        });

        // Build where clause
        const where: any = { type: args.type };

        if (!isAdmin) {
          where.userId = userId;
        }

        const results = await context.prisma.notification.deleteMany({
          where,
        });

        logInfo("Tipe göre toplu bildirim silme tamamlandı", {
          metadata: timer.end(),
          userId,
          type: args.type,
          deletedCount: results.count,
          isAdmin,
        });

        return {
          success: true,
          deletedCount: results.count,
          message: `${results.count} ${args.type} bildirimi silindi`,
        };
      } catch (error) {
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);
