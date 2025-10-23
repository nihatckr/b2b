/**
 * File Upload Routes
 *
 * Handles file uploads with:
 * - Image optimization (sharp)
 * - Organized folder structure
 * - File deletion with cleanup
 * - Authentication required
 */

import express, { Request, Response } from "express";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// CORS middleware for upload routes
router.use((req, res, next) => {
  console.log(`📤 Upload Route Hit: ${req.method} ${req.url}`);

  const isDev = process.env.NODE_ENV === "development";
  const allowedOrigins = isDev
    ? ["http://localhost:3000", "http://localhost:3001"]
    : process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : [];

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  // Handle preflight
  if (req.method === "OPTIONS") {
    console.log("✅ OPTIONS preflight handled");
    return res.status(200).end();
  }

  next();
});

// Create upload directories if they don't exist
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const COMPANY_LOGOS_DIR = path.join(UPLOAD_DIR, "companies", "logos");
const COMPANY_COVERS_DIR = path.join(UPLOAD_DIR, "companies", "covers");
const USER_AVATARS_DIR = path.join(UPLOAD_DIR, "users", "avatars");
const LIBRARY_FABRICS_DIR = path.join(UPLOAD_DIR, "library", "fabrics");
const LIBRARY_ACCESSORIES_DIR = path.join(UPLOAD_DIR, "library", "accessories");
const LIBRARY_CERTIFICATIONS_DIR = path.join(
  UPLOAD_DIR,
  "library",
  "certifications"
);
const LIBRARY_MATERIALS_DIR = path.join(UPLOAD_DIR, "library", "materials");
const DOCUMENTS_DIR = path.join(UPLOAD_DIR, "documents");
const COLLECTIONS_DIR = path.join(UPLOAD_DIR, "collections");
const TEMP_DIR = path.join(UPLOAD_DIR, "temp");

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(COMPANY_LOGOS_DIR, { recursive: true });
  await fs.mkdir(COMPANY_COVERS_DIR, { recursive: true });
  await fs.mkdir(USER_AVATARS_DIR, { recursive: true });
  await fs.mkdir(LIBRARY_FABRICS_DIR, { recursive: true });
  await fs.mkdir(LIBRARY_ACCESSORIES_DIR, { recursive: true });
  await fs.mkdir(LIBRARY_CERTIFICATIONS_DIR, { recursive: true });
  await fs.mkdir(LIBRARY_MATERIALS_DIR, { recursive: true });
  await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
  await fs.mkdir(COLLECTIONS_DIR, { recursive: true });
  await fs.mkdir(TEMP_DIR, { recursive: true });
}

ensureDirectories().catch(console.error);

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    // Accept images, PDFs, Office documents, and SVG
    const allowedMimeTypes = [
      "image/",
      "image/svg+xml",
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/csv",
    ];

    const isAllowed = allowedMimeTypes.some(
      (type) => file.mimetype.startsWith(type) || file.mimetype === type
    );

    if (isAllowed) {
      return cb(null, true);
    }
    cb(new Error("Only images, PDFs, Excel, Word, and CSV files are allowed"));
  },
});

