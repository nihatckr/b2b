import { intArg, nonNull } from "nexus";
import { Context } from "../context";
import { createNotification } from "../utils/notificationHelper";
import { isBuyer, requirePermission } from "../utils/permissions";
import { TaskHelper } from "../utils/taskHelper";
import { getUserRole, requireAuth } from "../utils/user-role-helper";

export const sampleMutations = (t: any) => {
  // Create Sample Request
  t.field("createSample", {
    type: "Sample",
    args: {
      input: nonNull("CreateSampleInput"),
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

      // Permission check: Admin, customers/buyers can create sample requests
      if (userRole !== "ADMIN") {
        // Check if user has permission or is from a buyer company
        if (!isBuyer(user)) {
          requirePermission(user, "samples", "create");
        }
      }

      // Validate collection exists if provided
      if (input.collectionId) {
        const collection = await context.prisma.collection.findUnique({
          where: { id: input.collectionId },
        });

        if (!collection) {
          throw new Error("Collection not found");
        }
      }

      // For REVISION type, originalCollectionId is required
      if (input.sampleType === "REVISION" && !input.originalCollectionId) {
        throw new Error("Original collection ID is required for REVISION type");
      }

      // Validate original collection if provided
      if (input.originalCollectionId) {
        const originalCollection = await context.prisma.collection.findUnique({
          where: { id: input.originalCollectionId },
        });

        if (!originalCollection) {
          throw new Error("Original collection not found");
        }
      }

      // Determine manufacture and company
      let manufactureId = input.manufactureId;
      let companyId = input.companyId;

      // If collection is provided, use its author as manufacture
      if (input.collectionId && !manufactureId) {
        const collection = await context.prisma.collection.findUnique({
          where: { id: input.collectionId },
          include: { author: true, company: true },
        });

        if (collection?.authorId) {
          manufactureId = collection.authorId;
          companyId = collection.companyId || undefined;
        }
      }

      // If still no manufacture, throw error
      if (!manufactureId) {
        throw new Error(
          "Manufacturer must be specified or collection must have an author"
        );
      }

      // Generate unique sample number
      const timestamp = Date.now();
      const sampleNumber = `SMPL-${timestamp}`;

      // Create sample with PENDING_APPROVAL status
      const sample = await context.prisma.sample.create({
        data: {
          sampleNumber,
          sampleType: input.sampleType,
          status: "PENDING_APPROVAL",
          customerNote: input.customerNote || null,
          customDesignImages: input.customDesignImages
            ? JSON.stringify(input.customDesignImages)
            : null,
          revisionRequests: input.revisionRequests || null,
          deliveryAddress: input.deliveryAddress || null,
          collectionId: input.collectionId || null,
          originalCollectionId: input.originalCollectionId || null,
          customerId: userId,
          manufactureId,
          companyId: companyId || null,
          // AI Generated sample fields
          aiGenerated: input.aiGenerated || false,
          aiSketchUrl: input.aiSketchUrl || null,
          images: input.images ? JSON.stringify(input.images) : null,
          // Create AI Analysis if provided
          ...(input.aiAnalysis && {
            aiAnalysis: {
              create: {
                detectedProduct: input.aiAnalysis.detectedProduct || null,
                detectedColor: input.aiAnalysis.detectedColor || null,
                detectedFabric: input.aiAnalysis.detectedFabric || null,
                detectedPattern: input.aiAnalysis.detectedPattern || null,
                detectedGender: input.aiAnalysis.detectedGender || null,
                detectedClassification:
                  input.aiAnalysis.detectedClassification || null,
                detectedAccessories:
                  input.aiAnalysis.detectedAccessories || null,
                technicalDescription:
                  input.aiAnalysis.technicalDescription || null,
                qualityAnalysis: input.aiAnalysis.qualityAnalysis || null,
                qualityScore: input.aiAnalysis.qualityScore || null,
                costAnalysis: input.aiAnalysis.costAnalysis || null,
                estimatedCostMin: input.aiAnalysis.estimatedCostMin || null,
                estimatedCostMax: input.aiAnalysis.estimatedCostMax || null,
                suggestedMinOrder: input.aiAnalysis.suggestedMinOrder || null,
                trendAnalysis: input.aiAnalysis.trendAnalysis || null,
                trendScore: input.aiAnalysis.trendScore || null,
                targetMarket: input.aiAnalysis.targetMarket || null,
                salesPotential: input.aiAnalysis.salesPotential || null,
                designSuggestions: input.aiAnalysis.designSuggestions || null,
                designStyle: input.aiAnalysis.designStyle || null,
                designFocus: input.aiAnalysis.designFocus || null,
              },
            },
          }),
        },
        include: {
          collection: true,
          originalCollection: true,
          customer: true,
          manufacture: true,
          company: true,
          aiAnalysis: true,
        },
      });

      // Create initial production history
      await context.prisma.sampleProduction.create({
        data: {
          sampleId: sample.id,
          status: "PENDING_APPROVAL",
          note: "Sample request created, awaiting manufacturer approval",
          updatedById: userId,
        },
      });

      // Send notification to manufacturer
      await createNotification(context.prisma, {
        type: "SAMPLE",
        title: "🎨 New Sample Request",
        message: `You have received a new sample request #${sampleNumber}${
          input.collectionId ? " for a collection" : ""
        }. Please review and respond.`,
        userId: manufactureId,
        link: `/dashboard/samples/${sample.id}`,
        sampleId: sample.id,
      });

      // Create tasks automatically for sample workflow
      const taskHelper = new TaskHelper(context.prisma);
      await taskHelper.createSampleRequestTasks(
        sample.id,
        userId,
        manufactureId,
        input.collectionId || 0
      );

      // Also notify company members if exists
      if (companyId) {
        const companyMembers = await context.prisma.user.findMany({
          where: {
            companyId: companyId,
            role: { in: ["COMPANY_OWNER", "COMPANY_EMPLOYEE"] },
            id: { not: manufactureId },
          },
          select: { id: true },
        });

        for (const member of companyMembers) {
          await createNotification(context.prisma, {
            type: "SAMPLE",
            title: "🎨 New Sample Request",
            message: `Your company received a new sample request #${sampleNumber}.`,
            userId: member.id,
            link: `/dashboard/samples/${sample.id}`,
            sampleId: sample.id,
          });
        }
      }

      return sample;
    },
  });

  // Update Sample
  t.field("updateSample", {
    type: "Sample",
    args: {
      input: nonNull("UpdateSampleInput"),
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

      // Find existing sample
      const existingSample = await context.prisma.sample.findUnique({
        where: { id: input.id },
      });

      if (!existingSample) {
        throw new Error("Sample not found");
      }

      // Permission check
      const isCustomer = existingSample.customerId === userId;
      const isManufacture = existingSample.manufactureId === userId;
      const isAdmin = userRole === "ADMIN";

      if (!isCustomer && !isManufacture && !isAdmin) {
        throw new Error("Not authorized to update this sample");
      }

      // Prepare update data
      const updateData: any = {};

      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.manufactureId !== undefined)
        updateData.manufactureId = input.manufactureId;
      if (input.customerNote !== undefined)
        updateData.customerNote = input.customerNote;
      if (input.manufacturerResponse !== undefined)
        updateData.manufacturerResponse = input.manufacturerResponse;
      if (input.productionDays !== undefined)
        updateData.productionDays = input.productionDays;
      if (input.estimatedProductionDate !== undefined)
        updateData.estimatedProductionDate = input.estimatedProductionDate;
      if (input.actualProductionDate !== undefined)
        updateData.actualProductionDate = input.actualProductionDate;
      if (input.shippingDate !== undefined)
        updateData.shippingDate = input.shippingDate;
      if (input.cargoTrackingNumber !== undefined)
        updateData.cargoTrackingNumber = input.cargoTrackingNumber;
      if (input.deliveryAddress !== undefined)
        updateData.deliveryAddress = input.deliveryAddress;

      // Update sample
      const sample = await context.prisma.sample.update({
        where: { id: input.id },
        data: updateData,
        include: {
          collection: true,
          originalCollection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
      });

      return sample;
    },
  });

  // Update Sample Status (with production history tracking)
  t.field("updateSampleStatus", {
    type: "Sample",
    args: {
      input: nonNull("UpdateSampleStatusInput"),
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

      // Find existing sample
      const existingSample = await context.prisma.sample.findUnique({
        where: { id: input.id },
      });

      if (!existingSample) {
        throw new Error("Sample not found");
      }

      // Permission check: Admin or manufacturer with updateStatus permission
      const isManufacture = existingSample.manufactureId === userId;
      const isAdmin = userRole === "ADMIN";

      if (!isAdmin) {
        if (!isManufacture) {
          throw new Error(
            "Only assigned manufacturer can update sample status"
          );
        }
        requirePermission(user, "samples", "updateStatus");
      }

      // Calculate estimated production date if production days provided
      let estimatedProductionDate = existingSample.estimatedProductionDate;
      if (input.estimatedDays && input.status === "QUOTE_SENT") {
        estimatedProductionDate = new Date();
        estimatedProductionDate.setDate(
          estimatedProductionDate.getDate() + input.estimatedDays
        );
      }

      // Update sample status
      const sample = await context.prisma.sample.update({
        where: { id: input.id },
        data: {
          status: input.status,
          productionDays: input.estimatedDays || existingSample.productionDays,
          estimatedProductionDate:
            estimatedProductionDate || existingSample.estimatedProductionDate,
          // Set actual production date when completed
          actualProductionDate:
            input.status === "PRODUCTION_COMPLETE"
              ? new Date()
              : existingSample.actualProductionDate,
        },
        include: {
          collection: true,
          originalCollection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
      });

      // Create production history entry
      await context.prisma.sampleProduction.create({
        data: {
          sampleId: sample.id,
          status: input.status,
          note: input.note || `Status updated to ${input.status}`,
          estimatedDays: input.estimatedDays || null,
          actualDate: new Date(),
          updatedById: userId,
        },
      });

      // Auto-create Production Tracking when sample goes to IN_PRODUCTION
      if (input.status === "IN_PRODUCTION") {
        const existingTracking =
          await context.prisma.productionTracking.findFirst({
            where: { sampleId: sample.id },
          });

        if (!existingTracking) {
          // Get collection for production schedule (if sample linked to collection)
          let productionSchedule = null;
          let totalDays = sample.productionDays || 15; // Default 15 days for samples

          if (sample.collectionId) {
            const sampleWithCollection = await context.prisma.sample.findUnique(
              {
                where: { id: sample.id },
                include: { collection: true },
              }
            );

            if (sampleWithCollection?.collection?.productionSchedule) {
              productionSchedule =
                sampleWithCollection.collection.productionSchedule;
              const schedule =
                typeof productionSchedule === "string"
                  ? JSON.parse(productionSchedule)
                  : productionSchedule;
              // For samples, use shorter times (50% of collection schedule)
              totalDays = Math.ceil(
                Object.values(schedule as Record<string, number>).reduce(
                  (sum: number, days: number) => sum + days,
                  0
                ) / 2
              );
            }
          }

          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + totalDays);

          // Create production tracking for sample
          const productionTracking =
            await context.prisma.productionTracking.create({
              data: {
                sampleId: sample.id,
                currentStage: "PLANNING",
                overallStatus: "IN_PROGRESS",
                progress: 0,
                estimatedStartDate: startDate,
                estimatedEndDate: endDate,
                actualStartDate: startDate,
                notes: "Sample production tracking auto-created",
                companyId: sample.companyId || undefined,
              },
            });

          // Create stage updates from production schedule or default stages
          if (productionSchedule) {
            const schedule =
              typeof productionSchedule === "string"
                ? JSON.parse(productionSchedule)
                : productionSchedule;

            const stages = [
              "PLANNING",
              "FABRIC",
              "CUTTING",
              "SEWING",
              "QUALITY",
              "PACKAGING",
              "SHIPPING",
            ];

            for (const stage of stages) {
              const estimatedDays = Math.ceil(
                ((schedule as any)[stage] || 0) / 2
              ); // 50% faster for samples
              if (estimatedDays > 0) {
                await context.prisma.productionStageUpdate.create({
                  data: {
                    productionId: productionTracking.id,
                    stage: stage as any,
                    status:
                      stage === "PLANNING" ? "IN_PROGRESS" : "NOT_STARTED",
                    estimatedDays,
                    notes:
                      stage === "PLANNING"
                        ? `Sample production started`
                        : `Estimated: ${estimatedDays} days`,
                  },
                });
              }
            }
          } else {
            // Default simple stages for custom samples
            const defaultStages = [
              { stage: "PLANNING", days: 2 },
              { stage: "FABRIC", days: 2 },
              { stage: "SEWING", days: 5 },
              { stage: "QUALITY", days: 1 },
              { stage: "SHIPPING", days: 1 },
            ];

            for (const { stage, days } of defaultStages) {
              await context.prisma.productionStageUpdate.create({
                data: {
                  productionId: productionTracking.id,
                  stage: stage as any,
                  status: stage === "PLANNING" ? "IN_PROGRESS" : "NOT_STARTED",
                  estimatedDays: days,
                  notes:
                    stage === "PLANNING"
                      ? `Sample production started`
                      : `Estimated: ${days} days`,
                },
              });
            }
          }
        }
      }

      // AUTO-CREATE TASKS based on status change
      // Get collection owner (customer) - Collection has userId, not customerId
      let customerId: number | null = sample.customerId;

      // Task creation based on sample status transitions
      if (
        input.status === "PATTERN_READY" &&
        sample.status !== "PATTERN_READY"
      ) {
        // Sample approved and ready for pattern - Create approval task for customer
        if (customerId) {
          await context.prisma.task.create({
            data: {
              title: `Approve Sample Pattern - ${sample.sampleNumber}`,
              description: `Sample ${sample.sampleNumber} pattern is ready. Please review and approve to proceed with production.`,
              status: "TODO" as any,
              priority: "HIGH" as any,
              type: "APPROVE_SAMPLE" as any,
              assignedToId: customerId,
              userId: userId,
              sampleId: sample.id,
              collectionId: sample.collectionId || undefined,
              dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // 3 days
              notes: `Auto-created when sample pattern is ready for approval`,
            },
          });
        }
      }

      if (
        input.status === "IN_PRODUCTION" &&
        sample.status !== "IN_PRODUCTION"
      ) {
        // Sample production started - Create task for manufacturer
        if (sample.manufactureId) {
          await context.prisma.task.create({
            data: {
              title: `Start Sample Production - ${sample.sampleNumber}`,
              description: `Begin production for sample ${
                sample.sampleNumber
              }. Production days: ${
                input.estimatedDays || sample.productionDays || 15
              }`,
              status: "TODO" as any,
              priority: "HIGH" as any,
              type: "SAMPLE_PRODUCTION" as any,
              assignedToId: sample.manufactureId,
              userId: userId,
              sampleId: sample.id,
              collectionId: sample.collectionId || undefined,
              dueDate: new Date(
                Date.now() +
                  (input.estimatedDays || sample.productionDays || 15) *
                    24 *
                    60 *
                    60 *
                    1000
              ),
              notes: `Auto-created when sample production starts`,
            },
          });
        }
      }

      if (input.status === "REJECTED" && sample.status !== "REJECTED") {
        // Sample rejected - Create revision task for manufacturer
        if (sample.manufactureId) {
          await context.prisma.task.create({
            data: {
              title: `Revise Sample - ${sample.sampleNumber}`,
              description: `Sample ${sample.sampleNumber} was rejected. Please revise and resubmit for inspection.`,
              status: "TODO" as any,
              priority: "HIGH" as any,
              type: "REVISION_REQUEST" as any,
              assignedToId: sample.manufactureId,
              userId: userId,
              sampleId: sample.id,
              collectionId: sample.collectionId || undefined,
              dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days for revision
              notes: `Auto-created when sample is rejected - unlimited revisions allowed`,
            },
          });
        }
      }

      // Auto-complete related tasks when sample status changes to completion statuses
      const taskHelper = new TaskHelper(context.prisma);
      if (
        input.status === "APPROVED" ||
        input.status === "COMPLETED" ||
        input.status === "CANCELLED"
      ) {
        await taskHelper.completeRelatedTasks(sample.id, undefined);
      }

      return sample;
    },
  });

  // Approve Sample Request (Manufacturer only)
  t.field("approveSample", {
    type: "Sample",
    args: {
      id: nonNull(intArg()),
      approve: nonNull("Boolean"),
      manufacturerNote: "String",
      estimatedDays: intArg(),
    },
    resolve: async (
      _parent: unknown,
      {
        id,
        approve,
        manufacturerNote,
        estimatedDays,
      }: {
        id: number;
        approve: boolean;
        manufacturerNote?: string;
        estimatedDays?: number;
      },
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

      // Find existing sample
      const existingSample = await context.prisma.sample.findUnique({
        where: { id },
      });

      if (!existingSample) {
        throw new Error("Sample not found");
      }

      // Permission check: Only assigned manufacturer or admin can approve
      const isManufacture = existingSample.manufactureId === userId;
      const isAdmin = userRole === "ADMIN";

      if (!isAdmin && !isManufacture) {
        throw new Error(
          "Only the assigned manufacturer can approve this sample request"
        );
      }

      // Check if sample is in PENDING_APPROVAL status
      if (existingSample.status !== "PENDING_APPROVAL") {
        throw new Error("Sample is not in pending approval status");
      }

      // Calculate estimated production date if days provided
      let estimatedProductionDate = null;
      if (approve && estimatedDays) {
        estimatedProductionDate = new Date();
        estimatedProductionDate.setDate(
          estimatedProductionDate.getDate() + estimatedDays
        );
      }

      // Update sample
      const newStatus = approve ? "REQUESTED" : "REJECTED";
      const sample = await context.prisma.sample.update({
        where: { id },
        data: {
          status: newStatus,
          manufacturerResponse: manufacturerNote || null,
          productionDays: estimatedDays || null,
          estimatedProductionDate: estimatedProductionDate,
        },
        include: {
          collection: true,
          originalCollection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
      });

      // Create production history entry
      await context.prisma.sampleProduction.create({
        data: {
          sampleId: sample.id,
          status: newStatus,
          note: approve
            ? `Sample request approved by manufacturer${
                manufacturerNote ? ": " + manufacturerNote : ""
              }`
            : `Sample request rejected by manufacturer${
                manufacturerNote ? ": " + manufacturerNote : ""
              }`,
          estimatedDays: estimatedDays || null,
          actualDate: new Date(),
          updatedById: userId,
        },
      });

      // AUTO-CREATE TASK when manufacturer responds to sample request
      if (sample.customerId) {
        if (approve) {
          // Sample approved by manufacturer - Create task for customer to review pattern
          await context.prisma.task.create({
            data: {
              title: `Sample Ready for Review - ${sample.sampleNumber}`,
              description: `Manufacturer approved your sample request. The sample is ready for your review and approval before production.`,
              status: "TODO" as any,
              priority: "HIGH" as any,
              type: "APPROVE_SAMPLE" as any,
              assignedToId: sample.customerId,
              userId: userId,
              sampleId: sample.id,
              collectionId: sample.collectionId || undefined,
              dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // 3 days
              notes: `Auto-created when manufacturer approved sample request`,
            },
          });
        } else {
          // Sample rejected by manufacturer - Create task for customer (with note reason)
          await context.prisma.task.create({
            data: {
              title: `Sample Request Rejected - ${sample.sampleNumber}`,
              description: `Your sample request was rejected by the manufacturer. ${
                manufacturerNote
                  ? "Reason: " + manufacturerNote
                  : "Please contact the manufacturer for details."
              }`,
              status: "TODO" as any,
              priority: "HIGH" as any,
              type: "REVISION_REQUEST" as any,
              assignedToId: sample.customerId,
              userId: userId,
              sampleId: sample.id,
              collectionId: sample.collectionId || undefined,
              dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
              notes: `Auto-created when sample request was rejected - customer can submit revised request`,
            },
          });
        }
      }

      // Auto-complete related tasks when sample is approved
      const taskHelper = new TaskHelper(context.prisma);
      if (approve) {
        // Only complete if sample was approved, not rejected
        await taskHelper.completeRelatedTasks(sample.id, undefined);
      }

      return sample;
    },
  });

  // Delete Sample
  t.field("deleteSample", {
    type: "Sample",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (
      _parent: unknown,
      { id }: { id: number },
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

      // Find existing sample
      const existingSample = await context.prisma.sample.findUnique({
        where: { id },
      });

      if (!existingSample) {
        throw new Error("Sample not found");
      }

      // Permission check - only customer who created it or admin can delete
      const isCustomer = existingSample.customerId === userId;
      const isAdmin = userRole === "ADMIN";

      if (!isCustomer && !isAdmin) {
        throw new Error("Not authorized to delete this sample");
      }

      // Can only delete if in PENDING_APPROVAL, REQUESTED or REJECTED status (unless admin or AI sample)
      if (!isAdmin && !existingSample.aiGenerated) {
        if (
          existingSample.status !== "PENDING_APPROVAL" &&
          existingSample.status !== "REQUESTED" &&
          existingSample.status !== "REJECTED"
        ) {
          throw new Error(
            "Can only delete samples in PENDING_APPROVAL, REQUESTED or REJECTED status"
          );
        }
      }

      // Delete production history first
      await context.prisma.sampleProduction.deleteMany({
        where: { sampleId: id },
      });

      // Delete AI generated images if exists
      if (existingSample.aiGenerated && existingSample.images) {
        try {
          const images = JSON.parse(existingSample.images);
          const fs = require("fs");
          const path = require("path");

          for (const imageUrl of images) {
            // imageUrl format: /uploads/production/ai_sample_XXX.png
            const filePath = path.join(
              process.cwd(),
              "uploads",
              ...imageUrl.split("/").filter((p: string) => p && p !== "uploads")
            );
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }

          // Delete sketch if exists
          if (existingSample.aiSketchUrl) {
            const sketchPath = path.join(
              process.cwd(),
              "uploads",
              ...existingSample.aiSketchUrl
                .split("/")
                .filter((p: string) => p && p !== "uploads")
            );
            if (fs.existsSync(sketchPath)) {
              fs.unlinkSync(sketchPath);
            }
          }
        } catch (error) {
          console.error("Error deleting AI images:", error);
          // Continue with deletion even if file deletion fails
        }
      }

      // Delete sample
      const deletedSample = await context.prisma.sample.delete({
        where: { id },
      });

      return deletedSample;
    },
  });

  // Hold/Pause Sample (Numune Durdur)
  t.field("holdSample", {
    type: "Sample",
    args: {
      id: nonNull(intArg()),
      reason: "String",
    },
    resolve: async (
      _parent: unknown,
      { id, reason }: { id: number; reason?: string },
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

      // Find existing sample
      const existingSample = await context.prisma.sample.findUnique({
        where: { id },
      });

      if (!existingSample) {
        throw new Error("Sample not found");
      }

      // Permission check: Manufacturer or admin can hold
      const isManufacture = existingSample.manufactureId === userId;
      const isAdmin = userRole === "ADMIN";

      if (!isAdmin && !isManufacture) {
        throw new Error("Only manufacturer or admin can hold sample");
      }

      // Can only hold if in progress
      const allowedStatuses = [
        "REQUESTED",
        "RECEIVED",
        "IN_DESIGN",
        "PATTERN_READY",
        "IN_PRODUCTION",
        "QUALITY_CHECK",
      ];
      if (!allowedStatuses.includes(existingSample.status)) {
        throw new Error("Sample cannot be held in current status");
      }

      // Update sample to ON_HOLD
      const sample = await context.prisma.sample.update({
        where: { id },
        data: {
          status: "ON_HOLD",
          manufacturerResponse: reason || existingSample.manufacturerResponse,
        },
        include: {
          collection: true,
          originalCollection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
      });

      // Create production history entry
      await context.prisma.sampleProduction.create({
        data: {
          sampleId: sample.id,
          status: "ON_HOLD",
          note: reason || "Sample production paused",
          actualDate: new Date(),
          updatedById: userId,
        },
      });

      return sample;
    },
  });

  // Cancel Sample (Numune İptal Et)
  t.field("cancelSample", {
    type: "Sample",
    args: {
      id: nonNull(intArg()),
      reason: "String",
    },
    resolve: async (
      _parent: unknown,
      { id, reason }: { id: number; reason?: string },
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

      // Find existing sample
      const existingSample = await context.prisma.sample.findUnique({
        where: { id },
      });

      if (!existingSample) {
        throw new Error("Sample not found");
      }

      // Permission check: Customer, manufacturer or admin can cancel
      const isCustomer = existingSample.customerId === userId;
      const isManufacture = existingSample.manufactureId === userId;
      const isAdmin = userRole === "ADMIN";

      if (!isAdmin && !isCustomer && !isManufacture) {
        throw new Error("Not authorized to cancel this sample");
      }

      // Cannot cancel if already completed or shipped
      if (
        existingSample.status === "COMPLETED" ||
        existingSample.status === "SHIPPED"
      ) {
        throw new Error("Cannot cancel completed or shipped samples");
      }

      // Update sample to CANCELLED
      const sample = await context.prisma.sample.update({
        where: { id },
        data: {
          status: "CANCELLED",
          manufacturerResponse: reason || existingSample.manufacturerResponse,
        },
        include: {
          collection: true,
          originalCollection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
      });

      // Create production history entry
      await context.prisma.sampleProduction.create({
        data: {
          sampleId: sample.id,
          status: "CANCELLED",
          note:
            reason ||
            `Sample cancelled by ${isCustomer ? "customer" : "manufacturer"}`,
          actualDate: new Date(),
          updatedById: userId,
        },
      });

      return sample;
    },
  });

  // Resume Sample from ON_HOLD (Durdurulmuş Numune Devam Ettir)
  t.field("resumeSample", {
    type: "Sample",
    args: {
      id: nonNull(intArg()),
      note: "String",
    },
    resolve: async (
      _parent: unknown,
      { id, note }: { id: number; note?: string },
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

      // Find existing sample
      const existingSample = await context.prisma.sample.findUnique({
        where: { id },
      });

      if (!existingSample) {
        throw new Error("Sample not found");
      }

      // Permission check: Manufacturer or admin can resume
      const isManufacture = existingSample.manufactureId === userId;
      const isAdmin = userRole === "ADMIN";

      if (!isAdmin && !isManufacture) {
        throw new Error("Only manufacturer or admin can resume sample");
      }

      // Can only resume if currently ON_HOLD
      if (existingSample.status !== "ON_HOLD") {
        throw new Error("Sample is not on hold");
      }

      // Resume to IN_PRODUCTION
      const sample = await context.prisma.sample.update({
        where: { id },
        data: {
          status: "IN_PRODUCTION",
        },
        include: {
          collection: true,
          originalCollection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
      });

      // Create production history entry
      await context.prisma.sampleProduction.create({
        data: {
          sampleId: sample.id,
          status: "IN_PRODUCTION",
          note: note || "Sample production resumed",
          actualDate: new Date(),
          updatedById: userId,
        },
      });

      return sample;
    },
  });
};
