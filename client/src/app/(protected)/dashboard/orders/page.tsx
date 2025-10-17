"use client";

import { SimpleDataTable } from "@/components/DataTable";
import { StartMessageModal } from "@/components/Messages/StartMessageModal";
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
    CANCEL_ORDER_MUTATION,
    DELETE_ORDER_MUTATION,
    UPDATE_CUSTOMER_ORDER_MUTATION,
    UPDATE_ORDER_STATUS_MUTATION,
} from "@/lib/graphql/mutations";
import {
    ALL_ORDERS_QUERY,
    ASSIGNED_ORDERS_QUERY,
    MY_ORDERS_QUERY,
} from "@/lib/graphql/queries";
import {
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    Loader2,
    MessageSquare,
    Package,
    Play,
    Search,
    Trash2,
    TrendingUp,
    XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

interface Order {
  id: number;
  orderNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  estimatedProductionDate?: string;
  actualProductionStart?: string;
  productionDays?: number;
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
  customerNote?: string;
  manufacturerResponse?: string;
}

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    PENDING: { label: "Beklemede", className: "bg-blue-100 text-blue-800" },
    REVIEWED: {
      label: "İnceleniyor",
      className: "bg-purple-100 text-purple-800",
    },
    QUOTE_SENT: {
      label: "Teklif Gönderildi",
      className: "bg-yellow-100 text-yellow-800",
    },
    CONFIRMED: { label: "Onaylandı", className: "bg-green-100 text-green-800" },
    REJECTED: { label: "Reddedildi", className: "bg-red-100 text-red-800" },
    IN_PRODUCTION: {
      label: "Üretimde",
      className: "bg-orange-100 text-orange-800",
    },
    PRODUCTION_COMPLETE: {
      label: "Üretim Tamamlandı",
      className: "bg-teal-100 text-teal-800",
    },
    QUALITY_CHECK: {
      label: "Kalite Kontrolde",
      className: "bg-indigo-100 text-indigo-800",
    },
    SHIPPED: { label: "Kargoda", className: "bg-cyan-100 text-cyan-800" },
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

const getOrderProgress = (order: Order) => {
  const { status, estimatedProductionDate, actualProductionStart, createdAt } =
    order;

  if (status === "DELIVERED") return 100;
  if (status === "REJECTED" || status === "CANCELLED") return 0;

  if (
    (status === "IN_PRODUCTION" ||
      status === "PRODUCTION_COMPLETE" ||
      status === "QUALITY_CHECK") &&
    estimatedProductionDate
  ) {
    const startDate = actualProductionStart
      ? new Date(actualProductionStart)
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
    } else if (status === "PRODUCTION_COMPLETE") {
      calculatedProgress = Math.max(70, calculatedProgress);
    } else if (status === "QUALITY_CHECK") {
      calculatedProgress = Math.max(85, calculatedProgress);
    }

    return Math.floor(calculatedProgress);
  }

  const progressMap: Record<string, number> = {
    PENDING: 5,
    REVIEWED: 10,
    QUOTE_SENT: 15,
    CONFIRMED: 20,
    IN_PRODUCTION: 50,
    PRODUCTION_COMPLETE: 70,
    QUALITY_CHECK: 85,
    SHIPPED: 95,
    DELIVERED: 100,
    REJECTED: 0,
    CANCELLED: 0,
  };
  return progressMap[status] || 0;
};

