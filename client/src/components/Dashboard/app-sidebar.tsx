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

const getNavMainByRole = (userRole: string, companyType?: string) => {
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

  // Manufacturer - Full Production Features
  if (
    (userRole === "MANUFACTURE" ||
      userRole === "COMPANY_OWNER" ||
      userRole === "COMPANY_EMPLOYEE") &&
    companyType === "MANUFACTURER"
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
        url: "/dashboard/tasks/manufacturer",
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

  // Customer/Buyer - Limited Features
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
};

const getBusinessNavByRole = (userRole: string, companyType?: string) => {
  // Manufacturer - Library Management
  if (
    (userRole === "MANUFACTURE" ||
      userRole === "COMPANY_OWNER" ||
      userRole === "COMPANY_EMPLOYEE") &&
    companyType === "MANUFACTURER"
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

  // Customer/Buyer - No Library Access
  if (
    userRole === "CUSTOMER" ||
    userRole === "INDIVIDUAL_CUSTOMER" ||
    companyType === "BUYER"
  ) {
    return [];
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
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const companyType = user?.company?.type;

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
        <NavMain
          items={getNavMainByRole(user?.role || "CUSTOMER", companyType)}
        />
        {user?.role === "ADMIN" && <NavMain items={data.adminNav} />}
        <NavBusiness
          items={getBusinessNavByRole(user?.role || "CUSTOMER", companyType)}
        />
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
