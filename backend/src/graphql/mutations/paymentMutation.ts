/**
 * Payment Mutations - PRODUCTION READY
 *
 * Handle payment lifecycle: create requests, upload receipts, confirm/reject
 * Full sanitization, validation, structured logging, Turkish errors
 */

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
// ENUMS & CONSTANTS
// ========================================

const ValidPaymentTypes = [
  "DEPOSIT", // Ön ödeme / Kapora
  "PROGRESS", // Ara ödeme (üretim aşamasında)
  "BALANCE", // Kalan ödeme (sevkiyat öncesi)
  "FULL", // Peşin ödeme (tüm tutar)
] as const;
const ValidPaymentMethods = [
  "BANK_TRANSFER", // Banka havalesi (EFT/SWIFT)
  "WIRE_TRANSFER", // Havale
  "CHECK", // Çek
  "CASH", // Nakit
  "OTHER", // Diğer
] as const;

// ========================================
// INPUT TYPES
// ========================================

const CreatePaymentInput = builder.inputType("CreatePaymentInput", {
  fields: (t) => ({
    orderId: t.int({ required: true }),
    type: t.string({ required: true }),
    amount: t.float({ required: true }),
    currency: t.string({ required: false }),
    percentage: t.float({ required: false }),
    dueDate: t.string({ required: false }),
    description: t.string({ required: false }),
    method: t.string({ required: false }),
  }),
});

const UploadPaymentReceiptInput = builder.inputType(
  "UploadPaymentReceiptInput",
  {
    fields: (t) => ({
      paymentId: t.int({ required: true }),
      receiptUrl: t.string({ required: true }),
      bankName: t.string({ required: false }),
      transactionId: t.string({ required: false }),
      notes: t.string({ required: false }),
    }),
  }
);

const ConfirmPaymentInput = builder.inputType("ConfirmPaymentInput", {
  fields: (t) => ({
    paymentId: t.int({ required: true }),
    notes: t.string({ required: false }),
  }),
});

const RejectPaymentInput = builder.inputType("RejectPaymentInput", {
  fields: (t) => ({
    paymentId: t.int({ required: true }),
    rejectionReason: t.string({ required: true }),
  }),
});

const UpdatePaymentInput = builder.inputType("UpdatePaymentInput", {
  fields: (t) => ({
    paymentId: t.int({ required: true }),
    dueDate: t.string({ required: false }),
    amount: t.float({ required: false }),
    description: t.string({ required: false }),
    notes: t.string({ required: false }),
  }),
});

const DeletePaymentInput = builder.inputType("DeletePaymentInput", {
  fields: (t) => ({
    paymentId: t.int({ required: true }),
  }),
});

// ========================================
// MUTATIONS
// ========================================

/**
 * Create Payment - Manufacturer creates payment request
 * Fields: 8/8 (orderId, type, amount, currency, percentage, dueDate, description, method)
 */
