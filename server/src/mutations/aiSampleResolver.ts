import axios from "axios";
import fs from "fs";
import { arg, extendType, intArg, nonNull, stringArg } from "nexus";
import path from "path";
import { Context } from "../context";
import { ComfyUIService } from "../utils/comfyui";
import { requireAuth } from '../utils/user-role-helper';

export const aiSampleMutations = (t: any) => {
  t.field("generateSampleDesign", {
    type: "Sample",
    args: {
      sketchUrl: nonNull(stringArg()),
      prompt: nonNull(stringArg()),
      negativePrompt: stringArg(),
      width: intArg({ default: 512 }),
      height: intArg({ default: 512 }),
      steps: intArg({ default: 20 }),
      cfgScale: arg({ type: "Float", default: 7.5 }),
      collectionId: intArg(),
      sampleName: stringArg(),
      description: stringArg(),
    },
    resolve: async (
      _: any,
      {
        sketchUrl,
        prompt,
        negativePrompt,
        width,
        height,
        steps,
        cfgScale,
        collectionId,
        sampleName,
        description,
      }: {
        sketchUrl: string;
        prompt: string;
        negativePrompt?: string | null;
        width?: number | null;
        height?: number | null;
        steps?: number | null;
        cfgScale?: number | null;
        collectionId?: number | null;
        sampleName?: string | null;
        description?: string | null;
      },
      ctx: Context
    ) => {
      console.log("🔍 AI Sample Generation started");

      try {
        // 1. Download sketch image to temp location
        console.log("📥 Downloading sketch image...");
        const tempDir = path.join(__dirname, "../../uploads/temp");
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const sketchFilename = `sketch_${Date.now()}.png`;
        const sketchPath = path.join(tempDir, sketchFilename);

        // If sketchUrl is a local file, copy it; otherwise download it
        if (sketchUrl.startsWith("/uploads/")) {
          // Local file - path is relative to project root
          const sourcePath = path.join(process.cwd(), sketchUrl);
          console.log(`📋 Copying sketch from: ${sourcePath}`);

          if (!fs.existsSync(sourcePath)) {
            throw new Error(`Sketch file not found: ${sourcePath}`);
          }

          fs.copyFileSync(sourcePath, sketchPath);
        } else {
          // Download from external URL
          console.log(`📥 Downloading sketch from: ${sketchUrl}`);
          const response = await axios.get(sketchUrl, {
            responseType: "stream",
          });
          const writer = fs.createWriteStream(sketchPath);
          response.data.pipe(writer);
          await new Promise<void>((resolve, reject) => {
            writer.on("finish", () => resolve());
            writer.on("error", reject);
          });
        }

        // 2. Generate sample design with ComfyUI
        console.log("🎨 Generating sample design with AI...");
        const generatedImagePath = await ComfyUIService.generateSampleDesign(
          sketchPath,
          prompt,
          {
            negativePrompt: negativePrompt || undefined,
            width: width || undefined,
            height: height || undefined,
            steps: steps || undefined,
            cfgScale: cfgScale || undefined,
          }
        );

        // 3. Move generated image to production/samples folder
        const samplesDir = path.join(__dirname, "../../uploads/production");
        if (!fs.existsSync(samplesDir)) {
          fs.mkdirSync(samplesDir, { recursive: true });
        }

        const finalFilename = `ai_sample_${Date.now()}.png`;
        const finalPath = path.join(samplesDir, finalFilename);
        fs.copyFileSync(generatedImagePath, finalPath);

        // 4. Clean up temp files
        fs.unlinkSync(sketchPath);
        fs.unlinkSync(generatedImagePath);

        // 5. Get user info - Use helper function for consistency
        const userId = requireAuth(ctx);
        console.log("👤 Fetching user from database, User ID:", userId);

        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
          include: { company: true },
        });

        if (!user) {
          console.error("❌ User not found in database for ID:", userId);
          // Debug: Let's check if user exists with different query
          const allUsers = await ctx.prisma.user.findMany({
            select: { id: true, email: true, name: true },
            take: 5,
          });
          console.log("📊 Sample users in database:", allUsers);
          throw new Error("User not found");
        }

        console.log("✅ User found:", user.email);

        // For AI-generated samples, the user acts as both customer and manufacturer
        const manufactureId = userId;
        const companyId = user.companyId;

        // 6. Generate sample number
        const count = await ctx.prisma.sample.count();
        const sampleNumber = `AI-SAMPLE-${String(count + 1).padStart(5, "0")}`;

        // 7. Create sample in database
        const sample = await ctx.prisma.sample.create({
          data: {
            sampleNumber,
            name: sampleName || `AI Generated Sample ${sampleNumber}`,
            description:
              description || `Generated with AI from prompt: "${prompt}"`,
            status: "AI_DESIGN", // AI Design - not sent to manufacturer yet
            customerId: userId,
            manufactureId,
            companyId,
            collectionId: collectionId || undefined,
            images: JSON.stringify([`/uploads/production/${finalFilename}`]),
            aiGenerated: true,
            aiPrompt: prompt,
            aiSketchUrl: sketchUrl,
          },
        });

        console.log("✅ AI Sample created successfully:", sample.id);

        return sample;
      } catch (error) {
        console.error("❌ Error generating AI sample:", error);
        throw new Error(
          `Failed to generate sample design: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    },
  });

  t.field("generateDesignFromText", {
    type: "Sample",
    args: {
      prompt: nonNull(stringArg()),
      negativePrompt: stringArg(),
      width: intArg({ default: 512 }),
      height: intArg({ default: 512 }),
      steps: intArg({ default: 20 }),
      cfgScale: arg({ type: "Float", default: 7.5 }),
      collectionId: intArg(),
      sampleName: stringArg(),
      description: stringArg(),
      workflowName: stringArg(),
    },
    resolve: async (
      _: any,
      {
        prompt,
        negativePrompt,
        width,
        height,
        steps,
        cfgScale,
        collectionId,
        sampleName,
        description,
        workflowName,
      }: {
        prompt: string;
        negativePrompt?: string | null;
        width?: number | null;
        height?: number | null;
        steps?: number | null;
        cfgScale?: number | null;
        collectionId?: number | null;
        sampleName?: string | null;
        description?: string | null;
        workflowName?: string | null;
      },
      ctx: Context
    ) => {
      console.log("🔍 Text-to-Design Generation started");

      try {
        console.log("🎨 Generating design from text with ComfyUI...");

        const generatedImagePath = await ComfyUIService.generateDesignFromText(
          prompt,
          {
            negativePrompt: negativePrompt || undefined,
            width: width || undefined,
            height: height || undefined,
            steps: steps || undefined,
            cfgScale: cfgScale || undefined,
            workflowName: workflowName || undefined,
          }
        );

        // Move generated image to production/samples folder
        const samplesDir = path.join(__dirname, "../../uploads/production");
        if (!fs.existsSync(samplesDir)) {
          fs.mkdirSync(samplesDir, { recursive: true });
        }

        const finalFilename = `ai_sample_${Date.now()}.png`;
        const finalPath = path.join(samplesDir, finalFilename);
        fs.copyFileSync(generatedImagePath, finalPath);

        // Clean up generated image (if different path)
        try {
          if (fs.existsSync(generatedImagePath) && generatedImagePath !== finalPath) {
            fs.unlinkSync(generatedImagePath);
          }
        } catch (e) {
          console.warn('Could not remove temporary generated image:', e);
        }

        // Get user info - Use helper function for consistency
        const userId = requireAuth(ctx);
        console.log("👤 Fetching user from database, User ID:", userId);

        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
          include: { company: true },
        });

        if (!user) {
          console.error("❌ User not found in database for ID:", userId);
          // Debug: Let's check if user exists
          const allUsers = await ctx.prisma.user.findMany({
            select: { id: true, email: true, name: true },
            take: 5,
          });
          console.log("📊 Sample users in database:", allUsers);
          throw new Error("User not found");
        }

        console.log("✅ User found:", user.email);

        const manufactureId = userId;
        const companyId = user.companyId;

        // Generate sample number
        const count = await ctx.prisma.sample.count();
        const sampleNumber = `AI-SAMPLE-${String(count + 1).padStart(5, "0")}`;

        // Create sample
        const sample = await ctx.prisma.sample.create({
          data: {
            sampleNumber,
            name: sampleName || `AI Generated Sample ${sampleNumber}`,
            description: description || `Generated with AI from prompt: "${prompt}"`,
            status: "AI_DESIGN", // AI Design - not sent to manufacturer yet
            customerId: userId,
            manufactureId,
            companyId,
            collectionId: collectionId || undefined,
            images: JSON.stringify([`/uploads/production/${finalFilename}`]),
            aiGenerated: true,
            aiPrompt: prompt,
            aiSketchUrl: null,
          },
        });

        console.log("✅ Text-to-design Sample created:", sample.id);
        return sample;
      } catch (error) {
        console.error("❌ Error in generateDesignFromText:", error);
        throw new Error(
          `Failed to generate design from text: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    },
  });
};

export const AISampleMutation = extendType({
  type: "Mutation",
  definition(t) {
    aiSampleMutations(t);
  },
});
