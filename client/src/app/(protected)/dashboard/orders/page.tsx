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
  CREATE_ORDER_MUTATION,
  UPDATE_ORDER_STATUS_MUTATION,
} from "@/lib/graphql/mutations";
import {
  ALL_COLLECTIONS_QUERY,
  ALL_ORDERS_QUERY,
  ASSIGNED_ORDERS_QUERY,
  MY_ORDERS_QUERY,
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    collectionId: "",
    quantity: "",
    unitPrice: "",
    customerNote: "",
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

  const ordersQuery = isManufacturer
    ? ASSIGNED_ORDERS_QUERY
    : isCustomer
    ? MY_ORDERS_QUERY
    : ALL_ORDERS_QUERY;

  const [{ data: ordersData, fetching }, reexecuteQuery] = useQuery({
    query: ordersQuery,
  });

  // Mutations
  const [, createOrder] = useMutation(CREATE_ORDER_MUTATION);
  const [, updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS_MUTATION);

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

  const handleCreate = async () => {
    if (!formData.collectionId || !formData.quantity || !formData.unitPrice) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    setIsSubmitting(true);
    try {
      const totalAmount =
        parseFloat(formData.unitPrice) * parseInt(formData.quantity);

      const result = await createOrder({
        collectionId: parseInt(formData.collectionId),
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        totalPrice: totalAmount,
        customerNote: formData.customerNote || undefined,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Sipariş başarıyla oluşturuldu");
      setIsDialogOpen(false);
      setFormData({
        collectionId: "",
        quantity: "",
        unitPrice: "",
        customerNote: "",
      });
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Sipariş oluşturulurken hata";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Siparişler</h1>
          <p className="text-muted-foreground">Tüm siparişlerinizi yönetin</p>
        </div>
        {isCustomer && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Sipariş
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

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => {
          const progress = getOrderProgress(order);
          const nextStatus = getNextStatus(order.status);

          return (
            <Card
              key={order.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-0">
                {/* Image */}
                {order.collection?.images &&
                  order.collection.images.length > 0 && (
                    <div className="relative h-48 w-full bg-gray-100">
                      <Image
                        src={order.collection.images[0].replace(/\/\//g, "/")}
                        alt={order.collection.name}
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
                        {order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order.collection?.name}
                      </p>
                      {order.collection?.modelCode && (
                        <p className="text-xs text-gray-400">
                          {order.collection.modelCode}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Miktar</p>
                      <p className="font-medium">{order.quantity} adet</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Toplam</p>
                      <p className="font-medium text-green-600">
                        ₺{order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {order.status !== "REJECTED" &&
                    order.status !== "CANCELLED" && (
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
                      href={`/dashboard/orders/${order.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Detay
                      </Button>
                    </Link>

                    {isManufacturer &&
                      nextStatus &&
                      order.status !== "DELIVERED" &&
                      order.status !== "CANCELLED" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleQuickAction(order.id, nextStatus)
                          }
                          disabled={isSubmitting}
                          className="flex-1"
                        >
                          {nextStatus === "CONFIRMED" && (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          {nextStatus === "IN_PRODUCTION" && (
                            <Play className="h-4 w-4 mr-2" />
                          )}
                          {nextStatus !== "CONFIRMED" &&
                            nextStatus !== "IN_PRODUCTION" && (
                              <ArrowRight className="h-4 w-4 mr-2" />
                            )}
                          {nextStatus === "CONFIRMED" && "Onayla"}
                          {nextStatus === "IN_PRODUCTION" && "Başlat"}
                          {nextStatus === "PRODUCTION_COMPLETE" && "Tamamla"}
                          {nextStatus === "QUALITY_CHECK" && "Kontrole Al"}
                          {nextStatus === "SHIPPED" && "Kargola"}
                          {nextStatus === "DELIVERED" && "Teslim Et"}
                        </Button>
                      )}

                    {isManufacturer && order.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleQuickAction(order.id, "REJECTED")}
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

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Sipariş bulunamadı</p>
          </CardContent>
        </Card>
      )}

      {/* Create Order Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Sipariş Oluştur</DialogTitle>
            <DialogDescription>
              Koleksiyon seçin ve sipariş detaylarını girin
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
                  placeholder="Örn: 100"
                />
              </div>

              <div className="space-y-2">
                <Label>Birim Fiyat (₺)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, unitPrice: e.target.value })
                  }
                  placeholder="Örn: 42.50"
                />
              </div>
            </div>

            {formData.quantity && formData.unitPrice && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Toplam Tutar:</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₺
                  {(
                    parseFloat(formData.unitPrice) * parseInt(formData.quantity)
                  ).toFixed(2)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Not (Opsiyonel)</Label>
              <Textarea
                value={formData.customerNote}
                onChange={(e) =>
                  setFormData({ ...formData, customerNote: e.target.value })
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
              Sipariş Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
