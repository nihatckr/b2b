/**
 * ============================================================================
 * QUOTE STATUS ENUM
 * ============================================================================
 * Dosya: QuoteStatus.ts
 * Amaç: Teklif Durum GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Teklif Durum Değerleri (7):
 * - PENDING: Beklemede
 * - REVIEWED: İncelendi
 * - SHORTLISTED: Kısa listeye alındı
 * - ACCEPTED: Kabul edildi
 * - REJECTED: Reddedildi
 * - EXPIRED: Süresi doldu
 * - WITHDRAWN: Geri çekildi
 *
 * Kullanım:
 * - CollectionQuote.status field'ı
 * - RFQ teklif sistemi
 * - Teklif iş akışı
 * ============================================================================
 */

import builder from "../builder";

export const QuoteStatus = builder.enumType("QuoteStatus", {
  values: [
    "PENDING", // Beklemede
    "REVIEWED", // İncelendi
    "SHORTLISTED", // Kısa listeye alındı
    "ACCEPTED", // Kabul edildi
    "REJECTED", // Reddedildi
    "EXPIRED", // Süresi doldu
    "WITHDRAWN", // Geri çekildi
  ] as const,
});
