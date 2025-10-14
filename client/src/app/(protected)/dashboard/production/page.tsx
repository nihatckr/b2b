"use client";

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
import {
  Calendar,
  Clock,
  Filter,
  Package,
  Search,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "urql";

const ALL_PRODUCTION_TRACKING_QUERY = `
  query AllProductionTracking {
    allProductionTracking {
      id
      orderId
      sampleId
      currentStage
      overallStatus
      progress
      estimatedStartDate
      estimatedEndDate
      actualStartDate
      actualEndDate
      stageUpdates {
        id
        stage
        status
        actualStartDate
        actualEndDate
        estimatedDays
      }
      order {
        id
        orderNumber
        collection {
          id
          name
          modelCode
        }
      }
      sample {
        id
        sampleNumber
        collection {
          id
          name
          modelCode
        }
      }
    }
  }
`;

export default function ProductionPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const [{ data, fetching }] = useQuery({
    query: ALL_PRODUCTION_TRACKING_QUERY,
    requestPolicy: "cache-and-network",
  });

  const trackings = data?.allProductionTracking || [];

  // Filter
  const filteredTrackings = trackings.filter((tracking: any) => {
    const type = tracking.orderId ? "ORDER" : "SAMPLE";

    const matchesSearch =
      !searchTerm ||
      tracking.order?.orderNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      tracking.sample?.sampleNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      tracking.order?.collection?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      tracking.sample?.collection?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesType = filterType === "ALL" || type === filterType;
    const matchesStatus =
      filterStatus === "ALL" || tracking.overallStatus === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats
  const stats = {
    total: trackings.length,
    inProgress: trackings.filter((t: any) => t.overallStatus === "IN_PROGRESS")
      .length,
    completed: trackings.filter((t: any) => t.overallStatus === "COMPLETED")
      .length,
    delayed: trackings.filter((t: any) => t.overallStatus === "DELAYED").length,
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Bekliyor", className: "bg-gray-100 text-gray-700" },
      IN_PROGRESS: {
        label: "Devam Ediyor",
        className: "bg-blue-100 text-blue-700",
      },
      COMPLETED: {
        label: "Tamamlandı",
        className: "bg-green-100 text-green-700",
      },
      DELAYED: { label: "Gecikmiş", className: "bg-red-100 text-red-700" },
      CANCELLED: { label: "İptal", className: "bg-gray-100 text-gray-700" },
    };
    return statusMap[status] || statusMap.PENDING;
  };

  const getTypeBadge = (type: string) => {
    return type === "ORDER"
      ? { label: "Sipariş", className: "bg-purple-100 text-purple-700" }
      : { label: "Numune", className: "bg-orange-100 text-orange-700" };
  };

  if (fetching) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Üretim Takibi</h1>
        <p className="text-gray-500 mt-1">
          Tüm sipariş ve numune üretimlerini takip edin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Üretim</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aktif üretim sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devam Eden</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.inProgress}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Üretim aşamasında
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Başarıyla tamamlandı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gecikmiş</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.delayed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Planlanan tarihten geç
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Sipariş/Numune ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Tür Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tümü</SelectItem>
            <SelectItem value="ORDER">Sipariş</SelectItem>
            <SelectItem value="SAMPLE">Numune</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Durum Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tümü</SelectItem>
            <SelectItem value="PENDING">Bekliyor</SelectItem>
            <SelectItem value="IN_PROGRESS">Devam Ediyor</SelectItem>
            <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
            <SelectItem value="DELAYED">Gecikmiş</SelectItem>
            <SelectItem value="CANCELLED">İptal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Production List */}
      <div className="space-y-4">
        {filteredTrackings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Üretim bulunamadı
              </h3>
              <p className="text-gray-500">
                Henüz hiç üretim kaydı yok veya filtrelerinize uygun sonuç yok
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTrackings.map((tracking: any) => {
            const type = tracking.orderId ? "ORDER" : "SAMPLE";
            const statusBadge = getStatusBadge(tracking.overallStatus);
            const typeBadge = getTypeBadge(type);
            const reference =
              type === "ORDER" ? tracking.order : tracking.sample;
            const referenceNumber =
              type === "ORDER"
                ? reference?.orderNumber
                : reference?.sampleNumber;
            const collection = reference?.collection;

            return (
              <Card
                key={tracking.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/production/${tracking.id}`)
                }
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={typeBadge.className}>
                          {typeBadge.label}
                        </Badge>
                        <Badge className={statusBadge.className}>
                          {statusBadge.label}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          #{referenceNumber}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold mb-1">
                        {collection?.name || "İsimsiz Koleksiyon"}
                      </h3>
                      {collection?.modelCode && (
                        <p className="text-sm text-gray-500 mb-3">
                          Model: {collection.modelCode}
                        </p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Mevcut Aşama</p>
                          <p className="font-medium">{tracking.currentStage}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Başlangıç</p>
                          <p className="font-medium">
                            {tracking.actualStartDate ||
                            tracking.estimatedStartDate
                              ? new Date(
                                  tracking.actualStartDate ||
                                    tracking.estimatedStartDate
                                ).toLocaleDateString("tr-TR")
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Beklenen Bitiş</p>
                          <p className="font-medium">
                            {tracking.estimatedEndDate
                              ? new Date(
                                  tracking.estimatedEndDate
                                ).toLocaleDateString("tr-TR")
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">İlerleme</p>
                          <p className="font-medium">{tracking.progress}%</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Progress value={tracking.progress} className="h-2" />
                      </div>
                    </div>

                    <Button variant="ghost" size="sm">
                      Detaylar →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Results Info */}
      {filteredTrackings.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          {filteredTrackings.length} üretim gösteriliyor
          {trackings.length !== filteredTrackings.length &&
            ` (${trackings.length} toplam)`}
        </p>
      )}
    </div>
  );
}
