import { intArg, nonNull } from "nexus";
import { Context } from "../context";
import { isBuyer, requirePermission } from "../utils/permissions";
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

      // Create sample
      const sample = await context.prisma.sample.create({
        data: {
          sampleNumber,
          sampleType: input.sampleType,
          status: "REQUESTED",
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
        },
        include: {
          collection: true,
          originalCollection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
      });

      // Create initial production history
      await context.prisma.sampleProduction.create({
        data: {
          sampleId: sample.id,
          status: "REQUESTED",
          note: "Sample request created",
          updatedById: userId,
        },
      });

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

      if (input.status !== undefined) updateData.status = input.status;
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

      // Can only delete if in REQUESTED or REJECTED status (unless admin)
      if (!isAdmin) {
        if (
          existingSample.status !== "REQUESTED" &&
          existingSample.status !== "REJECTED"
        ) {
          throw new Error(
            "Can only delete samples in REQUESTED or REJECTED status"
          );
        }
      }

      // Delete production history first
      await context.prisma.sampleProduction.deleteMany({
        where: { sampleId: id },
      });

      // Delete sample
      const deletedSample = await context.prisma.sample.delete({
        where: { id },
      });

      return deletedSample;
    },
  });
};
