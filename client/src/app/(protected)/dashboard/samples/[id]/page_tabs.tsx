"use client";

import { ImageComparisonSlider } from "@/components/AI/ImageComparisonSlider";
import { RequestSampleDialog } from "@/components/AI/RequestSampleDialog";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  Info,
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

const SAMPLE_QUERY = `
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
        images
      }
      customer {
        id
        firstName
        lastName
        email
        company {
          id
          name
        }
      }
      manufacture {
        id
        firstName
        lastName
        email
        company {
          id
          name
        }
      }
      company {
        id
        name
      }
    }
  }
`;

export default function SampleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sampleId = params.id as string;

  const [activeTab, setActiveTab] = useState("details");
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: SAMPLE_QUERY,
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

  // Initialize edit form values with useEffect - MUST be before early returns
  useEffect(() => {
    if (data?.sample && !name && !description) {
      setName(data.sample.name || "");
      setDescription(
        data.sample.description || data.sample.customerNote || ""
      );
    }
  }, [data?.sample, name, description]);

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
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-[400px]" />
          </div>
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
              {error?.message || "Numune bulunamadı"}
            </p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sample = data.sample;

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
      reexecuteQuery({ requestPolicy: "network-only" });
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

  const getCustomerName = () => {
    if (!sample.customer) return "-";
    const { firstName, lastName } = sample.customer;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    return sample.customer.email;
  };

  const getManufactureName = () => {
    if (!sample.manufacture) return "-";
    const { firstName, lastName } = sample.manufacture;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    return sample.manufacture.email;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {sample.sampleNumber}
              </h1>
              {sample.aiGenerated && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Tasarım
                </Badge>
              )}
              <Badge className={statusColors[sample.status]}>
                {statusLabels[sample.status] || sample.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {sample.collection?.name || "Numune Detayları"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sample.aiGenerated && sample.status === "AI_DESIGN" && (
            <Button
              variant="default"
              onClick={() => setRequestDialogOpen(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
              Numune İste
            </Button>
          )}
          {sample.aiGenerated && (
            <>
              {editMode ? (
                <>
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleSave}>Kaydet</Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setEditMode(true)}
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    size="sm"
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content - 2/3 width */}
        <div className="md:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details" className="gap-2">
                <Info className="h-4 w-4" />
                Detaylar
              </TabsTrigger>
              <TabsTrigger value="images" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Görseller
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Mesajlar
                {messages.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {messages.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Numune Bilgileri
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

                  {/* Type - For all samples */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Numune Tipi
                    </h3>
                    <Badge variant="outline">
                      {sampleTypeLabels[sample.sampleType] || sample.sampleType}
                    </Badge>
                  </div>

                  {/* Collection */}
                  {sample.collection && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Koleksiyon
                      </h3>
                      <p className="font-medium">{sample.collection.name}</p>
                      {sample.collection.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {sample.collection.description}
                        </p>
                      )}
                      {sample.collection.price && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          {sample.collection.price} TL
                        </p>
                      )}
                    </div>
                  )}

                  <Separator />

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

                  {/* Customer Note */}
                  {sample.customerNote && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Müşteri Talebi
                      </h3>
                      <p className="text-sm bg-blue-50 p-3 rounded-md border border-blue-200">
                        {sample.customerNote}
                      </p>
                    </div>
                  )}

                  {/* Manufacturer Response */}
                  {sample.manufacturerResponse && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Üretici Yanıtı
                      </h3>
                      <p className="text-sm bg-purple-50 p-3 rounded-md border border-purple-200">
                        {sample.manufacturerResponse}
                      </p>
                    </div>
                  )}

                  {/* Production Info */}
                  {(sample.productionDays ||
                    sample.estimatedProductionDate ||
                    sample.actualProductionDate ||
                    sample.shippingDate) && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">
                          Üretim Bilgileri
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {sample.productionDays && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Üretim Süresi
                              </p>
                              <p className="font-medium">
                                {sample.productionDays} gün
                              </p>
                            </div>
                          )}

                          {sample.estimatedProductionDate && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Tahmini Tamamlanma
                              </p>
                              <p className="font-medium">
                                {format(
                                  new Date(sample.estimatedProductionDate),
                                  "dd MMM yyyy",
                                  { locale: tr }
                                )}
                              </p>
                            </div>
                          )}

                          {sample.actualProductionDate && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Gerçek Tamamlanma
                              </p>
                              <p className="font-medium">
                                {format(
                                  new Date(sample.actualProductionDate),
                                  "dd MMM yyyy",
                                  { locale: tr }
                                )}
                              </p>
                            </div>
                          )}

                          {sample.shippingDate && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Kargo Tarihi
                              </p>
                              <p className="font-medium">
                                {format(
                                  new Date(sample.shippingDate),
                                  "dd MMM yyyy",
                                  { locale: tr }
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Delivery Info */}
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
                                <p className="text-sm">
                                  {sample.deliveryAddress}
                                </p>
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-4">
              {/* AI Generated Image Comparison */}
              {sample.aiGenerated && sample.images && sample.aiSketchUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Eskiz ve AI Tasarım Karşılaştırması
                    </CardTitle>
                    <CardDescription>
                      Mouse ile gezinerek orijinal eskiz ve AI tasarımını
                      karşılaştırın
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      try {
                        const images = JSON.parse(sample.images);
                        const generatedImageUrl = images[0];

                        return (
                          <div className="space-y-4">
                            <div className="max-w-4xl mx-auto">
                              <ImageComparisonSlider
                                beforeImage={`${backendUrl}${sample.aiSketchUrl}`}
                                afterImage={`${backendUrl}${generatedImageUrl}`}
                                beforeLabel="Orijinal Eskiz"
                                afterLabel="AI Tasarımı"
                              />
                            </div>

                            {/* Info */}
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
                                    Mouse'u görsel üzerinde hareket ettirerek
                                    orijinal eskiz ile AI tasarımını anlık
                                    olarak karşılaştırabilirsiniz.
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

              {/* AI Image Only (no sketch) */}
              {sample.aiGenerated && sample.images && !sample.aiSketchUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      AI Tasarım
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      try {
                        const images = JSON.parse(sample.images);
                        const imageUrl = images[0];
                        return imageUrl ? (
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={`${backendUrl}${imageUrl}`}
                              alt={sample.name || "AI Generated Sample"}
                              width={800}
                              height={600}
                              className="w-full h-full object-contain"
                              unoptimized
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

              {/* Regular Sample Images */}
              {!sample.aiGenerated && sample.images && (
                <Card>
                  <CardHeader>
                    <CardTitle>Numune Görselleri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {(() => {
                        try {
                          const images = JSON.parse(sample.images);
                          return images.map((img: string, idx: number) => (
                            <div
                              key={idx}
                              className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                            >
                              <Image
                                src={`${backendUrl}${img}`}
                                alt={`Numune ${idx + 1}`}
                                width={400}
                                height={400}
                                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                unoptimized
                              />
                            </div>
                          ));
                        } catch (e) {
                          return (
                            <p className="text-sm text-muted-foreground col-span-2 text-center py-8">
                              Görsel bulunamadı
                            </p>
                          );
                        }
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Collection Images */}
              {sample.collection?.images && (
                <Card>
                  <CardHeader>
                    <CardTitle>Koleksiyon Görselleri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {(() => {
                        try {
                          const images = JSON.parse(sample.collection.images);
                          return images.map((img: string, idx: number) => (
                            <div
                              key={idx}
                              className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                            >
                              <Image
                                src={img}
                                alt={`Koleksiyon ${idx + 1}`}
                                width={400}
                                height={400}
                                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                unoptimized
                              />
                            </div>
                          ));
                        } catch (e) {
                          return null;
                        }
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
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
                                (
                                  a: { createdAt: string },
                                  b: { createdAt: string }
                                ) =>
                                  new Date(a.createdAt).getTime() -
                                  new Date(b.createdAt).getTime()
                              )
                              .map(
                                (msg: {
                                  id: number;
                                  createdAt: string;
                                  senderId?: number;
                                  sender?: {
                                    firstName?: string;
                                    lastName?: string;
                                  };
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
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Customer Info */}
          {sample.customer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Müşteri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{getCustomerName()}</p>
                <p className="text-sm text-muted-foreground">
                  {sample.customer.email}
                </p>
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

          {/* Manufacturer Info */}
          {sample.manufacture && sample.status !== "AI_DESIGN" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building className="h-4 w-4" />
                  Üretici
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{getManufactureName()}</p>
                <p className="text-sm text-muted-foreground">
                  {sample.manufacture.email}
                </p>
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

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Zaman Çizelgesi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Oluşturuldu</p>
                <p className="text-sm font-medium">
                  {format(new Date(sample.createdAt), "dd MMM yyyy, HH:mm", {
                    locale: tr,
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Son Güncelleme
                </p>
                <p className="text-sm font-medium">
                  {format(new Date(sample.updatedAt), "dd MMM yyyy, HH:mm", {
                    locale: tr,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tasarımı Sil</DialogTitle>
            <DialogDescription>
              &quot;{sample.name || sample.sampleNumber}&quot; adlı tasarımı
              silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
    </div>
  );
}
