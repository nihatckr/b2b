import { cacheExchange, createClient, fetchExchange, ssrExchange } from "urql";

// SSR Exchange'i oluştur
const isServerSide = typeof window === "undefined";
const ssrCache = ssrExchange({ isClient: !isServerSide });

const client = createClient({
  url: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
  exchanges: [cacheExchange, ssrCache, fetchExchange],
  fetchOptions: () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    return {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
  },
});

export { client, ssrCache };
export default client;
