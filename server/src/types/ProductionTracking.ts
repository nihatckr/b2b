import { inputObjectType, objectType } from "nexus";

export const ProductionTracking = objectType({
  name: "ProductionTracking",
  definition(t) {
    t.nonNull.int("id");
    t.int("orderId");
    t.int("sampleId");
    t.nonNull.field("currentStage", { type: "ProductionStage" });
    t.nonNull.field("overallStatus", { type: "ProductionStatus" });
    t.nonNull.int("progress"); // 0-100%
    t.string("estimatedStartDate", {
      resolve: (parent) => parent.estimatedStartDate?.toISOString(),
    });
    t.string("estimatedEndDate", {
      resolve: (parent) => parent.estimatedEndDate?.toISOString(),
    });
    t.string("actualStartDate", {
      resolve: (parent) => parent.actualStartDate?.toISOString(),
    });
    t.string("actualEndDate", {
      resolve: (parent) => parent.actualEndDate?.toISOString(),
    });
    t.string("notes");
    t.int("companyId");
    t.int("sewingWorkshopId");
    t.int("packagingWorkshopId");
    t.nonNull.string("createdAt", {
      resolve: (parent) => parent.createdAt.toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent) => parent.updatedAt.toISOString(),
    });

    // Relations
    t.field("order", {
      type: "Order",
      resolve: async (parent, _args, context) => {
        if (!parent.orderId) return null;
        return context.prisma.order.findUnique({
          where: { id: parent.orderId },
        });
      },
    });

    t.field("sample", {
      type: "Sample",
      resolve: async (parent, _args, context) => {
        if (!parent.sampleId) return null;
        return context.prisma.sample.findUnique({
          where: { id: parent.sampleId },
        });
      },
    });

    t.list.field("stageUpdates", {
      type: "ProductionStageUpdate",
      resolve: async (parent, _args, context) => {
        return context.prisma.productionStageUpdate.findMany({
          where: { productionId: parent.id },
          orderBy: { createdAt: "asc" },
        });
      },
    });

    t.list.field("qualityControls", {
      type: "QualityControl",
      resolve: async (parent, _args, context) => {
        return context.prisma.qualityControl.findMany({
          where: { productionId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });
  },
});

export const ProductionStageUpdate = objectType({
  name: "ProductionStageUpdate",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.int("productionId");
    t.nonNull.field("stage", { type: "ProductionStage" });
    t.nonNull.field("status", { type: "StageStatus" });
    t.string("actualStartDate", {
      resolve: (parent) => parent.actualStartDate?.toISOString(),
    });
    t.string("actualEndDate", {
      resolve: (parent) => parent.actualEndDate?.toISOString(),
    });
    t.int("estimatedDays");
    t.string("notes");
    t.string("photos"); // JSON array
    t.nonNull.boolean("isRevision");
    t.nonNull.int("extraDays");
    t.nonNull.string("createdAt", {
      resolve: (parent) => parent.createdAt.toISOString(),
    });
  },
});

export const CreateProductionTrackingInput = inputObjectType({
  name: "CreateProductionTrackingInput",
  definition(t) {
    t.int("orderId");
    t.int("sampleId");
    t.int("companyId");
    t.string("notes");
  },
});

export const UpdateProductionStageInput = inputObjectType({
  name: "UpdateProductionStageInput",
  definition(t) {
    t.nonNull.int("productionId");
    t.nonNull.field("stage", { type: "ProductionStage" });
    t.nonNull.field("status", { type: "StageStatus" });
    t.int("estimatedDays");
    t.string("notes");
  },
});
