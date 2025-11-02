/**
 * ============================================================================
 * CATEGORY TYPE
 * ============================================================================
 * Dosya: Category.ts
 * Amaç: Kategori Ağacı (Category Tree) GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * CategoryLevel Enum (4 Seviye Hiyerarşi):
 * - ROOT: Ana kategori (Tekstil, Giyim, Aksesuar)
 * - MAIN: Ana grup (Üst Giyim, Alt Giyim, İç Giyim)
 * - SUB: Alt grup (Gömlek, Pantolon, Elbise)
 * - DETAIL: Detay (Uzun Kollu Gömlek, Kısa Kollu Gömlek)
 *
 * Örnek Hiyerarşi:
 * ROOT: Tekstil (TEX)
 *   MAIN: Üst Giyim (TEX-001)
 *     SUB: Gömlek (TEX-001-001)
 *       DETAIL: Uzun Kollu Gömlek (TEX-001-001-001)
 *       DETAIL: Kısa Kollu Gömlek (TEX-001-001-002)
 *
 * İlişkiler:
 * - parentCategory: Üst kategori (null ise ROOT)
 * - subCategories: Alt kategoriler
 * - collections: Bu kategorideki koleksiyonlar
 * - createdBy: Kategoriyi oluşturan admin
 *
 * Özellikler:
 * - Platform geneli standart (admin yönetir)
 * - 4 seviye derinlik (ROOT → MAIN → SUB → DETAIL)
 * - Benzersiz kod sistemi (hierarchical code)
 * - SEO desteği (keywords, tags)
 * - Görsel & ikon desteği
 * - Aktif/Pasif & Genel/Özel kontrol
 * - Sıralama desteği (order field)
 * ============================================================================
 */

import builder from "../builder";
import { CategoryLevel } from "../enums/CategoryLevel";

/**
 * Category Type - Kategori Ağacı Entity
 *
 * Prisma object (numeric ID)
 * Platform geneli standart, admin yönetimli
 */
export const Category = builder.prismaObject("Category", {
  fields: (t) => ({
    // ========================================
    // TEMEL BİLGİLER
    // ========================================

    /** Benzersiz kategori ID'si */
    id: t.exposeID("id"),

    /** Benzersiz kategori kodu (örn: "TEX-001", "GAR-001-001") */
    code: t.exposeString("code"),

    /** Kategori adı */
    name: t.exposeString("name"),

    /** Detaylı açıklama */
    description: t.exposeString("description", { nullable: true }),

    /**
     * Hiyerarşi seviyesi (4 seviye)
     * ROOT → MAIN → SUB → DETAIL
     */
    level: t.expose("level", { type: CategoryLevel }),

    // ========================================
    // GÖRÜNÜM & SIRALAMA
    // ========================================

    /** Sıralama numarası (aynı seviyedeki kategoriler arası) */
    order: t.exposeInt("order"),

    /** İkon (Font Awesome, Material Icons vb.) */
    icon: t.exposeString("icon", { nullable: true }),

    /** Kategori görseli URL */
    image: t.exposeString("image", { nullable: true }),

    // ========================================
    // DURUM
    // ========================================

    /** Aktif mi? (listelerde görünsün mü?) */
    isActive: t.exposeBoolean("isActive"),

    /** Herkese açık mı? (genel listelemede görünsün mü?) */
    isPublic: t.exposeBoolean("isPublic"),

    // ========================================
    // SEO & META BİLGİLER
    // ========================================

    /** Arama anahtar kelimeleri (SEO) */
    keywords: t.exposeString("keywords", { nullable: true }),

    /** Etiketler (filtering için) */
    tags: t.exposeString("tags", { nullable: true }),

    // ========================================
    // HİYERARŞİ (Category Tree)
    // ========================================

    /** Üst kategori (null ise ROOT) */
    parentCategory: t.relation("parentCategory", { nullable: true }),
    parentId: t.exposeInt("parentId", { nullable: true }),

    /** Alt kategoriler (children) */
    subCategories: t.relation("subCategories"),

    // ========================================
    // KULLANIM İLİŞKİLERİ
    // ========================================

    /** Bu kategorideki koleksiyonlar */
    collections: t.relation("collections"),

    // ========================================
    // YÖNETİM
    // ========================================

    /** Kategoriyi oluşturan admin */
    createdBy: t.relation("createdBy", { nullable: true }),
    createdById: t.exposeInt("createdById", { nullable: true }),

    // ========================================
    // TARİHLER (Timestamps)
    // ========================================

    /** Kategori oluşturulma tarihi */
    createdAt: t.expose("createdAt", { type: "DateTime" }),

    /** Son güncelleme tarihi */
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
