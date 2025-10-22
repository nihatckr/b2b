"use client";

import { useState } from "react";
import { useMutation } from "urql";
import {
  AcceptQuoteDocument,
  RejectQuoteDocument,
} from "@/__generated__/graphql";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface QuoteResponseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  orderNumber: string;
  quote: {
    unitPrice: number;
    totalPrice: number;
    productionDays: number;
    note?: string;
  };
  quantity: number;
  onResponse?: () => void;
}

export function QuoteResponseModal({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  quote,
  quantity,
  onResponse,
}: QuoteResponseModalProps) {
  const [action, setAction] = useState<"accept" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");

  const [, acceptQuote] = useMutation(AcceptQuoteDocument);
  const [, rejectQuote] = useMutation(RejectQuoteDocument);

  const handleAccept = async () => {
    try {
      const result = await acceptQuote({
        id: orderId,
        note: note || null,
      });

      if (result.error) {
        toast.error(
          "Teklif kabul edilirken hata oluştu: " + result.error.message
        );
        return;
      }

      toast.success("Teklif kabul edildi! Üretim başlayacak.");
      onOpenChange(false);
      onResponse?.();
    } catch (error) {
      console.error("Accept quote error:", error);
      toast.error("Beklenmeyen bir hata oluştu");
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("Red nedeni belirtiniz");
      return;
    }

    try {
      const result = await rejectQuote({
        id: orderId,
        reason: reason,
      });

      if (result.error) {
        toast.error(
          "Teklif reddedilirken hata oluştu: " + result.error.message
        );
        return;
      }

      toast.success("Teklif reddedildi.");
      onOpenChange(false);
      onResponse?.();
    } catch (error) {
      console.error("Reject quote error:", error);
      toast.error("Beklenmeyen bir hata oluştu");
    }
  };

  const resetForm = () => {
    setAction(null);
    setNote("");
    setReason("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Teklif Değerlendirme
          </DialogTitle>
          <DialogDescription>
            {orderNumber} siparişi için gelen teklifi değerlendirin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quote Details */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-blue-900">Gelen Teklif</h4>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-blue-700">Birim Fiyat</p>
                  <p className="font-semibold text-blue-900">
                    {quote.unitPrice.toLocaleString()}₺
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-blue-700">Teslimat</p>
                  <p className="font-semibold text-blue-900">
                    {quote.productionDays} gün
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-blue-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Toplam Tutar:</span>
                <span className="text-lg font-bold text-blue-900">
                  {quote.totalPrice.toLocaleString()}₺
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {quantity?.toLocaleString()} adet ×{" "}
                {quote.unitPrice.toLocaleString()}₺
              </p>
            </div>

            {quote.note && (
              <div className="border-t border-blue-200 pt-3">
                <p className="text-sm text-blue-700 mb-1">Üretici Notu:</p>
                <p className="text-sm text-blue-900 bg-white p-2 rounded border">
                  {quote.note}
                </p>
              </div>
            )}
          </div>

          {/* Action Selection */}
          {!action && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setAction("accept")}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Kabul Et
              </Button>
              <Button onClick={() => setAction("reject")} variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Reddet
              </Button>
            </div>
          )}

          {/* Accept Form */}
          {action === "accept" && (
            <div className="space-y-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-green-800 font-medium">Teklifi Kabul Et</p>
                <p className="text-green-700 text-sm">
                  Bu teklifi kabul ettiğinizde üretim süreci başlayacaktır.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="acceptNote">Not (Opsiyonel)</Label>
                <Textarea
                  id="acceptNote"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Kabul notu veya özel taleplerinizi yazabilirsiniz..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAction(null)}
                  className="flex-1"
                >
                  Geri
                </Button>
                <Button
                  onClick={handleAccept}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Onayla
                </Button>
              </div>
            </div>
          )}

          {/* Reject Form */}
          {action === "reject" && (
            <div className="space-y-4">
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-red-800 font-medium">Teklifi Reddet</p>
                <p className="text-red-700 text-sm">
                  Red nedeni belirtmeniz üreticinin yeni teklif hazırlamasına
                  yardımcı olur.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejectReason">Red Nedeni *</Label>
                <Textarea
                  id="rejectReason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Örn: Fiyat yüksek, teslimat süresi uzun, başka teklif bekliyorum..."
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAction(null)}
                  className="flex-1"
                >
                  Geri
                </Button>
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reddet
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
