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
import { Textarea } from "@/components/ui/textarea";
import {
    APPROVE_SAMPLE_MUTATION
} from "@/lib/graphql/mutations";
import {
    ASSIGNED_SAMPLES_QUERY
} from "@/lib/graphql/queries";
import {
    AlertCircle,
    CheckCircle,
    Loader2,
    XCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

interface Sample {
  id: number;
  sampleNumber: string;
  sampleType: string;
  status: string;
  customerNote?: string;
  productionDays?: number;
  estimatedProductionDate?: string;
  createdAt: string;
  collection?: {
    id: number;
    name: string;
    images?: string;
  };
  customer: {
    id: number;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    PENDING_APPROVAL: {
      label: "Onay Bekliyor",
      className: "bg-yellow-100 text-yellow-800",
    },
    REQUESTED: { label: "Onaylandı", className: "bg-blue-100 text-blue-800" },
    RECEIVED: { label: "Alındı", className: "bg-indigo-100 text-indigo-800" },
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
      className: "bg-amber-100 text-amber-800",
    },
    COMPLETED: {
      label: "Tamamlandı",
      className: "bg-teal-100 text-teal-800",
    },
    REJECTED: { label: "Reddedildi", className: "bg-red-100 text-red-800" },
    SHIPPED: {
      label: "Kargoya Verildi",
      className: "bg-cyan-100 text-cyan-800",
    },
  };

  const statusInfo = config[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };
  return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
};

