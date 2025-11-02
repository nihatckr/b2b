/**
 * ============================================================================
 * COLLECTION TYPE
 * ============================================================================
 * Dosya: Collection.ts
 * Amaç: Koleksiyon (Collection) GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * CollectionOwnerType Enum:
 * - MANUFACTURER: Üretici koleksiyonu (hazır katalog/ürün)
 * - CUSTOMER: Müşteri koleksiyonu (RFQ/teklif talebi)
 *
 * CollectionVisibility Enum (RFQ Sistemi):
 * - PRIVATE: Sadece sahibi görür
 * - INVITED: Davet edilen üreticiler görür
 * - PUBLIC: Tüm üreticiler görür (marketplace)
 *
 * Gender Enum (Hedef Kitle):
 * - WOMEN: Kadın
 * - MEN: Erkek
 * - GIRLS: Kız Çocuk
 * - BOYS: Erkek Çocuk
 * - UNISEX: Unisex (cinsiyet ayrımı yok)
 *
 * RFQStatus Enum (Teklif Durumu):
 * - OPEN: Açık (teklifler bekleniyor)
 * - QUOTES_RECEIVED: Teklifler geldi
 * - UNDER_REVIEW: İnceleniyor
 * - WINNER_SELECTED: Kazanan seçildi
 * - CLOSED: Kapatıldı (iptal/tamamlandı)
 *
 * İlişkiler:
 * - author: Koleksiyonu oluşturan kullanıcı
 * - company: Bağlı şirket (üretici veya müşteri)
 * - category: Ürün kategorisi (StandardCategory)
 * - samples: Bağlı numuneler
 * - orders: Bu koleksiyondan verilen siparişler
 * - quotes: RFQ teklifleri (müşteri koleksiyonları için)
 * - questions: Koleksiyon hakkında sorular
 *
 * Özellikler:
 * - RFQ (Request for Quotation) sistemi
 * - Üretici/Müşteri ayırımı (ownerType)
 * - Görünürlük kontrolü (PRIVATE/INVITED/PUBLIC)
 * - Kütüphane entegrasyonu (sezon, kumaş, renk, aksesuar)
 * - Kademeli fiyatlandırma (priceBreaks)
 * - Acil sipariş seçeneği (rushOrder)
 * - Üretim kapasitesi takibi
 * - Numune politikası
 * - Analitik (görüntülenme/paylaşım sayısı)
 * - Global ID & Relay desteği
 * ============================================================================
 */

import builder from "../builder";
import { CollectionOwnerType } from "../enums/CollectionOwnerType";
import { CollectionVisibility } from "../enums/CollectionVisibility";
import { Gender } from "../enums/Gender";

/**
 * Collection Type - Koleksiyon Entity
 *
 * Global ID destekli Prisma node (Relay uyumlu)
 * 2 tip koleksiyon:
 * 1. MANUFACTURER: Üretici katalog (hazır ürünler)
 * 2. CUSTOMER: Müşteri RFQ (teklif talebi)
 *
 * Sorgu örneği: node(id: "Q29sbGVjdGlvbjox") { ...on Collection { name } }
 */
