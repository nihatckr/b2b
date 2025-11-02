"use client";
import {
  CollectionsCreateDocument,
  DashboardLibraryItemsDocument,
} from "@/__generated__/graphql";
import { FormFileUpload, FormImageUpload } from "@/components/forms";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NextImage from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

// Size Group tipi (LibraryItem'dan geliyor)
interface SizeGroup {
  id?: string | null;
  name?: string | null;
  data?: string | object | null;
}

// 4 Adımlı Collection Form Data
interface CollectionFormData {
  // ADIM 1: Temel Bilgiler
  name: string;
  description: string;
  modelCode: string;
  trend: string;
  categoryPath: string; // "WOMEN-ÜSTGIYIM-GÖMLEK-UZUN_KOLLU" formatında
  // Adım adım kategori seçimi (4 seviye)
  selectedGender: string; // ROOT level: "WOMEN", "MEN", "KIDS", etc.
  selectedMainCategory: string; // MAIN level: "ÜSTGIYIM", "ALTGIYIM", etc.
  selectedSubCategory: string; // SUB level: "GÖMLEK", "PANTOLON", etc.
  selectedDetailCategory: string; // DETAIL level: "UZUN_KOLLU", "KISA_KOLLU", etc.
  season: string;
  fit: string;

  // ADIM 2: Varyantlar ve Ölçüler
  colors: string[];
  sizeRange: string;
  measurementChart: string;

  // ADIM 3: Teknik Detaylar
  fabrics: (
    | string
    | {
        name: string;
        composition?: string;
        certifications?: Array<{
          id?: string | null;
          name?: string | null;
          issuer?: string;
        }>;
      }
  )[]; // Library'den seçilen kumaşlar
  accessories: (
    | string
    | {
        name: string;
        certifications?: Array<{
          id?: string | null;
          name?: string | null;
          issuer?: string;
        }>;
      }
  )[]; // Library'den seçilen aksesuarlar
  images: string[];
  techPack: string;

  // ADIM 4: Ticari Bilgiler
  moq: number;
  price: number;
  currency: string;
  deadlineDays: number; // Üretim süresi (gün olarak)
  notes: string;
}

const STEPS = [
  {
    id: 1,
    title: "Temel Bilgiler",
    description: "Model kodu, klasman, sezon, fit",
  },
  { id: 2, title: "Varyantlar", description: "Renk, beden, ölçü tablosu" },
  {
    id: 3,
    title: "Teknik Detaylar",
    description: "Kumaş, aksesuar, görseller",
  },
  {
    id: 4,
    title: "Ticari Bilgiler",
    description: "MOQ, fiyat, termin, notlar",
  },
];

interface CreateCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  isEditMode?: boolean;
  initialData?: {
    name: string;
    description: string;
    modelCode: string;
    season: string;
    gender: string;
    fit: string;
    trend: string;
    colors: string;
    sizeRange: string;
    fabricComposition: string;
    accessories: string;
    images: string;
    moq: number;
    targetPrice: number;
    currency: string;
    deadlineDays: number;
    notes: string;
  };
  onSubmit?: (data: Record<string, unknown>) => Promise<void>;
}

