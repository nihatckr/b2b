/**
 * ============================================================================
 * STAGE STATUS ENUM
 * ============================================================================
 * Dosya: StageStatus.ts
 * Amaç: Aşama Durum GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Aşama Durum Değerleri (5):
 * - NOT_STARTED: Başlamadı
 * - IN_PROGRESS: Devam ediyor
 * - ON_HOLD: Beklemede
 * - COMPLETED: Tamamlandı
 * - REQUIRES_REVISION: Revizyon gerekiyor
 *
 * Kullanım:
 * - ProductionStageUpdate.status field'ı
 * - Üretim aşaması durumu
 * - Aşama bazlı takip
 * ============================================================================
 */

import builder from "../builder";

export const StageStatus = builder.enumType("StageStatus", {
  values: [
    "NOT_STARTED", // Başlamadı
    "IN_PROGRESS", // Devam ediyor
    "ON_HOLD", // Beklemede
    "COMPLETED", // Tamamlandı
    "REQUIRES_REVISION", // Revizyon gerekiyor
  ] as const,
});
