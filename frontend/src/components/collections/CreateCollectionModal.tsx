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
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

// 4 Adımlı Collection Form Data
interface CollectionFormData {
  // ADIM 1: Temel Bilgiler
  name: string;
  description: string;
  modelCode: string;
  trend: string;
  categoryPath: string; // "WOMEN-ÜSTGIYIM-GÖMLEK" formatında
  season: string;
  fit: string;

  // ADIM 2: Varyantlar ve Ölçüler
  colors: string[];
  sizeRange: string;
  measurementChart: string;

  // ADIM 3: Teknik Detaylar
  fabrics: string[]; // Library'den seçilen kumaşlar
  accessories: string[]; // Library'den seçilen aksesuarlar
  images: string[];
  techPack: string;

  // ADIM 4: Ticari Bilgiler
  moq: number;
  targetPrice: number;
  currency: string;
  leadTime: number; // Termin süresi (gün olarak)
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
}

export function CreateCollectionModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateCollectionModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [, createCollection] = useMutation(CollectionsCreateDocument);
  const [fabricSearch, setFabricSearch] = useState("");
  const [accessorySearch, setAccessorySearch] = useState("");

  // Library Data Queries
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

  const [{ data: sizeGroupsData }] = useQuery({
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

  const [formData, setFormData] = useState<CollectionFormData>({
    name: "",
    description: "",
    modelCode: "",
    trend: "",
    categoryPath: "",
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
    targetPrice: 0,
    currency: "USD",
    leadTime: 30,
    notes: "",
  });

  const handleInputChange = (field: keyof CollectionFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Color Management
  const toggleColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  // Fabric Management
  const toggleFabric = (fabric: string) => {
    setFormData((prev) => ({
      ...prev,
      fabrics: prev.fabrics.includes(fabric)
        ? prev.fabrics.filter((f) => f !== fabric)
        : [...prev.fabrics, fabric],
    }));
  };

  // Accessory Management
  const toggleAccessory = (accessory: string) => {
    setFormData((prev) => ({
      ...prev,
      accessories: prev.accessories.includes(accessory)
        ? prev.accessories.filter((a) => a !== accessory)
        : [...prev.accessories, accessory],
    }));
  };

  const handleSubmit = async () => {
    try {
      // Model code otomatik oluştur eğer yoksa
      const finalModelCode = formData.modelCode || `MODEL-${Date.now()}`;

      const result = await createCollection({
        name: formData.name,
        description: formData.description || null,
        modelCode: finalModelCode,
        season: formData.season || null,
        gender: formData.categoryPath
          ? (formData.categoryPath.split("-")[0] as
              | "WOMEN"
              | "MEN"
              | "GIRLS"
              | "BOYS"
              | "UNISEX")
          : null,
        fit: formData.fit || null,
        trend: formData.trend || null,
        colors:
          formData.colors.length > 0 ? JSON.stringify(formData.colors) : null,
        sizeRange: formData.sizeRange || null,
        fabricComposition:
          formData.fabrics.length > 0 ? JSON.stringify(formData.fabrics) : null,
        accessories:
          formData.accessories.length > 0
            ? JSON.stringify(formData.accessories)
            : null,
        images:
          formData.images.length > 0 ? JSON.stringify(formData.images) : null,
        moq: formData.moq || null,
        targetPrice: formData.targetPrice || null,
        currency: formData.currency || null,
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
        targetPrice: 0,
        currency: "USD",
        leadTime: 30,
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
          <DialogTitle>Create New Collection</DialogTitle>
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
              />
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

            <div className="space-y-2">
              <Label>Klasman Seçimi</Label>
              <Select
                value={formData.categoryPath}
                onValueChange={(value) =>
                  handleInputChange("categoryPath", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçiniz (Örn: Kadın > Üst Giyim > Gömlek)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WOMEN-ÜSTGIYIM-GÖMLEK">
                    Kadın {`>`} Üst Giyim {`>`} Gömlek
                  </SelectItem>
                  <SelectItem value="WOMEN-ALTGIYIM-PANTOLON">
                    Kadın {`>`} Alt Giyim {`>`} Pantolon
                  </SelectItem>
                  <SelectItem value="MEN-ÜSTGIYIM-GÖMLEK">
                    Erkek {`>`} Üst Giyim {`>`} Gömlek
                  </SelectItem>
                  <SelectItem value="MEN-ALTGIYIM-PANTOLON">
                    Erkek {`>`} Alt Giyim {`>`} Pantolon
                  </SelectItem>
                </SelectContent>
              </Select>
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
                    {seasonsData?.libraryItems?.map((season) => (
                      <SelectItem key={season.id} value={season.name || ""}>
                        {season.name || "Unknown"}
                      </SelectItem>
                    ))}
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
                    {fitsData?.libraryItems?.map((fit) => (
                      <SelectItem key={fit.id} value={fit.name || ""}>
                        {fit.name || "Unknown"}
                      </SelectItem>
                    ))}
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
                  {sizeGroupsData?.libraryItems?.map((sizeGroup) => (
                    <SelectItem key={sizeGroup.id} value={sizeGroup.name || ""}>
                      {sizeGroup.name}
                    </SelectItem>
                  ))}
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
                      "{fabricSearch}" için sonuç bulunamadı
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
                      const isSelected = formData.fabrics.includes(
                        fabric.name || ""
                      );

                      return (
                        <div
                          key={fabric.id}
                          onClick={() => toggleFabric(fabric.name || "")}
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
                              <img
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
                      "{accessorySearch}" için sonuç bulunamadı
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
                      const isSelected = formData.accessories.includes(
                        accessory.name || ""
                      );

                      return (
                        <div
                          key={accessory.id}
                          onClick={() => toggleAccessory(accessory.name || "")}
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
                              <img
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
                label="Koleksiyon Görselleri"
                description="Koleksiyon görsellerini yükleyin"
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
                  <Label htmlFor="leadTime">Termin Süresi (Gün)</Label>
                  <Input
                    id="leadTime"
                    type="number"
                    value={formData.leadTime || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "leadTime",
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
                  <Label htmlFor="targetPrice">Hedef Fiyat</Label>
                  <Input
                    id="targetPrice"
                    type="number"
                    step="0.01"
                    value={formData.targetPrice || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "targetPrice",
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
                      ? formData.fabrics.join(", ")
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">
                    Aksesuarlar
                  </span>
                  <span className="text-gray-900">
                    {formData.accessories.length > 0
                      ? formData.accessories.join(", ")
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
                    Termin Süresi
                  </span>
                  <span className="text-gray-900">
                    {formData.leadTime > 0 ? `${formData.leadTime} gün` : "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">
                    Hedef Fiyat
                  </span>
                  <span className="text-gray-900">
                    {formData.targetPrice > 0
                      ? `${formData.targetPrice} ${formData.currency}`
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
              Koleksiyon Oluştur
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
