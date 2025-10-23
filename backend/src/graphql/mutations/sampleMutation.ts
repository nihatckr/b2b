import { DynamicTaskHelper } from "../../utils/dynamicTaskHelper";
import builder from "../builder";

const ValidSampleStatuses = [
  "AI_DESIGN",
  "PENDING_APPROVAL",
  "PENDING",
  "REVIEWED",
  "QUOTE_SENT",
  "CUSTOMER_QUOTE_SENT",
  "MANUFACTURER_REVIEWING_QUOTE",
  "CONFIRMED",
  "REJECTED",
  "REJECTED_BY_CUSTOMER",
  "REJECTED_BY_MANUFACTURER",
  "IN_DESIGN",
  "PATTERN_READY",
  "IN_PRODUCTION",
  "PRODUCTION_COMPLETE",
  "QUALITY_CHECK",
  "SHIPPED",
  "DELIVERED",
  "ON_HOLD",
  "CANCELLED",
  "REQUESTED",
  "RECEIVED",
  "COMPLETED",
];

// Create sample (user only)
builder.mutationField("createSample", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      name: t.arg.string({ required: true }),
      description: t.arg.string(),
      collectionId: t.arg.int(),
      sampleType: t.arg.string(),
      manufacturerId: t.arg.int({ required: true }), // ✅ Manufacturer must be specified

      // AI Design fields
      aiGenerated: t.arg.boolean(),
      aiPrompt: t.arg.string(),
      aiSketchUrl: t.arg.string(),

      // Images
      images: t.arg.string(), // JSON array
      customDesignImages: t.arg.string(), // JSON array

      // Customer notes
      customerNote: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const initialStatus = args.aiGenerated ? "AI_DESIGN" : "PENDING";

      const data: any = {
        sampleNumber: `SAMPLE-${Date.now()}`,
        name: args.name,
        customerId: context.user?.id || 0,
        manufactureId: args.manufacturerId, // ✅ Use provided manufacturer
        status: initialStatus,

        // Analytics initialization
        viewCount: 0,
        shareCount: 0,
      };

      // Optional fields
      if (args.description) data.description = args.description;
      if (args.collectionId) data.collectionId = args.collectionId;
      if (args.sampleType) data.sampleType = args.sampleType;

      // AI Design fields
      if (args.aiGenerated !== null && args.aiGenerated !== undefined)
        data.aiGenerated = args.aiGenerated;
      if (args.aiPrompt) data.aiPrompt = args.aiPrompt;
      if (args.aiSketchUrl) data.aiSketchUrl = args.aiSketchUrl;

      // Images
      if (args.images) data.images = args.images;
      if (args.customDesignImages) data.customDesignImages = args.customDesignImages;

      // Notes
      if (args.customerNote) data.customerNote = args.customerNote;

      const sample = await context.prisma.sample.create({
        ...query,
        data,
      });

      // ✅ Create tasks for initial status
      const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);
      await dynamicTaskHelper.createTasksForSampleStatus(
        sample.id,
        initialStatus,
        sample.customerId,
        sample.manufactureId,
        sample.collectionId ?? undefined
      );

      return sample;
    },
  })
);

// Update sample (owner or admin)
builder.mutationField("updateSample", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      description: t.arg.string(),
      status: t.arg.string(),

      // AI Design fields
      aiPrompt: t.arg.string(),
      aiSketchUrl: t.arg.string(),

      // Images
      images: t.arg.string(),
      customDesignImages: t.arg.string(),

      // Production fields
      unitPrice: t.arg.float(),
      productionDays: t.arg.int(),

      // Customer Quote fields
      customerQuotedPrice: t.arg.float(),
      customerQuoteDays: t.arg.int(),
      customerQuoteNote: t.arg.string(),

      // Notes
      customerNote: t.arg.string(),
      manufacturerResponse: t.arg.string(),
    },
    authScopes: { user: true, admin: true },
    resolve: async (query, _root, args, context) => {
      // Check ownership
      const sample = await context.prisma.sample.findUnique({
        where: { id: args.id },
      });

      if (!sample) throw new Error("Sample not found");
      if (
        sample.customerId !== context.user?.id &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      const updateData: any = {};

      // Basic fields
      if (args.name !== null && args.name !== undefined)
        updateData.name = args.name;
      if (args.description !== null && args.description !== undefined)
        updateData.description = args.description;

      // Status validation
      if (args.status !== null && args.status !== undefined) {
        if (!ValidSampleStatuses.includes(args.status)) {
          throw new Error(
            `Invalid status. Must be one of: ${ValidSampleStatuses.join(", ")}`
          );
        }
        updateData.status = args.status;
      }

      // AI Design fields
      if (args.aiPrompt !== null && args.aiPrompt !== undefined)
        updateData.aiPrompt = args.aiPrompt;
      if (args.aiSketchUrl !== null && args.aiSketchUrl !== undefined)
        updateData.aiSketchUrl = args.aiSketchUrl;

      // Images
      if (args.images !== null && args.images !== undefined)
        updateData.images = args.images;
      if (args.customDesignImages !== null && args.customDesignImages !== undefined)
        updateData.customDesignImages = args.customDesignImages;

      // Production fields
      if (args.unitPrice !== null && args.unitPrice !== undefined)
        updateData.unitPrice = args.unitPrice;
      if (args.productionDays !== null && args.productionDays !== undefined)
        updateData.productionDays = args.productionDays;

      // Customer Quote fields
      if (args.customerQuotedPrice !== null && args.customerQuotedPrice !== undefined)
        updateData.customerQuotedPrice = args.customerQuotedPrice;
      if (args.customerQuoteDays !== null && args.customerQuoteDays !== undefined)
        updateData.customerQuoteDays = args.customerQuoteDays;
      if (args.customerQuoteNote !== null && args.customerQuoteNote !== undefined)
        updateData.customerQuoteNote = args.customerQuoteNote;

      // Notes
      if (args.customerNote !== null && args.customerNote !== undefined)
        updateData.customerNote = args.customerNote;
      if (args.manufacturerResponse !== null && args.manufacturerResponse !== undefined)
        updateData.manufacturerResponse = args.manufacturerResponse;

      const updatedSample = await context.prisma.sample.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });

      // ✅ Create tasks if status changed
      if (args.status !== null && args.status !== undefined) {
        const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);
        await dynamicTaskHelper.createTasksForSampleStatus(
          updatedSample.id,
          args.status,
          updatedSample.customerId,
          updatedSample.manufactureId,
          updatedSample.collectionId ?? undefined
        );
      }

      return updatedSample;
    },
  })
);

// Delete sample (owner or admin)
builder.mutationField("deleteSample", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true, admin: true },
    resolve: async (_root, args, context) => {
      const sample = await context.prisma.sample.findUnique({
        where: { id: args.id },
      });

      if (!sample) throw new Error("Sample not found");
      if (
        sample.customerId !== context.user?.id &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      await context.prisma.sample.delete({
        where: { id: args.id },
      });
      return true;
    },
  })
);
