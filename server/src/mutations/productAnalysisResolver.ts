import fs from "fs";
import { extendType, nonNull, stringArg } from "nexus";
import path from "path";
import { Context } from "../context";
import { analyzeProductWithOllama } from "../utils/ollamaVision";

export const productAnalysisMutations = (t: any) => {
  t.field("analyzeProductWithOllama", {
    type: "ProductAnalysisResult",
    args: {
      imageUrl: nonNull(stringArg()),
      userNotes: stringArg(),
    },
    resolve: async (
      _: any,
      {
        imageUrl,
        userNotes,
      }: {
        imageUrl: string;
        userNotes?: string | null;
      },
      ctx: Context
    ) => {
      if (!ctx.userId) {
        throw new Error("Authentication required");
      }

      try {
        console.log("🔍 Starting product analysis with Ollama...");
        console.log("Image URL:", imageUrl);
        console.log("User Notes:", userNotes);

        // Resolve image path (assuming it's a local upload)
        let imagePath: string;

        if (imageUrl.startsWith("/uploads/")) {
          // Local file - resolve to absolute path
          imagePath = path.join(process.cwd(), imageUrl);
          console.log("📂 Local file path:", imagePath);

          if (!fs.existsSync(imagePath)) {
            throw new Error(`Image file not found: ${imagePath}`);
          }
        } else {
          throw new Error(
            "Remote image URLs not supported yet. Please upload image first."
          );
        }

        // Call Ollama Vision API
        const analysis = await analyzeProductWithOllama(
          imagePath,
          userNotes || undefined
        );

        console.log("✅ Ollama analysis completed");
        console.log("Product Type:", analysis.productType);
        console.log("Colors:", analysis.colors);

        return analysis;
      } catch (error: any) {
        console.error("❌ Product analysis error:", error.message);
        throw new Error(`Product analysis failed: ${error.message}`);
      }
    },
  });

  t.field("checkOllamaStatus", {
    type: "OllamaStatus",
    resolve: async () => {
      const { checkOllamaStatus } = await import("../utils/ollamaVision");
      return checkOllamaStatus();
    },
  });
};

export const ProductAnalysisMutation = extendType({
  type: "Mutation",
  definition(t) {
    productAnalysisMutations(t);
  },
});
