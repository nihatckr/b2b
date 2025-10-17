"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { GoogleGenAI } from "@google/genai";
import { Loader2, Sparkles, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Manufacturer {
  id: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  company?: {
    id: number;
    name: string;
  };
}

interface NewSampleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  manufacturers: Manufacturer[];
  onSubmit: (data: NewSampleRequestData) => Promise<void>;
}

export interface AIAnalysisData {
  detectedProduct?: string | null;
  detectedColor?: string | null;
  detectedFabric?: string | null;
  detectedPattern?: string | null;
  detectedGender?: string | null;
  detectedClassification?: string | null;
  detectedAccessories?: string | null;
  technicalDescription?: string | null;
  qualityAnalysis?: string | null;
  qualityScore?: number | null;
  costAnalysis?: string | null;
  estimatedCostMin?: number | null;
  estimatedCostMax?: number | null;
  suggestedMinOrder?: number | null;
  trendAnalysis?: string | null;
  trendScore?: number | null;
  targetMarket?: string | null;
  salesPotential?: string | null;
  designSuggestions?: string | null;
  designStyle?: string | null;
  designFocus?: string | null;
}

export interface NewSampleRequestData {
  manufactureId: number;
  sampleName: string;
  fabricType?: string;
  fabric?: string;
  color?: string;
  classification?: string;
  gender?: string;
  size?: string;
  pattern?: string;
  accessories?: string;
  quantity: number;
  season?: string;
  description?: string;
  images?: File[];
  sizeChart?: File;
  techPack?: File;
  aiAnalysis?: AIAnalysisData;
}

