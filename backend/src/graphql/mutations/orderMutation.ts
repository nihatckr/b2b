/**
 * Order Mutations - PRODUCTION READY
 *
 * Handle order creation, updates, deletion, and negotiation workflows
 * Full sanitization, validation, structured logging, Turkish errors
 */

import { publishNotification } from "../../utils/publishHelpers";
import builder from "../builder";
import { OrderStatus } from "../enums";

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
  validateEnum,
  validateRange,
  validateRequired,
  validateStringLength,
} from "../../utils/validation";

// Subscription enforcement
import { canPerformAction } from "../../utils/subscriptionHelper";

// Permission utilities
import {
  PermissionGuide,
  requirePermission,
} from "../../utils/permissionHelpers";

// ========================================
// ORDER MUTATIONS
// 5 mutations: createOrder, updateOrder, deleteOrder, customerCounterOffer, manufacturerAcceptCustomerQuote
// ========================================

// Valid Order Statuses (from schema - 15 statuses)
const ValidOrderStatuses = [
  // AŞAMA 1: Sipariş Talebi ve İnceleme
  "PENDING",
  "REVIEWED",
  // AŞAMA 2: Fiyat ve Süre Pazarlığı
  "QUOTE_SENT",
  "CUSTOMER_QUOTE_SENT",
  "MANUFACTURER_REVIEWING_QUOTE",
  "QUOTE_AGREED",
  // AŞAMA 3: Sipariş Onayı
  "CONFIRMED",
  "DEPOSIT_PENDING",
  "DEPOSIT_RECEIVED",
  // AŞAMA 4: Üretim Planlaması
  "PRODUCTION_PLAN_PREPARING",
  "PRODUCTION_PLAN_SENT",
  "PRODUCTION_PLAN_APPROVED",
  "PRODUCTION_PLAN_REJECTED",
  // AŞAMA 5: Üretim Süreci
  "IN_PRODUCTION",
  "PRODUCTION_COMPLETE",
  "QUALITY_CHECK",
  "QUALITY_APPROVED",
  "QUALITY_FAILED",
  // AŞAMA 6: Sevkiyat ve Teslimat
  "READY_TO_SHIP",
  "BALANCE_PENDING",
  "BALANCE_RECEIVED",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
  // AŞAMA 7: Red ve İptal Durumları
  "REJECTED",
  "REJECTED_BY_CUSTOMER",
  "REJECTED_BY_MANUFACTURER",
  "CANCELLED",
  "ON_HOLD",
];

// Create Order input type
const CreateOrderInput = builder.inputType("CreateOrderInput", {
  fields: (t) => ({
    // Schema: Int (Required - Collection ID)
    collectionId: t.id({ required: true }),
    // Schema: Int (Required - Order quantity)
    quantity: t.int({ required: true }),
    // Schema: DateTime? (Optional - Target deadline as ISO string)
    targetDeadline: t.string({ required: false }),
    // Schema: Float? (Optional - Target unit price)
    targetPrice: t.float({ required: false }),
    // Schema: String? (Optional - Currency code)
    currency: t.string({ required: false }),
    // Schema: String? @db.Text (Optional - Order notes)
    notes: t.string({ required: false }),
  }),
});

/**
 * Mutation: createOrder
 *
 * Create new order from collection (BUYER companies only)
 */
