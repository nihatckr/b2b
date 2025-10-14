import { Context } from "../context";
import { requireAuth } from "../utils/user-role-helper";

export const libraryQueries = (t: any) => {
  // My Colors
  t.list.field("myColors", {
    type: "Color",
    resolve: async (_parent: unknown, _args: unknown, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.color.findMany({
        where: { companyId: user.companyId, isActive: true },
        orderBy: { name: "asc" },
      });
    },
  });

  // My Fabrics
  t.list.field("myFabrics", {
    type: "Fabric",
    resolve: async (_parent: unknown, _args: unknown, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.fabric.findMany({
        where: { companyId: user.companyId, isActive: true },
        orderBy: { name: "asc" },
      });
    },
  });

  // My Size Groups
  t.list.field("mySizeGroups", {
    type: "SizeGroup",
    resolve: async (_parent: unknown, _args: unknown, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.sizeGroup.findMany({
        where: { companyId: user.companyId, isActive: true },
        orderBy: { name: "asc" },
      });
    },
  });

  // Season Library Queries
  t.list.field("mySeasons", {
    type: "SeasonItem",
    resolve: async (_parent: any, _args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.seasonItem.findMany({
        where: { companyId: user.companyId },
        orderBy: [{ year: "desc" }, { type: "asc" }],
      });
    },
  });

  // Fit Library Queries
  t.list.field("myFits", {
    type: "FitItem",
    resolve: async (_parent: any, _args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.fitItem.findMany({
        where: { companyId: user.companyId, isActive: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      });
    },
  });

  // Certifications
  t.list.field("myCertifications", {
    type: "Certification",
    resolve: async (_parent: any, _args: any, context: Context) => {
      const userId = await requireAuth(context);
      // The subsequent code correctly fetches the user's companyId using this userId.
      // The original check `if (!user.companyId)` was incorrect as `user` was actually the userId (a number).

      const userWithCompanyId = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });

      if (!userWithCompanyId?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.certification.findMany({
        where: { companyId: userWithCompanyId.companyId, isActive: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      });
    },
  });
};
