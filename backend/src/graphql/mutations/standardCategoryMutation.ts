import builder from "../builder";

// ========================================
// ADMIN STANDARD CATEGORY MUTATIONS
// ========================================

// Update Standard Category (admin only)
const UpdateStandardCategoryInput = builder.inputType('UpdateStandardCategoryInput', {
  fields: (t) => ({
    code: t.string({ required: false }),
    name: t.string({ required: false }),
    description: t.string({ required: false }),
    level: t.string({ required: false }),
    order: t.int({ required: false }),
    icon: t.string({ required: false }),
    image: t.string({ required: false }),
    parentId: t.int({ required: false }),
    keywords: t.string({ required: false }),
    tags: t.string({ required: false }),
    isActive: t.boolean({ required: false }),
    isPublic: t.boolean({ required: false }),
  }),
});

builder.mutationField("updateStandardCategory", (t) =>
  t.prismaField({
    type: "StandardCategory",
    args: {
      id: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateStandardCategoryInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const input = args.input;
      const updateData: any = {};

      if (input.code !== undefined) updateData.code = input.code;
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.level !== undefined) updateData.level = input.level;
      if (input.order !== undefined) updateData.order = input.order;
      if (input.icon !== undefined) updateData.icon = input.icon;
      if (input.image !== undefined) updateData.image = input.image;
      if (input.parentId !== undefined) updateData.parentId = input.parentId;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.isPublic !== undefined) updateData.isPublic = input.isPublic;

      // Handle keywords JSON field with validation
      if (input.keywords !== undefined && input.keywords !== null) {
        const trimmedKeywords = input.keywords.trim();
        if (trimmedKeywords === "") {
          updateData.keywords = null;
        } else {
          try {
            updateData.keywords = JSON.parse(trimmedKeywords);
          } catch (e) {
            throw new Error("Invalid JSON in keywords field");
          }
        }
      }

      return context.prisma.standardCategory.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });
    },
  })
);

// Delete Standard Category (admin only)
builder.mutationField("deleteStandardCategory", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      // Check if category has subcategories
      const subCategoriesCount = await context.prisma.standardCategory.count({
        where: { parentId: args.id },
      });

      if (subCategoriesCount > 0) {
        throw new Error(
          "Cannot delete category with subcategories. Please delete or reassign subcategories first."
        );
      }

      // Check if category is used by company categories
      const companyCategoriesCount = await context.prisma.companyCategory.count({
        where: { standardCategoryId: args.id },
      });

      if (companyCategoriesCount > 0) {
        throw new Error(
          `Cannot delete category. It is being used by ${companyCategoriesCount} company categories.`
        );
      }

      await context.prisma.standardCategory.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);

// Bulk update order (admin only)
builder.mutationField("updateStandardCategoryOrder", (t) =>
  t.field({
    type: "Boolean",
    args: {
      updates: t.arg({
        type: [
          builder.inputType("CategoryOrderUpdate", {
            fields: (t) => ({
              id: t.int({ required: true }),
              order: t.int({ required: true }),
            }),
          }),
        ],
        required: true,
      }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      // Update all categories in a transaction
      await context.prisma.$transaction(
        args.updates.map((update) =>
          context.prisma.standardCategory.update({
            where: { id: update.id },
            data: { order: update.order },
          })
        )
      );

      return true;
    },
  })
);

// Toggle category active status (admin only)
builder.mutationField("toggleStandardCategoryStatus", (t) =>
  t.prismaField({
    type: "StandardCategory",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const category = await context.prisma.standardCategory.findUniqueOrThrow({
        where: { id: args.id },
        select: { isActive: true },
      });

      return context.prisma.standardCategory.update({
        ...query,
        where: { id: args.id },
        data: { isActive: !category.isActive },
      });
    },
  })
);
