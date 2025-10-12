import { verify } from "jsonwebtoken";
import type { Context } from "../context";

export const APP_SECRET = process.env.JWT_SECRET || "appsecret321";

interface Token {
  userId: string;
}

export function getUserId(context: Context) {
  const authHeader =
    context.req.headers?.authorization || context.req.get?.("Authorization");

  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    try {
      const verifiedToken = verify(token, APP_SECRET) as Token;
      return verifiedToken && Number(verifiedToken.userId);
    } catch (error) {
      // Sadece auth fail'leri log'la
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "❌ Token verification failed:",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
      return null;
    }
  }
  return null;
} // Helper to require authentication
export function requireAuth(context: Context): number {
  const userId = getUserId(context);
  if (!userId) {
    throw new Error("You must be logged in to perform this action");
  }
  return userId;
}

// Validation helpers
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Please provide a valid email address");
  }
}
// Password must be at least 6 characters
export function validatePassword(password: string): void {
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }
}

// Role-based authentication helpers
export async function getUserWithRole(context: Context) {
  const userId = getUserId(context);
  if (!userId) return null;

  return await context.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
}
// Generic role requirement
export async function requireRole(
  context: Context,
  allowedRoles: ("ADMIN" | "MANUFACTURE" | "CUSTOMER")[]
): Promise<{ id: number; role: string }> {
  const user = await getUserWithRole(context);
  if (!user) {
    throw new Error("You must be logged in to perform this action");
  }

  if (!allowedRoles.includes(user.role as any)) {
    throw new Error(
      `Access denied. Required roles: ${allowedRoles.join(", ")}`
    );
  }

  return { id: user.id, role: user.role };
}
// Only admin
export async function requireAdmin(
  context: Context
): Promise<{ id: number; role: string }> {
  return requireRole(context, ["ADMIN"]);
}
// Manufacture or admin
export async function requireManufacture(
  context: Context
): Promise<{ id: number; role: string }> {
  return requireRole(context, ["ADMIN", "MANUFACTURE"]);
}

 // Customer, manufacture or admin
export async function requireCustomer(
  context: Context
): Promise<{ id: number; role: string }> {
  return requireRole(context, ["ADMIN", "MANUFACTURE", "CUSTOMER"]);
}
// Logging helper
export function logAuthAttempt(email: string, success: boolean): void {
  if (process.env.NODE_ENV === "production") return;

  const timestamp = new Date().toISOString();
  console.log(
    `🔐 Auth ${success ? "SUCCESS" : "FAILED"} [${timestamp}] - ${email}`
  );
}
// Helper function for role-based access control
export const canAccessUserData = async (parent: any, context: Context, targetUserId?: number): Promise<boolean> => {
  const currentUserId = getUserId(context);
  if (!currentUserId) return false;

  const currentUser = await context.prisma.user.findUnique({
    where: { id: currentUserId },
    select: { role: true }
  });

  // Admin can access all data
  if (currentUser?.role === "ADMIN") return true;

  // User can access their own data
  if (currentUserId === (targetUserId || parent.id)) return true;

  return false;
};
