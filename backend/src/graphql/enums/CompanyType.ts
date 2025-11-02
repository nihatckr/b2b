/**
 * ============================================================================
 * COMPANY TYPE ENUM
 * ============================================================================
 * Dosya: CompanyType.ts
 * Amaç: Şirket Tipi GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Şirket Tipi Değerleri (3):
 * - MANUFACTURER: Üretici firma
 * - BUYER: Alıcı firma
 * - BOTH: Hem üretici hem alıcı
 *
 * Kullanım:
 * - Company.type field'ı
 * - Yetkilendirme kontrolü
 * - İş akışı yönlendirme
 * ============================================================================
 */

import builder from "../builder";

export const CompanyType = builder.enumType("CompanyType", {
  values: [
    "MANUFACTURER", // Üretici firma
    "BUYER", // Alıcı firma
    "BOTH", // Hem üretici hem alıcı
  ] as const,
});
