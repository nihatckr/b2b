/**
 * ============================================================================
 * CATEGORY LEVEL ENUM
 * ============================================================================
 * Dosya: CategoryLevel.ts
 * Amaç: Kategori Seviyesi GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Kategori Seviyesi Değerleri (4):
 * - ROOT: Kök kategori (Level 0)
 * - MAIN: Ana kategori (Level 1)
 * - SUB: Alt kategori (Level 2)
 * - DETAIL: Detay kategori (Level 3)
 *
 * Kullanım:
 * - Category.level field'ı
 * - StandardCategory.level field'ı
 * - CompanyCategory.level field'ı
 * - Hiyerarşik kategori yapısı
 * ============================================================================
 */

import builder from "../builder";

export const CategoryLevel = builder.enumType("CategoryLevel", {
  values: [
    "ROOT", // Kök kategori (Level 0)
    "MAIN", // Ana kategori (Level 1)
    "SUB", // Alt kategori (Level 2)
    "DETAIL", // Detay kategori (Level 3)
  ] as const,
});
