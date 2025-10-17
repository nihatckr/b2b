import { objectType } from "nexus";

export const SuggestedModel = objectType({
  name: "SuggestedModel",
  definition(t) {
    t.nonNull.string("variant");
    t.nonNull.string("prompt");
  },
});

export const ProductAnalysisResult = objectType({
  name: "ProductAnalysisResult",
  definition(t) {
    t.nonNull.string("productType");
    t.nonNull.string("category");
    t.nonNull.list.nonNull.string("colors");
    t.nonNull.string("material");
    t.nonNull.string("pattern");
    t.nonNull.string("style");
    t.string("neckline");
    t.string("sleeves");
    t.string("fit");
    t.nonNull.list.nonNull.string("details");
    t.nonNull.list.nonNull.field("suggestedModels", {
      type: "SuggestedModel",
    });
    t.nonNull.string("designPrompt");
    t.string("rawResponse");
  },
});

export const OllamaStatus = objectType({
  name: "OllamaStatus",
  definition(t) {
    t.nonNull.boolean("running");
    t.nonNull.boolean("modelAvailable");
    t.nonNull.list.nonNull.string("availableModels");
  },
});
