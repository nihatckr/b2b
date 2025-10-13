"use client";
import { MultiStepCollectionForm } from "@/components/Collection/MultiStepCollectionForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  MY_COLORS_QUERY,
  MY_FABRICS_QUERY,
  MY_FITS_QUERY,
  MY_SEASONS_QUERY,
  MY_SIZE_GROUPS_QUERY,
} from "@/lib/graphql/library-operations";
import {
  CREATE_COLLECTION_MUTATION,
  DELETE_COLLECTION_MUTATION,
  UPDATE_COLLECTION_MUTATION,
} from "@/lib/graphql/mutations";
import {
  ALL_CATEGORIES_QUERY,
  ALL_COLLECTIONS_QUERY,
} from "@/lib/graphql/queries";
import { Loader2, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import NextImage from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";
import { Category, Color, FitItem } from "../../../../__generated__/graphql";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

interface Collection {
  id: number;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  stock: number;
  images?: string[];
  isActive: boolean;
  isFeatured: boolean;
  slug?: string;
  productionSchedule?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  };
  company?: {
    id: number;
    name: string;
  };
  author?: {
    id: number;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  samplesCount?: number;
  ordersCount?: number;
  // ADIM 1: Model Bilgileri
  modelCode?: string;
  season?: string;
  gender?: string;
  fit?: string;
  trend?: string;
  // ADIM 2: Renkler & Bedenler
  colors?: string;
  sizeGroups?: string;
  measurementChart?: string;
  // ADIM 3: Kumaş & Detaylar
  fabricComposition?: string;
  accessories?: string;
  techPack?: string;
  // ADIM 4: Ticari Bilgiler
  moq?: number;
  targetPrice?: number;
  targetLeadTime?: number;
  notes?: string;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  productionSchedule: string;
  categoryId: string;
  trend: string;

  // ADIM 1: Model Bilgileri
  modelCode: string;
  season: string;
  gender: string;
  fit: string;
  // ADIM 2: Renkler & Bedenler
  colors: number[];
  sizeGroups: number[];
  measurementChart: string;
  // ADIM 3: Kumaş & Detaylar
  fabricComposition: string;
  accessories: string;
  techPack: string;
  // ADIM 4: Ticari Bilgiler
  moq: string;
  targetPrice: string;
  targetLeadTime: string;
  notes: string;
}

const initialFormData: FormData = {
  name: "",
  description: "",
  price: "0",
  stock: "0",
  images: [],
  isActive: true,
  isFeatured: false,
  productionSchedule: JSON.stringify({
    PLANNING: 3,
    FABRIC: 3,
    CUTTING: 2,
    SEWING: 10,
    QUALITY: 2,
    PACKAGING: 2,
    SHIPPING: 1,
  }),
  categoryId: "",
  // ADIM 1
  modelCode: "",
  season: "",
  gender: "",
  fit: "",
  trend: "",
  // ADIM 2
  colors: [],
  sizeGroups: [],
  measurementChart: "",
  // ADIM 3
  fabricComposition: "",
  accessories: "",
  techPack: "",
  // ADIM 4
  moq: "",
  targetPrice: "",
  targetLeadTime: "",
  notes: "",
};

export default function CollectionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [selectedGender, setSelectedGender] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedLeadTime, setSelectedLeadTime] = useState<string>("ALL");
  const [selectedSeason, setSelectedSeason] = useState<string>("ALL");
  const [selectedColor, setSelectedColor] = useState<string>("ALL");
  const [selectedFit, setSelectedFit] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");

  // Queries
  const [collectionsResult, reexecuteCollections] = useQuery({
    query: ALL_COLLECTIONS_QUERY,
    variables: { search: searchTerm || undefined },
  });

  const [categoriesResult] = useQuery({
    query: ALL_CATEGORIES_QUERY,
  });

  const [colorsResult] = useQuery({
    query: MY_COLORS_QUERY,
  });

  const [fabricsResult] = useQuery({
    query: MY_FABRICS_QUERY,
  });

  const [sizeGroupsResult] = useQuery({
    query: MY_SIZE_GROUPS_QUERY,
  });

  const [seasonsResult] = useQuery({
    query: MY_SEASONS_QUERY,
  });

  const [fitsResult] = useQuery({
    query: MY_FITS_QUERY,
  });

  // Mutations
  const [, createCollection] = useMutation(CREATE_COLLECTION_MUTATION);
  const [, updateCollection] = useMutation(UPDATE_COLLECTION_MUTATION);
  const [, deleteCollection] = useMutation(DELETE_COLLECTION_MUTATION);

  const collections = collectionsResult.data?.collections || [];
  const categories = categoriesResult.data?.allCategories || [];
  const colors = colorsResult.data?.myColors || [];
  const fabrics = fabricsResult.data?.myFabrics || [];
  const sizeGroups = sizeGroupsResult.data?.mySizeGroups || [];
  const seasons = seasonsResult.data?.mySeasons || [];
  const fits = fitsResult.data?.myFits || [];

  const handleUploadFile = async (file: File): Promise<string> => {
    try {
      console.log(
        `📤 Uploading: ${file.name} (${file.type}, ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)} MB)`
      );

      // Create FormData for REST upload
      const formData = new FormData();
      formData.append("file", file);

      // Get token from localStorage
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      // Upload to REST endpoint
      const serverUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${serverUrl}/api/upload`, {
        method: "POST",
        body: formData,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log(`📥 Response status: ${response.status}`);

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          console.error("❌ Server error (JSON):", errorData);
          throw new Error(errorData.error || "Dosya yüklenemedi");
        } else {
          const errorText = await response.text();
          console.error("❌ Server error (HTML):", errorText.substring(0, 500));
          throw new Error(`Server hatası: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log("📦 Upload response:", data);

      if (!data.data) {
        throw new Error("Geçersiz sunucu yanıtı");
      }

      // Backend response: { data: { path: "/uploads/collections/xxx.jpg" } }
      const uploadedPath = data.data.path; // Already has leading "/"
      const fullPath = `${serverUrl}${uploadedPath}`; // No extra "/" to avoid double slash

      console.log("✅ File uploaded successfully:", fullPath);
      return fullPath; // Return full URL
    } catch (error) {
      console.error("❌ File upload error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Dosya yüklenirken bir hata oluştu";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleCreateClick = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleEditClick = (collection: Collection) => {
    setEditingId(collection.id);
    setSelectedCollection(collection);
    // Initialize with initialFormData to ensure all fields are present,
    // then override with values from the selected collection.
    setFormData({
      ...initialFormData,
      name: collection.name,
      description: collection.description || "",
      price: collection.price.toString(),
      stock: collection.stock.toString(),
      images: collection.images || [],
      isActive: collection.isActive,
      isFeatured: collection.isFeatured,
      productionSchedule:
        collection.productionSchedule ||
        JSON.stringify({
          PLANNING: 3,
          FABRIC: 3,
          CUTTING: 2,
          SEWING: 10,
          QUALITY: 2,
          PACKAGING: 2,
          SHIPPING: 1,
        }),
      categoryId: collection.category?.id?.toString() || "",
      // ADIM 1: Model Bilgileri
      modelCode: collection.modelCode || "",
      season: collection.season || "",
      gender: collection.gender || "",
      fit: collection.fit || "",
      // ADIM 2: Renkler & Bedenler
      colors: collection.colors ? JSON.parse(collection.colors) : [],
      sizeGroups: collection.sizeGroups
        ? JSON.parse(collection.sizeGroups)
        : [],
      measurementChart: collection.measurementChart || "",
      // ADIM 3: Kumaş & Detaylar
      fabricComposition: collection.fabricComposition || "",
      accessories: collection.accessories || "",
      techPack: collection.techPack || "",
      // ADIM 4: Ticari Bilgiler
      moq: collection.moq?.toString() || "",
      targetPrice: collection.targetPrice?.toString() || "",
      targetLeadTime: collection.targetLeadTime?.toString() || "",
      notes: collection.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (collection: Collection) => {
    setSelectedCollection(collection);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      return handleUpdate();
    } else {
      return handleCreate();
    }
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      toast.error("Koleksiyon adı gerekli");
      return;
    }

    setIsSubmitting(true);
    try {
      const input = {
        id: editingId!,
        name: formData.name,
        description: formData.description || undefined,
        price:
          parseFloat(formData.targetPrice) || parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        images: formData.images.length > 0 ? formData.images : undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        productionSchedule: formData.productionSchedule || undefined,
        categoryId: formData.categoryId
          ? parseInt(formData.categoryId)
          : undefined,
        // ADIM 1: Model Bilgileri
        modelCode: formData.modelCode || undefined,
        season: formData.season || undefined,
        gender: formData.gender || undefined,
        fit: formData.fit || undefined,
        trend: formData.trend || undefined,
        // ADIM 2: Renkler & Bedenler
        colors:
          formData.colors && formData.colors.length > 0
            ? formData.colors
                .map((colorId) => {
                  const color = colors.find((c: Color) => c.id === colorId);
                  return color?.name || "";
                })
                .filter((name) => name)
            : undefined,
        sizeGroupIds:
          formData.sizeGroups && formData.sizeGroups.length > 0
            ? formData.sizeGroups
            : undefined,
        measurementChart: formData.measurementChart || undefined,
        // ADIM 3: Kumaş & Detaylar
        fabricComposition: formData.fabricComposition || undefined,
        accessories: formData.accessories || undefined,
        techPack: formData.techPack || undefined,
        // ADIM 4: Ticari Bilgiler
        moq: formData.moq ? parseInt(formData.moq) : undefined,
        targetPrice: formData.targetPrice
          ? parseFloat(formData.targetPrice)
          : undefined,
        targetLeadTime: formData.targetLeadTime
          ? parseInt(formData.targetLeadTime)
          : undefined,
        notes: formData.notes || undefined,
      };

      const result = await updateCollection({ input });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Koleksiyon başarıyla güncellendi");
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData(initialFormData);
      reexecuteCollections({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Koleksiyon güncellenirken bir hata oluştu";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Koleksiyon adı gerekli");
      return;
    }

    setIsSubmitting(true);
    try {
      const input = {
        name: formData.name,
        description: formData.description || undefined,
        price:
          parseFloat(formData.targetPrice) || parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        images: formData.images.length > 0 ? formData.images : undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        productionSchedule: formData.productionSchedule || undefined,
        categoryId: formData.categoryId
          ? parseInt(formData.categoryId)
          : undefined,
        // ADIM 1: Model Bilgileri
        modelCode: formData.modelCode || undefined, // Optional - backend otomatik oluşturur
        season: formData.season || undefined,
        gender: formData.gender || undefined,
        fit: formData.fit || undefined,
        trend: formData.trend || undefined,
        // ADIM 2: Renkler & Bedenler
        colors:
          formData.colors && formData.colors.length > 0
            ? formData.colors
                .map((colorId) => {
                  const color = colors.find((c: Color) => c.id === colorId);
                  return color?.name || "";
                })
                .filter((name) => name) // Boş olanları filtrele
            : undefined,
        sizeGroupIds:
          formData.sizeGroups && formData.sizeGroups.length > 0
            ? formData.sizeGroups // Array of size group IDs
            : undefined,
        measurementChart: formData.measurementChart || undefined,
        // ADIM 3: Kumaş & Detaylar
        fabricComposition: formData.fabricComposition || undefined,
        accessories: formData.accessories || undefined,
        techPack: formData.techPack || undefined,
        // ADIM 4: Ticari Bilgiler
        moq: formData.moq ? parseInt(formData.moq) : undefined,
        targetPrice: formData.targetPrice
          ? parseFloat(formData.targetPrice)
          : undefined,
        targetLeadTime: formData.targetLeadTime
          ? parseInt(formData.targetLeadTime)
          : undefined,
        notes: formData.notes || undefined,
      };

      const result = await createCollection({ input });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Koleksiyon başarıyla oluşturuldu");
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData(initialFormData);
      reexecuteCollections({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Koleksiyon oluşturulurken bir hata oluştu";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedCollection || !formData.name.trim()) {
      toast.error("Koleksiyon adı gerekli");
      return;
    }

    setIsSubmitting(true);
    try {
      const input = {
        id: selectedCollection.id,
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price) || undefined,
        stock: parseInt(formData.stock) || undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        productionSchedule: formData.productionSchedule || undefined,
        categoryId: formData.categoryId
          ? parseInt(formData.categoryId)
          : undefined,
      };

      const result = await updateCollection({ input });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Koleksiyon başarıyla güncellendi");
      setIsDialogOpen(false);
      setSelectedCollection(null);
      setFormData(initialFormData);
      reexecuteCollections({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Koleksiyon güncellenirken bir hata oluştu";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCollection) return;

    setIsSubmitting(true);
    try {
      const result = await deleteCollection({ id: selectedCollection.id });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Koleksiyon başarıyla silindi");
      setIsDeleteDialogOpen(false);
      setSelectedCollection(null);
      reexecuteCollections({ requestPolicy: "network-only" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Koleksiyon silinirken bir hata oluştu";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAuthorName = (collection: Collection) => {
    if (!collection.author) return "Bilinmiyor";
    const { firstName, lastName, name } = collection.author;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (name) return name;
    return "Bilinmiyor";
  };

  // Get leaf categories (alt kategoriler - child categories)
  const leafCategories = categories.filter((cat: Category) => {
    // Leaf category = bir kategori için subcategory yoksa
    const hasChildren = categories.some(
      (c: Category) => c.parentCategory?.id === cat.id
    );
    return !hasChildren;
  });

  // Filter & Sort Collections
  const filteredCollections = collections
    .filter((col: Collection) => {
      // Search filter
      if (
        searchTerm &&
        !col.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Gender filter
      if (selectedGender !== "ALL" && col.gender !== selectedGender) {
        return false;
      }

      // Category filter (leaf categories only)
      if (selectedCategory !== "ALL") {
        if (col.category?.id !== parseInt(selectedCategory)) {
          return false;
        }
      }

      // Lead time filter
      if (selectedLeadTime !== "ALL" && col.targetLeadTime) {
        const leadTime = col.targetLeadTime;
        if (selectedLeadTime === "0-7" && (leadTime < 0 || leadTime > 7))
          return false;
        if (selectedLeadTime === "8-14" && (leadTime < 8 || leadTime > 14))
          return false;
        if (selectedLeadTime === "15-30" && (leadTime < 15 || leadTime > 30))
          return false;
        if (selectedLeadTime === "31+" && leadTime < 31) return false;
      }

      // Season filter
      if (selectedSeason !== "ALL" && col.season !== selectedSeason) {
        return false;
      }

      // Color filter
      if (selectedColor !== "ALL") {
        // col.colors is a JSON string of color names
        const collectionColors: string[] = col.colors
          ? JSON.parse(col.colors)
          : [];
        const selectedColorObj = colors.find(
          (c: Color) => c.id === parseInt(selectedColor)
        );
        if (!selectedColorObj) return true;

        // Check if collection has this color name
        if (!collectionColors.includes(selectedColorObj.name)) {
          return false;
        }
      }

      // Fit filter
      if (selectedFit !== "ALL" && col.fit !== selectedFit) {
        return false;
      }

      return true;
    })
    .sort((a: Collection, b: Collection) => {
      if (sortBy === "NEWEST") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sortBy === "OLDEST") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      if (sortBy === "NAME_ASC") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "NAME_DESC") {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === "PRICE_ASC") {
        return (
          (a.targetPrice || a.price || 0) - (b.targetPrice || b.price || 0)
        );
      }
      if (sortBy === "PRICE_DESC") {
        return (
          (b.targetPrice || b.price || 0) - (a.targetPrice || a.price || 0)
        );
      }
      return 0;
    });

  if (collectionsResult.fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Koleksiyonlar</h1>
          <p className="text-gray-500 mt-1">
            Tüm koleksiyonları görüntüleyin ve yönetin
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Koleksiyon
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Koleksiyon ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters Bar - Tek Satır */}
        <div className="flex items-end gap-2 bg-gray-50 p-3 rounded-lg overflow-x-auto">
          {/* Gender Filter */}
          <div className="min-w-[130px]">
            <Label className="text-xs text-muted-foreground mb-1.5">
              Cinsiyet
            </Label>
            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tümü</SelectItem>
                <SelectItem value="MEN">Erkek</SelectItem>
                <SelectItem value="WOMEN">Kadın</SelectItem>
                <SelectItem value="BOYS">Erkek Çocuk</SelectItem>
                <SelectItem value="GIRLS">Kız Çocuk</SelectItem>
                <SelectItem value="UNISEX">Unisex</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter (Leaf Categories) */}
          <div className="min-w-[150px]">
            <Label className="text-xs text-muted-foreground mb-1.5">
              Klasman
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tümü</SelectItem>
                {leafCategories.map((cat: Category) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Season Filter */}
          <div className="min-w-[120px]">
            <Label className="text-xs text-muted-foreground mb-1.5">
              Sezon
            </Label>
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tümü</SelectItem>
                <SelectItem value="SS25">SS25</SelectItem>
                <SelectItem value="FW25">FW25</SelectItem>
                <SelectItem value="SS26">SS26</SelectItem>
                <SelectItem value="FW26">FW26</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Filter */}
          <div className="min-w-[130px]">
            <Label className="text-xs text-muted-foreground mb-1.5">Renk</Label>
            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tümü</SelectItem>
                {colors.slice(0, 20).map((color: Color) => (
                  <SelectItem key={color.id} value={color.id.toString()}>
                    <div className="flex items-center gap-2">
                      {color.hexCode && (
                        <div
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: color.hexCode }}
                        />
                      )}
                      {color.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fit Filter */}
          <div className="min-w-[130px]">
            <Label className="text-xs text-muted-foreground mb-1.5">Fit</Label>
            <Select value={selectedFit} onValueChange={setSelectedFit}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tümü</SelectItem>
                {fits.map((fit: FitItem) => (
                  <SelectItem key={fit.id} value={fit.name}>
                    {fit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lead Time Filter */}
          <div className="min-w-[120px]">
            <Label className="text-xs text-muted-foreground mb-1.5">
              Termin
            </Label>
            <Select
              value={selectedLeadTime}
              onValueChange={setSelectedLeadTime}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tümü</SelectItem>
                <SelectItem value="0-7">0-7 Gün</SelectItem>
                <SelectItem value="8-14">8-14 Gün</SelectItem>
                <SelectItem value="15-30">15-30 Gün</SelectItem>
                <SelectItem value="31+">31+ Gün</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="min-w-[170px]">
            <Label className="text-xs text-muted-foreground mb-1.5">
              Sıralama
            </Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEWEST">En Yeniler</SelectItem>
                <SelectItem value="OLDEST">En Eskiler</SelectItem>
                <SelectItem value="NAME_ASC">İsim (A-Z)</SelectItem>
                <SelectItem value="NAME_DESC">İsim (Z-A)</SelectItem>
                <SelectItem value="PRICE_ASC">Fiyat (Düşük-Yüksek)</SelectItem>
                <SelectItem value="PRICE_DESC">Fiyat (Yüksek-Düşük)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters */}
          {(selectedGender !== "ALL" ||
            selectedCategory !== "ALL" ||
            selectedLeadTime !== "ALL" ||
            selectedSeason !== "ALL" ||
            selectedColor !== "ALL" ||
            selectedFit !== "ALL" ||
            sortBy !== "NEWEST") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedGender("ALL");
                setSelectedCategory("ALL");
                setSelectedLeadTime("ALL");
                setSelectedSeason("ALL");
                setSelectedColor("ALL");
                setSelectedFit("ALL");
                setSortBy("NEWEST");
              }}
              className="h-9 whitespace-nowrap"
            >
              Temizle
            </Button>
          )}
        </div>

        {/* Filter Results Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredCollections.length} koleksiyon bulundu
            {collections.length !== filteredCollections.length &&
              ` (${collections.length} toplam)`}
          </span>
        </div>
      </div>

      {/* Collections Grid */}
      {filteredCollections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Koleksiyon bulunamadı
          </h3>
          <p className="text-gray-500 mb-4">Henüz hiç koleksiyon eklenmemiş</p>
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            İlk Koleksiyonu Oluştur
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection: Collection) => (
            <div
              key={collection.id}
              className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="aspect-video bg-gray-100 relative">
                {collection.images && collection.images.length > 0 ? (
                  <NextImage
                    src={collection.images[0].replace(/\/\//g, "/")} // Fix double slash
                    alt={collection.name}
                    className="w-full h-full object-cover"
                    width={500}
                    height={500}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                {!collection.isActive && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                    Pasif
                  </div>
                )}
                {collection.isFeatured && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded">
                    Öne Çıkan
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {collection.name}
                  </h3>
                  {collection.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {collection.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-500">Fiyat:</span>
                    <span className="font-semibold ml-1">
                      ₺{collection.price.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stok:</span>
                    <span className="font-semibold ml-1">
                      {collection.stock}
                    </span>
                  </div>
                </div>

                {collection.sku && (
                  <div className="text-sm text-gray-500">
                    SKU: {collection.sku}
                  </div>
                )}

                {collection.category && (
                  <div className="text-sm">
                    <span className="text-gray-500">Kategori:</span>
                    <span className="ml-1">{collection.category.name}</span>
                  </div>
                )}

                {collection.company && (
                  <div className="text-sm">
                    <span className="text-gray-500">Marka:</span>
                    <span className="ml-1 font-semibold text-primary">
                      {collection.company.name}
                    </span>
                  </div>
                )}

                {collection.author && (
                  <div className="text-xs text-gray-400">
                    İlgili:{" "}
                    {collection.author.name || collection.author.firstName}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t">
                  <span>{getAuthorName(collection)}</span>
                  <span>
                    {new Date(collection.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(collection)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Düzenle
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteClick(collection)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Sil
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog (Unified) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Koleksiyonu Düzenle" : "Yeni Koleksiyon Oluştur"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Koleksiyon bilgilerini güncelleyin"
                : "5 adımda koleksiyonunuzu oluşturun"}
            </DialogDescription>
          </DialogHeader>

          <MultiStepCollectionForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            categories={categories}
            colors={colors}
            fabrics={fabrics}
            sizeGroups={sizeGroups}
            seasons={seasons}
            fits={fits}
            onUploadFile={handleUploadFile}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Koleksiyonu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCollection?.name} koleksiyonunu silmek istediğinize emin
              misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
