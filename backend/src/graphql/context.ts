import { PrismaClient } from '../generated/prisma/index.js';

 import prisma from '../../lib/prisma.js';

export type GraphQLContext = {
  prisma: PrismaClient
}

export async function createContext(): Promise<GraphQLContext> {
  return { prisma }
}
