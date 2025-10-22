"use client";

import { useState } from "react";
import { useQuery } from "urql";
import { BuyerOrderDetailDocument } from "@/__generated__/graphql";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Calendar,
  DollarSign,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  FileText,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductionTracking } from "@/components/production/ProductionTracking";
import { SendQuoteModal } from "@/components/orders/SendQuoteModal";
import { QuoteResponseModal } from "@/components/orders/QuoteResponseModal";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  REVIEWED: "bg-blue-100 text-blue-800 border-blue-200",
  QUOTE_SENT: "bg-purple-100 text-purple-800 border-purple-200",
  CUSTOMER_QUOTE_SENT: "bg-indigo-100 text-indigo-800 border-indigo-200",
  CONFIRMED: "bg-green-100 text-green-800 border-green-200",
  IN_PRODUCTION: "bg-orange-100 text-orange-800 border-orange-200",
  SHIPPED: "bg-cyan-100 text-cyan-800 border-cyan-200",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
} as const;

const statusLabels = {
  PENDING: "İnceleme Bekliyor",
  REVIEWED: "İncelendi",
  QUOTE_SENT: "Teklif Gönderildi",
  CUSTOMER_QUOTE_SENT: "Müşteri Karşı Teklif Gönderdi",
  CONFIRMED: "Sipariş Onaylandı",
  IN_PRODUCTION: "Üretimde",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  REJECTED: "Reddedildi",
  CANCELLED: "İptal Edildi",
} as const;

