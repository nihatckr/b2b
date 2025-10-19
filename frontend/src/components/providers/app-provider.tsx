"use client";

import { type Session } from "next-auth";
import { type ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { GraphQLProvider } from "./graphql-provider";
import { NotificationProvider } from "./notification-context";
import { ThemeProvider } from "./theme-provider";
import { ToasterProvider } from "./toaster-provider";

interface AppProviderProps {
  children: ReactNode;
  session: Session | null;
}

/**
 * Composite Provider Pattern - All app providers in one component
 *
 * Benefits:
 * - Single import in layout
 * - Correct dependency order enforced
 * - Easy to add/remove providers
 * - No "provider hell" in layout
 *
 * Order (outermost to innermost):
 * 1. ThemeProvider - UI theming (independent)
 * 2. AuthProvider - NextAuth session (independent)
 * 3. GraphQLProvider - URQL client (depends on auth)
 * 4. NotificationProvider - App state (independent)
 * 5. ToasterProvider - UI notifications (independent)
 */
export function AppProvider({ children, session }: AppProviderProps) {
  return (
    <ThemeProvider>
      <AuthProvider session={session}>
        <GraphQLProvider>
          <NotificationProvider>
            <ToasterProvider>{children}</ToasterProvider>
          </NotificationProvider>
        </GraphQLProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
