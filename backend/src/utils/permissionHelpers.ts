/**
 * Permission Helper Functions
 *
 * Bu modül permission kontrollerini kolaylaştıran yardımcı fonksiyonlar sağlar.
 * GraphQL resolver'larda kullanılmak üzere tasarlanmıştır.
 */

import type { Department, Role } from "../../lib/generated";
import { ForbiddenError } from "./errors";
import { getUserPermissions, hasPermission, Permission } from "./permissions";

/**
 * Context type for permission checks
 */
export interface PermissionContext {
  user?: {
    id: number;
    role: string;
    department?: string | null;
    companyId?: number | null;
    isCompanyOwner?: boolean;
  } | null;
}

/**
 * Requires that the user has a specific permission
 * Throws ForbiddenError if user doesn't have permission
 *
 * @param context - GraphQL context with user info
 * @param permission - Required permission
 * @param customMessage - Custom error message (optional)
 *
 * @example
 * ```typescript
 * requirePermission(context, Permission.ORDER_CREATE);
 * requirePermission(context, Permission.USER_DELETE, "Bu kullanıcıyı silemezsiniz");
 * ```
 */
export function requirePermission(
  context: PermissionContext,
  permission: Permission,
  customMessage?: string
): void {
  if (!context.user) {
    throw new ForbiddenError("Kimlik doğrulaması gerekli");
  }

  const hasAccess = hasPermission(
    context.user.role as Role,
    context.user.department as Department | null,
    permission
  );

  if (!hasAccess) {
    const defaultMessage = `Bu işlem için yetkiniz yok: ${permission}`;
    throw new ForbiddenError(customMessage || defaultMessage);
  }
}

/**
 * Requires that the user has ANY of the specified permissions
 * Throws ForbiddenError if user doesn't have any of the permissions
 *
 * @param context - GraphQL context with user info
 * @param permissions - Array of required permissions (user needs at least one)
 * @param customMessage - Custom error message (optional)
 *
 * @example
 * ```typescript
 * requireAnyPermission(context, [
 *   Permission.ORDER_CREATE,
 *   Permission.ORDER_UPDATE
 * ], "Sipariş işlemleri için yetkiniz yok");
 * ```
 */
export function requireAnyPermission(
  context: PermissionContext,
  permissions: Permission[],
  customMessage?: string
): void {
  if (!context.user) {
    throw new ForbiddenError("Kimlik doğrulaması gerekli");
  }

  const hasAnyAccess = permissions.some((permission) =>
    hasPermission(
      context.user!.role as Role,
      context.user!.department as Department | null,
      permission
    )
  );

  if (!hasAnyAccess) {
    const permissionList = permissions.join(", ");
    const defaultMessage = `Bu işlem için en az bir yetkiye sahip olmalısınız: ${permissionList}`;
    throw new ForbiddenError(customMessage || defaultMessage);
  }
}

/**
 * Requires that the user has ALL of the specified permissions
 * Throws ForbiddenError if user doesn't have all permissions
 *
 * @param context - GraphQL context with user info
 * @param permissions - Array of required permissions (user needs all)
 * @param customMessage - Custom error message (optional)
 *
 * @example
 * ```typescript
 * requireAllPermissions(context, [
 *   Permission.ORDER_VIEW,
 *   Permission.PRODUCTION_VIEW
 * ], "Sipariş ve üretim görüntüleme yetkisi gerekli");
 * ```
 */
export function requireAllPermissions(
  context: PermissionContext,
  permissions: Permission[],
  customMessage?: string
): void {
  if (!context.user) {
    throw new ForbiddenError("Kimlik doğrulaması gerekli");
  }

  const hasAllAccess = permissions.every((permission) =>
    hasPermission(
      context.user!.role as Role,
      context.user!.department as Department | null,
      permission
    )
  );

  if (!hasAllAccess) {
    const permissionList = permissions.join(", ");
    const defaultMessage = `Bu işlem için tüm yetkilere sahip olmalısınız: ${permissionList}`;
    throw new ForbiddenError(customMessage || defaultMessage);
  }
}

/**
 * Checks if user has a specific permission (non-throwing version)
 * Returns boolean instead of throwing error
 *
 * @param context - GraphQL context with user info
 * @param permission - Permission to check
 * @returns true if user has permission, false otherwise
 *
 * @example
 * ```typescript
 * if (checkPermission(context, Permission.ORDER_DELETE)) {
 *   // User can delete orders
 * }
 * ```
 */
