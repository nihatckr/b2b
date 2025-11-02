"use client";
import {
  CollectionsDeleteDocument,
  CollectionsDetailDocument,
  CollectionsUpdateDocument,
} from "@/__generated__/graphql";
import { PageHeader } from "@/components/common";
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
  Folder,
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
// Certification icon mapping
interface Certification {
  iconValue?: string | null;
  data?: string | null;
  name?: string | null;
  [key: string]: unknown; // Index signature for flexibility
}

function getIconForCertification(
  cert: Certification
): string | React.ReactNode {
  // Priority 1: Custom iconValue
  if (cert.iconValue && typeof cert.iconValue === "string") {
    return (
      <NextImage
        src={cert.iconValue}
        alt="Certification"
        width={16}
        height={16}
        className="w-4 h-4 object-contain"
      />
    );
  }

  // Priority 2: Emoji from data.icon
  try {
    if (cert.data && typeof cert.data === "string") {
      const certData = JSON.parse(cert.data);
      if (certData.icon) {
        const iconMap: Record<string, string> = {
          "shield-check": "🛡️",
          leaf: "🍃",
          recycle: "♻️",
          award: "🏆",
          star: "⭐",
          "check-circle": "✅",
          eco: "🌱",
          quality: "💎",
          global: "🌍",
          certificate: "📜",
        };
        return iconMap[certData.icon] || "🛡️";
      }
    }
  } catch {}

  // Priority 3: Default based on name
  const name = String(cert.name || "").toLowerCase();
  if (name.includes("organic") || name.includes("gots")) return "🍃";
  if (name.includes("recycle") || name.includes("grs")) return "♻️";
  if (name.includes("fair") || name.includes("trade")) return "🏆";
  if (name.includes("oeko") || name.includes("tex")) return "✅";
  return "🛡️";
}

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
      <PageHeader
        title={collection.name || "Collection"}
        description={`Model Code: ${collection.modelCode || "N/A"}`}
        icon={<Folder className="h-6 w-6" />}
        action={
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/collections">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>

            {/* Badges */}
            <div className="flex gap-2">
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

            {/* Action Buttons */}
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
                      Are you sure you want to delete &quot;{collection.name}
                      &quot;? This action cannot be undone.
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
        }
      />

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

          {/* Product Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {collection.season && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Season
                    </Label>
                    <p className="font-semibold text-blue-900 mt-1">
                      {collection.season}
                    </p>
                  </div>
                )}
                {collection.gender && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Gender
                    </Label>
                    <p className="font-semibold text-purple-900 mt-1">
                      {collection.gender}
                    </p>
                  </div>
                )}
                {collection.fit && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Fit
                    </Label>
                    <p className="font-semibold text-green-900 mt-1">
                      {collection.fit}
                    </p>
                  </div>
                )}
                {collection.trend && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Trend
                    </Label>
                    <p className="font-semibold text-orange-900 mt-1">
                      {collection.trend}
                    </p>
                  </div>
                )}
              </div>

              {/* Price Information */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {collection.targetPrice && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Target Price
                    </Label>
                    <p className="font-medium">
                      {collection.currency || "$"} {collection.targetPrice}
                    </p>
                  </div>
                )}
                {collection.moq && (
                  <div>
                    <Label className="text-sm text-muted-foreground">MOQ</Label>
                    <p className="font-medium">{collection.moq}</p>
                  </div>
                )}
                {collection.targetLeadTime && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Lead Time
                    </Label>
                    <p className="font-medium">
                      {collection.targetLeadTime} days
                    </p>
                  </div>
                )}
              </div>

              {/* Deadline Information */}
              {(collection.deadline || collection.deadlineDays) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collection.deadline && (
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Deadline Date
                      </Label>
                      <p className="font-medium">
                        {new Date(collection.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {collection.deadlineDays && (
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Production Days
                      </Label>
                      <p className="font-medium">
                        {collection.deadlineDays} days
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Colors Section */}
              {collection.colors && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    🎨 Available Colors
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      try {
                        const colors = JSON.parse(collection.colors);
                        return colors.map((color: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border"
                          >
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.toLowerCase() }}
                              title={color}
                            />
                            <span className="text-sm font-medium">{color}</span>
                          </div>
                        ));
                      } catch {
                        return (
                          <span className="text-sm">{collection.colors}</span>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Size Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {collection.sizeRange && (
                  <div className="p-3 bg-slate-50 rounded-lg border">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Size Range
                    </Label>
                    <p className="font-semibold mt-1">{collection.sizeRange}</p>
                  </div>
                )}
                {collection.sizeGroups && (
                  <div className="p-3 bg-slate-50 rounded-lg border">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Size Groups
                    </Label>
                    <div className="mt-1">
                      {(() => {
                        try {
                          const sizeGroups = JSON.parse(collection.sizeGroups);
                          return Array.isArray(sizeGroups) ? (
                            <div className="flex flex-wrap gap-1">
                              {sizeGroups.map(
                                (
                                  group: Record<string, unknown> | string,
                                  index: number
                                ) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {typeof group === "object"
                                      ? String(group.name ?? group.id ?? "")
                                      : String(group)}
                                  </Badge>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-sm">{collection.sizeGroups}</p>
                          );
                        } catch {
                          return (
                            <p className="text-sm">{collection.sizeGroups}</p>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Materials Section */}
              {((collection.fabricDetails &&
                collection.fabricDetails.length > 0) ||
                collection.fabricComposition) && (
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                    🧵 Materials & Fabrics
                  </Label>
                  <div className="space-y-3">
                    {collection.fabricDetails &&
                    collection.fabricDetails.length > 0
                      ? // Use fabricDetails from GraphQL (preferred)
                        collection.fabricDetails.map((fabricItem) => {
                          // Parse the original fabric data to get percentage, color, etc.
                          let fabricData = null;
                          try {
                            if (collection.fabricComposition) {
                              const fabricsArray = JSON.parse(
                                collection.fabricComposition
                              );
                              // Find matching fabric by libraryItemId
                              fabricData = fabricsArray.find(
                                (f: Record<string, unknown>) =>
                                  f.libraryItemId &&
                                  parseInt(String(f.libraryItemId)) ===
                                    parseInt(String(fabricItem.id))
                              );
                            }
                          } catch (error) {
                            console.error(
                              "Error parsing fabric composition:",
                              error
                            );
                          }

                          const getIconForCertification = (
                            cert: Record<string, unknown>
                          ) => {
                            // Priority 1: Custom iconValue
                            if (
                              cert.iconValue &&
                              typeof cert.iconValue === "string"
                            ) {
                              return (
                                <NextImage
                                  src={cert.iconValue}
                                  alt="Certification"
                                  width={16}
                                  height={16}
                                  className="w-4 h-4 object-contain"
                                />
                              );
                            }

                            // Priority 2: Emoji from data.icon
                            try {
                              if (cert.data && typeof cert.data === "string") {
                                const certData = JSON.parse(cert.data);
                                if (certData.icon) {
                                  const iconMap: Record<string, string> = {
                                    "shield-check": "🛡️",
                                    leaf: "🍃",
                                    recycle: "♻️",
                                    award: "🏆",
                                    star: "⭐",
                                    "check-circle": "✅",
                                    eco: "🌱",
                                    quality: "💎",
                                    global: "🌍",
                                    certificate: "📜",
                                  };
                                  return iconMap[certData.icon] || "�️";
                                }
                              }
                            } catch {}

                            // Priority 3: Default based on name
                            const name = String(cert.name || "").toLowerCase();
                            if (
                              name.includes("organic") ||
                              name.includes("gots")
                            )
                              return "🍃";
                            if (
                              name.includes("recycle") ||
                              name.includes("grs")
                            )
                              return "♻️";
                            if (name.includes("fair") || name.includes("trade"))
                              return "🏆";
                            if (name.includes("oeko") || name.includes("tex"))
                              return "✅";
                            return "🛡️";
                          };

                          return (
                            <div
                              key={fabricItem.id}
                              className="border border-green-200 bg-green-50/30 rounded-xl p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-lg text-green-900">
                                      {fabricItem.name}
                                    </h4>
                                    {fabricData?.percentage && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-green-100 text-green-800"
                                      >
                                        {fabricData.percentage}%
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Fabric Properties */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                    {fabricData?.color && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                          Color:
                                        </span>
                                        <span className="text-sm font-medium">
                                          {fabricData.color}
                                        </span>
                                      </div>
                                    )}
                                    {fabricItem.data && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                          Type:
                                        </span>
                                        <span className="text-sm font-medium">
                                          {(() => {
                                            try {
                                              const data = JSON.parse(
                                                fabricItem.data
                                              );
                                              return (
                                                data.fabricType ||
                                                data.type ||
                                                "Fabric"
                                              );
                                            } catch {
                                              return "Fabric";
                                            }
                                          })()}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {fabricData?.description && (
                                    <p className="text-sm text-muted-foreground mb-3 bg-white/50 p-2 rounded">
                                      {fabricData.description}
                                    </p>
                                  )}

                                  {/* Certifications */}
                                  {fabricItem.certifications &&
                                    fabricItem.certifications.length > 0 && (
                                      <div className="space-y-2">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                          Certifications
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                          {fabricItem.certifications.map(
                                            (
                                              cert: Certification,
                                              certIndex: number
                                            ) => (
                                              <div
                                                key={certIndex}
                                                className="flex items-center gap-2 bg-white border border-green-200 px-3 py-1.5 rounded-lg shadow-sm"
                                                title={cert.name || undefined}
                                              >
                                                <span className="w-4 h-4 flex items-center justify-center">
                                                  {getIconForCertification(
                                                    cert
                                                  )}
                                                </span>
                                                <span className="text-sm font-medium text-green-800">
                                                  {cert.name}
                                                </span>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>

                                {/* Fabric Image */}
                                {fabricItem.imageUrl && (
                                  <div className="w-20 h-20 rounded-xl overflow-hidden ml-4 border-2 border-white shadow-md">
                                    <NextImage
                                      src={fabricItem.imageUrl}
                                      alt={fabricItem.name || "Fabric"}
                                      width={80}
                                      height={80}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      : // Fallback to parsing fabricComposition JSON
                        (() => {
                          try {
                            console.log(
                              "🧪 Raw fabricComposition:",
                              collection.fabricComposition
                            );
                            const fabrics = JSON.parse(
                              collection.fabricComposition || "[]"
                            );
                            console.log("🧪 Parsed fabrics:", fabrics);
                            return Array.isArray(fabrics) ? (
                              fabrics.map(
                                (
                                  fabric: Record<string, unknown>,
                                  index: number
                                ) => (
                                  <div
                                    key={index}
                                    className="p-3 border rounded-lg"
                                  >
                                    <div className="font-medium">
                                      {String(fabric.name || "")}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {String(fabric.composition || "")}
                                    </div>
                                  </div>
                                )
                              )
                            ) : (
                              <p className="text-sm">
                                {collection.fabricComposition}
                              </p>
                            );
                          } catch {
                            return (
                              <p className="text-sm">
                                {collection.fabricComposition}
                              </p>
                            );
                          }
                        })()}
                  </div>
                </div>
              )}

              {/* Accessories Section */}
              {((collection.accessoryDetails &&
                collection.accessoryDetails.length > 0) ||
                collection.accessories) && (
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                    🔗 Accessories & Trims
                  </Label>
                  <div className="space-y-3">
                    {collection.accessoryDetails &&
                    collection.accessoryDetails.length > 0
                      ? // Use accessoryDetails from GraphQL (preferred)
                        collection.accessoryDetails.map((accessoryItem) => {
                          // Parse the original accessory data to get quantity, color, etc.
                          let accessoryData = null;
                          try {
                            if (collection.accessories) {
                              const accessoriesArray = JSON.parse(
                                collection.accessories
                              );
                              // Find matching accessory by libraryItemId
                              accessoryData = accessoriesArray.find(
                                (a: Record<string, unknown>) =>
                                  a.libraryItemId &&
                                  parseInt(String(a.libraryItemId)) ===
                                    parseInt(String(accessoryItem.id))
                              );
                            }
                          } catch (error) {
                            console.error("Error parsing accessories:", error);
                          }

                          const getIconForCertification = (
                            cert: Record<string, unknown>
                          ) => {
                            // Priority 1: Custom iconValue
                            if (
                              cert.iconValue &&
                              typeof cert.iconValue === "string"
                            ) {
                              return (
                                <NextImage
                                  src={cert.iconValue}
                                  alt="Certification"
                                  width={16}
                                  height={16}
                                  className="w-4 h-4 object-contain"
                                />
                              );
                            }

                            // Priority 2: Emoji from data.icon
                            try {
                              if (cert.data && typeof cert.data === "string") {
                                const certData = JSON.parse(cert.data);
                                if (certData.icon) {
                                  const iconMap: Record<string, string> = {
                                    "shield-check": "🛡️",
                                    leaf: "🍃",
                                    recycle: "♻️",
                                    award: "🏆",
                                    star: "⭐",
                                    "check-circle": "✅",
                                    eco: "🌱",
                                    quality: "💎",
                                    global: "🌍",
                                    certificate: "📜",
                                  };
                                  return iconMap[certData.icon] || "🛡️";
                                }
                              }
                            } catch {}

                            // Priority 3: Default based on name
                            const name = String(cert.name || "").toLowerCase();
                            if (
                              name.includes("organic") ||
                              name.includes("gots")
                            )
                              return "🍃";
                            if (
                              name.includes("recycle") ||
                              name.includes("grs")
                            )
                              return "♻️";
                            if (name.includes("fair") || name.includes("trade"))
                              return "🏆";
                            if (name.includes("oeko") || name.includes("tex"))
                              return "✅";
                            return "🛡️";
                          };

                          return (
                            <div
                              key={accessoryItem.id}
                              className="border border-blue-200 bg-blue-50/30 rounded-xl p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-lg text-blue-900">
                                      {accessoryItem.name}
                                    </h4>
                                    {accessoryData?.quantity && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-800"
                                      >
                                        {accessoryData.quantity} pcs
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Accessory Properties */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                    {accessoryData?.color && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                          Color:
                                        </span>
                                        <span className="text-sm font-medium">
                                          {accessoryData.color}
                                        </span>
                                      </div>
                                    )}
                                    {accessoryItem.data && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                          Type:
                                        </span>
                                        <span className="text-sm font-medium">
                                          {(() => {
                                            try {
                                              const data = JSON.parse(
                                                accessoryItem.data
                                              );
                                              return (
                                                data.accessoryType ||
                                                data.type ||
                                                "Accessory"
                                              );
                                            } catch {
                                              return "Accessory";
                                            }
                                          })()}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {accessoryData?.description && (
                                    <p className="text-sm text-muted-foreground mb-3 bg-white/50 p-2 rounded">
                                      {accessoryData.description}
                                    </p>
                                  )}

                                  {/* Certifications */}
                                  {accessoryItem.certifications &&
                                    accessoryItem.certifications.length > 0 && (
                                      <div className="space-y-2">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                          Certifications
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                          {accessoryItem.certifications.map(
                                            (
                                              cert: Certification,
                                              certIndex: number
                                            ) => (
                                              <div
                                                key={certIndex}
                                                className="flex items-center gap-2 bg-white border border-blue-200 px-3 py-1.5 rounded-lg shadow-sm"
                                                title={cert.name ?? undefined}
                                              >
                                                <span className="w-4 h-4 flex items-center justify-center">
                                                  {getIconForCertification(
                                                    cert
                                                  )}
                                                </span>
                                                <span className="text-sm font-medium text-blue-800">
                                                  {cert.name}
                                                </span>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>

                                {/* Accessory Image */}
                                {accessoryItem.imageUrl && (
                                  <div className="w-20 h-20 rounded-xl overflow-hidden ml-4 border-2 border-white shadow-md">
                                    <NextImage
                                      src={accessoryItem.imageUrl}
                                      alt={accessoryItem.name || "Accessory"}
                                      width={80}
                                      height={80}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      : // Fallback to parsing accessories JSON
                        (() => {
                          try {
                            const accessories = JSON.parse(
                              collection.accessories || "[]"
                            );
                            return Array.isArray(accessories)
                              ? accessories.map(
                                  (
                                    accessory: Record<string, unknown>,
                                    index: number
                                  ) => {
                                    const accessoryName = String(
                                      accessory.name || ""
                                    );
                                    const accessoryDescription = String(
                                      accessory.description || ""
                                    );
                                    const accessoryCertifications =
                                      Array.isArray(accessory.certifications)
                                        ? accessory.certifications
                                        : [];

                                    return (
                                      <div
                                        key={index}
                                        className="p-3 border rounded-lg"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="font-medium">
                                            {accessoryName}
                                          </h4>
                                          {accessoryCertifications.length >
                                            0 && (
                                            <div className="flex gap-1">
                                              {accessoryCertifications.map(
                                                (
                                                  cert: Certification,
                                                  certIndex: number
                                                ) => (
                                                  <div
                                                    key={certIndex}
                                                    className="flex items-center justify-center w-5 h-5 rounded bg-blue-100 text-xs"
                                                    title={String(
                                                      cert.name || ""
                                                    )}
                                                  >
                                                    {getIconForCertification(
                                                      cert
                                                    )}
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        {accessoryDescription && (
                                          <p className="text-sm text-muted-foreground">
                                            {accessoryDescription}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  }
                                )
                              : [];
                          } catch {
                            return (
                              <p className="text-sm">
                                {collection.accessories}
                              </p>
                            );
                          }
                        })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Collection Certifications */}
          {collection.certifications &&
            collection.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🏆 Collection Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collection.certifications.map((cert, index) => (
                      <div
                        key={index}
                        className="border border-yellow-200 bg-yellow-50/30 rounded-xl p-4"
                      >
                        <div className="flex items-start gap-3">
                          {cert.imageUrl && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                              <NextImage
                                src={cert.imageUrl}
                                alt={cert.name || "Certification"}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-yellow-900">
                              {cert.name}
                            </h4>
                            {cert.category && (
                              <Badge
                                variant="secondary"
                                className="mt-1 bg-yellow-100 text-yellow-800"
                              >
                                {cert.category}
                              </Badge>
                            )}
                            {cert.description && (
                              <p className="text-sm text-muted-foreground mt-2 bg-white/50 p-2 rounded">
                                {cert.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Technical Documentation */}
          {(collection.techPack || collection.measurementChart) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📋 Technical Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {collection.techPack && (
                  <div className="p-3 bg-slate-50 rounded-lg border">
                    <Label className="text-sm font-medium">Tech Pack</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      <Link
                        href={collection.techPack}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        View Tech Pack Document
                      </Link>
                    </p>
                  </div>
                )}
                {collection.measurementChart && (
                  <div className="p-3 bg-slate-50 rounded-lg border">
                    <Label className="text-sm font-medium">
                      Measurement Chart
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      <Link
                        href={collection.measurementChart}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        View Measurement Chart
                      </Link>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {collection.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {collection.notes}
                </p>
              </CardContent>
            </Card>
          )}
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
