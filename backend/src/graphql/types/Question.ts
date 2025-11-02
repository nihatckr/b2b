/**
 * ============================================================================
 * QUESTION TYPE
 * ============================================================================
 * Dosya: Question.ts
 * Amaç: Soru-Cevap (Q&A) GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * Sistem Açıklaması:
 * Müşteriler (customer) koleksiyonlar hakkında sorular sorar,
 * üreticiler (manufacture) bu soruları yanıtlar.
 *
 * İş Akışı:
 * 1. Müşteri bir koleksiyon hakkında soru sorar
 * 2. Soru üreticiye bildirilir
 * 3. Üretici soruyu yanıtlar (answer alanı doldurulur)
 * 4. isAnswered = true olur
 * 5. isPublic = true ise diğer kullanıcılar görebilir
 *
 * İlişkiler:
 * - collection: Sorunun sorulduğu koleksiyon
 * - customer: Soruyu soran müşteri
 * - manufacture: Soruyu yanıtlayacak üretici
 *
 * Özellikler:
 * - Gizlilik kontrolü (isPublic)
 * - Yanıtlanma durumu takibi (isAnswered)
 * - Koleksiyon bazlı gruplama
 * - Zaman damgaları ile takip
 * ============================================================================
 */

import builder from "../builder";

/**
 * Question Type - Soru-Cevap Entity
 *
 * Prisma object (Global ID yok - basit ID)
 */
export const Question = builder.prismaObject("Question", {
  fields: (t) => ({
    // ========================================
    // TEMEL BİLGİLER
    // ========================================

    /** Benzersiz soru ID'si */
    id: t.exposeID("id"),

    /** Sorunun metni (müşteri tarafından yazılan) */
    question: t.exposeString("question"),

    /** Yanıt metni (üretici tarafından yazılan, null ise henüz yanıtlanmadı) */
    answer: t.exposeString("answer", { nullable: true }),

    /** Yanıtlandı mı? (false: bekliyor, true: yanıtlandı) */
    isAnswered: t.exposeBoolean("isAnswered"),

    /**
     * Herkes görebilir mi?
     * true: Diğer kullanıcılar da görebilir (FAQ benzeri)
     * false: Sadece soran müşteri ve üretici görür
     */
    isPublic: t.exposeBoolean("isPublic"),

    // ========================================
    // İLİŞKİLER (Relations)
    // ========================================

    /** Sorunun sorulduğu koleksiyon */
    collection: t.relation("collection"),
    collectionId: t.exposeInt("collectionId"),

    /** Soruyu soran müşteri */
    customer: t.relation("customer"),
    customerId: t.exposeInt("customerId"),

    /** Soruyu yanıtlayacak üretici (koleksiyonun sahibi) */
    manufacture: t.relation("manufacture"),
    manufactureId: t.exposeInt("manufactureId"),

    // ========================================
    // TARİHLER (Timestamps)
    // ========================================

    /** Sorunun sorulma tarihi */
    createdAt: t.expose("createdAt", { type: "DateTime" }),

    /** Son güncelleme tarihi (yanıt eklendiğinde güncellenir) */
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
