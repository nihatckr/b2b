"use client";

import { SessionProvider } from "next-auth/react";
import { SessionTimeoutWarning } from "./SessionTimeoutWarning";

interface ClientSessionProviderProps {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
}

export function AuthProvider({
  children,
  session,
}: ClientSessionProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
      <SessionTimeoutWarning />
    </SessionProvider>
  );
}
