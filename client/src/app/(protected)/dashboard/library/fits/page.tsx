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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthProvider";
import {
    CREATE_FIT_MUTATION,
    DELETE_FIT_MUTATION,
    MY_FITS_QUERY,
    UPDATE_FIT_MUTATION,
} from "@/lib/graphql/library-operations";
import {
    Loader2,
    Pencil,
    Plus,
    Ruler,
    ShieldX,
    Shirt,
    Trash2,
    Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

export default function FitsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFit, setSelectedFit] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "UPPER",
    description: "",
    isActive: true,
  });

  const [{ data, fetching }] = useQuery({
    query: MY_FITS_QUERY,
    requestPolicy: "cache-and-network",
  });

  const [, createFit] = useMutation(CREATE_FIT_MUTATION);
  const [, updateFit] = useMutation(UPDATE_FIT_MUTATION);
  const [, deleteFit] = useMutation(DELETE_FIT_MUTATION);

  const fits = data?.myFits || [];

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
          Fit yönetimi sayfasına yalnızca üretici firmaların çalışanları erişebilir.
        </p>
      </div>
    );
  }

  // Group by category
  const upperFits = fits.filter((f: any) => f.category === "UPPER");
  const lowerFits = fits.filter((f: any) => f.category === "LOWER");
  const outerwearFits = fits.filter((f: any) => f.category === "OUTERWEAR");
  const otherFits = fits.filter(
    (f: any) => !f.category || f.category === "OTHER"
  );

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error("Fit adı gerekli");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createFit({
        name: formData.name,
        code: formData.code || undefined,
        category: formData.category || undefined,
        description: formData.description || undefined,
      });

      if (result.error) throw new Error(result.error.message);

      toast.success("Fit başarıyla oluşturuldu");
      setIsCreateDialogOpen(false);
      window.location.reload();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Fit oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedFit) return;

    setIsSubmitting(true);
    try {
      const result = await updateFit({
        id: selectedFit.id,
        name: formData.name,
        code: formData.code || undefined,
        category: formData.category || undefined,
        description: formData.description || undefined,
        isActive: formData.isActive,
      });

      if (result.error) throw new Error(result.error.message);

      toast.success("Fit başarıyla güncellendi");
      setIsEditDialogOpen(false);
      setSelectedFit(null);
      window.location.reload();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Fit güncellenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFit) return;

    setIsSubmitting(true);
    try {
      const result = await deleteFit({ id: selectedFit.id });

      if (result.error) throw new Error(result.error.message);

      toast.success("Fit başarıyla silindi");
      setIsDeleteDialogOpen(false);
      setSelectedFit(null);
      window.location.reload();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Fit silinirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "UPPER":
        return <Shirt className="h-4 w-4" />;
      case "LOWER":
        return <Users className="h-4 w-4" />;
      case "OUTERWEAR":
        return <Ruler className="h-4 w-4" />;
      default:
        return <Ruler className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "UPPER":
        return "Üst Giyim";
      case "LOWER":
        return "Alt Giyim";
      case "OUTERWEAR":
        return "Dış Giyim";
      default:
        return "Diğer";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fit/Kesim Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Ürün kesim tiplerini tanımlayın (Slim, Regular, Oversized vb.)
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Fit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Fit</CardTitle>
            <Ruler className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fits.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Üst Giyim</CardTitle>
            <Shirt className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upperFits.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alt Giyim</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowerFits.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dış Giyim</CardTitle>
            <Ruler className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outerwearFits.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Fits by Category */}
      <div className="space-y-6">
        {/* Üst Giyim */}
        {upperFits.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Shirt className="h-5 w-5 text-green-600" />
              Üst Giyim Fits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upperFits.map((fit: any) => (
                <Card key={fit.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{fit.name}</CardTitle>
                      {fit.code && (
                        <Badge variant="outline" className="text-xs">
                          {fit.code}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {fit.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {fit.description}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedFit(fit);
                          setFormData({
                            name: fit.name,
                            code: fit.code || "",
                            category: fit.category || "UPPER",
                            description: fit.description || "",
                            isActive: fit.isActive,
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedFit(fit);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Alt Giyim */}
        {lowerFits.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Alt Giyim Fits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowerFits.map((fit: any) => (
                <Card key={fit.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{fit.name}</CardTitle>
                      {fit.code && (
                        <Badge variant="outline" className="text-xs">
                          {fit.code}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {fit.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {fit.description}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedFit(fit);
                          setFormData({
                            name: fit.name,
                            code: fit.code || "",
                            category: fit.category || "LOWER",
                            description: fit.description || "",
                            isActive: fit.isActive,
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedFit(fit);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Dış Giyim */}
        {outerwearFits.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Ruler className="h-5 w-5 text-orange-600" />
              Dış Giyim Fits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {outerwearFits.map((fit: any) => (
                <Card key={fit.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{fit.name}</CardTitle>
                      {fit.code && (
                        <Badge variant="outline" className="text-xs">
                          {fit.code}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {fit.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {fit.description}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedFit(fit);
                          setFormData({
                            name: fit.name,
                            code: fit.code || "",
                            category: fit.category || "OUTERWEAR",
                            description: fit.description || "",
                            isActive: fit.isActive,
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedFit(fit);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Fit Oluştur</DialogTitle>
            <DialogDescription>
              Yeni bir kesim tipi tanımlayın
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fit Adı *</Label>
                <Input
                  placeholder="Örn: Slim Fit"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Kod</Label>
                <Input
                  placeholder="FIT-SLIM"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Kategori *</Label>
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
                    <SelectItem value="UPPER">
                      👕 Üst Giyim (Tişört, Gömlek, Sweatshirt)
                    </SelectItem>
                    <SelectItem value="LOWER">
                      👖 Alt Giyim (Pantolon, Jean, Şort)
                    </SelectItem>
                    <SelectItem value="OUTERWEAR">
                      🧥 Dış Giyim (Ceket, Mont, Parka)
                    </SelectItem>
                    <SelectItem value="OTHER">🔹 Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Açıklama / Tanım</Label>
              <Textarea
                placeholder="Fit özelliklerini detaylı açıklayın (oturuş, kesim, kullanım alanı)..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
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
            <DialogTitle>Fit Düzenle</DialogTitle>
            <DialogDescription>
              {selectedFit?.name} fit'ini düzenleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fit Adı *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Kod</Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Kategori *</Label>
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
                    <SelectItem value="UPPER">
                      👕 Üst Giyim (Tişört, Gömlek, Sweatshirt)
                    </SelectItem>
                    <SelectItem value="LOWER">
                      👖 Alt Giyim (Pantolon, Jean, Şort)
                    </SelectItem>
                    <SelectItem value="OUTERWEAR">
                      🧥 Dış Giyim (Ceket, Mont, Parka)
                    </SelectItem>
                    <SelectItem value="OTHER">🔹 Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Açıklama / Tanım</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label>Aktif Durum</Label>
                <p className="text-xs text-muted-foreground">
                  Fit kullanılabilir durumda mı?
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
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
            <AlertDialogTitle>Fit'i Sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedFit?.name}</strong> fit'i silinecek. Bu işlem
              geri alınamaz.
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
