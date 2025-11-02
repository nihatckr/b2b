/**
 * ============================================================================
 * ORDER CHANGE LOG TYPE
 * ============================================================================
 * Dosya: OrderChangeLog.ts
 * Amaç: Sipariş Değişiklik Logu GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * OrderChangeType Enum:
 * - QUANTITY: Adet değişikliği
 * - PRICE: Fiyat değişikliği
 * - DEADLINE: Termin değişikliği
 * - SPECIFICATION: Teknik özellik değişikliği
 * - OTHER: Diğer değişiklikler
 *
 * OrderChangeLogStatus Enum:
 * - PENDING: Üretici yanıtı bekleniyor
 * - APPROVED: Üretici kabul etti
 * - REJECTED: Üretici reddetti
 * - NEGOTIATION: Pazarlık başlatıldı
 *
 * Sistem Açıklaması:
 * Müşteri sipariş verildikten sonra değişiklik talep ederse
 * (adet, fiyat, termin vb.), bu değişiklikler loglarda tutulur.
 * Üretici değişikliği onaylar/reddeder veya pazarlık başlatır.
 *
 * İş Akışı:
 * 1. Müşteri değişiklik talebi oluşturur
 * 2. Sistem log kaydı oluşturur (PENDING)
 * 3. Üretici değerlendirir (APPROVED/REJECTED/NEGOTIATION)
 * 4. NEGOTIATION ise OrderNegotiation başlatılır
 *
 * İlişkiler:
 * - order: İlgili sipariş
 * - changedByUser: Değişikliği yapan kullanıcı
 * - reviewedByUser: Değişikliği değerlendiren üretici
 * - relatedNegotiation: İlgili pazarlık (opsiyonel)
 * ============================================================================
 */

import builder from "../builder";

/**
 * OrderChangeLog Type - Sipariş Değişiklik Logu Entity
 */
export const OrderChangeLog = builder.prismaObject("OrderChangeLog", {
  fields: (t) => ({
    /** Benzersiz log ID'si */
    id: t.exposeID("id"),

    /** İlgili sipariş ID */
    orderId: t.exposeInt("orderId"),
    order: t.relation("order"),

    /** Değişikliği yapan kullanıcı ID */
    changedBy: t.exposeInt("changedBy"),
    changedByUser: t.relation("changedByUser"),

    /** Değişiklik tipi (QUANTITY, PRICE, DEADLINE, SPECIFICATION, OTHER) */
    changeType: t.exposeString("changeType"),

    /** Önceki değerler (JSON - quantity: 100, price: 25 gibi) */
    previousValues: t.field({
      type: "String",
      resolve: (parent) => {
        return typeof parent.previousValues === "string"
          ? parent.previousValues
          : JSON.stringify(parent.previousValues);
      },
    }),

    /** Yeni değerler (JSON) */
    newValues: t.field({
      type: "String",
      resolve: (parent) => {
        return typeof parent.newValues === "string"
          ? parent.newValues
          : JSON.stringify(parent.newValues);
      },
    }),

    /** Değişiklik nedeni/açıklaması */
    changeReason: t.exposeString("changeReason", { nullable: true }),

    /** Üretici yanıt durumu (PENDING, APPROVED, REJECTED, NEGOTIATION) */
    manufacturerStatus: t.exposeString("manufacturerStatus"),

    /** Üretici yanıtı/açıklaması */
    manufacturerResponse: t.exposeString("manufacturerResponse", {
      nullable: true,
    }),

    /** Üretici değerlendirme zamanı */
    manufacturerReviewedAt: t.expose("manufacturerReviewedAt", {
      type: "DateTime",
      nullable: true,
    }),

    /** Değerlendiren üretici kullanıcı ID */
    manufacturerReviewedBy: t.exposeInt("manufacturerReviewedBy", {
      nullable: true,
    }),
    reviewedByUser: t.relation("reviewedByUser", { nullable: true }),

    /** Pazarlık başlatıldı mı? */
    negotiationTriggered: t.exposeBoolean("negotiationTriggered"),

    /** İlgili pazarlık ID */
    negotiationId: t.exposeInt("negotiationId", { nullable: true }),
    relatedNegotiation: t.relation("relatedNegotiation", { nullable: true }),

    /** Log oluşturulma zamanı */
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});
