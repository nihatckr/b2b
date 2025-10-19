"use client";

import {
  IconBuilding,
  IconCamera,
  IconChartBar,
  IconClipboardCheck,
  IconClipboardList,
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
  IconTool,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
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
        title: "Tasks",
        url: "/dashboard/tasks",
        icon: IconClipboardList,
      },
      {
        title: "Quality Control",
        url: "/dashboard/quality",
        icon: IconClipboardCheck,
      },
      {
        title: "Workshop Management",
        url: "/dashboard/workshops",
        icon: IconTool,
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
      {
        title: "Tasks",
        url: "/dashboard/tasks",
        icon: IconClipboardList,
      },
      {
        title: "Quality Control",
        url: "/dashboard/quality",
        icon: IconClipboardCheck,
      },
      {
        title: "Workshop Management",
        url: "/dashboard/workshops",
        icon: IconTool,
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
      {
        title: "Tasks",
        url: "/dashboard/tasks",
        icon: IconClipboardList,
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
    ];
  }

  // Manufacturer - Library Management Access
  if (
    (userRole === "COMPANY_OWNER" || userRole === "COMPANY_EMPLOYEE") &&
    (companyType === "MANUFACTURER" || companyType === "BOTH")
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
    ];
  }

  // Buyer or Individual Customer - No Library Access
  return [];
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
        {userRole === "ADMIN" && <NavMain items={data.adminNav} />}
        <NavBusiness items={getBusinessNavByRole(userRole, companyType)} />
        {userRole === "ADMIN" && <NavDocuments items={data.documents} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