builder.mutationField("createOrder", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      input: t.arg({ type: CreateOrderInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _, { input }, context) => {
      const timer = createTimer("createOrder");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);
        const userId = context.user!.id;

        // ✅ Permission check: ORDER_CREATE
        requirePermission(context, PermissionGuide.CREATE_ORDERS);

        // ========================================
        // SANITIZATION
        // ========================================
        const collectionId = sanitizeInt(Number(input.collectionId));
        const quantity = sanitizeInt(input.quantity);
        const targetPrice = input.targetPrice
          ? sanitizeFloat(input.targetPrice)
          : undefined;
        const currency = input.currency
          ? sanitizeString(input.currency)
          : "USD";
        const notes = input.notes ? sanitizeString(input.notes) : undefined;
        const targetDeadline = input.targetDeadline
          ? sanitizeString(input.targetDeadline)
          : undefined;

        // ========================================
        // VALIDATION
        // ========================================
        validateRequired(collectionId, "Koleksiyon ID");
        validateRequired(quantity, "Miktar");

        // Range validations
        validateRange(quantity!, "Miktar", 1, 1000000);

        if (targetPrice) {
          validateRange(targetPrice, "Hedef fiyat", 0.01, 1000000);
        }

        // String length validations
        if (currency && currency !== "USD") {
          validateStringLength(currency, "Para birimi", 3, 3); // ISO 4217: USD, EUR, TRY
        }

        if (notes) {
          validateStringLength(notes, "Notlar", 1, 5000);
        }

        // ========================================
        // EXISTENCE CHECK - USER & COMPANY
        // ========================================
        const userWithCompany = await context.prisma.user.findUnique({
          where: { id: userId },
          include: { company: true },
        });

        if (!userWithCompany) {
          throw new ValidationError("Kullanıcı bulunamadı");
        }

        // ========================================
        // PERMISSION CHECK - BUYER ONLY
        // ========================================
        const isBuyer =
          userWithCompany.company?.type === "BUYER" ||
          userWithCompany.company?.type === "BOTH";

        if (!isBuyer) {
          throw new ValidationError(
            `Sadece alıcı firmalar sipariş oluşturabilir. Firma tipi: ${userWithCompany.company?.type} (beklenen: BUYER)`
          );
        }

        // ========================================
        // SUBSCRIPTION LIMIT CHECK
        // ========================================
        if (userWithCompany.companyId) {
          const limitCheck = await canPerformAction(
            context.prisma,
            userWithCompany.companyId,
            "create_order"
          );

          if (!limitCheck.allowed) {
            throw new ValidationError(
              limitCheck.reason || "Sipariş oluşturma limiti aşıldı"
            );
          }
        }

        // ========================================
        // EXISTENCE CHECK - COLLECTION
        // ========================================
        const collection = await context.prisma.collection.findUnique({
          where: { id: collectionId! },
          include: {
            company: true,
          },
        });

        if (!collection) {
          throw new ValidationError("Koleksiyon bulunamadı");
        }

        // ========================================
        // FIND MANUFACTURER USER
        // ========================================
        let manufacturerId = collection.company?.ownerId;

        if (!manufacturerId) {
          // If company has no owner, find the first employee with COMPANY_OWNER role
          const companyOwner = await context.prisma.user.findFirst({
            where: {
              companyId: collection.companyId,
              role: "COMPANY_OWNER",
              isActive: true,
            },
          });

          if (companyOwner) {
            manufacturerId = companyOwner.id;
          } else {
            // Fallback: use first active employee
            const firstEmployee = await context.prisma.user.findFirst({
              where: {
                companyId: collection.companyId,
                isActive: true,
              },
            });

            if (!firstEmployee) {
              throw new ValidationError(
                "Koleksiyon firmasında aktif kullanıcı bulunamadı"
              );
            }
            manufacturerId = firstEmployee.id;
          }
        }

        // ========================================
        // BUSINESS LOGIC - GENERATE ORDER NUMBER
        // ========================================
        const orderNumber = `ORD-${Date.now()}-${collection.id}`;

        // ========================================
        // CREATE ORDER
        // ========================================
        const order = await context.prisma.order.create({
          ...query,
          data: {
            orderNumber,
            collectionId: collectionId!,
            customerId: userId,
            manufactureId: manufacturerId,
            companyId: userWithCompany.companyId ?? null,
            quantity: quantity!,
            unitPrice: targetPrice || 0,
            totalPrice: (targetPrice || 0) * quantity!,
            customerQuotedPrice: targetPrice ?? null,
            customerQuoteNote: notes ?? null,
            customerQuoteSentAt: new Date(),
            status: "CUSTOMER_QUOTE_SENT",
            currency: currency!,
            deadline: targetDeadline ? new Date(targetDeadline) : null,
            // Cache collection data for fast list view
            collectionName: collection.name,
            collectionModelCode: collection.modelCode,
            orderType: "DIRECT",
          },
        });

        // ========================================
        // CREATE INITIAL NEGOTIATION
        // ========================================
        await context.prisma.orderNegotiation.create({
          data: {
            orderId: order.id,
            senderId: userId,
            senderRole: "CUSTOMER",
            unitPrice: targetPrice || 0,
            productionDays: 30, // Default, üretici güncelleyecek
            quantity: quantity!,
            currency: currency!,
            message: notes || "İlk sipariş teklifi",
            status: "PENDING",
          },
        });

        // ========================================
        // REAL-TIME NOTIFICATIONS
        // ========================================
        // 1. Müşteriye: Siparişiniz oluşturuldu
        try {
          const customerNotification = await context.prisma.notification.create(
            {
              data: {
                userId: userId,
                type: "ORDER",
                title: "✅ Sipariş Talebiniz Oluşturuldu",
                message: `Sipariş talebiniz (${order.orderNumber}) başarıyla oluşturuldu. Üreticinin teklifini bekliyorsunuz.`,
                orderId: order.id,
                link: `/dashboard/orders/${order.id}`,
              },
            }
          );
          await publishNotification(customerNotification);
        } catch (notificationError) {
          logInfo("Müşteri bildirimi başarısız", {
            orderId: order.id,
            userId,
          });
        }

        // 2. Üreticiye: Yeni sipariş talebi aldınız
        try {
          const manufacturerNotification =
            await context.prisma.notification.create({
              data: {
                userId: manufacturerId,
                type: "ORDER",
                title: "🆕 Yeni Sipariş Talebi Aldınız",
                message: `${
                  userWithCompany.name || "Müşteri"
                } firmasından yeni sipariş talebi! Sipariş No: ${
                  order.orderNumber
                }, Adet: ${quantity}. Lütfen teklif verin.`,
                orderId: order.id,
                link: `/dashboard/orders/${order.id}`,
              },
            });
          await publishNotification(manufacturerNotification);
        } catch (notificationError) {
          logInfo("Üretici bildirimi başarısız", {
            orderId: order.id,
            manufacturerId,
          });
        }

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Sipariş oluşturuldu", {
          orderId: order.id,
          orderNumber: order.orderNumber,
          metadata: timer.end(),
          userId,
          manufacturerId,
          collectionId: collectionId!,
          quantity: quantity!,
          targetPrice: targetPrice || 0,
          currency: currency!,
        });

        return order;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * Mutation: updateOrder
 *
 * Update order details (owner or admin)
 */
