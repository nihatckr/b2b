import { intArg, nonNull, stringArg } from "nexus";
import { Context } from "../../../context";
import { getUserId } from "../../../utils/userUtils";

export const sampleMutations = (t: any) => {
  t.field("createSample", {
    type: "Sample",
    args: {
      collectionId: nonNull(intArg()),
      sampleType: stringArg(), // STANDARD, REVISION, CUSTOM
      customerNote: stringArg(),
      customDesignImages: stringArg(), // JSON string for CUSTOM type
      revisionRequests: stringArg(), // JSON string for REVISION type
      originalCollectionId: intArg(), // Required for REVISION type
      deliveryAddress: stringArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Validate collection exists
      const collection = await context.prisma.collection.findUnique({
        where: { id: args.collectionId },
        include: { author: true },
      });

      if (!collection || !collection.isActive) {
        throw new Error("Collection not found or not active.");
      }

      // Generate unique sample number
      const sampleCount = await context.prisma.sample.count();
      const sampleNumber = `SAM-${String(sampleCount + 1).padStart(6, "0")}`;

      return context.prisma.sample.create({
        data: {
          sampleNumber,
          sampleType: args.sampleType || "STANDARD",
          status: "REQUESTED",
          customerNote: args.customerNote,
          customDesignImages: args.customDesignImages,
          revisionRequests: args.revisionRequests,
          originalCollectionId: args.originalCollectionId,
          deliveryAddress: args.deliveryAddress,
          collectionId: args.collectionId,
          customerId: userId,
          manufactureId: collection.authorId!,
        },
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    },
  });

  t.field("updateSampleStatus", {
    type: "Sample",
    args: {
      id: nonNull(intArg()),
      status: nonNull(stringArg()),
      manufacturerResponse: stringArg(),
      productionDays: intArg(),
      cargoTrackingNumber: stringArg(),
      note: stringArg(), // Production history note
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Get sample with permissions check
      const sample = await context.prisma.sample.findUnique({
        where: { id: args.id },
        include: {
          customer: true,
          manufacture: true,
        },
      });

      if (!sample) {
        throw new Error("Sample not found.");
      }

      // Check permissions: only manufacture can update status (except customer can cancel)
      const canUpdate =
        sample.manufactureId === userId ||
        (sample.customerId === userId && args.status === "CANCELLED");

      if (!canUpdate) {
        throw new Error("You don't have permission to update this sample.");
      }

      // Validate status transition
      const validStatuses = [
        "REQUESTED",
        "REVIEWED",
        "QUOTE_SENT",
        "APPROVED",
        "REJECTED",
        "IN_PRODUCTION",
        "PRODUCTION_COMPLETE",
        "SHIPPED",
        "DELIVERED",
      ];

      if (!validStatuses.includes(args.status)) {
        throw new Error("Invalid status.");
      }

      // Update data
      const updateData: any = {
        status: args.status,
        updatedAt: new Date(),
      };

      if (args.manufacturerResponse)
        updateData.manufacturerResponse = args.manufacturerResponse;
      if (args.productionDays) updateData.productionDays = args.productionDays;
      if (args.cargoTrackingNumber)
        updateData.cargoTrackingNumber = args.cargoTrackingNumber;

      // Calculate estimated production date if production days provided
      if (args.productionDays && args.status === "QUOTE_SENT") {
        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + args.productionDays);
        updateData.estimatedProductionDate = estimatedDate;
      }

      // Set actual dates for specific statuses
      if (args.status === "PRODUCTION_COMPLETE") {
        updateData.actualProductionDate = new Date();
      } else if (args.status === "SHIPPED") {
        updateData.shippingDate = new Date();
      }

      // Update sample
      const updatedSample = await context.prisma.sample.update({
        where: { id: args.id },
        data: updateData,
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create production history entry
      if (args.note || args.status) {
        await context.prisma.sampleProduction.create({
          data: {
            sampleId: args.id,
            status: args.status,
            note: args.note,
            estimatedDays: args.productionDays,
            actualDate: [
              "PRODUCTION_COMPLETE",
              "SHIPPED",
              "DELIVERED",
            ].includes(args.status)
              ? new Date()
              : undefined,
            updatedById: userId,
          },
        });
      }

      return updatedSample;
    },
  });

  t.field("deleteSample", {
    type: "Boolean",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Get sample with permissions check
      const sample = await context.prisma.sample.findUnique({
        where: { id: args.id },
      });

      if (!sample) {
        throw new Error("Sample not found.");
      }

      // Only customer can delete their own samples and only if status is REQUESTED or REJECTED
      if (sample.customerId !== userId) {
        throw new Error("You can only delete your own samples.");
      }

      if (!["REQUESTED", "REJECTED"].includes(sample.status)) {
        throw new Error(
          "Can only delete samples with REQUESTED or REJECTED status."
        );
      }

      // Delete production history first (foreign key constraint)
      await context.prisma.sampleProduction.deleteMany({
        where: { sampleId: args.id },
      });

      // Delete sample
      await context.prisma.sample.delete({
        where: { id: args.id },
      });

      return true;
    },
  });

  t.field("approveSampleQuote", {
    type: "Sample",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      const sample = await context.prisma.sample.findUnique({
        where: { id: args.id },
      });

      if (!sample) {
        throw new Error("Sample not found.");
      }

      if (sample.customerId !== userId) {
        throw new Error("You can only approve your own sample quotes.");
      }

      if (sample.status !== "QUOTE_SENT") {
        throw new Error("Sample must be in QUOTE_SENT status to approve.");
      }

      return context.prisma.sample.update({
        where: { id: args.id },
        data: {
          status: "APPROVED",
          updatedAt: new Date(),
        },
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    },
  });
};
