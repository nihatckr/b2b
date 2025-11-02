/**
 * ============================================================================
 * ORDER TYPE
 * ============================================================================
 * Dosya: Order.ts
 * Amaç: Sipariş (Order) GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * OrderStatus Enum (30 Değer - 7 Aşama):
 *
 * 📋 AŞAMA 1: Sipariş Talebi ve İnceleme
 * - PENDING: Yeni sipariş talebi (müşteriden geldi)
 * - REVIEWED: Üretici tarafından inceleniyor
 *
 * 💰 AŞAMA 2: Fiyat ve Süre Pazarlığı
 * - QUOTE_SENT: Üretici fiyat/süre teklifi gönderdi
 * - CUSTOMER_QUOTE_SENT: Müşteri karşı teklif gönderdi
 * - MANUFACTURER_REVIEWING_QUOTE: Üretici karşı teklifi değerlendiriyor
 * - QUOTE_AGREED: Fiyat ve sürede anlaşma sağlandı
 *
 * ✅ AŞAMA 3: Sipariş Onayı
 * - CONFIRMED: Müşteri siparişi kesinleştirdi (ödeme bekleniyor)
 * - DEPOSIT_PENDING: Kapora ödemesi bekleniyor
 * - DEPOSIT_RECEIVED: Kapora alındı, üretim planı hazırlanacak
 *
 * 📅 AŞAMA 4: Üretim Planlaması
 * - PRODUCTION_PLAN_PREPARING: Üretici üretim planı hazırlıyor
 * - PRODUCTION_PLAN_SENT: Plan müşteriye gönderildi (onay bekleniyor)
 * - PRODUCTION_PLAN_APPROVED: Müşteri planı onayladı (üretim başlayabilir)
 * - PRODUCTION_PLAN_REJECTED: Müşteri planı reddetti (revizyon gerekli)
 *
 * 🏭 AŞAMA 5: Üretim Süreci
 * - IN_PRODUCTION: Üretim başladı (aşamalar takip ediliyor)
 * - PRODUCTION_COMPLETE: Üretim tamamlandı
 * - QUALITY_CHECK: Kalite kontrol yapılıyor
 * - QUALITY_APPROVED: Kalite kontrol geçti
 * - QUALITY_FAILED: Kalite kontrol başarısız (revizyon gerekli)
 *
 * 📦 AŞAMA 6: Sevkiyat ve Teslimat
 * - READY_TO_SHIP: Sevkiyata hazır (kalan ödeme bekleniyor)
 * - BALANCE_PENDING: Kalan ödeme bekleniyor
 * - BALANCE_RECEIVED: Kalan ödeme alındı
 * - SHIPPED: Kargoya verildi
 * - IN_TRANSIT: Yolda
 * - DELIVERED: Müşteriye teslim edildi
 *
 * ❌ AŞAMA 7: Red ve İptal Durumları
 * - REJECTED: Genel red
 * - REJECTED_BY_CUSTOMER: Müşteri tarafından reddedildi
 * - REJECTED_BY_MANUFACTURER: Üretici tarafından reddedildi
 * - CANCELLED: İptal edildi
 * - ON_HOLD: Askıya alındı (geçici durduruldu)
 *
 * OrderType:
 * - DIRECT: Doğrudan sipariş (koleksiyondan)
 * - CUSTOM: Özel sipariş (numuneden)
 *
 * İlişkiler:
 * - customer: Sipariş veren müşteri
 * - manufacture: Üreten firma (User model - ManufactureOrders relation)
 * - collection: Bağlı koleksiyon
 * - basedOnSample: Temel alınan numune
 * - company: Bağlı şirket
 * - productionTracking: Üretim takip detayları
 * - changeLogs: Değişiklik logları
 * - negotiations: Pazarlık geçmişi
 * - sizeBreakdown: Beden dağılımı
 *
 * Özellikler:
 * - Çift yönlü pazarlık sistemi
 * - Üretim takip entegrasyonu
 * - Ödeme aşamaları (kapora + kalan)
 * - Kalite kontrol süreci
 * - Kargo takibi
 * - Denormalize cache (hızlı listeleme)
 * - Global ID & Relay desteği
 * ============================================================================
 */

import builder from "../builder";
import { OrderStatus } from "../enums/OrderStatus";

/**
 * Order Type - Sipariş Entity
 *
 * Global ID destekli Prisma node (Relay uyumlu)
 * Sorgu örneği: node(id: "T3JkZXI6MQ==") { ...on Order { orderNumber } }
 */
