/**
 * ============================================================================
 * ORDER NEGOTIATION TYPE
 * ============================================================================
 * Dosya: OrderNegotiation.ts
 * Amaç: Sipariş Pazarlık (Order Negotiation) GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * NegotiationStatus Enum:
 * - PENDING: Karşı tarafın yanıtı bekleniyor
 * - ACCEPTED: Teklif kabul edildi
 * - REJECTED: Teklif reddedildi
 * - SUPERSEDED: Yeni teklif ile değiştirildi
 *
 * Sistem Açıklaması:
 * Sipariş sonrası müşteri-üretici arası fiyat/süre/miktar pazarlığı.
 * Her iki taraf da karşı teklif sunabilir.
 *
 * İş Akışı:
 * 1. Taraf A teklif gönderir (PENDING)
 * 2. Taraf B kabul/red eder veya karşı teklif yapar
 * 3. ACCEPTED: Sipariş güncellenir
 * 4. Yeni teklif: Eski SUPERSEDED olur, yeni PENDING
 *
 * Roller:
 * - CUSTOMER: Müşteri tarafından gönderilen teklif
 * - MANUFACTURER: Üretici tarafından gönderilen teklif
 *
 * İlişkiler:
 * - order: İlgili sipariş
 * - sender: Teklif gönderen
 * - responder: Teklifi yanıtlayan
 * - relatedChangeLog: İlgili değişiklik logu (opsiyonel)
 * ============================================================================
 */

import builder from "../builder";

/**
 * OrderNegotiation Type - Sipariş Pazarlık Entity
 */
export const OrderNegotiation = builder.prismaObject("OrderNegotiation", {
  fields: (t) => ({
    /** Benzersiz pazarlık ID'si */
    id: t.exposeID("id"),

    /** İlgili sipariş ID */
    orderId: t.exposeInt("orderId"),
    order: t.relation("order"),

    /** Teklif gönderen kullanıcı ID */
    senderId: t.exposeInt("senderId"),
    sender: t.relation("sender"),

    /** Gönderen rolü (CUSTOMER/MANUFACTURER) */
    senderRole: t.exposeString("senderRole"),

    /** Teklif edilen birim fiyat */
    unitPrice: t.exposeFloat("unitPrice"),

    /** Teklif edilen üretim süresi (gün) */
    productionDays: t.exposeInt("productionDays"),

    /** Teklif edilen miktar (opsiyonel) */
    quantity: t.exposeInt("quantity", { nullable: true }),

    /** Para birimi */
    currency: t.exposeString("currency"),

    /** Teklif mesajı/açıklaması */
    message: t.exposeString("message", { nullable: true }),

    /** Teklif durumu (PENDING, ACCEPTED, REJECTED, SUPERSEDED) */
    status: t.exposeString("status"),

    /** Yanıt zamanı */
    respondedAt: t.expose("respondedAt", { type: "DateTime", nullable: true }),

    /** Yanıtlayan kullanıcı ID */
    respondedBy: t.exposeInt("respondedBy", { nullable: true }),
    responder: t.relation("responder", { nullable: true }),

    /** İlgili değişiklik logu */
    relatedChangeLog: t.relation("relatedChangeLog", { nullable: true }),

    /** Teklif gönderilme zamanı */
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});
