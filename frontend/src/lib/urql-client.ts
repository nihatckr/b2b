"use client";

import { type Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { cacheExchange, Client, createClient, fetchExchange } from "urql";

export function createUrqlClient(token?: string): Client {
  return createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql",
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: () => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      return { headers };
    },
  });
}

export function useUrqlClient() {
  const { data: session } = useSession();

  return useMemo(() => {
    const token = (session?.user as Session["user"] & { backendToken?: string })
      ?.backendToken;
    return createUrqlClient(token);
  }, [session]);
}
