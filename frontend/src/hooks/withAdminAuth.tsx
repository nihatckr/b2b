/**
 * withAdminAuth HOC
 *
 * Admin sayfalarını wrap eden Higher-Order Component.
 * Automatic loading state ve unauthorized handling.
 *
 * @example
 * ```tsx
 * // pages/dashboard/users-management/page.tsx
 * function UsersManagementPage() {
 *   return <div>Admin Content</div>;
 * }
 *
 * export default withAdminAuth(UsersManagementPage);
 * ```
 */

import { Loader2 } from "lucide-react";
import { ComponentType } from "react";
import { useAdminAuth } from "./useAdminAuth";

interface WithAdminAuthOptions {
  redirectTo?: string;
  loadingComponent?: ComponentType;
  unauthorizedComponent?: ComponentType;
}

export function withAdminAuth<P extends object>(
  Component: ComponentType<P>,
  options?: WithAdminAuthOptions
) {
  return function WrappedComponent(props: P) {
    const { isAdmin, isLoading } = useAdminAuth({
      redirectTo: options?.redirectTo || "/dashboard",
      requireAuth: true,
    });

    // Show loading state
    if (isLoading) {
      if (options?.loadingComponent) {
        const LoadingComponent = options.loadingComponent;
        return <LoadingComponent />;
      }

      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    // Show unauthorized state
    if (!isAdmin) {
      if (options?.unauthorizedComponent) {
        const UnauthorizedComponent = options.unauthorizedComponent;
        return <UnauthorizedComponent />;
      }

      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
            <p className="text-muted-foreground">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        </div>
      );
    }

    // Render the component
    return <Component {...props} />;
  };
}
