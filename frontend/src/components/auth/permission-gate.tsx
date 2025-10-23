"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { ReactNode } from "react";

interface PermissionGateProps {
  /** Single permission or array of permissions required */
  permission?: string | string[];
  /** If true, user needs ALL permissions. If false, user needs ANY permission (default: false) */
  requireAll?: boolean;
  /** Content to show when user has permission */
  children: ReactNode;
  /** Optional content to show when user lacks permission */
  fallback?: ReactNode;
  /** Show loading state while checking permissions */
  showLoading?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 *
 * @example
 * ```tsx
 * // Single permission
 * <PermissionGate permission="PRODUCTION_MANAGE">
 *   <DeleteButton />
 * </PermissionGate>
 *
 * // Multiple permissions (any)
 * <PermissionGate permission={["PRODUCTION_EDIT", "PRODUCTION_MANAGE"]}>
 *   <EditButton />
 * </PermissionGate>
 *
 * // Multiple permissions (all required)
 * <PermissionGate
 *   permission={["PRODUCTION_VIEW", "QUALITY_VIEW"]}
 *   requireAll
 * >
 *   <AdvancedDashboard />
 * </PermissionGate>
 *
 * // With fallback
 * <PermissionGate
 *   permission="ADMIN_PANEL"
 *   fallback={<p>Admin access required</p>}
 * >
 *   <AdminPanel />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permission,
  requireAll = false,
  children,
  fallback = null,
  showLoading = false,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } =
    usePermissions();

  // Show loading state if enabled
  if (loading && showLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  // If no permission specified, show children (no restriction)
  if (!permission) {
    return <>{children}</>;
  }

  // Handle single permission
  if (typeof permission === "string") {
    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
  }

  // Handle multiple permissions
  const hasAccess = requireAll
    ? hasAllPermissions(permission)
    : hasAnyPermission(permission);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Props for DepartmentGate component
 */
interface DepartmentGateProps {
  /** Department(s) that can access the content */
  department: string | string[];
  /** Content to show when user is in the department */
  children: ReactNode;
  /** Optional content to show when user is not in the department */
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user department
 *
 * @example
 * ```tsx
 * <DepartmentGate department="PRODUCTION">
 *   <ProductionDashboard />
 * </DepartmentGate>
 *
 * <DepartmentGate department={["PRODUCTION", "QUALITY"]}>
 *   <FactoryFloorView />
 * </DepartmentGate>
 * ```
 */
export function DepartmentGate({
  department,
  children,
  fallback = null,
}: DepartmentGateProps) {
  const { departmentLabel, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (!departmentLabel) {
    return <>{fallback}</>;
  }

  // Handle single department
  if (typeof department === "string") {
    return departmentLabel === department ? <>{children}</> : <>{fallback}</>;
  }

  // Handle multiple departments
  const hasAccess = department.includes(departmentLabel);
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
