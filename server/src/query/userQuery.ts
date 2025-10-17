import { arg, intArg, stringArg } from "nexus";

import { Context } from "../context";
import { Role } from "../types/Enums";
import {
  getUserId,
  requireAdmin,
  requireAuth,
} from "../utils/user-role-helper";

export const userQueries = (t: any) => {
  t.nonNull.list.nonNull.field("allUsers", {
    type: "User",
    args: {
      searchString: stringArg(),
      role: arg({ type: Role }),
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
        include: {
          company: true,
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

  // Company employees - for company owners/managers
  t.nonNull.list.nonNull.field("myCompanyEmployees", {
    type: "User",
    resolve: async (_parent: any, _args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true, role: true, isCompanyOwner: true },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      // Return all users from the same company
      return context.prisma.user.findMany({
        where: {
          companyId: user.companyId,
        },
        include: {
          company: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
  });

  t.field("me", {
    type: "User",
    resolve: async (parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) return null;

      return context.prisma.user.findUnique({
        where: { id: userId },
        include: {
          company: true,
        },
      });
    },
  });

  // Get all manufacturers
  t.list.field("allManufacturers", {
    type: "User",
    resolve: async (_parent: unknown, _args: unknown, context: Context) => {
      requireAuth(context);

      return context.prisma.user.findMany({
        where: {
          isActive: true,
          role: "COMPANY_OWNER",
          company: {
            type: "MANUFACTURER",
            isActive: true,
          },
        },
        include: {
          company: true,
        },
        orderBy: { name: "asc" },
      });
    },
  });
};
