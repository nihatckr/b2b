"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useProductionTrackingQuery } from "../../../../../__generated__/graphql";
import { ProductionTrackingCard } from "../../../../../components/Production/ProductionTrackingCard";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent } from "../../../../../components/ui/card";
import { Skeleton } from "../../../../../components/ui/skeleton";

export default function ProductionTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const trackingId = params.id as string;

  const [{ data, fetching, error }] = useProductionTrackingQuery({
    variables: { id: parseInt(trackingId) },
    requestPolicy: "network-only",
  });

  if (fetching) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (error || !data?.productionTracking) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">
              {error?.message || "Production tracking not found"}
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

  const tracking = data.productionTracking;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Production Tracking
          </h1>
          <p className="text-muted-foreground">
            {tracking.order
              ? `Order: ${tracking.order.orderNumber}`
              : tracking.sample
              ? `Sample: ${tracking.sample.sampleNumber}`
              : `Tracking ID: ${tracking.id}`}
          </p>
        </div>
      </div>

      {/* Production Tracking Card */}
      <ProductionTrackingCard
        tracking={tracking}
        orderId={tracking.orderId || undefined}
        sampleId={tracking.sampleId || undefined}
      />

      {/* Quality Controls */}
      {tracking.qualityControls && tracking.qualityControls.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Quality Control Reports</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tracking.qualityControls.map((qc: any) => (
                <div
                  key={qc.id}
                  className="p-4 border rounded-lg bg-gray-50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {qc.inspector
                          ? `${qc.inspector.firstName} ${qc.inspector.lastName}`
                          : "Quality Inspector"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(qc.checkDate).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <Badge
                      className={
                        qc.result === "PASSED"
                          ? "bg-green-100 text-green-700"
                          : qc.result === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }
                    >
                      {qc.result}
                    </Badge>
                  </div>

                  {qc.score !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Quality Score
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={qc.score} className="h-2 flex-1" />
                        <span className="text-sm font-medium">
                          {qc.score}/100
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Defects */}
                  {(qc.fabricDefects ||
                    qc.sewingDefects ||
                    qc.measureDefects ||
                    qc.finishingDefects) && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {qc.fabricDefects !== null && (
                        <div>
                          <span className="text-muted-foreground">
                            Fabric Defects:
                          </span>{" "}
                          <span className="font-medium">
                            {qc.fabricDefects}
                          </span>
                        </div>
                      )}
                      {qc.sewingDefects !== null && (
                        <div>
                          <span className="text-muted-foreground">
                            Sewing Defects:
                          </span>{" "}
                          <span className="font-medium">
                            {qc.sewingDefects}
                          </span>
                        </div>
                      )}
                      {qc.measureDefects !== null && (
                        <div>
                          <span className="text-muted-foreground">
                            Measure Defects:
                          </span>{" "}
                          <span className="font-medium">
                            {qc.measureDefects}
                          </span>
                        </div>
                      )}
                      {qc.finishingDefects !== null && (
                        <div>
                          <span className="text-muted-foreground">
                            Finishing Defects:
                          </span>{" "}
                          <span className="font-medium">
                            {qc.finishingDefects}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {qc.notes && (
                    <p className="text-sm text-muted-foreground border-t pt-2">
                      {qc.notes}
                    </p>
                  )}

                  {/* Photos */}
                  {qc.photos && (
                    <div className="grid grid-cols-4 gap-2">
                      {JSON.parse(qc.photos).map(
                        (photo: string, idx: number) => (
                          <div
                            key={idx}
                            className="aspect-square rounded-md overflow-hidden border"
                          >
                            <img
                              src={photo}
                              alt={`QC Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
