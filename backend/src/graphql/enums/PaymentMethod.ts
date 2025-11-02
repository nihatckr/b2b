/**
 * ============================================================================
 * PAYMENT METHOD ENUM
 * ============================================================================
 * Dosya: PaymentMethod.ts
 * Amaç: Ödeme Yöntemi GraphQL enum tanımı
 * Versiyon: 2.0.0
 *
 * Ödeme Yöntemi Değerleri (5):
 * - BANK_TRANSFER: Banka havalesi
 * - WIRE_TRANSFER: Swift/EFT
 * - CHECK: Çek
 * - CASH: Nakit
 * - OTHER: Diğer
 *
 * Kullanım:
 * - Payment.method field'ı
 * - Ödeme yöntemi seçimi
 * - Finansal raporlama
 * ============================================================================
 */

import builder from "../builder";

export const PaymentMethod = builder.enumType("PaymentMethod", {
  values: [
    "BANK_TRANSFER", // Banka havalesi
    "WIRE_TRANSFER", // Swift/EFT
    "CHECK", // Çek
    "CASH", // Nakit
    "OTHER", // Diğer
  ] as const,
});
