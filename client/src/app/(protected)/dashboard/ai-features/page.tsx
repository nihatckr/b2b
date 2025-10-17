"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from '@urql/next';
import {
  ArrowRight,
  Bot,
  ImageIcon,
  Sparkles,
  Wand2,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { AIDesignGenerator } from '../../../../components/AI/AIDesignGenerator';
import { Separator } from '../../../../components/ui/separator';
import { GET_AI_SAMPLES } from '../../../../lib/graphql/aiSampleOperations';

export default function AIFeaturesPage() {
  const router = useRouter();
  const [localSamples, setLocalSamples] = useState<any[]>([]);

  // Fetch AI samples from database
  const [{ data, fetching }] = useQuery({
    query: GET_AI_SAMPLES,
    variables: { limit: 20 },
  });

  // Combine database samples with locally generated ones
  const aiSamples = data?.samples?.filter((s: any) => s.aiGenerated) || [];
  const allSamples = [...localSamples, ...aiSamples];

  const handleSampleGenerated = (sample: any) => {
    setLocalSamples((prev) => [sample, ...prev]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold tracking-tight">
            AI Destekli Tasarım
          </h1>
          <Badge variant="secondary" className="ml-2">
            BETA
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Yapay zeka ile anında profesyonel numune tasarımları oluşturun
        </p>
      </div>

      <Separator />

      {/* Main CTA */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Wand2 className="h-6 w-6 text-purple-600" />
            Hemen Tasarım Oluştur
          </CardTitle>
          <CardDescription>
            Eskiz veya referans görsel yükleyin, AI size profesyonel bir numune
            tasarlasın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIDesignGenerator onSuccess={handleSampleGenerated} />
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Feature 1 */}
        <Card>
          <CardHeader>
            <ImageIcon className="h-10 w-10 text-blue-600 mb-2" />
            <CardTitle>Eskiz'den Tasarım</CardTitle>
            <CardDescription>
              Basit bir eskiz veya fotoğraf yükleyin, AI bunu profesyonel bir
              ürün tasarımına dönüştürsün
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>ControlNet ile hassas kontrol</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Stable Diffusion gücü</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Yüksek çözünürlük</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Feature 2 */}
        <Card>
          <CardHeader>
            <Zap className="h-10 w-10 text-yellow-600 mb-2" />
            <CardTitle>Hızlı Üretim</CardTitle>
            <CardDescription>
              1-2 dakika içinde profesyonel kalitede tasarım üretin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Otomatik kalite optimizasyonu</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Gerçek zamanlı durum takibi</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Tek tıkla işlem</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Feature 3 */}
        <Card>
          <CardHeader>
            <Bot className="h-10 w-10 text-green-600 mb-2" />
            <CardTitle>Akıllı Özelleştirme</CardTitle>
            <CardDescription>
              Detaylı prompt'lar ile tasarımınızı tam istediğiniz gibi şekillendirin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Renk, desen, kumaş kontrolü</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Stil ve mood ayarları</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Negatif prompt desteği</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>Nasıl Çalışır?</CardTitle>
          <CardDescription>
            4 basit adımda AI destekli numune tasarımı
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="font-semibold">Eskiz Yükle</h3>
              <p className="text-sm text-gray-600">
                Basit bir çizim veya referans görsel yükleyin
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold">Açıklama Yaz</h3>
              <p className="text-sm text-gray-600">
                İstediğiniz tasarımı detaylı açıklayın
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-green-600">3</span>
              </div>
              <h3 className="font-semibold">AI Üretsin</h3>
              <p className="text-sm text-gray-600">
                Yapay zeka tasarımınızı oluştursun (1-2 dk)
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="font-semibold">Kaydet & Kullan</h3>
              <p className="text-sm text-gray-600">
                Numune otomatik kaydedilir, hemen kullanıma hazır
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recently Generated */}
      {allSamples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI ile Oluşturulan Tasarımlar</CardTitle>
            <CardDescription>
              Yapay zeka ile oluşturduğunuz tüm numune tasarımları
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="text-center py-8 text-gray-500">
                Yükleniyor...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {allSamples.map((sample) => {
                  // Parse images from JSON string
                  let imageUrl = null;
                  try {
                    const images = sample.images ? JSON.parse(sample.images) : [];
                    imageUrl = images[0];
                  } catch (e) {
                    console.error("Failed to parse images:", e);
                  }

                  const backendUrl =
                    process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace(
                      "/graphql",
                      ""
                    ) || "http://localhost:4000";

                  const hasSketch = sample.aiSketchUrl && imageUrl;

                  return (
                    <Card
                      key={sample.id}
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 group"
                      onClick={() => router.push(`/dashboard/samples/${sample.id}`)}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                          {imageUrl ? (
                            <>
                              {/* AI Generated Image - Always visible */}
                              <img
                                src={`${backendUrl}${imageUrl}`}
                                alt={sample.name}
                                className="w-full h-full object-contain transition-all duration-300"
                              />

                              {/* Sketch Overlay - Shows on hover if sketch exists */}
                              {hasSketch && (
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <img
                                    src={`${backendUrl}${sample.aiSketchUrl}`}
                                    alt="Original Sketch"
                                    className="w-full h-full object-contain"
                                  />
                                  {/* Label */}
                                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium shadow-lg">
                                    Orijinal Eskiz
                                  </div>
                                </div>
                              )}

                              {/* Label for AI Image - Hidden on hover if sketch exists */}
                              <div className={`absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium shadow-lg transition-opacity ${hasSketch ? 'group-hover:opacity-0' : ''}`}>
                                AI Tasarım
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm truncate">
                            {sample.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {sample.sampleNumber}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                          {hasSketch && (
                            <Badge
                              variant="outline"
                              className="text-xs text-blue-600 border-blue-300"
                            >
                              Eskizli
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            İpuçları & En İyi Uygulamalar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
              <span>
                <strong>Yüksek kaliteli eskiz:</strong> Net çizgiler ve kontrast
                daha iyi sonuçlar verir
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
              <span>
                <strong>Detaylı açıklama:</strong> Renk, kumaş, stil gibi
                detayları belirtin
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
              <span>
                <strong>İngilizce prompt:</strong> AI modeli İngilizce ile daha
                iyi çalışır
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
              <span>
                <strong>Negatif prompt:</strong> İstemediğiniz özellikleri
                belirterek sonucu iyileştirin
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
              <span>
                <strong>Sabırlı olun:</strong> Kaliteli sonuçlar 1-2 dakika
                sürebilir
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
