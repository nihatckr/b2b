import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import "dotenv/config";
import express from "express";
import http from "http";
import multer from "multer";
import path from "path";
import { Context, createContext } from "./context";
import { schema } from "./schema";
import "./utils/productionScheduler"; // Auto-start production deadline checker

// Constants
const port = process.env.PORT || 4000;
const env = process.env.NODE_ENV || "development";
const graphqlPath = "/graphql";
const app = express();
const httpServer = http.createServer(app);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine subfolder based on file type or request metadata
    let subfolder = "temp";

    if (file.mimetype.startsWith("image/")) {
      subfolder = "collections"; // Images go to collections/
    } else if (
      file.mimetype === "application/pdf" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      subfolder = "documents"; // PDFs and Excel files go to documents/
    }

    const uploadPath = path.join(process.cwd(), "uploads", subfolder);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Get file extension
    const ext = path.extname(file.originalname);
    // Remove extension, sanitize, then add extension back
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt
      .normalize("NFD") // Normalize Turkish chars
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-zA-Z0-9]/g, "_") // Replace non-alphanumeric with underscore
      .substring(0, 50); // Limit length
    cb(null, uniqueSuffix + "-" + sanitizedName + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50000000 }, // 50MB (for PDFs and large files)
  fileFilter: (req, file, cb) => {
    console.log(`📤 Uploading file: ${file.originalname} (${file.mimetype})`);

    // Allowed types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.error(`❌ File type not allowed: ${file.mimetype}`);
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  },
});

// Middleware Initialization

function initializeMiddleware(appRef: typeof app) {
  // CORS configuration - allow credentials with specific origin
  appRef.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }));

  // Static files serving for uploads
  appRef.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  appRef.use(express.urlencoded({ limit: "2mb", extended: true }));
  appRef.use(express.json({ limit: "2mb" }));
}

// Apollo Server setup
const apolloServer = new ApolloServer<Context>({
  schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  introspection: env !== "production",
  formatError: (formattedError, error) => {
    // Log all GraphQL errors to console
    console.error("❌ GraphQL Error:", {
      message: formattedError.message,
      path: formattedError.path,
      extensions: formattedError.extensions,
      originalError: error,
    });
    return formattedError;
  },
});

async function startServer() {
  console.log(`Starting server in ${env} mode on port ${port}`);

  // Ensure upload directories exist
  const fs = require("fs");
  const uploadDirs = ["collections", "documents", "production", "sketches", "temp"];
  uploadDirs.forEach((dir) => {
    const dirPath = path.join(process.cwd(), "uploads", dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dirPath}`);
    }
  });

  await apolloServer.start();

  initializeMiddleware(app);

  // --- Debug middleware: log incoming GraphQL POST bodies (truncated) ---
  app.use((req, _res, next) => {
    try {
      if (req.method === "POST" && req.path === graphqlPath) {
        const maxLen = 2000; // truncate large bodies
        let bodyPreview = "";
        try {
          bodyPreview = JSON.stringify(req.body);
        } catch (e) {
          bodyPreview = String(req.body || "(unserializable)");
        }

        if (bodyPreview.length > maxLen) {
          bodyPreview = bodyPreview.slice(0, maxLen) + "...[truncated]";
        }

        console.log("📥 Incoming GraphQL POST ->", {
          method: req.method,
          path: req.path,
          auth: !!req.headers["authorization"],
          body: bodyPreview,
        });
      }
    } catch (err) {
      console.error("Error in GraphQL request logger:", err);
    }

    return next();
  });

  // Handle preflight requests for upload endpoint
  app.options("/api/upload", (req, res) => {
    res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL || "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(200);
  });

  // REST endpoint for file uploads
  app.post("/api/upload", (req, res) => {
    // Set CORS headers for upload endpoint
    res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL || "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");

    // Parse form data to get subfolder before multer processes
    const multerUpload = upload.single("file");

    multerUpload(req, res, async (err: any) => {
      if (err) {
        console.error("❌ Multer error:", err);
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "Dosya çok büyük (max 50MB)" });
        }
        return res.status(400).json({
          error: err.message || "Dosya yüklenemedi",
        });
      }

      try {
        if (!req.file) {
          return res.status(400).json({ error: "Dosya seçilmedi" });
        }

        console.log(
          `📤 File received: ${req.file.originalname} (${req.file.mimetype})`
        );

        // Get subfolder from request body or determine from mimetype
        let subfolder = (req.body as any).subfolder || "temp";

        // If no subfolder specified, use mimetype logic
        if (subfolder === "temp") {
          if (req.file.mimetype.startsWith("image/")) {
            subfolder = "collections";
          } else if (
            req.file.mimetype === "application/pdf" ||
            req.file.mimetype ===
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            req.file.mimetype === "application/vnd.ms-excel"
          ) {
            subfolder = "documents";
          }
        }

        // Move file to correct subfolder if needed
        const fs = require("fs");
        const currentPath = req.file.path;
        const targetDir = path.join(process.cwd(), "uploads", subfolder);
        const targetPath = path.join(targetDir, req.file.filename);

        // Create target directory if it doesn't exist
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // Move file if not already in correct location
        if (currentPath !== targetPath) {
          fs.renameSync(currentPath, targetPath);
        }

        const fileInfo = {
          id: req.file.filename,
          filename: req.file.originalname,
          path: `/uploads/${subfolder}/${req.file.filename}`,
          size: req.file.size,
          mimetype: req.file.mimetype,
          encoding: req.file.encoding || "7bit",
        };

        console.log(`✅ File uploaded successfully: ${fileInfo.path}`);
        return res.json({ data: fileInfo });
      } catch (error) {
        console.error("❌ Upload processing error:", error);
        return res.status(500).json({
          error:
            error instanceof Error ? error.message : "Dosya yükleme hatası",
        });
      }
    });
  });

  app.use(
    "/",
    cors<cors.CorsRequest>(),
    express.json(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(apolloServer, {
      context: async ({ req }) => createContext({ req }),
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: Number(port) }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:${port}${graphqlPath}`);
  console.log(
    `📤 Upload endpoint ready at http://localhost:${port}/api/upload`
  );
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
