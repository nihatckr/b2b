/**
 * ============================================================================
 * PRODUCTION STAGE ENUM
 * ============================================================================
 * Dosya: ProductionStage.ts
 * Amaç: Üretim Aşaması GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Üretim Aşaması Değerleri (8):
 * - PLANNING: Planlama
 * - FABRIC: Kumaş hazırlama
 * - CUTTING: Kesim
 * - SEWING: Dikim
 * - PRESSING: Ütüleme
 * - QUALITY: Kalite kontrol
 * - PACKAGING: Paketleme
 * - SHIPPING: Sevkiyat
 *
 * Kullanım:
 * - ProductionStageUpdate.stage field'ı
 * - ProductionTracking.currentStage field'ı
 * - Üretim süreci takibi
 * ============================================================================
 */

import builder from "../builder";

export const ProductionStage = builder.enumType("ProductionStage", {
  values: [
    "PLANNING", // Planlama
    "FABRIC", // Kumaş hazırlama
    "CUTTING", // Kesim
    "SEWING", // Dikim
    "PRESSING", // Ütüleme
    "QUALITY", // Kalite kontrol
    "PACKAGING", // Paketleme
    "SHIPPING", // Sevkiyat
  ] as const,
});
