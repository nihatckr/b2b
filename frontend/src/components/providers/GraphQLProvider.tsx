"use client";

import { useUrqlClient } from "@/lib/urql-client";
import { ReactNode } from "react";
import { Provider } from "urql";

export function GraphQLProvider({ children }: { children: ReactNode }) {
  const client = useUrqlClient();

  return <Provider value={client}>{children}</Provider>;
}
