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
import { useAuth } from "@/context/AuthProvider";
import {
    CREATE_COLOR_MUTATION,
    DELETE_COLOR_MUTATION,
    MY_COLORS_QUERY,
    UPDATE_COLOR_MUTATION,
} from "@/lib/graphql/library-operations";
import { Loader2, Palette, Pencil, Plus, ShieldX, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

interface Color {
  id: number;
  name: string;
  code?: string;
  hexCode?: string;
  imageUrl?: string;
  isActive: boolean;
}

interface FormData {
  name: string;
  code: string;
  hexCode: string;
  imageUrl: string;
}

const initialFormData: FormData = {
  name: "",
  code: "",
  hexCode: "#000000",
  imageUrl: "",
};

export default function ColorManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const [{ data, fetching }, reexecuteQuery] = useQuery({
    query: MY_COLORS_QUERY,
  });

  // Mutations
  const [, createColor] = useMutation(CREATE_COLOR_MUTATION);
  const [, updateColor] = useMutation(UPDATE_COLOR_MUTATION);
  const [, deleteColor] = useMutation(DELETE_COLOR_MUTATION);

  const colors: Color[] = data?.myColors || [];

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

  // Show access denied for non-manufacturers
  if (user && !isManufacturer && user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShieldX className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Erişim Reddedildi</h2>
        <p className="text-gray-600 text-center max-w-md">
          Renk yönetimi sayfasına yalnızca üretici firmaların çalışanları erişebilir.
        </p>
      </div>
    );
  }

  const handleCreateClick = () => {
    setFormData(initialFormData);
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (color: Color) => {
    setSelectedColor(color);
    setFormData({
      name: color.name,
      code: color.code || "",
      hexCode: color.hexCode || "#000000",
      imageUrl: color.imageUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (color: Color) => {
    setSelectedColor(color);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Renk adı gerekli");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createColor({
        input: {
          name: formData.name,
          code: formData.code || undefined,
          hexCode: formData.hexCode || undefined,
          imageUrl: formData.imageUrl || undefined,
        },
      });

      if (result.error) throw new Error(result.error.message);

      toast.success("Renk başarıyla oluşturuldu");
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Renk oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedColor) return;

    setIsSubmitting(true);
    try {
      const result = await updateColor({
        input: {
          id: selectedColor.id,
          name: formData.name,
          code: formData.code || undefined,
          hexCode: formData.hexCode || undefined,
          imageUrl: formData.imageUrl || undefined,
        },
      });

      if (result.error) throw new Error(result.error.message);

      toast.success("Renk başarıyla güncellendi");
      setIsEditDialogOpen(false);
      setSelectedColor(null);
      setFormData(initialFormData);
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Renk güncellenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedColor) return;

    setIsSubmitting(true);
    try {
      const result = await deleteColor({ id: selectedColor.id });

      if (result.error) throw new Error(result.error.message);

      toast.success("Renk başarıyla silindi");
      setIsDeleteDialogOpen(false);
      setSelectedColor(null);
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Renk silinirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Renk Yönetimi</h1>
          <p className="text-muted-foreground">Firma renk paletinizi yönetin</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Renk Ekle
        </Button>
      </div>

      {colors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Palette className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Henüz renk eklenmemiş</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Renk paletinizi oluşturmaya başlayın
            </p>
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              İlk Rengi Ekle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {colors.map((color) => (
            <Card key={color.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-md border-2 border-gray-200 shadow-sm"
                      style={{ backgroundColor: color.hexCode || "#CCCCCC" }}
                    />
                    <div>
                      <CardTitle className="text-base">{color.name}</CardTitle>
                      {color.code && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {color.code}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {color.hexCode && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground">HEX Code:</p>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {color.hexCode}
                    </code>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(color)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Düzenle
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(color)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Renk Ekle</DialogTitle>
            <DialogDescription>
              Yeni bir renk paletinize ekleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Renk Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="örn: Beyaz, Lacivert"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Pantone/RAL Kodu</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="örn: PANTONE 11-0601"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hexCode">HEX Kodu</Label>
              <div className="flex gap-2">
                <Input
                  id="hexCode"
                  type="color"
                  value={formData.hexCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hexCode: e.target.value })
                  }
                  className="w-20 h-10"
                />
                <Input
                  value={formData.hexCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hexCode: e.target.value })
                  }
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button onClick={handleSubmitCreate} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renk Düzenle</DialogTitle>
            <DialogDescription>
              {selectedColor?.name} rengini düzenleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Renk Adı *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-code">Pantone/RAL Kodu</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-hexCode">HEX Kodu</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-hexCode"
                  type="color"
                  value={formData.hexCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hexCode: e.target.value })
                  }
                  className="w-20 h-10"
                />
                <Input
                  value={formData.hexCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hexCode: e.target.value })
                  }
                  className="flex-1"
                />
              </div>
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
            <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
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
            <AlertDialogTitle>Rengi sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedColor?.name}</strong> rengi silinecek. Bu işlem
              geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
