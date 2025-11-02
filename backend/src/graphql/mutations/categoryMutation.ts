/**
 * Category Mutations - STANDARDIZED GLOBAL SYSTEM
 *
 * 🎯 Standardization Strategy:
 * - Categories are GLOBAL and shared across all companies
 * - Only ADMIN can create/update/delete categories
 * - All users can VIEW and USE categories in their products
 *
 * 🔒 Permission Model:
 * - CREATE: Admin only
 * - UPDATE: Admin only
 * - DELETE: Admin only
 * - VIEW: All authenticated users
 *
 * ✅ Benefits:
 * - Consistent categorization across platform
 * - No duplicate categories per company
 * - Easier reporting and analytics
 * - Centralized category management
 */

import {
  handleError,
  NotFoundError,
  requireAdmin,
  ValidationError,
} from "../../utils/errors";
import { createTimer, logError, logInfo } from "../../utils/logger";
import { sanitizeInt, sanitizeString } from "../../utils/sanitize";
import builder from "../builder";

// ========================================
// INPUT TYPES (Clean & Organized)
// ========================================

// Create Category Input
const CreateCategoryInput = builder.inputType("CreateCategoryInput", {
  fields: (t) => ({
    // Required fields
    name: t.string({ required: true }),

    // Optional basic fields
    description: t.string(),
    parentCategoryId: t.int(),

    // Display & Ordering
    order: t.int(),
    icon: t.string(),
    image: t.string(),

    // Status
    isActive: t.boolean(),
    isPublic: t.boolean(),

    // Meta information
    keywords: t.string(),
    tags: t.string(),
  }),
});

// Update Category Input
const UpdateCategoryInput = builder.inputType("UpdateCategoryInput", {
  fields: (t) => ({
    // ID (required for update)
    id: t.int({ required: true }),

    // All fields optional for partial updates
    name: t.string(),
    description: t.string(),

    // Display & Ordering
    order: t.int(),
    icon: t.string(),
    image: t.string(),

    // Status
    isActive: t.boolean(),
    isPublic: t.boolean(),

    // Meta information
    keywords: t.string(),
    tags: t.string(),
  }),
});

// Category Order Update Input (for batch reorder)
const CategoryOrderUpdate = builder.inputType("CategoryOrderUpdate", {
  fields: (t) => ({
    id: t.int({ required: true }),
    order: t.int({ required: true }),
  }),
});

// ========================================
// MUTATIONS (Using InputTypes)
// ========================================

