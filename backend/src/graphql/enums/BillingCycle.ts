/**
 * ============================================================================
 * BILLING CYCLE ENUM
 * ============================================================================
 * Dosya: BillingCycle.ts
 * Amaç: Faturalama Döngüsü GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Faturalama Döngüsü Değerleri (2):
 * - MONTHLY: Aylık
 * - YEARLY: Yıllık
 *
 * Kullanım:
 * - Company.billingCycle field'ı
 * - Abonelik faturalama
 * - Ödeme planlaması
 * ============================================================================
 */

import builder from "../builder";

export const BillingCycle = builder.enumType("BillingCycle", {
  values: [
    "MONTHLY", // Aylık
    "YEARLY", // Yıllık
  ] as const,
});
