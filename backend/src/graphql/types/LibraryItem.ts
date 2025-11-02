/**
 * ============================================================================
 * LIBRARY ITEM TYPE
 * ============================================================================
 * Dosya: LibraryItem.ts
 * Amaç: Birleşik Kütüphane (Unified Library) GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * LibraryCategory Enum (15 Kategori):
 *
 * 📦 TASARIM & MALZEME (9):
 * - COLOR: Renk paleti (Hex, RGB, Pantone kodları)
 * - FABRIC: Kumaş kütüphanesi (Pamuk, Polyester, İpek vb.)
 * - MATERIAL: Aksesuar/Malzemeler (Düğme, Fermuar, Etiket)
 * - SIZE_GROUP: Beden grupları (XS-XXL, 34-44 vb.)
 * - PRINT: Baskı/desen tipleri (Dijital, Silkscreen, Transfer, Nakış)
 * - WASH_EFFECT: Yıkama efektleri (Stone Wash, Acid Wash, Vintage)
 * - SEASON: Sezon (İlkbahar, Yaz, Sonbahar, Kış)
 * - FIT: Kesim tipleri (Slim Fit, Regular, Oversize)
 * - CERTIFICATION: Sertifikalar (OEKO-TEX, GOTS, BCI)
 *
 * 🏷️ STİL & TREND (1):
 * - TREND: Trend/Stil (Minimalist, Vintage, Sport Chic, Y2K)
 *
 * 📊 TİCARİ STANDARTLAR (5):
 * - SIZE_BREAKDOWN: Beden dağılım şablonları (XS:10%, S:25%, M:35%)
 * - PACKAGING_TYPE: Paketleme (Polybag, Karton, Askılı, Kutu)
 * - QUALITY_STANDARD: Kalite (AQL 2.5, AQL 4.0, ISO 9001)
 * - PAYMENT_TERMS: Ödeme koşulları (30 Gün Vade, L/C, T/T)
 * - LABELING_TYPE: Etiketleme (Müşteri Etiketi, Nötr, Asma Etiket)
 *
 * LibraryScope Enum (2 Seviye):
 * - PLATFORM_STANDARD: Platform geneli standart (admin tanımlı, tüm firmalar kullanabilir)
 * - COMPANY_CUSTOM: Firma özel (sadece o firma kullanabilir)
 *
 * İlişkiler:
 * - company: Kütüphane sahibi firma (COMPANY_CUSTOM için)
 * - standardItem: Referans standart item (COMPANY_CUSTOM'da)
 * - certifications: İlgili sertifikalar
 * - collections: Bu item'ı kullanan koleksiyonlar
 *
 * Özellikler:
 * - Birleşik kütüphane sistemi (15 kategori tek model)
 * - İki seviyeli yetkilendirme (PLATFORM/COMPANY)
 * - Standart referans mekanizması (firma standart item'ı genişletebilir)
 * - JSON data desteği (kategori-spesifik ek alanlar)
 * - Popülerlik takibi (sık kullanılan item'lar)
 * - Çok-çok ilişkiler (Collection, Certification)
 * ============================================================================
 */

import builder from "../builder";
import { LibraryCategory } from "../enums/LibraryCategory";
import { LibraryScope } from "../enums/LibraryScope";

/**
 * LibraryItem Type - Birleşik Kütüphane Entity
 *
 * Prisma object (numeric ID)
 * 15 farklı kategori, 2 seviye yetki (PLATFORM/COMPANY)
 */
