"use client";

import {
  BuyerOrderDetailDocument,
  RespondToProductionPlanDocument,
  SendProductionPlanForApprovalDocument,
} from "@/__generated__/graphql";
import { CounterOfferDialog } from "@/components/orders/CounterOfferDialog";
import { OrderChangeReviewDialog } from "@/components/orders/OrderChangeReviewDialog";
import { ProductionPlanDialog } from "@/components/orders/ProductionPlanDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRelayIds } from "@/hooks/useRelayIds";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

interface OrderDetailClientProps {
  orderId: number;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  CUSTOMER_QUOTE_SENT: "bg-blue-100 text-blue-800 border-blue-300",
  QUOTE_SENT: "bg-blue-100 text-blue-800 border-blue-300",
  CONFIRMED: "bg-green-100 text-green-800 border-green-300",
  IN_PRODUCTION: "bg-purple-100 text-purple-800 border-purple-300",
  QUALITY_CHECK: "bg-indigo-100 text-indigo-800 border-indigo-300",
  READY_TO_SHIP: "bg-cyan-100 text-cyan-800 border-cyan-300",
  SHIPPED: "bg-teal-100 text-teal-800 border-teal-300",
  DELIVERED: "bg-green-100 text-green-800 border-green-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
};

// Dynamic status labels based on user perspective
const getStatusLabel = (
  status: string,
  isCustomer: boolean,
  isManufacturer: boolean
): string => {
  switch (status) {
    case "PENDING":
      return "Beklemede";
    case "CUSTOMER_QUOTE_SENT":
      if (isCustomer) return "Teklifiniz Gönderildi";
      if (isManufacturer) return "Müşteri Teklifi Alındı";
      return "Müşteri Teklifi Gönderildi";
    case "QUOTE_SENT":
      if (isCustomer) return "Teklif Alındı";
      if (isManufacturer) return "Teklifiniz Gönderildi";
      return "Teklif Gönderildi";
    case "CONFIRMED":
      return "Onaylandı";
    case "IN_PRODUCTION":
      return "Üretimde";
    case "QUALITY_CHECK":
      return "Kalite Kontrolü";
    case "READY_TO_SHIP":
      return "Gönderime Hazır";
    case "SHIPPED":
      return "Gönderildi";
    case "DELIVERED":
      return "Teslim Edildi";
    case "CANCELLED":
      return "İptal Edildi";
    case "REJECTED":
      return "Reddedildi";
    default:
      return status;
  }
};

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="w-4 h-4" />,
  CUSTOMER_QUOTE_SENT: <FileText className="w-4 h-4" />,
  QUOTE_SENT: <FileText className="w-4 h-4" />,
  CONFIRMED: <CheckCircle2 className="w-4 h-4" />,
  IN_PRODUCTION: <Package className="w-4 h-4" />,
  QUALITY_CHECK: <AlertCircle className="w-4 h-4" />,
  READY_TO_SHIP: <Package className="w-4 h-4" />,
  SHIPPED: <Package className="w-4 h-4" />,
  DELIVERED: <CheckCircle2 className="w-4 h-4" />,
  CANCELLED: <XCircle className="w-4 h-4" />,
  REJECTED: <XCircle className="w-4 h-4" />,
};

