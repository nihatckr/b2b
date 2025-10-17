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
import { useToast } from "@/hooks/use-toast";
import { Calendar, Loader2, Minus, Plus, ShoppingCart, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface AddToOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: number;
  collectionName: string;
  moq?: number;
  maxQuantity?: number;
  targetPrice?: number;
  targetLeadTime?: string;
  onSubmit?: (data: OrderItemData) => Promise<void>;
}

export interface OrderItemData {
  collectionId: number;
  quantity: number;
  customerTargetPrice?: number;
  customerTargetLeadTime?: number;
  customerNote: string;
  attachments?: File[];
}

export function AddToOrderModal({
  isOpen,
  onClose,
  collectionId,
  collectionName,
  moq = 100,
  maxQuantity = 100000,
  targetPrice,
  targetLeadTime,
  onSubmit,
}: AddToOrderModalProps) {
  const [quantity, setQuantity] = useState(moq);
  const [customerTargetPrice, setCustomerTargetPrice] = useState<string>("");
  const [customerTargetLeadTime, setCustomerTargetLeadTime] = useState<string>("");
  const [customerNote, setCustomerNote] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value) || 0;
    // Kullanıcı manuel olarak sayı girebilir ama min/max sınırları içinde kalmalı
    if (num <= maxQuantity) {
      setQuantity(num);
    } else {
      setQuantity(maxQuantity);
    }
  };

  const incrementQuantity = () => {
    // Birer birer artır
    setQuantity((prev) => Math.min(maxQuantity, prev + 1));
  };

  const decrementQuantity = () => {
    // Birer birer azalt
    setQuantity((prev) => Math.max(moq, prev - 1));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleSubmit = async () => {
    if (quantity < moq) {
      toast({
        title: "Geçersiz Miktar",
        description: `Minimum sipariş miktarı ${moq} adettir. Lütfen en az ${moq} adet sipariş verin.`,
        variant: "destructive",
      });
      return;
    }

    if (quantity > maxQuantity) {
      toast({
        title: "Geçersiz Miktar",
        description: `Maksimum sipariş miktarı ${maxQuantity.toLocaleString()} adettir. Lütfen daha düşük bir miktar girin.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({
          collectionId,
          quantity,
          customerTargetPrice: customerTargetPrice ? parseFloat(customerTargetPrice) : undefined,
          customerTargetLeadTime: customerTargetLeadTime ? parseInt(customerTargetLeadTime) : undefined,
          customerNote,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
      }
      // Reset form
      setQuantity(moq);
      setCustomerTargetPrice("");
      setCustomerTargetLeadTime("");
      setCustomerNote("");
      setAttachments([]);
      onClose();
    } catch (error) {
      console.error("Add to order error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setQuantity(moq);
    setCustomerTargetPrice("");
    setCustomerTargetLeadTime("");
    setCustomerNote("");
    setAttachments([]);
    onClose();
  };

  const estimatedTotal = customerTargetPrice
    ? quantity * parseFloat(customerTargetPrice)
    : targetPrice
    ? quantity * targetPrice
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            Siparişe Ekle
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-gray-900">{collectionName}</span> ürününü siparişinize ekleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {/* Product Info */}
          <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Minimum Sipariş Miktarı:</span>
              <span className="font-medium">{moq} adet</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Maksimum Sipariş Miktarı:</span>
              <span className="font-medium">{maxQuantity.toLocaleString()} adet</span>
            </div>
            {targetPrice && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Üretici Hedef Fiyatı:</span>
                <span className="font-medium">${targetPrice}/adet</span>
              </div>
            )}
            {targetLeadTime && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Üretici Hedef Termini:</span>
                <span className="font-medium">{targetLeadTime}</span>
              </div>
            )}
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Sipariş Miktarı <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= moq}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min={moq}
                max={maxQuantity}
                step={1}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className={`text-center text-lg font-medium ${
                  quantity < moq || quantity > maxQuantity
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={quantity >= maxQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {(quantity < moq || quantity > maxQuantity) && (
              <p className="text-xs text-red-600 font-medium">
                ⚠️ Miktar {moq} ile {maxQuantity.toLocaleString()} adet arasında olmalıdır
              </p>
            )}
            {quantity >= moq && quantity <= maxQuantity && (
              <p className="text-xs text-gray-500">
                ✓ Geçerli miktar (Min: {moq} - Max: {maxQuantity.toLocaleString()} adet)
              </p>
            )}
          </div>

          {/* Customer Target Price */}
          <div className="space-y-2">
            <Label htmlFor="customerPrice">
              Hedef Fiyat Teklifiniz ($/adet)
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">$</span>
              <Input
                id="customerPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder={targetPrice ? `Üretici fiyatı: $${targetPrice}` : "Örn: 12.50"}
                value={customerTargetPrice}
                onChange={(e) => setCustomerTargetPrice(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500">
              İstediğiniz birim fiyatı belirtin. Üretici bu fiyatı değerlendirecektir.
            </p>
          </div>

          {/* Customer Target Lead Time */}
          <div className="space-y-2">
            <Label htmlFor="customerLeadTime">
              Hedef Teslim Süresi (gün)
            </Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Input
                id="customerLeadTime"
                type="number"
                min="1"
                placeholder={targetLeadTime ? `Üretici termini: ${targetLeadTime}` : "Örn: 45"}
                value={customerTargetLeadTime}
                onChange={(e) => setCustomerTargetLeadTime(e.target.value)}
                className="flex-1"
              />
              <span className="text-gray-500 text-sm">gün</span>
            </div>
            <p className="text-xs text-gray-500">
              İstediğiniz teslim süresini gün olarak belirtin.
            </p>
          </div>

          {/* Customer Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Sipariş Notu</Label>
            <Textarea
              id="note"
              placeholder="Renk tercihleri, beden dağılımı, paketleme detayları, özel istekler veya sorularınızı yazın..."
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label>Dosya Ekle (Opsiyonel)</Label>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Dosya Seç (Teknik çizim, referans görseller, vb.)
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="space-y-1 mt-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 border rounded-lg px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Upload className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                        <span className="text-gray-500 text-xs flex-shrink-0">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="flex-shrink-0 h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Teknik çizimler, referans görseller veya özel isteklerinize dair dokümanları ekleyebilirsiniz.
            </p>
          </div>

          {/* Estimated Total */}
          {estimatedTotal && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-800">
                  {customerTargetPrice ? "Hedef Toplam Tutarınız:" : "Tahmini Toplam:"}
                </span>
                <span className="text-2xl font-bold text-blue-900">
                  ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                * {customerTargetPrice
                  ? "Bu sizin hedef fiyatınıza göre hesaplanmıştır. Nihai fiyat üretici onayına tabidir."
                  : "Nihai fiyat üretici ile yapılacak görüşme sonucu belirlenecektir."}
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            <p className="font-medium mb-1">ℹ️ Önemli Bilgi</p>
            <p className="text-xs">
              Bu ürün taslak siparişinize eklenecektir. Hedef fiyat ve termin teklifleriniz
              üreticiye iletilecek ve onların onayı beklencektir. Nihai sipariş onayından
              önce üretici ile tüm detayları görüşebilir ve düzenlemeler yapabilirsiniz.
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
            disabled={quantity < moq || quantity > maxQuantity || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ekleniyor...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Siparişe Ekle ({quantity.toLocaleString()} adet)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
