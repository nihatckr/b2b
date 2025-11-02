/**
 * ============================================================================
 * COMPANY TYPE
 * ============================================================================
 * Dosya: Company.ts
 * Amaç: Şirket GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * Şirket Tipleri (schema.prisma CompanyType enum):
 * - MANUFACTURER: Üretici firma (Defacto gibi)
 * - BUYER: Alıcı firma (LC Waikiki gibi)
 * - BOTH: Her ikisi de (hem üretir hem alır)
 *
 * Abonelik Planları (schema.prisma SubscriptionPlan enum):
 * - FREE: Ücretsiz plan (trial)
 * - STARTER: Başlangıç planı
 * - PROFESSIONAL: Profesyonel plan
 * - ENTERPRISE: Kurumsal plan
 * - CUSTOM: Özel anlaşma
 *
 * Abonelik Durumları (schema.prisma SubscriptionStatus enum):
 * - TRIAL: Deneme sürümü
 * - ACTIVE: Aktif abonelik
 * - PAST_DUE: Ödeme gecikmiş
 * - CANCELLED: İptal edilmiş
 * - EXPIRED: Süresi dolmuş
 *
 * Fatura Döngüsü (schema.prisma BillingCycle enum):
 * - MONTHLY: Aylık
 * - YEARLY: Yıllık
 *
 * Güvenlik:
 * - email, phone: Doğrulanmış kullanıcılar
 * - ownerId: Doğrulanmış kullanıcılar
 * - Abonelik bilgileri: Sadece şirket sahibi ve admin
 * - Fatura bilgileri: Sadece şirket sahibi
 * - Kullanım istatistikleri: Herkes görebilir (public profile)
 *
 * Özellikler:
 * - Subscription management (plan, status, limits)
 * - Usage tracking (users, samples, orders, collections, storage)
 * - Branding & customization (logo, colors, slug)
 * - Relay pagination connections (employees, collections, samples, orders)
 * ============================================================================
 */

import builder from "../builder";
import { BillingCycle } from "../enums/BillingCycle";
import { CompanyType } from "../enums/CompanyType";
import { SubscriptionPlan } from "../enums/SubscriptionPlan";
import { SubscriptionStatus } from "../enums/SubscriptionStatus";

/**
 * Company Type - Şirket Entity
 *
 * Global ID destekli Prisma node (Relay uyumlu)
 * Sorgu örneği: node(id: "Q29tcGFueTox") { ...on Company { name } }
 */
