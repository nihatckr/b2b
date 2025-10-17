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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface SampleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: number;
  collectionName: string;
  collectionImage?: string;
  type?: "standard" | "revision";
  onSubmit?: (data: SampleRequestData) => Promise<void>;
}

export interface SampleRequestData {
  collectionId: number;
  sampleType: "STANDARD" | "REVISION";
  customerNote?: string; // Opsiyonel - standart numune için zorunlu değil
}

export function SampleRequestModal({
  isOpen,
  onClose,
  collectionId,
  collectionName,
  collectionImage,
  type = "standard",
  onSubmit,
}: SampleRequestModalProps) {
  const [customerNote, setCustomerNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({
          collectionId,
          sampleType: "STANDARD",
          customerNote: customerNote.trim() || undefined, // Boşsa undefined gönder
        });
      }
      setCustomerNote("");
      onClose();
    } catch (error) {
      console.error("Sample request error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCustomerNote("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Standart Numune Talebi
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-gray-900">{collectionName}</span> ürününün aynen numunesini talep edin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Collection Image */}
          {collectionImage && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-gray-50">
              <Image
                src={collectionImage}
                alt={collectionName}
                fill
                className="object-cover"
                sizes="(max-width: 600px) 100vw, 600px"
              />
            </div>
          )}
          {!collectionImage && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Info about standard sample */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="font-medium text-blue-900 mb-1">📦 Standart Numune Talebi</p>
            <p className="text-xs text-blue-800">
              Bu ürünün aynen numunesini talep ediyorsunuz. Ürün özellikleri değiştirilmeyecektir.
            </p>
          </div>

          {/* Customer Note */}
          <div className="space-y-2">
            <Label htmlFor="note">
              Talep Notunuz <span className="text-gray-400 text-xs">(Opsiyonel)</span>
            </Label>
            <Textarea
              id="note"
              placeholder="Numune ile ilgili özel isteklerinizi, termin beklentinizi, numune adetini veya sorularınızı yazın..."
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              İsterseniz üretici için ek bilgi veya özel isteklerinizi belirtebilirsiniz.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">💡 Bilgi</p>
            <p className="text-xs">
              Numune talebiniz üreticiye iletilecektir. Üretici tahmini süre ve
              üretim detayları ile size geri dönüş yapacaktır.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            İptal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              "Talebi Gönder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
