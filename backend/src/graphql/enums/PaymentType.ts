/**
 * ============================================================================
 * PAYMENT TYPE ENUM
 * ============================================================================
 * Dosya: PaymentType.ts
 * Amaç: Ödeme Tipi GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Ödeme Tipi Değerleri (4):
 * - DEPOSIT: Kapora
 * - PROGRESS: Aşamalı ödeme
 * - BALANCE: Kalan ödeme
 * - FULL: Tam ödeme
 *
 * Kullanım:
 * - Payment.type field'ı
 * - Ödeme planlaması
 * - Finansal takip
 * ============================================================================
 */

import builder from "../builder";

export const PaymentType = builder.enumType("PaymentType", {
  values: [
    "DEPOSIT", // Kapora
    "PROGRESS", // Aşamalı ödeme
    "BALANCE", // Kalan ödeme
    "FULL", // Tam ödeme
  ] as const,
});
