"use client";

import {
  CreateWorkshopDocument,
  DeleteWorkshopDocument,
  UpdateWorkshopDocument,
  WorkshopsDocument,
} from "@/__generated__/graphql";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Factory, Plus, ShieldX, Trash2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";
import * as z from "zod";

// Form Schema
const workshopSchema = z.object({
  name: z.string().min(2, "Atölye adı en az 2 karakter olmalıdır"),
  type: z.enum(["SEWING", "PACKAGING", "QUALITY_CONTROL", "GENERAL"]),
  capacity: z.string().optional(),
  location: z.string().optional(),
});

type WorkshopFormValues = z.infer<typeof workshopSchema>;

export default function WorkshopsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [{ data, fetching }, refetch] = useQuery({ query: WorkshopsDocument });
  const [, createWorkshop] = useMutation(CreateWorkshopDocument);
  const [, updateWorkshop] = useMutation(UpdateWorkshopDocument);
  const [, deleteWorkshop] = useMutation(DeleteWorkshopDocument);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<any>(null);

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

  const form = useForm<WorkshopFormValues>({
    resolver: zodResolver(workshopSchema),
    defaultValues: {
      name: "",
      type: "GENERAL",
      capacity: "",
      location: "",
    },
  });

  const onSubmit = async (values: WorkshopFormValues) => {
    try {
      // Clean up values - convert empty string to undefined for optional fields
      const cleanValues = {
        ...values,
        capacity: values.capacity === "" || values.capacity === undefined
          ? undefined
          : typeof values.capacity === 'string'
            ? parseInt(values.capacity)
            : values.capacity,
        location: values.location?.trim() || undefined,
      };

      if (editingWorkshop) {
        const result = await updateWorkshop({
          input: {
            id: editingWorkshop.id,
            ...cleanValues,
          },
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        toast.success("Atölye güncellendi");
        setEditingWorkshop(null);
      } else {
        const result = await createWorkshop({
          input: cleanValues,
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        toast.success("Atölye oluşturuldu");
        setIsCreateOpen(false);
      }

      form.reset({
        name: "",
        type: "GENERAL",
        capacity: "",
        location: "",
      });
      refetch({ requestPolicy: "network-only" });
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    }
  };

  const handleEdit = (workshop: any) => {
    setEditingWorkshop(workshop);
    form.reset({
      name: workshop.name,
      type: workshop.type,
      capacity: workshop.capacity?.toString() || "",
      location: workshop.location || "",
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" atölyesini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const result = await deleteWorkshop({ id });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Atölye silindi");
      refetch({ requestPolicy: "network-only" });
    } catch (error: any) {
      toast.error(error.message || "Silme işlemi başarısız");
    }
  };

  const typeLabels = {
    SEWING: "Dikiş",
    PACKAGING: "Paketleme",
    QUALITY_CONTROL: "Kalite Kontrol",
    GENERAL: "Genel",
  };

  if (fetching) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  // Show access denied for non-manufacturers
  if (user && !isManufacturer && user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShieldX className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Erişim Reddedildi</h2>
        <p className="text-gray-600 text-center max-w-md">
          Atölye yönetimi sayfasına yalnızca üretici firmaların çalışanları erişebilir.
        </p>
      </div>
    );
  }

  const workshops = data?.workshops || [];
  const stats = {
    total: workshops.length,
    active: workshops.filter((w: any) => w.isActive).length,
    totalCapacity: workshops.reduce((sum: number, w: any) => sum + (w.capacity || 0), 0),
    totalProductions: workshops.reduce(
      (sum: number, w: any) => sum + (w.totalProductionCount || 0),
      0
    ),
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Atölye Yönetimi</h1>
          <p className="text-muted-foreground">
            Üretim atölyelerini yönetin ve takip edin
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingWorkshop(null);
              form.reset({
                name: "",
                type: "GENERAL",
                capacity: "",
                location: "",
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Atölye
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingWorkshop ? "Atölye Düzenle" : "Yeni Atölye Oluştur"}
              </DialogTitle>
              <DialogDescription>
                Atölye bilgilerini doldurun
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Atölye Adı *</FormLabel>
                      <FormControl>
                        <Input placeholder="Örn: Dikiş Atölyesi 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Atölye Tipi *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tip seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SEWING">Dikiş</SelectItem>
                          <SelectItem value="PACKAGING">Paketleme</SelectItem>
                          <SelectItem value="QUALITY_CONTROL">
                            Kalite Kontrol
                          </SelectItem>
                          <SelectItem value="GENERAL">Genel</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kapasite (günlük)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Örn: 100"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lokasyon</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Örn: İstanbul, Pendik"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingWorkshop(null);
                      form.reset({
                        name: "",
                        type: "GENERAL",
                        capacity: "",
                        location: "",
                      });
                    }}
                  >
                    İptal
                  </Button>
                  <Button type="submit">
                    {editingWorkshop ? "Güncelle" : "Oluştur"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Atölye
            </CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Kapasite
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCapacity}</div>
            <p className="text-xs text-muted-foreground">günlük üretim</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Üretim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProductions}</div>
            <p className="text-xs text-muted-foreground">tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ortalama Kullanım
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0
                ? Math.round(
                    workshops.reduce(
                      (sum: number, w: any) => sum + (w.utilizationRate || 0),
                      0
                    ) / stats.total
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">kapasite kullanımı</p>
          </CardContent>
        </Card>
      </div>

      {/* Workshops List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workshops.map((workshop: any) => (
          <Card key={workshop.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{workshop.name}</CardTitle>
                  <CardDescription>
                    {typeLabels[workshop.type as keyof typeof typeLabels]}
                    {workshop.location && ` • ${workshop.location}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(workshop)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(workshop.id, workshop.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {workshop.capacity && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kapasite:</span>
                  <span className="font-medium">{workshop.capacity}/gün</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Aktif Üretim:</span>
                <span className="font-medium">
                  {workshop.activeProductionCount}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Toplam Üretim:</span>
                <span className="font-medium">
                  {workshop.totalProductionCount}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kullanım Oranı:</span>
                <span className="font-medium">
                  {workshop.utilizationRate || 0}%
                </span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    workshop.isActive ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span className="text-xs text-muted-foreground">
                  {workshop.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workshops.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <Factory className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Atölye Bulunamadı</h3>
            <p className="text-muted-foreground mb-4">
              Henüz kayıtlı atölye yok. Yeni bir atölye oluşturarak başlayın.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              İlk Atölyeyi Oluştur
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
