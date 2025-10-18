import { builder } from "./builder";

// Import all types
import "./types";

// Import all queries
import "./queries";

// Import all mutations
import "./mutations";

// Build and export the GraphQL schema
export const schema = builder.toSchema();
