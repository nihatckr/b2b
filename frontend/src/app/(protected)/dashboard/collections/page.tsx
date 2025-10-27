"use client";
import {
  CollectionsIncrementViewDocument,
  CollectionsListDocument,
  CollectionsToggleLikeDocument,
} from "@/__generated__/graphql";
import { AddToPOModal } from "@/components/collections/AddToPOModal";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import { PageHeader, SearchInput } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRelayIds } from "@/hooks/useRelayIds";
import {
  Beaker,
  Building2,
  Edit3,
  Eye,
  Folder,
  Heart,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "urql";

export default function CollectionsPage() {
  const router = useRouter();
  const { decodeGlobalId } = useRelayIds();
  const { data: session } = useSession();

  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [featured, setFeatured] = useState<boolean | undefined>(undefined);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [poModalOpen, setPOModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<{
    id: string;
    name: string;
    modelCode?: string;
    company?: { name: string };
    images?: string;
  } | null>(null);
  const take = 12;

  const [{ data, fetching, error }, refetchCollections] = useQuery({
    query: CollectionsListDocument,
    variables: {
      skip,
      take,
      search: search || undefined,
      featured,
    },
  });

  const [, toggleLikeMutation] = useMutation(CollectionsToggleLikeDocument);
  const [, incrementViewMutation] = useMutation(
    CollectionsIncrementViewDocument
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSkip(0); // Reset pagination when searching
  };

  const nextPage = () => setSkip(skip + take);
  const prevPage = () => setSkip(Math.max(0, skip - take));

  const handleLikeCollection = async (
    collectionId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      // Use useRelayIds hook to decode Global ID safely
      const numericId = decodeGlobalId(collectionId);

      if (numericId === null) {
        console.error("Invalid collection ID");
        return;
      }

      await toggleLikeMutation({ id: numericId });
      // Refetch to get updated like count
      refetchCollections({ requestPolicy: "network-only" });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleCollectionClick = async (collectionId: string) => {
    try {
      // Use useRelayIds hook to decode Global ID safely
      const numericId = decodeGlobalId(collectionId);

      if (numericId === null) {
        console.error("Invalid collection ID");
        router.push(`/dashboard/collections/${collectionId}`);
        return;
      }

      // Increment view count
      await incrementViewMutation({ id: numericId });

      // Navigate to collection detail
      router.push(`/dashboard/collections/${collectionId}`);
    } catch (error) {
      console.error("Error incrementing view:", error);
      // Still navigate even if view increment fails
      router.push(`/dashboard/collections/${collectionId}`);
    }
  };

  // Buyer action handlers
  const handleAddToPO = (collectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Find the collection data
    const collection = data?.collections?.find((c) => c.id === collectionId);
    if (collection && collection.name) {
      setSelectedCollection(collection as any);
      setPOModalOpen(true);
    }
  };

  const handlePOSubmit = async () => {
    // This function is now handled directly in the modal
    console.log("PO submitted successfully");
  };

  const handleRequestSample = async (
    collectionId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      const numericId = decodeGlobalId(collectionId);
      // TODO: Implement sample request functionality
      console.log("Request sample:", numericId);
      // Navigate to sample request with original collection
      router.push(
        `/dashboard/samples/request?collectionId=${numericId}&type=original`
      );
    } catch (error) {
      console.error("Error requesting sample:", error);
    }
  };

  const handleRequestRevisedSample = async (
    collectionId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      const numericId = decodeGlobalId(collectionId);
      // TODO: Implement revised sample request functionality
      console.log("Request revised sample:", numericId);
      // Navigate to revised sample request
      router.push(
        `/dashboard/samples/request?collectionId=${numericId}&type=revised`
      );
    } catch (error) {
      console.error("Error requesting revised sample:", error);
    }
  };

  // Check if user is a buyer (based on company type)
  const isBuyer = session?.user?.companyType === "BUYER";

  console.log("Session user:", session?.user);
  console.log("Company type:", session?.user?.companyType);
  console.log("Is buyer:", isBuyer);
  console.log("Collections data:", data);
  return (
    <div className="p-6 space-y-6">
      {/* Create Collection Modal - Only for non-buyers */}
      {!isBuyer && (
        <CreateCollectionModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSuccess={() => {
            refetchCollections({ requestPolicy: "network-only" });
          }}
        />
      )}

      {/* Add to PO Modal - Only for buyers */}
      {isBuyer && (
        <AddToPOModal
          open={poModalOpen}
          onOpenChange={setPOModalOpen}
          collection={selectedCollection}
          onAddToPO={handlePOSubmit}
        />
      )}

      {/* Header */}
      <PageHeader
        title="Collections"
        description="Manage your product collections and catalogs"
        icon={<Folder className="h-6 w-6" />}
        action={
          !isBuyer ? (
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search collections by name or model code..."
          />

          {/* Featured Filter */}
          <div className="flex gap-2">
            <Button
              variant={featured === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setFeatured(undefined)}
            >
              All Collections
            </Button>
            <Button
              variant={featured === true ? "default" : "outline"}
              size="sm"
              onClick={() => setFeatured(true)}
            >
              <Star className="mr-1 h-3 w-3" />
              Featured Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {fetching && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <span className="font-medium">Error loading collections:</span>
              <span>{error.message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collections Grid */}
      {data?.collections && !fetching && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {data.collections.map((collection) => (
              <Card
                key={collection.id}
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col h-full"
                onClick={() => handleCollectionClick(collection.id)}
              >
                {/* Collection Image */}
                <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
                  {(() => {
                    try {
                      const imageUrl = collection.images
                        ? JSON.parse(collection.images)[0]
                        : null;
                      return imageUrl ? (
                        <Image
                          src={
                            imageUrl.startsWith("/")
                              ? `http://localhost:4001${imageUrl}`
                              : imageUrl
                          }
                          alt={collection.name || "Collection image"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <Eye className="h-8 w-8" />
                        </div>
                      );
                    } catch {
                      return (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <Eye className="h-8 w-8" />
                        </div>
                      );
                    }
                  })()}

                  {/* Featured Badge */}
                  {collection.isFeatured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
                      <Star className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  )}

                  {/* Status Badge */}
                  <Badge
                    variant={collection.isActive ? "default" : "secondary"}
                    className="absolute top-2 left-2"
                  >
                    {collection.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Collection Info */}
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {collection.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {collection.modelCode}
                      </p>
                    </div>

                    {/* Model Kodu, Trend, Termin, Fiyat */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {collection.trend && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Trend:
                          </span>
                          <span className="ml-1">{collection.trend}</span>
                        </div>
                      )}
                      {collection.targetLeadTime && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Termin:
                          </span>
                          <span className="ml-1">
                            {collection.targetLeadTime} gün
                          </span>
                        </div>
                      )}
                      {(collection.deadline || collection.deadlineDays) && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Deadline:
                          </span>
                          <span className="ml-1">
                            {collection.deadline
                              ? new Date(
                                  collection.deadline
                                ).toLocaleDateString("tr-TR")
                              : collection.deadlineDays
                              ? `${collection.deadlineDays} gün`
                              : ""}
                          </span>
                        </div>
                      )}
                      {(collection.targetPrice || collection.price) && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Fiyat:
                          </span>
                          <span className="ml-1">
                            {collection.targetPrice || collection.price}{" "}
                            {collection.currency || "USD"}
                          </span>
                        </div>
                      )}
                      {collection.season && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Sezon:
                          </span>
                          <span className="ml-1">{collection.season}</span>
                        </div>
                      )}
                    </div>

                    {/* Kumaş Bilgisi */}
                    {collection.fabricComposition && (
                      <div className="text-xs">
                        <span className="font-medium text-muted-foreground">
                          Kumaş
                          {(() => {
                            try {
                              const fabrics = JSON.parse(
                                collection.fabricComposition
                              );
                              return Array.isArray(fabrics) &&
                                fabrics.length > 1
                                ? "lar:"
                                : ":";
                            } catch {
                              return ":";
                            }
                          })()}
                        </span>
                        <p className="mt-1 text-muted-foreground line-clamp-3">
                          {(() => {
                            try {
                              const fabrics = JSON.parse(
                                collection.fabricComposition
                              );
                              if (
                                Array.isArray(fabrics) &&
                                fabrics.length > 0
                              ) {
                                return fabrics
                                  .map((fabric) => {
                                    // Handle both string and object formats
                                    if (typeof fabric === "string") {
                                      return fabric;
                                    }
                                    const name = fabric.name || "Kumaş";
                                    const composition =
                                      fabric.composition || "";
                                    return composition
                                      ? `${name} (${composition})`
                                      : name;
                                  })
                                  .join(", ");
                              }
                              return "Kumaş bilgisi mevcut";
                            } catch {
                              return collection.fabricComposition;
                            }
                          })()}
                        </p>
                      </div>
                    )}

                    {/* Aksesuar Bilgisi */}
                    {collection.accessories && (
                      <div className="text-xs">
                        <span className="font-medium text-muted-foreground">
                          Aksesuar
                          {(() => {
                            try {
                              const accessories = JSON.parse(
                                collection.accessories
                              );
                              return Array.isArray(accessories) &&
                                accessories.length > 1
                                ? "lar:"
                                : ":";
                            } catch {
                              return ":";
                            }
                          })()}
                        </span>
                        <p className="mt-1 text-muted-foreground line-clamp-2">
                          {(() => {
                            try {
                              const accessories = JSON.parse(
                                collection.accessories
                              );
                              if (
                                Array.isArray(accessories) &&
                                accessories.length > 0
                              ) {
                                return accessories
                                  .map((accessory) => {
                                    // Handle both string and object formats
                                    if (typeof accessory === "string") {
                                      return accessory;
                                    }
                                    return accessory.name || accessory;
                                  })
                                  .join(", ");
                              }
                              return "Aksesuar bilgisi mevcut";
                            } catch {
                              return collection.accessories;
                            }
                          })()}
                        </p>
                      </div>
                    )}

                    {/* Açıklama */}
                    {collection.description && (
                      <div className="text-xs">
                        <span className="font-medium text-muted-foreground">
                          Açıklama:
                        </span>
                        <p className="mt-1 text-muted-foreground line-clamp-2">
                          {collection.description}
                        </p>
                      </div>
                    )}

                    {/* Sertifikalar - Kumaş ve Aksesuar Bazında */}
                    {(() => {
                      // Icon mapping for certifications
                      const getIconForCertification = (
                        cert: Record<string, unknown>
                      ) => {
                        // Priority 1: Check for custom iconValue (uploaded icon)
                        if (
                          cert.iconValue &&
                          typeof cert.iconValue === "string"
                        ) {
                          return (
                            <Image
                              src={cert.iconValue}
                              alt="Certification"
                              width={16}
                              height={16}
                              className="w-4 h-4 object-contain"
                            />
                          );
                        }

                        // Priority 2: Check if cert has icon data (emoji selection)
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
                          } else if (
                            cert.data &&
                            typeof cert.data === "object" &&
                            cert.data !== null &&
                            "icon" in cert.data
                          ) {
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
                            return iconMap[String(cert.data.icon)] || "🛡️";
                          }
                        } catch {
                          // Ignore parsing errors
                        }

                        // Default icon based on issuer/name
                        const name = String(
                          cert.name || cert.issuer || ""
                        ).toLowerCase();
                        if (name.includes("organic") || name.includes("gots"))
                          return "🍃";
                        if (name.includes("recycle") || name.includes("grs"))
                          return "♻️";
                        if (name.includes("fair") || name.includes("trade"))
                          return "🏆";
                        if (name.includes("oeko") || name.includes("tex"))
                          return "✅";
                        return "🛡️"; // Default shield
                      };

                      // Collect fabric certifications
                      const fabricCertifications: Array<{
                        id: string;
                        name?: string | null;
                        iconValue?: string | null;
                        data?: string | null;
                      }> = [];

                      // Add certifications from fabricDetails (library items)
                      if (
                        collection.fabricDetails &&
                        Array.isArray(collection.fabricDetails)
                      ) {
                        collection.fabricDetails.forEach((fabric) => {
                          if (
                            fabric.certifications &&
                            Array.isArray(fabric.certifications)
                          ) {
                            const validCerts = fabric.certifications
                              .filter((cert) => cert.id != null)
                              .map((cert) => ({
                                id: cert.id!,
                                name: cert.name,
                                iconValue: cert.iconValue,
                                data: cert.data,
                              }));
                            fabricCertifications.push(...validCerts);
                          }
                        });
                      }

                      // Fallback: Parse fabricComposition for legacy certifications
                      if (fabricCertifications.length === 0) {
                        try {
                          if (collection.fabricComposition) {
                            const fabrics = JSON.parse(
                              collection.fabricComposition
                            );
                            console.log("Parsed fabrics:", fabrics);
                            if (Array.isArray(fabrics)) {
                              fabrics.forEach(
                                (fabric: Record<string, unknown> | string) => {
                                  console.log("Processing fabric:", fabric);

                                  // Handle object format with certifications
                                  if (
                                    typeof fabric === "object" &&
                                    fabric !== null
                                  ) {
                                    if (
                                      fabric.certifications &&
                                      Array.isArray(fabric.certifications)
                                    ) {
                                      console.log(
                                        "Found certifications:",
                                        fabric.certifications
                                      );
                                      (
                                        fabric.certifications as Array<{
                                          id?: string;
                                          name?: string;
                                          iconValue?: string;
                                          data?: string;
                                        }>
                                      ).forEach((cert) => {
                                        console.log("Processing cert:", cert);
                                        if (cert.id) {
                                          fabricCertifications.push({
                                            id: cert.id,
                                            name: cert.name,
                                            iconValue: cert.iconValue,
                                            data: cert.data,
                                          });
                                        }
                                      });
                                    }

                                    // Test: Add dummy certification if none exists for object
                                    if (
                                      !fabric.certifications ||
                                      (Array.isArray(fabric.certifications) &&
                                        fabric.certifications.length === 0)
                                    ) {
                                      const fabricName = fabric.name;
                                      console.log(
                                        "Adding test certification for fabric:",
                                        fabricName
                                      );
                                      fabricCertifications.push({
                                        id: `test-fabric-${Date.now()}-${Math.random()}`,
                                        name: "GOTS Organic",
                                        iconValue: null,
                                        data: JSON.stringify({ icon: "leaf" }),
                                      });
                                    }
                                  } else if (typeof fabric === "string") {
                                    // Handle string format - always add test certification
                                    console.log(
                                      "Adding test certification for string fabric:",
                                      fabric
                                    );
                                    fabricCertifications.push({
                                      id: `test-fabric-string-${Date.now()}-${Math.random()}`,
                                      name: "Oeko-Tex Standard",
                                      iconValue: null,
                                      data: JSON.stringify({
                                        icon: "check-circle",
                                      }),
                                    });
                                  }
                                }
                              );
                            }
                          }
                        } catch {}
                      }

                      // Collect accessory certifications
                      const accessoryCertifications: Array<{
                        id: string;
                        name?: string | null;
                        iconValue?: string | null;
                        data?: string | null;
                      }> = [];

                      // Add certifications from accessoryDetails (library items)
                      if (
                        collection.accessoryDetails &&
                        Array.isArray(collection.accessoryDetails)
                      ) {
                        collection.accessoryDetails.forEach((accessory) => {
                          if (
                            accessory.certifications &&
                            Array.isArray(accessory.certifications)
                          ) {
                            const validCerts = accessory.certifications
                              .filter((cert) => cert.id != null)
                              .map((cert) => ({
                                id: cert.id!,
                                name: cert.name,
                                iconValue: cert.iconValue,
                                data: cert.data,
                              }));
                            accessoryCertifications.push(...validCerts);
                          }
                        });
                      }

                      // Fallback: Parse accessories for legacy certifications
                      if (accessoryCertifications.length === 0) {
                        try {
                          if (collection.accessories) {
                            const accessories = JSON.parse(
                              collection.accessories
                            );
                            console.log("Parsed accessories:", accessories);
                            if (Array.isArray(accessories)) {
                              accessories.forEach(
                                (
                                  accessory: Record<string, unknown> | string
                                ) => {
                                  console.log(
                                    "Processing accessory:",
                                    accessory
                                  );

                                  // Handle object format with certifications
                                  if (
                                    typeof accessory === "object" &&
                                    accessory !== null
                                  ) {
                                    if (
                                      accessory.certifications &&
                                      Array.isArray(accessory.certifications)
                                    ) {
                                      console.log(
                                        "Found accessory certifications:",
                                        accessory.certifications
                                      );
                                      (
                                        accessory.certifications as Array<{
                                          id?: string;
                                          name?: string;
                                          iconValue?: string;
                                          data?: string;
                                        }>
                                      ).forEach((cert) => {
                                        if (cert.id) {
                                          accessoryCertifications.push({
                                            id: cert.id,
                                            name: cert.name,
                                            iconValue: cert.iconValue,
                                            data: cert.data,
                                          });
                                        }
                                      });
                                    }

                                    // Test: Add dummy certification if none exists for object
                                    if (
                                      !accessory.certifications ||
                                      (Array.isArray(
                                        accessory.certifications
                                      ) &&
                                        accessory.certifications.length === 0)
                                    ) {
                                      const accessoryName = accessory.name;
                                      console.log(
                                        "Adding test certification for accessory:",
                                        accessoryName
                                      );
                                      accessoryCertifications.push({
                                        id: `test-accessory-${Date.now()}-${Math.random()}`,
                                        name: "YKK Eco-Made",
                                        iconValue: null,
                                        data: JSON.stringify({
                                          icon: "recycle",
                                        }),
                                      });
                                    }
                                  } else if (typeof accessory === "string") {
                                    // Handle string format - always add test certification
                                    console.log(
                                      "Adding test certification for string accessory:",
                                      accessory
                                    );
                                    accessoryCertifications.push({
                                      id: `test-accessory-string-${Date.now()}-${Math.random()}`,
                                      name: "Recycled Material",
                                      iconValue: null,
                                      data: JSON.stringify({ icon: "recycle" }),
                                    });
                                  }
                                }
                              );
                            }
                          }
                        } catch {}
                      }

                      const hasFabricCerts = fabricCertifications.length > 0;
                      const hasAccessoryCerts =
                        accessoryCertifications.length > 0;

                      return hasFabricCerts || hasAccessoryCerts ? (
                        <div className="text-xs pt-2">
                          <div className="flex items-center gap-2">
                            {/* Kumaş Sertifikaları */}
                            {hasFabricCerts && (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground">
                                  🧵
                                </span>
                                <div className="flex gap-1">
                                  {fabricCertifications
                                    .slice(0, 3)
                                    .map((cert, index) => (
                                      <div
                                        key={cert.id || index}
                                        className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center hover:scale-110 transition-transform cursor-help overflow-hidden"
                                        title={`Kumaş: ${
                                          cert.name || "Certification"
                                        }`}
                                      >
                                        {cert.iconValue &&
                                        typeof cert.iconValue === "string" ? (
                                          <Image
                                            src={
                                              cert.iconValue.startsWith("/")
                                                ? `http://localhost:4001${cert.iconValue}`
                                                : cert.iconValue
                                            }
                                            alt={cert.name || "Certification"}
                                            width={16}
                                            height={16}
                                            className="w-full h-full object-cover rounded-full"
                                          />
                                        ) : (
                                          <span className="text-[10px]">
                                            {getIconForCertification(cert)}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  {fabricCertifications.length > 3 && (
                                    <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[8px] text-gray-600">
                                      +{fabricCertifications.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Aksesuar Sertifikaları */}
                            {hasAccessoryCerts && (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground">
                                  🔗
                                </span>
                                <div className="flex gap-1">
                                  {accessoryCertifications
                                    .slice(0, 3)
                                    .map((cert, index) => (
                                      <div
                                        key={cert.id || index}
                                        className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center hover:scale-110 transition-transform cursor-help overflow-hidden"
                                        title={`Aksesuar: ${
                                          cert.name || "Certification"
                                        }`}
                                      >
                                        {cert.iconValue &&
                                        typeof cert.iconValue === "string" ? (
                                          <Image
                                            src={
                                              cert.iconValue.startsWith("/")
                                                ? `http://localhost:4001${cert.iconValue}`
                                                : cert.iconValue
                                            }
                                            alt={cert.name || "Certification"}
                                            width={16}
                                            height={16}
                                            className="w-full h-full object-cover rounded-full"
                                          />
                                        ) : (
                                          <span className="text-[10px]">
                                            {getIconForCertification(cert)}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  {accessoryCertifications.length > 3 && (
                                    <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[8px] text-gray-600">
                                      +{accessoryCertifications.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null;
                    })()}

                    <div className="flex items-center justify-between text-xs pt-2 border-t">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{collection.viewCount || 0}</span>
                        </div>

                        {/* Like Button */}
                        <button
                          onClick={(e) =>
                            handleLikeCollection(collection.id, e)
                          }
                          className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Heart className="h-3 w-3" />
                          <span>{collection.likesCount || 0}</span>
                        </button>
                      </div>

                      {collection.company && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">
                            {collection.company.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Buyer Action Buttons */}
                    {isBuyer && (
                      <div className="pt-3 mt-auto space-y-2 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1 h-8 text-xs sm:text-[10px] lg:text-xs"
                            onClick={(e) => handleAddToPO(collection.id, e)}
                          >
                            <ShoppingCart className="mr-1 h-3 w-3" />
                            <span className="hidden sm:inline">Add to PO</span>
                            <span className="sm:hidden">PO</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs sm:text-[10px] lg:text-xs"
                            onClick={(e) =>
                              handleRequestSample(collection.id, e)
                            }
                          >
                            <Beaker className="mr-1 h-3 w-3" />
                            <span className="hidden sm:inline">Sample</span>
                            <span className="sm:hidden">Sample</span>
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full h-8 text-xs sm:text-[10px] lg:text-xs"
                          onClick={(e) =>
                            handleRequestRevisedSample(collection.id, e)
                          }
                        >
                          <Edit3 className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">
                            Request Revised Sample
                          </span>
                          <span className="sm:hidden">Revised</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            <Button variant="outline" disabled={skip === 0} onClick={prevPage}>
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Showing {skip + 1}-
              {Math.min(skip + take, skip + (data.collections?.length || 0))}{" "}
              results
            </span>
            <Button
              variant="outline"
              disabled={!data.collections || data.collections.length < take}
              onClick={nextPage}
            >
              Next
            </Button>
          </div>
        </>
      )}

      {/* Empty State */}
      {data?.collections && data.collections.length === 0 && !fetching && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">No collections found</h3>
                <p className="text-muted-foreground mb-4">
                  {search
                    ? `No collections match "${search}". Try adjusting your search.`
                    : "Get started by creating your first collection."}
                </p>
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Collection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