// Simple JWT verification middleware
const authenticate = async (req: Request, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("🔐 Upload Auth Debug:", {
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader?.substring(0, 30) + "...",
    });

    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      console.error("❌ No token provided");
      return res.status(401).json({ error: "No token provided" });
    }

    console.log("🔑 Token to verify:", {
      tokenLength: token.length,
      tokenStart: token.substring(0, 20),
      tokenEnd: token.substring(token.length - 20),
    });

    const secret = process.env.JWT_SECRET || "fallback-secret-only-for-dev";
    console.log(
      "🔐 Using secret:",
      secret === "fallback-secret-only-for-dev" ? "FALLBACK" : "ENV_VAR"
    );

    const decoded = jwt.verify(token, secret) as any;

    console.log("✅ Token verified:", {
      userId: decoded.sub,
      email: decoded.email,
    });

    (req as any).user = { id: decoded.sub, email: decoded.email };
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Optimize image based on type
async function optimizeImage(
  inputPath: string,
  outputPath: string,
  type: "logo" | "cover" | "avatar"
): Promise<void> {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  switch (type) {
    case "logo":
      // Logos: max 512x512, preserve transparency
      await image
        .resize(512, 512, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(outputPath);
      break;

    case "cover":
      // Cover images: max 1920x1080, optimize for web
      await image
        .resize(1920, 1080, {
          fit: "cover",
          position: "center",
        })
        .jpeg({ quality: 85, progressive: true })
        .toFile(outputPath);
      break;

    case "avatar":
      // Avatars: 256x256, circular crop
      await image
        .resize(256, 256, {
          fit: "cover",
          position: "center",
        })
        .png({ quality: 90 })
        .toFile(outputPath);
      break;
  }
}

// Upload endpoint
router.post(
  "/",
  authenticate,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      console.log("📤 Upload Request:", {
        hasFile: !!req.file,
        uploadType: req.query.type,
        category: req.body.category,
        mimetype: req.file?.mimetype,
      });

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const category = req.body.category || "general"; // collections, documents, etc.
      const uploadType = (req.query.type as string) || "logo"; // logo, cover, avatar
      const tempPath = req.file.path;

      console.log("📂 Target directory calculation:", {
        uploadType,
        category,
        tempPath,
      });
      const isPdf = req.file.mimetype === "application/pdf";
      const isSvg = req.file.mimetype === "image/svg+xml";
      const isDocument =
        req.file.mimetype === "application/vnd.ms-excel" ||
        req.file.mimetype ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        req.file.mimetype === "application/msword" ||
        req.file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        req.file.mimetype === "text/csv";
      const isImage = req.file.mimetype.startsWith("image/") && !isSvg;

      // Determine target directory
      let targetDir: string;

      // First check specific upload types (they have priority)
      if (uploadType === "fabrics") {
        targetDir = LIBRARY_FABRICS_DIR;
      } else if (uploadType === "accessories") {
        targetDir = LIBRARY_ACCESSORIES_DIR;
      } else if (uploadType === "certifications") {
        targetDir = LIBRARY_CERTIFICATIONS_DIR;
      } else if (uploadType === "materials") {
        targetDir = LIBRARY_MATERIALS_DIR;
      } else if (uploadType === "collections" || category === "collections") {
        // Collection images go to collections folder
        targetDir = COLLECTIONS_DIR;
      } else if (
        uploadType === "documents" ||
        category === "documents" ||
        isPdf ||
        isDocument
      ) {
        // Generic documents go to documents folder
        targetDir = DOCUMENTS_DIR;
      } else {
        // Default image handling (logos, covers, avatars)
        switch (uploadType) {
          case "cover":
            targetDir = COMPANY_COVERS_DIR;
            break;
          case "avatar":
            targetDir = USER_AVATARS_DIR;
            break;
          case "logo":
          default:
            targetDir = COMPANY_LOGOS_DIR;
            break;
        }
      }

      // Generate filename
      const ext = isPdf
        ? ".pdf"
        : isSvg
        ? ".svg"
        : isDocument
        ? path.extname(req.file.originalname)
        : path.extname(req.file.originalname);
      const filename = `${uuidv4()}${ext}`;
      const outputPath = path.join(targetDir, filename);

      console.log("💾 File processing:", {
        targetDir,
        filename,
        outputPath,
        isPdf,
        isSvg,
        isDocument,
        isImage,
      });

      if (isPdf || isDocument || isSvg) {
        // Just move document files and SVGs, no optimization
        await fs.rename(tempPath, outputPath);
      } else if (isImage) {
        // Optimize images (PNG, JPEG, etc.)
        const optimizeType: "logo" | "cover" | "avatar" =
          uploadType === "cover"
            ? "cover"
            : uploadType === "avatar"
            ? "avatar"
            : "logo";

        await optimizeImage(tempPath, outputPath, optimizeType);

        // Wait a bit before unlinking (Sharp may still have file handle)
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
          await fs.unlink(tempPath);
        } catch (unlinkError: any) {
          // If file is still locked, log but don't fail the request
          if (unlinkError.code === 'EBUSY' || unlinkError.code === 'EPERM') {
            console.warn(`⚠️ Could not delete temp file (locked), will be cleaned up later: ${tempPath}`);
          } else {
            throw unlinkError;
          }
        }
      } else {
        // Just move other file types
        await fs.rename(tempPath, outputPath);
      }

      // Construct relative URL (same priority order as target directory)
      const relativeDir =
        uploadType === "fabrics"
          ? "library/fabrics"
          : uploadType === "accessories"
          ? "library/accessories"
          : uploadType === "certifications"
          ? "library/certifications"
          : uploadType === "materials"
          ? "library/materials"
          : uploadType === "collections" || category === "collections"
          ? "collections"
          : uploadType === "documents" ||
            category === "documents" ||
            isPdf ||
            isDocument
          ? "documents"
          : uploadType === "cover"
          ? "companies/covers"
          : uploadType === "avatar"
          ? "users/avatars"
          : "companies/logos";

      const url = `/uploads/${relativeDir}/${filename}`;

      res.json({
        success: true,
        url,
        path: url,
        filename,
        type: uploadType,
        category,
      });
    } catch (error) {
      console.error("Upload error:", error);

      // Cleanup temp file on error
      if (req.file?.path) {
        try {
          // Wait a bit before unlinking
          await new Promise(resolve => setTimeout(resolve, 100));
          await fs.unlink(req.file.path);
        } catch (cleanupError: any) {
          // Don't fail if file is locked
          if (cleanupError.code !== 'EBUSY' && cleanupError.code !== 'EPERM') {
            console.error("Cleanup error:", cleanupError);
          }
        }
      }

      res.status(500).json({
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }
);

// Delete endpoint
router.delete(
  "/:filename",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;

      if (!filename) {
        return res.status(400).json({ error: "Filename is required" });
      }

      const type = (req.query.type as string) || "logo";

      // Determine directory
      let targetDir: string;
      switch (type) {
        case "cover":
          targetDir = COMPANY_COVERS_DIR;
          break;
        case "avatar":
          targetDir = USER_AVATARS_DIR;
          break;
        case "logo":
        default:
          targetDir = COMPANY_LOGOS_DIR;
          break;
      }

      const filePath = path.join(targetDir, filename);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ error: "File not found" });
      }

      // Delete file
      await fs.unlink(filePath);

      res.json({ success: true, message: "File deleted successfully" });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Delete failed",
      });
    }
  }
);

export default router;
