/**
 * ============================================================================
 * SAMPLE STATUS ENUM
 * ============================================================================
 * Dosya: SampleStatus.ts
 * Amaç: Numune Durum GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Durum Değerleri (28 - 7 Kategori):
 *
 * 🎨 İLK AŞAMALAR (AI ve Talep):
 * - AI_DESIGN: AI ile tasarım oluşturuldu
 * - PENDING_APPROVAL: Onay bekleniyor
 * - PENDING: Müşteri talebi bekleniyor
 *
 * 🔍 İNCELEME VE TEKLİF:
 * - REVIEWED: Üretici inceledi
 * - QUOTE_SENT: Üretici teklif gönderdi
 * - CUSTOMER_QUOTE_SENT: Müşteri karşı teklif gönderdi
 * - MANUFACTURER_REVIEWING_QUOTE: Üretici karşı teklifi inceliyor
 *
 * ✅ ONAY/RED:
 * - CONFIRMED: Numune onaylandı
 * - REJECTED: Genel red
 * - REJECTED_BY_CUSTOMER: Müşteri reddetti
 * - REJECTED_BY_MANUFACTURER: Üretici reddetti
 *
 * 🏭 ÜRETİM:
 * - IN_DESIGN: Tasarım aşamasında
 * - PATTERN_READY: Kalıp hazır
 * - IN_PRODUCTION: Üretimde
 * - PRODUCTION_COMPLETE: Üretim tamamlandı
 *
 * 📦 KALİTE VE TESLİMAT:
 * - QUALITY_CHECK: Kalite kontrolde
 * - SHIPPED: Kargoya verildi
 * - DELIVERED: Teslim edildi
 *
 * ⏸️ DİĞER:
 * - ON_HOLD: Beklemede
 * - CANCELLED: İptal edildi
 *
 * 🔄 ESKİ FLOW (Backward Compatibility):
 * - REQUESTED: Talep edildi
 * - RECEIVED: Alındı
 * - COMPLETED: Tamamlandı
 *
 * Kullanım:
 * - Sample.status field'ı
 * - Dynamic Task System tetikleyicisi
 * - SampleProduction log kaydı
 * ============================================================================
 */

import builder from "../builder";

export const SampleStatus = builder.enumType("SampleStatus", {
  values: [
    // 🎨 İLK AŞAMALAR (AI ve Talep)
    "AI_DESIGN", // AI ile tasarım oluşturuldu
    "PENDING_APPROVAL", // Onay bekleniyor
    "PENDING", // Müşteri talebi bekleniyor

    // 🔍 İNCELEME VE TEKLİF
    "REVIEWED", // Üretici inceledi
    "QUOTE_SENT", // Üretici teklif gönderdi
    "CUSTOMER_QUOTE_SENT", // Müşteri karşı teklif gönderdi
    "MANUFACTURER_REVIEWING_QUOTE", // Üretici karşı teklifi inceliyor

    // ✅ ONAY/RED
    "CONFIRMED", // Numune onaylandı
    "REJECTED", // Genel red
    "REJECTED_BY_CUSTOMER", // Müşteri reddetti
    "REJECTED_BY_MANUFACTURER", // Üretici reddetti

    // 🏭 ÜRETİM
    "IN_DESIGN", // Tasarım aşamasında
    "PATTERN_READY", // Kalıp hazır
    "IN_PRODUCTION", // Üretimde
    "PRODUCTION_COMPLETE", // Üretim tamamlandı

    // 📦 KALİTE VE TESLİMAT
    "QUALITY_CHECK", // Kalite kontrolde
    "SHIPPED", // Kargoya verildi
    "DELIVERED", // Teslim edildi

    // ⏸️ DİĞER
    "ON_HOLD", // Beklemede
    "CANCELLED", // İptal edildi

    // 🔄 ESKİ FLOW (Backward Compatibility)
    "REQUESTED", // Talep edildi
    "RECEIVED", // Alındı
    "COMPLETED", // Tamamlandı
  ] as const,
});
