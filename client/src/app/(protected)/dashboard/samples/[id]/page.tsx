"use client";

import { format } from "date-fns";
import {
  ArrowLeft,
  Building,
  Calendar,
  FileText,
  Image as ImageIcon,
  Package,
  Truck,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSampleQuery } from "../../../../../__generated__/graphql";
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
  REQUESTED: "bg-blue-100 text-blue-700",
  RECEIVED: "bg-purple-100 text-purple-700",
  IN_DESIGN: "bg-pink-100 text-pink-700",
  PATTERN_READY: "bg-amber-100 text-amber-700",
  IN_PRODUCTION: "bg-emerald-100 text-emerald-700",
  QUALITY_CHECK: "bg-cyan-100 text-cyan-700",
  COMPLETED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  SHIPPED: "bg-teal-100 text-teal-700",
};

const statusLabels: { [key: string]: string } = {
  REQUESTED: "Talep Edildi",
  RECEIVED: "Alındı",
  IN_DESIGN: "Tasarımda",
  PATTERN_READY: "Kalıp Hazır",
  IN_PRODUCTION: "Üretimde",
  QUALITY_CHECK: "Kalite Kontrolde",
  COMPLETED: "Tamamlandı",
  REJECTED: "Reddedildi",
  SHIPPED: "Kargoya Verildi",
};

const sampleTypeLabels: { [key: string]: string } = {
  STANDARD: "Standart Numune",
  REVISION: "Revizyon Numune",
  CUSTOM: "Özel Tasarım",
  DEVELOPMENT: "Geliştirme",
};

export default function SampleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sampleId = params.id as string;

  const [{ data, fetching, error }] = useSampleQuery({
    variables: { id: parseInt(sampleId) },
    requestPolicy: "network-only",
  });

  if (fetching) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (error || !data?.sample) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">
              {error?.message || "Sample not found"}
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

  const sample = data.sample;

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
              {sample.sampleNumber}
            </h1>
            <p className="text-muted-foreground">Sample Details</p>
          </div>
        </div>
        <Badge className={statusColors[sample.status]}>
          {statusLabels[sample.status] || sample.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sample Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Sample Type
              </h3>
              <Badge variant="outline">
                {sampleTypeLabels[sample.sampleType] || sample.sampleType}
              </Badge>
            </div>

            {/* Collection */}
            {sample.collection && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Collection
                </h3>
                <p className="font-medium">{sample.collection.name}</p>
                {sample.collection.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {sample.collection.description}
                  </p>
                )}
              </div>
            )}

            <Separator />

            {/* Customer Note */}
            {sample.customerNote && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Customer Request
                </h3>
                <p className="text-sm bg-blue-50 p-3 rounded-md border border-blue-200">
                  {sample.customerNote}
                </p>
              </div>
            )}

            {/* Manufacturer Response */}
            {sample.manufacturerResponse && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Manufacturer Response
                </h3>
                <p className="text-sm bg-purple-50 p-3 rounded-md border border-purple-200">
                  {sample.manufacturerResponse}
                </p>
              </div>
            )}

            <Separator />

            {/* Production Info */}
            <div className="grid grid-cols-2 gap-4">
              {sample.productionDays && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Production Time
                  </h3>
                  <p className="font-medium">{sample.productionDays} days</p>
                </div>
              )}

              {sample.estimatedProductionDate && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Estimated Date
                  </h3>
                  <p className="font-medium">
                    {format(
                      new Date(sample.estimatedProductionDate),
                      "dd MMM yyyy"
                    )}
                  </p>
                </div>
              )}

              {sample.actualProductionDate && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Actual Completion
                  </h3>
                  <p className="font-medium">
                    {format(
                      new Date(sample.actualProductionDate),
                      "dd MMM yyyy"
                    )}
                  </p>
                </div>
              )}

              {sample.shippingDate && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Shipped On
                  </h3>
                  <p className="font-medium">
                    {format(new Date(sample.shippingDate), "dd MMM yyyy")}
                  </p>
                </div>
              )}
            </div>

            {/* Delivery Info */}
            {(sample.deliveryAddress || sample.cargoTrackingNumber) && (
              <>
                <Separator />
                <div className="space-y-3">
                  {sample.deliveryAddress && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        Delivery Address
                      </h3>
                      <p className="text-sm">{sample.deliveryAddress}</p>
                    </div>
                  )}

                  {sample.cargoTrackingNumber && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        Cargo Tracking
                      </h3>
                      <p className="text-sm font-mono font-medium">
                        {sample.cargoTrackingNumber}
                      </p>
                    </div>
                  )}
                </div>
              </>
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
                {sample.customer.firstName} {sample.customer.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {sample.customer.email}
              </p>
              {sample.customer.phone && (
                <p className="text-sm text-muted-foreground">
                  {sample.customer.phone}
                </p>
              )}
              {sample.customer.company && (
                <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                  <Building className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {sample.customer.company.name}
                  </p>
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
                {sample.manufacture.firstName} {sample.manufacture.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {sample.manufacture.email}
              </p>
              {sample.manufacture.phone && (
                <p className="text-sm text-muted-foreground">
                  {sample.manufacture.phone}
                </p>
              )}
              {sample.manufacture.company && (
                <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                  <Building className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {sample.manufacture.company.name}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates */}
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
                  {format(new Date(sample.createdAt), "dd MMM yyyy, HH:mm")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {format(new Date(sample.updatedAt), "dd MMM yyyy, HH:mm")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Production History Timeline */}
      {sample.productionHistory && sample.productionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Production History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-4">
              {sample.productionHistory.map((history, index: number) => (
                <div key={history.id} className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === 0 ? "bg-primary" : "bg-muted"
                      }`}
                    />
                    {index < sample.productionHistory.length - 1 && (
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
                        Estimated: {history.estimatedDays} days
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

      {/* Custom Design Images (if CUSTOM type) */}
      {sample.sampleType === "CUSTOM" && sample.customDesignImages && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Custom Design Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {JSON.parse(sample.customDesignImages).map(
                (imgUrl: string, idx: number) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg overflow-hidden border bg-gray-50"
                  >
                    <img
                      src={imgUrl}
                      alt={`Design ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revision Requests (if REVISION type) */}
      {sample.sampleType === "REVISION" && sample.revisionRequests && (
        <Card>
          <CardHeader>
            <CardTitle>Revision Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {JSON.parse(sample.revisionRequests).map(
                (revision, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-amber-50 border border-amber-200 rounded-md"
                  >
                    <p className="text-sm font-medium">{revision.field}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="line-through">{revision.oldValue}</span>{" "}
                      → <span className="font-medium">{revision.newValue}</span>
                    </p>
                    {revision.note && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {revision.note}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
