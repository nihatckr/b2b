"use client";

import {
  IconBuilding,
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useSession } from "next-auth/react";
import { NavBusiness } from "./nav-business";
import { NavDocuments } from "./nav-documents";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";

export const getNavMainByRole = (userRole: string, companyType?: string) => {
  const commonNav = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "AI Numune Asistanı",
      url: "/dashboard/ai-features",
      icon: IconSparkles,
      isActive: true,
      items: [
        {
          title: "Eskizden Tasarım",
          url: "/dashboard/ai-features/sketch-to-design",
        },
        {
          title: "Referans Ürün Analizi",
          url: "/dashboard/ai-features/reference-product",
        },
      ],
    },
  ];

  // Admin - Full Access
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
        title: "Samples",
        url: "/dashboard/samples",
        icon: IconCamera,
      },
      {
        title: "Orders",
        url: "/dashboard/orders",
        icon: IconListDetails,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: IconChartBar,
      },
    ];
  }

  // Manufacturer/Producer - Full Production Features
  if (
    (userRole === "COMPANY_OWNER" || userRole === "COMPANY_EMPLOYEE") &&
    (companyType === "MANUFACTURER" || companyType === "BOTH")
  ) {
    return [
      ...commonNav,
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

  // Buyer Company (COMPANY_OWNER/COMPANY_EMPLOYEE with BUYER type)
  if (
    (userRole === "COMPANY_OWNER" || userRole === "COMPANY_EMPLOYEE") &&
    companyType === "BUYER"
  ) {
    return [
      ...commonNav,
      {
        title: "Browse Collections",
        url: "/dashboard/collections",
        icon: IconSearch,
      },
      {
        title: "My Samples",
        url: "/dashboard/samples",
        icon: IconCamera,
      },
      {
        title: "My Orders",
        url: "/dashboard/orders",
        icon: IconListDetails,
      },
    ];
  }

  // Individual Customer or deprecated roles - Limited Features
  return [
    ...commonNav,
    {
      title: "Browse Collections",
      url: "/dashboard/collections",
      icon: IconSearch,
    },
    {
      title: "My Samples",
      url: "/dashboard/samples",
      icon: IconCamera,
    },
    {
      title: "My Orders",
      url: "/dashboard/orders",
      icon: IconListDetails,
    },
  ];
};

const getBusinessNavByRole = (userRole: string, companyType?: string) => {
  // Admin - Full Library Access
  if (userRole === "ADMIN") {
    return [
      {
        title: "Library Management",
        icon: IconDatabase,
        isActive: true,
        url: "/dashboard/library",
        items: [
          {
            title: "Fabrics",
            url: "/dashboard/library/fabrics",
          },
          {
            title: "Colors",
            url: "/dashboard/library/colors",
          },
          {
            title: "Size Groups",
            url: "/dashboard/library/size-groups",
          },
          {
            title: "Fits",
            url: "/dashboard/library/fits",
          },
          {
            title: "Accessories",
            url: "/dashboard/library/accessories",
          },
          {
            title: "Certifications",
            url: "/dashboard/library/certifications",
          },
          {
            title: "Seasons",
            url: "/dashboard/library/seasons",
          },
        ],
      },
    ];
  }

  // Manufacturer - Library Management Access
  if (
    (userRole === "COMPANY_OWNER" || userRole === "COMPANY_EMPLOYEE") &&
    (companyType === "MANUFACTURER" || companyType === "BOTH")
  ) {
    return [
      {
        title: "Library Management",
        icon: IconDatabase,
        isActive: true,
        url: "/dashboard/library",
        items: [
          {
            title: "Fabrics",
            url: "/dashboard/library/fabrics",
          },
          {
            title: "Colors",
            url: "/dashboard/library/colors",
          },
          {
            title: "Size Groups",
            url: "/dashboard/library/size-groups",
          },
          {
            title: "Fits",
            url: "/dashboard/library/fits",
          },
          {
            title: "Accessories",
            url: "/dashboard/library/accessories",
          },
          {
            title: "Certifications",
            url: "/dashboard/library/certifications",
          },
          {
            title: "Seasons",
            url: "/dashboard/library/seasons",
          },
        ],
      },
    ];
  }

  // Buyer or Individual Customer - No Library Access
  return [];
};

const data = {
  adminNav: [
    {
      title: "User Management",
      url: "/dashboard/users-management",
      icon: IconUsers,
    },
    {
      title: "Company Management",
      url: "/dashboard/companies-management",
      icon: IconBuilding,
    },
    {
      title: "Category Management",
      url: "/dashboard/categories-management",
      icon: IconFolder,
    },
    {
      title: "Collection Management",
      url: "/dashboard/collections-management",
      icon: IconDatabase,
    },
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: IconReport,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "Reports",
      url: "/dashboard/reports",
      icon: IconReport,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const userRole = user.role || "INDIVIDUAL_CUSTOMER";
  const companyType = (user as any).companyType; // Type will be recognized after TS restart

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
        <NavMain items={getNavMainByRole(userRole, companyType)} />
        {userRole === "ADMIN" && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70">
              Admin Panel
            </SidebarGroupLabel>
            <SidebarGroupContent className="flex flex-col gap-2">
              <SidebarMenu>
                {data.adminNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton tooltip={item.title} asChild>
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        <NavBusiness items={getBusinessNavByRole(userRole, companyType)} />
        {userRole === "ADMIN" && <NavDocuments items={data.documents} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
