"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { CREATE_ORDER_MUTATION, CREATE_SAMPLE_MUTATION } from "@/lib/graphql/mutations";
import { cn } from "@/lib/utils";
import {
    Award,
    Calendar,
    Edit3,
    FileText,
    Heart,
    MapPin,
    MessageCircle,
    Shirt,
    ShoppingCart,
    TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useMutation } from "urql";
import { AddToOrderModal, type OrderItemData } from "./AddToOrderModal";
import { QuestionModal, type QuestionData } from "./QuestionModal";
import { RevisionSampleModal, type RevisionSampleData } from "./RevisionSampleModal";
import { SampleRequestModal, type SampleRequestData } from "./SampleRequestModal";

interface Certification {
  id: number;
  name: string;
  category: string;
  code?: string;
}

interface Company {
  id: number;
  name: string;
  location?: string;
}

interface Collection {
  id: number;
  name: string;
  description?: string;
  modelCode: string;
  season?: string;
  gender?: string;
  fit?: string;
  trend?: string;
  colors?: string;
  fabricComposition?: string;
  targetLeadTime?: number;
  targetPrice?: number;
  moq?: number;
  images?: string[];
  likesCount: number;
  certifications?: Certification[];
  company?: Company;
  notes?: string;
}

interface CustomerCollectionCardProps {
  collection: Collection;
  isLiked?: boolean;
  onLike?: (collectionId: number) => void;
  onRequestSample?: (collectionId: number) => void;
  onRequestRevision?: (collectionId: number) => void;
  onAddToPO?: (collectionId: number) => void;
}

// Sertifika kategorisine göre ikon renkleri
const certificationColors: Record<string, string> = {
  FIBER: "text-green-600",
  CHEMICAL: "text-blue-600",
  SOCIAL: "text-purple-600",
  ENVIRONMENTAL: "text-emerald-600",
  TRACEABILITY: "text-orange-600",
};