export default function SampleRequestsPage() {
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [estimatedDays, setEstimatedDays] = useState("");
  const [manufacturerNote, setManufacturerNote] = useState("");
  const [isApproving, setIsApproving] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(
    "PENDING_APPROVAL"
  );

  // Fetch assigned samples
  const [{ data, fetching, error }, refetchSamples] = useQuery({
    query: ASSIGNED_SAMPLES_QUERY,
    variables: {
      status: filterStatus || undefined,
    },
  });

  // Approve sample mutation
  const [, approveSample] = useMutation(APPROVE_SAMPLE_MUTATION);

  const handleApproveClick = (sample: Sample, approve: boolean) => {
    setSelectedSample(sample);
    setIsApproving(approve);
    setEstimatedDays("");
    setManufacturerNote("");
    setApprovalDialogOpen(true);
  };

  const handleApprovalSubmit = async () => {
    if (!selectedSample) return;

    if (isApproving && !estimatedDays) {
      toast.error("Lütfen tahmini üretim süresini girin");
      return;
    }

    try {
      const result = await approveSample({
        id: selectedSample.id,
        approve: isApproving,
        manufacturerNote: manufacturerNote || undefined,
        estimatedDays: isApproving ? parseInt(estimatedDays) : undefined,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success(
        isApproving
          ? "Numune talebi onaylandı! ✅"
          : "Numune talebi reddedildi"
      );
      setApprovalDialogOpen(false);
      refetchSamples({ requestPolicy: "network-only" });
    } catch (error: any) {
      toast.error(error.message || "İşlem başarısız");
    }
  };

  const getCustomerName = (customer: Sample["customer"]) => {
    if (customer.name) return customer.name;
    if (customer.firstName && customer.lastName)
      return `${customer.firstName} ${customer.lastName}`;
    if (customer.firstName) return customer.firstName;
    return customer.email;
  };

  const pendingSamples =
    data?.assignedSamples?.filter(
      (s: Sample) => s.status === "PENDING_APPROVAL"
    ) || [];
  const approvedSamples =
    data?.assignedSamples?.filter((s: Sample) => s.status !== "PENDING_APPROVAL" && s.status !== "REJECTED") ||
    [];
  const rejectedSamples =
    data?.assignedSamples?.filter((s: Sample) => s.status === "REJECTED") || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Numune Talepleri</h1>
        <p className="text-gray-600">
          Size atanan numune taleplerini görüntüleyin ve onaylayın
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={!filterStatus ? "default" : "ghost"}
          onClick={() => setFilterStatus(undefined)}
          className="rounded-b-none"
        >
          Tümü ({data?.assignedSamples?.length || 0})
        </Button>
        <Button
          variant={filterStatus === "PENDING_APPROVAL" ? "default" : "ghost"}
          onClick={() => setFilterStatus("PENDING_APPROVAL")}
          className="rounded-b-none"
        >
          Onay Bekleyenler ({pendingSamples.length})
        </Button>
        <Button
          variant={filterStatus === "REQUESTED" ? "default" : "ghost"}
          onClick={() => setFilterStatus("REQUESTED")}
          className="rounded-b-none"
        >
          Onaylandı ({approvedSamples.length})
        </Button>
        <Button
          variant={filterStatus === "REJECTED" ? "default" : "ghost"}
          onClick={() => setFilterStatus("REJECTED")}
          className="rounded-b-none"
        >
          Reddedilen ({rejectedSamples.length})
        </Button>
      </div>

      {/* Loading State */}
      {fetching && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>Hata: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample List */}
      {!fetching && !error && (
        <div className="grid gap-4">
          {data?.assignedSamples?.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">
                  Henüz numune talebi bulunmuyor
                </p>
              </CardContent>
            </Card>
          ) : (
            data?.assignedSamples?.map((sample: Sample) => {
              const images = sample.collection?.images
                ? JSON.parse(sample.collection.images)
                : [];
              const firstImage = images[0];

              return (
                <Card key={sample.id} className="hover:shadow-md transition">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Image */}
                      {firstImage && (
                        <div className="flex-shrink-0">
                          <img
                            src={firstImage}
                            alt={sample.collection?.name}
                            className="w-24 h-24 object-cover rounded"
                          />
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {sample.collection?.name || "Özel Tasarım"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {sample.sampleNumber}
                            </p>
                          </div>
                          {getStatusBadge(sample.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Müşteri:</span>{" "}
                            <span className="font-medium">
                              {getCustomerName(sample.customer)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Talep Tarihi:</span>{" "}
                            <span className="font-medium">
                              {new Date(sample.createdAt).toLocaleDateString(
                                "tr-TR"
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tip:</span>{" "}
                            <span className="font-medium">
                              {sample.sampleType === "STANDARD"
                                ? "Standart"
                                : sample.sampleType === "REVISION"
                                ? "Revize"
                                : "Özel"}
                            </span>
                          </div>
                          {sample.productionDays && (
                            <div>
                              <span className="text-gray-600">
                                Üretim Süresi:
                              </span>{" "}
                              <span className="font-medium">
                                {sample.productionDays} gün
                              </span>
                            </div>
                          )}
                        </div>

                        {sample.customerNote && (
                          <div className="bg-gray-50 p-3 rounded text-sm">
                            <p className="text-gray-600 font-medium mb-1">
                              Müşteri Notu:
                            </p>
                            <p>{sample.customerNote}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {sample.status === "PENDING_APPROVAL" && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => handleApproveClick(sample, true)}
                              className="flex-1"
                              variant="default"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Onayla
                            </Button>
                            <Button
                              onClick={() => handleApproveClick(sample, false)}
                              className="flex-1"
                              variant="destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reddet
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isApproving ? "Numune Talebini Onayla" : "Numune Talebini Reddet"}
            </DialogTitle>
            <DialogDescription>
              {isApproving
                ? "Lütfen tahmini üretim süresini belirtin ve isteğe bağlı bir not ekleyin."
                : "İsteğe bağlı olarak red sebebini belirtin."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isApproving && (
              <div>
                <Label htmlFor="estimatedDays">
                  Tahmini Üretim Süresi (Gün) *
                </Label>
                <Input
                  id="estimatedDays"
                  type="number"
                  min="1"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  placeholder="Örn: 15"
                />
              </div>
            )}

            <div>
              <Label htmlFor="manufacturerNote">
                Not {!isApproving && "(Opsiyonel)"}
              </Label>
              <Textarea
                id="manufacturerNote"
                value={manufacturerNote}
                onChange={(e) => setManufacturerNote(e.target.value)}
                placeholder={
                  isApproving
                    ? "Üretim ile ilgili notlarınız..."
                    : "Red sebebinizi açıklayın..."
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
            >
              İptal
            </Button>
            <Button
              onClick={handleApprovalSubmit}
              variant={isApproving ? "default" : "destructive"}
            >
              {isApproving ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Onayla
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reddet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
