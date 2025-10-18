import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import RelayPlugin from "@pothos/plugin-relay";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import DataloaderPlugin from '@pothos/plugin-dataloader';
import type { YogaInitialContext } from "graphql-yoga";
import prisma from "../../lib/prisma";
import ValidationPlugin from '@pothos/plugin-validation';
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
    File: {
      Input: File;
      Output: never;
    };
  };
}>({
  plugins: [ScopeAuthPlugin, PrismaPlugin, RelayPlugin, DataloaderPlugin, ValidationPlugin],
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

// File scalar for GraphQL Yoga v5 (WHATWG File API)
// Reference: https://the-guild.dev/graphql/yoga-server/docs/features/file-uploads
builder.scalarType("File", {
  serialize: () => {
    throw new Error("File scalar cannot be serialized (output only)");
  },
});

// Query and Mutation root types
builder.queryType({
  description: "Root Query",
});

builder.mutationType({
  description: "Root Mutation",
});

builder.subscriptionType({
  description: "Root Subscription for Real-Time Updates",
});

export default builder;
