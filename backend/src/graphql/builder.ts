import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import RelayPlugin from "@pothos/plugin-relay";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";

import type { YogaInitialContext } from "graphql-yoga";
import prisma from "../../lib/prisma";

import { DateResolver, JSONResolver } from "graphql-scalars";
import type PrismaTypes from "../../lib/pothos-prisma-types"; // path to generated types, specified in your prisma.schema
import { getDatamodel } from "../../lib/pothos-prisma-types";

// removed duplicate/incorrect SchemaBuilder; the fully-configured `export const builder` below is used

// Context type for GraphQL requests
export interface Context extends YogaInitialContext {
  user?: {
    id: number;
    email: string;
    role: string;
    companyId?: number;
  } | null;
  prisma: typeof prisma;
}

// Schema Builder configuration with all plugins
export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: Context;
  AuthScopes: {
    public: boolean;
    user: boolean;
    admin: boolean;
    companyOwner: boolean;
    employee: boolean;
  };
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
    JSON: {
      Input: unknown;
      Output: unknown;
    };
  };
}>({
  plugins: [ScopeAuthPlugin, PrismaPlugin, RelayPlugin],
  prisma: {
    client: prisma,
    dmmf: getDatamodel(),
    exposeDescriptions: { models: true, fields: true },
    // use where clause from prismaRelatedConnection for totalCount (defaults to true)
    filterConnectionTotalCount: true,
    // warn when not using a query parameter correctly
    onUnusedQuery: process.env.NODE_ENV === "production" ? null : "warn",
  },

  scopeAuth: {
    authScopes: async (context: Context) => ({
      public: true,
      user: !!context.user,
      admin: context.user?.role === "ADMIN",
      companyOwner: context.user?.role === "COMPANY_OWNER",
      employee: context.user?.role === "COMPANY_EMPLOYEE",
    }),
  },
});

builder.addScalarType("JSON", JSONResolver);
builder.addScalarType("DateTime", DateResolver);

// Query and Mutation root types
builder.queryType({
  description: "Root Query",
});

builder.mutationType({
  description: "Root Mutation",
});

export default builder;
