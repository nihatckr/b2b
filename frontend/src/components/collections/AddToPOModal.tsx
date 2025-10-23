"use client";

import { CreateOrderDocument } from "@/__generated__/graphql";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useRelayIds } from "@/hooks/useRelayIds";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, DollarSign, FileText, Package } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "urql";

interface AddToPOModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: {
    id: string;
    name: string;
    modelCode?: string;
    company?: {
      name: string;
    };
    images?: string;
  } | null;
  onAddToPO: (data: {
    quantity: number;
    targetDeadline?: Date;
    targetPrice?: number;
    currency?: string;
    notes?: string;
  }) => void;
}

export function AddToPOModal({
  open,
  onOpenChange,
  collection,
  onAddToPO,
}: AddToPOModalProps) {
  const router = useRouter();
  const { decodeGlobalId } = useRelayIds();
  const [quantity, setQuantity] = useState<number>(1);
  const [targetDeadline, setTargetDeadline] = useState<Date>();
  const [targetPrice, setTargetPrice] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [, createOrderMutation] = useMutation(CreateOrderDocument);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!collection?.id) {
      toast.error("Koleksiyon bulunamadı");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order with initial negotiation (backend handles everything)
      const decodedId = decodeGlobalId(collection.id);
      if (!decodedId) {
        throw new Error("Invalid collection ID");
      }

      const orderResult = await createOrderMutation({
        input: {
          collectionId: decodedId.toString(),
          quantity,
          targetDeadline: targetDeadline?.toISOString(),
          targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
          currency: currency || "USD",
          notes: notes.trim() || undefined,
        },
      });

      if (orderResult.error) {
        throw new Error(orderResult.error.message);
      }

      const createdOrder = orderResult.data?.createOrder;
      if (!createdOrder?.id) {
        throw new Error("Order could not be created");
      }

      // Success notification
      toast.success("✅ Siparişiniz İletildi!", {
        description: "Üretici en kısa sürede size geri dönüş yapacaktır.",
      });

      // Redirect to order detail page
      router.push(`/dashboard/orders/${createdOrder.id}`);

      // Reset form
      setQuantity(1);
      setTargetDeadline(undefined);
      setTargetPrice("");
      setCurrency("USD");
      setNotes("");

      onOpenChange(false);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Sipariş Oluşturulamadı", {
        description: error instanceof Error ? error.message : "Bir hata oluştu",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!collection) return null;

  // Parse first image
  let imageUrl = null;
  try {
    if (collection.images) {
      const images = JSON.parse(collection.images);
      imageUrl = images[0];
      if (imageUrl && imageUrl.startsWith("/")) {
        imageUrl = `http://localhost:4001${imageUrl}`;
      }
    }
  } catch {
    // Ignore parsing errors
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add to Purchase Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Collection Info */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            {imageUrl && (
              <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 relative">
                <Image
                  src={imageUrl}
                  alt={collection.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{collection.name}</h4>
              {collection.modelCode && (
                <p className="text-sm text-gray-600">{collection.modelCode}</p>
              )}
              {collection.company && (
                <p className="text-sm text-gray-500">
                  {collection.company.name}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Sipariş Adeti *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                placeholder="Adet"
                required
              />
            </div>

            {/* Target Deadline */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Hedef Termin
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !targetDeadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetDeadline ? (
                      format(targetDeadline, "dd/MM/yyyy")
                    ) : (
                      <span>Termin seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={targetDeadline}
                    onSelect={setTargetDeadline}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Target Price */}
            <div className="space-y-2">
              <Label htmlFor="targetPrice" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Hedef Fiyat
              </Label>
              <div className="flex gap-2">
                <Input
                  id="targetPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="0.00"
                  className="flex-1"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="TRY">TRY</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Not
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Özel notlar, gereksinimler veya talimatlar..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || quantity < 1}
              >
                {isSubmitting ? "Ekleniyor..." : "PO'ya Ekle"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
