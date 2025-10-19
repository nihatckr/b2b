"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  AppSidebar,
  getNavMainByRole,
} from "../../components/dashboard/app-sidebar";
import { SiteHeader } from "../../components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "../../components/ui/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const isLoading = session === undefined;

  const router = useRouter();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If not authenticated, don't render protected content
  if (!isAuthenticated) {
    return null;
  }

  // Get navigation items based on user role
  const navItems = getNavMainByRole(
    session?.user?.role || "CUSTOMER",
    session?.user?.companyType
  );

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader user={session?.user} navItems={navItems} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
