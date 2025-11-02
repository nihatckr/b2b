/**
 * ============================================================================
 * SAMPLE PRODUCTION TYPE
 * ============================================================================
 * Dosya: SampleProduction.ts
 * Amaç: Numune Üretim Logu GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * Sistem Açıklaması:
 * Numune üretim sürecinin durum değişikliklerini loglar.
 * Her SampleStatus değişiminde yeni kayıt oluşturulur.
 *
 * SampleStatus: Sample.ts'deki 28 durum değeri kullanılır
 *
 * İlişkiler:
 * - sample: İlgili numune
 * - updatedBy: Durumu güncelleyen kullanıcı
 *
 * Özellikler:
 * - Durum geçmişi takibi
 * - Tahmini/gerçek tarih karşılaştırması
 * - Her güncelleme için not alanı
 * ============================================================================
 */

import builder from "../builder";
import { SampleStatus } from "../enums";

/**
 * SampleProduction Type - Numune Üretim Logu Entity
 */
export const SampleProduction = builder.prismaObject("SampleProduction", {
  fields: (t) => ({
    /** Benzersiz log ID'si */
    id: t.exposeID("id"),

    /** Numune durumu (28 SampleStatus değerinden biri) */
    status: t.expose("status", { type: SampleStatus }),

    /** Güncelleme notu */
    note: t.exposeString("note", { nullable: true }),

    /** Tahmini gün sayısı */
    estimatedDays: t.exposeInt("estimatedDays", { nullable: true }),

    /** Gerçekleşen tarih */
    actualDate: t.expose("actualDate", { type: "DateTime", nullable: true }),

    /** İlgili numune */
    sample: t.relation("sample"),
    sampleId: t.exposeInt("sampleId"),

    /** Güncelleyen kullanıcı */
    updatedBy: t.relation("updatedBy"),
    updatedById: t.exposeInt("updatedById"),

    /** Log oluşturulma zamanı */
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});
