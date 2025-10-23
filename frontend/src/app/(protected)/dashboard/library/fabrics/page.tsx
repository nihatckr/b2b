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
import { Building, Edit, Eye, Globe, Plus, Trash2, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

// Type alias for library item from query responses
type LibraryItemType = NonNullable<
  DashboardPlatformStandardsQuery["platformStandards"]
>[0];

export default function FabricsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createScope, setCreateScope] = useState<
    "PLATFORM_STANDARD" | "COMPANY_CUSTOM"
  >("COMPANY_CUSTOM");

  // Edit/Delete/Details modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LibraryItemType | null>(
    null
  );
  const [loadingDelete, setLoadingDelete] = useState(false);

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

  // Mutations
  const [, createLibraryItem] = useMutation(DashboardCreateLibraryItemDocument);
  const [, updateLibraryItem] = useMutation(DashboardUpdateLibraryItemDocument);
  const [, deleteLibraryItem] = useMutation(DashboardDeleteLibraryItemDocument);

  const handleCreateItem = async (data: LibraryItemFormData) => {
    try {
      // Prepare input data
      const input: CreateLibraryItemInput = {
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

      // 🖼️ Image URL is already set by FormImageUpload component
      if (data.imageUrl) {
        input.imageUrl = data.imageUrl;
      }

      const result = await createLibraryItem({ input });

      if (result.error) {
        console.error("Failed to create fabric:", result.error);
        toast.error(`Failed to create fabric: ${result.error.message}`);
        throw result.error;
      }

      console.log("Fabric created successfully:", result.data);
      toast.success("Fabric created successfully!");

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
        console.error("Failed to delete fabric:", result.error);
        toast.error(`Failed to delete fabric: ${result.error.message}`);
        return;
      }

      console.log("Fabric deleted successfully");
      toast.success("Fabric deleted successfully!");

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
      console.error("Error deleting fabric:", error);
      toast.error("Failed to delete fabric");
    } finally {
      setLoadingDelete(false);
    }
  };

  // Handler: Update library item
  const handleUpdateItem = async (data: LibraryItemFormData) => {
    if (!selectedItem) return;

    try {
      // Prepare update data (excluding code field for update)
      const input: UpdateLibraryItemInput = {
        name: data.name,
        description: data.description || "",
        data:
          typeof data.data === "object" ? JSON.stringify(data.data) : data.data,
        isActive: true,
      };

      // Note: Certifications are not supported in update operations

      // 🖼️ Image URL is already set by FormImageUpload component
      if (data.imageUrl) {
        input.imageUrl = data.imageUrl;
      }

      const result = await updateLibraryItem({
        id: parseInt(selectedItem.id || "0"),
        input,
      });

      if (result.error) {
        console.error("Failed to update fabric:", result.error);
        toast.error(`Failed to update fabric: ${result.error.message}`);
        throw result.error;
      }

      console.log("Fabric updated successfully:", result.data);
      toast.success("Fabric updated successfully!");

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
      console.error("Error updating fabric:", error);
      // Error already shown in alert above
    }
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
                {platformData.map((fabric: LibraryItemType) => (
                  <div
                    key={fabric.id}
                    className="rounded-lg border bg-card hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Fabric Image */}
                    {fabric.imageUrl && (
                      <div className="relative w-full h-48 bg-muted">
                        <NextImage
                          src={fabric.imageUrl}
                          alt={fabric.name || "Fabric"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}

                    <div className="p-4">
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
                      {fabric.data &&
                        (() => {
                          try {
                            const parsedData = JSON.parse(fabric.data);
                            return (
                              <div className="text-xs space-y-1 mb-3 border-t pt-2">
                                {parsedData.composition && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Composition:
                                    </span>
                                    <span className="font-medium">
                                      {parsedData.composition}
                                    </span>
                                  </div>
                                )}
                                {parsedData.weight && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Weight:
                                    </span>
                                    <span className="font-medium">
                                      {parsedData.weight}g/m²
                                    </span>
                                  </div>
                                )}
                                {parsedData.width && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Width:
                                    </span>
                                    <span className="font-medium">
                                      {parsedData.width}cm
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          } catch {
                            return null;
                          }
                        })()}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewDetails(fabric)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditItem(fabric)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteItem(fabric)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
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
                  {companyData.map((fabric: LibraryItemType) => (
                    <div
                      key={fabric.id}
                      className="rounded-lg border bg-card hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {/* Fabric Image */}
                      {fabric.imageUrl && (
                        <div className="relative w-full h-48 bg-muted">
                          <NextImage
                            src={fabric.imageUrl}
                            alt={fabric.name || "Fabric"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      )}

                      <div className="p-4">
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
                        {fabric.data &&
                          (() => {
                            try {
                              const parsedData = JSON.parse(fabric.data);
                              return (
                                <div className="text-xs space-y-1 mb-3 border-t pt-2">
                                  {parsedData.composition && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        Composition:
                                      </span>
                                      <span className="font-medium">
                                        {parsedData.composition}
                                      </span>
                                    </div>
                                  )}
                                  {parsedData.weight && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        Weight:
                                      </span>
                                      <span className="font-medium">
                                        {parsedData.weight}g/m²
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            } catch {
                              return null;
                            }
                          })()}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewDetails(fabric)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(fabric)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteItem(fabric)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
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
                <h3 className="font-semibold">
                  All Companies&apos; Custom Fabrics
                </h3>
                <span className="text-sm text-muted-foreground">
                  (Admin view only)
                </span>
              </div>

              {allCompaniesResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading all companies&apos; fabrics...
                </div>
              ) : allCompaniesData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No company custom fabrics yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allCompaniesData.map((fabric: LibraryItemType) => (
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

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewDetails(fabric)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
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

      {/* Edit Modal */}
      {selectedItem && (
        <CreateLibraryItemModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          category="FABRIC"
          scope={selectedItem.scope as "PLATFORM_STANDARD" | "COMPANY_CUSTOM"}
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
            certificationIds: selectedItem.certifications.map((cert) =>
              parseInt(cert.id || "0")
            ),
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
              Fabric Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about this fabric
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* Fabric Image */}
              {selectedItem.imageUrl && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                  <NextImage
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name || "Fabric"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}

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

              {/* Fabric-specific data */}
              {selectedItem.data && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Fabric Properties
                  </label>
                  <div className="mt-2 space-y-2 p-3 bg-muted/30 rounded-lg">
                    {JSON.parse(selectedItem.data).composition && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Composition:
                        </span>
                        <span className="text-sm font-medium">
                          {JSON.parse(selectedItem.data).composition}
                        </span>
                      </div>
                    )}
                    {JSON.parse(selectedItem.data).weight && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Weight:
                        </span>
                        <span className="text-sm font-medium">
                          {JSON.parse(selectedItem.data).weight}g/m²
                        </span>
                      </div>
                    )}
                    {JSON.parse(selectedItem.data).width && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Width:
                        </span>
                        <span className="text-sm font-medium">
                          {JSON.parse(selectedItem.data).width}cm
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {selectedItem.certifications &&
                selectedItem.certifications.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Certifications
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedItem.certifications.map((cert) => (
                        <span
                          key={cert.id}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {cert.name}
                        </span>
                      ))}
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
                    {new Date(selectedItem.createdAt).toLocaleDateString()}
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
              Delete Fabric
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedItem?.name}&quot;?
              This action cannot be undone and will remove the fabric from the
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
