/**
 * ============================================================================
 * LIBRARY CATEGORY ENUM
 * ============================================================================
 * Dosya: LibraryCategory.ts
 * Amaç: Kütüphane Kategorisi GraphQL enum tanımı
 * Versiyon: 2.0.0
 * 
 * Kütüphane Kategorisi Değerleri (15):
 * - COLOR: Renk
 * - FABRIC: Kumaş
 * - MATERIAL: Malzeme
 * - SIZE_GROUP: Beden grubu
 * - SEASON: Sezon
 * - FIT: Kalıp/Kesim
 * - CERTIFICATION: Sertifika
 * - SIZE_BREAKDOWN: Beden dağılımı
 * - PRINT: Baskı
 * - WASH_EFFECT: Yıkama efekti
 * - TREND: Trend
 * - PACKAGING_TYPE: Paketleme tipi
 * - QUALITY_STANDARD: Kalite standardı
 * - PAYMENT_TERMS: Ödeme koşulları
 * - LABELING_TYPE: Etiketleme tipi
 * 
 * Kullanım:
 * - LibraryItem.category field'ı
 * - Platform ve şirket kütüphaneleri
 * - Filtreleme ve kategorilendirme
 * ============================================================================
 */

import builder from "../builder";

export const LibraryCategory = builder.enumType("LibraryCategory", {
  values: [
    "COLOR", // Renk
    "FABRIC", // Kumaş
    "MATERIAL", // Malzeme
    "SIZE_GROUP", // Beden grubu
    "SEASON", // Sezon
    "FIT", // Kalıp/Kesim
    "CERTIFICATION", // Sertifika
    "SIZE_BREAKDOWN", // Beden dağılımı
    "PRINT", // Baskı
    "WASH_EFFECT", // Yıkama efekti
    "TREND", // Trend
    "PACKAGING_TYPE", // Paketleme tipi
    "QUALITY_STANDARD", // Kalite standardı
    "PAYMENT_TERMS", // Ödeme koşulları
    "LABELING_TYPE", // Etiketleme tipi
  ] as const,
});
