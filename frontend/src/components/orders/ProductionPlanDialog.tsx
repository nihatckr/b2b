"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductionStage {
  name: string;
  estimatedDays: number;
  notes: string;
}

interface ProductionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  onSuccess?: () => void;
}

const DEFAULT_STAGES: ProductionStage[] = [
  { name: "Kumaş Tedarik", estimatedDays: 7, notes: "" },
  { name: "Kesim", estimatedDays: 2, notes: "" },
  { name: "Dikim", estimatedDays: 5, notes: "" },
  { name: "Ütü ve Pres", estimatedDays: 1, notes: "" },
  { name: "Kalite Kontrol", estimatedDays: 1, notes: "" },
  { name: "Paketleme", estimatedDays: 1, notes: "" },
  { name: "Sevkiyat Hazırlık", estimatedDays: 1, notes: "" },
];

export function ProductionPlanDialog({
  open,
  onOpenChange,
  orderId,
  onSuccess,
}: ProductionPlanDialogProps) {
  const [stages, setStages] = useState<ProductionStage[]>(DEFAULT_STAGES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalDays = stages.reduce((sum, stage) => sum + stage.estimatedDays, 0);

  const updateStage = (
    index: number,
    field: keyof ProductionStage,
    value: string | number
  ) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], [field]: value };
    setStages(newStages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      const hasInvalidDays = stages.some(
        (stage) => stage.estimatedDays <= 0 || isNaN(stage.estimatedDays)
      );
      if (hasInvalidDays) {
        toast.error("Tüm aşamalar için geçerli gün sayısı giriniz");
        setIsSubmitting(false);
        return;
      }

      // TODO: Backend mutation
      // const result = await createProductionPlan({ orderId, stages });

      toast.success("✅ Üretim planı oluşturuldu!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Hata: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>7 Aşamalı Üretim Planı Oluştur</DialogTitle>
          <DialogDescription>
            Müşteri bu planı onayladıktan sonra sipariş kesinleşir.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-900">
              <Clock className="w-5 h-5" />
              <div>
                <p className="font-semibold">Toplam Süre: {totalDays} gün</p>
                <p className="text-sm text-blue-700">
                  Tahmini tamamlanma: {totalDays} iş günü
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-gray-50 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-lg">{stage.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`days-${index}`}>Tahmini Süre (Gün)</Label>
                    <Input
                      id={`days-${index}`}
                      type="number"
                      min="1"
                      value={stage.estimatedDays}
                      onChange={(e) =>
                        updateStage(
                          index,
                          "estimatedDays",
                          parseInt(e.target.value) || 0
                        )
                      }
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`notes-${index}`}>Notlar (Opsiyonel)</Label>
                  <Textarea
                    id={`notes-${index}`}
                    value={stage.notes}
                    onChange={(e) =>
                      updateStage(index, "notes", e.target.value)
                    }
                    placeholder="Bu aşama hakkında ek bilgi..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Oluşturuluyor..." : "Planı Oluştur ve Gönder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
