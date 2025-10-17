import { objectType } from "nexus";

export const AIAnalysisType = objectType({
  name: "AIAnalysis",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });

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

    // Relations
    t.nonNull.int("sampleId");
    t.field("sample", {
      type: "Sample",
      resolve: (parent, _, context) => {
        return context.prisma.aIAnalysis.findUnique({
          where: { id: parent.id },
        }).sample();
      },
    });
  },
});
