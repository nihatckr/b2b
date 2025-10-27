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
import { PageHeader } from "@/components/common";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  CalendarDays,
  Edit,
  Eye,
  Globe,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";
import { toTurkishDate } from "../../../../../lib/date-utils";

// Type alias for library item from query responses
type LibraryItemType = NonNullable<
  DashboardPlatformStandardsQuery["platformStandards"]
>[0];

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

  // Mutations
  const [, createLibraryItem] = useMutation(DashboardCreateLibraryItemDocument);
  const [, updateLibraryItem] = useMutation(DashboardUpdateLibraryItemDocument);
  const [, deleteLibraryItem] = useMutation(DashboardDeleteLibraryItemDocument);

  const handleCreateItem = async (data: LibraryItemFormData) => {
    try {
      const input: CreateLibraryItemInput = {
        category: "SEASON",
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
        console.error("Failed to create season:", result.error);
        toast.error(`Failed to create season: ${result.error.message}`);
        throw result.error;
      }

      console.log("Season created successfully:", result.data);
      toast.success("Season created successfully!");

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
        console.error("Failed to delete season:", result.error);
        toast.error(`Failed to delete season: ${result.error.message}`);
        return;
      }

      console.log("Season deleted successfully");
      toast.success("Season deleted successfully!");

      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      setDeleteAlertOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting season:", error);
      toast.error("Failed to delete season");
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
        console.error("Failed to update season:", result.error);
        toast.error(`Failed to update season: ${result.error.message}`);
        throw result.error;
      }

      console.log("Season updated successfully:", result.data);
      toast.success("Season updated successfully!");

      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      setEditModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error updating season:", error);
    }
  };

  const handleOpenCreateModal = (
    scope: "PLATFORM_STANDARD" | "COMPANY_CUSTOM"
  ) => {
    setCreateScope(scope);
    setCreateModalOpen(true);
  };

  // Helper: Get season type
  const getSeasonType = (data: unknown): string | null => {
    if (!data) return null;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      const parsedData = parsed as Record<string, unknown>;
      return (parsedData.type as string) || null;
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
    <div className="container mx-auto space-y-6 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <PageHeader
        title="Seasons Library"
        description="Manage seasonal collections - SS (Spring/Summer), FW (Fall/Winter)"
        icon={<CalendarDays className="h-7 w-7 text-orange-600" />}
      />

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
                {platformData.map((season: LibraryItemType) => {
                  const seasonType = getSeasonType(season.data);
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewDetails(season)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditItem(season)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteItem(season)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
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
                  {companyData.map((season: LibraryItemType) => {
                    const seasonType = getSeasonType(season.data);
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
                            onClick={() => handleViewDetails(season)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(season)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteItem(season)}
                          >
                            <Trash2 className="h-3 w-3" />
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
                <h3 className="font-semibold">
                  All Companies&apos; Custom Seasons
                </h3>
                <span className="text-sm text-muted-foreground">
                  (Admin view only)
                </span>
              </div>

              {allCompaniesResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading all companies&apos; seasons...
                </div>
              ) : allCompaniesData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No company custom seasons yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allCompaniesData.map((season: LibraryItemType) => {
                    const seasonType = getSeasonType(season.data);
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

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleViewDetails(season)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
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

      {/* Edit Modal */}
      <CreateLibraryItemModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        category="SEASON"
        scope="COMPANY_CUSTOM"
        onSubmit={handleUpdateItem}
        isEditMode={true}
        initialData={
          selectedItem
            ? {
                name: selectedItem.name || "",
                code: selectedItem.code || "",
                description: selectedItem.description || "",
                data: selectedItem.data
                  ? typeof selectedItem.data === "string"
                    ? JSON.parse(selectedItem.data)
                    : selectedItem.data
                  : {},
              }
            : undefined
        }
      />

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem && (
                <>
                  <span className="text-2xl">
                    {getSeasonEmoji(getSeasonType(selectedItem.data))}
                  </span>
                  {selectedItem.name}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Name
                  </h4>
                  <p>{selectedItem.name}</p>
                </div>
                {selectedItem.code && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                      Code
                    </h4>
                    <p className="font-mono text-sm">{selectedItem.code}</p>
                  </div>
                )}
              </div>

              {selectedItem.description && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Description
                  </h4>
                  <p className="text-sm">{selectedItem.description}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Season Type
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getSeasonEmoji(getSeasonType(selectedItem.data))}
                  </span>
                  <span>
                    {getSeasonType(selectedItem.data) === "SS"
                      ? "Spring/Summer"
                      : getSeasonType(selectedItem.data) === "FW"
                      ? "Fall/Winter"
                      : "Unknown"}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-muted-foreground mb-1">
                      Created
                    </h4>
                    <p>{toTurkishDate(selectedItem.createdAt)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground mb-1">
                      Updated
                    </h4>
                    <p>{toTurkishDate(selectedItem.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Season</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedItem?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={loadingDelete}
            >
              {loadingDelete ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