export function checkPermission(
  context: PermissionContext,
  permission: Permission
): boolean {
  if (!context.user) {
    return false;
  }

  return hasPermission(
    context.user.role as Role,
    context.user.department as Department | null,
    permission
  );
}

/**
 * Requires that the user is the owner of the resource OR has the specified permission
 * Common pattern: users can modify their own data, or admins/managers can modify any data
 *
 * @param context - GraphQL context with user info
 * @param resourceOwnerId - ID of the resource owner
 * @param permission - Required permission for non-owners
 * @param customMessage - Custom error message (optional)
 *
 * @example
 * ```typescript
 * requireOwnerOrPermission(
 *   context,
 *   order.customerId,
 *   Permission.ORDER_UPDATE,
 *   "Bu siparişi düzenleme yetkiniz yok"
 * );
 * ```
 */
export function requireOwnerOrPermission(
  context: PermissionContext,
  resourceOwnerId: number,
  permission: Permission,
  customMessage?: string
): void {
  if (!context.user) {
    throw new ForbiddenError("Kimlik doğrulaması gerekli");
  }

  // Check if user is the owner
  const isOwner = context.user.id === resourceOwnerId;

  // Check if user has the required permission
  const hasAccess = hasPermission(
    context.user.role as Role,
    context.user.department as Department | null,
    permission
  );

  if (!isOwner && !hasAccess) {
    const defaultMessage = "Bu kaynağa erişim yetkiniz yok";
    throw new ForbiddenError(customMessage || defaultMessage);
  }
}

/**
 * Requires that the user is in the same company as the resource OR has the specified permission
 * Common pattern: users can access company data, or admins can access any company's data
 *
 * @param context - GraphQL context with user info
 * @param resourceCompanyId - ID of the resource's company
 * @param permission - Required permission for users from other companies
 * @param customMessage - Custom error message (optional)
 *
 * @example
 * ```typescript
 * requireSameCompanyOrPermission(
 *   context,
 *   order.companyId,
 *   Permission.ORDER_VIEW,
 *   "Bu firma verilerine erişim yetkiniz yok"
 * );
 * ```
 */
export function requireSameCompanyOrPermission(
  context: PermissionContext,
  resourceCompanyId: number | null,
  permission: Permission,
  customMessage?: string
): void {
  if (!context.user) {
    throw new ForbiddenError("Kimlik doğrulaması gerekli");
  }

  // Admin can access everything
  if (context.user.role === "ADMIN") {
    return;
  }

  // Check if user is in the same company
  const isSameCompany = context.user.companyId === resourceCompanyId;

  // Check if user has the required permission
  const hasAccess = hasPermission(
    context.user.role as Role,
    context.user.department as Department | null,
    permission
  );

  if (!isSameCompany && !hasAccess) {
    const defaultMessage = "Sadece kendi firmanızın verilerine erişebilirsiniz";
    throw new ForbiddenError(customMessage || defaultMessage);
  }
}

/**
 * Gets all permissions for the current user
 * Useful for returning permission list to frontend
 *
 * @param context - GraphQL context with user info
 * @returns Array of permissions the user has
 *
 * @example
 * ```typescript
 * const permissions = getContextPermissions(context);
 * // Returns: [Permission.ORDER_VIEW, Permission.ORDER_CREATE, ...]
 * ```
 */
export function getContextPermissions(
  context: PermissionContext
): Permission[] {
  if (!context.user) {
    return [];
  }

  return getUserPermissions(
    context.user.role as Role,
    context.user.department as Department | null
  );
}

/**
 * Permission decorator for mutations
 * Wraps a resolver with permission check
 *
 * @param permission - Required permission
 * @param resolver - Original resolver function
 * @returns Wrapped resolver with permission check
 *
 * @example
 * ```typescript
 * builder.mutationField("deleteOrder", (t) =>
 *   t.field({
 *     type: "Boolean",
 *     resolve: withPermission(
 *       Permission.ORDER_DELETE,
 *       async (root, args, context) => {
 *         // Your resolver logic here
 *       }
 *     ),
 *   })
 * );
 * ```
 */
export function withPermission<
  TRoot,
  TArgs,
  TContext extends PermissionContext,
  TResult
>(
  permission: Permission,
  resolver: (root: TRoot, args: TArgs, context: TContext, info: any) => TResult
): (root: TRoot, args: TArgs, context: TContext, info: any) => TResult {
  return (root: TRoot, args: TArgs, context: TContext, info: any) => {
    requirePermission(context, permission);
    return resolver(root, args, context, info);
  };
}

