/**
 * Data Access Layer (DAL)
 *
 * Centralizes authorization logic for server components
 * Uses React cache() for optimal performance
 */

import { getServerSession } from "next-auth/next";
import { cache } from "react";
import { authOptions } from "./config";

/**
 * ============================================================================
 * ENUMS - Synchronized with Backend Prisma Schema
 * ============================================================================
 * Source: backend/prisma/schema.prisma
 * Version: 2.0.0
 * Last Sync: 2025-11-02
 * ============================================================================
 */

/**
 * User Roles
 * @see backend/prisma/schema.prisma - enum Role
 */
export enum UserRole {
  ADMIN = "ADMIN", // Platform admin
  COMPANY_OWNER = "COMPANY_OWNER", // Firma sahibi (hem üretici hem müşteri)
  COMPANY_EMPLOYEE = "COMPANY_EMPLOYEE", // Firma çalışanı
  INDIVIDUAL_CUSTOMER = "INDIVIDUAL_CUSTOMER", // Bireysel müşteri
}

/**
 * Company Types
 * @see backend/prisma/schema.prisma - enum CompanyType
 */
export enum CompanyType {
  MANUFACTURER = "MANUFACTURER", // Üretici firma
  BUYER = "BUYER", // Alıcı firma
  BOTH = "BOTH", // Her ikisi de
}

/**
 * Department Types (for COMPANY_EMPLOYEE role)
 * @see backend/prisma/schema.prisma - enum Department
 */
export enum Department {
  PURCHASING = "PURCHASING", // Satın Alma
  PRODUCTION = "PRODUCTION", // Üretim
  QUALITY = "QUALITY", // Kalite Kontrol
  DESIGN = "DESIGN", // Tasarım
  SALES = "SALES", // Satış
  MANAGEMENT = "MANAGEMENT", // Yönetim
}

/**
 * ============================================================================
 * SESSION DATA TYPE
 * ============================================================================
 * Matches backend User model fields + JWT token
 * @see backend/src/graphql/mutations/authMutation.ts - login/signup return type
 * @see backend/prisma/schema.prisma - model User
 * ============================================================================
 */
export interface SessionData {
  isAuth: boolean;
  userId: string; // User.id (numeric in DB, string in session)
  email: string; // User.email
  role: UserRole; // User.role (Role enum)
  companyId?: string; // User.companyId (nullable)
  companyType?: CompanyType; // User.company.type (from Company relation)
  backendToken?: string; // JWT token from backend
  isCompanyOwner?: boolean; // User.isCompanyOwner
  department?: Department; // User.department (Department enum, nullable)
  jobTitle?: string; // User.jobTitle (nullable)
  permissions?: string; // User.permissions (JSON, nullable)
  emailVerified?: boolean; // User.emailVerified
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
    companyType: session.user.companyType as CompanyType | undefined,
    backendToken: session.user.backendToken,
    isCompanyOwner: session.user.isCompanyOwner,
    department: session.user.department as Department | undefined,
    jobTitle: session.user.jobTitle,
    permissions: session.user.permissions,
    emailVerified: session.user.emailVerified,
  };
});

/**
 * Get session data without throwing error
 * Returns null if not authenticated
 */
export const getSession = cache(async (): Promise<SessionData | null> => {
  try {
    return await verifySession();
  } catch {
    return null;
  }
});

/**
 * Check if user has specific role
 */
export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
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
      `Forbidden: Required role ${allowedRoles.join(" or ")}, but user has ${
        session.role
      }`
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
 * Check if user is company owner
 */
export async function isCompanyOwner(): Promise<boolean> {
  return hasRole([UserRole.COMPANY_OWNER, UserRole.ADMIN]);
}

/**
 * Verify user is company owner (throws if not)
 */
export async function verifyCompanyOwner(): Promise<void> {
  return verifyRole([UserRole.COMPANY_OWNER, UserRole.ADMIN]);
}

/**
 * Check if user is company employee
 */
export async function isCompanyEmployee(): Promise<boolean> {
  return hasRole([UserRole.COMPANY_EMPLOYEE, UserRole.ADMIN]);
}

/**
 * Verify user is company employee (throws if not)
 */
export async function verifyCompanyEmployee(): Promise<void> {
  return verifyRole([UserRole.COMPANY_EMPLOYEE, UserRole.ADMIN]);
}

/**
 * Check if user belongs to a company (owner or employee)
 */
export async function isCompanyMember(): Promise<boolean> {
  return hasRole([
    UserRole.COMPANY_OWNER,
    UserRole.COMPANY_EMPLOYEE,
    UserRole.ADMIN,
  ]);
}

/**
 * Check if user is individual customer
 */
export async function isIndividualCustomer(): Promise<boolean> {
  return hasRole([UserRole.INDIVIDUAL_CUSTOMER, UserRole.ADMIN]);
}

/**
 * Check if user's company is manufacturer (based on companyType)
 */
export async function isManufacturer(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  if (session.role === UserRole.ADMIN) return true;

  return (
    session.companyType === CompanyType.MANUFACTURER ||
    session.companyType === CompanyType.BOTH
  );
}

/**
 * Check if user's company is buyer (based on companyType)
 */
export async function isBuyer(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  if (session.role === UserRole.ADMIN) return true;

  return (
    session.companyType === CompanyType.BUYER ||
    session.companyType === CompanyType.BOTH
  );
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
 * ============================================================================
 * DEPARTMENT-BASED ACCESS CONTROL
 * ============================================================================
 * For COMPANY_EMPLOYEE roles with department restrictions
 * @see backend/prisma/schema.prisma - enum Department
 * ============================================================================
 */

/**
 * Check if user has specific department
 */
export async function hasDepartment(
  allowedDepartments: Department[]
): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  // Admin has access to all departments
  if (session.role === UserRole.ADMIN) return true;

  // Company owner has access to all departments
  if (session.isCompanyOwner) return true;

  // Check employee department
  if (session.role === UserRole.COMPANY_EMPLOYEE && session.department) {
    return allowedDepartments.includes(session.department);
  }

  return false;
}

/**
 * Verify user has required department (throws if not)
 */
export async function verifyDepartment(
  allowedDepartments: Department[]
): Promise<void> {
  const hasAccess = await hasDepartment(allowedDepartments);

  if (!hasAccess) {
    throw new Error(
      `Forbidden: Required department ${allowedDepartments.join(" or ")}`
    );
  }
}

/**
 * Check if user is in PURCHASING department
 */
export async function isPurchasing(): Promise<boolean> {
  return hasDepartment([Department.PURCHASING]);
}

/**
 * Check if user is in PRODUCTION department
 */
export async function isProduction(): Promise<boolean> {
  return hasDepartment([Department.PRODUCTION]);
}

/**
 * Check if user is in QUALITY department
 */
export async function isQuality(): Promise<boolean> {
  return hasDepartment([Department.QUALITY]);
}

/**
 * Check if user is in DESIGN department
 */
export async function isDesign(): Promise<boolean> {
  return hasDepartment([Department.DESIGN]);
}

/**
 * Check if user is in SALES department
 */
export async function isSales(): Promise<boolean> {
  return hasDepartment([Department.SALES]);
}

/**
 * Check if user is in MANAGEMENT department
 */
export async function isManagement(): Promise<boolean> {
  return hasDepartment([Department.MANAGEMENT]);
}

/**
 * ============================================================================
 * BACKEND INTEGRATION
 * ============================================================================
 */

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
