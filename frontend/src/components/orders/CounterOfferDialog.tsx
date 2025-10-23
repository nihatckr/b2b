"use client";

import { CustomerCounterOfferDocument } from "@/__generated__/graphql";
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
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "urql";

interface CounterOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  currentPrice: number;
  currentDays: number;
  onSuccess?: () => void;
}

export function CounterOfferDialog({
  open,
  onOpenChange,
  orderId,
  currentPrice,
  currentDays,
  onSuccess,
}: CounterOfferDialogProps) {
  const [formData, setFormData] = useState({
    quotedPrice: currentPrice.toString(),
    quoteDays: currentDays.toString(),
    quoteNote: "",
  });

  const [, counterOffer] = useMutation(CustomerCounterOfferDocument);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(formData.quotedPrice);
    const days = parseInt(formData.quoteDays);

    if (isNaN(price) || price <= 0) {
      toast.error("Lütfen geçerli bir fiyat girin");
      return;
    }

    if (isNaN(days) || days <= 0) {
      toast.error("Lütfen geçerli bir süre girin");
      return;
    }

    const result = await counterOffer({
      id: Number(orderId),
      customerQuotedPrice: price,
      customerQuoteDays: days,
      customerQuoteNote: formData.quoteNote || null,
    });

    if (result.error) {
      toast.error(`Hata: ${result.error.message}`);
      return;
    }

    toast.success("✅ Karşı teklifiniz gönderildi!");
    onSuccess?.();
    onOpenChange(false);

    // Reset form
    setFormData({
      quotedPrice: currentPrice.toString(),
      quoteDays: currentDays.toString(),
      quoteNote: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>💬 Karşı Teklif Gönder</DialogTitle>
          <DialogDescription>
            Üreticinin teklifine farklı fiyat veya süre önerisinde bulunun.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Current Offer Display */}
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">Üreticinin Teklifi:</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Birim Fiyat:</span>
                  <p className="font-semibold">${currentPrice.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Üretim Süresi:</span>
                  <p className="font-semibold">{currentDays} gün</p>
                </div>
              </div>
            </div>

            {/* Counter Offer Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quotedPrice">Önerilen Birim Fiyat ($) *</Label>
                <Input
                  id="quotedPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.quotedPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, quotedPrice: e.target.value })
                  }
                  placeholder="12.50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quoteDays">
                  Önerilen Üretim Süresi (gün) *
                </Label>
                <Input
                  id="quoteDays"
                  type="number"
                  min="1"
                  value={formData.quoteDays}
                  onChange={(e) =>
                    setFormData({ ...formData, quoteDays: e.target.value })
                  }
                  placeholder="30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quoteNote">Not (Opsiyonel)</Label>
                <Textarea
                  id="quoteNote"
                  value={formData.quoteNote}
                  onChange={(e) =>
                    setFormData({ ...formData, quoteNote: e.target.value })
                  }
                  placeholder="Teklif ile ilgili açıklamalarınız..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type="submit">Karşı Teklif Gönder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
