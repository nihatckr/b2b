/**
 * ============================================================================
 * REVIEW QUERIES
 * ============================================================================
 * Dosya: reviewQuery.ts
 * Amaç: OrderReview query resolvers
 * Versiyon: 2.0.0
 *
 * Queries:
 * - orderReview: Tekil değerlendirme getir
 * - orderReviews: Değerlendirme listesi (paginated)
 * - companyAverageRating: Firma ortalama puanı
 * - manufacturerRatingStats: Detaylı rating istatistikleri
 * - myReviews: Kullanıcının verdiği değerlendirmeler
 * - myReceivedReviews: Kullanıcının aldığı değerlendirmeler
 *
 * Filtreleme:
 * - Firma bazlı (manufactureId)
 * - Müşteri bazlı (customerId)
 * - Puan bazlı (rating)
 * - Public/Private
 * - Admin onay durumu
 * ============================================================================
 */

import builder from "../builder";
import {
  AverageRatingResult,
  ManufacturerRatingStats,
} from "../types/OrderReview";

// ============================================
// GET SINGLE ORDER REVIEW
// ============================================
builder.queryField("orderReview", (t) =>
  t.prismaField({
    type: "OrderReview",
    nullable: true,
    args: {
      reviewId: t.arg.int(),
      orderId: t.arg.int(),
    },
    resolve: async (query, root, args, ctx) => {
      if (!args.reviewId && !args.orderId) {
        throw new Error("Either reviewId or orderId must be provided");
      }

      const where: any = {};
      if (args.reviewId) where.id = args.reviewId;
      if (args.orderId) where.orderId = args.orderId;

      const review = await ctx.prisma.orderReview.findFirst({
        ...query,
        where,
      });

      return review;
    },
  })
);

// ============================================
// GET ORDER REVIEWS (Paginated)
// ============================================
builder.queryField("orderReviews", (t) =>
  t.prismaField({
    type: ["OrderReview"],
    args: {
      skip: t.arg.int({ defaultValue: 0 }),
      take: t.arg.int({ defaultValue: 10 }),
      manufactureId: t.arg.int(), // Firma bazlı filtreleme
      customerId: t.arg.int(), // Müşteri bazlı filtreleme
      minRating: t.arg.int(), // Minimum puan
      isPublic: t.arg.boolean(), // Public/Private
      isApproved: t.arg.boolean(), // Admin onay durumu
    },
    resolve: async (query, root, args, ctx) => {
      const where: any = {};

      if (args.manufactureId) where.manufactureId = args.manufactureId;
      if (args.customerId) where.customerId = args.customerId;
      if (args.minRating) where.rating = { gte: args.minRating };
      if (args.isPublic !== undefined) where.isPublic = args.isPublic;
      if (args.isApproved !== undefined) where.isApproved = args.isApproved;

      const reviews = await ctx.prisma.orderReview.findMany({
        ...query,
        where,
        skip: args.skip ?? 0,
        take: args.take ?? 10,
        orderBy: { createdAt: "desc" },
      });

      return reviews;
    },
  })
);

// ============================================
// GET COMPANY AVERAGE RATING
// ============================================
builder.queryField("companyAverageRating", (t) =>
  t.field({
    type: AverageRatingResult,
    args: {
      companyId: t.arg.int({ required: true }),
    },
    resolve: async (root, args, ctx) => {
      // Firma kontrolü
      const company = await ctx.prisma.company.findUnique({
        where: { id: args.companyId },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      // Owner'ın ID'si
      const ownerId = company.ownerId;
      if (!ownerId) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingBreakdown: {
            fiveStars: 0,
            fourStars: 0,
            threeStars: 0,
            twoStars: 0,
            oneStar: 0,
          },
        };
      }

      // Bu firmaya ait tüm değerlendirmeleri getir
      const reviews = await ctx.prisma.orderReview.findMany({
        where: {
          manufactureId: ownerId,
          isPublic: true,
          isApproved: true,
        },
      });

      if (reviews.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingBreakdown: {
            fiveStars: 0,
            fourStars: 0,
            threeStars: 0,
            twoStars: 0,
            oneStar: 0,
          },
        };
      }

      // Ortalama hesaplama
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = sum / reviews.length;

      // Rating breakdown
      const ratingBreakdown = {
        fiveStars: reviews.filter((r) => r.rating === 5).length,
        fourStars: reviews.filter((r) => r.rating === 4).length,
        threeStars: reviews.filter((r) => r.rating === 3).length,
        twoStars: reviews.filter((r) => r.rating === 2).length,
        oneStar: reviews.filter((r) => r.rating === 1).length,
      };

      return {
        averageRating,
        totalReviews: reviews.length,
        ratingBreakdown,
      };
    },
  })
);

