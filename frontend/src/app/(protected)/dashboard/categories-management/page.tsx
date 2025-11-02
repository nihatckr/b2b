"use client";

import {
  AdminCategoriesCountDocument,
  AdminCategoriesDocument,
  AdminCategoryDocument,
  AdminCreateCategoryDocument,
  AdminDeleteCategoryDocument,
  AdminRootCategoriesDocument,
  AdminUpdateCategoryDocument,
} from "@/__generated__/graphql";
import {
  DataTable,
  FilterBar,
  PageHeader,
  StatsGrid,
} from "@/components/common";
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
import { Textarea } from "@/components/ui/textarea";
import { FolderTree, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

export default function AdminCategoriesPage() {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Queries
  const [{ data, fetching }, refetchCategories] = useQuery({
    query: AdminCategoriesDocument,
    variables: {
      search: searchTerm || undefined,
      take: 100,
    },
  });

  const [{ data: countData }, refetchCount] = useQuery({
    query: AdminCategoriesCountDocument,
    variables: {
      search: searchTerm || undefined,
    },
  });

  // Mutations
  const [, deleteCategoryMutation] = useMutation(AdminDeleteCategoryDocument);

  const categories = data?.categories || [];
  const totalCategories = countData?.categoriesCount || 0;

  // Handlers
  const handleDelete = async () => {
    if (!selectedCategory) return;

    const result = await deleteCategoryMutation({
      id: Number(selectedCategory.id),
    });

    if (result.data?.deleteCategory) {
      toast.success("Kategori silindi");
      refetchCategories({ requestPolicy: "network-only" });
      refetchCount({ requestPolicy: "network-only" });
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
    } else if (result.error) {
      toast.error("Kategori silinemedi");
      console.error(result.error);
    }
  };

  const handleEditClick = (category: any) => {
    setSelectedCategory(category);
    setEditDialogOpen(true);
  };

  const handleDetailClick = (category: any) => {
    setSelectedCategory(category);
    setDetailDialogOpen(true);
  };

  // Stats
  const rootCategories = categories.filter(
    (c: any) => !c.parentCategory
  ).length;
  const subCategories = categories.filter((c: any) => c.parentCategory).length;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <PageHeader
        title="Kategori Yönetimi"
        description="Platform genelindeki kategorileri yönetin"
        icon={<FolderTree className="h-6 w-6" />}
        action={
          <Button
            onClick={() => {
              setSelectedCategory(null);
              setEditDialogOpen(true);
            }}
          >
            <FolderTree className="h-4 w-4 mr-2" />
            Yeni Kategori
          </Button>
        }
      />

      {/* Stats Cards */}
      <StatsGrid
        stats={[
          {
            title: "Toplam Kategori",
            value: totalCategories,
            icon: <FolderTree className="h-4 w-4" />,
          },
          {
            title: "Ana Kategoriler",
            value: rootCategories,
          },
          {
            title: "Alt Kategoriler",
            value: subCategories,
          },
        ]}
        columns="3"
      />

      {/* Filters */}
      <FilterBar
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: "Kategori adı veya açıklama ara...",
        }}
      />

      {/* Categories Table */}
      {fetching ? (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          Yükleniyor...
        </div>
      ) : (
        <DataTable
          data={categories}
          columns={[
            {
              header: "Kategori",
              cell: (category: any) => (
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {category.parentCategory && (
                      <span className="text-muted-foreground text-xs">└─</span>
                    )}
                    {category.name}
                  </div>
                  {category.description && (
                    <div className="text-sm text-muted-foreground truncate max-w-md">
                      {category.description}
                    </div>
                  )}
                </div>
              ),
            },
            {
              header: "Üst Kategori",
              cell: (category: any) =>
                category.parentCategory ? (
                  <Badge variant="outline">
                    {category.parentCategory.name}
                  </Badge>
                ) : (
                  <Badge>Ana Kategori</Badge>
                ),
            },
            {
              header: "Alt Kategoriler",
              cell: (category: any) => (
                <div className="text-sm">
                  {category.subCategories?.length || 0} alt kategori
                </div>
              ),
            },
            {
              header: "Oluşturma",
              cell: (category: any) => (
                <div className="text-sm text-muted-foreground">
                  {new Date(category.createdAt).toLocaleDateString("tr-TR")}
                </div>
              ),
            },
            {
              header: "İşlemler",
              align: "right",
              cell: (category: any) => (
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDetailClick(category)}
                  >
                    Detay
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditClick(category)}
                  >
                    Düzenle
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setSelectedCategory(category);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
            },
          ]}
          emptyMessage="Kategori bulunamadı"
        />
      )}

      {/* Edit Dialog */}
      <EditCategoryDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        category={selectedCategory}
        onSuccess={() => {
          console.log("🔄 Refetching categories and count...");
          refetchCategories({ requestPolicy: "network-only" });
          refetchCount({ requestPolicy: "network-only" });
          setEditDialogOpen(false);
        }}
      />

      {/* Detail Dialog */}
      <CategoryDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        categoryId={selectedCategory?.id}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedCategory?.name}</strong> kategorisini silmek
              istediğinize emin misiniz? Bu işlem geri alınamaz.
              {selectedCategory?.subCategories?.length > 0 && (
                <>
                  <br />
                  <br />
                  <strong className="text-destructive">Uyarı:</strong> Bu
                  kategorinin {selectedCategory.subCategories.length} alt
                  kategorisi var!
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Edit Category Dialog Component
function EditCategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: any;
  onSuccess: () => void;
}) {
  const isCreateMode = !category;

  const [form, setForm] = useState({
    name: "",
    description: "",
    parentCategoryId: "",
  });

  // Root categories query for parent selector
  const [{ data: rootCategoriesData }] = useQuery({
    query: AdminRootCategoriesDocument,
  });

  // Update form when category changes or dialog opens
  useEffect(() => {
    if (open) {
      if (category) {
        setForm({
          name: category.name || "",
          description: category.description || "",
          parentCategoryId: category.parentCategory?.id?.toString() || "",
        });
      } else {
        setForm({
          name: "",
          description: "",
          parentCategoryId: "",
        });
      }
    }
  }, [category, open]);

  // Mutations
  const [updateResult, updateCategory] = useMutation(
    AdminUpdateCategoryDocument
  );
  const [createResult, createCategory] = useMutation(
    AdminCreateCategoryDocument
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCreateMode) {
      // Clean parent category ID - ignore empty strings and "none"
      const cleanParentId =
        form.parentCategoryId && form.parentCategoryId !== "none"
          ? Number(form.parentCategoryId)
          : undefined;

      console.log("🚀 Creating category with data:", {
        name: form.name,
        description: form.description || undefined,
        parentCategoryId: cleanParentId,
      });

      const result = await createCategory({
        name: form.name,
        description: form.description || undefined,
        parentCategoryId: cleanParentId,
      });

      console.log("📦 Create category result:", result);

      if (result.data?.createCategory) {
        toast.success("Kategori başarıyla oluşturuldu");
        console.log("✅ Category created successfully:", result.data);
        onSuccess();
      } else if (result.error) {
        toast.error("Kategori oluşturulurken hata oluştu");
        console.error("❌ Create category error:", result.error);
        console.error("❌ Error message:", result.error.message);
        console.error("❌ GraphQL errors:", result.error.graphQLErrors);
      } else if (result.data?.createCategory === null) {
        toast.error("Kategori oluşturulamadı - Backend hatası");
        console.error("❌ createCategory returned null - check backend logs");
      }
    } else {
      const result = await updateCategory({
        id: Number(category.id),
        name: form.name || undefined,
        description: form.description || undefined,
      });

      if (result.data) {
        toast.success("Kategori bilgileri güncellendi");
        onSuccess();
      } else if (result.error) {
        toast.error("Kategori güncellenirken hata oluştu");
        console.error(result.error);
      }
    }
  };

  const isLoading = updateResult.fetching || createResult.fetching;

  const rootCategories = rootCategoriesData?.rootCategories || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isCreateMode ? "Yeni Kategori Ekle" : "Kategori Düzenle"}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode
              ? "Sisteme yeni kategori ekleyin"
              : `${category?.name} kategori bilgilerini güncelleyin`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Kategori Adı *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Örn: Tekstil, Giyim, Aksesuar"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Kategori hakkında kısa açıklama"
              rows={3}
            />
          </div>

          {isCreateMode && (
            <div className="space-y-2">
              <Label htmlFor="parentCategoryId">Üst Kategori (Opsiyonel)</Label>
              <Select
                value={form.parentCategoryId || "none"}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    parentCategoryId: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger id="parentCategoryId">
                  <SelectValue placeholder="Ana kategori olarak oluştur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ana Kategori</SelectItem>
                  {rootCategories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Boş bırakırsanız ana kategori olarak oluşturulur
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Kaydediliyor..."
                : isCreateMode
                ? "Kategori Oluştur"
                : "Güncelle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Category Detail Dialog Component
function CategoryDetailDialog({
  open,
  onOpenChange,
  categoryId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId?: string;
}) {
  const [{ data, fetching }] = useQuery({
    query: AdminCategoryDocument,
    variables: { id: categoryId ? Number(categoryId) : 0 },
    pause: !categoryId,
  });

  const category = data?.category;

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{category.name}</DialogTitle>
          <DialogDescription>Detaylı kategori bilgileri</DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="py-8 text-center">Yükleniyor...</div>
        ) : (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold mb-3">Temel Bilgiler</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Kategori Adı:</span>
                  <p className="font-medium">{category.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tip:</span>
                  <p className="font-medium">
                    {category.parentCategory ? (
                      <Badge variant="outline">Alt Kategori</Badge>
                    ) : (
                      <Badge>Ana Kategori</Badge>
                    )}
                  </p>
                </div>
                {category.parentCategory && (
                  <div>
                    <span className="text-muted-foreground">Üst Kategori:</span>
                    <p className="font-medium">
                      {category.parentCategory.name}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">
                    Oluşturma Tarihi:
                  </span>
                  <p className="font-medium">
                    {new Date(category.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {category.description && (
              <div>
                <h3 className="font-semibold mb-2">Açıklama</h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
            )}

            {/* Sub Categories */}
            {category.subCategories && category.subCategories.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">
                  Alt Kategoriler ({category.subCategories.length})
                </h3>
                <div className="space-y-2">
                  {category.subCategories.map((sub: any) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">{sub.name}</p>
                        {sub.description && (
                          <p className="text-xs text-muted-foreground">
                            {sub.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collections */}
            {category.collections && category.collections.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">
                  İlişkili Koleksiyonlar ({category.collections.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.collections.slice(0, 10).map((collection: any) => (
                    <Badge key={collection.id} variant="secondary">
                      {collection.name}
                    </Badge>
                  ))}
                  {category.collections.length > 10 && (
                    <Badge variant="outline">
                      +{category.collections.length - 10} daha
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
