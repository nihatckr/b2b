import { inputObjectType, objectType } from "nexus";

export const AIAnalysisInput = inputObjectType({
  name: "AIAnalysisInput",
  definition(t) {
    // Basic Analysis
    t.string("detectedProduct");
    t.string("detectedColor");
    t.string("detectedFabric");
    t.string("detectedPattern");
    t.string("detectedGender");
    t.string("detectedClassification");
    t.string("detectedAccessories");
    t.string("technicalDescription");

    // Quality Analysis
    t.string("qualityAnalysis");
    t.float("qualityScore");

    // Cost Analysis
    t.string("costAnalysis");
    t.float("estimatedCostMin");
    t.float("estimatedCostMax");
    t.int("suggestedMinOrder");

    // Trend Analysis
    t.string("trendAnalysis");
    t.float("trendScore");
    t.string("targetMarket");
    t.string("salesPotential");

    // Design Suggestions
    t.string("designSuggestions");
    t.string("designStyle");
    t.string("designFocus");
  },
});

export const Sample = objectType({
  name: "Sample",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("sampleNumber");
    t.nonNull.field("sampleType", { type: "SampleType" });
    t.nonNull.field("status", { type: "SampleStatus" });
    t.string("customerNote");
    t.string("manufacturerResponse");

    // Custom/Revision fields
    t.string("customDesignImages", {
      resolve: (parent) => parent.customDesignImages,
    });
    t.string("revisionRequests", {
      resolve: (parent) => parent.revisionRequests,
    });
    t.int("originalCollectionId");

    // Production fields
    t.int("productionDays");
    t.field("estimatedProductionDate", { type: "DateTime" });
    t.field("actualProductionDate", { type: "DateTime" });
    t.field("shippingDate", { type: "DateTime" });
    t.string("deliveryAddress");
    t.string("cargoTrackingNumber");

    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });

    // Relations
    t.field("collection", {
      type: "Collection",
      resolve: (sample, _args, ctx) =>
        ctx.prisma.sample.findUnique({ where: { id: sample.id } }).collection(),
    });

    t.field("originalCollection", {
      type: "Collection",
      resolve: (sample, _args, ctx) =>
        ctx.prisma.sample
          .findUnique({ where: { id: sample.id } })
          .originalCollection(),
    });

    t.field("customer", {
      type: "User",
      resolve: (sample, _args, ctx) =>
        ctx.prisma.sample.findUnique({ where: { id: sample.id } }).customer(),
    });

    t.field("manufacture", {
      type: "User",
      resolve: (sample, _args, ctx) =>
        ctx.prisma.sample
          .findUnique({ where: { id: sample.id } })
          .manufacture(),
    });

    t.field("company", {
      type: "Company",
      resolve: (sample, _args, ctx) =>
        ctx.prisma.sample.findUnique({ where: { id: sample.id } }).company(),
    });

    t.list.field("productionHistory", {
      type: "SampleProduction",
      resolve: (sample, _args, ctx) =>
        ctx.prisma.sample
          .findUnique({ where: { id: sample.id } })
          .productionHistory(),
    });

    t.list.field("productionTracking", {
      type: "ProductionTracking",
      resolve: (sample, _args, ctx) =>
        ctx.prisma.sample
          .findUnique({ where: { id: sample.id } })
          .productionTracking(),
    });

    t.field("aiAnalysis", {
      type: "AIAnalysis",
      resolve: (sample, _args, ctx) =>
        ctx.prisma.sample.findUnique({ where: { id: sample.id } }).aiAnalysis(),
    });

    // AI Design fields
    t.string("name");
    t.string("description");
    t.string("images");
    t.boolean("aiGenerated");
    t.string("aiPrompt");
    t.string("aiSketchUrl");
  },
});

export const SampleProduction = objectType({
  name: "SampleProduction",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.field("status", { type: "SampleStatus" });
    t.string("note");
    t.int("estimatedDays");
    t.field("actualDate", { type: "DateTime" });
    t.nonNull.field("createdAt", { type: "DateTime" });

    // Relations
    t.field("sample", {
      type: "Sample",
      resolve: (production, _args, ctx) =>
        ctx.prisma.sampleProduction
          .findUnique({ where: { id: production.id } })
          .sample(),
    });

    t.field("updatedBy", {
      type: "User",
      resolve: (production, _args, ctx) =>
        ctx.prisma.sampleProduction
          .findUnique({ where: { id: production.id } })
          .updatedBy(),
    });
  },
});

export const CreateSampleInput = inputObjectType({
  name: "CreateSampleInput",
  definition(t) {
    t.nonNull.field("sampleType", { type: "SampleType" });
    t.int("collectionId");
    t.string("customerNote");
    t.string("deliveryAddress");

    // For CUSTOM type
    t.list.string("customDesignImages");

    // For REVISION type
    t.int("originalCollectionId");
    t.string("revisionRequests"); // JSON string

    // Optional manufacturer assignment
    t.int("manufactureId");
    t.int("companyId");

    // AI Analysis
    t.field("aiAnalysis", { type: "AIAnalysisInput" });

    // AI Generated sample fields
    t.boolean("aiGenerated");
    t.string("aiSketchUrl");
    t.list.string("images");
  },
});

export const UpdateSampleInput = inputObjectType({
  name: "UpdateSampleInput",
  definition(t) {
    t.nonNull.int("id");
    t.string("name");
    t.string("description");
    t.field("status", { type: "SampleStatus" });
    t.int("manufactureId"); // Added for assigning manufacturer
    t.string("customerNote");
    t.string("manufacturerResponse");
    t.int("productionDays");
    t.field("estimatedProductionDate", { type: "DateTime" });
    t.field("actualProductionDate", { type: "DateTime" });
    t.field("shippingDate", { type: "DateTime" });
    t.string("cargoTrackingNumber");
    t.string("deliveryAddress");
  },
});

export const UpdateSampleStatusInput = inputObjectType({
  name: "UpdateSampleStatusInput",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.field("status", { type: "SampleStatus" });
    t.string("note");
    t.int("estimatedDays");
  },
});
