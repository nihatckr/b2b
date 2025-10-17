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
import {
    AlertCircle,
    Camera,
    Image as ImageIcon,
    Shirt,
    Sparkles,
    Upload,
    Users,
    Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AIProductRecognitionPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleProcess = async () => {
    if (!selectedImage) {
      toast.error("Lütfen bir ürün fotoğrafı seçin");
      return;
    }

    setIsProcessing(true);
    toast.info("🤖 AI ürünü analiz ediyor...");

    // TODO: Implement AI processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("✨ Ürün başarıyla tanındı ve modeller oluşturuldu!");
    }, 3000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            Ürün Tanıma & Model Oluşturma
          </h1>
          <p className="text-muted-foreground mt-2">
            Fotoğraftaki ürünü tanıyın, model oluşturun ve farklı
            versiyonlarını görün
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Camera className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-base">Ürün Tanıma</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              AI fotoğraftaki ürünün türünü otomatik tanır (tişört, pantolon,
              etek, ceket vs.)
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-base">Model Oluşturma</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Erkek, kadın ve çocuk versiyonları için otomatik model oluşturur
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Shirt className="h-5 w-5 text-emerald-600" />
              </div>
              <CardTitle className="text-base">Detay Aktarımı</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ürünün desen, renk ve dokusunu yeni modellere otomatik aktarır
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Upload & Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Ürün Fotoğrafı Yükle
            </CardTitle>
            <CardDescription>
              Tanımak istediğiniz ürünün net bir fotoğrafını yükleyin
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
                    Ürün fotoğrafı yükleyin
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
                  <span className="text-sm font-medium text-blue-900">
                    {selectedImage.name}
                  </span>
                </div>
              )}
            </div>

            {/* Process Button */}
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
              onClick={handleProcess}
              disabled={!selectedImage || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Zap className="mr-2 h-5 w-5 animate-pulse" />
                  AI Analiz Ediyor...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Ürünü Tanı ve Model Oluştur
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right: How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Nasıl Çalışır?
            </CardTitle>
            <CardDescription>
              AI destekli otomatik ürün tanıma ve model oluşturma süreci
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">1</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Ürün Fotoğrafı</h4>
                  <p className="text-sm text-muted-foreground">
                    Tanımak istediğiniz ürünün (tişört, pantolon, etek, ceket
                    vb.) net bir fotoğrafını çekin veya yükleyin
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">AI Analizi</h4>
                  <p className="text-sm text-muted-foreground">
                    Yapay zeka ürünün türünü, desenini, rengini ve dokusunu
                    otomatik olarak analiz eder
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-bold">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Model Oluşturma</h4>
                  <p className="text-sm text-muted-foreground">
                    Erkek, kadın ve çocuk versiyonları için otomatik olarak
                    profesyonel modeller oluşturur
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 font-bold">4</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Detay Aktarımı</h4>
                  <p className="text-sm text-muted-foreground">
                    Ürünün desenini, rengini ve dokusunu modellere otomatik
                    olarak giydirip gerçekçi görselller üretir
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-2">
                🚧 Geliştirme Aşamasında
              </h3>
              <p className="text-sm text-amber-800 mb-3">
                Bu özellik şu anda aktif geliştirme aşamasındadır. Yakında
                kullanıma açılacaktır!
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white">
                  <Camera className="h-3 w-3 mr-1" />
                  Ürün Tanıma
                </Badge>
                <Badge variant="outline" className="bg-white">
                  <Users className="h-3 w-3 mr-1" />
                  Model Oluşturma
                </Badge>
                <Badge variant="outline" className="bg-white">
                  <Shirt className="h-3 w-3 mr-1" />
                  Otomatik Giydirme
                </Badge>
                <Badge variant="outline" className="bg-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Destekli
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Results (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Örnek Sonuçlar
          </CardTitle>
          <CardDescription>
            AI ile oluşturulan model versiyonları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {["Erkek Model", "Kadın Model", "Çocuk Model"].map((type) => (
              <div
                key={type}
                className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
              >
                <div className="text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-500">{type}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Yakında...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
