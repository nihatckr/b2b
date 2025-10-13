"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
} from "lucide-react";
import React from "react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

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

const getStageIcon = (status: string) => {
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
}: ProductionTrackingCardProps) {
  const [expandedStage, setExpandedStage] = React.useState<string | null>(
    tracking.currentStage
  );

  const currentStageIndex = stageOrder.indexOf(tracking.currentStage);

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
            const status = stageUpdate?.status || "NOT_STARTED";
            const isPast = index < currentStageIndex;
            const isCurrent = stage === tracking.currentStage;
            const isExpanded = expandedStage === stage;
            const Icon = getStageIcon(status);

            return (
              <div key={stage}>
                <button
                  onClick={() => setExpandedStage(isExpanded ? null : stage)}
                  className="w-full"
                >
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50 ${
                      isCurrent ? "bg-blue-50 border border-blue-200" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div>
                      <Icon
                        className={`h-5 w-5 ${
                          status === "COMPLETED"
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
                      <p className="font-medium text-sm">
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
                    <Badge
                      variant="outline"
                      className={stageStatusColors[status]}
                    >
                      {stageStatusLabels[status] || status}
                    </Badge>

                    {/* Expand icon */}
                    {stageUpdate && (
                      <div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && stageUpdate && (
                  <div className="ml-8 mt-2 p-4 bg-gray-50 rounded-lg space-y-3">
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
                  </div>
                )}
              </div>
            );
          })}
        </div>

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
      </CardContent>
    </Card>
  );
}
