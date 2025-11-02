/**
 * ============================================================================
 * SAMPLE TYPE
 * ============================================================================
 * Dosya: Sample.ts
 * Amaç: Numune (Sample) GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * SampleStatus Enum (28 Değer - 7 Kategori):
 *
 * 📋 İLK AŞAMALAR (AI ve Talep):
 * - AI_DESIGN: AI ile oluşturulmuş tasarım (henüz üreticiye gönderilmedi)
 * - PENDING_APPROVAL: Üretici onayı bekleniyor (eski flow)
 * - PENDING: Beklemede - Yeni talep
 *
 * 🔍 İNCELEME ve TEKLİF AŞAMASI:
 * - REVIEWED: Üretici tarafından inceleniyor
 * - QUOTE_SENT: Üretici süre ve fiyat teklifi gönderdi
 * - CUSTOMER_QUOTE_SENT: Müşteri teklif gönderdi (standart veya revize)
 * - MANUFACTURER_REVIEWING_QUOTE: Üretici müşteri teklifini inceliyor
 *
 * ✅❌ ONAY/RED DURUMLAR:
 * - CONFIRMED: Müşteri onayladı, üretim başlayabilir
 * - REJECTED: Genel red
 * - REJECTED_BY_CUSTOMER: Müşteri tarafından reddedildi
 * - REJECTED_BY_MANUFACTURER: Üretici tarafından reddedildi
 *
 * 🏭 ÜRETİM AŞAMALARI:
 * - IN_DESIGN: Tasarım aşamasında (eski flow)
 * - PATTERN_READY: Kalıp hazır (eski flow)
 * - IN_PRODUCTION: Üretim aşamasında
 * - PRODUCTION_COMPLETE: Üretim tamamlandı
 *
 * 📦 KALİTE ve TESLİMAT:
 * - QUALITY_CHECK: Kalite kontrolde
 * - SHIPPED: Kargoya verildi
 * - DELIVERED: Müşteriye teslim edildi
 *
 * ⏸️ DİĞER DURUMLAR:
 * - ON_HOLD: Durduruldu (geçici olarak askıya alındı)
 * - CANCELLED: İptal edildi
 *
 * 🔄 ESKİ FLOW (Geriye Dönük Uyumluluk):
 * - REQUESTED: Müşteri tarafından talep edildi
 * - RECEIVED: Üretici talebi aldı
 * - COMPLETED: Tamamlandı (artık DELIVERED kullanılıyor)
 *
 * SampleType Enum (4 Değer):
 * - STANDARD: Standart numune (mevcut ürün için)
 * - REVISION: Revize numunesi (mevcut ürün değişiklik talebi)
 * - CUSTOM: Özel tasarım numune (müşteri tasarımı)
 * - DEVELOPMENT: Geliştirme numunesi (backward compatibility)
 *
 * İlişkiler:
 * - customer: Numune talep eden müşteri
 * - manufacture: Numune üreten firma
 * - company: Bağlı şirket
 * - collection: Bağlı koleksiyon
 *
 * Özellikler:
 * - AI tasarım desteği (aiGenerated, aiPrompt, aiSketchUrl)
 * - Çift yönlü teklif sistemi (üretici → müşteri, müşteri → üretici)
 * - Üretim takibi (estimatedDate, actualDate, productionDays)
 * - Fiyatlandırma (unitPrice, customerQuotedPrice)
 * - Global ID & Relay desteği
 * ============================================================================
 */

import builder from "../builder";
import { SampleStatus } from "../enums/SampleStatus";
import { SampleType } from "../enums/SampleType";

/**
 * Sample Type - Numune Entity
 *
 * Global ID destekli Prisma node (Relay uyumlu)
 * Sorgu örneği: node(id: "U2FtcGxlOjE=") { ...on Sample { sampleNumber } }
 */