export function NewSampleRequestModal({
  isOpen,
  onClose,
  manufacturers,
  onSubmit,
}: NewSampleRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<string>("");
  const [aiResults, setAiResults] = useState<{
    basic?: string;
    quality?: string;
    cost?: string;
    trend?: string;
    design?: string;
  }>({});
  const [designSettings, setDesignSettings] = useState({
    count: 3,
    style: "modern",
    focus: [] as string[],
  });
  const [formData, setFormData] = useState<Partial<NewSampleRequestData>>({
    quantity: 1,
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [sizeChartFile, setSizeChartFile] = useState<File | null>(null);
  const [techPackFile, setTechPackFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (selectedImages.length + newFiles.length > 5) {
        toast.error("Maksimum 5 fotoğraf yükleyebilirsiniz");
        return;
      }
      setSelectedImages([...selectedImages, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  // AI Image Analysis with Google Gemini
  const analyzeImageWithAI = async () => {
    if (selectedImages.length === 0) {
      toast.error("Lütfen önce bir fotoğraf yükleyin");
      return;
    }

    setIsAnalyzing(true);
    try {
      const file = selectedImages[0];
      const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!GEMINI_API_KEY) {
        toast.error("Google Gemini API key tanımlı değil");
        return;
      }

      // Initialize Google GenAI
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      // Convert image to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      // Generate content with image (Turkish output)
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Sen bir deneyimli tekstil mühendisisin. Bu ürünü teknik açıdan analiz et ve Türkçe olarak şu bilgileri ver:

                      - Ürün Türü: (T-shirt, Elbise, Pantolon, Ceket vb.)
                      - Renk: (Ana renk - PANTONE veya NCS kodu varsa belirt)
                      - Kumaş: (Örme/Dokuma, hammadde, gramaj tahmini - örn: "Single Jersey Pamuk, ~180 gsm")
                      - Kalıp: (Slim Fit, Regular Fit, Oversize, Loose Fit)
                      - Cinsiyet: (Erkek, Kadın, Unisex, Çocuk)
                      - Klasman: (Basic/Fashion/Premium/Luxury)
                      - Sezon: (İlkbahar-Yaz, Sonbahar-Kış, 4 Mevsim)
                      - Aksesuar: (Düğme tipi, Fermuar markası/tipi, Cep detayı, Aplikasyon, Label vb. - yoksa "Standart" yaz)
                      - Açıklama: (TEKNİK VE PROFESYONEL açıklama yap. Kumaş yapısı, üretim tekniği, dikiliş detayları, kalite özellikleri gibi mühendislik terimleriyle 3-4 cümle. Örnek: "Single jersey örme kumaştan üretilmiş, 4 iplik flatlock dikiş tekniği uygulanmış, ribana yaka ve kol ağzı detaylı, %100 penye pamuk kompozisyonlu, 180-200 gsm gramajlı...")

                      Tekstil mühendisi bakış açısıyla, teknik terimler kullanarak profesyonel açıklama yap.`
              },
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64
                }
              }
            ]
          }
        ],
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disable thinking for faster response
          }
        }
      });

      const caption = response.text || "";      if (!caption) {
        toast.error("Görsel analiz edilemedi");
        return;
      }

      console.log("AI Caption:", caption);

      // Parse structured response
      const lines = caption.split('\n').filter(line => line.trim());
      let sampleName = "";
      let color = "";
      let fabricType = "";
      let pattern = "REGULAR_FIT";
      let gender = "UNISEX";
      let classification = "BASIC";
      let season = "";
      let accessories = "";
      let description = "";

      lines.forEach(line => {
        const lower = line.toLowerCase();

        // Extract product type
        if (lower.includes('ürün türü:') || lower.includes('tür:')) {
          const value = line.split(':')[1]?.trim() || "";
          if (value.toLowerCase().includes('t-shirt') || value.toLowerCase().includes('tişört')) sampleName = "T-Shirt";
          else if (value.toLowerCase().includes('gömlek')) sampleName = "Gömlek";
          else if (value.toLowerCase().includes('elbise')) sampleName = "Elbise";
          else if (value.toLowerCase().includes('pantolon')) sampleName = "Pantolon";
          else if (value.toLowerCase().includes('kot') || value.toLowerCase().includes('jean')) sampleName = "Kot Pantolon";
          else if (value.toLowerCase().includes('ceket')) sampleName = "Ceket";
          else if (value.toLowerCase().includes('palto')) sampleName = "Palto";
          else if (value.toLowerCase().includes('kazak')) sampleName = "Kazak";
          else if (value.toLowerCase().includes('sweatshirt') || value.toLowerCase().includes('hoodie')) sampleName = "Sweatshirt";
          else if (value.toLowerCase().includes('etek')) sampleName = "Etek";
          else sampleName = value;
        }

        // Extract color
        if (lower.includes('renk:')) {
          color = line.split(':')[1]?.trim() || "";
        }

        // Extract fabric
        if (lower.includes('kumaş:')) {
          fabricType = line.split(':')[1]?.trim() || "";
        }

        // Extract fit/pattern
        if (lower.includes('kalıp:')) {
          const value = line.split(':')[1]?.trim().toLowerCase() || "";
          if (value.includes('slim')) pattern = "SLIM_FIT";
          else if (value.includes('oversize') || value.includes('bol')) pattern = "OVERSIZE";
          else if (value.includes('loose')) pattern = "LOOSE_FIT";
          else if (value.includes('body')) pattern = "BODY_FIT";
          else pattern = "REGULAR_FIT";
        }

        // Extract gender
        if (lower.includes('cinsiyet:')) {
          const value = line.split(':')[1]?.trim().toLowerCase() || "";
          if (value.includes('kadın') || value.includes('female')) gender = "FEMALE";
          else if (value.includes('erkek') || value.includes('male')) gender = "MALE";
          else if (value.includes('çocuk') || value.includes('kid')) gender = "KIDS";
          else gender = "UNISEX";
        }

        // Extract classification
        if (lower.includes('klasman:')) {
          const value = line.split(':')[1]?.trim().toLowerCase() || "";
          if (value.includes('basic')) classification = "BASIC";
          else if (value.includes('fashion')) classification = "FASHION";
          else if (value.includes('premium')) classification = "PREMIUM";
          else if (value.includes('luxury')) classification = "LUXURY";
        }

        // Extract season
        if (lower.includes('sezon:')) {
          season = line.split(':')[1]?.trim() || "";
        }

        // Extract accessories
        if (lower.includes('aksesuar:')) {
          accessories = line.split(':')[1]?.trim() || "";
        }

        // Extract description
        if (lower.includes('açıklama:')) {
          description = line.split(':')[1]?.trim() || "";
          // Get rest of lines as description if multi-line
          const idx = lines.indexOf(line);
          if (idx < lines.length - 1) {
            description += " " + lines.slice(idx + 1).join(" ");
          }
        }
      });

      // Update form with AI-extracted data
      setFormData({
        ...formData,
        sampleName: sampleName || formData.sampleName,
        fabricType: fabricType || formData.fabricType,
        color: color || formData.color,
        gender: gender || formData.gender,
        pattern: pattern || formData.pattern,
        classification: classification || formData.classification,
        season: season || formData.season,
        accessories: accessories || formData.accessories,
        description: description || caption,
      });

      toast.success("✨ AI analizi tamamlandı! Sonuçlar forma eklendi.");
      setAiResults({ ...aiResults, basic: caption });

    } catch (error) {
      console.error("AI analysis error:", error);
      toast.error("AI analizi sırasında bir hata oluştu: " + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quality Analysis
  const analyzeQuality = async () => {
    if (selectedImages.length === 0) {
      toast.error("Lütfen önce bir fotoğraf yükleyin");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisType("quality");
    try {
      const file = selectedImages[0];
      const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        toast.error("Google Gemini API key tanımlı değil");
        return;
      }

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [{
          role: "user",
          parts: [{
            text: `Bu tekstil ürününü kalite açısından detaylı analiz et ve Türkçe olarak rapor ver:

                   **DİKİŞ KALİTESİ** (X/10)
                   • Dikiş düzgünlüğü ve tutarlılığı
                   • Overlok/zincir kalitesi
                   • Görünen kusurlar

                   **KUMAŞ KALİTESİ** (X/10)
                   • Kumaş tipi (örme/dokuma) ve gramaj tahmini
                   • Yüzey kalitesi ve doku
                   • Renk tutarlılığı
                   • Görünen leke/kusurlar

                   **ÖLÇÜ & SİMETRİ** (X/10)
                   • Kesim simetrisi
                   • Oranlar ve fit

                   **GENEL KALİTE SKORU:** X/10

                   **ÖNERİLER:**
                   • 2-3 kritik iyileştirme önerisi

                   Emoji kullan, profesyonel ama anlaşılır yaz.`
          }, {
            inlineData: { mimeType: file.type, data: base64 }
          }]
        }],
        config: { thinkingConfig: { thinkingBudget: 0 } }
      });

      const result = response.text || "";
      setAiResults({ ...aiResults, quality: result });
      toast.success("🔍 Kalite analizi tamamlandı!");

    } catch (error) {
      console.error("Quality analysis error:", error);
      toast.error("Kalite analizi sırasında hata oluştu");
    } finally {
      setIsAnalyzing(false);
      setAnalysisType("");
    }
  };

  // Cost Analysis
  const analyzeCost = async () => {
    if (selectedImages.length === 0) {
      toast.error("Lütfen önce bir fotoğraf yükleyin");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisType("cost");
    try {
      const file = selectedImages[0];
      const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        toast.error("Google Gemini API key tanımlı değil");
        return;
      }

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [{
          role: "user",
          parts: [{
            text: `Bu tekstil ürününün maliyetini detaylı analiz et ve Türkçe rapor ver:

                   **KUMAŞ MALİYETİ**
                   • Tahmini metraj: ~X metre/adet
                   • Kumaş tipi ve fiyat: Y₺/metre
                   • Toplam kumaş maliyeti: Z₺

                   **İŞÇİLİK & ÜRETİM**
                   • Zorluk seviyesi: Basit/Orta/Karmaşık
                   • Tahmini dikim süresi: X dakika
                   • İşçilik maliyeti: Y₺
                   • Aksesuar maliyeti: Z₺

                   **FİRE & EK GİDERLER**
                   • Fire oranı: %X
                   • Kalite kontrol, etiket, paketleme: Y₺

                   **TAHMİNİ BİRİM MALİYET**
                   • En düşük: X₺
                   • En yüksek: Y₺
                   • Ortalama: Z₺

                   **MİNİMUM SİPARİŞ ÖNERİSİ:** X adet

                   **OPTİMİZASYON ÖNERİLERİ:**
                   • Maliyet düşürme fikirleri

                   Emoji kullan, detaylı ama net yaz.`
          }, {
            inlineData: { mimeType: file.type, data: base64 }
          }]
        }],
        config: { thinkingConfig: { thinkingBudget: 0 } }
      });

      const result = response.text || "";
      setAiResults({ ...aiResults, cost: result });
      toast.success("💰 Maliyet analizi tamamlandı!");

    } catch (error) {
      console.error("Cost analysis error:", error);
      toast.error("Maliyet analizi sırasında hata oluştu");
    } finally {
      setIsAnalyzing(false);
      setAnalysisType("");
    }
  };

  // Trend Analysis
  const analyzeTrend = async () => {
    if (selectedImages.length === 0) {
      toast.error("Lütfen önce bir fotoğraf yükleyin");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisType("trend");
    try {
      const file = selectedImages[0];
      const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        toast.error("Google Gemini API key tanımlı değil");
        return;
      }

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [{
          role: "user",
          parts: [{
            text: `Bu tekstil ürününün trend analizini detaylı yap ve Türkçe rapor ver:

                   **TREND SKORU:** X/10 ⭐
                   (Ne kadar güncel ve trendy?)

                   **SEZON UYGUNLUĞU**
                   • En uygun sezon
                   • Kullanım süresi
                   • İklim uygunluğu

                   **HEDEF PAZAR**
                   • Segment: High Street / Premium / Luxury
                   • Yaş grubu: Gen-Z / Millennial / vb.
                   • Cinsiyet: Erkek / Kadın / Unisex
                   • Stil: Casual / Formal / Streetwear / vb.

                   **TREND ANALİZİ**
                   • 2025 trendleriyle uyum
                   • Benzer popüler markalar
                   • Stil kategorisi detayı
                   • Sosyal medya potansiyeli

                   **SATIŞ POTANSİYELİ**
                   • Talep tahmini: Düşük/Orta/Yüksek
                   • Rekabet yoğunluğu
                   • Sezon bağımlılığı

                   **FİYATLANDIRMA STRATEJİSİ**
                   • Önerilen fiyat aralığı (₺)
                   • Pazar konumlandırması

                   **ÖNERİLER**
                   • Trend iyileştirme önerileri
                   • Alternatif tasarım fikirleri

                   Emoji kullan, pazar odaklı analiz yap.`
          }, {
            inlineData: { mimeType: file.type, data: base64 }
          }]
        }],
        config: { thinkingConfig: { thinkingBudget: 0 } }
      });

      const result = response.text || "";
      setAiResults({ ...aiResults, trend: result });
      toast.success("📊 Trend analizi tamamlandı!");

    } catch (error) {
      console.error("Trend analysis error:", error);
      toast.error("Trend analizi sırasında hata oluştu");
    } finally {
      setIsAnalyzing(false);
      setAnalysisType("");
    }
  };

  // Design Suggestions
  const analyzeDesign = async () => {
    if (selectedImages.length === 0) {
      toast.error("Lütfen önce bir fotoğraf yükleyin");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisType("design");
    try {
      const file = selectedImages[0];
      const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        toast.error("Google Gemini API key tanımlı değil");
        return;
      }

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      // Build focus areas text
      const focusText = designSettings.focus.length > 0
        ? `Özellikle şu alanlara odaklan: ${designSettings.focus.join(", ")}`
        : "Tüm tasarım elementlerini değerlendir";

      const styleGuide = {
        modern: "Modern, minimalist, clean lines",
        vintage: "Vintage, retro, nostaljik",
        streetwear: "Urban, sokak modası, bold",
        formal: "Formal, klasik, profesyonel",
        casual: "Casual, rahat, günlük",
        sporty: "Sportif, dinamik, aktif"
      }[designSettings.style] || "Modern";

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [{
          role: "user",
          parts: [{
            text: `Bu tekstil ürünü için ${designSettings.count} adet YARATICI tasarım önerisi geliştir.

                   Stil Yönü: ${styleGuide}
                   ${focusText}

                   Her öneri için şu formatta detay ver:

                   **ÖNERİ #X - [Öneri Başlığı]**

                   🎨 **YAKA DEĞİŞİKLİĞİ:**
                   • Mevcut: [mevcut durum]
                   • Öneri: [detaylı açıklama]
                   • Neden: [avantajı]

                   👔 **CEP TASARIMI:**
                   • Öneri: [pozisyon, boyut, stil]
                   • Detay: [özel özellikler]

                   🧵 **DİKİŞ DETAYI:**
                   • Öneri: [kontrast iplik, görünür dikiş vb.]
                   • Efekt: [görsel etki]

                   ✂️ **KESİM/YIRTMAÇ:**
                   • Öneri: [asimetrik kesim, yan yırtmaç vb.]
                   • Stil: [nasıl görünür]

                   🎨 **BASKI/NAKIŞ:**
                   • Öneri: [baskı tekniği, nakış detayı]
                   • Tema: [desen/motif önerisi]

                   🌈 **RENK VARYANTI:**
                   • Ana Renk: [mevcut]
                   • Alternatif 1: [renk + neden]
                   • Alternatif 2: [renk + neden]
                   • Kombinasyon: [kontrast renk önerisi]

                   💡 **EKSTRa DETAY:**
                   • [Yaratıcı ek öneriler: fermuarlar, aplikeler, reflektif detaylar vb.]

                   📊 **UYGULANMA ZORLUĞU:** Kolay/Orta/Zor
                   💰 **EK MALİYET TAHMİNİ:** +X₺

                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                   Her öneriyi detaylı, uygulanabilir ve yaratıcı yap!
                   Emoji kullan, profesyonel ama ilham verici yaz.
                   ${designSettings.style} stiline uygun öneriler sun.`
          }, {
            inlineData: { mimeType: file.type, data: base64 }
          }]
        }],
        config: { thinkingConfig: { thinkingBudget: 0 } }
      });

      const result = response.text || "";
      setAiResults({ ...aiResults, design: result });
      toast.success("🎨 Tasarım önerileri oluşturuldu!");

    } catch (error) {
      console.error("Design analysis error:", error);
      toast.error("Tasarım analizi sırasında hata oluştu");
    } finally {
      setIsAnalyzing(false);
      setAnalysisType("");
    }
  };

  const handleSubmit = async () => {
    if (!formData.manufactureId) {
      toast.error("Lütfen bir üretici seçin");
      return;
    }
    if (!formData.sampleName) {
      toast.error("Lütfen numune adı girin");
      return;
    }
    if (!formData.quantity || formData.quantity < 1) {
      toast.error("Lütfen geçerli bir adet girin");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare AI Analysis data if exists
      const aiAnalysisData = (aiResults.basic || aiResults.quality || aiResults.cost || aiResults.trend || aiResults.design) ? {
        // Basic analysis fields (from auto-filled form)
        detectedProduct: formData.sampleName || null,
        detectedColor: formData.color || null,
        detectedFabric: formData.fabric || null,
        detectedPattern: formData.pattern || null,
        detectedGender: formData.gender || null,
        detectedClassification: formData.classification || null,
        detectedAccessories: formData.accessories || null,
        technicalDescription: aiResults.basic || null,

        // Quality analysis
        qualityAnalysis: aiResults.quality || null,
        qualityScore: aiResults.quality ? parseQualityScore(aiResults.quality) : null,

        // Cost analysis
        costAnalysis: aiResults.cost || null,
        estimatedCostMin: aiResults.cost ? parseCostRange(aiResults.cost).min : null,
        estimatedCostMax: aiResults.cost ? parseCostRange(aiResults.cost).max : null,
        suggestedMinOrder: aiResults.cost ? parseMinOrder(aiResults.cost) : null,

        // Trend analysis
        trendAnalysis: aiResults.trend || null,
        trendScore: aiResults.trend ? parseTrendScore(aiResults.trend) : null,
        targetMarket: aiResults.trend ? parseTargetMarket(aiResults.trend) : null,
        salesPotential: aiResults.trend ? parseSalesPotential(aiResults.trend) : null,

        // Design suggestions
        designSuggestions: aiResults.design || null,
        designStyle: designSettings.style || null,
        designFocus: designSettings.focus.length > 0 ? JSON.stringify(designSettings.focus) : null,
      } : undefined;

      await onSubmit({
        ...formData as NewSampleRequestData,
        images: selectedImages.length > 0 ? selectedImages : undefined,
        sizeChart: sizeChartFile || undefined,
        techPack: techPackFile || undefined,
        aiAnalysis: aiAnalysisData,
      });

      // Reset form
      setFormData({ quantity: 1 });
      setSelectedImages([]);
      setSizeChartFile(null);
      setTechPackFile(null);
      setAiResults({});
      setDesignSettings({ count: 3, style: "modern", focus: [] });
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions to parse AI results
  const parseQualityScore = (text: string): number | null => {
    const match = text.match(/GENEL SKOR[:\s]+(\d+(?:\.\d+)?)/i);
    return match ? parseFloat(match[1]) : null;
  };

  const parseCostRange = (text: string): { min: number | null; max: number | null } => {
    const match = text.match(/BİRİM MALİYET[:\s]+(\d+(?:\.\d+)?)[₺\s-]+(\d+(?:\.\d+)?)/i);
    return {
      min: match ? parseFloat(match[1]) : null,
      max: match ? parseFloat(match[2]) : null,
    };
  };

  const parseMinOrder = (text: string): number | null => {
    const match = text.match(/MİNİMUM SİPARİŞ[:\s]+(\d+)/i);
    return match ? parseInt(match[1]) : null;
  };

  const parseTrendScore = (text: string): number | null => {
    const match = text.match(/TREND SKORU[:\s]+(\d+(?:\.\d+)?)/i);
    return match ? parseFloat(match[1]) : null;
  };

  const parseTargetMarket = (text: string): string | null => {
    const match = text.match(/HEDEF PAZAR[:\s]+([^\n]+)/i);
    return match ? match[1].trim() : null;
  };

  const parseSalesPotential = (text: string): string | null => {
    const match = text.match(/SATIŞ POTANSİYELİ[:\s]+([^\n]+)/i);
    return match ? match[1].trim() : null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Numune Talebi</DialogTitle>
          <DialogDescription>
            Üreticiden numune talep etmek için formu doldurun
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Fotoğraf Yükleme - EN ÜSTTE */}
          <div className="space-y-2">
            <Label>Ürün Fotoğrafları (Maksimum 5)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="images"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  Model fotoğrafı yüklemek için tıklayın
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  AI ile otomatik form doldurma için fotoğraf ekleyin
                </span>
              </label>
            </div>
            {selectedImages.length > 0 && (
              <>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {/* AI Analysis Buttons */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={analyzeImageWithAI}
                    disabled={isAnalyzing || selectedImages.length === 0}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    {isAnalyzing && analysisType === "" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        AI Analiz Ediliyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        🤖 Temel Analiz & Form Doldur
                      </>
                    )}
                  </Button>

                  {/* Advanced Analysis Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      type="button"
                      onClick={analyzeQuality}
                      disabled={isAnalyzing}
                      variant="outline"
                      className="text-xs"
                    >
                      {isAnalyzing && analysisType === "quality" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "🔍 Kalite"
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={analyzeCost}
                      disabled={isAnalyzing}
                      variant="outline"
                      className="text-xs"
                    >
                      {isAnalyzing && analysisType === "cost" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "💰 Maliyet"
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={analyzeTrend}
                      disabled={isAnalyzing}
                      variant="outline"
                      className="text-xs"
                    >
                      {isAnalyzing && analysisType === "trend" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "📊 Trend"
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={analyzeDesign}
                      disabled={isAnalyzing}
                      variant="outline"
                      className="text-xs bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100"
                    >
                      {isAnalyzing && analysisType === "design" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "🎨 Tasarım"
                      )}
                    </Button>
                  </div>

                  {/* Design Settings - Always Visible */}
                  <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 mt-3">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      🎨 Tasarım Önerileri Ayarları
                    </h4>

                      {/* Öneri Sayısı */}
                      <div className="mb-3">
                        <Label className="text-xs text-gray-600 mb-1">Öneri Sayısı</Label>
                        <Select
                          value={designSettings.count.toString()}
                          onValueChange={(value) =>
                            setDesignSettings({ ...designSettings, count: parseInt(value) })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 Öneri</SelectItem>
                            <SelectItem value="3">3 Öneri (Önerilen)</SelectItem>
                            <SelectItem value="4">4 Öneri</SelectItem>
                            <SelectItem value="5">5 Öneri</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Stil Yönü */}
                      <div className="mb-3">
                        <Label className="text-xs text-gray-600 mb-1">Stil Yönü</Label>
                        <Select
                          value={designSettings.style}
                          onValueChange={(value) =>
                            setDesignSettings({ ...designSettings, style: value })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="modern">Modern & Minimalist</SelectItem>
                            <SelectItem value="vintage">Vintage & Retro</SelectItem>
                            <SelectItem value="streetwear">Streetwear & Urban</SelectItem>
                            <SelectItem value="formal">Formal & Klasik</SelectItem>
                            <SelectItem value="casual">Casual & Rahat</SelectItem>
                            <SelectItem value="sporty">Sporty & Dinamik</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Odak Alanları */}
                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">Odaklanılacak Alanlar (opsiyonel)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: "yaka", label: "Yaka" },
                            { value: "cep", label: "Cep" },
                            { value: "dikiş", label: "Dikiş" },
                            { value: "yırtmaç", label: "Yırtmaç/Etek" },
                            { value: "baskı", label: "Baskı/Nakış" },
                            { value: "renk", label: "Renk Varyantı" },
                          ].map((item) => (
                            <div key={item.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={item.value}
                                checked={designSettings.focus.includes(item.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setDesignSettings({
                                      ...designSettings,
                                      focus: [...designSettings.focus, item.value]
                                    });
                                  } else {
                                    setDesignSettings({
                                      ...designSettings,
                                      focus: designSettings.focus.filter(f => f !== item.value)
                                    });
                                  }
                                }}
                              />
                              <label
                                htmlFor={item.value}
                                className="text-xs text-gray-700 cursor-pointer"
                              >
                                {item.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                </div>

                {/* AI Results Display - Tabs */}
                {(aiResults.quality || aiResults.cost || aiResults.trend || aiResults.design) && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-lg border-2 border-purple-200 shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
                      <h3 className="font-bold text-base text-gray-800">AI Analiz Raporları</h3>
                    </div>

                    <Tabs defaultValue={aiResults.design ? "design" : aiResults.quality ? "quality" : aiResults.cost ? "cost" : "trend"} className="w-full">
                      <TabsList className="grid w-full grid-cols-4 bg-white/80">
                        {aiResults.design && (
                          <TabsTrigger value="design" className="text-xs data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                            🎨 Tasarım
                          </TabsTrigger>
                        )}
                        {aiResults.quality && (
                          <TabsTrigger value="quality" className="text-xs data-[state=active]:bg-green-500 data-[state=active]:text-white">
                            🔍 Kalite
                          </TabsTrigger>
                        )}
                        {aiResults.cost && (
                          <TabsTrigger value="cost" className="text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                            💰 Maliyet
                          </TabsTrigger>
                        )}
                        {aiResults.trend && (
                          <TabsTrigger value="trend" className="text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                            📊 Trend
                          </TabsTrigger>
                        )}
                      </TabsList>

                      {aiResults.design && (
                        <TabsContent value="design" className="mt-3">
                          <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg shadow-sm border-l-4 border-pink-500 max-h-96 overflow-y-auto">
                            <div className="prose prose-sm max-w-none">
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                                {aiResults.design}
                              </pre>
                            </div>
                          </div>
                        </TabsContent>
                      )}

                      {aiResults.quality && (
                        <TabsContent value="quality" className="mt-3">
                          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500 max-h-60 overflow-y-auto">
                            <div className="prose prose-sm max-w-none">
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                                {aiResults.quality}
                              </pre>
                            </div>
                          </div>
                        </TabsContent>
                      )}

                      {aiResults.cost && (
                        <TabsContent value="cost" className="mt-3">
                          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500 max-h-60 overflow-y-auto">
                            <div className="prose prose-sm max-w-none">
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                                {aiResults.cost}
                              </pre>
                            </div>
                          </div>
                        </TabsContent>
                      )}

                      {aiResults.trend && (
                        <TabsContent value="trend" className="mt-3">
                          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500 max-h-60 overflow-y-auto">
                            <div className="prose prose-sm max-w-none">
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                                {aiResults.trend}
                              </pre>
                            </div>
                          </div>
                        </TabsContent>
                      )}
                    </Tabs>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Üretici Seçimi */}
          <div className="space-y-2">
            <Label>
              Üretici <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.manufactureId?.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, manufactureId: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Üretici seçin" />
              </SelectTrigger>
              <SelectContent>
                {manufacturers.map((manufacturer) => (
                  <SelectItem
                    key={manufacturer.id}
                    value={manufacturer.id.toString()}
                  >
                    {manufacturer.company?.name ||
                      manufacturer.name ||
                      `${manufacturer.firstName} ${manufacturer.lastName}` ||
                      manufacturer.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Numune Adı */}
          <div className="space-y-2">
            <Label>
              Numune Adı <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.sampleName || ""}
              onChange={(e) =>
                setFormData({ ...formData, sampleName: e.target.value })
              }
              placeholder="Örn: Slim Fit Pantolon"
            />
          </div>

          {/* İki Sütunlu Alan */}
          <div className="grid grid-cols-2 gap-4">
            {/* Kumaş Türü */}
            <div className="space-y-2">
              <Label>Kumaş Türü</Label>
              <Input
                value={formData.fabricType || ""}
                onChange={(e) =>
                  setFormData({ ...formData, fabricType: e.target.value })
                }
                placeholder="Örn: %100 Pamuk"
              />
            </div>

            {/* Renk */}
            <div className="space-y-2">
              <Label>Renk</Label>
              <Input
                value={formData.color || ""}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                placeholder="Örn: Lacivert"
              />
            </div>

            {/* Klasman */}
            <div className="space-y-2">
              <Label>Klasman</Label>
              <Select
                value={formData.classification || ""}
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
              <Label>Cinsiyet</Label>
              <Select
                value={formData.gender || ""}
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
              <Label>Beden</Label>
              <Input
                value={formData.size || ""}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
                placeholder="Örn: S, M, L, XL"
              />
            </div>

            {/* Kalıp */}
            <div className="space-y-2">
              <Label>Kalıp</Label>
              <Select
                value={formData.pattern || ""}
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
              <Label>Aksesuar</Label>
              <Input
                value={formData.accessories || ""}
                onChange={(e) =>
                  setFormData({ ...formData, accessories: e.target.value })
                }
                placeholder="Örn: Fermuar, Düğme"
              />
            </div>

            {/* Numune Adeti */}
            <div className="space-y-2">
              <Label>
                Numune Adeti <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="1"
                value={formData.quantity || 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>

          {/* Ölçü Tablosu PDF */}
          <div className="space-y-2">
            <Label>Ölçü Tablosu (PDF)</Label>
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setSizeChartFile(e.target.files?.[0] || null)
              }
            />
            {sizeChartFile && (
              <p className="text-sm text-green-600">
                ✓ {sizeChartFile.name}
              </p>
            )}
          </div>

          {/* Tech Pack PDF */}
          <div className="space-y-2">
            <Label>Tech Pack (PDF)</Label>
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setTechPackFile(e.target.files?.[0] || null)
              }
            />
            {techPackFile && (
              <p className="text-sm text-green-600">
                ✓ {techPackFile.name}
              </p>
            )}
          </div>

          {/* Açıklama */}
          <div className="space-y-2">
            <Label>Açıklama</Label>
            <Textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Özel taleplerinizi ve detayları buraya yazın..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Numune Talebi Gönder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
