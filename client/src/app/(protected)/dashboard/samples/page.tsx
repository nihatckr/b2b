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
  CREATE_SAMPLE_MUTATION,
  DELETE_SAMPLE_MUTATION,
  UPDATE_SAMPLE_MUTATION,
} from "@/lib/graphql/mutations";
import {
  ALL_COLLECTIONS_QUERY,
  ALL_MANUFACTURERS_QUERY,
  ALL_SAMPLES_QUERY,
  ASSIGNED_SAMPLES_QUERY,
  MY_SAMPLES_QUERY,
} from "@/lib/graphql/queries";
import { Eye, Loader2, Package, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

// Status badge utility - DOĞRU ENUM'LAR
const getSampleStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    REQUESTED: {
      label: "Talep Edildi",
      className: "bg-blue-100 text-blue-800",
    },
    RECEIVED: {
      label: "Alındı",
      className: "bg-indigo-100 text-indigo-800",
    },
    IN_DESIGN: {
      label: "Tasarımda",
      className: "bg-purple-100 text-purple-800",
    },
    PATTERN_READY: {
      label: "Kalıp Hazır",
      className: "bg-violet-100 text-violet-800",
    },
    IN_PRODUCTION: {
      label: "Üretimde",
      className: "bg-orange-100 text-orange-800",
    },
    QUALITY_CHECK: {
      label: "Kalite Kontrolde",
      className: "bg-yellow-100 text-yellow-800",
    },
    COMPLETED: {
      label: "Tamamlandı",
      className: "bg-teal-100 text-teal-800",
    },
    REJECTED: {
      label: "Reddedildi",
      className: "bg-red-100 text-red-800",
    },
    SHIPPED: {
      label: "Kargoda",
      className: "bg-cyan-100 text-cyan-800",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

const getSampleTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    STANDARD: "Standart Numune",
    REVISION: "Revize Numune",
    CUSTOM: "Özel Tasarım",
    DEVELOPMENT: "Geliştirme",
  };
  return types[type] || type;
};

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
  shippingDate?: string;
  cargoTrackingNumber?: string;
  deliveryAddress?: string;
  createdAt: string;
  updatedAt: string;
  collection?: {
    id: number;
    name: string;
    images?: string[];
  };
  originalCollection?: {
    id: number;
    name: string;
  };
  customer?: {
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
  };
  company?: {
    id: number;
    name: string;
  };
}

interface CreateSampleFormData {
  sampleType: string;
  collectionId: string;
  customerNote: string;
  deliveryAddress: string;
  customDesignImages: string[];
  originalCollectionId: string;
  revisionRequests: string;
  manufactureId: string;
  companyId: string;
}

