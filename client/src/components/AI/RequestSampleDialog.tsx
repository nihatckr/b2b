"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { UPDATE_SAMPLE_MUTATION } from "@/lib/graphql/mutations";
import { ALL_MANUFACTURERS_QUERY } from "@/lib/graphql/queries";
import { Building2, Loader2, Send, Sparkles, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

interface RequestSampleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiSample: {
    id: number;
    name?: string;
    sampleNumber: string;
    description?: string;
    images?: string;
    aiSketchUrl?: string;
    aiPrompt?: string;
  };
}

export function RequestSampleDialog({
  open,
  onOpenChange,
  aiSample,
}: RequestSampleDialogProps) {
  const router = useRouter();
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("");
  const [customerNote, setCustomerNote] = useState("");
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [aiImageUrl, setAiImageUrl] = useState<string>("");

  // Additional form fields matching NewSampleRequestModal
  const [formData, setFormData] = useState({
    sampleName: aiSample.name || aiSample.sampleNumber,
    fabricType: "",
    color: "",
    classification: "",
    gender: "",
    size: "",
    pattern: "",
    accessories: "",
    quantity: 1,
    season: "",
  });

  // Fetch manufacturers
  const [{ data: manufacturersData, fetching: fetchingManufacturers }] =
    useQuery({
      query: ALL_MANUFACTURERS_QUERY,
    });

  const [{ fetching: updating }, updateSample] = useMutation(
    UPDATE_SAMPLE_MUTATION
  );

  // Update form when dialog opens with new sample
  useEffect(() => {
    if (open && aiSample) {
      console.log("RequestSampleDialog - aiSample:", aiSample);
      setFormData({
        sampleName: aiSample.name || aiSample.sampleNumber,
        fabricType: "",
        color: "",
        classification: "",
        gender: "",
        size: "",
        pattern: "",
        accessories: "",
        quantity: 1,
        season: "",
      });

      // Parse and set AI image with full URL
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace("/graphql", "") ||
          "http://localhost:4000";
        const images = JSON.parse(aiSample.images || "[]");
        console.log("Parsed images:", images);
        if (images.length > 0) {
          // Add backend URL if the image path is relative
          const imagePath = images[0];
          const fullImageUrl = imagePath.startsWith("http")
            ? imagePath
            : `${backendUrl}${imagePath}`;
          console.log("AI Image URL:", fullImageUrl);
          setAiImageUrl(fullImageUrl);
        } else {
          console.log("No images found in aiSample.images");
        }
      } catch (e) {
        console.error("Error parsing images:", e);
      }
    }
  }, [open, aiSample]);

  // AI-powered image analysis function
  const analyzeImageWithAI = async () => {
    if (!aiImageUrl) {
      toast.error("Görsel bulunamadı", {
        description: "Analiz için AI görseli gereklidir",
      });
      return;
    }

    setAnalyzingImage(true);

    try {
      const response = await fetch("/api/ai/analyze-design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: aiImageUrl,
          prompt: aiSample.aiPrompt,
          description: aiSample.description,
        }),
      });

      if (!response.ok) {
        throw new Error("AI analizi başarısız oldu");
      }

      const analysis = await response.json();

      // Update form with AI analysis
      setFormData({
        ...formData,
        fabricType: analysis.fabricType || formData.fabricType,
        color: analysis.color || formData.color,
        classification: analysis.classification || formData.classification,
        gender: analysis.gender || formData.gender,
        size: analysis.size || formData.size,
        pattern: analysis.pattern || formData.pattern,
        accessories: analysis.accessories || formData.accessories,
        season: analysis.season || formData.season,
      });

      toast.success("✨ AI Analizi Tamamlandı!", {
        description: "Form alanları otomatik olarak dolduruldu",
      });
    } catch (error) {
      console.error("AI analysis error:", error);
      toast.error("AI analizi yapılamadı", {
        description: "Lütfen form alanlarını manuel olarak doldurun",
      });
    } finally {
      setAnalyzingImage(false);
    }
  };

  // Build customer note with all form fields
  const buildCustomerNote = () => {
    const parts: string[] = [];

    // Add custom note if provided
    if (customerNote.trim()) {
      parts.push(customerNote.trim());
      parts.push(""); // Empty line separator
    }

    // Add AI design info
    parts.push(`🤖 AI ile Oluşturulmuş Tasarım: ${formData.sampleName}`);

    // Add AI prompt if available
    if (aiSample.aiPrompt) {
      parts.push(`💭 AI Prompt: ${aiSample.aiPrompt}`);
    }

    // Add AI description if available
    if (aiSample.description) {
      parts.push(`📝 Açıklama: ${aiSample.description}`);
    }

    // Add form data if filled
    const details: string[] = [];
    if (formData.fabricType) details.push(`Kumaş: ${formData.fabricType}`);
    if (formData.color) details.push(`Renk: ${formData.color}`);
    if (formData.classification) details.push(`Klasman: ${formData.classification}`);
    if (formData.gender) details.push(`Cinsiyet: ${formData.gender}`);
    if (formData.size) details.push(`Beden: ${formData.size}`);
    if (formData.pattern) details.push(`Kalıp: ${formData.pattern}`);
    if (formData.accessories) details.push(`Aksesuar: ${formData.accessories}`);
    if (formData.season) details.push(`Sezon: ${formData.season}`);

    if (details.length > 0) {
      parts.push(""); // Empty line
      parts.push("📋 Teknik Detaylar:");
      parts.push(...details);
    }

    return parts.join("\n");
  };

  const handleRequestSample = async () => {
    if (!selectedManufacturer) {
      toast.error("Lütfen bir üretici seçin", {
        description: "Numune talebini göndermek için bir üretici seçmelisiniz",
      });
      return;
    }

    try {
      // Parse images to get the first image
      let images: string[] = [];
      try {
        images = JSON.parse(aiSample.images || "[]");
      } catch (e) {
        console.error("Error parsing images:", e);
        toast.error("Görsel formatı hatalı", {
          description: "AI tasarım görselleri okunamadı",
        });
        return;
      }

      if (images.length === 0) {
        toast.error("Görsel bulunamadı", {
          description: "Bu AI tasarımında görsel bulunamadı. Lütfen tekrar tasarım oluşturun.",
        });
        return;
      }

      const result = await updateSample({
        input: {
          id: aiSample.id,
          status: "PENDING_APPROVAL", // Update status to PENDING_APPROVAL
          manufactureId: parseInt(selectedManufacturer),
          customerNote: buildCustomerNote(),
        },
      });

      if (result.error) {
        console.error("GraphQL error:", result.error);
        const errorMessage = result.error.message || "Numune talebi oluşturulamadı";

        // Parse common GraphQL errors
        let description = "";
        if (errorMessage.includes("Authentication required")) {
          description = "Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.";
        } else if (errorMessage.includes("Manufacturer must be specified")) {
          description = "Üretici bilgisi eksik. Lütfen tekrar deneyin.";
        } else if (errorMessage.includes("User not found")) {
          description = "Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.";
        } else if (errorMessage.includes("permission")) {
          description = "Bu işlem için yetkiniz yok.";
        }

        throw new Error(errorMessage + (description ? `\n${description}` : ""));
      }

      const updatedSample = result.data?.updateSample;

      if (!updatedSample) {
        throw new Error("Numune güncellendi ama veri döndürülmedi");
      }

      toast.success("✅ Numune talebi başarıyla gönderildi!", {
        description: `${updatedSample.sampleNumber} numaralı talep üreticiye gönderildi ve "Onay Bekliyor" durumuna geçti.`,
        duration: 5000,
      });

      // Close dialog
      onOpenChange(false);

      // Reset form
      setSelectedManufacturer("");
      setCustomerNote("");
      setFormData({
        sampleName: aiSample.name || aiSample.sampleNumber,
        fabricType: "",
        color: "",
        classification: "",
        gender: "",
        size: "",
        pattern: "",
        accessories: "",
        quantity: 1,
        season: "",
      });

      // Navigate to sample detail page
      setTimeout(() => {
        router.push(`/dashboard/samples/${updatedSample.id}`);
      }, 1000);
    } catch (error) {
      console.error("Sample request error:", error);

      const errorMessage = error instanceof Error ? error.message : "Numune talebi oluşturulamadı";
      const [title, ...descParts] = errorMessage.split("\n");

      toast.error(title, {
        description: descParts.join("\n") || "Lütfen tekrar deneyin veya sistem yöneticisine başvurun.",
        duration: 7000,
      });
    }
  };

  const manufacturers = manufacturersData?.allManufacturers || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            Numune Talebi Oluştur
          </DialogTitle>
          <DialogDescription>
            AI ile oluşturduğunuz tasarımı üreticiye göndermek için aşağıdaki
            bilgileri doldurun.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* AI Image Preview */}
          {aiImageUrl && (
            <div className="relative rounded-lg overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="relative aspect-square w-full">
                <img
                  src={aiImageUrl}
                  alt="AI Tasarım"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-600 text-white shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  AI Tasarım
                </span>
              </div>

              {/* AI Auto-fill Button */}
              <div className="p-3 bg-white/90 backdrop-blur">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 border-purple-300 hover:bg-purple-50"
                  onClick={analyzeImageWithAI}
                  disabled={analyzingImage}
                >
                  {analyzingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI ile Analiz Ediliyor...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      AI ile Otomatik Doldur
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Sample Info */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 space-y-2 border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Send className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900">
                  {aiSample.name || aiSample.sampleNumber}
                </div>
                {aiSample.description && (
                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {aiSample.description}
                  </div>
                )}
                {aiSample.aiPrompt && (
                  <div className="text-xs text-purple-600 mt-1 line-clamp-1 font-medium">
                    💭 {aiSample.aiPrompt}
                  </div>
                )}
                <div className="flex items-center gap-1 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    🤖 AI Tasarım
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Manufacturer Selection */}
          <div className="space-y-2">
            <Label htmlFor="manufacturer">
              Üretici Seçin <span className="text-red-500">*</span>
            </Label>
            {fetchingManufacturers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : manufacturers.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 text-center">
                Henüz kayıtlı üretici bulunmuyor
              </div>
            ) : (
              <Select
                value={selectedManufacturer}
                onValueChange={setSelectedManufacturer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Üretici seçin" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers.map((manufacturer: any) => (
                    <SelectItem
                      key={manufacturer.id}
                      value={manufacturer.id.toString()}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>
                          {manufacturer.company?.name ||
                            manufacturer.name ||
                            `${manufacturer.firstName} ${manufacturer.lastName}` ||
                            manufacturer.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Numune Adı */}
          <div className="space-y-2">
            <Label htmlFor="sampleName">
              Numune Adı <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sampleName"
              value={formData.sampleName}
              onChange={(e) =>
                setFormData({ ...formData, sampleName: e.target.value })
              }
              placeholder="Örn: Slim Fit T-Shirt"
            />
          </div>

          {/* İki Sütunlu Form Alanları */}
          <div className="grid grid-cols-2 gap-4">
            {/* Kumaş Türü */}
            <div className="space-y-2">
              <Label htmlFor="fabricType">Kumaş Türü</Label>
              <Input
                id="fabricType"
                value={formData.fabricType}
                onChange={(e) =>
                  setFormData({ ...formData, fabricType: e.target.value })
                }
                placeholder="Örn: %100 Pamuk"
              />
            </div>

            {/* Renk */}
            <div className="space-y-2">
              <Label htmlFor="color">Renk</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                placeholder="Örn: Lacivert"
              />
            </div>

            {/* Klasman */}
            <div className="space-y-2">
              <Label htmlFor="classification">Klasman</Label>
              <Select
                value={formData.classification}
                onValueChange={(value) =>
                  setFormData({ ...formData, classification: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="FASHION">Fashion</SelectItem>
                  <SelectItem value="PREMIUM">Premium</SelectItem>
                  <SelectItem value="LUXURY">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cinsiyet */}
            <div className="space-y-2">
              <Label htmlFor="gender">Cinsiyet</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Erkek</SelectItem>
                  <SelectItem value="FEMALE">Kadın</SelectItem>
                  <SelectItem value="UNISEX">Unisex</SelectItem>
                  <SelectItem value="KIDS">Çocuk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Beden */}
            <div className="space-y-2">
              <Label htmlFor="size">Beden</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
                placeholder="Örn: S, M, L, XL"
              />
            </div>

            {/* Kalıp */}
            <div className="space-y-2">
              <Label htmlFor="pattern">Kalıp</Label>
              <Select
                value={formData.pattern}
                onValueChange={(value) =>
                  setFormData({ ...formData, pattern: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SLIM_FIT">Slim Fit</SelectItem>
                  <SelectItem value="REGULAR_FIT">Regular Fit</SelectItem>
                  <SelectItem value="OVERSIZE">Oversize</SelectItem>
                  <SelectItem value="LOOSE_FIT">Loose Fit</SelectItem>
                  <SelectItem value="BODY_FIT">Body Fit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Aksesuar */}
            <div className="space-y-2">
              <Label htmlFor="accessories">Aksesuar</Label>
              <Input
                id="accessories"
                value={formData.accessories}
                onChange={(e) =>
                  setFormData({ ...formData, accessories: e.target.value })
                }
                placeholder="Örn: Fermuar, Düğme"
              />
            </div>

            {/* Sezon */}
            <div className="space-y-2">
              <Label htmlFor="season">Sezon</Label>
              <Input
                id="season"
                value={formData.season}
                onChange={(e) =>
                  setFormData({ ...formData, season: e.target.value })
                }
                placeholder="Örn: İlkbahar-Yaz 2025"
              />
            </div>
          </div>

          {/* Customer Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Ek Notlar (Opsiyonel)</Label>
            <Textarea
              id="note"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Üreticiye iletmek istediğiniz özel notlar, tercihler veya talepler..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={updating}
            >
              İptal
            </Button>
            <Button
              type="button"
              className="flex-1 gap-2"
              onClick={handleRequestSample}
              disabled={!selectedManufacturer || updating}
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Numune İste
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            💡 AI tasarımınız üreticiye gönderilecek ve durum "Onay Bekliyor" olarak güncellenecek
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
