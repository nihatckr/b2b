"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  RotateCcw,
} from "lucide-react";
import React, { useState } from "react";
import { StageUpdateDialog } from "../Order/StageUpdateDialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { StageRevertDialog } from "./StageRevertDialog";

interface ProductionStage {
  stage: string;
  status: string;
  actualStartDate?: string;
  actualEndDate?: string;
  estimatedDays?: number;
  notes?: string;
  photos?: string;
  isRevision?: boolean;
  extraDays?: number;
}

interface StageUpdateItem {
  notes: string;
  photos: string[];
  timestamp: string;
  stage: string;
  hasDelay: boolean;
  delayReason?: string;
  extraDays?: number;
}

interface ProductionTrackingCardProps {
  tracking: {
    id: number;
    currentStage: string;
    overallStatus: string;
    progress: number;
    estimatedStartDate?: string;
    estimatedEndDate?: string;
    actualStartDate?: string;
    actualEndDate?: string;
    notes?: string;
    stageUpdates?: ProductionStage[];
  };
  orderId?: number;
  sampleId?: number;
  onStageUpdate?: (update: { stage: string; notes: string; photos: string[]; hasDelay: boolean; delayReason?: string; extraDays?: number }) => void;
  onStageComplete?: (stage: string, nextStage: string | null) => void;
  onStageRevert?: (targetStage: string) => void;
  userUpdates?: StageUpdateItem[];
  completedStages?: string[];
  isManufacturer?: boolean; // New prop to control action buttons visibility
}

const stageOrder = [
  "PLANNING",
  "FABRIC",
  "CUTTING",
  "SEWING",
  "QUALITY",
  "PACKAGING",
  "SHIPPING",
];

const stageLabels: { [key: string]: string } = {
  PLANNING: "📋 Planlama",
  FABRIC: "🧵 Kumaş Tedarik",
  CUTTING: "✂️ Kesim",
  SEWING: "🪡 Dikiş",
  QUALITY: "✅ Kalite Kontrol",
  PACKAGING: "📦 Paketleme",
  SHIPPING: "🚚 Sevkiyat",
};

const stageStatusColors: { [key: string]: string } = {
  NOT_STARTED: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  ON_HOLD: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  REQUIRES_REVISION: "bg-red-100 text-red-700",
};

const stageStatusLabels: { [key: string]: string } = {
  NOT_STARTED: "Başlamadı",
  IN_PROGRESS: "Devam Ediyor",
  ON_HOLD: "Beklemede",
  COMPLETED: "Tamamlandı",
  REQUIRES_REVISION: "Revize Gerekiyor",
};

const getStageIcon = (status: string, isCurrent: boolean, isPast: boolean) => {
  if (isPast) return CheckCircle2; // Tamamlananlar yeşil check
  if (isCurrent) return Clock; // Aktif clock

  switch (status) {
    case "COMPLETED":
      return CheckCircle2;
    case "IN_PROGRESS":
      return Clock;
    case "REQUIRES_REVISION":
      return AlertCircle;
    default:
      return Circle;
  }
};

