"use client";

import { PageHeader } from "@/components/common";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarDays,
  FileCheck,
  Package,
  Palette,
  Ruler,
  Shirt,
  Sparkles,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

// Library kategorileri - Sıralama: Fabrics, Colors, Size Groups, Fits, Materials, Certifications, Seasons
const libraryCategories = [
  {
    id: "fabrics",
    name: "Fabrics",
    description: "Fabric library - compositions, weights, suppliers",
    icon: Shirt,
    href: "/dashboard/library/fabrics",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    priority: 1,
  },
  {
    id: "colors",
    name: "Colors",
    description: "Color palette - Hex, Pantone, RGB codes",
    icon: Palette,
    href: "/dashboard/library/colors",
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950",
    priority: 2,
  },
  {
    id: "size-groups",
    name: "Size Groups",
    description: "Size groups and measurements",
    icon: Ruler,
    href: "/dashboard/library/size-groups",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    priority: 3,
  },
  {
    id: "fits",
    name: "Fits",
    description: "Fit types - Slim, Regular, Oversized",
    icon: Sparkles,
    href: "/dashboard/library/fits",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950",
    priority: 4,
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Buttons, zippers, labels, and trims",
    icon: Package,
    href: "/dashboard/library/accessories",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    priority: 5,
  },
  {
    id: "certifications",
    name: "Certifications",
    description: "Product certifications - GOTS, OEKO-TEX",
    icon: FileCheck,
    href: "/dashboard/library/certifications",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    priority: 6,
  },
  {
    id: "seasons",
    name: "Seasons",
    description: "Seasonal collections - SS, FW",
    icon: CalendarDays,
    href: "/dashboard/library/seasons",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
    priority: 7,
  },
];

export default function LibraryPage() {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <PageHeader
        title="Library Management"
        description="Manage your product library - fabrics, colors, sizes, fits, materials, certifications, and seasons"
        className="mb-6 sm:mb-8"
      />

      {/* Info Card - Mobile-first */}
      <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            How Library Works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0">
              Platform Standards:
            </span>
            <span className="text-muted-foreground">
              Created by admins, visible to all users
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-green-600 dark:text-green-400 shrink-0">
              My Company:
            </span>
            <span className="text-muted-foreground">
              Your company's custom items, only visible to your team
            </span>
          </div>
          {session?.user?.role === "ADMIN" && (
            <div className="flex items-start gap-2">
              <span className="font-semibold text-purple-600 dark:text-purple-400 shrink-0">
                All Companies:
              </span>
              <span className="text-muted-foreground">
                View all companies' custom items (admin only)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Cards Grid - Mobile-first (1 col mobile, 2 col tablet, 3 col desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {libraryCategories.map((category) => {
          const Icon = category.icon;

          return (
            <Link key={category.id} href={category.href}>
              <Card className="h-full hover:shadow-lg transition-all duration-200 hover:border-primary cursor-pointer group">
                <CardHeader className="pb-4">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${category.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <Icon
                      className={`h-6 w-6 sm:h-7 sm:w-7 ${category.color}`}
                    />
                  </div>
                  <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors">
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Platform Standards
                    </span>
                    {session?.user?.role !== "ADMIN" && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          My Company
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Bottom Info - Mobile-friendly */}
      <div className="mt-8 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <p className="mb-2 font-medium">💡 Quick Tip:</p>
        <ul className="space-y-1 ml-4 list-disc">
          <li>Use Platform Standards for industry-standard items</li>
          <li>Create Company Custom items for your specific needs</li>
          <li>
            All library items can be used in Collections, Samples, and Orders
          </li>
        </ul>
      </div>
    </div>
  );
}
