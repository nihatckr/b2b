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
import { PageHeader } from "@/components/common";
import CreateLibraryItemModal, {
  LibraryItemFormData,
} from "@/components/library/CreateLibraryItemModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ACCESSORY_CATEGORIES } from "@/utils/library-constants";
import {
  Building,
  Edit,
  Eye,
  Globe,
  Package,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";
import AlertDialogProtexflow from "../../../../../components/alerts/alert-dialog-protextflow";

// Type alias for library item from query responses
type LibraryItemType = NonNullable<
  DashboardPlatformStandardsQuery["platformStandards"]
>[0];

export default function AccessoriesPage() {
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

  // Mutations
  const [, createLibraryItem] = useMutation(DashboardCreateLibraryItemDocument);
  const [, updateLibraryItem] = useMutation(DashboardUpdateLibraryItemDocument);
  const [, deleteLibraryItem] = useMutation(DashboardDeleteLibraryItemDocument);

  const handleCreateItem = async (data: LibraryItemFormData) => {
    try {
      const input = {
        category: "MATERIAL" as const,
        scope: createScope,
        code: data.code,
        name: data.name,
        description: data.description || "",
        data: JSON.stringify(data.data),
        certificationIds: data.certificationIds || [],
        imageUrl: data.imageUrl || undefined, // 🖼️ Image URL from FormImageUpload
      };

      const result = await createLibraryItem({ input });

      if (result.error) {
        toast.error(result.error.message);
        throw result.error;
      }

      toast.success("Accessory created successfully!");

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

  // Edit/Delete/Details handlers
  const handleEditItem = (item: LibraryItemType) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleViewDetails = (item: LibraryItemType) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  const handleDeleteItem = (item: LibraryItemType) => {
    setSelectedItem(item);
    setDeleteAlertOpen(true);
  };

  const handleUpdateItem = async (data: LibraryItemFormData) => {
    if (!selectedItem?.id) return;

    try {
      // LibraryItem uses numeric ID, not Relay Global ID
      const itemId = Number(selectedItem.id);
      if (!itemId || isNaN(itemId)) {
        toast.error("Invalid item ID");
        return;
      }

      const input = {
        code: data.code,
        name: data.name,
        description: data.description || "",
        data: data.data ? JSON.stringify(data.data) : "",
        imageUrl: data.imageUrl || undefined, // 🖼️ Image URL from FormImageUpload
      };

      const result = await updateLibraryItem({
        id: itemId,
        input,
      });

      if (result.error) {
        toast.error(result.error.message);
        throw result.error;
      }

      toast.success("Accessory updated successfully!");

      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      setEditModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error updating accessory:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem?.id || loadingDelete) return;

    try {
      setLoadingDelete(true);
      // LibraryItem uses numeric ID, not Relay Global ID
      const itemId = Number(selectedItem.id);
      if (!itemId || isNaN(itemId)) {
        toast.error("Invalid item ID");
        return;
      }

      const result = await deleteLibraryItem({
        id: itemId,
      });

      if (result.error) {
        toast.error(result.error.message);
        throw result.error;
      }

      toast.success("Accessory deleted successfully!");

      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      setDeleteAlertOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting accessory:", error);
    } finally {
      setLoadingDelete(false);
    }
  };

  // Helper: Get accessory type from data
  const getAccessoryType = (data: unknown): string => {
    if (!data) return "other";
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return (parsed as { accessoryType?: string }).accessoryType || "other";
    } catch {
      return "other";
    }
  };

  // Helper: Get material info from data
  const getMaterialInfo = (data: unknown) => {
    if (!data) return { material: "", color: "", size: "" };
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      const typedParsed = parsed as {
        material?: string;
        color?: string;
        size?: string;
      };
      return {
        material: typedParsed.material || "",
        color: typedParsed.color || "",
        size: typedParsed.size || "",
      };
    } catch {
      return { material: "", color: "", size: "" };
    }
  };

  // Group accessories by type
  const groupAccessoriesByType = (accessories: LibraryItemType[]) => {
    const grouped: { [key: string]: LibraryItemType[] } = {};

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
    accessory: LibraryItemType,
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
              alt={accessory.name || "Accessory"}
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
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-7"
              onClick={() => handleViewDetails(accessory)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Details
            </Button>
            {((!isAdmin && isCompanyCustom) ||
              (isAdmin && !showCompanyName)) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => handleEditItem(accessory)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  <span className="text-xs">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteItem(accessory)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAccessoryGrid = (
    accessories: LibraryItemType[],
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
      <PageHeader
        title="Accessories Library"
        description="Manage buttons, zippers, labels, and trims"
        icon={<Package className="h-7 w-7 text-amber-600" />}
        className="mb-6"
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
                  All Companies&apos; Custom Accessories
                </h3>
                <span className="text-sm text-muted-foreground">
                  (Admin view only)
                </span>
              </div>

              {allCompaniesResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading all companies&apos; accessories...
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

      {/* Edit Modal */}
      {selectedItem && (
        <CreateLibraryItemModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          category="MATERIAL"
          scope={selectedItem.scope as "PLATFORM_STANDARD" | "COMPANY_CUSTOM"}
          onSubmit={handleUpdateItem}
          isEditMode={true}
          initialData={{
            name: selectedItem.name || "",
            code: selectedItem.code || "",
            description: selectedItem.description || "",
            imageUrl: selectedItem.imageUrl || "", // 🖼️ Pass existing image URL
            data: selectedItem.data
              ? typeof selectedItem.data === "string"
                ? JSON.parse(selectedItem.data)
                : selectedItem.data
              : {},
          }}
        />
      )}

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-600" />
              {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {/* Image Preview */}
              {selectedItem.imageUrl && (
                <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name || "Accessory"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

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

              {(() => {
                const materialInfo = getMaterialInfo(selectedItem.data);
                const accessoryType = getAccessoryType(selectedItem.data);
                const categoryInfo = ACCESSORY_CATEGORIES.find(
                  (cat) => cat.key === accessoryType
                );

                return (
                  <>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                        Type
                      </h4>
                      <p>{categoryInfo?.label || "Other"}</p>
                    </div>

                    {materialInfo.material && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                          Material
                        </h4>
                        <p>{materialInfo.material}</p>
                      </div>
                    )}

                    {materialInfo.color && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                          Color
                        </h4>
                        <p>{materialInfo.color}</p>
                      </div>
                    )}

                    {materialInfo.size && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                          Size
                        </h4>
                        <p>{materialInfo.size}</p>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-muted-foreground mb-1">
                      Created
                    </h4>
                    <p>
                      {selectedItem.createdAt &&
                        new Date(selectedItem.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground mb-1">
                      Updated
                    </h4>
                    <p>
                      {selectedItem.updatedAt &&
                        new Date(selectedItem.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialogProtexflow
        deleteAlertOpen={deleteAlertOpen}
        setDeleteAlertOpen={setDeleteAlertOpen}
        label={selectedItem?.name}
        loadingDelete={loadingDelete}
        handleConfirmDelete={handleConfirmDelete}
        alertTitle="Delete Accessory"
        alertCancelText="Cancel"
        alertSubmitText="Delete"
        alertSendText="Deleting..."
      />
    </div>
  );
}
