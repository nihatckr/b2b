"use client";

import { ProductionTimeline } from "@/components/Order/ProductionTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UPDATE_ORDER_STATUS_MUTATION } from "@/lib/graphql/mutations";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { AlertCircle, ArrowLeft, Clock, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

const TASK_DETAIL_QUERY = `
  query GetTask($id: Int!) {
    task(id: $id) {
      id
      title
      description
      status
      priority
      type
      dueDate
      completedAt
      notes
      user {
        id
        firstName
        lastName
        email
        company {
          name
        }
      }
      assignedTo {
        id
        firstName
        lastName
        email
      }
      collection {
        id
        name
        modelCode
        description
      }
      sample {
        id
        sampleNumber
        sampleType
        status
        customerNote
      }
      order {
        id
        orderNumber
        quantity
        status
        productionDays
        estimatedProductionDate
        actualProductionStart
      }
      productionTracking {
        id
        currentStage
        progress
        estimatedDeliveryDate
      }
      createdAt
      updatedAt
    }
  }
`;

interface Task {
  id: number;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  type: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  user: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    company?: {
      name: string;
    };
  };
  assignedTo?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  collection?: {
    id: number;
    name: string;
    modelCode: string;
    description: string;
  };
  sample?: {
    id: number;
    sampleNumber: string;
    sampleType: string;
    status: string;
    customerNote?: string;
  };
  order?: {
    id: number;
    orderNumber: string;
    quantity: number;
    status: string;
    productionDays?: number;
    estimatedProductionDate?: string;
    actualProductionStart?: string;
  };
  productionTracking?: {
    id: number;
    currentStage: string;
    progress: number;
    estimatedDeliveryDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const priorityColors = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-red-100 text-red-800",
};

