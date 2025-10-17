"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GENERATE_SAMPLE_DESIGN } from "@/lib/graphql/aiSampleOperations";
import { Loader2, Sparkles, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "urql";

interface AIDesignGeneratorProps {
  collectionId?: number;
  onSuccess?: (sample: any) => void;
  onSampleGenerated?: (sample: any) => void;
}

export function AIDesignGenerator({
  collectionId,
  onSuccess,
}: AIDesignGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [sketchPreview, setSketchPreview] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState(
    "low quality, blurry, distorted, ugly, deformed"
  );
  const [sampleName, setSampleName] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const [{ fetching }, generateSample] = useMutation(GENERATE_SAMPLE_DESIGN);

  const handleSketchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSketchFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSketchPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!sketchFile || !prompt) {
      toast.error("Lütfen eskiz yükleyin ve açıklama girin");
      return;
    }

    try {
      setUploading(true);

      // 1. Upload sketch to backend server
      const formData = new FormData();
      formData.append("file", sketchFile);
      formData.append("subfolder", "sketches");

      const BACKEND_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace('/graphql', '') || "http://localhost:4000";

      let uploadResponse;
      try {
        uploadResponse = await fetch(`${BACKEND_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });
      } catch (fetchError) {
        console.error("Upload fetch error:", fetchError);
        throw new Error(
          "Backend sunucusuna bağlanılamadı. Lütfen sunucunun çalıştığından emin olun."
        );
      }

      if (!uploadResponse.ok) {
        let errorMessage = "Eskiz yükleme başarısız";
        try {
          const errorData = await uploadResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${uploadResponse.status}: ${uploadResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        const responseData = await uploadResponse.json();
        data = responseData.data;
        if (!data || !data.path) {
          throw new Error("Yükleme başarılı ama dosya yolu alınamadı");
        }
      } catch (e) {
        if (e instanceof Error && e.message.includes("dosya yolu")) {
          throw e;
        }
        throw new Error("Sunucu yanıtı işlenirken hata oluştu");
      }

      // Use the path from backend (will be like /uploads/sketches/filename.png)
      const sketchUrl = data.path;

      // 2. Generate sample design
      const result = await generateSample({
        sketchUrl,
        prompt,
        negativePrompt: negativePrompt || undefined,
        width: 512,
        height: 512,
        steps: 20,
        cfgScale: 7.5,
        collectionId: collectionId || undefined,
        sampleName: sampleName || undefined,
        description: description || undefined,
      });

      if (result.error) {
        console.error("GraphQL error:", result.error);
        const errorMessage = result.error.message || "AI tasarım oluşturulamadı";
        throw new Error(errorMessage);
      }

      const generatedSample = result.data?.generateSampleDesign;

      if (generatedSample) {
        toast.success("✨ AI Numune tasarımı başarıyla oluşturuldu!", {
          description: `Sample #${generatedSample.sampleNumber} oluşturuldu`,
          duration: 5000,
        });

        // Show success state before closing
        setUploading(false);

        // Wait a bit to show success, then close and callback
        setTimeout(() => {
          setOpen(false);

          // Reset form
          setSketchFile(null);
          setSketchPreview("");
          setPrompt("");
          setSampleName("");
          setDescription("");

          if (onSuccess) {
            onSuccess(generatedSample);
          }
        }, 1500);
      } else {
        throw new Error("Sample oluşturuldu ama veri döndürülmedi");
      }
    } catch (error) {
      console.error("AI generation error:", error);

      // Determine error message and description
      let errorTitle = "Tasarım oluşturulamadı";
      let errorDescription = "";

      if (error instanceof Error) {
        errorTitle = error.message;

        // Add helpful descriptions based on error type
        if (error.message.includes("bağlanılamadı") || error.message.includes("Failed to fetch")) {
          errorDescription = "Server çalışmıyor olabilir. Lütfen 'npm run dev' ile server'ı başlatın.";
        } else if (error.message.includes("HTTP 404")) {
          errorDescription = "Upload endpoint bulunamadı. Server'da /api/upload route'u kontrol edin.";
        } else if (error.message.includes("HTTP 500")) {
          errorDescription = "Server hatası. Lütfen server loglarını kontrol edin.";
        } else if (error.message.includes("GraphQL")) {
          errorDescription = "AI tasarım servisi hatası. ComfyUI çalışıyor mu kontrol edin.";
        } else if (error.message.includes("dosya yolu")) {
          errorDescription = "Dosya yüklendi ama server yanıtı hatalı.";
        }
      }

      toast.error(errorTitle, {
        description: errorDescription,
        duration: 7000,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI ile Numune Tasarla
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI ile Numune Tasarımı
          </DialogTitle>
          <DialogDescription>
            Bir eskiz veya referans görsel yükleyin, açıklama yazın ve AI
            sizin için profesyonel bir numune tasarımı oluştursun.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sketch Upload */}
          <div className="space-y-2">
            <Label htmlFor="sketch">Eskiz veya Referans Görsel</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              {sketchPreview ? (
                <div className="relative">
                  <Image
                    src={sketchPreview}
                    alt="Sketch preview"
                    width={400}
                    height={400}
                    className="mx-auto rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSketchFile(null);
                      setSketchPreview("");
                    }}
                  >
                    Kaldır
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="sketch"
                  className="flex flex-col items-center justify-center cursor-pointer py-8"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Eskiz veya referans görsel yüklemek için tıklayın
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, JPEG (Maks. 10MB)
                  </p>
                </label>
              )}
              <Input
                id="sketch"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSketchUpload}
              />
            </div>
          </div>

          {/* Sample Name */}
          <div className="space-y-2">
            <Label htmlFor="sampleName">Numune Adı (Opsiyonel)</Label>
            <Input
              id="sampleName"
              value={sampleName}
              onChange={(e) => setSampleName(e.target.value)}
              placeholder="Örn: Yaz Koleksiyonu 2024 - Elbise"
            />
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Tasarım Açıklaması *</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Örn: Elegant summer dress, floral pattern, light blue color, flowing fabric, high quality fashion photography"
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Ne tür bir tasarım istediğinizi detaylı açıklayın (İngilizce
              daha iyi sonuç verir)
            </p>
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <Label htmlFor="negativePrompt">
              Negatif Açıklama (İstemediğiniz özellikler)
            </Label>
            <Textarea
              id="negativePrompt"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Örn: low quality, blurry, distorted"
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Notlar (Opsiyonel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bu tasarım hakkında eklemek istediğiniz notlar"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!sketchFile || !prompt || fetching || uploading}
            className="w-full gap-2"
          >
            {fetching || uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Oluşturuluyor... (Bu 1-2 dakika sürebilir)
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI ile Tasarım Oluştur
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            💡 İpucu: Yüksek kaliteli eskiz ve detaylı açıklama daha iyi
            sonuçlar verir
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
