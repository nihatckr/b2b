import { intArg, stringArg } from "nexus";
import { Context } from "../../../context";

export const categoryQueries = (t: any) => {
  t.nonNull.list.nonNull.field("categories", {
    type: "Category",
    args: {
      searchString: stringArg(),
      skip: intArg(),
      take: intArg(),
    },
    resolve: (_parent: any, args: any, context: Context) => {
      // Build where conditions
      const searchConditions: any = {};

      // Search in name or description
      if (args.searchString) {
        searchConditions.OR = [
          { name: { contains: args.searchString, mode: "insensitive" } },
          { description: { contains: args.searchString, mode: "insensitive" } },
        ];
      }

      return context.prisma.category.findMany({
        where: searchConditions,
        orderBy: { name: "asc" },
        skip: args.skip || undefined,
        take: args.take || undefined,
      });
    },
  });

  t.field("category", {
    type: "Category",
    args: {
      id: intArg(),
    },
    resolve: (_parent: any, args: any, context: Context) => {
      if (!args.id) return null;

      return context.prisma.category.findUnique({
        where: { id: args.id },
      });
    },
  });

  t.nonNull.list.nonNull.field("allCategories", {
    type: "Category",
    resolve: async (_parent: any, _args: any, context: Context) => {
      return context.prisma.category.findMany({
        orderBy: { name: "asc" },
      });
    },
  });
};
