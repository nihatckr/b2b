import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import type { YogaInitialContext } from 'graphql-yoga';
import type PrismaTypes from '../../lib/pothos-prisma-types';
import prisma from '../../lib/prisma';

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

// Simple Schema Builder with just Prisma plugin
export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: Context;
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
  };
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
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

// Query and Mutation root types
builder.queryType({
  description: 'Root Query',
});

builder.mutationType({
  description: 'Root Mutation',
});
