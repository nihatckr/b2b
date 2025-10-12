"use client";

import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileDescription,
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
import { NavBusiness } from "./nav-business";
import { NavDocuments } from "./nav-documents";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Users",
      url: "/dashboard/users",
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
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconChartBar,
    },
  ],
  navBusiness: [
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
        {
          title: "Completed",
          url: "/dashboard/samples/completed",
        },
      ],
    },
    {
      title: "Orders",
      icon: IconListDetails,
      url: "/dashboard/orders",
      items: [
        {
          title: "All Orders",
          url: "/dashboard/orders",
        },
        {
          title: "Pending",
          url: "/dashboard/orders/pending",
        },
        {
          title: "In Production",
          url: "/dashboard/orders/production",
        },
        {
          title: "Shipped",
          url: "/dashboard/orders/shipped",
        },
      ],
    },
    {
      title: "Communications",
      icon: IconFileDescription,
      url: "/dashboard/communications",
      items: [
        {
          title: "Questions & Answers",
          url: "/dashboard/questions",
        },
        {
          title: "Reviews",
          url: "/dashboard/reviews",
        },
      ],
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
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">ProtexFlow</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavBusiness items={data.navBusiness} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
