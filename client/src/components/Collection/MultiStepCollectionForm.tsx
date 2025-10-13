"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Package,
  Palette,
  Ruler,
} from "lucide-react";
import React, { useState } from "react";
import { ProductionScheduleInput } from "./ProductionScheduleInput";

interface Category {
  id: number;
  name: string;
  parentCategory?: {
    id: number;
    name: string;
  };
}

interface Color {
  id: number;
  name: string;
  hexCode: string;
}

interface Fabric {
  id: number;
  name: string;
  composition: string;
}

interface SizeGroup {
  id: number;
  name: string;
  sizes: string;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  productionSchedule: string;
  categoryId: string;
  // ADIM 1: Model Bilgileri
  modelCode: string;
  season: string;
  gender: string;
  fit: string;
  trend: string;
  // ADIM 2: Renkler & Bedenler
  colors: number[];
  sizeGroups: number[];
  measurementChart: string;
  // ADIM 3: Kumaş & Detaylar
  fabricComposition: string;
  accessories: string;
  techPack: string;
  // ADIM 4: Ticari Bilgiler
  moq: string;
  targetPrice: string;
  targetLeadTime: string;
  notes: string;
}

interface Season {
  id: number;
  name: string;
  fullName: string;
}

interface Fit {
  id: number;
  name: string;
  category: string;
  description?: string;
}

interface MultiStepCollectionFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: () => void;
  isSubmitting: boolean;
  categories: Category[];
  colors: Color[];
  fabrics: Fabric[];
  sizeGroups: SizeGroup[];
  seasons: Season[];
  fits: Fit[];
  onUploadFile: (file: File) => Promise<string>; // File upload handler
  isEditMode?: boolean; // Is this an edit or create operation
}

