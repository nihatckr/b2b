/**
 * ============================================================================
 * SAMPLE SIZE REQUEST TYPE
 * ============================================================================
 * Dosya: SampleSizeRequest.ts
 * Amaç: Numune Beden Talebi GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * Sistem Açıklaması:
 * Müşteri numune talep ederken hangi bedenleri istediğini belirtir.
 * Örnek: Bir numuneden S, M, L bedenlerinde örnekler istenir.
 *
 * Kullanım Senaryosu:
 * - Müşteri koleksiyondan numune talep eder
 * - Birden fazla beden ister (fit kontrolü için)
 * - Her beden için ayrı SampleSizeRequest kaydı oluşturulur
 * - Üretici tüm bedenleri hazırlayıp gönderir
 *
 * İlişkiler:
 * - sample: İlgili numune
 *
 * Özellikler:
 * - Basit yapı (sadece beden bilgisi)
 * - Çoklu beden talep desteği
 * - Zaman damgası ile takip
 * ============================================================================
 */

import builder from "../builder";

/**
 * SampleSizeRequest Type - Numune Beden Talebi Entity
 */
export const SampleSizeRequest = builder.prismaObject("SampleSizeRequest", {
  fields: (t) => ({
    /** Benzersiz talep ID'si */
    id: t.exposeID("id"),

    /** İlgili numune */
    sample: t.relation("sample"),
    sampleId: t.exposeInt("sampleId"),

    /** Talep edilen beden (XS, S, M, L, XL, XXL vb.) */
    size: t.exposeString("size"),

    /** Talep oluşturulma zamanı */
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});
