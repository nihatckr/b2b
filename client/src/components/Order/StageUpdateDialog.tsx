"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { AlertCircle, AlertTriangle, Camera, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const STAGE_LABELS: { [key: string]: string } = {
  PLANNING: "📋 Planlama",
  FABRIC: "🧵 Kumaş Tedarik",
  CUTTING: "✂️ Kesim",
  SEWING: "🪡 Dikiş",
  QUALITY: "✅ Kalite Kontrol",
  PACKAGING: "📦 Paketleme",
  SHIPPING: "🚚 Sevkiyat",
};

interface StageUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { stage: string; notes: string; photos: string[]; hasDelay: boolean; delayReason?: string; extraDays?: number }) => Promise<void>;
  currentStage: string;
  stageName?: string;
}

export function StageUpdateDialog({
  open,
  onOpenChange,
  onSubmit,
  currentStage,
  stageName,
}: StageUpdateDialogProps) {
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [hasDelay, setHasDelay] = useState(false);
  const [delayReason, setDelayReason] = useState("");
  const [extraDays, setExtraDays] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setNotes("");
      setPhotos([]);
      setHasDelay(false);
      setDelayReason("");
      setExtraDays("");
    }
  }, [open]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedPhotos: string[] = [];

      for (const file of Array.from(files)) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} çok büyük (max 5MB)`);
          continue;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} bir resim dosyası değil`);
          continue;
        }

        // Upload file to backend with production subfolder
        const formData = new FormData();
        formData.append("file", file);
        formData.append("subfolder", "production"); // Specify production folder

        const response = await fetch("http://localhost:4000/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const result = await response.json();
        // Backend returns { data: { path: "/uploads/production/filename.jpg" } }
        const photoUrl = `http://localhost:4000${result.data.path}`;
        console.log("📸 Photo uploaded:", photoUrl);
        uploadedPhotos.push(photoUrl);
      }

      console.log("📸 Uploaded photos:", uploadedPhotos);
      setPhotos([...photos, ...uploadedPhotos]);
      toast.success(`${uploadedPhotos.length} fotoğraf yüklendi`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Fotoğraf yüklenirken hata oluştu");
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Gecikme varsa validasyonlar
    if (hasDelay) {
      if (!delayReason.trim()) {
        toast.error("Gecikme sebebi girilmesi zorunludur");
        return;
      }
      if (!extraDays || parseInt(extraDays) <= 0) {
        toast.error("Ek süre girilmesi zorunludur");
        return;
      }
    } else {
      // Gecikme yoksa normal güncelleme - not veya fotoğraf opsiyonel
      if (!notes.trim() && photos.length === 0) {
        toast.error("Lütfen en az bir not veya fotoğraf ekleyin");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        stage: currentStage,
        notes: notes.trim(),
        photos,
        hasDelay,
        delayReason: hasDelay ? delayReason.trim() : undefined,
        extraDays: hasDelay && extraDays ? parseInt(extraDays) : undefined
      };

      console.log("🚀 Submitting update:", updateData);
      await onSubmit(updateData);
      onOpenChange(false);
      toast.success(hasDelay ? "Gecikme kaydedildi ve teslim tarihi güncellendi" : "Güncelleme başarıyla kaydedildi");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Güncelleme kaydedilirken hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {STAGE_LABELS[currentStage] || stageName || currentStage} - Güncelleme Ekle
          </DialogTitle>
          <DialogDescription>
            Bu aşama için fotoğraf ve detaylar ekleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Delay Checkbox */}
          <div className="flex items-start space-x-3 p-4 border-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50">
            <Checkbox
              id="hasDelay"
              checked={hasDelay}
              onCheckedChange={(checked) => setHasDelay(checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label
                htmlFor="hasDelay"
                className="text-base font-semibold cursor-pointer flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Bu aşamada gecikme yaşanıyor
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Planlanan süreden fazla zaman gerekiyorsa işaretleyin
              </p>
            </div>
          </div>

          {/* Delay Details - Only shown if hasDelay is true */}
          {hasDelay && (
            <div className="space-y-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 font-medium">
                <AlertCircle className="h-4 w-4" />
                <span>Gecikme Bilgileri (Zorunlu)</span>
              </div>

              {/* Delay Reason */}
              <div className="space-y-2">
                <Label className="text-red-700">Gecikme Sebebi *</Label>
                <Textarea
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  placeholder="Gecikme nedenini detaylı açıklayın..."
                  rows={3}
                  className="resize-none border-red-300 focus:border-red-500"
                />
              </div>

              {/* Extra Days */}
              <div className="space-y-2">
                <Label className="text-red-700">Ek Süre (Gün) *</Label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={extraDays}
                      onChange={(e) => setExtraDays(e.target.value)}
                      placeholder="Örn: 3"
                      className="border-red-300 focus:border-red-500"
                    />
                  </div>
                  <span className="text-sm text-red-700 pb-2 whitespace-nowrap font-medium">
                    gün ek süre
                  </span>
                </div>
                {extraDays && parseInt(extraDays) > 0 && (
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-100 p-2 rounded border border-red-300">
                    <AlertCircle className="h-3 w-3" />
                    <span className="font-medium">
                      Teslim tarihi {extraDays} gün ileri alınacak
                    </span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Notes - Normal Update */}
          {!hasDelay && (
            <div className="space-y-2">
              <Label>Notlar</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Aşama hakkında detaylar, güncellemeler..."
                rows={4}
                className="resize-none"
              />
            </div>
          )}

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className={hasDelay ? "text-red-700" : ""}>
              Fotoğraflar {hasDelay && "(Opsiyonel)"}
            </Label>
            <div className="space-y-3">
              {/* Upload Button */}
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                  id="photo-upload"
                />
                <Label
                  htmlFor="photo-upload"
                  className={`
                    flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg
                    cursor-pointer transition-colors
                    ${hasDelay
                      ? "border-red-300 hover:border-red-500 hover:bg-red-50"
                      : "hover:border-blue-500 hover:bg-blue-50"}
                    ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Yükleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">
                        {hasDelay ? "Kanıt Fotoğrafı Ekle" : "Fotoğraf Yükle"}
                      </span>
                    </>
                  )}
                </Label>
                <p className="text-xs text-gray-500">
                  Max 5MB, birden fazla seçilebilir
                </p>
              </div>

              {/* Photo Preview Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border group"
                    >
                      <Image
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            variant={hasDelay ? "destructive" : "default"}
            className={hasDelay ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : hasDelay ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Gecikmeyi Kaydet
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Güncellemeyi Kaydet
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