export const Sample = builder.prismaNode("Sample", {
  id: { field: "id" },
  fields: (t) => ({
    // ========================================
    // TEMEL BİLGİLER
    // ========================================

    /** Numune numarası (benzersiz, otomatik oluşturulur) */
    sampleNumber: t.exposeString("sampleNumber"),

    /**
     * Numune tipi
     * STANDARD: Standart numune | REVISION: Revize | CUSTOM: Özel tasarım | DEVELOPMENT: Geliştirme
     */
    sampleType: t.expose("sampleType", { type: SampleType }),

    /** Numune adı */
    name: t.exposeString("name", { nullable: true }),

    /** Numune açıklaması */
    description: t.exposeString("description", { nullable: true }),

    /**
     * Numune durumu (28 farklı durum - 7 kategori)
     * İlk Aşamalar: AI_DESIGN, PENDING_APPROVAL, PENDING
     * İnceleme & Teklif: REVIEWED, QUOTE_SENT, CUSTOMER_QUOTE_SENT, MANUFACTURER_REVIEWING_QUOTE
     * Onay/Red: CONFIRMED, REJECTED, REJECTED_BY_CUSTOMER, REJECTED_BY_MANUFACTURER
     * Üretim: IN_DESIGN, PATTERN_READY, IN_PRODUCTION, PRODUCTION_COMPLETE
     * Kalite & Teslimat: QUALITY_CHECK, SHIPPED, DELIVERED
     * Diğer: ON_HOLD, CANCELLED
     * Eski Flow: REQUESTED, RECEIVED, COMPLETED
     */
    status: t.expose("status", { type: SampleStatus }),

    // ========================================
    // AI TASARIM SİSTEMİ
    // ========================================

    /** AI ile oluşturuldu mu? */
    aiGenerated: t.exposeBoolean("aiGenerated", { nullable: true }),

    /** AI'ya verilen prompt/talep metni */
    aiPrompt: t.exposeString("aiPrompt", { nullable: true }),

    /** AI tarafından oluşturulan taslak URL */
    aiSketchUrl: t.exposeString("aiSketchUrl", { nullable: true }),

    // ========================================
    // GÖRSEL DOSYALAR
    // ========================================

    /** Numune görselleri (JSON array formatında URL'ler) */
    images: t.exposeString("images", { nullable: true }),

    /** Özel tasarım görselleri (müşteri yüklemeleri) */
    customDesignImages: t.exposeString("customDesignImages", {
      nullable: true,
    }),

    // ========================================
    // FİYATLANDIRMA & ZAMAN ÇİZELGESİ
    // (Üretici Teklifi)
    // ========================================

    /** Birim fiyat (üretici tarafından belirlenir) */
    unitPrice: t.exposeFloat("unitPrice", { nullable: true }),

    /** Üretim süresi (gün olarak) */
    productionDays: t.exposeInt("productionDays", { nullable: true }),

    /** Tahmini üretim tamamlanma tarihi */
    estimatedProductionDate: t.expose("estimatedProductionDate", {
      type: "DateTime",
      nullable: true,
    }),

    /** Gerçekleşen üretim tamamlanma tarihi */
    actualProductionDate: t.expose("actualProductionDate", {
      type: "DateTime",
      nullable: true,
    }),

    // ========================================
    // MÜŞTERİ TEKLİFİ
    // (Karşı teklif sistemi - müşteri → üretici)
    // ========================================

    /** Müşterinin teklif ettiği fiyat */
    customerQuotedPrice: t.exposeFloat("customerQuotedPrice", {
      nullable: true,
    }),

    /** Müşterinin teklif ettiği süre (gün) */
    customerQuoteDays: t.exposeInt("customerQuoteDays", { nullable: true }),

    /** Müşterinin teklif notu/açıklaması */
    customerQuoteNote: t.exposeString("customerQuoteNote", { nullable: true }),

    // ========================================
    // NOTLAR & MESAJLAŞMA
    // ========================================

    /** Müşteri notu (talep sırasında eklenir) */
    customerNote: t.exposeString("customerNote", { nullable: true }),

    /** Üretici cevabı/notu (inceleme sonrası) */
    manufacturerResponse: t.exposeString("manufacturerResponse", {
      nullable: true,
    }),

    // ========================================
    // İLİŞKİLER
    // ========================================

    /** Müşteri (numune talep eden) */
    customer: t.relation("customer"),

    /** Müşteri ID */
    customerId: t.exposeInt("customerId"),

    /** Üretici (numune üreten) */
    manufacture: t.relation("manufacture"),

    /** Üretici ID */
    manufactureId: t.exposeInt("manufactureId"),

    /** Bağlı şirket (opsiyonel) */
    company: t.relation("company", { nullable: true }),

    /** Şirket ID */
    companyId: t.exposeInt("companyId", { nullable: true }),

    /** Bağlı koleksiyon (opsiyonel) */
    collection: t.relation("collection", { nullable: true }),

    /** Koleksiyon ID */
    collectionId: t.exposeInt("collectionId", { nullable: true }),

    // ========================================
    // TARİHLER
    // ========================================

    /** Oluşturulma tarihi */
    createdAt: t.expose("createdAt", { type: "DateTime" }),

    /** Son güncellenme tarihi */
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
