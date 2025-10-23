"use client";

import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { SessionTimeoutWarning } from "./session-timeout-warning";

interface AuthProviderProps {
  children: React.ReactNode;
  session: Session | null;
}

/**
 * NextAuth Session Provider with type safety
 *
 * Features:
 * - Type-safe session prop
 * - Conditional SessionTimeoutWarning (only protected routes)
 * - Auto token refresh (configured in auth.ts)
 */
export function AuthProvider({ children, session }: AuthProviderProps) {
  const pathname = usePathname();

  // Show timeout warning only in protected routes (not in auth pages)
  const showTimeoutWarning =
    session && !pathname.startsWith("/auth") && !pathname.startsWith("/public");

  // Don't auto-refetch session on auth pages to prevent loops
  const isAuthPage = pathname.startsWith("/auth");

  return (
    <SessionProvider
      session={session}
      // Disable auto session polling on auth pages
      refetchInterval={isAuthPage ? 0 : 60}
      // Don't refetch on window focus on auth pages
      refetchOnWindowFocus={!isAuthPage}
    >
      {children}
      {showTimeoutWarning && <SessionTimeoutWarning />}
    </SessionProvider>
  );
}
