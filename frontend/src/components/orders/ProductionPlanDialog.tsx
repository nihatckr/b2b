"use client";

import {
  CreateProductionPlanDocument,
  UpdateProductionPlanDocument,
} from "@/__generated__/graphql";
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
import { useMutation } from "urql";

interface ProductionStage {
  name: string;
  estimatedDays: number;
  notes: string;
}

interface ProductionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  customerDeadline?: string | null;
  quantity?: number;
  existingPlan?: any; // ProductionTracking with stageUpdates
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
  customerDeadline,
  quantity,
  existingPlan,
  onSuccess,
}: ProductionPlanDialogProps) {
  // Initialize stages from existing plan or use defaults
  const initializeStages = () => {
    if (existingPlan?.stageUpdates && existingPlan.stageUpdates.length > 0) {
      return existingPlan.stageUpdates.map((update: any) => ({
        name: update.stage
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (l: string) => l.toUpperCase()),
        estimatedDays: update.estimatedDays || 1,
        notes: update.notes || "",
      }));
    }
    return DEFAULT_STAGES;
  };

  const [stages, setStages] = useState<ProductionStage[]>(initializeStages());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, createProductionPlan] = useMutation(CreateProductionPlanDocument);
  const [, updateProductionPlan] = useMutation(UpdateProductionPlanDocument);

  const totalDays = stages.reduce((sum, stage) => sum + stage.estimatedDays, 0);
  const isUpdateMode = existingPlan && existingPlan.id;

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

      // Create or update production plan
      let result;
      if (isUpdateMode) {
        result = await updateProductionPlan({
          productionId: Number(existingPlan.id),
          stagesJson: JSON.stringify(stages),
          notes: `Güncellenen üretim planı - Toplam ${totalDays} gün`,
        });
      } else {
        result = await createProductionPlan({
          orderId,
          stagesJson: JSON.stringify(stages),
          // estimatedStartDate: new Date().toISOString(), // Optional - backend will use current date
          notes: `7 aşamalı üretim planı - Toplam ${totalDays} gün`,
        });
      }

      if (result.error) {
        toast.error(`Hata: ${result.error.message}`);
        return;
      }

      // Debug: Log the mutation result
      console.log("Mutation Result:", result.data);
      if (
        isUpdateMode &&
        result.data &&
        "updateProductionPlan" in result.data
      ) {
        console.log(
          "Updated Plan Status:",
          result.data.updateProductionPlan?.customerApprovalStatus
        );
        console.log(
          "Revision Count:",
          result.data.updateProductionPlan?.revisionCount
        );
      }

      toast.success(
        isUpdateMode
          ? "✅ Üretim planı revize edildi! Müşteriye göndermek için 'Müşteriye Gönder' butonunu kullanın."
          : "✅ Üretim planı oluşturuldu! Müşteriye göndermek için 'Müşteriye Gönder' butonunu kullanın."
      );
      onSuccess?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Bilinmeyen hata";
      toast.error(`Hata: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isUpdateMode
              ? "Üretim Planını Güncelle"
              : "7 Aşamalı Üretim Planı Oluştur"}
          </DialogTitle>
          <DialogDescription>
            {isUpdateMode
              ? "Mevcut üretim planını güncelleyebilirsiniz."
              : "Plan oluşturduktan sonra müşteriye gönderim için 'Müşteriye Gönder' butonunu kullanın."}
          </DialogDescription>
        </DialogHeader>

        {/* Customer Requirements */}
        {(customerDeadline || quantity) && (
          <div className="  border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-2">
              Müşteri Gereksinimleri
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {customerDeadline && (
                <div>
                  <p className="text-amber-700 font-medium">
                    Hedef Teslimat Tarihi:
                  </p>
                  <p className="text-amber-900">
                    {new Date(customerDeadline).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
              {customerDeadline && (
                <div>
                  <p className="text-amber-700 font-medium">Kalan Süre:</p>
                  <p className="text-amber-900 font-semibold">
                    {(() => {
                      const today = new Date();
                      const deadline = new Date(customerDeadline);
                      const diffTime = deadline.getTime() - today.getTime();
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                      );
                      return diffDays > 0
                        ? `${diffDays} gün`
                        : `${Math.abs(diffDays)} gün geçmiş`;
                    })()}
                  </p>
                </div>
              )}
              {quantity && (
                <div>
                  <p className="text-amber-700 font-medium">Sipariş Miktarı:</p>
                  <p className="text-amber-900">{quantity} adet</p>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="  border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900">
                <Clock className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Toplam Süre: {totalDays} gün</p>
                  <p className="text-sm text-blue-700">
                    Tahmini tamamlanma: {totalDays} iş günü
                  </p>
                </div>
              </div>
              {customerDeadline && (
                <div className="text-right">
                  {(() => {
                    const today = new Date();
                    const deadline = new Date(customerDeadline);
                    const diffTime = deadline.getTime() - today.getTime();
                    const remainingDays = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24)
                    );
                    const isOnTime = totalDays <= remainingDays;
                    return (
                      <div
                        className={`text-sm font-medium ${
                          isOnTime ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {isOnTime ? "✅ Zamanında" : "⚠️ Gecikme riski"}
                        <br />
                        {isOnTime
                          ? `${remainingDays - totalDays} gün erken`
                          : `${totalDays - remainingDays} gün fazla`}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm">
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
              {isSubmitting
                ? isUpdateMode
                  ? "Güncelleniyor..."
                  : "Oluşturuluyor..."
                : isUpdateMode
                ? "Planı Güncelle"
                : "Planı Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
