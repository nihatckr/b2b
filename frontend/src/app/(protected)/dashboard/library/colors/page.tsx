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
import { Building, Globe, Palette, Plus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useMutation, useQuery } from "urql";

export default function ColorsPage() {
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

  // Query: Platform Standards
  const [platformResult, refetchPlatform] = useQuery({
    query: DashboardPlatformStandardsDocument,
    variables: { category: "COLOR" },
  });

  // Query: My Company Library
  const [companyResult, refetchCompany] = useQuery({
    query: DashboardMyCompanyLibraryDocument,
    variables: { category: "COLOR" },
    pause: isAdmin,
  });

  // Query: All Companies (admin only)
  const [allCompaniesResult, refetchAllCompanies] = useQuery({
    query: DashboardLibraryItemsDocument,
    variables: {
      filter: {
        category: "COLOR",
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
        category: "COLOR",
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
        console.error("Failed to create color:", result.error);
        alert(`Error: ${result.error.message}`);
        throw result.error;
      }

      alert("✅ Color created successfully!");

      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      setCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating color:", error);
    }
  };

  const handleOpenCreateModal = (
    scope: "PLATFORM_STANDARD" | "COMPANY_CUSTOM"
  ) => {
    setCreateScope(scope);
    setCreateModalOpen(true);
  };

  // Helper: Get color from data JSON
  const getColorHex = (data: any): string => {
    if (!data) return "#CCCCCC";
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return parsed.hex || "#CCCCCC";
    } catch {
      return "#CCCCCC";
    }
  };

  // Helper: Get Pantone code
  const getPantone = (data: any): string | null => {
    if (!data) return null;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return parsed.pantone || null;
    } catch {
      return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
              <Palette className="h-7 w-7 text-pink-600" />
              Colors Library
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage color palette - Hex, Pantone, RGB codes
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
              Add Color
            </Button>
          )}

          {activeTab === "company" && !isAdmin && (
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => handleOpenCreateModal("COMPANY_CUSTOM")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Color
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
                Loading colors...
              </div>
            ) : platformData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  No platform standard colors yet
                </p>
                {isAdmin && (
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Standard Color
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {platformData.map((color: any) => {
                  const hexColor = getColorHex(color.data);
                  const pantone = getPantone(color.data);

                  return (
                    <div
                      key={color.id}
                      className="group relative rounded-lg border bg-card hover:shadow-lg transition-all duration-200 overflow-hidden"
                    >
                      {/* Color Swatch */}
                      <div
                        className="h-24 sm:h-32 w-full relative"
                        style={{ backgroundColor: hexColor }}
                      >
                        {color.isPopular && (
                          <span className="absolute top-2 right-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-medium">
                            ⭐
                          </span>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>

                      {/* Color Info */}
                      <div className="p-3">
                        <h4 className="font-medium text-sm mb-1 truncate">
                          {color.name}
                        </h4>

                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="font-mono">
                            {hexColor.toUpperCase()}
                          </div>
                          {pantone && <div className="truncate">{pantone}</div>}
                          {color.code && (
                            <div className="text-[10px] truncate">
                              Code: {color.code}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-7"
                          >
                            Details
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2"
                            >
                              <span className="text-xs">Edit</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* My Company Tab */}
        {!isAdmin && (
          <TabsContent value="company" className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold">My Company Colors</h3>
                <span className="text-sm text-muted-foreground">
                  (Only visible to your team)
                </span>
              </div>

              {companyResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading your colors...
                </div>
              ) : companyData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">
                    No custom colors yet
                  </p>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Custom Color
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {companyData.map((color: any) => {
                    const hexColor = getColorHex(color.data);
                    const pantone = getPantone(color.data);

                    return (
                      <div
                        key={color.id}
                        className="group relative rounded-lg border bg-card hover:shadow-lg transition-all duration-200 overflow-hidden"
                      >
                        {/* Color Swatch */}
                        <div
                          className="h-24 sm:h-32 w-full relative"
                          style={{ backgroundColor: hexColor }}
                        >
                          <span className="absolute top-2 right-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">
                            Custom
                          </span>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>

                        {/* Color Info */}
                        <div className="p-3">
                          <h4 className="font-medium text-sm mb-1 truncate">
                            {color.name}
                          </h4>

                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="font-mono">
                              {hexColor.toUpperCase()}
                            </div>
                            {pantone && (
                              <div className="truncate">{pantone}</div>
                            )}
                            {color.code && (
                              <div className="text-[10px] truncate">
                                Code: {color.code}
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs h-7"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-red-600 hover:text-red-700"
                            >
                              <span className="text-xs">Del</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                <h3 className="font-semibold">All Companies' Custom Colors</h3>
                <span className="text-sm text-muted-foreground">
                  (Admin view only)
                </span>
              </div>

              {allCompaniesResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading all companies' colors...
                </div>
              ) : allCompaniesData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No company custom colors yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {allCompaniesData.map((color: any) => {
                    const hexColor = getColorHex(color.data);
                    const pantone = getPantone(color.data);

                    return (
                      <div
                        key={color.id}
                        className="group relative rounded-lg border bg-card hover:shadow-lg transition-all duration-200 overflow-hidden"
                      >
                        <div
                          className="h-24 sm:h-32 w-full relative"
                          style={{ backgroundColor: hexColor }}
                        >
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>

                        <div className="p-3">
                          {color.company && (
                            <p className="text-[10px] text-muted-foreground mb-1 truncate">
                              🏢 {color.company.name}
                            </p>
                          )}

                          <h4 className="font-medium text-sm mb-1 truncate">
                            {color.name}
                          </h4>

                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="font-mono">
                              {hexColor.toUpperCase()}
                            </div>
                            {pantone && (
                              <div className="truncate">{pantone}</div>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3 text-xs h-7"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Create Modal */}
      <CreateLibraryItemModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        category="COLOR"
        scope={createScope}
        onSubmit={handleCreateItem}
      />
    </div>
  );
}
