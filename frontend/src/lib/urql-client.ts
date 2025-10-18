"use client";
import { createClient as createWSClient } from 'graphql-ws';
import { type Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import {
  cacheExchange,
  Client,
  createClient,
  fetchExchange,
  ssrExchange,
  subscriptionExchange,
  type SSRExchange
} from "urql";

// ============================================
// SSR Cache (Singleton Pattern)
// ============================================

const isServerSide = typeof window === "undefined";
const isBrowser = typeof window !== "undefined";
let ssrCache: SSRExchange | null = null;

// ============================================
// WebSocket Client (Singleton - Client Side Only)
// ============================================

let wsClient: ReturnType<typeof createWSClient> | null = null;

/**
 * WebSocket client for GraphQL subscriptions
 * Sadece browser'da çalışır (SSR'da undefined)
 */
function getWSClient(token?: string) {
  // Server-side'da WebSocket yok
  if (isServerSide) {
    return null;
  }

  // Mevcut client'ı yeniden kullan (singleton)
  if (wsClient) {
    return wsClient;
  }

  // WebSocket URL (HTTP → WS conversion)
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql";
  const wsUrl = graphqlUrl.replace("http://", "ws://").replace("https://", "wss://");

  wsClient = createWSClient({
    url: wsUrl,
    connectionParams: () => {
      // Auth token gönder (backend JWT auth için)
      if (token) {
        return {
          authorization: `Bearer ${token}`,
        };
      }
      return {};
    },
    // Reconnect stratejisi
    shouldRetry: () => true,
    retryAttempts: 5,
    retryWait: async (retries) => {
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const waitTime = Math.min(1000 * Math.pow(2, retries), 30000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    },
  });

  return wsClient;
}

/**
 * SSR exchange'i döndürür
 * Next.js 15 App Router için optimize edilmiş
 */
export function getSSRCache(): SSRExchange {
  if (!ssrCache) {
    ssrCache = ssrExchange({
      isClient: !isServerSide,
      initialState: undefined,
    });
  }
  return ssrCache;
}

// ============================================
// Client Creation
// ============================================

/**
 * URQL Client oluşturur (Modern - 2025)
 *
 * Best Practices:
 * - SSR exchange for Next.js hydration
 * - Subscription exchange for real-time WebSocket
 * - Cache-first strategy (performans)
 * - Credential support (cookie auth)
 * - Bearer token auth ready
 *
 * @param token - JWT auth token (opsiyonel)
 * @param includeSSR - SSR exchange dahil et (default: true)
 * @param includeSubscriptions - Subscription exchange dahil et (default: true, sadece client-side)
 */
export function createUrqlClient(
  token?: string,
  includeSSR: boolean = true,
  includeSubscriptions: boolean = true
): Client {
  // Exchange sırası önemli: cache → ssr → subscription → fetch
  const exchanges = [cacheExchange];

  // SSR exchange (server-side rendering için)
  if (includeSSR) {
    exchanges.push(getSSRCache());
  }

  // Subscription exchange (WebSocket - sadece browser'da)
  if (includeSubscriptions && isBrowser) {
    const ws = getWSClient(token);
    if (ws) {
      exchanges.push(
        subscriptionExchange({
          forwardSubscription(request) {
            const input = { ...request, query: request.query || "" };
            return {
              subscribe(sink) {
                const unsubscribe = ws.subscribe(input, sink);
                return { unsubscribe };
              },
            };
          },
        })
      );
    }
  }

  // Fetch exchange (her zaman son sırada - fallback for queries/mutations)
  exchanges.push(fetchExchange);  return createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql",

    exchanges,

    // Request policy
    // 'cache-first' = önce cache'e bak, yoksa network (önerilen)
    // 'cache-and-network' = cache'ten hemen döndür + arka planda güncelle
    // 'network-only' = her zaman network'ten çek
    requestPolicy: "cache-first",

    // Fetch options
    fetchOptions: () => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Auth token ekle
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      return {
        headers,
        credentials: "include", // Cookie support (NextAuth için)
      };
    },

    // Suspense support (Next.js 15'te henüz stable değil)
    suspense: false,
  });
}

// ============================================
// React Hook (NextAuth Integration)
// ============================================

/**
 * NextAuth session'dan token alıp URQL client oluşturur
 *
 * Optimized:
 * - useMemo ile client cache'lenir
 * - Sadece session değişince yeniden oluşturulur
 * - SSR desteği kapalı (client-side hook)
 * - WebSocket subscriptions aktif! 🚀
 */
export function useUrqlClient() {
  const { data: session } = useSession();

  return useMemo(() => {
    const token = (session?.user as Session["user"] & { backendToken?: string })
      ?.backendToken;

    // Client-side hook: SSR kapalı, Subscriptions aktif
    return createUrqlClient(token, false, true);
  }, [session]);
}// ============================================
// Server-Side Helpers
// ============================================

/**
 * Server component'lar için client
 * (SSR exchange ile, subscriptions kapalı)
 */
export function createServerClient(token?: string): Client {
  return createUrqlClient(token, true, false);
}

/**
 * Authenticated client (token zorunlu)
 * (Subscriptions aktif)
 */
export function createAuthenticatedClient(token: string): Client {
  return createUrqlClient(token, false, true);
}

/**
 * WebSocket client'ı temizle (logout, cleanup için)
 */
export function cleanupWSClient() {
  if (wsClient) {
    wsClient.dispose();
    wsClient = null;
  }
}
