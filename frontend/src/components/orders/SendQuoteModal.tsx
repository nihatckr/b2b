"use client";

import { useState } from "react";
import { useMutation } from "urql";
import { SendQuoteDocument } from "@/__generated__/graphql";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Send } from "lucide-react";
import { toast } from "sonner";

interface SendQuoteModalProps {
  orderId: number;
  orderNumber: string;
  quantity: number;
  targetPrice?: number;
  onQuoteSent?: () => void;
}

export function SendQuoteModal({
  orderId,
  orderNumber,
  quantity,
  targetPrice,
  onQuoteSent,
}: SendQuoteModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    unitPrice: targetPrice || 0,
    productionDays: 30,
    note: "",
  });

  const [, sendQuote] = useMutation(SendQuoteDocument);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.unitPrice || formData.unitPrice <= 0) {
      toast.error("Geçerli bir birim fiyat giriniz");
      return;
    }

    if (!formData.productionDays || formData.productionDays <= 0) {
      toast.error("Geçerli bir üretim süresi giriniz");
      return;
    }

    try {
      const result = await sendQuote({
        id: orderId,
        unitPrice: formData.unitPrice,
        productionDays: formData.productionDays,
        note: formData.note || null,
      });

      if (result.error) {
        toast.error(
          "Teklif gönderilirken hata oluştu: " + result.error.message
        );
        return;
      }

      toast.success("Teklif başarıyla gönderildi!");
      setOpen(false);
      onQuoteSent?.();
    } catch (error) {
      console.error("Quote sending error:", error);
      toast.error("Beklenmeyen bir hata oluştu");
    }
  };

  const totalPrice = formData.unitPrice * quantity;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          Teklif Gönder
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Teklif Gönder
          </DialogTitle>
          <DialogDescription>
            {orderNumber} siparişi için fiyat ve teslimat süresi teklifinizi
            gönderin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order Summary */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sipariş:</span>
              <span className="font-medium">{orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Miktar:</span>
              <span className="font-medium">
                {quantity?.toLocaleString()} adet
              </span>
            </div>
            {targetPrice && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hedef Fiyat:</span>
                <span className="font-medium">{targetPrice}₺/adet</span>
              </div>
            )}
          </div>

          {/* Unit Price */}
          <div className="space-y-2">
            <Label htmlFor="unitPrice">Birim Fiyat (₺)</Label>
            <Input
              id="unitPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  unitPrice: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Birim fiyat giriniz"
              required
            />
          </div>

          {/* Production Days */}
          <div className="space-y-2">
            <Label htmlFor="productionDays">Üretim Süresi (Gün)</Label>
            <Input
              id="productionDays"
              type="number"
              min="1"
              value={formData.productionDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  productionDays: parseInt(e.target.value) || 0,
                })
              }
              placeholder="Üretim süresi giriniz"
              required
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Not (Opsiyonel)</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              placeholder="Teklifiniz hakkında açıklama..."
              rows={3}
            />
          </div>

          {/* Price Summary */}
          {formData.unitPrice > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Birim Fiyat:</span>
                <span className="font-medium text-blue-900">
                  {formData.unitPrice.toLocaleString()}₺
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-blue-700">Toplam Tutar:</span>
                <span className="text-blue-900">
                  {totalPrice.toLocaleString()}₺
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Teslimat:</span>
                <span className="text-blue-900">
                  {formData.productionDays} gün
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              İptal
            </Button>
            <Button type="submit" className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Teklif Gönder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