export function ProductionTrackingCard({
  tracking,
  orderId,
  sampleId,
  onStageUpdate,
  onStageComplete,
  onStageRevert,
  userUpdates = [],
  completedStages = [],
  isManufacturer = false, // Default to false for security - must explicitly pass true
}: ProductionTrackingCardProps) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [isStageUpdateDialogOpen, setIsStageUpdateDialogOpen] = useState(false);
  const [selectedStageForUpdate, setSelectedStageForUpdate] = useState<string>("PLANNING");

  // Debug log
  React.useEffect(() => {
    console.log("🔍 ProductionTrackingCard - isManufacturer:", isManufacturer);
  }, [isManufacturer]);

  const currentStageIndex = stageOrder.indexOf(tracking.currentStage);

  // Sync expandedStage with tracking.currentStage changes
  React.useEffect(() => {
    setExpandedStage(tracking.currentStage);
  }, [tracking.currentStage]);

  // Debug: Log user updates
  React.useEffect(() => {
    console.log("📊 ProductionTrackingCard userUpdates:", userUpdates);
  }, [userUpdates]);

  const handleCompleteStage = (stage: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    console.log("🔘 Complete button clicked for stage:", stage);

    // Direkt bir sonraki aşamaya geç
    const currentIndex = stageOrder.indexOf(stage);
    const nextStage = stageOrder[currentIndex + 1] || null;

    console.log(`✅ Stage ${stage} completed, moving to ${nextStage || "COMPLETED"}`);

    // Close current stage dropdown and open next stage
    if (nextStage) {
      setExpandedStage(nextStage);
    } else {
      setExpandedStage(null);
    }

    // Call parent callback if provided
    if (onStageComplete) {
      onStageComplete(stage, nextStage);
    }
  };

  const handleAddUpdate = (stage: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    console.log("📸 Add update button clicked for stage:", stage);
    setSelectedStageForUpdate(stage);
    setIsStageUpdateDialogOpen(true);
  };

  const handleStageUpdateSubmit = async (data: { stage: string; notes: string; photos: string[]; hasDelay: boolean; delayReason?: string; extraDays?: number }) => {
    // Call parent callback if provided
    if (onStageUpdate) {
      onStageUpdate(data);
    }
    // TODO: Implement GraphQL mutation to save stage update
    console.log("Stage update:", data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Production Tracking</CardTitle>
          <Badge
            className={
              tracking.overallStatus === "COMPLETED"
                ? "bg-green-100 text-green-700"
                : tracking.overallStatus === "BLOCKED"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }
          >
            {tracking.overallStatus}
          </Badge>
        </div>
        {/* Overall Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Overall Progress
            </span>
            <span className="text-sm font-medium">{tracking.progress}%</span>
          </div>
          <Progress value={tracking.progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Timeline */}
        <div className="space-y-1">
          {stageOrder.map((stage, index) => {
            const stageUpdate = tracking.stageUpdates?.find(
              (u: ProductionStage) => u.stage === stage
            );

            // Override status for completed stages
            let status = stageUpdate?.status || "NOT_STARTED";
            if (completedStages.includes(stage)) {
              status = "COMPLETED";
            }

            const isPast = index < currentStageIndex || completedStages.includes(stage);
            const isCurrent = stage === tracking.currentStage;
            const isExpanded = expandedStage === stage;
            const Icon = getStageIcon(status, isCurrent, isPast);

            // Get updates for this stage
            const stageUserUpdates = userUpdates.filter(u => u.stage === stage);
            const hasDelayedUpdate = stageUserUpdates.some(u => u.hasDelay);

            return (
              <div key={stage}>
                <div
                  onClick={() => setExpandedStage(isExpanded ? null : stage)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? "bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-400 shadow-md"
                      : isPast
                      ? "bg-green-50/50 border border-green-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  {/* Icon */}
                  <div className={`${isCurrent ? "animate-pulse" : ""}`}>
                    <Icon
                      className={`h-5 w-5 ${
                        isCurrent
                          ? "text-blue-600 font-bold"
                          : isPast
                          ? "text-green-600"
                          : status === "COMPLETED"
                          ? "text-green-600"
                          : status === "IN_PROGRESS"
                          ? "text-blue-600"
                          : status === "REQUIRES_REVISION"
                          ? "text-red-600"
                          : "text-gray-400"
                      }`}
                    />
                  </div>

                  {/* Stage info */}
                  <div className="flex-1 text-left">
                    <p className={`text-sm ${
                      isCurrent
                        ? "font-bold text-blue-700 text-base"
                        : "font-medium"
                    }`}>
                      {stageLabels[stage] || stage}
                    </p>
                    {stageUpdate && (
                      <p className="text-xs text-muted-foreground">
                        {stageUpdate.estimatedDays
                          ? `${stageUpdate.estimatedDays} days`
                          : ""}
                      </p>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <Badge className="bg-blue-600 text-white font-bold animate-pulse">
                        ⚡ AKTİF
                      </Badge>
                    )}

                    <Badge
                      variant="outline"
                      className={stageStatusColors[status]}
                    >
                      {stageStatusLabels[status] || status}
                    </Badge>

                    {/* User updates count */}
                    {stageUserUpdates.length > 0 && (
                      <Badge
                        variant="outline"
                        className={hasDelayedUpdate ? "bg-red-100 text-red-700 border-red-300" : "bg-blue-100 text-blue-700 border-blue-300"}
                      >
                        {stageUserUpdates.length} güncelleme
                      </Badge>
                    )}
                  </div>

                  {/* Expand icon */}
                  {(stageUpdate || stageUserUpdates.length > 0 || isCurrent) && (
                    <div>
                      {isExpanded ? (
                        <ChevronUp className={`h-4 w-4 ${isCurrent ? "text-blue-600 font-bold" : ""}`} />
                      ) : (
                        <ChevronDown className={`h-4 w-4 ${isCurrent ? "text-blue-600 font-bold" : ""}`} />
                      )}
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="ml-8 mt-2 p-4 bg-gray-50 rounded-lg space-y-3">
                    {isManufacturer && (
                      <div className="flex justify-end gap-2">
                        {status !== "COMPLETED" && (
                          <Button
                            type="button"
                            onClick={(e) => handleAddUpdate(stage, e)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <Camera className="h-3 w-3" />
                            Güncelleme Ekle
                          </Button>
                        )}
                        {isCurrent && status === "IN_PROGRESS" && (
                          <Button
                            type="button"
                            onClick={(e) => handleCompleteStage(stage, e)}
                            variant="default"
                            size="sm"
                            className="gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Tamamla ve Sonraki Aşamaya Geç
                          </Button>
                        )}
                      </div>
                    )}

                    {stageUpdate && (
                      <>
                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                      {stageUpdate.actualStartDate && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Started
                          </p>
                          <p className="font-medium">
                            {format(
                              new Date(stageUpdate.actualStartDate),
                              "dd MMM yyyy"
                            )}
                          </p>
                        </div>
                      )}
                      {stageUpdate.actualEndDate && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Completed
                          </p>
                          <p className="font-medium">
                            {format(
                              new Date(stageUpdate.actualEndDate),
                              "dd MMM yyyy"
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {stageUpdate.notes && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Notes
                        </p>
                        <p className="text-sm">{stageUpdate.notes}</p>
                      </div>
                    )}

                    {/* Photos */}
                    {stageUpdate.photos && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Photos
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {JSON.parse(stageUpdate.photos).map(
                            (photo: string, idx: number) => (
                              <div
                                key={idx}
                                className="aspect-square rounded-md overflow-hidden border"
                              >
                                <img
                                  src={photo}
                                  alt={`Stage photo ${idx + 1}`}
                                  className="w-full h-full object-cover hover:scale-110 transition-transform"
                                />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                        {/* Revision info */}
                        {stageUpdate.isRevision && (
                          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                            <AlertCircle className="h-3 w-3" />
                            <span>
                              Revision requested{" "}
                              {stageUpdate.extraDays &&
                                `(+${stageUpdate.extraDays} days)`}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {/* User Updates for this Stage */}
                    {stageUserUpdates.length > 0 ? (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <p className="text-xs font-medium text-gray-700">
                          Güncellemeler ({stageUserUpdates.length}) - {stage}
                        </p>
                        {stageUserUpdates
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((update, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded border space-y-2 ${
                              update.hasDelay
                                ? "bg-red-50 border-red-200"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">
                                {new Date(update.timestamp).toLocaleString("tr-TR", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              {update.hasDelay && update.extraDays && (
                                <Badge className="bg-red-600 text-white text-xs">
                                  +{update.extraDays} gün
                                </Badge>
                              )}
                            </div>

                            {update.hasDelay && update.delayReason && (
                              <div className="flex items-start gap-2 text-xs text-red-700 bg-red-100 p-2 rounded">
                                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{update.delayReason}</span>
                              </div>
                            )}

                            {!update.hasDelay && update.notes && (
                              <p className="text-xs text-gray-700">{update.notes}</p>
                            )}

                            {update.photos.length > 0 ? (
                              <div className="grid grid-cols-3 gap-1">
                                {update.photos.map((photo, photoIdx) => (
                                  <div
                                    key={photoIdx}
                                    className="aspect-square rounded overflow-hidden border relative"
                                  >
                                    <img
                                      src={photo}
                                      alt={`Update ${photoIdx + 1}`}
                                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                                      onLoad={() => {}}
                                      onError={() => {}}
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stage Update Dialog */}
        <StageUpdateDialog
          open={isStageUpdateDialogOpen}
          onOpenChange={setIsStageUpdateDialogOpen}
          onSubmit={handleStageUpdateSubmit}
          currentStage={selectedStageForUpdate}
          stageName={stageLabels[selectedStageForUpdate]}
        />

        {/* Overall Notes */}
        {tracking.notes && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium mb-2">Production Notes</h3>
            <p className="text-sm text-muted-foreground">{tracking.notes}</p>
          </div>
        )}

        {/* Estimated Timeline */}
        {(tracking.estimatedStartDate || tracking.estimatedEndDate) && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium mb-3">Estimated Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              {tracking.estimatedStartDate && (
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-medium">
                    {format(
                      new Date(tracking.estimatedStartDate),
                      "dd MMM yyyy"
                    )}
                  </p>
                </div>
              )}
              {tracking.estimatedEndDate && (
                <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="text-sm font-medium">
                    {format(new Date(tracking.estimatedEndDate), "dd MMM yyyy")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actual Timeline */}
        {(tracking.actualStartDate || tracking.actualEndDate) && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-3">Actual Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              {tracking.actualStartDate && (
                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <p className="text-xs text-muted-foreground">
                    Actually Started
                  </p>
                  <p className="text-sm font-medium">
                    {format(new Date(tracking.actualStartDate), "dd MMM yyyy")}
                  </p>
                </div>
              )}
              {tracking.actualEndDate && (
                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <p className="text-xs text-muted-foreground">
                    Actually Completed
                  </p>
                  <p className="text-sm font-medium">
                    {format(new Date(tracking.actualEndDate), "dd MMM yyyy")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stage Revert Section */}
        {isManufacturer && tracking.overallStatus === "IN_PROGRESS" && onStageRevert && (
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-orange-900 mb-1">
                  Aşama Geri Alma
                </h3>
                <p className="text-xs text-orange-700">
                  Yanlışlıkla onaylanan aşamaları geri alabilirsiniz
                </p>
              </div>
              <StageRevertDialog
                productionId={tracking.id}
                currentStage={tracking.currentStage}
                onRevert={onStageRevert}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Geri Al
                </Button>
              </StageRevertDialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
