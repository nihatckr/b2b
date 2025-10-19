"use client";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IconLogout, IconUserCircle, type Icon } from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const getPageTitle = (pathname: string) => {
  if (pathname.includes("/dashboard")) return "Dashboard";
  return "B2B Platform";
};

interface SideHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    companyId?: string;
    companyType?: string;
    backendToken?: string;
  };
  navItems?: {
    title: string;
    url: string;
    icon?: Icon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}

export function SiteHeader({ user, navItems = [] }: SideHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = getPageTitle(pathname);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = () => {
    const breadcrumbs: { title: string; url: string }[] = [
      { title: "Ana Sayfa", url: "/dashboard" },
    ];

    // Find active item and parent
    for (const item of navItems) {
      if (item.url === pathname) {
        breadcrumbs.push({ title: item.title, url: item.url });
        break;
      }

      if (item.items) {
        const activeSubItem = item.items.find(
          (subItem) => subItem.url === pathname
        );
        if (activeSubItem) {
          breadcrumbs.push({ title: item.title, url: item.url });
          breadcrumbs.push({
            title: activeSubItem.title,
            url: activeSubItem.url,
          });
          break;
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {/* Breadcrumb */}
        {breadcrumbs.length > 1 ? (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={`${crumb.url}-${index}`} className="contents">
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.url}>{crumb.title}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <h1 className="text-base font-medium">{pageTitle}</h1>
        )}

        <div className="ml-auto flex items-center gap-2">
          {user && (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg hover:bg-accent p-1.5 transition-colors">
                    <Avatar className="h-8 w-8 rounded-lg grayscale">
                      <AvatarFallback className="rounded-lg">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-lg"
                  align="end"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {user.name}
                        </span>
                        <span className="text-muted-foreground truncate text-xs">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard/settings")}
                    >
                      <IconUserCircle className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <IconLogout className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
