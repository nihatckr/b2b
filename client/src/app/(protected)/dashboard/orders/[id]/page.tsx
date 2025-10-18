"use client";

import { ProductionTimeline } from "@/components/Order/ProductionTimeline";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  MARK_MESSAGE_READ_MUTATION,
  MY_MESSAGES_QUERY,
  SEND_MESSAGE_MUTATION,
} from "@/lib/graphql/message-operations";
import {
  APPROVE_CUSTOMER_QUOTE_MUTATION,
  REJECT_CUSTOMER_QUOTE_MUTATION,
  SUBMIT_CUSTOMER_QUOTE_MUTATION,
  UPDATE_ORDER_MUTATION,
  UPDATE_ORDER_STATUS_MUTATION,
} from "@/lib/graphql/mutations";
import { ORDER_BY_ID_QUERY } from "@/lib/graphql/queries";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Edit,
  Loader2,
  MessageSquare,
  Package,
  Send,
  User
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

const getOrderStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: { label: "Beklemede", className: "bg-blue-100 text-blue-800" },
    REVIEWED: {
      label: "İnceleniyor",
      className: "bg-purple-100 text-purple-800",
    },
    QUOTE_SENT: {
      label: "Teklif Gönderildi",
      className: "bg-yellow-100 text-yellow-800",
    },
    CUSTOMER_QUOTE_SENT: {
      label: "Müşteri Teklifi",
      className: "bg-amber-100 text-amber-800",
    },
    MANUFACTURER_REVIEWING_QUOTE: {
      label: "Teklif İnceleniyor",
      className: "bg-violet-100 text-violet-800",
    },
    CONFIRMED: { label: "Onaylandı", className: "bg-green-100 text-green-800" },
    REJECTED: { label: "Reddedildi", className: "bg-red-100 text-red-800" },
    REJECTED_BY_CUSTOMER: {
      label: "Müşteri Reddetti",
      className: "bg-rose-100 text-rose-800",
    },
    REJECTED_BY_MANUFACTURER: {
      label: "Üretici Reddetti",
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

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return <Badge className={config.className}>{config.label}</Badge>;
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = params.id as string;

  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCustomerQuoteDialogOpen, setIsCustomerQuoteDialogOpen] = useState(false);
  const [isManufacturerReviewDialogOpen, setIsManufacturerReviewDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [editFormData, setEditFormData] = useState({
    status: "",
    manufacturerResponse: "",
    productionDays: "",
    estimatedProductionDate: "",
    unitPrice: "",
  });

  const [customerQuoteData, setCustomerQuoteData] = useState({
    quotedPrice: "",
    quoteDays: "",
    quoteNote: "",
    quoteType: "STANDARD", // "STANDARD" or "REVISION"
  });

  const [manufacturerReviewNote, setManufacturerReviewNote] = useState("");

  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: ORDER_BY_ID_QUERY,
    variables: { id: parseInt(orderId) },
  });

  const [, updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS_MUTATION);
  const [, updateOrder] = useMutation(UPDATE_ORDER_MUTATION);
  const [, submitCustomerQuote] = useMutation(SUBMIT_CUSTOMER_QUOTE_MUTATION);
  const [, approveCustomerQuote] = useMutation(APPROVE_CUSTOMER_QUOTE_MUTATION);
  const [, rejectCustomerQuote] = useMutation(REJECT_CUSTOMER_QUOTE_MUTATION);
  const [, sendMessage] = useMutation(SEND_MESSAGE_MUTATION);
  const [, markAsRead] = useMutation(MARK_MESSAGE_READ_MUTATION);

  // Get messages for this order
  const [{ data: messagesData, fetching: messagesFetching }, refetchMessages] = useQuery({
    query: MY_MESSAGES_QUERY,
    variables: {
      filter: { orderId: parseInt(orderId) },
    },
    requestPolicy: "network-only",
  });

  const messages = messagesData?.myMessages || [];

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Üretici kontrolü: Sadece manufacturer rolüne sahip olanlar için true
  const isManufacturer =
    user?.role === "MANUFACTURE" ||
    user?.role === "COMPANY_OWNER" ||
    user?.role === "COMPANY_EMPLOYEE";

  // Müşteri kontrolü: Müşteri rolüne sahip olanlar için true
  const isCustomer =
    user?.role === "CUSTOMER" ||
    user?.role === "INDIVIDUAL_CUSTOMER";

  if (fetching) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">
              {error?.message || "Sipariş bulunamadı"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const order = data.order;

  // GERÇEK KONTROL: Bu siparişteki rolüme göre karar ver
  const isCurrentUserManufacturer = user?.id === order.manufacture?.id;
  const isCurrentUserCustomer = user?.id === order.customer?.id;

  // Sadece bu siparişteki üretici ise düzenleyebilir
  const canEditOrderStatus = isCurrentUserManufacturer;

  const getCustomerName = () => {
    if (!order.customer) return "Bilinmiyor";
    const { firstName, lastName, name } = order.customer;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (name) return name;
    return order.customer.email;
  };

  const getManufactureName = () => {
    if (!order.manufacture) return "Bilinmiyor";
    const { firstName, lastName, name } = order.manufacture;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (name) return name;
    return order.manufacture.email;
  };

  const getOrderProgress = () => {
    if (!order) return 0;

    const {
      status,
      estimatedProductionDate,
      actualProductionStart,
      createdAt,
    } = order;

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

  const handleStatusAction = async (newStatus: string) => {
    if (!order) return;

    setIsSubmitting(true);
    try {
      const result = await updateOrderStatus({
        id: order.id,
        status: newStatus,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Sipariş durumu güncellendi");
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Durum güncellenirken bir hata oluştu";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    if (!order) return;
    setEditFormData({
      status: order.status,
      manufacturerResponse: order.manufacturerResponse || "",
      productionDays: order.productionDays?.toString() || "",
      estimatedProductionDate: order.estimatedProductionDate
        ? new Date(order.estimatedProductionDate).toISOString().split("T")[0]
        : "",
      unitPrice: "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmitEdit = async () => {
    if (!order) return;

    setIsSubmitting(true);
    try {
      const result = await updateOrder({
        id: order.id,
        status: editFormData.status || undefined,
        manufacturerResponse: editFormData.manufacturerResponse || undefined,
        productionDays: editFormData.productionDays
          ? parseInt(editFormData.productionDays)
          : undefined,
        estimatedProductionDate: editFormData.estimatedProductionDate
          ? new Date(editFormData.estimatedProductionDate).toISOString()
          : undefined,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Sipariş başarıyla güncellendi");
      setIsEditDialogOpen(false);
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Sipariş güncellenirken bir hata oluştu";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !order || isSendingMessage) return;

    setIsSendingMessage(true);

    const receiverId = isManufacturer ? order.customer.id : order.manufacture?.id;
    if (!receiverId) {
      toast.error("Alıcı bulunamadı");
      setIsSendingMessage(false);
      return;
    }

    const input = {
      content: messageContent,
      type: "order",
      orderId: order.id,
      receiverId: receiverId,
    };

    const result = await sendMessage({ input });

    if (!result.error) {
      setMessageContent("");
      refetchMessages({ requestPolicy: "network-only" });
      toast.success("Mesaj gönderildi");
    } else {
      toast.error("Mesaj gönderilemedi: " + result.error.message);
    }

    setIsSendingMessage(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
          <p className="text-gray-500 mt-1">Sipariş Detayları</p>
        </div>
        <div className="flex items-center gap-2">
          {getOrderStatusBadge(order.status)}

          {/* Manufacturer Edit Button */}
          {isManufacturer &&
            order.status !== "DELIVERED" &&
            order.status !== "CANCELLED" && (
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Collection Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Koleksiyon Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.collection && (
              <div className="flex gap-4">
                {order.collection.images &&
                  order.collection.images.length > 0 && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border flex-shrink-0">
                      <Image
                        src={order.collection.images[0].replace(/\/\//g, "/")}
                        alt={order.collection.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">
                    {order.collection.name}
                  </h3>
                  {order.collection.description && (
                    <p className="text-sm text-gray-500 mb-2">
                      {order.collection.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Fiyat:</span>
                      <span className="ml-2 font-medium">
                        ₺{order.collection.price?.toFixed(2) || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Sipariş Özeti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Miktar:</span>
              <span className="font-medium">{order.quantity} adet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Birim Fiyat:</span>
              <span className="font-medium">₺{order.unitPrice.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold">Toplam:</span>
              <span className="text-xl font-bold text-green-600">
                ₺{order.totalPrice.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manufacturer Actions for REVIEWED Status */}
      {isCurrentUserManufacturer && order.status === "REVIEWED" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">
              📋 Sipariş İnceleme - Aksiyon Gerekli
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-blue-800">
              Siparişi incelemeyi tamamladınız. Şimdi müşteriye teklif gönderebilir
              veya revize teklif sunabilirsiniz.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={async () => {
                  if (!confirm("Teklifi müşteriye göndermek istediğinizden emin misiniz?")) {
                    return;
                  }
                  setIsSubmitting(true);
                  try {
                    const result = await updateOrderStatus({
                      id: order.id,
                      status: "QUOTE_SENT",
                    });
                    if (result.error) {
                      throw new Error(result.error.message);
                    }
                    toast.success("✅ Teklif müşteriye gönderildi!");
                    reexecuteQuery({ requestPolicy: "network-only" });
                  } catch (error: any) {
                    toast.error(error.message || "Hata oluştu");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "💰 Teklif Gönder (Onaya Gönder)"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setActionType("SEND_REVISION");
                  setIsActionDialogOpen(true);
                }}
                disabled={isSubmitting}
                className="w-full"
              >
                📝 Revize Teklif Sun
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Actions for QUOTE_SENT Status */}
      {isCurrentUserCustomer && order.status === "QUOTE_SENT" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900">
              💰 Üretici Teklifi Geldi - Aksiyon Gerekli
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <h4 className="font-semibold mb-2">Üretici Teklifi:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Birim Fiyat:</span>
                  <p className="font-bold text-lg">₺{order.unitPrice.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Üretim Süresi:</span>
                  <p className="font-bold text-lg">{order.productionDays || "-"} gün</p>
                </div>
              </div>
              {order.manufacturerResponse && (
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Not:</span>
                  <p className="text-sm mt-1">{order.manufacturerResponse}</p>
                </div>
              )}
            </div>
            <p className="text-sm text-amber-800">
              Üreticinin teklifini inceleyebilir, aynen kabul edebilir veya revize ederek gönderebilirsiniz.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  setCustomerQuoteData({
                    quotedPrice: order.unitPrice.toString(),
                    quoteDays: order.productionDays?.toString() || "",
                    quoteNote: "",
                    quoteType: "STANDARD", // İlk başta standart, değişiklik olursa revize
                  });
                  setIsCustomerQuoteDialogOpen(true);
                }}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                ✅ Teklifi İncele ve Gönder
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!confirm("Teklifi reddetmek istediğinizden emin misiniz?")) return;
                  setIsSubmitting(true);
                  try {
                    const result = await updateOrderStatus({
                      id: order.id,
                      status: "REJECTED_BY_CUSTOMER",
                      note: "Müşteri teklifi uygun bulmadı",
                    });
                    if (result.error) {
                      throw new Error(result.error.message);
                    }
                    toast.success("Teklif reddedildi");
                    reexecuteQuery({ requestPolicy: "network-only" });
                  } catch (error: any) {
                    toast.error(error.message || "Hata oluştu");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="w-full"
              >
                ❌ Teklifi Reddet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manufacturer Actions for CUSTOMER_QUOTE_SENT Status */}
      {isCurrentUserManufacturer && order.status === "CUSTOMER_QUOTE_SENT" && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="text-violet-900">
              💼 Müşteri Teklifi Geldi - Aksiyon Gerekli
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-violet-200">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-semibold">Müşteri Teklifi:</h4>
                <Badge className="bg-violet-100 text-violet-800">
                  {order.customerQuoteType === "STANDARD" ? "Standart Teklif" : "Revize Teklif"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Teklif Edilen Fiyat:</span>
                  <p className="font-bold text-lg">₺{order.customerQuotedPrice?.toFixed(2) || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-600">İstenen Süre:</span>
                  <p className="font-bold text-lg">{order.customerQuoteDays || "-"} gün</p>
                </div>
              </div>
              {order.customerQuoteNote && (
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Müşteri Notu:</span>
                  <p className="text-sm mt-1 italic">{order.customerQuoteNote}</p>
                </div>
              )}
            </div>
            <p className="text-sm text-violet-800">
              {order.customerQuoteType === "REVISION"
                ? "Müşteri revize teklif gönderdi. Kabul edebilir, yeni revize teklif sunabilir veya reddedebilirsiniz."
                : "Müşteri standart teklifinizi kabul etti. Onaylayarak üretimi başlatabilir veya reddedebilirsiniz."}
            </p>
            <div className={`grid grid-cols-1 ${order.customerQuoteType === "REVISION" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-3`}>
              <Button
                onClick={() => setIsManufacturerReviewDialogOpen(true)}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                ✅ Kabul Et - Üretimi Başlat
              </Button>

              {/* Revize teklif butonu sadece müşteri REVISION gönderdiyse göster */}
              {order.customerQuoteType && order.customerQuoteType === "REVISION" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setActionType("SEND_REVISION");
                    setIsActionDialogOpen(true);
                  }}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  📝 Revize Teklif Sun
                </Button>
              )}

              <Button
                variant="destructive"
                onClick={async () => {
                  const reason = prompt("Ret sebebini belirtin:");
                  if (!reason) return;

                  setIsSubmitting(true);
                  try {
                    const result = await rejectCustomerQuote({
                      orderId: order.id,
                      rejectionReason: reason,
                    });
                    if (result.error) {
                      throw new Error(result.error.message);
                    }
                    toast.success("❌ Müşteri teklifi reddedildi");
                    reexecuteQuery({ requestPolicy: "network-only" });
                  } catch (error: any) {
                    toast.error(error.message || "Hata oluştu");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="w-full"
              >
                ❌ Reddet - Sipariş İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Production Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sipariş Durumu
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-8">
          <ProductionTimeline
            currentStatus={order.status}
            onStatusChange={
              canEditOrderStatus
                ? (newStatus) => handleStatusAction(newStatus)
                : undefined
            }
            isManufacturer={canEditOrderStatus}
            progress={getOrderProgress()}
          />

        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Müşteri Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">İsim</p>
              <p className="font-medium">{getCustomerName()}</p>
            </div>
            {order.customer?.email && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.customer.email}</p>
              </div>
            )}
            {order.customer?.phone && (
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p className="font-medium">{order.customer.phone}</p>
              </div>
            )}
            {order.company?.name && (
              <div>
                <p className="text-sm text-gray-500">Şirket</p>
                <p className="font-medium">{order.company.name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manufacturer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Üretici Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">İsim</p>
              <p className="font-medium">{getManufactureName()}</p>
            </div>
            {order.manufacture?.email && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.manufacture.email}</p>
              </div>
            )}
            {order.manufacture?.phone && (
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p className="font-medium">{order.manufacture.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Messages Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mesajlaşma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Messages List */}
            <div className="border rounded-lg">
              <ScrollArea className="h-[400px] p-4">
                {messagesFetching ? (
                  <div className="text-center text-sm text-gray-500">Yükleniyor...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-sm text-gray-500 py-8">
                    Henüz mesaj yok. İlk mesajı siz gönderin!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((msg: any) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            {!isMe && (
                              <p className="mb-1 text-xs font-medium">
                                {msg.sender.firstName} {msg.sender.lastName}
                              </p>
                            )}
                            <p className="text-sm">{msg.content}</p>
                            <p className={`mt-1 text-xs ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: tr })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Mesajınızı yazın..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isSendingMessage}
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isSendingMessage || !messageContent.trim()}
                size="icon"
                className="h-auto"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Production Timeline */}
        {order.productionDays && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Üretim Takvimi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Üretim Süresi</p>
                <p className="font-medium">{order.productionDays} gün</p>
              </div>
              {order.estimatedProductionDate && (
                <div>
                  <p className="text-sm text-gray-500">Tahmini Bitiş</p>
                  <p className="font-medium">
                    {new Date(order.estimatedProductionDate).toLocaleDateString(
                      "tr-TR"
                    )}
                  </p>
                </div>
              )}
              {order.actualProductionStart && (
                <div>
                  <p className="text-sm text-gray-500">Fiili Başlangıç</p>
                  <p className="font-medium">
                    {new Date(order.actualProductionStart).toLocaleDateString(
                      "tr-TR"
                    )}
                  </p>
                </div>
              )}
              {order.actualProductionEnd && (
                <div>
                  <p className="text-sm text-gray-500">Fiili Bitiş</p>
                  <p className="font-medium">
                    {new Date(order.actualProductionEnd).toLocaleDateString(
                      "tr-TR"
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.customerNote && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Müşteri Notu:
                </p>
                <p className="text-sm p-3 bg-blue-50 rounded-lg">
                  {order.customerNote}
                </p>
              </div>
            )}
            {order.manufacturerResponse && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Üretici Yanıtı:
                </p>
                <p className="text-sm p-3 bg-green-50 rounded-lg">
                  {order.manufacturerResponse}
                </p>
              </div>
            )}
            {!order.customerNote && !order.manufacturerResponse && (
              <p className="text-sm text-gray-500 italic">Henüz not yok</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shipping Info */}
      {(order.deliveryAddress ||
        order.cargoTrackingNumber ||
        order.shippingDate) && (
        <Card>
          <CardHeader>
            <CardTitle>Teslimat Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.deliveryAddress && (
              <div>
                <p className="text-sm text-gray-500">Teslimat Adresi</p>
                <p className="font-medium">{order.deliveryAddress}</p>
              </div>
            )}
            {order.cargoTrackingNumber && (
              <div>
                <p className="text-sm text-gray-500">Kargo Takip No</p>
                <p className="font-medium font-mono">
                  {order.cargoTrackingNumber}
                </p>
              </div>
            )}
            {order.shippingDate && (
              <div>
                <p className="text-sm text-gray-500">Kargo Tarihi</p>
                <p className="font-medium">
                  {new Date(order.shippingDate).toLocaleDateString("tr-TR")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Dialog for Quote/Revision */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionType === "SEND_QUOTE"
                ? "💰 Teklif Gönder"
                : "📝 Revize Teklif"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "SEND_QUOTE"
                ? "Müşteriye teklif gönderin ve onayına sunun"
                : "Müşteriye revize teklif gönderin"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {actionType === "SEND_REVISION" && (
              <div className="space-y-2">
                <Label>Revize Birim Fiyat (₺) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Örn: 50.00"
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      unitPrice: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Üretim Süresi (Gün) *</Label>
              <Input
                type="number"
                min="1"
                placeholder="Örn: 30"
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    productionDays: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Mesajınız *</Label>
              <Textarea
                placeholder={
                  actionType === "SEND_QUOTE"
                    ? "Siparişinizi kabul ediyoruz. Üretim süresi..."
                    : "Revize teklifimiz: Fiyat ve süre değişiklikleri..."
                }
                rows={4}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    manufacturerResponse: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsActionDialogOpen(false);
                setActionType("");
              }}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              onClick={async () => {
                // Validation
                if (!editFormData.productionDays || !editFormData.manufacturerResponse) {
                  toast.error("Lütfen tüm alanları doldurun");
                  return;
                }

                if (actionType === "SEND_REVISION" && !editFormData.unitPrice) {
                  toast.error("Lütfen revize fiyat girin");
                  return;
                }

                setIsSubmitting(true);
                try {
                  // Eğer CUSTOMER_QUOTE_SENT durumundaysa, önce müşteri teklifini reddet
                  if (order.status === "CUSTOMER_QUOTE_SENT") {
                    const rejectResult = await rejectCustomerQuote({
                      orderId: order.id,
                      rejectionReason: "Üretici revize teklif sunuyor",
                    });

                    if (rejectResult.error) {
                      throw new Error(rejectResult.error.message);
                    }
                  }

                  // Revize teklif için fiyat güncellemesi
                  const updateData: any = {
                    id: order.id,
                    status: "QUOTE_SENT",
                    note: editFormData.manufacturerResponse,
                    estimatedDays: parseInt(editFormData.productionDays),
                  };

                  if (actionType === "SEND_REVISION" && editFormData.unitPrice) {
                    updateData.quotedPrice = parseFloat(editFormData.unitPrice);
                  }

                  const result = await updateOrderStatus(updateData);

                  if (result.error) {
                    throw new Error(result.error.message);
                  }

                  toast.success(
                    actionType === "SEND_QUOTE"
                      ? "✅ Teklif başarıyla gönderildi"
                      : "✅ Revize teklif gönderildi"
                  );
                  setIsActionDialogOpen(false);
                  setActionType("");
                  setEditFormData({
                    status: "",
                    manufacturerResponse: "",
                    productionDays: "",
                    estimatedProductionDate: "",
                    unitPrice: "",
                  });
                  reexecuteQuery({ requestPolicy: "network-only" });
                } catch (error: unknown) {
                  const errorMessage =
                    error instanceof Error
                      ? error.message
                      : "Teklif gönderilirken hata oluştu";
                  toast.error(errorMessage);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Quote Dialog */}
      <Dialog open={isCustomerQuoteDialogOpen} onOpenChange={setIsCustomerQuoteDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>💰 Teklifi İncele ve Gönder</DialogTitle>
            <DialogDescription>
              Üreticinin teklifini olduğu gibi kabul edebilir veya fiyat/süre değiştirerek revize teklif gönderebilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Orijinal Teklif Bilgisi */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Üretici Teklifi:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-700">Birim Fiyat:</span>
                  <p className="font-bold">₺{order.unitPrice.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-blue-700">Üretim Süresi:</span>
                  <p className="font-bold">{order.productionDays} gün</p>
                </div>
              </div>
            </div>

            {/* Form Alanları */}
            <div className="space-y-2">
              <Label htmlFor="quotedPrice">
                Teklif Ettiğiniz Birim Fiyat (₺) *
              </Label>
              <Input
                id="quotedPrice"
                type="number"
                min="0"
                step="0.01"
                value={customerQuoteData.quotedPrice}
                onChange={(e) =>
                  setCustomerQuoteData({
                    ...customerQuoteData,
                    quotedPrice: e.target.value,
                  })
                }
                placeholder="Örn: 45.50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quoteDays">
                İstediğiniz Üretim Süresi (Gün) *
              </Label>
              <Input
                id="quoteDays"
                type="number"
                min="1"
                value={customerQuoteData.quoteDays}
                onChange={(e) =>
                  setCustomerQuoteData({
                    ...customerQuoteData,
                    quoteDays: e.target.value,
                  })
                }
                placeholder="Örn: 25"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quoteNote">Not (Opsiyonel)</Label>
              <Textarea
                id="quoteNote"
                value={customerQuoteData.quoteNote}
                onChange={(e) =>
                  setCustomerQuoteData({
                    ...customerQuoteData,
                    quoteNote: e.target.value,
                  })
                }
                placeholder="Varsa notunuzu yazın..."
                rows={3}
              />
            </div>

            {/* Otomatik Tip Belirleme Mesajı */}
            {(() => {
              const originalPrice = order.unitPrice.toString();
              const originalDays = order.productionDays?.toString() || "";
              const isChanged =
                customerQuoteData.quotedPrice !== originalPrice ||
                customerQuoteData.quoteDays !== originalDays;

              return (
                <div className={`border rounded-lg p-3 ${isChanged ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                  <p className={`text-sm ${isChanged ? 'text-amber-800' : 'text-green-800'}`}>
                    {isChanged ? (
                      <>📝 <strong>Revize Teklif:</strong> Fiyat veya süre değiştirdiniz. Bu revize teklif olarak gönderilecek.</>
                    ) : (
                      <>✅ <strong>Standart Teklif:</strong> Üreticinin teklifini aynen kabul ediyorsunuz. Üretim otomatik başlayacak.</>
                    )}
                  </p>
                </div>
              );
            })()}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomerQuoteDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              onClick={async () => {
                if (!customerQuoteData.quotedPrice || !customerQuoteData.quoteDays) {
                  toast.error("Lütfen fiyat ve süre alanlarını doldurun");
                  return;
                }

                // Frontend'de gösterim için tip belirleme
                const originalPrice = order.unitPrice.toString();
                const originalDays = order.productionDays?.toString() || "";
                const isChanged =
                  customerQuoteData.quotedPrice !== originalPrice ||
                  customerQuoteData.quoteDays !== originalDays;

                setIsSubmitting(true);
                try {
                  // Backend otomatik tip belirleyecek, quoteType göndermeye gerek yok
                  const result = await submitCustomerQuote({
                    orderId: order.id,
                    quotedPrice: parseFloat(customerQuoteData.quotedPrice),
                    quoteDays: parseInt(customerQuoteData.quoteDays),
                    quoteNote: customerQuoteData.quoteNote || undefined,
                  });

                  if (result.error) {
                    throw new Error(result.error.message);
                  }

                  toast.success(
                    isChanged
                      ? "📝 Revize teklif gönderildi"
                      : "✅ Teklif onaylandı! Üretim başlayacak."
                  );
                  setIsCustomerQuoteDialogOpen(false);
                  setCustomerQuoteData({
                    quotedPrice: "",
                    quoteDays: "",
                    quoteNote: "",
                    quoteType: "STANDARD",
                  });
                  reexecuteQuery({ requestPolicy: "network-only" });
                } catch (error: any) {
                  toast.error(error.message || "Hata oluştu");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Teklifi Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manufacturer Review Dialog */}
      <Dialog open={isManufacturerReviewDialogOpen} onOpenChange={setIsManufacturerReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>✅ Müşteri Teklifini Onayla</DialogTitle>
            <DialogDescription>
              Müşterinin teklifini kabul ederek üretim otomatik başlayacak.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Müşteri Teklifi:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Birim Fiyat:</span>
                  <p className="font-bold">₺{order.customerQuotedPrice?.toFixed(2) || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-600">Üretim Süresi:</span>
                  <p className="font-bold">{order.customerQuoteDays || "-"} gün</p>
                </div>
              </div>
              {order.customerQuoteNote && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">Not:</span>
                  <p className="italic">{order.customerQuoteNote}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturerReviewNote">Onay Notu (Opsiyonel)</Label>
              <Textarea
                id="manufacturerReviewNote"
                value={manufacturerReviewNote}
                onChange={(e) => setManufacturerReviewNote(e.target.value)}
                placeholder="Onay notunuz..."
                rows={3}
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                ✅ Onayladığınızda sipariş durumu CONFIRMED → IN_PRODUCTION olarak güncellenecek
                ve üretim otomatik başlayacak.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsManufacturerReviewDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  const result = await approveCustomerQuote({
                    orderId: order.id,
                    note: manufacturerReviewNote || undefined,
                  });

                  if (result.error) {
                    throw new Error(result.error.message);
                  }

                  toast.success("✅ Müşteri teklifi onaylandı! Üretim başladı.");
                  setIsManufacturerReviewDialogOpen(false);
                  setManufacturerReviewNote("");
                  reexecuteQuery({ requestPolicy: "network-only" });
                } catch (error: any) {
                  toast.error(error.message || "Hata oluştu");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Onayla - Üretimi Başlat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Siparişi Düzenle</DialogTitle>
            <DialogDescription>
              Sipariş bilgilerini ve üretici yanıtını güncelleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sipariş Durumu</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Beklemede</SelectItem>
                  <SelectItem value="REVIEWED">İnceleniyor</SelectItem>
                  <SelectItem value="QUOTE_SENT">Teklif Gönderildi</SelectItem>
                  <SelectItem value="CONFIRMED">Onaylandı</SelectItem>
                  <SelectItem value="REJECTED">Reddedildi</SelectItem>
                  <SelectItem value="IN_PRODUCTION">Üretimde</SelectItem>
                  <SelectItem value="PRODUCTION_COMPLETE">
                    Üretim Tamamlandı
                  </SelectItem>
                  <SelectItem value="QUALITY_CHECK">
                    Kalite Kontrolde
                  </SelectItem>
                  <SelectItem value="SHIPPED">Kargoda</SelectItem>
                  <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
                  <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Üretici Yanıtı</Label>
              <Textarea
                value={editFormData.manufacturerResponse}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    manufacturerResponse: e.target.value,
                  })
                }
                placeholder="Müşteriye yanıtınız, notlarınız..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Üretim Süresi (Gün)</Label>
                <Input
                  type="number"
                  min="1"
                  value={editFormData.productionDays}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      productionDays: e.target.value,
                    })
                  }
                  placeholder="Örn: 30"
                />
              </div>

              <div className="space-y-2">
                <Label>Tahmini Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={editFormData.estimatedProductionDate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      estimatedProductionDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
