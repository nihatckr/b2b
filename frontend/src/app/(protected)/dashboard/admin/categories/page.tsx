"use client";

import { DataTable, FilterBar, PageHeader } from "@/components/common";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder, FolderTree, List, Plus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "urql";

import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { CategoryStats } from "@/components/admin/categories/CategoryStats";
import { CategoryTreeView } from "@/components/admin/categories/CategoryTreeView";

import {
  AdminCreateStandardCategoryDocument,
  AdminDeleteStandardCategoryDocument,
  AdminStandardCategoriesCountDocument,
  AdminStandardCategoriesDocument,
  AdminStandardCategoryStatsDocument,
  AdminToggleStandardCategoryStatusDocument,
  AdminUpdateStandardCategoryDocument,
} from "@/__generated__/graphql";

import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";
import {
  buildCategoryTree,
  getCategoryLevelBadge,
  renderCategoryIcon,
  type CategoryFormData,
  type CategoryLevel,
} from "@/lib/category-utils";

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Queries
  const [{ data: statsData }] = useQuery({
    query: AdminStandardCategoryStatsDocument,
  });

  const [{ data, fetching }, refetchCategories] = useQuery({
    query: AdminStandardCategoriesDocument,
    variables: {
      search: search || undefined,
      level: levelFilter === "all" ? undefined : levelFilter,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    },
  });

  const [{ data: countData }] = useQuery({
    query: AdminStandardCategoriesCountDocument,
    variables: {
      search: search || undefined,
      level: levelFilter === "all" ? undefined : levelFilter,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
    },
  });

  // Mutations
  const createMutation = useMutation(AdminCreateStandardCategoryDocument);
  const updateMutation = useMutation(AdminUpdateStandardCategoryDocument);
  const deleteMutation = useMutation(AdminDeleteStandardCategoryDocument);
  const toggleStatusMutation = useMutation(
    AdminToggleStandardCategoryStatusDocument
  );

  const { execute: createCategory, loading: createLoading } =
    useOptimisticMutation({
      mutation: createMutation,
      successMessage: "Kategori başarıyla oluşturuldu",
      errorMessage: "Kategori oluşturulurken hata oluştu",
      refetchQueries: [
        { refetch: refetchCategories, requestPolicy: "network-only" },
      ],
    });

  const { execute: updateCategory, loading: updateLoading } =
    useOptimisticMutation({
      mutation: updateMutation,
      successMessage: "Kategori başarıyla güncellendi",
      errorMessage: "Kategori güncellenirken hata oluştu",
      refetchQueries: [
        { refetch: refetchCategories, requestPolicy: "network-only" },
      ],
    });

  const { execute: deleteCategory } = useOptimisticMutation({
    mutation: deleteMutation,
    successMessage: "Kategori başarıyla silindi",
    errorMessage: "Kategori silinirken hata oluştu",
    refetchQueries: [
      { refetch: refetchCategories, requestPolicy: "network-only" },
    ],
  });

  const { execute: toggleStatus } = useOptimisticMutation({
    mutation: toggleStatusMutation,
    successMessage: "Kategori durumu güncellendi",
    errorMessage: "Durum güncellenirken hata oluştu",
    refetchQueries: [
      { refetch: refetchCategories, requestPolicy: "network-only" },
    ],
  });

  // Handlers
  const handleCreate = async (formData: CategoryFormData) => {
    // Validate and clean keywords
    let cleanKeywords: string | undefined = undefined;
    if (formData.keywords && formData.keywords.trim() !== "") {
      try {
        JSON.parse(formData.keywords); // Validate JSON
        cleanKeywords = formData.keywords;
      } catch (e) {
        // Invalid JSON, skip it
        cleanKeywords = undefined;
      }
    }

    const result = await createCategory({
      input: {
        code: formData.code,
        name: formData.name,
        description: formData.description?.trim() || undefined,
        level: formData.level,
        order: formData.order || 0,
        icon: formData.icon?.trim() || undefined,
        image: formData.image?.trim() || undefined,
        parentId: formData.parentId || undefined,
        keywords: cleanKeywords,
        tags: formData.tags?.trim() || undefined,
        isActive: formData.isActive,
        isPublic: formData.isPublic,
      },
    });

    if (result.data) {
      setCreateDialogOpen(false);
    }
  };

  const handleUpdate = async (formData: CategoryFormData) => {
    if (!selectedCategory) return;

    const categoryId = Number(selectedCategory.id);
    if (!categoryId) return;

    const parentId = selectedCategory.parentCategory?.id
      ? Number(selectedCategory.parentCategory.id)
      : null;

    // Validate and clean keywords
    let cleanKeywords: string | undefined = undefined;
    if (
      formData.keywords !== selectedCategory.keywords &&
      formData.keywords?.trim()
    ) {
      try {
        JSON.parse(formData.keywords); // Validate JSON
        cleanKeywords = formData.keywords;
      } catch (e) {
        // Invalid JSON, keep original
        cleanKeywords = undefined;
      }
    } else if (formData.keywords !== selectedCategory.keywords) {
      // Keywords changed to empty
      cleanKeywords = undefined;
    }

    const result = await updateCategory({
      id: categoryId,
      input: {
        code:
          formData.code !== selectedCategory.code ? formData.code : undefined,
        name:
          formData.name !== selectedCategory.name ? formData.name : undefined,
        description:
          formData.description !== selectedCategory.description
            ? formData.description?.trim() || undefined
            : undefined,
        level:
          formData.level !== selectedCategory.level
            ? formData.level
            : undefined,
        order:
          formData.order !== selectedCategory.order
            ? formData.order
            : undefined,
        icon:
          formData.icon !== selectedCategory.icon
            ? formData.icon?.trim() || undefined
            : undefined,
        image:
          formData.image !== selectedCategory.image
            ? formData.image?.trim() || undefined
            : undefined,
        parentId:
          formData.parentId !== parentId ? formData.parentId : undefined,
        keywords: cleanKeywords,
        tags:
          formData.tags !== selectedCategory.tags
            ? formData.tags?.trim() || undefined
            : undefined,
        isActive:
          formData.isActive !== selectedCategory.isActive
            ? formData.isActive
            : undefined,
        isPublic:
          formData.isPublic !== selectedCategory.isPublic
            ? formData.isPublic
            : undefined,
      },
    });

    if (result.data) {
      setEditDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    const categoryId = Number(selectedCategory.id);
    if (!categoryId) return;

    await deleteCategory({ id: categoryId });
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleToggleStatus = async (category: any) => {
    const categoryId = Number(category.id);
    if (!categoryId) return;

    await toggleStatus({ id: categoryId });
  };

  // Data
  const categories = data?.adminStandardCategories || [];
  const totalCount = countData?.adminStandardCategoriesCount || 0;
  const stats = statsData?.adminStandardCategoryStats || {
    total: 0,
    active: 0,
    inactive: 0,
    byLevel: [],
  };

  // Filter categories for tree view - only use valid ones
  const validCategories = categories.filter(
    (c: any) => c.id && c.code && c.name && c.level !== null
  );
  const categoryTree = buildCategoryTree(
    validCategories.map((c: any) => ({
      id: c.id!,
      code: c.code!,
      name: c.name!,
      description: c.description,
      level: c.level!,
      order: c.order!,
      icon: c.icon,
      image: c.image,
      isActive: c.isActive!,
      isPublic: c.isPublic!,
      parentCategory: c.parentCategory,
    }))
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <PageHeader
        title="Standart Kategoriler"
        description="Platform genelinde kullanılan standart kategori yönetimi"
        icon={<Folder className="h-6 w-6" />}
        action={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kategori
          </Button>
        }
      />

      {/* Stats */}
      <CategoryStats stats={stats} />

      {/* Filters */}
      <FilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Kategori ara (kod, ad, açıklama)...",
        }}
        filters={[
          {
            value: levelFilter,
            onChange: setLevelFilter,
            options: [
              { value: "all", label: "Tüm Seviyeler" },
              { value: "ROOT", label: "Ana Kategori" },
              { value: "MAIN", label: "Ana Grup" },
              { value: "SUB", label: "Alt Grup" },
              { value: "DETAIL", label: "Detay" },
            ],
            placeholder: "Seviye",
          },
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: "Tümü" },
              { value: "active", label: "Aktif" },
              { value: "inactive", label: "Pasif" },
            ],
            placeholder: "Durum",
          },
        ]}
      />

      {/* Tabs: List / Tree View */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">
            <List className="mr-2 h-4 w-4" />
            Liste Görünümü
          </TabsTrigger>
          <TabsTrigger value="tree">
            <FolderTree className="mr-2 h-4 w-4" />
            Ağaç Görünümü
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          {fetching ? (
            <div className="rounded-md border p-8 text-center text-muted-foreground">
              Yükleniyor...
            </div>
          ) : (
            <DataTable
              data={categories}
              columns={[
                {
                  header: "Kod",
                  cell: (category: any) => (
                    <code className="text-sm font-mono">{category.code}</code>
                  ),
                },
                {
                  header: "Ad",
                  cell: (category: any) => (
                    <div className="flex items-center gap-2">
                      {renderCategoryIcon(
                        category.icon,
                        category.level as CategoryLevel,
                        "h-4 w-4 text-muted-foreground"
                      )}
                      <span className="font-medium">{category.name}</span>
                    </div>
                  ),
                },
                {
                  header: "Seviye",
                  cell: (category: any) => {
                    const { label, colorClass } = getCategoryLevelBadge(
                      category.level as CategoryLevel
                    );
                    return (
                      <Badge variant="outline" className={colorClass}>
                        {label}
                      </Badge>
                    );
                  },
                },
                {
                  header: "Ana Kategori",
                  cell: (category: any) =>
                    category.parentCategory ? (
                      <span className="text-sm text-muted-foreground">
                        {category.parentCategory.code} -{" "}
                        {category.parentCategory.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    ),
                },
                {
                  header: "Durum",
                  cell: (category: any) => (
                    <div className="flex gap-1">
                      <Badge
                        variant={category.isActive ? "default" : "destructive"}
                      >
                        {category.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                      {!category.isPublic && (
                        <Badge variant="secondary">Özel</Badge>
                      )}
                    </div>
                  ),
                },
                {
                  header: "Alt Kategoriler",
                  cell: (category: any) => category.subCategories?.length || 0,
                },
                {
                  header: "İşlemler",
                  align: "right",
                  cell: (category: any) => (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(category)}
                      >
                        {category.isActive ? "Devre Dışı" : "Aktifleştir"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedCategory(category);
                          setEditDialogOpen(true);
                        }}
                      >
                        Düzenle
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedCategory(category);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-destructive"
                      >
                        Sil
                      </Button>
                    </div>
                  ),
                },
              ]}
              emptyMessage="Kategori bulunamadı"
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Toplam {totalCount} kategoriden{" "}
                {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, totalCount)} arası
                gösteriliyor
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Sayfa {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tree View */}
        <TabsContent value="tree">
          <div className="rounded-md border bg-card">
            {categoryTree.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Kategori bulunamadı
              </p>
            ) : (
              <div className="p-2">
                <CategoryTreeView
                  tree={categoryTree}
                  onEdit={(category) => {
                    const fullCategory = categories.find(
                      (c: any) => c.id === category.id
                    );
                    if (fullCategory) {
                      setSelectedCategory(fullCategory);
                      setEditDialogOpen(true);
                    }
                  }}
                  onDelete={(category) => {
                    const fullCategory = categories.find(
                      (c: any) => c.id === category.id
                    );
                    if (fullCategory) {
                      setSelectedCategory(fullCategory);
                      setDeleteDialogOpen(true);
                    }
                  }}
                  onToggleStatus={(category) => {
                    const fullCategory = categories.find(
                      (c: any) => c.id === category.id
                    );
                    if (fullCategory) {
                      handleToggleStatus(fullCategory);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Kategori Oluştur</DialogTitle>
            <DialogDescription>
              Platform genelinde kullanılacak standart bir kategori oluşturun
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            parentCategories={categories.map((c: any) => ({
              id: c.id,
              code: c.code,
              name: c.name,
              level: c.level,
              parentCategory: c.parentCategory
                ? { id: c.parentCategory.id }
                : null,
            }))}
            onSubmit={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
            isLoading={createLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kategoriyi Düzenle</DialogTitle>
            <DialogDescription>
              Standart kategori bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <CategoryForm
              initialData={{
                id: selectedCategory.id,
                code: selectedCategory.code,
                name: selectedCategory.name,
                description: selectedCategory.description || "",
                level: selectedCategory.level as CategoryLevel,
                order: selectedCategory.order,
                icon: selectedCategory.icon || "",
                image: selectedCategory.image || "",
                parentId: selectedCategory.parentCategory
                  ? Number(selectedCategory.parentCategory.id) || undefined
                  : undefined,
                keywords: selectedCategory.keywords || "",
                tags: selectedCategory.tags || "",
                isActive: selectedCategory.isActive,
                isPublic: selectedCategory.isPublic,
              }}
              parentCategories={categories
                .filter((c: any) => c.id !== selectedCategory.id)
                .map((c: any) => ({
                  id: c.id || "",
                  code: c.code || "",
                  name: c.name || "",
                  level: c.level || "ROOT",
                  parentCategory: c.parentCategory
                    ? { id: c.parentCategory.id }
                    : null,
                }))}
              onSubmit={handleUpdate}
              onCancel={() => {
                setEditDialogOpen(false);
                setSelectedCategory(null);
              }}
              isLoading={updateLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCategory?.subCategories?.length > 0 ? (
                <span className="text-destructive font-medium">
                  Bu kategorinin {selectedCategory.subCategories.length} alt
                  kategorisi var. Önce alt kategorileri silmeniz gerekiyor.
                </span>
              ) : (
                <>
                  <strong>{selectedCategory?.name}</strong> kategorisini silmek
                  istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={selectedCategory?.subCategories?.length > 0}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
