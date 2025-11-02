/**
 * ============================================================================
 * PRODUCTION STAGE UPDATE TYPE
 * ============================================================================
 * Dosya: ProductionStageUpdate.ts
 * Amaç: Üretim Aşama Güncelleme GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * ProductionStage Enum (8 Aşama):
 * - PLANNING: Planlama
 * - FABRIC: Kumaş Tedarik
 * - CUTTING: Kesim
 * - SEWING: Dikim
 * - PRESSING: Ütü ve Pres
 * - QUALITY: Kalite Kontrol
 * - PACKAGING: Paketleme
 * - SHIPPING: Sevkiyat Hazırlık
 *
 * StageStatus Enum (5 Durum):
 * - NOT_STARTED: Başlamadı
 * - IN_PROGRESS: Devam ediyor
 * - ON_HOLD: Beklemede
 * - COMPLETED: Tamamlandı
 * - REQUIRES_REVISION: Revizyon gerekli
 *
 * Sistem Açıklaması:
 * Her üretim aşamasının durumunu ve ilerlemesini takip eder.
 * Her aşama için başlangıç/bitiş tarihleri, fotoğraflar, notlar tutulur.
 *
 * İlişkiler:
 * - production: Bağlı ProductionTracking kaydı
 *
 * Özellikler:
 * - Aşama bazlı foto yükleme (photos JSON array)
 * - Revizyon takibi (isRevision)
 * - Gecikme nedeni takibi (delayReason, extraDays)
 * - Tahmini/gerçek tarih karşılaştırması
 * ============================================================================
 */

import builder from "../builder";
import { ProductionStage } from "../enums/ProductionStage";
import { StageStatus } from "../enums/StageStatus";

/**
 * ProductionStageUpdate Type - Üretim Aşama Güncelleme Entity
 */
export const ProductionStageUpdate = builder.prismaObject(
  "ProductionStageUpdate",
  {
    fields: (t) => ({
      /** Benzersiz güncelleme ID'si */
      id: t.exposeID("id"),

      /** Bağlı üretim takip kaydı */
      production: t.relation("production"),
      productionId: t.exposeInt("productionId"),

      /** Üretim aşaması (PLANNING, FABRIC, CUTTING, SEWING vb.) */
      stage: t.expose("stage", { type: ProductionStage }),

      /** Aşama durumu (NOT_STARTED, IN_PROGRESS, COMPLETED vb.) */
      status: t.expose("status", { type: StageStatus }),

      /** Aşama gerçek başlangıç tarihi */
      actualStartDate: t.expose("actualStartDate", {
        type: "DateTime",
        nullable: true,
      }),

      /** Aşama gerçek bitiş tarihi */
      actualEndDate: t.expose("actualEndDate", {
        type: "DateTime",
        nullable: true,
      }),

      /** Tahmini gün sayısı */
      estimatedDays: t.exposeInt("estimatedDays", { nullable: true }),

      /** Aşama notları/açıklamaları */
      notes: t.exposeString("notes", { nullable: true }),

      /** Fotoğraflar (JSON array - aşama görselleri) */
      photos: t.field({
        type: "String",
        nullable: true,
        resolve: (parent) => {
          if (!parent.photos) return null;
          return typeof parent.photos === "string"
            ? parent.photos
            : JSON.stringify(parent.photos);
        },
      }),

      /** Revizyon mu? (hatadan dolayı tekrar yapılıyor mu?) */
      isRevision: t.exposeBoolean("isRevision"),

      /** Gecikme nedeni */
      delayReason: t.exposeString("delayReason", { nullable: true }),

      /** Ek gün sayısı (gecikme) */
      extraDays: t.exposeInt("extraDays"),

      /** Kayıt oluşturulma zamanı */
      createdAt: t.expose("createdAt", { type: "DateTime" }),

      /** Son güncelleme zamanı */
      updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    }),
  }
);
