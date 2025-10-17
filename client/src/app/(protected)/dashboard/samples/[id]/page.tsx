"use client";

import { ImageComparisonSlider } from "@/components/AI/ImageComparisonSlider";
import { RequestSampleDialog } from "@/components/AI/RequestSampleDialog";
import { useAuth } from "@/context/AuthProvider";
import {
  MARK_MESSAGE_READ_MUTATION,
  MY_MESSAGES_QUERY,
  SEND_MESSAGE_MUTATION,
} from "@/lib/graphql/message-operations";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
  ArrowLeft,
  Building,
  Calendar,
  Edit,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Package,
  Send,
  Sparkles,
  Trash2,
  Truck,
  User,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../../components/ui/dialog";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { ScrollArea } from "../../../../../components/ui/scroll-area";
import { Separator } from "../../../../../components/ui/separator";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { Textarea } from "../../../../../components/ui/textarea";

const statusColors: { [key: string]: string } = {
  AI_DESIGN: "bg-purple-100 text-purple-700",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
  REQUESTED: "bg-blue-100 text-blue-700",
  RECEIVED: "bg-purple-100 text-purple-700",
  IN_DESIGN: "bg-pink-100 text-pink-700",
  PATTERN_READY: "bg-amber-100 text-amber-700",
  IN_PRODUCTION: "bg-emerald-100 text-emerald-700",
  QUALITY_CHECK: "bg-cyan-100 text-cyan-700",
  COMPLETED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  SHIPPED: "bg-teal-100 text-teal-700",
};

const statusLabels: { [key: string]: string } = {
  AI_DESIGN: "AI Tasarım",
  PENDING_APPROVAL: "Onay Bekliyor",
  REQUESTED: "Talep Edildi",
  RECEIVED: "Alındı",
  IN_DESIGN: "Tasarımda",
  PATTERN_READY: "Kalıp Hazır",
  IN_PRODUCTION: "Üretimde",
  QUALITY_CHECK: "Kalite Kontrolde",
  COMPLETED: "Tamamlandı",
  REJECTED: "Reddedildi",
  SHIPPED: "Kargoya Verildi",
};

const sampleTypeLabels: { [key: string]: string } = {
  STANDARD: "Standart Numune",
  REVISION: "Revizyon Numune",
  CUSTOM: "Özel Tasarım",
  DEVELOPMENT: "Geliştirme",
};

const UPDATE_SAMPLE_MUTATION = `
  mutation UpdateSample($id: Int!, $name: String, $description: String) {
    updateSample(
      input: {
        id: $id
        customerNote: $description
      }
    ) {
      id
      name
      description
      sampleNumber
      status
      images
      aiGenerated
      aiPrompt
      aiSketchUrl
      createdAt
    }
  }
`;

const DELETE_SAMPLE_MUTATION = `
  mutation DeleteSample($id: Int!) {
    deleteSample(id: $id) {
      id
    }
  }
`;

