/**
 * ============================================================================
 * APPROVAL STATUS ENUM
 * ============================================================================
 * Dosya: ApprovalStatus.ts
 * Amaç: Onay Durum GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Onay Durum Değerleri (5):
 * - DRAFT: Taslak
 * - PENDING: Onay bekleniyor
 * - APPROVED: Onaylandı
 * - REJECTED: Reddedildi
 * - REVISION: Revizyon gerekiyor
 *
 * Kullanım:
 * - Çeşitli modeller için genel onay durumu
 * - İş akışı yönetimi
 * - Onay süreçleri
 * ============================================================================
 */

import builder from "../builder";

export const ApprovalStatus = builder.enumType("ApprovalStatus", {
  values: [
    "DRAFT", // Taslak
    "PENDING", // Onay bekleniyor
    "APPROVED", // Onaylandı
    "REJECTED", // Reddedildi
    "REVISION", // Revizyon gerekiyor
  ] as const,
});
