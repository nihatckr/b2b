import { arg, intArg, stringArg } from "nexus";

import { Context } from '../context';
import { getUserId, requireAdmin, } from '../utils/user-role-helper';


export const userQueries = (t: any) => {
  t.nonNull.list.nonNull.field("allUsers", {
    type: "User",
    args: {
      searchString: stringArg(),
      role: arg({ type: "Role" }),
      skip: intArg(),
      take: intArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      // Only admin can access all users
      await requireAdmin(context);

      // Build where conditions
      const searchConditions: any = {};

      // Role filter
      if (args.role) {
        searchConditions.role = args.role;
      }

      // Search in name or email
      if (args.searchString) {
        searchConditions.OR = [
          { email: { contains: args.searchString, mode: "insensitive" } },
          { name: { contains: args.searchString, mode: "insensitive" } },
        ];
      }

      return context.prisma.user.findMany({
        where: searchConditions,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: args.skip || undefined,
        take: args.take || undefined,
      });
    },
  });

  // User statistics for admin dashboard
  t.field("userStats", {
    type: "UserStats",
    resolve: async (_parent: any, _args: any, context: Context) => {
      // Only admin can access user statistics
      await requireAdmin(context);

      const totalUsers = await context.prisma.user.count();
      const adminCount = await context.prisma.user.count({
        where: { role: "ADMIN" },
      });
      const manufactureCount = await context.prisma.user.count({
        where: { role: "MANUFACTURE" },
      });
      const customerCount = await context.prisma.user.count({
        where: { role: "CUSTOMER" },
      });

      return {
        totalUsers,
        adminCount,
        manufactureCount,
        customerCount,
      };
    },
  });

  t.field("me", {
    type: "User",
    resolve: async (parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) return null;

      return context.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    },
  });
};
