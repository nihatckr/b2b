"use client";

import {
  IconBuilding,
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "../../context/AuthProvider";
import { NavBusiness } from "./nav-business";
import { NavDocuments } from "./nav-documents";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

const getNavMainByRole = (userRole: string) => {
  const commonNav = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
  ];

  if (userRole === "ADMIN") {
    return [
      ...commonNav,
      {
        title: "Categories",
        url: "/dashboard/categories",
        icon: IconFolder,
      },
      {
        title: "Collections",
        url: "/dashboard/collections",
        icon: IconDatabase,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: IconChartBar,
      },
    ];
  }

  if (
    userRole === "MANUFACTURE" ||
    userRole === "COMPANY_OWNER" ||
    userRole === "COMPANY_EMPLOYEE"
  ) {
    return [
      ...commonNav,
      {
        title: "Company Settings",
        url: "/dashboard/company",
        icon: IconBuilding,
      },
      {
        title: "Employee Management",
        url: "/dashboard/employees",
        icon: IconUsers,
      },
      {
        title: "Categories",
        url: "/dashboard/categories",
        icon: IconFolder,
      },
      {
        title: "Collections",
        url: "/dashboard/collections",
        icon: IconDatabase,
      },
      {
        title: "Samples",
        url: "/dashboard/samples",
        icon: IconCamera,
      },
      {
        title: "Orders",
        url: "/dashboard/orders",
        icon: IconListDetails,
      },
    ];
  }

  // Customer navigation
  return [
    ...commonNav,
    {
      title: "Browse Collections",
      url: "/dashboard/collections",
      icon: IconFolder,
    },
    {
      title: "My Orders",
      url: "/dashboard/orders",
      icon: IconListDetails,
    },
  ];
};

const getBusinessNavByRole = (userRole: string) => {
  if (
    userRole === "MANUFACTURE" ||
    userRole === "COMPANY_OWNER" ||
    userRole === "COMPANY_EMPLOYEE"
  ) {
    return [
      {
        title: "Library",
        icon: IconDatabase,
        isActive: true,
        url: "/dashboard/library",
        items: [
          {
            title: "Color Management",
            url: "/dashboard/library/colors",
          },
          {
            title: "Fabric Management",
            url: "/dashboard/library/fabrics",
          },
          {
            title: "Size Management",
            url: "/dashboard/library/sizes",
          },
          {
            title: "Season Management",
            url: "/dashboard/library/seasons",
          },
          {
            title: "Fit Management",
            url: "/dashboard/library/fits",
          },
          {
            title: "Certifications",
            url: "/dashboard/library/certifications",
          },
        ],
      },
      {
        title: "Production",
        icon: IconCamera,
        isActive: true,
        url: "/dashboard/production",
        items: [
          {
            title: "Production Schedule",
            url: "/dashboard/production/schedule",
          },
          {
            title: "Active Production",
            url: "/dashboard/production/active",
          },
          {
            title: "Quality Control",
            url: "/dashboard/quality",
          },
        ],
      },
    ];
  }

  if (userRole === "CUSTOMER") {
    return [
      {
        title: "My Projects",
        icon: IconFolder,
        url: "/dashboard/projects",
        items: [
          {
            title: "Active Projects",
            url: "/dashboard/projects/active",
          },
          {
            title: "Order History",
            url: "/dashboard/projects/history",
          },
        ],
      },
    ];
  }

  // Admin full access
  return [
    {
      title: "Samples",
      icon: IconCamera,
      isActive: true,
      url: "/dashboard/samples",
      items: [
        {
          title: "All Samples",
          url: "/dashboard/samples",
        },
        {
          title: "Pending Approval",
          url: "/dashboard/samples/pending",
        },
        {
          title: "In Production",
          url: "/dashboard/samples/production",
        },
      ],
    },
  ];
};

const data = {
  adminNav: [
    {
      title: "User Management",
      url: "/admin/users",
      icon: IconUsers,
    },
    {
      title: "Company Management",
      url: "/admin/companies",
      icon: IconBuilding,
    },
    {
      title: "Category Management",
      url: "/admin/categories",
      icon: IconFolder,
    },
    {
      title: "Collection Management",
      url: "/admin/collections",
      icon: IconDatabase,
    },
    {
      title: "Admin Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Reports",
      url: "/dashboard/reports",
      icon: IconReport,
    },
    {
      name: "Production Tracking",
      url: "/dashboard/production",
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">ProtexFlow</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavMainByRole(user?.role || "CUSTOMER")} />
        {user?.role === "ADMIN" && <NavMain items={data.adminNav} />}
        <NavBusiness items={getBusinessNavByRole(user?.role || "CUSTOMER")} />
        {user?.role === "ADMIN" && <NavDocuments items={data.documents} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={
            user
              ? {
                  name: user.name ?? "",
                  email: user.email ?? "",
                }
              : null
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}
