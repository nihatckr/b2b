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
  FileCheck,
  Globe,
  Plus,
  ShieldCheck,
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

export default function CertificationsPage() {
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

  // Selected item for edit/view/delete
  const [selectedItem, setSelectedItem] = useState<LibraryItemType | null>(
    null
  );
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [activeTab, setActiveTab] = useState<string>(
    isAdmin ? "platform" : "company"
  );

  // Queries
  const [platformResult, refetchPlatform] = useQuery({
    query: DashboardPlatformStandardsDocument,
    variables: { category: "CERTIFICATION" },
  });

  const [companyResult, refetchCompany] = useQuery({
    query: DashboardMyCompanyLibraryDocument,
    variables: { category: "CERTIFICATION" },
    pause: isAdmin,
  });

  const [allCompaniesResult, refetchAllCompanies] = useQuery({
    query: DashboardLibraryItemsDocument,
    variables: {
      filter: {
        category: "CERTIFICATION",
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
        category: "CERTIFICATION" as const,
        scope: createScope,
        code: data.code,
        name: data.name,
        description: data.description || "",
        data: JSON.stringify(data.data),
        imageUrl: data.imageUrl || undefined,
        iconValue: data.iconValue || undefined,
      };

      const result = await createLibraryItem({ input });

      if (result.error) {
        toast.error(result.error.message);
        throw result.error;
      }

      toast.success("Certification created successfully!");

      await Promise.all([
        refetchPlatform({ requestPolicy: "network-only" }),
        !isAdmin && refetchCompany({ requestPolicy: "network-only" }),
        isAdmin && refetchAllCompanies({ requestPolicy: "network-only" }),
      ]);

      setCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating certification:", error);
    }
  };

  const handleOpenCreateModal = (
    scope: "PLATFORM_STANDARD" | "COMPANY_CUSTOM"
  ) => {
    setCreateScope(scope);
    setCreateModalOpen(true);
  };

  // Handler: Update library item
  const handleUpdateItem = async (data: LibraryItemFormData) => {
    if (!selectedItem?.id) return;

    try {
      // LibraryItem uses numeric ID, not Relay Global ID
      const itemId = Number(selectedItem.id);
      if (!itemId || isNaN(itemId)) {
        toast.error("Invalid item ID");
        return;
      }

      // Prepare update data (excluding code field for update)
      const input = {
        name: data.name,
        description: data.description || "",
        data:
          typeof data.data === "object" ? JSON.stringify(data.data) : data.data,
        imageUrl: data.imageUrl || undefined,
        iconValue: data.iconValue || undefined,
        isActive: true,
      };

      const result = await updateLibraryItem({
        id: itemId,
        input,
      });

      if (result.error) {
        console.error("Failed to update certification:", result.error);
        toast.error(result.error.message);
        return;
      }

      console.log("Certification updated successfully");
      toast.success("Certification updated successfully!");

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
      console.error("Error updating certification:", error);
      alert("❌ Failed to update certification");
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
    if (!selectedItem?.id || loadingDelete) return;

    setLoadingDelete(true);
    try {
      // LibraryItem uses numeric ID, not Relay Global ID
      const itemId = Number(selectedItem.id);
      if (!itemId || isNaN(itemId)) {
        toast.error("Invalid item ID");
        return;
      }

      const result = await deleteLibraryItem({ id: itemId });

      if (result.error) {
        console.error("Failed to delete certification:", result.error);
        alert(`Error: ${result.error.message}`);
        return;
      }

      console.log("Certification deleted successfully");
      alert("✅ Certification deleted successfully!");

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
      console.error("Error deleting certification:", error);
      alert("❌ Failed to delete certification");
    } finally {
      setLoadingDelete(false);
    }
  };

  // Type for certification data structure
  interface CertificationData {
    issuer?: string;
    validUntil?: string;
    certificationNumber?: string;
    [key: string]: string | undefined;
  }

  // Helper: Get issuer
  const getIssuer = (data: unknown): string | null => {
    if (!data) return null;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return (parsed as CertificationData).issuer || null;
    } catch {
      return null;
    }
  };

  // Helper: Get valid until date
  const getValidUntil = (data: unknown): string | null => {
    if (!data) return null;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return (parsed as CertificationData).validUntil || null;
    } catch {
      return null;
    }
  };

  // Helper: Get certification number
  const getCertNumber = (data: unknown): string | null => {
    if (!data) return null;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return (parsed as CertificationData).certificationNumber || null;
    } catch {
      return null;
    }
  };

  // Helper: Check if certification is expired
  const isExpired = (validUntil: string | null): boolean => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  // Helper: Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-green-600" />
              Certifications Library
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage certifications - GOTS, OEKO-TEX, Fair Trade, etc.
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
              Add Certification
            </Button>
          )}

          {activeTab === "company" && !isAdmin && (
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => handleOpenCreateModal("COMPANY_CUSTOM")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
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
                Loading certifications...
              </div>
            ) : platformData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  No platform standard certifications yet
                </p>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCreateModal("PLATFORM_STANDARD")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Certification
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {platformData.map((cert) => {
                  const issuer = getIssuer(cert.data);
                  const validUntil = getValidUntil(cert.data);
                  const certNumber = getCertNumber(cert.data);
                  const expired = isExpired(validUntil);

                  return (
                    <div
                      key={cert.id}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileCheck
                            className={`h-5 w-5 ${
                              expired
                                ? "text-red-500"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          />
                          <h4 className="font-semibold">{cert.name}</h4>
                        </div>
                        {cert.isPopular && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                            Popular
                          </span>
                        )}
                      </div>

                      {cert.code && (
                        <p className="text-sm text-muted-foreground mb-2 font-mono">
                          Code: {cert.code}
                        </p>
                      )}

                      {/* Certification Details */}
                      <div className="space-y-2 mb-3 text-sm">
                        {issuer && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Issuer:
                            </span>
                            <span className="font-medium">{issuer}</span>
                          </div>
                        )}

                        {certNumber && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">No:</span>
                            <span className="font-mono text-xs">
                              {certNumber}
                            </span>
                          </div>
                        )}

                        {validUntil && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Valid Until:
                            </span>
                            <span
                              className={`font-medium ${
                                expired ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {formatDate(validUntil)}
                            </span>
                          </div>
                        )}
                      </div>

                      {expired && (
                        <div className="mb-3 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-xs rounded">
                          ⚠️ Expired
                        </div>
                      )}

                      {cert.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {cert.description}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewDetails(cert)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditItem(cert)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteItem(cert)}
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
                <h3 className="font-semibold">My Company Certifications</h3>
                <span className="text-sm text-muted-foreground">
                  (Only visible to your team)
                </span>
              </div>

              {companyResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading your certifications...
                </div>
              ) : companyData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">
                    No custom certifications yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCreateModal("COMPANY_CUSTOM")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Certification
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companyData.map((cert) => {
                    const issuer = getIssuer(cert.data);
                    const validUntil = getValidUntil(cert.data);
                    const certNumber = getCertNumber(cert.data);
                    const expired = isExpired(validUntil);

                    return (
                      <div
                        key={cert.id}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileCheck
                              className={`h-5 w-5 ${
                                expired
                                  ? "text-red-500"
                                  : "text-blue-600 dark:text-blue-400"
                              }`}
                            />
                            <h4 className="font-semibold">{cert.name}</h4>
                          </div>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            Custom
                          </span>
                        </div>

                        {cert.code && (
                          <p className="text-sm text-muted-foreground mb-2 font-mono">
                            Code: {cert.code}
                          </p>
                        )}

                        {/* Certification Details */}
                        <div className="space-y-2 mb-3 text-sm">
                          {issuer && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                Issuer:
                              </span>
                              <span className="font-medium">{issuer}</span>
                            </div>
                          )}

                          {certNumber && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">No:</span>
                              <span className="font-mono text-xs">
                                {certNumber}
                              </span>
                            </div>
                          )}

                          {validUntil && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                Valid Until:
                              </span>
                              <span
                                className={`font-medium ${
                                  expired ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {formatDate(validUntil)}
                              </span>
                            </div>
                          )}
                        </div>

                        {expired && (
                          <div className="mb-3 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-xs rounded">
                            ⚠️ Expired - Needs Renewal
                          </div>
                        )}

                        {cert.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {cert.description}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewDetails(cert)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(cert)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteItem(cert)}
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
                  All Companies&apos; Custom Certifications
                </h3>
                <span className="text-sm text-muted-foreground">
                  (Admin view only)
                </span>
              </div>

              {allCompaniesResult.fetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading all companies&apos; certifications...
                </div>
              ) : allCompaniesData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No company custom certifications yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allCompaniesData.map((cert) => {
                    const issuer = getIssuer(cert.data);
                    const validUntil = getValidUntil(cert.data);
                    const expired = isExpired(validUntil);

                    return (
                      <div
                        key={cert.id}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileCheck
                              className={`h-5 w-5 ${
                                expired
                                  ? "text-red-500"
                                  : "text-purple-600 dark:text-purple-400"
                              }`}
                            />
                            <h4 className="font-semibold">{cert.name}</h4>
                          </div>
                          <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                            Company
                          </span>
                        </div>

                        {cert.company && (
                          <p className="text-xs text-muted-foreground mb-2 font-medium">
                            🏢 {cert.company.name}
                          </p>
                        )}

                        {cert.code && (
                          <p className="text-sm text-muted-foreground mb-2 font-mono">
                            Code: {cert.code}
                          </p>
                        )}

                        {/* Certification Details */}
                        <div className="space-y-1 mb-3 text-sm">
                          {issuer && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs">
                                Issuer:
                              </span>
                              <span className="font-medium text-xs">
                                {issuer}
                              </span>
                            </div>
                          )}

                          {validUntil && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs">
                                Valid Until:
                              </span>
                              <span
                                className={`font-medium text-xs ${
                                  expired ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {formatDate(validUntil)}
                              </span>
                            </div>
                          )}
                        </div>

                        {expired && (
                          <div className="mb-3 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-xs rounded">
                            ⚠️ Expired
                          </div>
                        )}

                        {cert.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {cert.description}
                          </p>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleViewDetails(cert)}
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
        category="CERTIFICATION"
        scope={createScope}
        onSubmit={handleCreateItem}
      />

      {/* Edit Modal */}
      {selectedItem && (
        <CreateLibraryItemModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          category="CERTIFICATION"
          scope={selectedItem.scope as "PLATFORM_STANDARD" | "COMPANY_CUSTOM"}
          onSubmit={handleUpdateItem}
          isEditMode={true}
          initialData={{
            name: selectedItem.name || "",
            code: selectedItem.code || "",
            description: selectedItem.description || "",
            imageUrl: selectedItem.imageUrl || "",
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
              <ShieldCheck className="h-5 w-5 text-green-600" />
              {selectedItem?.name}
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

              {(() => {
                const issuer = getIssuer(selectedItem.data);
                const validUntil = getValidUntil(selectedItem.data);
                const certNumber = getCertNumber(selectedItem.data);
                const expired = isExpired(validUntil);

                return (
                  <div className="space-y-3">
                    {issuer && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                          Issuer
                        </h4>
                        <p>{issuer}</p>
                      </div>
                    )}

                    {certNumber && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                          Certification Number
                        </h4>
                        <p className="font-mono text-sm">{certNumber}</p>
                      </div>
                    )}

                    {validUntil && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                          Valid Until
                        </h4>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              expired ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {formatDate(validUntil)}
                          </span>
                          {expired && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Expired
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedItem?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={loadingDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {loadingDelete ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
