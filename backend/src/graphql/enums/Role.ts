/**
 * ============================================================================
 * ROLE ENUM
 * ============================================================================
 * Dosya: Role.ts
 * Amaç: Kullanıcı Rolleri GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Rol Değerleri (4):
 * - ADMIN: Platform yöneticisi (tüm yetkilere sahip)
 * - COMPANY_OWNER: Şirket sahibi (kendi şirketi için tüm yetkiler)
 * - COMPANY_EMPLOYEE: Şirket çalışanı (departman bazlı kısıtlı yetkiler)
 * - INDIVIDUAL_CUSTOMER: Bireysel müşteri (şirketsiz)
 *
 * Kullanım:
 * - User.role field'ı
 * - RBAC (Role-Based Access Control) sistemi
 * - Middleware authentication kontrolü
 * ============================================================================
 */

import builder from "../builder";

export const Role = builder.enumType("Role", {
  values: [
    "ADMIN", // Platform yöneticisi
    "COMPANY_OWNER", // Şirket sahibi
    "COMPANY_EMPLOYEE", // Şirket çalışanı
    "INDIVIDUAL_CUSTOMER", // Bireysel müşteri
  ] as const,
});
