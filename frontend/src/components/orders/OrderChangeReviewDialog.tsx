"use client";

import {
  OrderChangeLogsDocument,
  OrderChangeLogStatus,
  ReviewOrderChangeDocument,
} from "@/__generated__/graphql";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  MessageSquare,
  Package,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "urql";

interface OrderChangeReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  onSuccess?: () => void;
}

// Using simplified type for OrderChangeLog to avoid GraphQL type mismatches
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrderChangeLog = any;

const changeTypeLabels = {
  QUANTITY: "Miktar Değişikliği",
  PRICE: "Fiyat Değişikliği",
  DEADLINE: "Termin Tarihi Değişikliği",
  SPECIFICATIONS: "Özellik Değişikliği",
  NOTES: "Not Değişikliği",
  OTHER: "Diğer Değişiklik",
};

const statusLabels = {
  PENDING: "Beklemede",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
  NEEDS_NEGOTIATION: "Pazarlık Gerekiyor",
};

const statusColors = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-300",
  APPROVED: "bg-green-100 text-green-800 border-green-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
  NEEDS_NEGOTIATION: "bg-blue-100 text-blue-800 border-blue-300",
};

const statusIcons = {
  PENDING: <Clock className="w-4 h-4" />,
  APPROVED: <CheckCircle2 className="w-4 h-4" />,
  REJECTED: <XCircle className="w-4 h-4" />,
  NEEDS_NEGOTIATION: <AlertCircle className="w-4 h-4" />,
};

function formatValue(changeType: string, value: any): string {
  if (value === null || value === undefined) return "-";

  switch (changeType) {
    case "QUANTITY":
      return `${value} adet`;
    case "PRICE":
      return typeof value === "object"
        ? `${value.amount} ${value.currency}`
        : `${value} TL`;
    case "DEADLINE":
      return format(new Date(value), "dd MMMM yyyy", { locale: tr });
    default:
      return String(value);
  }
}

