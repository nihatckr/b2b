"use client";
import {
  UrqlProvider,
  cacheExchange,
  createClient,
  fetchExchange,
  ssrExchange,
} from "@urql/next";
import { useMemo } from "react";

import { ToastProvider } from "../../context/ToastProvider";

type LayoutContextValue = {
  children: React.ReactNode;
};

export function LayoutProvider({ children }: LayoutContextValue) {
  const [client, ssr] = useMemo(() => {
    const ssrCache = ssrExchange({
      isClient: typeof window !== "undefined",
    });

    const client = createClient({
      url:
        process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
      exchanges: [cacheExchange, ssrCache, fetchExchange],
      fetchOptions: () => {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        return {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        };
      },
    });

    return [client, ssrCache];
  }, []);

  return (
    <UrqlProvider client={client} ssr={ssr}>
      <ToastProvider>{children}</ToastProvider>
    </UrqlProvider>
  );
}