/**
 * Permission decorator for mutations with multiple permissions (OR logic)
 * Wraps a resolver with permission check (user needs ANY of the permissions)
 *
 * @param permissions - Array of permissions (user needs at least one)
 * @param resolver - Original resolver function
 * @returns Wrapped resolver with permission check
 *
 * @example
 * ```typescript
 * builder.mutationField("processOrder", (t) =>
 *   t.field({
 *     type: "Boolean",
 *     resolve: withAnyPermission(
 *       [Permission.ORDER_UPDATE, Permission.ORDER_APPROVE],
 *       async (root, args, context) => {
 *         // Your resolver logic here
 *       }
 *     ),
 *   })
 * );
 * ```
 */
export function withAnyPermission<
  TRoot,
  TArgs,
  TContext extends PermissionContext,
  TResult
>(
  permissions: Permission[],
  resolver: (root: TRoot, args: TArgs, context: TContext, info: any) => TResult
): (root: TRoot, args: TArgs, context: TContext, info: any) => TResult {
  return (root: TRoot, args: TArgs, context: TContext, info: any) => {
    requireAnyPermission(context, permissions);
    return resolver(root, args, context, info);
  };
}

/**
 * Permission cheat sheet for common operations
 */
export const PermissionGuide = {
  // Sample operations
  VIEW_SAMPLES: Permission.SAMPLE_VIEW,
  CREATE_SAMPLES: Permission.SAMPLE_CREATE,
  UPDATE_SAMPLES: Permission.SAMPLE_UPDATE,
  DELETE_SAMPLES: Permission.SAMPLE_DELETE,
  APPROVE_SAMPLES: Permission.SAMPLE_APPROVE,

  // Order operations
  VIEW_ORDERS: Permission.ORDER_VIEW,
  CREATE_ORDERS: Permission.ORDER_CREATE,
  UPDATE_ORDERS: Permission.ORDER_UPDATE,
  DELETE_ORDERS: Permission.ORDER_DELETE,
  APPROVE_ORDERS: Permission.ORDER_APPROVE,

  // Production operations
  VIEW_PRODUCTION: Permission.PRODUCTION_VIEW,
  CREATE_PRODUCTION: Permission.PRODUCTION_CREATE,
  UPDATE_PRODUCTION: Permission.PRODUCTION_UPDATE,
  DELETE_PRODUCTION: Permission.PRODUCTION_DELETE,
  MANAGE_PRODUCTION: Permission.PRODUCTION_MANAGE,

  // Quality operations
  VIEW_QUALITY: Permission.QUALITY_VIEW,
  CREATE_QUALITY: Permission.QUALITY_CREATE,
  UPDATE_QUALITY: Permission.QUALITY_UPDATE,
  DELETE_QUALITY: Permission.QUALITY_DELETE,
  APPROVE_QUALITY: Permission.QUALITY_APPROVE,
  REJECT_QUALITY: Permission.QUALITY_REJECT,

  // Collection operations
  VIEW_COLLECTIONS: Permission.COLLECTION_VIEW,
  CREATE_COLLECTIONS: Permission.COLLECTION_CREATE,
  UPDATE_COLLECTIONS: Permission.COLLECTION_UPDATE,
  DELETE_COLLECTIONS: Permission.COLLECTION_DELETE,

  // User operations
  VIEW_USERS: Permission.USER_VIEW,
  CREATE_USERS: Permission.USER_CREATE,
  UPDATE_USERS: Permission.USER_UPDATE,
  DELETE_USERS: Permission.USER_DELETE,

  // Company operations
  VIEW_COMPANY: Permission.COMPANY_VIEW,
  UPDATE_COMPANY: Permission.COMPANY_UPDATE,
  DELETE_COMPANY: Permission.COMPANY_DELETE,
  MANAGE_COMPANY_USERS: Permission.COMPANY_MANAGE_USERS,

  // Analytics & Reports
  VIEW_ANALYTICS: Permission.ANALYTICS_VIEW,
  VIEW_REPORTS: Permission.REPORTS_VIEW,
  EXPORT_REPORTS: Permission.REPORTS_EXPORT,

  // Settings
  VIEW_SETTINGS: Permission.SETTINGS_VIEW,
  UPDATE_SETTINGS: Permission.SETTINGS_UPDATE,
} as const;
