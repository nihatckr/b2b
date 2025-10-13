"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  Factory,
} from "lucide-react";

interface StageUpdate {
  stage: string;
  status: string;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  notes?: string | null;
}

interface ProductionTimelineProps {
  currentStage: string;
  overallStatus: string;
  progress: number;
  stageUpdates: StageUpdate[];
}

export function ProductionTimeline({
  currentStage,
  overallStatus,
  progress,
  stageUpdates,
}: ProductionTimelineProps) {
  const stages = [
    { key: "PLANNING", label: "Planlama" },
    { key: "FABRIC", label: "Kumaş" },
    { key: "CUTTING", label: "Kesim" },
    { key: "SEWING", label: "Dikiş" },
    { key: "QUALITY", label: "Kalite" },
    { key: "PACKAGING", label: "Paketleme" },
    { key: "SHIPPING", label: "Kargo" },
  ];

  const getStageIcon = (stageKey: string) => {
    const update = stageUpdates.find((u) => u.stage === stageKey);

    if (!update) return <Circle className="h-5 w-5 text-gray-300" />;

    if (update.status === "COMPLETED") {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (update.status === "IN_PROGRESS") {
      return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
    }
    if (update.status === "REQUIRES_REVISION") {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }

    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500">✓ Tamamlandı</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500">⚙️ Devam Ediyor</Badge>;
      case "ON_HOLD":
        return <Badge className="bg-yellow-500">⏸ Beklemede</Badge>;
      case "REQUIRES_REVISION":
        return <Badge className="bg-orange-500">🔄 Revize</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Üretim Takibi
          </CardTitle>
          <Badge>{overallStatus}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>İlerleme</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const update = stageUpdates.find((u) => u.stage === stage.key);
            const isActive = currentStage === stage.key;

            return (
              <div key={stage.key} className="flex items-start gap-3">
                <div className="mt-0.5">{getStageIcon(stage.key)}</div>

                <div className="flex-1">
                  <div
                    className={`font-medium ${isActive ? "text-primary" : ""}`}
                  >
                    {stage.label}
                  </div>

                  {update && (
                    <div className="mt-1 space-y-1">
                      {getStatusBadge(update.status)}
                      {update.notes && (
                        <p className="text-xs text-muted-foreground">
                          {update.notes}
                        </p>
                      )}
                      {update.actualStartDate && (
                        <p className="text-xs text-muted-foreground">
                          Başlangıç:{" "}
                          {new Date(update.actualStartDate).toLocaleDateString(
                            "tr-TR"
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
