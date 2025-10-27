/**
 * Order Change Tracking Mutations
 *
 * Handle order modifications and manufacturer responses
 */

import { requireAuth } from "../../utils/errors";
import { publishNotification } from "../../utils/publishHelpers";
import { builder } from "../builder";
import { OrderChangeLogStatus, OrderChangeType } from "../enums";


/**
 * Mutation: trackOrderUpdate
 *
 * Tracks when a customer makes changes to an order
 */
builder.mutationField("trackOrderUpdate", (t) =>
  t.prismaField({
    type: "OrderChangeLog",
    args: {
      orderId: t.arg.int({ required: true }),
      changeType: t.arg({ type: OrderChangeType, required: true }),
      previousValues: t.arg({ type: "JSON", required: true }),
      newValues: t.arg({ type: "JSON", required: true }),
      changeReason: t.arg.string({ required: false }),
    },
    authScopes: { user: true },
    resolve: async (query, parent, args, context) => {
      requireAuth(context.user?.id);

      const { orderId, changeType, previousValues, newValues, changeReason } = args;

      // Verify order exists and user has permission
      const order = await context.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
          manufacturer: true,
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
        throw new Error("Sipariş bulunamadı");
      }

      // Check permission - only customer can track their own order changes
      if (order.customerId !== context.user.id) {
        throw new Error("Bu siparişi değiştirme izniniz yok");
      }

      // Create change log
      const changeLog = await context.prisma.orderChangeLog.create({
        ...query,
        data: {
          orderId,
          changedBy: context.user.id,
          changeType: changeType as string,
          previousValues: previousValues as any,
          newValues: newValues as any,
          changeReason: changeReason || null,
          manufacturerStatus: "PENDING",
        },
      });

      // Get the created change log with full relations for notification
      const fullChangeLog = await context.prisma.orderChangeLog.findUnique({
        where: { id: changeLog.id },
        include: {
          order: {
            include: {
              customer: true,
              manufacturer: true,
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

      if (!fullChangeLog) {
        return changeLog;
      }

      // Notify manufacturer and company employees
      const manufacturerCompany = fullChangeLog.order.collection?.company;
      if (manufacturerCompany) {
        // Notify company employees
        const employeesToNotify = [
          fullChangeLog.order.manufacturer, // Primary manufacturer
          ...manufacturerCompany.employees.filter(emp => emp.id !== fullChangeLog.order.manufacturerId),
        ];

        for (const employee of employeesToNotify) {
          if (employee) {
            const notification = await context.prisma.notification.create({
              data: {
                userId: employee.id,
                title: "🔄 Sipariş Değişikliği",
                message: `${fullChangeLog.order.customer.name} sipariş detaylarını değiştirdi. Sipariş No: ${fullChangeLog.order.orderNumber}. Değişiklik: ${changeType}`,
                type: "INFO",
                orderId: fullChangeLog.order.id,
                link: `/dashboard/orders/${fullChangeLog.order.id}`,
              },
            });
            await publishNotification(notification);
          }
        }
      }

      return changeLog;
    },
  })
);

/**
 * Mutation: reviewOrderChange
 *
 * Allows manufacturers to review and respond to order changes
 */
builder.mutationField("reviewOrderChange", (t) =>
  t.field({
    type: "OrderChangeLog",
    args: {
      changeLogId: t.arg.int({ required: true }),
      status: t.arg({ type: OrderChangeLogStatus, required: true }),
      response: t.arg.string({ required: false }),
      triggerNegotiation: t.arg.boolean({ required: false }),
    },
    authScopes: { user: true },
    resolve: async (parent, args, context) => {
      requireAuth(context.user?.id);

      const { changeLogId, status, response, triggerNegotiation } = args;

      // Get change log with order details
      const changeLog = await context.prisma.orderChangeLog.findUnique({
        where: { id: changeLogId },
        include: {
          order: {
            include: {
              customer: true,
              manufacturer: true,
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
        throw new Error("Değişiklik kaydı bulunamadı");
      }

      // Check permission - only manufacturer or company employees can review
      const isManufacturer = changeLog.order.manufacturerId === context.user.id;
      const isCompanyEmployee = changeLog.order.collection?.company?.employees?.some(
        emp => emp.id === context.user.id
      );

      if (!isManufacturer && !isCompanyEmployee) {
        throw new Error("Bu değişikliği inceleme izniniz yok");
      }

      let negotiationId = null;

      // Start negotiation if requested
      if (triggerNegotiation) {
        const negotiation = await context.prisma.orderNegotiation.create({
          data: {
            orderId: changeLog.orderId,
            senderId: context.user.id,
            senderRole: "MANUFACTURER",
            message: response || `Sipariş değişikliği için pazarlık gerekiyor`,
            status: "PENDING",
          },
        });
        negotiationId = negotiation.id;
      }

      // Update change log
      const updatedChangeLog = await context.prisma.orderChangeLog.update({
        where: { id: changeLogId },
        data: {
          manufacturerStatus: status as string,
          manufacturerResponse: response,
          manufacturerReviewedAt: new Date(),
          manufacturerReviewedBy: context.user.id,
          negotiationTriggered: triggerNegotiation || false,
          negotiationId,
        },
        include: {
          order: {
            include: {
              customer: true,
              manufacturer: true,
              collection: {
                include: {
                  company: true,
                },
              },
            },
          },
          changedByUser: true,
          reviewedByUser: true,
          relatedNegotiation: true,
        },
      });

      // Notify customer about manufacturer response
      const notification = await context.prisma.notification.create({
        data: {
          userId: changeLog.order.customerId,
          title: "📝 Değişiklik Yanıtı",
          message: triggerNegotiation
            ? `${changeLog.order.collection?.company?.name || "Üretici"} sipariş değişikliğinize karşı pazarlık başlattı`
            : `${changeLog.order.collection?.company?.name || "Üretici"} sipariş değişikliğinizi ${status === "APPROVED" ? "kabul etti" : "reddetti"}`,
          type: "ORDER_CHANGE_RESPONSE",
          orderId: changeLog.orderId,
          link: `/dashboard/orders/${changeLog.orderId}`,
        },
      });
      await publishNotification(notification);

      return updatedChangeLog;
    },
  })
);
