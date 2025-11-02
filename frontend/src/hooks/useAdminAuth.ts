/**
 * useAdminAuth Hook
 *
 * Admin sayfaları için authentication ve authorization kontrolü.
 * Session yüklenmesini bekler ve admin kontrolü yapar.
 *
 * Backend Sync:
 * - UserRole.ADMIN matches Prisma schema enum Role { ADMIN }
 * - Uses @/lib/auth for type safety
 *
 * @example
 * ```tsx
 * export default function AdminPage() {
 *   const { isAdmin, isLoading, session } = useAdminAuth();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (!isAdmin) return <UnauthorizedPage />;
 *
 *   return <AdminContent />;
 * }
 * ```
 */

import { UserRole } from "@/lib/auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface UseAdminAuthReturn {
  isAdmin: boolean;
  isLoading: boolean;
  session: ReturnType<typeof useSession>["data"];
  status: ReturnType<typeof useSession>["status"];
}

export function useAdminAuth(options?: {
  redirectTo?: string;
  requireAuth?: boolean;
}): UseAdminAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAdmin = session?.user?.role === UserRole.ADMIN;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    // Redirect to login if not authenticated (optional)
    if (options?.requireAuth !== false && status === "unauthenticated") {
      router.push(options?.redirectTo || "/auth/login");
    }

    // Redirect non-admin users (optional)
    if (isAuthenticated && !isAdmin && options?.redirectTo) {
      router.push(options.redirectTo);
    }
  }, [status, isAdmin, isAuthenticated, router, options]);

  return {
    isAdmin,
    isLoading,
    session,
    status,
  };
}
