import { builder } from "./builder";

// Import all enums
import "./enums";

// Import all types
import "./types";

// Import all queries
import "./queries";

// Import all mutations
import "./mutations";

// Import all subscriptions
import "./subscriptions";

// Build and export the GraphQL schema
// Note: @cacheControl directive is automatically added by useResponseCache plugin
// You can use it in your schema like: type Query { me: User @cacheControl(maxAge: 10, scope: PRIVATE) }
export const schema = builder.toSchema();
