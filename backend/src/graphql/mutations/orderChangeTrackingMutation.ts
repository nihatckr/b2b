/**
 * Order Change Tracking Mutations - PRODUCTION READY
 *
 * Handle order modifications and manufacturer responses
 * Full sanitization, validation, structured logging, Turkish errors
 */

import { handleError, requireAuth, ValidationError } from "../../utils/errors";
import { createTimer, logInfo } from "../../utils/logger";
import { publishNotification } from "../../utils/publishHelpers";
import {
  sanitizeBoolean,
  sanitizeInt,
  sanitizeString,
} from "../../utils/sanitize";
import {
  validateEnum,
  validateRequired,
  validateStringLength,
} from "../../utils/validation";
import builder from "../builder";

// ========================================
// ORDER CHANGE TRACKING MUTATIONS
// 2 mutations: trackOrderUpdate, reviewOrderChange
// ========================================

// Valid Change Types (from schema)
const ValidChangeTypes = [
  "QUANTITY",
  "PRICE",
  "DEADLINE",
  "NOTES",
  "SPECIFICATIONS",
  "FULL_UPDATE",
  "OTHER",
];

// Valid Manufacturer Status (from schema)
const ValidManufacturerStatus = [
  "PENDING",
  "REVIEWED",
  "ACCEPTED",
  "REJECTED",
  "NEGOTIATED",
];

// Input for tracking order update
const TrackOrderUpdateInput = builder.inputType("TrackOrderUpdateInput", {
  fields: (t) => ({
    // Schema: Int (Required - Foreign key to Order)
    orderId: t.int({ required: true }),
    // Schema: String (Required - Enum)
    changeType: t.string({ required: true }),
    // Schema: Json (Required - Previous values)
    previousValues: t.field({ type: "JSON", required: true }),
    // Schema: Json (Required - New values)
    newValues: t.field({ type: "JSON", required: true }),
    // Schema: String? @db.Text (Optional - Reason)
    changeReason: t.string({ required: false }),
  }),
});

// Input for reviewing order change
const ReviewOrderChangeInput = builder.inputType("ReviewOrderChangeInput", {
  fields: (t) => ({
    // Schema: Int (Required - OrderChangeLog ID)
    changeLogId: t.int({ required: true }),
    // Schema: String (Required - Enum)
    status: t.string({ required: true }),
    // Schema: String? @db.Text (Optional - Response)
    response: t.string({ required: false }),
    // Schema: Boolean @default(false)
    triggerNegotiation: t.boolean({ required: false }),
  }),
});

/**
 * Mutation: trackOrderUpdate
 *
 * Tracks when a customer makes changes to an order
 */
