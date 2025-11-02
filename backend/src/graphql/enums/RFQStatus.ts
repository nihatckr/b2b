/**
 * ============================================================================
 * RFQ STATUS ENUM
 * ============================================================================
 * Dosya: RFQStatus.ts
 * Amaç: RFQ (Request for Quote) Durum GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * RFQ Durum Değerleri (5):
 * - OPEN: Açık RFQ (teklifler bekleniyor)
 * - QUOTES_RECEIVED: Teklifler alındı
 * - UNDER_REVIEW: İnceleniyor
 * - WINNER_SELECTED: Kazanan seçildi
 * - CLOSED: Kapatıldı
 *
 * Kullanım:
 * - Collection.rfqStatus field'ı
 * - CollectionQuote teklif sistemi
 * - RFQ iş akışı
 * ============================================================================
 */

import builder from "../builder";

export const RFQStatus = builder.enumType("RFQStatus", {
  values: [
    "OPEN", // Açık (teklifler bekleniyor)
    "QUOTES_RECEIVED", // Teklifler alındı
    "UNDER_REVIEW", // İnceleniyor
    "WINNER_SELECTED", // Kazanan seçildi
    "CLOSED", // Kapatıldı
  ] as const,
});
