import { makeSchema } from "nexus";
import { join } from "path";
import { Mutation } from './mutations/Mutation';
import { Query } from './query/Query';
import * as types from './types';

// Create minimal schema for now
const schemaWithoutPermissions = makeSchema({
  types:[ Mutation, Query, types],
  outputs: {
    typegen: join(
      process.cwd(),
      "node_modules",
      "@types",
      "nexus-typegen",
      "index.d.ts"
    ),
    schema: join(process.cwd(), "src", "my-schema.graphql"),
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
