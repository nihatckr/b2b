/**
 * ============================================================================
 * DEPARTMENT ENUM
 * ============================================================================
 * Dosya: Department.ts
 * Amaç: Departman GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Departman Değerleri (6):
 * - PURCHASING: Satın Alma departmanı
 * - PRODUCTION: Üretim departmanı
 * - QUALITY: Kalite Kontrol departmanı
 * - DESIGN: Tasarım departmanı
 * - SALES: Satış departmanı
 * - MANAGEMENT: Yönetim
 *
 * Kullanım:
 * - User.department field'ı
 * - Rol bazlı yetkilendirme
 * - İş akışı yönlendirme
 * ============================================================================
 */

import builder from "../builder";

export const Department = builder.enumType("Department", {
  values: [
    "PURCHASING", // Satın Alma
    "PRODUCTION", // Üretim
    "QUALITY", // Kalite Kontrol
    "DESIGN", // Tasarım
    "SALES", // Satış
    "MANAGEMENT", // Yönetim
  ] as const,
});
