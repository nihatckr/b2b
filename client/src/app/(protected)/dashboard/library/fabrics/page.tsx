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
import { Textarea } from "@/components/ui/textarea";
import {
  CREATE_FABRIC_MUTATION,
  DELETE_FABRIC_MUTATION,
  MY_FABRICS_QUERY,
  UPDATE_FABRIC_MUTATION,
} from "@/lib/graphql/library-operations";
import { Loader2, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

interface Fabric {
  id: number;
  name: string;
  code?: string;
  composition: string;
  weight?: number;
  width?: number;
  supplier?: string;
  price?: number;
  minOrder?: number;
  leadTime?: number;
  description?: string;
}

interface FormData {
  name: string;
  code: string;
  composition: string;
  weight: string;
  width: string;
  supplier: string;
  price: string;
  minOrder: string;
  leadTime: string;
  description: string;
}

const initialFormData: FormData = {
  name: "",
  code: "",
  composition: "",
  weight: "",
  width: "",
  supplier: "",
  price: "",
  minOrder: "",
  leadTime: "",
  description: "",
};

export default function FabricManagementPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [{ data, fetching }, reexecuteQuery] = useQuery({
    query: MY_FABRICS_QUERY,
  });

  const [, createFabric] = useMutation(CREATE_FABRIC_MUTATION);
  const [, updateFabric] = useMutation(UPDATE_FABRIC_MUTATION);
  const [, deleteFabric] = useMutation(DELETE_FABRIC_MUTATION);

  const fabrics: Fabric[] = data?.myFabrics || [];

  const handleCreateClick = () => {
    setFormData(initialFormData);
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (fabric: Fabric) => {
    setSelectedFabric(fabric);
    setFormData({
      name: fabric.name,
      code: fabric.code || "",
      composition: fabric.composition,
      weight: fabric.weight?.toString() || "",
      width: fabric.width?.toString() || "",
      supplier: fabric.supplier || "",
      price: fabric.price?.toString() || "",
      minOrder: fabric.minOrder?.toString() || "",
      leadTime: fabric.leadTime?.toString() || "",
      description: fabric.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (fabric: Fabric) => {
    setSelectedFabric(fabric);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.name.trim() || !formData.composition.trim()) {
      toast.error("Kumaş adı ve kompozisyon gerekli");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createFabric({
        input: {
          name: formData.name,
          code: formData.code || undefined,
          composition: formData.composition,
          weight: formData.weight ? parseInt(formData.weight) : undefined,
          width: formData.width ? parseInt(formData.width) : undefined,
          supplier: formData.supplier || undefined,
          price: formData.price ? parseFloat(formData.price) : undefined,
          minOrder: formData.minOrder ? parseInt(formData.minOrder) : undefined,
          leadTime: formData.leadTime ? parseInt(formData.leadTime) : undefined,
          description: formData.description || undefined,
        },
      });

      if (result.error) throw new Error(result.error.message);

      toast.success("Kumaş başarıyla oluşturuldu");
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Kumaş oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedFabric) return;

    setIsSubmitting(true);
    try {
      const result = await updateFabric({
        input: {
          id: selectedFabric.id,
          name: formData.name,
          code: formData.code || undefined,
          composition: formData.composition,
          weight: formData.weight ? parseInt(formData.weight) : undefined,
          width: formData.width ? parseInt(formData.width) : undefined,
          supplier: formData.supplier || undefined,
          price: formData.price ? parseFloat(formData.price) : undefined,
          minOrder: formData.minOrder ? parseInt(formData.minOrder) : undefined,
          leadTime: formData.leadTime ? parseInt(formData.leadTime) : undefined,
          description: formData.description || undefined,
        },
      });

      if (result.error) throw new Error(result.error.message);

      toast.success("Kumaş başarıyla güncellendi");
      setIsEditDialogOpen(false);
      setSelectedFabric(null);
      setFormData(initialFormData);
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Kumaş güncellenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedFabric) return;

    setIsSubmitting(true);
    try {
      const result = await deleteFabric({ id: selectedFabric.id });

      if (result.error) throw new Error(result.error.message);

      toast.success("Kumaş başarıyla silindi");
      setIsDeleteDialogOpen(false);
      setSelectedFabric(null);
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Kumaş silinirken bir hata oluştu");
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
          <h1 className="text-3xl font-bold">Kumaş Yönetimi</h1>
          <p className="text-muted-foreground">Kumaş kütüphanenizi yönetin</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kumaş Ekle
        </Button>
      </div>

      {fabrics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Henüz kumaş eklenmemiş</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Kumaş kütüphanenizi oluşturmaya başlayın
            </p>
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              İlk Kumaşı Ekle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {fabrics.map((fabric) => (
            <Card key={fabric.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{fabric.name}</CardTitle>
                    {fabric.code && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Kod: {fabric.code}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(fabric)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(fabric)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Kompozisyon:</span>{" "}
                    {fabric.composition}
                  </div>
                  {(fabric.weight || fabric.width) && (
                    <div>
                      <span className="font-medium">Özellikler:</span>{" "}
                      {fabric.weight && `${fabric.weight} gr/m²`}
                      {fabric.weight && fabric.width && " • "}
                      {fabric.width && `${fabric.width} cm`}
                    </div>
                  )}
                  {fabric.supplier && (
                    <div>
                      <span className="font-medium">Tedarikçi:</span>{" "}
                      {fabric.supplier}
                    </div>
                  )}
                  {(fabric.price || fabric.leadTime) && (
                    <div className="pt-2 border-t">
                      {fabric.price && (
                        <div>
                          <span className="font-medium">Fiyat:</span> $
                          {fabric.price}/metre
                        </div>
                      )}
                      {fabric.minOrder && (
                        <div>
                          <span className="font-medium">Min. Sipariş:</span>{" "}
                          {fabric.minOrder} metre
                        </div>
                      )}
                      {fabric.leadTime && (
                        <div>
                          <span className="font-medium">Tedarik Süresi:</span>{" "}
                          {fabric.leadTime} gün
                        </div>
                      )}
                    </div>
                  )}
                  {fabric.description && (
                    <div className="pt-2 text-muted-foreground text-xs">
                      {fabric.description}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Kumaş Ekle</DialogTitle>
            <DialogDescription>
              Kumaş kütüphanenize yeni bir kumaş ekleyin
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Kumaş Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="örn: Premium Cotton Single Jersey"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Kumaş Kodu</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="FAB-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="composition">Kompozisyon *</Label>
              <Input
                id="composition"
                value={formData.composition}
                onChange={(e) =>
                  setFormData({ ...formData, composition: e.target.value })
                }
                placeholder="%100 Pamuk"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Ağırlık (gr/m²)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                placeholder="180"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">En (cm)</Label>
              <Input
                id="width"
                type="number"
                value={formData.width}
                onChange={(e) =>
                  setFormData({ ...formData, width: e.target.value })
                }
                placeholder="180"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="supplier">Tedarikçi</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                placeholder="Bossa Tekstil"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Fiyat (USD/metre)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="5.50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrder">Min. Sipariş (metre)</Label>
              <Input
                id="minOrder"
                type="number"
                value={formData.minOrder}
                onChange={(e) =>
                  setFormData({ ...formData, minOrder: e.target.value })
                }
                placeholder="500"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="leadTime">Tedarik Süresi (gün)</Label>
              <Input
                id="leadTime"
                type="number"
                value={formData.leadTime}
                onChange={(e) =>
                  setFormData({ ...formData, leadTime: e.target.value })
                }
                placeholder="15"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Tişört, polo için ideal"
                rows={3}
              />
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

      {/* Edit Dialog - Same structure */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kumaş Düzenle</DialogTitle>
            <DialogDescription>
              {selectedFabric?.name} kumaşını düzenleyin
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* Same form fields as create */}
            <div className="col-span-2 space-y-2">
              <Label>Kumaş Adı *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Kumaş Kodu</Label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Kompozisyon *</Label>
              <Input
                value={formData.composition}
                onChange={(e) =>
                  setFormData({ ...formData, composition: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Ağırlık (gr/m²)</Label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>En (cm)</Label>
              <Input
                type="number"
                value={formData.width}
                onChange={(e) =>
                  setFormData({ ...formData, width: e.target.value })
                }
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Tedarikçi</Label>
              <Input
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Fiyat (USD/m)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Min. Sipariş (m)</Label>
              <Input
                type="number"
                value={formData.minOrder}
                onChange={(e) =>
                  setFormData({ ...formData, minOrder: e.target.value })
                }
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Tedarik Süresi (gün)</Label>
              <Input
                type="number"
                value={formData.leadTime}
                onChange={(e) =>
                  setFormData({ ...formData, leadTime: e.target.value })
                }
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
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
            <AlertDialogTitle>Kumaşı sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedFabric?.name}</strong> kumaşı silinecek. Bu işlem
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
