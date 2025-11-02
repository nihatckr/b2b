import { handleError, requireAuth, ValidationError } from "../../utils/errors";
import { createTimer, logInfo } from "../../utils/logger";
import {
  publishMessageRead,
  publishNewMessage,
  publishNotification,
  publishUserMessage,
} from "../../utils/publishHelpers";
import { sanitizeInt, sanitizeString } from "../../utils/sanitize";
import {
  validateEnum,
  validateRequired,
  validateStringLength,
} from "../../utils/validation";
import builder from "../builder";

// ========================================
// MESSAGE MUTATIONS
// ========================================

// Valid Message Types
const ValidMessageTypes = ["general", "order", "sample"];

// Input for sending a message
const SendMessageInput = builder.inputType("SendMessageInput", {
  fields: (t) => ({
    // Schema: String @db.Text (Required)
    content: t.string({ required: true }),
    // Schema: Int? (Foreign key to User)
    receiverId: t.int({ required: false }),
    // Schema: String @default("general")
    type: t.string({ required: false }),
    // Schema: Int? (Foreign key to Order)
    orderId: t.int({ required: false }),
    // Schema: Int? (Foreign key to Sample)
    sampleId: t.int({ required: false }),
    // Schema: Int? (Foreign key to Company)
    companyId: t.int({ required: false }),
  }),
});

