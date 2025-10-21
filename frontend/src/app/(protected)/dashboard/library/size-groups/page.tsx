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
import { Building, Globe, Plus, Ruler, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useMutation, useQuery } from "urql";

export default function SizeGroupsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState<string>(
    isAdmin ? "platform" : "company"
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createScope, setCreateScope] = useState<
    "PLATFORM_STANDARD" | "COMPANY_CUSTOM"
  >("PLATFORM_STANDARD");

  // Queries
  const [platformResult, refetchPlatform] = useQuery({
    query: DashboardPlatformStandardsDocument,
    variables: { category: "SIZE_GROUP" },
  });

  const [companyResult, refetchCompany] = useQuery({
    query: DashboardMyCompanyLibraryDocument,
    variables: { category: "SIZE_GROUP" },
    pause: isAdmin,
  });

  const [allCompaniesResult, refetchAllCompanies] = useQuery({
    query: DashboardLibraryItemsDocument,
    variables: {
      filter: {
        category: "SIZE_GROUP",
        scope: "COMPANY_CUSTOM",
      },
    },
    pause: !isAdmin,
  });

  const platformData = platformResult.data?.platformStandards || [];
  const companyData = companyResult.data?.myCompanyLibrary || [];
  const allCompaniesData = allCompaniesResult.data?.libraryItems || [];

  // Mutation
  const [, createLibraryItem] = useMutation(DashboardCreateLibraryItemDocument);

  // Helper: Get sizes array from data
  const getSizes = (data: any): string[] => {
    if (!data) return [];
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      const sizes = parsed.sizes || [];
      // If sizes is a string (comma-separated), split it
      if (typeof sizes === "string") {
        return sizes
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
      // If sizes is already an array, return it
      if (Array.isArray(sizes)) {
        return sizes;
      }
      return [];
    } catch {
      return [];
    }
  };

  // Helper: Get size category
  const getSizeCategory = (data: any): string | null => {
    if (!data) return null;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return parsed.sizeCategory || null;
    } catch {
      return null;
    }
  };

  // Handlers
  const handleOpenCreateModal = (
    scope: "PLATFORM_STANDARD" | "COMPANY_CUSTOM"
  ) => {
    setCreateScope(scope);
    setCreateModalOpen(true);
  };

  const handleCreateItem = async (data: LibraryItemFormData) => {
    try {
      const input: any = {
        category: "SIZE_GROUP",
        scope: createScope,
        code: data.code,
        name: data.name,
        description: data.description || "",
        data: JSON.stringify(data.data),
      };

      const result = await createLibraryItem({ input });

      if (result.error) {
        alert(`Error: ${result.error.message}`);
        throw result.error;
      }

      alert("✅ Size Group created successfully!");

      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      setCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating size group:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
              <Ruler className="h-7 w-7 text-purple-600" />
              Size Groups Library
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage size groups and measurements
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
              Add Size Group
            </Button>
          )}

          {activeTab === "company" && !isAdmin && (
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => handleOpenCreateModal("COMPANY_CUSTOM")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Size Group
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
                Loading size groups...
              </div>
            ) : platformData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  No platform standard size groups yet
                </p>
                {isAdmin && (
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Standard Size Group
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {platformData.map((sizeGroup: any) => {
                  const sizes = getSizes(sizeGroup.data);
                  const category = getSizeCategory(sizeGroup.data);

                  return (
                    <div
                      key={sizeGroup.id}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{sizeGroup.name}</h4>
                        {sizeGroup.isPopular && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                            Popular
                          </span>
                        )}
                      </div>

                      {category && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Category: {category}
                        </p>
                      )}

                      {sizes.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-2">
                            Sizes:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {sizes.map((size: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {sizeGroup.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {sizeGroup.description}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Details
                        </Button>
                        {isAdmin && (
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        )}
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
                <h3 className="font-semibold">My Company Size Groups</h3>
                <span className="text-sm text-muted-foreground">
                  (Only visible to your team)
                </span>
              </div>

              {companyResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading your size groups...
                </div>
              ) : companyData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">
                    No custom size groups yet
                  </p>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Custom Size Group
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companyData.map((sizeGroup: any) => {
                    const sizes = getSizes(sizeGroup.data);
                    const category = getSizeCategory(sizeGroup.data);

                    return (
                      <div
                        key={sizeGroup.id}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{sizeGroup.name}</h4>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            Custom
                          </span>
                        </div>

                        {category && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Category: {category}
                          </p>
                        )}

                        {sizes.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-2">
                              Sizes:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {sizes.map((size: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded"
                                >
                                  {size}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                          >
                            Delete
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

        {/* All Companies Tab */}
        {isAdmin && (
          <TabsContent value="all-companies" className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold">
                  All Companies' Custom Size Groups
                </h3>
                <span className="text-sm text-muted-foreground">
                  (Admin view only)
                </span>
              </div>

              {allCompaniesResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading all companies' size groups...
                </div>
              ) : allCompaniesData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No company custom size groups yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allCompaniesData.map((sizeGroup: any) => {
                    const sizes = getSizes(sizeGroup.data);

                    return (
                      <div
                        key={sizeGroup.id}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        {sizeGroup.company && (
                          <p className="text-xs text-muted-foreground mb-2 font-medium">
                            🏢 {sizeGroup.company.name}
                          </p>
                        )}

                        <h4 className="font-medium mb-2">{sizeGroup.name}</h4>

                        {sizes.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {sizes.map((size: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded"
                                >
                                  {size}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
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
        category="SIZE_GROUP"
        scope={createScope}
        onSubmit={handleCreateItem}
      />
    </div>
  );
}
