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
import { Building, Globe, Plus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useMutation, useQuery } from "urql";

export default function FabricsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createScope, setCreateScope] = useState<
    "PLATFORM_STANDARD" | "COMPANY_CUSTOM"
  >("COMPANY_CUSTOM");

  // Default tab: Platform Standards for admin, My Company for others
  const [activeTab, setActiveTab] = useState<string>(
    isAdmin ? "platform" : "company"
  );

  // Query: Platform Standards (visible to all)
  const [platformResult, refetchPlatform] = useQuery({
    query: DashboardPlatformStandardsDocument,
    variables: { category: "FABRIC" },
  });

  // Query: My Company Library (only for non-admin)
  const [companyResult, refetchCompany] = useQuery({
    query: DashboardMyCompanyLibraryDocument,
    variables: { category: "FABRIC" },
    pause: isAdmin, // Admin doesn't need this query
  });

  // Query: All Companies (only for admin)
  const [allCompaniesResult, refetchAllCompanies] = useQuery({
    query: DashboardLibraryItemsDocument,
    variables: {
      filter: {
        category: "FABRIC",
        scope: "COMPANY_CUSTOM",
      },
    },
    pause: !isAdmin, // Only admins can see this
  });

  const platformData = platformResult.data?.platformStandards || [];
  const companyData = companyResult.data?.myCompanyLibrary || [];
  const allCompaniesData = allCompaniesResult.data?.libraryItems || [];

  // Mutation: Create library item
  const [, createLibraryItem] = useMutation(DashboardCreateLibraryItemDocument);

  const handleCreateItem = async (data: LibraryItemFormData) => {
    try {
      // Prepare input data
      const input: any = {
        category: "FABRIC",
        scope: createScope,
        code: data.code,
        name: data.name,
        description: data.description || "",
        data: JSON.stringify(data.data),
      };

      // Add certification IDs if any
      if (data.certificationIds && data.certificationIds.length > 0) {
        input.certificationIds = data.certificationIds;
      }

      // TODO: Handle image upload first if imageFile exists
      if (data.imageFile) {
        console.log("Image upload will be implemented next:", data.imageFile);
        // input.imageUrl = uploadedUrl;
      }

      const result = await createLibraryItem({ input });

      if (result.error) {
        console.error("Failed to create fabric:", result.error);
        alert(`Error: ${result.error.message}`);
        throw result.error;
      }

      console.log("Fabric created successfully:", result.data);
      alert("✅ Fabric created successfully!");

      // Refetch queries with network-only
      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      // Close modal
      setCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating fabric:", error);
      // Error already shown in alert above
    }
  };

  const handleOpenCreateModal = (
    scope: "PLATFORM_STANDARD" | "COMPANY_CUSTOM"
  ) => {
    setCreateScope(scope);
    setCreateModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
              Fabrics Library
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage fabric compositions, weights, and suppliers
            </p>
          </div>
        </div>
      </div>

      {/* Tabs - Mobile-first */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Tab List - Scrollable on mobile */}
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

          {/* Add Button - Context-aware */}
          {activeTab === "platform" && isAdmin && (
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => handleOpenCreateModal("PLATFORM_STANDARD")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fabric
            </Button>
          )}

          {activeTab === "company" && !isAdmin && (
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => handleOpenCreateModal("COMPANY_CUSTOM")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fabric
            </Button>
          )}
        </div>

        {/* Tab Content - Platform Standards */}
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
                Loading fabrics...
              </div>
            ) : platformData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  No platform standard fabrics yet
                </p>
                {isAdmin && (
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Standard
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {platformData.map((fabric: any) => (
                  <div
                    key={fabric.id}
                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{fabric.name}</h4>
                      {fabric.isPopular && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                          Popular
                        </span>
                      )}
                    </div>

                    {fabric.code && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Code: {fabric.code}
                      </p>
                    )}

                    {fabric.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {fabric.description}
                      </p>
                    )}

                    {/* Fabric-specific data */}
                    {fabric.data && (
                      <div className="text-xs space-y-1 mb-3 border-t pt-2">
                        {fabric.data.composition && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Composition:
                            </span>
                            <span className="font-medium">
                              {fabric.data.composition}
                            </span>
                          </div>
                        )}
                        {fabric.data.weight && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Weight:
                            </span>
                            <span className="font-medium">
                              {fabric.data.weight}g/m²
                            </span>
                          </div>
                        )}
                        {fabric.data.width && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Width:
                            </span>
                            <span className="font-medium">
                              {fabric.data.width}cm
                            </span>
                          </div>
                        )}
                      </div>
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
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab Content - My Company (Non-admin only) */}
        {!isAdmin && (
          <TabsContent value="company" className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold">My Company Fabrics</h3>
                <span className="text-sm text-muted-foreground">
                  (Only visible to your team)
                </span>
              </div>

              {companyResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading your fabrics...
                </div>
              ) : companyData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">
                    No custom fabrics yet
                  </p>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Custom Fabric
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companyData.map((fabric: any) => (
                    <div
                      key={fabric.id}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{fabric.name}</h4>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          Custom
                        </span>
                      </div>

                      {fabric.code && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Code: {fabric.code}
                        </p>
                      )}

                      {fabric.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {fabric.description}
                        </p>
                      )}

                      {/* Fabric-specific data */}
                      {fabric.data && (
                        <div className="text-xs space-y-1 mb-3 border-t pt-2">
                          {fabric.data.composition && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Composition:
                              </span>
                              <span className="font-medium">
                                {fabric.data.composition}
                              </span>
                            </div>
                          )}
                          {fabric.data.weight && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Weight:
                              </span>
                              <span className="font-medium">
                                {fabric.data.weight}g/m²
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
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
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        )}

        {/* Tab Content - All Companies (Admin only) */}
        {isAdmin && (
          <TabsContent value="all-companies" className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold">All Companies' Custom Fabrics</h3>
                <span className="text-sm text-muted-foreground">
                  (Admin view only)
                </span>
              </div>

              {allCompaniesResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading all companies' fabrics...
                </div>
              ) : allCompaniesData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No company custom fabrics yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allCompaniesData.map((fabric: any) => (
                    <div
                      key={fabric.id}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{fabric.name}</h4>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                          Company
                        </span>
                      </div>

                      {fabric.company && (
                        <p className="text-xs text-muted-foreground mb-2 font-medium">
                          🏢 {fabric.company.name}
                        </p>
                      )}

                      {fabric.code && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Code: {fabric.code}
                        </p>
                      )}

                      {fabric.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {fabric.description}
                        </p>
                      )}

                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                  ))}
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
        category="FABRIC"
        scope={createScope}
        onSubmit={handleCreateItem}
      />
    </div>
  );
}
