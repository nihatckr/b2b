"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GoogleGenAI } from "@google/genai";
import {
  ArrowLeft,
  Bot,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
  Ruler,
  Scissors,
  ShoppingBag,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ReferenceProductPage() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // We'll use Google Gemini (GenAI) directly in the client to analyze the uploaded image

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error("Lütfen bir ürün fotoğrafı seçin");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Step 1: Upload image to server
      toast.info("📤 Fotoğraf yükleniyor...");
      const formData = new FormData();
      formData.append("file", selectedImage);

      const backendUrl =
        process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace("/graphql", "") ||
        "http://localhost:4000";

      const uploadResponse = await fetch(`${backendUrl}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Fotoğraf yükleme başarısız");
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.filePath || uploadData.url;
      setUploadedImageUrl(imageUrl);

      console.log("✅ Image uploaded:", imageUrl);

      // Step 2: Use Google Gemini (GenAI) in the client to analyze the image
      toast.info("🤖 Gemini ile ürün analiz ediliyor...");

      const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        throw new Error("Google Gemini API key tanımlı değil");
      }

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      // Convert the selected file to base64
      const fileArrayBuffer = await selectedImage.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(fileArrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      // Prompt: ask a textile engineer style analysis in Turkish
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Sen bir deneyimli tekstil mühendisisin. Bu ürünü teknik açıdan analiz et ve Türkçe olarak şu bilgileri ver:

- Ürün Türü: (T-shirt, Elbise, Pantolon, Ceket vb.)
- Kategori: (Üst giyim, Alt giyim, Dış giyim vb.)
- Renk: (Ana renk - mümkünse PANTONE/NCS kodu belirt)
- Kumaş: (Örme/Dokuma, hammadde, gramaj tahmini)
- Kalıp: (Slim Fit, Regular Fit, Oversize, Loose Fit)
- Cinsiyet: (Erkek, Kadın, Unisex, Çocuk)
- Klasman: (Basic/Fashion/Premium/Luxury)
- Sezon: (İlkbahar-Yaz / Sonbahar-Kış)
- Yaka: (Bisiklet yaka, V yaka, Polo yaka vb.)
- Kol: (Kısa kol, Uzun kol, Kolsuz vb.)
- Desen: (Düz, Çizgili, Desenli vb.)
- Aksesuar: (Düğme, Fermuar, Cep detayları vb.)
- Kısa Teknik Açıklama: 2-4 cümle, kumaş yapısı, dikiş tekniği ve kalite gözlemleri.

${notes ? `Kullanıcı Notu: ${notes}` : ''}

Teknik ve profesyonel bir dil kullan.`
              },
              {
                inlineData: {
                  mimeType: selectedImage.type,
                  data: base64,
                },
              },
            ],
          },
        ],
        config: {
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      const caption = response.text || "";
      if (!caption) {
        throw new Error("Analiz sonucu alınamadı");
      }

      console.log("✅ Gemini analysis result:", caption);

      // Parse response into analysisResult shape used by the UI
      const lines = caption.split('\n').map((l: string) => l.trim()).filter(Boolean);
      const analysis: any = {
        productType: "",
        category: "",
        material: "",
        fit: "",
        colors: [] as string[],
        details: [] as string[],
        suggestedModels: [] as any[],
        designPrompt: caption,
        neckline: "",
        sleeves: "",
        pattern: "",
      };

      for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.includes("ürün türü") || lower.includes("tür:")) {
          analysis.productType = line.split(':')[1]?.trim() || line;
        }
        if (lower.includes("kategori") || lower.includes("kategori:")) {
          analysis.category = line.split(':')[1]?.trim() || analysis.category;
        }
        if (lower.includes("kumaş") || lower.includes("kumas") || lower.includes("kumaş:")) {
          analysis.material = line.split(':')[1]?.trim() || analysis.material;
        }
        if (lower.includes("kalıp") || lower.includes("kalıp:")) {
          analysis.fit = line.split(':')[1]?.trim() || analysis.fit;
        }
        if (lower.includes("renk") || lower.includes("color") || lower.includes("renk:")) {
          const value = line.split(':')[1]?.trim() || "";
          if (value) analysis.colors = value.split(/,|\//).map((s: string) => s.trim()).filter(Boolean);
        }
        if (lower.includes("yaka") || lower.includes("yaka:")) {
          analysis.neckline = line.split(':')[1]?.trim() || "";
        }
        if (lower.includes("kol") || lower.includes("kol:") || lower.includes("sleeves")) {
          analysis.sleeves = line.split(':')[1]?.trim() || "";
        }
        if (lower.includes("desen") || lower.includes("pattern") || lower.includes("desen:")) {
          analysis.pattern = line.split(':')[1]?.trim() || "";
        }
        if (lower.includes("açıklama") || lower.includes("açıklama:")) {
          const detailText = line.replace(/açıklama:?/i, '').trim();
          if (detailText) analysis.details.push(detailText);
        }
      }

      // Fallbacks
      if (!analysis.colors.length) analysis.colors = ["Belirtilmedi"];
      if (!analysis.productType) analysis.productType = "Bilinmiyor";
      if (!analysis.category) analysis.category = "Belirlenmedi";
      if (!analysis.material) analysis.material = "Belirlenmedi";
      if (!analysis.fit) analysis.fit = "Belirlenmedi";

      setAnalysisResult(analysis);
      toast.success("✨ Ürün analizi tamamlandı!");
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast.error(err.message || "Analiz sırasında hata oluştu");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateSampleRequest = (modelVariant?: any) => {
    // Mock payload for sample request
    const payload: any = {
      source: "reference-product",
      productType: analysisResult?.productType,
      notes,
      variant: modelVariant?.variant || "Standart",
      prompt: modelVariant?.prompt || analysisResult?.designPrompt,
    };

    // TODO: send payload to server
    toast.success(
      `📋 Numune talebi oluşturuluyor: ${payload.variant} - ${payload.prompt?.slice(0, 60)}...`
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/ai-features")}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          AI Numune Asistanı
        </Button>
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold tracking-tight">
            Referans Ürün Analizi
          </h1>
        </div>
        <p className="text-muted-foreground">
          Beğendiğiniz ürünün fotoğrafını yükleyin, AI detaylarını analiz
          etsin ve benzerini ürettirin
        </p>
      </div>

      {/* How It Works */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Nasıl Çalışır?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-sm">Ürün Fotoğrafı</h4>
                <p className="text-xs text-muted-foreground">
                  Beğendiğiniz ürünün net fotoğrafını çekin
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-sm">AI Analizi</h4>
                <p className="text-xs text-muted-foreground">
                  Renk, desen, kesim, malzeme analiz edilir
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-sm">Notlar Ekle</h4>
                <p className="text-xs text-muted-foreground">
                  Değişiklik istediğiniz detayları yazın
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-sm">Numune İste</h4>
                <p className="text-xs text-muted-foreground">
                  Üreticiye detaylı talep gönderin
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Upload & Analysis */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Referans Ürün Fotoğrafı
              </CardTitle>
              <CardDescription>
                Benzerini üretmek istediğiniz ürünün net bir fotoğrafını yükleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preview */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-6">
                    <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">
                      Referans ürün fotoğrafı yükleyin
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Katalog, internet veya mağazadan çekilmiş fotoğraf olabilir
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="product-upload"
                />
                <label htmlFor="product-upload" className="block">
                  <Button className="w-full" variant="outline" asChild>
                    <span>
                      <Camera className="mr-2 h-4 w-4" />
                      Fotoğraf Seç
                    </span>
                  </Button>
                </label>

                {selectedImage && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <ImageIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 truncate">
                      {selectedImage.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Analyze Button */}
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                size="lg"
                onClick={handleAnalyze}
                disabled={!selectedImage || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="mr-2 h-5 w-5 animate-pulse" />
                    AI Analiz Ediyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Ürünü Analiz Et
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ek Notlar</CardTitle>
              <CardDescription>
                Değişiklik istediğiniz veya özel isteklerinizi yazın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Örn: Kolları uzun olsun, renk tonunu biraz daha koyu yapabilir miyiz?"
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Analysis Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                AI Analiz Sonuçları
              </CardTitle>
              <CardDescription>
                Ürün detayları otomatik olarak tespit edildi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!analysisResult ? (
                <div className="text-center py-12">
                  <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Ürün analizi için fotoğraf yükleyin
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Product Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Ürün Tipi
                      </Label>
                      <p className="font-semibold">{analysisResult.productType}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Kategori
                      </Label>
                      <p className="font-semibold">{analysisResult.category}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Malzeme
                      </Label>
                      <p className="font-semibold">{analysisResult.material}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Kalıp
                      </Label>
                      <p className="font-semibold">{analysisResult.fit}</p>
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Palette className="h-4 w-4" />
                      Renkler
                    </Label>
                    <div className="flex gap-2">
                      {analysisResult.colors.map((color: string) => (
                        <Badge key={color} variant="secondary">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Scissors className="h-4 w-4" />
                      Tespit Edilen Detaylar
                    </Label>
                    <div className="space-y-2">
                      {analysisResult.details.map((detail: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Models (male/female/kids) */}
                  {analysisResult.suggestedModels && (
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <ImageIcon className="h-4 w-4" />
                        Önerilen Model Varyantları
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {analysisResult.suggestedModels.map((m: any) => (
                          <div
                            key={m.variant}
                            className="bg-white rounded-lg p-2 border flex flex-col items-center"
                          >
                            <img
                              src={m.image}
                              alt={`${m.variant} model`}
                              className="w-full h-40 object-cover rounded-md mb-2"
                            />
                            <p className="text-sm font-medium mb-1">{m.variant}</p>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {m.prompt}
                            </p>
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => handleCreateSampleRequest(m)}
                            >
                              Bu Varyantla Numune İste
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Style Info */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Ruler className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs font-medium">{analysisResult.neckline}</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Scissors className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs font-medium">{analysisResult.sleeves}</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Palette className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs font-medium">{analysisResult.pattern}</p>
                    </div>
                  </div>

                  {/* Create Request Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    size="lg"
                    onClick={handleCreateSampleRequest}
                  >
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Numune Talebi Oluştur
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-amber-900 mb-1">
                💡 İpucu: En İyi Sonuçlar İçin
              </p>
              <ul className="text-amber-800 space-y-1 text-xs">
                <li>• Net ve iyi aydınlatılmış fotoğraflar kullanın</li>
                <li>• Ürünün tüm detayları görünür olsun</li>
                <li>• Birden fazla açıdan fotoğraf ekleyebilirsiniz</li>
                <li>• Özel isteklerinizi not kısmına ekleyin</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