builder.mutationField("updateOrder", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      id: t.arg.int({ required: true }),
      quantity: t.arg.int(),
      unitPrice: t.arg.float(),
      status: t.arg.string(),

      // Customer Quote fields
      customerQuotedPrice: t.arg.float(),
      customerQuoteDays: t.arg.int(),
      customerQuoteNote: t.arg.string(),

      // Production fields
      productionDays: t.arg.int(),
      estimatedProductionDate: t.arg.string(), // ISO date string
      actualProductionStart: t.arg.string(),
      actualProductionEnd: t.arg.string(),

      // Shipping fields
      shippingDate: t.arg.string(),
      deliveryAddress: t.arg.string(),
      cargoTrackingNumber: t.arg.string(),

      // Notes
      customerNote: t.arg.string(),
      manufacturerResponse: t.arg.string(),
    },
    authScopes: { user: true, admin: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("updateOrder");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);
        const userId = context.user!.id;

        // ✅ Permission check: ORDER_UPDATE
        requirePermission(context, PermissionGuide.UPDATE_ORDERS);

        // ========================================
        // SANITIZATION
        // ========================================
        const orderId = sanitizeInt(args.id);
        const quantity = args.quantity ? sanitizeInt(args.quantity) : undefined;
        const unitPrice = args.unitPrice
          ? sanitizeFloat(args.unitPrice)
          : undefined;
        const status = args.status ? sanitizeString(args.status) : undefined;

        // Customer Quote fields
        const customerQuotedPrice = args.customerQuotedPrice
          ? sanitizeFloat(args.customerQuotedPrice)
          : undefined;
        const customerQuoteDays = args.customerQuoteDays
          ? sanitizeInt(args.customerQuoteDays)
          : undefined;
        const customerQuoteNote = args.customerQuoteNote
          ? sanitizeString(args.customerQuoteNote)
          : undefined;

        // Production fields
        const productionDays = args.productionDays
          ? sanitizeInt(args.productionDays)
          : undefined;
        const estimatedProductionDate = args.estimatedProductionDate
          ? sanitizeString(args.estimatedProductionDate)
          : undefined;
        const actualProductionStart = args.actualProductionStart
          ? sanitizeString(args.actualProductionStart)
          : undefined;
        const actualProductionEnd = args.actualProductionEnd
          ? sanitizeString(args.actualProductionEnd)
          : undefined;

        // Shipping fields
        const shippingDate = args.shippingDate
          ? sanitizeString(args.shippingDate)
          : undefined;
        const deliveryAddress = args.deliveryAddress
          ? sanitizeString(args.deliveryAddress)
          : undefined;
        const cargoTrackingNumber = args.cargoTrackingNumber
          ? sanitizeString(args.cargoTrackingNumber)
          : undefined;

        // Notes
        const customerNote = args.customerNote
          ? sanitizeString(args.customerNote)
          : undefined;
        const manufacturerResponse = args.manufacturerResponse
          ? sanitizeString(args.manufacturerResponse)
          : undefined;

        // ========================================
        // VALIDATION
        // ========================================
        validateRequired(orderId, "Sipariş ID");

        // Range validations
        if (quantity) {
          validateRange(quantity, "Miktar", 1, 1000000);
        }

        if (unitPrice) {
          validateRange(unitPrice, "Birim fiyat", 0.01, 1000000);
        }

        if (customerQuotedPrice) {
          validateRange(
            customerQuotedPrice,
            "Müşteri teklif fiyatı",
            0.01,
            1000000
          );
        }

        if (customerQuoteDays) {
          validateRange(customerQuoteDays, "Müşteri teklif günü", 1, 365);
        }

        if (productionDays) {
          validateRange(productionDays, "Üretim günü", 1, 365);
        }

        // Enum validation
        if (status) {
          validateEnum(status, "Durum", ValidOrderStatuses);
        }

        // String length validations
        if (customerQuoteNote) {
          validateStringLength(
            customerQuoteNote,
            "Müşteri teklif notu",
            1,
            5000
          );
        }

        if (deliveryAddress) {
          validateStringLength(deliveryAddress, "Teslimat adresi", 1, 1000);
        }

        if (cargoTrackingNumber) {
          validateStringLength(
            cargoTrackingNumber,
            "Kargo takip numarası",
            1,
            100
          );
        }

        if (customerNote) {
          validateStringLength(customerNote, "Müşteri notu", 1, 5000);
        }

        if (manufacturerResponse) {
          validateStringLength(manufacturerResponse, "Üretici yanıtı", 1, 5000);
        }

        // ========================================
        // EXISTENCE CHECK
        // ========================================
        const order = await context.prisma.order.findUnique({
          where: { id: orderId! },
        });

        if (!order) {
          throw new ValidationError("Sipariş bulunamadı");
        }

        // ========================================
        // PERMISSION CHECK
        // ========================================
        if (order.customerId !== userId && context.user?.role !== "ADMIN") {
          throw new ValidationError("Bu siparişi güncelleme yetkiniz yok");
        }

        // ========================================
        // BUILD UPDATE DATA
        // ========================================
        const updateData: any = {};

        // Price & Quantity (with totalPrice calculation)
        if (quantity) {
          updateData.quantity = quantity;
          if (unitPrice) {
            updateData.unitPrice = unitPrice;
            updateData.totalPrice = quantity * unitPrice;
          }
        } else if (unitPrice) {
          updateData.unitPrice = unitPrice;
          updateData.totalPrice = order.quantity * unitPrice;
        }

        // Status
        if (status) {
          updateData.status = status;
        }

        // Customer Quote fields
        if (customerQuotedPrice !== undefined) {
          updateData.customerQuotedPrice = customerQuotedPrice;
        }
        if (customerQuoteDays !== undefined) {
          updateData.customerQuoteDays = customerQuoteDays;
        }
        if (customerQuoteNote !== undefined) {
          updateData.customerQuoteNote = customerQuoteNote;
        }

        // Production fields
        if (productionDays !== undefined) {
          updateData.productionDays = productionDays;
        }
        if (estimatedProductionDate) {
          updateData.estimatedProductionDate = new Date(
            estimatedProductionDate
          );
        }
        if (actualProductionStart) {
          updateData.actualProductionStart = new Date(actualProductionStart);
        }
        if (actualProductionEnd) {
          updateData.actualProductionEnd = new Date(actualProductionEnd);
        }

        // Shipping fields
        if (shippingDate) {
          updateData.shippingDate = new Date(shippingDate);
        }
        if (deliveryAddress !== undefined) {
          updateData.deliveryAddress = deliveryAddress;
        }
        if (cargoTrackingNumber !== undefined) {
          updateData.cargoTrackingNumber = cargoTrackingNumber;
        }

        // Notes
        if (customerNote !== undefined) {
          updateData.customerNote = customerNote;
        }
        if (manufacturerResponse !== undefined) {
          updateData.manufacturerResponse = manufacturerResponse;
        }

        // ========================================
        // UPDATE ORDER
        // ========================================
        const updatedOrder = await context.prisma.order.update({
          ...query,
          where: { id: orderId! },
          data: updateData,
        });

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        if (status && status !== order.status) {
          logInfo("Sipariş durumu değişti", {
            orderId: updatedOrder.id,
            oldStatus: order.status,
            newStatus: status,
          });
        }

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Sipariş güncellendi", {
          orderId: updatedOrder.id,
          updatedFields: Object.keys(updateData),
          statusChanged: status && status !== order.status,
          duration: timer.end(),
        });

        return updatedOrder;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * Mutation: deleteOrder
 *
 * Delete order (owner or admin)
 */
