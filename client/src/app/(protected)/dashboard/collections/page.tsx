"use client";
import { CustomerCollectionCard } from "@/components/Collection/CustomerCollectionCard";
import { MultiStepCollectionForm } from "@/components/Collection/MultiStepCollectionForm";
import { SearchAndFiltering } from "@/components/SearchAndFiltering/SearchAndFiltering";
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
import { useAuth } from "@/context/AuthProvider";
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
import {
  Clock,
  Loader2,
  Package,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import NextImage from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";
import { Category, Color, SeasonItem } from "../../../../__generated__/graphql";

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
    address?: string;
    location?: string;
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
  // Beğeni ve Sertifikalar
  likesCount?: number;
  certifications?: Array<{
    id: number;
    name: string;
    category: string;
    code?: string;
  }>;
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
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState(""); // Search term for client-side filtering
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is manufacturer
  const isManufacturer =
    user?.company?.type === "MANUFACTURER" || user?.role === "ADMIN";

  // Filters
  const [selectedGender, setSelectedGender] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedLeadTime, setSelectedLeadTime] = useState<string>("ALL");
  const [selectedSeason, setSelectedSeason] = useState<string>("ALL");
  const [selectedColor, setSelectedColor] = useState<string>("ALL");
  const [selectedFit, setSelectedFit] = useState<string>("ALL");
  const [selectedManufacturer, setSelectedManufacturer] =
    useState<string>("ALL");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Queries - Get all collections (search filtering done client-side)
  const [collectionsResult, reexecuteCollections] = useQuery({
    query: ALL_COLLECTIONS_QUERY,
    variables: {}, // No search variable - all data fetched server-side without search filtering
    requestPolicy: "cache-first",
    pause: false,
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
      // Search filter (client-side now)
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

      // Manufacturer filter
      if (
        selectedManufacturer !== "ALL" &&
        col.company?.name !== selectedManufacturer
      ) {
        return false;
      }

      // Location filter (using company location or address)
      if (selectedLocation !== "ALL") {
        const companyLocation = col.company?.location || col.company?.address;
        if (companyLocation !== selectedLocation) {
          return false;
        }
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

  // Pagination
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const paginatedCollections = filteredCollections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  const resetPage = () => setCurrentPage(1);

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
          <h1 className="text-3xl font-bold">
            {isManufacturer ? "Koleksiyonlar" : "Koleksiyonları Keşfet"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isManufacturer
              ? "Tüm koleksiyonları görüntüleyin ve yönetin"
              : "Üreticilerin koleksiyonlarını görüntüleyin ve numune talep edin"}
          </p>
        </div>
        {isManufacturer && (
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Koleksiyon
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <SearchAndFiltering
        searchValue={searchTerm}
        searchPlaceholder="Koleksiyon ara..."
        onSearchChange={(value) => {
          setSearchTerm(value);
          resetPage();
        }}
        filters={[
          {
            id: "sort",
            label: "Sıralama",
            placeholder: "Seçiniz",
            width: "w-[140px]",
            value: sortBy,
            onChange: (val) => {
              setSortBy(val);
              resetPage();
            },
            options: [
              { value: "NEWEST", label: "En Yeniler" },
              { value: "OLDEST", label: "En Eskiler" },
              { value: "NAME_ASC", label: "İsim (A-Z)" },
              { value: "NAME_DESC", label: "İsim (Z-A)" },
              { value: "PRICE_ASC", label: "Fiyat ↑" },
              { value: "PRICE_DESC", label: "Fiyat ↓" },
            ],
          },
          {
            id: "category",
            label: "Kategori",
            placeholder: "Seçiniz",
            width: "w-[140px]",
            value: selectedCategory,
            onChange: (val) => {
              setSelectedCategory(val);
              resetPage();
            },
            options: leafCategories.map((cat: Category) => ({
              value: cat.id.toString(),
              label: cat.name,
            })),
          },
          {
            id: "season",
            label: "Sezon",
            placeholder: "Seçiniz",
            width: "w-[120px]",
            value: selectedSeason,
            onChange: (val) => {
              setSelectedSeason(val);
              resetPage();
            },
            options:
              seasons && seasons.length > 0
                ? seasons.map((s: SeasonItem) => ({
                    value:
                      typeof s === "string" ? s : s.name || s.id || String(s),
                    label:
                      typeof s === "string" ? s : s.name || s.id || String(s),
                  }))
                : [
                    { value: "SS25", label: "SS25" },
                    { value: "FW25", label: "FW25" },
                    { value: "SS26", label: "SS26" },
                    { value: "FW26", label: "FW26" },
                  ],
          },
          {
            id: "location",
            label: "Lokasyon",
            placeholder: "Seçiniz",
            width: "w-[140px]",
            value: selectedLocation,
            onChange: (val) => {
              setSelectedLocation(val);
              resetPage();
            },
            showWhen: !isManufacturer,
            options: (
              Array.from(
                new Set(
                  collections
                    .map(
                      (col: Collection) =>
                        col.company?.location || col.company?.address
                    )
                    .filter(Boolean) as string[]
                )
              ) as string[]
            ).map((location: string) => ({
              value: location,
              label: location,
            })),
          },
          {
            id: "manufacturer",
            label: "Üretici",
            placeholder: "Seçiniz",
            width: "w-[160px]",
            value: selectedManufacturer,
            onChange: (val) => {
              setSelectedManufacturer(val);
              resetPage();
            },
            showWhen: !isManufacturer,
            options: (
              Array.from(
                new Set(
                  collections
                    .map((col: Collection) => col.company?.name)
                    .filter(Boolean)
                )
              ) as string[]
            ).map((name: string) => ({
              value: name,
              label: name,
            })),
          },
        ]}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        hasActiveFilters={
          selectedGender !== "ALL" ||
          selectedCategory !== "ALL" ||
          selectedSeason !== "ALL" ||
          selectedColor !== "ALL" ||
          selectedFit !== "ALL" ||
          selectedLeadTime !== "ALL" ||
          selectedManufacturer !== "ALL" ||
          selectedLocation !== "ALL" ||
          sortBy !== "NEWEST"
        }
        onClearAll={() => {
          setSelectedGender("ALL");
          setSelectedCategory("ALL");
          setSelectedLeadTime("ALL");
          setSelectedSeason("ALL");
          setSelectedColor("ALL");
          setSelectedFit("ALL");
          setSelectedManufacturer("ALL");
          setSelectedLocation("ALL");
          setSortBy("NEWEST");
          resetPage();
        }}
        secondaryFilterChips={[
          ...(selectedGender !== "ALL"
            ? [
                {
                  id: "gender",
                  label: "Cinsiyet",
                  value: selectedGender,
                  onRemove: () => {
                    setSelectedGender("ALL");
                    resetPage();
                  },
                },
              ]
            : []),
          ...(selectedColor !== "ALL"
            ? [
                {
                  id: "color",
                  label: "Renk",
                  value:
                    colors.find((c: Color) => c.id === parseInt(selectedColor))
                      ?.name || selectedColor,
                  onRemove: () => {
                    setSelectedColor("ALL");
                    resetPage();
                  },
                },
              ]
            : []),
          ...(selectedFit !== "ALL"
            ? [
                {
                  id: "fit",
                  label: "Kalıp",
                  value: selectedFit,
                  onRemove: () => {
                    setSelectedFit("ALL");
                    resetPage();
                  },
                },
              ]
            : []),
          ...(selectedLeadTime !== "ALL"
            ? [
                {
                  id: "leadTime",
                  label: "Termin",
                  value: selectedLeadTime,
                  onRemove: () => {
                    setSelectedLeadTime("ALL");
                    resetPage();
                  },
                },
              ]
            : []),
        ]}
        resultsCount={filteredCollections.length}
        totalCount={collections.length}
        showPagination={true}
      />

      {/* Collections Grid */}
      {filteredCollections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Koleksiyon bulunamadı
          </h3>
          <p className="text-gray-500 mb-4">
            {isManufacturer
              ? "Henüz hiç koleksiyon eklenmemiş"
              : "Arama kriterlerinize uygun koleksiyon bulunamadı"}
          </p>
          {isManufacturer && (
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4 mr-2" />
              İlk Koleksiyonu Oluştur
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCollections.map((collection: Collection) => (
            <div key={collection.id}>
              {isManufacturer ? (
                // Manufacturer View - Old Card Style
                <div className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="aspect-video bg-gray-100 relative">
                    {collection.images && collection.images.length > 0 ? (
                      <NextImage
                        src={collection.images[0].replace(/\/\//g, "/")}
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

                    {/* Enhanced Details */}
                    <div className="flex flex-wrap gap-2">
                      {collection.targetLeadTime && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          <Clock className="h-3 w-3" />
                          <span>{collection.targetLeadTime} gün</span>
                        </div>
                      )}
                      {collection.trend && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                          <Sparkles className="h-3 w-3" />
                          <span>{collection.trend}</span>
                        </div>
                      )}
                    </div>

                    {collection.fabricComposition && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Kumaş:</span>{" "}
                        {collection.fabricComposition}
                      </div>
                    )}

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

                    {collection.category && (
                      <div className="text-sm">
                        <span className="text-gray-500">Kategori:</span>
                        <span className="ml-1">{collection.category.name}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t">
                      <span>{getAuthorName(collection)}</span>
                      <span>
                        {new Date(collection.createdAt).toLocaleDateString(
                          "tr-TR"
                        )}
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
              ) : (
                // Customer View - New CustomerCollectionCard
                <CustomerCollectionCard
                  collection={{
                    id: collection.id,
                    name: collection.name,
                    description: collection.description,
                    modelCode: collection.modelCode || "",
                    season: collection.season,
                    gender: collection.gender,
                    fit: collection.fit,
                    trend: collection.trend,
                    fabricComposition: collection.fabricComposition,
                    targetLeadTime: collection.targetLeadTime,
                    targetPrice: collection.targetPrice || collection.price,
                    moq: collection.moq,
                    images: collection.images,
                    likesCount: collection.likesCount || 0,
                    certifications: collection.certifications || [],
                    company: collection.company
                      ? {
                          id: collection.company.id,
                          name: collection.company.name,
                          location:
                            collection.company.location ||
                            collection.company.address,
                        }
                      : undefined,
                    notes: collection.notes,
                  }}
                  isLiked={false}
                  onLike={(id) => {
                    toast.success("Koleksiyon beğenildi!");
                    // TODO: Implement like mutation
                  }}
                  onRequestSample={(id) => {
                    toast.info(
                      "Numune talep sayfasına yönlendiriliyorsunuz..."
                    );
                    // TODO: Navigate to /samples/request?collectionId={id}
                  }}
                  onRequestRevision={(id) => {
                    toast.info(
                      "Revize numune sayfasına yönlendiriliyorsunuz..."
                    );
                    // TODO: Navigate to /samples/request?collectionId={id}&type=revision
                  }}
                  onAddToPO={(id) => {
                    toast.info(
                      "Sipariş oluşturma sayfasına yönlendiriliyorsunuz..."
                    );
                    // TODO: Navigate to /orders/create?collectionId={id}
                  }}
                />
              )}
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
