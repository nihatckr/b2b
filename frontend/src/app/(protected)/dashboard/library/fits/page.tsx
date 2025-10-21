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
import { Building, Globe, Plus, Sparkles, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useMutation, useQuery } from "urql";

export default function FitsPage() {
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
    variables: { category: "FIT" },
  });

  const [companyResult, refetchCompany] = useQuery({
    query: DashboardMyCompanyLibraryDocument,
    variables: { category: "FIT" },
    pause: isAdmin,
  });

  const [allCompaniesResult, refetchAllCompanies] = useQuery({
    query: DashboardLibraryItemsDocument,
    variables: {
      filter: {
        category: "FIT",
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

  // Helper: Get fit data
  const getFitData = (data: unknown) => {
    if (!data) return null;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return {
        fitCategory: (parsed as any)?.fitCategory || null,
        gender: (parsed as any)?.gender || null,
        fitType: (parsed as any)?.fitType || null,
        bodyTypes: (parsed as any)?.bodyTypes || null,
        characteristics: (parsed as any)?.characteristics || [],
      };
    } catch {
      return null;
    }
  };

  // Group fits by gender and category
  const groupFitsByGenderAndCategory = (fits: any[]) => {
    const grouped: { [gender: string]: { [category: string]: any[] } } = {};

    fits.forEach((fit: any) => {
      const fitData = getFitData(fit.data);
      if (!fitData) return;

      const gender = fitData.gender || "UNSPECIFIED";
      const category = fitData.fitCategory || "UNSPECIFIED";

      if (!grouped[gender]) grouped[gender] = {};
      if (!grouped[gender][category]) grouped[gender][category] = [];

      grouped[gender][category].push({
        ...fit,
        fitData,
      });
    });

    return grouped;
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
        category: "FIT",
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

      alert("✅ Fit created successfully!");

      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      setCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating fit:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-indigo-600" />
              Fits Library
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage fit types - Slim, Regular, Oversized
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
              Add Fit
            </Button>
          )}

          {activeTab === "company" && !isAdmin && (
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => handleOpenCreateModal("COMPANY_CUSTOM")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fit
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
                Loading fits...
              </div>
            ) : platformData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  No platform standard fits yet
                </p>
                {isAdmin && (
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Standard Fit
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(() => {
                  const groupedFits =
                    groupFitsByGenderAndCategory(platformData);

                  return Object.keys(groupedFits).map((gender) => (
                    <div key={gender} className="space-y-4">
                      {/* Gender Header */}
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <span className="text-2xl">
                          {gender === "MEN"
                            ? "👨"
                            : gender === "WOMEN"
                            ? "👩"
                            : gender === "BOYS"
                            ? "👦"
                            : gender === "GIRLS"
                            ? "👧"
                            : gender === "UNISEX"
                            ? "👤"
                            : "❓"}
                        </span>
                        <h3 className="text-lg font-semibold">
                          {gender === "MEN"
                            ? "Men's Fits"
                            : gender === "WOMEN"
                            ? "Women's Fits"
                            : gender === "BOYS"
                            ? "Boys' Fits"
                            : gender === "GIRLS"
                            ? "Girls' Fits"
                            : gender === "UNISEX"
                            ? "Unisex Fits"
                            : "Other Fits"}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          ({Object.values(groupedFits[gender]).flat().length}{" "}
                          fits)
                        </span>
                      </div>

                      {/* Categories within Gender */}
                      {Object.keys(groupedFits[gender]).map((category) => (
                        <div
                          key={`${gender}-${category}`}
                          className="space-y-3"
                        >
                          <h4 className="text-md font-medium text-muted-foreground flex items-center gap-2">
                            <span>
                              {category === "UPPER"
                                ? "👕"
                                : category === "LOWER"
                                ? "👖"
                                : category === "DRESS"
                                ? "👗"
                                : category === "OUTERWEAR"
                                ? "🧥"
                                : "📦"}
                            </span>
                            {category === "UPPER"
                              ? "Upper Body"
                              : category === "LOWER"
                              ? "Lower Body"
                              : category === "DRESS"
                              ? "Dresses"
                              : category === "OUTERWEAR"
                              ? "Outerwear"
                              : category}
                            <span className="text-xs">
                              ({groupedFits[gender][category].length})
                            </span>
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-6">
                            {groupedFits[gender][category].map(
                              (fit: {
                                id: string;
                                name: string;
                                isPopular: boolean;
                                code: string;
                                description: string;
                                fitData: {
                                  fitType: string;
                                  characteristics: string[];
                                };
                              }) => (
                                <div
                                  key={fit.id}
                                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <h5 className="font-medium text-base">
                                      {fit.name}
                                    </h5>
                                    {fit.isPopular && (
                                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                                        Popular
                                      </span>
                                    )}
                                  </div>

                                  {fit.fitData?.fitType && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      Type: {fit.fitData.fitType}
                                    </p>
                                  )}

                                  {fit.code && (
                                    <p className="text-xs text-muted-foreground mb-2">
                                      Code: {fit.code}
                                    </p>
                                  )}

                                  {fit.fitData?.characteristics &&
                                    fit.fitData.characteristics.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-3">
                                        {fit.fitData.characteristics
                                          .slice(0, 2)
                                          .map((char: string, idx: number) => (
                                            <span
                                              key={idx}
                                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                                            >
                                              {char}
                                            </span>
                                          ))}
                                      </div>
                                    )}

                                  {fit.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                      {fit.description}
                                    </p>
                                  )}

                                  <div className="flex gap-2 mt-4">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1"
                                    >
                                      Details
                                    </Button>
                                    {isAdmin && (
                                      <Button variant="outline" size="sm">
                                        Edit
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ));
                })()}
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
                <h3 className="font-semibold">My Company Fits</h3>
                <span className="text-sm text-muted-foreground">
                  (Only visible to your team)
                </span>
              </div>

              {companyResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading your fits...
                </div>
              ) : companyData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">
                    No custom fits yet
                  </p>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Custom Fit
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(() => {
                    const groupedFits =
                      groupFitsByGenderAndCategory(companyData);

                    return Object.keys(groupedFits).map((gender) => (
                      <div key={gender} className="space-y-4">
                        {/* Gender Header */}
                        <div className="flex items-center gap-2 pb-2 border-b">
                          <span className="text-2xl">
                            {gender === "MEN"
                              ? "👨"
                              : gender === "WOMEN"
                              ? "👩"
                              : gender === "BOYS"
                              ? "👦"
                              : gender === "GIRLS"
                              ? "👧"
                              : gender === "UNISEX"
                              ? "👤"
                              : "❓"}
                          </span>
                          <h3 className="text-lg font-semibold">
                            {gender === "MEN"
                              ? "Men's Fits"
                              : gender === "WOMEN"
                              ? "Women's Fits"
                              : gender === "BOYS"
                              ? "Boys' Fits"
                              : gender === "GIRLS"
                              ? "Girls' Fits"
                              : gender === "UNISEX"
                              ? "Unisex Fits"
                              : "Other Fits"}
                          </h3>
                          <span className="text-sm text-muted-foreground">
                            ({Object.values(groupedFits[gender]).flat().length}{" "}
                            custom fits)
                          </span>
                        </div>

                        {/* Categories within Gender */}
                        {Object.keys(groupedFits[gender]).map((category) => (
                          <div
                            key={`${gender}-${category}`}
                            className="space-y-3"
                          >
                            <h4 className="text-md font-medium text-muted-foreground flex items-center gap-2">
                              <span>
                                {category === "UPPER"
                                  ? "👕"
                                  : category === "LOWER"
                                  ? "👖"
                                  : category === "DRESS"
                                  ? "👗"
                                  : category === "OUTERWEAR"
                                  ? "🧥"
                                  : "📦"}
                              </span>
                              {category === "UPPER"
                                ? "Upper Body"
                                : category === "LOWER"
                                ? "Lower Body"
                                : category === "DRESS"
                                ? "Dresses"
                                : category === "OUTERWEAR"
                                ? "Outerwear"
                                : category}
                              <span className="text-xs">
                                ({groupedFits[gender][category].length})
                              </span>
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-6">
                              {groupedFits[gender][category].map(
                                (fit: {
                                  id: string;
                                  name: string;
                                  description: string;
                                  fitData: {
                                    fitType: string;
                                    characteristics: string[];
                                  };
                                }) => (
                                  <div
                                    key={fit.id}
                                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <h5 className="font-medium text-base">
                                        {fit.name}
                                      </h5>
                                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                        Custom
                                      </span>
                                    </div>

                                    {fit.fitData?.fitType && (
                                      <p className="text-sm text-muted-foreground mb-2">
                                        Type: {fit.fitData.fitType}
                                      </p>
                                    )}

                                    {fit.fitData?.characteristics &&
                                      fit.fitData.characteristics.length >
                                        0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                          {fit.fitData.characteristics
                                            .slice(0, 2)
                                            .map(
                                              (char: string, idx: number) => (
                                                <span
                                                  key={idx}
                                                  className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                                                >
                                                  {char}
                                                </span>
                                              )
                                            )}
                                        </div>
                                      )}

                                    {fit.description && (
                                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {fit.description}
                                      </p>
                                    )}

                                    <div className="flex gap-2 mt-4">
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
                                )
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}
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
                  All Companies&apos; Custom Fits
                </h3>
                <span className="text-sm text-muted-foreground">
                  (Admin view only)
                </span>
              </div>

              {allCompaniesResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading all companies&apos; fits...
                </div>
              ) : allCompaniesData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No company custom fits yet
                  </p>
                </div>
              ) : (
                (() => {
                  const groupedFits =
                    groupFitsByGenderAndCategory(allCompaniesData);

                  return (
                    <div className="space-y-6">
                      {Object.keys(groupedFits).map((gender) => (
                        <div key={gender} className="space-y-4">
                          {/* Gender Header */}
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <span className="text-2xl">
                              {gender === "MEN"
                                ? "👨"
                                : gender === "WOMEN"
                                ? "👩"
                                : gender === "BOYS"
                                ? "👦"
                                : gender === "GIRLS"
                                ? "👧"
                                : gender === "UNISEX"
                                ? "👤"
                                : "❓"}
                            </span>
                            <h3 className="text-lg font-semibold">
                              {gender === "MEN"
                                ? "Men's Fits"
                                : gender === "WOMEN"
                                ? "Women's Fits"
                                : gender === "BOYS"
                                ? "Boys' Fits"
                                : gender === "GIRLS"
                                ? "Girls' Fits"
                                : gender === "UNISEX"
                                ? "Unisex Fits"
                                : "Other Fits"}
                            </h3>
                            <span className="text-sm text-muted-foreground">
                              (
                              {Object.values(groupedFits[gender]).flat().length}{" "}
                              from all companies)
                            </span>
                          </div>

                          {/* Categories within Gender */}
                          {Object.keys(groupedFits[gender]).map((category) => (
                            <div
                              key={`${gender}-${category}`}
                              className="space-y-3"
                            >
                              <h4 className="text-md font-medium text-muted-foreground flex items-center gap-2">
                                <span>
                                  {category === "UPPER"
                                    ? "👕"
                                    : category === "LOWER"
                                    ? "👖"
                                    : category === "DRESS"
                                    ? "👗"
                                    : category === "OUTERWEAR"
                                    ? "🧥"
                                    : "📦"}
                                </span>
                                {category === "UPPER"
                                  ? "Upper Body"
                                  : category === "LOWER"
                                  ? "Lower Body"
                                  : category === "DRESS"
                                  ? "Dresses"
                                  : category === "OUTERWEAR"
                                  ? "Outerwear"
                                  : category}
                                <span className="text-xs">
                                  ({groupedFits[gender][category].length})
                                </span>
                              </h4>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-6">
                                {groupedFits[gender][category].map(
                                  (fit: {
                                    id: string;
                                    name: string;
                                    description: string;
                                    company: { name: string };
                                    fitData: {
                                      fitType: string;
                                      characteristics: string[];
                                    };
                                  }) => (
                                    <div
                                      key={fit.id}
                                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                                    >
                                      {fit.company && (
                                        <p className="text-xs text-muted-foreground mb-2 font-medium">
                                          🏢 {fit.company.name}
                                        </p>
                                      )}

                                      <h5 className="font-medium text-base mb-2">
                                        {fit.name}
                                      </h5>

                                      {fit.fitData?.fitType && (
                                        <p className="text-sm text-muted-foreground mb-2">
                                          Type: {fit.fitData.fitType}
                                        </p>
                                      )}

                                      {fit.fitData?.characteristics &&
                                        fit.fitData.characteristics.length >
                                          0 && (
                                          <div className="flex flex-wrap gap-1 mb-3">
                                            {fit.fitData.characteristics
                                              .slice(0, 2)
                                              .map(
                                                (char: string, idx: number) => (
                                                  <span
                                                    key={idx}
                                                    className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded"
                                                  >
                                                    {char}
                                                  </span>
                                                )
                                              )}
                                          </div>
                                        )}

                                      {fit.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                          {fit.description}
                                        </p>
                                      )}

                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                      >
                                        View Details
                                      </Button>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Create Modal */}
      <CreateLibraryItemModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        category="FIT"
        scope={createScope}
        onSubmit={handleCreateItem}
      />
    </div>
  );
}
