import { booleanArg, intArg, stringArg } from "nexus";
import { Context } from "../../../context";
import { getUserId } from "../../../utils/userUtils";

export const collectionQueries = (t: any) => {
  t.list.field("collections", {
    type: "Collection",
    args: {
      searchString: stringArg(),
      categoryId: intArg(),
      skip: intArg(),
      take: intArg(),
    },
    resolve: (_parent: any, args: any, context: Context) => {
      // Build where conditions
      const searchConditions: any = {};

      // Category filter
      if (args.categoryId) {
        searchConditions.categoryId = args.categoryId;
      }

      // Search in name or description
      if (args.searchString) {
        searchConditions.OR = [
          { name: { contains: args.searchString, mode: "insensitive" } },
          { description: { contains: args.searchString, mode: "insensitive" } },
          { sku: { contains: args.searchString, mode: "insensitive" } },
        ];
      }

      // Only show active collections by default
      searchConditions.isActive = true;

      return context.prisma.collection.findMany({
        where: searchConditions,
        include: {
          category: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: args.skip || undefined,
        take: args.take || undefined,
      });
    },
  });

  t.field("collection", {
    type: "Collection",
    args: {
      id: intArg(),
      sku: stringArg(),
    },
    resolve: (_parent: any, args: any, context: Context) => {
      let where: any = {};

      if (args.id) {
        where.id = args.id;
      } else if (args.sku) {
        where.sku = args.sku;
      } else {
        return null;
      }

      return context.prisma.collection.findUnique({
        where,
        include: {
          category: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });
    },
  });

  // Collections for authenticated manufacturer
  t.list.field("myCollections", {
    type: "Collection",
    args: {
      searchString: stringArg(),
      categoryId: intArg(),
      isActive: booleanArg(),
      skip: intArg(),
      take: intArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Build where conditions
      const searchConditions: any = {
        authorId: userId, // Only user's own collections
      };

      if (args.categoryId) {
        searchConditions.categoryId = args.categoryId;
      }

      if (args.isActive !== undefined) {
        searchConditions.isActive = args.isActive;
      }

      if (args.searchString) {
        searchConditions.OR = [
          { name: { contains: args.searchString, mode: "insensitive" } },
          { description: { contains: args.searchString, mode: "insensitive" } },
          { sku: { contains: args.searchString, mode: "insensitive" } },
        ];
      }

      return context.prisma.collection.findMany({
        where: searchConditions,
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
        skip: args.skip || undefined,
        take: args.take || undefined,
      });
    },
  });
};