builder.mutationField("deleteOrder", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true, admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("deleteOrder");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);
        const userId = context.user!.id;

        // ✅ Permission check: ORDER_DELETE
        requirePermission(context, PermissionGuide.DELETE_ORDERS);

        // ========================================
        // SANITIZATION
        // ========================================
        const orderId = sanitizeInt(args.id);

        // ========================================
        // VALIDATION
        // ========================================
        validateRequired(orderId, "Sipariş ID");

        // ========================================
        // EXISTENCE CHECK
        // ========================================
        const order = await context.prisma.order.findUnique({
          where: { id: orderId! },
        });

        if (!order) {
          throw new ValidationError("Sipariş bulunamadı");
        }

        // ========================================
        // PERMISSION CHECK
        // ========================================
        if (order.customerId !== userId && context.user?.role !== "ADMIN") {
          throw new ValidationError("Bu siparişi silme yetkiniz yok");
        }

        // ========================================
        // DELETE ORDER (CASCADE)
        // ========================================
        await context.prisma.order.delete({
          where: { id: orderId! },
        });

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Sipariş silindi", {
          metadata: timer.end(),
          orderId: orderId!,
          orderNumber: order.orderNumber,
          userId,
        });

        return true;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * Mutation: customerCounterOffer
 *
 * Customer sends counter offer to manufacturer's quote
 */
