/**
 * ============================================================================
 * BULK OPERATIONS MUTATIONS
 * ============================================================================
 * Dosya: bulkMutation.ts
 * Amaç: Toplu işlem mutations (bulk operations)
 * Versiyon: 2.0.0
 *
 * Mutations:
 * - bulkUpdateOrderStatus: Birden fazla siparişin durumunu güncelle
 * - bulkUpdateSampleStatus: Birden fazla numunenin durumunu güncelle
 * - bulkDeleteOrders: Birden fazla siparişi sil (admin only)
 * - bulkDeleteSamples: Birden fazla numuneyi sil (admin only)
 *
 * Use Cases:
 * - Üretici: 10 siparişi aynı anda "CONFIRMED" yapma
 * - Admin: Birden fazla test siparişini silme
 * - Toplu durum güncellemeleri (verimlilik)
 *
 * Validations:
 * - Kullanıcı sadece kendi şirketinin kayıtlarını güncelleyebilir
 * - Admin tüm kayıtlara erişebilir
 * - Bulk limit: Maximum 50 item per request
 * ============================================================================
 */

import { ValidationError } from "../../utils/errors";
import builder from "../builder";
import { OrderStatus } from "../enums/OrderStatus";
import { SampleStatus } from "../enums/SampleStatus";

// Bulk Update Result Type
const BulkUpdateResult = builder
  .objectRef<{
    success: boolean;
    updatedCount: number;
    failedIds: number[];
    errors: string[];
  }>("BulkUpdateResult")
  .implement({
    fields: (t) => ({
      success: t.boolean({ resolve: (parent) => parent.success }),
      updatedCount: t.int({ resolve: (parent) => parent.updatedCount }),
      failedIds: t.intList({ resolve: (parent) => parent.failedIds }),
      errors: t.stringList({ resolve: (parent) => parent.errors }),
    }),
  });

// ============================================
// BULK UPDATE ORDER STATUS
// ============================================
builder.mutationField("bulkUpdateOrderStatus", (t) =>
  t.field({
    type: BulkUpdateResult,
    authScopes: { user: true },
    args: {
      orderIds: t.arg.intList({ required: true }),
      status: t.arg({ type: OrderStatus, required: true }),
    },
    resolve: async (root, args, ctx) => {
      if (!ctx.user) throw new Error("Unauthorized");

      // Validation: Maximum 50 items
      if (args.orderIds.length > 50) {
        throw new ValidationError("Maximum 50 orders can be updated at once");
      }

      const failedIds: number[] = [];
      const errors: string[] = [];

      try {
        // Siparişleri kontrol et
        const orders = await ctx.prisma.order.findMany({
          where: {
            id: { in: args.orderIds },
          },
        });

        // Authorization: Sadece üreticinin kendi siparişleri veya admin
        const authorizedOrders = orders.filter((order) => {
          if (ctx.user!.role === "ADMIN") return true;
          if (order.manufactureId === ctx.user!.id) return true;

          failedIds.push(order.id);
          errors.push(`Order ${order.id}: Unauthorized`);
          return false;
        });

        if (authorizedOrders.length === 0) {
          return {
            success: false,
            updatedCount: 0,
            failedIds,
            errors,
          };
        }

        // Bulk update
        const result = await ctx.prisma.order.updateMany({
          where: {
            id: { in: authorizedOrders.map((o) => o.id) },
          },
          data: {
            status: args.status,
          },
        });

        return {
          success: true,
          updatedCount: result.count,
          failedIds,
          errors,
        };
      } catch (error: any) {
        return {
          success: false,
          updatedCount: 0,
          failedIds: args.orderIds,
          errors: [error.message],
        };
      }
    },
  })
);