const statusIcons = {
  PENDING: AlertCircle,
  REVIEWED: Clock,
  QUOTE_SENT: FileText,
  CUSTOMER_QUOTE_SENT: MessageSquare,
  CONFIRMED: CheckCircle,
  IN_PRODUCTION: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  REJECTED: AlertCircle,
  CANCELLED: AlertCircle,
} as const;

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { data: session } = useSession();
  const orderId = parseInt(params.id);
  const [quoteResponseModalOpen, setQuoteResponseModalOpen] = useState(false);

  if (isNaN(orderId)) {
    notFound();
  }

  const [{ data, fetching, error }, refetch] = useQuery({
    query: BuyerOrderDetailDocument,
    variables: { id: orderId },
  });

  const order = data?.order;
  const isBuyer = session?.user?.company?.type === "BUYER";

  if (fetching) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sipariş Bulunamadı
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message ||
              "Aradığınız sipariş bulunamadı veya erişim izniniz yok."}
          </p>
          <Link href="/dashboard/orders">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Siparişlere Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getOrderStatusBadge = (status: string) => {
    const colorClass =
      statusColors[status as keyof typeof statusColors] || statusColors.PENDING;
    const label = statusLabels[status as keyof typeof statusLabels] || status;
    const IconComponent =
      statusIcons[status as keyof typeof statusIcons] || AlertCircle;

    return (
      <Badge
        variant="outline"
        className={`${colorClass} flex items-center gap-2 text-sm px-3 py-1`}
      >
        <IconComponent className="h-4 w-4" />
        {label}
      </Badge>
    );
  };

  const formatCurrency = (
    amount: number | null | undefined,
    currency: string | null | undefined
  ) => {
    if (!amount) return "-";
    const currencySymbol =
      currency === "TRY" ? "₺" : currency === "EUR" ? "€" : "$";
    return `${amount.toLocaleString()} ${currencySymbol}`;
  };

  const getCollectionImages = () => {
    if (!order.collection?.images) return [];
    try {
      return JSON.parse(order.collection.images);
    } catch {
      return [];
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orders">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {order.orderNumber}
          </h1>
          <p className="text-gray-600 mt-1">
            {formatDistanceToNow(new Date(order.createdAt), {
              addSuffix: true,
              locale: tr,
            })}{" "}
            oluşturuldu
          </p>
        </div>
        {getOrderStatusBadge(order.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Collection Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Koleksiyon Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                {getCollectionImages()[0] && (
                  <Image
                    src={getCollectionImages()[0]}
                    alt={order.collection?.name || "Collection"}
                    width={120}
                    height={120}
                    className="w-30 h-30 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {order.collection?.name}
                    </h3>
                    <p className="text-gray-600">
                      Model: {order.collection?.modelCode}
                    </p>
                  </div>

                  {order.collection?.description && (
                    <p className="text-gray-700 text-sm">
                      {order.collection.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {order.collection?.season && (
                      <div>
                        <span className="text-xs text-gray-500">Sezon</span>
                        <p className="font-medium">{order.collection.season}</p>
                      </div>
                    )}
                    {order.collection?.gender && (
                      <div>
                        <span className="text-xs text-gray-500">Cinsiyet</span>
                        <p className="font-medium">{order.collection.gender}</p>
                      </div>
                    )}
                    {order.collection?.fit && (
                      <div>
                        <span className="text-xs text-gray-500">Kesim</span>
                        <p className="font-medium">{order.collection.fit}</p>
                      </div>
                    )}
                    {order.collection?.sizeRange && (
                      <div>
                        <span className="text-xs text-gray-500">
                          Beden Aralığı
                        </span>
                        <p className="font-medium">
                          {order.collection.sizeRange}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {order.collection?.fabricComposition && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Kumaş Kompozisyonu
                  </h4>
                  <p className="text-gray-700 text-sm">
                    {order.collection.fabricComposition}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sipariş Detayları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Miktar</p>
                    <p className="font-semibold">
                      {order.quantity?.toLocaleString()} adet
                    </p>
                  </div>
                </div>

                {order.targetPrice && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Hedef Fiyat</p>
                      <p className="font-semibold">
                        {formatCurrency(order.targetPrice, order.currency)}
                      </p>
                    </div>
                  </div>
                )}

                {order.deadline && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Termin</p>
                      <p className="font-semibold">
                        {new Date(order.deadline).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quote Information */}
              {(order.status === "QUOTE_SENT" ||
                order.status === "CONFIRMED" ||
                order.status === "REJECTED") &&
                order.unitPrice &&
                order.productionDays && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Üretici Teklifi
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-blue-600">Birim Fiyat</p>
                        <p className="font-semibold text-blue-900">
                          {formatCurrency(order.unitPrice, order.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600">Toplam Tutar</p>
                        <p className="font-semibold text-blue-900">
                          {formatCurrency(
                            order.unitPrice * order.quantity,
                            order.currency
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600">Üretim Süresi</p>
                        <p className="font-semibold text-blue-900">
                          {order.productionDays} gün
                        </p>
                      </div>
                    </div>

                    {order.manufacturerResponse && (
                      <div className="mt-3">
                        <p className="text-sm text-blue-600">Üretici Notu</p>
                        <p className="text-blue-800 text-sm bg-blue-100 p-2 rounded mt-1">
                          {order.manufacturerResponse}
                        </p>
                      </div>
                    )}
                  </div>
                )}

              {order.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Sipariş Notları
                  </h4>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
                    {order.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Sipariş Durumu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getOrderStatusBadge(order.status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Güncel durum:{" "}
                    {statusLabels[order.status as keyof typeof statusLabels]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Tracking - Show if order is confirmed or in production */}
          {(order.status === "CONFIRMED" ||
            order.status === "IN_PRODUCTION" ||
            order.status === "PRODUCTION_COMPLETE" ||
            order.status === "SHIPPED" ||
            order.status === "DELIVERED") && (
            <ProductionTracking
              currentStage={
                order.status === "CONFIRMED"
                  ? "PLANNING"
                  : order.status === "IN_PRODUCTION"
                  ? "SEWING"
                  : order.status === "PRODUCTION_COMPLETE"
                  ? "QUALITY"
                  : order.status === "SHIPPED"
                  ? "SHIPPING"
                  : "SHIPPING"
              }
              progress={
                order.status === "CONFIRMED"
                  ? 5
                  : order.status === "IN_PRODUCTION"
                  ? 60
                  : order.status === "PRODUCTION_COMPLETE"
                  ? 85
                  : order.status === "SHIPPED"
                  ? 95
                  : 100
              }
              status={
                order.status === "DELIVERED" ? "COMPLETED" : "IN_PROGRESS"
              }
              estimatedEndDate={order.deadline || undefined}
              actualStartDate={order.actualProductionStart || undefined}
              notes={order.manufacturerResponse || undefined}
              isManufacturer={!isBuyer}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {isBuyer ? "Üretici Firma" : "Müşteri Firma"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isBuyer ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {order.collection?.company?.name}
                    </h4>
                  </div>

                  {order.collection?.company?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {order.collection.company.email}
                      </span>
                    </div>
                  )}

                  {order.collection?.company?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {order.collection.company.phone}
                      </span>
                    </div>
                  )}

                  {order.collection?.company?.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="text-gray-600">
                        <p>{order.collection.company.address}</p>
                        {order.collection.company.city && (
                          <p>
                            {order.collection.company.city},{" "}
                            {order.collection.company.country}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {order.customer?.company?.name}
                    </h4>
                  </div>

                  {order.customer?.company?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {order.customer.company.email}
                      </span>
                    </div>
                  )}

                  {order.customer?.company?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {order.customer.company.phone}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Person */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                İletişim Kişisi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isBuyer ? (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">
                    {order.manufacturer?.name}
                  </h4>
                  {order.manufacturer?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {order.manufacturer.email}
                      </span>
                    </div>
                  )}
                  {order.manufacturer?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {order.manufacturer.phone}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">
                    {order.customer?.name}
                  </h4>
                  {order.customer?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {order.customer.email}
                      </span>
                    </div>
                  )}
                  {order.customer?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {order.customer.phone}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Mesaj Gönder
              </Button>

              {/* Manufacturer Actions */}
              {!isBuyer && order.status === "PENDING" && (
                <SendQuoteModal
                  orderId={order.id}
                  orderNumber={order.orderNumber}
                  quantity={order.quantity}
                  targetPrice={order.targetPrice}
                  onQuoteSent={() => refetch({ requestPolicy: "network-only" })}
                />
              )}

              {!isBuyer && order.status === "CONFIRMED" && (
                <Button className="w-full" size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  Üretime Başla
                </Button>
              )}

              {/* Customer Actions */}
              {isBuyer && order.status === "QUOTE_SENT" && (
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => setQuoteResponseModalOpen(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Teklifi Değerlendir
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Components */}
      {quoteResponseModalOpen && order.unitPrice && order.productionDays && (
        <QuoteResponseModal
          open={quoteResponseModalOpen}
          onOpenChange={setQuoteResponseModalOpen}
          orderId={order.id}
          orderNumber={order.orderNumber}
          unitPrice={order.unitPrice}
          productionDays={order.productionDays}
          quantity={order.quantity}
          onQuoteResponse={() => refetch({ requestPolicy: "network-only" })}
        />
      )}
    </div>
  );
}
