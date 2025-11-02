/**
 * ============================================================================
 * ORDER REVIEW TYPE
 * ============================================================================
 * Dosya: OrderReview.ts
 * Amaç: Sipariş değerlendirme/rating sistemi GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * OrderReview Modeli:
 * - Müşterilerin teslim edilen siparişleri değerlendirmesi
 * - 1-5 yıldız rating sistemi (genel + kalite + teslimat + iletişim)
 * - Yorum ve üretici yanıtı
 * - Herkese açık/kapalı görünürlük
 * - Admin onay sistemi (spam/hakaret kontrolü)
 * - "Yararlı mı?" voting sistemi
 *
 * İlişkiler:
 * - order: İlgili sipariş (unique - her sipariş için 1 değerlendirme)
 * - customer: Değerlendiren müşteri
 * - manufacture: Değerlendirilen üretici
 *
 * Özellikler:
 * - 4 farklı rating kategorisi
 * - Üreticinin yanıt verme hakkı
 * - Admin moderasyon
 * - Helpful/Unhelpful voting
 * ============================================================================
 */

import builder from "../builder";

// OrderReview Type
builder.prismaObject("OrderReview", {
  fields: (t) => ({
    id: t.exposeID("id"),
    orderId: t.exposeInt("orderId"),
    customerId: t.exposeInt("customerId"),
    manufactureId: t.exposeInt("manufactureId"),

    // Relations
    order: t.relation("order"),
    customer: t.relation("customer"),
    manufacture: t.relation("manufacture"),

    // Rating fields (1-5)
    rating: t.exposeInt("rating"),
    qualityRating: t.exposeInt("qualityRating", { nullable: true }),
    deliveryRating: t.exposeInt("deliveryRating", { nullable: true }),
    communicationRating: t.exposeInt("communicationRating", { nullable: true }),

    // Comment
    comment: t.exposeString("comment", { nullable: true }),

    // Manufacturer reply
    manufacturerReply: t.exposeString("manufacturerReply", { nullable: true }),
    manufacturerRepliedAt: t.expose("manufacturerRepliedAt", {
      type: "DateTime",
      nullable: true,
    }),

    // Status
    isPublic: t.exposeBoolean("isPublic"),
    isApproved: t.exposeBoolean("isApproved"),

    // Helpful counts
    helpfulCount: t.exposeInt("helpfulCount"),
    unhelpfulCount: t.exposeInt("unhelpfulCount"),

    // Timestamps
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
}); // Rating Breakdown Type
export const RatingBreakdown = builder
  .objectRef<{
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
  }>("RatingBreakdown")
  .implement({
    fields: (t) => ({
      fiveStars: t.int({ resolve: (parent) => parent.fiveStars }),
      fourStars: t.int({ resolve: (parent) => parent.fourStars }),
      threeStars: t.int({ resolve: (parent) => parent.threeStars }),
      twoStars: t.int({ resolve: (parent) => parent.twoStars }),
      oneStar: t.int({ resolve: (parent) => parent.oneStar }),
    }),
  });

// Average Rating Result Type
export const AverageRatingResult = builder
  .objectRef<{
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: {
      fiveStars: number;
      fourStars: number;
      threeStars: number;
      twoStars: number;
      oneStar: number;
    };
  }>("AverageRatingResult")
  .implement({
    fields: (t) => ({
      averageRating: t.float({ resolve: (parent) => parent.averageRating }),
      totalReviews: t.int({ resolve: (parent) => parent.totalReviews }),
      ratingBreakdown: t.field({
        type: RatingBreakdown,
        resolve: (parent) => parent.ratingBreakdown,
      }),
    }),
  });

// Manufacturer Rating Stats Type
export const ManufacturerRatingStats = builder
  .objectRef<{
    averageRating: number;
    totalReviews: number;
    averageQualityRating: number | null;
    averageDeliveryRating: number | null;
    averageCommunicationRating: number | null;
    ratingBreakdown: {
      fiveStars: number;
      fourStars: number;
      threeStars: number;
      twoStars: number;
      oneStar: number;
    };
  }>("ManufacturerRatingStats")
  .implement({
    fields: (t) => ({
      averageRating: t.float({ resolve: (parent) => parent.averageRating }),
      totalReviews: t.int({ resolve: (parent) => parent.totalReviews }),
      averageQualityRating: t.float({
        nullable: true,
        resolve: (parent) => parent.averageQualityRating,
      }),
      averageDeliveryRating: t.float({
        nullable: true,
        resolve: (parent) => parent.averageDeliveryRating,
      }),
      averageCommunicationRating: t.float({
        nullable: true,
        resolve: (parent) => parent.averageCommunicationRating,
      }),
      ratingBreakdown: t.field({
        type: RatingBreakdown,
        resolve: (parent) => parent.ratingBreakdown,
      }),
    }),
  });
