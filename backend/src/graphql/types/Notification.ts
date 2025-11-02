/**
 * ============================================================================
 * NOTIFICATION TYPE
 * ============================================================================
 * Dosya: Notification.ts
 * Amaç: Bildirim (Notification) GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * NotificationType Enum (9 Kategori):
 * - ORDER: Sipariş bildirimleri (yeni sipariş, durum değişikliği)
 * - SAMPLE: Numune bildirimleri (onay, red, üretim güncellemeleri)
 * - MESSAGE: Mesaj bildirimleri (yeni mesaj, yanıt)
 * - PRODUCTION: Üretim bildirimleri (aşama güncellemeleri)
 * - QUALITY: Kalite kontrol bildirimleri (test sonuçları)
 * - SYSTEM: Sistem bildirimleri (bakım, güncellemeler)
 * - USER_MANAGEMENT: Kullanıcı yönetimi (davet, rol değişikliği)
 * - ORDER_UPDATE: Sipariş güncellemeleri (fiyat, miktar değişikliği)
 * - ORDER_CHANGE_RESPONSE: Sipariş değişikliği yanıtları (kabul/red)
 *
 * İlişkiler:
 * - user: Bildirimi alan kullanıcı
 * - order: İlgili sipariş (opsiyonel)
 * - sample: İlgili numune (opsiyonel)
 * - productionTracking: İlgili üretim takibi (opsiyonel)
 *
 * Özellikler:
 * - WebSocket real-time bildirimleri
 * - Okundu/okunmadı durumu takibi
 * - Ek veri desteği (JSON)
 * - Deep linking (ilgili sayfaya yönlendirme)
 * - Otomatik bildirim oluşturma (status değişimlerinde)
 * - Index optimizasyonu (userId + isRead, userId + createdAt)
 * ============================================================================
 */

import builder from "../builder";
import { NotificationType } from "../enums/NotificationType";

/**
 * Notification Type - Bildirim Entity
 *
 * Prisma object (Global ID yok - basit ID)
 * WebSocket ile real-time push bildirimleri
 */
export const Notification = builder.prismaObject("Notification", {
  fields: (t) => ({
    // ========================================
    // TEMEL BİLGİLER
    // ========================================

    /** Benzersiz bildirim ID'si */
    id: t.exposeID("id"),

    /**
     * Bildirim tipi (9 kategori)
     * ORDER, SAMPLE, MESSAGE, PRODUCTION, QUALITY, SYSTEM,
     * USER_MANAGEMENT, ORDER_UPDATE, ORDER_CHANGE_RESPONSE
     */
    type: t.expose("type", { type: NotificationType }),

    /** Bildirim başlığı (kısa özet) */
    title: t.exposeString("title"),

    /** Bildirim mesajı (detaylı açıklama) */
    message: t.exposeString("message"),

    /** Deep link (ilgili sayfanın URL'i - örn: /orders/123) */
    link: t.exposeString("link", { nullable: true }),

    /** Okundu mu? (false: yeni, true: okunmuş) */
    isRead: t.exposeBoolean("isRead"),

    /**
     * Ek veri (JSON format)
     * Örnek: { orderId: 123, statusChange: "PENDING → CONFIRMED" }
     */
    data: t.expose("data", { type: "JSON", nullable: true }),

    // ========================================
    // İLİŞKİLER (Relations)
    // ========================================

    /** Bildirimi alan kullanıcı ID */
    userId: t.exposeInt("userId"),

    /** Bildirimi alan kullanıcı */
    user: t.relation("user"),

    /** İlgili sipariş ID (ORDER tipinde) */
    orderId: t.exposeInt("orderId", { nullable: true }),

    /** İlgili numune ID (SAMPLE tipinde) */
    sampleId: t.exposeInt("sampleId", { nullable: true }),

    /** İlgili üretim takibi ID (PRODUCTION tipinde) */
    productionTrackingId: t.exposeInt("productionTrackingId", {
      nullable: true,
    }),

    // ========================================
    // TARİHLER (Timestamps)
    // ========================================

    /** Bildirim oluşturulma tarihi */
    createdAt: t.expose("createdAt", { type: "DateTime" }),

    /** Son güncelleme tarihi (okundu işaretleme) */
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
