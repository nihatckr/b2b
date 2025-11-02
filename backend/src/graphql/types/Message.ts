/**
 * ============================================================================
 * MESSAGE TYPE
 * ============================================================================
 * Dosya: Message.ts
 * Amaç: Mesajlaşma (Message) GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * Sistem Açıklaması:
 * Kullanıcılar arası direkt mesajlaşma ve ürün bazlı (order/sample) mesajlaşma.
 *
 * Mesaj Tipleri (type field):
 * - DIRECT: Kullanıcılar arası direkt mesaj
 * - ORDER: Sipariş bazlı mesajlaşma
 * - SAMPLE: Numune bazlı mesajlaşma
 * - SYSTEM: Sistem mesajları
 *
 * İlişkiler:
 * - sender: Mesajı gönderen kullanıcı
 * - receiver: Mesajı alan kullanıcı (group mesajlarda null olabilir)
 * - order: İlgili sipariş (ORDER tipinde)
 * - sample: İlgili numune (SAMPLE tipinde)
 * - company: Bağlı şirket (grup mesajları için)
 *
 * Özellikler:
 * - Real-time mesajlaşma (WebSocket)
 * - Okundu/okunmadı takibi
 * - Ürün bazlı mesaj gruplama
 * - Firma bazlı mesaj filtreleme
 * ============================================================================
 */

import builder from "../builder";

/**
 * Message Type - Mesajlaşma Entity
 *
 * Prisma object (numeric ID)
 */
export const Message = builder.prismaObject("Message", {
  fields: (t) => ({
    /** Benzersiz mesaj ID'si */
    id: t.exposeID("id"),

    /** Mesaj içeriği */
    content: t.exposeString("content"),

    /** Gönderen kullanıcı ID */
    senderId: t.exposeInt("senderId"),

    /** Alan kullanıcı ID (null: grup mesajı) */
    receiverId: t.exposeInt("receiverId", { nullable: true }),

    /** Okundu mu? */
    isRead: t.exposeBoolean("isRead"),

    /** Mesaj tipi (DIRECT, ORDER, SAMPLE, SYSTEM) */
    type: t.exposeString("type"),

    /** İlgili sipariş ID (ORDER tipinde) */
    orderId: t.exposeInt("orderId", { nullable: true }),

    /** İlgili numune ID (SAMPLE tipinde) */
    sampleId: t.exposeInt("sampleId", { nullable: true }),

    /** Gönderen kullanıcı */
    sender: t.relation("sender"),

    /** Alan kullanıcı */
    receiver: t.relation("receiver", { nullable: true }),

    /** İlgili sipariş */
    order: t.relation("order", { nullable: true }),

    /** İlgili numune */
    sample: t.relation("sample", { nullable: true }),

    /** Bağlı şirket (grup mesajları) */
    company: t.relation("company", { nullable: true }),
    companyId: t.exposeInt("companyId", { nullable: true }),

    /** Mesaj gönderilme zamanı */
    createdAt: t.expose("createdAt", { type: "DateTime" }),

    /** Son güncelleme zamanı (okundu işaretleme) */
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
