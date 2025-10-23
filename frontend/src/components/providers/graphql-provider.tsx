"use client";

import { useUrqlClient } from "@/lib/urql-client";
import { type ReactNode } from "react";
import { Provider } from "urql";

/**
 * URQL GraphQL Provider (Modern - 2025)
 *
 * Features:
 * - NextAuth integration (auto token refresh)
 * - SSR-ready client
 * - Cache-first strategy
 * - Optimized re-renders (useMemo in useUrqlClient)
 *
 * Usage:
 * ```tsx
 * <AuthProvider>
 *   <GraphQLProvider>
 *     <YourApp />
 *   </GraphQLProvider>
 * </AuthProvider>
 * ```
 */
export function GraphQLProvider({ children }: { children: ReactNode }) {
  // Client zaten useMemo ile cache'leniyor (useUrqlClient içinde)
  const client = useUrqlClient();

  return <Provider value={client}>{children}</Provider>;
}