const statusColors = {
  TODO: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabels = {
  TODO: "Yapılacak",
  IN_PROGRESS: "Devam Ediyor",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal Edildi",
};

const priorityLabels = {
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
};

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = parseInt(params.id as string);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [result, reexecuteQuery] = useQuery({
    query: TASK_DETAIL_QUERY,
    variables: { id: taskId },
  });

  const [, updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS_MUTATION);

  const task: Task | undefined = result.data?.task;
  const isLoading = result.fetching;
  const error = result.error;

  const dueDate = task?.dueDate ? new Date(task.dueDate) : null;
  const isOverdue =
    dueDate && dueDate < new Date() && task?.status !== "COMPLETED";

  const getUserName = (user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => {
    if (!user) return "-";
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email || "-";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">
              Görev detayları yüklenirken hata oluştu
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{task.title}</h1>
            <p className="text-gray-600 mt-2">Görev #{task.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={priorityColors[task.priority]}>
            {priorityLabels[task.priority]}
          </Badge>
          <Badge className={statusColors[task.status]}>
            {statusLabels[task.status]}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left - Task Details */}
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Açıklama</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {task.description || "Açıklama bulunmamaktadır."}
              </p>
            </CardContent>
          </Card>

          {/* Related Item - Sample */}
          {task.sample && (
            <Card>
              <CardHeader>
                <CardTitle>📦 İlişkili Numune</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Numune Numarası</p>
                    <p className="font-semibold">{task.sample.sampleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Numune Tipi</p>
                    <p className="font-semibold">{task.sample.sampleType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Durum</p>
                    <Badge>{task.sample.status}</Badge>
                  </div>
                  {task.sample.customerNote && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Müşteri Notu</p>
                      <p className="text-sm">{task.sample.customerNote}</p>
                    </div>
                  )}
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (task.sample?.id) {
                      router.push(`/dashboard/samples/${task.sample.id}`);
                    }
                  }}
                >
                  Numune Detaylarına Git
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Related Item - Order */}
          {task.order && (
            <Card>
              <CardHeader>
                <CardTitle>📋 İlişkili Sipariş</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Sipariş Numarası</p>
                    <p className="font-semibold">{task.order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Miktar</p>
                    <p className="font-semibold">{task.order.quantity} adet</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Durum</p>
                    <Badge>{task.order.status}</Badge>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (task.order?.id) {
                      router.push(`/dashboard/orders/${task.order.id}`);
                    }
                  }}
                >
                  Sipariş Detaylarına Git
                </Button>

                {/* Production Timeline - For Orders */}
                <ProductionTimeline
                  currentStatus={task.order.status}
                  onStatusChange={async (newStatus: string) => {
                    try {
                      setIsUpdatingStatus(true);
                      const result = await updateOrderStatus({
                        id: task.order!.id,
                        status: newStatus,
                      });

                      if (result.error) {
                        throw new Error(result.error.message);
                      }

                      toast.success("✅ Sipariş durumu güncellendi");
                      reexecuteQuery({ requestPolicy: "network-only" });
                    } catch (err) {
                      toast.error(
                        err instanceof Error
                          ? err.message
                          : "Güncelleme başarısız oldu"
                      );
                    } finally {
                      setIsUpdatingStatus(false);
                    }
                  }}
                  isManufacturer={true}
                  progress={0}
                />
              </CardContent>
            </Card>
          )}

          {/* Production Tracking */}
          {task.productionTracking && (
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Üretim İlerleme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Geçerli Aşama</p>
                  <p className="font-semibold">
                    {task.productionTracking.currentStage}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">İlerleme</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${task.productionTracking.progress}%`,
                        }}
                      />
                    </div>
                    <span className="font-semibold">
                      {task.productionTracking.progress}%
                    </span>
                  </div>
                </div>
                {task.productionTracking.estimatedDeliveryDate && (
                  <div>
                    <p className="text-sm text-gray-600">
                      Tahmini Teslimat Tarihi
                    </p>
                    <p className="font-semibold">
                      {format(
                        new Date(task.productionTracking.estimatedDeliveryDate),
                        "dd MMMM yyyy",
                        { locale: tr }
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {task.notes && (
            <Card>
              <CardHeader>
                <CardTitle>📝 Notlar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {task.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right - Info Panel */}
        <div className="space-y-6">
          {/* Timeline Info */}
          <Card>
            <CardHeader>
              <CardTitle>⏱️ Zaman</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-gray-600">Oluşturma Tarihi</p>
                <p className="font-semibold">
                  {format(new Date(task.createdAt), "dd MMM yyyy HH:mm", {
                    locale: tr,
                  })}
                </p>
              </div>

              {dueDate && (
                <div>
                  <p className="text-gray-600">Son Tarih</p>
                  <div className="flex items-center gap-2 mt-1">
                    {isOverdue ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                    <p
                      className={`font-semibold ${
                        isOverdue ? "text-red-600" : ""
                      }`}
                    >
                      {format(dueDate, "dd MMM yyyy", { locale: tr })}
                    </p>
                  </div>
                </div>
              )}

              {task.completedAt && (
                <div>
                  <p className="text-gray-600">Tamamlanma Tarihi</p>
                  <p className="font-semibold text-green-600">
                    {format(new Date(task.completedAt), "dd MMM yyyy HH:mm", {
                      locale: tr,
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* People Info */}
          <Card>
            <CardHeader>
              <CardTitle>👥 Kişiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-gray-600">Oluşturan</p>
                <p className="font-semibold">{getUserName(task.user)}</p>
                {task.user.company && (
                  <p className="text-gray-500 text-xs">
                    {task.user.company.name}
                  </p>
                )}
              </div>

              {task.assignedTo && (
                <div>
                  <p className="text-gray-600">Atanan Kişi</p>
                  <p className="font-semibold">
                    {getUserName(task.assignedTo)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Collection Info */}
          {task.collection && (
            <Card>
              <CardHeader>
                <CardTitle>📚 Koleksiyon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-600">Model Kodu</p>
                  <p className="font-semibold">{task.collection.modelCode}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ad</p>
                  <p className="font-semibold">{task.collection.name}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (!task.collection?.id) return;
                    router.push(`/dashboard/collections/${task.collection.id}`);
                  }}
                >
                  Koleksiyona Git
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
