import builder from "../builder";

// ========== FIT MUTATIONS ==========

builder.mutationField("createFit", (t) =>
  t.prismaField({
    type: "FitItem",
    args: {
      name: t.arg.string({ required: true }),
      code: t.arg.string(),
      category: t.arg.string(),
      description: t.arg.string(),
      companyId: t.arg.int(),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const fit = await context.prisma.fitItem.create({
        ...query,
        data: {
          name: args.name,
          code: args.code || undefined,
          category: args.category || undefined,
          description: args.description || undefined,
          companyId: args.companyId || context.user.companyId || undefined,
        } as any,
      });

      return fit;
    },
  })
);

builder.mutationField("updateFit", (t) =>
  t.prismaField({
    type: "FitItem",
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      code: t.arg.string(),
      category: t.arg.string(),
      description: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const fit = await context.prisma.fitItem.findUnique({
        where: { id: args.id },
      });

      if (!fit) throw new Error("Fit not found");

      const updated = await context.prisma.fitItem.update({
        ...query,
        where: { id: args.id },
        data: {
          name: args.name || undefined,
          code: args.code || undefined,
          category: args.category || undefined,
          description: args.description || undefined,
        } as any,
      });

      return updated;
    },
  })
);

builder.mutationField("deleteFit", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      await context.prisma.fitItem.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);

// ========== SEASON MUTATIONS ==========

builder.mutationField("createSeason", (t) =>
  t.prismaField({
    type: "SeasonItem",
    args: {
      name: t.arg.string({ required: true }),
      fullName: t.arg.string({ required: true }),
      year: t.arg.int({ required: true }),
      type: t.arg.string(),
      startDate: t.arg.string(),
      endDate: t.arg.string(),
      description: t.arg.string(),
      companyId: t.arg.int(),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const season = await context.prisma.seasonItem.create({
        ...query,
        data: {
          name: args.name,
          fullName: args.fullName,
          year: args.year,
          type: args.type || undefined,
          startDate: args.startDate ? new Date(args.startDate) : undefined,
          endDate: args.endDate ? new Date(args.endDate) : undefined,
          description: args.description || undefined,
          companyId: args.companyId || context.user.companyId || undefined,
        } as any,
      });

      return season;
    },
  })
);

builder.mutationField("updateSeason", (t) =>
  t.prismaField({
    type: "SeasonItem",
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      fullName: t.arg.string(),
      year: t.arg.int(),
      type: t.arg.string(),
      startDate: t.arg.string(),
      endDate: t.arg.string(),
      description: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const season = await context.prisma.seasonItem.findUnique({
        where: { id: args.id },
      });

      if (!season) throw new Error("Season not found");

      const updated = await context.prisma.seasonItem.update({
        ...query,
        where: { id: args.id },
        data: {
          name: args.name || undefined,
          fullName: args.fullName || undefined,
          year: args.year || undefined,
          type: args.type || undefined,
          startDate: args.startDate ? new Date(args.startDate) : undefined,
          endDate: args.endDate ? new Date(args.endDate) : undefined,
          description: args.description || undefined,
        } as any,
      });

      return updated;
    },
  })
);

builder.mutationField("deleteSeason", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      await context.prisma.seasonItem.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);
