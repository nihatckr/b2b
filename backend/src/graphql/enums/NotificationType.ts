/**
 * ============================================================================
 * NOTIFICATION TYPE ENUM
 * ============================================================================
 * Dosya: NotificationType.ts
 * Amaç: Bildirim Tipi GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Bildirim Tipi Değerleri (9):
 * - ORDER: Sipariş bildirimleri
 * - SAMPLE: Numune bildirimleri
 * - MESSAGE: Mesaj bildirimleri
 * - PRODUCTION: Üretim bildirimleri
 * - QUALITY: Kalite kontrol bildirimleri
 * - SYSTEM: Sistem bildirimleri
 * - USER_MANAGEMENT: Kullanıcı yönetimi bildirimleri
 * - ORDER_UPDATE: Sipariş güncelleme bildirimleri
 * - ORDER_CHANGE_RESPONSE: Sipariş değişiklik yanıt bildirimleri
 *
 * Kullanım:
 * - Notification.type field'ı
 * - WebSocket subscriptions
 * - Bildirim filtreleme
 * ============================================================================
 */

import builder from "../builder";

export const NotificationType = builder.enumType("NotificationType", {
  values: [
    "ORDER", // Sipariş bildirimleri
    "SAMPLE", // Numune bildirimleri
    "MESSAGE", // Mesaj bildirimleri
    "PRODUCTION", // Üretim bildirimleri
    "QUALITY", // Kalite kontrol bildirimleri
    "SYSTEM", // Sistem bildirimleri
    "USER_MANAGEMENT", // Kullanıcı yönetimi bildirimleri
    "ORDER_UPDATE", // Sipariş güncelleme bildirimleri
    "ORDER_CHANGE_RESPONSE", // Sipariş değişiklik yanıt bildirimleri
  ] as const,
});
