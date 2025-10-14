"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthProvider";
import {
  CREATE_SAMPLE_MUTATION,
  UPDATE_SAMPLE_MUTATION,
} from "@/lib/graphql/mutations";
import {
  ALL_COLLECTIONS_QUERY,
  ALL_SAMPLES_QUERY,
  ASSIGNED_SAMPLES_QUERY,
  MY_SAMPLES_QUERY,
} from "@/lib/graphql/queries";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Package,
  Play,
  Plus,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

interface Sample {
  id: number;
  sampleNumber: string;
  quantity: number;
  status: string;
  requestedBy: string;
  notes?: string;
  manufacturerResponse?: string;
  createdAt: string;
  estimatedCompletionDate?: string;
  actualStartDate?: string;
  collection: {
    id: number;
    name: string;
    images?: string[];
    modelCode?: string;
  };
  customer: {
    id: number;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  manufacture?: {
    id: number;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    company?: {
      id: number;
      name: string;
    };
  };
}

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    PENDING: { label: "Beklemede", className: "bg-blue-100 text-blue-800" },
    APPROVED: { label: "Onaylandı", className: "bg-green-100 text-green-800" },
    REJECTED: { label: "Reddedildi", className: "bg-red-100 text-red-800" },
    IN_PRODUCTION: {
      label: "Üretimde",
      className: "bg-orange-100 text-orange-800",
    },
    COMPLETED: {
      label: "Tamamlandı",
      className: "bg-teal-100 text-teal-800",
    },
    SHIPPED: { label: "Gönderildi", className: "bg-cyan-100 text-cyan-800" },
    DELIVERED: {
      label: "Teslim Edildi",
      className: "bg-green-100 text-green-800",
    },
    CANCELLED: {
      label: "İptal Edildi",
      className: "bg-gray-100 text-gray-800",
    },
  };

  const statusInfo = config[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };
  return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
};

const getSampleProgress = (sample: Sample) => {
  const { status, estimatedCompletionDate, actualStartDate, createdAt } =
    sample;

  if (status === "DELIVERED") return 100;
  if (status === "REJECTED" || status === "CANCELLED") return 0;

  if (
    (status === "IN_PRODUCTION" || status === "COMPLETED") &&
    estimatedCompletionDate
  ) {
    const startDate = actualStartDate
      ? new Date(actualStartDate)
      : new Date(createdAt);
    const endDate = new Date(estimatedCompletionDate);
    const now = new Date();

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = now.getTime() - startDate.getTime();

    if (totalDuration <= 0) return 50;

    let calculatedProgress = (elapsedDuration / totalDuration) * 100;
    calculatedProgress = Math.max(0, Math.min(100, calculatedProgress));

    if (status === "IN_PRODUCTION") {
      calculatedProgress = Math.max(30, calculatedProgress);
    } else if (status === "COMPLETED") {
      calculatedProgress = Math.max(80, calculatedProgress);
    }

    return Math.floor(calculatedProgress);
  }

  const progressMap: Record<string, number> = {
    PENDING: 5,
    APPROVED: 20,
    IN_PRODUCTION: 50,
    COMPLETED: 80,
    SHIPPED: 90,
    DELIVERED: 100,
    REJECTED: 0,
    CANCELLED: 0,
  };
  return progressMap[status] || 0;
};

const getNextStatus = (currentStatus: string): string | null => {
  const statusFlow: Record<string, string> = {
    PENDING: "APPROVED",
    APPROVED: "IN_PRODUCTION",
    IN_PRODUCTION: "COMPLETED",
    COMPLETED: "SHIPPED",
    SHIPPED: "DELIVERED",
  };
  return statusFlow[currentStatus] || null;
};

