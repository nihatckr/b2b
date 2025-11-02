/**
 * Order Negotiation Mutations - PRODUCTION READY
 *
 * Handle price/terms negotiations between customers and manufacturers
 * Full sanitization, validation, structured logging, Turkish errors
 */

import { publishNotification } from "../../utils/publishHelpers";
import builder from "../builder";

// Error handling utilities
import { handleError, requireAuth, ValidationError } from "../../utils/errors";

// Logging utilities
import { createTimer, logInfo } from "../../utils/logger";

// Sanitization utilities
import {
  sanitizeFloat,
  sanitizeInt,
  sanitizeString,
} from "../../utils/sanitize";

// Validation utilities
import {
  validateRange,
  validateRequired,
  validateStringLength,
} from "../../utils/validation";

// ========================================
// ORDER NEGOTIATION MUTATIONS
// 2 mutations: sendOrderOffer, respondToOrderOffer
// 1 query: orderNegotiations
// ========================================

// Valid Sender Roles (from schema)
const ValidSenderRoles = ["CUSTOMER", "MANUFACTURER"];

// Valid Negotiation Status (from schema)
const ValidNegotiationStatus = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "SUPERSEDED",
];

// Input for sending order offer
const SendOrderOfferInput = builder.inputType("SendOrderOfferInput", {
  fields: (t) => ({
    // Schema: Int (Required - Foreign key to Order)
    orderId: t.int({ required: true }),
    // Schema: Float (Required - Unit price in USD)
    unitPrice: t.float({ required: true }),
    // Schema: Int (Required - Production days)
    productionDays: t.int({ required: true }),
    // Schema: Int? (Optional - Quantity, if different from order)
    quantity: t.int({ required: false }),
    // Schema: String? @db.Text (Optional - Message)
    message: t.string({ required: false }),
  }),
});

// Input for responding to offer
const RespondToOfferInput = builder.inputType("RespondToOfferInput", {
  fields: (t) => ({
    // Schema: Int (Required - OrderNegotiation ID)
    negotiationId: t.int({ required: true }),
    // Schema: Boolean (Required - Accept or Reject)
    accepted: t.boolean({ required: true }),
  }),
});

// Note: OrderNegotiation type is already defined in types/index.ts

/**
 * Mutation: sendOrderOffer
 *
 * Send price/terms negotiation offer (customer or manufacturer)
 */
