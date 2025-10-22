"use client";

import {
  DashboardCreateLibraryItemDocument,
  DashboardDeleteLibraryItemDocument,
  DashboardLibraryItemsDocument,
  DashboardMyCompanyLibraryDocument,
  DashboardPlatformStandardsDocument,
  DashboardPlatformStandardsQuery,
  DashboardUpdateLibraryItemDocument,
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Edit,
  Eye,
  Globe,
  Palette,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";
type LibraryColor = Exclude<
  DashboardPlatformStandardsQuery["platformStandards"],
  null | undefined
>[0];

export default function ColorsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [createScope, setCreateScope] = useState<
    "PLATFORM_STANDARD" | "COMPANY_CUSTOM"
  >("COMPANY_CUSTOM");
  const [selectedItem, setSelectedItem] = useState<LibraryColor | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

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

  // Mutations
  const [, createLibraryItem] = useMutation(DashboardCreateLibraryItemDocument);
  const [, updateLibraryItem] = useMutation(DashboardUpdateLibraryItemDocument);
  const [, deleteLibraryItem] = useMutation(DashboardDeleteLibraryItemDocument);

  const platformData = platformResult.data?.platformStandards || [];
  const companyData = companyResult.data?.myCompanyLibrary || [];
  const allCompaniesData = allCompaniesResult.data?.libraryItems || [];

  const handleCreateItem = async (data: LibraryItemFormData) => {
    try {
      const input: {
        category: string;
        scope: "PLATFORM_STANDARD" | "COMPANY_CUSTOM";
        code: string;
        name: string;
        description: string;
        data: string;
        certificationIds?: number[];
      } = {
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
        toast.error(`Failed to create color: ${result.error.message}`);
        throw result.error;
      }

      toast.success("Color created successfully!");

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
  const handleUpdateItem = async (data: LibraryItemFormData) => {
    if (!selectedItem) return;

    try {
      // Prepare update data (excluding code field for update)
      const input: {
        name: string;
        description: string;
        data: string;
        isActive: boolean;
        certificationIds?: number[];
      } = {
        name: data.name,
        description: data.description || "",
        data:
          typeof data.data === "object" ? JSON.stringify(data.data) : data.data,
        isActive: true,
      };

      // Add certification IDs if any
      if (data.certificationIds && data.certificationIds.length > 0) {
        input.certificationIds = data.certificationIds;
      }

      // TODO: Handle image upload if imageFile exists
      if (data.imageFile) {
        console.log("Image upload will be implemented next:", data.imageFile);
        // input.imageUrl = uploadedUrl;
      }

      const result = await updateLibraryItem({
        id: Number(selectedItem.id),
        input,
      });

      if (result.error) {
        console.error("Failed to update color:", result.error);
        toast.error(`Failed to update color: ${result.error.message}`);
        return;
      }

      console.log("Color updated successfully");
      toast.success("Color updated successfully!");

      // Refetch queries
      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      // Close modal and reset state
      setEditModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error updating color:", error);
      toast.error("Failed to update color");
    }
  };

  const handleOpenCreateModal = (
    scope: "PLATFORM_STANDARD" | "COMPANY_CUSTOM"
  ) => {
    setCreateScope(scope);
    setCreateModalOpen(true);
  };

  // Handler: Open edit modal
  const handleEditItem = (item: LibraryColor) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  // Handler: Open details modal
  const handleViewDetails = (item: LibraryColor) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  // Handler: Open delete confirmation
  const handleDeleteItem = (item: LibraryColor) => {
    setSelectedItem(item);
    setDeleteAlertOpen(true);
  };

  // Handler: Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    setLoadingDelete(true);
    try {
      const result = await deleteLibraryItem({
        id: Number(selectedItem.id),
      });

      if (result.error) {
        console.error("Failed to delete color:", result.error);
        toast.error(`Failed to delete color: ${result.error.message}`);
        return;
      }

      console.log("Color deleted successfully");
      toast.success("Color deleted successfully!");

      // Refetch queries
      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      // Close modal and reset state
      setDeleteAlertOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting color:", error);
      toast.error("Failed to delete color");
    } finally {
      setLoadingDelete(false);
    }
  };

  // Helper: Get color from data JSON
  const getColorHex = (data: string | object | null | undefined): string => {
    if (!data) return "#CCCCCC";
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return parsed.hex || "#CCCCCC";
    } catch {
      return "#CCCCCC";
    }
  };

  // Helper: Get Pantone code
  const getPantone = (
    data: string | object | null | undefined
  ): string | null => {
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
                {platformData.map((color: LibraryColor) => {
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

                        <div className="mt-3 flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-7"
                            onClick={() => handleViewDetails(color)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => handleEditItem(color)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteItem(color)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
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
                  {companyData.map((color: LibraryColor) => {
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

                          <div className="mt-3 flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 px-2"
                              onClick={() => handleViewDetails(color)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 px-2"
                              onClick={() => handleEditItem(color)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteItem(color)}
                            >
                              <Trash2 className="h-3 w-3" />
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
                <h3 className="font-semibold">
                  All Companies&apos; Custom Colors
                </h3>
                <span className="text-sm text-muted-foreground">
                  (Admin view only)
                </span>
              </div>

              {allCompaniesResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading all companies&apos; colors...
                </div>
              ) : allCompaniesData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No company custom colors yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {allCompaniesData.map((color: LibraryColor) => {
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
                            onClick={() => handleViewDetails(color)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
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

      {/* Edit Modal */}
      {selectedItem && (
        <CreateLibraryItemModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          category="COLOR"
          scope={
            (selectedItem.scope as "PLATFORM_STANDARD" | "COMPANY_CUSTOM") ||
            "COMPANY_CUSTOM"
          }
          onSubmit={handleUpdateItem}
          initialData={{
            code: selectedItem.code || "",
            name: selectedItem.name || "",
            description: selectedItem.description || "",
            imageUrl: selectedItem.imageUrl || "", // 🖼️ Pass existing image URL
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
                ?.map((c) => Number(c.id))
                .filter((id): id is number => !isNaN(id)) || [],
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
              Color Details
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* Color Swatch */}
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: getColorHex(selectedItem.data) }}
                />
                <div>
                  <h3 className="text-xl font-semibold">{selectedItem.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.code && `Code: ${selectedItem.code}`}
                  </p>
                </div>
              </div>

              {/* Color Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Hex Color</label>
                  <p className="font-mono text-lg">
                    {getColorHex(selectedItem.data)}
                  </p>
                </div>
                {getPantone(selectedItem.data) && (
                  <div>
                    <label className="text-sm font-medium">Pantone</label>
                    <p className="text-lg">{getPantone(selectedItem.data)}</p>
                  </div>
                )}
              </div>

              {selectedItem.description && (
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.description}
                  </p>
                </div>
              )}

              {/* Company info for admin view */}
              {selectedItem.company && (
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <p className="text-sm">{selectedItem.company.name}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Color</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedItem?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
