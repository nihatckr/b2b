"use client";

import {
  DashboardCreateLibraryItemDocument,
  DashboardLibraryItemsDocument,
  DashboardMyCompanyLibraryDocument,
  DashboardPlatformStandardsDocument,
} from "@/__generated__/graphql";
import CreateLibraryItemModal, {
  LibraryItemFormData,
} from "@/components/library/CreateLibraryItemModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ACCESSORY_CATEGORIES } from "@/utils/library-constants";
import { Building, Globe, Package, Plus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery } from "urql";

export default function AccessoriesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createScope, setCreateScope] = useState<
    "PLATFORM_STANDARD" | "COMPANY_CUSTOM"
  >("COMPANY_CUSTOM");

  const [activeTab, setActiveTab] = useState<string>(
    isAdmin ? "platform" : "company"
  );

  // Queries
  const [platformResult, refetchPlatform] = useQuery({
    query: DashboardPlatformStandardsDocument,
    variables: { category: "MATERIAL" },
  });

  const [companyResult, refetchCompany] = useQuery({
    query: DashboardMyCompanyLibraryDocument,
    variables: { category: "MATERIAL" },
    pause: isAdmin,
  });

  const [allCompaniesResult, refetchAllCompanies] = useQuery({
    query: DashboardLibraryItemsDocument,
    variables: {
      filter: {
        category: "MATERIAL",
        scope: "COMPANY_CUSTOM",
      },
    },
    pause: !isAdmin,
  });

  const platformData = platformResult.data?.platformStandards || [];
  const companyData = companyResult.data?.myCompanyLibrary || [];
  const allCompaniesData = allCompaniesResult.data?.libraryItems || [];

  // Mutation: Create library item
  const [, createLibraryItem] = useMutation(DashboardCreateLibraryItemDocument);

  const handleCreateItem = async (data: LibraryItemFormData) => {
    try {
      const input: any = {
        category: "MATERIAL",
        scope: createScope,
        code: data.code,
        name: data.name,
        description: data.description || "",
        data: JSON.stringify(data.data),
      };

      if (data.certificationIds && data.certificationIds.length > 0) {
        input.certificationIds = data.certificationIds;
      }

      const result = await createLibraryItem({ input });

      if (result.error) {
        console.error("Failed to create accessory:", result.error);
        alert(`Error: ${result.error.message}`);
        throw result.error;
      }

      alert("✅ Accessory created successfully!");

      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      setCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating accessory:", error);
    }
  };

  const handleOpenCreateModal = (
    scope: "PLATFORM_STANDARD" | "COMPANY_CUSTOM"
  ) => {
    setCreateScope(scope);
    setCreateModalOpen(true);
  };

  // Helper: Get accessory type from data
  const getAccessoryType = (data: any): string => {
    if (!data) return "other";
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return parsed.accessoryType || "other";
    } catch {
      return "other";
    }
  };

  // Helper: Get material info from data
  const getMaterialInfo = (data: any) => {
    if (!data) return { material: "", color: "", size: "" };
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return {
        material: parsed.material || "",
        color: parsed.color || "",
        size: parsed.size || "",
      };
    } catch {
      return { material: "", color: "", size: "" };
    }
  };

  // Group accessories by type
  const groupAccessoriesByType = (accessories: any[]) => {
    const grouped: { [key: string]: any[] } = {};

    ACCESSORY_CATEGORIES.forEach((cat) => {
      grouped[cat.key] = [];
    });

    accessories.forEach((accessory) => {
      const type = getAccessoryType(accessory.data);
      if (grouped[type]) {
        grouped[type].push(accessory);
      } else {
        grouped["other"].push(accessory);
      }
    });

    return grouped;
  };

  const renderAccessoryCard = (
    accessory: any,
    isCompanyCustom = false,
    showCompanyName = false
  ) => {
    const materialInfo = getMaterialInfo(accessory.data);
    const accessoryType = getAccessoryType(accessory.data);
    const categoryInfo = ACCESSORY_CATEGORIES.find(
      (cat) => cat.key === accessoryType
    );

    return (
      <div
        key={accessory.id}
        className="group relative rounded-lg border bg-card hover:shadow-lg transition-all duration-200 overflow-hidden"
      >
        {/* Image or Icon */}
        <div className="h-24 sm:h-32 w-full relative bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 flex items-center justify-center">
          {accessory.imageUrl ? (
            <Image
              src={accessory.imageUrl}
              alt={accessory.name}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-4xl">{categoryInfo?.icon || "📦"}</span>
          )}

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {accessory.isPopular && (
              <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-medium">
                ⭐
              </span>
            )}
            {isCompanyCustom && (
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">
                Custom
              </span>
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Accessory Info */}
        <div className="p-3">
          {showCompanyName && accessory.company && (
            <p className="text-[10px] text-muted-foreground mb-1 truncate">
              🏢 {accessory.company.name}
            </p>
          )}

          <h4 className="font-medium text-sm mb-1 truncate">
            {accessory.name}
          </h4>

          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="truncate">
              Type: {categoryInfo?.label || "Other"}
            </div>
            {materialInfo.material && (
              <div className="truncate">Material: {materialInfo.material}</div>
            )}
            {materialInfo.color && (
              <div className="truncate">Color: {materialInfo.color}</div>
            )}
            {materialInfo.size && (
              <div className="truncate">Size: {materialInfo.size}</div>
            )}
            {accessory.code && (
              <div className="text-[10px] truncate">Code: {accessory.code}</div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs h-7">
              Details
            </Button>
            {((!isAdmin && isCompanyCustom) ||
              (isAdmin && !showCompanyName)) && (
              <Button variant="outline" size="sm" className="h-7 px-2">
                <span className="text-xs">Edit</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAccessoryGrid = (
    accessories: any[],
    isCompanyCustom = false,
    showCompanyName = false
  ) => {
    const grouped = groupAccessoriesByType(accessories);

    return (
      <div className="space-y-6">
        {ACCESSORY_CATEGORIES.map((category) => {
          const categoryAccessories = grouped[category.key];
          if (categoryAccessories.length === 0) return null;

          return (
            <div key={category.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <h3 className="font-semibold text-base">{category.label}</h3>
                <span className="text-sm text-muted-foreground">
                  ({categoryAccessories.length})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {categoryAccessories.map((accessory) =>
                  renderAccessoryCard(
                    accessory,
                    isCompanyCustom,
                    showCompanyName
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
              <Package className="h-7 w-7 text-amber-600" />
              Accessories Library
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage buttons, zippers, labels, and trims
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
            <TabsTrigger value="platform" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Platform Standards</span>
              <span className="sm:hidden">Platform</span>
              <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                {platformData.length}
              </span>
            </TabsTrigger>

            {!isAdmin && (
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">My Company</span>
                <span className="sm:hidden">Company</span>
                <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                  {companyData.length}
                </span>
              </TabsTrigger>
            )}

            {isAdmin && (
              <TabsTrigger
                value="all-companies"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">All Companies</span>
                <span className="sm:hidden">All</span>
                <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                  {allCompaniesData.length}
                </span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Add Button */}
          {activeTab === "platform" && isAdmin && (
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => handleOpenCreateModal("PLATFORM_STANDARD")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Accessory
            </Button>
          )}

          {activeTab === "company" && !isAdmin && (
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => handleOpenCreateModal("COMPANY_CUSTOM")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Accessory
            </Button>
          )}
        </div>

        {/* Platform Standards Tab */}
        <TabsContent value="platform" className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold">Platform Standards</h3>
              <span className="text-sm text-muted-foreground">
                (Visible to all users)
              </span>
            </div>

            {platformResult.fetching ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading accessories...
              </div>
            ) : platformData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  No platform standard accessories yet
                </p>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCreateModal("PLATFORM_STANDARD")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Standard Accessory
                  </Button>
                )}
              </div>
            ) : (
              renderAccessoryGrid(platformData, false, false)
            )}
          </div>
        </TabsContent>

        {/* My Company Tab */}
        {!isAdmin && (
          <TabsContent value="company" className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold">My Company Accessories</h3>
                <span className="text-sm text-muted-foreground">
                  (Only visible to your team)
                </span>
              </div>

              {companyResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading your accessories...
                </div>
              ) : companyData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">
                    No custom accessories yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCreateModal("COMPANY_CUSTOM")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Custom Accessory
                  </Button>
                </div>
              ) : (
                renderAccessoryGrid(companyData, true, false)
              )}
            </div>
          </TabsContent>
        )}

        {/* All Companies Tab (Admin) */}
        {isAdmin && (
          <TabsContent value="all-companies" className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold">
                  All Companies' Custom Accessories
                </h3>
                <span className="text-sm text-muted-foreground">
                  (Admin view only)
                </span>
              </div>

              {allCompaniesResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading all companies' accessories...
                </div>
              ) : allCompaniesData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No company custom accessories yet
                  </p>
                </div>
              ) : (
                renderAccessoryGrid(allCompaniesData, false, true)
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Create Modal */}
      <CreateLibraryItemModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        category="MATERIAL"
        scope={createScope}
        onSubmit={handleCreateItem}
      />
    </div>
  );
}
