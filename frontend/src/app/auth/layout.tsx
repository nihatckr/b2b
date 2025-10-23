import { AppProvider } from "@/components/providers/app-provider";

/**
 * Auth Layout - No session check for auth pages
 * This prevents redirect loops when sessions are expired
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pass null session to prevent session checks on auth pages
  return <AppProvider session={null}>{children}</AppProvider>;
}
