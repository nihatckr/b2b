import { AuthProvider } from "@/components/providers/AuthProvider";
import { GraphQLProvider } from "@/components/providers/GraphQLProvider";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { NotificationProvider } from "../components/providers/NotificationContext";
import { ThemeProvider } from "../components/providers/ThemeProvider";
import "./globals.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider session={session}>
            <GraphQLProvider>
              <NotificationProvider>
                <Toaster position="top-right" richColors />
                {children}
              </NotificationProvider>
            </GraphQLProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
