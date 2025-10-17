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
    CREATE_SEASON_MUTATION,
    DELETE_SEASON_MUTATION,
    MY_SEASONS_QUERY,
    UPDATE_SEASON_MUTATION,
} from "@/lib/graphql/library-operations";
import { Calendar, Clock, Loader2, Pencil, Plus, ShieldX, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

export default function SeasonsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    year: new Date().getFullYear(),
    type: "SS",
    startDate: "",
    endDate: "",
    description: "",
    isActive: true,
  });

  const [{ data, fetching }] = useQuery({
    query: MY_SEASONS_QUERY,
    requestPolicy: "cache-and-network",
  });

  const [, createSeason] = useMutation(CREATE_SEASON_MUTATION);
  const [, updateSeason] = useMutation(UPDATE_SEASON_MUTATION);
  const [, deleteSeason] = useMutation(DELETE_SEASON_MUTATION);

  const seasons = data?.mySeasons || [];

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
          Sezon yönetimi sayfasına yalnızca üretici firmaların çalışanları erişebilir.
        </p>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.fullName) {
      toast.error("Sezon adı ve tam adı gerekli");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createSeason({
        name: formData.name,
        fullName: formData.fullName,
        year: formData.year,
        type: formData.type,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        description: formData.description || undefined,
      });

      if (result.error) throw new Error(result.error.message);

      toast.success("Sezon başarıyla oluşturuldu");
      setIsCreateDialogOpen(false);
      window.location.reload();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Sezon oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedSeason) return;

    setIsSubmitting(true);
    try {
      const result = await updateSeason({
        id: selectedSeason.id,
        name: formData.name,
        fullName: formData.fullName,
        year: formData.year,
        type: formData.type,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        description: formData.description || undefined,
        isActive: formData.isActive,
      });

      if (result.error) throw new Error(result.error.message);

      toast.success("Sezon başarıyla güncellendi");
      setIsEditDialogOpen(false);
      setSelectedSeason(null);
      window.location.reload();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Sezon güncellenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSeason) return;

    setIsSubmitting(true);
    try {
      const result = await deleteSeason({ id: selectedSeason.id });

      if (result.error) throw new Error(result.error.message);

      toast.success("Sezon başarıyla silindi");
      setIsDeleteDialogOpen(false);
      setSelectedSeason(null);
      window.location.reload();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Sezon silinirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sezon Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Koleksiyon sezonlarınızı tanımlayın
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Sezon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sezon</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seasons.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktif Sezonlar
            </CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {seasons.filter((s: any) => s.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gelecek Sezonlar
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                seasons.filter((s: any) => s.year > new Date().getFullYear())
                  .length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seasons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {seasons.map((season: any) => (
          <Card
            key={season.id}
            className={!season.isActive ? "opacity-60" : ""}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{season.name}</CardTitle>
                <Badge
                  variant={season.type === "SS" ? "default" : "secondary"}
                  className={
                    season.type === "SS"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  }
                >
                  {season.type === "SS" ? "🌸 SS" : "❄️ FW"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{season.fullName}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Yıl:</span>
                <span className="ml-2 font-semibold">{season.year}</span>
              </div>

              {season.startDate && season.endDate && (
                <div className="text-xs text-muted-foreground">
                  📅 {new Date(season.startDate).toLocaleDateString("tr-TR")} -{" "}
                  {new Date(season.endDate).toLocaleDateString("tr-TR")}
                </div>
              )}

              {season.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {season.description}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedSeason(season);
                    setFormData({
                      name: season.name,
                      fullName: season.fullName,
                      year: season.year,
                      type: season.type,
                      startDate: season.startDate
                        ? new Date(season.startDate).toISOString().split("T")[0]
                        : "",
                      endDate: season.endDate
                        ? new Date(season.endDate).toISOString().split("T")[0]
                        : "",
                      description: season.description || "",
                      isActive: season.isActive,
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
                    setSelectedSeason(season);
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Sezon Oluştur</DialogTitle>
            <DialogDescription>
              Yeni bir koleksiyon sezonu tanımlayın
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sezon Kodu *</Label>
                <Input
                  placeholder="Örn: SS25"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Tam Adı *</Label>
                <Input
                  placeholder="Spring/Summer 2025"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Yıl *</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Tip *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SS">🌸 Spring/Summer</SelectItem>
                    <SelectItem value="FW">❄️ Fall/Winter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                placeholder="Sezon hakkında notlar..."
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
            <DialogTitle>Sezon Düzenle</DialogTitle>
            <DialogDescription>
              {selectedSeason?.name} sezonunu düzenleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sezon Kodu *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Tam Adı *</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Yıl *</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Tip *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SS">🌸 Spring/Summer</SelectItem>
                    <SelectItem value="FW">❄️ Fall/Winter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
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

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label>Aktif Durum</Label>
                <p className="text-xs text-muted-foreground">
                  Sezon kullanılabilir durumda mı?
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
            <AlertDialogTitle>Sezonu Sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedSeason?.name}</strong> sezonu silinecek. Bu işlem
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
