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
import { Building, CalendarDays, Globe, Plus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useMutation, useQuery } from "urql";

export default function SeasonsPage() {
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
    variables: { category: "SEASON" },
  });

  const [companyResult, refetchCompany] = useQuery({
    query: DashboardMyCompanyLibraryDocument,
    variables: { category: "SEASON" },
    pause: isAdmin,
  });

  const [allCompaniesResult, refetchAllCompanies] = useQuery({
    query: DashboardLibraryItemsDocument,
    variables: {
      filter: {
        category: "SEASON",
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

  const handleCreateItem = async (data: LibraryItemFormData) => {
    try {
      const input: any = {
        category: "SEASON",
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

      alert("✅ Season created successfully!");

      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      setCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating season:", error);
    }
  };

  const handleOpenCreateModal = (
    scope: "PLATFORM_STANDARD" | "COMPANY_CUSTOM"
  ) => {
    setCreateScope(scope);
    setCreateModalOpen(true);
  };

  // Helper: Get season type
  const getSeasonType = (data: any): string | null => {
    if (!data) return null;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return parsed.type || null;
    } catch {
      return null;
    }
  };

  // Helper: Get season year
  const getSeasonYear = (data: any): string | null => {
    if (!data) return null;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return parsed.year || null;
    } catch {
      return null;
    }
  };

  // Helper: Get season emoji
  const getSeasonEmoji = (type: string | null): string => {
    if (type === "SS") return "☀️";
    if (type === "FW") return "❄️";
    return "📅";
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
              <CalendarDays className="h-7 w-7 text-orange-600" />
              Seasons Library
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage seasonal collections - SS (Spring/Summer), FW (Fall/Winter)
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
              Add Season
            </Button>
          )}

          {activeTab === "company" && !isAdmin && (
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => handleOpenCreateModal("COMPANY_CUSTOM")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Season
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
                Loading seasons...
              </div>
            ) : platformData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  No platform standard seasons yet
                </p>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCreateModal("PLATFORM_STANDARD")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Season
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {platformData.map((season: any) => {
                  const seasonType = getSeasonType(season.data);
                  const seasonYear = getSeasonYear(season.data);
                  const emoji = getSeasonEmoji(seasonType);

                  return (
                    <div
                      key={season.id}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">{emoji}</span>
                          <div>
                            <h4 className="font-semibold">{season.name}</h4>
                            {season.code && (
                              <p className="text-xs text-muted-foreground font-mono">
                                {season.code}
                              </p>
                            )}
                          </div>
                        </div>
                        {season.isPopular && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                            Popular
                          </span>
                        )}
                      </div>

                      {season.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {season.description}
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
                <h3 className="font-semibold">My Company Seasons</h3>
                <span className="text-sm text-muted-foreground">
                  (Only visible to your team)
                </span>
              </div>

              {companyResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading your seasons...
                </div>
              ) : companyData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">
                    No custom seasons yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCreateModal("COMPANY_CUSTOM")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Season
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {companyData.map((season: any) => {
                    const seasonType = getSeasonType(season.data);
                    const seasonYear = getSeasonYear(season.data);
                    const emoji = getSeasonEmoji(seasonType);

                    return (
                      <div
                        key={season.id}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl">{emoji}</span>
                            <div>
                              <h4 className="font-semibold">{season.name}</h4>
                              {season.code && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  {season.code}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            Custom
                          </span>
                        </div>

                        {season.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {season.description}
                          </p>
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

        {/* All Companies Tab (Admin only) */}
        {isAdmin && (
          <TabsContent value="all-companies" className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold">All Companies' Custom Seasons</h3>
                <span className="text-sm text-muted-foreground">
                  (Admin view only)
                </span>
              </div>

              {allCompaniesResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading all companies' seasons...
                </div>
              ) : allCompaniesData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No company custom seasons yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allCompaniesData.map((season: any) => {
                    const seasonType = getSeasonType(season.data);
                    const seasonYear = getSeasonYear(season.data);
                    const emoji = getSeasonEmoji(seasonType);

                    return (
                      <div
                        key={season.id}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl">{emoji}</span>
                            <div>
                              <h4 className="font-semibold">{season.name}</h4>
                              {season.code && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  {season.code}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                            Company
                          </span>
                        </div>

                        {season.company && (
                          <p className="text-xs text-muted-foreground mb-2 font-medium">
                            🏢 {season.company.name}
                          </p>
                        )}

                        {season.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {season.description}
                          </p>
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
        category="SEASON"
        scope={createScope}
        onSubmit={handleCreateItem}
      />
    </div>
  );
}
