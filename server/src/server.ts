import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import "dotenv/config";
import express from "express";
import http from "http";
import { Context, createContext } from "./context";
import { schema } from "./schema";

// Constants
const port = process.env.PORT || 4000;
const env = process.env.NODE_ENV || "development";
const graphqlPath = "/graphql";
const app = express();
const httpServer = http.createServer(app);

// Middleware Initialization

function initializeMiddleware(appRef: typeof app) {
  appRef.use(cors());
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
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
