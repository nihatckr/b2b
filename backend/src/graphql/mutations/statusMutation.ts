import { DynamicTaskHelper } from "../../utils/dynamicTaskHelper";
import { handleError, requireAuth, ValidationError } from "../../utils/errors";
import { createTimer, logInfo } from "../../utils/logger";
import { publishNotification } from "../../utils/publishHelpers";
import {
  sanitizeFloat,
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
// INPUT TYPES
// ========================================

/**
 * Numune onaylama input
 */
const ApproveSampleInput = builder.inputType("ApproveSampleInput", {
  fields: (t) => ({
    /** Numune ID (zorunlu) */
    id: t.int({ required: true }),
  }),
});

/**
 * Numuneyi beklemeye alma input
 */
const HoldSampleInput = builder.inputType("HoldSampleInput", {
  fields: (t) => ({
    /** Numune ID (zorunlu) */
    id: t.int({ required: true }),
  }),
});

/**
 * Numuneyi devam ettirme input
 */
const ResumeSampleInput = builder.inputType("ResumeSampleInput", {
  fields: (t) => ({
    /** Numune ID (zorunlu) */
    id: t.int({ required: true }),
  }),
});

/**
 * Numune iptal input
 */
const CancelSampleInput = builder.inputType("CancelSampleInput", {
  fields: (t) => ({
    /** Numune ID (zorunlu) */
    id: t.int({ required: true }),
  }),
});

/**
 * Numune durum güncelleme input
 */
const UpdateSampleStatusInput = builder.inputType("UpdateSampleStatusInput", {
  fields: (t) => ({
    /** Numune ID (zorunlu) */
    id: t.int({ required: true }),
    /** Yeni durum (28 geçerli değer - schema'da tanımlı) */
    status: t.string({ required: true }),
  }),
});

/**
 * Sipariş iptal input
 */
const CancelOrderInput = builder.inputType("CancelOrderInput", {
  fields: (t) => ({
    /** Sipariş ID (zorunlu) */
    id: t.int({ required: true }),
  }),
});

/**
 * Sipariş durum güncelleme input
 */
const UpdateOrderStatusInput = builder.inputType("UpdateOrderStatusInput", {
  fields: (t) => ({
    /** Sipariş ID (zorunlu) */
    id: t.int({ required: true }),
    /** Yeni durum (15 geçerli değer - schema'da tanımlı) */
    status: t.string({ required: true }),
  }),
});

/**
 * Teklif gönderme input (Üretici → Müşteri)
 */
const SendQuoteInput = builder.inputType("SendQuoteInput", {
  fields: (t) => ({
    /** Sipariş ID (zorunlu) */
    id: t.int({ required: true }),
    /** Birim fiyat (USD, zorunlu, >0) */
    unitPrice: t.float({ required: true }),
    /** Üretim süresi (gün, zorunlu, >0) */
    productionDays: t.int({ required: true }),
    /** Üretici notu (opsiyonel) */
    note: t.string(),
  }),
});

/**
 * Teklif kabul input (Müşteri)
 */
const AcceptQuoteInput = builder.inputType("AcceptQuoteInput", {
  fields: (t) => ({
    /** Sipariş ID (zorunlu) */
    id: t.int({ required: true }),
    /** Müşteri notu (opsiyonel) */
    note: t.string(),
  }),
});

/**
 * Teklif red input (Müşteri)
 */
const RejectQuoteInput = builder.inputType("RejectQuoteInput", {
  fields: (t) => ({
    /** Sipariş ID (zorunlu) */
    id: t.int({ required: true }),
    /** Red sebebi (zorunlu, 10-500 karakter) */
    reason: t.string({ required: true }),
  }),
});

/**
 * Müşteri karşı teklif input
 */
const UpdateCustomerOrderInput = builder.inputType("UpdateCustomerOrderInput", {
  fields: (t) => ({
    /** Sipariş ID (zorunlu) */
    id: t.int({ required: true }),
    /** Müşteri teklif fiyatı (USD, opsiyonel, >0) */
    quotedPrice: t.float(),
    /** Müşteri teklif süresi (gün, opsiyonel, >0) */
    quoteDays: t.int(),
    /** Müşteri teklif notu (opsiyonel, max 500 karakter) */
    quoteNote: t.string(),
    /** Teklif tipi (opsiyonel: COUNTER, ACCEPT, REJECT) */
    quoteType: t.string(),
  }),
});

// ========================================
// MUTATIONS
// ========================================

// ========================================
// SAMPLE STATUS MUTATIONS
// ========================================

/**
 * Numune onaylama (Üretici tarafından)
 * Durum: CONFIRMED
 */
builder.mutationField("approveSample", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      input: t.arg({ type: ApproveSampleInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      const timer = createTimer("approveSample");

      try {
        const userId = requireAuth(context.user?.id);
        const sampleId = sanitizeInt(args.input.id);

        validateRequired(sampleId, "Numune ID");

        const sample = await context.prisma.sample.findUnique({
          where: { id: sampleId },
          include: { customer: true, manufacture: true },
        });

        if (!sample) {
          throw new ValidationError("Numune bulunamadı");
        }

        if (sample.manufactureId !== userId) {
          throw new ValidationError("Bu numuneyi onaylama yetkiniz yok");
        }

        const updatedSample = await context.prisma.sample.update({
          ...query,
          where: { id: sampleId },
          data: { status: "CONFIRMED" },
        });

        // Dynamic Task Creation
        try {
          const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);
          await dynamicTaskHelper.createTasksForSampleStatus(
            sample.id,
            "CONFIRMED",
            sample.customerId,
            sample.manufactureId,
            sample.collectionId ?? undefined
          );
        } catch (error) {
          logInfo("Dynamic task creation failed (non-critical)", {
            sampleId,
            error,
          });
        }

        // Notification
        const notification = await context.prisma.notification.create({
          data: {
            userId: sample.customerId,
            type: "SAMPLE",
            title: "Numune Onaylandı",
            message: `${sample.sampleNumber} numaralı numuneniz üretici tarafından onaylandı`,
            sampleId: sample.id,
          },
        });
        await publishNotification(notification);

        logInfo("Sample approved successfully", {
          metadata: timer.end(),
          sampleId,
          userId,
        });

        return updatedSample;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

/**
 * Numuneyi beklemeye alma
 * Durum: ON_HOLD
 * Müşteri veya üretici çağırabilir
 */
builder.mutationField("holdSample", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      input: t.arg({ type: HoldSampleInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      const timer = createTimer("holdSample");

      try {
        const userId = requireAuth(context.user?.id);
        const sampleId = sanitizeInt(args.input.id);

        validateRequired(sampleId, "Numune ID");

        const sample = await context.prisma.sample.findUnique({
          where: { id: sampleId },
          include: { customer: true, manufacture: true },
        });

        if (!sample) {
          throw new ValidationError("Numune bulunamadı");
        }

        if (sample.customerId !== userId && sample.manufactureId !== userId) {
          throw new ValidationError("Bu numuneyi duraklatma yetkiniz yok");
        }

        const updatedSample = await context.prisma.sample.update({
          ...query,
          where: { id: sampleId },
          data: { status: "ON_HOLD" },
        });

        // Dynamic Task Creation
        try {
          const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);
          await dynamicTaskHelper.createTasksForSampleStatus(
            sample.id,
            "ON_HOLD",
            sample.customerId,
            sample.manufactureId,
            sample.collectionId ?? undefined
          );
        } catch (error) {
          logInfo("Dynamic task creation failed (non-critical)", {
            sampleId,
            error,
          });
        }

        // Notification (karşı tarafa bildir)
        const notificationUserId =
          sample.customerId === userId
            ? sample.manufactureId
            : sample.customerId;
        const notification = await context.prisma.notification.create({
          data: {
            userId: notificationUserId,
            type: "SAMPLE",
            title: "Numune Beklemeye Alındı",
            message: `${sample.sampleNumber} numaralı numune beklemeye alındı`,
            sampleId: sample.id,
          },
        });
        await publishNotification(notification);

        logInfo("Sample put on hold successfully", {
          metadata: timer.end(),
          sampleId,
          userId,
        });

        return updatedSample;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

/**
 * Numuneyi devam ettirme (beklemeden çıkar)
 * Durum: IN_PRODUCTION
 */
builder.mutationField("resumeSample", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      input: t.arg({ type: ResumeSampleInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      const timer = createTimer("resumeSample");

      try {
        const userId = requireAuth(context.user?.id);
        const sampleId = sanitizeInt(args.input.id);

        validateRequired(sampleId, "Numune ID");

        const sample = await context.prisma.sample.findUnique({
          where: { id: sampleId },
          include: { customer: true, manufacture: true },
        });

        if (!sample) {
          throw new ValidationError("Numune bulunamadı");
        }

        if (sample.customerId !== userId && sample.manufactureId !== userId) {
          throw new ValidationError("Bu numuneyi devam ettirme yetkiniz yok");
        }

        const updatedSample = await context.prisma.sample.update({
          ...query,
          where: { id: sampleId },
          data: { status: "IN_PRODUCTION" },
        });

        // Dynamic Task Creation
        try {
          const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);
          await dynamicTaskHelper.createTasksForSampleStatus(
            sample.id,
            "IN_PRODUCTION",
            sample.customerId,
            sample.manufactureId,
            sample.collectionId ?? undefined
          );
        } catch (error) {
          logInfo("Dynamic task creation failed (non-critical)", {
            sampleId,
            error,
          });
        }

        // Notification
        const notificationUserId =
          sample.customerId === userId
            ? sample.manufactureId
            : sample.customerId;
        const notification = await context.prisma.notification.create({
          data: {
            userId: notificationUserId,
            type: "SAMPLE",
            title: "Numune Üretime Devam",
            message: `${sample.sampleNumber} numaralı numune üretime devam ediyor`,
            sampleId: sample.id,
          },
        });
        await publishNotification(notification);

        logInfo("Sample resumed successfully", {
          metadata: timer.end(),
          sampleId,
          userId,
        });

        return updatedSample;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

/**
 * Numune iptal
 * Durum: CANCELLED
 */
builder.mutationField("cancelSample", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      input: t.arg({ type: CancelSampleInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      const timer = createTimer("cancelSample");

      try {
        const userId = requireAuth(context.user?.id);
        const sampleId = sanitizeInt(args.input.id);

        validateRequired(sampleId, "Numune ID");

        const sample = await context.prisma.sample.findUnique({
          where: { id: sampleId },
          include: { customer: true, manufacture: true },
        });

        if (!sample) {
          throw new ValidationError("Numune bulunamadı");
        }

        if (sample.customerId !== userId && sample.manufactureId !== userId) {
          throw new ValidationError("Bu numuneyi iptal etme yetkiniz yok");
        }

        const updatedSample = await context.prisma.sample.update({
          ...query,
          where: { id: sampleId },
          data: { status: "CANCELLED" },
        });

        // Dynamic Task Creation
        try {
          const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);
          await dynamicTaskHelper.createTasksForSampleStatus(
            sample.id,
            "CANCELLED",
            sample.customerId,
            sample.manufactureId,
            sample.collectionId ?? undefined
          );
        } catch (error) {
          logInfo("Dynamic task creation failed (non-critical)", {
            sampleId,
            error,
          });
        }

        // Notification
        const notificationUserId =
          sample.customerId === userId
            ? sample.manufactureId
            : sample.customerId;
        const notification = await context.prisma.notification.create({
          data: {
            userId: notificationUserId,
            type: "SAMPLE",
            title: "Numune İptal Edildi",
            message: `${sample.sampleNumber} numaralı numune iptal edildi`,
            sampleId: sample.id,
          },
        });
        await publishNotification(notification);

        logInfo("Sample cancelled successfully", {
          metadata: timer.end(),
          sampleId,
          userId,
        });

        return updatedSample;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

/**
 * Numune durum güncelleme (genel)
 * 28 geçerli durum (schema'da SampleStatus enum)
 */
builder.mutationField("updateSampleStatus", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      input: t.arg({ type: UpdateSampleStatusInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      const timer = createTimer("updateSampleStatus");

      try {
        const userId = requireAuth(context.user?.id);
        const sampleId = sanitizeInt(args.input.id);
        const status = sanitizeString(args.input.status);

        validateRequired(sampleId, "Numune ID");
        validateRequired(status, "Durum");

        // 28 valid SampleStatus values from schema
        const validStatuses = [
          // İLK AŞAMALAR (AI ve Talep)
          "AI_DESIGN",
          "PENDING_APPROVAL",
          "PENDING",
          // İNCELEME ve TEKLİF AŞAMASI
          "REVIEWED",
          "QUOTE_SENT",
          "CUSTOMER_QUOTE_SENT",
          "MANUFACTURER_REVIEWING_QUOTE",
          // ONAY/RED DURUMLAR
          "CONFIRMED",
          "REJECTED",
          "REJECTED_BY_CUSTOMER",
          "REJECTED_BY_MANUFACTURER",
          // ÜRETİM AŞAMALARI
          "IN_DESIGN",
          "PATTERN_READY",
          "IN_PRODUCTION",
          "PRODUCTION_COMPLETE",
          // KALİTE ve TESLİMAT
          "QUALITY_CHECK",
          "SHIPPED",
          "DELIVERED",
          // DİĞER DURUMLAR
          "ON_HOLD",
          "CANCELLED",
          // ESKİ FLOW (Geriye dönük uyumluluk)
          "REQUESTED",
          "RECEIVED",
          "COMPLETED",
        ];

        validateEnum(status, "Durum", validStatuses);

        const sample = await context.prisma.sample.findUnique({
          where: { id: sampleId },
          include: { customer: true, manufacture: true },
        });

        if (!sample) {
          throw new ValidationError("Numune bulunamadı");
        }

        if (sample.customerId !== userId && sample.manufactureId !== userId) {
          throw new ValidationError(
            "Bu numune durumunu değiştirme yetkiniz yok"
          );
        }

        const updatedSample = await context.prisma.sample.update({
          ...query,
          where: { id: sampleId },
          data: { status: status as any },
        });

        // Dynamic Task Creation
        try {
          const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);
          await dynamicTaskHelper.createTasksForSampleStatus(
            sample.id,
            status as any,
            sample.customerId,
            sample.manufactureId,
            sample.collectionId ?? undefined
          );
        } catch (error) {
          logInfo("Dynamic task creation failed (non-critical)", {
            sampleId,
            error,
          });
        }

        // Notification
        const notificationUserId =
          sample.customerId === userId
            ? sample.manufactureId
            : sample.customerId;
        const notification = await context.prisma.notification.create({
          data: {
            userId: notificationUserId,
            type: "SAMPLE",
            title: "Numune Durumu Güncellendi",
            message: `${sample.sampleNumber} numaralı numunenin durumu güncellendi: ${status}`,
            sampleId: sample.id,
          },
        });
        await publishNotification(notification);

        logInfo("Sample status updated successfully", {
          metadata: timer.end(),
          sampleId,
          userId,
          newStatus: status,
        });

        return updatedSample;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

// ========================================
// ORDER STATUS MUTATIONS
// ========================================

/**
 * Sipariş iptal (Müşteri tarafından)
 * Durum: CANCELLED
 */
builder.mutationField("cancelOrder", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      input: t.arg({ type: CancelOrderInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      const timer = createTimer("cancelOrder");

      try {
        const userId = requireAuth(context.user?.id);
        const orderId = sanitizeInt(args.input.id);

        validateRequired(orderId, "Sipariş ID");

        const order = await context.prisma.order.findUnique({
          where: { id: orderId },
          include: { customer: true, manufacture: true },
        });

        if (!order) {
          throw new ValidationError("Sipariş bulunamadı");
        }

        if (order.customerId !== userId) {
          throw new ValidationError("Bu siparişi iptal etme yetkiniz yok");
        }

        const updatedOrder = await context.prisma.order.update({
          ...query,
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });

        // Notification
        const notification = await context.prisma.notification.create({
          data: {
            userId: order.manufactureId,
            type: "ORDER",
            title: "Sipariş İptal Edildi",
            message: `${order.orderNumber} numaralı sipariş müşteri tarafından iptal edildi`,
            orderId: order.id,
          },
        });
        await publishNotification(notification);

        logInfo("Order cancelled successfully", {
          metadata: timer.end(),
          orderId,
          userId,
        });

        return updatedOrder;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

/**
 * Sipariş durum güncelleme (Üretici tarafından)
 * 15 geçerli durum (schema'da OrderStatus enum)
 */
builder.mutationField("updateOrderStatus", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      input: t.arg({ type: UpdateOrderStatusInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      const timer = createTimer("updateOrderStatus");

      try {
        const userId = requireAuth(context.user?.id);
        const orderId = sanitizeInt(args.input.id);
        const status = sanitizeString(args.input.status);

        validateRequired(orderId, "Sipariş ID");
        validateRequired(status, "Durum");

        // 15 valid OrderStatus values from schema
        const validStatuses = [
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

        validateEnum(status, "Durum", validStatuses);

        const order = await context.prisma.order.findUnique({
          where: { id: orderId },
          include: { customer: true, manufacture: true },
        });

        if (!order) {
          throw new ValidationError("Sipariş bulunamadı");
        }

        if (order.manufactureId !== userId) {
          throw new ValidationError(
            "Bu sipariş durumunu değiştirme yetkiniz yok"
          );
        }

        const updatedOrder = await context.prisma.order.update({
          ...query,
          where: { id: orderId },
          data: { status: status as any },
        });

        // Notification
        const notification = await context.prisma.notification.create({
          data: {
            userId: order.customerId,
            type: "ORDER",
            title: "Sipariş Durumu Güncellendi",
            message: `${order.orderNumber} numaralı siparişinizin durumu güncellendi: ${status}`,
            orderId: order.id,
          },
        });
        await publishNotification(notification);

        logInfo("Order status updated successfully", {
          metadata: timer.end(),
          orderId,
          userId,
          newStatus: status,
        });

        return updatedOrder;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

// ========================================
// ORDER QUOTE MUTATIONS
// ========================================

/**
 * Teklif gönderme (Üretici → Müşteri)
 * Durum: QUOTE_SENT
 */
builder.mutationField("sendQuote", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      input: t.arg({ type: SendQuoteInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      const timer = createTimer("sendQuote");

      try {
        const userId = requireAuth(context.user?.id);
        const orderId = sanitizeInt(args.input.id);
        const unitPrice = sanitizeFloat(args.input.unitPrice);
        const productionDays = sanitizeInt(args.input.productionDays);
        const note = args.input.note
          ? sanitizeString(args.input.note)
          : undefined;

        validateRequired(orderId, "Sipariş ID");
        validateRequired(unitPrice, "Birim fiyat");
        validateRequired(productionDays, "Üretim süresi");

        if (!unitPrice || unitPrice <= 0) {
          throw new ValidationError("Birim fiyat 0'dan büyük olmalıdır");
        }

        if (!productionDays || productionDays <= 0) {
          throw new ValidationError("Üretim süresi 0'dan büyük olmalıdır");
        }

        const order = await context.prisma.order.findUnique({
          where: { id: orderId },
          include: { customer: true, manufacture: true },
        });

        if (!order) {
          throw new ValidationError("Sipariş bulunamadı");
        }

        if (order.manufactureId !== userId) {
          throw new ValidationError("Sadece üretici teklif gönderebilir");
        }

        const totalPrice = unitPrice * order.quantity;

        const updatedOrder = await context.prisma.order.update({
          ...query,
          where: { id: orderId },
          data: {
            status: "QUOTE_SENT",
            unitPrice,
            totalPrice,
            productionDays,
            manufacturerResponse: note,
          },
        });

        // Notification
        const notification = await context.prisma.notification.create({
          data: {
            userId: order.customerId,
            type: "ORDER",
            title: "Teklif Alındı",
            message: `${order.orderNumber} siparişiniz için teklif: ${unitPrice}₺/adet, ${productionDays} gün`,
            orderId: order.id,
          },
        });
        await publishNotification(notification);

        logInfo("Quote sent successfully", {
          metadata: timer.end(),
          orderId,
          userId,
          unitPrice,
          productionDays,
        });

        return updatedOrder;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

/**
 * Teklif kabul (Müşteri)
 * Durum: CONFIRMED
 */
builder.mutationField("acceptQuote", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      input: t.arg({ type: AcceptQuoteInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      const timer = createTimer("acceptQuote");

      try {
        const userId = requireAuth(context.user?.id);
        const orderId = sanitizeInt(args.input.id);
        const note = args.input.note
          ? sanitizeString(args.input.note)
          : undefined;

        validateRequired(orderId, "Sipariş ID");

        const order = await context.prisma.order.findUnique({
          where: { id: orderId },
          include: { customer: true, manufacture: true },
        });

        if (!order) {
          throw new ValidationError("Sipariş bulunamadı");
        }

        if (order.customerId !== userId) {
          throw new ValidationError("Sadece müşteri teklifi kabul edebilir");
        }

        const updatedOrder = await context.prisma.order.update({
          ...query,
          where: { id: orderId },
          data: {
            status: "CONFIRMED",
            customerNote: note,
          },
        });

        // Notification
        const notification = await context.prisma.notification.create({
          data: {
            userId: order.manufactureId,
            type: "ORDER",
            title: "Teklif Kabul Edildi",
            message: `${order.orderNumber} siparişi onaylandı. Üretime başlayabilirsiniz.`,
            orderId: order.id,
          },
        });
        await publishNotification(notification);

        logInfo("Quote accepted successfully", {
          metadata: timer.end(),
          orderId,
          userId,
        });

        return updatedOrder;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

/**
 * Teklif red (Müşteri)
 * Durum: REJECTED_BY_CUSTOMER
 */
builder.mutationField("rejectQuote", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      input: t.arg({ type: RejectQuoteInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      const timer = createTimer("rejectQuote");

      try {
        const userId = requireAuth(context.user?.id);
        const orderId = sanitizeInt(args.input.id);
        const reason = sanitizeString(args.input.reason);

        validateRequired(orderId, "Sipariş ID");
        validateRequired(reason, "Red sebebi");
        validateStringLength(reason, "Red sebebi", 10, 500);

        const order = await context.prisma.order.findUnique({
          where: { id: orderId },
          include: { customer: true, manufacture: true },
        });

        if (!order) {
          throw new ValidationError("Sipariş bulunamadı");
        }

        if (order.customerId !== userId) {
          throw new ValidationError("Sadece müşteri teklifi reddedebilir");
        }

        const updatedOrder = await context.prisma.order.update({
          ...query,
          where: { id: orderId },
          data: {
            status: "REJECTED_BY_CUSTOMER",
            customerNote: reason,
          },
        });

        // Notification
        const notification = await context.prisma.notification.create({
          data: {
            userId: order.manufactureId,
            type: "ORDER",
            title: "Teklif Reddedildi",
            message: `${order.orderNumber} siparişi reddedildi: ${reason}`,
            orderId: order.id,
          },
        });
        await publishNotification(notification);

        logInfo("Quote rejected successfully", {
          metadata: timer.end(),
          orderId,
          userId,
        });

        return updatedOrder;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);
/**
 * Müşteri karşı teklif
 * Durum: CUSTOMER_QUOTE_SENT
 */
builder.mutationField("updateCustomerOrder", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      input: t.arg({ type: UpdateCustomerOrderInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      const timer = createTimer("updateCustomerOrder");

      try {
        const userId = requireAuth(context.user?.id);
        const orderId = sanitizeInt(args.input.id);
        const quotedPrice = args.input.quotedPrice
          ? sanitizeFloat(args.input.quotedPrice)
          : undefined;
        const quoteDays = args.input.quoteDays
          ? sanitizeInt(args.input.quoteDays)
          : undefined;
        const quoteNote = args.input.quoteNote
          ? sanitizeString(args.input.quoteNote)
          : undefined;
        const quoteType = args.input.quoteType
          ? sanitizeString(args.input.quoteType)
          : undefined;

        validateRequired(orderId, "Sipariş ID");

        if (
          quotedPrice !== undefined &&
          quotedPrice !== null &&
          quotedPrice <= 0
        ) {
          throw new ValidationError("Teklif fiyatı 0'dan büyük olmalıdır");
        }

        if (quoteDays !== undefined && quoteDays !== null && quoteDays <= 0) {
          throw new ValidationError("Teklif süresi 0'dan büyük olmalıdır");
        }

        if (quoteNote !== undefined) {
          validateStringLength(quoteNote, "Teklif notu", 0, 500);
        }

        const order = await context.prisma.order.findUnique({
          where: { id: orderId },
          include: { customer: true, manufacture: true },
        });

        if (!order) {
          throw new ValidationError("Sipariş bulunamadı");
        }

        if (order.customerId !== userId) {
          throw new ValidationError("Bu siparişi güncelleme yetkiniz yok");
        }

        const updatedOrder = await context.prisma.order.update({
          ...query,
          where: { id: orderId },
          data: {
            customerQuotedPrice: quotedPrice,
            customerQuoteDays: quoteDays,
            customerQuoteNote: quoteNote,
            customerQuoteType: quoteType,
            customerQuoteSentAt: new Date(),
            status: "CUSTOMER_QUOTE_SENT",
          },
        });

        // Notification
        const notification = await context.prisma.notification.create({
          data: {
            userId: order.manufactureId,
            type: "ORDER",
            title: "Müşteri Karşı Teklif Gönderdi",
            message: `${order.orderNumber} siparişi için müşteri karşı teklif gönderdi`,
            orderId: order.id,
          },
        });
        await publishNotification(notification);

        logInfo("Customer counter-offer sent successfully", {
          metadata: timer.end(),
          orderId,
          userId,
          quotedPrice,
          quoteDays,
        });

        return updatedOrder;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);
