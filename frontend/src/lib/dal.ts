/**
 * Data Access Layer (DAL)
 *
 * Centralizes authorization logic for server components
 * Uses React cache() for optimal performance
 */

import { getServerSession } from "next-auth/next";
import { cache } from "react";
import { authOptions } from "./auth";

// User roles
export enum UserRole {
  ADMIN = "ADMIN",
  MANUFACTURER = "MANUFACTURER",
  CUSTOMER = "CUSTOMER",
  USER = "USER",
}

// Session data type
export interface SessionData {
  isAuth: boolean;
  userId: string;
  email: string;
  role: UserRole;
  companyId?: string;
  backendToken?: string;
}

/**
 * Verify user session (cached for request lifecycle)
 * Throws error if not authenticated
 */
export const verifySession = cache(async (): Promise<SessionData> => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized: No active session");
  }

  return {
    isAuth: true,
    userId: session.user.id,
    email: session.user.email || "",
    role: session.user.role as UserRole,
    companyId: session.user.companyId,
    backendToken: session.user.backendToken,
  };
});

/**
 * Get session data without throwing error
 * Returns null if not authenticated
 */
export const getSession = cache(
  async (): Promise<SessionData | null> => {
    try {
      return await verifySession();
    } catch {
      return null;
    }
  }
);

/**
 * Check if user has specific role
 */
export async function hasRole(
  allowedRoles: UserRole[]
): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return allowedRoles.includes(session.role);
}

/**
 * Verify user has required role (throws if not)
 */
export async function verifyRole(allowedRoles: UserRole[]): Promise<void> {
  const session = await verifySession();

  if (!allowedRoles.includes(session.role)) {
    throw new Error(
      `Forbidden: Required role ${allowedRoles.join(" or ")}, but user has ${session.role}`
    );
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole([UserRole.ADMIN]);
}

/**
 * Verify user is admin (throws if not)
 */
export async function verifyAdmin(): Promise<void> {
  return verifyRole([UserRole.ADMIN]);
}

/**
 * Check if user is manufacturer
 */
export async function isManufacturer(): Promise<boolean> {
  return hasRole([UserRole.MANUFACTURER, UserRole.ADMIN]);
}

/**
 * Verify user is manufacturer (throws if not)
 */
export async function verifyManufacturer(): Promise<void> {
  return verifyRole([UserRole.MANUFACTURER, UserRole.ADMIN]);
}

/**
 * Check if user is customer
 */
export async function isCustomer(): Promise<boolean> {
  return hasRole([UserRole.CUSTOMER, UserRole.ADMIN]);
}

/**
 * Verify user is customer (throws if not)
 */
export async function verifyCustomer(): Promise<void> {
  return verifyRole([UserRole.CUSTOMER, UserRole.ADMIN]);
}

/**
 * Check if user owns resource
 */
export async function ownsResource(resourceUserId: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  // Admin can access all resources
  if (session.role === UserRole.ADMIN) return true;

  return session.userId === resourceUserId;
}

/**
 * Verify user owns resource (throws if not)
 */
export async function verifyResourceOwnership(
  resourceUserId: string
): Promise<void> {
  const isOwner = await ownsResource(resourceUserId);

  if (!isOwner) {
    throw new Error("Forbidden: You don't have access to this resource");
  }
}

/**
 * Check if user belongs to company
 */
export async function belongsToCompany(companyId: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  // Admin can access all companies
  if (session.role === UserRole.ADMIN) return true;

  return session.companyId === companyId;
}

/**
 * Verify user belongs to company (throws if not)
 */
export async function verifyCompanyAccess(companyId: string): Promise<void> {
  const hasAccess = await belongsToCompany(companyId);

  if (!hasAccess) {
    throw new Error("Forbidden: You don't have access to this company");
  }
}

/**
 * Get backend authorization header
 */
export async function getAuthHeader(): Promise<string> {
  const session = await verifySession();

  if (!session.backendToken) {
    throw new Error("No backend token available");
  }

  return `Bearer ${session.backendToken}`;
}
