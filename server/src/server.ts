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
  appRef.use(cors());

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
});

async function startServer() {
  console.log(`Starting server in ${env} mode on port ${port}`);
  await apolloServer.start();

  initializeMiddleware(app);

  // REST endpoint for file uploads
  app.post("/api/upload", (req, res) => {
    upload.single("file")(req, res, async (err: any) => {
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

        // Determine subfolder from mimetype (same logic as multer)
        let subfolder = "temp";
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

        const fileInfo = {
          id: req.file.filename,
          filename: req.file.originalname,
          path: `/uploads/${subfolder}/${req.file.filename}`, // Include subfolder
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