// ============================================
// BULK UPDATE SAMPLE STATUS
// ============================================
builder.mutationField("bulkUpdateSampleStatus", (t) =>
  t.field({
    type: BulkUpdateResult,
    authScopes: { user: true },
    args: {
      sampleIds: t.arg.intList({ required: true }),
      status: t.arg({ type: SampleStatus, required: true }),
    },
    resolve: async (root, args, ctx) => {
      if (!ctx.user) throw new Error("Unauthorized");

      // Validation: Maximum 50 items
      if (args.sampleIds.length > 50) {
        throw new ValidationError("Maximum 50 samples can be updated at once");
      }

      const failedIds: number[] = [];
      const errors: string[] = [];

      try {
        // Numuneleri kontrol et
        const samples = await ctx.prisma.sample.findMany({
          where: {
            id: { in: args.sampleIds },
          },
        });

        // Authorization: Sadece üreticinin kendi numuneleri veya admin
        const authorizedSamples = samples.filter((sample) => {
          if (ctx.user!.role === "ADMIN") return true;
          if (sample.manufactureId === ctx.user!.id) return true;

          failedIds.push(sample.id);
          errors.push(`Sample ${sample.id}: Unauthorized`);
          return false;
        });

        if (authorizedSamples.length === 0) {
          return {
            success: false,
            updatedCount: 0,
            failedIds,
            errors,
          };
        }

        // Bulk update
        const result = await ctx.prisma.sample.updateMany({
          where: {
            id: { in: authorizedSamples.map((s) => s.id) },
          },
          data: {
            status: args.status,
          },
        });

        return {
          success: true,
          updatedCount: result.count,
          failedIds,
          errors,
        };
      } catch (error: any) {
        return {
          success: false,
          updatedCount: 0,
          failedIds: args.sampleIds,
          errors: [error.message],
        };
      }
    },
  })
);

// ============================================
// BULK DELETE ORDERS (Admin Only)
// ============================================
builder.mutationField("bulkDeleteOrders", (t) =>
  t.field({
    type: BulkUpdateResult,
    authScopes: { admin: true },
    args: {
      orderIds: t.arg.intList({ required: true }),
    },
    resolve: async (root, args, ctx) => {
      if (!ctx.user || ctx.user.role !== "ADMIN") {
        throw new Error("Admin access required");
      }

      // Validation: Maximum 50 items
      if (args.orderIds.length > 50) {
        throw new ValidationError("Maximum 50 orders can be deleted at once");
      }

      const failedIds: number[] = [];
      const errors: string[] = [];

      try {
        // Bulk delete
        const result = await ctx.prisma.order.deleteMany({
          where: {
            id: { in: args.orderIds },
          },
        });

        return {
          success: true,
          updatedCount: result.count,
          failedIds,
          errors,
        };
      } catch (error: any) {
        return {
          success: false,
          updatedCount: 0,
          failedIds: args.orderIds,
          errors: [error.message],
        };
      }
    },
  })
);

// ============================================
// BULK DELETE SAMPLES (Admin Only)
// ============================================
builder.mutationField("bulkDeleteSamples", (t) =>
  t.field({
    type: BulkUpdateResult,
    authScopes: { admin: true },
    args: {
      sampleIds: t.arg.intList({ required: true }),
    },
    resolve: async (root, args, ctx) => {
      if (!ctx.user || ctx.user.role !== "ADMIN") {
        throw new Error("Admin access required");
      }

      // Validation: Maximum 50 items
      if (args.sampleIds.length > 50) {
        throw new ValidationError("Maximum 50 samples can be deleted at once");
      }

      const failedIds: number[] = [];
      const errors: string[] = [];

      try {
        // Bulk delete
        const result = await ctx.prisma.sample.deleteMany({
          where: {
            id: { in: args.sampleIds },
          },
        });

        return {
          success: true,
          updatedCount: result.count,
          failedIds,
          errors,
        };
      } catch (error: any) {
        return {
          success: false,
          updatedCount: 0,
          failedIds: args.sampleIds,
          errors: [error.message],
        };
      }
    },
  })
);