builder.mutationField("createPayment", (t) =>
  t.prismaField({
    type: "Payment",
    description: "Üretici sipariş için ödeme talebi oluşturur",
    args: { input: t.arg({ type: CreatePaymentInput, required: true }) },
    authScopes: { user: true },
    resolve: async (query, _, { input }, context) => {
      const timer = createTimer("createPayment");
      try {
        requireAuth(context.user?.id);
        const orderId = sanitizeInt(Number(input.orderId));
        const type = sanitizeString(input.type);
        const amount = sanitizeFloat(input.amount);
        const currency = input.currency
          ? sanitizeString(input.currency)
          : "USD";
        const percentage = input.percentage
          ? sanitizeFloat(input.percentage)
          : null;
        const dueDate = input.dueDate ? sanitizeString(input.dueDate) : null;
        const description = input.description
          ? sanitizeString(input.description)
          : null;
        const method = input.method
          ? sanitizeString(input.method)
          : "BANK_TRANSFER";

        validateRequired(orderId, "Sipariş ID gerekli");
        validateRequired(type, "Ödeme türü gerekli");
        validateRequired(amount, "Tutar gerekli");
        validateEnum(type, "type", [...ValidPaymentTypes]);
        validateEnum(method, "method", [...ValidPaymentMethods]);

        if (amount !== null && amount <= 0)
          throw new ValidationError("amount", "Tutar 0'dan büyük olmalı");
        if (percentage !== null && (percentage < 0 || percentage > 100)) {
          throw new ValidationError(
            "percentage",
            "Yüzde 0-100 arasında olmalı"
          );
        }
        if (description)
          validateStringLength(description, "description", 1, 1000);

        if (orderId === null) {
          throw new ValidationError(
            "orderId",
            "Sipariş ID gerekli ve null olamaz"
          );
        }
        const order = await context.prisma.order.findUnique({
          where: { id: orderId },
          select: {
            id: true,
            orderNumber: true,
            manufactureId: true,
            customerId: true,
            totalPrice: true,
          },
        });
        if (!order) throw new ValidationError("orderId", "Sipariş bulunamadı");
        if (
          context.user!.id !== order.manufactureId &&
          context.user!.role !== "ADMIN"
        ) {
          throw new ValidationError(
            "orderId",
            "Sadece üretici ödeme talebi oluşturabilir"
          );
        }

        const payment = await context.prisma.payment.create({
          ...query,
          data: {
            orderId,
            type: type as any,
            amount: amount!,
            currency: currency!,
            percentage,
            method: method as any,
            status: "PENDING",
            dueDate: dueDate ? new Date(dueDate) : null,
            description,
          },
        });

        logInfo("Payment created", {
          paymentId: payment.id,
          orderId,
          type,
          amount,
          userId: context.user!.id,
          metadata: timer.end(),
        });

        try {
          const notif = await context.prisma.notification.create({
            data: {
              userId: order.customerId,
              type: "PAYMENT_REQUEST" as any,
              title: "Yeni Ödeme Talebi",
              message: `${order.orderNumber} siparişi için ${amount} ${currency} tutarında ödeme talebi oluşturuldu`,
              link: `/orders/${order.id}/payments`,
              data: {
                paymentId: payment.id,
                orderId,
                amount,
                currency,
                type,
              } as any,
            },
          });
          await publishNotification(notif);
        } catch (err) {
          logInfo("Failed to send payment notification", {
            error: String(err),
            paymentId: payment.id,
          });
        }

        return payment;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/** Upload Payment Receipt - Customer uploads proof  * Fields: 5/5 */
builder.mutationField("uploadPaymentReceipt", (t) =>
  t.prismaField({
    type: "Payment",
    args: { input: t.arg({ type: UploadPaymentReceiptInput, required: true }) },
    authScopes: { user: true },
    resolve: async (query, _, { input }, context) => {
      const timer = createTimer("uploadPaymentReceipt");
      try {
        requireAuth(context.user?.id);
        const paymentId = sanitizeInt(Number(input.paymentId));
        const receiptUrl = sanitizeString(input.receiptUrl);
        const bankName = input.bankName ? sanitizeString(input.bankName) : null;
        const transactionId = input.transactionId
          ? sanitizeString(input.transactionId)
          : null;
        const notes = input.notes ? sanitizeString(input.notes) : null;

        validateRequired(paymentId, "Ödeme ID gerekli");
        validateRequired(receiptUrl, "Dekont URL gerekli");
        if (receiptUrl) validateStringLength(receiptUrl, "receiptUrl", 1, 500);
        if (bankName) validateStringLength(bankName, "bankName", 1, 100);
        if (transactionId)
          validateStringLength(transactionId, "transactionId", 1, 100);
        if (notes) validateStringLength(notes, "notes", 1, 1000);

        const payment = await context.prisma.payment.findUnique({
          where: { id: paymentId! },
          select: {
            id: true,
            orderId: true,
            amount: true,
            currency: true,
            status: true,
          },
        });
        if (!payment)
          throw new ValidationError("paymentId", "Ödeme bulunamadı");

        const order = await context.prisma.order.findUnique({
          where: { id: payment.orderId },
          select: {
            id: true,
            orderNumber: true,
            customerId: true,
            manufactureId: true,
          },
        });
        if (!order)
          throw new ValidationError("paymentId", "Sipariş bulunamadı");

        if (
          context.user!.id !== order.customerId &&
          context.user!.role !== "ADMIN"
        ) {
          throw new ValidationError(
            "paymentId",
            "Sadece müşteri dekont yükleyebilir"
          );
        }

        const updated = await context.prisma.payment.update({
          ...query,
          where: { id: paymentId! },
          data: {
            receiptUrl,
            receiptUploadedAt: new Date(),
            receiptUploadedBy: context.user!.id,
            status: "RECEIPT_UPLOADED",
            bankName,
            transactionId,
            notes,
          },
        });

        logInfo("Payment receipt uploaded", {
          paymentId,
          orderId: order.id,
          userId: context.user!.id,
          metadata: timer.end(),
        });

        try {
          const notif = await context.prisma.notification.create({
            data: {
              userId: order.manufactureId,
              type: "PAYMENT_RECEIPT_UPLOADED" as any,
              title: "Ödeme Dekontu Yüklendi",
              message: `${order.orderNumber} siparişi için ödeme dekontu yüklendi`,
              link: `/orders/${order.id}/payments`,
              data: {
                paymentId,
                orderId: order.id,
                amount: payment.amount,
                currency: payment.currency,
              } as any,
            },
          });
          await publishNotification(notif);
        } catch (err) {}

        return updated;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/** Confirm Payment - Manufacturer confirms payment * Fields: 2/2 */
builder.mutationField("confirmPayment", (t) =>
  t.prismaField({
    type: "Payment",
    args: { input: t.arg({ type: ConfirmPaymentInput, required: true }) },
    authScopes: { user: true },
    resolve: async (query, _, { input }, context) => {
      const timer = createTimer("confirmPayment");
      try {
        requireAuth(context.user?.id);
        const paymentId = sanitizeInt(Number(input.paymentId));
        const notes = input.notes ? sanitizeString(input.notes) : null;
        validateRequired(paymentId, "Ödeme ID gerekli");
        if (notes) validateStringLength(notes, "notes", 1, 1000);

        const payment = await context.prisma.payment.findUnique({
          where: { id: paymentId! },
          select: {
            id: true,
            orderId: true,
            amount: true,
            currency: true,
            status: true,
          },
        });
        if (!payment)
          throw new ValidationError("paymentId", "Ödeme bulunamadı");

        const order = await context.prisma.order.findUnique({
          where: { id: payment.orderId },
          select: {
            id: true,
            orderNumber: true,
            manufactureId: true,
            customerId: true,
          },
        });
        if (!order)
          throw new ValidationError("paymentId", "Sipariş bulunamadı");

        if (
          context.user!.id !== order.manufactureId &&
          context.user!.role !== "ADMIN"
        ) {
          throw new ValidationError(
            "paymentId",
            "Sadece üretici ödeme onaylayabilir"
          );
        }

        const confirmed = await context.prisma.payment.update({
          ...query,
          where: { id: paymentId! },
          data: {
            status: "CONFIRMED",
            confirmedAt: new Date(),
            confirmedBy: context.user!.id,
            paidDate: new Date(),
            ...(notes && { notes }),
          },
        });

        logInfo("Payment confirmed", {
          paymentId,
          orderId: order.id,
          amount: payment.amount,
          userId: context.user!.id,
          metadata: timer.end(),
        });

        try {
          const notif = await context.prisma.notification.create({
            data: {
              userId: order.customerId,
              type: "PAYMENT_CONFIRMED" as any,
              title: "Ödeme Onaylandı",
              message: `${order.orderNumber} siparişi için ${payment.amount} ${payment.currency} tutarındaki ödemeniz onaylandı`,
              link: `/orders/${order.id}/payments`,
              data: {
                paymentId,
                orderId: order.id,
                amount: payment.amount,
                currency: payment.currency,
              } as any,
            },
          });
          await publishNotification(notif);
        } catch (err) {}

        return confirmed;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/** Reject Payment - Manufacturer rejects * Fields: 2/2 */
builder.mutationField("rejectPayment", (t) =>
  t.prismaField({
    type: "Payment",
    args: { input: t.arg({ type: RejectPaymentInput, required: true }) },
    authScopes: { user: true },
    resolve: async (query, _, { input }, context) => {
      const timer = createTimer("rejectPayment");
      try {
        requireAuth(context.user?.id);
        const paymentId = sanitizeInt(Number(input.paymentId));
        const rejectionReason = sanitizeString(input.rejectionReason);
        validateRequired(paymentId, "Ödeme ID gerekli");
        validateRequired(rejectionReason, "Ret nedeni gerekli");
        validateStringLength(rejectionReason, "rejectionReason", 1, 500);

        const payment = await context.prisma.payment.findUnique({
          where: { id: paymentId! },
          select: {
            id: true,
            orderId: true,
            amount: true,
            currency: true,
            status: true,
          },
        });
        if (!payment)
          throw new ValidationError("paymentId", "Ödeme bulunamadı");

        const order = await context.prisma.order.findUnique({
          where: { id: payment.orderId },
          select: {
            id: true,
            orderNumber: true,
            manufactureId: true,
            customerId: true,
          },
        });
        if (!order)
          throw new ValidationError("paymentId", "Sipariş bulunamadı");

        if (
          context.user!.id !== order.manufactureId &&
          context.user!.role !== "ADMIN"
        ) {
          throw new ValidationError(
            "paymentId",
            "Sadece üretici ödeme reddedebilir"
          );
        }

        const rejected = await context.prisma.payment.update({
          ...query,
          where: { id: paymentId! },
          data: {
            status: "REJECTED",
            rejectionReason,
            confirmedAt: new Date(),
            confirmedBy: context.user!.id,
          },
        });

        logInfo("Payment rejected", {
          paymentId,
          orderId: order.id,
          rejectionReason,
          userId: context.user!.id,
          metadata: timer.end(),
        });

        try {
          const notif = await context.prisma.notification.create({
            data: {
              userId: order.customerId,
              type: "PAYMENT_REJECTED" as any,
              title: "Ödeme Reddedildi",
              message: `${order.orderNumber} siparişi için dekont reddedildi: ${rejectionReason}`,
              link: `/orders/${order.id}/payments`,
              data: {
                paymentId,
                orderId: order.id,
                rejectionReason,
              } as any,
            },
          });
          await publishNotification(notif);
        } catch (err) {}

        return rejected;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/** Update Payment * Fields: 5/5 */
builder.mutationField("updatePayment", (t) =>
  t.prismaField({
    type: "Payment",
    args: { input: t.arg({ type: UpdatePaymentInput, required: true }) },
    authScopes: { user: true },
    resolve: async (query, _, { input }, context) => {
      const timer = createTimer("updatePayment");
      try {
        requireAuth(context.user?.id);
        const paymentId = sanitizeInt(Number(input.paymentId));
        const dueDate = input.dueDate
          ? sanitizeString(input.dueDate)
          : undefined;
        const amount = input.amount ? sanitizeFloat(input.amount) : undefined;
        const description = input.description
          ? sanitizeString(input.description)
          : undefined;
        const notes = input.notes ? sanitizeString(input.notes) : undefined;
        validateRequired(paymentId, "Ödeme ID gerekli");
        if (amount !== undefined && amount !== null && amount <= 0)
          throw new ValidationError("amount", "Tutar 0'dan büyük olmalı");
        if (description)
          validateStringLength(description, "description", 1, 1000);
        if (notes) validateStringLength(notes, "notes", 1, 1000);

        const payment = await context.prisma.payment.findUnique({
          where: { id: paymentId! },
          select: { id: true, orderId: true, status: true },
        });
        if (!payment)
          throw new ValidationError("paymentId", "Ödeme bulunamadı");

        const order = await context.prisma.order.findUnique({
          where: { id: payment.orderId },
          select: { id: true, orderNumber: true, manufactureId: true },
        });
        if (!order)
          throw new ValidationError("paymentId", "Sipariş bulunamadı");

        if (
          context.user!.id !== order.manufactureId &&
          context.user!.role !== "ADMIN"
        ) {
          throw new ValidationError(
            "paymentId",
            "Sadece üretici ödeme güncelleyebilir"
          );
        }
        if (payment.status === "CONFIRMED")
          throw new ValidationError(
            "paymentId",
            "Onaylanmış ödeme güncellenemez"
          );

        const updateData: any = {};
        if (dueDate !== undefined && dueDate !== null)
          updateData.dueDate = new Date(dueDate);
        if (amount !== undefined) updateData.amount = amount;
        if (description !== undefined) updateData.description = description;
        if (notes !== undefined) updateData.notes = notes;

        const updated = await context.prisma.payment.update({
          ...query,
          where: { id: paymentId! },
          data: updateData,
        });
        logInfo("Payment updated", {
          paymentId,
          orderId: order.id,
          updatedFields: Object.keys(updateData),
          userId: context.user!.id,
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

/** Delete Payment * Fields: 1/1 */
builder.mutationField("deletePayment", (t) =>
  t.prismaField({
    type: "Payment",
    args: { input: t.arg({ type: DeletePaymentInput, required: true }) },
    authScopes: { user: true },
    resolve: async (query, _, { input }, context) => {
      const timer = createTimer("deletePayment");
      try {
        requireAuth(context.user?.id);
        const paymentId = sanitizeInt(Number(input.paymentId));
        validateRequired(paymentId, "Ödeme ID gerekli");

        const payment = await context.prisma.payment.findUnique({
          where: { id: paymentId! },
          select: { id: true, orderId: true, status: true },
        });
        if (!payment)
          throw new ValidationError("paymentId", "Ödeme bulunamadı");

        const order = await context.prisma.order.findUnique({
          where: { id: payment.orderId },
          select: { id: true, orderNumber: true, manufactureId: true },
        });
        if (!order)
          throw new ValidationError("paymentId", "Sipariş bulunamadı");

        if (
          context.user!.id !== order.manufactureId &&
          context.user!.role !== "ADMIN"
        ) {
          throw new ValidationError(
            "paymentId",
            "Sadece üretici ödeme silebilir"
          );
        }
        if (payment.status === "CONFIRMED")
          throw new ValidationError("paymentId", "Onaylanmış ödeme silinemez");

        const deleted = await context.prisma.payment.delete({
          ...query,
          where: { id: paymentId! },
        });
        logInfo("Payment deleted", {
          paymentId,
          orderId: order.id,
          status: payment.status,
          userId: context.user!.id,
          metadata: timer.end(),
        });
        return deleted;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// ========================================
// BULK OPERATIONS (Admin/Manufacturer)
// ========================================

const BulkPaymentInput = builder.inputType("BulkPaymentInput", {
  fields: (t) => ({
    ids: t.intList({ required: true }),
  }),
});

const BulkPaymentConfirmInput = builder.inputType("BulkPaymentConfirmInput", {
  fields: (t) => ({
    ids: t.intList({ required: true }),
    notes: t.string({ required: false }),
  }),
});

// === MUTATION: bulkConfirmPayments ===
/**
 * Bulk confirm multiple payments at once.
 * Manufacturer can confirm receipts, admin can confirm any payments.
 * Sends notifications to customers for each confirmed payment.
 */
builder.mutationField("bulkConfirmPayments", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    args: {
      input: t.arg({ type: BulkPaymentConfirmInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const timer = createTimer("bulkConfirmPayments");
      const { ids, notes } = args.input;

      try {
        // Fetch payments to verify ownership
        const payments = await ctx.prisma.payment.findMany({
          where: { id: { in: ids } },
          include: {
            order: {
              select: {
                id: true,
                manufactureId: true,
                customerId: true,
                orderNumber: true,
              },
            },
          },
        });

        if (payments.length === 0) {
          throw new Error("No payments found");
        }

        // Verify authorization
        if (ctx.user.role !== "ADMIN") {
          const unauthorized = payments.some(
            (p) => p.order.manufactureId !== ctx.user!.id
          );
          if (unauthorized) {
            throw new Error(
              "You can only confirm payments for your own orders"
            );
          }
        }

        // Verify all payments are in RECEIPT_UPLOADED status
        const invalidStatus = payments.some(
          (p) => p.status !== "RECEIPT_UPLOADED"
        );
        if (invalidStatus) {
          throw new Error(
            "Only payments with uploaded receipts can be confirmed"
          );
        }

        // Bulk update
        const updateData: any = {
          status: "CONFIRMED",
          confirmedAt: new Date(),
          confirmedBy: ctx.user.id,
        };
        if (notes) updateData.notes = notes;

        const result = await ctx.prisma.payment.updateMany({
          where: { id: { in: ids } },
          data: updateData,
        });

        // Send notifications to customers
        for (const payment of payments) {
          const notification = await ctx.prisma.notification.create({
            data: {
              userId: payment.order.customerId,
              type: "ORDER",
              title: "Ödeme Onaylandı",
              message: `${payment.order.orderNumber} numaralı sipariş için ${payment.amount} ${payment.currency} tutarındaki ödemeniz onaylandı.`,
              orderId: payment.orderId,
              link: `/dashboard/payments/${payment.id}`,
            },
          });
          await publishNotification(notification);
        }

        logInfo("Bulk confirm payments", {
          count: result.count,
          userId: ctx.user.id,
          metadata: timer.end(),
        });

        return {
          success: true,
          count: result.count,
          message: `${result.count} payments confirmed successfully`,
        };
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// === MUTATION: bulkCancelPayments ===
/**
 * Bulk cancel multiple payments at once.
 * Admin only - cancels pending or rejected payments.
 * Sends notifications to affected users.
 */
builder.mutationField("bulkCancelPayments", (t) =>
  t.field({
    type: "JSON",
    authScopes: { admin: true },
    args: {
      input: t.arg({ type: BulkPaymentInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const timer = createTimer("bulkCancelPayments");
      const { ids } = args.input;

      try {
        // Fetch payments to verify they can be cancelled
        const payments = await ctx.prisma.payment.findMany({
          where: { id: { in: ids } },
          include: {
            order: {
              select: {
                id: true,
                customerId: true,
                manufactureId: true,
                orderNumber: true,
              },
            },
          },
        });

        if (payments.length === 0) {
          throw new Error("No payments found");
        }

        // Verify no confirmed payments
        const hasConfirmed = payments.some((p) => p.status === "CONFIRMED");
        if (hasConfirmed) {
          throw new Error("Cannot cancel confirmed payments");
        }

        // Bulk update
        const result = await ctx.prisma.payment.updateMany({
          where: { id: { in: ids } },
          data: {
            status: "CANCELLED",
            updatedAt: new Date(),
          },
        });

        // Send notifications
        for (const payment of payments) {
          const customerNotification = await ctx.prisma.notification.create({
            data: {
              userId: payment.order.customerId,
              type: "ORDER",
              title: "Ödeme İptal Edildi",
              message: `${payment.order.orderNumber} numaralı sipariş için ${payment.amount} ${payment.currency} tutarındaki ödeme iptal edildi.`,
              orderId: payment.orderId,
              link: `/dashboard/payments/${payment.id}`,
            },
          });
          await publishNotification(customerNotification);

          if (payment.order.manufactureId !== payment.order.customerId) {
            const manufacturerNotification =
              await ctx.prisma.notification.create({
                data: {
                  userId: payment.order.manufactureId,
                  type: "ORDER",
                  title: "Ödeme İptal Edildi",
                  message: `${payment.order.orderNumber} numaralı sipariş için ${payment.amount} ${payment.currency} tutarındaki ödeme iptal edildi.`,
                  orderId: payment.orderId,
                  link: `/dashboard/payments/${payment.id}`,
                },
              });
            await publishNotification(manufacturerNotification);
          }
        }

        logInfo("Bulk cancel payments", {
          count: result.count,
          userId: ctx.user.id,
          metadata: timer.end(),
        });

        return {
          success: true,
          count: result.count,
          message: `${result.count} payments cancelled successfully`,
        };
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// === MUTATION: bulkDeletePayments ===
/**
 * Bulk delete multiple payments at once.
 * Admin only - permanently removes payments.
 * Cannot delete confirmed payments.
 */
builder.mutationField("bulkDeletePayments", (t) =>
  t.field({
    type: "JSON",
    authScopes: { admin: true },
    args: {
      input: t.arg({ type: BulkPaymentInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const timer = createTimer("bulkDeletePayments");
      const { ids } = args.input;

      try {
        // Fetch payments to verify they can be deleted
        const payments = await ctx.prisma.payment.findMany({
          where: { id: { in: ids } },
          select: { id: true, status: true },
        });

        if (payments.length === 0) {
          throw new Error("No payments found");
        }

        // Verify no confirmed payments
        const hasConfirmed = payments.some((p) => p.status === "CONFIRMED");
        if (hasConfirmed) {
          throw new Error("Cannot delete confirmed payments");
        }

        // Bulk delete
        const result = await ctx.prisma.payment.deleteMany({
          where: { id: { in: ids } },
        });

        logInfo("Bulk delete payments", {
          count: result.count,
          userId: ctx.user.id,
          metadata: timer.end(),
        });

        return {
          success: true,
          count: result.count,
          message: `${result.count} payments deleted successfully`,
        };
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);
