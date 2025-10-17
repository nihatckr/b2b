"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthProvider";
import {
    ChevronRight,
    FolderPlus,
    FolderTree,
    Layers,
    Loader2,
    Pencil,
    Plus,
    ShieldX,
    Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { gql, useMutation, useQuery } from "urql";

const MY_CATEGORIES_QUERY = gql`
  query MyCategories {
    myCategories {
      id
      name
      description
      createdAt
      parentCategory {
        id
        name
      }
      company {
        id
        name
      }
      author {
        id
        firstName
        lastName
      }
      subCategories {
        id
        name
        description
      }
    }
  }
`;

const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategoryInPage(
    $name: String!
    $description: String
    $parentCategoryId: Int
  ) {
    createCategory(
      name: $name
      description: $description
      parentCategoryId: $parentCategoryId
    ) {
      id
      name
      description
    }
  }
`;

const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategoryInPage(
    $id: Int!
    $name: String
    $description: String
    $parentCategoryId: Int
  ) {
    updateCategory(
      id: $id
      name: $name
      description: $description
      parentCategoryId: $parentCategoryId
    ) {
      id
      name
      description
    }
  }
`;

const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategoryInPage($id: Int!) {
    deleteCategory(id: $id) {
      id
    }
  }
`;

export default function CategoryManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentCategoryId: null as number | null,
  });

  // Check if user is manufacturer
  const isManufacturer =
    (user?.role === "MANUFACTURE" ||
      user?.role === "COMPANY_OWNER" ||
      user?.role === "COMPANY_EMPLOYEE") &&
    user?.company?.type === "MANUFACTURER";

  // Redirect non-manufacturers
  useEffect(() => {
    if (user && !isManufacturer && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, isManufacturer, router]);

  const [{ data, fetching }] = useQuery({
    query: MY_CATEGORIES_QUERY,
    requestPolicy: "network-only",
  });

  const [, createCategory] = useMutation(CREATE_CATEGORY_MUTATION);
  const [, updateCategory] = useMutation(UPDATE_CATEGORY_MUTATION);
  const [, deleteCategory] = useMutation(DELETE_CATEGORY_MUTATION);

  const categories = data?.myCategories || [];

  // Separate root and sub categories
  const rootCategories = categories.filter((c: any) => !c.parentCategory);
  const subCategories = categories.filter((c: any) => c.parentCategory);

  const handleCreateClick = (parentId?: number) => {
    setFormData({
      name: "",
      description: "",
      parentCategoryId: parentId || null,
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (category: any) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      parentCategoryId: category.parentCategory?.id || null,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (category: any) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Kategori adı gerekli");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parentCategoryId: formData.parentCategoryId || undefined,
      });

      if (result.error) throw new Error(result.error.message);

      toast.success("Kategori başarıyla oluşturuldu");
      setIsCreateDialogOpen(false);
      window.location.reload();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Kategori oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;
    if (!formData.name.trim()) {
      toast.error("Kategori adı gerekli");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateCategory({
        id: selectedCategory.id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parentCategoryId: formData.parentCategoryId || undefined,
      });

      if (result.error) throw new Error(result.error.message);

      toast.success("Kategori başarıyla güncellendi");
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      window.location.reload();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Kategori güncellenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    setIsSubmitting(true);
    try {
      const result = await deleteCategory({ id: selectedCategory.id });

      if (result.error) throw new Error(result.error.message);

      toast.success("Kategori başarıyla silindi");
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      window.location.reload();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Kategori silinirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show access denied for non-manufacturers
  if (user && !isManufacturer && user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShieldX className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Erişim Reddedildi</h2>
        <p className="text-gray-600 text-center max-w-md">
          Kategori yönetimi sayfasına yalnızca üretici firmaların çalışanları erişebilir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kategori Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Ürün kategorilerinizi oluşturun ve düzenleyin
          </p>
        </div>
        <Button onClick={() => handleCreateClick()}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Kategori
            </CardTitle>
            <Layers className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Tüm kategoriler</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ana Kategoriler
            </CardTitle>
            <FolderTree className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rootCategories.length}</div>
            <p className="text-xs text-muted-foreground">
              Üst düzey kategoriler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alt Kategoriler
            </CardTitle>
            <ChevronRight className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subCategories.length}</div>
            <p className="text-xs text-muted-foreground">Alt kategoriler</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderTree className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Henüz kategori yok</p>
              <Button
                variant="outline"
                onClick={() => handleCreateClick()}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                İlk Kategoriyi Oluştur
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori Adı</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Alt Kategori</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rootCategories.map((category: any) => (
                  <Fragment key={category.id}>
                    {/* Root Category */}
                    <TableRow className="bg-blue-50/50">
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                          <FolderTree className="h-4 w-4 text-blue-600" />
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {category.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-700"
                        >
                          Ana Kategori
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {category.subCategories?.length || 0} Alt Kategori
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCreateClick(category.id)}
                            title="Alt kategori ekle"
                          >
                            <FolderPlus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(category)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(category)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Sub Categories */}
                    {categories
                      .filter((c: any) => c.parentCategory?.id === category.id)
                      .map((subCat: any) => (
                        <TableRow key={subCat.id} className="bg-gray-50">
                          <TableCell className="pl-12">
                            <div className="flex items-center gap-2">
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                              {subCat.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {subCat.description || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-purple-100 text-purple-700"
                            >
                              Alt Kategori
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {subCat.subCategories?.length || 0} Alt
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleCreateClick(subCat.id)}
                                title="Alt kategori ekle"
                              >
                                <FolderPlus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(subCat)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(subCat)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.parentCategoryId
                ? "Yeni Alt Kategori Oluştur"
                : "Yeni Kategori Oluştur"}
            </DialogTitle>
            <DialogDescription>
              {formData.parentCategoryId ? (
                <>
                  <strong>
                    {
                      categories.find(
                        (c: any) => c.id === formData.parentCategoryId
                      )?.name
                    }
                  </strong>{" "}
                  kategorisinin altına yeni alt kategori ekleyin
                </>
              ) : (
                "Yeni bir kategori ekleyin veya mevcut kategorinin altına alt kategori oluşturun"
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {formData.parentCategoryId && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <FolderTree className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Üst Kategori:</span>
                  <Badge variant="outline" className="bg-blue-100">
                    {
                      categories.find(
                        (c: any) => c.id === formData.parentCategoryId
                      )?.name
                    }
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-6 px-2 text-xs"
                    onClick={() =>
                      setFormData({ ...formData, parentCategoryId: null })
                    }
                  >
                    Kaldır
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Kategori Adı *</Label>
              <Input
                placeholder="Örn: Gömlek, Pantolon, T-Shirt"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                placeholder="Kategori hakkında kısa açıklama"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            {!formData.parentCategoryId && (
              <div className="space-y-2">
                <Label>Üst Kategori (Opsiyonel)</Label>
                <Select
                  value={formData.parentCategoryId?.toString() || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      parentCategoryId:
                        value === "none" ? null : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ana kategori olarak oluştur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ana Kategori (Üst Yok)</SelectItem>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.parentCategory ? "  → " : ""}
                        {cat.name}
                        {cat.subCategories?.length > 0 &&
                          ` (${cat.subCategories.length} alt)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Herhangi bir kategorinin altına alt kategori ekleyebilirsiniz
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategori Düzenle</DialogTitle>
            <DialogDescription>
              {selectedCategory?.name} kategorisini düzenleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Kategori Adı *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Üst Kategori</Label>
              <Select
                value={formData.parentCategoryId?.toString() || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    parentCategoryId: value === "none" ? null : parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ana Kategori (Üst Yok)</SelectItem>
                  {rootCategories
                    .filter((cat: any) => cat.id !== selectedCategory?.id)
                    .map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi Sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedCategory?.name}</strong> kategorisi silinecek.
              {selectedCategory?.subCategories?.length > 0 && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
                  ⚠️ Bu kategorinin {selectedCategory.subCategories.length} alt
                  kategorisi var. Önce alt kategorileri silmelisiniz.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
