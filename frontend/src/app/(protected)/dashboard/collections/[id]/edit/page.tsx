"use client";

import {
  CollectionsDetailDocument,
  CollectionsUpdateDocument,
} from "@/__generated__/graphql";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRelayIds } from "@/hooks/useRelayIds";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

const SEASONS = ["SPRING", "SUMMER", "AUTUMN", "WINTER"];
const GENDERS = ["WOMEN", "MEN", "KIDS", "UNISEX"];
const FITS = ["SLIM", "REGULAR", "RELAXED", "OVERSIZED"];

interface FormData {
  name: string;
  description: string;
  modelCode: string;
  season: string;
  gender: string;
  fit: string;
  trend: string;
  colors: string[];
  sizeRange: string;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
}

export default function CollectionEditPage() {
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

  const [{ data, fetching }] = useQuery({
    query: CollectionsDetailDocument,
    variables: { id: isValidId ? collectionId : 0 },
    pause: !isValidId, // Pause query if ID is invalid
  });

  const [, updateCollection] = useMutation(CollectionsUpdateDocument);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    modelCode: "",
    season: "",
    gender: "",
    fit: "",
    trend: "",
    colors: [],
    sizeRange: "",
    isActive: true,
    isFeatured: false,
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  const collection = data?.collection;

  // Load existing data when collection is fetched
  useEffect(() => {
    if (collection) {
      const colors = (() => {
        try {
          return collection.colors ? JSON.parse(collection.colors) : [];
        } catch {
          return [];
        }
      })();

      const images = (() => {
        try {
          return collection.images ? JSON.parse(collection.images) : [];
        } catch {
          return [];
        }
      })();

      setFormData({
        name: collection.name || "",
        description: collection.description || "",
        modelCode: collection.modelCode || "",
        season: collection.season || "",
        gender: collection.gender || "",
        fit: collection.fit || "",
        trend: collection.trend || "",
        colors,
        sizeRange: collection.sizeRange || "",
        isActive: collection.isActive ?? true,
        isFeatured: collection.isFeatured ?? false,
        images,
      });
    }
  }, [collection]);

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Collection name is required";
    }

    if (!formData.modelCode.trim()) {
      newErrors.modelCode = "Model code is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the form errors");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateCollection({
        id: collectionId,
        name: formData.name,
        description: formData.description || null,

        season: formData.season || null,
        gender: formData.gender || null,
        fit: formData.fit || null,
        trend: formData.trend || null,
        colors:
          formData.colors.length > 0 ? JSON.stringify(formData.colors) : null,
        sizeRange: formData.sizeRange || null,

        isFeatured: formData.isFeatured,
        images:
          formData.images.length > 0 ? JSON.stringify(formData.images) : null,
      });

      if (result.error) {
        toast.error(`Failed to update collection: ${result.error.message}`);
        return;
      }

      toast.success("Collection updated successfully!");
      router.push(`/dashboard/collections/${rawId}`);
    } catch (error) {
      console.error("Error updating collection:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const toggleColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

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

  if (fetching) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6" />
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-destructive">Error</h3>
              <p className="text-muted-foreground">Collection not found</p>
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

  // Use standard colors for now
  const availableColors = [
    { id: "1", name: "Red" },
    { id: "2", name: "Blue" },
    { id: "3", name: "Green" },
    { id: "4", name: "Black" },
    { id: "5", name: "White" },
    { id: "6", name: "Navy" },
    { id: "7", name: "Gray" },
    { id: "8", name: "Brown" },
    { id: "9", name: "Beige" },
    { id: "10", name: "Pink" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/collections/${rawId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Collection
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Collection</h1>
            <p className="text-muted-foreground">Update collection details</p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Collection Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter collection name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe your collection..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="modelCode">Model Code *</Label>
                <Input
                  id="modelCode"
                  value={formData.modelCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      modelCode: e.target.value,
                    }))
                  }
                  placeholder="Enter model code"
                />
                {errors.modelCode && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.modelCode}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="trend">Trend</Label>
                <Input
                  id="trend"
                  value={formData.trend}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, trend: e.target.value }))
                  }
                  placeholder="Enter trend information"
                />
              </div>

              <div>
                <Label htmlFor="sizeRange">Size Range</Label>
                <Input
                  id="sizeRange"
                  value={formData.sizeRange}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sizeRange: e.target.value,
                    }))
                  }
                  placeholder="e.g., XS-XL, 34-44"
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Season</Label>
                <Select
                  value={formData.season}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, season: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASONS.map((season) => (
                      <SelectItem key={season} value={season}>
                        {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fit</Label>
                <Select
                  value={formData.fit}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, fit: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fit" />
                  </SelectTrigger>
                  <SelectContent>
                    {FITS.map((fit) => (
                      <SelectItem key={fit} value={fit}>
                        {fit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availableColors.map((color) => (
                  <div key={color.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color.id}`}
                      checked={formData.colors.includes(color.name)}
                      onCheckedChange={() => toggleColor(color.name)}
                    />
                    <Label htmlFor={`color-${color.id}`} className="text-sm">
                      {color.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new image */}
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                />
                <Button
                  type="button"
                  onClick={addImage}
                  disabled={!newImageUrl.trim()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Existing images */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <Image
                          src={url}
                          alt={`Collection image ${index + 1}`}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-image.jpg";
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isFeatured: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="isFeatured">Featured</Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-6 space-y-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Updating..." : "Update Collection"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href={`/dashboard/collections/${rawId}`}>Cancel</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
