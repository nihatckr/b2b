/**
 * ============================================================================
 * PAYMENT TYPE
 * ============================================================================
 * Dosya: Payment.ts
 * Amaç: Ödeme Yönetimi (Payment) GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * PaymentType Enum (4 Ödeme Tipi):
 * - DEPOSIT: Ön ödeme/Kapora (%30, %50 vb.)
 * - PROGRESS: Ara ödeme (üretim aşamasında)
 * - BALANCE: Kalan ödeme (sevkiyat öncesi)
 * - FULL: Peşin ödeme (tüm tutar)
 *
 * PaymentStatus Enum (6 Durum):
 * - PENDING: Ödeme bekleniyor
 * - RECEIPT_UPLOADED: Dekont yüklendi, onay bekleniyor
 * - CONFIRMED: Ödeme onaylandı
 * - REJECTED: Dekont reddedildi
 * - OVERDUE: Ödeme gecikmiş
 * - CANCELLED: İptal edildi
 *
 * PaymentMethod Enum (5 Yöntem):
 * - BANK_TRANSFER: Banka havalesi (EFT/SWIFT)
 * - WIRE_TRANSFER: Havale
 * - CHECK: Çek
 * - CASH: Nakit
 * - OTHER: Diğer
 *
 * İş Akışı:
 * 1. Sistem otomatik ödeme kaydı oluşturur (PENDING)
 * 2. Müşteri dekont yükler (RECEIPT_UPLOADED)
 * 3. Üretici onaylar/reddeder (CONFIRMED/REJECTED)
 * 4. Ödeme geç kalırsa OVERDUE
 *
 * İlişkiler:
 * - order: Bağlı sipariş
 *
 * Özellikler:
 * - Kademeli ödeme sistemi (kapora + ara + kalan)
 * - Dekont yükleme ve onaylama
 * - Banka bilgileri takibi
 * - Vade takibi (dueDate, paidDate)
 * - Red nedeni takibi
 * ============================================================================
 */

import builder from "../builder";
import { PaymentMethod, PaymentStatus, PaymentType } from "../enums";

/**
 * Payment Type - Ödeme Yönetimi Entity
 *
 * Prisma object (numeric ID)
 */
export const Payment = builder.prismaObject("Payment", {
  fields: (t) => ({
    /** Benzersiz ödeme ID'si */
    id: t.exposeID("id"),

    /** Bağlı sipariş ID */
    orderId: t.exposeInt("orderId"),

    /** Bağlı sipariş */
    order: t.relation("order"),

    /**
     * Ödeme tipi
     * DEPOSIT: Kapora, PROGRESS: Ara ödeme, BALANCE: Kalan, FULL: Peşin
     */
    type: t.expose("type", { type: PaymentType }),

    /**
     * Ödeme durumu
     * PENDING → RECEIPT_UPLOADED → CONFIRMED/REJECTED
     */
    status: t.expose("status", { type: PaymentStatus }),

    /**
     * Ödeme yöntemi
     * BANK_TRANSFER, WIRE_TRANSFER, CHECK, CASH, OTHER
     */
    method: t.expose("method", { type: PaymentMethod }),

    /** Ödeme tutarı */
    amount: t.exposeFloat("amount"),

    /** Para birimi (TRY, USD, EUR) */
    currency: t.exposeString("currency"),

    /** Ödeme yüzdesi (DEPOSIT: %30, BALANCE: %70 vb.) */
    percentage: t.exposeFloat("percentage", { nullable: true }),

    /** Dekont/Fiş URL */
    receiptUrl: t.exposeString("receiptUrl", { nullable: true }),

    /** Dekont yüklenme zamanı */
    receiptUploadedAt: t.expose("receiptUploadedAt", {
      type: "DateTime",
      nullable: true,
    }),

    /** Dekontu yükleyen kullanıcı ID */
    receiptUploadedBy: t.exposeInt("receiptUploadedBy", { nullable: true }),

    /** Ödeme onaylanma zamanı */
    confirmedAt: t.expose("confirmedAt", {
      type: "DateTime",
      nullable: true,
    }),

    /** Ödemeyi onaylayan kullanıcı ID */
    confirmedBy: t.exposeInt("confirmedBy", { nullable: true }),

    /** Red nedeni (REJECTED durumunda) */
    rejectionReason: t.exposeString("rejectionReason", { nullable: true }),

    /** Vade tarihi (son ödeme tarihi) */
    dueDate: t.expose("dueDate", { type: "DateTime", nullable: true }),

    /** Gerçekleşen ödeme tarihi */
    paidDate: t.expose("paidDate", { type: "DateTime", nullable: true }),

    /** Ödeme açıklaması */
    description: t.exposeString("description", { nullable: true }),

    /** İç notlar */
    notes: t.exposeString("notes", { nullable: true }),

    /** Banka adı */
    bankName: t.exposeString("bankName", { nullable: true }),

    /** Hesap sahibi */
    accountHolder: t.exposeString("accountHolder", { nullable: true }),

    /** İşlem referans numarası */
    transactionId: t.exposeString("transactionId", { nullable: true }),

    /** Ödeme kaydı oluşturulma zamanı */
    createdAt: t.expose("createdAt", { type: "DateTime" }),

    /** Son güncelleme zamanı */
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
