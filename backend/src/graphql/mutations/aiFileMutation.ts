import {
  FileUploadError,
  NotFoundError,
  requireAuth
} from "../../utils/errors";
import {
  deleteFile,
  MIME_TYPES,
  uploadFile,
  validateFileType
} from "../../utils/fileUpload";
import builder from "../builder";

// Generate Sample Design from Sketch (AI - Placeholder)
builder.mutationField("generateSampleDesign", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      sketchUrl: t.arg.string({ required: true }),
      prompt: t.arg.string({ required: true }),
      negativePrompt: t.arg.string(),
      collectionId: t.arg.int(),
      sampleName: t.arg.string(),
      description: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      // Use custom error instead of generic Error
      requireAuth(context.user?.id);

      try {
        // Placeholder: In production, integrate with ComfyUI or StableDiffusion
        const sample = await context.prisma.sample.create({
          ...query,
          data: {
            sampleNumber: `AI-${Date.now()}`,
            name: args.sampleName || "AI Generated Sample",
            description: args.description || args.prompt,
            status: "AI_DESIGN" as any,
            aiGenerated: true,
            aiPrompt: args.prompt,
            aiSketchUrl: args.sketchUrl,
            customerId: context.user.id,
            manufactureId: context.user.id,
            collectionId: args.collectionId || undefined,
          } as any,
        });

        return sample;
      } catch (error) {
        console.error("Error generating sample design:", error);
        // Let unexpected errors be masked by Yoga
        throw error;
      }
    },
  })
);

// Generate Design from Text Prompt (AI - Placeholder)
builder.mutationField("generateDesignFromText", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      prompt: t.arg.string({ required: true }),
      negativePrompt: t.arg.string(),
      style: t.arg.string(),
      collectionId: t.arg.int(),
      sampleName: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      requireAuth(context.user?.id);

      try {
        // Placeholder: In production, integrate with AI service
        const sample = await context.prisma.sample.create({
          ...query,
          data: {
            sampleNumber: `AI-TEXT-${Date.now()}`,
            name: args.sampleName || "Text-to-Design Sample",
            description: args.prompt,
            status: "AI_DESIGN" as any,
            aiGenerated: true,
            aiPrompt: args.prompt,
            customerId: context.user.id,
            manufactureId: context.user.id,
            collectionId: args.collectionId || undefined,
          } as any,
        });

        return sample;
      } catch (error) {
        console.error("Error generating design from text:", error);
        throw error;
      }
    },
  })
);

// Analyze Product with AI (Ollama - Placeholder)
builder.mutationField("analyzeProductWithOllama", (t) =>
  t.field({
    type: "JSON", // Returns analysis result
    args: {
      imageUrl: t.arg.string({ required: true }),
      sampleId: t.arg.int(),
    },
    authScopes: { user: true },
    resolve: async (_root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      try {
        // Placeholder: In production, call Ollama/LLaVA API
        const analysisResult = {
          success: true,
          analysis: {
            detectedProduct: "Shirt",
            detectedColor: "Blue",
            detectedFabric: "Cotton",
            detectedPattern: "Solid",
            detectedGender: "Unisex",
            qualityScore: 8.5,
            estimatedCostMin: 5.0,
            estimatedCostMax: 12.0,
            suggestedMinOrder: 100,
            trendScore: 7.0,
            targetMarket: "Casual Wear",
            salesPotential: "HIGH",
          },
          message:
            "Analysis complete (placeholder - integrate Ollama in production)",
        };

        return analysisResult;
      } catch (error) {
        console.error("Error analyzing product:", error);
        throw error;
      }
    },
  })
);

// File Upload (Placeholder - for file management)
builder.mutationField("uploadFile", (t) =>
  t.field({
    type: "JSON", // Returns { id, path, filename, size, mimetype }
    args: {
      filename: t.arg.string({ required: true }),
      path: t.arg.string({ required: true }),
      mimetype: t.arg.string({ required: true }),
      size: t.arg.int({ required: true }),
      description: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (_root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      try {
        // Placeholder: In production, handle file upload via GraphQL Multipart
        // File tracking would go to database if File model exists
        const fileRecord = {
          id: Math.random().toString(36).substring(7),
          filename: args.filename,
          path: args.path,
          size: args.size,
          mimetype: args.mimetype,
          encoding: "utf-8",
          description: args.description || undefined,
          createdAt: new Date(),
        };

        return fileRecord;
      } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
      }
    },
  })
);

// ========================================
// REAL FILE UPLOAD MUTATIONS
// ========================================

