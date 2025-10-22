"use client";

import {
  CollectionsDetailDocument,
  CollectionsUpdateDocument,
} from "@/__generated__/graphql";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRelayIds } from "@/hooks/useRelayIds";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

export default function CollectionEditPage() {
  const params = useParams();
  const router = useRouter();
  const { decodeGlobalId } = useRelayIds();
  const [editModalOpen, setEditModalOpen] = useState(true);

  // Validate and parse collection ID (Relay Global ID format)
  const rawId = params.id as string;
  let collectionId: number = 0;
  let isValidId: boolean = false;

  if (rawId) {
    try {
      // Try to decode Relay Global ID first
      const decodedId = decodeGlobalId(rawId);
      if (decodedId !== null && !isNaN(decodedId) && decodedId > 0) {
        collectionId = decodedId;
        isValidId = true;
      }
    } catch {
      // If decoding fails, try parsing as regular number
      const parsedId = parseInt(rawId);
      if (!isNaN(parsedId) && parsedId > 0) {
        collectionId = parsedId;
        isValidId = true;
      }
    }
  }

  // Always call hooks first
  const [{ data, fetching, error }] = useQuery({
    query: CollectionsDetailDocument,
    variables: { id: isValidId ? collectionId : 0 }, // Use 0 for invalid IDs
    pause: !isValidId, // Pause query if ID is invalid
  });

  const [, updateCollection] = useMutation(CollectionsUpdateDocument);

  // If ID is invalid, show error
  if (!isValidId) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-destructive">
                Invalid Collection ID
              </h3>
              <p className="text-muted-foreground">
                The collection ID &quot;{rawId}&quot; is not valid.
              </p>
              <Button asChild>
                <Link href="/dashboard/collections">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Collections
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const collection = data?.collection;

  const handleUpdate = async (formData: Record<string, unknown>) => {
    try {
      const result = await updateCollection({
        id: collectionId,
        name: formData.name as string,
        description: formData.description as string | undefined,
        season: formData.season as string | undefined,
        gender: formData.gender as string | undefined,
        fit: formData.fit as string | undefined,
        trend: formData.trend as string | undefined,
        colors: formData.colors as string | undefined,
        sizeRange: formData.sizeRange as string | undefined,
        fabricComposition: formData.fabricComposition as string | undefined,
        accessories: formData.accessories as string | undefined,
        images: formData.images as string | undefined,
        moq: formData.moq as number | undefined,
        targetPrice: formData.targetPrice as number | undefined,
        currency: formData.currency as string | undefined,
        deadlineDays: formData.deadlineDays as number | undefined,
        notes: formData.notes as string | undefined,
      });

      if (result.error) {
        toast.error(`Failed to update collection: ${result.error.message}`);
        throw result.error;
      }

      toast.success("Collection updated successfully!");
      router.push(`/dashboard/collections/${rawId}`);
    } catch (error) {
      console.error("Error updating collection:", error);
    }
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    router.push(`/dashboard/collections/${rawId}`);
  };

  if (fetching) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-destructive">Error</h3>
              <p className="text-muted-foreground">
                {error?.message || "Collection not found"}
              </p>
              <Button asChild>
                <Link href="/dashboard/collections">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Collections
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/collections/${rawId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collection
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Collection</h1>
          <p className="text-muted-foreground">{collection.name}</p>
        </div>
      </div>

      {/* Edit Modal */}
      <CreateCollectionModal
        open={editModalOpen}
        onOpenChange={handleModalClose}
        onSubmit={handleUpdate}
        isEditMode={true}
        initialData={{
          name: collection.name || "",
          description: collection.description || "",
          modelCode: collection.modelCode || "",
          season: collection.season || "",
          gender: collection.gender || "",
          fit: collection.fit || "",
          trend: collection.trend || "",
          colors: collection.colors || "",
          sizeRange: collection.sizeRange || "",
          fabricComposition: collection.fabricComposition || "",
          accessories: collection.accessories || "",
          images: collection.images || "",
          moq: collection.moq || 0,
          targetPrice: collection.targetPrice || 0,
          currency: collection.currency || "USD",
          deadlineDays: collection.deadlineDays || 0,
          notes: collection.notes || "",
        }}
      />
    </div>
  );
}
