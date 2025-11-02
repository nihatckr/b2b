import {
  QueryCanAccessRouteDocument,
  QueryDepartmentInfoDocument,
  QueryMyPermissionsDocument,
} from "@/__generated__/graphql";
import { useQuery } from "urql";

/**
 * Hook to check user permissions and department information
 *
 * Backend Sync:
 * - Uses auto-generated Documents from graphql.tsx
 * - Queries: myPermissions, hasPermission, canAccessRoute, departmentInfo
 * - Type-safe with GraphQL Codegen
 *
 * @example
 * ```tsx
 * const { hasPermission, permissions, departmentLabel, loading } = usePermissions();
 *
 * if (hasPermission('PRODUCTION_MANAGE')) {
 *   return <DeleteButton />;
 * }
 * ```
 */
export function usePermissions() {
  const [result] = useQuery({ query: QueryMyPermissionsDocument });

  // Backend returns permissions as array of {value, label} objects
  const permissionsData = result.data?.myPermissions?.permissions || [];

  interface PermissionItem {
    value: string;
    label: string;
  }

  const permissions: string[] = Array.isArray(permissionsData)
    ? permissionsData.map((p: string | PermissionItem) =>
        typeof p === "string" ? p : p.value
      )
    : [];
  const permissionLabels: Record<string, string> = Array.isArray(
    permissionsData
  )
    ? permissionsData.reduce(
        (acc: Record<string, string>, p: string | PermissionItem) => {
          if (typeof p === "object" && p.value && p.label) {
            acc[p.value] = p.label;
          }
          return acc;
        },
        {}
      )
    : {};
  const departmentLabel: string | null =
    result.data?.myPermissions?.department || null;

  /**
   * Check if user has a specific permission
   * @param permission - Permission to check (e.g., 'PRODUCTION_MANAGE')
   * @returns true if user has the permission, false otherwise
   */
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  /**
   * Check if user has any of the specified permissions
   * @param requiredPermissions - Array of permissions to check
   * @returns true if user has at least one permission
   */
  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some((permission) =>
      permissions.includes(permission)
    );
  };

  /**
   * Check if user has all of the specified permissions
   * @param requiredPermissions - Array of permissions to check
   * @returns true if user has all permissions
   */
  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every((permission) =>
      permissions.includes(permission)
    );
  };

  return {
    permissions,
    permissionLabels,
    departmentLabel,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading: result.fetching,
    error: result.error,
  };
}

/**
 * Hook to check if user can access a specific route
 *
 * @param route - Route to check (e.g., '/production')
 * @returns Object with canAccess boolean and loading state
 *
 * @example
 * ```tsx
 * const { canAccess, loading } = useCanAccessRoute('/production');
 *
 * if (!canAccess && !loading) {
 *   router.push('/unauthorized');
 * }
 * ```
 */
export function useCanAccessRoute(route: string) {
  const [result] = useQuery({
    query: QueryCanAccessRouteDocument,
    variables: { route },
    pause: !route, // Don't run query if route is empty
  });

  return {
    canAccess: result.data?.canAccessRoute ?? false,
    loading: result.fetching,
    error: result.error,
  };
}

/**
 * Hook to get department information
 *
 * @returns Department label and permissions
 *
 * @example
 * ```tsx
 * const { department, permissions, loading } = useDepartmentInfo();
 *
 * return (
 *   <div>
 *     <p>Department: {department}</p>
 *     <p>Permissions: {permissions.join(', ')}</p>
 *   </div>
 * );
 * ```
 */
export function useDepartmentInfo() {
  const [result] = useQuery({ query: QueryDepartmentInfoDocument });

  return {
    department: result.data?.departmentInfo?.departmentLabel || null,
    permissions: result.data?.departmentInfo?.permissions || [],
    permissionLabels: result.data?.departmentInfo?.permissionLabels || {},
    loading: result.fetching,
    error: result.error,
  };
}
