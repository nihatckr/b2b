import { GraphQLJSON } from "graphql-scalars";
import { asNexusMethod } from "nexus";

// JSON Scalar for dynamic data
export const JSON = asNexusMethod(GraphQLJSON, "json");
