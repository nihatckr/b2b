import SchemaBuilder from "@pothos/core";
import DataloaderPlugin from '@pothos/plugin-dataloader';
import PrismaPlugin from "@pothos/plugin-prisma";
import RelayPlugin from "@pothos/plugin-relay";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import ValidationPlugin from '@pothos/plugin-validation';
import { DateResolver, JSONResolver } from "graphql-scalars";
import type { YogaInitialContext } from "graphql-yoga";
import type PrismaTypes from "../../lib/pothos-prisma-types"; // path to generated types, specified in your prisma.schema
import { getDatamodel } from "../../lib/pothos-prisma-types";
import prisma from "../../lib/prisma";

// removed duplicate/incorrect SchemaBuilder; the fully-configured `export const builder` below is used

// Context type for GraphQL requests
export interface Context extends YogaInitialContext {
  user?: {
    id: number;
    email: string;
    role: string;
    companyId?: number;
    department?: string | null; // Department for permission checks
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
// GraphQL Yoga automatically handles File type with multipart/form-data
// Reference: https://the-guild.dev/graphql/yoga-server/docs/features/file-uploads
builder.scalarType("File", {
  serialize: (value) => {
    throw new Error("File scalar cannot be serialized (output-only type)");
  },
  parseValue: (value) => {
    // GraphQL Yoga provides WHATWG File objects automatically
    // Just pass through the value
    if (value && typeof value === 'object') {
      console.log("🔍 [File Scalar parseValue]:", {
        hasValue: !!value,
        type: typeof value,
        constructor: (value as any)?.constructor?.name,
        name: (value as any)?.name,
        size: (value as any)?.size,
        type_prop: (value as any)?.type,
      });
    }
    return value as File;
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