// Send message
builder.mutationField("sendMessage", (t) =>
  t.prismaField({
    type: "Message",
    args: {
      input: t.arg({ type: SendMessageInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("sendMessage");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);

        const input = args.input;

        // ========================================
        // SANITIZATION
        // ========================================
        const content = sanitizeString(input.content);
        const receiverId = input.receiverId
          ? sanitizeInt(input.receiverId)
          : undefined;
        const type = input.type ? sanitizeString(input.type) : "general";
        const orderId = input.orderId ? sanitizeInt(input.orderId) : undefined;
        const sampleId = input.sampleId
          ? sanitizeInt(input.sampleId)
          : undefined;
        const companyId = input.companyId
          ? sanitizeInt(input.companyId)
          : undefined;

        // ========================================
        // VALIDATION
        // ========================================
        validateRequired(content, "content");
        validateStringLength(content, "content", 1, 10000);

        if (type) {
          validateEnum(type, "type", ValidMessageTypes);
        }

        // Business logic: Mesaj için en az bir context gerekli (receiver, order veya sample)
        if (!receiverId && !orderId && !sampleId) {
          throw new ValidationError(
            "Mesaj için alıcı, sipariş veya numune belirtilmelidir"
          );
        }

        // ========================================
        // BUSINESS LOGIC
        // ========================================

        // Validate receiver exists (if provided)
        if (receiverId) {
          const receiverExists = await context.prisma.user.findUnique({
            where: { id: receiverId },
          });

          if (!receiverExists) {
            throw new ValidationError(
              `Alıcı kullanıcı (ID: ${receiverId}) bulunamadı`
            );
          }
        }

        // Validate order exists (if provided)
        if (orderId) {
          const orderExists = await context.prisma.order.findUnique({
            where: { id: orderId },
          });

          if (!orderExists) {
            throw new ValidationError(`Sipariş (ID: ${orderId}) bulunamadı`);
          }
        }

        // Validate sample exists (if provided)
        if (sampleId) {
          const sampleExists = await context.prisma.sample.findUnique({
            where: { id: sampleId },
          });

          if (!sampleExists) {
            throw new ValidationError(`Numune (ID: ${sampleId}) bulunamadı`);
          }
        }

        // ========================================
        // DATABASE OPERATION
        // ========================================
        const message = await context.prisma.message.create({
          ...query,
          data: {
            content: content!,
            senderId: context.user.id,
            receiverId: receiverId || null,
            type: type || "general",
            orderId: orderId || null,
            sampleId: sampleId || null,
            companyId: companyId || null,
            isRead: false,
          },
        });

        // ========================================
        // NOTIFICATION
        // ========================================
        if (receiverId) {
          try {
            const notification = await context.prisma.notification.create({
              data: {
                userId: receiverId,
                type: "SYSTEM",
                title: "Yeni Mesaj",
                message: "Yeni bir mesaj aldınız",
                data: JSON.stringify({
                  messageId: message.id,
                  senderId: context.user.id,
                  type,
                  ...(orderId && { orderId }),
                  ...(sampleId && { sampleId }),
                }),
                link: orderId
                  ? `/orders/${orderId}`
                  : sampleId
                  ? `/samples/${sampleId}`
                  : "/messages",
                isRead: false,
              },
            });
            await publishNotification(notification);
          } catch (notifError) {
            // Bildirim hatası mesaj gönderimini engellemez
            logInfo("Mesaj bildirimi gönderilemedi (mesaj oluşturuldu)", {
              messageId: message.id,
              receiverId,
            });
          }
        }

        // ========================================
        // REAL-TIME SUBSCRIPTIONS
        // ========================================
        try {
          // Prepare message payload for subscriptions
          const messagePayload = {
            id: message.id,
            content: message.content,
            type: message.type,
            orderId: message.orderId,
            sampleId: message.sampleId,
            senderId: message.senderId,
            receiverId: message.receiverId,
            isRead: message.isRead,
            createdAt: message.createdAt,
          };

          // Publish to context channel (order or sample)
          const contextId = orderId || sampleId;
          if (contextId) {
            await publishNewMessage(contextId, messagePayload);
          }

          // Publish to receiver's personal channel
          if (receiverId) {
            await publishUserMessage(receiverId, messagePayload);
          }
        } catch (subError) {
          // Subscription hatası mesaj gönderimini engellemez
          logInfo("Mesaj subscription yayınlanamadı (mesaj oluşturuldu)", {
            messageId: message.id,
            error: subError,
          });
        }

        // ========================================
        // LOGGING
        // ========================================
        logInfo("Mesaj gönderildi", {
          userId: context.user.id,
          messageId: message.id,
          receiverId,
          type,
          orderId,
          sampleId,
        });

        timer.end({ success: true });
        return message;
      } catch (error) {
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Mark message as read
builder.mutationField("markMessageAsRead", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("markMessageAsRead");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);

        const id = sanitizeInt(args.id)!;

        // Fetch existing message
        const message = await context.prisma.message.findUnique({
          where: { id },
        });

        if (!message) {
          throw new ValidationError(`Mesaj (ID: ${id}) bulunamadı`);
        }

        // Permission check: Only receiver can mark as read
        if (message.receiverId !== context.user.id) {
          throw new ValidationError(
            "Bu mesajı okundu olarak işaretleme yetkiniz yok"
          );
        }

        // ========================================
        // DATABASE OPERATION
        // ========================================
        const updatedMessage = await context.prisma.message.update({
          where: { id },
          data: { isRead: true },
        });

        // ========================================
        // REAL-TIME SUBSCRIPTIONS
        // ========================================
        try {
          // Publish message read event to context channel
          const contextId = updatedMessage.orderId || updatedMessage.sampleId;
          if (contextId) {
            await publishMessageRead(contextId, {
              messageId: id,
              isRead: true,
              readAt: new Date(),
            });
          }
        } catch (subError) {
          // Subscription hatası mesaj güncellemeyi engellemez
          logInfo("Mesaj okundu subscription yayınlanamadı", {
            messageId: id,
            error: subError,
          });
        }

        // ========================================
        // LOGGING
        // ========================================
        logInfo("Mesaj okundu olarak işaretlendi", {
          userId: context.user.id,
          messageId: id,
        });

        timer.end({ success: true });
        return true;
      } catch (error) {
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Delete message
builder.mutationField("deleteMessage", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("deleteMessage");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);

        const id = sanitizeInt(args.id)!;

        // Fetch existing message
        const message = await context.prisma.message.findUnique({
          where: { id },
        });

        if (!message) {
          throw new ValidationError(`Mesaj (ID: ${id}) bulunamadı`);
        }

        // Permission check: Only sender or admin can delete
        if (
          message.senderId !== context.user.id &&
          context.user.role !== "ADMIN"
        ) {
          throw new ValidationError("Bu mesajı silme yetkiniz yok");
        }

        // ========================================
        // DATABASE OPERATION (Hard Delete)
        // ========================================
        await context.prisma.message.delete({
          where: { id },
        });

        // ========================================
        // LOGGING
        // ========================================
        logInfo("Mesaj silindi", {
          userId: context.user.id,
          messageId: id,
          senderId: message.senderId,
          receiverId: message.receiverId,
        });

        timer.end({ success: true });
        return true;
      } catch (error) {
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// ========================================
// BULK OPERATIONS (User)
// ========================================

// ========================================
// INPUT TYPES FOR BULK OPERATIONS
// ========================================

const BulkMessageInput = builder.inputType("BulkMessageInput", {
  fields: (t) => ({
    ids: t.intList({ required: true }),
  }),
});

/**
 * Bulk Mark Messages as Read
 * ✅ Permission: Authenticated users
 * ✅ Input: Array of message IDs
 * ✅ User can only mark their received messages as read
 */
builder.mutationField("bulkMarkAsRead", (t) =>
  t.field({
    type: "JSON",
    args: {
      input: t.arg({ type: BulkMessageInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("bulkMarkAsRead");

      try {
        requireAuth(context.user?.id);

        const userId = context.user!.id;

        logInfo("Toplu mesaj okundu işareti başlatılıyor", {
          userId,
          messageIds: args.input.ids,
        });

        // Only mark messages where user is the receiver
        const results = await context.prisma.message.updateMany({
          where: {
            id: { in: args.input.ids },
            receiverId: userId, // Security: Only mark user's received messages
          },
          data: {
            isRead: true,
          },
        });

        // Publish read events for real-time updates
        try {
          for (const messageId of args.input.ids) {
            const message = await context.prisma.message.findUnique({
              where: { id: messageId },
              select: { orderId: true, sampleId: true },
            });

            if (message) {
              const contextId = message.orderId || message.sampleId;
              if (contextId) {
                await publishMessageRead(contextId, {
                  messageId,
                  isRead: true,
                  readAt: new Date(),
                });
              }
            }
          }
        } catch (subError) {
          logInfo("Toplu okundu subscription yayınlanamadı", {
            error: subError,
          });
        }

        logInfo("Toplu mesaj okundu işareti tamamlandı", {
          metadata: timer.end(),
          userId,
          updatedCount: results.count,
        });

        return {
          success: true,
          updatedCount: results.count,
          message: `${results.count} mesaj okundu olarak işaretlendi`,
        };
      } catch (error) {
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

/**
 * Bulk Delete Messages
 * ✅ Permission: Authenticated users
 * ✅ User can only delete their sent messages or admin can delete any
 */
builder.mutationField("bulkDeleteMessages", (t) =>
  t.field({
    type: "JSON",
    args: {
      input: t.arg({ type: BulkMessageInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("bulkDeleteMessages");

      try {
        requireAuth(context.user?.id);

        const userId = context.user!.id;
        const isAdmin = context.user?.role === "ADMIN";

        logInfo("Toplu mesaj silme başlatılıyor", {
          userId,
          messageIds: args.input.ids,
          isAdmin,
        });

        // Build where clause based on permissions
        const where: any = { id: { in: args.input.ids } };

        if (!isAdmin) {
          // Regular users can only delete their sent messages
          where.senderId = userId;
        }
        // Admin can delete any message (no additional where clause)

        const results = await context.prisma.message.deleteMany({
          where,
        });

        logInfo("Toplu mesaj silme tamamlandı", {
          metadata: timer.end(),
          userId,
          deletedCount: results.count,
          isAdmin,
        });

        return {
          success: true,
          deletedCount: results.count,
          message: `${results.count} mesaj silindi`,
        };
      } catch (error) {
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);
