/**
 * ============================================================================
 * ORDER SIZE BREAKDOWN TYPE
 * ============================================================================
 * Dosya: OrderSizeBreakdown.ts
 * Amaç: Sipariş Beden Dağılımı GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * Sistem Açıklaması:
 * Siparişin beden bazında detay dağılımını tutar.
 * Örnek: S: 100 adet (%20), M: 200 adet (%40), L: 150 adet (%30)
 *
 * Üretim Takibi:
 * Her beden için 3 aşama takip edilir:
 * 1. produced: Üretilen adet
 * 2. packed: Paketlenen adet
 * 3. shipped: Sevk edilen adet
 *
 * İlişkiler:
 * - order: İlgili sipariş
 *
 * Özellikler:
 * - Beden bazlı miktar ve yüzde takibi
 * - Üretim aşamalarında ilerleme takibi
 * - Toplam sipariş quantity'si = sum(all sizes)
 * ============================================================================
 */

import builder from "../builder";

/**
 * OrderSizeBreakdown Type - Sipariş Beden Dağılımı Entity
 */
export const OrderSizeBreakdown = builder.prismaObject("OrderSizeBreakdown", {
  fields: (t) => ({
    /** Benzersiz kayıt ID'si */
    id: t.exposeID("id"),

    /** İlgili sipariş ID */
    orderId: t.exposeInt("orderId"),
    order: t.relation("order"),

    /** Beden (S, M, L, XL vb.) */
    size: t.exposeString("size"),

    /** Bu bedenden sipariş adedi */
    quantity: t.exposeInt("quantity"),

    /** Toplam içindeki yüzde (%) */
    percentage: t.exposeFloat("percentage"),

    /** Üretilen adet */
    produced: t.exposeInt("produced"),

    /** Paketlenen adet */
    packed: t.exposeInt("packed"),

    /** Sevk edilen adet */
    shipped: t.exposeInt("shipped"),

    /** Notlar (özel talimatlar) */
    notes: t.exposeString("notes", { nullable: true }),

    /** Kayıt oluşturulma zamanı */
    createdAt: t.expose("createdAt", { type: "DateTime" }),

    /** Son güncelleme zamanı */
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
