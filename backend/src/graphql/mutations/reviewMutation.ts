/**
 * ============================================================================
 * REVIEW MUTATIONS
 * ============================================================================
 * Dosya: reviewMutation.ts
 * Amaç: OrderReview CRUD mutations
 * Versiyon: 2.0.0
 *
 * Mutations:
 * - createOrderReview: Yeni değerlendirme oluştur
 * - updateOrderReview: Değerlendirme güncelle
 * - deleteOrderReview: Değerlendirme sil
 * - addManufacturerReply: Üretici yanıtı ekle
 * - markReviewHelpful: "Yararlı" işaretle
 * - markReviewUnhelpful: "Yararlı değil" işaretle
 *
 * Validations:
 * - Rating 1-5 arası olmalı
 * - Sadece teslim edilmiş siparişler değerlendirilebilir (status: DELIVERED)
 * - Müşteri sadece kendi siparişlerini değerlendirebilir
 * - Her sipariş için sadece 1 değerlendirme
 * - Üretici sadece kendi değerlendirmelerine yanıt verebilir
 * ============================================================================
 */

import { ValidationError } from "../../utils/errors";
import { publishNotification } from "../../utils/publishHelpers";
import builder from "../builder";

// ============================================
// CREATE ORDER REVIEW
// ============================================
builder.mutationField("createOrderReview", (t) =>
  t.prismaField({
    type: "OrderReview",
    authScopes: { user: true },
    args: {
      orderId: t.arg.int({ required: true }),
      rating: t.arg.int({ required: true }),
      qualityRating: t.arg.int(),
      deliveryRating: t.arg.int(),
      communicationRating: t.arg.int(),
      comment: t.arg.string(),
      isPublic: t.arg.boolean({ defaultValue: true }),
    },
    resolve: async (query, root, args, ctx) => {
      if (!ctx.user) throw new Error("Unauthorized");

      // Validation: Rating 1-5 arası olmalı
      if (args.rating < 1 || args.rating > 5) {
        throw new ValidationError("Rating must be between 1 and 5");
      }

      if (
        args.qualityRating &&
        (args.qualityRating < 1 || args.qualityRating > 5)
      ) {
        throw new ValidationError("Quality rating must be between 1 and 5");
      }

      if (
        args.deliveryRating &&
        (args.deliveryRating < 1 || args.deliveryRating > 5)
      ) {
        throw new ValidationError("Delivery rating must be between 1 and 5");
      }

      if (
        args.communicationRating &&
        (args.communicationRating < 1 || args.communicationRating > 5)
      ) {
        throw new ValidationError(
          "Communication rating must be between 1 and 5"
        );
      }

      // Sipariş kontrolü
      const order = await ctx.prisma.order.findUnique({
        where: { id: args.orderId },
      });

      if (!order) {
        throw new ValidationError("Order not found");
      }

      // Sadece müşteri değerlendirebilir
      if (order.customerId !== ctx.user.id) {
        throw new ValidationError("You can only review your own orders");
      }

      // Sadece teslim edilmiş siparişler
      if (order.status !== "DELIVERED") {
        throw new ValidationError("You can only review delivered orders");
      }

      // Daha önce değerlendirme yapılmış mı?
      const existingReview = await ctx.prisma.orderReview.findUnique({
        where: { orderId: args.orderId },
      });

      if (existingReview) {
        throw new ValidationError("You have already reviewed this order");
      }

      // Review oluştur
      const review = await ctx.prisma.orderReview.create({
        ...query,
        data: {
          orderId: args.orderId,
          customerId: ctx.user.id,
          manufactureId: order.manufactureId,
          rating: args.rating,
          qualityRating: args.qualityRating ?? null,
          deliveryRating: args.deliveryRating ?? null,
          communicationRating: args.communicationRating ?? null,
          comment: args.comment ?? null,
          isPublic: args.isPublic ?? true,
        },
      });

      // Üreticiye bildirim gönder
      const notification = await ctx.prisma.notification.create({
        data: {
          userId: order.manufactureId,
          type: "ORDER",
          title: "Yeni Değerlendirme",
          message: `Sipariş #${order.orderNumber} için ${args.rating} yıldız aldınız`,
          link: `/orders/${order.id}/review`,
          orderId: order.id,
        },
      });

      // Publish real-time notification
      await publishNotification({
        id: notification.id,
        userId: order.manufactureId,
        type: "ORDER",
        title: "Yeni Değerlendirme",
        message: `Sipariş #${order.orderNumber} için ${args.rating} yıldız aldınız`,
        link: `/orders/${order.id}/review`,
        isRead: false,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      });

      return review;
    },
  })
);