// Create category (admin only)
builder.mutationField("createCategory", (t) =>
  t.prismaField({
    type: "Category",
    args: {
      input: t.arg({ type: CreateCategoryInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("CreateCategory");

      try {
        // ✅ Permission check: ADMIN only (Categories are global and standardized)
        requireAdmin(context.user?.role);

        // ✅ Sanitize inputs
        const name = sanitizeString(args.input.name);
        const description = args.input.description
          ? sanitizeString(args.input.description)
          : undefined;
        const parentCategoryId = args.input.parentCategoryId
          ? sanitizeInt(args.input.parentCategoryId)
          : undefined;
        const order = args.input.order
          ? sanitizeInt(args.input.order)
          : undefined;
        const icon = args.input.icon
          ? sanitizeString(args.input.icon)
          : undefined;
        const image = args.input.image
          ? sanitizeString(args.input.image)
          : undefined;
        const keywords = args.input.keywords
          ? sanitizeString(args.input.keywords)
          : undefined;
        const tags = args.input.tags
          ? sanitizeString(args.input.tags)
          : undefined;

        // ✅ Validate sanitized inputs
        if (!name || name.trim().length === 0) {
          throw new ValidationError("Kategori adı gerekli");
        }

        if (name.length < 2 || name.length > 100) {
          throw new ValidationError("Kategori adı 2-100 karakter olmalıdır");
        }

        if (
          parentCategoryId !== undefined &&
          parentCategoryId !== null &&
          (parentCategoryId <= 0 || !Number.isInteger(parentCategoryId))
        ) {
          throw new ValidationError("Geçerli bir üst kategori ID'si gerekli");
        }

        logInfo("Kategori oluşturuluyor", {
          userId: context.user!.id,
          name,
          parentCategoryId,
        });

        // Generate category code
        const count = await context.prisma.category.count();
        const code = `CAT-${String(count + 1).padStart(3, "0")}`;

        // Determine level based on parent
        let level: "ROOT" | "MAIN" | "SUB" | "DETAIL" = "ROOT";
        if (parentCategoryId) {
          const parent = await context.prisma.category.findUnique({
            where: { id: parentCategoryId },
            select: { level: true },
          });

          if (!parent) {
            throw new NotFoundError("Üst kategori bulunamadı");
          }

          // ✅ Validation: Check max depth (4 levels)
          if (parent.level === "DETAIL") {
            throw new ValidationError(
              "DETAIL seviyesinde alt kategori oluşturulamaz"
            );
          }

          level =
            parent.level === "ROOT"
              ? "MAIN"
              : parent.level === "MAIN"
              ? "SUB"
              : "DETAIL";
        }

        const data: any = {
          name,
          code,
          level,
          createdById: context.user!.id,
        };

        // Optional fields
        if (description !== undefined) data.description = description;
        if (parentCategoryId !== undefined) data.parentId = parentCategoryId;
        if (order !== undefined) data.order = order;
        if (icon !== undefined) data.icon = icon;
        if (image !== undefined) data.image = image;
        if (args.input.isActive !== undefined)
          data.isActive = args.input.isActive;
        if (args.input.isPublic !== undefined)
          data.isPublic = args.input.isPublic;
        if (keywords !== undefined) data.keywords = keywords;
        if (tags !== undefined) data.tags = tags;

        const result = await context.prisma.category.create({
          ...query,
          data,
        });

        logInfo("Kategori oluşturuldu", {
          userId: context.user!.id,
          categoryId: result.id,
          name: result.name,
          level: result.level,
        });
        timer.end({ userId: context.user!.id, success: true });

        return result;
      } catch (error) {
        logError("Kategori oluşturma hatası", error as Error, {
          name: args.input.name,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Update category (admin only)
builder.mutationField("updateCategory", (t) =>
  t.prismaField({
    type: "Category",
    args: {
      input: t.arg({ type: UpdateCategoryInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("UpdateCategory");

      try {
        // ✅ Permission check: ADMIN only (Categories are global and standardized)
        requireAdmin(context.user?.role);

        // ✅ Sanitize and validate ID
        const id = sanitizeInt(args.input.id);
        if (!id || id <= 0) {
          throw new ValidationError("Geçerli bir kategori ID'si gerekli");
        }

        logInfo("Kategori güncelleniyor", {
          userId: context.user!.id,
          categoryId: id,
        });

        // Check if category exists
        const existingCategory = await context.prisma.category.findUnique({
          where: { id },
          select: { id: true, name: true },
        });

        if (!existingCategory) {
          throw new NotFoundError("Kategori bulunamadı");
        }

        const updateData: any = {};

        // ✅ Sanitize and validate basic fields
        if (args.input.name !== null && args.input.name !== undefined) {
          const name = sanitizeString(args.input.name);
          if (!name || name.trim().length === 0) {
            throw new ValidationError("Kategori adı boş olamaz");
          }
          if (name.length < 2 || name.length > 100) {
            throw new ValidationError("Kategori adı 2-100 karakter olmalıdır");
          }
          updateData.name = name;
        }

        if (
          args.input.description !== null &&
          args.input.description !== undefined
        ) {
          updateData.description = sanitizeString(args.input.description);
        }

        // Display & Ordering
        if (args.input.order !== null && args.input.order !== undefined) {
          const order = sanitizeInt(args.input.order);
          if (order !== null && order < 0) {
            throw new ValidationError("Sıra numarası negatif olamaz");
          }
          updateData.order = order;
        }

        if (args.input.icon !== null && args.input.icon !== undefined) {
          updateData.icon = sanitizeString(args.input.icon);
        }

        if (args.input.image !== null && args.input.image !== undefined) {
          updateData.image = sanitizeString(args.input.image);
        }

        // Status
        if (args.input.isActive !== null && args.input.isActive !== undefined)
          updateData.isActive = args.input.isActive;
        if (args.input.isPublic !== null && args.input.isPublic !== undefined)
          updateData.isPublic = args.input.isPublic;

        // Meta information
        if (args.input.keywords !== null && args.input.keywords !== undefined) {
          updateData.keywords = sanitizeString(args.input.keywords);
        }

        if (args.input.tags !== null && args.input.tags !== undefined) {
          updateData.tags = sanitizeString(args.input.tags);
        }

        const result = await context.prisma.category.update({
          ...query,
          where: { id },
          data: updateData,
        });

        logInfo("Kategori güncellendi", {
          userId: context.user!.id,
          categoryId: result.id,
          updatedFields: Object.keys(updateData),
        });
        timer.end({ userId: context.user!.id, success: true });

        return result;
      } catch (error) {
        logError("Kategori güncelleme hatası", error as Error, {
          categoryId: args.input.id,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Delete category (admin only)
builder.mutationField("deleteCategory", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("DeleteCategory");

      try {
        // ✅ Permission check: ADMIN only (Categories are global and standardized)
        requireAdmin(context.user?.role);

        // ✅ Sanitize and validate ID
        const id = sanitizeInt(args.id);
        if (!id || id <= 0) {
          throw new ValidationError("Geçerli bir kategori ID'si gerekli");
        }

        logInfo("Kategori siliniyor", {
          userId: context.user!.id,
          categoryId: id,
        });

        // ✅ Check if category exists and has subcategories
        const category = await context.prisma.category.findUnique({
          where: { id },
          include: { subCategories: true },
        });

        if (!category) {
          throw new NotFoundError("Kategori bulunamadı");
        }

        if (category.subCategories && category.subCategories.length > 0) {
          throw new ValidationError(
            "Alt kategorileri olan kategori silinemez. Önce alt kategorileri silin."
          );
        }

        await context.prisma.category.delete({
          where: { id },
        });

        logInfo("Kategori silindi", {
          userId: context.user!.id,
          categoryId: id,
          categoryName: category.name,
        });
        timer.end({ userId: context.user!.id, success: true });

        return true;
      } catch (error) {
        logError("Kategori silme hatası", error as Error, {
          categoryId: args.id,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// ✅ NEW: Batch delete categories
builder.mutationField("deleteCategoriesBatch", (t) =>
  t.field({
    type: "Int", // Returns number of deleted categories
    args: {
      ids: t.arg.intList({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("DeleteCategoriesBatch");

      try {
        // ✅ Permission check: ADMIN only (Categories are global and standardized)
        requireAdmin(context.user?.role);

        // ✅ Validate input
        if (!args.ids || args.ids.length === 0) {
          throw new ValidationError("En az bir kategori ID'si gerekli");
        }

        // ✅ Sanitize IDs
        const ids = args.ids
          .map((id) => sanitizeInt(id))
          .filter((id): id is number => id !== null && id > 0);

        if (ids.length === 0) {
          throw new ValidationError("Geçerli kategori ID'si bulunamadı");
        }

        logInfo("Toplu kategori silme işlemi", {
          userId: context.user!.id,
          categoryIds: ids,
          count: ids.length,
        });

        // Check for categories with subcategories
        const categoriesWithSubs = await context.prisma.category.findMany({
          where: {
            id: { in: ids },
            subCategories: { some: {} },
          },
          select: { id: true, name: true },
        });

        if (categoriesWithSubs.length > 0) {
          throw new ValidationError(
            `Şu kategoriler alt kategoriye sahip ve silinemez: ${categoriesWithSubs
              .map((c) => c.name)
              .join(", ")}`
          );
        }

        const result = await context.prisma.category.deleteMany({
          where: { id: { in: ids } },
        });

        logInfo("Kategoriler toplu silindi", {
          userId: context.user!.id,
          deletedCount: result.count,
          requestedCount: ids.length,
        });
        timer.end({ userId: context.user!.id, success: true });

        return result.count;
      } catch (error) {
        logError("Toplu kategori silme hatası", error as Error, {
          categoryIds: args.ids,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// ✅ Reorder categories (batch order update)
builder.mutationField("reorderCategories", (t) =>
  t.field({
    type: "Boolean",
    args: {
      updates: t.arg({ type: [CategoryOrderUpdate], required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("ReorderCategories");

      try {
        // ✅ Permission check: ADMIN only (Categories are global and standardized)
        requireAdmin(context.user?.role);

        // ✅ Validate input
        if (!args.updates || args.updates.length === 0) {
          throw new ValidationError("En az bir güncelleme gerekli");
        }

        logInfo("Kategoriler yeniden sıralanıyor", {
          userId: context.user!.id,
          updateCount: args.updates.length,
        });

        // ✅ Sanitize and validate updates
        const sanitizedUpdates = args.updates.map((update) => {
          const id = sanitizeInt(update.id);
          const order = sanitizeInt(update.order);

          if (!id || id <= 0) {
            throw new ValidationError(`Geçersiz kategori ID'si: ${update.id}`);
          }

          if (order === null || order < 0) {
            throw new ValidationError(
              `Geçersiz sıra numarası: ${update.order}`
            );
          }

          return { id, order };
        });

        // Batch update orders
        await Promise.all(
          sanitizedUpdates.map((update) =>
            context.prisma.category.update({
              where: { id: update.id },
              data: { order: update.order },
            })
          )
        );

        logInfo("Kategoriler yeniden sıralandı", {
          userId: context.user!.id,
          updatedCount: sanitizedUpdates.length,
        });
        timer.end({ userId: context.user!.id, success: true });

        return true;
      } catch (error) {
        logError("Kategori sıralama hatası", error as Error, {
          updateCount: args.updates?.length,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// ✅ NEW: Toggle category active status
builder.mutationField("toggleCategoryStatus", (t) =>
  t.prismaField({
    type: "Category",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("ToggleCategoryStatus");

      try {
        // ✅ Permission check: ADMIN only (Categories are global and standardized)
        requireAdmin(context.user?.role);

        // ✅ Sanitize and validate ID
        const id = sanitizeInt(args.id);
        if (!id || id <= 0) {
          throw new ValidationError("Geçerli bir kategori ID'si gerekli");
        }

        logInfo("Kategori durumu değiştiriliyor", {
          userId: context.user!.id,
          categoryId: id,
        });

        const category = await context.prisma.category.findUnique({
          where: { id },
          select: { isActive: true, name: true },
        });

        if (!category) {
          throw new NotFoundError("Kategori bulunamadı");
        }

        const newStatus = !category.isActive;

        const result = await context.prisma.category.update({
          ...query,
          where: { id },
          data: { isActive: newStatus },
        });

        logInfo("Kategori durumu değiştirildi", {
          userId: context.user!.id,
          categoryId: id,
          categoryName: category.name,
          oldStatus: category.isActive,
          newStatus,
        });
        timer.end({ userId: context.user!.id, success: true });

        return result;
      } catch (error) {
        logError("Kategori durum değiştirme hatası", error as Error, {
          categoryId: args.id,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);
