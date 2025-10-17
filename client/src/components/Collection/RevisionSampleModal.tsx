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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface Collection {
  id: number;
  name: string;
  modelCode: string;
  images?: string[];
  season?: string;
  gender?: string;
  fit?: string;
  fabricComposition?: string;
  colors?: string;
  targetPrice?: number;
  moq?: number;
}

interface RevisionSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection;
  onSubmit?: (data: RevisionSampleData) => Promise<void>;
}

export interface RevisionSampleData {
  collectionId: number;
  revisions: {
    accessories?: string;       // Aksesuar
    fabricComposition?: string; // Kumaş
    colors?: string;            // Renk
    sizes?: string;             // Beden
    fit?: string;               // Kalıp
    targetPrice?: string;       // Hedef Fiyat
    moq?: string;               // MOQ
    targetLeadTime?: string;    // Hedef Teslim Süresi (gün)
  };
  revisionNote?: string; // Opsiyonel - zorunlu değil
}

export function RevisionSampleModal({
  isOpen,
  onClose,
  collection,
  onSubmit,
}: RevisionSampleModalProps) {
  // Mevcut değerleri state'e al
  const [accessories, setAccessories] = useState("");
  const [fabricComposition, setFabricComposition] = useState(collection.fabricComposition || "");
  const [colors, setColors] = useState(collection.colors || "");
  const [sizes, setSizes] = useState("");
  const [fit, setFit] = useState(collection.fit || "");
  const [targetPrice, setTargetPrice] = useState(collection.targetPrice?.toString() || "");
  const [moq, setMoq] = useState(collection.moq?.toString() || "");
  const [targetLeadTime, setTargetLeadTime] = useState("");
  const [revisionNote, setRevisionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({
          collectionId: collection.id,
          revisions: {
            accessories: accessories.trim() || undefined,
            fabricComposition: fabricComposition !== collection.fabricComposition ? fabricComposition : undefined,
            colors: colors !== collection.colors ? colors : undefined,
            sizes: sizes.trim() || undefined,
            fit: fit !== collection.fit ? fit : undefined,
            targetPrice: targetPrice !== collection.targetPrice?.toString() ? targetPrice : undefined,
            moq: moq !== collection.moq?.toString() ? moq : undefined,
            targetLeadTime: targetLeadTime.trim() || undefined,
          },
          revisionNote: revisionNote.trim() || undefined, // Boşsa undefined gönder
        });
      }
      handleClose();
    } catch (error) {
      console.error("Revision request error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset to original values
    setAccessories("");
    setFabricComposition(collection.fabricComposition || "");
    setColors(collection.colors || "");
    setSizes("");
    setFit(collection.fit || "");
    setTargetPrice(collection.targetPrice?.toString() || "");
    setMoq(collection.moq?.toString() || "");
    setTargetLeadTime("");
    setRevisionNote("");
    onClose();
  };

  // Değişiklikleri kontrol et
  const hasChanges =
    accessories.trim() !== "" ||
    fabricComposition !== (collection.fabricComposition || "") ||
    colors !== (collection.colors || "") ||
    sizes.trim() !== "" ||
    fit !== (collection.fit || "") ||
    targetPrice !== (collection.targetPrice?.toString() || "") ||
    moq !== (collection.moq?.toString() || "") ||
    targetLeadTime.trim() !== "";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-blue-600" />
            Revize İle Numune Talebi
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-gray-900">{collection.name}</span> ({collection.modelCode})
            ürününde yapmak istediğiniz değişiklikleri belirtin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Collection Image */}
          {collection.images && collection.images.length > 0 && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-gray-50">
              <Image
                src={collection.images[0]}
                alt={collection.name}
                fill
                className="object-cover"
                sizes="(max-width: 700px) 100vw, 700px"
              />
            </div>
          )}
          {(!collection.images || collection.images.length === 0) && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Original Product Info */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">📋 Mevcut Ürün Bilgileri:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {collection.season && (
                <div>
                  <span className="text-gray-500">Sezon:</span>
                  <Badge variant="secondary" className="ml-2">{collection.season}</Badge>
                </div>
              )}
              {collection.gender && (
                <div>
                  <span className="text-gray-500">Cinsiyet:</span>
                  <Badge variant="secondary" className="ml-2">{collection.gender}</Badge>
                </div>
              )}
              {collection.fit && (
                <div className="col-span-2">
                  <span className="text-gray-500">Kesim:</span>
                  <span className="ml-2 font-medium">{collection.fit}</span>
                </div>
              )}
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">✏️ Değişiklik Yapmak İstediğiniz Alanlar:</p>

            {/* Accessories */}
            <div className="space-y-2">
              <Label htmlFor="accessories">Aksesuar</Label>
              <Input
                id="accessories"
                placeholder="Örn: Fermuar, Düğme, Yaka etiketi, Aplikasyon"
                value={accessories}
                onChange={(e) => setAccessories(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Eklemek veya değiştirmek istediğiniz aksesuarları belirtin
              </p>
            </div>

            {/* Fabric Composition */}
            <div className="space-y-2">
              <Label htmlFor="fabric">Kumaş</Label>
              <Textarea
                id="fabric"
                placeholder="Örn: %100 Pamuk, %95 Pamuk %5 Elastan, Cotton Jersey"
                value={fabricComposition}
                onChange={(e) => setFabricComposition(e.target.value)}
                rows={2}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Kumaş bileşimi veya kumaş tipi değişikliği
              </p>
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <Label htmlFor="colors">Renk</Label>
              <Input
                id="colors"
                placeholder="Örn: Lacivert, Beyaz, Gri Melanj, Ekru"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                İstediğiniz renkleri virgülle ayırarak yazın
              </p>
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <Label htmlFor="sizes">Beden</Label>
              <Input
                id="sizes"
                placeholder="Örn: XS, S, M, L, XL veya 36, 38, 40, 42, 44"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Talep ettiğiniz beden aralığını belirtin
              </p>
            </div>

            {/* Fit */}
            <div className="space-y-2">
              <Label htmlFor="fit">Kalıp</Label>
              <Input
                id="fit"
                placeholder="Örn: Slim Fit, Regular, Oversize, Boyfriend"
                value={fit}
                onChange={(e) => setFit(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Ürünün kalıp özelliği (kesim türü)
              </p>
            </div>

            {/* Target Price & MOQ Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="price">Hedef Fiyat ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Örn: 12.50"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Hedef birim fiyatınız
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="moq">MOQ (adet)</Label>
                <Input
                  id="moq"
                  type="number"
                  placeholder="Örn: 500"
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Minimum sipariş miktarı
                </p>
              </div>
            </div>

            {/* Target Lead Time */}
            <div className="space-y-2">
              <Label htmlFor="leadTime">Hedef Teslim Süresi (gün)</Label>
              <Input
                id="leadTime"
                type="number"
                placeholder="Örn: 30, 45, 60"
                value={targetLeadTime}
                onChange={(e) => setTargetLeadTime(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Numune için istediğiniz teslim süresini gün olarak belirtin
              </p>
            </div>
          </div>

          {/* Revision Note */}
          <div className="space-y-2">
            <Label htmlFor="note">
              Revize Açıklaması <span className="text-gray-400 text-xs">(Opsiyonel)</span>
            </Label>
            <Textarea
              id="note"
              placeholder="Yapmak istediğiniz değişiklikleri detaylı olarak açıklayın. Örneğin: Cep detayları, düğme tipi, dikiş türü, özel işlemler vb."
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              İsterseniz yukarıdaki alanlarda yaptığınız değişiklikler ve diğer özel istekleriniz hakkında ek açıklama yapabilirsiniz.
            </p>
          </div>

          {/* Changes Summary */}
          {hasChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-yellow-900 mb-1">⚠️ Değiştirilen/Eklenen Alanlar:</p>
              <ul className="text-xs text-yellow-800 list-disc list-inside space-y-1">
                {accessories.trim() !== "" && <li>Aksesuar: {accessories}</li>}
                {fabricComposition !== (collection.fabricComposition || "") && <li>Kumaş değiştirildi</li>}
                {colors !== (collection.colors || "") && <li>Renkler değiştirildi</li>}
                {sizes.trim() !== "" && <li>Beden: {sizes}</li>}
                {fit !== (collection.fit || "") && <li>Kalıp: {collection.fit || "Yok"} → {fit || "Boş"}</li>}
                {targetPrice !== (collection.targetPrice?.toString() || "") && <li>Hedef Fiyat değiştirildi: ${targetPrice}</li>}
                {moq !== (collection.moq?.toString() || "") && <li>MOQ değiştirildi: {moq} adet</li>}
                {targetLeadTime.trim() !== "" && <li>Hedef Teslim Süresi: {targetLeadTime} gün</li>}
              </ul>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">💡 Bilgi</p>
            <p className="text-xs">
              Revize talebiniz üreticiye iletilecektir. Üretici yaptığınız değişiklikleri
              değerlendirerek numune üretim süresi ve fiyat bilgisi ile size geri dönüş yapacaktır.
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
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Revize Talebi Gönder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
