"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthProvider";
import { usePathname } from "next/navigation";
import { NotificationCenter } from "../Notifications/NotificationCenter";

const getPageTitle = (pathname: string) => {
  if (pathname.includes("/admin")) return "Admin Panel";
  if (pathname.includes("/dashboard/collections")) return "Collections";
  if (pathname.includes("/dashboard/categories")) return "Categories";
  if (pathname.includes("/dashboard/samples")) return "Samples";
  if (pathname.includes("/dashboard/orders")) return "Orders";
  if (pathname.includes("/dashboard/messages")) return "Messages";
  if (pathname.includes("/dashboard/quality")) return "Quality Control";
  if (pathname.includes("/dashboard/production")) return "Production";
  if (pathname.includes("/dashboard/analytics")) return "Analytics";
  if (pathname.includes("/dashboard")) return "Dashboard";
  return "B2B Platform";
};

export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <NotificationCenter unreadCount={3} />
          {user && (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {user.firstName || user.name}
              </span>
              {user.company && (
                <span className="text-xs text-muted-foreground">
                  @ {user.company.name}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
