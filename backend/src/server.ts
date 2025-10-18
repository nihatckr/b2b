import express from "express";
import { createYoga } from "graphql-yoga";
import { createContext } from "./graphql/context";
import { schema } from "./graphql/schema";

async function main() {
  const app = express();

  // Create GraphQL Yoga server
  const yoga = createYoga({
    schema,
    context: createContext,
  });

  // Use Yoga as middleware
  app.use("/graphql", yoga);

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const basePort = Number(process.env.PORT) || 4001;
  const maxAttempts = 11; // try ports basePort .. basePort+10

  for (let i = 0; i < maxAttempts; i++) {
    const port = basePort + i;
    try {
      await new Promise<void>((resolve, reject) => {
        const server = app.listen(port, () => {
          console.log(`✅ Backend running on http://localhost:${port}/graphql`);
          resolve();
        });
        server.once("error", reject);
      });
      return; // started successfully
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

  console.error(
    `❌ Could not bind to any port between ${basePort} and ${
      basePort + maxAttempts - 1
    }`
  );
  process.exit(1);
}

main().catch(console.error);
