/**
 * ============================================================================
 * GENDER ENUM
 * ============================================================================
 * Dosya: Gender.ts
 * Amaç: Cinsiyet GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Cinsiyet Değerleri (5):
 * - WOMEN: Kadın
 * - MEN: Erkek
 * - GIRLS: Kız çocuk
 * - BOYS: Erkek çocuk
 * - UNISEX: Unisex
 *
 * Kullanım:
 * - Collection.gender field'ı
 * - Sample.gender field'ı
 * - Kategori filtreleme
 * ============================================================================
 */

import builder from "../builder";

export const Gender = builder.enumType("Gender", {
  values: [
    "WOMEN", // Kadın
    "MEN", // Erkek
    "GIRLS", // Kız çocuk
    "BOYS", // Erkek çocuk
    "UNISEX", // Unisex
  ] as const,
});
