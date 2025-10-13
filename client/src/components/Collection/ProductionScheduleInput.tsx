"use client";

import { Calculator } from "lucide-react";
import React from "react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ProductionScheduleInputProps {
  value: string; // JSON string
  onChange: (value: string) => void;
  disabled?: boolean;
}

const defaultSchedule = {
  PLANNING: 5,
  FABRIC: 3,
  CUTTING: 2,
  SEWING: 10,
  QUALITY: 2,
  PACKAGING: 2,
  SHIPPING: 1,
};

const stageLabels: { [key: string]: string } = {
  PLANNING: "📋 Planlama",
  FABRIC: "🧵 Kumaş Tedarik",
  CUTTING: "✂️ Kesim",
  SEWING: "🪡 Dikiş",
  QUALITY: "✅ Kalite Kontrol",
  PACKAGING: "📦 Paketleme",
  SHIPPING: "🚚 Sevkiyat",
};

export function ProductionScheduleInput({
  value,
  onChange,
  disabled = false,
}: ProductionScheduleInputProps) {
  const [schedule, setSchedule] = React.useState(() => {
    if (!value) return defaultSchedule;
    try {
      return JSON.parse(value);
    } catch {
      return defaultSchedule;
    }
  });

  const handleChange = (stage: string, days: number) => {
    const newSchedule = {
      ...schedule,
      [stage]: days,
    };
    setSchedule(newSchedule);
    onChange(JSON.stringify(newSchedule));
  };

  const totalDays = Object.values(schedule).reduce(
    (sum: number, days) => sum + (days as number),
    0
  );

  const stages = Object.keys(defaultSchedule);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Üretim Süreci Planı
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Her aşama için tahmini gün sayısını belirleyin
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {stages.map((stage) => (
            <div key={stage} className="space-y-1">
              <Label htmlFor={`stage-${stage}`} className="text-xs">
                {stageLabels[stage]}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`stage-${stage}`}
                  type="number"
                  min="0"
                  max="90"
                  value={schedule[stage] || 0}
                  onChange={(e) =>
                    handleChange(stage, parseInt(e.target.value) || 0)
                  }
                  disabled={disabled}
                  className="text-center"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  gün
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total calculation */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="font-medium">Toplam Üretim Süresi:</span>
            <Badge className="bg-primary text-lg px-4 py-1">
              {totalDays} gün
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Sipariş onaylandığında bu süre planına göre otomatik üretim takibi
            başlatılır
          </p>
        </div>

        {/* Visual Timeline Preview */}
        <div className="mt-4 space-y-2">
          <Label className="text-xs font-medium">Süreç Önizleme:</Label>
          <div className="flex gap-1">
            {stages.map((stage) => {
              const days = schedule[stage] || 0;
              const percentage = totalDays > 0 ? (days / totalDays) * 100 : 0;

              if (days === 0) return null;

              return (
                <div
                  key={stage}
                  className="relative group"
                  style={{ width: `${percentage}%` }}
                >
                  <div
                    className={`h-8 rounded transition-all ${
                      stage === "PLANNING"
                        ? "bg-blue-500"
                        : stage === "FABRIC"
                        ? "bg-purple-500"
                        : stage === "CUTTING"
                        ? "bg-pink-500"
                        : stage === "SEWING"
                        ? "bg-emerald-500"
                        : stage === "QUALITY"
                        ? "bg-cyan-500"
                        : stage === "PACKAGING"
                        ? "bg-amber-500"
                        : "bg-teal-500"
                    }`}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {stageLabels[stage]}: {days} gün
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Başlangıç</span>
            <span>{totalDays} gün sonra teslim</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
