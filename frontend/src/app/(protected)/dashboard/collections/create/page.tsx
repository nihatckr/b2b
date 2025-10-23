"use client";
import {
  CollectionsCreateDocument,
  DashboardLibraryItemsDocument,
  FileUploadSingleDocument,
} from "@/__generated__/graphql";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  fabricComposition: string;
  accessories: string[];
  images: string[];
  techPack: string;

  // ADIM 4: Ticari Bilgiler
  moq: number;
  targetPrice: number;
  currency: string;
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
  { id: 4, title: "Ticari Bilgiler", description: "MOQ, fiyat, notlar" },
];

export default function CreateCollectionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [, createCollection] = useMutation(CollectionsCreateDocument);
  const [, uploadFile] = useMutation(FileUploadSingleDocument);

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

  const [{ data: materialsData }] = useQuery({
    query: DashboardLibraryItemsDocument,
    variables: { filter: { category: "MATERIAL" } },
  });

  const [formData, setFormData] = useState<CollectionFormData>({
    // ADIM 1
    name: "",
    description: "",
    modelCode: "", // Otomatik oluşturulacak
    trend: "",
    categoryPath: "",
    season: "",
    fit: "",

    // ADIM 2
    colors: [],
    sizeRange: "",
    measurementChart: "",

    // ADIM 3
    fabricComposition: "",
    accessories: [],
    images: [],
    techPack: "",

    // ADIM 4
    moq: 0,
    targetPrice: 0,
    currency: "USD",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Model Code Generator
  const generateModelCode = () => {
    const timestamp = Date.now();
    const code = `MODEL-${timestamp}`;
    setFormData((prev) => ({ ...prev, modelCode: code }));
  };

  // Form Validation by Step (without setting errors)
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.name.trim() &&
          formData.categoryPath &&
          formData.season &&
          formData.fit
        );
      case 2:
        return formData.colors.length > 0 && !!formData.sizeRange;
      case 3:
        return !!formData.fabricComposition && formData.images.length > 0;
      case 4:
        return formData.moq > 0 && formData.targetPrice > 0;
      default:
        return false;
    }
  };

  // Form Validation with Error Setting
  const validateStepWithErrors = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Koleksiyon adı gerekli";
        if (!formData.categoryPath)
          newErrors.categoryPath = "Klasman seçimi gerekli";
        if (!formData.season) newErrors.season = "Sezon seçimi gerekli";
        if (!formData.fit) newErrors.fit = "Fit seçimi gerekli";
        break;
      case 2:
        if (formData.colors.length === 0)
          newErrors.colors = "En az bir renk seçmelisiniz";
        if (!formData.sizeRange)
          newErrors.sizeRange = "Beden aralığı seçimi gerekli";
        break;
      case 3:
        if (!formData.fabricComposition)
          newErrors.fabricComposition = "Kumaş seçimi gerekli";
        if (formData.images.length === 0)
          newErrors.images = "En az bir görsel eklemelisiniz";
        break;
      case 4:
        if (formData.moq <= 0) newErrors.moq = "MOQ 0'dan büyük olmalı";
        if (formData.targetPrice <= 0)
          newErrors.targetPrice = "Fiyat 0'dan büyük olmalı";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const nextStep = () => {
    if (validateStepWithErrors(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const canGoNext = () => {
    return validateStep(currentStep);
  };

  // Submit Form
  const handleSubmit = async () => {
    if (!validateStepWithErrors(4)) return;

    setIsSubmitting(true);
    try {
      // Model code otomatik oluştur
      if (!formData.modelCode) {
        generateModelCode();
      }

      const result = await createCollection({
        name: formData.name,
        description: formData.description || null,
        season: formData.season || null,
        gender: formData.categoryPath.split("-")[0] as
          | "WOMEN"
          | "MEN"
          | "GIRLS"
          | "BOYS"
          | "UNISEX", // İlk kısım gender
        fit: formData.fit || null,
        images:
          formData.images.length > 0 ? JSON.stringify(formData.images) : null,
        currency: formData.currency || null,
      });

      if (result.error) {
        toast.error(`Collection oluşturulamadı: ${result.error.message}`);
        return;
      }

      toast.success("Collection başarıyla oluşturuldu!");
      router.push("/dashboard/collections");
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Beklenmeyen bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // File Upload Management
  const [isUploading, setIsUploading] = useState(false);
  const [isPdfUploading, setIsPdfUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya boyutu 5MB'dan küçük olmalıdır");
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith("image/")) {
      toast.error("Sadece resim dosyaları yüklenebilir");
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadFile({
        file,
        category: "collections",
        description: "Collection image",
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Backend JSON response'unu direkt kullan
      const uploadData = result.data?.singleUpload;

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, uploadData.url || uploadData.path],
      }));

      toast.success("Görsel başarıyla yüklendi");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Görsel yüklenirken hata oluştu");
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // PDF Upload Handler
  const handlePdfUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "measurementChart" | "techPack"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya tipi kontrolü
    if (file.type !== "application/pdf") {
      toast.error("Sadece PDF dosyaları yüklenebilir");
      return;
    }

    // Dosya boyutu kontrolü (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır");
      return;
    }

    setIsPdfUploading(true);

    try {
      const result = await uploadFile({
        file,
        category: "documents",
        description: `Collection ${fieldName}`,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Backend JSON response'unu direkt kullan
      const uploadData = result.data?.singleUpload;

      setFormData((prev) => ({
        ...prev,
        [fieldName]: uploadData.url || uploadData.path,
      }));

      toast.success("PDF başarıyla yüklendi");
    } catch (error) {
      console.error("PDF upload error:", error);
      toast.error("PDF yüklenirken hata oluştu");
    } finally {
      setIsPdfUploading(false);
      // Reset file input
      e.target.value = "";
    }
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

  // Accessory Management
  const toggleAccessory = (accessory: string) => {
    setFormData((prev) => ({
      ...prev,
      accessories: prev.accessories.includes(accessory)
        ? prev.accessories.filter((a) => a !== accessory)
        : [...prev.accessories, accessory],
    }));
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard/collections">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Koleksiyonlara Dön
            </Link>
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold  mb-2">
              Yeni Koleksiyon Oluştur
            </h1>
            <p className=" ">{STEPS[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  step.id < STEPS.length ? "flex-1" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.id}
                </div>
                <div className="ml-3 hidden md:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {step.id < STEPS.length && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 4) * 100} className="w-full" />
        </div>

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ADIM 1: Temel Bilgiler */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Koleksiyon Adı *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Örn: Sonbahar Klasikleri"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="modelCode">Model Kodu</Label>
                    <div className="flex gap-2">
                      <Input
                        id="modelCode"
                        value={formData.modelCode}
                        readOnly
                        placeholder="Otomatik oluşturulacak"
                        className="bg-gray-50"
                      />
                      <Button
                        type="button"
                        onClick={generateModelCode}
                        variant="outline"
                      >
                        Oluştur
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Koleksiyon hakkında açıklama..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="trend">Trend *</Label>
                  <Input
                    id="trend"
                    value={formData.trend}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        trend: e.target.value,
                      }))
                    }
                    placeholder="Örn: Minimalist, Vintage, Sport Chic"
                  />
                </div>

                <div>
                  <Label>Klasman Seçimi *</Label>
                  <Select
                    value={formData.categoryPath}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, categoryPath: value }))
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
                  {errors.categoryPath && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.categoryPath}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Sezon *</Label>
                    <Select
                      value={formData.season}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, season: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sezon seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {seasonsData?.libraryItems?.map((season) => (
                          <SelectItem key={season.id} value={season.name || ""}>
                            {season.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.season && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.season}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Fit *</Label>
                    <Select
                      value={formData.fit}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, fit: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Fit seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {fitsData?.libraryItems?.map((fit) => (
                          <SelectItem key={fit.id} value={fit.name || ""}>
                            {fit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.fit && (
                      <p className="text-sm text-red-500 mt-1">{errors.fit}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ADIM 2: Varyantlar ve Ölçüler */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label>Renk Seçimi *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {colorsData?.libraryItems?.map((color) => (
                      <div
                        key={color.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`color-${color.id}`}
                          checked={formData.colors.includes(color.name || "")}
                          onCheckedChange={() => toggleColor(color.name || "")}
                        />
                        <Label
                          htmlFor={`color-${color.id}`}
                          className="text-sm"
                        >
                          {color.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.colors && (
                    <p className="text-sm text-red-500 mt-1">{errors.colors}</p>
                  )}
                </div>

                <div>
                  <Label>Beden Aralığı *</Label>
                  <Select
                    value={formData.sizeRange}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, sizeRange: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Beden aralığı seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeGroupsData?.libraryItems?.map((sizeGroup) => (
                        <SelectItem
                          key={sizeGroup.id}
                          value={sizeGroup.name || ""}
                        >
                          {sizeGroup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.sizeRange && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.sizeRange}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="measurementChart">Ölçü Tablosu (PDF)</Label>
                  <div className="space-y-2">
                    <Input
                      id="measurementChart"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handlePdfUpload(e, "measurementChart")}
                      disabled={isPdfUploading}
                      className="file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    {formData.measurementChart && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <span>✓ Yüklendi:</span>
                        <span className="truncate">
                          {formData.measurementChart.split("/").pop()}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      PDF formatında maksimum 10MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ADIM 3: Teknik Detaylar */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label>Kumaş *</Label>
                  <Select
                    value={formData.fabricComposition}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        fabricComposition: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kumaş seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {fabricsData?.libraryItems?.map((fabric) => (
                        <SelectItem key={fabric.id} value={fabric.name || ""}>
                          {fabric.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.fabricComposition && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.fabricComposition}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Aksesuar Seçimi</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {materialsData?.libraryItems?.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`accessory-${material.id}`}
                          checked={formData.accessories.includes(
                            material.name || ""
                          )}
                          onCheckedChange={() =>
                            toggleAccessory(material.name || "")
                          }
                        />
                        <Label
                          htmlFor={`accessory-${material.id}`}
                          className="text-sm"
                        >
                          {material.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Görseller *</Label>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading}
                      >
                        {isUploading ? "Yükleniyor..." : "Görsel Seç"}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      JPG, PNG, GIF formatında maksimum 5MB
                    </p>

                    {formData.images.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Yüklenen Görseller ({formData.images.length})
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {formData.images.map((url, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                                <NextImage
                                  width={100}
                                  height={100}
                                  src={
                                    url.startsWith("/")
                                      ? `http://localhost:4001${url}`
                                      : url
                                  }
                                  alt={`Collection image ${index + 1}`}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                                  onLoad={() => {
                                    console.log(
                                      "✅ Image loaded successfully:",
                                      url
                                    );
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    console.error(
                                      "❌ Image failed to load:",
                                      url
                                    );
                                    console.error("❌ Full URL:", target.src);
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
                              {index === 0 && (
                                <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                  Ana Görsel
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.images && (
                    <p className="text-sm text-red-500 mt-1">{errors.images}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="techPack">Tech Pack (PDF)</Label>
                  <div className="space-y-2">
                    <Input
                      id="techPack"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handlePdfUpload(e, "techPack")}
                      disabled={isPdfUploading}
                      className="file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    {formData.techPack && (
                      <div className="flex items-center gap-2 text-sm text-purple-600">
                        <span>✓ Yüklendi:</span>
                        <span className="truncate">
                          {formData.techPack.split("/").pop()}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      PDF formatında maksimum 10MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ADIM 4: Ticari Bilgiler */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="moq">MOQ (Minimum Sipariş Miktarı) *</Label>
                    <Input
                      id="moq"
                      type="number"
                      min="1"
                      value={formData.moq || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          moq: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="Örn: 500"
                    />
                    {errors.moq && (
                      <p className="text-sm text-red-500 mt-1">{errors.moq}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="targetPrice">Hedef Fiyat *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="targetPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.targetPrice || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            targetPrice: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="Örn: 25.50"
                        className="flex-1"
                      />
                      <Select
                        value={formData.currency}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, currency: value }))
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="TRY">TRY</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CNY">CNY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.targetPrice && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.targetPrice}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notlar</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Ek notlar, özel talepler veya açıklamalar..."
                    rows={4}
                  />
                </div>

                {/* Özet */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Koleksiyon Özeti
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Koleksiyon:</strong> {formData.name}
                    </div>
                    <div>
                      <strong>Model Kodu:</strong> {formData.modelCode}
                    </div>
                    <div>
                      <strong>Kategori:</strong>{" "}
                      {formData.categoryPath.replace(/-/g, " > ")}
                    </div>
                    <div>
                      <strong>Sezon:</strong> {formData.season}
                    </div>
                    <div>
                      <strong>Fit:</strong> {formData.fit}
                    </div>
                    <div>
                      <strong>Renkler:</strong> {formData.colors.join(", ")}
                    </div>
                    <div>
                      <strong>MOQ:</strong> {formData.moq}
                    </div>
                    <div>
                      <strong>Hedef Fiyat:</strong> {formData.targetPrice}{" "}
                      {formData.currency}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Önceki
          </Button>

          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button type="button" onClick={nextStep} disabled={!canGoNext()}>
                Sonraki
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !canGoNext()}
              >
                {isSubmitting ? "Oluşturuluyor..." : "Koleksiyonu Oluştur"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
