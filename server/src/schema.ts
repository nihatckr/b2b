import { makeSchema } from "nexus";
import { join } from "path";
import { Mutation } from "./graphql/types/objects/mutation";
import { Query } from "./graphql/types/objects/query";
import { User } from "./graphql/types/objects/user";

// Create minimal schema for now
const schemaWithoutPermissions = makeSchema({
  types: [Query, Mutation, User],
  outputs: {
    typegen: join(
      process.cwd(),
      "node_modules",
      "@types",
      "nexus-typegen",
      "index.d.ts"
    ),
    schema: join(process.cwd(), "src", "schema.graphql"),
  },
  contextType: {
    module: join(process.cwd(), "src", "context.ts"),
    export: "Context",
  },
  sourceTypes: {
    modules: [
      {
        module: "@prisma/client",
        alias: "prisma",
      },
    ],
  },
});
export const schema = schemaWithoutPermissions;
