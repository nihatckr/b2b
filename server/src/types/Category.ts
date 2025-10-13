import { inputObjectType, objectType } from "nexus";

export const Category = objectType({
  name: "Category",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("name");
    t.string("description");
    t.nonNull.string("createdAt", {
      resolve: (parent) => parent.createdAt.toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent) => parent.updatedAt.toISOString(),
    });

    // Author relation
    t.field("author", {
      type: "User",
      resolve: async (parent, _args, context) => {
        if (!parent.authorId) return null;
        return context.prisma.user.findUnique({
          where: { id: parent.authorId },
        });
      },
    });

    // Company relation
    t.field("company", {
      type: "Company",
      resolve: async (parent, _args, context) => {
        if (!parent.companyId) return null;
        return context.prisma.company.findUnique({
          where: { id: parent.companyId },
        });
      },
    });

    // Parent category relation
    t.field("parentCategory", {
      type: "Category",
      resolve: async (parent, _args, context) => {
        if (!parent.parentCategoryId) return null;
        return context.prisma.category.findUnique({
          where: { id: parent.parentCategoryId },
        });
      },
    });

    // Sub categories relation
    t.list.field("subCategories", {
      type: "Category",
      resolve: async (parent, _args, context) => {
        return context.prisma.category.findMany({
          where: { parentCategoryId: parent.id },
          orderBy: { name: "asc" },
        });
      },
    });

    // Collections count (without full relation for now)
    t.int("collectionsCount", {
      resolve: async (parent, _args, context) => {
        return context.prisma.collection.count({
          where: { categoryId: parent.id },
        });
      },
    });
  },
});

export const CreateCategoryInput = inputObjectType({
  name: "CreateCategoryInput",
  definition(t) {
    t.nonNull.string("name");
    t.string("description");
    t.int("parentCategoryId"); // Parent category ID for hierarchical structure
    t.int("companyId"); // Company assignment
  },
});

export const UpdateCategoryInput = inputObjectType({
  name: "UpdateCategoryInput",
  definition(t) {
    t.nonNull.int("id");
    t.string("name");
    t.string("description");
    t.int("parentCategoryId"); // Can change parent category
    t.int("companyId"); // Can reassign company
  },
});
