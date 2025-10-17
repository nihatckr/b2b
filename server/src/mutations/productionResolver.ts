import { intArg, nonNull } from "nexus";
import { Context } from "../context";
import { requirePermission } from "../utils/permissions";
import { getUserRole, requireAuth } from "../utils/user-role-helper";

export const productionMutations = (t: any) => {
  // Revert stage to previous stage
  t.field("revertProductionStage", {
    type: "ProductionTracking",
    args: {
      productionId: intArg(),
      targetStage: "ProductionStage",
    },
    resolve: async (_parent: unknown, args: any, context: Context) => {
      requireAuth(context);

      const { productionId, targetStage } = args;

      // Get current production tracking
      const production = await context.prisma.productionTracking.findUnique({
        where: { id: productionId },
        include: {
          stageUpdates: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!production) {
        throw new Error("Production tracking not found");
      }

      const stageOrder = ["PLANNING", "FABRIC", "CUTTING", "SEWING", "QUALITY", "PACKAGING", "SHIPPING"];
      const currentIndex = stageOrder.indexOf(production.currentStage);
      const targetIndex = stageOrder.indexOf(targetStage);

      if (targetIndex >= currentIndex) {
        throw new Error("Cannot revert to current or future stage");
      }

      // Update current stage to target stage
      const updatedProduction = await context.prisma.productionTracking.update({
        where: { id: productionId },
        data: {
          currentStage: targetStage,
          overallStatus: "IN_PROGRESS", // Always set to IN_PROGRESS when reverting
          progress: Math.round(((targetIndex + 1) / stageOrder.length) * 100),
        },
      });

      // Mark all stages after target as NOT_STARTED
      const stagesToRevert = stageOrder.slice(targetIndex + 1);
      for (const stage of stagesToRevert) {
        await context.prisma.productionStageUpdate.updateMany({
          where: {
            productionId: productionId,
            stage: stage as any, // Type assertion for enum
          },
          data: {
            status: "NOT_STARTED",
            actualStartDate: null,
            actualEndDate: null,
          },
        });
      }

      // Mark target stage as IN_PROGRESS
      await context.prisma.productionStageUpdate.updateMany({
        where: {
          productionId: productionId,
          stage: targetStage,
        },
        data: {
          status: "IN_PROGRESS",
          actualEndDate: null, // Remove completion date
        },
      });

      return updatedProduction;
    },
  });
  // Update Production Stage
  t.field("updateProductionStage", {
    type: "ProductionTracking",
    args: {
      input: nonNull("UpdateProductionStageInput"),
    },
    resolve: async (
      _parent: unknown,
      { input }: { input: any },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      // Permission check
      if (userRole !== "ADMIN") {
        requirePermission(user, "production", "updateStages");
      }

      const production = await context.prisma.productionTracking.findUnique({
        where: { id: input.productionId },
      });

      if (!production) {
        throw new Error("Production tracking not found");
      }

      // Update production current stage
      const updatedProduction = await context.prisma.productionTracking.update({
        where: { id: input.productionId },
        data: {
          currentStage: input.stage,
        },
      });

      // Create stage update record
      await context.prisma.productionStageUpdate.create({
        data: {
          productionId: input.productionId,
          stage: input.stage,
          status: input.status,
          estimatedDays: input.estimatedDays || null,
          notes: input.notes || null,
          actualStartDate: input.status === "IN_PROGRESS" ? new Date() : null,
          actualEndDate: input.status === "COMPLETED" ? new Date() : null,
        },
      });

      return updatedProduction;
    },
  });

  // Add Production Stage Update (user updates with photos)
  t.field("addProductionStageUpdate", {
    type: "ProductionStageUpdate",
    args: {
      productionId: nonNull("Int"),
      stage: nonNull("ProductionStage"),
      notes: "String",
      photos: "String", // JSON array
      hasDelay: nonNull("Boolean"),
      delayReason: "String",
      extraDays: "Int",
    },
    resolve: async (
      _parent: unknown,
      args: any,
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      // Permission check
      if (userRole !== "ADMIN") {
        requirePermission(user, "production", "updateStages");
      }

      // Create stage update
      const stageUpdate = await context.prisma.productionStageUpdate.create({
        data: {
          productionId: args.productionId,
          stage: args.stage,
          status: "IN_PROGRESS",
          notes: args.notes || null,
          photos: args.photos || null,
          isRevision: args.hasDelay,
          delayReason: args.delayReason || null,
          extraDays: args.extraDays || 0,
        },
      });

      // If delay, update estimated end date
      if (args.hasDelay && args.extraDays) {
        const production = await context.prisma.productionTracking.findUnique({
          where: { id: args.productionId },
        });

        if (production && production.estimatedEndDate) {
          const newEndDate = new Date(production.estimatedEndDate);
          newEndDate.setDate(newEndDate.getDate() + args.extraDays);

          await context.prisma.productionTracking.update({
            where: { id: args.productionId },
            data: {
              estimatedEndDate: newEndDate,
              overallStatus: "WAITING", // Set to WAITING when delayed
            },
          });
        }
      }

      return stageUpdate;
    },
  });

  // Complete Production Stage
  t.field("completeProductionStage", {
    type: "ProductionTracking",
    args: {
      productionId: nonNull("Int"),
      stage: nonNull("ProductionStage"),
    },
    resolve: async (
      _parent: unknown,
      args: any,
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      // Permission check
      if (userRole !== "ADMIN") {
        requirePermission(user, "production", "updateStages");
      }

      // Get production tracking to validate current stage
      const production = await context.prisma.productionTracking.findUnique({
        where: { id: args.productionId },
      });

      if (!production) {
        throw new Error("Production tracking not found");
      }

      // Validate that the requested stage is the current stage
      if (production.currentStage !== args.stage) {
        throw new Error(
          `Cannot complete ${args.stage}. Current stage is ${production.currentStage}`
        );
      }

      // Mark current stage as completed
      await context.prisma.productionStageUpdate.updateMany({
        where: {
          productionId: args.productionId,
          stage: args.stage,
        },
        data: {
          status: "COMPLETED",
          actualEndDate: new Date(),
        },
      });

      // Get next stage
      const stageOrder = ["PLANNING", "FABRIC", "CUTTING", "SEWING", "QUALITY", "PACKAGING", "SHIPPING"];
      const currentIndex = stageOrder.indexOf(args.stage);
      const nextStage = stageOrder[currentIndex + 1];

      // Update production tracking
      const updatedProduction = await context.prisma.productionTracking.update({
        where: { id: args.productionId },
        data: {
          currentStage: nextStage || args.stage,
          progress: nextStage
            ? Math.round(((currentIndex + 1) / stageOrder.length) * 100)
            : 100,
          overallStatus: nextStage ? "IN_PROGRESS" : "COMPLETED",
        },
      });

      // If next stage exists, create IN_PROGRESS record
      if (nextStage) {
        await context.prisma.productionStageUpdate.create({
          data: {
            productionId: args.productionId,
            stage: nextStage as any, // Type assertion for enum
            status: "IN_PROGRESS",
            actualStartDate: new Date(),
          },
        });
      }

      return updatedProduction;
    },
  });
};
