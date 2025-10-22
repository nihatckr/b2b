"use client";
import { multipartFetchExchange } from "@urql/exchange-multipart-fetch";
import { createClient as createWSClient } from "graphql-ws";
import { type Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import {
  cacheExchange,
  Client,
  createClient,
  errorExchange,
  ssrExchange,
  subscriptionExchange,
  type SSRExchange,
} from "urql";

// ============================================
// SSR Cache (Singleton Pattern)
// ============================================

const isServerSide = typeof window === "undefined";
const isBrowser = typeof window !== "undefined";
let ssrCache: SSRExchange | null = null;

// ============================================
// WebSocket Client (Per-Token Instance - Client Side Only)
// ============================================

let wsClient: ReturnType<typeof createWSClient> | null = null;
let currentToken: string | undefined = undefined;

/**
 * WebSocket client for GraphQL subscriptions
 * Sadece browser'da çalışır (SSR'da undefined)
 * Token değiştiğinde yeni client oluşturur
 */
function getWSClient(token?: string) {
  // Server-side'da WebSocket yok
  if (isServerSide) {
    return null;
  }

  // Token değişti mi? Eski client'ı temizle ve yeni oluştur
  if (wsClient && currentToken !== token) {
    console.log("🔄 Token changed, recreating WebSocket client...");
    wsClient.dispose();
    wsClient = null;
  }

  // Mevcut client'ı yeniden kullan (token aynıysa)
  if (wsClient) {
    return wsClient;
  }

  // WebSocket URL (HTTP → WS conversion)
  const graphqlUrl =
    process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql";
  const wsUrl = graphqlUrl
    .replace("http://", "ws://")
    .replace("https://", "wss://");

  console.log("🔌 Creating WebSocket client...", {
    url: wsUrl,
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : "NO TOKEN",
  });

  wsClient = createWSClient({
    url: wsUrl,
    connectionParams: () => {
      // Auth token gönder (backend JWT auth için)
      if (token) {
        console.log("🔑 WebSocket connectionParams: Sending token");
        return {
          authorization: `Bearer ${token}`,
        };
      }
      console.log("⚠️ WebSocket connectionParams: No token");
      return {};
    },
    // Reconnect stratejisi
    shouldRetry: () => true,
    retryAttempts: 5,
    retryWait: async (retries) => {
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const waitTime = Math.min(1000 * Math.pow(2, retries), 30000);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    },
    on: {
      connecting: () => console.log("🔄 WebSocket connecting..."),
      connected: (socket, payload) => {
        console.log("✅ WebSocket connected", { socket: !!socket, payload });
      },
      opened: (socket) =>
        console.log("🔓 WebSocket opened", { socket: !!socket }),
      ping: (received, payload) =>
        console.log("🏓 WebSocket ping", { received, payload }),
      pong: (received, payload) =>
        console.log("🏓 WebSocket pong", { received, payload }),
      message: (message) => console.log("📨 WebSocket message", message),
      error: (err) => console.error("❌ WebSocket error:", err),
      closed: (event) => console.log("🔌 WebSocket closed", event),
    },
  });

  currentToken = token;
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
  // Exchange sırası önemli: cache → error → ssr → subscription → fetch
  const exchanges = [cacheExchange];

  // Error exchange (401 Unauthorized → Auto logout)
  // MUST be before fetchExchange to catch network errors
  if (isBrowser) {
    exchanges.push(
      errorExchange({
        onError: (error) => {
          // Check for authentication/authorization errors
          const isAuthError = error.graphQLErrors.some((e) => {
            const message = e.message.toLowerCase();
            return (
              message.includes("unauthorized") ||
              message.includes("unauthenticated") ||
              message.includes("authentication") ||
              message.includes("token") ||
              message.includes("jwt")
            );
          });

          // Check for network errors with 401 status
          const is401 =
            error.networkError &&
            "statusCode" in error.networkError &&
            error.networkError.statusCode === 401;

          if (isAuthError || is401) {
            console.warn("🚨 Authentication error detected, logging out...");

            // Cleanup WebSocket connection
            cleanupWSClient();

            // Only redirect if NOT already on login page (prevent loop)
            if (
              typeof window !== "undefined" &&
              !window.location.pathname.startsWith("/auth")
            ) {
              // Redirect to login and clear session
              // Use window.location to force full page reload and clear all client state
              window.location.href = "/auth/login?error=session-expired";
            }
          }
        },
      })
    );
  }

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

  // Multipart fetch exchange (supports file uploads)
  // This exchange automatically detects File/Blob objects and sends multipart/form-data
  exchanges.push(multipartFetchExchange);

  return createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql",

    exchanges,

    // Request policy
    // 'cache-first' = önce cache'e bak, yoksa network (önerilen)
    // 'cache-and-network' = cache'ten hemen döndür + arka planda güncelle
    // 'network-only' = her zaman network'ten çek
    requestPolicy: "cache-first",

    // Fetch options
    // Do not set Content-Type here; multipartFetchExchange will set it when needed.
    fetchOptions: () => {
      const headers: Record<string, string> = {};

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
} // ============================================
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
    console.log("🧹 Cleaning up WebSocket client...");
    wsClient.dispose();
    wsClient = null;
    currentToken = undefined;
  }
}