export default function SamplesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateSampleFormData>({
    sampleType: "STANDARD",
    collectionId: "",
    customerNote: "",
    deliveryAddress: "",
    customDesignImages: [],
    originalCollectionId: "",
    revisionRequests: "",
    manufactureId: "",
    companyId: "",
  });

  // Determine which query to use based on role
  const userRole = user?.role || "CUSTOMER";
  const isAdmin = userRole === "ADMIN";
  const isManufacturer = userRole === "MANUFACTURE";
  const isCustomer = userRole === "CUSTOMER";

  // Select appropriate query based on role
  const samplesQuery = isAdmin
    ? ALL_SAMPLES_QUERY
    : isManufacturer
    ? ASSIGNED_SAMPLES_QUERY
    : MY_SAMPLES_QUERY;

  // Queries
  const [samplesResult, reexecuteSamples] = useQuery({
    query: samplesQuery,
    variables: {
      status: statusFilter !== "all" ? statusFilter : undefined,
      sampleType: typeFilter !== "all" ? typeFilter : undefined,
      search: searchTerm || undefined,
    },
  });

  const [collectionsResult] = useQuery({
    query: ALL_COLLECTIONS_QUERY,
  });

  const [manufacturersResult] = useQuery({
    query: ALL_MANUFACTURERS_QUERY,
  });

  // Mutations
  const [, createSample] = useMutation(CREATE_SAMPLE_MUTATION);
  const [, updateSample] = useMutation(UPDATE_SAMPLE_MUTATION);
  const [, deleteSample] = useMutation(DELETE_SAMPLE_MUTATION);

  // Get samples based on query used
  const samples =
    samplesResult.data?.samples ||
    samplesResult.data?.assignedSamples ||
    samplesResult.data?.mySamples ||
    [];
  const collections = collectionsResult.data?.collections || [];
  const manufacturers = manufacturersResult.data?.allManufacturers || [];

  const handleCreateClick = () => {
    setFormData({
      sampleType: "STANDARD",
      collectionId: "",
      customerNote: "",
      deliveryAddress: "",
      customDesignImages: [],
      originalCollectionId: "",
      revisionRequests: "",
      manufactureId: "",
      companyId: "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleDetailClick = (sample: Sample) => {
    router.push(`/dashboard/samples/${sample.id}`);
  };

  const handleDeleteClick = (sample: Sample) => {
    setSelectedSample(sample);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.sampleType) {
      toast.error("Numune tipi seçilmeli");
      return;
    }

    if (formData.sampleType === "STANDARD" && !formData.collectionId) {
      toast.error("Standart numune için koleksiyon seçilmeli");
      return;
    }

    if (formData.sampleType === "REVISION" && !formData.originalCollectionId) {
      toast.error("Revize numune için orijinal koleksiyon seçilmeli");
      return;
    }

    if (formData.sampleType === "CUSTOM" && !formData.manufactureId) {
      toast.error("Özel tasarım için üretici seçilmeli");
      return;
    }

    setIsSubmitting(true);
    try {
      const input: any = {
        sampleType: formData.sampleType,
        customerNote: formData.customerNote || undefined,
        deliveryAddress: formData.deliveryAddress || undefined,
      };

      if (formData.collectionId) {
        input.collectionId = parseInt(formData.collectionId);
      }

      if (formData.sampleType === "REVISION" && formData.originalCollectionId) {
        input.originalCollectionId = parseInt(formData.originalCollectionId);
        input.revisionRequests = formData.revisionRequests || undefined;
      }

      if (
        formData.sampleType === "CUSTOM" &&
        formData.customDesignImages.length > 0
      ) {
        input.customDesignImages = formData.customDesignImages;
      }

      if (formData.manufactureId) {
        input.manufactureId = parseInt(formData.manufactureId);
      }

      if (formData.companyId) {
        input.companyId = parseInt(formData.companyId);
      }

      const result = await createSample({ input });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Numune talebi başarıyla oluşturuldu");
      setIsCreateDialogOpen(false);
      reexecuteSamples({ requestPolicy: "network-only" });
    } catch (error) {
      const err = error as Error;
      toast.error(
        err.message ||
          error.message ||
          "Numune talebi oluşturulurken bir hata oluştu"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSample) return;

    setIsSubmitting(true);
    try {
      const result = await deleteSample({ id: selectedSample.id });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Numune talebi başarıyla silindi");
      setIsDeleteDialogOpen(false);
      setSelectedSample(null);
      reexecuteSamples({ requestPolicy: "network-only" });
    } catch (error) {
      const err = error as Error;
      toast.error(
        err.message ||
          error.message ||
          "Numune talebi silinirken bir hata oluştu"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCustomerName = (sample: Sample) => {
    if (!sample.customer) return "Bilinmiyor";
    const { firstName, lastName, name } = sample.customer;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (name) return name;
    return sample.customer.email;
  };

  const getManufactureName = (sample: Sample) => {
    if (!sample.manufacture) return "Bilinmiyor";
    const { firstName, lastName, name } = sample.manufacture;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (name) return name;
    return sample.manufacture.email;
  };

  if (samplesResult.fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Numune Talepleri</h1>
          <p className="text-gray-500 mt-1">
            {isAdmin && "Tüm numune taleplerini görüntüleyin ve yönetin"}
            {isManufacturer &&
              "Size atanan numune taleplerini görüntüleyin ve yönetin"}
            {isCustomer && "Numune taleplerini görüntüleyin ve yönetin"}
          </p>
        </div>
        {/* Admin and Customer can create samples */}
        {(isAdmin || isCustomer) && (
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Numune Talebi
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Numune ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Durum Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="REQUESTED">Talep Edildi</SelectItem>
            <SelectItem value="RECEIVED">Alındı</SelectItem>
            <SelectItem value="IN_DESIGN">Tasarımda</SelectItem>
            <SelectItem value="PATTERN_READY">Kalıp Hazır</SelectItem>
            <SelectItem value="IN_PRODUCTION">Üretimde</SelectItem>
            <SelectItem value="QUALITY_CHECK">Kalite Kontrolde</SelectItem>
            <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
            <SelectItem value="REJECTED">Reddedildi</SelectItem>
            <SelectItem value="SHIPPED">Kargoda</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tip Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="STANDARD">Standart</SelectItem>
            <SelectItem value="REVISION">Revize</SelectItem>
            <SelectItem value="CUSTOM">Özel Tasarım</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Samples List */}
      {samples.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Numune bulunamadı
          </h3>
          <p className="text-gray-500 mb-4">Henüz hiç numune talebi yok</p>
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            İlk Numune Talebini Oluştur
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numune No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Koleksiyon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isManufacturer ? "Müşteri" : "Şirket/Marka"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {samples.map((sample: Sample) => (
                <tr key={sample.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sample.sampleNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getSampleTypeLabel(sample.sampleType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sample.collection?.name ||
                      sample.originalCollection?.name ||
                      "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isManufacturer ? (
                      getCustomerName(sample)
                    ) : (
                      <div>
                        <p className="font-semibold text-gray-900">
                          {sample.company?.name || "Şirket Yok"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getManufactureName(sample)}
                        </p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSampleStatusBadge(sample.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sample.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDetailClick(sample)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {/* Admin always, others only in early stages */}
                      {(isAdmin ||
                        sample.status === "REQUESTED" ||
                        sample.status === "RECEIVED" ||
                        sample.status === "REJECTED") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(sample)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Sample Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Numune Talebi</DialogTitle>
            <DialogDescription>
              Numune talebi oluşturmak için formu doldurun
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Sample Type */}
            <div className="space-y-2">
              <Label htmlFor="sampleType">
                Numune Tipi <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.sampleType}
                onValueChange={(value) =>
                  setFormData({ ...formData, sampleType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Numune tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standart Numune</SelectItem>
                  <SelectItem value="REVISION">Revize Numune</SelectItem>
                  <SelectItem value="CUSTOM">Özel Tasarım</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                {formData.sampleType === "STANDARD" &&
                  "Mevcut koleksiyondan standart numune"}
                {formData.sampleType === "REVISION" &&
                  "Mevcut ürün için değişiklik istekli numune"}
                {formData.sampleType === "CUSTOM" &&
                  "Tamamen özel tasarım numune"}
              </p>
            </div>

            {/* Collection Selection for STANDARD */}
            {formData.sampleType === "STANDARD" && (
              <div className="space-y-2">
                <Label htmlFor="collectionId">
                  Koleksiyon <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.collectionId}
                  onValueChange={(value) => {
                    const selectedCollection = collections.find(
                      (c) => c.id.toString() === value
                    );
                    setFormData({
                      ...formData,
                      collectionId: value,
                      manufactureId:
                        selectedCollection?.author?.id?.toString() || "",
                      companyId:
                        selectedCollection?.company?.id?.toString() || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Koleksiyon seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((collection) => (
                      <SelectItem
                        key={collection.id}
                        value={collection.id.toString()}
                      >
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Original Collection for REVISION */}
            {formData.sampleType === "REVISION" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="originalCollectionId">
                    Orijinal Koleksiyon <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.originalCollectionId}
                    onValueChange={(value) => {
                      const selectedCollection = collections.find(
                        (c: any) => c.id.toString() === value
                      );
                      setFormData({
                        ...formData,
                        originalCollectionId: value,
                        manufactureId:
                          selectedCollection?.author?.id?.toString() || "",
                        companyId:
                          selectedCollection?.company?.id?.toString() || "",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Revize edilecek ürünü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem
                          key={collection.id}
                          value={collection.id.toString()}
                        >
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revisionRequests">Revize İstekleri</Label>
                  <Textarea
                    id="revisionRequests"
                    value={formData.revisionRequests}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        revisionRequests: e.target.value,
                      })
                    }
                    placeholder="Ne gibi değişiklikler istiyorsunuz?"
                    rows={4}
                  />
                </div>
              </>
            )}

            {/* Manufacturer Selection for CUSTOM */}
            {(formData.sampleType === "CUSTOM" || isAdmin) && (
              <div className="space-y-2">
                <Label htmlFor="manufactureId">
                  Üretici{" "}
                  {formData.sampleType === "CUSTOM" && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                <Select
                  value={formData.manufactureId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, manufactureId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Üretici seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {manufacturers.map((manufacturer: any) => (
                      <SelectItem
                        key={manufacturer.id}
                        value={manufacturer.id.toString()}
                      >
                        {manufacturer.firstName && manufacturer.lastName
                          ? `${manufacturer.firstName} ${manufacturer.lastName}`
                          : manufacturer.name || manufacturer.email}
                        {manufacturer.company && (
                          <span className="text-xs text-gray-500 ml-2">
                            - {manufacturer.company.name}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Customer Note */}
            <div className="space-y-2">
              <Label htmlFor="customerNote">Not</Label>
              <Textarea
                id="customerNote"
                value={formData.customerNote}
                onChange={(e) =>
                  setFormData({ ...formData, customerNote: e.target.value })
                }
                placeholder="Ek notlarınız..."
                rows={3}
              />
            </div>

            {/* Delivery Address */}
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Teslimat Adresi</Label>
              <Textarea
                id="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryAddress: e.target.value })
                }
                placeholder="Numune gönderim adresi"
                rows={2}
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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Talep Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sample Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Numune Detayı</DialogTitle>
            <DialogDescription>
              {selectedSample?.sampleNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedSample && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Durum</Label>
                  <div className="mt-1">
                    {getSampleStatusBadge(selectedSample.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Tip</Label>
                  <p className="mt-1">
                    {getSampleTypeLabel(selectedSample.sampleType)}
                  </p>
                </div>
                {selectedSample.collection && (
                  <div>
                    <Label className="text-gray-500">Koleksiyon</Label>
                    <p className="mt-1">{selectedSample.collection.name}</p>
                  </div>
                )}
                <div>
                  <Label className="text-gray-500">Üretici</Label>
                  <p className="mt-1">{getManufactureName(selectedSample)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Oluşturulma Tarihi</Label>
                  <p className="mt-1">
                    {new Date(selectedSample.createdAt).toLocaleDateString(
                      "tr-TR"
                    )}
                  </p>
                </div>
                {selectedSample.productionDays && (
                  <div>
                    <Label className="text-gray-500">Tahmini Süre</Label>
                    <p className="mt-1">{selectedSample.productionDays} gün</p>
                  </div>
                )}
              </div>

              {selectedSample.customerNote && (
                <div>
                  <Label className="text-gray-500">Müşteri Notu</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded">
                    {selectedSample.customerNote}
                  </p>
                </div>
              )}

              {selectedSample.manufacturerResponse && (
                <div>
                  <Label className="text-gray-500">Üretici Yanıtı</Label>
                  <p className="mt-1 p-3 bg-blue-50 rounded">
                    {selectedSample.manufacturerResponse}
                  </p>
                </div>
              )}

              {selectedSample.cargoTrackingNumber && (
                <div>
                  <Label className="text-gray-500">Kargo Takip No</Label>
                  <p className="mt-1 font-mono">
                    {selectedSample.cargoTrackingNumber}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Kapat
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
            <AlertDialogTitle>Numune Talebini Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedSample?.sampleNumber} numaralı numune talebini silmek
              istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
