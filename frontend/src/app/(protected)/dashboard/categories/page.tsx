"use client";

import { PageHeader } from "@/components/common";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit,
  Folder,
  FolderTree,
  List,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "urql";

import {
  DashboardCategoriesCountDocument,
  DashboardCategoriesDocument,
  DashboardCategoryTreeDocument,
  DashboardCreateCategoryDocument,
  DashboardDeleteCategoryDocument,
  DashboardRootCategoriesDocument,
  DashboardUpdateCategoryDocument,
} from "@/__generated__/graphql";

import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";

interface CategoryFormData {
  name: string;
  description: string;
  parentCategoryId: number | null;
}

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("list");
  const pageSize = 20;

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    parentCategoryId: null,
  });
  const [formErrors, setFormErrors] = useState<Partial<CategoryFormData>>({});

  // Queries
  const [{ data, fetching }, refetchCategories] = useQuery({
    query: DashboardCategoriesDocument,
    variables: {
      search: search || undefined,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    },
  });

  const [{ data: countData }] = useQuery({
    query: DashboardCategoriesCountDocument,
    variables: {
      search: search || undefined,
    },
  });

  const [{ data: rootData }] = useQuery({
    query: DashboardRootCategoriesDocument,
  });

  const [{ data: treeData }] = useQuery({
    query: DashboardCategoryTreeDocument,
  });

  // Mutations
  const createMutation = useMutation(DashboardCreateCategoryDocument);
  const updateMutation = useMutation(DashboardUpdateCategoryDocument);
  const deleteMutation = useMutation(DashboardDeleteCategoryDocument);

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

  const { execute: deleteCategory, loading: deleteLoading } =
    useOptimisticMutation({
      mutation: deleteMutation,
      successMessage: "Kategori başarıyla silindi",
      errorMessage: "Kategori silinirken hata oluştu",
      refetchQueries: [
        { refetch: refetchCategories, requestPolicy: "network-only" },
      ],
    });

  // Handlers
  const handleOpenCreateDialog = () => {
    setFormData({ name: "", description: "", parentCategoryId: null });
    setFormErrors({});
    setCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (category: any) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      parentCategoryId: category.parentCategory?.id || null,
    });
    setFormErrors({});
    setEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (category: any) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) {
      errors.name = "Kategori adı gereklidir";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    await createCategory({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      parentCategoryId: formData.parentCategoryId || undefined,
    });

    setCreateDialogOpen(false);
  };

  const handleUpdate = async () => {
    if (!validateForm() || !selectedCategory) return;

    await updateCategory({
      id: selectedCategory.id,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });

    setEditDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    await deleteCategory({ id: selectedCategory.id });
    setDeleteDialogOpen(false);
  };

  // Table columns
  const columns = [
    {
      header: "Kategori Adı",
      accessorKey: "name",
      cell: ({ row }: any) => {
        const category = row.original || row;
        return (
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{category.name}</span>
          </div>
        );
      },
    },
    {
      header: "Açıklama",
      accessorKey: "description",
      cell: ({ row }: any) => {
        const category = row.original || row;
        return (
          <span className="text-sm text-muted-foreground">
            {category.description || "-"}
          </span>
        );
      },
    },
    {
      header: "Üst Kategori",
      accessorKey: "parentCategory",
      cell: ({ row }: any) => {
        const category = row.original || row;
        return (
          <span className="text-sm">
            {category.parentCategory?.name || (
              <Badge variant="outline">Ana Kategori</Badge>
            )}
          </span>
        );
      },
    },
    {
      header: "Alt Kategoriler",
      accessorKey: "subCategories",
      cell: ({ row }: any) => {
        const category = row.original || row;
        return (
          <Badge variant="secondary">
            {category.subCategories?.length || 0} alt kategori
          </Badge>
        );
      },
    },
    {
      header: "Koleksiyonlar",
      accessorKey: "collections",
      cell: ({ row }: any) => {
        const category = row.original || row;
        return (
          <Badge variant="outline">
            {category.collections?.length || 0} ürün
          </Badge>
        );
      },
    },
    {
      header: "İşlemler",
      accessorKey: "actions",
      cell: ({ row }: any) => {
        const category = row.original || row;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenEditDialog(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDeleteDialog(category)}
              disabled={
                (category.subCategories?.length || 0) > 0 ||
                (category.collections?.length || 0) > 0
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Render category tree
  const renderCategoryTree = (categories: any[], level = 0) => {
    if (!categories || categories.length === 0) return null;

    return (
      <div className={`${level > 0 ? "ml-6 mt-2" : ""}`}>
        {categories.map((category: any) => (
          <div key={category.id} className="mb-2">
            <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 flex-1">
                <Folder className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">{category.name}</div>
                  {category.description && (
                    <div className="text-sm text-muted-foreground">
                      {category.description}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {category.children && category.children.length > 0 && (
                  <Badge variant="secondary">
                    {category.children.length} alt kategori
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditDialog(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {category.children &&
              renderCategoryTree(category.children, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  const totalPages = Math.ceil((countData?.categoriesCount || 0) / pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategoriler"
        description="Ürün kategorilerinizi yönetin"
        action={
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kategori
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            Liste Görünümü
          </TabsTrigger>
          <TabsTrigger value="tree">
            <FolderTree className="h-4 w-4 mr-2" />
            Ağaç Görünümü
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Kategori ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {fetching ? (
            <div className="text-center py-8 text-muted-foreground">
              Yükleniyor...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      {columns.map((column, index) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left text-sm font-medium"
                        >
                          {column.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data?.categories && data.categories.length > 0 ? (
                      data.categories.map((category: any, rowIndex: number) => (
                        <tr
                          key={category.id || rowIndex}
                          className="border-t hover:bg-muted/50"
                        >
                          {columns.map((column, colIndex) => (
                            <td key={colIndex} className="px-4 py-3">
                              {column.cell
                                ? column.cell({ row: { original: category } })
                                : (category as any)[column.accessorKey]}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          Kategori bulunamadı
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Sayfa {currentPage} / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Önceki
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Sonraki
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tree" className="space-y-4">
          <div className="bg-card rounded-lg border p-6">
            {treeData?.categoryTree ? (
              renderCategoryTree(treeData.categoryTree as any[])
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Henüz kategori bulunmuyor
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kategori Oluştur</DialogTitle>
            <DialogDescription>
              Yeni bir ürün kategorisi oluşturun
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Kategori Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Örn: Üst Giyim, Gömlek, vb."
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Kategori açıklaması"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentCategory">Üst Kategori</Label>
              <Select
                value={formData.parentCategoryId?.toString() || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    parentCategoryId: value === "none" ? null : Number(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ana Kategori</SelectItem>
                  {rootData?.rootCategories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              İptal
            </Button>
            <Button onClick={handleCreate} disabled={createLoading}>
              {createLoading ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategori Düzenle</DialogTitle>
            <DialogDescription>
              Kategori bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Kategori Adı *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Kategori adı"
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Açıklama</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Kategori açıklaması"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleUpdate} disabled={updateLoading}>
              {updateLoading ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedCategory?.name}</strong> kategorisini silmek
              istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteLoading ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
