/**
 * ============================================================================
 * SUBSCRIPTION STATUS ENUM
 * ============================================================================
 * Dosya: SubscriptionStatus.ts
 * Amaç: Abonelik Durum GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Abonelik Durum Değerleri (5):
 * - TRIAL: Deneme sürümü
 * - ACTIVE: Aktif
 * - PAST_DUE: Ödeme gecikti
 * - CANCELLED: İptal edildi
 * - EXPIRED: Süresi doldu
 *
 * Kullanım:
 * - Company.subscriptionStatus field'ı
 * - Erişim kontrolü
 * - Faturalama takibi
 * ============================================================================
 */

import builder from "../builder";

export const SubscriptionStatus = builder.enumType("SubscriptionStatus", {
  values: [
    "TRIAL", // Deneme sürümü
    "ACTIVE", // Aktif
    "PAST_DUE", // Ödeme gecikti
    "CANCELLED", // İptal edildi
    "EXPIRED", // Süresi doldu
  ] as const,
});