export default function SamplesPage() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    collectionId: "",
    quantity: "",
    requestedBy: "",
    notes: "",
  });

  const isManufacturer =
    user?.role === "MANUFACTURE" ||
    user?.role === "COMPANY_OWNER" ||
    user?.role === "COMPANY_EMPLOYEE";
  const isCustomer = user?.role === "CUSTOMER";

  // Queries
  const [{ data: collectionsData }] = useQuery({
    query: ALL_COLLECTIONS_QUERY,
    pause: !isCustomer,
  });

  const samplesQuery = isManufacturer
    ? ASSIGNED_SAMPLES_QUERY
    : isCustomer
    ? MY_SAMPLES_QUERY
    : ALL_SAMPLES_QUERY;

  const [{ data: samplesData, fetching }, reexecuteQuery] = useQuery({
    query: samplesQuery,
  });

  // Mutations
  const [, createSample] = useMutation(CREATE_SAMPLE_MUTATION);
  const [, updateSample] = useMutation(UPDATE_SAMPLE_MUTATION);

  const samples: Sample[] =
    samplesData?.assignedSamples ||
    samplesData?.mySamples ||
    samplesData?.samples ||
    [];

  // Filter samples
  const filteredSamples = samples.filter((sample) => {
    const matchesSearch =
      sample.sampleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.collection?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || sample.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: samples.length,
    pending: samples.filter((s) => s.status === "PENDING").length,
    inProduction: samples.filter((s) => s.status === "IN_PRODUCTION").length,
    completed: samples.filter((s) => s.status === "DELIVERED").length,
  };

  const handleCreate = async () => {
    if (!formData.collectionId || !formData.quantity) {
      toast.error("Lütfen koleksiyon ve miktar alanlarını doldurun");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createSample({
        collectionId: parseInt(formData.collectionId),
        quantity: parseInt(formData.quantity),
        requestedBy: formData.requestedBy || user?.email || "Unknown",
        notes: formData.notes || undefined,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Numune talebi başarıyla oluşturuldu");
      setIsDialogOpen(false);
      setFormData({
        collectionId: "",
        quantity: "",
        requestedBy: "",
        notes: "",
      });
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Numune oluşturulurken hata";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAction = async (sampleId: number, newStatus: string) => {
    setIsSubmitting(true);
    try {
      const result = await updateSample({
        id: sampleId,
        status: newStatus,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Numune durumu güncellendi");
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Durum güncellenirken hata";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Numuneler</h1>
          <p className="text-muted-foreground">Numune taleplerini yönetin</p>
        </div>
        {isCustomer && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Numune Talebi
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Bekleyen</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Üretimde</p>
                <p className="text-2xl font-bold">{stats.inProduction}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tamamlanan</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Numune numarası veya koleksiyon ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tüm Durumlar</SelectItem>
            <SelectItem value="PENDING">Beklemede</SelectItem>
            <SelectItem value="APPROVED">Onaylandı</SelectItem>
            <SelectItem value="IN_PRODUCTION">Üretimde</SelectItem>
            <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
            <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Samples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSamples.map((sample) => {
          const progress = getSampleProgress(sample);
          const nextStatus = getNextStatus(sample.status);

          return (
            <Card
              key={sample.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-0">
                {/* Image */}
                {sample.collection?.images &&
                  sample.collection.images.length > 0 && (
                    <div className="relative h-48 w-full bg-gray-100">
                      <Image
                        src={sample.collection.images[0].replace(/\/\//g, "/")}
                        alt={sample.collection.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {sample.sampleNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {sample.collection?.name}
                      </p>
                      {sample.collection?.modelCode && (
                        <p className="text-xs text-gray-400">
                          {sample.collection.modelCode}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(sample.status)}
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Miktar</p>
                      <p className="font-medium">{sample.quantity} adet</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Talep Eden</p>
                      <p className="font-medium text-sm truncate">
                        {sample.requestedBy}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(sample.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {sample.status !== "REJECTED" &&
                    sample.status !== "CANCELLED" && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">İlerleme</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Link
                      href={`/dashboard/samples/${sample.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Detay
                      </Button>
                    </Link>

                    {isManufacturer &&
                      nextStatus &&
                      sample.status !== "DELIVERED" &&
                      sample.status !== "CANCELLED" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleQuickAction(sample.id, nextStatus)
                          }
                          disabled={isSubmitting}
                          className="flex-1"
                        >
                          {nextStatus === "APPROVED" && (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          {nextStatus === "IN_PRODUCTION" && (
                            <Play className="h-4 w-4 mr-2" />
                          )}
                          {nextStatus !== "APPROVED" &&
                            nextStatus !== "IN_PRODUCTION" && (
                              <ArrowRight className="h-4 w-4 mr-2" />
                            )}
                          {nextStatus === "APPROVED" && "Onayla"}
                          {nextStatus === "IN_PRODUCTION" && "Başlat"}
                          {nextStatus === "COMPLETED" && "Tamamla"}
                          {nextStatus === "SHIPPED" && "Gönder"}
                          {nextStatus === "DELIVERED" && "Teslim Et"}
                        </Button>
                      )}

                    {isManufacturer && sample.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleQuickAction(sample.id, "REJECTED")}
                        disabled={isSubmitting}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reddet
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSamples.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Numune bulunamadı</p>
          </CardContent>
        </Card>
      )}

      {/* Create Sample Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Numune Talebi</DialogTitle>
            <DialogDescription>
              Koleksiyon seçin ve numune detaylarını girin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Koleksiyon</Label>
              <Select
                value={formData.collectionId}
                onValueChange={(value) =>
                  setFormData({ ...formData, collectionId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Koleksiyon seçin" />
                </SelectTrigger>
                <SelectContent>
                  {collectionsData?.collections?.map(
                    (collection: { id: number; name: string }) => (
                      <SelectItem
                        key={collection.id}
                        value={collection.id.toString()}
                      >
                        {collection.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Miktar</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="Örn: 3"
                />
              </div>

              <div className="space-y-2">
                <Label>Talep Eden</Label>
                <Input
                  value={formData.requestedBy}
                  onChange={(e) =>
                    setFormData({ ...formData, requestedBy: e.target.value })
                  }
                  placeholder="İsim veya Departman"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notlar (Opsiyonel)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Özel isteklerinizi belirtin..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Talep Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