export function CustomerCollectionCard({
  collection,
  isLiked = false,
  onLike,
  onRequestSample,
  onRequestRevision,
  onAddToPO,
}: CustomerCollectionCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(collection.likesCount || 0);

  // Modal states
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Mutations
  const [, createSample] = useMutation(CREATE_SAMPLE_MUTATION);
  const [, createOrder] = useMutation(CREATE_ORDER_MUTATION);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    onLike?.(collection.id);
  };

  const handleSampleRequest = async (data: SampleRequestData) => {
    try {
      const result = await createSample({
        input: {
          collectionId: data.collectionId,
          sampleType: data.sampleType,
          customerNote: data.customerNote,
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: "✅ Numune Talebi Gönderildi",
        description: `${collection.name} için numune talebiniz üreticiye iletildi.`,
      });
      onRequestSample?.(collection.id);
    } catch (error) {
      console.error("Sample request error:", error);
      toast({
        title: "❌ Hata",
        description: error instanceof Error ? error.message : "Numune talebi gönderilemedi.",
        variant: "destructive",
      });
    }
  };

  const handleRevisionRequest = async (data: RevisionSampleData) => {
    try {
      const result = await createSample({
        input: {
          collectionId: data.collectionId,
          originalCollectionId: data.collectionId, // Revize için orijinal koleksiyon
          sampleType: "REVISION",
          customerNote: data.revisionNote,
          revisionRequests: JSON.stringify(data.revisions), // Revize istekleri JSON olarak
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: "✅ Revize Talebi Gönderildi",
        description: `${collection.name} için revize talebiniz üreticiye iletildi.`,
      });
      onRequestRevision?.(collection.id);
    } catch (error) {
      console.error("Revision request error:", error);
      toast({
        title: "❌ Hata",
        description: error instanceof Error ? error.message : "Revize talebi gönderilemedi.",
        variant: "destructive",
      });
    }
  };

  const handleAddToOrder = async (data: OrderItemData) => {
    try {
      const result = await createOrder({
        collectionId: collection.id,
        quantity: data.quantity,
        unitPrice: data.customerTargetPrice,
        customerNote: data.customerNote,
      });

      if (result.error) {
        toast({
          title: "❌ Hata",
          description: "Sipariş oluşturulamadı. Lütfen tekrar deneyin.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "✅ Sipariş Oluşturuldu",
        description: `${collection.name} için sipariş başarıyla oluşturuldu. Sipariş No: ${result.data?.createOrder?.orderNumber}`,
      });
      onAddToPO?.(collection.id);
      setIsOrderModalOpen(false);
    } catch (error) {
      console.error("Order creation error:", error);
      toast({
        title: "❌ Hata",
        description: "Sipariş oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleQuestionSubmit = async (data: QuestionData) => {
    // TODO: Implement GraphQL mutation for question
    console.log("Question submitted:", data);
    toast({
      title: "✅ Sorunuz İletildi",
      description: `${collection.company?.name || "Üretici"} size en kısa sürede geri dönüş yapacaktır.`,
    });
  };

  const mainImage = collection.images?.[0] || "/placeholder-product.jpg";

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <Image
          src={mainImage}
          alt={collection.name}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Like Button Overlay */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              liked ? "fill-red-500 text-red-500" : "text-gray-600"
            )}
          />
        </button>

        {/* Season & Gender Badge */}
        {(collection.season || collection.gender) && (
          <div className="absolute top-3 left-3 flex gap-2">
            {collection.season && (
              <Badge variant="secondary" className="bg-white/90">
                {collection.season}
              </Badge>
            )}
            {collection.gender && (
              <Badge variant="secondary" className="bg-white/90">
                {collection.gender}
              </Badge>
            )}
          </div>
        )}

        {/* Certifications Icons */}
        {collection.certifications && collection.certifications.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-2">
            <TooltipProvider>
              {collection.certifications.slice(0, 4).map((cert) => (
                <Tooltip key={cert.id}>
                  <TooltipTrigger asChild>
                    <div className="p-1.5 bg-white/95 rounded-full shadow-sm">
                      <Award
                        className={cn(
                          "h-4 w-4",
                          certificationColors[cert.category] || "text-gray-600"
                        )}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{cert.name}</p>
                    {cert.code && <p className="text-xs">{cert.code}</p>}
                  </TooltipContent>
                </Tooltip>
              ))}
              {collection.certifications.length > 4 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-1.5 bg-white/95 rounded-full shadow-sm">
                      <span className="text-xs font-semibold px-1">
                        +{collection.certifications.length - 4}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {collection.certifications.length - 4} more
                      certification(s)
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">
              {collection.name}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {collection.modelCode}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Heart className="h-4 w-4" />
            <span>{likesCount}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Manufacturer Info */}
        {collection.company && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{collection.company.name}</p>
              {collection.company.location && (
                <p className="text-gray-500 text-xs">
                  {collection.company.location}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Lead Time */}
        {collection.targetLeadTime && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Termin: {collection.targetLeadTime} gün</span>
          </div>
        )}

        {/* Fabric Composition */}
        {collection.fabricComposition && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Shirt className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{collection.fabricComposition}</span>
          </div>
        )}

        {/* Trend */}
        {collection.trend && (
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <Badge variant="outline" className="text-xs">
              {collection.trend}
            </Badge>
          </div>
        )}

        {/* Fit */}
        {collection.fit && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {collection.fit}
            </Badge>
          </div>
        )}

        {/* Description/Notes */}
        {collection.notes && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {collection.notes}
          </p>
        )}

        {/* Price & MOQ */}
        <div className="flex items-center justify-between pt-2 border-t">
          {collection.targetPrice && (
            <div>
              <p className="text-xs text-gray-500">Hedef Fiyat</p>
              <p className="font-semibold text-lg">
                ${collection.targetPrice.toFixed(2)}
              </p>
            </div>
          )}
          {collection.moq && (
            <div className="text-right">
              <p className="text-xs text-gray-500">MOQ</p>
              <p className="font-medium">{collection.moq} adet</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-3">
        {/* Primary Action - Add to PO */}
        <Button
          onClick={() => setIsOrderModalOpen(true)}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Sipariş Ver (Add to PO)
        </Button>

        {/* Secondary Actions Row 1 */}
        <div className="flex gap-2 w-full">
          <Button
            onClick={() => setIsSampleModalOpen(true)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-1" />
            Numune Talep Et
          </Button>
          <Button
            onClick={() => setIsRevisionModalOpen(true)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Edit3 className="h-4 w-4 mr-1" />
            Revize İle Numune
          </Button>
        </div>

        {/* Secondary Actions Row 2 - Question */}
        <Button
          onClick={() => setIsQuestionModalOpen(true)}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Soru Sor
        </Button>
      </CardFooter>

      {/* Modals */}
      <SampleRequestModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        collectionId={collection.id}
        collectionName={collection.name}
        collectionImage={collection.images?.[0]}
        type="standard"
        onSubmit={handleSampleRequest}
      />

      <RevisionSampleModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        collection={collection}
        onSubmit={handleRevisionRequest}
      />

      <AddToOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        collectionId={collection.id}
        collectionName={collection.name}
        moq={collection.moq}
        maxQuantity={100000}
        targetPrice={collection.targetPrice}
        targetLeadTime={collection.targetLeadTime ? `${collection.targetLeadTime} gün` : undefined}
        onSubmit={handleAddToOrder}
      />

      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        collectionId={collection.id}
        collectionName={collection.name}
        manufacturerName={collection.company?.name}
        onSubmit={handleQuestionSubmit}
      />
    </Card>
  );
}
