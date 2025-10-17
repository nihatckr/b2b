import { intArg, nonNull, stringArg } from "nexus";
import { Context } from "../context";
import { requireAuth } from "../utils/user-role-helper";

export const categoryMutations = (t: any) => {
  t.field("createCategory", {
    type: "Category",
    args: {
      name: nonNull(stringArg()),
      description: stringArg(),
      parentCategoryId: intArg(),
      companyId: intArg(),
    },
    resolve: async (_: any, args: any, context: Context) => {
      // Require authentication
      const userId = requireAuth(context);

      // Get current user
      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!currentUser) {
        throw new Error("User not found");
      }

      // Only ADMIN can create categories (platform-wide system)
      if (currentUser.role !== "ADMIN") {
        throw new Error("Only administrators can create categories");
      }

      let companyId = args.companyId || null;

      // Validate parent category exists and belongs to same company if specified
      if (args.parentCategoryId) {
        const parentCategory = await context.prisma.category.findUnique({
          where: { id: args.parentCategoryId },
        });

        if (!parentCategory) {
          throw new Error("Parent category not found");
        }

        // If creating under a company-specific parent, ensure consistency
        if (
          parentCategory.companyId &&
          companyId &&
          parentCategory.companyId !== companyId
        ) {
          throw new Error(
            "Category and parent category must belong to the same company"
          );
        }
      }

      // Check if category name already exists within the same parent/company scope
      const existingCategory = await context.prisma.category.findFirst({
        where: {
          name: args.name.trim(),
          parentCategoryId: args.parentCategoryId || null,
          companyId: companyId || null,
        },
      });

      if (existingCategory) {
        throw new Error(
          "Category with this name already exists in the same scope"
        );
      }

      // Create category
      const category = await context.prisma.category.create({
        data: {
          name: args.name.trim(),
          description: args.description?.trim() || null,
          parentCategoryId: args.parentCategoryId || null,
          companyId: companyId || null,
          authorId: userId,
        },
      });

      return category;
    },
  });

  t.field("updateCategory", {
    type: "Category",
    args: {
      id: nonNull(intArg()),
      name: stringArg(),
      description: stringArg(),
      parentCategoryId: intArg(),
      companyId: intArg(),
    },
    resolve: async (_: any, args: any, context: Context) => {
      // Require authentication
      const userId = requireAuth(context);

      // Get current user and category
      const [currentUser, category] = await Promise.all([
        context.prisma.user.findUnique({
          where: { id: userId },
          include: { company: true },
        }),
        context.prisma.category.findUnique({
          where: { id: args.id },
        }),
      ]);

      if (!currentUser || !category) {
        throw new Error("User or category not found");
      }

      // Only ADMIN can update categories (platform-wide system)
      if (currentUser.role !== "ADMIN") {
        throw new Error("Only administrators can update categories");
      }

      // Build update object
      const updates: any = {};

      if (args.name !== undefined && args.name !== null) {
        if (args.name.trim() === "") {
          throw new Error("Category name cannot be empty");
        }

        // Check name uniqueness in the same scope
        const existingCategory = await context.prisma.category.findFirst({
          where: {
            name: args.name.trim(),
            parentCategoryId:
              args.parentCategoryId !== undefined
                ? args.parentCategoryId
                : category.parentCategoryId,
            companyId:
              args.companyId !== undefined
                ? args.companyId
                : category.companyId,
            id: { not: args.id },
          },
        });

        if (existingCategory) {
          throw new Error(
            "Category with this name already exists in the same scope"
          );
        }

        updates.name = args.name.trim();
      }

      if (args.description !== undefined) {
        updates.description = args.description?.trim() || null;
      }

      if (args.parentCategoryId !== undefined) {
        // Validate parent category if specified
        if (args.parentCategoryId) {
          const parentCategory = await context.prisma.category.findUnique({
            where: { id: args.parentCategoryId },
          });

          if (!parentCategory) {
            throw new Error("Parent category not found");
          }

          // Prevent circular references
          if (args.parentCategoryId === args.id) {
            throw new Error("Category cannot be its own parent");
          }

          // Check if the category would become a child of one of its own descendants
          const descendants = await getDescendantIds(context.prisma, args.id);
          if (descendants.includes(args.parentCategoryId)) {
            throw new Error("Cannot set parent to a descendant category");
          }
        }

        updates.parentCategoryId = args.parentCategoryId || null;
      }

      // ADMIN can reassign company, MANUFACTURER cannot
      if (args.companyId !== undefined && currentUser.role === "ADMIN") {
        updates.companyId = args.companyId || null;
      }

      if (Object.keys(updates).length === 0) {
        throw new Error("No updates provided");
      }

      return context.prisma.category.update({
        where: { id: args.id },
        data: updates,
      });
    },
  });

  t.field("deleteCategory", {
    type: "Category",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_: any, args: any, context: Context) => {
      // Require authentication
      const userId = requireAuth(context);

      // Get current user and category
      const [currentUser, category] = await Promise.all([
        context.prisma.user.findUnique({
          where: { id: userId },
          include: { company: true },
        }),
        context.prisma.category.findUnique({
          where: { id: args.id },
          include: {
            subCategories: true,
          },
        }),
      ]);

      if (!currentUser || !category) {
        throw new Error("User or category not found");
      }

      // Only ADMIN can delete categories (platform-wide system)
      if (currentUser.role !== "ADMIN") {
        throw new Error("Only administrators can delete categories");
      }

      // Check if category has subcategories
      if (category.subCategories.length > 0) {
        throw new Error(
          "Cannot delete category with subcategories. Please delete or move subcategories first."
        );
      }

      // Check if category has collections
      const collectionsCount = await context.prisma.collection.count({
        where: { categoryId: args.id },
      });

      if (collectionsCount > 0) {
        throw new Error(
          "Cannot delete category with collections. Please delete or move collections first."
        );
      }

      // Delete category
      const deletedCategory = await context.prisma.category.delete({
        where: { id: args.id },
      });

      return deletedCategory;
    },
  });
};

// Helper function to get all descendant category IDs
async function getDescendantIds(
  prisma: any,
  categoryId: number
): Promise<number[]> {
  const descendants: number[] = [];

  const children = await prisma.category.findMany({
    where: { parentCategoryId: categoryId },
    select: { id: true },
  });

  for (const child of children) {
    descendants.push(child.id);
    const childDescendants = await getDescendantIds(prisma, child.id);
    descendants.push(...childDescendants);
  }

  return descendants;
}
