import * as z from "zod";

// ============================================
// BULK OPERATIONS VALIDATION SCHEMAS
// Backend: bulkMutation.ts
// Backend errors: "Maximum 50 orders can be updated at once"
// ============================================

// Bulk update order status schema (max 50 items)
export const BulkUpdateOrderStatusSchema = z.object({
  orderIds: z
    .array(z.number().int().positive())
    .min(1, "En az bir sipariş seçilmelidir")
    .max(50, "Aynı anda en fazla 50 sipariş güncellenebilir"),
  status: z.string().min(1, "Durum gereklidir"),
});

// Bulk update sample status schema (max 50 items)
export const BulkUpdateSampleStatusSchema = z.object({
  sampleIds: z
    .array(z.number().int().positive())
    .min(1, "En az bir numune seçilmelidir")
    .max(50, "Aynı anda en fazla 50 numune güncellenebilir"),
  status: z.string().min(1, "Durum gereklidir"),
});

// Bulk delete schema (max 50 items)
export const BulkDeleteSchema = z.object({
  ids: z
    .array(z.number().int().positive())
    .min(1, "En az bir öğe seçilmelidir")
    .max(50, "Aynı anda en fazla 50 öğe silinebilir"),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type BulkUpdateOrderStatusInput = z.infer<
  typeof BulkUpdateOrderStatusSchema
>;
export type BulkUpdateSampleStatusInput = z.infer<
  typeof BulkUpdateSampleStatusSchema
>;
export type BulkDeleteInput = z.infer<typeof BulkDeleteSchema>;
