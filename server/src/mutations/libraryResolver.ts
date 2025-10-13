import { arg, booleanArg, intArg, nonNull, stringArg } from "nexus";
import { Context } from "../context";
import { getUserRole, requireAuth } from "../utils/user-role-helper";

export const libraryMutations = (t: any) => {
  // ========== COLOR MUTATIONS ==========

  t.field("createColor", {
    type: "Color",
    args: { input: nonNull("CreateColorInput") },
    resolve: async (_parent: unknown, { input }: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.color.create({
        data: {
          name: input.name,
          code: input.code || null,
          hexCode: input.hexCode || null,
          imageUrl: input.imageUrl || null,
          isActive: input.isActive !== undefined ? input.isActive : true,
          companyId: user.companyId,
        },
      });
    },
  });

  t.field("updateColor", {
    type: "Color",
    args: { input: nonNull("UpdateColorInput") },
    resolve: async (_parent: unknown, { input }: any, context: Context) => {
      const userId = requireAuth(context);

      const existing = await context.prisma.color.findUnique({
        where: { id: input.id },
      });

      if (!existing) throw new Error("Color not found");

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true, role: true },
      });

      if (user?.role !== "ADMIN" && existing.companyId !== user?.companyId) {
        throw new Error("Not authorized");
      }

      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.code !== undefined) updateData.code = input.code;
      if (input.hexCode !== undefined) updateData.hexCode = input.hexCode;
      if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      return context.prisma.color.update({
        where: { id: input.id },
        data: updateData,
      });
    },
  });

  t.field("deleteColor", {
    type: "Color",
    args: { id: nonNull(intArg()) },
    resolve: async (_parent: unknown, { id }: any, context: Context) => {
      const userId = requireAuth(context);

      const existing = await context.prisma.color.findUnique({
        where: { id },
      });

      if (!existing) throw new Error("Color not found");

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true, role: true },
      });

      if (user?.role !== "ADMIN" && existing.companyId !== user?.companyId) {
        throw new Error("Not authorized");
      }

      return context.prisma.color.delete({ where: { id } });
    },
  });

  // ========== FABRIC MUTATIONS ==========

  t.field("createFabric", {
    type: "Fabric",
    args: { input: nonNull("CreateFabricInput") },
    resolve: async (_parent: unknown, { input }: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.fabric.create({
        data: {
          name: input.name,
          code: input.code || null,
          composition: input.composition,
          weight: input.weight || null,
          width: input.width || null,
          supplier: input.supplier || null,
          price: input.price || null,
          minOrder: input.minOrder || null,
          leadTime: input.leadTime || null,
          imageUrl: input.imageUrl || null,
          description: input.description || null,
          isActive: input.isActive !== undefined ? input.isActive : true,
          companyId: user.companyId,
        },
      });
    },
  });

  t.field("updateFabric", {
    type: "Fabric",
    args: { input: nonNull("UpdateFabricInput") },
    resolve: async (_parent: unknown, { input }: any, context: Context) => {
      const userId = requireAuth(context);

      const existing = await context.prisma.fabric.findUnique({
        where: { id: input.id },
      });

      if (!existing) throw new Error("Fabric not found");

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true, role: true },
      });

      if (user?.role !== "ADMIN" && existing.companyId !== user?.companyId) {
        throw new Error("Not authorized");
      }

      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.code !== undefined) updateData.code = input.code;
      if (input.composition !== undefined)
        updateData.composition = input.composition;
      if (input.weight !== undefined) updateData.weight = input.weight;
      if (input.width !== undefined) updateData.width = input.width;
      if (input.supplier !== undefined) updateData.supplier = input.supplier;
      if (input.price !== undefined) updateData.price = input.price;
      if (input.minOrder !== undefined) updateData.minOrder = input.minOrder;
      if (input.leadTime !== undefined) updateData.leadTime = input.leadTime;
      if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      return context.prisma.fabric.update({
        where: { id: input.id },
        data: updateData,
      });
    },
  });

  t.field("deleteFabric", {
    type: "Fabric",
    args: { id: nonNull(intArg()) },
    resolve: async (_parent: unknown, { id }: any, context: Context) => {
      const userId = requireAuth(context);

      const existing = await context.prisma.fabric.findUnique({
        where: { id },
      });

      if (!existing) throw new Error("Fabric not found");

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true, role: true },
      });

      if (user?.role !== "ADMIN" && existing.companyId !== user?.companyId) {
        throw new Error("Not authorized");
      }

      return context.prisma.fabric.delete({ where: { id } });
    },
  });

  // ========== SIZE GROUP MUTATIONS ==========

  t.field("createSizeGroup", {
    type: "SizeGroup",
    args: { input: nonNull("CreateSizeGroupInput") },
    resolve: async (_parent: unknown, { input }: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.sizeGroup.create({
        data: {
          name: input.name,
          category: input.category || null,
          sizes: JSON.stringify(input.sizes),
          description: input.description || null,
          isActive: input.isActive !== undefined ? input.isActive : true,
          companyId: user.companyId,
        },
      });
    },
  });

  t.field("updateSizeGroup", {
    type: "SizeGroup",
    args: { input: nonNull("UpdateSizeGroupInput") },
    resolve: async (_parent: unknown, { input }: any, context: Context) => {
      const userId = requireAuth(context);

      const existing = await context.prisma.sizeGroup.findUnique({
        where: { id: input.id },
      });

      if (!existing) throw new Error("Size group not found");

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true, role: true },
      });

      if (user?.role !== "ADMIN" && existing.companyId !== user?.companyId) {
        throw new Error("Not authorized");
      }

      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.sizes !== undefined)
        updateData.sizes = JSON.stringify(input.sizes);
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      return context.prisma.sizeGroup.update({
        where: { id: input.id },
        data: updateData,
      });
    },
  });

  t.field("deleteSizeGroup", {
    type: "SizeGroup",
    args: { id: nonNull(intArg()) },
    resolve: async (_parent: unknown, { id }: any, context: Context) => {
      const userId = requireAuth(context);

      const existing = await context.prisma.sizeGroup.findUnique({
        where: { id },
      });

      if (!existing) throw new Error("Size group not found");

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true, role: true },
      });

      if (user?.role !== "ADMIN" && existing.companyId !== user?.companyId) {
        throw new Error("Not authorized");
      }

      return context.prisma.sizeGroup.delete({ where: { id } });
    },
  });

  // ========== SEASON MUTATIONS ==========

  t.field("createSeason", {
    type: "SeasonItem",
    args: {
      name: nonNull(stringArg()),
      fullName: nonNull(stringArg()),
      year: nonNull(intArg()),
      type: nonNull(stringArg()),
      startDate: arg({ type: "DateTime" }),
      endDate: arg({ type: "DateTime" }),
      description: stringArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.seasonItem.create({
        data: {
          name: args.name,
          fullName: args.fullName,
          year: args.year,
          type: args.type,
          startDate: args.startDate || undefined,
          endDate: args.endDate || undefined,
          description: args.description || undefined,
          companyId: user.companyId,
        },
      });
    },
  });

  t.field("updateSeason", {
    type: "SeasonItem",
    args: {
      id: nonNull(intArg()),
      name: stringArg(),
      fullName: stringArg(),
      year: intArg(),
      type: stringArg(),
      startDate: arg({ type: "DateTime" }),
      endDate: arg({ type: "DateTime" }),
      description: stringArg(),
      isActive: arg({ type: "Boolean" }),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      const season = await context.prisma.seasonItem.findUnique({
        where: { id: args.id },
      });

      if (!season || season.companyId !== user.companyId) {
        throw new Error("Season not found or unauthorized");
      }

      return context.prisma.seasonItem.update({
        where: { id: args.id },
        data: {
          ...(args.name && { name: args.name }),
          ...(args.fullName && { fullName: args.fullName }),
          ...(args.year && { year: args.year }),
          ...(args.type && { type: args.type }),
          ...(args.startDate !== undefined && { startDate: args.startDate }),
          ...(args.endDate !== undefined && { endDate: args.endDate }),
          ...(args.description !== undefined && {
            description: args.description,
          }),
          ...(args.isActive !== undefined && { isActive: args.isActive }),
        },
      });
    },
  });

  t.field("deleteSeason", {
    type: "SeasonItem",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      const season = await context.prisma.seasonItem.findUnique({
        where: { id: args.id },
      });

      if (!season || season.companyId !== user.companyId) {
        throw new Error("Season not found or unauthorized");
      }

      return context.prisma.seasonItem.delete({
        where: { id: args.id },
      });
    },
  });

  // ========== FIT MUTATIONS ==========

  t.field("createFit", {
    type: "FitItem",
    args: {
      name: nonNull(stringArg()),
      code: stringArg(),
      category: stringArg(),
      description: stringArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.fitItem.create({
        data: {
          name: args.name,
          code: args.code || undefined,
          category: args.category || undefined,
          description: args.description || undefined,
          companyId: user.companyId,
        },
      });
    },
  });

  t.field("updateFit", {
    type: "FitItem",
    args: {
      id: nonNull(intArg()),
      name: stringArg(),
      code: stringArg(),
      category: stringArg(),
      description: stringArg(),
      isActive: arg({ type: "Boolean" }),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      const fit = await context.prisma.fitItem.findUnique({
        where: { id: args.id },
      });

      if (!fit || fit.companyId !== user.companyId) {
        throw new Error("Fit not found or unauthorized");
      }

      return context.prisma.fitItem.update({
        where: { id: args.id },
        data: {
          ...(args.name && { name: args.name }),
          ...(args.code !== undefined && { code: args.code }),
          ...(args.category !== undefined && { category: args.category }),
          ...(args.description !== undefined && {
            description: args.description,
          }),
          ...(args.isActive !== undefined && { isActive: args.isActive }),
        },
      });
    },
  });

  t.field("deleteFit", {
    type: "FitItem",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      const fit = await context.prisma.fitItem.findUnique({
        where: { id: args.id },
      });

      if (!fit || fit.companyId !== user.companyId) {
        throw new Error("Fit not found or unauthorized");
      }

      return context.prisma.fitItem.delete({
        where: { id: args.id },
      });
    },
  });

  // ========================================
  // CERTIFICATION MANAGEMENT
  // ========================================

  t.field("createCertification", {
    type: "Certification",
    args: {
      name: nonNull(stringArg()),
      code: stringArg(),
      category: nonNull(arg({ type: "CertificationCategory" })),
      issuer: stringArg(),
      validFrom: arg({ type: "DateTime" }),
      validUntil: arg({ type: "DateTime" }),
      certificateNumber: stringArg(),
      certificateFile: stringArg(),
      description: stringArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }
      const role = getUserRole(user);
      const hasPermission =
        role === "COMPANY_OWNER" ||
        role === "ADMIN" ||
        (user.permissions as any)?.library;

      if (!hasPermission) {
        throw new Error("Permission denied: Library management required");
      }

      return context.prisma.certification.create({
        data: {
          name: args.name,
          code: args.code || undefined,
          category: args.category,
          issuer: args.issuer || undefined,
          validFrom: args.validFrom || undefined,
          validUntil: args.validUntil || undefined,
          certificateNumber: args.certificateNumber || undefined,
          certificateFile: args.certificateFile || undefined,
          description: args.description || undefined,
          companyId: user.companyId,
        },
      });
    },
  });

  t.field("updateCertification", {
    type: "Certification",
    args: {
      id: nonNull(intArg()),
      name: stringArg(),
      code: stringArg(),
      category: arg({ type: "CertificationCategory" }),
      issuer: stringArg(),
      validFrom: arg({ type: "DateTime" }),
      validUntil: arg({ type: "DateTime" }),
      certificateNumber: stringArg(),
      certificateFile: stringArg(),
      description: stringArg(),
      isActive: booleanArg(),
    },
    resolve: async (_: any, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      // Permission check
      const role = getUserRole(user);
      const hasPermission =
        role === "COMPANY_OWNER" ||
        role === "ADMIN" ||
        (user.permissions as any)?.library;

      if (!hasPermission) {
        throw new Error("Permission denied: Library management required");
      }

      // Verify ownership
      const cert = await context.prisma.certification.findUnique({
        where: { id: args.id },
      });

      if (!cert || cert.companyId !== user.companyId) {
        throw new Error("Certification not found or unauthorized");
      }

      return context.prisma.certification.update({
        where: { id: args.id },
        data: {
          ...(args.name && { name: args.name }),
          ...(args.code !== undefined && { code: args.code }),
          ...(args.category && { category: args.category }),
          ...(args.issuer !== undefined && { issuer: args.issuer }),
          ...(args.validFrom !== undefined && { validFrom: args.validFrom }),
          ...(args.validUntil !== undefined && { validUntil: args.validUntil }),
          ...(args.certificateNumber !== undefined && {
            certificateNumber: args.certificateNumber,
          }),
          ...(args.certificateFile !== undefined && {
            certificateFile: args.certificateFile,
          }),
          ...(args.description !== undefined && {
            description: args.description,
          }),
          ...(args.isActive !== undefined && { isActive: args.isActive }),
        },
      });
    },
  });

  t.field("deleteCertification", {
    type: "Certification",
    args: { id: nonNull(intArg()) },
    resolve: async (_: any, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      // Permission check
      const role = getUserRole(user);
      const hasPermission =
        role === "COMPANY_OWNER" ||
        role === "ADMIN" ||
        (user.permissions as any)?.library;

      if (!hasPermission) {
        throw new Error("Permission denied: Library management required");
      }

      // Verify ownership
      const cert = await context.prisma.certification.findUnique({
        where: { id: args.id },
      });

      if (!cert || cert.companyId !== user.companyId) {
        throw new Error("Certification not found or unauthorized");
      }

      return context.prisma.certification.delete({
        where: { id: args.id },
      });
    },
  });
};
