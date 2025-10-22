"use client";

import {
  CreateLibraryItemInput,
  DashboardCreateLibraryItemDocument,
  DashboardDeleteLibraryItemDocument,
  DashboardLibraryItemsDocument,
  DashboardMyCompanyLibraryDocument,
  DashboardPlatformStandardsDocument,
  DashboardPlatformStandardsQuery,
  DashboardUpdateLibraryItemDocument,
  UpdateLibraryItemInput,
} from "@/__generated__/graphql";
import CreateLibraryItemModal, {
  LibraryItemFormData,
} from "@/components/library/CreateLibraryItemModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Edit,
  Eye,
  Globe,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

// Type alias for library item from query responses
type LibraryItemType = NonNullable<
  DashboardPlatformStandardsQuery["platformStandards"]
>[0];

// Extended type with fit data
type FitWithData = LibraryItemType & {
  fitData?: {
    fitCategory: string | null;
    gender: string | null;
    fitType: string | null;
    bodyTypes: string | null;
    characteristics: string[];
  };
};

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

  // Edit/Delete/Details modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LibraryItemType | null>(
    null
  );
  const [loadingDelete, setLoadingDelete] = useState(false);

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

  // Mutations
  const [, createLibraryItem] = useMutation(DashboardCreateLibraryItemDocument);
  const [, updateLibraryItem] = useMutation(DashboardUpdateLibraryItemDocument);
  const [, deleteLibraryItem] = useMutation(DashboardDeleteLibraryItemDocument);

  // Helper: Get fit data
  const getFitData = (data: unknown) => {
    if (!data) return null;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      const parsedData = parsed as Record<string, unknown>;
      return {
        fitCategory: (parsedData?.fitCategory as string) || null,
        gender: (parsedData?.gender as string) || null,
        fitType: (parsedData?.fitType as string) || null,
        bodyTypes: (parsedData?.bodyTypes as string) || null,
        characteristics: Array.isArray(parsedData?.characteristics)
          ? (parsedData.characteristics as string[])
          : [],
      };
    } catch {
      return null;
    }
  };

  // Group fits by gender and category
  const groupFitsByGenderAndCategory = (fits: LibraryItemType[]) => {
    const grouped: {
      [gender: string]: { [category: string]: FitWithData[] };
    } = {};

    fits.forEach((fit: LibraryItemType) => {
      const fitData = getFitData(fit.data);
      if (!fitData) return;

      const gender = (fitData.gender as string) || "UNSPECIFIED";
      const category = (fitData.fitCategory as string) || "UNSPECIFIED";

      if (!grouped[gender]) grouped[gender] = {};
      if (!grouped[gender][category]) grouped[gender][category] = [];

      grouped[gender][category].push({
        ...fit,
        fitData,
      } as FitWithData);
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
      const input: CreateLibraryItemInput = {
        category: "FIT",
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
        console.error("Failed to create fit:", result.error);
        toast.error(`Failed to create fit: ${result.error.message}`);
        throw result.error;
      }

      console.log("Fit created successfully:", result.data);
      toast.success("Fit created successfully!");

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

  // Handler: Open edit modal
  const handleEditItem = (item: LibraryItemType) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  // Handler: Open details modal
  const handleViewDetails = (item: LibraryItemType) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  // Handler: Open delete confirmation
  const handleDeleteItem = (item: LibraryItemType) => {
    setSelectedItem(item);
    setDeleteAlertOpen(true);
  };

  // Handler: Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    setLoadingDelete(true);
    try {
      const result = await deleteLibraryItem({
        id: parseInt(selectedItem.id || "0"),
      });

      if (result.error) {
        console.error("Failed to delete fit:", result.error);
        toast.error(`Failed to delete fit: ${result.error.message}`);
        return;
      }

      console.log("Fit deleted successfully");
      toast.success("Fit deleted successfully!");

      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      setDeleteAlertOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting fit:", error);
      toast.error("Failed to delete fit");
    } finally {
      setLoadingDelete(false);
    }
  };

  // Handler: Update library item
  const handleUpdateItem = async (data: LibraryItemFormData) => {
    if (!selectedItem) return;

    try {
      const input: UpdateLibraryItemInput = {
        name: data.name,
        description: data.description || "",
        data:
          typeof data.data === "object" ? JSON.stringify(data.data) : data.data,
        isActive: true,
      };

      const result = await updateLibraryItem({
        id: parseInt(selectedItem.id || "0"),
        input,
      });

      if (result.error) {
        console.error("Failed to update fit:", result.error);
        toast.error(`Failed to update fit: ${result.error.message}`);
        throw result.error;
      }

      console.log("Fit updated successfully:", result.data);
      toast.success("Fit updated successfully!");

      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      setEditModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error updating fit:", error);
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
              <div className="space-y-6">
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
                          <h4 className="text-md font-medium text-muted-foreground flex items-center gap-2 pl-4">
                            <span>
                              {category === "Top"
                                ? "👕"
                                : category === "Bottom"
                                ? "👖"
                                : category === "Dress"
                                ? "👗"
                                : category === "Outerwear"
                                ? "🧥"
                                : "📦"}
                            </span>
                            {category}
                            <span className="text-xs">
                              ({groupedFits[gender][category].length})
                            </span>
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {groupedFits[gender][category].map(
                              (fitWithData: FitWithData) => {
                                const fit = fitWithData; // Keep original fit object
                                return (
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
                                      fit.fitData.characteristics.length >
                                        0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                          {fit.fitData.characteristics
                                            .slice(0, 2)
                                            .map(
                                              (char: string, idx: number) => (
                                                <span
                                                  key={idx}
                                                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
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
                                        onClick={() => handleViewDetails(fit)}
                                      >
                                        <Eye className="h-3 w-3 mr-1" />
                                        Details
                                      </Button>
                                      {isAdmin && (
                                        <>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditItem(fit)}
                                          >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Edit
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() =>
                                              handleDeleteItem(fit)
                                            }
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
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
                <div className="space-y-6">
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
                            <h4 className="text-md font-medium text-muted-foreground flex items-center gap-2 pl-4">
                              <span>
                                {category === "Top"
                                  ? "👕"
                                  : category === "Bottom"
                                  ? "👖"
                                  : category === "Dress"
                                  ? "👗"
                                  : category === "Outerwear"
                                  ? "🧥"
                                  : "📦"}
                              </span>
                              {category}
                              <span className="text-xs">
                                ({groupedFits[gender][category].length})
                              </span>
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {groupedFits[gender][category].map(
                                (fitWithData: FitWithData) => {
                                  const fit = fitWithData; // Keep original fit object
                                  return (
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
                                          onClick={() => handleViewDetails(fit)}
                                        >
                                          <Eye className="h-3 w-3 mr-1" />
                                          Details
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleEditItem(fit)}
                                        >
                                          <Edit className="h-3 w-3 mr-1" />
                                          Edit
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-red-600 hover:text-red-700"
                                          onClick={() => handleDeleteItem(fit)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                }
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
                              <h4 className="text-md font-medium text-muted-foreground flex items-center gap-2 pl-4">
                                <span>
                                  {category === "Top"
                                    ? "👕"
                                    : category === "Bottom"
                                    ? "👖"
                                    : category === "Dress"
                                    ? "👗"
                                    : category === "Outerwear"
                                    ? "🧥"
                                    : "📦"}
                                </span>
                                {category}
                                <span className="text-xs">
                                  ({groupedFits[gender][category].length})
                                </span>
                              </h4>{" "}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {groupedFits[gender][category].map(
                                  (fitWithData: FitWithData) => {
                                    const fit = fitWithData; // Keep original fit object
                                    return (
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
                                                  (
                                                    char: string,
                                                    idx: number
                                                  ) => (
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
                                          onClick={() => handleViewDetails(fit)}
                                        >
                                          <Eye className="h-3 w-3 mr-1" />
                                          View Details
                                        </Button>
                                      </div>
                                    );
                                  }
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

      {/* Edit Modal */}
      {selectedItem && (
        <CreateLibraryItemModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          category="FIT"
          scope={selectedItem.scope as "PLATFORM_STANDARD" | "COMPANY_CUSTOM"}
          onSubmit={handleUpdateItem}
          initialData={{
            code: selectedItem.code || "",
            name: selectedItem.name || "",
            description: selectedItem.description || "",
            data: (() => {
              try {
                return typeof selectedItem.data === "string"
                  ? JSON.parse(selectedItem.data)
                  : selectedItem.data || {};
              } catch (e) {
                console.warn("Failed to parse selectedItem.data:", e);
                return {};
              }
            })(),
            certificationIds:
              selectedItem.certifications
                ?.map((cert) => cert.id)
                .filter((id) => id != null)
                .map((id) => parseInt(id!)) || [],
            tags: selectedItem.tags || "",
          }}
          isEditMode={true}
        />
      )}

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Fit Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about this fit
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Code
                  </label>
                  <p className="font-mono">{selectedItem.code || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="font-medium">{selectedItem.name}</p>
                </div>
              </div>

              {selectedItem.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="text-sm">{selectedItem.description}</p>
                </div>
              )}

              {/* Fit-specific data */}
              {selectedItem.data &&
                (() => {
                  try {
                    const fitData = JSON.parse(selectedItem.data);
                    return (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Fit Properties
                        </label>
                        <div className="mt-2 space-y-2 p-3 bg-muted/30 rounded-lg">
                          {fitData.gender && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Gender:
                              </span>
                              <span className="text-sm font-medium">
                                {fitData.gender}
                              </span>
                            </div>
                          )}
                          {fitData.fitCategory && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Category:
                              </span>
                              <span className="text-sm font-medium">
                                {fitData.fitCategory}
                              </span>
                            </div>
                          )}
                          {fitData.fitType && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Type:
                              </span>
                              <span className="text-sm font-medium">
                                {fitData.fitType}
                              </span>
                            </div>
                          )}
                          {fitData.characteristics &&
                            fitData.characteristics.length > 0 && (
                              <div>
                                <span className="text-sm text-muted-foreground">
                                  Characteristics:
                                </span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {fitData.characteristics.map(
                                    (char: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                                      >
                                        {char}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  } catch {
                    return null;
                  }
                })()}

              {/* Certifications */}
              {selectedItem.certifications &&
                selectedItem.certifications.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Certifications
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedItem.certifications.map(
                        (cert) =>
                          cert.id &&
                          cert.name && (
                            <span
                              key={cert.id}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                            >
                              {cert.name}
                            </span>
                          )
                      )}
                    </div>
                  </div>
                )}

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Scope
                  </label>
                  <p className="text-sm">
                    {selectedItem.scope === "PLATFORM_STANDARD"
                      ? "Platform Standard"
                      : "Company Custom"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created
                  </label>
                  <p className="text-sm">
                    {selectedItem.createdAt &&
                      new Date(selectedItem.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Fit
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedItem?.name}&quot;?
              This action cannot be undone and will remove the fit from the
              library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={loadingDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {loadingDelete ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