// Single File Upload (GraphQL Yoga v5 WHATWG File API)
builder.mutationField("singleUpload", (t) =>
  t.field({
    type: "JSON",
    args: {
      file: t.arg({ type: "File", required: true }),
      category: t.arg.string(), // sketches, samples, documents, production, temp
      description: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (_root: any, args: any, context: any) => {
      requireAuth(context.user?.id);

      try {
        const { file, category, description } = args;

        // Validate file type (images, documents, xml)
        const allowedTypes = [
          ...MIME_TYPES.images,
          ...MIME_TYPES.documents,
          ...MIME_TYPES.xml,
        ];

        if (!validateFileType(file.type, allowedTypes)) {
          throw new FileUploadError(
            `Invalid file type. Allowed: JPG, PNG, PDF, XML. Got: ${file.type}`,
            { receivedType: file.type, allowedTypes }
          );
        }

        // Upload file with cancellation support
        const uploadedFile = await uploadFile(
          file,
          (category as any) || "temp",
          context.request?.signal // Pass AbortSignal for cancellation
        );

        // Save to database
        const fileRecord = await context.prisma.file.create({
          data: {
            id: uploadedFile.id,
            filename: uploadedFile.filename,
            path: uploadedFile.relativePath,
            size: uploadedFile.size,
            mimetype: uploadedFile.mimetype,
            encoding: uploadedFile.encoding,
            description: description || null,
          },
        });

        return {
          ...fileRecord,
          url: uploadedFile.url,
        };
      } catch (error) {
        console.error("Error uploading file:", error);
        // Re-throw GraphQLError instances (they won't be masked)
        // Other errors will be masked in production
        throw error;
      }
    },
  })
);

// Multiple Files Upload (GraphQL Yoga v5 WHATWG File API)
builder.mutationField("multipleUpload", (t) =>
  t.field({
    type: "JSON",
    args: {
      files: t.arg({ type: ["File"], required: true }),
      category: t.arg.string(),
      description: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (_root: any, args: any, context: any) => {
      requireAuth(context.user?.id);

      try {
        const { files, category, description } = args;

        const uploadedFiles: any[] = [];

        for (const file of files) {
          // Validate file type
          const allowedTypes = [
            ...MIME_TYPES.images,
            ...MIME_TYPES.documents,
            ...MIME_TYPES.xml,
          ];

          if (!validateFileType(file.type, allowedTypes)) {
            console.warn(
              `Skipping invalid file type: ${file.type}`
            );
            continue;
          }

          // Upload file with cancellation support
          const uploadedFile = await uploadFile(
            file,
            (category as any) || "temp",
            context.request?.signal // Pass AbortSignal for cancellation
          );

          // Save to database
          const fileRecord = await context.prisma.file.create({
            data: {
              id: uploadedFile.id,
              filename: uploadedFile.filename,
              path: uploadedFile.relativePath,
              size: uploadedFile.size,
              mimetype: uploadedFile.mimetype,
              encoding: uploadedFile.encoding,
              description: description || null,
            },
          });

          uploadedFiles.push({
            ...fileRecord,
            url: uploadedFile.url,
          });
        }

        return {
          success: true,
          count: uploadedFiles.length,
          files: uploadedFiles,
        };
      } catch (error) {
        console.error("Error uploading files:", error);
        throw error;
      }
    },
  })
);

// Delete File
builder.mutationField("deleteFile", (t) =>
  t.field({
    type: "Boolean",
    args: {
      fileId: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root: any, args: any, context: any) => {
      requireAuth(context.user?.id);

      try {
        const file = await context.prisma.file.findUnique({
          where: { id: args.fileId },
        });

        if (!file) {
          throw new NotFoundError("File", args.fileId);
        }

        // Delete from filesystem
        await deleteFile(file.path);

        // Delete from database
        await context.prisma.file.delete({
          where: { id: args.fileId },
        });

        return true;
      } catch (error) {
        console.error("Error deleting file:", error);
        throw error;
      }
    },
  })
);

// Check Ollama Status (Helper query mutation)
builder.mutationField("checkOllamaStatus", (t) =>
  t.field({
    type: "JSON", // Returns { status, message }
    authScopes: { public: true },
    resolve: async (_root: any, _args: any, context: any) => {
      try {
        // Placeholder: Check Ollama service availability
        return {
          status: "available",
          message: "Ollama service is running (placeholder)",
          version: "0.1.0",
        };
      } catch (error) {
        return {
          status: "unavailable",
          message: "Ollama service is not available",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  })
);
