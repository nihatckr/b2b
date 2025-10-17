"use client";

import { AlertCircle, ArrowLeft, Camera } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "urql";
import { useProductionTrackingQuery } from "../../../../../__generated__/graphql";
import { StageUpdateDialog } from "../../../../../components/Order/StageUpdateDialog";
import { ProductionTrackingCard } from "../../../../../components/Production/ProductionTrackingCard";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Progress } from "../../../../../components/ui/progress";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { useAuth } from "../../../../../context/AuthProvider";
import {
  ADD_PRODUCTION_STAGE_UPDATE,
  COMPLETE_PRODUCTION_STAGE,
  REVERT_PRODUCTION_STAGE
} from "../../../../../lib/graphql/productionMutations";

const STAGE_LABELS: { [key: string]: string } = {
  PLANNING: "📋 Planlama",
  FABRIC: "🧵 Kumaş Tedarik",
  CUTTING: "✂️ Kesim",
  SEWING: "🪡 Dikiş",
  QUALITY: "✅ Kalite Kontrol",
  PACKAGING: "📦 Paketleme",
  SHIPPING: "🚚 Sevkiyat",
};

export default function ProductionTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const trackingId = params.id as string;
  const { user } = useAuth();
  const [isStageUpdateDialogOpen, setIsStageUpdateDialogOpen] = useState(false);
  const [stageUpdates, setStageUpdates] = useState<
    Array<{ notes: string; photos: string[]; timestamp: string; stage: string; hasDelay: boolean; delayReason?: string; extraDays?: number }>
  >([]);
  const [currentStageOverride, setCurrentStageOverride] = useState<string | null>(null);
  const [completedStages, setCompletedStages] = useState<string[]>([]);

  // Debug: Log updates
  React.useEffect(() => {
    console.log("📊 Current stageUpdates:", stageUpdates);
  }, [stageUpdates]);

  const [{ data, fetching, error }, reexecuteQuery] = useProductionTrackingQuery({
    variables: { id: parseInt(trackingId) },
    requestPolicy: "cache-and-network",
  });

  const [, addStageUpdate] = useMutation(ADD_PRODUCTION_STAGE_UPDATE);
  const [, completeStage] = useMutation(COMPLETE_PRODUCTION_STAGE);
  const [, revertStage] = useMutation(REVERT_PRODUCTION_STAGE);

  // Determine if current user is a manufacturer (can take actions) or customer (read-only)
  // Must be called before any conditional returns to follow Rules of Hooks
  const isManufacturer = React.useMemo(() => {
    if (!user || !data?.productionTracking) return false;

    const tracking = data.productionTracking;

    // Admin can always take actions
    if (user.role === "ADMIN") {
      console.log("✅ User is ADMIN - can take actions");
      return true;
    }

    // Check if user is the manufacturer (who will produce the order/sample)
    const manufacturerId = tracking.order?.manufacture?.id || tracking.sample?.manufacture?.id;
    if (manufacturerId === user.id) {
      console.log("✅ User is the manufacturer (user ID match) - can take actions");
      return true;
    }

    // Check if user belongs to the manufacturer company (companyId in productionTracking or order.company)
    const manufacturerCompanyId = tracking.companyId || tracking.order?.company?.id || tracking.sample?.company?.id;
    if (manufacturerCompanyId && user.company?.id === manufacturerCompanyId) {
      console.log("✅ User belongs to manufacturer company - can take actions");
      return true;
    }

    // If user is the customer, they can only view (read-only)
    console.log("❌ User is CUSTOMER or not authorized (read-only)", {
      userId: user.id,
      userRole: user.role,
      userCompanyId: user.company?.id,
      manufacturerId,
      manufacturerCompanyId,
      isManufacturer: false
    });
    return false;
  }, [user, data]);

  const handleStageUpdate = async (updateData: { stage: string; notes: string; photos: string[]; hasDelay: boolean; delayReason?: string; extraDays?: number }) => {
    try {
      console.log("📸 New stage update:", updateData);

      // Save to backend
      const result = await addStageUpdate({
        productionId: parseInt(trackingId),
        stage: updateData.stage,
        notes: updateData.notes || null,
        photos: updateData.photos.length > 0 ? JSON.stringify(updateData.photos) : null,
        hasDelay: updateData.hasDelay,
        delayReason: updateData.delayReason || null,
        extraDays: updateData.extraDays || null,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Update local state for immediate feedback
      const newUpdate = {
        notes: updateData.notes,
        photos: updateData.photos,
        timestamp: new Date().toISOString(),
        stage: updateData.stage,
        hasDelay: updateData.hasDelay,
        delayReason: updateData.delayReason,
        extraDays: updateData.extraDays,
      };
      setStageUpdates([...stageUpdates, newUpdate]);

      // Refresh data from server
      reexecuteQuery({ requestPolicy: "network-only" });

      toast.success("Güncelleme kaydedildi");
    } catch (error) {
      console.error("Stage update error:", error);
      toast.error("Güncelleme kaydedilirken hata oluştu");
    }
  };

  const handleStageComplete = async (stage: string, nextStage: string | null) => {
    console.log(`✅ Stage ${stage} completed, moving to ${nextStage || "ALL STAGES COMPLETED"}`);

    const stageLabels: { [key: string]: string } = {
      PLANNING: "📋 Planlama",
      FABRIC: "🧵 Kumaş Tedarik",
      CUTTING: "✂️ Kesim",
      SEWING: "🪡 Dikiş",
      QUALITY: "✅ Kalite Kontrol",
      PACKAGING: "📦 Paketleme",
      SHIPPING: "🚚 Sevkiyat",
    };

    try {
      // Update local state for immediate UI feedback
      setCompletedStages([...completedStages, stage]);

      if (nextStage) {
        setCurrentStageOverride(nextStage);
      }

      // Save to backend
      const result = await completeStage({
        productionId: parseInt(trackingId),
        stage: stage,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success(
        nextStage
          ? `${stageLabels[stage]} tamamlandı! ${stageLabels[nextStage]} aşamasına geçildi.`
          : `${stageLabels[stage]} tamamlandı! Tüm üretim aşamaları tamamlandı.`,
        { duration: 3000 }
      );

      // Refresh data from server
      reexecuteQuery({ requestPolicy: "network-only" });

    } catch (error) {
      console.error("Stage complete error:", error);
      toast.error("Aşama tamamlanırken hata oluştu");
    }
  };

  const handleStageRevert = async (targetStage: string) => {
    try {
      console.log("🔄 Reverting to stage:", targetStage);

      const result = await revertStage({
        productionId: parseInt(trackingId),
        targetStage: targetStage,
      });

      if (result.error) {
        console.error("Error reverting stage:", result.error);
        toast.error("Aşama geri alınırken hata oluştu");
        return;
      }

      console.log("🔄 Stage revert result:", result.data);

      // Update local state for immediate UI feedback
      setCurrentStageOverride(targetStage);

      // Remove completed stages that come after the target stage
      const stageOrder = ["PLANNING", "FABRIC", "CUTTING", "SEWING", "QUALITY", "PACKAGING", "SHIPPING"];
      const targetIndex = stageOrder.indexOf(targetStage);
      const stagesToKeep = stageOrder.slice(0, targetIndex);
      setCompletedStages(prev => prev.filter(s => stagesToKeep.includes(s)));

      toast.success(`Aşama ${STAGE_LABELS[targetStage] || targetStage} durumuna geri alındı`);

      // Refresh data from server
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error) {
      console.error("Error reverting stage:", error);
      toast.error("Aşama geri alınırken hata oluştu");
    }
  };

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

  // Parse stage updates from backend and combine with local state
  const backendUpdates = (tracking.stageUpdates || []).map((update: any) => ({
    notes: update.notes || "",
    photos: update.photos ? JSON.parse(update.photos) : [],
    timestamp: update.createdAt,
    stage: update.stage,
    hasDelay: update.isRevision,
    delayReason: update.delayReason,
    extraDays: update.extraDays,
  }));

  // Combine backend and local updates
  const allUpdates = [...backendUpdates, ...stageUpdates];

  // Create modified tracking object
  const modifiedTracking = {
    ...tracking,
    currentStage: currentStageOverride || tracking.currentStage,
    stageUpdates: tracking.stageUpdates?.map((update: any) => {
      // Mark completed stages as COMPLETED
      if (completedStages.includes(update.stage)) {
        return { ...update, status: "COMPLETED" };
      }
      // Set current stage to IN_PROGRESS
      if (update.stage === (currentStageOverride || tracking.currentStage)) {
        return { ...update, status: "IN_PROGRESS" };
      }
      return update;
    }),
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Üretim Takibi
          </h1>
          <p className="text-muted-foreground">
            {tracking.order
              ? `Sipariş: ${tracking.order.orderNumber}`
              : tracking.sample
              ? `Numune: ${tracking.sample.sampleNumber}`
              : `Tracking ID: ${tracking.id}`}
          </p>
        </div>
        {isManufacturer && tracking.overallStatus !== "COMPLETED" && tracking.overallStatus !== "CANCELLED" && (
          <Button
            onClick={() => setIsStageUpdateDialogOpen(true)}
            variant="default"
            size="sm"
          >
            <Camera className="h-4 w-4 mr-2" />
            Güncelleme Ekle
          </Button>
        )}
      </div>

      {/* Production Tracking Card */}
      <ProductionTrackingCard
        // @ts-expect-error - GraphQL type mismatch with component props
        tracking={modifiedTracking}
        orderId={tracking.orderId ?? undefined}
        sampleId={tracking.sampleId ?? undefined}
        onStageUpdate={handleStageUpdate}
        onStageComplete={handleStageComplete}
        onStageRevert={handleStageRevert}
        userUpdates={allUpdates}
        completedStages={completedStages}
        isManufacturer={isManufacturer}
      />

      {/* Stage Updates with Photos */}
      {allUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Üretim Aşaması Güncellemeleri ({allUpdates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allUpdates
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((update, index) => (
                <div key={index} className={`p-4 border rounded-lg space-y-3 hover:shadow-md transition-shadow ${
                  update.hasDelay
                    ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
                    : "bg-gradient-to-br from-white to-gray-50"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={update.hasDelay ? "bg-red-100 text-red-700 text-sm" : "bg-blue-100 text-blue-700 text-sm"}>
                        {STAGE_LABELS[update.stage] || update.stage}
                      </Badge>
                      {update.hasDelay && update.extraDays && update.extraDays > 0 && (
                        <Badge className="bg-red-600 text-white text-xs font-semibold">
                          +{update.extraDays} GÜN GECİKME
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(update.timestamp).toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Delay Alert */}
                  {update.hasDelay && (
                    <div className="flex items-start gap-2 text-sm text-red-700 bg-red-100 p-3 rounded border border-red-300">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold mb-1">⚠️ Gecikme Bildirimi</p>
                        {update.delayReason && (
                          <p className="text-red-800">{update.delayReason}</p>
                        )}
                        {update.extraDays && (
                          <p className="mt-1 text-xs font-medium">
                            Teslim tarihi {update.extraDays} gün ileri alındı
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Normal Notes */}
                  {!update.hasDelay && update.notes && (
                    <div className="p-3 bg-white rounded border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {update.notes}
                      </p>
                    </div>
                  )}

                  {update.photos && update.photos.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">
                        Fotoğraflar ({update.photos.length})
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {update.photos.map((photo: string, photoIndex: number) => (
                          <div
                            key={photoIndex}
                            className="aspect-square rounded-md overflow-hidden border group cursor-pointer"
                          >
                            <img
                              src={photo}
                              alt={`${STAGE_LABELS[update.stage]} - Fotoğraf ${photoIndex + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              onLoad={() => {}}
                              onError={() => {}}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Controls */}
      {tracking.qualityControls && tracking.qualityControls.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Quality Control Reports</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tracking.qualityControls
                .filter((qc): qc is NonNullable<typeof qc> => qc !== null)
                .map((qc) => (
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
                              className="aspect-square rounded-md overflow-hidden border relative"
                            >
                              <Image
                                src={photo}
                                alt={`QC Photo ${idx + 1}`}
                                fill
                                className="object-cover"
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

      {/* Stage Update Dialog */}
      {isManufacturer && (
        <StageUpdateDialog
          open={isStageUpdateDialogOpen}
          onOpenChange={setIsStageUpdateDialogOpen}
          onSubmit={handleStageUpdate}
          currentStage={tracking.currentStage || "PLANNING"}
          stageName={STAGE_LABELS[tracking.currentStage || "PLANNING"]}
        />
      )}
    </div>
  );
}
