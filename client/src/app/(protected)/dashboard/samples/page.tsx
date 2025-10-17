"use client";

import { SimpleDataTable } from "@/components/DataTable";
import { StartMessageModal } from "@/components/Messages/StartMessageModal";
import { NewSampleRequestModal, type NewSampleRequestData } from "@/components/Sample/NewSampleRequestModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthProvider";
import {
    CANCEL_SAMPLE_MUTATION,
    CREATE_SAMPLE_MUTATION,
    DELETE_SAMPLE_MUTATION,
    HOLD_SAMPLE_MUTATION,
    RESUME_SAMPLE_MUTATION,
    UPDATE_SAMPLE_MUTATION,
} from "@/lib/graphql/mutations";
import {
    ALL_MANUFACTURERS_QUERY,
    ALL_SAMPLES_QUERY,
    ASSIGNED_SAMPLES_QUERY,
    MY_SAMPLES_QUERY
} from "@/lib/graphql/queries";
import {
    Ban,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    MessageSquare,
    Package,
    Pause,
    Play,
    Plus,
    Search,
    Trash2,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

interface Sample {
  id: number;
  sampleNumber: string;
  sampleType: string;
  status: string;
  customerNote?: string;
  manufacturerResponse?: string;
  productionDays?: number;
  estimatedProductionDate?: string;
  actualProductionDate?: string;
  createdAt: string;
  updatedAt: string;
  // AI Fields
  aiGenerated?: boolean;
  aiPrompt?: string;
  aiSketchUrl?: string;
  images?: string[];
  collection?: {
    id: number;
    name: string;
    images?: string[];
    modelCode?: string;
  };
  originalCollection?: {
    id: number;
    name: string;
  };
  customer: {
    id: number;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  manufacture: {
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
    AI_DESIGN: { label: "AI Tasarım", className: "bg-purple-100 text-purple-800" },
    PENDING_APPROVAL: { label: "Onay Bekliyor", className: "bg-yellow-100 text-yellow-800" },
    REQUESTED: { label: "Talep Edildi", className: "bg-blue-100 text-blue-800" },
    RECEIVED: { label: "Alındı", className: "bg-indigo-100 text-indigo-800" },
    IN_DESIGN: { label: "Tasarımda", className: "bg-purple-100 text-purple-800" },
    PATTERN_READY: { label: "Kalıp Hazır", className: "bg-violet-100 text-violet-800" },
    IN_PRODUCTION: {
      label: "Üretimde",
      className: "bg-orange-100 text-orange-800",
    },
    QUALITY_CHECK: {
      label: "Kalite Kontrolde",
      className: "bg-amber-100 text-amber-800",
    },
    ON_HOLD: {
      label: "Durduruldu",
      className: "bg-gray-100 text-gray-800",
    },
    COMPLETED: {
      label: "Tamamlandı",
      className: "bg-teal-100 text-teal-800",
    },
    REJECTED: { label: "Reddedildi", className: "bg-red-100 text-red-800" },
    CANCELLED: {
      label: "İptal Edildi",
      className: "bg-slate-100 text-slate-800",
    },
    SHIPPED: { label: "Kargoya Verildi", className: "bg-cyan-100 text-cyan-800" },
    // Old statuses for backward compatibility
    PENDING: { label: "Beklemede", className: "bg-blue-100 text-blue-800" },
    APPROVED: { label: "Onaylandı", className: "bg-green-100 text-green-800" },
    DELIVERED: {
      label: "Teslim Edildi",
      className: "bg-green-100 text-green-800",
    },
  };

  const statusInfo = config[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };
  return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
};

const getSampleProgress = (sample: Sample) => {
  const { status, estimatedProductionDate, actualProductionDate, createdAt } =
    sample;

  if (status === "SHIPPED" || status === "COMPLETED") return 100;
  if (status === "REJECTED" || status === "CANCELLED") return 0;
  if (status === "ON_HOLD") return 50; // Frozen at current progress

  if (
    (status === "IN_PRODUCTION" || status === "QUALITY_CHECK") &&
    estimatedProductionDate
  ) {
    const startDate = actualProductionDate
      ? new Date(actualProductionDate)
      : new Date(createdAt);
    const endDate = new Date(estimatedProductionDate);
    const now = new Date();

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = now.getTime() - startDate.getTime();

    if (totalDuration <= 0) return 50;

    let calculatedProgress = (elapsedDuration / totalDuration) * 100;
    calculatedProgress = Math.max(0, Math.min(100, calculatedProgress));

    if (status === "IN_PRODUCTION") {
      calculatedProgress = Math.max(30, calculatedProgress);
    } else if (status === "QUALITY_CHECK") {
      calculatedProgress = Math.max(70, calculatedProgress);
    }

    return Math.floor(calculatedProgress);
  }

  const progressMap: Record<string, number> = {
    AI_DESIGN: 0, // Not sent to manufacturer yet
    PENDING_APPROVAL: 5,
    REQUESTED: 15,
    RECEIVED: 20,
    IN_DESIGN: 30,
    PATTERN_READY: 40,
    IN_PRODUCTION: 60,
    QUALITY_CHECK: 80,
    COMPLETED: 95,
    SHIPPED: 100,
    REJECTED: 0,
  };
  return progressMap[status] || 0;
};

export default function SamplesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewSampleModalOpen, setIsNewSampleModalOpen] = useState(false);
  const [messageModal, setMessageModal] = useState<{
    open: boolean;
    sampleId: number;
    sampleNumber: string;
    receiverId: number;
    receiverName: string;
  } | null>(null);

  const isManufacturer =
    (user?.role === "MANUFACTURE" ||
      user?.role === "COMPANY_OWNER" ||
      user?.role === "COMPANY_EMPLOYEE") &&
    user?.company?.type === "MANUFACTURER";
  const isCustomer =
    user?.role === "CUSTOMER" ||
    user?.role === "INDIVIDUAL_CUSTOMER" ||
    user?.company?.type === "BUYER";

  // Queries
  const samplesQuery = isManufacturer
    ? ASSIGNED_SAMPLES_QUERY
    : isCustomer
    ? MY_SAMPLES_QUERY
    : ALL_SAMPLES_QUERY;

  const [{ data: samplesData, fetching }, reexecuteQuery] = useQuery({
    query: samplesQuery,
  });

  // Get manufacturers for customer
  const [{ data: manufacturersData, fetching: fetchingManufacturers, error: manufacturersError }] = useQuery({
    query: ALL_MANUFACTURERS_QUERY,
    pause: !isCustomer,
  });

  const manufacturers = manufacturersData?.allManufacturers || [];  // Mutations
  const [, createSample] = useMutation(CREATE_SAMPLE_MUTATION);
  const [, updateSample] = useMutation(UPDATE_SAMPLE_MUTATION);
  const [, deleteSample] = useMutation(DELETE_SAMPLE_MUTATION);
  const [, holdSample] = useMutation(HOLD_SAMPLE_MUTATION);
  const [, cancelSample] = useMutation(CANCEL_SAMPLE_MUTATION);
  const [, resumeSample] = useMutation(RESUME_SAMPLE_MUTATION);

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
    pending: samples.filter((s) => s.status === "PENDING_APPROVAL" || s.status === "REQUESTED").length,
    inProduction: samples.filter((s) => s.status === "IN_PRODUCTION" || s.status === "IN_DESIGN" || s.status === "PATTERN_READY").length,
    completed: samples.filter((s) => s.status === "COMPLETED" || s.status === "SHIPPED").length,
  };

  const handleQuickAction = async (sampleId: number, newStatus: string) => {
    setIsSubmitting(true);
    try {
      const result = await updateSample({
        input: {
          id: sampleId,
          status: newStatus,
        },
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

  const handleDelete = async (sampleId: number, sampleNumber: string) => {
    if (!confirm(`${sampleNumber} numaralı numune talebini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await deleteSample({
        id: sampleId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Numune talebi silindi");
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Numune silinirken hata";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHold = async (sampleId: number, sampleNumber: string) => {
    const reason = prompt(`${sampleNumber} numaralı numune durdurma sebebi (opsiyonel):`);
    if (reason === null) return; // User cancelled

    setIsSubmitting(true);
    try {
      const result = await holdSample({
        id: sampleId,
        reason: reason || undefined,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Numune durduruldu");
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Numune durdurulurken hata";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (sampleId: number, sampleNumber: string) => {
    const reason = prompt(`${sampleNumber} numaralı numune iptal sebebi (opsiyonel):`);
    if (reason === null) return; // User cancelled

    if (!confirm(`${sampleNumber} numaralı numuneyi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await cancelSample({
        id: sampleId,
        reason: reason || undefined,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Numune iptal edildi");
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Numune iptal edilirken hata";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResume = async (sampleId: number, sampleNumber: string) => {
    if (!confirm(`${sampleNumber} numaralı numuneye devam etmek istediğinizden emin misiniz?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resumeSample({
        id: sampleId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Numune üretime devam ediyor");
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Numune devam ettirilirken hata";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewSampleRequest = async (data: NewSampleRequestData) => {
    try {
      // TODO: Implement file upload endpoint if needed
      // For now, we'll create the sample with text data only
      const result = await createSample({
        input: {
          manufactureId: data.manufactureId,
          sampleType: "CUSTOM",
          quantity: data.quantity,
          customerNote: [
            `Numune Adı: ${data.sampleName}`,
            data.fabricType && `Kumaş: ${data.fabricType}`,
            data.color && `Renk: ${data.color}`,
            data.classification && `Klasman: ${data.classification}`,
            data.gender && `Cinsiyet: ${data.gender}`,
            data.size && `Beden: ${data.size}`,
            data.pattern && `Kalıp: ${data.pattern}`,
            data.accessories && `Aksesuar: ${data.accessories}`,
            data.season && `Sezon: ${data.season}`,
            data.description && `Açıklama: ${data.description}`,
            data.images && `${data.images.length} fotoğraf yüklendi`,
            data.sizeChart && `Ölçü tablosu yüklendi`,
            data.techPack && `Tech pack yüklendi`,
          ]
            .filter(Boolean)
            .join("\n"),
          aiAnalysis: data.aiAnalysis,
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Numune talebi başarıyla oluşturuldu" + (data.aiAnalysis ? " (AI analizi dahil)" : ""));
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Numune talebi oluşturulurken hata";
      toast.error(errorMessage);
      throw error;
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
          <h1 className="text-3xl font-bold">
            {isManufacturer ? "Numune Talepleri" : "Numunelerim"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isManufacturer
              ? "Gelen numune taleplerini görüntüleyin ve yanıtlayın"
              : "Koleksiyon kartlarından veya doğrudan üreticiden numune talebi gönderebilirsiniz"}
          </p>
        </div>
        {isCustomer && (
          <Button onClick={() => setIsNewSampleModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Numune Talebi
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Numune</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tüm numuneler
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Onay bekliyor
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Üretimde</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inProduction}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Üretim aşamasında
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Başarıyla tamamlandı
            </p>
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
            <SelectItem value="AI_DESIGN">AI Tasarım</SelectItem>
            <SelectItem value="PENDING_APPROVAL">Onay Bekliyor</SelectItem>
            <SelectItem value="REQUESTED">Talep Edildi</SelectItem>
            <SelectItem value="IN_DESIGN">Tasarımda</SelectItem>
            <SelectItem value="IN_PRODUCTION">Üretimde</SelectItem>
            <SelectItem value="ON_HOLD">Durduruldu</SelectItem>
            <SelectItem value="QUALITY_CHECK">Kalite Kontrolde</SelectItem>
            <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
            <SelectItem value="SHIPPED">Kargoya Verildi</SelectItem>
            <SelectItem value="REJECTED">Reddedildi</SelectItem>
            <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Column Definitions for DataTable */}
      {/* Samples Table */}
      <SimpleDataTable<Sample>
        data={filteredSamples}
        columns={[
          {
            id: 'image',
            header: 'Görsel',
            cell: (sample) => {
              // Parse images if it's a JSON string
              let sampleImages: string[] = [];
              if (sample.images) {
                if (typeof sample.images === 'string') {
                  try {
                    sampleImages = JSON.parse(sample.images);
                  } catch (e) {
                    sampleImages = [sample.images];
                  }
                } else if (Array.isArray(sample.images)) {
                  sampleImages = sample.images;
                }
              }

              let collectionImages: string[] = [];
              if (sample.collection?.images) {
                if (typeof sample.collection.images === 'string') {
                  try {
                    collectionImages = JSON.parse(sample.collection.images);
                  } catch (e) {
                    collectionImages = [sample.collection.images];
                  }
                } else if (Array.isArray(sample.collection.images)) {
                  collectionImages = sample.collection.images;
                }
              }

              // Priority: 1. Sample images (AI), 2. Collection images
              const imageUrl = sampleImages.length > 0
                ? sampleImages[0]
                : collectionImages.length > 0
                ? collectionImages[0]
                : null;

              const displayName = sample.aiGenerated
                ? "AI Tasarım"
                : sample.collection?.name || "Numune";

              return (
                <div className="relative h-16 w-16 flex-shrink-0">
                  {imageUrl ? (
                    <>
                      <img
                        src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:4000${imageUrl}`}
                        alt={displayName}
                        className="h-16 w-16 rounded object-cover"
                        onError={(e) => {
                          console.error('Image load error:', imageUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {sample.aiGenerated && (
                        <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs px-1 rounded">
                          AI
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            id: 'sampleNumber',
            header: 'Numune No',
            accessorKey: 'sampleNumber',
            sortable: true,
            cell: (sample) => (
              <div>
                <p className="font-semibold">{sample.sampleNumber}</p>
                <p className="text-sm text-gray-500">
                  {sample.aiGenerated
                    ? (sample.aiPrompt ? `AI: ${sample.aiPrompt.substring(0, 30)}...` : "AI Tasarım")
                    : sample.collection?.name}
                </p>
                {sample.collection?.modelCode && (
                  <p className="text-xs text-gray-400">{sample.collection.modelCode}</p>
                )}
              </div>
            ),
          },
          {
            id: 'type',
            header: 'Tip',
            cell: (sample) => (
              <Badge variant="secondary">
                {sample.sampleType === "STANDARD" && "Standart"}
                {sample.sampleType === "REVISION" && "Revize"}
                {sample.sampleType === "CUSTOM" && "Özel"}
              </Badge>
            ),
          },
          {
            id: 'status',
            header: 'Durum',
            accessorKey: 'status',
            sortable: true,
            cell: (sample) => getStatusBadge(sample.status),
          },
          {
            id: 'user',
            header: isCustomer ? 'Üretici' : 'Talep Eden',
            cell: (sample) => (
              <div>
                <p className="font-medium text-sm">
                  {isCustomer
                    ? (sample.manufacture?.company?.name || sample.manufacture?.name || sample.manufacture?.email)
                    : (sample.customer?.firstName || sample.customer?.name || sample.customer?.email)}
                </p>
              </div>
            ),
          },
          {
            id: 'progress',
            header: 'İlerleme',
            cell: (sample) => {
              const progress = getSampleProgress(sample);
              if (sample.status === "REJECTED" || sample.status === "CANCELLED") {
                return <span className="text-sm text-gray-500">-</span>;
              }
              return (
                <div className="space-y-1 min-w-[100px]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            },
          },
          {
            id: 'createdAt',
            header: 'Tarih',
            accessorKey: 'createdAt',
            sortable: true,
            cell: (sample) => (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {new Date(sample.createdAt).toLocaleDateString('tr-TR')}
              </div>
            ),
          },
          {
            id: 'actions',
            header: 'İşlemler',
            cell: (sample) => (
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/samples/${sample.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>

                {/* Message Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMessageModal({
                    open: true,
                    sampleId: sample.id,
                    sampleNumber: sample.sampleNumber,
                    receiverId: isCustomer ? sample.manufacture.id : sample.customer.id,
                    receiverName: isCustomer
                      ? (sample.manufacture.company?.name || `${sample.manufacture.firstName} ${sample.manufacture.lastName}`)
                      : (sample.customer.name || `${sample.customer.firstName} ${sample.customer.lastName}`)
                  })}
                  title="Mesaj Gönder"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>

                {/* Customer can delete samples in PENDING_APPROVAL or REJECTED status */}
                {isCustomer &&
                  (sample.status === "PENDING_APPROVAL" || sample.status === "REJECTED") && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(sample.id, sample.sampleNumber)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                {/* Resume from ON_HOLD (Manufacturer only) */}
                {isManufacturer && sample.status === "ON_HOLD" && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleResume(sample.id, sample.sampleNumber)}
                    disabled={isSubmitting}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}

                {/* Hold (Manufacturer only, for active samples) */}
                {isManufacturer &&
                  !["PENDING_APPROVAL", "REJECTED", "CANCELLED", "ON_HOLD", "COMPLETED", "SHIPPED"].includes(sample.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleHold(sample.id, sample.sampleNumber)}
                      disabled={isSubmitting}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}

                {/* Cancel (Both customer and manufacturer, not for completed/shipped) */}
                {!["COMPLETED", "SHIPPED", "CANCELLED"].includes(sample.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    onClick={() => handleCancel(sample.id, sample.sampleNumber)}
                    disabled={isSubmitting}
                  >
                    <Ban className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        getRowKey={(sample) => sample.id.toString()}
        defaultSortField="createdAt"
        defaultSortDirection="desc"
        emptyMessage={
          isCustomer
            ? "Henüz numune talebiniz yok. Koleksiyonlar sayfasından veya 'Yeni Numune Talebi' butonundan talep oluşturabilirsiniz."
            : "Henüz size atanmış numune talebi yok."
        }
      />

      {/* New Sample Request Modal */}
      {isCustomer && (
        <NewSampleRequestModal
          isOpen={isNewSampleModalOpen}
          onClose={() => setIsNewSampleModalOpen(false)}
          manufacturers={manufacturers}
          onSubmit={handleNewSampleRequest}
        />
      )}

      {/* Start Message Modal */}
      {messageModal && (
        <StartMessageModal
          open={messageModal.open}
          onOpenChange={(open: boolean) => !open && setMessageModal(null)}
          type="sample"
          itemId={messageModal.sampleId}
          itemTitle={`Numune: ${messageModal.sampleNumber}`}
          receiverId={messageModal.receiverId}
          receiverName={messageModal.receiverName}
        />
      )}
    </div>
  );
}
