"use client";

import { useCanAccessRoute, usePermissions } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  /** Single permission or array of permissions required */
  permission?: string | string[];
  /** Route path to check access for (e.g., '/production') */
  route?: string;
  /** If true, user needs ALL permissions. If false, user needs ANY permission (default: false) */
  requireAll?: boolean;
  /** Content to show when user has access */
  children: ReactNode;
  /** Optional content to show while checking permissions */
  fallback?: ReactNode;
  /** Redirect path when access is denied (default: '/unauthorized') */
  redirectTo?: string;
}

/**
 * Component that protects routes based on permissions
 * Redirects to unauthorized page if user lacks required permissions
 *
 * @example
 * ```tsx
 * // Protect with single permission
 * <ProtectedRoute permission="PRODUCTION_VIEW">
 *   <ProductionPage />
 * </ProtectedRoute>
 *
 * // Protect with route check
 * <ProtectedRoute route="/production">
 *   <ProductionPage />
 * </ProtectedRoute>
 *
 * // Protect with multiple permissions (any)
 * <ProtectedRoute permission={["PRODUCTION_EDIT", "PRODUCTION_MANAGE"]}>
 *   <EditProductionPage />
 * </ProtectedRoute>
 *
 * // Protect with multiple permissions (all required)
 * <ProtectedRoute
 *   permission={["PRODUCTION_VIEW", "QUALITY_VIEW"]}
 *   requireAll
 * >
 *   <AdvancedDashboard />
 * </ProtectedRoute>
 *
 * // Custom redirect
 * <ProtectedRoute
 *   permission="ADMIN_PANEL"
 *   redirectTo="/dashboard"
 * >
 *   <AdminPanel />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  permission,
  route,
  requireAll = false,
  children,
  fallback,
  redirectTo = "/unauthorized",
}: ProtectedRouteProps) {
  const router = useRouter();
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading: permissionLoading,
  } = usePermissions();
  const { canAccess, loading: routeLoading } = useCanAccessRoute(route || "");

  // Determine if user has access
  const hasAccess = () => {
    // If route is specified, check route access
    if (route) {
      return canAccess;
    }

    // If no permission specified, allow access
    if (!permission) {
      return true;
    }

    // Check permission-based access
    if (typeof permission === "string") {
      return hasPermission(permission);
    }

    // Multiple permissions
    return requireAll
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission);
  };

  const loading = route ? routeLoading : permissionLoading;

  // Redirect if no access
  useEffect(() => {
    if (!loading && !hasAccess()) {
      router.push(redirectTo);
    }
  }, [loading, hasAccess, router, redirectTo]);

  // Show loading state
  if (loading) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show content only if user has access
  if (!hasAccess()) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Props for DepartmentRoute component
 */
interface DepartmentRouteProps {
  /** Department(s) that can access the route */
  department: string | string[];
  /** Content to show when user has access */
  children: ReactNode;
  /** Optional content to show while checking department */
  fallback?: ReactNode;
  /** Redirect path when access is denied (default: '/unauthorized') */
  redirectTo?: string;
}

/**
 * Component that protects routes based on department
 * Redirects to unauthorized page if user is not in the required department
 *
 * @example
 * ```tsx
 * <DepartmentRoute department="PRODUCTION">
 *   <ProductionDashboard />
 * </DepartmentRoute>
 *
 * <DepartmentRoute department={["PRODUCTION", "QUALITY"]}>
 *   <FactoryFloorDashboard />
 * </DepartmentRoute>
 * ```
 */
export function DepartmentRoute({
  department,
  children,
  fallback,
  redirectTo = "/unauthorized",
}: DepartmentRouteProps) {
  const router = useRouter();
  const { departmentLabel, loading } = usePermissions();

  const hasAccess = () => {
    if (!departmentLabel) return false;

    if (typeof department === "string") {
      return departmentLabel === department;
    }

    return department.includes(departmentLabel);
  };

  // Redirect if no access
  useEffect(() => {
    if (!loading && !hasAccess()) {
      router.push(redirectTo);
    }
  }, [loading, hasAccess, router, redirectTo]);

  // Show loading state
  if (loading) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show content only if user has access
  if (!hasAccess()) {
    return null;
  }

  return <>{children}</>;
}