export default function SampleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sampleId = params.id as string;

  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [{ data, fetching, error }] = useQuery({
    query: `
      query Sample($id: Int!) {
        sample(id: $id) {
          id
          sampleNumber
          sampleType
          status
          name
          description
          images
          customerNote
          manufacturerResponse
          productionDays
          estimatedProductionDate
          actualProductionDate
          shippingDate
          deliveryAddress
          cargoTrackingNumber
          aiGenerated
          aiPrompt
          aiSketchUrl
          createdAt
          updatedAt
          collection {
            id
            name
            description
            price
          }
          customer {
            id
            firstName
            lastName
            email
          }
          manufacture {
            id
            firstName
            lastName
            email
          }
          company {
            id
            name
          }
        }
      }
    `,
    variables: { id: parseInt(sampleId) },
    requestPolicy: "network-only",
  });

  const [, updateSample] = useMutation(UPDATE_SAMPLE_MUTATION);
  const [, deleteSample] = useMutation(DELETE_SAMPLE_MUTATION);
  const [, sendMessage] = useMutation(SEND_MESSAGE_MUTATION);
  const [, markAsRead] = useMutation(MARK_MESSAGE_READ_MUTATION);

  // Get messages for this sample
  const [{ data: messagesData, fetching: messagesFetching }, refetchMessages] =
    useQuery({
      query: MY_MESSAGES_QUERY,
      variables: {
        filter: { sampleId: parseInt(sampleId) },
      },
      requestPolicy: "network-only",
    });

  const messages = messagesData?.myMessages || [];

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  if (fetching) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (error || !data?.sample) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">
              {error?.message || "Sample not found"}
            </p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sample = data.sample;

  // Initialize edit form values
  if (sample && !name && !description) {
    setName(sample.name || "");
    setDescription(sample.description || sample.customerNote || "");
  }

  const handleSave = async () => {
    try {
      const result = await updateSample({
        id: parseInt(sampleId),
        name,
        description,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("✅ Tasarım güncellendi");
      setEditMode(false);
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Güncelleme başarısız"
      );
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteSample({ id: parseInt(sampleId) });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("🗑️ Tasarım silindi");
      router.push("/dashboard/ai-features");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Silme başarısız");
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    try {
      setIsSendingMessage(true);
      const result = await sendMessage({
        content: messageContent,
        sampleId: parseInt(sampleId),
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      setMessageContent("");
      toast.success("✅ Mesaj gönderildi");
      refetchMessages();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Mesaj gönderilemedi"
      );
    } finally {
      setIsSendingMessage(false);
    }
  };

  const backendUrl =
    process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace("/graphql", "") ||
    "http://localhost:4000";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {sample.sampleNumber}
              </h1>
              {sample.aiGenerated && (
                <Badge variant="secondary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Generated
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {sample.aiGenerated ? "AI Tasarım Detayı" : "Sample Details"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[sample.status]}>
            {statusLabels[sample.status] || sample.status}
          </Badge>
          {sample.aiGenerated && (
            <>
              {/* Show Request Sample button only for AI_DESIGN status */}
              {sample.status === "AI_DESIGN" && (
                <Button
                  variant="default"
                  onClick={() => setRequestDialogOpen(true)}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                  Numune İste
                </Button>
              )}
              {editMode ? (
                <>
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleSave}>Kaydet</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setEditMode(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sil
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* AI Generated Image Comparison - Full Width for AI Samples */}
      {sample.aiGenerated && sample.images && sample.aiSketchUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Eskiz ve AI Tasarım Karşılaştırması
            </CardTitle>
            <CardDescription>
              Mouse ile gezinerek orijinal eskiz ve AI tasarımını karşılaştırın
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              try {
                const images = JSON.parse(sample.images);
                const generatedImageUrl = images[0];

                return (
                  <div className="space-y-4">
                    {/* Slider Comparison */}
                    <div className="max-w-4xl mx-auto">
                      <ImageComparisonSlider
                        beforeImage={`${backendUrl}${sample.aiSketchUrl}`}
                        afterImage={`${backendUrl}${generatedImageUrl}`}
                        beforeLabel="Orijinal Eskiz"
                        afterLabel="AI Tasarımı"
                      />
                    </div>

                    {/* Comparison Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t mt-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span>Oluşturma</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(sample.createdAt).toLocaleDateString(
                            "tr-TR",
                            {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div className="text-center border-l border-r">
                        <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          <span>AI Model</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Stable Diffusion XL
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700">
                          <ImageIcon className="h-4 w-4 text-purple-500" />
                          <span>Kalite</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Yüksek Çözünürlük
                        </p>
                      </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-800 mb-1">
                            Nasıl Karşılaştırılır?
                          </h4>
                          <p className="text-xs text-gray-600">
                            Mouse'u görsel üzerinde hareket ettirerek orijinal
                            eskiz ile AI tasarımını anlık olarak
                            karşılaştırabilirsiniz. Sol taraf eskizi, sağ taraf
                            AI tasarımını gösterir.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } catch (e) {
                return (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-24 w-24 text-gray-400" />
                  </div>
                );
              }
            })()}
          </CardContent>
        </Card>
      )}

      {/* Fallback: Only AI Image if no sketch */}
      {sample.aiGenerated && sample.images && !sample.aiSketchUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI ile Oluşturulan Tasarım
            </CardTitle>
            <CardDescription>
              Yapay zeka tarafından oluşturulan numune görüntüsü
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              try {
                const images = JSON.parse(sample.images);
                const imageUrl = images[0];
                return imageUrl ? (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`${backendUrl}${imageUrl}`}
                      alt={sample.name || "AI Generated Sample"}
                      className="w-full h-full object-contain hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-24 w-24 text-gray-400" />
                  </div>
                );
              } catch (e) {
                return (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-24 w-24 text-gray-400" />
                  </div>
                );
              }
            })()}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {sample.aiGenerated
                ? "AI Tasarım Bilgileri"
                : "Sample Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Sample Name (Editable) */}
            {sample.aiGenerated && (
              <div>
                <Label htmlFor="sample-name">Tasarım Adı</Label>
                {editMode ? (
                  <Input
                    id="sample-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tasarım adı girin..."
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium mt-1">
                    {sample.name || "İsimsiz Tasarım"}
                  </p>
                )}
              </div>
            )}

            {/* AI Sample Description (Editable) */}
            {sample.aiGenerated && (
              <div>
                <Label htmlFor="description">Açıklama</Label>
                {editMode ? (
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Tasarım açıklaması..."
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">
                    {sample.description ||
                      sample.customerNote ||
                      "Açıklama yok"}
                  </p>
                )}
              </div>
            )}

            {/* Type - Only for non-AI samples */}
            {!sample.aiGenerated && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Sample Type
                </h3>
                <Badge variant="outline">
                  {sampleTypeLabels[sample.sampleType] || sample.sampleType}
                </Badge>
              </div>
            )}

            {/* Collection */}
            {sample.collection && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Collection
                </h3>
                <p className="font-medium">{sample.collection.name}</p>
                {sample.collection.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {sample.collection.description}
                  </p>
                )}
              </div>
            )}

            {!sample.aiGenerated && <Separator />}

            {/* AI Prompt (Read-only) */}
            {sample.aiGenerated && sample.aiPrompt && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  AI Prompt
                </h3>
                <p className="text-sm bg-purple-50 p-3 rounded-md border border-purple-200">
                  {sample.aiPrompt}
                </p>
              </div>
            )}

            {/* AI Sketch URL */}
            {sample.aiGenerated && sample.aiSketchUrl && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Orijinal Eskiz
                </h3>
                <a
                  href={`${backendUrl}${sample.aiSketchUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ImageIcon className="h-4 w-4" />
                  Eskizi Görüntüle
                </a>
              </div>
            )}

            {/* Customer Note - Only for non-AI samples */}
            {!sample.aiGenerated && sample.customerNote && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Customer Request
                </h3>
                <p className="text-sm bg-blue-50 p-3 rounded-md border border-blue-200">
                  {sample.customerNote}
                </p>
              </div>
            )}

            {/* Manufacturer Response - Only for non-AI samples */}
            {!sample.aiGenerated && sample.manufacturerResponse && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Manufacturer Response
                </h3>
                <p className="text-sm bg-purple-50 p-3 rounded-md border border-purple-200">
                  {sample.manufacturerResponse}
                </p>
              </div>
            )}

            {/* Production Info - Only for non-AI samples */}
            {!sample.aiGenerated && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  {sample.productionDays && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Production Time
                      </h3>
                      <p className="font-medium">
                        {sample.productionDays} days
                      </p>
                    </div>
                  )}

                  {sample.estimatedProductionDate && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Estimated Date
                      </h3>
                      <p className="font-medium">
                        {format(
                          new Date(sample.estimatedProductionDate),
                          "dd MMM yyyy"
                        )}
                      </p>
                    </div>
                  )}

                  {sample.actualProductionDate && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Actual Completion
                      </h3>
                      <p className="font-medium">
                        {format(
                          new Date(sample.actualProductionDate),
                          "dd MMM yyyy"
                        )}
                      </p>
                    </div>
                  )}

                  {sample.shippingDate && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Shipped On
                      </h3>
                      <p className="font-medium">
                        {format(new Date(sample.shippingDate), "dd MMM yyyy")}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Delivery Info - Only for non-AI samples */}
            {!sample.aiGenerated &&
              (sample.deliveryAddress || sample.cargoTrackingNumber) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    {sample.deliveryAddress && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          Delivery Address
                        </h3>
                        <p className="text-sm">{sample.deliveryAddress}</p>
                      </div>
                    )}

                    {sample.cargoTrackingNumber && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                          <Truck className="h-4 w-4" />
                          Cargo Tracking
                        </h3>
                        <p className="text-sm font-mono font-medium">
                          {sample.cargoTrackingNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
          </CardContent>
        </Card>

        {/* Sample Request Information - Only for AI samples that have been requested */}
        {sample.aiGenerated && sample.status !== "AI_DESIGN" && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Numune Bilgileri
              </CardTitle>
              <CardDescription>
                Üreticiye gönderilen numune talebi bilgileri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sample Number */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Numune Numarası
                </h3>
                <p className="font-medium text-lg">{sample.sampleNumber}</p>
              </div>

              {/* Sample Type */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Numune Tipi
                </h3>
                <Badge variant="outline" className="font-medium">
                  {sampleTypeLabels[sample.sampleType] || sample.sampleType}
                </Badge>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Durum
                </h3>
                <Badge className={statusColors[sample.status]}>
                  {statusLabels[sample.status] || sample.status}
                </Badge>
              </div>

              {/* Customer Note */}
              {sample.customerNote && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Müşteri Talebi / Notları
                  </h3>
                  <div className="text-sm bg-blue-50 p-3 rounded-md border border-blue-200 whitespace-pre-wrap">
                    {sample.customerNote}
                  </div>
                </div>
              )}

              {/* Manufacturer Response */}
              {sample.manufacturerResponse && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Üretici Yanıtı
                  </h3>
                  <div className="text-sm bg-purple-50 p-3 rounded-md border border-purple-200 whitespace-pre-wrap">
                    {sample.manufacturerResponse}
                  </div>
                </div>
              )}

              <Separator />

              {/* Production Timeline */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Üretim Zaman Çizelgesi
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {sample.productionDays && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">
                        Üretim Süresi
                      </p>
                      <p className="font-semibold">
                        {sample.productionDays} gün
                      </p>
                    </div>
                  )}

                  {sample.estimatedProductionDate && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">
                        Tahmini Tamamlanma
                      </p>
                      <p className="font-semibold">
                        {format(
                          new Date(sample.estimatedProductionDate),
                          "dd MMM yyyy"
                        )}
                      </p>
                    </div>
                  )}

                  {sample.actualProductionDate && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">
                        Gerçek Tamamlanma
                      </p>
                      <p className="font-semibold">
                        {format(
                          new Date(sample.actualProductionDate),
                          "dd MMM yyyy"
                        )}
                      </p>
                    </div>
                  )}

                  {sample.shippingDate && (
                    <div className="bg-purple-50 p-3 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">
                        Kargo Tarihi
                      </p>
                      <p className="font-semibold">
                        {format(new Date(sample.shippingDate), "dd MMM yyyy")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Information */}
              {(sample.deliveryAddress || sample.cargoTrackingNumber) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Teslimat Bilgileri
                    </h3>

                    {sample.deliveryAddress && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Teslimat Adresi
                            </p>
                            <p className="text-sm">{sample.deliveryAddress}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {sample.cargoTrackingNumber && (
                      <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                        <div className="flex items-start gap-2">
                          <Truck className="h-4 w-4 text-amber-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Kargo Takip Numarası
                            </p>
                            <p className="text-sm font-mono font-semibold text-amber-900">
                              {sample.cargoTrackingNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Collection Info */}
              {sample.collection && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Koleksiyon
                    </h3>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-md border border-purple-200">
                      <p className="font-semibold text-purple-900">
                        {sample.collection.name}
                      </p>
                      {sample.collection.description && (
                        <p className="text-sm text-purple-700 mt-1">
                          {sample.collection.description}
                        </p>
                      )}
                      {sample.collection.price && (
                        <p className="text-xs text-purple-600 mt-2 font-medium">
                          Fiyat: {sample.collection.price} TL
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          {sample.customer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  {sample.aiGenerated ? "Müşteri" : "Customer"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">
                  {sample.customer.firstName} {sample.customer.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {sample.customer.email}
                </p>
                {sample.customer.phone && (
                  <p className="text-sm text-muted-foreground">
                    {sample.customer.phone}
                  </p>
                )}
                {sample.customer.company && (
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                    <Building className="h-3 w-3 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {sample.customer.company.name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Manufacturer Info - Show for all samples, or AI samples that have been requested */}
          {sample.manufacture &&
            (!sample.aiGenerated || sample.status !== "AI_DESIGN") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building className="h-4 w-4" />
                    {sample.aiGenerated ? "Üretici" : "Manufacturer"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium">
                    {sample.manufacture.firstName} {sample.manufacture.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {sample.manufacture.email}
                  </p>
                  {sample.manufacture.phone && (
                    <p className="text-sm text-muted-foreground">
                      {sample.manufacture.phone}
                    </p>
                  )}
                  {sample.manufacture.company && (
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                      <Building className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {sample.manufacture.company.name}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {format(new Date(sample.createdAt), "dd MMM yyyy, HH:mm")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {format(new Date(sample.updatedAt), "dd MMM yyyy, HH:mm")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Production History Timeline */}
      {sample.productionHistory && sample.productionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Production History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-4">
              {sample.productionHistory.map((history: any, index: number) => (
                <div key={history.id} className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === 0 ? "bg-primary" : "bg-muted"
                      }`}
                    />
                    {index < sample.productionHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-muted absolute top-3" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className={statusColors[history.status]}>
                        {statusLabels[history.status] || history.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(history.createdAt),
                          "dd MMM yyyy, HH:mm"
                        )}
                      </p>
                    </div>
                    {history.note && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {history.note}
                      </p>
                    )}
                    {history.estimatedDays && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Estimated: {history.estimatedDays} days
                      </p>
                    )}
                    {history.updatedBy && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated by: {history.updatedBy.firstName}{" "}
                        {history.updatedBy.lastName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Design Images (if CUSTOM type) */}
      {sample.sampleType === "CUSTOM" && sample.customDesignImages && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Custom Design Images
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {JSON.parse(sample.customDesignImages).map(
              (imgUrl: string, idx: number) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg overflow-hidden border bg-gray-50 relative"
                >
                  <Image
                    src={imgUrl}
                    alt={`Design ${idx + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform cursor-pointer"
                    unoptimized
                  />
                </div>
              )
            )}
          </div>
        </Card>
      )}

      {/* Revision Requests (if REVISION type) */}
      {sample.sampleType === "REVISION" && sample.revisionRequests && (
        <Card>
          <CardHeader>
            <CardTitle>Revision Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {JSON.parse(sample.revisionRequests).map(
                (revision: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-amber-50 border border-amber-200 rounded-md"
                  >
                    <p className="text-sm font-medium">{revision.field}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="line-through">{revision.oldValue}</span>{" "}
                      → <span className="font-medium">{revision.newValue}</span>
                    </p>
                    {revision.note && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {revision.note}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Preview Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
            <DialogDescription>Tam boyutlu görüntü görünümü</DialogDescription>
          </DialogHeader>
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {selectedImage && (
              <Image
                src={selectedImage.url}
                alt={selectedImage.title}
                fill
                className="object-contain"
                unoptimized
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageModalOpen(false)}>
              Kapat
            </Button>
            {selectedImage && (
              <Button asChild>
                <a
                  href={selectedImage.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  İndir
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Tasarımını Sil</DialogTitle>
            <DialogDescription>
              &quot;{sample.name || sample.sampleNumber}&quot; adlı AI
              tasarımını silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz ve oluşturulan görsel de silinecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
            <p className="text-sm text-red-800">
              ⚠️ Dikkat: Bu tasarım kalıcı olarak silinecektir.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Evet, Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Sample Dialog */}
      {sample.aiGenerated && (
        <RequestSampleDialog
          open={requestDialogOpen}
          onOpenChange={setRequestDialogOpen}
          aiSample={{
            id: sample.id,
            name: sample.name,
            sampleNumber: sample.sampleNumber,
            description: sample.description,
            images: sample.images,
            aiSketchUrl: sample.aiSketchUrl,
            aiPrompt: sample.aiPrompt,
          }}
        />
      )}

      {/* Production Timeline - for non-AI samples with production tracking */}
      {!sample.aiGenerated && sample.productionDays && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Üretim Takvimi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">Üretim Süresi</p>
              <p className="font-medium">{sample.productionDays} gün</p>
            </div>
            {sample.estimatedProductionDate && (
              <div>
                <p className="text-sm text-gray-500">Tahmini Bitiş</p>
                <p className="font-medium">
                  {new Date(sample.estimatedProductionDate).toLocaleDateString(
                    "tr-TR"
                  )}
                </p>
              </div>
            )}
            {sample.actualProductionDate && (
              <div>
                <p className="text-sm text-gray-500">Fiili Bitiş</p>
                <p className="font-medium">
                  {new Date(sample.actualProductionDate).toLocaleDateString(
                    "tr-TR"
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Manufacturer Info */}
      {sample.manufacture && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Üretici Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">İsim</p>
              <p className="font-medium">
                {sample.manufacture.firstName} {sample.manufacture.lastName}
              </p>
            </div>
            {sample.manufacture.email && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{sample.manufacture.email}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Messages Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mesajlaşma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Messages List */}
            <div className="border rounded-lg">
              <ScrollArea className="h-[400px] p-4">
                {messagesFetching ? (
                  <div className="text-center text-sm text-gray-500">
                    Yükleniyor...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-sm text-gray-500 py-8">
                    Henüz mesaj yok. İlk mesajı siz gönderin!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages
                      .sort(
                        (a: { createdAt: string }, b: { createdAt: string }) =>
                          new Date(a.createdAt).getTime() -
                          new Date(b.createdAt).getTime()
                      )
                      .map(
                        (msg: {
                          id: number;
                          createdAt: string;
                          senderId?: number;
                          sender?: { firstName?: string; lastName?: string };
                          content?: string;
                        }) => {
                          const isMe = msg.senderId === user?.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${
                                isMe ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  isMe
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                {!isMe && (
                                  <p className="mb-1 text-xs font-medium">
                                    {msg.sender?.firstName}{" "}
                                    {msg.sender?.lastName}
                                  </p>
                                )}
                                <p className="text-sm">{msg.content}</p>
                                <p
                                  className={`mt-1 text-xs ${
                                    isMe
                                      ? "text-primary-foreground/70"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {formatDistanceToNow(
                                    new Date(msg.createdAt),
                                    {
                                      addSuffix: true,
                                      locale: tr,
                                    }
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        }
                      )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Mesajınızı yazın..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isSendingMessage}
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isSendingMessage || !messageContent.trim()}
                size="icon"
                className="h-auto"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
