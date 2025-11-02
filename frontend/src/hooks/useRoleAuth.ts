/**
 * useRoleAuth Hook
 *
 * Generic role-based authentication hook.
 * Herhangi bir role için kullanılabilir.
 *
 * @example
 * ```tsx
 * import { UserRole } from "@/lib/auth";
 *
 * // Company owner kontrolü
 * const { hasRole, isLoading } = useRoleAuth(UserRole.COMPANY_OWNER);
 *
 * // Multiple roles
 * const { hasRole } = useRoleAuth([UserRole.ADMIN, UserRole.COMPANY_OWNER]);
 *
 * // Company check
 * const { hasCompany } = useRoleAuth(UserRole.COMPANY_OWNER);
 * ```
 */

import { UserRole } from "@/lib/auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface UseRoleAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  requireCompany?: boolean;
}

interface UseRoleAuthReturn {
  hasRole: boolean;
  isLoading: boolean;
  session: ReturnType<typeof useSession>["data"];
  status: ReturnType<typeof useSession>["status"];
  hasCompany: boolean;
  isCompanyOwner: boolean;
}

export function useRoleAuth(
  allowedRoles: UserRole | UserRole[],
  options?: UseRoleAuthOptions
): UseRoleAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const userRole = session?.user?.role;
  const hasRole = userRole ? roles.includes(userRole as UserRole) : false;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const hasCompany = !!session?.user?.companyId;
  const isCompanyOwner = session?.user?.isCompanyOwner || false;

  useEffect(() => {
    // Redirect to login if not authenticated
    if (options?.requireAuth !== false && status === "unauthenticated") {
      router.push(options?.redirectTo || "/auth/login");
      return;
    }

    // Check role authorization
    if (isAuthenticated && !hasRole && options?.redirectTo) {
      router.push(options.redirectTo);
      return;
    }

    // Check company requirement
    if (options?.requireCompany && isAuthenticated && hasRole && !hasCompany) {
      router.push(options?.redirectTo || "/dashboard");
    }
  }, [status, hasRole, hasCompany, isAuthenticated, router, options]);

  return {
    hasRole,
    isLoading,
    session,
    status,
    hasCompany,
    isCompanyOwner,
  };
}
