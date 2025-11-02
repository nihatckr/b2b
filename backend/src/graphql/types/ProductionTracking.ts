/**
 * ============================================================================
 * PRODUCTION TRACKING TYPE
 * ============================================================================
 * Dosya: ProductionTracking.ts
 * Amaç: Üretim Takip (Production Tracking) GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * Kullanıldığı Yerler:
 * - Order üretim takibi
 * - Sample üretim takibi
 *
 * ProductionStage: 8 aşama (PLANNING, FABRIC, CUTTING, SEWING, PRESSING, QUALITY, PACKAGING, SHIPPING)
 * ProductionStatus: IN_PROGRESS, COMPLETED, DELAYED, CANCELLED
 * ApprovalStatus: Üretim planı onay durumu (PENDING, APPROVED, REJECTED, NOT_REQUIRED)
 *
 * Sistem Açıklaması:
 * Üretim sürecinin ana takip kaydı. Her sipariş/numune için bir adet oluşturulur.
 * İçinde ProductionStageUpdate'ler (8 aşama) bulunur.
 *
 * Üretim Planı Onay Süreci:
 * 1. Üretici plan hazırlar, müşteriye gönderir (planStatus: PENDING)
 * 2. Müşteri onaylar (APPROVED) veya reddeder (REJECTED)
 * 3. APPROVED: canStartProduction = true, üretim başlayabilir
 * 4. REJECTED: Revizyon gerekir (revisionCount++)
 *
 * İlişkiler:
 * - order: İlgili sipariş (sipariş üretimi için)
 * - sample: İlgili numune (numune üretimi için)
 * - company: Üretici firma
 * - stageUpdates: 8 aşamanın detay güncellemeleri
 * - notifications: İlgili bildirimler
 * ============================================================================
 */

import builder from "../builder";
import { ApprovalStatus } from "../enums/ApprovalStatus";
import { ProductionStage } from "../enums/ProductionStage";
import { ProductionStatus } from "../enums/ProductionStatus";

/**
 * ProductionTracking Type - Üretim Takip Entity
 */
export const ProductionTracking = builder.prismaObject("ProductionTracking", {
  fields: (t) => ({
    /** Benzersiz takip ID'si */
    id: t.exposeID("id"),

    /** İlgili sipariş ID (sipariş üretimi için) */
    orderId: t.exposeInt("orderId", { nullable: true }),
    order: t.relation("order", { nullable: true }),

    /** İlgili numune ID (numune üretimi için) */
    sampleId: t.exposeInt("sampleId", { nullable: true }),
    sample: t.relation("sample", { nullable: true }),

    /** Üretici firma ID */
    companyId: t.exposeInt("companyId", { nullable: true }),
    company: t.relation("company", { nullable: true }),

    /** Mevcut aşama (PLANNING, FABRIC, CUTTING vb.) */
    currentStage: t.expose("currentStage", { type: ProductionStage }),

    /** Genel durum (IN_PROGRESS, COMPLETED, DELAYED) */
    overallStatus: t.expose("overallStatus", { type: ProductionStatus }),

    /** Tamamlanma yüzdesi (0-100) */
    progress: t.exposeInt("progress"),

    /** Tahmini başlangıç tarihi */
    estimatedStartDate: t.expose("estimatedStartDate", {
      type: "DateTime",
      nullable: true,
    }),

    /** Tahmini bitiş tarihi */
    estimatedEndDate: t.expose("estimatedEndDate", {
      type: "DateTime",
      nullable: true,
    }),

    /** Gerçek başlangıç tarihi */
    actualStartDate: t.expose("actualStartDate", {
      type: "DateTime",
      nullable: true,
    }),

    /** Gerçek bitiş tarihi */
    actualEndDate: t.expose("actualEndDate", {
      type: "DateTime",
      nullable: true,
    }),

    /** Genel notlar */
    notes: t.exposeString("notes", { nullable: true }),

    /** Üretim planı onay durumu (PENDING, APPROVED, REJECTED) */
    planStatus: t.expose("planStatus", { type: ApprovalStatus }),

    /** Plan müşteriye gönderilme zamanı */
    planSentAt: t.expose("planSentAt", { type: "DateTime", nullable: true }),

    /** Plan onaylanma zamanı */
    planApprovedAt: t.expose("planApprovedAt", {
      type: "DateTime",
      nullable: true,
    }),

    /** Plan reddedilme zamanı */
    planRejectedAt: t.expose("planRejectedAt", {
      type: "DateTime",
      nullable: true,
    }),

    /** Müşteri notu */
    customerNote: t.exposeString("customerNote", { nullable: true }),

    /** Müşteri red nedeni */
    customerRejectionReason: t.exposeString("customerRejectionReason", {
      nullable: true,
    }),

    /** Revizyon sayısı */
    revisionCount: t.exposeInt("revisionCount"),

    /** Üretim başlayabilir mi? (plan onaylandı mı?) */
    canStartProduction: t.exposeBoolean("canStartProduction"),

    /** Üretim başlangıç tarihi */
    productionStartDate: t.expose("productionStartDate", {
      type: "DateTime",
      nullable: true,
    }),

    /** Aşama güncellemeleri (8 aşama) */
    stageUpdates: t.relation("stageUpdates"),

    /** İlgili bildirimler */
    notifications: t.relation("notifications"),

    /** Kayıt oluşturulma zamanı */
    createdAt: t.expose("createdAt", { type: "DateTime" }),

    /** Son güncelleme zamanı */
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
