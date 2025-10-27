import * as z from "zod";

// ============================================
// CATEGORY VALIDATION SCHEMAS
// ============================================

// Category Level enum
export const CategoryLevelEnum = z.enum(["ROOT", "MAIN", "SUB", "DETAIL"]);

// Base category schema
export const CategorySchema = z.object({
  code: z
    .string()
    .min(3, "Kod en az 3 karakter olmalıdır")
    .max(40, "Kod en fazla 40 karakter olmalıdır")
    .regex(/^[A-Z0-9-]+$/, "Kod sadece büyük harf, rakam ve tire içermelidir")
    .trim(),
  name: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(100, "Ad en fazla 100 karakter olabilir")
    .trim(),
  description: z
    .string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .optional()
    .or(z.literal("")),
  level: CategoryLevelEnum,
  order: z
    .number()
    .int("Sıralama tam sayı olmalıdır")
    .min(0, "Sıralama 0'dan küçük olamaz")
    .max(9999, "Sıralama 9999'dan büyük olamaz")
    .optional(),
  icon: z.string().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  parentId: z.number().int().positive().optional(),
  keywords: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      },
      { message: "Keywords JSON array formatında olmalıdır" }
    )
    .or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

// Category form schema with refinements
export const CategoryFormSchema = CategorySchema;

// Helper function to create category schema with custom validations
export function createCategorySchema(options?: {
  existingCategories?: Array<{
    id: string;
    code: string;
    level: string;
    parentCategory?: { id: string } | null;
  }>;
  currentCategoryId?: string;
}) {
  let schema = CategoryFormSchema;

  // Add duplicate code check
  if (options?.existingCategories) {
    schema = schema.refine(
      (data) => {
        const duplicate = options.existingCategories!.some(
          (cat) =>
            cat.code.toLowerCase() === data.code.toLowerCase() &&
            cat.id !== options.currentCategoryId
        );
        return !duplicate;
      },
      {
        message: "Bu kod zaten kullanılıyor",
        path: ["code"],
      }
    );
  }

  // Add circular parent check
  if (options?.existingCategories && options?.currentCategoryId) {
    schema = schema.refine(
      (data) => {
        if (!data.parentId) return true;

        const categoryId = options.currentCategoryId!;
        const parentId = data.parentId;

        // Self-parent check
        if (categoryId === String(parentId)) return false;

        // Build parent chain
        let currentParentId: string | null = String(parentId);
        const visited = new Set<string>();

        while (currentParentId) {
          if (currentParentId === categoryId) return false;
          if (visited.has(currentParentId)) break;
          visited.add(currentParentId);

          const parent = options.existingCategories!.find(
            (c) => c.id === currentParentId
          );
          currentParentId = parent?.parentCategory?.id || null;
        }

        return true;
      },
      {
        message:
          "Döngüsel ilişki hatası: Bu kategori kendi alt kategorisi olamaz",
        path: ["parentId"],
      }
    );
  }

  // Add max depth check
  if (options?.existingCategories) {
    schema = schema.refine(
      (data) => {
        if (!data.parentId) return true;

        const maxDepths: Record<string, number> = {
          ROOT: 0,
          MAIN: 1,
          SUB: 2,
          DETAIL: 3,
        };

        const maxDepth = maxDepths[data.level];
        const parent = options.existingCategories!.find(
          (c) => c.id === String(data.parentId)
        );

        if (!parent) return true;

        // Count parent chain depth
        let depth = 1;
        let currentParent = parent;

        while (currentParent.parentCategory) {
          depth++;
          currentParent =
            options.existingCategories!.find(
              (c) => c.id === currentParent.parentCategory!.id
            ) || currentParent;

          if (depth > maxDepth) return false;
        }

        return true;
      },
      {
        message: "Maksimum derinlik aşıldı",
        path: ["parentId"],
      }
    );
  }

  return schema;
}

// ============================================
// TYPE EXPORTS
// ============================================

export type CategoryInput = z.infer<typeof CategorySchema>;
export type CategoryLevel = z.infer<typeof CategoryLevelEnum>;