builder.mutationField("trackOrderUpdate", (t) =>
  t.prismaField({
    type: "OrderChangeLog",
    args: {
      input: t.arg({ type: TrackOrderUpdateInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("trackOrderUpdate");

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
        const changeType = sanitizeString(args.input.changeType);
        const changeReason = args.input.changeReason
          ? sanitizeString(args.input.changeReason)
          : undefined;

        // previousValues and newValues are already validated as JSON by GraphQL

        // ========================================
        // VALIDATION
        // ========================================
        validateRequired(orderId, "Sipariş ID");
        validateRequired(changeType, "Değişiklik tipi");

        // Enum validation
        validateEnum(changeType!, "Değişiklik tipi", ValidChangeTypes);

        // String length validation
        if (changeReason) {
          validateStringLength(changeReason, "Değişiklik nedeni", 1, 1000);
        }

        // JSON validation
        const previousValues = args.input.previousValues;
        const newValues = args.input.newValues;

        if (!previousValues || typeof previousValues !== "object") {
          throw new ValidationError(
            "Önceki değerler geçerli bir JSON objesi olmalı"
          );
        }

        if (!newValues || typeof newValues !== "object") {
          throw new ValidationError(
            "Yeni değerler geçerli bir JSON objesi olmalı"
          );
        }

        // ========================================
        // EXISTENCE & PERMISSION CHECKS
        // ========================================
        // Verify order exists and user has permission
        const order = await context.prisma.order.findUnique({
          where: { id: orderId! },
          include: {
            customer: true,
            manufacture: true,
            collection: {
              include: {
                company: {
                  include: {
                    employees: true,
                  },
                },
              },
            },
          },
        });

        if (!order) {
          throw new ValidationError("Sipariş bulunamadı");
        }

        // Check permission - only customer can track their own order changes
        if (order.customerId !== userId) {
          throw new ValidationError("Bu siparişi değiştirme izniniz yok");
        }

        // ========================================
        // CREATE CHANGE LOG
        // ========================================
        const changeLog = await context.prisma.orderChangeLog.create({
          ...query,
          data: {
            orderId: orderId!,
            changedBy: userId,
            changeType: changeType!,
            previousValues: previousValues as any,
            newValues: newValues as any,
            changeReason: changeReason || null,
            manufacturerStatus: "PENDING",
          },
        });

        // ========================================
        // REAL-TIME NOTIFICATIONS
        // ========================================
        // Notify manufacturer company employees
        const manufacturerCompany = order.collection?.company;
        if (manufacturerCompany) {
          const employeesToNotify = manufacturerCompany.employees;

          for (const employee of employeesToNotify) {
            if (employee) {
              try {
                const notification = await context.prisma.notification.create({
                  data: {
                    userId: employee.id,
                    title: "🔄 Sipariş Değişikliği",
                    message: `${
                      order.customer?.name || "Müşteri"
                    } sipariş detaylarını değiştirdi. Sipariş No: ${
                      order.orderNumber || "N/A"
                    }. Değişiklik: ${changeType}`,
                    type: "ORDER_UPDATE",
                    orderId: order.id,
                    link: `/dashboard/orders/${order.id}`,
                  },
                });
                await publishNotification(notification);
              } catch (notificationError) {
                logInfo("Bildirim gönderimi başarısız", {
                  employeeId: employee.id,
                  changeLogId: changeLog.id,
                });
                // Don't block operation if notification fails
              }
            }
          }
        }

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Sipariş değişikliği kaydedildi", {
          changeLogId: changeLog.id,
          orderId: order.id,
          userId,
          changeType: changeLog.changeType,
          notifiedEmployees: manufacturerCompany?.employees?.length || 0,
          metadata: timer.end(),
        });

        return changeLog;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * Mutation: reviewOrderChange
 *
 * Allows manufacturers to review and respond to order changes
 */
builder.mutationField("reviewOrderChange", (t) =>
  t.prismaField({
    type: "OrderChangeLog",
    args: {
      input: t.arg({ type: ReviewOrderChangeInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("reviewOrderChange");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);
        const userId = context.user!.id;

        // ========================================
        // SANITIZATION
        // ========================================
        const changeLogId = sanitizeInt(args.input.changeLogId);
        const status = sanitizeString(args.input.status);
        const response = args.input.response
          ? sanitizeString(args.input.response)
          : undefined;
        const triggerNegotiation = args.input.triggerNegotiation
          ? sanitizeBoolean(args.input.triggerNegotiation)
          : false;

        // ========================================
        // VALIDATION
        // ========================================
        validateRequired(changeLogId, "Değişiklik kaydı ID");
        validateRequired(status, "Durum");

        // Enum validation
        validateEnum(status!, "Durum", ValidManufacturerStatus);

        // String length validation
        if (response) {
          validateStringLength(response, "Yanıt", 1, 2000);
        }

        // ========================================
        // EXISTENCE CHECK
        // ========================================
        // Get change log with full order details
        const changeLog = await context.prisma.orderChangeLog.findUnique({
          where: { id: changeLogId! },
          include: {
            order: {
              include: {
                customer: true,
                manufacture: true,
                collection: {
                  include: {
                    company: {
                      include: {
                        employees: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!changeLog) {
          throw new ValidationError("Değişiklik kaydı bulunamadı");
        }

        // ========================================
        // PERMISSION CHECK
        // ========================================
        // Only manufacturer or company employees can review
        const isManufacturer = changeLog.order.manufactureId === userId;
        const isCompanyEmployee =
          changeLog.order.collection?.company?.employees?.some(
            (emp) => emp.id === userId
          );

        if (!isManufacturer && !isCompanyEmployee) {
          throw new ValidationError("Bu değişikliği inceleme izniniz yok");
        }

        // ========================================
        // BUSINESS LOGIC - START NEGOTIATION IF REQUESTED
        // ========================================
        let negotiationId: number | null = null;

        if (triggerNegotiation && changeLog.order) {
          // Create negotiation
          const negotiation = await context.prisma.orderNegotiation.create({
            data: {
              orderId: changeLog.orderId,
              senderId: userId,
              senderRole: "MANUFACTURER",
              unitPrice: changeLog.order.unitPrice,
              productionDays: changeLog.order.productionDays || 30,
              message:
                response || "Sipariş değişikliği için pazarlık gerekiyor",
              status: "PENDING",
            },
          });
          negotiationId = negotiation.id;

          logInfo("Sipariş değişikliği için pazarlık başlatıldı", {
            negotiationId: negotiation.id,
            orderId: changeLog.orderId,
            userId,
          });
        }

        // ========================================
        // UPDATE CHANGE LOG
        // ========================================
        const updatedChangeLog = await context.prisma.orderChangeLog.update({
          ...query,
          where: { id: changeLogId! },
          data: {
            manufacturerStatus: status!,
            manufacturerResponse: response || null,
            manufacturerReviewedAt: new Date(),
            manufacturerReviewedBy: userId,
            negotiationTriggered: triggerNegotiation || false,
            negotiationId,
          },
        });

        // ========================================
        // REAL-TIME NOTIFICATION
        // ========================================
        // Notify customer about manufacturer response
        try {
          const notification = await context.prisma.notification.create({
            data: {
              userId: changeLog.order.customerId,
              title: "📝 Değişiklik Yanıtı",
              message: triggerNegotiation
                ? `${
                    changeLog.order.collection?.company?.name || "Üretici"
                  } sipariş değişikliğinize karşı pazarlık başlattı`
                : `${
                    changeLog.order.collection?.company?.name || "Üretici"
                  } sipariş değişikliğinizi ${
                    status === "ACCEPTED"
                      ? "kabul etti"
                      : status === "REJECTED"
                      ? "reddetti"
                      : "inceledi"
                  }`,
              type: "ORDER_CHANGE_RESPONSE",
              orderId: changeLog.orderId,
              link: `/dashboard/orders/${changeLog.orderId}`,
            },
          });
          await publishNotification(notification);
        } catch (notificationError) {
          logInfo("Bildirim gönderimi başarısız", {
            customerId: changeLog.order.customerId,
            changeLogId: updatedChangeLog.id,
          });
          // Don't block operation if notification fails
        }

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Sipariş değişikliği incelendi", {
          changeLogId: updatedChangeLog.id,
          orderId: changeLog.orderId,
          userId,
          status: updatedChangeLog.manufacturerStatus,
          negotiationTriggered: triggerNegotiation,
          negotiationId,
          metadata: timer.end(),
        });

        return updatedChangeLog;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);