export function CreateCollectionModal({
  open,
  onOpenChange,
  onSuccess,
  isEditMode = false,
  initialData,
  onSubmit,
}: CreateCollectionModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [, createCollection] = useMutation(CollectionsCreateDocument);
  const [fabricSearch, setFabricSearch] = useState("");
  const [accessorySearch, setAccessorySearch] = useState("");

  // Form state - MUST be before queries that depend on it
  const [formData, setFormData] = useState<CollectionFormData>({
    name: "",
    description: "",
    modelCode: "",
    trend: "",
    categoryPath: "",
    selectedGender: "",
    selectedMainCategory: "",
    selectedSubCategory: "",
    selectedDetailCategory: "",
    season: "",
    fit: "",
    colors: [],
    sizeRange: "",
    measurementChart: "",
    fabrics: [],
    accessories: [],
    images: [],
    techPack: "",
    moq: 100,
    price: 0,
    currency: "USD",
    deadlineDays: 30,
    notes: "",
  });

  // Library Data Queries (after formData state)
  const [{ data: seasonsData }] = useQuery({
    query: DashboardLibraryItemsDocument,
    variables: { filter: { category: "SEASON" } },
  });

  const [{ data: fitsData }] = useQuery({
    query: DashboardLibraryItemsDocument,
    variables: { filter: { category: "FIT" } },
  });

  const [{ data: colorsData }] = useQuery({
    query: DashboardLibraryItemsDocument,
    variables: { filter: { category: "COLOR" } },
  });

  const [
    {
      data: sizeGroupsData,
      fetching: sizeGroupsLoading,
      error: sizeGroupsError,
    },
  ] = useQuery({
    query: DashboardLibraryItemsDocument,
    variables: { filter: { category: "SIZE_GROUP" } },
  });

  const [{ data: fabricsData }] = useQuery({
    query: DashboardLibraryItemsDocument,
    variables: { filter: { category: "FABRIC" } },
  });

  const [{ data: accessoriesData }] = useQuery({
    query: DashboardLibraryItemsDocument,
    variables: { filter: { category: "MATERIAL" } },
  });

  // TODO: StandardCategory modeli kaldırıldı.
  // Bu component'in category seçimi mantığı yeniden tasarlanmalı.
  // Collection model'inde artık standardCategoryId yok, sadece company-specific categoryId var.
  const genderCategoriesData = { standardCategories: [] as any[] };
  const mainCategoriesData = { standardCategories: [] as any[] };
  const subCategoriesData = { standardCategories: [] as any[] };
  const detailCategoriesData = { standardCategories: [] as any[] };

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (isEditMode && initialData) {
      console.log("🔄 Updating form with initialData:", initialData);

      // Parse JSON fields safely
      const parseJsonSafely = (
        jsonString: string | null | undefined,
        fallback: unknown[] = []
      ) => {
        if (!jsonString) return fallback;
        try {
          const parsed = JSON.parse(jsonString);
          return Array.isArray(parsed) ? parsed : fallback;
        } catch {
          return fallback;
        }
      };

      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        modelCode: initialData.modelCode || "",
        trend: initialData.trend || "",
        categoryPath: "", // Will be derived from gender/category if needed
        selectedGender: initialData.gender || "",
        selectedMainCategory: "",
        selectedSubCategory: "",
        selectedDetailCategory: "",
        season: initialData.season || "",
        fit: initialData.fit || "",
        colors: parseJsonSafely(initialData.colors),
        sizeRange: initialData.sizeRange || "",
        measurementChart: "",
        fabrics: parseJsonSafely(initialData.fabricComposition),
        accessories: parseJsonSafely(initialData.accessories),
        images: parseJsonSafely(initialData.images),
        techPack: "",
        moq: initialData.moq || 100,
        price: initialData.targetPrice || 0,
        currency: initialData.currency || "USD",
        deadlineDays: initialData.deadlineDays || 30,
        notes: initialData.notes || "",
      });
    }
  }, [isEditMode, initialData]);

  const handleInputChange = useCallback(
    (
      field: keyof CollectionFormData,
      value: string | number | string[] | boolean
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Helper function to extract sizes from size group data
  const getSizesFromSizeGroup = (sizeGroup: SizeGroup): string => {
    if (!sizeGroup.data) return sizeGroup.name || "";

    try {
      const data = (() => {
        return typeof sizeGroup.data === "string"
          ? JSON.parse(sizeGroup.data)
          : sizeGroup.data;
      })();

      // sizes field'ı varsa (string veya array olabilir)
      if (data && typeof data === "object" && "sizes" in data) {
        // String ise direkt döndür
        if (typeof data.sizes === "string") {
          return data.sizes || sizeGroup.name || "";
        }

        // Array ise işle
        if (Array.isArray(data.sizes)) {
          const sizeValues = data.sizes
            .map(
              (sizeItem: { value?: string; name?: string }) =>
                sizeItem.value || sizeItem.name
            )
            .filter(Boolean)
            .join(", ");
          return sizeValues || sizeGroup.name || "";
        }
      }

      // sizes field'ı yoksa name'i döndür
      return sizeGroup.name || "";
    } catch {
      return sizeGroup.name || "";
    }
  };

  // Helper: Kategori yolu oluştur (name kullanarak - 4 seviye)
  const updateCategoryPath = () => {
    if (
      formData.selectedGender &&
      formData.selectedMainCategory &&
      formData.selectedSubCategory
    ) {
      // ID'lerden name'leri bul
      const genderName = genderCategoriesData?.standardCategories?.find(
        (cat: any) => cat.id === formData.selectedGender
      )?.name;
      const mainName = mainCategoriesData?.standardCategories?.find(
        (cat: any) => cat.id === formData.selectedMainCategory
      )?.name;
      const subName = subCategoriesData?.standardCategories?.find(
        (cat: any) => cat.id === formData.selectedSubCategory
      )?.name;

      if (genderName && mainName && subName) {
        // Detail category opsiyonel
        if (formData.selectedDetailCategory) {
          const detailName = detailCategoriesData?.standardCategories?.find(
            (cat: any) => cat.id === formData.selectedDetailCategory
          )?.name;
          if (detailName) {
            const path = `${genderName}-${mainName}-${subName}-${detailName}`;
            handleInputChange("categoryPath", path);
            return;
          }
        }

        // Detail category yoksa 3 seviye
        const path = `${genderName}-${mainName}-${subName}`;
        handleInputChange("categoryPath", path);
      }
    }
  };

  // Kategori seçimi değiştiğinde path'i güncelle
  const handleGenderChange = (genderId: string) => {
    handleInputChange("selectedGender", genderId);
    handleInputChange("selectedMainCategory", "");
    handleInputChange("selectedSubCategory", "");
    handleInputChange("selectedDetailCategory", "");
    handleInputChange("categoryPath", "");
  };

  const handleMainCategoryChange = (mainCategoryId: string) => {
    handleInputChange("selectedMainCategory", mainCategoryId);
    handleInputChange("selectedSubCategory", "");
    handleInputChange("selectedDetailCategory", "");
    setTimeout(updateCategoryPath, 0);
  };

  const handleSubCategoryChange = (subCategoryId: string) => {
    handleInputChange("selectedSubCategory", subCategoryId);
    handleInputChange("selectedDetailCategory", "");
    setTimeout(updateCategoryPath, 0);
  };

  const handleDetailCategoryChange = (detailCategoryId: string) => {
    handleInputChange("selectedDetailCategory", detailCategoryId);
    setTimeout(updateCategoryPath, 0);
  };

  // Kategori seçimi değiştiğinde categoryPath'i otomatik güncelle
  useEffect(() => {
    if (
      formData.selectedGender &&
      formData.selectedMainCategory &&
      formData.selectedSubCategory
    ) {
      updateCategoryPath();
    }
  }, [
    formData.selectedGender,
    formData.selectedMainCategory,
    formData.selectedSubCategory,
    formData.selectedDetailCategory,
  ]);

  // Color Management // Color Management
  const toggleColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  // Fabric Management
  const toggleFabric = (
    fabricName: string,
    fabricObj?: {
      name: string;
      composition?: string;
      certifications?: Array<{
        id?: string | null;
        name?: string | null;
        issuer?: string;
      }>;
    }
  ) => {
    setFormData((prev) => {
      // Check if fabric already exists by name
      const existingIndex = prev.fabrics.findIndex((f) => {
        if (typeof f === "string") {
          return f === fabricName;
        }
        return (f as { name: string }).name === fabricName;
      });

      if (existingIndex !== -1) {
        // Remove existing fabric
        return {
          ...prev,
          fabrics: prev.fabrics.filter((_, index) => index !== existingIndex),
        };
      } else {
        // Add new fabric with full object including composition
        const newFabric = fabricObj || fabricName;
        return {
          ...prev,
          fabrics: [...prev.fabrics, newFabric],
        };
      }
    });
  };

  // Accessory Management
  const toggleAccessory = (
    accessoryName: string,
    accessoryObj?: {
      name: string;
      certifications?: Array<{
        id?: string | null;
        name?: string | null;
        issuer?: string;
      }>;
    }
  ) => {
    setFormData((prev) => {
      // Check if accessory already exists by name
      const existingIndex = prev.accessories.findIndex((a) =>
        typeof a === "string" ? a === accessoryName : a.name === accessoryName
      );

      if (existingIndex !== -1) {
        // Remove existing accessory
        return {
          ...prev,
          accessories: prev.accessories.filter(
            (_, index) => index !== existingIndex
          ),
        };
      } else {
        // Add new accessory with full object including certifications
        const newAccessory = accessoryObj || accessoryName;
        return {
          ...prev,
          accessories: [...prev.accessories, newAccessory],
        };
      }
    });
  };

  const handleSubmit = async () => {
    try {
      // Helper function to convert category name to Gender enum
      const mapGenderCategoryToEnum = (
        categoryName: string
      ): "WOMEN" | "MEN" | "GIRLS" | "BOYS" | "UNISEX" | null => {
        const mapping: Record<
          string,
          "WOMEN" | "MEN" | "GIRLS" | "BOYS" | "UNISEX"
        > = {
          KADIN: "WOMEN",
          WOMEN: "WOMEN",
          ERKEK: "MEN",
          MEN: "MEN",
          KIZ: "GIRLS",
          "KIZ ÇOCUK": "GIRLS",
          GIRLS: "GIRLS",
          "ERKEK ÇOCUK": "BOYS",
          BOYS: "BOYS",
          UNISEX: "UNISEX",
          UNİSEX: "UNISEX",
        };

        const upperName = categoryName.toUpperCase().trim();
        return mapping[upperName] || null;
      };

      // Edit mode - use onSubmit callback
      if (isEditMode && onSubmit) {
        const finalModelCode = formData.modelCode || `MODEL-${Date.now()}`;

        const genderValue = formData.categoryPath
          ? mapGenderCategoryToEnum(formData.categoryPath.split("-")[0])
          : undefined;

        const submitData = {
          name: formData.name,
          description: formData.description || undefined,
          modelCode: finalModelCode,
          season: formData.season || undefined,
          gender: genderValue || undefined,
          fit: formData.fit || undefined,
          trend: formData.trend || undefined,
          colors:
            formData.colors.length > 0
              ? JSON.stringify(formData.colors)
              : undefined,
          sizeRange: formData.sizeRange || undefined,
          fabricComposition:
            formData.fabrics.length > 0
              ? (() => {
                  const fabricJson = JSON.stringify(formData.fabrics);
                  if (fabricJson.length > 10000) {
                    throw new Error(
                      "Fabric composition data is too large. Please reduce the amount of fabric information."
                    );
                  }
                  return fabricJson;
                })()
              : undefined,
          accessories:
            formData.accessories.length > 0
              ? JSON.stringify(formData.accessories)
              : undefined,
          images:
            formData.images.length > 0
              ? JSON.stringify(formData.images)
              : undefined,
          moq: formData.moq || undefined,
          targetPrice: formData.price || undefined,
          currency: formData.currency || undefined,
          deadlineDays: formData.deadlineDays || undefined,
          notes: formData.notes || undefined,
        };

        await onSubmit(submitData);
        onOpenChange(false);
        return;
      }

      // Create mode - use createCollection mutation
      const finalModelCode = formData.modelCode || `MODEL-${Date.now()}`;

      const genderForCreate = formData.categoryPath
        ? mapGenderCategoryToEnum(formData.categoryPath.split("-")[0])
        : null;

      const result = await createCollection({
        name: formData.name,
        description: formData.description || null,
        modelCode: finalModelCode,
        season: formData.season || null,
        gender: genderForCreate,
        fit: formData.fit || null,
        trend: formData.trend || null,
        colors:
          formData.colors.length > 0 ? JSON.stringify(formData.colors) : null,
        sizeRange: formData.sizeRange || null,
        fabricComposition:
          formData.fabrics.length > 0
            ? (() => {
                const fabricJson = JSON.stringify(formData.fabrics);
                if (fabricJson.length > 10000) {
                  throw new Error(
                    "Fabric composition data is too large. Please reduce the amount of fabric information."
                  );
                }
                return fabricJson;
              })()
            : null,
        accessories:
          formData.accessories.length > 0
            ? JSON.stringify(formData.accessories)
            : null,
        images:
          formData.images.length > 0 ? JSON.stringify(formData.images) : null,
        moq: formData.moq || null,
        targetPrice: formData.price || null,
        currency: formData.currency || null,
        deadlineDays: formData.deadlineDays || null,
        notes: formData.notes || null,
      });

      if (result.error) {
        toast.error(`Error: ${result.error.message}`);
        return;
      }

      toast.success("✅ Collection created successfully!");
      onSuccess?.();
      onOpenChange(false);

      // Reset form
      setFormData({
        name: "",
        description: "",
        modelCode: "",
        trend: "",
        categoryPath: "",
        selectedGender: "",
        selectedMainCategory: "",
        selectedSubCategory: "",
        selectedDetailCategory: "",
        season: "",
        fit: "",
        colors: [],
        sizeRange: "",
        measurementChart: "",
        fabrics: [],
        accessories: [],
        images: [],
        techPack: "",
        moq: 100,
        price: 0,
        currency: "USD",
        deadlineDays: 30,
        notes: "",
      });
      setCurrentStep(1);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create collection");
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== "";
      case 2:
        return true; // Optional fields
      case 3:
        return true; // Optional fields
      case 4:
        return true; // Optional fields
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Collection" : "Create New Collection"}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  currentStep === step.id
                    ? "text-primary font-semibold"
                    : currentStep > step.id
                    ? "text-green-600"
                    : "text-muted-foreground"
                }`}
              >
                <div>{step.title}</div>
                <div className="text-xs">{step.description}</div>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} />
        </div>

        {/* Step 1: Temel Bilgiler */}
        {currentStep === 1 && (
          <div className="space-y-4">
            {/* Koleksiyon Görseli - En Üstte */}
            <div className="space-y-2">
              <FormImageUpload
                value={formData.images[0] || ""}
                onChange={(url) => {
                  if (url) {
                    handleInputChange("images", [...formData.images, url]);
                  }
                }}
                onDelete={() => {
                  const newImages = [...formData.images];
                  newImages.shift();
                  handleInputChange("images", newImages);
                }}
                label="Koleksiyon Ana Görseli"
                description="Koleksiyonu temsil eden ana görseli yükleyin"
                uploadType="collections"
                recommended="En az 800x800px, maksimum 5MB"
              />
              {formData.images.length > 1 && (
                <div className="text-sm text-gray-600">
                  +{formData.images.length - 1} görsel daha yüklendi
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Koleksiyon Adı <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Örn: Sonbahar Klasikleri"
              />
              <p className="text-xs text-gray-500">
                Model kodu otomatik oluşturulacak
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Koleksiyon hakkında açıklama..."
                rows={3}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/5000 karakter
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trend">Trend</Label>
              <Input
                id="trend"
                value={formData.trend}
                onChange={(e) => handleInputChange("trend", e.target.value)}
                placeholder="Örn: Minimalist, Vintage, Sport Chic"
              />
            </div>

            <div className="space-y-4">
              <Label>Klasman Seçimi</Label>
              <div className="flex flex-wrap gap-3">
                {/* 1. Cinsiyet Seçimi (GENDER level) - Her zaman görünür */}
                <div className="min-w-[200px]">
                  <Select
                    value={formData.selectedGender}
                    onValueChange={handleGenderChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cinsiyet seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const categories =
                          genderCategoriesData?.standardCategories || [];
                        console.log(
                          "🔍 Gender Categories:",
                          categories.map((g) => ({
                            id: g.id,
                            name: g.name,
                            idType: typeof g.id,
                            isEmpty: g.id === "",
                            isNull: g.id === null,
                            isUndefined: g.id === undefined,
                          }))
                        );

                        return categories
                          .filter(
                            (gender: any) => gender.id && gender.id !== ""
                          )
                          .map((gender: any) => (
                            <SelectItem key={gender.id} value={gender.id}>
                              {gender.name}
                            </SelectItem>
                          ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Ana Kategori Seçimi (MAIN_CATEGORY level) - Sadece cinsiyet seçilince görünür */}
                {formData.selectedGender && (
                  <div className="min-w-[200px]">
                    <Select
                      value={formData.selectedMainCategory}
                      onValueChange={handleMainCategoryChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ana kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {mainCategoriesData?.standardCategories
                          ?.filter(
                            (category: any) => category.id && category.id !== ""
                          )
                          .map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* 3. Alt Kategori Seçimi (SUB level) - Sadece ana kategori seçilince görünür */}
                {formData.selectedGender && formData.selectedMainCategory && (
                  <div className="min-w-[200px]">
                    <Select
                      value={formData.selectedSubCategory}
                      onValueChange={handleSubCategoryChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Alt kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategoriesData?.standardCategories
                          ?.filter(
                            (subCategory: any) =>
                              subCategory.id && subCategory.id !== ""
                          )
                          .map((subCategory: any) => (
                            <SelectItem
                              key={subCategory.id}
                              value={subCategory.id}
                            >
                              {subCategory.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* 4. Detay Kategori Seçimi (DETAIL level) - Sadece alt kategori seçilince görünür (OPSIYONEL) */}
                {formData.selectedGender &&
                  formData.selectedMainCategory &&
                  formData.selectedSubCategory && (
                    <div className="min-w-[200px]">
                      <Select
                        value={formData.selectedDetailCategory}
                        onValueChange={handleDetailCategoryChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Detay seçin (opsiyonel)" />
                        </SelectTrigger>
                        <SelectContent>
                          {detailCategoriesData?.standardCategories
                            ?.filter(
                              (detailCategory: any) =>
                                detailCategory.id && detailCategory.id !== ""
                            )
                            .map((detailCategory: any) => (
                              <SelectItem
                                key={detailCategory.id}
                                value={detailCategory.id}
                              >
                                {detailCategory.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
              </div>

              {/* Seçilen Kategori Yolu Gösterimi */}
              {formData.categoryPath && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-medium">Seçilen Klasman:</span>{" "}
                    {formData.categoryPath.replace(/-/g, " > ")}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="season">Sezon</Label>
                <Select
                  value={formData.season}
                  onValueChange={(value) => handleInputChange("season", value)}
                >
                  <SelectTrigger id="season">
                    <SelectValue placeholder="Sezon seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const seasons = seasonsData?.libraryItems || [];
                      console.log(
                        "🔍 Seasons:",
                        seasons.map((s) => ({
                          id: s.id,
                          name: s.name,
                          nameType: typeof s.name,
                          isEmpty: s.name === "",
                          isNull: s.name === null,
                          isUndefined: s.name === undefined,
                        }))
                      );

                      return seasons
                        .filter(
                          (season: any) =>
                            season.id != null &&
                            season.name != null &&
                            season.name !== ""
                        )
                        .map((season: any) => (
                          <SelectItem key={season.id} value={season.name}>
                            {season.name || "Unknown"}
                          </SelectItem>
                        ));
                    })()}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fit">Fit</Label>
                <Select
                  value={formData.fit}
                  onValueChange={(value) => handleInputChange("fit", value)}
                >
                  <SelectTrigger id="fit">
                    <SelectValue placeholder="Fit seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const fits = fitsData?.libraryItems || [];
                      console.log(
                        "🔍 Fits:",
                        fits.map((f) => ({
                          id: f.id,
                          name: f.name,
                          nameType: typeof f.name,
                          isEmpty: f.name === "",
                          isNull: f.name === null,
                          isUndefined: f.name === undefined,
                        }))
                      );

                      return fits
                        .filter(
                          (fit: any) => fit.id && fit.name && fit.name !== ""
                        )
                        .map((fit: any) => (
                          <SelectItem key={fit.id} value={fit.name}>
                            {fit.name || "Unknown"}
                          </SelectItem>
                        ));
                    })()}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Varyantlar */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Renk Seçimi</Label>
                <span className="text-sm text-muted-foreground">
                  {formData.colors.length} renk seçildi
                </span>
              </div>
              <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {colorsData?.libraryItems?.map((color) => {
                  const colorData = color.data
                    ? JSON.parse(color.data as string)
                    : {};
                  const isSelected = formData.colors.includes(color.name || "");

                  return (
                    <div
                      key={color.id}
                      onClick={() => toggleColor(color.name || "")}
                      className="relative group cursor-pointer"
                      title={`${color.name} (${colorData.hex || "N/A"})`}
                    >
                      <div
                        className={`
                          w-full aspect-square rounded-lg border-3 transition-all
                          ${
                            isSelected
                              ? "border-primary shadow-lg scale-110 ring-2 ring-primary ring-offset-2"
                              : "border-gray-300 hover:border-gray-400 hover:scale-105"
                          }
                        `}
                        style={{
                          backgroundColor: colorData.hex || "#ccc",
                        }}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                              <svg
                                className="w-4 h-4 text-primary"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-center truncate text-gray-700 group-hover:text-gray-900">
                        {color.name}
                      </div>
                    </div>
                  );
                })}
              </div>
              {formData.colors.length === 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  💡 En az bir renk seçmeniz önerilir
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Beden Aralığı</Label>
              <Select
                value={formData.sizeRange}
                onValueChange={(value) => handleInputChange("sizeRange", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Beden aralığı seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    if (sizeGroupsLoading) {
                      return (
                        <div className="p-2 text-sm text-muted-foreground">
                          Yükleniyor...
                        </div>
                      );
                    }

                    if (sizeGroupsError) {
                      return (
                        <div className="p-2 text-sm text-red-500">
                          Hata: {sizeGroupsError.message}
                        </div>
                      );
                    }

                    const sizeGroups = sizeGroupsData?.libraryItems || [];
                    console.log("🔍 Size Groups Data:", sizeGroupsData);
                    console.log("🔍 Size Groups Array:", sizeGroups);
                    console.log(
                      "🔍 Size Groups Details:",
                      sizeGroups.map((sg) => ({
                        id: sg.id,
                        name: sg.name,
                        data: sg.data,
                        nameType: typeof sg.name,
                        isEmpty: sg.name === "",
                        isNull: sg.name === null,
                        isUndefined: sg.name === undefined,
                      }))
                    );

                    if (sizeGroups.length === 0) {
                      return (
                        <div className="p-2 text-sm text-muted-foreground">
                          Beden grubu bulunamadı
                        </div>
                      );
                    }

                    const filteredSizeGroups = sizeGroups.filter(
                      (sizeGroup: any) => {
                        const hasId = sizeGroup.id;
                        const hasName = sizeGroup.name && sizeGroup.name !== "";
                        const sizesText = getSizesFromSizeGroup(sizeGroup);
                        const hasSizes = sizesText && sizesText.trim() !== "";
                        console.log(
                          `🔍 Size Group ${sizeGroup.id}: hasId=${hasId}, hasName=${hasName}, name="${sizeGroup.name}", sizesText="${sizesText}", hasSizes=${hasSizes}`
                        );
                        // ID varsa ve ya name var ya da data'dan sizes çıkarılabiliyorsa kabul et
                        return hasId && (hasName || hasSizes);
                      }
                    );

                    console.log(
                      "🔍 Filtered Size Groups Count:",
                      filteredSizeGroups.length
                    );

                    return filteredSizeGroups.map((sizeGroup: any) => {
                      const sizesText = getSizesFromSizeGroup(sizeGroup);
                      // Value olarak gerçek size'ları kullan, yoksa sizeGroup.name kullan
                      const valueToUse =
                        sizesText && sizesText !== sizeGroup.name
                          ? sizesText
                          : sizeGroup.name;
                      // Görüntülenecek başlık: name varsa name, yoksa sizesText
                      const displayTitle =
                        sizeGroup.name && sizeGroup.name.trim() !== ""
                          ? sizeGroup.name
                          : sizesText;

                      return (
                        <SelectItem key={sizeGroup.id} value={valueToUse}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-sm">
                              {displayTitle}
                            </span>
                            {sizesText && sizesText !== displayTitle && (
                              <span className="text-xs text-muted-foreground">
                                {sizesText}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    });
                  })()}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <FormFileUpload
                value={formData.measurementChart}
                onChange={(url) => handleInputChange("measurementChart", url)}
                onDelete={() => handleInputChange("measurementChart", "")}
                label="Ölçü Tablosu (PDF)"
                description="Koleksiyon ölçü tablosunu yükleyin"
                accept=".pdf"
                fileType="pdf"
                uploadType="collections"
                maxSize={10}
                recommended="PDF formatında önerilir"
              />
            </div>
          </div>
        )}

        {/* Step 3: Teknik Detaylar */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Kumaş Seçimi</Label>
                <span className="text-sm text-muted-foreground">
                  {formData.fabrics.length} kumaş seçildi
                </span>
              </div>
              <Input
                type="text"
                placeholder="🔍 Kumaş ara... (isim, kod, kompozisyon)"
                value={fabricSearch}
                onChange={(e) => setFabricSearch(e.target.value)}
                className="mb-2"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                {fabricsData?.libraryItems?.filter((fabric) => {
                  if (!fabricSearch.trim()) return true;
                  const search = fabricSearch.toLowerCase();
                  const fabricData = fabric.data
                    ? JSON.parse(fabric.data as string)
                    : {};
                  return (
                    fabric.name?.toLowerCase().includes(search) ||
                    fabric.code?.toLowerCase().includes(search) ||
                    fabricData.composition?.toLowerCase().includes(search)
                  );
                }).length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <p className="text-sm">
                      &quot;{fabricSearch}&quot; için sonuç bulunamadı
                    </p>
                  </div>
                ) : (
                  fabricsData?.libraryItems
                    ?.filter((fabric) => {
                      if (!fabricSearch.trim()) return true;
                      const search = fabricSearch.toLowerCase();
                      const fabricData = fabric.data
                        ? JSON.parse(fabric.data as string)
                        : {};
                      return (
                        fabric.name?.toLowerCase().includes(search) ||
                        fabric.code?.toLowerCase().includes(search) ||
                        fabricData.composition?.toLowerCase().includes(search)
                      );
                    })
                    .map((fabric) => {
                      const fabricData = fabric.data
                        ? JSON.parse(fabric.data as string)
                        : {};
                      const isSelected = formData.fabrics.some((f) =>
                        typeof f === "string"
                          ? f === fabric.name
                          : f.name === fabric.name
                      );

                      return (
                        <div
                          key={fabric.id}
                          onClick={() =>
                            toggleFabric(fabric.name || "", {
                              name: fabric.name || "",
                              composition: fabricData.composition,
                              certifications: fabric.certifications || [],
                            })
                          }
                          className={`
                        relative cursor-pointer rounded-lg border-2 p-3 transition-all
                        ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }
                      `}
                        >
                          <div className="flex items-start gap-3">
                            {fabric.imageUrl && (
                              <NextImage
                                width={48}
                                height={48}
                                src={fabric.imageUrl}
                                alt={fabric.name || ""}
                                className="w-12 h-12 rounded object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">
                                {fabric.name}
                              </div>
                              {fabric.code && (
                                <div className="text-xs text-muted-foreground">
                                  {fabric.code}
                                </div>
                              )}
                              {fabricData.composition && (
                                <div className="text-xs text-gray-600 mt-1">
                                  {fabricData.composition}
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
              {formData.fabrics.length === 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  💡 En az bir kumaş seçmeniz önerilir
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Aksesuar Seçimi</Label>
                <span className="text-sm text-muted-foreground">
                  {formData.accessories.length} aksesuar seçildi
                </span>
              </div>
              <Input
                type="text"
                placeholder="🔍 Aksesuar ara... (isim, kod, tip)"
                value={accessorySearch}
                onChange={(e) => setAccessorySearch(e.target.value)}
                className="mb-2"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                {accessoriesData?.libraryItems?.filter((accessory) => {
                  if (!accessorySearch.trim()) return true;
                  const search = accessorySearch.toLowerCase();
                  const accessoryData = accessory.data
                    ? JSON.parse(accessory.data as string)
                    : {};
                  return (
                    accessory.name?.toLowerCase().includes(search) ||
                    accessory.code?.toLowerCase().includes(search) ||
                    accessoryData.type?.toLowerCase().includes(search)
                  );
                }).length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <p className="text-sm">
                      &quot;{accessorySearch}&quot; için sonuç bulunamadı
                    </p>
                  </div>
                ) : (
                  accessoriesData?.libraryItems
                    ?.filter((accessory) => {
                      if (!accessorySearch.trim()) return true;
                      const search = accessorySearch.toLowerCase();
                      const accessoryData = accessory.data
                        ? JSON.parse(accessory.data as string)
                        : {};
                      return (
                        accessory.name?.toLowerCase().includes(search) ||
                        accessory.code?.toLowerCase().includes(search) ||
                        accessoryData.type?.toLowerCase().includes(search)
                      );
                    })
                    .map((accessory) => {
                      const accessoryData = accessory.data
                        ? JSON.parse(accessory.data as string)
                        : {};
                      const isSelected = formData.accessories.some((a) =>
                        typeof a === "string"
                          ? a === accessory.name
                          : a.name === accessory.name
                      );

                      return (
                        <div
                          key={accessory.id}
                          onClick={() =>
                            toggleAccessory(accessory.name || "", {
                              name: accessory.name || "",
                              certifications: accessory.certifications || [],
                            })
                          }
                          className={`
                        relative cursor-pointer rounded-lg border-2 p-3 transition-all
                        ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }
                      `}
                        >
                          <div className="flex items-start gap-3">
                            {accessory.imageUrl && (
                              <NextImage
                                width={48}
                                height={48}
                                src={accessory.imageUrl}
                                alt={accessory.name || ""}
                                className="w-12 h-12 rounded object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">
                                {accessory.name}
                              </div>
                              {accessory.code && (
                                <div className="text-xs text-muted-foreground">
                                  {accessory.code}
                                </div>
                              )}
                              {accessoryData.type && (
                                <div className="text-xs text-gray-600 mt-1">
                                  {accessoryData.type}
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
              {formData.accessories.length === 0 && (
                <p className="text-sm text-muted-foreground italic p-3 bg-gray-50 rounded-lg">
                  İsteğe bağlı: Aksesuar seçimi yapabilirsiniz
                </p>
              )}
            </div>

            {/* Ek Görseller (İsteğe Bağlı) */}
            <div className="space-y-2">
              <Label>Ek Görseller (İsteğe Bağlı)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Ana görsel 1. adımda yüklendi. Buradan ek görseller
                ekleyebilirsiniz.
              </p>
              <FormImageUpload
                value={formData.images[1] || ""}
                onChange={(url) => {
                  if (url) {
                    const newImages = [...formData.images];
                    if (newImages.length < 2) {
                      newImages.push(url);
                    } else {
                      newImages[1] = url;
                    }
                    handleInputChange("images", newImages);
                  }
                }}
                onDelete={() => {
                  const newImages = [...formData.images];
                  if (newImages.length > 1) {
                    newImages.splice(1, 1);
                    handleInputChange("images", newImages);
                  }
                }}
                label="2. Görsel"
                description="İkinci koleksiyon görseli"
                uploadType="collections"
                recommended="En az 800x800px, maksimum 5MB"
              />
              {formData.images.length > 2 && (
                <div className="text-sm text-gray-600">
                  +{formData.images.length - 2} görsel daha var
                </div>
              )}
            </div>

            <div className="space-y-2">
              <FormFileUpload
                value={formData.techPack}
                onChange={(url) => handleInputChange("techPack", url)}
                onDelete={() => handleInputChange("techPack", "")}
                label="Tech Pack (PDF)"
                description="Koleksiyon teknik paketini yükleyin"
                accept=".pdf"
                fileType="pdf"
                uploadType="collections"
                maxSize={10}
                recommended="PDF formatında önerilir"
              />
            </div>
          </div>
        )}

        {/* Step 4: Ticari Bilgiler ve Özet */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Ticari Bilgiler */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ticari Bilgiler</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moq">Minimum Sipariş Adedi (MOQ)</Label>
                  <Input
                    id="moq"
                    type="number"
                    value={formData.moq || ""}
                    onChange={(e) =>
                      handleInputChange("moq", parseInt(e.target.value) || 0)
                    }
                    placeholder="örn: 500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadlineDays">Üretim Süresi (Gün)</Label>
                  <Input
                    id="deadlineDays"
                    type="number"
                    value={formData.deadlineDays || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "deadlineDays",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="örn: 30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Üretim + Teslimat süresi
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Fiyat</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="örn: 25.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Para Birimi</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Para birimi seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="TRY">TRY (₺)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CNY">CNY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Koleksiyon hakkında özel notlar, gereksinimler, detaylar..."
                  rows={4}
                />
              </div>
            </div>

            {/* Koleksiyon Özeti */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Koleksiyon Özeti</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">
                    Koleksiyon Adı
                  </span>
                  <span className="text-gray-900">{formData.name || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">Kategori</span>
                  <span className="text-gray-900">
                    {formData.categoryPath
                      ? formData.categoryPath.replace(/-/g, " > ")
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">Sezon</span>
                  <span className="text-gray-900">
                    {formData.season || "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">Fit</span>
                  <span className="text-gray-900">{formData.fit || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">Trend</span>
                  <span className="text-gray-900">{formData.trend || "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">Renkler</span>
                  <span className="text-gray-900">
                    {formData.colors.length > 0
                      ? formData.colors.join(", ")
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">
                    Beden Aralığı
                  </span>
                  <span className="text-gray-900">
                    {formData.sizeRange || "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">Kumaşlar</span>
                  <span className="text-gray-900">
                    {formData.fabrics.length > 0
                      ? formData.fabrics
                          .map((f) => {
                            if (typeof f === "string") {
                              return f;
                            }
                            return f.composition
                              ? `${f.name} (${f.composition})`
                              : f.name;
                          })
                          .join(", ")
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">
                    Aksesuarlar
                  </span>
                  <span className="text-gray-900">
                    {formData.accessories.length > 0
                      ? formData.accessories
                          .map((a) => {
                            if (typeof a === "string") {
                              return a;
                            }
                            return a.name;
                          })
                          .join(", ")
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">Görseller</span>
                  <span className="text-gray-900">
                    {formData.images.length > 0
                      ? `${formData.images.length} görsel`
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">
                    Minimum Sipariş
                  </span>
                  <span className="text-gray-900">
                    {formData.moq > 0 ? `${formData.moq} adet` : "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">
                    Üretim Süresi
                  </span>
                  <span className="text-gray-900">
                    {formData.deadlineDays > 0
                      ? `${formData.deadlineDays} gün`
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">Fiyat</span>
                  <span className="text-gray-900">
                    {formData.price > 0
                      ? `${formData.price} ${formData.currency}`
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">
                    Dökümanlar
                  </span>
                  <span className="text-gray-900">
                    {[
                      formData.measurementChart && "Ölçü Tablosu",
                      formData.techPack && "Tech Pack",
                    ]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>

          <div className="text-sm text-muted-foreground">
            Adım {currentStep} / {STEPS.length}
          </div>

          {currentStep < STEPS.length ? (
            <Button onClick={nextStep} disabled={!canGoNext()}>
              İleri
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canGoNext()}>
              {isEditMode ? "Update Collection" : "Koleksiyon Oluştur"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
