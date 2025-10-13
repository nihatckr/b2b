"use client";

import { format } from "date-fns";
import {
  ArrowLeft,
  Building,
  Calendar,
  DollarSign,
  MapPin,
  Package,
  Truck,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useOrderQuery } from "../../../../../__generated__/graphql";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Separator } from "../../../../../components/ui/separator";
import { Skeleton } from "../../../../../components/ui/skeleton";

const statusColors: { [key: string]: string } = {
  PENDING: "bg-amber-100 text-amber-700",
  REVIEWED: "bg-purple-100 text-purple-700",
  QUOTE_SENT: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  IN_PRODUCTION: "bg-emerald-100 text-emerald-700",
  PRODUCTION_COMPLETE: "bg-teal-100 text-teal-700",
  QUALITY_CHECK: "bg-cyan-100 text-cyan-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

const statusLabels: { [key: string]: string } = {
  PENDING: "Beklemede",
  REVIEWED: "İncelendi",
  QUOTE_SENT: "Teklif Gönderildi",
  CONFIRMED: "Onaylandı",
  REJECTED: "Reddedildi",
  IN_PRODUCTION: "Üretimde",
  PRODUCTION_COMPLETE: "Üretim Tamamlandı",
  QUALITY_CHECK: "Kalite Kontrolde",
  SHIPPED: "Kargoya Verildi",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [{ data, fetching, error }] = useOrderQuery({
    variables: { id: parseInt(orderId) },
    requestPolicy: "network-only",
  });

  if (fetching) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[400px] md:col-span-2" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">
              {error?.message || "Order not found"}
            </p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const order = data.order;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {order.orderNumber}
            </h1>
            <p className="text-muted-foreground">Order Details</p>
          </div>
        </div>
        <Badge className={statusColors[order.status]}>
          {statusLabels[order.status] || order.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Collection */}
            {order.collection && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Product Collection
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="font-medium text-lg">{order.collection.name}</p>
                  {order.collection.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.collection.description}
                    </p>
                  )}
                  {order.collection.price && (
                    <p className="text-sm font-medium text-primary mt-2">
                      Base Price: ₺
                      {order.collection.price.toLocaleString("tr-TR")}
                    </p>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Order Details */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Quantity
                </h3>
                <p className="text-2xl font-bold">{order.quantity}</p>
                <p className="text-xs text-muted-foreground">units</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Unit Price
                </h3>
                <p className="text-2xl font-bold">
                  ₺{order.unitPrice.toLocaleString("tr-TR")}
                </p>
                <p className="text-xs text-muted-foreground">per unit</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Total Price
                </h3>
                <p className="text-2xl font-bold text-primary">
                  ₺{order.totalPrice.toLocaleString("tr-TR")}
                </p>
                <p className="text-xs text-muted-foreground">grand total</p>
              </div>
            </div>

            <Separator />

            {/* Notes */}
            {order.customerNote && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Customer Note
                </h3>
                <p className="text-sm bg-blue-50 p-3 rounded-md border border-blue-200">
                  {order.customerNote}
                </p>
              </div>
            )}

            {order.manufacturerResponse && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Manufacturer Response
                </h3>
                <p className="text-sm bg-purple-50 p-3 rounded-md border border-purple-200">
                  {order.manufacturerResponse}
                </p>
              </div>
            )}

            <Separator />

            {/* Production Schedule */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Production Schedule
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {order.productionDays && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-muted-foreground">
                      Production Time
                    </p>
                    <p className="text-lg font-bold">
                      {order.productionDays} days
                    </p>
                  </div>
                )}

                {order.estimatedProductionDate && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-muted-foreground">
                      Estimated Date
                    </p>
                    <p className="text-sm font-medium">
                      {format(
                        new Date(order.estimatedProductionDate),
                        "dd MMM yyyy"
                      )}
                    </p>
                  </div>
                )}

                {order.actualProductionStart && (
                  <div className="p-3 bg-green-50 rounded-md border border-green-200">
                    <p className="text-xs text-muted-foreground">
                      Production Started
                    </p>
                    <p className="text-sm font-medium">
                      {format(
                        new Date(order.actualProductionStart),
                        "dd MMM yyyy"
                      )}
                    </p>
                  </div>
                )}

                {order.actualProductionEnd && (
                  <div className="p-3 bg-green-50 rounded-md border border-green-200">
                    <p className="text-xs text-muted-foreground">
                      Production Completed
                    </p>
                    <p className="text-sm font-medium">
                      {format(
                        new Date(order.actualProductionEnd),
                        "dd MMM yyyy"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Shipping Info */}
            {(order.deliveryAddress ||
              order.cargoTrackingNumber ||
              order.shippingDate) && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  Shipping Information
                </h3>
                <div className="space-y-3">
                  {order.deliveryAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Delivery Address
                        </p>
                        <p className="text-sm">{order.deliveryAddress}</p>
                      </div>
                    </div>
                  )}

                  {order.cargoTrackingNumber && (
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Tracking Number
                        </p>
                        <p className="text-sm font-mono font-medium">
                          {order.cargoTrackingNumber}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.shippingDate && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Shipped On
                        </p>
                        <p className="text-sm font-medium">
                          {format(new Date(order.shippingDate), "dd MMM yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.customer.email}
              </p>
              {order.customer.phone && (
                <p className="text-sm text-muted-foreground">
                  {order.customer.phone}
                </p>
              )}
              {order.company && (
                <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                  <Building className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm font-medium">{order.company.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manufacturer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building className="h-4 w-4" />
                Manufacturer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">
                {order.manufacture.firstName} {order.manufacture.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.manufacture.email}
              </p>
              {order.manufacture.phone && (
                <p className="text-sm text-muted-foreground">
                  {order.manufacture.phone}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Quantity</span>
                <span className="font-medium">{order.quantity} units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Unit Price
                </span>
                <span className="font-medium">
                  ₺{order.unitPrice.toLocaleString("tr-TR")}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-primary">
                  ₺{order.totalPrice.toLocaleString("tr-TR")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {format(new Date(order.updatedAt), "dd MMM yyyy, HH:mm")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Production History Timeline */}
      {order.productionHistory && order.productionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Production History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-4">
              {order.productionHistory.map((history: any, index: number) => (
                <div key={history.id} className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === 0 ? "bg-primary" : "bg-muted"
                      }`}
                    />
                    {index < order.productionHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-muted absolute top-3" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className={statusColors[history.status]}>
                        {statusLabels[history.status] || history.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(history.createdAt),
                          "dd MMM yyyy, HH:mm"
                        )}
                      </p>
                    </div>
                    {history.note && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {history.note}
                      </p>
                    )}
                    {history.estimatedDays && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Estimated: {history.estimatedDays} days for this stage
                      </p>
                    )}
                    {history.updatedBy && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated by: {history.updatedBy.firstName}{" "}
                        {history.updatedBy.lastName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specifications (if any) */}
      {order.specifications && (
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-50 p-4 rounded-md overflow-auto">
              {JSON.stringify(JSON.parse(order.specifications), null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
