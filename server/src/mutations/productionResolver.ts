import { nonNull } from "nexus";
import { Context } from "../context";
import { requirePermission } from "../utils/permissions";
import { getUserRole, requireAuth } from "../utils/user-role-helper";

export const productionMutations = (t: any) => {
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
};
