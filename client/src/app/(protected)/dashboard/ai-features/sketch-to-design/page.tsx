"use client";

import { AIDesignGenerator } from "@/components/AI/AIDesignGenerator";
import { RequestSampleDialog } from "@/components/AI/RequestSampleDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GET_AI_SAMPLES } from "@/lib/graphql/aiSampleOperations";
import {
    ArrowLeft,
    Bot,
    Eye,
    Image as ImageIcon,
    Pencil,
    Send,
    Sparkles,
    Wand2,
    Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "urql";

export default function SketchToDesignPage() {
  const router = useRouter();
  const [localSamples, setLocalSamples] = useState<any[]>([]);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<any>(null);

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

  const handleRequestSample = (sample: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSample(sample);
    setRequestDialogOpen(true);
  };

  const handleViewSample = (sample: any, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/samples/${sample.id}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/ai-features')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            AI Numune Asistanı
          </Button>
          <div className="flex items-center gap-2">
            <Pencil className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold tracking-tight">
              Eskizden Tasarım Oluşturma
            </h1>
          </div>
          <p className="text-muted-foreground">
            Basit eskizinizi profesyonel tasarıma dönüştürün
          </p>
        </div>
      </div>

      {/* How It Works */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-600" />
            Nasıl Çalışır?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Eskiz Yükleyin</h4>
                <p className="text-sm text-muted-foreground">
                  Kağıda çizdiğiniz basit eskizi fotoğraflayın veya dijital
                  olarak oluşturun
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">AI İşleme</h4>
                <p className="text-sm text-muted-foreground">
                  Yapay zeka eskizinizi analiz edip profesyonel tasarıma
                  dönüştürür
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Numune İsteyin</h4>
                <p className="text-sm text-muted-foreground">
                  Beğendiğiniz tasarımı seçin ve üreticiden numune isteyin
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Oluşturulan Tasarımlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <div className="text-2xl font-bold">{allSamples.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AI Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <div className="text-lg font-semibold">Stable Diffusion XL</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ortalama Süre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <div className="text-2xl font-bold">~30 sn</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Design Generator */}
      <AIDesignGenerator onSampleGenerated={handleSampleGenerated} />

      <Separator />

      {/* Generated Samples Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Oluşturulan Tasarımlar</h2>
            <p className="text-sm text-muted-foreground">
              AI ile oluşturduğunuz tüm tasarımlar
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {allSamples.length} Tasarım
          </Badge>
        </div>

        {fetching ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : allSamples.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wand2 className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Henüz tasarım oluşturulmadı
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Yukarıdaki &quot;Numune Tasarla&quot; butonuna tıklayarak ilk AI
                tasarımınızı oluşturun
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allSamples.map((sample) => {
              const backendUrl =
                process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace(
                  "/graphql",
                  ""
                ) || "http://localhost:4000";

              let imageUrl = "";
              try {
                const images = JSON.parse(sample.images || "[]");
                imageUrl = images[0] || "";
              } catch (e) {
                console.error("Error parsing images:", e);
              }

              const hasSketch = sample.aiSketchUrl && imageUrl;

              return (
                <Card
                  key={sample.id}
                  className="hover:shadow-lg transition-all duration-300 group"
                >
                  <CardContent className="p-4 space-y-3">
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
                            </div>
                          )}

                          {/* Labels */}
                          <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg group-hover:opacity-0 transition-opacity duration-300">
                            AI Tasarım
                          </div>
                          {hasSketch && (
                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              Orijinal Eskiz
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">
                          {sample.name || sample.sampleNumber}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      </div>
                      {sample.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {sample.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {new Date(sample.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={(e) => handleViewSample(sample, e)}
                        >
                          <Eye className="h-4 w-4" />
                          Görüntüle
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => handleRequestSample(sample, e)}
                        >
                          <Send className="h-4 w-4" />
                          Numune İste
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Sample Dialog */}
      {selectedSample && (
        <RequestSampleDialog
          open={requestDialogOpen}
          onOpenChange={setRequestDialogOpen}
          aiSample={selectedSample}
        />
      )}
    </div>
  );
}
