"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  CheckCircle,
  Package,
  Scissors,
  Shirt,
  Shield,
  Box,
  Truck,
  Play,
  Pause,
} from "lucide-react";

interface ProductionStage {
  stage: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const productionStages: ProductionStage[] = [
  {
    stage: "PLANNING",
    label: "Planlama",
    icon: Clock,
    description: "Üretim şeması ve kaynak planlaması",
  },
  {
    stage: "FABRIC",
    label: "Kumaş Tedarik",
    icon: Package,
    description: "Kumaş tedariki ve hazırlık",
  },
  {
    stage: "CUTTING",
    label: "Kesim",
    icon: Scissors,
    description: "Kalıp hazırlama ve kesim işlemleri",
  },
  {
    stage: "SEWING",
    label: "Dikim",
    icon: Shirt,
    description: "Montaj ve dikim işlemleri",
  },
  {
    stage: "QUALITY",
    label: "Kalite Kontrol",
    icon: Shield,
    description: "Ürün kalite testleri",
  },
  {
    stage: "PACKAGING",
    label: "Paketleme",
    icon: Box,
    description: "Ürünler paketleniyor ve etiketleniyor",
  },
  {
    stage: "SHIPPING",
    label: "Kargo Hazırlık",
    icon: Truck,
    description: "Kargo için son hazırlıklar",
  },
];

interface ProductionTrackingProps {
  orderId: number;
  currentStage?: string;
  progress?: number;
  status?: string;
  estimatedEndDate?: string;
  actualStartDate?: string;
  notes?: string;
  isManufacturer?: boolean;
}

export function ProductionTracking({
  currentStage = "PLANNING",
  progress = 0,
  status = "IN_PROGRESS",
  estimatedEndDate,
  actualStartDate,
  notes,
  isManufacturer = false,
}: ProductionTrackingProps) {
  const getCurrentStageIndex = () => {
    return productionStages.findIndex((stage) => stage.stage === currentStage);
  };

  const currentStageIndex = getCurrentStageIndex();

  const getStageStatus = (index: number) => {
    if (index < currentStageIndex) return "completed";
    if (index === currentStageIndex) return "current";
    return "pending";
  };

  const getStageColor = (stageStatus: string) => {
    switch (stageStatus) {
      case "completed":
        return "text-green-600 bg-green-100 border-green-200";
      case "current":
        return "text-blue-600 bg-blue-100 border-blue-200";
      default:
        return "text-gray-400 bg-gray-50 border-gray-200";
    }
  };

  const getStageIcon = (
    stageStatus: string,
    IconComponent: React.ComponentType<{ className?: string }>
  ) => {
    const baseClass = "h-5 w-5";

    switch (stageStatus) {
      case "completed":
        return <CheckCircle className={`${baseClass} text-green-600`} />;
      case "current":
        return <IconComponent className={`${baseClass} text-blue-600`} />;
      default:
        return <IconComponent className={`${baseClass} text-gray-400`} />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Üretim Takibi
          </CardTitle>
          <Badge variant={status === "COMPLETED" ? "default" : "secondary"}>
            {status === "COMPLETED" ? "Tamamlandı" : "Devam Ediyor"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Genel İlerleme</span>
            <span className="text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {productionStages.map((stage, index) => {
            const stageStatus = getStageStatus(index);
            const isLast = index === productionStages.length - 1;

            return (
              <div key={stage.stage} className="flex items-start gap-4">
                {/* Stage Icon */}
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 ${getStageColor(
                    stageStatus
                  )}`}
                >
                  {getStageIcon(stageStatus, stage.icon)}

                  {/* Connecting Line */}
                  {!isLast && (
                    <div
                      className={`absolute top-10 left-1/2 w-0.5 h-8 -translate-x-0.5 ${
                        stageStatus === "completed"
                          ? "bg-green-300"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>

                {/* Stage Content */}
                <div className="flex-1 min-w-0 pb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={`font-medium ${
                        stageStatus === "completed"
                          ? "text-green-700"
                          : stageStatus === "current"
                          ? "text-blue-700"
                          : "text-gray-500"
                      }`}
                    >
                      {stage.label}
                    </h4>

                    {stageStatus === "current" && isManufacturer && (
                      <Button size="sm" variant="outline" className="ml-auto">
                        <Play className="h-3 w-3 mr-1" />
                        Başla
                      </Button>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {stage.description}
                  </p>

                  {stageStatus === "completed" && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>Tamamlandı</span>
                    </div>
                  )}

                  {stageStatus === "current" && (
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <Clock className="h-3 w-3" />
                      <span>Devam ediyor...</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        {(estimatedEndDate || actualStartDate || notes) && (
          <div className="border-t pt-4 space-y-3">
            {actualStartDate && (
              <div className="flex items-center gap-2 text-sm">
                <Play className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">Başlangıç:</span>
                <span className="font-medium">
                  {new Date(actualStartDate).toLocaleDateString("tr-TR")}
                </span>
              </div>
            )}

            {estimatedEndDate && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Tahmini Bitiş:</span>
                <span className="font-medium">
                  {new Date(estimatedEndDate).toLocaleDateString("tr-TR")}
                </span>
              </div>
            )}

            {notes && (
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-700">
                  Notlar:
                </span>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Manufacturer Actions */}
        {isManufacturer && status !== "COMPLETED" && (
          <div className="border-t pt-4 flex gap-2">
            <Button size="sm" variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Duraklat
            </Button>
            <Button size="sm">Aşamayı Tamamla</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