function renderChangeComparison(log: OrderChangeLog) {
  const { changeType, previousValues, newValues } = log;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {changeType === "QUANTITY" && <Package className="w-4 h-4" />}
          {changeType === "PRICE" && <DollarSign className="w-4 h-4" />}
          {changeType === "DEADLINE" && <Calendar className="w-4 h-4" />}
          {!["QUANTITY", "PRICE", "DEADLINE"].includes(changeType) && (
            <MessageSquare className="w-4 h-4" />
          )}
          <span className="font-medium">
            {changeTypeLabels[changeType as keyof typeof changeTypeLabels] ||
              changeType}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-red-600 font-medium">
            Önceki Değer
          </Label>
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <span className="text-sm font-mono">
              {formatValue(changeType, previousValues)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-green-600 font-medium">
            Yeni Değer
          </Label>
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <span className="text-sm font-mono">
              {formatValue(changeType, newValues)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderChangeReviewDialog({
  open,
  onOpenChange,
  orderId,
  onSuccess,
}: OrderChangeReviewDialogProps) {
  const [selectedChangeLog, setSelectedChangeLog] =
    useState<OrderChangeLog | null>(null);
  const [reviewResponse, setReviewResponse] = useState("");
  const [reviewing, setReviewing] = useState(false);

  // Fetch order change logs
  const [{ data: changeLogsData, fetching }, refetchChangeLogs] = useQuery({
    query: OrderChangeLogsDocument,
    variables: { orderId },
    pause: !open,
  });

  const reviewMutation = useMutation(ReviewOrderChangeDocument);

  const { execute: submitReview } = useOptimisticMutation({
    mutation: reviewMutation,
    successMessage: "Değişiklik değerlendirmeniz kaydedildi",
    errorMessage: "Değerlendirme kaydedilirken hata oluştu",
    refetchQueries: [
      { refetch: refetchChangeLogs, requestPolicy: "network-only" },
    ],
  });

  const handleReview = async (
    status: OrderChangeLogStatus,
    triggerNegotiation: boolean = false
  ) => {
    if (!selectedChangeLog) return;

    setReviewing(true);
    try {
      await submitReview({
        changeLogId: selectedChangeLog.id,
        status,
        response: reviewResponse.trim() || undefined,
        triggerNegotiation,
      });

      setSelectedChangeLog(null);
      setReviewResponse("");
      onSuccess?.();
    } finally {
      setReviewing(false);
    }
  };

  const pendingChanges =
    changeLogsData?.orderChangeLogs?.filter(
      (log) => log.manufacturerStatus === "PENDING"
    ) || [];

  const reviewedChanges =
    changeLogsData?.orderChangeLogs?.filter(
      (log) => log.manufacturerStatus !== "PENDING"
    ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Sipariş Değişiklikleri
          </DialogTitle>
          <DialogDescription>
            Müşteri tarafından yapılan sipariş değişikliklerini inceleyin ve
            yanıtlayın
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Değişiklikler yükleniyor...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Changes */}
            {pendingChanges.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    Bekleyen Değişiklikler
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800"
                  >
                    {pendingChanges.length} adet
                  </Badge>
                </div>

                <div className="space-y-3">
                  {pendingChanges.map((log) => (
                    <div
                      key={log.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedChangeLog?.id === log.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedChangeLog(log)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              statusColors[
                                log.manufacturerStatus as keyof typeof statusColors
                              ]
                            }
                          >
                            {
                              statusIcons[
                                log.manufacturerStatus as keyof typeof statusIcons
                              ]
                            }
                            {
                              statusLabels[
                                log.manufacturerStatus as keyof typeof statusLabels
                              ]
                            }
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {format(
                              new Date(log.createdAt),
                              "dd MMM yyyy, HH:mm",
                              { locale: tr }
                            )}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {log.changedByUser?.name || "Kullanıcı"}
                        </span>
                      </div>

                      {renderChangeComparison(log)}

                      {log.changeReason && (
                        <div className="mt-3 p-2 bg-gray-50 rounded border">
                          <Label className="text-xs text-gray-600">
                            Değişiklik Nedeni:
                          </Label>
                          <p className="text-sm mt-1">{log.changeReason}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Form */}
            {selectedChangeLog && (
              <div className="border-t pt-6">
                <h4 className="text-md font-semibold mb-4">
                  Değişikliği Değerlendirin
                </h4>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="response">Yanıtınız (İsteğe Bağlı)</Label>
                    <Textarea
                      id="response"
                      placeholder="Değişiklik hakkında görüşlerinizi belirtebilirsiniz..."
                      value={reviewResponse}
                      onChange={(e) => setReviewResponse(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        handleReview("APPROVED" as OrderChangeLogStatus)
                      }
                      disabled={reviewing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Onayla
                    </Button>

                    <Button
                      onClick={() =>
                        handleReview("REJECTED" as OrderChangeLogStatus)
                      }
                      disabled={reviewing}
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reddet
                    </Button>

                    <Button
                      onClick={() =>
                        handleReview(
                          "NEEDS_NEGOTIATION" as OrderChangeLogStatus,
                          true
                        )
                      }
                      disabled={reviewing}
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Pazarlık Başlat
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Reviewed Changes */}
            {reviewedChanges.length > 0 && (
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">
                  Değerlendirilen Değişiklikler
                </h3>
                <div className="space-y-3">
                  {reviewedChanges.map((log: OrderChangeLog) => (
                    <div
                      key={log.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              statusColors[
                                log.manufacturerStatus as keyof typeof statusColors
                              ]
                            }
                          >
                            {
                              statusIcons[
                                log.manufacturerStatus as keyof typeof statusIcons
                              ]
                            }
                            {
                              statusLabels[
                                log.manufacturerStatus as keyof typeof statusLabels
                              ]
                            }
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {format(new Date(log.createdAt), "dd MMM yyyy", {
                              locale: tr,
                            })}
                          </span>
                        </div>
                        {log.manufacturerReviewedAt && (
                          <span className="text-sm text-gray-600">
                            Değerlendirildi:{" "}
                            {format(
                              new Date(log.manufacturerReviewedAt),
                              "dd MMM yyyy",
                              { locale: tr }
                            )}
                          </span>
                        )}
                      </div>

                      {renderChangeComparison(log)}

                      {log.manufacturerResponse && (
                        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                          <Label className="text-xs text-blue-600">
                            Üretici Yanıtı:
                          </Label>
                          <p className="text-sm mt-1">
                            {log.manufacturerResponse}
                          </p>
                        </div>
                      )}

                      {log.negotiationTriggered && (
                        <div className="mt-2">
                          <Badge
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Pazarlık Başlatıldı
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Changes */}
            {!fetching && changeLogsData?.orderChangeLogs?.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Bu sipariş için henüz değişiklik kaydı bulunmuyor.
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
