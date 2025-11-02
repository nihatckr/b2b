/**
 * ============================================================================
 * COLLECTION VISIBILITY ENUM
 * ============================================================================
 * Dosya: CollectionVisibility.ts
 * Amaç: Koleksiyon Görünürlük GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Görünürlük Değerleri (3):
 * - PRIVATE: Özel koleksiyon (sadece sahibi görebilir)
 * - INVITED: Davetli kullanıcılar görebilir
 * - PUBLIC: Herkes görebilir
 *
 * Kullanım:
 * - Collection.visibility field'ı
 * - Erişim kontrolü
 * - Koleksiyon paylaşımı
 * ============================================================================
 */

import builder from "../builder";

export const CollectionVisibility = builder.enumType("CollectionVisibility", {
  values: [
    "PRIVATE", // Özel (sadece sahibi)
    "INVITED", // Davetli kullanıcılar
    "PUBLIC", // Herkes
  ] as const,
});
