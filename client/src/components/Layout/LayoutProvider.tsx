"use client";
import { ApolloProvider } from "@apollo/client/react";

import { ToastProvider } from "../../context/ToastProvider";
import { apolloClient } from "../../lib/apolloClient";

type LayoutContextValue = {
  children: React.ReactNode;
};

export function LayoutProvider({ children }: LayoutContextValue) {
  return (
    <ApolloProvider client={apolloClient}>
      <ToastProvider>{children}</ToastProvider>
    </ApolloProvider>
  );
}