builder.mutationField("customerCounterOffer", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      orderId: t.arg.int({ required: true }),
      quotedPrice: t.arg.float({ required: true }),
      quoteDays: t.arg.int({ required: true }),
      quoteNote: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("customerCounterOffer");

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
        const quotedPrice = sanitizeFloat(args.quotedPrice);
        const quoteDays = sanitizeInt(args.quoteDays);
        const quoteNote = args.quoteNote
          ? sanitizeString(args.quoteNote)
          : undefined;

        // ========================================
        // VALIDATION
        // ========================================
        validateRequired(orderId, "Sipariş ID");
        validateRequired(quotedPrice, "Teklif fiyatı");
        validateRequired(quoteDays, "Teklif günü");

        // Range validations
        validateRange(quotedPrice!, "Teklif fiyatı", 0.01, 1000000);
        validateRange(quoteDays!, "Teklif günü", 1, 365);

        // String length validation
        if (quoteNote) {
          validateStringLength(quoteNote, "Teklif notu", 1, 5000);
        }

        // ========================================
        // EXISTENCE CHECK
        // ========================================
        const order = await context.prisma.order.findUnique({
          where: { id: orderId! },
          include: {
            customer: true,
            manufacture: true,
          },
        });

        if (!order) {
          throw new ValidationError("Sipariş bulunamadı");
        }

        // ========================================
        // PERMISSION CHECK
        // ========================================
        if (order.customerId !== userId) {
          throw new ValidationError("Sadece müşteri karşı teklif gönderebilir");
        }

        // Status validation
        if (order.status !== "QUOTE_SENT") {
          throw new ValidationError(
            "Karşı teklif sadece üretici teklif gönderdiğinde gönderilebilir (QUOTE_SENT)"
          );
        }

        // ========================================
        // UPDATE ORDER
        // ========================================
        const updatedOrder = await context.prisma.order.update({
          ...query,
          where: { id: orderId! },
          data: {
            customerQuotedPrice: quotedPrice!,
            customerQuoteDays: quoteDays!,
            customerQuoteNote: quoteNote || null,
            status: "CUSTOMER_QUOTE_SENT",
          },
        });

        // ========================================
        // REAL-TIME NOTIFICATIONS
        // ========================================
        // 1. Üreticiye: Karşı teklif aldınız
        try {
          const manufacturerNotification =
            await context.prisma.notification.create({
              data: {
                userId: order.manufactureId,
                type: "ORDER",
                title: "💬 Karşı Teklif Aldınız",
                message: `${
                  order.customer?.name || "Müşteri"
                } karşı teklif gönderdi. Sipariş No: ${
                  order.orderNumber
                }. Teklif: $${quotedPrice} - ${quoteDays} gün`,
                orderId: order.id,
                link: `/dashboard/orders/${order.id}`,
              },
            });
          await publishNotification(manufacturerNotification);
        } catch (notificationError) {
          logInfo("Üretici bildirimi başarısız", {
            orderId: order.id,
            manufacturerId: order.manufactureId,
          });
        }

        // 2. Müşteriye: Karşı teklifiniz gönderildi
        try {
          const customerNotification = await context.prisma.notification.create(
            {
              data: {
                userId: userId,
                type: "ORDER",
                title: "✅ Karşı Teklifiniz Gönderildi",
                message: `Karşı teklifiniz (${order.orderNumber}) üreticiye iletildi. Yanıt bekleniyor.`,
                orderId: order.id,
                link: `/dashboard/orders/${order.id}`,
              },
            }
          );
          await publishNotification(customerNotification);
        } catch (notificationError) {
          logInfo("Müşteri bildirimi başarısız", {
            orderId: order.id,
            userId,
          });
        }

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Müşteri karşı teklif gönderdi", {
          metadata: timer.end(),
          orderId: order.id,
          orderNumber: order.orderNumber,
          userId,
          quotedPrice: quotedPrice!,
          quoteDays: quoteDays!,
        });

        return updatedOrder;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * Mutation: manufacturerAcceptCustomerQuote
 *
 * Manufacturer accepts customer's counter offer
 */
