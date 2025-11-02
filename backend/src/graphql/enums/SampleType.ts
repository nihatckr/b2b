/**
 * ============================================================================
 * SAMPLE TYPE ENUM
 * ============================================================================
 * Dosya: SampleType.ts
 * Amaç: Numune Tipi GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Numune Tipi Değerleri (4):
 * - STANDARD: Standart numune
 * - REVISION: Revizyon numunesi
 * - CUSTOM: Özel numune
 * - DEVELOPMENT: Geliştirme numunesi
 *
 * Kullanım:
 * - Sample.type field'ı (nullable)
 * - Numune kategorilendirme
 * - İş akışı yönlendirme
 * ============================================================================
 */

import builder from "../builder";

export const SampleType = builder.enumType("SampleType", {
  values: [
    "STANDARD", // Standart numune
    "REVISION", // Revizyon numunesi
    "CUSTOM", // Özel numune
    "DEVELOPMENT", // Geliştirme numunesi
  ] as const,
});