builder.mutationField("sendOrderOffer", (t) =>
  t.prismaField({
    type: "OrderNegotiation",
    args: {
      input: t.arg({ type: SendOrderOfferInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("sendOrderOffer");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);
        const userId = context.user!.id;

        // ========================================
        // SANITIZATION
        // ========================================
        const orderId = sanitizeInt(args.input.orderId);
        const unitPrice = sanitizeFloat(args.input.unitPrice);
        const productionDays = sanitizeInt(args.input.productionDays);
        const quantity = args.input.quantity
          ? sanitizeInt(args.input.quantity)
          : undefined;
        const message = args.input.message
          ? sanitizeString(args.input.message)
          : undefined;

        // ========================================
        // VALIDATION
        // ========================================
        validateRequired(orderId, "Sipariş ID");
        validateRequired(unitPrice, "Birim fiyat");
        validateRequired(productionDays, "Üretim süresi");

        // Range validations
        validateRange(unitPrice!, "Birim fiyat", 0.01, 1000000);
        validateRange(productionDays!, "Üretim süresi", 1, 365);

        if (quantity) {
          validateRange(quantity, "Miktar", 1, 1000000);
        }

        // String length validation
        if (message) {
          validateStringLength(message, "Mesaj", 1, 2000);
        }

        // ========================================
        // EXISTENCE CHECK
        // ========================================
        // Get order to check permissions
        const order = await context.prisma.order.findUnique({
          where: { id: orderId! },
          include: {
            customer: true,
            collection: { include: { company: true } },
          },
        });

        if (!order) {
          throw new ValidationError("Sipariş bulunamadı");
        }

        // ========================================
        // PERMISSION CHECK & ROLE DETERMINATION
        // ========================================
        let senderRole: string = "CUSTOMER";
        let hasPermission = false;

        if (order.customerId === userId) {
          senderRole = "CUSTOMER";
          hasPermission = true;
        } else if (order.collection?.companyId === context.user?.companyId) {
          senderRole = "MANUFACTURER";
          hasPermission = true;
        } else if (context.user?.role === "ADMIN") {
          // Admin can send on behalf of either party
          senderRole = "MANUFACTURER"; // Default to manufacturer
          hasPermission = true;
        }

        if (!hasPermission) {
          throw new ValidationError(
            "Bu sipariş için teklif gönderme yetkiniz yok"
          );
        }

        // ========================================
        // BUSINESS LOGIC - SUPERSEDE OLD OFFERS
        // ========================================
        // Mark all previous pending offers as SUPERSEDED
        const supersededCount = await context.prisma.orderNegotiation.updateMany({
          where: {
            orderId: orderId!,
            status: "PENDING",
          },
          data: {
            status: "SUPERSEDED",
          },
        });

        logInfo("Önceki bekleyen teklifler geçersiz kılındı", {
          orderId: orderId!,
          supersededCount: supersededCount.count,
        });

        // ========================================
        // CREATE NEW NEGOTIATION
        // ========================================
        const negotiation = await context.prisma.orderNegotiation.create({
          ...query,
          data: {
            orderId: orderId!,
            senderId: userId,
            senderRole,
            unitPrice: unitPrice!,
            productionDays: productionDays!,
            quantity: quantity || order.quantity,
            message: message || null,
            status: "PENDING",
            currency: "USD",
          },
        });

        // ========================================
        // UPDATE ORDER STATUS
        // ========================================
        if (senderRole === "MANUFACTURER") {
          await context.prisma.order.update({
            where: { id: orderId! },
            data: {
              status: "QUOTE_SENT",
              unitPrice: unitPrice!,
              productionDays: productionDays!,
              manufacturerResponse: message || null,
            },
          });
        } else {
          await context.prisma.order.update({
            where: { id: orderId! },
            data: {
              status: "CUSTOMER_QUOTE_SENT",
              customerQuotedPrice: unitPrice!,
              customerQuoteDays: productionDays!,
              customerQuoteNote: message || null,
              customerQuoteSentAt: new Date(),
            },
          });
        }

        // ========================================
        // REAL-TIME NOTIFICATIONS
        // ========================================
        if (senderRole === "MANUFACTURER") {
          // Notify customer
          try {
            const customerNotif = await context.prisma.notification.create({
              data: {
                userId: order.customerId,
                title: "🎯 Yeni Teklif Aldınız",
                message: `${
                  order.collection?.company?.name || "Üretici"
                } siparişiniz için teklif gönderdi. Birim fiyat: $${unitPrice}, Üretim süresi: ${productionDays} gün`,
                type: "ORDER",
                orderId: orderId!,
                link: `/dashboard/orders/${orderId}`,
              },
            });
            await publishNotification(customerNotif);
          } catch (notificationError) {
            logInfo("Müşteri bildirimi başarısız", {
              customerId: order.customerId,
              negotiationId: negotiation.id,
            });
          }
        } else {
          // Notify manufacturer company users
          if (order.collection?.companyId) {
            const companyUsers = await context.prisma.user.findMany({
              where: { companyId: order.collection.companyId },
            });

            for (const user of companyUsers) {
              try {
                const notif = await context.prisma.notification.create({
                  data: {
                    userId: user.id,
                    title: "📦 Sipariş Teklifi Aldınız",
                    message: `${
                      order.customer.name
                    } sizden teklif istedi. Sipariş No: ${
                      order.orderNumber
                    }, Adet: ${quantity || order.quantity}`,
                    type: "ORDER",
                    orderId: orderId!,
                    link: `/dashboard/orders/${orderId}`,
                  },
                });
                await publishNotification(notif);
              } catch (notificationError) {
                logInfo("Üretici bildirimi başarısız", {
                  userId: user.id,
                  negotiationId: negotiation.id,
                });
              }
            }
          }
        }

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Sipariş teklifi gönderildi", {
          negotiationId: negotiation.id,
          orderId: orderId!,
          userId,
          senderRole,
          unitPrice: unitPrice!,
          productionDays: productionDays!,
          quantity: quantity || order.quantity,
          supersededCount: supersededCount.count,
          metadata: timer.end(),
        });

        return negotiation;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * Mutation: respondToOrderOffer
 *
 * Accept or reject a negotiation offer
 */
builder.mutationField("respondToOrderOffer", (t) =>
  t.prismaField({
    type: "OrderNegotiation",
    args: {
      input: t.arg({ type: RespondToOfferInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("respondToOrderOffer");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);
        const userId = context.user!.id;

        // ========================================
        // SANITIZATION
        // ========================================
        const negotiationId = sanitizeInt(args.input.negotiationId);
        const accepted = Boolean(args.input.accepted);

        // ========================================
        // VALIDATION
        // ========================================
        validateRequired(negotiationId, "Teklif ID");

        // ========================================
        // EXISTENCE CHECK
        // ========================================
        // Get negotiation and order
        const negotiation = await context.prisma.orderNegotiation.findUnique({
          where: { id: negotiationId! },
          include: {
            order: {
              include: {
                customer: true,
                collection: { include: { company: true } },
              },
            },
          },
        });

        if (!negotiation) {
          throw new ValidationError("Teklif bulunamadı");
        }

        const order = negotiation.order;

        // Check if negotiation is still pending
        if (negotiation.status !== "PENDING") {
          throw new ValidationError(
            `Bu teklif zaten ${
              negotiation.status === "ACCEPTED"
                ? "kabul edildi"
                : negotiation.status === "REJECTED"
                ? "reddedildi"
                : "geçersiz kılındı"
            }`
          );
        }

        // ========================================
        // PERMISSION CHECK
        // ========================================
        let hasPermission = false;

        if (negotiation.senderRole === "CUSTOMER") {
          // Manufacturer should respond
          if (
            order.collection?.companyId === context.user?.companyId ||
            context.user?.role === "ADMIN"
          ) {
            hasPermission = true;
          }
        } else {
          // Customer should respond
          if (order.customerId === userId || context.user?.role === "ADMIN") {
            hasPermission = true;
          }
        }

        if (!hasPermission) {
          throw new ValidationError("Bu teklife yanıt verme yetkiniz yok");
        }

        // ========================================
        // UPDATE NEGOTIATION
        // ========================================
        const updatedNegotiation = await context.prisma.orderNegotiation.update({
          ...query,
          where: { id: negotiationId! },
          data: {
            status: accepted ? "ACCEPTED" : "REJECTED",
            respondedAt: new Date(),
            respondedBy: userId,
          },
        });

        // ========================================
        // BUSINESS LOGIC - ORDER STATUS UPDATE
        // ========================================
        if (accepted) {
          // Accepted: Update order with negotiation terms
          await context.prisma.order.update({
            where: { id: negotiation.orderId },
            data: {
              status: "CONFIRMED",
              unitPrice: negotiation.unitPrice,
              totalPrice:
                negotiation.unitPrice *
                (negotiation.quantity || order.quantity),
              productionDays: negotiation.productionDays,
            },
          });
        } else {
          // Rejected: Revert order status
          const newStatus =
            negotiation.senderRole === "CUSTOMER"
              ? "QUOTE_SENT"
              : "CUSTOMER_QUOTE_SENT";

          await context.prisma.order.update({
            where: { id: negotiation.orderId },
            data: {
              status: newStatus,
            },
          });
        }

        // ========================================
        // REAL-TIME NOTIFICATIONS
        // ========================================
        try {
          const notif = await context.prisma.notification.create({
            data: {
              userId: negotiation.senderId,
              title: accepted
                ? "✅ Teklif Kabul Edildi"
                : "❌ Teklif Reddedildi",
              message: `${
                negotiation.senderRole === "CUSTOMER"
                  ? order.collection?.company?.name || "Üretici"
                  : order.customer.name || "Müşteri"
              } teklifinizi ${
                accepted ? "kabul etti" : "reddetti"
              }. Sipariş No: ${order.orderNumber}`,
              type: "ORDER",
              orderId: negotiation.orderId,
              link: `/dashboard/orders/${negotiation.orderId}`,
            },
          });
          await publishNotification(notif);
        } catch (notificationError) {
          logInfo("Gönderen bildirimi başarısız", {
            senderId: negotiation.senderId,
            negotiationId: negotiation.id,
            accepted: accepted,
          });
        }

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Teklif yanıtlandı", {
          negotiationId: negotiation.id,
          orderId: negotiation.orderId,
          userId,
          accepted: accepted,
          newStatus: accepted ? "ACCEPTED" : "REJECTED",
          senderRole: negotiation.senderRole,
          metadata: timer.end(),
        });

        return updatedNegotiation;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * Query: orderNegotiations
 *
 * Get all negotiation history for an order
 */
builder.queryField("orderNegotiations", (t) =>
  t.prismaField({
    type: ["OrderNegotiation"],
    args: {
      orderId: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("orderNegotiations");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);
        const userId = context.user!.id;

        // ========================================
        // SANITIZATION
        // ========================================
        const orderId = sanitizeInt(args.orderId);

        // ========================================
        // VALIDATION
        // ========================================
        validateRequired(orderId, "Sipariş ID");

        // ========================================
        // EXISTENCE CHECK
        // ========================================
        // Get order to check permissions
        const order = await context.prisma.order.findUnique({
          where: { id: orderId! },
          include: {
            customer: true,
            collection: { include: { company: true } },
          },
        });

        if (!order) {
          throw new ValidationError("Sipariş bulunamadı");
        }

        // ========================================
        // PERMISSION CHECK
        // ========================================
        let hasAccess = false;

        if (context.user?.role === "ADMIN") {
          hasAccess = true;
        } else if (order.customerId === userId) {
          hasAccess = true;
        } else if (order.collection?.companyId === context.user?.companyId) {
          hasAccess = true;
        }

        if (!hasAccess) {
          throw new ValidationError(
            "Bu siparişin tekliflerini görüntüleme yetkiniz yok"
          );
        }

        // ========================================
        // FETCH NEGOTIATIONS
        // ========================================
        const negotiations = await context.prisma.orderNegotiation.findMany({
          ...query,
          where: {
            orderId: orderId!,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Sipariş teklifleri listelendi", {
          orderId: orderId!,
          userId,
          negotiationCount: negotiations.length,
          metadata: timer.end(),
        });

        return negotiations;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);
