"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useState } from "react";

const STAGE_LABELS: { [key: string]: string } = {
  PLANNING: "📋 Planlama",
  FABRIC: "🧵 Kumaş Tedarik",
  CUTTING: "✂️ Kesim",
  SEWING: "🪡 Dikiş",
  QUALITY: "✅ Kalite Kontrol",
  PACKAGING: "📦 Paketleme",
  SHIPPING: "🚚 Sevkiyat",
};

const STAGE_ORDER = ["PLANNING", "FABRIC", "CUTTING", "SEWING", "QUALITY", "PACKAGING", "SHIPPING"];

interface StageRevertDialogProps {
  productionId: number;
  currentStage: string;
  onRevert: (targetStage: string) => void;
  children: React.ReactNode;
}

export function StageRevertDialog({
  productionId,
  currentStage,
  onRevert,
  children
}: StageRevertDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const availableStages = STAGE_ORDER.slice(0, currentIndex).reverse(); // Previous stages only

  const handleRevert = async () => {
    if (!selectedStage) return;

    setIsLoading(true);
    try {
      await onRevert(selectedStage);
      setIsOpen(false);
      setSelectedStage("");
    } catch (error) {
      console.error("Error reverting stage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (availableStages.length === 0) {
    return null; // No stages to revert to
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-orange-600" />
            Aşamayı Geri Al
          </DialogTitle>
          <DialogDescription>
            Yanlışlıkla onaylanan aşamaları geri alabilirsiniz. Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-blue-900">Mevcut Aşama:</span>
            </div>
            <Badge className="bg-blue-600 text-white">
              {STAGE_LABELS[currentStage] || currentStage}
            </Badge>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Geri Alınacak Aşama:
            </label>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger>
                <SelectValue placeholder="Bir aşama seçin..." />
              </SelectTrigger>
              <SelectContent>
                {availableStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    <div className="flex items-center gap-2">
                      <span>{STAGE_LABELS[stage] || stage}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStage && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium mb-1">Dikkat!</p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>{STAGE_LABELS[selectedStage]}</strong> aşamasına geri dönülecek</li>
                    <li>• Bu aşamadan sonraki tüm aşamalar sıfırlanacak</li>
                    <li>• Aşama tekrar <strong>Devam Ediyor</strong> durumuna geçecek</li>
                    <li>• Bu işlem geri alınamaz</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            İptal
          </Button>
          <Button
            onClick={handleRevert}
            disabled={!selectedStage || isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? "Geri Alınıyor..." : "Geri Al"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

