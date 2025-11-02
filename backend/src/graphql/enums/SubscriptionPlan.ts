/**
 * ============================================================================
 * SUBSCRIPTION PLAN ENUM
 * ============================================================================
 * Dosya: SubscriptionPlan.ts
 * Amaç: Abonelik Planı GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Abonelik Planı Değerleri (5):
 * - FREE: Ücretsiz plan
 * - STARTER: Başlangıç planı
 * - PROFESSIONAL: Profesyonel plan
 * - ENTERPRISE: Kurumsal plan
 * - CUSTOM: Özel plan
 *
 * Kullanım:
 * - Company.subscriptionPlan field'ı
 * - Yetkilendirme kontrolü
 * - Özellik erişimi
 * ============================================================================
 */

import builder from "../builder";

export const SubscriptionPlan = builder.enumType("SubscriptionPlan", {
  values: [
    "FREE", // Ücretsiz
    "STARTER", // Başlangıç
    "PROFESSIONAL", // Profesyonel
    "ENTERPRISE", // Kurumsal
    "CUSTOM", // Özel
  ] as const,
});
