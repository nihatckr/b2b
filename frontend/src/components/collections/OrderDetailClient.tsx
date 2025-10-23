"use client";

import {
  BuyerOrderDetailDocument,
  ManufacturerAcceptCustomerQuoteDocument,
} from "@/__generated__/graphql";
import { CounterOfferDialog } from "@/components/orders/CounterOfferDialog";
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

const statusLabels: Record<string, string> = {
  PENDING: "Beklemede",
  CUSTOMER_QUOTE_SENT: "Müşteri Teklifi Gönderildi",
  QUOTE_SENT: "Teklif Gönderildi",
  CONFIRMED: "Onaylandı",
  IN_PRODUCTION: "Üretimde",
  QUALITY_CHECK: "Kalite Kontrolü",
  READY_TO_SHIP: "Gönderime Hazır",
  SHIPPED: "Gönderildi",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
  REJECTED: "Reddedildi",
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

  const [{ data, fetching, error }, refetchOrder] = useQuery({
    query: BuyerOrderDetailDocument,
    variables: { id: orderId },
  });

  const [, acceptCustomerQuote] = useMutation(
    ManufacturerAcceptCustomerQuoteDocument
  );

  const handleAcceptQuote = async () => {
    const result = await acceptCustomerQuote({ orderId });
    if (result.error) {
      toast.error(`Hata: ${result.error.message}`);
      return;
    }
    toast.success("✅ Teklif kabul edildi!");
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
              ? statusLabels[order.status] || order.status
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

              {order.collection?.description && (
                <div>
                  <p className="text-sm text-gray-500">Açıklama</p>
                  <p className="text-sm">{order.collection.description}</p>
                </div>
              )}

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
                  <p className="text-sm bg-gray-50 p-3 rounded border">
                    {order.notes}
                  </p>
                </div>
              )}

              {order.manufacturerResponse && (
                <div>
                  <p className="text-sm text-gray-500">Üretici Yanıtı</p>
                  <p className="text-sm bg-blue-50 p-3 rounded border border-blue-200">
                    {order.manufacturerResponse}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
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

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              {isCustomer && order.status === "QUOTE_SENT" && (
                <>
                  <Button className="w-full" variant="default">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Teklifi Kabul Et
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setCounterOfferOpen(true)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Karşı Teklif Gönder
                  </Button>
                  <Button className="w-full" variant="outline">
                    <XCircle className="w-4 h-4 mr-2" />
                    Teklifi Reddet
                  </Button>
                </>
              )}

              {isManufacturer && order.status === "CUSTOMER_QUOTE_SENT" && (
                <>
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => setProductionPlanOpen(true)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Üretim Planı Oluştur
                  </Button>
                  <Button className="w-full" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Karşı Teklif Gönder
                  </Button>
                </>
              )}

              <Button className="w-full" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Sipariş Geçmişi
              </Button>
            </CardContent>
          </Card>
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
            onSuccess={() => {
              refetchOrder({ requestPolicy: "network-only" });
            }}
          />

          <ProductionPlanDialog
            open={productionPlanOpen}
            onOpenChange={setProductionPlanOpen}
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
