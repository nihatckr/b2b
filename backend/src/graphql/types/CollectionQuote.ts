/**
 * ============================================================================
 * COLLECTION QUOTE TYPE
 * ============================================================================
 * Dosya: CollectionQuote.ts
 * Amaç: RFQ Teklif (Collection Quote) GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * QuoteStatus Enum (7 Durum):
 * - PENDING: Teklif gönderildi, müşteri henüz bakmadı
 * - REVIEWED: Müşteri teklifi gördü
 * - SHORTLISTED: Müşteri kısa listeye aldı
 * - ACCEPTED: Müşteri teklifi kabul etti (kazanan)
 * - REJECTED: Müşteri teklifi reddetti
 * - EXPIRED: Teklif süresi doldu
 * - WITHDRAWN: Üretici teklifi geri çekti
 *
 * Sistem Açıklaması:
 * Müşteri RFQ (Request for Quotation) koleksiyonu oluşturur,
 * üreticiler teklif gönderir. Müşteri teklifleri değerlendirir,
 * kazananla numune/sipariş aşamasına geçer.
 *
 * İş Akışı:
 * 1. Müşteri RFQ koleksiyonu oluşturur (Collection.isRFQ = true)
 * 2. Üreticiler teklif gönderir (CollectionQuote)
 * 3. Müşteri teklifleri değerlendirir, not/puan verir
 * 4. Kazanan seçilir (isWinner = true)
 * 5. Numune talep edilir veya direkt sipariş
 *
 * İlişkiler:
 * - collection: RFQ koleksiyonu
 * - manufacture: Teklif veren üretici
 * - sample: Oluşturulan numune (opsiyonel)
 * - order: Oluşturulan sipariş (opsiyonel)
 * ============================================================================
 */

import builder from "../builder";
import { QuoteStatus } from "../enums";

/**
 * CollectionQuote Type - RFQ Teklif Entity
 */
export const CollectionQuote = builder.prismaObject("CollectionQuote", {
  fields: (t) => ({
    /** Benzersiz teklif ID'si */
    id: t.exposeID("id"),

    /** RFQ koleksiyon ID */
    collectionId: t.exposeInt("collectionId"),
    collection: t.relation("collection"),

    /** Teklif veren üretici ID */
    manufactureId: t.exposeInt("manufactureId"),
    manufacture: t.relation("manufacture"),

    /** Teklif edilen birim fiyat */
    unitPrice: t.exposeFloat("unitPrice"),

    /** Para birimi */
    currency: t.exposeString("currency"),

    /** Minimum sipariş adedi (MOQ) */
    moq: t.exposeInt("moq"),

    /** Üretim süresi (gün) */
    productionDays: t.exposeInt("productionDays"),

    /** Numune teslim süresi (gün) */
    sampleDays: t.exposeInt("sampleDays", { nullable: true }),

    /** Numune fiyatı */
    samplePrice: t.exposeFloat("samplePrice", { nullable: true }),

    /** Genel notlar */
    notes: t.exposeString("notes", { nullable: true }),

    /** Teknik notlar (üretim detayları) */
    technicalNotes: t.exposeString("technicalNotes", { nullable: true }),

    /** Önerilen kumaş */
    suggestedFabric: t.exposeString("suggestedFabric", { nullable: true }),

    /** Önerilen baskı */
    suggestedPrint: t.exposeString("suggestedPrint", { nullable: true }),

    /** Önerilen finish (yıkama, apre) */
    suggestedFinish: t.exposeString("suggestedFinish", { nullable: true }),

    /** Sertifikalar (JSON array) */
    certifications: t.exposeString("certifications", { nullable: true }),

    /** Portfolyo görselleri (benzer işler) */
    portfolioImages: t.exposeString("portfolioImages", { nullable: true }),

    /** Teklif durumu (PENDING, ACCEPTED, REJECTED, EXPIRED) */
    status: t.expose("status", { type: QuoteStatus }),

    /** Kazanan teklif mi? */
    isWinner: t.exposeBoolean("isWinner"),

    /** Müşteri notu/geri bildirimi */
    customerNote: t.exposeString("customerNote", { nullable: true }),

    /** Müşteri puanı (1-5) */
    customerRating: t.exposeInt("customerRating", { nullable: true }),

    /** Numune talep edildi mi? */
    sampleRequested: t.exposeBoolean("sampleRequested"),

    /** Oluşturulan numune ID */
    sampleId: t.exposeInt("sampleId", { nullable: true }),
    sample: t.relation("sample", { nullable: true }),

    /** Oluşturulan sipariş ID */
    orderId: t.exposeInt("orderId", { nullable: true }),
    order: t.relation("order", { nullable: true }),

    /** Teklif gönderilme zamanı */
    createdAt: t.expose("createdAt", { type: "DateTime" }),

    /** Son güncelleme zamanı */
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),

    /** Teklif son geçerlilik tarihi */
    expiresAt: t.expose("expiresAt", { type: "DateTime", nullable: true }),
  }),
});
