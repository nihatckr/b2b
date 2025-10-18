"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthProvider";
import {
  MARK_MESSAGE_READ_MUTATION,
  MY_MESSAGES_QUERY,
  SEND_MESSAGE_MUTATION,
} from "@/lib/graphql/message-operations";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Loader2,
  MessageSquare,
  Package,
  Send,
  User,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

const getSampleStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    AI_DESIGN: {
      label: "AI Tasarım",
      className: "bg-purple-100 text-purple-800",
    },
    PENDING_APPROVAL: {
      label: "Onay Bekliyor",
      className: "bg-yellow-100 text-yellow-800",
    },
    REQUESTED: {
      label: "Talep Edildi",
      className: "bg-blue-100 text-blue-800",
    },
    RECEIVED: {
      label: "Alındı",
      className: "bg-purple-100 text-purple-800",
    },
    IN_DESIGN: {
      label: "Tasarımda",
      className: "bg-pink-100 text-pink-800",
    },
    PATTERN_READY: {
      label: "Kalıp Hazır",
      className: "bg-amber-100 text-amber-800",
    },
    IN_PRODUCTION: {
      label: "Üretimde",
      className: "bg-orange-100 text-orange-800",
    },
    QUALITY_CHECK: {
      label: "Kalite Kontrolde",
      className: "bg-indigo-100 text-indigo-800",
    },
    COMPLETED: {
      label: "Tamamlandı",
      className: "bg-green-100 text-green-800",
    },
    REJECTED: {
      label: "Reddedildi",
      className: "bg-red-100 text-red-800",
    },
    SHIPPED: {
      label: "Kargoya Verildi",
      className: "bg-teal-100 text-teal-800",
    },
    CANCELLED: {
      label: "İptal Edildi",
      className: "bg-gray-100 text-gray-800",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return <Badge className={config.className}>{config.label}</Badge>;
};

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
        name
        email
        phone
        company {
          id
          name
        }
      }
      manufacture {
        id
        firstName
        lastName
        name
        email
        phone
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

const UPDATE_SAMPLE_STATUS_MUTATION = `
  mutation UpdateSampleStatus($id: Int!, $status: String!, $note: String, $estimatedDays: Int) {
    updateSample(
      input: {
        id: $id
        status: $status
        manufacturerResponse: $note
        productionDays: $estimatedDays
      }
    ) {
      id
      status
      manufacturerResponse
      productionDays
    }
  }
`;

const UPDATE_SAMPLE_MUTATION = `
  mutation UpdateSample(
    $id: Int!
    $status: String
    $manufacturerResponse: String
    $productionDays: Int
    $estimatedProductionDate: String
  ) {
    updateSample(
      input: {
        id: $id
        status: $status
        manufacturerResponse: $manufacturerResponse
        productionDays: $productionDays
        estimatedProductionDate: $estimatedProductionDate
      }
    ) {
      id
      status
      manufacturerResponse
      productionDays
      estimatedProductionDate
    }
  }
`;

export default function SampleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sampleId = params.id as string;

  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [editFormData, setEditFormData] = useState({
    status: "",
    manufacturerResponse: "",
    productionDays: "",
    estimatedProductionDate: "",
  });

  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: SAMPLE_QUERY,
    variables: { id: parseInt(sampleId) },
  });

  const [, updateSampleStatus] = useMutation(UPDATE_SAMPLE_STATUS_MUTATION);
  const [, updateSample] = useMutation(UPDATE_SAMPLE_MUTATION);
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

  // Üretici kontrolü
  const isManufacturer =
    user?.role === "MANUFACTURE" ||
    user?.role === "COMPANY_OWNER" ||
    user?.role === "COMPANY_EMPLOYEE";

  // Müşteri kontrolü
  const isCustomer =
    user?.role === "CUSTOMER" || user?.role === "INDIVIDUAL_CUSTOMER";

  if (fetching) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !data?.sample) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">
              {error?.message || "Numune bulunamadı"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sample = data.sample;

  const isCurrentUserManufacturer = user?.id === sample.manufacture?.id;
  const isCurrentUserCustomer = user?.id === sample.customer?.id;
  const canEditSampleStatus = isCurrentUserManufacturer;

  const getCustomerName = () => {
    if (!sample.customer) return "Bilinmiyor";
    const { firstName, lastName, name } = sample.customer;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (name) return name;
    return sample.customer.email;
  };

  const getManufactureName = () => {
    if (!sample.manufacture) return "Bilinmiyor";
    const { firstName, lastName, name } = sample.manufacture;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (name) return name;
    return sample.manufacture.email;
  };

  const handleStatusAction = async (newStatus: string) => {
    if (!sample) return;

    setIsSubmitting(true);
    try {
      const result = await updateSampleStatus({
        id: sample.id,
        status: newStatus,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Numune durumu güncellendi");
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Durum güncellenirken bir hata oluştu";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    if (!sample) return;
    setEditFormData({
      status: sample.status,
      manufacturerResponse: sample.manufacturerResponse || "",
      productionDays: sample.productionDays?.toString() || "",
      estimatedProductionDate: sample.estimatedProductionDate
        ? new Date(sample.estimatedProductionDate).toISOString().split("T")[0]
        : "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmitEdit = async () => {
    if (!sample) return;

    setIsSubmitting(true);
    try {
      const result = await updateSample({
        id: sample.id,
        status: editFormData.status || undefined,
        manufacturerResponse: editFormData.manufacturerResponse || undefined,
        productionDays: editFormData.productionDays
          ? parseInt(editFormData.productionDays)
          : undefined,
        estimatedProductionDate: editFormData.estimatedProductionDate
          ? new Date(editFormData.estimatedProductionDate).toISOString()
          : undefined,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Numune başarıyla güncellendi");
      setIsEditDialogOpen(false);
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Numune güncellenirken bir hata oluştu";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !sample || isSendingMessage) return;

    setIsSendingMessage(true);

    const receiverId = isManufacturer
      ? sample.customer.id
      : sample.manufacture?.id;
    if (!receiverId) {
      toast.error("Alıcı bulunamadı");
      setIsSendingMessage(false);
      return;
    }

    const input = {
      content: messageContent,
      type: "sample",
      sampleId: sample.id,
      receiverId: receiverId,
    };

    const result = await sendMessage({ input });

    if (!result.error) {
      setMessageContent("");
      refetchMessages({ requestPolicy: "network-only" });
      toast.success("Mesaj gönderildi");
    } else {
      toast.error("Mesaj gönderilemedi: " + result.error.message);
    }

    setIsSendingMessage(false);
  };

  const backendUrl =
    process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace("/graphql", "") ||
    "http://localhost:4000";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{sample.sampleNumber}</h1>
          <p className="text-gray-500 mt-1">Numune Detayları</p>
        </div>
        <div className="flex items-center gap-2">
          {getSampleStatusBadge(sample.status)}

          {/* Manufacturer Edit Button */}
          {isManufacturer &&
            sample.status !== "COMPLETED" &&
            sample.status !== "CANCELLED" && (
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Collection Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Koleksiyon Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sample.collection && (
              <div className="flex gap-4">
                {sample.collection.images &&
                  (() => {
                    try {
                      const images = JSON.parse(sample.collection.images);
                      return (
                        images.length > 0 && (
                          <div className="w-32 h-32 rounded-lg overflow-hidden border flex-shrink-0">
                            <Image
                              src={images[0].replace(/\/\//g, "/")}
                              alt={sample.collection.name}
                              width={128}
                              height={128}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </div>
                        )
                      );
                    } catch (e) {
                      return null;
                    }
                  })()}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">
                    {sample.collection.name}
                  </h3>
                  {sample.collection.description && (
                    <p className="text-sm text-gray-500 mb-2">
                      {sample.collection.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Fiyat:</span>
                      <span className="ml-2 font-medium">
                        ₺{sample.collection.price?.toFixed(2) || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Sample Images */}
            {sample.aiGenerated && sample.images && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">AI Tasarım Görseli</h4>
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
                    ) : null;
                  } catch (e) {
                    return null;
                  }
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sample Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Numune Özeti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Tip:</span>
              <span className="font-medium">{sample.sampleType}</span>
            </div>
            {sample.productionDays && (
              <div className="flex justify-between">
                <span className="text-gray-500">Üretim Süresi:</span>
                <span className="font-medium">{sample.productionDays} gün</span>
              </div>
            )}
            {sample.aiGenerated && (
              <div className="flex justify-between">
                <span className="text-gray-500">AI Üretim:</span>
                <span className="font-medium text-purple-600">✨ Evet</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manufacturer Actions for PENDING_APPROVAL Status */}
      {isCurrentUserManufacturer && sample.status === "PENDING_APPROVAL" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">
              📋 Numune İnceleme - Aksiyon Gerekli
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-blue-800">
              Numune talebini incelemeyi tamamladınız. Şimdi kabul veya
              reddedebilirsiniz.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={async () => {
                  if (
                    !confirm(
                      "Numune talebini kabul etmek istediğinizden emin misiniz?"
                    )
                  ) {
                    return;
                  }
                  setIsSubmitting(true);
                  try {
                    const result = await updateSampleStatus({
                      id: sample.id,
                      status: "REQUESTED",
                    });
                    if (result.error) {
                      throw new Error(result.error.message);
                    }
                    toast.success("✅ Numune talebi kabul edildi!");
                    reexecuteQuery({ requestPolicy: "network-only" });
                  } catch (error: any) {
                    toast.error(error.message || "Hata oluştu");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "✅ Kabul Et"
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (
                    !confirm(
                      "Numune talebini reddetmek istediğinizden emin misiniz?"
                    )
                  )
                    return;
                  setIsSubmitting(true);
                  try {
                    const result = await updateSampleStatus({
                      id: sample.id,
                      status: "REJECTED",
                      note: "Numune talebi reddedildi",
                    });
                    if (result.error) {
                      throw new Error(result.error.message);
                    }
                    toast.success("❌ Numune talebi reddedildi");
                    reexecuteQuery({ requestPolicy: "network-only" });
                  } catch (error: any) {
                    toast.error(error.message || "Hata oluştu");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="w-full"
              >
                ❌ Reddet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Müşteri Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">İsim</p>
              <p className="font-medium">{getCustomerName()}</p>
            </div>
            {sample.customer?.email && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{sample.customer.email}</p>
              </div>
            )}
            {sample.customer?.phone && (
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p className="font-medium">{sample.customer.phone}</p>
              </div>
            )}
            {sample.customer?.company?.name && (
              <div>
                <p className="text-sm text-gray-500">Şirket</p>
                <p className="font-medium">{sample.customer.company.name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manufacturer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Üretici Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">İsim</p>
              <p className="font-medium">{getManufactureName()}</p>
            </div>
            {sample.manufacture?.email && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{sample.manufacture.email}</p>
              </div>
            )}
            {sample.manufacture?.phone && (
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p className="font-medium">{sample.manufacture.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                        (a: any, b: any) =>
                          new Date(a.createdAt).getTime() -
                          new Date(b.createdAt).getTime()
                      )
                      .map((msg: any) => {
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
                                  {msg.sender.firstName} {msg.sender.lastName}
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
                                {formatDistanceToNow(new Date(msg.createdAt), {
                                  addSuffix: true,
                                  locale: tr,
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
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

      {/* Timeline & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Production Timeline */}
        {sample.productionDays && (
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
                    {new Date(
                      sample.estimatedProductionDate
                    ).toLocaleDateString("tr-TR")}
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

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sample.customerNote && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Müşteri Notu:
                </p>
                <p className="text-sm p-3 bg-blue-50 rounded-lg">
                  {sample.customerNote}
                </p>
              </div>
            )}
            {sample.manufacturerResponse && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Üretici Yanıtı:
                </p>
                <p className="text-sm p-3 bg-green-50 rounded-lg">
                  {sample.manufacturerResponse}
                </p>
              </div>
            )}
            {sample.aiPrompt && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  AI Prompt:
                </p>
                <p className="text-sm p-3 bg-purple-50 rounded-lg">
                  {sample.aiPrompt}
                </p>
              </div>
            )}
            {!sample.customerNote &&
              !sample.manufacturerResponse &&
              !sample.aiPrompt && (
                <p className="text-sm text-gray-500 italic">Henüz not yok</p>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Shipping Info */}
      {(sample.deliveryAddress ||
        sample.cargoTrackingNumber ||
        sample.shippingDate) && (
        <Card>
          <CardHeader>
            <CardTitle>Teslimat Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sample.deliveryAddress && (
              <div>
                <p className="text-sm text-gray-500">Teslimat Adresi</p>
                <p className="font-medium">{sample.deliveryAddress}</p>
              </div>
            )}
            {sample.cargoTrackingNumber && (
              <div>
                <p className="text-sm text-gray-500">Kargo Takip No</p>
                <p className="font-medium font-mono">
                  {sample.cargoTrackingNumber}
                </p>
              </div>
            )}
            {sample.shippingDate && (
              <div>
                <p className="text-sm text-gray-500">Kargo Tarihi</p>
                <p className="font-medium">
                  {new Date(sample.shippingDate).toLocaleDateString("tr-TR")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Sample Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Numune Düzenle</DialogTitle>
            <DialogDescription>
              Numune bilgilerini ve üretici yanıtını güncelleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Numune Durumu</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AI_DESIGN">AI Tasarım</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Onay Bekliyor</SelectItem>
                  <SelectItem value="REQUESTED">Talep Edildi</SelectItem>
                  <SelectItem value="RECEIVED">Alındı</SelectItem>
                  <SelectItem value="IN_DESIGN">Tasarımda</SelectItem>
                  <SelectItem value="PATTERN_READY">Kalıp Hazır</SelectItem>
                  <SelectItem value="IN_PRODUCTION">Üretimde</SelectItem>
                  <SelectItem value="QUALITY_CHECK">
                    Kalite Kontrolde
                  </SelectItem>
                  <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                  <SelectItem value="REJECTED">Reddedildi</SelectItem>
                  <SelectItem value="SHIPPED">Kargoya Verildi</SelectItem>
                  <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Üretici Yanıtı</Label>
              <Textarea
                value={editFormData.manufacturerResponse}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    manufacturerResponse: e.target.value,
                  })
                }
                placeholder="Müşteriye yanıtınız, notlarınız..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Üretim Süresi (Gün)</Label>
                <Input
                  type="number"
                  min="1"
                  value={editFormData.productionDays}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      productionDays: e.target.value,
                    })
                  }
                  placeholder="Örn: 30"
                />
              </div>

              <div className="space-y-2">
                <Label>Tahmini Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={editFormData.estimatedProductionDate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      estimatedProductionDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