builder.mutationField("manufacturerAcceptCustomerQuote", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      orderId: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("manufacturerAcceptCustomerQuote");

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
        const order = await context.prisma.order.findUnique({
          where: { id: orderId! },
          include: {
            customer: true,
            collection: {
              include: {
                company: true,
              },
            },
          },
        });

        if (!order) {
          throw new ValidationError("Sipariş bulunamadı");
        }

        // ========================================
        // PERMISSION CHECK
        // ========================================
        if (order.collection.companyId !== context.user?.companyId) {
          throw new ValidationError("Sadece üretici bu teklifi kabul edebilir");
        }

        // Status validation
        if (order.status !== "CUSTOMER_QUOTE_SENT") {
          throw new ValidationError(
            "Sadece müşteri teklif gönderdiğinde kabul edilebilir (CUSTOMER_QUOTE_SENT)"
          );
        }

        // ========================================
        // UPDATE ORDER - CONFIRM
        // ========================================
        const updatedOrder = await context.prisma.order.update({
          ...query,
          where: { id: orderId! },
          data: {
            status: "CONFIRMED",
            unitPrice: order.customerQuotedPrice || order.unitPrice,
            productionDays: order.customerQuoteDays || order.productionDays,
          },
        });

        // ========================================
        // REAL-TIME NOTIFICATIONS
        // ========================================
        // 1. Müşteriye: Teklifiniz kabul edildi
        try {
          const customerNotification = await context.prisma.notification.create(
            {
              data: {
                userId: order.customerId,
                type: "ORDER",
                title: "✅ Teklifiniz Kabul Edildi",
                message: `${
                  order.collection.company?.name || "Üretici"
                } teklifinizi kabul etti! Sipariş No: ${order.orderNumber}`,
                orderId: order.id,
                link: `/dashboard/orders/${order.id}`,
              },
            }
          );
          await publishNotification(customerNotification);
        } catch (notificationError) {
          logInfo("Müşteri bildirimi başarısız", {
            orderId: order.id,
            customerId: order.customerId,
          });
        }

        // 2. Üreticiye: Sipariş onaylandı
        try {
          const manufacturerNotification =
            await context.prisma.notification.create({
              data: {
                userId: userId,
                type: "ORDER",
                title: "✅ Sipariş Onaylandı",
                message: `${order.orderNumber} numaralı sipariş onaylandı. Üretim başlatılabilir.`,
                orderId: order.id,
                link: `/dashboard/orders/${order.id}`,
              },
            });
          await publishNotification(manufacturerNotification);
        } catch (notificationError) {
          logInfo("Üretici bildirimi başarısız", {
            orderId: order.id,
            userId,
          });
        }

        // ========================================
        // STRUCTURED LOGGING
        // ========================================
        logInfo("Üretici müşteri teklifini kabul etti", {
          metadata: timer.end(),
          orderId: order.id,
          orderNumber: order.orderNumber,
          userId,
          customerId: order.customerId,
          finalUnitPrice: updatedOrder.unitPrice,
          finalProductionDays: updatedOrder.productionDays,
        });

        return updatedOrder;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// ========================================
// BULK OPERATIONS (Admin)
// ========================================

const BulkOrderInput = builder.inputType("BulkOrderInput", {
  fields: (t) => ({
    ids: t.intList({ required: true }),
  }),
});

const BulkOrderStatusInput = builder.inputType("BulkOrderStatusInput", {
  fields: (t) => ({
    ids: t.intList({ required: true }),
    status: t.field({ type: OrderStatus, required: true }),
  }),
});

// ============================================
// NOTE: Bulk operations moved to bulkMutation.ts
// - bulkUpdateOrderStatus
// - bulkUpdateSampleStatus
// - bulkDeleteOrders
// - bulkDeleteSamples
// ============================================
