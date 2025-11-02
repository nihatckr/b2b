/**
 * ============================================================================
 * COLLECTION OWNER TYPE ENUM
 * ============================================================================
 * Dosya: CollectionOwnerType.ts
 * Amaç: Koleksiyon Sahibi Tipi GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Sahip Tipi Değerleri (2):
 * - MANUFACTURER: Üretici koleksiyonu
 * - CUSTOMER: Müşteri koleksiyonu
 *
 * Kullanım:
 * - Collection.ownerType field'ı
 * - İş akışı yönlendirme
 * - Koleksiyon kategorilendirme
 * ============================================================================
 */

import builder from "../builder";

export const CollectionOwnerType = builder.enumType("CollectionOwnerType", {
  values: [
    "MANUFACTURER", // Üretici koleksiyonu
    "CUSTOMER", // Müşteri koleksiyonu
  ] as const,
});