const getNextStatus = (currentStatus: string): string | null => {
  const statusFlow: Record<string, string> = {
    PENDING: "CONFIRMED",
    CONFIRMED: "IN_PRODUCTION",
    IN_PRODUCTION: "PRODUCTION_COMPLETE",
    PRODUCTION_COMPLETE: "QUALITY_CHECK",
    QUALITY_CHECK: "SHIPPED",
    SHIPPED: "DELIVERED",
  };
  return statusFlow[currentStatus] || null;
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const ordersQuery = isManufacturer
    ? ASSIGNED_ORDERS_QUERY
    : isCustomer
    ? MY_ORDERS_QUERY
    : ALL_ORDERS_QUERY;

  const [{ data: ordersData, fetching }, reexecuteQuery] = useQuery({
    query: ordersQuery,
  });

  // Mutations
  const [, updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS_MUTATION);
  const [, updateCustomerOrder] = useMutation(UPDATE_CUSTOMER_ORDER_MUTATION);
  const [, cancelOrder] = useMutation(CANCEL_ORDER_MUTATION);
  const [, deleteOrder] = useMutation(DELETE_ORDER_MUTATION);

  // Edit/Cancel/Delete states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editFormData, setEditFormData] = useState({
    quantity: "",
    unitPrice: "",
    customerNote: "",
  });
  const [cancelReason, setCancelReason] = useState("");
  const [messageModal, setMessageModal] = useState<{
    open: boolean;
    orderId: number;
    orderNumber: string;
    receiverId: number;
    receiverName: string;
  } | null>(null);

  const orders: Order[] =
    ordersData?.assignedOrders ||
    ordersData?.myOrders ||
    ordersData?.orders ||
    [];

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.collection?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    inProduction: orders.filter((o) => o.status === "IN_PRODUCTION").length,
    completed: orders.filter((o) => o.status === "DELIVERED").length,
  };

  const handleQuickAction = async (orderId: number, newStatus: string) => {
    setIsSubmitting(true);
    try {
      const result = await updateOrderStatus({
        id: orderId,
        status: newStatus,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Sipariş durumu güncellendi");
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Durum güncellenirken hata";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditFormData({
      quantity: order.quantity.toString(),
      unitPrice: order.unitPrice.toString(),
      customerNote: order.customer?.email || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    setIsSubmitting(true);
    try {
      const result = await updateCustomerOrder({
        id: selectedOrder.id,
        quantity: editFormData.quantity
          ? parseInt(editFormData.quantity)
          : undefined,
        unitPrice: editFormData.unitPrice
          ? parseFloat(editFormData.unitPrice)
          : undefined,
        customerNote: editFormData.customerNote || undefined,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Sipariş başarıyla güncellendi");
      setEditDialogOpen(false);
      setSelectedOrder(null);
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Sipariş güncellenirken hata";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = (order: Order) => {
    setSelectedOrder(order);
    setCancelReason("");
    setCancelDialogOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    setIsSubmitting(true);
    try {
      const result = await cancelOrder({
        id: selectedOrder.id,
        reason: cancelReason || undefined,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Sipariş iptal edildi");
      setCancelDialogOpen(false);
      setSelectedOrder(null);
      setCancelReason("");
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Sipariş iptal edilirken hata";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (orderId: number) => {
    if (!confirm("Bu siparişi silmek istediğinizden emin misiniz?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await deleteOrder({ id: orderId });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Sipariş silindi");
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Sipariş silinirken hata";
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
          <h1 className="text-3xl font-bold">
            {isManufacturer ? "Sipariş Talepleri" : "Siparişlerim"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isManufacturer
              ? "Gelen sipariş taleplerini görüntüleyin ve yönetin"
              : "Koleksiyon kartlarından 'Şipariş Ver' butonuyla sipariş oluşturabilirsiniz"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tüm siparişler
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
            placeholder="Sipariş numarası veya koleksiyon ara..."
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
            <SelectItem value="CONFIRMED">Onaylandı</SelectItem>
            <SelectItem value="IN_PRODUCTION">Üretimde</SelectItem>
            <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <SimpleDataTable<Order>
        data={filteredOrders}
        columns={[
          {
            id: 'image',
            header: 'Görsel',
            cell: (order) => (
              <div className="relative h-16 w-16 flex-shrink-0">
                {order.collection?.images && order.collection.images.length > 0 ? (
                  <Image
                    src={order.collection.images[0].replace(/\/\//g, "/")}
                    alt={order.collection.name}
                    fill
                    className="rounded object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ),
          },
          {
            id: 'orderNumber',
            header: 'Sipariş No',
            accessorKey: 'orderNumber',
            sortable: true,
            cell: (order) => (
              <div>
                <p className="font-semibold">{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{order.collection?.name}</p>
                {order.collection?.modelCode && (
                  <p className="text-xs text-gray-400">{order.collection.modelCode}</p>
                )}
              </div>
            ),
          },
          {
            id: 'quantity',
            header: 'Miktar',
            accessorKey: 'quantity',
            sortable: true,
            cell: (order) => (
              <div>
                <p className="font-medium">{order.quantity} adet</p>
                <p className="text-xs text-gray-500">Birim: ₺{order.unitPrice.toFixed(2)}</p>
              </div>
            ),
          },
          {
            id: 'totalPrice',
            header: 'Toplam',
            accessorKey: 'totalPrice',
            sortable: true,
            cell: (order) => (
              <p className="font-semibold text-green-600">
                ₺{order.totalPrice.toFixed(2)}
              </p>
            ),
          },
          {
            id: 'status',
            header: 'Durum',
            accessorKey: 'status',
            sortable: true,
            cell: (order) => getStatusBadge(order.status),
          },
          {
            id: 'customer',
            header: isManufacturer ? 'Müşteri' : 'Üretici',
            cell: (order) => (
              <div>
                <p className="font-medium text-sm">
                  {isManufacturer
                    ? (order.customer?.firstName || order.customer?.name || order.customer?.email)
                    : (order.manufacture?.company?.name || order.manufacture?.name || order.manufacture?.email)}
                </p>
              </div>
            ),
          },
          {
            id: 'progress',
            header: 'İlerleme',
            cell: (order) => {
              const progress = getOrderProgress(order);
              if (order.status === "REJECTED" || order.status === "CANCELLED") {
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
            cell: (order) => (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {new Date(order.createdAt).toLocaleDateString('tr-TR')}
              </div>
            ),
          },
          {
            id: 'actions',
            header: 'İşlemler',
            cell: (order) => {
              const nextStatus = getNextStatus(order.status);
              return (
                <div className="flex items-center gap-1 flex-wrap">
                  {/* View Button */}
                  <Link href={`/dashboard/orders/${order.id}`}>
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
                      orderId: order.id,
                      orderNumber: order.orderNumber,
                      receiverId: isCustomer ? (order.manufacture?.id || 0) : order.customer.id,
                      receiverName: isCustomer
                        ? (order.manufacture?.company?.name || `${order.manufacture?.firstName || ''} ${order.manufacture?.lastName || ''}`.trim() || 'Üretici')
                        : (order.customer.name || `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 'Müşteri')
                    })}
                    title="Mesaj Gönder"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>

                  {/* Manufacturer Quick Actions */}
                  {isManufacturer &&
                    nextStatus &&
                    order.status !== "DELIVERED" &&
                    order.status !== "CANCELLED" && (
                      <Button
                        size="sm"
                        onClick={() => handleQuickAction(order.id, nextStatus)}
                        disabled={isSubmitting}
                        title={
                          nextStatus === "CONFIRMED" ? "Onayla" :
                          nextStatus === "IN_PRODUCTION" ? "Başlat" :
                          nextStatus === "PRODUCTION_COMPLETE" ? "Tamamla" :
                          nextStatus === "QUALITY_CHECK" ? "Kontrole Al" :
                          nextStatus === "SHIPPED" ? "Kargola" :
                          nextStatus === "DELIVERED" ? "Teslim Et" : nextStatus
                        }
                      >
                        {nextStatus === "CONFIRMED" && <CheckCircle className="h-4 w-4" />}
                        {nextStatus === "IN_PRODUCTION" && <Play className="h-4 w-4" />}
                        {nextStatus !== "CONFIRMED" &&
                          nextStatus !== "IN_PRODUCTION" && <ArrowRight className="h-4 w-4" />}
                      </Button>
                    )}

                  {/* Manufacturer Reject */}
                  {isManufacturer && order.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleQuickAction(order.id, "REJECTED")}
                      disabled={isSubmitting}
                      title="Reddet"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Customer Edit & Delete (PENDING or REVIEWED) */}
                  {isCustomer &&
                    (order.status === "PENDING" || order.status === "REVIEWED") && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(order)}
                          disabled={isSubmitting}
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(order.id)}
                          disabled={isSubmitting}
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                  {/* Customer Cancel (active orders) */}
                  {isCustomer &&
                    order.status !== "CANCELLED" &&
                    order.status !== "DELIVERED" &&
                    order.status !== "SHIPPED" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCancelClick(order)}
                        disabled={isSubmitting}
                        title="İptal"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              );
            },
          },
        ]}
        getRowKey={(order) => order.id.toString()}
        defaultSortField="createdAt"
        defaultSortDirection="desc"
        emptyMessage="Sipariş bulunamadı"
      />

      {/* Edit Order Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Siparişi Düzenle</DialogTitle>
            <DialogDescription>
              Üretici onaylamadan önce siparişinizi değiştirebilirsiniz (Sadece
              PENDING ve REVIEWED durumunda)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedOrder && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <p className="text-sm font-medium">
                  {selectedOrder.orderNumber}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.collection?.name}
                </p>
                <Badge variant="secondary">{selectedOrder.status}</Badge>
              </div>
            )}

            <div className="space-y-2">
              <Label>Miktar (Adet)</Label>
              <Input
                type="number"
                value={editFormData.quantity}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, quantity: e.target.value })
                }
                placeholder="Örn: 500"
              />
            </div>

            <div className="space-y-2">
              <Label>Hedef Birim Fiyat (₺)</Label>
              <Input
                type="number"
                step="0.01"
                value={editFormData.unitPrice}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    unitPrice: e.target.value,
                  })
                }
                placeholder="Örn: 42.50"
              />
            </div>

            {editFormData.quantity && editFormData.unitPrice && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Yeni Toplam:</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₺
                  {(
                    parseFloat(editFormData.unitPrice) *
                    parseInt(editFormData.quantity)
                  ).toFixed(2)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Not</Label>
              <Textarea
                value={editFormData.customerNote}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    customerNote: e.target.value,
                  })
                }
                placeholder="Notlarınızı güncelleyin..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button onClick={handleUpdateOrder} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Siparişi İptal Et</DialogTitle>
            <DialogDescription>
              Bu siparişi iptal etmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedOrder && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <p className="text-sm font-medium">
                  {selectedOrder.orderNumber}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.collection?.name}
                </p>
                <p className="text-sm text-gray-600">
                  Miktar: {selectedOrder.quantity} adet
                </p>
                <p className="text-sm text-gray-600">
                  Toplam: ₺{selectedOrder.totalPrice.toFixed(2)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>İptal Nedeni (Opsiyonel)</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="İptal nedeninizi belirtin..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={isSubmitting}
            >
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              İptal Et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Message Modal */}
      {messageModal && (
        <StartMessageModal
          open={messageModal.open}
          onOpenChange={(open: boolean) => !open && setMessageModal(null)}
          type="order"
          itemId={messageModal.orderId}
          itemTitle={`Sipariş: ${messageModal.orderNumber}`}
          receiverId={messageModal.receiverId}
          receiverName={messageModal.receiverName}
        />
      )}
    </div>
  );
}
