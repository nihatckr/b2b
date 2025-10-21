import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import {
  createInlineSigningKeyProvider,
  extractFromHeader,
  useJWT,
} from "@graphql-yoga/plugin-jwt";
import { useResponseCache } from "@graphql-yoga/plugin-response-cache";
import { createFetch } from "@whatwg-node/fetch";
import express from "express";
import { GraphQLError } from "graphql";
import { useServer } from "graphql-ws/use/ws";
import {
  createYoga,
  maskError,
  useExecutionCancellation,
  useReadinessCheck,
} from "graphql-yoga";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import prisma from "../lib/prisma";
import { createContext } from "./graphql/context";
import { schema } from "./graphql/schema";
import uploadRouter from "./routes/upload";

async function main() {
  // Create Express app
  const app = express();

  // File upload routes (must be before other middleware that parses body)
  app.use("/upload", uploadRouter);

  // Serve static files from uploads directory
  app.use("/uploads", express.static("uploads"));

  // Determine if running in development mode
  const isDev = process.env.NODE_ENV === "development";

  // Track shutdown state for graceful shutdown
  let isShuttingDown = false;

  // CORS configuration for cross-origin requests
  const allowedOrigins = isDev
    ? [
        "http://localhost:3000", // Next.js default dev port
        "http://localhost:3001", // Alternative Next.js port
        "http://localhost:4000", // GraphiQL/testing
      ]
    : process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : [];

  // Create GraphQL Yoga server with file upload configuration
  const yoga = createYoga({
    schema,
    context: createContext,
    // CORS configuration for secure cross-origin requests
    cors: {
      origin: allowedOrigins,
      credentials: true, // Allow cookies and Authorization header
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Request-ID", // Custom request tracking
      ],
      methods: ["GET", "POST"], // GraphQL uses POST, GET for persisted queries
      maxAge: 86400, // Cache preflight for 24 hours
    },
    // Configure multipart/form-data limits (GraphQL Yoga v5 pattern)
    fetchAPI: createFetch({
      formDataLimits: {
        fileSize: 10 * 1024 * 1024, // 10MB max per file
        files: 10, // Max 10 files per request
        fieldSize: 1000000, // 1MB max for operations/variables
        headerSize: 1000000, // 1MB max for headers
      },
    }),
    // Enable request batching (multiple operations in single HTTP request)
    // Improves performance by reducing network overhead (6 requests → 1 request)
    batching: {
      limit: 10, // Max 10 operations per batched request
    },
    graphiql: isDev
      ? {
          title: "Textile Management API",
          defaultQuery: `# Welcome to Textile Management API\n# Try a query:\nquery {\n  __typename\n}`,
        }
      : false, // Disable GraphiQL in production
    // Plugins
    plugins: [
      useExecutionCancellation(), // Cancel GraphQL execution when client disconnects
      // JWT Authentication - Verify and decode JWT tokens
      useJWT({
        // Signing key provider - uses JWT_SECRET from environment
        signingKeyProviders: [
          createInlineSigningKeyProvider(
            process.env.JWT_SECRET || "fallback-secret-only-for-dev"
          ),
        ],
        // Token lookup configuration - extract from Authorization header
        tokenLookupLocations: [
          extractFromHeader({ name: "authorization", prefix: "Bearer" }),
        ],
        // Token verification options
        tokenVerification: {
          algorithms: ["HS256"], // Only allow HS256 algorithm
        },
        // Rejection policy - allow public queries but reject invalid tokens
        reject: {
          missingToken: false, // Allow requests without token (for public queries)
          invalidToken: true, // Reject requests with invalid/expired tokens (security)
        },
        // Context injection - JWT payload will be available in context.jwt
        extendContext: true,
      }),
      // Response caching for performance optimization
      useResponseCache({
        // Session-based caching using JWT user ID
        // Extract user ID from JWT token in Authorization header
        session: (request) => {
          // Extract token from Authorization header
          const authHeader = request.headers.get("authorization");
          if (!authHeader) return null;

          // Use the token itself as session identifier
          // JWT plugin will verify and decode it separately
          return authHeader;
        },
        // Global default TTL: 2 seconds for most queries
        ttl: 2_000,
        // Auto-invalidate cache when mutations occur (default: true)
        // When updateUser mutation runs, all cached queries with User type will be invalidated
        invalidateViaMutation: true,
        // Include cache metadata in response extensions (useful for debugging)
        includeExtensionMetadata: isDev,
        // TTL per type (in milliseconds)
        ttlPerType: {
          // Static/rarely changing data - cache longer
          User: 30_000, // 30 seconds (user list changes infrequently)
          Company: 60_000, // 60 seconds (company data rarely changes)
          Workshop: 60_000, // 60 seconds (workshop list is relatively static)
          Category: 60_000, // 60 seconds (categories are static)

          // Frequently changing data - shorter cache
          Order: 5_000, // 5 seconds (orders update frequently)
          Sample: 5_000, // 5 seconds (samples change often)
          Production: 2_000, // 2 seconds (production tracking is real-time)
          Task: 5_000, // 5 seconds (task status updates frequently)
          Message: 2_000, // 2 seconds (messages need to be fresh)
          Notification: 2_000, // 2 seconds (notifications should be real-time)
        },
        // TTL per specific query field (overrides type-level TTL)
        ttlPerSchemaCoordinate: {
          // User-specific queries - cache per session
          "Query.me": 5_000, // 5 seconds (current user data)
          "Query.myTasks": 5_000, // 5 seconds (user's tasks)
          "Query.myWorkshops": 10_000, // 10 seconds (user's workshops)

          // Static data queries - cache longer
          "Query.allManufacturers": 30_000, // 30 seconds (manufacturer list)
          "Query.categories": 60_000, // 60 seconds (category list)
          "Query.workshops": 60_000, // 60 seconds (workshop list)

          // Dashboard/analytics - moderate caching
          "Query.userStats": 10_000, // 10 seconds (user statistics)

          // Frequently updated queries - short cache
          "Query.orders": 5_000, // 5 seconds (order list)
          "Query.samples": 5_000, // 5 seconds (sample list)
          "Query.pendingTasks": 3_000, // 3 seconds (pending tasks)
          "Query.notifications": 2_000, // 2 seconds (notifications)
          "Query.messages": 2_000, // 2 seconds (messages)
        },
        // Scope per schema coordinate (PRIVATE = only cache if session exists)
        scopePerSchemaCoordinate: {
          "Query.me": "PRIVATE", // Only cache for authenticated users
          "Query.myTasks": "PRIVATE", // Only cache for authenticated users
          "Query.myWorkshops": "PRIVATE", // Only cache for authenticated users
        },
      }),
      // Readiness check for production health monitoring
      // Checks database connectivity and system readiness
      useReadinessCheck({
        endpoint: "/ready", // Readiness probe endpoint
        check: async () => {
          try {
            // Return false immediately if server is shutting down
            if (isShuttingDown) {
              console.log(
                "[Health Check] Server is shutting down, marking as not ready"
              );
              return false;
            }

            // Ping database to ensure connectivity
            // This is a lightweight query that tests the connection
            await prisma.$queryRaw`SELECT 1`;

            // If successful, service is ready to handle requests
            return true; // Responds with 200 OK
          } catch (error) {
            // Log error for debugging (server-side only)
            console.error(
              "[Health Check] Database connectivity check failed:",
              error
            );

            // Return false to respond with 503 Service Unavailable
            // This prevents sensitive error details from leaking to clients
            return false;
          }
        },
      }),
      // Disable introspection in production for security
      // But allow it in development for tooling (GraphiQL, Codegen, etc.)
      ...(!isDev ? [useDisableIntrospection()] : []),
    ],
    // Error masking configuration
    maskedErrors: {
      maskError(error, message, isDev) {
        // Expose GraphQLError instances (expected errors with proper error codes)
        if (error instanceof GraphQLError) {
          return error;
        }

        // Mask all other unexpected errors (security best practice)
        return maskError(error, message, isDev);
      },
    },
    // Logging (only in development)
    logging: isDev
      ? {
          debug: (...args) => console.debug("[Yoga Debug]", ...args),
          info: (...args) => console.info("[Yoga Info]", ...args),
          warn: (...args) => console.warn("[Yoga Warn]", ...args),
          error: (...args) => console.error("[Yoga Error]", ...args),
        }
      : false,
  });

  // Use isolated router for GraphQL endpoint (recommended by Yoga docs)
  // This ensures GraphQL-specific configurations don't affect other endpoints
  app.use(yoga.graphqlEndpoint, yoga);

  // Create HTTP server (needed for WebSocket upgrade)
  const httpServer = createServer(app);

  // Configure WebSocket server for GraphQL subscriptions
  // Uses graphql-ws library for GraphQL over WebSocket protocol
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: yoga.graphqlEndpoint,
  });

  // Integrate Yoga's Enveloped instance with graphql-ws
  // This connects the WebSocket server to Yoga's execution layer
  useServer(
    {
      execute: (args: any) => args.rootValue.execute(args),
      subscribe: (args: any) => args.rootValue.subscribe(args),
      onSubscribe: async (ctx, msg, args) => {
        console.log("🔌 WebSocket onSubscribe called");
        console.log("🔌 Subscription ID (msg):", msg);
        console.log("🔌 args keys:", Object.keys(args || {}));
        console.log("🔌 args:", args);

        const { schema, execute, subscribe, contextFactory, parse, validate } =
          yoga.getEnveloped({
            ...ctx,
            req: ctx.extra.request,
            socket: ctx.extra.socket,
            connectionParams: ctx.connectionParams,
          });

        const params = {
          schema,
          operationName: args.operationName,
          document:
            typeof args.query === "string" ? parse(args.query) : args.query,
          variableValues: args.variables,
          contextValue: await contextFactory(),
          rootValue: {
            execute,
            subscribe,
          },
        };

        // Validate GraphQL document
        const errors = validate(params.schema, params.document);
        if (errors.length) return errors;

        return params;
      },
    },
    wsServer
  ); // Health check endpoints are provided by Yoga:
  // - /health (liveness): Built-in, checks if server is running
  // - /ready (readiness): Custom check via useReadinessCheck plugin, checks database connectivity

  const basePort = Number(process.env.PORT) || 4001;
  const maxAttempts = 11; // try ports basePort .. basePort+10

  // Store server instance for graceful shutdown
  let serverInstance: ReturnType<typeof httpServer.listen> | null = null;

  for (let i = 0; i < maxAttempts; i++) {
    const port = basePort + i;
    try {
      await new Promise<void>((resolve, reject) => {
        serverInstance = httpServer.listen(port, () => {
          console.log(`✅ Backend running on http://localhost:${port}/graphql`);
          console.log(
            `✅ WebSocket subscriptions enabled on ws://localhost:${port}/graphql`
          );
          console.log(`💡 Yoga WebSocket protocol: graphql-transport-ws`);
          resolve();
        });
        serverInstance.once("error", reject);
      });
      break; // started successfully
    } catch (err: any) {
      if (err && err.code === "EADDRINUSE") {
        console.warn(`⚠️ Port ${port} in use, trying next port...`);
        // continue to next port
      } else {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
      }
    }
  }

  if (!serverInstance) {
    console.error(
      `❌ Could not bind to any port between ${basePort} and ${
        basePort + maxAttempts - 1
      }`
    );
    process.exit(1);
  }

  // Graceful shutdown handler
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 ${signal} received, starting graceful shutdown...`);

    // Mark as shutting down (readiness check will return false)
    isShuttingDown = true;

    try {
      // 1. Stop accepting new requests
      console.log("📡 Stopping HTTP server from accepting new connections...");
      await new Promise<void>((resolve, reject) => {
        serverInstance!.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log("✅ HTTP server closed");

      // 2. Dispose of Yoga resources (includes WebSocket cleanup)
      console.log("🧹 Disposing Yoga resources...");
      await yoga.dispose();
      console.log("✅ Yoga disposed");

      // 3. Disconnect Prisma
      console.log("🗄️  Disconnecting Prisma...");
      await prisma.$disconnect();
      console.log("✅ Prisma disconnected");

      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during graceful shutdown:", error);
      process.exit(1);
    }
  };

  // Register shutdown handlers for different signals
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM")); // Docker/K8s shutdown
  process.on("SIGINT", () => gracefulShutdown("SIGINT")); // Ctrl+C
}

main().catch(console.error);