export function MultiStepCollectionForm({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  categories,
  colors,
  fabrics,
  sizeGroups,
  seasons,
  fits,
  onUploadFile,
  isEditMode = false,
}: MultiStepCollectionFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isManualModelCode, setIsManualModelCode] = useState(false);

  const steps = [
    { number: 1, title: "Model Bilgileri", icon: Package },
    { number: 2, title: "Renkler & Bedenler", icon: Palette },
    { number: 3, title: "Kumaş & Detaylar", icon: Ruler },
    { number: 4, title: "Ticari Bilgiler", icon: DollarSign },
    { number: 5, title: "Üretim Planı", icon: Clock },
  ];

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (currentStep === 5) {
      onSubmit();
    } else {
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep > step.number
                      ? "bg-green-500 text-white"
                      : currentStep === step.number
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    currentStep > step.number ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="border rounded-lg p-6 min-h-[400px]">
        {/* ADIM 1: Model Bilgileri */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Model Bilgileri
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <Label>Model Kodu *</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="manual-model-code"
                      checked={isManualModelCode}
                      onCheckedChange={(checked) => {
                        setIsManualModelCode(!!checked);
                        if (!checked) {
                          // Otomatik mod: Temizle
                          setFormData({ ...formData, modelCode: "" });
                        }
                      }}
                    />
                    <label
                      htmlFor="manual-model-code"
                      className="text-xs text-muted-foreground cursor-pointer"
                    >
                      Manuel gir
                    </label>
                  </div>
                </div>
                {isManualModelCode ? (
                  <Input
                    placeholder="Örn: THS-2024-001"
                    value={formData.modelCode}
                    onChange={(e) =>
                      setFormData({ ...formData, modelCode: e.target.value })
                    }
                  />
                ) : (
                  <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center text-sm text-gray-500">
                    <span className="italic">
                      Otomatik oluşturulacak (Örn: COL-2025-001)
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {isManualModelCode
                    ? "Firma kodunuz-Yıl-Sıra No formatında giriniz"
                    : "Sistem otomatik oluşturacak"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Koleksiyon Adı *</Label>
                <Input
                  placeholder="Örn: Yaz Gömlek Koleksiyonu"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Sezon *</Label>
                <Select
                  value={formData.season}
                  onValueChange={(value) =>
                    setFormData({ ...formData, season: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sezon seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons
                      .filter((s) => s.name) // Only active seasons
                      .map((season) => (
                        <SelectItem key={season.id} value={season.name}>
                          {season.name} - {season.fullName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Kütüphanenizden sezon seçin
                </p>
              </div>

              <div className="space-y-2">
                <Label>Klasman (Kategori) *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {(() => {
                      // Kategorileri parent altında grupla
                      const rootCategories = categories.filter(
                        (cat) => !cat.parentCategory
                      );
                      const result: React.ReactElement[] = [];

                      rootCategories.forEach((parent) => {
                        // Parent kategorinin altındaki leaf'leri bul
                        const children = categories.filter(
                          (cat) => cat.parentCategory?.id === parent.id
                        );

                        if (children.length > 0) {
                          // Parent başlığı (disabled, sadece görünüm için)
                          result.push(
                            <div
                              key={`parent-${parent.id}`}
                              className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-gray-100"
                            >
                              {parent.name}
                            </div>
                          );

                          // Alt kategoriler (seçilebilir)
                          children.forEach((child) => {
                            const hasGrandChildren = categories.some(
                              (c) => c.parentCategory?.id === child.id
                            );

                            // Sadece leaf'leri seçilebilir yap
                            if (!hasGrandChildren) {
                              result.push(
                                <SelectItem
                                  key={child.id}
                                  value={child.id.toString()}
                                  className="pl-6"
                                >
                                  {child.name}
                                </SelectItem>
                              );
                            }
                          });
                        } else {
                          // Parent kendisi leaf ise (alt kategorisi yok)
                          result.push(
                            <SelectItem
                              key={parent.id}
                              value={parent.id.toString()}
                            >
                              {parent.name}
                            </SelectItem>
                          );
                        }
                      });

                      return result;
                    })()}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Sadece son seviye kategoriler (Tişört, Gömlek, vb.)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Cinsiyet *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cinsiyet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WOMEN">Kadın</SelectItem>
                    <SelectItem value="MEN">Erkek</SelectItem>
                    <SelectItem value="GIRLS">Kız Çocuk</SelectItem>
                    <SelectItem value="BOYS">Erkek Çocuk</SelectItem>
                    <SelectItem value="UNISEX">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fit/Kesim *</Label>
                <Select
                  value={formData.fit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, fit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Fit seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {fits.map((fit) => (
                      <SelectItem key={fit.id} value={fit.name}>
                        {fit.name}
                        {fit.category &&
                          ` (${
                            fit.category === "UPPER"
                              ? "Üst"
                              : fit.category === "LOWER"
                              ? "Alt"
                              : "Dış"
                          } Giyim)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Kütüphanenizden fit seçin
                </p>
              </div>

              <div className="space-y-2">
                <Label>Trend</Label>
                <Input
                  placeholder="Örn: Minimalist, Vintage, Sport Chic, Y2K"
                  value={formData.trend}
                  onChange={(e) =>
                    setFormData({ ...formData, trend: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Koleksiyonun hangi trende uygun olduğunu belirtin
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                placeholder="Koleksiyon hakkında detaylı açıklama..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
        )}

        {/* ADIM 2: Renkler & Bedenler */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Renkler & Bedenler
            </h3>

            <div className="space-y-2">
              <Label>Renkler *</Label>
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-3 gap-2">
                  {colors.map((color) => {
                    const isSelected = formData.colors?.includes(color.id);
                    return (
                      <div
                        key={color.id}
                        onClick={() => {
                          const currentColors = formData.colors || [];
                          const newColors = isSelected
                            ? currentColors.filter(
                                (id: number) => id !== color.id
                              )
                            : [...currentColors, color.id];
                          setFormData({ ...formData, colors: newColors });
                        }}
                        className={`flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                          isSelected ? "border-blue-500 bg-blue-50" : ""
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <span className="text-sm">{color.name}</span>
                        {isSelected && (
                          <Check className="h-4 w-4 ml-auto text-blue-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Birden fazla renk seçebilirsiniz
              </p>
            </div>

            <div className="space-y-2">
              <Label>Beden Grubu *</Label>
              {!formData.gender ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Önce ADIM 1&apos;de <strong>Cinsiyet</strong> seçin.
                    Beden grupları cinsiyete göre filtrelenecektir.
                  </p>
                </div>
              ) : (
                <>
                  <div className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {(() => {
                        const filteredGroups = sizeGroups.filter((group) => {
                          // Cinsiyete göre filtrele
                          // The 'gender' property is assumed to exist on SizeGroup, but might be missing from its type definition.
                          // We assert its presence for filtering logic to resolve the type error.
                          const category =
                            (
                              group as { gender?: string }
                            ).gender?.toUpperCase() || "";
                          const gender = formData.gender;

                          console.log(
                            "Size Group Filter:",
                            group.name,
                            "Category:",
                            category,
                            "Gender:",
                            gender
                          );

                          // Erkek/Erkek Çocuk
                          if (gender === "MEN" || gender === "BOYS") {
                            const match =
                              category === "MEN" || category === "BOYS";
                            console.log("  MEN match:", match);
                            return match;
                          }

                          // Kadın/Kız Çocuk
                          if (gender === "WOMEN" || gender === "GIRLS") {
                            const match =
                              category === "WOMEN" || category === "GIRLS";
                            console.log("  WOMEN match:", match);
                            return match;
                          }

                          // Unisex: Hepsi
                          if (gender === "UNISEX") {
                            return true;
                          }

                          return false; // Default: gösterme
                        });

                        console.log(
                          "Filtered groups count:",
                          filteredGroups.length
                        );

                        return filteredGroups.map((group) => {
                          const isSelected = formData.sizeGroups?.includes(
                            group.id
                          );
                          return (
                            <div
                              key={group.id}
                              onClick={() => {
                                const currentGroups = formData.sizeGroups || [];
                                const newGroups = isSelected
                                  ? currentGroups.filter(
                                      (id: number) => id !== group.id
                                    )
                                  : [...currentGroups, group.id];
                                setFormData({
                                  ...formData,
                                  sizeGroups: newGroups,
                                });
                              }}
                              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                                isSelected ? "border-blue-500 bg-blue-50" : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{group.name}</p>
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    {(() => {
                                      try {
                                        const sizes =
                                          typeof group.sizes === "string"
                                            ? JSON.parse(group.sizes)
                                            : group.sizes;
                                        return (
                                          Array.isArray(sizes) ? sizes : []
                                        ).map((size: string) => (
                                          <Badge
                                            key={size}
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {size}
                                          </Badge>
                                        ));
                                      } catch (e) {
                                        console.error("Size parse error:", e);
                                        return (
                                          <span className="text-xs text-red-500">
                                            Hatalı format
                                          </span>
                                        );
                                      }
                                    })()}
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="h-5 w-5 text-blue-500" />
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong>{formData.gender}</strong> için uygun beden
                    grupları. Birden fazla grup seçebilirsiniz.
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label>Ölçü Tablosu (PDF/Excel)</Label>
              <Input
                type="file"
                accept=".pdf,.xlsx,.xls"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const uploadedUrl = await onUploadFile(file);
                      setFormData({
                        ...formData,
                        measurementChart: uploadedUrl,
                      });
                    } catch (error) {
                      console.error("Ölçü tablosu yükleme hatası:", error);
                    }
                  }
                }}
              />
              {formData.measurementChart && (
                <p className="text-xs text-green-600">✓ Dosya yüklendi</p>
              )}
              <p className="text-xs text-muted-foreground">
                PDF veya Excel formatında ölçü tablosu yükleyin
              </p>
            </div>
          </div>
        )}

        {/* ADIM 3: Kumaş & Detaylar */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Kumaş & Detaylar
            </h3>

            <div className="space-y-2">
              <Label>Kumaş Kompozisyonu *</Label>
              <Textarea
                placeholder="Örn: %100 Cotton, %80 Polyester %20 Elastane"
                value={formData.fabricComposition}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fabricComposition: e.target.value,
                  })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Aksesuar / Trim</Label>
              <Textarea
                placeholder="Örn: Düğme (Plastik, 4 adet), Fermuar (Metal, 15cm), Etiket"
                value={formData.accessories}
                onChange={(e) =>
                  setFormData({ ...formData, accessories: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Ürün Görselleri</Label>
              <ImageUpload
                images={formData.images}
                onChange={(images) => setFormData({ ...formData, images })}
                onUpload={onUploadFile}
                maxImages={10}
              />
            </div>

            <div className="space-y-2">
              <Label>Tech Pack (PDF)</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const uploadedUrl = await onUploadFile(file);
                      setFormData({ ...formData, techPack: uploadedUrl });
                    } catch (error) {
                      console.error("Tech pack yükleme hatası:", error);
                    }
                  }
                }}
              />
              {formData.techPack && (
                <p className="text-xs text-green-600">✓ Dosya yüklendi</p>
              )}
              <p className="text-xs text-muted-foreground">
                Teknik paket dosyanızı yükleyin
              </p>
            </div>
          </div>
        )}

        {/* ADIM 4: Ticari Bilgiler */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Ticari Bilgiler
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>MOQ (Minimum Sipariş Adedi) *</Label>
                <Input
                  type="number"
                  placeholder="Örn: 500"
                  value={formData.moq}
                  onChange={(e) =>
                    setFormData({ ...formData, moq: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Minimum kabul edilen sipariş miktarı
                </p>
              </div>

              <div className="space-y-2">
                <Label>Hedef Fiyat (USD) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Örn: 12.50"
                  value={formData.targetPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, targetPrice: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Birim başına hedef satış fiyatı
                </p>
              </div>

              <div className="space-y-2">
                <Label>Hedef Termin (Gün) *</Label>
                <Input
                  type="number"
                  placeholder="Örn: 30"
                  value={formData.targetLeadTime}
                  onChange={(e) => {
                    const days = parseInt(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      targetLeadTime: e.target.value,
                    });

                    // Otomatik production schedule hesapla (yüzdelere göre)
                    if (days > 0) {
                      const schedule = {
                        PLANNING: Math.ceil(days * 0.1), // %10
                        FABRIC: Math.ceil(days * 0.15), // %15
                        CUTTING: Math.ceil(days * 0.15), // %15
                        SEWING: Math.ceil(days * 0.15), // %15
                        QUALITY: Math.ceil(days * 0.15), // %15
                        PACKAGING: Math.ceil(days * 0.2), // %20
                        SHIPPING: Math.ceil(days * 0.1), // %10
                      };
                      setFormData((prev) => ({
                        ...prev,
                        productionSchedule: JSON.stringify(schedule),
                      }));
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Üretim schedule otomatik hesaplanır (yüzdelere göre)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Stok Miktarı</Label>
                <Input
                  type="number"
                  placeholder="Örn: 1000"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notlar / Özel Talepler</Label>
              <Textarea
                placeholder="Ek bilgiler, özel talepler, uyarılar vb..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
        )}

        {/* ADIM 5: Üretim Planı */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Üretim Süreci Planı
            </h3>

            <ProductionScheduleInput
              value={formData.productionSchedule}
              onChange={(value) =>
                setFormData({ ...formData, productionSchedule: value })
              }
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                📋 Özet Kontrol
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-700">Model:</span>{" "}
                  <strong>
                    {formData.modelCode || (
                      <span className="text-blue-500 italic">
                        Otomatik oluşturulacak
                      </span>
                    )}
                  </strong>
                </div>
                <div>
                  <span className="text-blue-700">Sezon:</span>{" "}
                  <strong>{formData.season || "-"}</strong>
                </div>
                <div>
                  <span className="text-blue-700">Cinsiyet:</span>{" "}
                  <strong>{formData.gender || "-"}</strong>
                </div>
                <div>
                  <span className="text-blue-700">MOQ:</span>{" "}
                  <strong>{formData.moq || "-"} adet</strong>
                </div>
                <div>
                  <span className="text-blue-700">Hedef Fiyat:</span>{" "}
                  <strong>${formData.targetPrice || "-"}</strong>
                </div>
                <div>
                  <span className="text-blue-700">Hedef Termin:</span>{" "}
                  <strong>{formData.targetLeadTime || "-"} gün</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>

        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground self-center">
            Adım {currentStep} / 5
          </span>
        </div>

        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {currentStep === 5 ? (
            <>
              {isSubmitting
                ? "Kaydediliyor..."
                : isEditMode
                ? "Güncelle"
                : "Koleksiyon Oluştur"}
              <Check className="h-4 w-4 ml-2" />
            </>
          ) : (
            <>
              İleri
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