// ============================================
// UPDATE ORDER REVIEW
// ============================================
builder.mutationField("updateOrderReview", (t) =>
  t.prismaField({
    type: "OrderReview",
    authScopes: { user: true },
    args: {
      reviewId: t.arg.int({ required: true }),
      rating: t.arg.int(),
      qualityRating: t.arg.int(),
      deliveryRating: t.arg.int(),
      communicationRating: t.arg.int(),
      comment: t.arg.string(),
      isPublic: t.arg.boolean(),
    },
    resolve: async (query, root, args, ctx) => {
      if (!ctx.user) throw new Error("Unauthorized");

      // Review kontrolü
      const review = await ctx.prisma.orderReview.findUnique({
        where: { id: args.reviewId },
      });

      if (!review) {
        throw new ValidationError("Review not found");
      }

      // Sadece kendi değerlendirmesini güncelleyebilir
      if (review.customerId !== ctx.user.id) {
        throw new ValidationError("You can only update your own reviews");
      }

      // Validation: Rating 1-5 arası olmalı
      if (args.rating && (args.rating < 1 || args.rating > 5)) {
        throw new ValidationError("Rating must be between 1 and 5");
      }

      if (
        args.qualityRating &&
        (args.qualityRating < 1 || args.qualityRating > 5)
      ) {
        throw new ValidationError("Quality rating must be between 1 and 5");
      }

      if (
        args.deliveryRating &&
        (args.deliveryRating < 1 || args.deliveryRating > 5)
      ) {
        throw new ValidationError("Delivery rating must be between 1 and 5");
      }

      if (
        args.communicationRating &&
        (args.communicationRating < 1 || args.communicationRating > 5)
      ) {
        throw new ValidationError(
          "Communication rating must be between 1 and 5"
        );
      }

      // Review güncelle
      const updateData: any = {};
      if (args.rating !== undefined) updateData.rating = args.rating;
      if (args.qualityRating !== undefined)
        updateData.qualityRating = args.qualityRating;
      if (args.deliveryRating !== undefined)
        updateData.deliveryRating = args.deliveryRating;
      if (args.communicationRating !== undefined)
        updateData.communicationRating = args.communicationRating;
      if (args.comment !== undefined) updateData.comment = args.comment;
      if (args.isPublic !== undefined) updateData.isPublic = args.isPublic;

      const updatedReview = await ctx.prisma.orderReview.update({
        ...query,
        where: { id: args.reviewId },
        data: updateData,
      });

      return updatedReview;
    },
  })
);

// ============================================
// DELETE ORDER REVIEW
// ============================================
builder.mutationField("deleteOrderReview", (t) =>
  t.boolean({
    authScopes: { user: true },
    args: {
      reviewId: t.arg.int({ required: true }),
    },
    resolve: async (root, args, ctx) => {
      if (!ctx.user) throw new Error("Unauthorized");

      // Review kontrolü
      const review = await ctx.prisma.orderReview.findUnique({
        where: { id: args.reviewId },
      });

      if (!review) {
        throw new ValidationError("Review not found");
      }

      // Sadece admin veya kendi değerlendirmesini silebilir
      if (ctx.user.role !== "ADMIN" && review.customerId !== ctx.user.id) {
        throw new ValidationError("You can only delete your own reviews");
      }

      // Review sil
      await ctx.prisma.orderReview.delete({
        where: { id: args.reviewId },
      });

      return true;
    },
  })
);

// ============================================
// ADD MANUFACTURER REPLY
// ============================================
builder.mutationField("addManufacturerReply", (t) =>
  t.prismaField({
    type: "OrderReview",
    authScopes: { user: true },
    args: {
      reviewId: t.arg.int({ required: true }),
      reply: t.arg.string({ required: true }),
    },
    resolve: async (query, root, args, ctx) => {
      if (!ctx.user) throw new Error("Unauthorized");

      // Review kontrolü
      const review = await ctx.prisma.orderReview.findUnique({
        ...query,
        where: { id: args.reviewId },
      });

      if (!review) {
        throw new ValidationError("Review not found");
      }

      // Sadece ilgili üretici yanıt verebilir
      if (review.manufactureId !== ctx.user.id) {
        throw new ValidationError("You can only reply to your own reviews");
      }

      // Reply ekle
      const updatedReview = await ctx.prisma.orderReview.update({
        ...query,
        where: { id: args.reviewId },
        data: {
          manufacturerReply: args.reply,
          manufacturerRepliedAt: new Date(),
        },
      });

      // Müşteriye bildirim gönder
      const notification = await ctx.prisma.notification.create({
        data: {
          userId: review.customerId,
          type: "ORDER",
          title: "Üretici Yanıtı",
          message: "Değerlendirmenize yanıt verildi",
          link: `/orders/${review.orderId}/review`,
          orderId: review.orderId,
        },
      });

      // Publish real-time notification
      await publishNotification({
        id: notification.id,
        userId: review.customerId,
        type: "ORDER",
        title: "Üretici Yanıtı",
        message: "Değerlendirmenize yanıt verildi",
        link: `/orders/${review.orderId}/review`,
        isRead: false,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      });

      return updatedReview;
    },
  })
);

// ============================================
// MARK REVIEW AS HELPFUL
// ============================================
builder.mutationField("markReviewHelpful", (t) =>
  t.prismaField({
    type: "OrderReview",
    authScopes: { user: true },
    args: {
      reviewId: t.arg.int({ required: true }),
    },
    resolve: async (query, root, args, ctx) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const review = await ctx.prisma.orderReview.update({
        ...query,
        where: { id: args.reviewId },
        data: {
          helpfulCount: { increment: 1 },
        },
      });

      return review;
    },
  })
);

// ============================================
// MARK REVIEW AS UNHELPFUL
// ============================================
builder.mutationField("markReviewUnhelpful", (t) =>
  t.prismaField({
    type: "OrderReview",
    authScopes: { user: true },
    args: {
      reviewId: t.arg.int({ required: true }),
    },
    resolve: async (query, root, args, ctx) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const review = await ctx.prisma.orderReview.update({
        ...query,
        where: { id: args.reviewId },
        data: {
          unhelpfulCount: { increment: 1 },
        },
      });

      return review;
    },
  })
);
