import { AppProvider } from "@/components/providers/app-provider";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Textile Production System",
  description: "GraphQL-powered textile production management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AppProvider session={session}>{children}</AppProvider>
      </body>
    </html>
  );
}
