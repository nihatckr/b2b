import { intArg } from "nexus";
import { Context } from "../context";
import { requireAuth } from "../utils/user-role-helper";

export const categoryQueries = (t: any) => {
  t.list.field("allCategories", {
    type: "Category",
    resolve: async (_: any, __: any, context: Context) => {
      // All authenticated users can view all categories (platform-wide)
      requireAuth(context);

      return context.prisma.category.findMany({
        orderBy: [
          { parentCategoryId: "asc" }, // Root categories first
          { name: "asc" },
        ],
        include: {
          author: true,
          company: true,
          subCategories: true,
        },
      });
    },
  });

  t.list.field("rootCategories", {
    type: "Category",
    resolve: async (_: any, __: any, context: Context) => {
      // All authenticated users can view root categories (platform-wide)
      requireAuth(context);

      return context.prisma.category.findMany({
        where: { parentCategoryId: null },
        orderBy: { name: "asc" },
        include: {
          author: true,
          company: true,
          subCategories: {
            orderBy: { name: "asc" },
          },
        },
      });
    },
  });

  t.list.field("categoriesByCompany", {
    type: "Category",
    args: {
      companyId: intArg(),
    },
    resolve: async (_: any, args: any, context: Context) => {
      // All authenticated users can view categories (platform-wide system)
      requireAuth(context);

      return context.prisma.category.findMany({
        where: {
          companyId: args.companyId || null,
        },
        orderBy: [{ parentCategoryId: "asc" }, { name: "asc" }],
        include: {
          author: true,
          company: true,
          subCategories: true,
        },
      });
    },
  });

  t.field("category", {
    type: "Category",
    args: {
      id: intArg(),
    },
    resolve: async (_: any, args: any, context: Context) => {
      // All authenticated users can view category details (platform-wide)
      requireAuth(context);

      if (!args.id) {
        throw new Error("Category ID is required");
      }

      const category = await context.prisma.category.findUnique({
        where: { id: args.id },
        include: {
          author: true,
          company: true,
          parentCategory: true,
          subCategories: {
            orderBy: { name: "asc" },
          },
        },
      });

      if (!category) {
        throw new Error("Category not found");
      }

      return category;
    },
  });

  t.list.field("myCategories", {
    type: "Category",
    resolve: async (_: any, __: any, context: Context) => {
      // All authenticated users can see all categories (platform-wide system)
      requireAuth(context);

      return context.prisma.category.findMany({
        orderBy: [{ parentCategoryId: "asc" }, { name: "asc" }],
        include: {
          author: true,
          company: true,
          subCategories: true,
        },
      });
    },
  });

  t.list.field("categoryTree", {
    type: "Category",
    resolve: async (_: any, __: any, context: Context) => {
      // All authenticated users can view category tree (platform-wide)
      requireAuth(context);

      const allCategories = await context.prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
          author: true,
          company: true,
        },
      });

      // Build tree structure (return only root categories, children will be populated via subCategories resolver)
      return allCategories.filter((cat) => cat.parentCategoryId === null);
    },
  });
};
