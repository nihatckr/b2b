import crypto from "crypto";
import { arg, extendType, intArg, nonNull, stringArg } from "nexus";
import path from "path";
import type { Context } from "../../context";
import { requireAuth } from "../../utils/userUtils";

export const EnhancedUploadMutations = extendType({
  type: "Mutation",
  definition(t) {
    // Request presigned upload URL
    t.field("requestUpload", {
      type: "String",
      args: {
        input: nonNull(arg({ type: "RequestUploadInput" })),
      },
      resolve: async (_parent, { input }, ctx: Context) => {
        const userId = requireAuth(ctx);

        // Validate file type and size
        const validation = validateFileUpload(input);
        if (!validation.isValid) {
          throw new Error(
            `Upload validation failed: ${validation.errors.join(", ")}`
          );
        }

        // Generate unique upload ID
        const uploadId = crypto.randomUUID();
        const timestamp = Date.now();
        const fileExt = path.extname(input.fileName);
        const baseName = path.basename(input.fileName, fileExt);
        const safeFileName = `${timestamp}_${baseName.replace(
          /[^a-zA-Z0-9]/g,
          "_"
        )}${fileExt}`;

        // Generate upload path based on asset type
        const uploadPath = generateUploadPath(
          input.assetType,
          userId,
          safeFileName
        );

        // Create presigned URL (mock implementation - replace with actual cloud provider)
        const uploadUrl = generatePresignedUrl(uploadPath, input.mimeType);

        // Store upload metadata in database (optional)
        try {
          // You might want to create a PendingUpload table to track this
          console.log(`📤 Upload requested: ${uploadId} for user ${userId}`);
        } catch (error) {
          console.error("Failed to store upload metadata:", error);
        }

        const allowedTypes = getAllowedMimeTypes(input.assetType);
        const response = {
          uploadUrl: uploadUrl,
          uploadId,
          fields: JSON.stringify({
            "Content-Type": input.mimeType,
            "x-amz-meta-user-id": userId.toString(),
            "x-amz-meta-upload-id": uploadId,
          }),
          expiresIn: 3600, // 1 hour
          maxFileSize: "50MB",
          allowedMimeTypes: Array.isArray(allowedTypes)
            ? allowedTypes
            : [allowedTypes],
        };
        return JSON.stringify(response);
      },
    });

    // Finalize upload and create asset record
    t.field("finalizeUpload", {
      type: "String", // Asset as JSON string
      args: {
        input: nonNull(arg({ type: "FinalizeUploadInput" })),
      },
      resolve: async (_parent, { input }, ctx: Context) => {
        const userId = requireAuth(ctx);

        // Verify upload exists and belongs to user
        const uploadExists = await verifyUploadExists(input.uploadId, userId);
        if (!uploadExists) {
          throw new Error("Upload not found or access denied");
        }

        // Get file info from storage
        const fileInfo = await getFileInfo(input.uploadId);
        if (!fileInfo.exists) {
          throw new Error("File not found in storage");
        }

        // Create asset record (mock - replace with actual Prisma model)
        const asset = {
          id: Math.floor(Math.random() * 10000),
          fileName: input.finalFileName || fileInfo.fileName,
          originalName: fileInfo.originalName,
          mimeType: fileInfo.mimeType,
          fileSize: fileInfo.size,
          fileUrl: fileInfo.url,
          thumbnailUrl: fileInfo.thumbnailUrl,
          uploadId: input.uploadId,
          assetType: fileInfo.assetType,
          category: fileInfo.category,
          metadata: input.metadata ? JSON.parse(input.metadata) : null,
          isPublic: fileInfo.isPublic || false,
          isProcessed: true,
          processingStatus: "COMPLETED",
          uploaderId: userId,
          companyId: null, // Get from user context
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Process image if requested
        if (input.processImage && isImageFile(fileInfo.mimeType)) {
          asset.thumbnailUrl = await generateThumbnail(fileInfo.url);
        }

        console.log(`✅ Upload finalized: ${input.uploadId}`);
        return JSON.stringify(asset);
      },
    });

    // Get upload progress
    t.field("getUploadProgress", {
      type: "String", // UploadProgressResponse as JSON string
      args: {
        uploadId: nonNull(stringArg()),
      },
      resolve: async (_parent, { uploadId }, ctx: Context) => {
        requireAuth(ctx);

        // Mock implementation - replace with actual progress tracking
        const progress = {
          uploadId,
          status: "COMPLETED",
          progress: 100,
          error: null,
          assetId: "mock-asset-id",
        };
        return JSON.stringify(progress);
      },
    });
  },
});

export const EnhancedUploadQueries = extendType({
  type: "Query",
  definition(t) {
    // Get user's assets
    t.field("myAssets", {
      type: "String", // Assets list as JSON string
      args: {
        assetType: stringArg(),
        category: stringArg(),
        first: intArg(),
      },
      resolve: async (_parent, args, ctx: Context) => {
        const userId = requireAuth(ctx);

        // Mock implementation - replace with actual Prisma query
        return JSON.stringify([]);
      },
    });

    // Validate file before upload
    t.field("validateFile", {
      type: "String", // FileValidationResult as JSON string
      args: {
        fileName: nonNull(stringArg()),
        mimeType: nonNull(stringArg()),
        fileSize: nonNull(intArg()),
        assetType: nonNull(stringArg()),
      },
      resolve: async (_parent, args, _ctx: Context) => {
        const validation = validateFileUpload(args);

        const result = {
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings,
          suggestedFileName: validation.suggestedFileName,
          detectedMimeType: args.mimeType,
        };
        return JSON.stringify(result);
      },
    });
  },
});

// Utility functions (to be implemented with actual cloud storage)

function validateFileUpload(input: any) {
  const errors: string[] = [];
  const warnings: string[] = [];

  // File size limits by type
  const sizeLimits = {
    PROFILE_PICTURE: 5 * 1024 * 1024, // 5MB
    COLLECTION_IMAGE: 10 * 1024 * 1024, // 10MB
    DOCUMENT: 50 * 1024 * 1024, // 50MB
    TECH_PACK: 100 * 1024 * 1024, // 100MB
  };

  const limit =
    sizeLimits[input.assetType as keyof typeof sizeLimits] || 10 * 1024 * 1024;

  if (input.fileSize > limit) {
    errors.push(
      `File size exceeds limit of ${(limit / 1024 / 1024).toFixed(1)}MB`
    );
  }

  // MIME type validation
  const allowedTypes = getAllowedMimeTypes(input.assetType);
  if (!allowedTypes.includes(input.mimeType)) {
    errors.push(
      `File type ${input.mimeType} not allowed for ${input.assetType}`
    );
  }

  // Filename validation
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (safeName !== input.fileName) {
    warnings.push("Filename contains special characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestedFileName: safeName,
  };
}

function getAllowedMimeTypes(assetType: string): string[] {
  const typeMap = {
    PROFILE_PICTURE: ["image/jpeg", "image/png", "image/webp"],
    COLLECTION_IMAGE: ["image/jpeg", "image/png", "image/webp"],
    PRODUCT_IMAGE: ["image/jpeg", "image/png", "image/webp"],
    DOCUMENT: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    TECH_PACK: ["application/pdf", "image/jpeg", "image/png"],
    SIZE_CHART: [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/vnd.ms-excel",
    ],
  };

  return typeMap[assetType as keyof typeof typeMap] || ["*/*"];
}

function generateUploadPath(
  assetType: string,
  userId: number,
  fileName: string
): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `uploads/${assetType.toLowerCase()}/${year}/${month}/${day}/${userId}/${fileName}`;
}

function generatePresignedUrl(path: string, contentType: string): string {
  // Mock implementation - replace with AWS S3, Google Cloud, etc.
  const baseUrl =
    process.env.UPLOAD_BASE_URL || "https://api.example.com/upload";
  return `${baseUrl}/${path}?content-type=${encodeURIComponent(contentType)}`;
}

async function verifyUploadExists(
  uploadId: string,
  userId: number
): Promise<boolean> {
  // Mock implementation - verify with your upload tracking system
  console.log(`Verifying upload ${uploadId} for user ${userId}`);
  return true;
}

async function getFileInfo(uploadId: string) {
  // Mock implementation - get actual file info from storage
  return {
    exists: true,
    fileName: `file_${uploadId}.jpg`,
    originalName: "original.jpg",
    mimeType: "image/jpeg",
    size: 123456,
    url: `https://cdn.example.com/file_${uploadId}.jpg`,
    thumbnailUrl: `https://cdn.example.com/thumb_${uploadId}.jpg`,
    assetType: "COLLECTION_IMAGE",
    category: "collections",
    isPublic: false,
  };
}

function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

async function generateThumbnail(imageUrl: string): Promise<string> {
  // Mock implementation - generate thumbnail with image processing service
  return imageUrl.replace(".jpg", "_thumb.jpg");
}
