/**
 * ============================================================================
 * PRODUCTION STATUS ENUM
 * ============================================================================
 * Dosya: ProductionStatus.ts
 * Amaç: Üretim Durum GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Üretim Durum Değerleri (5):
 * - IN_PROGRESS: Devam ediyor
 * - WAITING: Beklemede
 * - BLOCKED: Bloke oldu
 * - COMPLETED: Tamamlandı
 * - CANCELLED: İptal edildi
 *
 * Kullanım:
 * - ProductionTracking.status field'ı
 * - Üretim durumu takibi
 * - İş akışı yönetimi
 * ============================================================================
 */

import builder from "../builder";

export const ProductionStatus = builder.enumType("ProductionStatus", {
  values: [
    "IN_PROGRESS", // Devam ediyor
    "WAITING", // Beklemede
    "BLOCKED", // Bloke oldu
    "COMPLETED", // Tamamlandı
    "CANCELLED", // İptal edildi
  ] as const,
});
