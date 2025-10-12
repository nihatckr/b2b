import express, { Request, Response } from "express";
import multer from "multer";
import { uploadService } from "../services/UploadService";

// Multer config for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

export const uploadRouter = express.Router();

// POST /upload/:token - Upload file with token
uploadRouter.post(
  "/upload/:token",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }

      if (!token) {
        return res.status(400).json({ error: "No upload token provided" });
      }

      const result = await uploadService.uploadWithToken(
        token,
        file.buffer,
        file.originalname,
        file.mimetype
      );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }
);

// GET /uploads/:category/:filename - Serve uploaded files
uploadRouter.get(
  "/uploads/:category/:filename",
  async (req: Request, res: Response) => {
    try {
      const { category, filename } = req.params;
      const filePath = `${category}/${filename}`;

      const fileInfo = await uploadService.getFileInfo(filePath);

      if (!fileInfo.exists) {
        return res.status(404).json({ error: "File not found" });
      }

      // Set proper headers
      if (fileInfo.mimeType) {
        res.setHeader("Content-Type", fileInfo.mimeType);
      }

      if (fileInfo.size) {
        res.setHeader("Content-Length", fileInfo.size);
      }

      // Cache headers
      res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
      res.setHeader("ETag", `"${filename}"`);

      // Stream file
      const fs = require("fs");
      const path = require("path");
      const fullPath = path.join(process.cwd(), "uploads", filePath);

      const stream = fs.createReadStream(fullPath);
      stream.pipe(res);

      stream.on("error", (error: Error) => {
        console.error("File stream error:", error);
        return res.status(500).json({ error: "Error streaming file" });
      });

      // Return after streaming is set up
      return;
    } catch (error) {
      console.error("File serve error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// DELETE /uploads/:category/:filename - Delete file (authenticated)
uploadRouter.delete(
  "/uploads/:category/:filename",
  async (req: Request, res: Response) => {
    try {
      const { category, filename } = req.params;
      const filePath = `${category}/${filename}`;

      // TODO: Add authentication middleware here
      // For now, we'll just allow deletion

      const deleted = await uploadService.deleteFile(filePath);

      if (deleted) {
        res.json({ success: true, message: "File deleted successfully" });
      } else {
        res.status(404).json({
          success: false,
          error: "File not found or could not be deleted",
        });
      }
    } catch (error) {
      console.error("File deletion error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /upload/stats - Get upload service statistics (admin only)
uploadRouter.get("/upload/stats", (req: Request, res: Response) => {
  try {
    // TODO: Add admin authentication middleware
    const stats = uploadService.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /upload/cleanup - Clean temp files (admin only)
uploadRouter.post("/upload/cleanup", async (req: Request, res: Response) => {
  try {
    // TODO: Add admin authentication middleware
    const deletedCount = await uploadService.cleanupTempFiles();
    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} temporary files`,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
