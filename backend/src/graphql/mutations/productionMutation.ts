import builder from "../builder";

// Revert Production Stage
builder.mutationField("revertProductionStage", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
      targetStage: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      const production = await context.prisma.productionTracking.findUnique({
        where: { id: args.productionId },
        include: { stageUpdates: { orderBy: { createdAt: "asc" } } },
      });

      if (!production) {
        throw new Error("Production not found");
      }

      const stageOrder = [
        "PLANNING",
        "FABRIC",
        "CUTTING",
        "SEWING",
        "QUALITY",
        "PACKAGING",
        "SHIPPING",
      ];
      const currentIndex = stageOrder.indexOf(
        production.currentStage as string
      );
      const targetIndex = stageOrder.indexOf(args.targetStage);

      if (targetIndex >= currentIndex) {
        throw new Error("Cannot revert to current or future stage");
      }

      const updatedProduction = await context.prisma.productionTracking.update({
        ...query,
        where: { id: args.productionId },
        data: {
          currentStage: args.targetStage as any,
          overallStatus: "IN_PROGRESS" as any,
          progress: Math.round(((targetIndex + 1) / stageOrder.length) * 100),
        },
      });

      const stagesToRevert = stageOrder.slice(targetIndex + 1);
      for (const stage of stagesToRevert) {
        await context.prisma.productionStageUpdate.updateMany({
          where: { productionId: args.productionId, stage: stage as any },
          data: {
            status: "NOT_STARTED" as any,
            actualStartDate: null,
            actualEndDate: null,
          },
        });
      }

      await context.prisma.productionStageUpdate.updateMany({
        where: {
          productionId: args.productionId,
          stage: args.targetStage as any,
        },
        data: { status: "IN_PROGRESS" as any, actualEndDate: null },
      });

      return updatedProduction;
    },
  })
);

// Update Production Stage
builder.mutationField("updateProductionStage", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
      stage: t.arg.string({ required: true }),
      notes: t.arg.string(),
      status: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      const production = await context.prisma.productionTracking.findUnique({
        where: { id: args.productionId },
      });

      if (!production) {
        throw new Error("Production not found");
      }

      const updated = await context.prisma.productionTracking.update({
        ...query,
        where: { id: args.productionId },
        data: {
          notes: args.notes || undefined,
          actualStartDate: new Date(),
          actualEndDate: args.status === "COMPLETED" ? new Date() : null,
        } as any,
      });

      return updated;
    },
  })
);

// Add Production Stage Update
builder.mutationField("addProductionStageUpdate", (t) =>
  t.prismaField({
    type: "ProductionStageUpdate",
    args: {
      productionId: t.arg.int({ required: true }),
      stage: t.arg.string({ required: true }),
      notes: t.arg.string(),
      photos: t.arg.string(),
      hasDelay: t.arg.boolean({ required: true }),
      delayReason: t.arg.string(),
      extraDays: t.arg.int(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      const stageUpdate = await context.prisma.productionStageUpdate.create({
        ...query,
        data: {
          productionId: args.productionId,
          stage: args.stage as any,
          notes: args.notes || undefined,
          photos: args.photos || undefined,
          isRevision: args.hasDelay,
          delayReason: args.delayReason || undefined,
          extraDays: args.extraDays || 0,
          status: "IN_PROGRESS" as any,
        } as any,
      });

      return stageUpdate;
    },
  })
);

// Complete Production Stage
builder.mutationField("completeProductionStage", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
      stage: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      const production = await context.prisma.productionTracking.findUnique({
        where: { id: args.productionId },
      });

      if (!production) {
        throw new Error("Production not found");
      }

      const stageOrder = [
        "PLANNING",
        "FABRIC",
        "CUTTING",
        "SEWING",
        "QUALITY",
        "PACKAGING",
        "SHIPPING",
      ];
      const currentIndex = stageOrder.indexOf(args.stage);
      const nextStage = stageOrder[currentIndex + 1] || "COMPLETED";

      const updated = await context.prisma.productionTracking.update({
        ...query,
        where: { id: args.productionId },
        data: {
          currentStage: (nextStage === "COMPLETED"
            ? "SHIPPING"
            : nextStage) as any,
          progress: Math.round(((currentIndex + 2) / stageOrder.length) * 100),
          actualEndDate: nextStage === "COMPLETED" ? new Date() : null,
        },
      });

      await context.prisma.productionStageUpdate.updateMany({
        where: { productionId: args.productionId, stage: args.stage as any },
        data: { status: "COMPLETED" as any, actualEndDate: new Date() },
      });

      return updated;
    },
  })
);
