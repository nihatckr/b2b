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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthProvider";
import {
    CREATE_SIZE_GROUP_MUTATION,
    DELETE_SIZE_GROUP_MUTATION,
    MY_SIZE_GROUPS_QUERY,
    UPDATE_SIZE_GROUP_MUTATION,
} from "@/lib/graphql/library-operations";
import { Loader2, Pencil, Plus, Ruler, ShieldX, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

interface SizeGroup {
  id: number;
  name: string;
  category?: string;
  sizes: string[];
  description?: string;
}

interface FormData {
  name: string;
  category: string;
  sizes: string[];
  description: string;
}

const initialFormData: FormData = {
  name: "",
  category: "MEN",
  sizes: [],
  description: "",
};

export default function SizeManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSizeGroup, setSelectedSizeGroup] = useState<SizeGroup | null>(
    null
  );
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [newSize, setNewSize] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [{ data, fetching }, reexecuteQuery] = useQuery({
    query: MY_SIZE_GROUPS_QUERY,
  });

  const [, createSizeGroup] = useMutation(CREATE_SIZE_GROUP_MUTATION);
  const [, updateSizeGroup] = useMutation(UPDATE_SIZE_GROUP_MUTATION);
  const [, deleteSizeGroup] = useMutation(DELETE_SIZE_GROUP_MUTATION);

  const sizeGroups: SizeGroup[] = data?.mySizeGroups || [];

  // Access control
  const isManufacturer =
    (user?.role === "MANUFACTURE" ||
      user?.role === "COMPANY_OWNER" ||
      user?.role === "COMPANY_EMPLOYEE") &&
    user?.company?.type === "MANUFACTURER";

  useEffect(() => {
    if (user && !isManufacturer && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, isManufacturer, router]);

  if (user && !isManufacturer && user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShieldX className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Erişim Reddedildi</h2>
        <p className="text-gray-600 text-center max-w-md">
          Beden yönetimi sayfasına yalnızca üretici firmaların çalışanları erişebilir.
        </p>
      </div>
    );
  }

  const handleCreateClick = () => {
    setFormData(initialFormData);
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (sizeGroup: SizeGroup) => {
    setSelectedSizeGroup(sizeGroup);
    setFormData({
      name: sizeGroup.name,
      category: sizeGroup.category || "MEN",
      sizes: sizeGroup.sizes,
      description: sizeGroup.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (sizeGroup: SizeGroup) => {
    setSelectedSizeGroup(sizeGroup);
    setIsDeleteDialogOpen(true);
  };

  const handleAddSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData({ ...formData, sizes: [...formData.sizes, newSize.trim()] });
      setNewSize("");
    }
  };

  const handleRemoveSize = (size: string) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((s) => s !== size),
    });
  };

  const handleSubmitCreate = async () => {
    if (!formData.name.trim() || formData.sizes.length === 0) {
      toast.error("Grup adı ve en az bir beden gerekli");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createSizeGroup({
        input: {
          name: formData.name,
          category: formData.category || undefined,
          sizes: formData.sizes,
          description: formData.description || undefined,
        },
      });

      if (result.error) throw new Error(result.error.message);

      toast.success("Beden grubu başarıyla oluşturuldu");
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Beden grubu oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedSizeGroup || formData.sizes.length === 0) return;

    setIsSubmitting(true);
    try {
      const result = await updateSizeGroup({
        input: {
          id: selectedSizeGroup.id,
          name: formData.name,
          category: formData.category || undefined,
          sizes: formData.sizes,
          description: formData.description || undefined,
        },
      });

      if (result.error) throw new Error(result.error.message);

      toast.success("Beden grubu başarıyla güncellendi");
      setIsEditDialogOpen(false);
      setSelectedSizeGroup(null);
      setFormData(initialFormData);
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Beden grubu güncellenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSizeGroup) return;

    setIsSubmitting(true);
    try {
      const result = await deleteSizeGroup({ id: selectedSizeGroup.id });

      if (result.error) throw new Error(result.error.message);

      toast.success("Beden grubu başarıyla silindi");
      setIsDeleteDialogOpen(false);
      setSelectedSizeGroup(null);
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Beden grubu silinirken bir hata oluştu");
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

  const groupedSizes = {
    MEN: sizeGroups.filter((sg) => sg.category === "MEN"),
    WOMEN: sizeGroups.filter((sg) => sg.category === "WOMEN"),
    KIDS: sizeGroups.filter((sg) => sg.category === "KIDS"),
    OTHER: sizeGroups.filter((sg) => !sg.category || sg.category === "OTHER"),
  };

  const SizeFormFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Grup Adı *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="örn: Erkek Standart"
        />
      </div>

      <div className="space-y-2">
        <Label>Kategori</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MEN">Erkek</SelectItem>
            <SelectItem value="WOMEN">Kadın</SelectItem>
            <SelectItem value="KIDS">Çocuk</SelectItem>
            <SelectItem value="OTHER">Diğer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Bedenler *</Label>
        <div className="flex gap-2">
          <Input
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSize();
              }
            }}
            placeholder="örn: M, XL, 42"
          />
          <Button type="button" onClick={handleAddSize}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.sizes.map((size) => (
            <Badge key={size} variant="secondary" className="pl-3 pr-1">
              {size}
              <button
                type="button"
                onClick={() => handleRemoveSize(size)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        {formData.sizes.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Yukarıdan beden ekleyin
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Açıklama</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Erkek tişört, gömlek, polo için"
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Beden Yönetimi</h1>
          <p className="text-muted-foreground">
            Standart beden gruplarınızı yönetin
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Beden Grubu
        </Button>
      </div>

      {sizeGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ruler className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Henüz beden grubu eklenmemiş
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              İlk beden grubunuzu oluşturun
            </p>
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              İlk Grubu Ekle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Erkek */}
          {groupedSizes.MEN.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">👔 Erkek</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedSizes.MEN.map((sg) => (
                  <Card key={sg.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{sg.name}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(sg)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(sg)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1.5">
                        {sg.sizes.map((size) => (
                          <Badge key={size} variant="secondary">
                            {size}
                          </Badge>
                        ))}
                      </div>
                      {sg.description && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {sg.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Kadın */}
          {groupedSizes.WOMEN.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">👗 Kadın</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedSizes.WOMEN.map((sg) => (
                  <Card key={sg.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{sg.name}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(sg)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(sg)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1.5">
                        {sg.sizes.map((size) => (
                          <Badge key={size} variant="secondary">
                            {size}
                          </Badge>
                        ))}
                      </div>
                      {sg.description && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {sg.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Çocuk */}
          {groupedSizes.KIDS.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">👶 Çocuk</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedSizes.KIDS.map((sg) => (
                  <Card key={sg.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{sg.name}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(sg)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(sg)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1.5">
                        {sg.sizes.map((size) => (
                          <Badge key={size} variant="secondary">
                            {size}
                          </Badge>
                        ))}
                      </div>
                      {sg.description && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {sg.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Beden Grubu</DialogTitle>
            <DialogDescription>
              Yeni bir beden grubu oluşturun
            </DialogDescription>
          </DialogHeader>
          <SizeFormFields />
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
            <DialogTitle>Beden Grubu Düzenle</DialogTitle>
            <DialogDescription>
              {selectedSizeGroup?.name} grubunu düzenleyin
            </DialogDescription>
          </DialogHeader>
          <SizeFormFields />
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
            <AlertDialogTitle>Beden grubunu sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedSizeGroup?.name}</strong> grubu silinecek. Bu
              işlem geri alınamaz.
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
