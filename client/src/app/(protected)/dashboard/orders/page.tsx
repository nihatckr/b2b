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
  CREATE_ORDER_MUTATION,
  DELETE_ORDER_MUTATION,
  UPDATE_ORDER_STATUS_MUTATION,
} from "@/lib/graphql/mutations";
import {
  ALL_COLLECTIONS_QUERY,
  ALL_ORDERS_QUERY,
  ASSIGNED_ORDERS_QUERY,
  MY_ORDERS_QUERY,
} from "@/lib/graphql/queries";
import { Eye, Loader2, Package, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

// Status badge utility
const getOrderStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: {
      label: "Beklemede",
      className: "bg-blue-100 text-blue-800",
    },
    REVIEWED: {
      label: "İnceleniyor",
      className: "bg-purple-100 text-purple-800",
    },
    QUOTE_SENT: {
      label: "Teklif Gönderildi",
      className: "bg-yellow-100 text-yellow-800",
    },
    CONFIRMED: {
      label: "Onaylandı",
      className: "bg-green-100 text-green-800",
    },
    REJECTED: {
      label: "Reddedildi",
      className: "bg-red-100 text-red-800",
    },
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
    SHIPPED: {
      label: "Kargoda",
      className: "bg-cyan-100 text-cyan-800",
    },
    DELIVERED: {
      label: "Teslim Edildi",
      className: "bg-green-100 text-green-800",
    },
    CANCELLED: {
      label: "İptal Edildi",
      className: "bg-gray-100 text-gray-800",
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

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customerNote?: string;
  manufacturerResponse?: string;
  productionDays?: number;
  estimatedProductionDate?: string;
  createdAt: string;
  collection?: {
    id: number;
    name: string;
    images?: string[];
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
    company?: {
      id: number;
      name: string;
    };
  };
}

interface FormData {
  collectionId: string;
  quantity: string;
  unitPrice: string;
  customerNote: string;
  deliveryAddress: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    collectionId: "",
    quantity: "1",
    unitPrice: "",
    customerNote: "",
    deliveryAddress: "",
  });

  const userRole = user?.role || "CUSTOMER";
  const isAdmin = userRole === "ADMIN";
  const isManufacturer = userRole === "MANUFACTURE";
  const isCustomer = userRole === "CUSTOMER";

  const ordersQuery = isAdmin
    ? ALL_ORDERS_QUERY
    : isManufacturer
    ? ASSIGNED_ORDERS_QUERY
    : MY_ORDERS_QUERY;

  const [ordersResult, reexecuteOrders] = useQuery({
    query: ordersQuery,
    variables: {
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: searchTerm || undefined,
    },
  });

  const [collectionsResult] = useQuery({
    query: ALL_COLLECTIONS_QUERY,
  });

  const [, createOrder] = useMutation(CREATE_ORDER_MUTATION);
  const [, updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS_MUTATION);
  const [, deleteOrder] = useMutation(DELETE_ORDER_MUTATION);

  const orders =
    ordersResult.data?.orders ||
    ordersResult.data?.assignedOrders ||
    ordersResult.data?.myOrders ||
    [];
  const collections = collectionsResult.data?.collections || [];

  const handleCreateClick = () => {
    setFormData({
      collectionId: "",
      quantity: "1",
      unitPrice: "",
      customerNote: "",
      deliveryAddress: "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleDetailClick = (order: Order) => {
    router.push(`/dashboard/orders/${order.id}`);
  };

  const handleDeleteClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.collectionId) {
      toast.error("Koleksiyon seçilmeli");
      return;
    }

    if (!formData.quantity || parseInt(formData.quantity) < 1) {
      toast.error("Geçerli bir miktar girilmeli");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createOrder({
        collectionId: parseInt(formData.collectionId),
        quantity: parseInt(formData.quantity),
        unitPrice: formData.unitPrice
          ? parseFloat(formData.unitPrice)
          : undefined,
        customerNote: formData.customerNote || undefined,
        deliveryAddress: formData.deliveryAddress || undefined,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Sipariş başarıyla oluşturuldu");
      setIsCreateDialogOpen(false);
      reexecuteOrders({ requestPolicy: "network-only" });
    } catch (error: any) {
      toast.error(error.message || "Sipariş oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrder) return;

    setIsSubmitting(true);
    try {
      const result = await deleteOrder({ id: selectedOrder.id });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Sipariş başarıyla silindi");
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
      reexecuteOrders({ requestPolicy: "network-only" });
    } catch (error: any) {
      toast.error(error.message || "Sipariş silinirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCustomerName = (order: Order) => {
    if (!order.customer) return "Bilinmiyor";
    const { firstName, lastName, name } = order.customer;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (name) return name;
    return order.customer.email;
  };

  const getManufactureName = (order: Order) => {
    if (!order.manufacture) return "Bilinmiyor";
    const { firstName, lastName, name } = order.manufacture;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (name) return name;
    return order.manufacture.email;
  };

  if (ordersResult.fetching) {
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
          <h1 className="text-3xl font-bold">Siparişler</h1>
          <p className="text-gray-500 mt-1">
            {isAdmin && "Tüm siparişleri görüntüleyin ve yönetin"}
            {isManufacturer &&
              "Size atanan siparişleri görüntüleyin ve yönetin"}
            {isCustomer && "Siparişlerinizi görüntüleyin ve yönetin"}
          </p>
        </div>
        {(isAdmin || isCustomer) && (
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Sipariş
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Sipariş ara..."
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
            <SelectItem value="PENDING">Beklemede</SelectItem>
            <SelectItem value="REVIEWED">İnceleniyor</SelectItem>
            <SelectItem value="QUOTE_SENT">Teklif Gönderildi</SelectItem>
            <SelectItem value="CONFIRMED">Onaylandı</SelectItem>
            <SelectItem value="REJECTED">Reddedildi</SelectItem>
            <SelectItem value="IN_PRODUCTION">Üretimde</SelectItem>
            <SelectItem value="PRODUCTION_COMPLETE">
              Üretim Tamamlandı
            </SelectItem>
            <SelectItem value="QUALITY_CHECK">Kalite Kontrolde</SelectItem>
            <SelectItem value="SHIPPED">Kargoda</SelectItem>
            <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sipariş bulunamadı
          </h3>
          <p className="text-gray-500 mb-4">Henüz hiç sipariş yok</p>
          {(isAdmin || isCustomer) && (
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4 mr-2" />
              İlk Siparişi Oluştur
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Koleksiyon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isManufacturer ? "Müşteri" : "Şirket/Marka"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miktar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order: Order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.collection?.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isManufacturer ? (
                      getCustomerName(order)
                    ) : (
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.manufacture?.company?.name || "Şirket Yok"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getManufactureName(order)}
                        </p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.quantity} adet
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ₺{order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getOrderStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDetailClick(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(isAdmin ||
                        order.status === "PENDING" ||
                        order.status === "REVIEWED" ||
                        order.status === "REJECTED") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(order)}
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

      {/* Create Order Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Sipariş</DialogTitle>
            <DialogDescription>
              Sipariş oluşturmak için formu doldurun
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collectionId">
                Koleksiyon <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.collectionId}
                onValueChange={(value) => {
                  const selected = collections.find(
                    (c: any) => c.id.toString() === value
                  );
                  setFormData({
                    ...formData,
                    collectionId: value,
                    unitPrice: selected?.price?.toString() || "",
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Koleksiyon seçin" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection: any) => (
                    <SelectItem
                      key={collection.id}
                      value={collection.id.toString()}
                    >
                      {collection.name} - ₺{collection.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Miktar <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Birim Fiyat (₺)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, unitPrice: e.target.value })
                  }
                  placeholder="Koleksiyon fiyatı kullanılacak"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerNote">Not</Label>
              <Textarea
                id="customerNote"
                value={formData.customerNote}
                onChange={(e) =>
                  setFormData({ ...formData, customerNote: e.target.value })
                }
                placeholder="Özel talepleriniz..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Teslimat Adresi</Label>
              <Textarea
                id="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryAddress: e.target.value })
                }
                placeholder="Teslimat adresi"
                rows={2}
              />
            </div>

            {formData.quantity && formData.unitPrice && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Toplam Tutar:</span>
                  <span className="text-lg font-bold">
                    ₺
                    {(
                      parseInt(formData.quantity) *
                      parseFloat(formData.unitPrice)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
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
              Sipariş Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sipariş Detayı</DialogTitle>
            <DialogDescription>{selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Durum</Label>
                  <div className="mt-1">
                    {getOrderStatusBadge(selectedOrder.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Koleksiyon</Label>
                  <p className="mt-1">{selectedOrder.collection?.name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Miktar</Label>
                  <p className="mt-1">{selectedOrder.quantity} adet</p>
                </div>
                <div>
                  <Label className="text-gray-500">Birim Fiyat</Label>
                  <p className="mt-1">₺{selectedOrder.unitPrice.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Toplam Tutar</Label>
                  <p className="mt-1 text-lg font-bold">
                    ₺{selectedOrder.totalPrice.toFixed(2)}
                  </p>
                </div>
                {selectedOrder.productionDays && (
                  <div>
                    <Label className="text-gray-500">Üretim Süresi</Label>
                    <p className="mt-1">{selectedOrder.productionDays} gün</p>
                  </div>
                )}
              </div>

              {selectedOrder.customerNote && (
                <div>
                  <Label className="text-gray-500">Müşteri Notu</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded">
                    {selectedOrder.customerNote}
                  </p>
                </div>
              )}

              {selectedOrder.manufacturerResponse && (
                <div>
                  <Label className="text-gray-500">Üretici Yanıtı</Label>
                  <p className="mt-1 p-3 bg-blue-50 rounded">
                    {selectedOrder.manufacturerResponse}
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
            <AlertDialogTitle>Siparişi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedOrder?.orderNumber} numaralı siparişi silmek istediğinize
              emin misiniz? Bu işlem geri alınamaz.
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