export function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const { data: session } = useSession();
  const { decodeGlobalId } = useRelayIds();
  const [counterOfferOpen, setCounterOfferOpen] = useState(false);
  const [productionPlanOpen, setProductionPlanOpen] = useState(false);
  const [orderChangeReviewOpen, setOrderChangeReviewOpen] = useState(false);

  const [{ data, fetching, error }, refetchOrder] = useQuery({
    query: BuyerOrderDetailDocument,
    variables: { id: orderId },
  });

  // Production plan approval mutations
  const [, sendForApproval] = useMutation(
    SendProductionPlanForApprovalDocument
  );
  const [, respondToPlan] = useMutation(RespondToProductionPlanDocument);

  // Production plan approval handlers
  const handleSendForApproval = async (productionId: string | number) => {
    // Check if it's a Global ID or numeric ID
    const numericId =
      typeof productionId === "string" && productionId.length > 10
        ? decodeGlobalId(productionId)
        : Number(productionId);

    if (!numericId) {
      toast.error("Geçersiz üretim planı ID'si");
      return;
    }

    const result = await sendForApproval({ productionId: numericId });
    if (result.error) {
      toast.error(`Hata: ${result.error.message}`);
      return;
    }
    toast.success("📋 Üretim planı müşteriye onay için gönderildi!");
    refetchOrder({ requestPolicy: "network-only" });
  };

  const handleRespondToPlan = async (
    productionId: string | number,
    approved: boolean,
    customerNote?: string
  ) => {
    // Check if it's a Global ID or numeric ID
    const numericId =
      typeof productionId === "string" && productionId.length > 10
        ? decodeGlobalId(productionId)
        : Number(productionId);

    if (!numericId) {
      toast.error("Geçersiz üretim planı ID'si");
      return;
    }

    const result = await respondToPlan({
      productionId: numericId,
      approved,
      customerNote,
    });
    if (result.error) {
      toast.error(`Hata: ${result.error.message}`);
      return;
    }
    toast.success(
      approved ? "✅ Üretim planı onaylandı!" : "❌ Üretim planı reddedildi!"
    );
    refetchOrder({ requestPolicy: "network-only" });
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              <p className="font-medium">Sipariş yüklenirken bir hata oluştu</p>
            </div>
            <p className="text-sm text-red-500 mt-2">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">Sipariş bulunamadı</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { order } = data;

  // Debug: Log order data to check all values
  console.log("📦 Order Data:", {
    quantity: order.quantity,
    targetPrice: order.targetPrice,
    unitPrice: order.unitPrice,
    deadline: order.deadline,
    currency: order.currency,
    productionDays: order.productionDays,
  });
  console.log("🏭 Collection Data:", {
    moq: order.collection?.moq,
    targetPrice: order.collection?.targetPrice,
    targetLeadTime: order.collection?.targetLeadTime,
    deadlineDays: order.collection?.deadlineDays,
    currency: order.collection?.currency,
  });
  console.log("� Customer Quote:", {
    customerQuotedPrice: order.customerQuotedPrice,
    customerQuoteDays: order.customerQuoteDays,
    customerQuoteNote: order.customerQuoteNote,
  });
  // Negotiations feature removed

  // Check if user is customer (ordered the collection)
  const customerCompanyId = order.customer?.company?.id
    ? decodeGlobalId(order.customer.company.id)
    : null;
  const isCustomer = session?.user?.companyId
    ? Number(session.user.companyId) === customerCompanyId
    : false;

  // Check if user is manufacturer (owns the collection)
  const manufacturerCompanyId = order.collection?.company?.id
    ? decodeGlobalId(order.collection.company.id)
    : null;
  const isManufacturer = session?.user?.companyId
    ? Number(session.user.companyId) === manufacturerCompanyId
    : false;

  console.log("🔍 Order Detail Access:", {
    userCompanyId: session?.user?.companyId,
    customerCompanyId,
    manufacturerCompanyId,
    isCustomer,
    isManufacturer,
    orderStatus: order.status,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold ">
          Sipariş Detayı #{order.orderNumber}
        </h1>
        <p className="  mt-1">
          {format(new Date(order.createdAt), "dd MMMM yyyy, HH:mm", {
            locale: tr,
          })}
        </p>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <Badge
          className={`${
            order.status
              ? statusColors[order.status] || "bg-gray-100 text-gray-800"
              : "bg-gray-100 text-gray-800"
          } px-4 py-2 text-sm font-medium border`}
        >
          <span className="flex items-center gap-2">
            {order.status && statusIcons[order.status]}
            {order.status
              ? getStatusLabel(order.status, isCustomer, isManufacturer)
              : "Bilinmiyor"}
          </span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Collection Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Koleksiyon Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Koleksiyon Adı</p>
                  <p className="font-medium">{order.collection?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Model Kodu</p>
                  <p className="font-medium">
                    {order.collection?.modelCode || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sezon</p>
                  <p className="font-medium">
                    {order.collection?.season || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cinsiyet</p>
                  <p className="font-medium">
                    {order.collection?.gender || "-"}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Pricing & Production Info */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Fiyatlandırma ve Üretim
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="  p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Hedef Birim Fiyat</p>
                    <p className="font-semibold text-lg">
                      {order.collection?.targetPrice}{" "}
                      {order.collection?.currency || "USD"}
                    </p>
                  </div>
                  <div className="  p-3 rounded-lg">
                    <p className="text-xs text-gray-500">
                      Minimum Sipariş (MOQ)
                    </p>
                    <p className="font-semibold text-lg">
                      {order.collection?.moq || "-"} adet
                    </p>
                  </div>
                  <div className=" not-only: p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Hedef Üretim Süresi</p>
                    <p className="font-semibold text-lg">
                      {order.collection?.targetLeadTime || "-"} gün
                    </p>
                  </div>
                  <div className="  p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Termin Süresi</p>
                    <p className="font-semibold text-lg">
                      {order.collection?.deadlineDays || "-"} gün
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Fabric & Material Info */}
              {(order.collection?.fabricComposition ||
                order.collection?.accessories) && (
                <>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Kumaş ve Malzeme Bilgileri
                    </p>
                    {order.collection?.fabricComposition && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">
                          Kumaş Kompozisyonu
                        </p>
                        <p className="text-sm bg-gray-50 p-2 rounded border">
                          {order.collection.fabricComposition}
                        </p>
                      </div>
                    )}
                    {order.collection?.accessories && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Aksesuarlar
                        </p>
                        <p className="text-sm bg-gray-50 p-2 rounded border">
                          {order.collection.accessories}
                        </p>
                      </div>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {/* Additional Details */}
              {(order.collection?.fit ||
                order.collection?.trend ||
                order.collection?.colors ||
                order.collection?.sizeRange) && (
                <>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Ek Detaylar
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {order.collection?.fit && (
                        <div>
                          <p className="text-xs text-gray-500">Kesim</p>
                          <p className="text-sm font-medium">
                            {order.collection.fit}
                          </p>
                        </div>
                      )}
                      {order.collection?.trend && (
                        <div>
                          <p className="text-xs text-gray-500">Trend</p>
                          <p className="text-sm font-medium">
                            {order.collection.trend}
                          </p>
                        </div>
                      )}
                      {order.collection?.colors && (
                        <div>
                          <p className="text-xs text-gray-500">Renkler</p>
                          <p className="text-sm font-medium">
                            {order.collection.colors}
                          </p>
                        </div>
                      )}
                      {order.collection?.sizeRange && (
                        <div>
                          <p className="text-xs text-gray-500">Beden Aralığı</p>
                          <p className="text-sm font-medium">
                            {order.collection.sizeRange}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Description */}
              {order.collection?.description && (
                <div>
                  <p className="text-sm text-gray-500">Açıklama</p>
                  <p className="text-sm">{order.collection.description}</p>
                </div>
              )}

              {/* Images */}
              {order.collection?.images &&
                Array.isArray(order.collection.images) &&
                order.collection.images.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Görseller</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {order.collection.images.map(
                        (img: string, idx: number) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Collection ${idx + 1}`}
                            className="w-24 h-24 object-cover rounded border"
                          />
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Notes */}
              {order.collection?.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notlar</p>
                  <p className="text-sm bg-gray-50 p-2 rounded border">
                    {order.collection.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Sipariş Detayları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    Miktar
                  </p>
                  <p className="font-medium text-lg">{order.quantity} adet</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Hedef Fiyat
                  </p>
                  <p className="font-medium text-lg">
                    {order.targetPrice} {order.currency}
                  </p>
                </div>
                {order.unitPrice && (
                  <div>
                    <p className="text-sm text-gray-500">Birim Fiyat</p>
                    <p className="font-medium text-lg">
                      {order.unitPrice} {order.currency}
                    </p>
                  </div>
                )}
                {order.deadline && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Termin Tarihi
                    </p>
                    <p className="font-medium">
                      {format(new Date(order.deadline), "dd MMMM yyyy", {
                        locale: tr,
                      })}
                    </p>
                  </div>
                )}
                {order.productionDays && (
                  <div>
                    <p className="text-sm text-gray-500">Üretim Süresi</p>
                    <p className="font-medium">{order.productionDays} gün</p>
                  </div>
                )}
              </div>

              {order.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notlar</p>
                  <p className="text-sm   p-3 rounded border">{order.notes}</p>
                </div>
              )}

              {order.manufacturerResponse && (
                <div>
                  <p className="text-sm text-gray-500">Üretici Yanıtı</p>
                  <p className="text-sm   p-3 rounded border border-blue-200">
                    {order.manufacturerResponse}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Requests vs Collection Defaults - Negotiation Panel */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <AlertCircle className="w-5 h-5" />
                Müşteri Talepleri ve Karşılaştırma
              </CardTitle>
              <p className="text-sm text-purple-600 mt-1">
                Koleksiyon varsayılanları ile sipariş değerleri
                karşılaştırılıyor
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comparison Table */}
              <div className="  rounded-lg border border-purple-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-purple-100">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">
                        Özellik
                      </th>
                      <th className="text-center p-3 text-sm font-semibold text-gray-700">
                        Koleksiyon Varsayılan
                      </th>
                      <th className="text-center p-3 text-sm font-semibold text-purple-700">
                        Müşteri Talebi
                      </th>
                      <th className="text-center p-3 text-sm font-semibold text-gray-700">
                        Durum
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Quantity Row */}
                    <tr>
                      <td className="p-3 text-sm font-medium flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        Miktar (Adet)
                      </td>
                      <td className="p-3 text-center text-sm">
                        <span className="font-semibold">
                          {order.collection?.moq || "-"}
                        </span>
                        <p className="text-xs text-gray-500">MOQ</p>
                      </td>
                      <td className="p-3 text-center text-sm">
                        <span className="font-semibold text-purple-700">
                          {order.quantity || "-"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {order.collection?.moq &&
                        order.quantity === order.collection.moq ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            ✓ Eşit
                          </Badge>
                        ) : order.quantity &&
                          order.collection?.moq &&
                          order.quantity > order.collection.moq ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                            +
                            {(
                              ((order.quantity - order.collection.moq) /
                                order.collection.moq) *
                              100
                            ).toFixed(0)}
                            %
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 border-red-300">
                            MOQ Altı
                          </Badge>
                        )}
                      </td>
                    </tr>

                    {/* Unit Price Row */}
                    <tr className="bg-gray-50">
                      <td className="p-3 text-sm font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        Birim Fiyat
                      </td>
                      <td className="p-3 text-center text-sm">
                        <span className="font-semibold">
                          {order.collection?.targetPrice || "-"}
                        </span>
                        <p className="text-xs text-gray-500">
                          {order.currency || "USD"}
                        </p>
                      </td>
                      <td className="p-3 text-center text-sm">
                        <span className="font-semibold text-purple-700">
                          {order.targetPrice || "-"}
                        </span>
                        <p className="text-xs text-gray-500">
                          {order.currency || "USD"}
                        </p>
                      </td>
                      <td className="p-3 text-center">
                        {order.collection?.targetPrice &&
                        order.targetPrice === order.collection.targetPrice ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            ✓ Eşit
                          </Badge>
                        ) : order.targetPrice &&
                          order.collection?.targetPrice &&
                          order.targetPrice < order.collection.targetPrice ? (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                            -
                            {(
                              ((order.collection.targetPrice -
                                order.targetPrice) /
                                order.collection.targetPrice) *
                              100
                            ).toFixed(0)}
                            %
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            Farklı
                          </Badge>
                        )}
                      </td>
                    </tr>

                    {/* Lead Time Row */}
                    <tr>
                      <td className="p-3 text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        Termin Süresi (Gün)
                      </td>
                      <td className="p-3 text-center text-sm">
                        <span className="font-semibold">
                          {order.collection?.deadlineDays || "-"}
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm">
                        <span className="font-semibold text-purple-700">
                          {order.deadline
                            ? Math.ceil(
                                (new Date(order.deadline).getTime() -
                                  new Date(order.createdAt).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            : "-"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {(() => {
                          if (
                            !order.deadline ||
                            !order.collection?.deadlineDays
                          )
                            return "-";
                          const orderDays = Math.ceil(
                            (new Date(order.deadline).getTime() -
                              new Date(order.createdAt).getTime()) /
                              (1000 * 60 * 60 * 24)
                          );
                          if (orderDays === order.collection.deadlineDays) {
                            return (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                ✓ Eşit
                              </Badge>
                            );
                          } else if (
                            orderDays < order.collection.deadlineDays
                          ) {
                            return (
                              <Badge className="bg-red-100 text-red-800 border-red-300">
                                ⚡ Acil
                              </Badge>
                            );
                          } else {
                            return (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                Uzun
                              </Badge>
                            );
                          }
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Customer Quote Information */}
              {(order.customerQuotedPrice ||
                order.customerQuoteDays ||
                order.customerQuoteNote) && (
                <div className="  p-4 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Müşteri Teklifi
                  </p>
                  <div className="space-y-2">
                    {order.customerQuotedPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Teklif Edilen Birim Fiyat:
                        </span>
                        <span className="font-semibold text-purple-700">
                          {order.customerQuotedPrice} {order.currency}
                        </span>
                      </div>
                    )}
                    {order.customerQuoteDays && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          İstenen Üretim Süresi:
                        </span>
                        <span className="font-semibold text-purple-700">
                          {order.customerQuoteDays} gün
                        </span>
                      </div>
                    )}
                    {order.customerQuoteNote && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">
                          Müşteri Notu:
                        </p>
                        <p className="text-sm text-gray-700 bg-purple-50 p-2 rounded">
                          {order.customerQuoteNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Manufacturer Actions */}
              {isManufacturer &&
                order.status !== "CONFIRMED" &&
                order.status !== "CANCELLED" &&
                order.status !== "REJECTED" && (
                  <div className="pt-4 border-t border-purple-200 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Accept & Create Production Plan */}
                      <Button
                        onClick={() => setProductionPlanOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Kabul Et & Üretim Planla
                      </Button>

                      {/* Counter Offer */}
                      <Button
                        onClick={() => setCounterOfferOpen(true)}
                        variant="outline"
                        className="border-purple-600 text-purple-600 hover:bg-purple-50"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Karşı Teklif Gönder
                      </Button>
                    </div>
                    <p className="text-xs text-purple-600 text-center">
                      Müşteri talebini kabul edip üretim planlaması yapabilir
                      veya farklı değerlerle karşı teklif gönderebilirsiniz
                    </p>
                  </div>
                )}
              {/* No Changes Message */}
              {!order.customerQuotedPrice &&
                !order.customerQuoteDays &&
                !order.customerQuoteNote &&
                order.quantity === order.collection?.moq &&
                order.targetPrice === order.collection?.targetPrice && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-800">
                      ✅ Değişiklik Yok
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Sipariş değerleri koleksiyon varsayılan değerleriyle
                      tamamen uyumlu
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Order Changes Notification */}
          {isManufacturer &&
            order.changeLogs &&
            order.changeLogs.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="w-5 h-5" />
                    Sipariş Değişiklikleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.changeLogs
                      .filter(
                        (log: any) => log.manufacturerStatus === "PENDING"
                      )
                      .slice(0, 3)
                      .map((log: any) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-3   rounded border border-amber-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium">
                                {log.changeType === "QUANTITY" &&
                                  "Miktar Değişikliği"}
                                {log.changeType === "PRICE" &&
                                  "Fiyat Değişikliği"}
                                {log.changeType === "DEADLINE" &&
                                  "Termin Değişikliği"}
                                {log.changeType === "SPECIFICATIONS" &&
                                  "Özellik Değişikliği"}
                                {log.changeType === "OTHER" &&
                                  "Diğer Değişiklik"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(
                                  new Date(log.createdAt),
                                  "dd MMM yyyy, HH:mm",
                                  { locale: tr }
                                )}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-800 border-amber-300"
                          >
                            İnceleme Bekliyor
                          </Badge>
                        </div>
                      ))}

                    {order.changeLogs.filter(
                      (log: any) => log.manufacturerStatus === "PENDING"
                    ).length > 0 && (
                      <Button
                        className="w-full mt-2"
                        variant="outline"
                        onClick={() => setOrderChangeReviewOpen(true)}
                      >
                        Tüm Değişiklikleri İncele (
                        {
                          order.changeLogs.filter(
                            (log: any) => log.manufacturerStatus === "PENDING"
                          ).length
                        }{" "}
                        adet)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Production Tracking */}
          {order.productionTracking && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Üretim Takibi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Overall Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium  ">
                        Genel İlerleme
                      </span>
                      <span className="text-sm font-semibold text-red-600">
                        {order.productionTracking.progress}%
                      </span>
                    </div>
                    <div className="w-full   rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${order.productionTracking.progress}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Current Stage */}
                  <div className=" border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                      <span className="font-medium  ">
                        Mevcut Aşama: {order.productionTracking.currentStage}
                      </span>
                    </div>
                    {order.productionTracking.overallStatus && (
                      <p className="text-sm   mt-1">
                        Durum: {order.productionTracking.overallStatus}
                      </p>
                    )}
                  </div>

                  {/* Stage Updates */}
                  {order.productionTracking.stageUpdates &&
                    order.productionTracking.stageUpdates.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium  ">Aşama Detayları</h4>
                        <div className="space-y-2">
                          {order.productionTracking.stageUpdates.map(
                            (stage, index) => (
                              <div
                                key={stage.id}
                                className="flex items-start gap-3"
                              >
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                                      stage.status === "COMPLETED"
                                        ? "bg-green-500 text-white"
                                        : stage.status === "IN_PROGRESS"
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-300 text-gray-600"
                                    }`}
                                  >
                                    {stage.status === "COMPLETED"
                                      ? "✓"
                                      : index + 1}
                                  </div>
                                  {index <
                                    (order.productionTracking?.stageUpdates
                                      ?.length || 0) -
                                      1 && (
                                    <div className="w-0.5 h-8   mt-1"></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium  ">
                                      {stage.stage}
                                    </p>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        stage.status === "COMPLETED"
                                          ? "bg-green-100 text-green-800"
                                          : stage.status === "IN_PROGRESS"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {stage.status === "COMPLETED"
                                        ? "Tamamlandı"
                                        : stage.status === "IN_PROGRESS"
                                        ? "Devam Ediyor"
                                        : "Beklemede"}
                                    </span>
                                  </div>
                                  {stage.estimatedDays && (
                                    <p className="text-xs   mt-1">
                                      Tahmini: {stage.estimatedDays} gün
                                      {(stage.extraDays || 0) > 0 && (
                                        <span className="text-amber-600 ml-1">
                                          (+{stage.extraDays || 0} gün gecikme)
                                        </span>
                                      )}
                                    </p>
                                  )}
                                  {stage.notes && (
                                    <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                                      {stage.notes}
                                    </p>
                                  )}
                                  {stage.actualStartDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Başlangıç:{" "}
                                      {format(
                                        new Date(stage.actualStartDate),
                                        "dd MMM yyyy",
                                        { locale: tr }
                                      )}
                                    </p>
                                  )}
                                  {stage.actualEndDate && (
                                    <p className="text-xs text-gray-500">
                                      Bitiş:{" "}
                                      {format(
                                        new Date(stage.actualEndDate),
                                        "dd MMM yyyy",
                                        { locale: tr }
                                      )}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Timeline */}
                  {(order.productionTracking.estimatedStartDate ||
                    order.productionTracking.estimatedEndDate) && (
                    <div className="  border rounded-lg p-3">
                      <h4 className="font-medium   mb-2">Zaman Çizelgesi</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {order.productionTracking.estimatedStartDate && (
                          <div>
                            <p className=" ">Tahmini Başlangıç</p>
                            <p className="font-medium">
                              {format(
                                new Date(
                                  order.productionTracking.estimatedStartDate
                                ),
                                "dd MMMM yyyy",
                                { locale: tr }
                              )}
                            </p>
                          </div>
                        )}
                        {order.productionTracking.estimatedEndDate && (
                          <div>
                            <p className="text-gray-500">Tahmini Bitiş</p>
                            <p className="font-medium">
                              {format(
                                new Date(
                                  order.productionTracking.estimatedEndDate
                                ),
                                "dd MMMM yyyy",
                                { locale: tr }
                              )}
                            </p>
                          </div>
                        )}
                        {order.productionTracking.actualStartDate && (
                          <div>
                            <p className="text-gray-500">Gerçek Başlangıç</p>
                            <p className="font-medium text-green-600">
                              {format(
                                new Date(
                                  order.productionTracking.actualStartDate
                                ),
                                "dd MMMM yyyy",
                                { locale: tr }
                              )}
                            </p>
                          </div>
                        )}
                        {order.productionTracking.actualEndDate && (
                          <div>
                            <p className=" ">Gerçek Bitiş</p>
                            <p className="font-medium text-green-600">
                              {format(
                                new Date(
                                  order.productionTracking.actualEndDate
                                ),
                                "dd MMMM yyyy",
                                { locale: tr }
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Production Notes */}
                  {order.productionTracking.notes && (
                    <div>
                      <p className="text-sm   mb-1">Üretim Notları</p>
                      <p className="text-sm  p-3 rounded border border-gray-500 ">
                        {order.productionTracking.notes}
                      </p>
                    </div>
                  )}

                  {/* Customer Approval Status */}
                  {order.productionTracking.customerApprovalStatus && (
                    <div
                      className={`border rounded-lg p-4 ${
                        order.productionTracking.customerApprovalStatus ===
                        "DRAFT"
                          ? "bg-blue-50 border-blue-200"
                          : order.productionTracking.customerApprovalStatus ===
                            "PENDING"
                          ? "bg-amber-50 border-amber-200"
                          : order.productionTracking.customerApprovalStatus ===
                            "APPROVED"
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle
                            className={`w-4 h-4 ${
                              order.productionTracking
                                .customerApprovalStatus === "DRAFT"
                                ? "text-blue-600"
                                : order.productionTracking
                                    .customerApprovalStatus === "PENDING"
                                ? "text-amber-600"
                                : order.productionTracking
                                    .customerApprovalStatus === "APPROVED"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          />
                          <span
                            className={`font-medium ${
                              order.productionTracking
                                .customerApprovalStatus === "DRAFT"
                                ? "text-blue-900"
                                : order.productionTracking
                                    .customerApprovalStatus === "PENDING"
                                ? "text-amber-900"
                                : order.productionTracking
                                    .customerApprovalStatus === "APPROVED"
                                ? "text-green-900"
                                : "text-red-900"
                            }`}
                          >
                            Üretim Planı:
                            {order.productionTracking.customerApprovalStatus ===
                              "DRAFT" &&
                              ((order.productionTracking.revisionCount || 0) > 0
                                ? " Revize Edildi - Müşteri Onayına Gönderildi"
                                : " Taslak Hazırlanıyor")}
                            {order.productionTracking.customerApprovalStatus ===
                              "PENDING" && " Müşteri Onayı Bekleniyor"}
                            {order.productionTracking.customerApprovalStatus ===
                              "APPROVED" && " Onaylandı - Üretim Başladı"}
                            {order.productionTracking.customerApprovalStatus ===
                              "REJECTED" && " Reddedildi"}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {/* Manufacturer: Send for Approval (DRAFT status) */}
                          {isManufacturer &&
                            order.productionTracking.customerApprovalStatus ===
                              "DRAFT" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleSendForApproval(
                                    Number(order.productionTracking?.id)
                                  )
                                }
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                📋 Müşteriye Gönder
                              </Button>
                            )}

                          {/* Customer: Approve/Reject (PENDING status) */}
                          {isCustomer &&
                            order.productionTracking.customerApprovalStatus ===
                              "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleRespondToPlan(
                                      Number(order.productionTracking?.id),
                                      true
                                    )
                                  }
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  ✅ Onayla
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleRespondToPlan(
                                      Number(order.productionTracking?.id),
                                      false,
                                      "Plan uygun değil, revizyon gerekiyor."
                                    )
                                  }
                                  className="border-red-200 text-red-700 hover:bg-red-50"
                                >
                                  ❌ Reddet
                                </Button>
                              </>
                            )}

                          {/* Manufacturer: Revise (REJECTED status) */}
                          {isManufacturer &&
                            order.productionTracking.customerApprovalStatus ===
                              "REJECTED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setProductionPlanOpen(true)}
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                ✏️ Planı Revize Et
                              </Button>
                            )}

                          {/* Manufacturer: Send for Approval (DRAFT status after revision) */}
                          {isManufacturer &&
                            order.productionTracking.customerApprovalStatus ===
                              "DRAFT" &&
                            (order.productionTracking.revisionCount || 0) >
                              0 && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleSendForApproval(
                                    Number(order.productionTracking?.id)
                                  )
                                }
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                📋 Müşteri Onayına Gönder
                              </Button>
                            )}
                        </div>
                      </div>
                      {order.productionTracking.customerNote && (
                        <p className="text-sm text-amber-800 mt-2">
                          {order.productionTracking.customerNote}
                        </p>
                      )}
                      {order.productionTracking.customerApprovedAt && (
                        <p className="text-xs text-amber-600 mt-1">
                          {format(
                            new Date(
                              order.productionTracking.customerApprovedAt
                            ),
                            "dd MMMM yyyy, HH:mm",
                            { locale: tr }
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          {order.customer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4" />
                  Müşteri Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Ad Soyad</p>
                  <p className="font-medium">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    E-posta
                  </p>
                  <p className="font-medium">{order.customer.email}</p>
                </div>
                {order.customer.phone && (
                  <div>
                    <p className="text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Telefon
                    </p>
                    <p className="font-medium">{order.customer.phone}</p>
                  </div>
                )}
                {order.customer.company && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-gray-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Firma
                      </p>
                      <p className="font-medium">
                        {order.customer.company.name}
                      </p>
                    </div>
                    {order.customer.company.address && (
                      <div>
                        <p className="text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Adres
                        </p>
                        <p className="text-xs">
                          {order.customer.company.address},{" "}
                          {order.customer.company.city},{" "}
                          {order.customer.company.country}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Manufacturer Info */}
          {order.manufacturer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="w-4 h-4" />
                  Üretici Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Ad Soyad</p>
                  <p className="font-medium">{order.manufacturer.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    E-posta
                  </p>
                  <p className="font-medium">{order.manufacturer.email}</p>
                </div>
                {order.manufacturer.phone && (
                  <div>
                    <p className="text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Telefon
                    </p>
                    <p className="font-medium">{order.manufacturer.phone}</p>
                  </div>
                )}
                {order.manufacturer.company && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-gray-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Firma
                      </p>
                      <p className="font-medium">
                        {order.manufacturer.company.name}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Negotiation History - Feature removed
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Pazarlık Geçmişi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Pazarlık özelliği kaldırıldı</p>
              </div>
            </CardContent>
          </Card>
          */}
        </div>
      </div>

      {/* Counter Offer Dialog */}
      {order && (
        <>
          <CounterOfferDialog
            open={counterOfferOpen}
            onOpenChange={setCounterOfferOpen}
            orderId={orderId}
            currentPrice={order.unitPrice || 0}
            currentDays={order.productionDays || 30}
            currentQuantity={order.quantity || undefined}
            onSuccess={() => {
              refetchOrder({ requestPolicy: "network-only" });
            }}
          />

          <ProductionPlanDialog
            open={productionPlanOpen}
            onOpenChange={setProductionPlanOpen}
            orderId={orderId}
            customerDeadline={order.deadline}
            quantity={order.quantity || undefined}
            existingPlan={order.productionTracking || undefined}
            onSuccess={() => {
              refetchOrder({ requestPolicy: "network-only" });
            }}
          />

          <OrderChangeReviewDialog
            open={orderChangeReviewOpen}
            onOpenChange={setOrderChangeReviewOpen}
            orderId={orderId}
            onSuccess={() => {
              refetchOrder({ requestPolicy: "network-only" });
            }}
          />
        </>
      )}
    </div>
  );
}
