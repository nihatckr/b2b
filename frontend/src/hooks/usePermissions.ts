import { useQuery } from 'urql';

// GraphQL query to fetch user permissions
const MY_PERMISSIONS_QUERY = `
  query MyPermissions {
    myPermissions
  }
`;

const HAS_PERMISSION_QUERY = `
  query HasPermission($permission: String!) {
    hasPermission(permission: $permission)
  }
`;

const CAN_ACCESS_ROUTE_QUERY = `
  query CanAccessRoute($route: String!) {
    canAccessRoute(route: $route)
  }
`;

const DEPARTMENT_INFO_QUERY = `
  query DepartmentInfo {
    departmentInfo
  }
`;

/**
 * Hook to check user permissions and department information
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
  const [result] = useQuery({ query: MY_PERMISSIONS_QUERY });

  // Backend returns permissions as array of {value, label} objects
  const permissionsData = result.data?.myPermissions?.permissions || [];
  const permissions: string[] = Array.isArray(permissionsData)
    ? permissionsData.map((p: any) => typeof p === 'string' ? p : p.value)
    : [];
  const permissionLabels: Record<string, string> = Array.isArray(permissionsData)
    ? permissionsData.reduce((acc: Record<string, string>, p: any) => {
        if (typeof p === 'object' && p.value && p.label) {
          acc[p.value] = p.label;
        }
        return acc;
      }, {})
    : {};
  const departmentLabel: string | null = result.data?.myPermissions?.department || null;

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
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  /**
   * Check if user has all of the specified permissions
   * @param requiredPermissions - Array of permissions to check
   * @returns true if user has all permissions
   */
  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => permissions.includes(permission));
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
    query: CAN_ACCESS_ROUTE_QUERY,
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
  const [result] = useQuery({ query: DEPARTMENT_INFO_QUERY });

  return {
    department: result.data?.departmentInfo?.departmentLabel || null,
    permissions: result.data?.departmentInfo?.permissions || [],
    permissionLabels: result.data?.departmentInfo?.permissionLabels || {},
    loading: result.fetching,
    error: result.error,
  };
}
