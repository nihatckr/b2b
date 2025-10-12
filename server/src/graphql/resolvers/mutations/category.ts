import { intArg, nonNull, stringArg } from "nexus";
import { Context } from "../../../context";
import { getUserId, requireAdmin } from "../../../utils/userUtils";

export const categoryMutations = (t: any) => {
  t.field("createCategory", {
    type: "Category",
    args: {
      name: nonNull(stringArg()),
      description: stringArg(),
      parentCategoryId: intArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      // Only admin can create categories
      await requireAdmin(context);

      const userId = getUserId(context);

      return context.prisma.category.create({
        data: {
          name: args.name,
          description: args.description,
          parentCategoryId: args.parentCategoryId,
          authorId: userId,
        },
      });
    },
  });

  t.field("updateCategory", {
    type: "Category",
    args: {
      id: nonNull(intArg()),
      name: stringArg(),
      description: stringArg(),
      parentCategoryId: intArg(),
    },
    resolve: async (_: any, args: any, context: Context) => {
      // Only admin can update categories
      await requireAdmin(context);

      const updateData: any = {};
      if (args.name !== undefined) updateData.name = args.name;
      if (args.description !== undefined)
        updateData.description = args.description;
      if (args.parentCategoryId !== undefined)
        updateData.parentCategoryId = args.parentCategoryId;

      return context.prisma.category.update({
        where: { id: args.id },
        data: updateData,
      });
    },
  });

  t.field("deleteCategory", {
    type: "Category",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_: any, args: any, context: Context) => {
      // Only admin can delete categories
      await requireAdmin(context);

      // Check if category has subcategories or collections
      const category = await context.prisma.category.findUnique({
        where: { id: args.id },
        include: {
          subCategories: true,
          collections: true,
        },
      });

      if (!category) {
        throw new Error("Category not found.");
      }

      if (category.subCategories.length > 0) {
        throw new Error(
          "Cannot delete category with subcategories. Delete subcategories first."
        );
      }

      if (category.collections.length > 0) {
        throw new Error(
          "Cannot delete category with collections. Move or delete collections first."
        );
      }

      return context.prisma.category.delete({
        where: { id: args.id },
      });
    },
  });
};
