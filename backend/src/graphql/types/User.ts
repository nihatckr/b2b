/**
 * ============================================================================
 * USER TYPE
 * ============================================================================
 * Dosya: User.ts
 * Amaç: Kullanıcı GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * Roller (schema.prisma Role enum):
 * - ADMIN: Platform yöneticisi
 * - COMPANY_OWNER: Şirket sahibi (hem üretici hem müşteri olabilir)
 * - COMPANY_EMPLOYEE: Şirket çalışanı (departman ve pozisyon ile)
 * - INDIVIDUAL_CUSTOMER: Bireysel müşteri (şirket olmadan)
 *
 * Departmanlar (schema.prisma Department enum):
 * - PURCHASING: Satın Alma
 * - PRODUCTION: Üretim
 * - QUALITY: Kalite Kontrol
 * - DESIGN: Tasarım
 * - SALES: Satış
 * - MANAGEMENT: Yönetim
 *
 * Güvenlik:
 * - email, phone, companyId: Sadece doğrulanmış kullanıcılar görebilir
 * - Global ID desteği: node(id: "VXNlcjox") ile sorgu yapılabilir
 * - Relay pagination uyumlu
 *
 * İlişkiler:
 * - company: Bağlı şirket (opsiyonel)
 * - Diğer ilişkiler Prisma üzerinden otomatik
 * ============================================================================
 */

import builder from "../builder";
import { Department, Role } from "../enums";

/**
 * User Type - Kullanıcı Entity
 *
 * Global ID destekli Prisma node (Relay uyumlu)
 * Sorgu örneği: node(id: "VXNlcjox") { ...on User { name } }
 */
export const User = builder.prismaNode("User", {
  id: { field: "id" },
  fields: (t) => ({
    // ========================================
    // KİMLİK BİLGİLERİ (Hassas - Auth Gerekli)
    // ========================================

    /** Email adresi (sadece doğrulanmış kullanıcılar görebilir) */
    email: t.exposeString("email", {
      authScopes: { user: true },
    }),

    /** Kullanıcı adı/tam isim */
    name: t.exposeString("name", { nullable: true }),

    /** Kullanıcı kısa adı (username) */
    username: t.exposeString("username", { nullable: true }),

    /** İsim */
    firstName: t.exposeString("firstName", { nullable: true }),

    /** Soyisim */
    lastName: t.exposeString("lastName", { nullable: true }),

    /** Telefon numarası (sadece doğrulanmış kullanıcılar görebilir) */
    phone: t.exposeString("phone", {
      nullable: true,
      authScopes: { user: true },
    }),

    // ========================================
    // ŞİRKET & ROL BİLGİLERİ
    // ========================================

    /** Bağlı şirket (opsiyonel - bireysel müşteriler için null) */
    company: t.relation("company", { nullable: true }),

    /** Şirket ID (sadece doğrulanmış kullanıcılar görebilir) */
    companyId: t.exposeInt("companyId", {
      nullable: true,
      authScopes: { user: true },
    }),

    /**
     * Kullanıcı rolü
     * ADMIN | COMPANY_OWNER | COMPANY_EMPLOYEE | INDIVIDUAL_CUSTOMER
     */
    role: t.expose("role", { type: Role }),

    // ========================================
    // YETKİ & DEPARTMAN BİLGİLERİ
    // ========================================

    /** Şirket sahibi mi? (COMPANY_OWNER rolü için true) */
    isCompanyOwner: t.exposeBoolean("isCompanyOwner"),

    /**
     * Departman (sadece COMPANY_EMPLOYEE için)
     * PURCHASING | PRODUCTION | QUALITY | DESIGN | SALES | MANAGEMENT
     */
    department: t.expose("department", { type: Department, nullable: true }),

    /** Pozisyon/unvan (ör: "Satın Alma Müdürü") */
    jobTitle: t.exposeString("jobTitle", { nullable: true }),

    // ========================================
    // PROFİL BİLGİLERİ
    // ========================================

    /** Avatar URL (sistem tarafından atanan) */
    avatar: t.exposeString("avatar", { nullable: true }),

    /** Özel avatar URL (kullanıcı yüklediği) */
    customAvatar: t.exposeString("customAvatar", { nullable: true }),

    /** Biyografi/hakkında metni */
    bio: t.exposeString("bio", { nullable: true }),

    /**
     * Sosyal medya linkleri (JSON formatında)
     * Örnek: {"linkedin": "url", "twitter": "url"}
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
    // AYARLAR & TERCİHLER
    // ========================================

    /** Email bildirimleri aktif mi? */
    emailNotifications: t.exposeBoolean("emailNotifications"),

    /** Push bildirimleri aktif mi? */
    pushNotifications: t.exposeBoolean("pushNotifications"),

    /** Dil tercihi (tr, en) */
    language: t.exposeString("language"),

    /** Saat dilimi (Europe/Istanbul) */
    timezone: t.exposeString("timezone"),

    // ========================================
    // DURUM BİLGİLERİ
    // ========================================

    /** Hesap aktif mi? (pasif hesaplar giriş yapamaz) */
    isActive: t.exposeBoolean("isActive"),

    /** Admin onayı bekliyor mu? */
    isPendingApproval: t.exposeBoolean("isPendingApproval"),

    // ========================================
    // TARİH BİLGİLERİ
    // ========================================

    /** Oluşturulma tarihi */
    createdAt: t.expose("createdAt", { type: "DateTime" }),

    /** Son güncellenme tarihi */
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
