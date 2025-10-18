import builder from "../builder";

// ========== COLOR MUTATIONS ==========

builder.mutationField("createColor", (t) =>
  t.prismaField({
    args: {
      name: t.arg.string({ required: true }),
      code: t.arg.string({ required: true }),
      hexValue: t.arg.string(),
      category: t.arg.string(),
      companyId: t.arg.int(),
    },
    type: "Color",
    authScopes: { user: true },
    resolve: async (query, _root, args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const color = await context.prisma.color.create({
        ...query,
        data: {
          name: args.name,
          code: args.code,
          hexValue: args.hexValue || undefined,
          category: args.category || undefined,
          companyId: args.companyId || context.user.companyId || undefined,
        } as any,
      });

      return color;
    },
  })
);

builder.mutationField("updateColor", (t) =>
  t.prismaField({
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      code: t.arg.string(),
      hexValue: t.arg.string(),
      category: t.arg.string(),
    },
    type: "Color",
    authScopes: { user: true },
    resolve: async (query, _root, args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const color = await context.prisma.color.findUnique({
        where: { id: args.id },
      });

      if (!color) throw new Error("Color not found");

      const updated = await context.prisma.color.update({
        ...query,
        where: { id: args.id },
        data: {
          name: args.name || undefined,
          code: args.code || undefined,
          hexValue: args.hexValue || undefined,
          category: args.category || undefined,
        } as any,
      });

      return updated;
    },
  })
);

builder.mutationField("deleteColor", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      await context.prisma.color.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);

// ========== FABRIC MUTATIONS ==========

builder.mutationField("createFabric", (t) =>
  t.prismaField({
    args: {
      name: t.arg.string({ required: true }),
      type: t.arg.string({ required: true }),
      material: t.arg.string(),
      weight: t.arg.string(),
      careInstructions: t.arg.string(),
      companyId: t.arg.int(),
    },
    type: "Fabric",
    authScopes: { user: true },
    resolve: async (query, _root, args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const fabric = await context.prisma.fabric.create({
        ...query,
        data: {
          name: args.name,
          type: args.type,
          material: args.material || undefined,
          weight: args.weight || undefined,
          careInstructions: args.careInstructions || undefined,
          companyId: args.companyId || context.user.companyId || undefined,
        } as any,
      });

      return fabric;
    },
  })
);

builder.mutationField("updateFabric", (t) =>
  t.prismaField({
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      type: t.arg.string(),
      material: t.arg.string(),
      weight: t.arg.string(),
      careInstructions: t.arg.string(),
    },
    type: "Fabric",
    authScopes: { user: true },
    resolve: async (query, _root, args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const fabric = await context.prisma.fabric.findUnique({
        where: { id: args.id },
      });

      if (!fabric) throw new Error("Fabric not found");

      const updated = await context.prisma.fabric.update({
        ...query,
        where: { id: args.id },
        data: {
          name: args.name || undefined,
          type: args.type || undefined,
          material: args.material || undefined,
          weight: args.weight || undefined,
          careInstructions: args.careInstructions || undefined,
        } as any,
      });

      return updated;
    },
  })
);

builder.mutationField("deleteFabric", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      await context.prisma.fabric.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);

// ========== SIZE GROUP MUTATIONS ==========

builder.mutationField("createSizeGroup", (t) =>
  t.prismaField({
    args: {
      name: t.arg.string({ required: true }),
      sizes: t.arg.string({ required: true }),
      standard: t.arg.string(),
      companyId: t.arg.int(),
    },
    type: "SizeGroup",
    authScopes: { user: true },
    resolve: async (query, _root, args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const sizeGroup = await context.prisma.sizeGroup.create({
        ...query,
        data: {
          name: args.name,
          sizes: args.sizes,
          standard: args.standard || undefined,
          companyId: args.companyId || context.user.companyId || undefined,
        } as any,
      });

      return sizeGroup;
    },
  })
);

builder.mutationField("updateSizeGroup", (t) =>
  t.prismaField({
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      sizes: t.arg.string(),
      standard: t.arg.string(),
    },
    type: "SizeGroup",
    authScopes: { user: true },
    resolve: async (query, _root, args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const sizeGroup = await context.prisma.sizeGroup.findUnique({
        where: { id: args.id },
      });

      if (!sizeGroup) throw new Error("SizeGroup not found");

      const updated = await context.prisma.sizeGroup.update({
        ...query,
        where: { id: args.id },
        data: {
          name: args.name || undefined,
          sizes: args.sizes || undefined,
          standard: args.standard || undefined,
        } as any,
      });

      return updated;
    },
  })
);

builder.mutationField("deleteSizeGroup", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      await context.prisma.sizeGroup.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);

// ========== CERTIFICATION MUTATIONS ==========

builder.mutationField("createCertification", (t) =>
  t.prismaField({
    args: {
      name: t.arg.string({ required: true }),
      issuer: t.arg.string(),
      validFrom: t.arg.string(),
      validUntil: t.arg.string(),
      description: t.arg.string(),
      companyId: t.arg.int(),
    },
    type: "Certification",
    authScopes: { user: true },
    resolve: async (query, _root, args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const cert = await context.prisma.certification.create({
        ...query,
        data: {
          name: args.name,
          issuer: args.issuer || undefined,
          validFrom: args.validFrom ? new Date(args.validFrom) : undefined,
          validUntil: args.validUntil ? new Date(args.validUntil) : undefined,
          description: args.description || undefined,
          companyId: args.companyId || context.user.companyId || undefined,
        } as any,
      });

      return cert;
    },
  })
);

builder.mutationField("updateCertification", (t) =>
  t.prismaField({
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      issuer: t.arg.string(),
      validFrom: t.arg.string(),
      validUntil: t.arg.string(),
      description: t.arg.string(),
    },
    type: "Certification",
    authScopes: { user: true },
    resolve: async (query, _root, args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const cert = await context.prisma.certification.findUnique({
        where: { id: args.id },
      });

      if (!cert) throw new Error("Certification not found");

      const updated = await context.prisma.certification.update({
        ...query,
        where: { id: args.id },
        data: {
          name: args.name || undefined,
          issuer: args.issuer || undefined,
          validFrom: args.validFrom ? new Date(args.validFrom) : undefined,
          validUntil: args.validUntil ? new Date(args.validUntil) : undefined,
          description: args.description || undefined,
        } as any,
      });

      return updated;
    },
  })
);

builder.mutationField("deleteCertification", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      await context.prisma.certification.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);
