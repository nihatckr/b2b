/**
 * ============================================================================
 * ORDER STATUS ENUM
 * ============================================================================
 * Dosya: OrderStatus.ts
 * Amaç: Sipariş Durum GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Durum Değerleri (30 - 7 Ana Aşama):
 *
 * 📝 AŞAMA 1: SİPARİŞ TALEBİ VE İNCELEME
 * - PENDING: Sipariş talebi bekleniyor
 * - REVIEWED: Sipariş incelendi
 *
 * 💰 AŞAMA 2: FİYAT VE SÜRE PAZARLIĞI
 * - QUOTE_SENT: Üretici teklif gönderdi
 * - CUSTOMER_QUOTE_SENT: Müşteri karşı teklif gönderdi
 * - MANUFACTURER_REVIEWING_QUOTE: Üretici karşı teklifi inceliyor
 * - QUOTE_AGREED: Fiyat ve süre üzerinde anlaşıldı
 *
 * ✅ AŞAMA 3: SİPARİŞ ONAYI
 * - CONFIRMED: Sipariş onaylandı
 * - DEPOSIT_PENDING: Kapora bekleniyor
 * - DEPOSIT_RECEIVED: Kapora alındı
 *
 * 📋 AŞAMA 4: ÜRETİM PLANLAMASI
 * - PRODUCTION_PLAN_PREPARING: Üretim planı hazırlanıyor
 * - PRODUCTION_PLAN_SENT: Üretim planı gönderildi
 * - PRODUCTION_PLAN_APPROVED: Üretim planı onaylandı
 * - PRODUCTION_PLAN_REJECTED: Üretim planı reddedildi
 *
 * 🏭 AŞAMA 5: ÜRETİM SÜRECİ
 * - IN_PRODUCTION: Üretim devam ediyor
 * - PRODUCTION_COMPLETE: Üretim tamamlandı
 * - QUALITY_CHECK: Kalite kontrolde
 * - QUALITY_APPROVED: Kalite kontrolden geçti
 * - QUALITY_FAILED: Kalite kontrolden geçemedi
 *
 * 🚚 AŞAMA 6: SEVKİYAT VE TESLİMAT
 * - READY_TO_SHIP: Sevkiyata hazır
 * - BALANCE_PENDING: Kalan ödeme bekleniyor
 * - BALANCE_RECEIVED: Kalan ödeme alındı
 * - SHIPPED: Kargoya verildi
 * - IN_TRANSIT: Yolda
 * - DELIVERED: Teslim edildi
 *
 * ❌ AŞAMA 7: RED VE İPTAL DURUMLARI
 * - REJECTED: Sipariş reddedildi
 * - REJECTED_BY_CUSTOMER: Müşteri tarafından reddedildi
 * - REJECTED_BY_MANUFACTURER: Üretici tarafından reddedildi
 * - CANCELLED: İptal edildi
 * - ON_HOLD: Askıya alındı
 *
 * Kullanım:
 * - Order.status field'ı
 * - Dynamic Task System tetikleyicisi
 * - OrderChangeLog kaydı
 * - OrderProduction tracking
 * ============================================================================
 */

import builder from "../builder";

export const OrderStatus = builder.enumType("OrderStatus", {
  values: [
    // 📝 AŞAMA 1: SİPARİŞ TALEBİ VE İNCELEME
    "PENDING", // Sipariş talebi bekleniyor
    "REVIEWED", // Sipariş incelendi

    // 💰 AŞAMA 2: FİYAT VE SÜRE PAZARLIĞI
    "QUOTE_SENT", // Üretici teklif gönderdi
    "CUSTOMER_QUOTE_SENT", // Müşteri karşı teklif gönderdi
    "MANUFACTURER_REVIEWING_QUOTE", // Üretici karşı teklifi inceliyor
    "QUOTE_AGREED", // Fiyat ve süre üzerinde anlaşıldı

    // ✅ AŞAMA 3: SİPARİŞ ONAYI
    "CONFIRMED", // Sipariş onaylandı
    "DEPOSIT_PENDING", // Kapora bekleniyor
    "DEPOSIT_RECEIVED", // Kapora alındı

    // 📋 AŞAMA 4: ÜRETİM PLANLAMASI
    "PRODUCTION_PLAN_PREPARING", // Üretim planı hazırlanıyor
    "PRODUCTION_PLAN_SENT", // Üretim planı gönderildi
    "PRODUCTION_PLAN_APPROVED", // Üretim planı onaylandı
    "PRODUCTION_PLAN_REJECTED", // Üretim planı reddedildi

    // 🏭 AŞAMA 5: ÜRETİM SÜRECİ
    "IN_PRODUCTION", // Üretim devam ediyor
    "PRODUCTION_COMPLETE", // Üretim tamamlandı
    "QUALITY_CHECK", // Kalite kontrolde
    "QUALITY_APPROVED", // Kalite kontrolden geçti
    "QUALITY_FAILED", // Kalite kontrolden geçemedi

    // 🚚 AŞAMA 6: SEVKİYAT VE TESLİMAT
    "READY_TO_SHIP", // Sevkiyata hazır
    "BALANCE_PENDING", // Kalan ödeme bekleniyor
    "BALANCE_RECEIVED", // Kalan ödeme alındı
    "SHIPPED", // Kargoya verildi
    "IN_TRANSIT", // Yolda
    "DELIVERED", // Teslim edildi

    // ❌ AŞAMA 7: RED VE İPTAL DURUMLARI
    "REJECTED", // Sipariş reddedildi
    "REJECTED_BY_CUSTOMER", // Müşteri tarafından reddedildi
    "REJECTED_BY_MANUFACTURER", // Üretici tarafından reddedildi
    "CANCELLED", // İptal edildi
    "ON_HOLD", // Askıya alındı
  ] as const,
});
