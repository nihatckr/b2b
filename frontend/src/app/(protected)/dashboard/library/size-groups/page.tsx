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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Edit,
  Eye,
  Globe,
  Plus,
  Ruler,
  Trash2,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";
import AlertDialogProtexflow from "../../../../../components/alerts/alert-dialog-protextflow";
import TitleHeader from "../../../../../components/headers/title-header";

import SizeCard from "../../../../../components/library/sizes/SizeCard";
import SizeDetail from "../../../../../components/library/sizes/SizeDetail";
import LoadingError from "../../../../../components/loading/loading-error";
import {
  getRegionalStandard,
  getSizeCategory,
  getSizes,
  getTargetGender,
} from "../../../../../lib/utils-helper";

// Type alias for library item from query responses

type LibraryItemType = NonNullable<
  DashboardPlatformStandardsQuery["platformStandards"]
>[0];

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

  // Mutations
  const [, createLibraryItem] = useMutation(DashboardCreateLibraryItemDocument);
  const [, updateLibraryItem] = useMutation(DashboardUpdateLibraryItemDocument);
  const [, deleteLibraryItem] = useMutation(DashboardDeleteLibraryItemDocument);

  // Handlers
  const handleOpenCreateModal = (
    scope: "PLATFORM_STANDARD" | "COMPANY_CUSTOM"
  ) => {
    setCreateScope(scope);
    setCreateModalOpen(true);
  };

  const handleCreateItem = async (data: LibraryItemFormData) => {
    try {
      const input = {
        category: "SIZE_GROUP" as const,
        scope: createScope,
        code: data.code,
        name: data.name,
        description: data.description || "",
        data: JSON.stringify(data.data),
      };

      const result = await createLibraryItem({ input });

      if (result.error) {
        toast.error(result.error.message);
        throw result.error;
      }

      toast.success("Size Group created successfully!");

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
      };

      const result = await updateLibraryItem({
        id: itemId,
        input,
      });

      if (result.error) {
        toast.error(result.error.message);
        throw result.error;
      }

      toast.success("Size Group updated successfully!");

      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      setEditModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error updating size group:", error);
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

      toast.success("Size Group deleted successfully!");

      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      setDeleteAlertOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting size group:", error);
    } finally {
      setLoadingDelete(false);
    }
  };
  if (
    platformData.length === 0 &&
    companyData.length === 0 &&
    allCompaniesData.length === 0
  ) {
    return (
      <LoadingError
        message="No size groups found."
        errorTitle="Veri bulunamadı.!"
      />
    );
  }
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}

      <TitleHeader
        titleHeader="Size Groups Library"
        descriptionHeader="Manage size groups and measurements"
        titleReverseHeader="Beden Grupları Kütüphanesi"
        descriptionReverseHeader="Beden gruplarını ve ölçümleri yönetin"
        isBuyer={true}
        icon={<Ruler className="h-7 w-7 text-purple-600" />}
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
        <SizeCard
          response={{
            fetching: platformResult.fetching,
            data: platformData
              .filter((item) => item.id !== null && item.id !== undefined)
              .map((item) => ({
                id: Number(item.id),
                name: item.name ?? "",
                description: item.description ?? "",
                data:
                  typeof item.data === "string"
                    ? JSON.parse(item.data)
                    : item.data ?? {},
                isPopular: item.isPopular ?? undefined,
              })),
          }}
          role={isAdmin}
          setSelectedItem={setSelectedItem}
          setEditModalOpen={setEditModalOpen}
          setDetailsModalOpen={setDetailsModalOpen}
          setDeleteAlertOpen={setDeleteAlertOpen}
          title="Platform Standards"
          subtitle="Size groups available to all users"
          description="Manage standard size groups used across the platform."
          iconText="Standard"
          value="platform"
        />
        {isAdmin && (
          <SizeCard
            response={{
              fetching: platformResult.fetching,
              data: platformData
                .filter((item) => item.id !== null && item.id !== undefined)
                .map((item) => ({
                  id: Number(item.id),
                  name: item.name ?? "",
                  description: item.description ?? "",
                  data:
                    typeof item.data === "string"
                      ? JSON.parse(item.data)
                      : item.data ?? {},
                  isPopular: item.isPopular ?? undefined,
                })),
            }}
            role={!isAdmin}
            setSelectedItem={setSelectedItem}
            setEditModalOpen={setEditModalOpen}
            setDetailsModalOpen={setDetailsModalOpen}
            setDeleteAlertOpen={setDeleteAlertOpen}
            title="Platform Standards"
            subtitle="Size groups available to all users"
            description="Manage standard size groups used across the platform."
            iconText="Standard"
            value="company"
          />
        )}
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
                  {companyData.map((sizeGroup) => {
                    const sizes = getSizes(sizeGroup.data);
                    const category = getSizeCategory(sizeGroup.data);
                    const regional = getRegionalStandard(sizeGroup.data);
                    const gender = getTargetGender(sizeGroup.data);

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

                        <div className="space-y-1 text-sm text-muted-foreground mb-3">
                          {regional && <p>Region: {regional}</p>}
                          {gender && <p>Gender: {gender}</p>}
                          {category && <p>Category: {category}</p>}
                        </div>

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
                            onClick={() => handleViewDetails(sizeGroup)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(sizeGroup)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteItem(sizeGroup)}
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

        {/* All Companies Tab */}
        {isAdmin && (
          <TabsContent value="all-companies" className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold">
                  All Companies&apos; Custom Size Groups
                </h3>
                <span className="text-sm text-muted-foreground">
                  (Admin view only)
                </span>
              </div>

              {allCompaniesResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading all companies&apos; size groups...
                </div>
              ) : allCompaniesData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No company custom size groups yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allCompaniesData.map((sizeGroup) => {
                    const sizes = getSizes(sizeGroup.data);
                    const regional = getRegionalStandard(sizeGroup.data);
                    const gender = getTargetGender(sizeGroup.data);

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

                        <div className="space-y-1 text-xs text-muted-foreground mb-3">
                          {regional && <p>Region: {regional}</p>}
                          {gender && <p>Gender: {gender}</p>}
                        </div>

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

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleViewDetails(sizeGroup)}
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
        category="SIZE_GROUP"
        scope={createScope}
        onSubmit={handleCreateItem}
      />

      {/* Edit Modal */}
      {selectedItem && (
        <CreateLibraryItemModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          category="SIZE_GROUP"
          scope={selectedItem.scope as "PLATFORM_STANDARD" | "COMPANY_CUSTOM"}
          onSubmit={handleUpdateItem}
          isEditMode={true}
          initialData={{
            name: selectedItem.name || "",
            code: selectedItem.code || "",
            description: selectedItem.description || "",
            data: selectedItem.data
              ? typeof selectedItem.data === "string"
                ? JSON.parse(selectedItem.data)
                : selectedItem.data
              : {},
          }}
        />
      )}

      {/* Details Modal */}
      <SizeDetail
        detailsModalOpen={detailsModalOpen}
        setDetailsModalOpen={setDetailsModalOpen}
        initialData={
          selectedItem
            ? {
                name: selectedItem.name ?? "",
                code: selectedItem.code ?? "",
                description: selectedItem.description ?? "",
                data:
                  typeof selectedItem.data === "string"
                    ? JSON.parse(selectedItem.data)
                    : selectedItem.data,
                createdAt: selectedItem.createdAt ?? undefined,
                updatedAt: selectedItem.updatedAt ?? undefined,
              }
            : undefined
        }
      />
      {/* Delete Confirmation Dialog */}
      <AlertDialogProtexflow
        deleteAlertOpen={deleteAlertOpen}
        setDeleteAlertOpen={setDeleteAlertOpen}
        label={selectedItem?.name || "this size group"}
        loadingDelete={loadingDelete}
        handleConfirmDelete={handleConfirmDelete}
        alertTitle="Delete Size Group"
        alertCancelText="Cancel"
        alertSubmitText="Deleting..."
        alertSendText="Delete"
      />
    </div>
  );
}
