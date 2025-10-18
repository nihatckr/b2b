"use client";

import { ProductionTimeline } from "@/components/Order/ProductionTimeline";
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
    DollarSign,
    Edit,
    Loader2,
    MessageSquare,
    Package,
    Send,
    User
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

const getSampleStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: { label: "Beklemede", className: "bg-blue-100 text-blue-800" },
    REVIEWED: {
      label: "İnceleniyor",
      className: "bg-purple-100 text-purple-800",
    },
    QUOTE_SENT: {
      label: "Teklif Gönderildi",
      className: "bg-yellow-100 text-yellow-800",
    },
    CUSTOMER_QUOTE_SENT: {
      label: "Müşteri Teklifi",
      className: "bg-amber-100 text-amber-800",
    },
    MANUFACTURER_REVIEWING_QUOTE: {
      label: "Teklif İnceleniyor",
      className: "bg-violet-100 text-violet-800",
    },
    CONFIRMED: { label: "Onaylandı", className: "bg-green-100 text-green-800" },
    REJECTED: { label: "Reddedildi", className: "bg-red-100 text-red-800" },
    REJECTED_BY_CUSTOMER: {
      label: "Müşteri Reddetti",
      className: "bg-rose-100 text-rose-800",
    },
    REJECTED_BY_MANUFACTURER: {
      label: "Üretici Reddetti",
      className: "bg-red-100 text-red-800",
    },
    IN_PRODUCTION: {
      label: "Üretimde",
      className: "bg-orange-100 text-orange-800",
    },
    PRODUCTION_COMPLETE: {
      label: "Üretim Tamamlandı",
      className: "bg-teal-100 text-teal-800",
    },
    QUALITY_CHECK: {
      label: "Kalite Kontrolde",
      className: "bg-indigo-100 text-indigo-800",
    },
    SHIPPED: { label: "Kargoda", className: "bg-cyan-100 text-cyan-800" },
    DELIVERED: {
      label: "Teslim Edildi",
      className: "bg-green-100 text-green-800",
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

// GraphQL Queries & Mutations for Samples
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
      unitPrice
      customerQuotedPrice
      customerQuoteDays
      customerQuoteNote
      customerQuoteType
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
  mutation UpdateSampleStatus($id: Int!, $status: String!, $note: String) {
    updateSample(
      input: {
        id: $id
        status: $status
        manufacturerResponse: $note
      }
    ) {
      id
      status
      manufacturerResponse
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
    $unitPrice: Float
  ) {
    updateSample(
      input: {
        id: $id
        status: $status
        manufacturerResponse: $manufacturerResponse
        productionDays: $productionDays
        estimatedProductionDate: $estimatedProductionDate
        unitPrice: $unitPrice
      }
    ) {
      id
      status
      manufacturerResponse
      productionDays
      estimatedProductionDate
      unitPrice
    }
  }
`;

const SUBMIT_CUSTOMER_QUOTE_MUTATION = `
  mutation SubmitCustomerQuoteSample(
    $sampleId: Int!
    $quotedPrice: Float!
    $quoteDays: Int!
    $note: String
    $quoteType: String!
  ) {
    updateSample(
      input: {
        id: $sampleId
        customerQuotedPrice: $quotedPrice
        customerQuoteDays: $quoteDays
        customerQuoteNote: $note
        customerQuoteType: $quoteType
        status: "CUSTOMER_QUOTE_SENT"
      }
    ) {
      id
      status
      customerQuotedPrice
      customerQuoteDays
      customerQuoteNote
      customerQuoteType
    }
  }
`;

const APPROVE_CUSTOMER_QUOTE_MUTATION = `
  mutation ApproveCustomerQuoteSample($sampleId: Int!, $approvalNote: String) {
    updateSample(
      input: {
        id: $sampleId
        status: "CONFIRMED"
        manufacturerResponse: $approvalNote
      }
    ) {
      id
      status
      manufacturerResponse
    }
  }
`;

const REJECT_CUSTOMER_QUOTE_MUTATION = `
  mutation RejectCustomerQuoteSample($sampleId: Int!, $rejectionReason: String!) {
    updateSample(
      input: {
        id: $sampleId
        status: "REJECTED_BY_MANUFACTURER"
        manufacturerResponse: $rejectionReason
      }
    ) {
      id
      status
      manufacturerResponse
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
  const [isCustomerQuoteDialogOpen, setIsCustomerQuoteDialogOpen] = useState(false);
  const [isManufacturerReviewDialogOpen, setIsManufacturerReviewDialogOpen] = useState(false);
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
    unitPrice: "",
  });

  const [customerQuoteData, setCustomerQuoteData] = useState({
    quotedPrice: "",
    quoteDays: "",
    quoteNote: "",
    quoteType: "STANDARD", // "STANDARD" or "REVISION"
  });

  const [manufacturerReviewNote, setManufacturerReviewNote] = useState("");

  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: SAMPLE_QUERY,
    variables: { id: parseInt(sampleId) },
  });

  const [, updateSampleStatus] = useMutation(UPDATE_SAMPLE_STATUS_MUTATION);
  const [, updateSample] = useMutation(UPDATE_SAMPLE_MUTATION);
  const [, submitCustomerQuote] = useMutation(SUBMIT_CUSTOMER_QUOTE_MUTATION);
  const [, approveCustomerQuote] = useMutation(APPROVE_CUSTOMER_QUOTE_MUTATION);
  const [, rejectCustomerQuote] = useMutation(REJECT_CUSTOMER_QUOTE_MUTATION);
  const [, sendMessage] = useMutation(SEND_MESSAGE_MUTATION);
  const [, markAsRead] = useMutation(MARK_MESSAGE_READ_MUTATION);

  // Get messages for this sample
  const [{ data: messagesData, fetching: messagesFetching }, refetchMessages] = useQuery({
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
    user?.role === "CUSTOMER" ||
    user?.role === "INDIVIDUAL_CUSTOMER";

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

  // GERÇEK KONTROL: Bu numuneyi kim oluşturdu
  const isCurrentUserManufacturer = user?.id === sample.manufacture?.id;
  const isCurrentUserCustomer = user?.id === sample.customer?.id;

  // Sadece bu numunenin üreticisi durumu değiştirebilir
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

  const getSampleProgress = () => {
    if (!sample) return 0;

    const {
      status,
      estimatedProductionDate,
      createdAt,
    } = sample;

    if (status === "DELIVERED") return 100;
    if (status === "REJECTED" || status === "CANCELLED") return 0;

    if (
      (status === "IN_PRODUCTION" ||
        status === "PRODUCTION_COMPLETE" ||
        status === "QUALITY_CHECK") &&
      estimatedProductionDate
    ) {
      const startDate = new Date(createdAt);
      const endDate = new Date(estimatedProductionDate);
      const now = new Date();

      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsedDuration = now.getTime() - startDate.getTime();

      if (totalDuration <= 0) return 50;

      let calculatedProgress = (elapsedDuration / totalDuration) * 100;
      calculatedProgress = Math.max(0, Math.min(100, calculatedProgress));

      if (status === "IN_PRODUCTION") {
        calculatedProgress = Math.max(30, calculatedProgress);
      } else if (status === "PRODUCTION_COMPLETE") {
        calculatedProgress = Math.max(70, calculatedProgress);
      } else if (status === "QUALITY_CHECK") {
        calculatedProgress = Math.max(85, calculatedProgress);
      }

      return Math.floor(calculatedProgress);
    }

    const progressMap: Record<string, number> = {
      PENDING: 5,
      REVIEWED: 10,
      QUOTE_SENT: 15,
      CONFIRMED: 20,
      IN_PRODUCTION: 50,
      PRODUCTION_COMPLETE: 70,
      QUALITY_CHECK: 85,
      SHIPPED: 95,
      DELIVERED: 100,
      REJECTED: 0,
      CANCELLED: 0,
    };
    return progressMap[status] || 0;
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
      unitPrice: sample.unitPrice?.toString() || "",
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
        unitPrice: editFormData.unitPrice
          ? parseFloat(editFormData.unitPrice)
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

    const receiverId = isManufacturer ? sample.customer.id : sample.manufacture?.id;
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
            sample.status !== "DELIVERED" &&
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
              <DollarSign className="h-5 w-5" />
              Numune Özeti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Tip:</span>
              <span className="font-medium">{sample.sampleType}</span>
            </div>
            {sample.unitPrice && (
              <div className="flex justify-between">
                <span className="text-gray-500">Birim Fiyat:</span>
                <span className="font-medium">₺{sample.unitPrice.toFixed(2)}</span>
              </div>
            )}
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

      {/* Manufacturer Actions for REVIEWED Status */}
      {isCurrentUserManufacturer && sample.status === "REVIEWED" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">
              📋 Numune İnceleme - Aksiyon Gerekli
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-blue-800">
              Numuneyi incelemeyi tamamladınız. Şimdi müşteriye teklif gönderebilir
              veya revize teklif sunabilirsiniz.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={async () => {
                  if (!confirm("Teklifi müşteriye göndermek istediğinizden emin misiniz?")) {
                    return;
                  }
                  setIsSubmitting(true);
                  try {
                    const result = await updateSampleStatus({
                      id: sample.id,
                      status: "QUOTE_SENT",
                    });
                    if (result.error) {
                      throw new Error(result.error.message);
                    }
                    toast.success("✅ Teklif müşteriye gönderildi!");
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
                  "💰 Teklif Gönder (Onaya Gönder)"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setActionType("SEND_REVISION");
                  setIsActionDialogOpen(true);
                }}
                disabled={isSubmitting}
                className="w-full"
              >
                📝 Revize Teklif Sun
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Actions for QUOTE_SENT Status */}
      {isCurrentUserCustomer && sample.status === "QUOTE_SENT" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900">
              💰 Üretici Teklifi Geldi - Aksiyon Gerekli
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <h4 className="font-semibold mb-2">Üretici Teklifi:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Birim Fiyat:</span>
                  <p className="font-bold text-lg">₺{sample.unitPrice?.toFixed(2) || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-600">Üretim Süresi:</span>
                  <p className="font-bold text-lg">{sample.productionDays || "-"} gün</p>
                </div>
              </div>
              {sample.manufacturerResponse && (
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Not:</span>
                  <p className="text-sm mt-1">{sample.manufacturerResponse}</p>
                </div>
              )}
            </div>
            <p className="text-sm text-amber-800">
              Üreticinin teklifini inceleyebilir, aynen kabul edebilir veya revize ederek gönderebilirsiniz.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  setCustomerQuoteData({
                    quotedPrice: sample.unitPrice?.toString() || "",
                    quoteDays: sample.productionDays?.toString() || "",
                    quoteNote: "",
                    quoteType: "STANDARD",
                  });
                  setIsCustomerQuoteDialogOpen(true);
                }}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                ✅ Teklifi İncele ve Gönder
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!confirm("Teklifi reddetmek istediğinizden emin misiniz?")) return;
                  setIsSubmitting(true);
                  try {
                    const result = await updateSampleStatus({
                      id: sample.id,
                      status: "REJECTED_BY_CUSTOMER",
                      note: "Müşteri teklifi uygun bulmadı",
                    });
                    if (result.error) {
                      throw new Error(result.error.message);
                    }
                    toast.success("Teklif reddedildi");
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
                ❌ Teklifi Reddet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manufacturer Actions for CUSTOMER_QUOTE_SENT Status */}
      {isCurrentUserManufacturer && sample.status === "CUSTOMER_QUOTE_SENT" && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="text-violet-900">
              💼 Müşteri Teklifi Geldi - Aksiyon Gerekli
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-violet-200">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-semibold">Müşteri Teklifi:</h4>
                <Badge className="bg-violet-100 text-violet-800">
                  {sample.customerQuoteType === "STANDARD" ? "Standart Teklif" : "Revize Teklif"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Teklif Edilen Fiyat:</span>
                  <p className="font-bold text-lg">₺{sample.customerQuotedPrice?.toFixed(2) || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-600">İstenen Süre:</span>
                  <p className="font-bold text-lg">{sample.customerQuoteDays || "-"} gün</p>
                </div>
              </div>
              {sample.customerQuoteNote && (
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Müşteri Notu:</span>
                  <p className="text-sm mt-1 italic">{sample.customerQuoteNote}</p>
                </div>
              )}
            </div>
            <p className="text-sm text-violet-800">
              {sample.customerQuoteType === "REVISION"
                ? "Müşteri revize teklif gönderdi. Kabul edebilir, yeni revize teklif sunabilir veya reddedebilirsiniz."
                : "Müşteri standart teklifinizi kabul etti. Onaylayarak üretimi başlatabilir veya reddedebilirsiniz."}
            </p>
            <div className={`grid grid-cols-1 ${sample.customerQuoteType === "REVISION" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-3`}>
              <Button
                onClick={() => setIsManufacturerReviewDialogOpen(true)}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                ✅ Kabul Et - Üretimi Başlat
              </Button>

              {sample.customerQuoteType && sample.customerQuoteType === "REVISION" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setActionType("SEND_REVISION");
                    setIsActionDialogOpen(true);
                  }}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  📝 Revize Teklif Sun
                </Button>
              )}

              <Button
                variant="destructive"
                onClick={async () => {
                  const reason = prompt("Ret sebebini belirtin:");
                  if (!reason) return;

                  setIsSubmitting(true);
                  try {
                    const result = await rejectCustomerQuote({
                      sampleId: sample.id,
                      rejectionReason: reason,
                    });
                    if (result.error) {
                      throw new Error(result.error.message);
                    }
                    toast.success("❌ Müşteri teklifi reddedildi");
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
                ❌ Reddet - Numune İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Production Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Numune Durumu
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-8">
          <ProductionTimeline
            currentStatus={sample.status}
            onStatusChange={
              canEditSampleStatus
                ? (newStatus) => handleStatusAction(newStatus)
                : undefined
            }
            isManufacturer={canEditSampleStatus}
            progress={getSampleProgress()}
          />

        </CardContent>
      </Card>

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
            {sample.company?.name && (
              <div>
                <p className="text-sm text-gray-500">Şirket</p>
                <p className="font-medium">{sample.company.name}</p>
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
            <div className="border rounded-lg">
              <ScrollArea className="h-[400px] p-4">
                {messagesFetching ? (
                  <div className="text-center text-sm text-gray-500">Yükleniyor...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-sm text-gray-500 py-8">
                    Henüz mesaj yok. İlk mesajı siz gönderin!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((msg: any) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            {!isMe && (
                              <p className="mb-1 text-xs font-medium">
                                {msg.sender.firstName} {msg.sender.lastName}
                              </p>
                            )}
                            <p className="text-sm">{msg.content}</p>
                            <p className={`mt-1 text-xs ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: tr })}
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
                    {new Date(sample.estimatedProductionDate).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              )}
              {sample.actualProductionDate && (
                <div>
                  <p className="text-sm text-gray-500">Fiili Bitiş</p>
                  <p className="font-medium">
                    {new Date(sample.actualProductionDate).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
            {!sample.customerNote && !sample.manufacturerResponse && !sample.aiPrompt && (
              <p className="text-sm text-gray-500 italic">Henüz not yok</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shipping Info */}
      {(sample.deliveryAddress || sample.cargoTrackingNumber || sample.shippingDate) && (
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
                <p className="font-medium font-mono">{sample.cargoTrackingNumber}</p>
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
                onValueChange={(value) => {
                  // Teklif onay kontrolü - QUOTE_SENT veya CUSTOMER_QUOTE_SENT durumunda iken
                  // üretim aşamalarına geçişi engelle
                  const needsCustomerApproval = ["QUOTE_SENT", "CUSTOMER_QUOTE_SENT"].includes(sample.status);
                  const productionStages = ["IN_PRODUCTION", "PRODUCTION_COMPLETE", "QUALITY_CHECK", "SHIPPED", "DELIVERED"];

                  if (needsCustomerApproval && productionStages.includes(value)) {
                    toast.error("❌ Müşteri teklifi onaylamadan üretim aşamalarına geçilemez!");
                    return;
                  }

                  setEditFormData({ ...editFormData, status: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Beklemede</SelectItem>
                  <SelectItem value="REVIEWED">İnceleniyor</SelectItem>
                  <SelectItem value="QUOTE_SENT">Teklif Gönderildi</SelectItem>
                  <SelectItem value="CUSTOMER_QUOTE_SENT">Müşteri Teklifi</SelectItem>
                  <SelectItem value="CONFIRMED">Onaylandı</SelectItem>
                  <SelectItem value="IN_PRODUCTION" disabled={["QUOTE_SENT", "CUSTOMER_QUOTE_SENT"].includes(sample.status)}>
                    Üretimde {["QUOTE_SENT", "CUSTOMER_QUOTE_SENT"].includes(sample.status) && "🔒"}
                  </SelectItem>
                  <SelectItem value="PRODUCTION_COMPLETE" disabled={["QUOTE_SENT", "CUSTOMER_QUOTE_SENT"].includes(sample.status)}>
                    Üretim Tamamlandı {["QUOTE_SENT", "CUSTOMER_QUOTE_SENT"].includes(sample.status) && "🔒"}
                  </SelectItem>
                  <SelectItem value="QUALITY_CHECK" disabled={["QUOTE_SENT", "CUSTOMER_QUOTE_SENT"].includes(sample.status)}>
                    Kalite Kontrolde {["QUOTE_SENT", "CUSTOMER_QUOTE_SENT"].includes(sample.status) && "🔒"}
                  </SelectItem>
                  <SelectItem value="SHIPPED" disabled={["QUOTE_SENT", "CUSTOMER_QUOTE_SENT"].includes(sample.status)}>
                    Kargoda {["QUOTE_SENT", "CUSTOMER_QUOTE_SENT"].includes(sample.status) && "🔒"}
                  </SelectItem>
                  <SelectItem value="DELIVERED" disabled={["QUOTE_SENT", "CUSTOMER_QUOTE_SENT"].includes(sample.status)}>
                    Teslim Edildi {["QUOTE_SENT", "CUSTOMER_QUOTE_SENT"].includes(sample.status) && "🔒"}
                  </SelectItem>
                  <SelectItem value="REJECTED">Reddedildi</SelectItem>
                  <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
              {["QUOTE_SENT", "CUSTOMER_QUOTE_SENT"].includes(sample.status) && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Müşteri onayı beklendiği için üretim aşamalarına geçilemez
                </p>
              )}
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Birim Fiyat (₺)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.unitPrice}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      unitPrice: e.target.value,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

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

      {/* Customer Quote Dialog */}
      <Dialog open={isCustomerQuoteDialogOpen} onOpenChange={setIsCustomerQuoteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Teklifinizi Gönderin</DialogTitle>
            <DialogDescription>
              Üretici teklifini aynen kabul edebilir veya revize teklifinizi gönderebilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Üretici Teklifi:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Birim Fiyat:</span>
                  <span className="ml-2 font-medium">₺{sample.unitPrice?.toFixed(2) || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-600">Üretim Süresi:</span>
                  <span className="ml-2 font-medium">{sample.productionDays || "-"} gün</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teklif Ettiğiniz Fiyat (₺)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={customerQuoteData.quotedPrice}
                  onChange={(e) => {
                    const newPrice = e.target.value;
                    const originalPrice = sample.unitPrice || 0;
                    const quoteType = parseFloat(newPrice) !== originalPrice ? "REVISION" : "STANDARD";
                    setCustomerQuoteData({
                      ...customerQuoteData,
                      quotedPrice: newPrice,
                      quoteType,
                    });
                  }}
                  placeholder="0.00"
                />
                {customerQuoteData.quotedPrice && parseFloat(customerQuoteData.quotedPrice) !== (sample.unitPrice || 0) && (
                  <p className="text-xs text-amber-600">⚠️ Fiyat değiştirildi - Revize teklif olarak gönderilecek</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>İstediğiniz Süre (Gün)</Label>
                <Input
                  type="number"
                  min="1"
                  value={customerQuoteData.quoteDays}
                  onChange={(e) => {
                    const newDays = e.target.value;
                    const originalDays = sample.productionDays || 0;
                    const quoteType = parseInt(newDays) !== originalDays ? "REVISION" : "STANDARD";
                    setCustomerQuoteData({
                      ...customerQuoteData,
                      quoteDays: newDays,
                      quoteType,
                    });
                  }}
                  placeholder="30"
                />
                {customerQuoteData.quoteDays && parseInt(customerQuoteData.quoteDays) !== (sample.productionDays || 0) && (
                  <p className="text-xs text-amber-600">⚠️ Süre değiştirildi - Revize teklif olarak gönderilecek</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notunuz (Opsiyonel)</Label>
              <Textarea
                value={customerQuoteData.quoteNote}
                onChange={(e) =>
                  setCustomerQuoteData({
                    ...customerQuoteData,
                    quoteNote: e.target.value,
                  })
                }
                placeholder="Teklifiniz hakkında notlarınız..."
                rows={3}
              />
            </div>

            <div className="bg-slate-100 p-3 rounded-lg">
              <p className="text-sm font-medium">
                Teklif Tipi:{" "}
                <Badge className={customerQuoteData.quoteType === "STANDARD" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                  {customerQuoteData.quoteType === "STANDARD" ? "✅ Standart (Aynen Kabul)" : "📝 Revize Teklif"}
                </Badge>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomerQuoteDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              onClick={async () => {
                if (!customerQuoteData.quotedPrice || !customerQuoteData.quoteDays) {
                  toast.error("Lütfen fiyat ve süre bilgilerini girin");
                  return;
                }

                setIsSubmitting(true);
                try {
                  const result = await submitCustomerQuote({
                    sampleId: sample.id,
                    quotedPrice: parseFloat(customerQuoteData.quotedPrice),
                    quoteDays: parseInt(customerQuoteData.quoteDays),
                    note: customerQuoteData.quoteNote || undefined,
                    quoteType: customerQuoteData.quoteType,
                  });

                  if (result.error) {
                    throw new Error(result.error.message);
                  }

                  toast.success(
                    customerQuoteData.quoteType === "STANDARD"
                      ? "✅ Teklif aynen kabul edildi ve üreticiye gönderildi!"
                      : "📝 Revize teklifiniz üreticiye gönderildi!"
                  );
                  setIsCustomerQuoteDialogOpen(false);
                  reexecuteQuery({ requestPolicy: "network-only" });
                } catch (error: any) {
                  toast.error(error.message || "Teklif gönderilemedi");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Teklifi Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manufacturer Review Dialog */}
      <Dialog open={isManufacturerReviewDialogOpen} onOpenChange={setIsManufacturerReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Müşteri Teklifini Onayla</DialogTitle>
            <DialogDescription>
              Müşteri teklifini kabul ederek üretimi başlatabilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Müşteri Teklifi:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Fiyat:</span>
                  <span className="ml-2 font-medium">₺{sample.customerQuotedPrice?.toFixed(2) || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-600">Süre:</span>
                  <span className="ml-2 font-medium">{sample.customerQuoteDays || "-"} gün</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Onay Notu (Opsiyonel)</Label>
              <Textarea
                value={manufacturerReviewNote}
                onChange={(e) => setManufacturerReviewNote(e.target.value)}
                placeholder="Onay notunuz..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsManufacturerReviewDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  const result = await approveCustomerQuote({
                    sampleId: sample.id,
                    approvalNote: manufacturerReviewNote || "Teklif kabul edildi, üretim başlatıldı",
                  });

                  if (result.error) {
                    throw new Error(result.error.message);
                  }

                  toast.success("✅ Teklif onaylandı! Üretim başlatılabilir.");
                  setIsManufacturerReviewDialogOpen(false);
                  setManufacturerReviewNote("");
                  reexecuteQuery({ requestPolicy: "network-only" });
                } catch (error: any) {
                  toast.error(error.message || "Onay işlemi başarısız");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              ✅ Onayla ve Üretimi Başlat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