export const Order = builder.prismaNode("Order", {
  id: { field: "id" },
  fields: (t) => ({
    // ========================================
    // TEMEL BİLGİLER
    // ========================================

    /** Sipariş numarası (benzersiz, otomatik oluşturulur) */
    orderNumber: t.exposeString("orderNumber"),

    /** Sipariş adedi */
    quantity: t.exposeInt("quantity"),

    /** Birim fiyat */
    unitPrice: t.exposeFloat("unitPrice"),

    /** Toplam fiyat (quantity * unitPrice) */
    totalPrice: t.exposeFloat("totalPrice"),

    /** Hedef fiyat (müşterinin bütçesi) */
    targetPrice: t.exposeFloat("targetPrice", { nullable: true }),

    /** Para birimi (TRY, USD, EUR) */
    currency: t.exposeString("currency", { nullable: true }),

    /** Son teslim tarihi */
    deadline: t.expose("deadline", { type: "DateTime", nullable: true }),

    /** Genel notlar */
    notes: t.exposeString("notes", { nullable: true }),

    /**
     * Sipariş durumu (30 farklı durum - 7 aşama)
     * Aşama 1: PENDING, REVIEWED
     * Aşama 2: QUOTE_SENT, CUSTOMER_QUOTE_SENT, MANUFACTURER_REVIEWING_QUOTE, QUOTE_AGREED
     * Aşama 3: CONFIRMED, DEPOSIT_PENDING, DEPOSIT_RECEIVED
     * Aşama 4: PRODUCTION_PLAN_PREPARING, PRODUCTION_PLAN_SENT, PRODUCTION_PLAN_APPROVED, PRODUCTION_PLAN_REJECTED
     * Aşama 5: IN_PRODUCTION, PRODUCTION_COMPLETE, QUALITY_CHECK, QUALITY_APPROVED, QUALITY_FAILED
     * Aşama 6: READY_TO_SHIP, BALANCE_PENDING, BALANCE_RECEIVED, SHIPPED, IN_TRANSIT, DELIVERED
     * Aşama 7: REJECTED, REJECTED_BY_CUSTOMER, REJECTED_BY_MANUFACTURER, CANCELLED, ON_HOLD
     */
    status: t.expose("status", { type: OrderStatus }),

    // ========================================
    // MÜŞTERİ TEKLİFİ (Pazarlık Sistemi)
    // ========================================

    /** Müşterinin teklif ettiği fiyat (karşı teklif) */
    customerQuotedPrice: t.exposeFloat("customerQuotedPrice", {
      nullable: true,
    }),

    /** Müşterinin teklif ettiği üretim süresi (gün) */
    customerQuoteDays: t.exposeInt("customerQuoteDays", { nullable: true }),

    /** Müşteri teklifine eklenen not/açıklama */
    customerQuoteNote: t.exposeString("customerQuoteNote", { nullable: true }),

    /** Müşteri teklif tipi (COUNTER_OFFER, ACCEPTANCE vb.) */
    customerQuoteType: t.exposeString("customerQuoteType", { nullable: true }),

    /** Müşteri teklifinin gönderilme zamanı */
    customerQuoteSentAt: t.expose("customerQuoteSentAt", {
      type: "DateTime",
      nullable: true,
    }),

    // ========================================
    // ÜRETİM ZAMAN ÇİZELGESİ
    // ========================================

    /** Planlanan üretim süresi (gün) */
    productionDays: t.exposeInt("productionDays", { nullable: true }),

    /** Tahmini üretim tamamlanma tarihi */
    estimatedProductionDate: t.expose("estimatedProductionDate", {
      type: "DateTime",
      nullable: true,
    }),

    /** Gerçekleşen üretim başlangıç tarihi */
    actualProductionStart: t.expose("actualProductionStart", {
      type: "DateTime",
      nullable: true,
    }),

    /** Gerçekleşen üretim bitiş tarihi */
    actualProductionEnd: t.expose("actualProductionEnd", {
      type: "DateTime",
      nullable: true,
    }),

    // ========================================
    // SEVKİYAT & TESLİMAT
    // ========================================

    /** Kargo gönderim tarihi */
    shippingDate: t.expose("shippingDate", {
      type: "DateTime",
      nullable: true,
    }),

    /** Teslimat adresi */
    deliveryAddress: t.exposeString("deliveryAddress", { nullable: true }),

    /** Kargo takip numarası */
    cargoTrackingNumber: t.exposeString("cargoTrackingNumber", {
      nullable: true,
    }),

    // ========================================
    // NOTLAR & MESAJLAŞMA
    // ========================================

    /** Müşterinin sipariş notu */
    customerNote: t.exposeString("customerNote", { nullable: true }),

    /** Üreticinin müşteriye yanıtı/açıklaması */
    manufacturerResponse: t.exposeString("manufacturerResponse", {
      nullable: true,
    }),

    // ========================================
    // İLİŞKİLER (Relations)
    // ========================================

    /** Bu sipariş hangi numune üzerine kurulu */
    basedOnSample: t.relation("basedOnSample", { nullable: true }),

    /** Bağlı koleksiyon */
    collection: t.relation("collection", { nullable: true }),

    /** Sipariş veren müşteri */
    customer: t.relation("customer", { nullable: true }),

    /** Üreten firma */
    manufacture: t.relation("manufacture", { nullable: true }),

    /** Bağlı şirket (genellikle customer'ın company'si) */
    company: t.relation("company", { nullable: true }),

    /** Üretim takip detayları (aşama aşama) */
    productionTracking: t.relation("productionTracking", { nullable: true }),

    /** Sipariş değişiklik logları */
    changeLogs: t.relation("changeLogs"),

    /** Pazarlık geçmişi (fiyat/süre müzakereleri) */
    negotiations: t.relation("negotiations"),

    /** Beden dağılımı (S: 10, M: 20, L: 15 gibi) */
    sizeBreakdown: t.relation("sizeBreakdown"),

    // ========================================
    // CACHE ALANLARI (Hızlı Listeleme)
    // ========================================

    /** Koleksiyon adı (denormalized - JOIN'siz listeleme için) */
    collectionName: t.exposeString("collectionName", { nullable: true }),

    /** Koleksiyon görseli URL (denormalized) */
    collectionImage: t.exposeString("collectionImage", { nullable: true }),

    /** Koleksiyon model kodu (denormalized) */
    collectionModelCode: t.exposeString("collectionModelCode", {
      nullable: true,
    }),

    // ========================================
    // TARİHLER (Timestamps)
    // ========================================

    /** Sipariş oluşturulma tarihi */
    createdAt: t.expose("createdAt", { type: "DateTime" }),

    /** Son güncelleme tarihi */
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
