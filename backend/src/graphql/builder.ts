import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import RelayPlugin from '@pothos/plugin-relay';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import ValidationPlugin from '@pothos/plugin-validation';
import type { YogaInitialContext } from 'graphql-yoga';
import type PrismaTypes from '../../lib/pothos-prisma-types';
import prisma from '../../lib/prisma';
import { Prisma } from '../generated/prisma';

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
    manufacturer: boolean;
    customer: boolean;
  };
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
    JSON: {
      Input: Prisma.JsonValue;
      Output: Prisma.JsonValue;
    };
  };
}>({
  plugins: [PrismaPlugin, RelayPlugin, ScopeAuthPlugin, ValidationPlugin],
  prisma: {
    client: prisma,
  },
  relayOptions: {
    // Configure relay cursor connections
    clientMutationId: 'omit',
    cursorType: 'String',
  },
  scopeAuth: {
    // Authorization configuration
    authScopes: async (context) => ({
      public: true,
      user: !!context.user,
      admin: context.user?.role === 'ADMIN',
      manufacturer: context.user?.role === 'MANUFACTURER' || context.user?.role === 'COMPANY_OWNER',
      customer: context.user?.role === 'CUSTOMER',
    }),
  },
});

// Define custom scalars
builder.scalarType('DateTime', {
  serialize: (value) => value.toISOString(),
  parseValue: (value) => {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('DateTime must be a string');
  },
});

builder.scalarType('JSON', {
  serialize: (value) => value,
  parseValue: (value) => value,
});

// Query and Mutation root types
builder.queryType({
  description: 'Root Query',
});

builder.mutationType({
  description: 'Root Mutation',
});
