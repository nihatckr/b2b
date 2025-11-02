import * as z from "zod";

// ============================================
// ORDER REVIEW VALIDATION SCHEMAS
// Backend: reviewMutation.ts
// Backend errors: "Rating must be between 1 and 5", "Order not found"
// ============================================

// Order review schema (1-5 star rating)
export const OrderReviewSchema = z.object({
  orderId: z.number().int().positive("Sipariş ID'si gereklidir"),
  rating: z
    .number()
    .int("Puan tam sayı olmalıdır")
    .min(1, "Puan 1 ile 5 arasında olmalıdır")
    .max(5, "Puan 1 ile 5 arasında olmalıdır"),
  qualityRating: z
    .number()
    .int("Kalite puanı tam sayı olmalıdır")
    .min(1, "Kalite puanı 1 ile 5 arasında olmalıdır")
    .max(5, "Kalite puanı 1 ile 5 arasında olmalıdır")
    .optional(),
  deliveryRating: z
    .number()
    .int("Teslimat puanı tam sayı olmalıdır")
    .min(1, "Teslimat puanı 1 ile 5 arasında olmalıdır")
    .max(5, "Teslimat puanı 1 ile 5 arasında olmalıdır")
    .optional(),
  communicationRating: z
    .number()
    .int("İletişim puanı tam sayı olmalıdır")
    .min(1, "İletişim puanı 1 ile 5 arasında olmalıdır")
    .max(5, "İletişim puanı 1 ile 5 arasında olmalıdır")
    .optional(),
  comment: z
    .string()
    .max(1000, "Yorum en fazla 1000 karakter olabilir")
    .optional()
    .or(z.literal("")),
  isPublic: z.boolean().optional(),
});

// Manufacturer reply schema
export const ManufacturerReplySchema = z.object({
  reviewId: z.number().int().positive("Değerlendirme ID'si gereklidir"),
  reply: z
    .string()
    .min(1, "Cevap gereklidir")
    .max(1000, "Cevap en fazla 1000 karakter olabilir"),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type OrderReviewInput = z.infer<typeof OrderReviewSchema>;
export type ManufacturerReplyInput = z.infer<typeof ManufacturerReplySchema>;
