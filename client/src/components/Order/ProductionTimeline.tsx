"use client";

import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  FileCheck,
  Package,
  Play,
  Truck,
} from "lucide-react";
import { useState } from "react";

interface ProductionStage {
  key: string;
  label: string;
  icon: React.ElementType;
  status: string;
}

const PRODUCTION_STAGES: ProductionStage[] = [
  { key: "PENDING", label: "Beklemede", icon: Clock, status: "PENDING" },
  {
    key: "REVIEWED",
    label: "İnceleniyor",
    icon: FileCheck,
    status: "REVIEWED",
  },
  {
    key: "CONFIRMED",
    label: "Onaylandı",
    icon: CheckCircle,
    status: "CONFIRMED",
  },
  {
    key: "IN_PRODUCTION",
    label: "Üretimde",
    icon: Play,
    status: "IN_PRODUCTION",
  },
  {
    key: "PRODUCTION_COMPLETE",
    label: "Üretim Tamamlandı",
    icon: CheckCircle,
    status: "PRODUCTION_COMPLETE",
  },
  {
    key: "QUALITY_CHECK",
    label: "Kalite Kontrolde",
    icon: FileCheck,
    status: "QUALITY_CHECK",
  },
  { key: "SHIPPED", label: "Kargoda", icon: Truck, status: "SHIPPED" },
  {
    key: "DELIVERED",
    label: "Teslim Edildi",
    icon: Package,
    status: "DELIVERED",
  },
];

interface ProductionTimelineProps {
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
  isManufacturer?: boolean;
  progress?: number;
}

export function ProductionTimeline({
  currentStatus,
  onStatusChange,
  isManufacturer = false,
  progress = 0,
}: ProductionTimelineProps) {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  const getCurrentStageIndex = () => {
    const index = PRODUCTION_STAGES.findIndex(
      (s) => s.status === currentStatus
    );
    return index >= 0 ? index : 0;
  };

  const currentStageIndex = getCurrentStageIndex();

  const getStageStatus = (index: number) => {
    if (index < currentStageIndex) return "completed";
    if (index === currentStageIndex) return "active";
    return "upcoming";
  };

  const handleStageClick = (stage: ProductionStage, index: number) => {
    if (!isManufacturer || !onStatusChange) return;

    // Sadece geçmiş veya mevcut aşamaya tıklanabilir
    // İleriye atlama yapılmasın
    if (index <= currentStageIndex + 1) {
      onStatusChange(stage.status);
    }
  };

  return (
    <div className="w-full">
      {/* Timeline Bar */}
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200" />

        {/* Progress Line */}
        <div
          className="absolute top-6 left-0 h-1 bg-gradient-to-r from-blue-500 via-green-500 to-green-600 transition-all duration-500"
          style={{
            width: `${
              (currentStageIndex / (PRODUCTION_STAGES.length - 1)) * 100
            }%`,
          }}
        />

        {/* Stages */}
        <div className="relative flex justify-between items-start">
          {PRODUCTION_STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const status = getStageStatus(index);
            const isClickable =
              isManufacturer && index <= currentStageIndex + 1;
            const isHovered = hoveredStage === stage.key;

            return (
              <div
                key={stage.key}
                className="flex flex-col items-center"
                style={{ width: `${100 / PRODUCTION_STAGES.length}%` }}
                onMouseEnter={() => setHoveredStage(stage.key)}
                onMouseLeave={() => setHoveredStage(null)}
              >
                {/* Icon Circle */}
                <button
                  onClick={() => handleStageClick(stage, index)}
                  disabled={!isClickable}
                  className={`
                    relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                    transition-all duration-300 transform
                    ${
                      status === "completed"
                        ? "bg-green-500 text-white shadow-lg"
                        : ""
                    }
                    ${
                      status === "active"
                        ? "bg-blue-600 text-white shadow-xl scale-110 ring-4 ring-blue-200 animate-pulse"
                        : ""
                    }
                    ${status === "upcoming" ? "bg-gray-200 text-gray-400" : ""}
                    ${
                      isClickable
                        ? "cursor-pointer hover:scale-125 hover:shadow-2xl"
                        : "cursor-default"
                    }
                    ${isHovered && isClickable ? "scale-125" : ""}
                  `}
                  title={isClickable ? `${stage.label}'e geç` : stage.label}
                >
                  <Icon className="h-6 w-6" />
                </button>

                {/* Label */}
                <div className="mt-3 text-center">
                  <p
                    className={`text-xs font-medium ${
                      status === "active"
                        ? "text-blue-600 font-bold"
                        : status === "completed"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {stage.label}
                  </p>

                  {/* Status Badge for Active */}
                  {status === "active" && (
                    <Badge className="mt-1 bg-blue-100 text-blue-700 text-xs">
                      Aktif
                    </Badge>
                  )}

                  {/* Checkmark for Completed */}
                  {status === "completed" && (
                    <div className="flex items-center justify-center mt-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="mt-6 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
        <span className="text-sm text-blue-700 font-medium">
          Genel İlerleme:
        </span>
        <span className="text-2xl font-bold text-blue-900">{progress}%</span>
      </div>

      {/* Info */}
      {isManufacturer && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          💡 İpucu: Aşama iconlarına tıklayarak sipariş durumunu
          güncelleyebilirsiniz
        </p>
      )}
    </div>
  );
}
