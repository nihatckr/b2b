/**
 * ============================================================================
 * PAYMENT STATUS ENUM
 * ============================================================================
 * Dosya: PaymentStatus.ts
 * Amaç: Ödeme Durum GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Ödeme Durum Değerleri (6):
 * - PENDING: Beklemede
 * - RECEIPT_UPLOADED: Dekont yüklendi
 * - CONFIRMED: Onaylandı
 * - REJECTED: Reddedildi
 * - OVERDUE: Gecikti
 * - CANCELLED: İptal edildi
 *
 * Kullanım:
 * - Payment.status field'ı
 * - Ödeme takibi
 * - Finansal workflow
 * ============================================================================
 */

import builder from "../builder";

export const PaymentStatus = builder.enumType("PaymentStatus", {
  values: [
    "PENDING", // Beklemede
    "RECEIPT_UPLOADED", // Dekont yüklendi
    "CONFIRMED", // Onaylandı
    "REJECTED", // Reddedildi
    "OVERDUE", // Gecikti
    "CANCELLED", // İptal edildi
  ] as const,
});
