import type { YogaInitialContext } from "graphql-yoga";
import prisma from "../../lib/prisma.js";

export type GraphQLContext = YogaInitialContext & {
  user?: {
    id: number;
    email: string;
    role: string;
    companyId?: number;
    department?: string | null;
  } | null;
  prisma: typeof prisma;
};

export async function createContext(
  initialContext: YogaInitialContext
): Promise<GraphQLContext> {
  // Extract JWT payload from initial context (set by @graphql-yoga/plugin-jwt)
  let jwt = (initialContext as any).jwt?.payload;

  // WebSocket support: Extract token from connection params if not in HTTP headers
  if (!jwt && (initialContext as any).connectionParams) {
    const connectionParams = (initialContext as any).connectionParams;
    const token = connectionParams.authorization || connectionParams.Authorization;

    if (token) {
      // Manual JWT verification for WebSocket connections
      try {
        const jwt_module = await import('jsonwebtoken');
        const secret = process.env.JWT_SECRET || 'fallback-secret-only-for-dev';
        const bearerToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        // Handle both ESM and CJS imports
        const verify = jwt_module.default?.verify || jwt_module.verify;
        jwt = verify(bearerToken, secret) as any;
        console.log("🔌 WebSocket JWT verified:", { sub: jwt.sub, email: jwt.email });
      } catch (error) {
        console.warn("❌ WebSocket JWT verification failed:", error);
      }
    }
  }

  // Map JWT payload to user object for GraphQL context
  const user = jwt ? {
    id: parseInt(jwt.sub),
    email: jwt.email,
    role: jwt.role,
    companyId: jwt.companyId || undefined,
    department: jwt.department || null,
  } : null;

  // Debug: Log JWT and user context
  if (jwt) {
    console.log("🔑 JWT Payload:", {
      sub: jwt.sub,
      email: jwt.email,
      role: jwt.role,
      companyId: jwt.companyId,
      department: jwt.department,
    });
    console.log("👤 User Context:", user);
  }

  return {
    ...initialContext,
    user,
    prisma,
  };
}
