import { randomUUID as uuidv4 } from "crypto";
import fs from "fs/promises";
import mime from "mime-types";
import path from "path";
import sharp from "sharp";

export interface UploadToken {
  token: string;
  expiresAt: Date;
  fileName: string;
  maxSize: number;
  allowedTypes: string[];
  uploadPath: string;
}

export interface UploadResult {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
}

export interface ImageProcessingOptions {
  resize?: {
    width?: number;
    height?: number;
    fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  };
  quality?: number;
  format?: "jpeg" | "png" | "webp";
}

export class UploadService {
  private uploadTokens = new Map<string, UploadToken>();
  private readonly baseUploadPath: string;
  private readonly baseUrl: string;

  constructor() {
    this.baseUploadPath = path.join(process.cwd(), "uploads");
    this.baseUrl = process.env.BASE_URL || "http://localhost:4000";

    // Auto cleanup expired tokens every 5 minutes
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, 5 * 60 * 1000);
  }

  /**
   * Upload token oluşturur (presigned URL benzeri)
   */
  async generateUploadToken(
    category: "collections" | "samples" | "users" | "temp",
    options: {
      maxSize?: number; // bytes (default: 10MB)
      allowedTypes?: string[]; // MIME types
      expiresInMinutes?: number; // default: 30 minutes
      customPath?: string;
    } = {}
  ): Promise<UploadToken> {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = ["image/jpeg", "image/png", "image/webp"],
      expiresInMinutes = 30,
      customPath,
    } = options;

    const token = uuidv4();
    const fileName = `${uuidv4()}.tmp`;
    const uploadPath = customPath || category;

    const uploadToken: UploadToken = {
      token,
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
      fileName,
      maxSize,
      allowedTypes,
      uploadPath,
    };

    this.uploadTokens.set(token, uploadToken);

    return uploadToken;
  }

  /**
   * Token ile dosya upload eder
   */
  async uploadWithToken(
    token: string,
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<UploadResult> {
    const uploadToken = this.uploadTokens.get(token);

    if (!uploadToken) {
      throw new Error("Invalid or expired upload token");
    }

    if (new Date() > uploadToken.expiresAt) {
      this.uploadTokens.delete(token);
      throw new Error("Upload token has expired");
    }

    if (fileBuffer.length > uploadToken.maxSize) {
      throw new Error(
        `File size exceeds maximum allowed size of ${uploadToken.maxSize} bytes`
      );
    }

    if (!uploadToken.allowedTypes.includes(mimeType)) {
      throw new Error(
        `File type ${mimeType} not allowed. Allowed types: ${uploadToken.allowedTypes.join(
          ", "
        )}`
      );
    }

    // Generate final filename with proper extension
    const ext = mime.extension(mimeType) || "bin";
    const finalFileName = `${uuidv4()}.${ext}`;
    const uploadDir = path.join(this.baseUploadPath, uploadToken.uploadPath);
    const filePath = path.join(uploadDir, finalFileName);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Write file
    await fs.writeFile(filePath, fileBuffer);

    // Generate URL
    const url = `${this.baseUrl}/uploads/${uploadToken.uploadPath}/${finalFileName}`;

    // Clean up token
    this.uploadTokens.delete(token);

    return {
      fileName: finalFileName,
      originalName,
      mimeType,
      size: fileBuffer.length,
      url,
      path: `${uploadToken.uploadPath}/${finalFileName}`,
    };
  }

  /**
   * Base64 string'i upload eder (legacy support)
   */
  async uploadBase64(
    category: "collections" | "samples" | "users" | "temp",
    base64Data: string,
    fileName?: string
  ): Promise<UploadResult> {
    // Parse base64 data
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      throw new Error("Invalid base64 data");
    }

    const mimeType = matches[1];
    const base64Content = matches[2];

    if (!mimeType || !base64Content) {
      throw new Error("Invalid base64 format");
    }

    const buffer = Buffer.from(base64Content, "base64");
    const originalName = fileName || "upload";

    // Generate token and upload
    const token = await this.generateUploadToken(category, {
      allowedTypes: [mimeType],
    });

    return this.uploadWithToken(token.token, buffer, originalName, mimeType);
  }

  /**
   * Image processing ile upload
   */
  async uploadAndProcessImage(
    category: "collections" | "samples" | "users" | "temp",
    fileBuffer: Buffer,
    originalName: string,
    processingOptions: ImageProcessingOptions = {}
  ): Promise<UploadResult> {
    const { resize, quality = 85, format = "webp" } = processingOptions;

    let processedBuffer = fileBuffer;

    // Process image if it's an image
    const mimeType = mime.lookup(originalName) || "application/octet-stream";

    if (mimeType.startsWith("image/")) {
      let sharpInstance = sharp(fileBuffer);

      if (resize) {
        sharpInstance = sharpInstance.resize(resize.width, resize.height, {
          fit: resize.fit || "cover",
        });
      }

      // Convert to specified format
      switch (format) {
        case "jpeg":
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case "png":
          sharpInstance = sharpInstance.png({ quality });
          break;
        case "webp":
          sharpInstance = sharpInstance.webp({ quality });
          break;
      }

      processedBuffer = await sharpInstance.toBuffer();
    }

    const finalMimeType =
      format === "webp"
        ? "image/webp"
        : format === "jpeg"
        ? "image/jpeg"
        : format === "png"
        ? "image/png"
        : mimeType;

    // Generate token and upload
    const token = await this.generateUploadToken(category, {
      allowedTypes: [finalMimeType],
    });

    return this.uploadWithToken(
      token.token,
      processedBuffer,
      originalName,
      finalMimeType
    );
  }

  /**
   * Dosya siler
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.baseUploadPath, filePath);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  /**
   * Dosya var mı kontrol eder
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.baseUploadPath, filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Dosya bilgilerini getirir
   */
  async getFileInfo(filePath: string) {
    try {
      const fullPath = path.join(this.baseUploadPath, filePath);
      const stats = await fs.stat(fullPath);
      const mimeType = mime.lookup(fullPath) || "application/octet-stream";

      return {
        size: stats.size,
        mimeType,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        exists: true,
      };
    } catch {
      return { exists: false };
    }
  }

  /**
   * Temp dosyaları temizler (24 saatten eski)
   */
  async cleanupTempFiles(): Promise<number> {
    try {
      const tempDir = path.join(this.baseUploadPath, "temp");
      const files = await fs.readdir(tempDir);
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);

        if (stats.birthtime.getTime() < oneDayAgo) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error("Error cleaning temp files:", error);
      return 0;
    }
  }

  /**
   * Süresi geçmiş tokenları temizler
   */
  private cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [token, uploadToken] of this.uploadTokens.entries()) {
      if (now > uploadToken.expiresAt) {
        this.uploadTokens.delete(token);
      }
    }
  }

  /**
   * Upload statistics
   */
  getStats() {
    return {
      activeTokens: this.uploadTokens.size,
      baseUploadPath: this.baseUploadPath,
      baseUrl: this.baseUrl,
    };
  }
}

// Singleton instance
export const uploadService = new UploadService();
