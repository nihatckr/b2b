import { DynamicTaskHelper } from "../../utils/dynamicTaskHelper";
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
        include: { order: true }, // Include order to get customer and manufacturer IDs
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

      // ✅ Create task for next stage
      if (nextStage !== "COMPLETED" && production.order) {
        console.log(
          `📦 Production stage completed: ${args.stage} → ${nextStage}`
        );

        const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);
        await dynamicTaskHelper.createTaskForProductionStage(
          production.id,
          nextStage,
          production.order.manufactureId,
          production.order.id
        );

        console.log(
          `✅ Task created for production stage: ${nextStage} (Order ID: ${production.order.id})`
        );
      } else if (nextStage === "COMPLETED") {
        console.log(
          `🎉 Production completed! All stages finished for Production ID: ${production.id}`
        );
      }

      return updated;
    },
  })
);

// Create Production Plan
builder.mutationField("createProductionPlan", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      orderId: t.arg.int({ required: true }),
      stagesJson: t.arg.string({ required: true }), // JSON string of stages
      estimatedStartDate: t.arg({ type: "DateTime", required: false }),
      notes: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      // Check if order exists and user has permission
      const order = await context.prisma.order.findUnique({
        where: { id: args.orderId },
        include: { collection: { include: { company: true } } },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Check if user is manufacturer (owner of the collection)
      if (order.collection.company?.id !== context.user.companyId) {
        throw new Error("Only the manufacturer can create production plans");
      }

      // Parse stages from JSON
      const stages = JSON.parse(args.stagesJson);

      // Calculate estimated end date
      const totalDays = stages.reduce(
        (sum: number, stage: any) => sum + stage.estimatedDays,
        0
      );
      const startDate = args.estimatedStartDate || new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + totalDays);

      // Create production tracking
      const productionTracking = await context.prisma.productionTracking.create(
        {
          ...query,
          data: {
            orderId: args.orderId,
            currentStage: "PLANNING",
            overallStatus: "IN_PROGRESS",
            progress: 0,
            estimatedStartDate: startDate,
            estimatedEndDate: endDate,
            notes: args.notes || null,
            customerApprovalStatus: "DRAFT", // Plan initially in draft state
            companyId: context.user.companyId || null,
            stageUpdates: {
              create: stages.map((stage: any) => {
                // Map Turkish stage names to enum values
                const stageMapping: Record<string, string> = {
                  "Kumaş Tedarik": "FABRIC",
                  Kesim: "CUTTING",
                  Dikim: "SEWING",
                  "Ütü ve Pres": "PRESSING",
                  "Kalite Kontrol": "QUALITY",
                  Paketleme: "PACKAGING",
                  "Sevkiyat Hazırlık": "SHIPPING",
                };

                const enumStage =
                  stageMapping[stage.name] ||
                  stage.name.toUpperCase().replace(/\s+/g, "_");

                return {
                  stage: enumStage,
                  status: "NOT_STARTED",
                  estimatedDays: stage.estimatedDays,
                  notes: stage.notes || null,
                };
              }),
            },
          },
        }
      );

      // Update order status
      await context.prisma.order.update({
        where: { id: args.orderId },
        data: {
          status: "QUOTE_SENT", // Send quote to customer for approval
          productionDays: totalDays,
        },
      });

      console.log(
        `✅ Production plan created for Order ID: ${args.orderId}, Total days: ${totalDays}`
      );

      return productionTracking;
    },
  })
);

// Update Production Plan
builder.mutationField("updateProductionPlan", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
      stagesJson: t.arg.string({ required: true }),
      notes: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      // Check if production exists and user has permission
      const existingProduction =
        await context.prisma.productionTracking.findUnique({
          where: { id: args.productionId },
          include: {
            order: {
              include: {
                collection: {
                  include: { company: true },
                },
              },
            },
          },
        });

      if (!existingProduction) {
        throw new Error("Production plan not found");
      }

      // Check if user is manufacturer (owner of the collection)
      if (
        existingProduction.order?.collection.company?.id !==
        context.user.companyId
      ) {
        throw new Error("Only the manufacturer can update production plans");
      }

      // Parse stages from JSON
      const stages = JSON.parse(args.stagesJson);

      // Calculate new estimated end date
      const totalDays = stages.reduce(
        (sum: number, stage: any) => sum + stage.estimatedDays,
        0
      );
      const startDate = existingProduction.estimatedStartDate || new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + totalDays);

      // Delete existing stage updates
      await context.prisma.productionStageUpdate.deleteMany({
        where: { productionId: args.productionId },
      });

      // Update production tracking
      const updatedProduction = await context.prisma.productionTracking.update({
        ...query,
        where: { id: args.productionId },
        data: {
          estimatedEndDate: endDate,
          notes: args.notes || null,
          revisionCount: { increment: 1 },
          customerApprovalStatus: "DRAFT", // Reset to draft after revision
          stageUpdates: {
            create: stages.map((stage: any) => {
              // Map Turkish stage names to enum values
              const stageMapping: Record<string, string> = {
                "Kumaş Tedarik": "FABRIC",
                Kesim: "CUTTING",
                Dikim: "SEWING",
                "Ütü ve Pres": "PRESSING",
                "Kalite Kontrol": "QUALITY",
                Paketleme: "PACKAGING",
                "Sevkiyat Hazırlık": "SHIPPING",
              };

              const enumStage =
                stageMapping[stage.name] ||
                stage.name.toUpperCase().replace(/\s+/g, "_");

              return {
                stage: enumStage,
                status: "NOT_STARTED",
                estimatedDays: stage.estimatedDays,
                notes: stage.notes || null,
              };
            }),
          },
        },
      });

      // Update order production days
      if (existingProduction.orderId) {
        await context.prisma.order.update({
          where: { id: existingProduction.orderId },
          data: { productionDays: totalDays },
        });
      }

      console.log(
        `✅ Production plan updated for Production ID: ${args.productionId}, Total days: ${totalDays}`
      );

      return updatedProduction;
    },
  })
);

// Send production plan to customer for approval
builder.mutationField("sendProductionPlanForApproval", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      // Update production plan status to PENDING approval
      const updatedProduction = await context.prisma.productionTracking.update({
        ...query,
        where: { id: args.productionId },
        data: {
          customerApprovalStatus: "PENDING",
        },
      });

      console.log(`📋 Production plan sent for approval: ${args.productionId}`);

      return updatedProduction;
    },
  })
);

// Customer approves or rejects production plan
builder.mutationField("respondToProductionPlan", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
      approved: t.arg.boolean({ required: true }),
      customerNote: t.arg.string(), // Optional customer feedback
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      const status = args.approved ? "APPROVED" : "REJECTED";

      const updatedProduction = await context.prisma.productionTracking.update({
        ...query,
        where: { id: args.productionId },
        data: {
          customerApprovalStatus: status,
          customerApprovedAt: args.approved ? new Date() : null,
          customerNote: args.customerNote || null,
          // If approved, start the production process
          currentStage: args.approved ? "FABRIC" : "PLANNING",
          overallStatus: args.approved
            ? ("IN_PROGRESS" as any)
            : ("BLOCKED" as any),
        },
      });

      console.log(
        `${args.approved ? "✅" : "❌"} Production plan ${status}: ${
          args.productionId
        }`
      );

      return updatedProduction;
    },
  })
);
