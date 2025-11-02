/**
 * ============================================================================
 * LIBRARY SCOPE ENUM
 * ============================================================================
 * Dosya: LibraryScope.ts
 * Amaç: Kütüphane Kapsamı GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Kütüphane Kapsamı Değerleri (2):
 * - PLATFORM_STANDARD: Platform standart kütüphanesi
 * - COMPANY_CUSTOM: Şirkete özel kütüphane
 *
 * Kullanım:
 * - LibraryItem.scope field'ı
 * - Kütüphane erişim kontrolü
 * - Platform vs özel içerik ayrımı
 * ============================================================================
 */

import builder from "../builder";

export const LibraryScope = builder.enumType("LibraryScope", {
  values: [
    "PLATFORM_STANDARD", // Platform standart kütüphanesi
    "COMPANY_CUSTOM", // Şirkete özel kütüphane
  ] as const,
});
