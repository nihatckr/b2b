"use client";
import {
  CollectionsDeleteDocument,
  CollectionsDetailDocument,
  CollectionsUpdateDocument,
} from "@/__generated__/graphql";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRelayIds } from "@/hooks/useRelayIds";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit,
  Eye,
  Heart,
  Package,
  Share2,
  ShoppingCart,
  Star,
  Trash2,
  User,
} from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { decodeGlobalId } = useRelayIds();

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

  const [, deleteCollection] = useMutation(CollectionsDeleteDocument);
  const [, updateCollection] = useMutation(CollectionsUpdateDocument);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCollection({ id: collectionId });

      if (result.error) {
        toast.error(`Failed to delete collection: ${result.error.message}`);
        return;
      }

      toast.success("Collection deleted successfully");
      router.push("/dashboard/collections");
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleFeatured = async () => {
    if (!collection) return;

    try {
      const result = await updateCollection({
        id: collectionId,
        isFeatured: !collection.isFeatured,
      });

      if (result.error) {
        toast.error(`Failed to update collection: ${result.error.message}`);
        return;
      }

      toast.success(
        collection.isFeatured ? "Removed from featured" : "Added to featured"
      );
    } catch (error) {
      console.error("Error updating collection:", error);
      toast.error("An unexpected error occurred");
    }
  };

  if (fetching) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="aspect-video bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
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

  // Parse images safely
  const images = (() => {
    try {
      return collection.images ? JSON.parse(collection.images) : [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/collections">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Collections
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{collection.name}</h1>
              {collection.isFeatured && (
                <Badge className="bg-yellow-500 hover:bg-yellow-600">
                  <Star className="mr-1 h-3 w-3" />
                  Featured
                </Badge>
              )}
              <Badge variant={collection.isActive ? "default" : "secondary"}>
                {collection.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Model Code: {collection.modelCode}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={toggleFeatured}>
            <Star className="mr-2 h-4 w-4" />
            {collection.isFeatured ? "Unfeature" : "Feature"}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/collections/${collection.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{collection.name}&quot;?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Images</CardTitle>
            </CardHeader>
            <CardContent>
              {images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((url: string, index: number) => (
                    <div
                      key={index}
                      className="aspect-video bg-muted rounded-lg overflow-hidden"
                    >
                      <NextImage
                        height={100}
                        width={100}
                        src={url}
                        alt={`${collection.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2" />
                    <p>No images uploaded</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          {collection.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {collection.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {collection.season && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Season
                    </Label>
                    <p className="font-medium">{collection.season}</p>
                  </div>
                )}
                {collection.gender && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Gender
                    </Label>
                    <p className="font-medium">{collection.gender}</p>
                  </div>
                )}
                {collection.fit && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Fit</Label>
                    <p className="font-medium">{collection.fit}</p>
                  </div>
                )}
                {collection.trend && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Trend
                    </Label>
                    <p className="font-medium">{collection.trend}</p>
                  </div>
                )}
              </div>

              {collection.colors && (
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Colors
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {JSON.parse(collection.colors).map(
                      (color: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {color}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}

              {collection.sizeRange && (
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Size Range
                  </Label>
                  <p className="font-medium">{collection.sizeRange}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Views</span>
                </div>
                <span className="font-medium">{collection.viewCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Likes</span>
                </div>
                <span className="font-medium">
                  {collection.likesCount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Shares</span>
                </div>
                <span className="font-medium">
                  {collection.shareCount || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          {collection.company && (
            <Card>
              <CardHeader>
                <CardTitle>Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{collection.company.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Type: {collection.company.type}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Author Info */}
          {collection.author && (
            <Card>
              <CardHeader>
                <CardTitle>Created By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{collection.author.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(collection.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Items */}
          {(collection.samples?.length || collection.orders?.length) && (
            <Card>
              <CardHeader>
                <CardTitle>Related Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {collection.samples && collection.samples.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Samples ({collection.samples.length})
                    </Label>
                    <div className="mt-2 space-y-2">
                      {collection.samples.slice(0, 3).map((sample) => (
                        <div
                          key={sample.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span className="flex-1 truncate">
                            {sample.name || sample.sampleNumber}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {sample.status}
                          </Badge>
                        </div>
                      ))}
                      {collection.samples.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{collection.samples.length - 3} more samples
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {collection.orders && collection.orders.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Orders ({collection.orders.length})
                    </Label>
                    <div className="mt-2 space-y-2">
                      {collection.orders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                          <span className="flex-1 truncate">
                            {order.orderNumber}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      ))}
                      {collection.orders.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{collection.orders.length - 3} more orders
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Label component for consistency
function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
        className || ""
      }`}
    >
      {children}
    </label>
  );
}
