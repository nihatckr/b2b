/**
 * ============================================================================
 * ORDER PRODUCTION TYPE
 * ============================================================================
 * Dosya: OrderProduction.ts
 * Amaç: Sipariş Üretim Logu GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * Sistem Açıklaması:
 * Sipariş üretim sürecinin durum değişikliklerini loglar.
 * Her status değişiminde yeni kayıt oluşturulur.
 *
 * OrderStatus: Order.ts'deki 30 durum değeri kullanılır
 *
 * İlişkiler:
 * - order: İlgili sipariş
 * - updatedBy: Durumu güncelleyen kullanıcı
 *
 * Özellikler:
 * - Durum geçmişi takibi
 * - Tahmini/gerçek tarih karşılaştırması
 * - Her güncelleme için not alanı
 * ============================================================================
 */

import builder from "../builder";
import { OrderStatus } from "../enums";

/**
 * OrderProduction Type - Sipariş Üretim Logu Entity
 */
export const OrderProduction = builder.prismaObject("OrderProduction", {
  fields: (t) => ({
    /** Benzersiz log ID'si */
    id: t.exposeID("id"),

    /** Sipariş durumu (30 OrderStatus değerinden biri) */
    status: t.expose("status", { type: OrderStatus }),

    /** Güncelleme notu */
    note: t.exposeString("note", { nullable: true }),

    /** Tahmini gün sayısı */
    estimatedDays: t.exposeInt("estimatedDays", { nullable: true }),

    /** Gerçekleşen tarih */
    actualDate: t.expose("actualDate", { type: "DateTime", nullable: true }),

    /** İlgili sipariş */
    order: t.relation("order"),
    orderId: t.exposeInt("orderId"),

    /** Güncelleyen kullanıcı */
    updatedBy: t.relation("updatedBy"),
    updatedById: t.exposeInt("updatedById"),

    /** Log oluşturulma zamanı */
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});