// ============================================
// GET MANUFACTURER RATING STATS (Detaylı)
// ============================================
builder.queryField("manufacturerRatingStats", (t) =>
  t.field({
    type: ManufacturerRatingStats,
    args: {
      manufactureId: t.arg.int({ required: true }),
    },
    resolve: async (root, args, ctx) => {
      // Üretici kontrolü
      const manufacture = await ctx.prisma.user.findUnique({
        where: { id: args.manufactureId },
      });

      if (!manufacture) {
        throw new Error("Manufacturer not found");
      }

      // Tüm değerlendirmeleri getir
      const reviews = await ctx.prisma.orderReview.findMany({
        where: {
          manufactureId: args.manufactureId,
          isPublic: true,
          isApproved: true,
        },
      });

      if (reviews.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          averageQualityRating: null,
          averageDeliveryRating: null,
          averageCommunicationRating: null,
          ratingBreakdown: {
            fiveStars: 0,
            fourStars: 0,
            threeStars: 0,
            twoStars: 0,
            oneStar: 0,
          },
        };
      }

      // Ortalama hesaplama
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = sum / reviews.length;

      // Kalite puanı ortalaması
      const qualityReviews = reviews.filter((r) => r.qualityRating !== null);
      const averageQualityRating =
        qualityReviews.length > 0
          ? qualityReviews.reduce((acc, r) => acc + (r.qualityRating ?? 0), 0) /
            qualityReviews.length
          : null;

      // Teslimat puanı ortalaması
      const deliveryReviews = reviews.filter((r) => r.deliveryRating !== null);
      const averageDeliveryRating =
        deliveryReviews.length > 0
          ? deliveryReviews.reduce(
              (acc, r) => acc + (r.deliveryRating ?? 0),
              0
            ) / deliveryReviews.length
          : null;

      // İletişim puanı ortalaması
      const communicationReviews = reviews.filter(
        (r) => r.communicationRating !== null
      );
      const averageCommunicationRating =
        communicationReviews.length > 0
          ? communicationReviews.reduce(
              (acc, r) => acc + (r.communicationRating ?? 0),
              0
            ) / communicationReviews.length
          : null;

      // Rating breakdown
      const ratingBreakdown = {
        fiveStars: reviews.filter((r) => r.rating === 5).length,
        fourStars: reviews.filter((r) => r.rating === 4).length,
        threeStars: reviews.filter((r) => r.rating === 3).length,
        twoStars: reviews.filter((r) => r.rating === 2).length,
        oneStar: reviews.filter((r) => r.rating === 1).length,
      };

      return {
        averageRating,
        totalReviews: reviews.length,
        averageQualityRating,
        averageDeliveryRating,
        averageCommunicationRating,
        ratingBreakdown,
      };
    },
  })
);

// ============================================
// GET MY REVIEWS (Kullanıcının verdiği değerlendirmeler)
// ============================================
builder.queryField("myReviews", (t) =>
  t.prismaField({
    type: ["OrderReview"],
    authScopes: { user: true },
    args: {
      skip: t.arg.int({ defaultValue: 0 }),
      take: t.arg.int({ defaultValue: 10 }),
    },
    resolve: async (query, root, args, ctx) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const reviews = await ctx.prisma.orderReview.findMany({
        ...query,
        where: {
          customerId: ctx.user.id,
        },
        skip: args.skip ?? 0,
        take: args.take ?? 10,
        orderBy: { createdAt: "desc" },
      });

      return reviews;
    },
  })
);

// ============================================
// GET MY RECEIVED REVIEWS (Kullanıcının aldığı değerlendirmeler)
// ============================================
builder.queryField("myReceivedReviews", (t) =>
  t.prismaField({
    type: ["OrderReview"],
    authScopes: { user: true },
    args: {
      skip: t.arg.int({ defaultValue: 0 }),
      take: t.arg.int({ defaultValue: 10 }),
    },
    resolve: async (query, root, args, ctx) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const reviews = await ctx.prisma.orderReview.findMany({
        ...query,
        where: {
          manufactureId: ctx.user.id,
        },
        skip: args.skip ?? 0,
        take: args.take ?? 10,
        orderBy: { createdAt: "desc" },
      });

      return reviews;
    },
  })
);