export const LibraryItem = builder.prismaObject("LibraryItem", {
  fields: (t) => ({
    // ========================================
    // TEMEL BİLGİLER
    // ========================================

    /** Benzersiz kütüphane item ID'si */
    id: t.exposeID("id"),

    /**
     * Kapsam seviyesi
     * PLATFORM_STANDARD: Herkes kullanabilir (admin tanımlı)
     * COMPANY_CUSTOM: Sadece o firma kullanabilir
     */
    scope: t.expose("scope", { type: LibraryScope }),

    /**
     * Kategori (15 farklı tip)
     * COLOR, FABRIC, MATERIAL, SIZE_GROUP, SEASON, FIT, CERTIFICATION,
     * SIZE_BREAKDOWN, PRINT, WASH_EFFECT, TREND, PACKAGING_TYPE,
     * QUALITY_STANDARD, PAYMENT_TERMS, LABELING_TYPE
     */
    category: t.expose("category", { type: LibraryCategory }),

    /** Kod (opsiyonel - örn: Pantone kodu, kumaş kodu) */
    code: t.exposeString("code", { nullable: true }),

    /** Item adı (örn: "Kırmızı", "Pamuklu Jersey", "Metal Düğme") */
    name: t.exposeString("name"),

    /** Detaylı açıklama */
    description: t.exposeString("description", { nullable: true }),

    /** Görsel URL (renk, kumaş, aksesuar görselleri) */
    imageUrl: t.exposeString("imageUrl", { nullable: true }),

    /**
     * Kategori-spesifik ek veri (JSON format)
     * COLOR: { hex: "#FF0000", rgb: "255,0,0", pantone: "186C" }
     * FABRIC: { composition: "80% Cotton, 20% Polyester", gsm: 180, width: 150 }
     * SIZE_BREAKDOWN: { XS: 10, S: 25, M: 35, L: 20, XL: 10 }
     */
    data: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.data) return null;
        return typeof parent.data === "string"
          ? parent.data
          : JSON.stringify(parent.data);
      },
    }),

    /** İç notlar (firma için hatırlatmalar) */
    notes: t.exposeString("notes", { nullable: true }),

    /** Aktif mi? (listelerde görünsün mü?) */
    isActive: t.exposeBoolean("isActive"),

    /** Popüler mi? (sık kullanılan item'lar) */
    isPopular: t.exposeBoolean("isPopular"),

    // ========================================
    // İLİŞKİLER (Relations)
    // ========================================

    /** Sahibi firma (COMPANY_CUSTOM için, null = PLATFORM_STANDARD) */
    company: t.relation("company", { nullable: true }),
    companyId: t.exposeInt("companyId", { nullable: true }),

    /**
     * Referans standart item (COMPANY_CUSTOM için)
     * Firma platform standardını genişleterek custom item yaratabilir
     */
    standardItem: t.relation("standardItem", { nullable: true }),
    standardItemId: t.exposeInt("standardItemId", { nullable: true }),

    // 🔗 Certification Relations
    certifications: t.relation("certifications", {
      nullable: false,
      query: {
        where: {
          category: "CERTIFICATION",
          isActive: true,
        },
      },
    }),
    certifiedItems: t.relation("certifiedItems", {
      nullable: false,
    }),

    // Standard Reference Relations
    companyItems: t.relation("companyItems", { nullable: false }),

    // Collection Relations (Reverse)
    collections: t.relation("collections", { nullable: false }),
    collectionsWithSeason: t.relation("collectionsWithSeason", {
      nullable: false,
    }),
    collectionsWithFit: t.relation("collectionsWithFit", { nullable: false }),
    collectionsWithTrend: t.relation("collectionsWithTrend", {
      nullable: false,
    }),
    collectionsWithSizeBreakdown: t.relation("collectionsWithSizeBreakdown", {
      nullable: false,
    }),
    collectionsWithSizeGroups: t.relation("collectionsWithSizeGroups", {
      nullable: false,
    }),
    collectionsWithPrint: t.relation("collectionsWithPrint", {
      nullable: false,
    }),
    collectionsWithWashEffect: t.relation("collectionsWithWashEffect", {
      nullable: false,
    }),
    collectionsWithColors: t.relation("collectionsWithColors", {
      nullable: false,
    }),
    collectionsWithFabrics: t.relation("collectionsWithFabrics", {
      nullable: false,
    }),
    collectionsWithAccessories: t.relation("collectionsWithAccessories", {
      nullable: false,
    }),
    collectionsWithPackagingType: t.relation("collectionsWithPackagingType", {
      nullable: false,
    }),
    collectionsWithLabelingType: t.relation("collectionsWithLabelingType", {
      nullable: false,
    }),
    collectionsWithPaymentTerms: t.relation("collectionsWithPaymentTerms", {
      nullable: false,
    }),
    collectionsWithQualityStandard: t.relation(
      "collectionsWithQualityStandard",
      { nullable: false }
    ),

    // 🔍 Filtreleme için kritik alanlar (Hybrid approach)
    gender: t.exposeString("gender", { nullable: true }),
    fitCategory: t.exposeString("fitCategory", { nullable: true }),
    sizeCategory: t.exposeString("sizeCategory", { nullable: true }),

    // Fabric-specific normalized fields
    fiberType: t.exposeString("fiberType", { nullable: true }),
    fabricWeight: t.exposeInt("fabricWeight", { nullable: true }),
    fabricWidth: t.exposeInt("fabricWidth", { nullable: true }),

    // Material-specific normalized fields
    materialType: t.exposeString("materialType", { nullable: true }),

    // Color-specific normalized fields
    hexColor: t.exposeString("hexColor", { nullable: true }),
    colorFamily: t.exposeString("colorFamily", { nullable: true }),

    createdBy: t.relation("createdBy", { nullable: true }),
    createdById: t.exposeInt("createdById"),

    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
