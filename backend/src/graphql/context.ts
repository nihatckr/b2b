import type { YogaInitialContext } from "graphql-yoga";
import prisma from "../../lib/prisma.js";

export type GraphQLContext = YogaInitialContext & {
  user?: {
    id: number;
    email: string;
    role: string;
    companyId?: number;
  } | null;
  prisma: typeof prisma;
};

export async function createContext(
  initialContext: YogaInitialContext
): Promise<GraphQLContext> {
  return {
    ...initialContext,
    user: (initialContext as any).user || null,
    prisma,
  };
}
