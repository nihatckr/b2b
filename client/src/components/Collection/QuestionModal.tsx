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
import { Loader2, MessageCircle } from "lucide-react";
import { useState } from "react";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: number;
  collectionName: string;
  manufacturerName?: string;
  onSubmit?: (data: QuestionData) => Promise<void>;
}

export interface QuestionData {
  collectionId: number;
  question: string;
}

export function QuestionModal({
  isOpen,
  onClose,
  collectionId,
  collectionName,
  manufacturerName,
  onSubmit,
}: QuestionModalProps) {
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({
          collectionId,
          question,
        });
      }
      setQuestion("");
      onClose();
    } catch (error) {
      console.error("Question submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setQuestion("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Ürün Hakkında Soru Sor
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-gray-900">{collectionName}</span> ürünü hakkında sorunuzu{" "}
            {manufacturerName && (
              <>
                <span className="font-medium text-gray-900">{manufacturerName}</span> üreticisine
              </>
            )}{" "}
            iletin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Question Input */}
          <div className="space-y-2">
            <Label htmlFor="question">
              Sorunuz <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="question"
              placeholder="Örnek: Bu ürün için farklı renk seçenekleri mevcut mu? Minimum sipariş miktarı nedir? Numune gönderebilir misiniz?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Ürün özellikleri, fiyat, termin, üretim kapasitesi veya diğer detaylar hakkında
              sorularınızı yazın.
            </p>
          </div>

          {/* Example Questions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900 mb-2">💡 Örnek Sorular:</p>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>Bu model için farklı kumaş seçenekleri sunuyor musunuz?</li>
              <li>1000 adet için üretim süresi ne kadar olur?</li>
              <li>Özel etiket ve paketleme hizmeti veriyor musunuz?</li>
              <li>Bu üründen numune gönderebilir misiniz?</li>
              <li>Toptan alımlarda indirim oranınız nedir?</li>
            </ul>
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-600">
            <p className="font-medium mb-1">ℹ️ Bilgi</p>
            <p className="text-xs">
              Sorunuz doğrudan üreticiye iletilecektir. Üretici en kısa sürede size geri dönüş
              yapacaktır. Mesajlaşma geçmişinizi "Mesajlarım" bölümünden takip edebilirsiniz.
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
            disabled={!question.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4 mr-2" />
                Soruyu Gönder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