export const Company = builder.prismaNode("Company", {
  id: { field: "id" },
  fields: (t) => ({
    // ========================================
    // TEMEL BİLGİLER
    // ========================================

    /** Şirket adı */
    name: t.exposeString("name"),

    /** Email adresi (sadece doğrulanmış kullanıcılar) */
    email: t.exposeString("email", {
      authScopes: { user: true },
    }),

    /** Telefon numarası (sadece doğrulanmış kullanıcılar) */
    phone: t.exposeString("phone", {
      nullable: true,
      authScopes: { user: true },
    }),

    /** Adres */
    address: t.exposeString("address", {
      nullable: true,
    }),

    /** Şehir */
    city: t.exposeString("city", {
      nullable: true,
    }),

    /** Ülke */
    country: t.exposeString("country", {
      nullable: true,
    }),

    /** Konum bilgisi (koordinat vb.) */
    location: t.exposeString("location", { nullable: true }),

    /** Website URL */
    website: t.exposeString("website", { nullable: true }),

    /**
     * Şirket tipi
     * MANUFACTURER (Üretici) | BUYER (Alıcı) | BOTH (Her ikisi)
     */
    type: t.expose("type", { type: CompanyType }),

    /** Şirket açıklaması */
    description: t.exposeString("description", { nullable: true }),

    // ========================================
    // SAHİPLİK BİLGİLERİ
    // ========================================

    /** Şirket sahibi (User relation) */
    owner: t.relation("owner", { nullable: true }),

    /** Şirket sahibi ID (hassas bilgi - sadece doğrulanmış kullanıcılar) */
    ownerId: t.exposeInt("ownerId", {
      nullable: true,
      authScopes: { user: true },
    }),

    // ========================================
    // AYARLAR & YAPIL ANDIRMA
    // ========================================

    /**
     * Şirket ayarları (JSON formatında)
     * Örnek: {"theme": "dark", "notifications": {...}}
     */
    settings: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.settings) return null;
        return typeof parent.settings === "string"
          ? parent.settings
          : JSON.stringify(parent.settings);
      },
    }),

    // ========================================
    // ABONELİK SİSTEMİ
    // ========================================

    /**
     * Abonelik planı
     * FREE | STARTER | PROFESSIONAL | ENTERPRISE | CUSTOM
     */
    subscriptionPlan: t.expose("subscriptionPlan", {
      type: SubscriptionPlan,
    }),

    /**
     * Abonelik durumu
     * TRIAL | ACTIVE | PAST_DUE | CANCELLED | EXPIRED
     */
    subscriptionStatus: t.expose("subscriptionStatus", {
      type: SubscriptionStatus,
    }),

    // ========================================
    // DENEME SÜRESİ (TRIAL)
    // ========================================

    /** Deneme süresi başlangıç tarihi (sadece şirket sahibi) */
    trialStartedAt: t.expose("trialStartedAt", {
      type: "DateTime",
      nullable: true,
      authScopes: { companyOwner: true },
    }),

    /** Deneme süresi bitiş tarihi (sadece şirket sahibi) */
    trialEndsAt: t.expose("trialEndsAt", {
      type: "DateTime",
      nullable: true,
      authScopes: { companyOwner: true },
    }),

    // ========================================
    // FATURA & ABONELİK BİLGİLERİ (ÇOK HASSİS)
    // Sadece şirket sahibi ve admin görebilir
    // ========================================

    /** Abonelik başlangıç tarihi */
    subscriptionStartedAt: t.expose("subscriptionStartedAt", {
      type: "DateTime",
      nullable: true,
      authScopes: { companyOwner: true, admin: true },
    }),

    /** Mevcut dönem başlangıcı */
    currentPeriodStart: t.expose("currentPeriodStart", {
      type: "DateTime",
      nullable: true,
      authScopes: { companyOwner: true, admin: true },
    }),

    /** Mevcut dönem bitişi */
    currentPeriodEnd: t.expose("currentPeriodEnd", {
      type: "DateTime",
      nullable: true,
      authScopes: { companyOwner: true, admin: true },
    }),

    /** Dönem sonunda iptal edilecek mi? */
    cancelAtPeriodEnd: t.exposeBoolean("cancelAtPeriodEnd", {
      authScopes: { companyOwner: true },
    }),

    /** İptal tarihi */
    cancelledAt: t.expose("cancelledAt", {
      type: "DateTime",
      nullable: true,
      authScopes: { companyOwner: true },
    }),

    /**
     * Fatura döngüsü
     * MONTHLY (Aylık) | YEARLY (Yıllık)
     */
    billingCycle: t.expose("billingCycle", {
      type: BillingCycle,
      authScopes: { companyOwner: true, admin: true },
    }),

    /** Fatura email adresi */
    billingEmail: t.exposeString("billingEmail", {
      nullable: true,
      authScopes: { companyOwner: true },
    }),

    /** Fatura adresi */
    billingAddress: t.exposeString("billingAddress", {
      nullable: true,
      authScopes: { companyOwner: true },
    }),

    /** Vergi numarası */
    taxId: t.exposeString("taxId", {
      nullable: true,
      authScopes: { companyOwner: true },
    }),

    // ========================================
    // KULLANIM LİMİTLERİ
    // Plan bazlı maksimum değerler (-1 = sınırsız)
    // ========================================

    /** Maksimum kullanıcı sayısı */
    maxUsers: t.exposeInt("maxUsers"),

    /** Maksimum numune sayısı */
    maxSamples: t.exposeInt("maxSamples"),

    /** Maksimum sipariş sayısı */
    maxOrders: t.exposeInt("maxOrders"),

    /** Maksimum koleksiyon sayısı */
    maxCollections: t.exposeInt("maxCollections"),

    /** Maksimum depolama alanı (GB) */
    maxStorageGB: t.exposeFloat("maxStorageGB"),

    // ========================================
    // MEVCUT KULLANIM
    // Gerçek zamanlı kullanım istatistikleri
    // ========================================

    /** Mevcut kullanıcı sayısı */
    currentUsers: t.exposeInt("currentUsers"),

    /** Mevcut numune sayısı */
    currentSamples: t.exposeInt("currentSamples"),

    /** Mevcut sipariş sayısı */
    currentOrders: t.exposeInt("currentOrders"),

    /** Mevcut koleksiyon sayısı */
    currentCollections: t.exposeInt("currentCollections"),

    /** Mevcut depolama kullanımı (GB) */
    currentStorageGB: t.exposeFloat("currentStorageGB"),

    // ========================================
    // MARKA & ÖZELLEŞTİRME
    // ========================================

    /** Logo URL */
    logo: t.exposeString("logo", { nullable: true }),

    /** Kapak görseli URL */
    coverImage: t.exposeString("coverImage", { nullable: true }),

    /**
     * Marka renkleri (JSON formatında)
     * Örnek: {"primary": "#FF5733", "secondary": "#33C4FF"}
     */
    brandColors: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.brandColors) return null;
        return typeof parent.brandColors === "string"
          ? parent.brandColors
          : JSON.stringify(parent.brandColors);
      },
    }),

    // ========================================
    // PUBLIC PROFİL
    // ========================================

    /** Profil slug (URL için: /company/profile-slug) */
    profileSlug: t.exposeString("profileSlug", { nullable: true }),

    /** Profil herkese açık mı? */
    isPublicProfile: t.exposeBoolean("isPublicProfile"),

    /**
     * Sosyal medya linkleri (JSON formatında)
     * Örnek: {"linkedin": "url", "instagram": "url"}
     */
    socialLinks: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.socialLinks) return null;
        return typeof parent.socialLinks === "string"
          ? parent.socialLinks
          : JSON.stringify(parent.socialLinks);
      },
    }),

    // ========================================
    // DASHBOARD TERCİHLERİ
    // ========================================

    /** Varsayılan görünüm (dashboard, analytics, orders vb.) */
    defaultView: t.exposeString("defaultView", { nullable: true }),

    /**
     * Aktif modüller (JSON formatında)
     * Örnek: ["samples", "orders", "rfq", "analytics"]
     */
    enabledModules: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.enabledModules) return null;
        return typeof parent.enabledModules === "string"
          ? parent.enabledModules
          : JSON.stringify(parent.enabledModules);
      },
    }),

    // ========================================
    // İLİŞKİLER (Basit - tek öğe veya küçük listeler için)
    // ========================================

    /** Şirket çalışanları */
    employees: t.relation("employees"),

    // ========================================
    // İLİŞKİLER (Connections - büyük listeler için pagination ile)
    // Pothos Relay Plugin otomatik cursor-based pagination sağlar
    // ========================================

    /** Çalışanlar (sayfalı - Relay connection) */
    employeesConnection: t.relatedConnection("employees", {
      cursor: "id",
      totalCount: true,
    }),

    /** Koleksiyonlar (sayfalı - Relay connection) */
    collectionsConnection: t.relatedConnection("collections", {
      cursor: "id",
      totalCount: true,
    }),

    /** Numuneler (sayfalı - Relay connection) */
    samplesConnection: t.relatedConnection("samples", {
      cursor: "id",
      totalCount: true,
    }),

    /** Siparişler (sayfalı - Relay connection) */
    ordersConnection: t.relatedConnection("orders", {
      cursor: "id",
      totalCount: true,
    }),

    /** Kütüphane öğeleri (sayfalı - Relay connection) */
    libraryItemsConnection: t.relatedConnection("libraryItems", {
      cursor: "id",
      totalCount: true,
    }),

    // ========================================
    // DURUM & TARİHLER
    // ========================================

    /** Şirket aktif mi? */
    isActive: t.exposeBoolean("isActive"),

    /** Oluşturulma tarihi */
    createdAt: t.expose("createdAt", { type: "DateTime" }),

    /** Son güncellenme tarihi */
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