export const Collection = builder.prismaNode("Collection", {
  id: { field: "id" },
  fields: (t) => ({
    // ========================================
    // TEMEL BİLGİLER
    // ========================================

    /** Koleksiyon adı */
    name: t.exposeString("name"),

    /** Detaylı açıklama/tanıtım metni */
    description: t.exposeString("description", { nullable: true }),

    /** Model kodu (ürün kodu/referans numarası) */
    modelCode: t.exposeString("modelCode"),

    // ========================================
    // SEZON, CİNSİYET, KESIM (LibraryItem İlişkileri)
    // ========================================

    /** Sezon (İlkbahar, Yaz, Sonbahar, Kış) */
    season: t.relation("season", { nullable: true }),
    seasonId: t.exposeInt("seasonId", { nullable: true }),

    /**
     * Hedef cinsiyet/yaş grubu
     * WOMEN (Kadın), MEN (Erkek), GIRLS (Kız Çocuk), BOYS (Erkek Çocuk), UNISEX
     */
    gender: t.expose("gender", { type: Gender, nullable: true }),

    /** Kesim/Kalıp (Slim Fit, Regular Fit, Oversize vb.) */
    fit: t.relation("fit", { nullable: true }),
    fitId: t.exposeInt("fitId", { nullable: true }),

    /** Trend (Minimalist, Vintage, Streetwear vb.) */
    trend: t.relation("trend", { nullable: true }),
    trendId: t.exposeInt("trendId", { nullable: true }),

    // ========================================
    // VARYANTLAR (Renk & Beden)
    // ========================================

    /** Mevcut renkler (LibraryItem - COLOR tipi) */
    colors: t.relation("colors"),

    /** Beden grupları (LibraryItem - SIZE_GROUP tipi) */
    sizeGroups: t.relation("sizeGroups"),

    // ========================================
    // TEKNİK DETAYLAR
    // ========================================

    /** Kullanılan kumaşlar (LibraryItem - FABRIC tipi) */
    fabrics: t.relation("fabrics"),

    /** Aksesuarlar/Trimmings (düğme, fermuar, etiket vb.) */
    accessories: t.relation("accessories"),

    /** Ürün görselleri (JSON array - URL'ler) */
    images: t.exposeString("images", { nullable: true }),

    /** Teknik paket dosyası URL (ölçü tablosu, dikiş detayları) */
    techPack: t.exposeString("techPack", { nullable: true }),

    // ========================================
    // TİCARİ BİLGİLER
    // ========================================

    /** Minimum sipariş adedi (MOQ) */
    moq: t.exposeInt("moq", { nullable: true }),

    /** Hedef birim fiyat */
    targetPrice: t.exposeFloat("targetPrice", { nullable: true }),

    /** Para birimi (TRY, USD, EUR) */
    currency: t.exposeString("currency", { nullable: true }),

    /** Hedef teslim süresi (gün) */
    targetLeadTime: t.exposeInt("targetLeadTime", { nullable: true }),

    /** Son teslim tarihi */
    deadline: t.expose("deadline", { type: "DateTime", nullable: true }),

    /** Bugünden itibaren son teslim gün sayısı */
    deadlineDays: t.exposeInt("deadlineDays", { nullable: true }),

    /** Genel notlar/açıklamalar */
    notes: t.exposeString("notes", { nullable: true }),

    // ========================================
    // KADEMELİ FİYATLANDIRMA
    // ========================================

    /**
     * Adet bazlı fiyat kırılımları (JSON)
     * Örnek: [{ min: 100, max: 500, price: 25 }, { min: 501, max: 1000, price: 22 }]
     */
    priceBreaks: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.priceBreaks) return null;
        return typeof parent.priceBreaks === "string"
          ? parent.priceBreaks
          : JSON.stringify(parent.priceBreaks);
      },
    }),

    // ========================================
    // PAKETLEME & ETİKETLEME
    // ========================================

    /** Paketleme tipi (Polybaglı, Kartonlu, Asılabilir vb.) */
    packagingType: t.relation("packagingType", { nullable: true }),
    packagingTypeId: t.exposeInt("packagingTypeId", { nullable: true }),

    /** Paketleme detayları/notlar */
    packagingDetails: t.exposeString("packagingDetails", { nullable: true }),

    /** Etiket tipi (Woven, Printed, Care Label vb.) */
    labelingType: t.relation("labelingType", { nullable: true }),
    labelingTypeId: t.exposeInt("labelingTypeId", { nullable: true }),

    /** Etiketleme detayları/notlar */
    labelingDetails: t.exposeString("labelingDetails", { nullable: true }),

    // ========================================
    // ÖDEME KOŞULLARI
    // ========================================

    /** Ödeme koşulları (Peşin, 30 Gün Vade, L/C vb.) */
    paymentTerms: t.relation("paymentTerms", { nullable: true }),
    paymentTermsId: t.exposeInt("paymentTermsId", { nullable: true }),

    /** Kapora zorunlu mu? */
    depositRequired: t.exposeBoolean("depositRequired"),

    /** Kapora yüzdesi (örn: %30) */
    depositPercentage: t.exposeFloat("depositPercentage", { nullable: true }),

    // ========================================
    // KALİTE STANDARTLARI
    // ========================================

    /** Kalite standardı (OEKO-TEX, ISO 9001 vb.) */
    qualityStandard: t.relation("qualityStandard", { nullable: true }),
    qualityStandardId: t.exposeInt("qualityStandardId", { nullable: true }),

    /** Kabul edilebilir hata toleransı (%) */
    defectTolerance: t.exposeFloat("defectTolerance", { nullable: true }),

    // ========================================
    // ACİL SİPARİŞ SEÇENEKLERİ
    // ========================================

    /** Acil sipariş mümkün mü? */
    rushOrderAvailable: t.exposeBoolean("rushOrderAvailable"),

    /** Acil sipariş ek maliyeti (%) */
    rushOrderExtraCost: t.exposeFloat("rushOrderExtraCost", { nullable: true }),

    /** Acil siparişte minimum teslim süresi (gün) */
    rushOrderMinDays: t.exposeInt("rushOrderMinDays", { nullable: true }),

    // ========================================
    // KAPASİTE & NUMUNE POLİTİKASI
    // ========================================

    /** Aylık üretim kapasitesi (adet) */
    monthlyCapacity: t.exposeInt("monthlyCapacity", { nullable: true }),

    /** Maksimum sipariş adedi (tek seferde) */
    maxOrderQuantity: t.exposeInt("maxOrderQuantity", { nullable: true }),

    /** Direkt sipariş alınabiliyor mu? (numune olmadan) */
    allowDirectOrder: t.exposeBoolean("allowDirectOrder"),

    /** Sipariş öncesi numune zorunlu mu? */
    requireSample: t.exposeBoolean("requireSample"),

    /** Numune politikası açıklaması */
    samplePolicy: t.exposeString("samplePolicy", { nullable: true }),

    /** Numune teslim süresi (gün) */
    sampleLeadTime: t.exposeInt("sampleLeadTime", { nullable: true }),

    /** Numune birim fiyatı */
    samplePrice: t.exposeFloat("samplePrice", { nullable: true }),

    // ========================================
    // EK KÜTÜPHANE İLİŞKİLERİ
    // ========================================

    /** Varsayılan beden dağılımı (S:10, M:20, L:15 gibi) */
    defaultSizeBreakdown: t.relation("defaultSizeBreakdown", {
      nullable: true,
    }),
    defaultSizeBreakdownId: t.exposeInt("defaultSizeBreakdownId", {
      nullable: true,
    }),

    /** Baskı/Desen türleri */
    prints: t.relation("prints"),

    /** Yıkama efekti (Stone Wash, Acid Wash vb.) */
    washEffect: t.relation("washEffect", { nullable: true }),
    washEffectId: t.exposeInt("washEffectId", { nullable: true }),

    // ========================================
    // ÜRETİM PROGRAMI
    // ========================================

    /**
     * Üretim takvimi/programı (JSON)
     * Hangi aylarda üretim yapılıyor, kapasite durumu vb.
     */
    productionSchedule: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.productionSchedule) return null;
        return typeof parent.productionSchedule === "string"
          ? parent.productionSchedule
          : JSON.stringify(parent.productionSchedule);
      },
    }),

    // ========================================
    // DURUM & GÖRÜNÜRLÜK
    // ========================================

    /** Aktif mi? (listelerde görünsün mü?) */
    isActive: t.exposeBoolean("isActive"),

    /** Öne çıkan koleksiyon mu? (featured) */
    isFeatured: t.exposeBoolean("isFeatured"),

    // ========================================
    // ANALİTİK
    // ========================================

    /** Görüntülenme sayısı */
    viewCount: t.exposeInt("viewCount"),

    /** Paylaşım sayısı */
    shareCount: t.exposeInt("shareCount"),

    /** Son görüntülenme zamanı */
    lastViewedAt: t.expose("lastViewedAt", {
      type: "DateTime",
      nullable: true,
    }),

    // ========================================
    // TEMEL İLİŞKİLER
    // ========================================

    /** Koleksiyonu oluşturan kullanıcı */
    author: t.relation("author", { nullable: true }),
    authorId: t.exposeInt("authorId", { nullable: true }),

    /** Bağlı şirket (üretici veya müşteri) */
    company: t.relation("company", { nullable: true }),
    companyId: t.exposeInt("companyId", { nullable: true }),

    /** Ürün kategorisi (Tişört, Elbise, Pantolon vb.) */
    category: t.relation("category", { nullable: true }),
    categoryId: t.exposeInt("categoryId", { nullable: true }),

    // ========================================
    // ÜRÜN İLİŞKİLERİ
    // ========================================

    /** Bu koleksiyondan oluşturulan numuneler */
    samples: t.relation("samples"),

    /** Revize edilen numuneler */
    revisedSamples: t.relation("revisedSamples"),

    /** Bu koleksiyondan verilen siparişler */
    orders: t.relation("orders"),

    /** Sertifikalar (GOTS, OEKO-TEX vb.) */
    certifications: t.relation("certifications"),

    /** Koleksiyon hakkında sorular */
    questions: t.relation("questions"),

    // ========================================
    // RFQ SİSTEMİ (Request for Quotation)
    // ========================================

    /**
     * Koleksiyon sahibi tipi
     * MANUFACTURER: Üretici katalog (hazır ürün)
     * CUSTOMER: Müşteri RFQ (teklif talebi)
     */
    ownerType: t.expose("ownerType", { type: CollectionOwnerType }),

    /** Müşteri tarafından verilen brief (RFQ açıklaması) */
    customerBrief: t.exposeString("customerBrief", { nullable: true }),

    /** Referans görseller (JSON array - müşteri istekleri) */
    referenceImages: t.exposeString("referenceImages", { nullable: true }),

    /** Eskiz URL (müşteri tarafından yüklenen tasarım) */
    sketchUrl: t.exposeString("sketchUrl", { nullable: true }),

    /** Hedef bütçe (müşterinin maksimum ödemek istediği fiyat) */
    targetBudget: t.exposeFloat("targetBudget", { nullable: true }),

    /** Hedef sipariş adedi */
    targetQuantity: t.exposeInt("targetQuantity", { nullable: true }),

    /** Hedef teslim süresi (gün) */
    targetDeliveryDays: t.exposeInt("targetDeliveryDays", { nullable: true }),

    /** RFQ olarak mı açıldı? */
    isRFQ: t.exposeBoolean("isRFQ"),

    /**
     * RFQ durumu
     * OPEN: Açık (teklifler bekleniyor)
     * QUOTES_RECEIVED: Teklifler geldi
     * UNDER_REVIEW: İnceleniyor
     * WINNER_SELECTED: Kazanan seçildi
     * CLOSED: Kapatıldı
     */
    rfqStatus: t.exposeString("rfqStatus", { nullable: true }),

    /** RFQ son başvuru tarihi */
    rfqDeadline: t.expose("rfqDeadline", { type: "DateTime", nullable: true }),

    /** Kazanan üreticinin ID'si */
    rfqWinnerId: t.exposeInt("rfqWinnerId", { nullable: true }),

    /** Kazanan üretici */
    rfqWinner: t.relation("rfqWinner", { nullable: true }),

    /**
     * Görünürlük ayarı
     * PRIVATE: Sadece sahibi görür
     * INVITED: Davet edilen üreticiler görür
     * PUBLIC: Tüm üreticiler görür (marketplace)
     */
    visibility: t.expose("visibility", { type: CollectionVisibility }),

    /**
     * Davet edilen üreticiler (JSON array - User ID'leri)
     * INVITED görünürlükte kullanılır
     */
    invitedManufacturers: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.invitedManufacturers) return null;
        return typeof parent.invitedManufacturers === "string"
          ? parent.invitedManufacturers
          : JSON.stringify(parent.invitedManufacturers);
      },
    }),

    /** RFQ'ya gelen teklifler */
    quotes: t.relation("quotes"),

    // ========================================
    // TARİHLER (Timestamps)
    // ========================================

    /** Koleksiyon oluşturulma tarihi */
    createdAt: t.expose("createdAt", { type: "DateTime" }),

    /** Son güncelleme tarihi */
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
