"use client";

import { DashboardPlatformStandardsDocument } from "@/__generated__/graphql";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  CertificationSchema,
  ColorSchema,
  FabricSchema,
  FitSchema,
  MaterialSchema,
  SeasonSchema,
  SizeGroupSchema,
} from "@/lib/zod-schema";
import { GENDERS } from "@/utils/library-constants";
import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useQuery } from "urql";
import { FormFileUpload, FormImageUpload } from "../forms";

interface CreateLibraryItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category:
    | "FABRIC"
    | "COLOR"
    | "SIZE_GROUP"
    | "FIT"
    | "MATERIAL"
    | "CERTIFICATION"
    | "SEASON";
  scope: "PLATFORM_STANDARD" | "COMPANY_CUSTOM";
  onSubmit: (data: LibraryItemFormData) => Promise<void>;
  initialData?: Partial<LibraryItemFormData>; // For edit mode
  isEditMode?: boolean; // To distinguish between create and edit
}

export interface LibraryItemFormData {
  code: string;
  name: string;
  description: string;
  data: Record<string, unknown>;
  imageFile?: File;
  imageUrl?: string; // 🖼️ Existing image URL (for edit mode)
  iconValue?: string; // 🎨 Custom icon URL (for certification icons)
  certificationIds?: number[]; // 🔗 Certification IDs
  tags?: string; // 🏷️ JSON stringified tags for certification categories
}

// Certification name dictionary
const CERTIFICATION_NAMES: Record<string, string> = {
  GOTS: "Global Organic Textile Standard",
  "OEKO-TEX": "OEKO-TEX Standard 100",
  "FAIR TRADE": "Fair Trade Certified",
  GRS: "Global Recycled Standard",
  BCI: "Better Cotton Initiative",
  OCS: "Organic Content Standard",
  FSC: "Forest Stewardship Council",
  BSCI: "Business Social Compliance Initiative",
  WRAP: "Worldwide Responsible Accredited Production",
  SA8000: "Social Accountability 8000",
  BLUESIGN: "Bluesign System",
  CRADLE: "Cradle to Cradle Certified",
};

// Helper: Auto-generate certification code
const autoGenerateCertCode = (issuer: string, validUntil: string): string => {
  const cleanIssuer = issuer.trim().split(" ")[0].toUpperCase();
  const year = validUntil
    ? new Date(validUntil).getFullYear()
    : new Date().getFullYear();
  return `${cleanIssuer}-${year}`;
};

// Helper: Auto-generate certification name
const autoGenerateCertName = (issuer: string): string => {
  const key = issuer.toUpperCase().trim();
  return CERTIFICATION_NAMES[key] || `${issuer} Certification`;
};

// Helper: Auto-generate renewal date (60 days before expiry)
const autoGenerateRenewalDate = (validUntil: string): string | null => {
  if (!validUntil) return null;
  const expiryDate = new Date(validUntil);
  const renewalDate = new Date(expiryDate);
  renewalDate.setDate(renewalDate.getDate() - 60);
  return renewalDate.toISOString().split("T")[0];
};

// Helper: Auto-generate certification status
const autoGenerateCertStatus = (
  validUntil: string,
  renewalDate: string | null
): string => {
  if (!validUntil) return "ACTIVE"; // No expiry = always active
  const now = new Date();
  const expiry = new Date(validUntil);
  if (now > expiry) return "EXPIRED";
  if (renewalDate && now > new Date(renewalDate)) return "PENDING_RENEWAL";
  return "ACTIVE";
};

// Helper: Auto-generate size group code
const autoGenerateSizeGroupCode = (
  regionalStandard: string,
  targetGender: string,
  sizeCategory: string,
  sizeSystemType: string
): string => {
  const region = regionalStandard.toUpperCase();
  const gender =
    targetGender === "UNISEX"
      ? "UNI"
      : targetGender.substring(0, 3).toUpperCase();
  const category =
    sizeCategory === "TOP"
      ? "T"
      : sizeCategory === "BOTTOM"
      ? "B"
      : sizeCategory === "OUTERWEAR"
      ? "O"
      : sizeCategory === "DRESS"
      ? "D"
      : sizeCategory === "KIDS"
      ? "K"
      : "G";
  const system =
    sizeSystemType === "ALPHA"
      ? "A"
      : sizeSystemType === "NUMERIC"
      ? "N"
      : sizeSystemType === "INCHES"
      ? "I"
      : "C";

  return `SG-${region}-${gender}-${category}-${system}`;
};

// Helper: Auto-generate size group name
const autoGenerateSizeGroupName = (
  regionalStandard: string,
  targetGender: string,
  sizeCategory: string,
  sizeSystemType: string
): string => {
  const regionMap: Record<string, string> = {
    EU: "European",
    US: "US",
    UK: "UK",
    JP: "Japanese",
    CN: "Chinese",
    KR: "Korean",
    TR: "Turkish",
  };

  const genderMap: Record<string, string> = {
    MEN: "Men's",
    WOMEN: "Women's",
    BOYS: "Boys'",
    GIRLS: "Girls'",
    UNISEX: "Unisex",
  };

  const categoryMap: Record<string, string> = {
    TOP: "Tops",
    BOTTOM: "Bottoms",
    OUTERWEAR: "Outerwear",
    DRESS: "Dresses",
    KIDS: "Kids",
  };

  const systemMap: Record<string, string> = {
    ALPHA: "Alpha",
    NUMERIC: "Numeric",
    INCHES: "Inches",
    CHILDREN: "Children",
  };

  const region = regionMap[regionalStandard] || regionalStandard;
  const gender = genderMap[targetGender] || targetGender;
  const category = categoryMap[sizeCategory] || sizeCategory;
  const system = systemMap[sizeSystemType] || sizeSystemType;

  return `${region} ${gender} ${category} (${system})`;
};

// Helper: Auto-generate color code
const autoGenerateColorCode = (hex: string, pantone?: string): string => {
  // Remove # from hex and take first 6 characters
  const cleanHex = hex.replace("#", "").substring(0, 6).toUpperCase();

  if (pantone) {
    // Use pantone if available: PANTONE533C -> P533C
    const cleanPantone = pantone.replace(/[^A-Z0-9]/g, "");
    return `CLR-${cleanPantone.substring(0, 6)}`;
  }

  // Use hex-based code: #FF0000 -> CLR-FF0000
  return `CLR-${cleanHex}`;
};

// Helper: Auto-generate fit code
const autoGenerateFitCode = (
  gender: string,
  fitType: string,
  fitCategory: string
): string => {
  return `FIT-${gender}-${fitType}-${fitCategory}`;
};

// Helper: Auto-generate material code
const autoGenerateMaterialCode = (accessoryType: string): string => {
  const codeMap: Record<string, string> = {
    "Main Label": "ACC-LBL",
    "Care Label": "ACC-CARE",
    "Size Label": "ACC-SIZE",
    "Composition Label": "ACC-COMP",
    "Brand Label": "ACC-BRAND",
    Button: "ACC-BTN",
    Zipper: "ACC-ZIP",
    Thread: "ACC-THR",
    Elastic: "ACC-ELA",
    Velcro: "ACC-VEL",
    Drawstring: "ACC-DRW",
    Lining: "ACC-LIN",
  };

  const prefix = codeMap[accessoryType] || "ACC-MISC";
  const timestamp = Date.now().toString().slice(-3); // Last 3 digits for uniqueness
  return `${prefix}-${timestamp}`;
};

// Helper: Auto-generate material name
const autoGenerateMaterialName = (accessoryType: string): string => {
  const nameMap: Record<string, string> = {
    "Main Label": "Main Label Accessory",
    "Care Label": "Care Instructions Label",
    "Size Label": "Size Information Label",
    "Composition Label": "Fabric Composition Label",
    "Brand Label": "Brand Identity Label",
    Button: "Clothing Button",
    Zipper: "Garment Zipper",
    Thread: "Sewing Thread",
    Elastic: "Elastic Band",
    Velcro: "Velcro Fastener",
    Drawstring: "Adjustable Drawstring",
    Lining: "Garment Lining",
  };

  return nameMap[accessoryType] || `${accessoryType} Accessory`;
};

// Helper: Auto-generate fit name
const autoGenerateFitName = (
  gender: string,
  fitType: string,
  fitCategory: string
): string => {
  const displayGender =
    gender === "MEN" ? "Men" : gender === "WOMEN" ? "Women" : gender;
  const displayCategory =
    fitCategory === "TOP"
      ? "Top"
      : fitCategory === "BOTTOM"
      ? "Bottom"
      : fitCategory === "DRESS"
      ? "Dress"
      : fitCategory === "OUTERWEAR"
      ? "Outerwear"
      : fitCategory;
  const displayFit = fitType.charAt(0) + fitType.slice(1).toLowerCase();
  return `${displayFit} Fit ${displayCategory} (${displayGender})`;
};

// Helper: Auto-generate fabric code
const autoGenerateFabricCode = (composition: string): string => {
  if (!composition) return "FAB-UNKNOWN";

  // Extract main material from composition
  const upperComp = composition.toUpperCase();

  if (upperComp.includes("COTTON")) return "FAB-COT";
  if (upperComp.includes("POLYESTER")) return "FAB-PES";
  if (upperComp.includes("WOOL")) return "FAB-WOL";
  if (upperComp.includes("SILK")) return "FAB-SIL";
  if (upperComp.includes("LINEN")) return "FAB-LIN";
  if (upperComp.includes("DENIM")) return "FAB-DEN";
  if (upperComp.includes("VISCOSE") || upperComp.includes("RAYON"))
    return "FAB-VIS";
  if (upperComp.includes("SPANDEX") || upperComp.includes("ELASTANE"))
    return "FAB-ELA";
  if (upperComp.includes("NYLON")) return "FAB-NYL";
  if (upperComp.includes("ACRYLIC")) return "FAB-ACR";

  // Generate based on first significant material
  const firstWord = composition.split(/[\s,%]+/)[0];
  const code = firstWord.substring(0, 3).toUpperCase();
  return `FAB-${code}`;
};

// Get schema based on category
const getSchemaForCategory = (
  category: CreateLibraryItemModalProps["category"]
) => {
  switch (category) {
    case "FABRIC":
      return FabricSchema;
    case "COLOR":
      return ColorSchema;
    case "SIZE_GROUP":
      return SizeGroupSchema;
    case "FIT":
      return FitSchema;
    case "MATERIAL":
      return MaterialSchema;
    case "CERTIFICATION":
      return CertificationSchema;
    case "SEASON":
      return SeasonSchema;
    default:
      return FabricSchema; // fallback
  }
};

// Prepare form data for validation based on category
const prepareValidationData = (
  formData: LibraryItemFormData,
  category: CreateLibraryItemModalProps["category"]
) => {
  const baseData = {
    name: formData.name,
    description: formData.description,
    code: formData.code,
  };

  switch (category) {
    case "FABRIC":
      return {
        ...baseData,
        composition: String(formData.data.composition || ""),
        weight: formData.data.weight ? Number(formData.data.weight) : undefined,
        width: formData.data.width ? Number(formData.data.width) : undefined,
        certificationIds: formData.certificationIds || [],
      };
    case "COLOR":
      return {
        ...baseData,
        hex: String(formData.data.hex || "#000000"),
        pantone: String(formData.data.pantone || ""),
      };
    case "SIZE_GROUP":
      return {
        ...baseData,
        regionalStandard: String(formData.data.regionalStandard || ""),
        targetGender: String(formData.data.targetGender || "") as
          | "MEN"
          | "WOMEN"
          | "UNISEX",
        sizeCategory: String(formData.data.sizeCategory || ""),
        sizeSystemType: String(formData.data.sizeSystemType || ""),
      };
    case "FIT":
      return {
        ...baseData,
        gender: String(formData.data.gender || "") as
          | "MEN"
          | "WOMEN"
          | "UNISEX",
        fitType: String(formData.data.fitType || ""),
        fitCategory: String(formData.data.fitCategory || "") as
          | "TOP"
          | "BOTTOM"
          | "DRESS"
          | "OUTERWEAR",
        sizeGroupId: Number(formData.data.sizeGroupId || 0),
        selectedSizes: Array.isArray(formData.data.selectedSizes)
          ? (formData.data.selectedSizes as string[])
          : [],
        easeNotes: String(formData.data.easeNotes || ""),
      };
    case "MATERIAL":
      return {
        ...baseData,
        accessoryType: String(
          formData.data.accessoryType || formData.data.type || ""
        ),
        material: String(formData.data.material || ""),
        color: String(formData.data.color || ""),
        size: String(formData.data.size || ""),
        weight: formData.data.weight ? Number(formData.data.weight) : undefined,
        dimensions: String(formData.data.dimensions || ""),
        finish: String(formData.data.finish || ""),
        packaging: String(formData.data.packaging || ""),
        minimumOrderQuantity: formData.data.minimumOrderQuantity
          ? Number(formData.data.minimumOrderQuantity)
          : undefined,
        leadTime: String(formData.data.leadTime || ""),
        pricePerUnit: formData.data.pricePerUnit
          ? Number(formData.data.pricePerUnit)
          : undefined,
        currency: String(formData.data.currency || ""),
      };
    case "CERTIFICATION":
      return {
        ...baseData,
        issuer: String(formData.data.issuer || ""),
        certificationNumber: String(formData.data.certificationNumber || ""),
        issueDate: String(formData.data.issueDate || ""),
        validityPeriod: String(formData.data.validityPeriod || "3-years") as
          | "1-year"
          | "2-years"
          | "3-years"
          | "5-years"
          | "no-expiry",
        applicableCategories: Array.isArray(formData.data.applicableCategories)
          ? (formData.data.applicableCategories as (
              | "FABRIC"
              | "COLOR"
              | "MATERIAL"
              | "GENERAL"
            )[])
          : [],
      };
    case "SEASON":
      return {
        ...baseData,
        type: String(formData.data.type || "SS") as "SS" | "FW",
        year: Number(formData.data.year || new Date().getFullYear()),
      };
    default:
      return baseData;
  }
};

export default function CreateLibraryItemModal({
  open,
  onOpenChange,
  category,
  scope,
  onSubmit,
  initialData,
  isEditMode = false,
}: CreateLibraryItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCertificationIds, setSelectedCertificationIds] = useState<
    number[]
  >([]);
  const [formData, setFormData] = useState<LibraryItemFormData>({
    code: "",
    name: "",
    description: "",
    data: {},
    certificationIds: [],
    iconValue: "",
  });

  // Get the appropriate schema for the current category
  const schema = getSchemaForCategory(category);

  // Reset form when modal is closed
  useEffect(() => {
    if (!open) {
      setFormData({
        code: "",
        name: "",
        description: "",
        data: {},
        certificationIds: [],
      });
      setImagePreview(null);
      setSelectedCertificationIds([]);
      setValidationErrors({});
      setError(null);
    }
  }, [open]);

  // Initialize form with initial data when in edit mode
  useEffect(() => {
    if (open && initialData && isEditMode) {
      setFormData({
        code: initialData.code || "",
        name: initialData.name || "",
        description: initialData.description || "",
        data: initialData.data || {},
        imageUrl: initialData.imageUrl || "",
        certificationIds: initialData.certificationIds || [],
      });

      // Set image preview if imageUrl exists
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }

      // Set selected certifications
      if (initialData.certificationIds) {
        setSelectedCertificationIds(initialData.certificationIds);
      }

      // Clear any previous errors
      setValidationErrors({});
      setError(null);
    }
  }, [open, initialData, isEditMode]);

  // Validate form data on change
  const validateField = (fieldPath: string) => {
    try {
      const validationData = prepareValidationData(formData, category);
      schema.parse(validationData);
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldPath];
        return newErrors;
      });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "issues" in error &&
        Array.isArray((error as { issues: unknown[] }).issues)
      ) {
        const issues = (
          error as { issues: Array<{ path: string[]; message: string }> }
        ).issues;
        const fieldError = issues.find(
          (issue) => issue.path.join(".") === fieldPath
        );
        if (fieldError) {
          setValidationErrors((prev) => ({
            ...prev,
            [fieldPath]: fieldError.message,
          }));
        }
      }
    }
  };

  // 🔗 Query certifications for selector (for FABRIC, COLOR, and MATERIAL)
  const shouldLoadCertifications = ["FABRIC", "COLOR", "MATERIAL"].includes(
    category
  );
  const [certificationsResult] = useQuery({
    query: DashboardPlatformStandardsDocument,
    variables: { category: "CERTIFICATION" },
    pause: !shouldLoadCertifications,
  });

  // 📏 Query size groups for FIT category
  const shouldLoadSizeGroups = category === "FIT";
  const [sizeGroupsResult] = useQuery({
    query: DashboardPlatformStandardsDocument,
    variables: { category: "SIZE_GROUP" },
    pause: !shouldLoadSizeGroups,
  });

  const availableCertifications =
    certificationsResult.data?.platformStandards || [];

  // Filter certifications based on current category
  const relevantCertifications = availableCertifications.filter((cert) => {
    try {
      let data: Record<string, unknown> | null = null;

      // Parse cert.data if it's a string
      if (typeof cert.data === "string") {
        data = JSON.parse(cert.data);
      } else if (cert.data && typeof cert.data === "object") {
        data = cert.data;
      }

      // Check applicableCategories in data JSON
      if (data && data.applicableCategories) {
        const applicableCategories = data.applicableCategories;

        if (Array.isArray(applicableCategories)) {
          // Show if certification applies to current category or is general
          const includesCategory = applicableCategories.includes(category);
          const includesGeneral = applicableCategories.includes("GENERAL");

          const shouldShow = includesCategory || includesGeneral;

          return shouldShow;
        }
      }

      // Fallback: Check tags (legacy format)
      const tags = cert.tags ? JSON.parse(cert.tags) : [];
      const result =
        tags.includes(`APPLIES_TO_${category}`) ||
        tags.includes("APPLIES_TO_GENERAL");
      return result;
    } catch {
      // If parsing fails, don't show the certification
      return false;
    }
  });

  const getCategoryLabel = () => {
    const labels = {
      FABRIC: "Fabric",
      COLOR: "Color",
      SIZE_GROUP: "Size Group",
      FIT: "Fit",
      MATERIAL: "Accessory",
      CERTIFICATION: "Certification",
      SEASON: "Season",
    };
    return labels[category];
  };

  // 🔄 Toggle certification selection
  const handleCertToggle = (certId: number) => {
    setSelectedCertificationIds((prev) =>
      prev.includes(certId)
        ? prev.filter((id) => id !== certId)
        : [...prev, certId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const finalData = { ...formData };

      // ✅ AUTO-GENERATE CODE & NAME BEFORE VALIDATION

      // Auto-generate code for FABRIC category
      if (category === "FABRIC" && formData.data.composition) {
        const composition = String(formData.data.composition);
        finalData.code = autoGenerateFabricCode(composition);
      }

      // Auto-generate name for SEASON category (no code needed)
      if (category === "SEASON" && formData.data.type && formData.data.year) {
        // CRITICAL: Clear code for SEASON - must be null
        finalData.code = ""; // Send empty string, backend will handle as null
        finalData.name = `${
          formData.data.type === "SS" ? "Spring/Summer" : "Fall/Winter"
        } ${formData.data.year}`;
      }

      // Auto-generate fields for SIZE_GROUP category
      if (
        category === "SIZE_GROUP" &&
        formData.data.regionalStandard &&
        formData.data.targetGender &&
        formData.data.sizeCategory &&
        formData.data.sizeSystemType
      ) {
        const regionalStandard = String(formData.data.regionalStandard);
        const targetGender = String(formData.data.targetGender);
        const sizeCategory = String(formData.data.sizeCategory);
        const sizeSystemType = String(formData.data.sizeSystemType);

        // Auto-generate CODE
        finalData.code = autoGenerateSizeGroupCode(
          regionalStandard,
          targetGender,
          sizeCategory,
          sizeSystemType
        );

        // Auto-generate NAME
        finalData.name = autoGenerateSizeGroupName(
          regionalStandard,
          targetGender,
          sizeCategory,
          sizeSystemType
        );
      }

      // Auto-generate fields for COLOR category
      if (category === "COLOR" && formData.data.hex) {
        const hex = String(formData.data.hex);
        const pantone = formData.data.pantone
          ? String(formData.data.pantone)
          : undefined;

        // Auto-generate CODE only (name is entered by user)
        finalData.code = autoGenerateColorCode(hex, pantone);
      }

      // Auto-generate fields for CERTIFICATION category
      if (category === "CERTIFICATION" && formData.data.issuer) {
        const issuer = String(formData.data.issuer);
        const validUntil = String(formData.data.validUntil || "");
        const applicableCategories = Array.isArray(
          formData.data.applicableCategories
        )
          ? (formData.data.applicableCategories as string[])
          : [];

        // Auto-generate CODE
        finalData.code = autoGenerateCertCode(issuer, validUntil);

        // Auto-generate NAME
        finalData.name = autoGenerateCertName(issuer);

        // Add applicable categories to tags for filtering
        const categoryTags =
          applicableCategories.length > 0
            ? applicableCategories.map((cat: string) => `APPLIES_TO_${cat}`)
            : [];

        console.log(
          `[CERT CREATE] Applicable Categories:`,
          applicableCategories
        );

        // Set tags as JSON string
        if (categoryTags.length > 0) {
          finalData.tags = JSON.stringify(categoryTags);
          console.log(`[CERT CREATE] Final Tags JSON:`, finalData.tags);
        } else {
          console.log(`[CERT CREATE] No tags - certification will be general`);
        }

        // Add auto-generated fields to data
        finalData.data = {
          ...formData.data,
          issueDate: formData.data.issueDate
            ? String(formData.data.issueDate)
            : new Date().toISOString().split("T")[0],
          renewalDate: autoGenerateRenewalDate(validUntil),
          status: autoGenerateCertStatus(
            validUntil,
            autoGenerateRenewalDate(validUntil)
          ),
        };
      }

      // Auto-generate fields for MATERIAL category
      if (category === "MATERIAL" && formData.data.accessoryType) {
        const accessoryType = String(formData.data.accessoryType);

        // Auto-generate CODE (e.g., "ACC-LBL-001" for Main Label)
        finalData.code = autoGenerateMaterialCode(accessoryType);

        // Auto-generate NAME (e.g., "Main Label Accessory")
        finalData.name = autoGenerateMaterialName(accessoryType);

        // Set data with just the accessory type
        finalData.data = {
          type: accessoryType,
          category: "MATERIAL",
        };
      }

      // 🔗 Add selected certifications
      if (selectedCertificationIds.length > 0) {
        finalData.certificationIds = selectedCertificationIds;
      }

      // Auto-generate and shape payload for FIT
      if (category === "FIT") {
        const gender = String(formData.data.gender || "");
        const fitType = String(formData.data.fitType || "");
        const fitCategory = String(formData.data.fitCategory || "");
        const sizeGroupId = String(formData.data.sizeGroupId || "");
        const selectedSizes = Array.isArray(formData.data.selectedSizes)
          ? (formData.data.selectedSizes as string[])
          : [];
        const easeNotes = String(formData.data.easeNotes || "");

        finalData.code = autoGenerateFitCode(gender, fitType, fitCategory);
        finalData.name = autoGenerateFitName(gender, fitType, fitCategory);

        const displayGender =
          GENDERS.find((g) => g.key === gender)?.label || gender;
        const displayCategory =
          fitCategory === "TOP"
            ? "Top"
            : fitCategory === "BOTTOM"
            ? "Bottom"
            : fitCategory === "DRESS"
            ? "Dress"
            : fitCategory === "OUTERWEAR"
            ? "Outerwear"
            : fitCategory;
        const fit_style = fitType;

        finalData.data = {
          id: finalData.code,
          name: finalData.name,
          gender: displayGender,
          category: displayCategory,
          fit_style,
          size_group_id: sizeGroupId,
          selected_sizes: selectedSizes,
          ease_notes: easeNotes,
        } as Record<string, unknown>;
      }

      await onSubmit(finalData);
      // Reset form on success
      setFormData({
        code: "",
        name: "",
        description: "",
        data: {},
        certificationIds: [],
        iconValue: "",
      });
      setImagePreview(null);
      setSelectedCertificationIds([]); // 🔄 Reset selected certifications
      setValidationErrors({}); // Clear validation errors
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Failed to create item:", error);

      let errorMessage = "Bilinmeyen bir hata oluştu";

      // Handle Zod validation errors
      if (error && typeof error === "object" && "issues" in error) {
        const zodError = error as {
          issues: Array<{ path: string[]; message: string }>;
        };
        const firstIssue = zodError.issues[0];
        if (firstIssue) {
          const fieldName = firstIssue.path.join(".");
          errorMessage = `${fieldName}: ${firstIssue.message}`;
        }
      }
      // Handle other errors
      else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        const err = error as Record<string, unknown>;
        errorMessage =
          (err.message as string) ||
          ((err.graphQLErrors as Array<{ message?: string }>)?.[0]
            ?.message as string) ||
          ((err.networkError as Record<string, unknown>)?.message as string) ||
          "Bilinmeyen bir hata oluştu";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderCategorySpecificFields = () => {
    switch (category) {
      case "FABRIC":
        return (
          <>
            {/* Fabric Image Upload - Using FormImageUpload component */}
            <FormImageUpload
              value={imagePreview || formData.imageUrl}
              onChange={(url) => {
                setFormData({ ...formData, imageUrl: url });
                setImagePreview(url);
              }}
              onDelete={() => {
                setFormData({
                  ...formData,
                  imageUrl: "",
                  imageFile: undefined,
                });
                setImagePreview("");
              }}
              label="Fabric Image"
              description="Upload a photo of the fabric (optional)"
              uploadType="fabrics"
              maxSize={5}
              recommended="800x600px"
              aspectRatio="square"
            />

            <div className="space-y-2">
              <Label htmlFor="composition">Composition *</Label>
              <Input
                id="composition"
                placeholder="e.g., 100% Cotton, 65% Polyester 35% Cotton"
                value={String(formData.data.composition || "")}
                onChange={(e) => {
                  const newFormData = {
                    ...formData,
                    data: { ...formData.data, composition: e.target.value },
                  };
                  setFormData(newFormData);

                  // Validate the composition field
                  if (e.target.value.trim()) {
                    validateField("composition");
                  }
                }}
                required
                className={validationErrors.composition ? "border-red-500" : ""}
              />
              {validationErrors.composition && (
                <p className="text-sm text-red-600">
                  {validationErrors.composition}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (g/m²)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="180"
                  value={String(formData.data.weight || "")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, weight: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width (cm)</Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="150"
                  value={String(formData.data.width || "")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, width: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            {/* 🔒 Certification Selector for Fabrics */}
            {shouldLoadCertifications && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Certifications (optional)
                </Label>
                {certificationsResult.fetching ? (
                  <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
                    Loading certifications...
                  </div>
                ) : relevantCertifications.length === 0 ? (
                  <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
                    No {category.toLowerCase()} certifications available yet.
                    <br />
                    <span className="text-xs">
                      Create certifications with &quot;{category}&quot; tag
                      first.
                    </span>
                  </div>
                ) : (
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {relevantCertifications.map((cert) => {
                      const certData = JSON.parse(cert.data || "{}");
                      const isExpired =
                        certData.validUntil &&
                        new Date(certData.validUntil) < new Date();
                      const isSelected = selectedCertificationIds.includes(
                        Number(cert.id)
                      );

                      return (
                        <div
                          key={cert.id}
                          onClick={() => handleCertToggle(Number(cert.id))}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/10 border border-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {certData.issuer || cert.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cert.code}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isExpired ? (
                              <Badge variant="destructive" className="text-xs">
                                Expired
                              </Badge>
                            ) : (
                              <Badge
                                variant="default"
                                className="text-xs bg-green-600"
                              >
                                Active
                              </Badge>
                            )}
                            <ShieldCheck
                              className={`h-4 w-4 ${
                                isExpired ? "text-red-500" : "text-green-500"
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {relevantCertifications.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Select relevant certifications for this{" "}
                    {category.toLowerCase()}
                  </p>
                )}
              </div>
            )}

            {/* Auto-generated Preview for FABRIC */}
            {formData.data.composition && (
              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Auto-generated Code Preview
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Code:</span>
                    <span className="font-mono font-semibold">
                      {autoGenerateFabricCode(
                        String(formData.data.composition)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        );

      case "COLOR":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="hex">Hex Code *</Label>
              <div className="flex gap-2">
                <Input
                  id="hex"
                  type="color"
                  value={String(formData.data.hex || "#000000")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, hex: e.target.value },
                    })
                  }
                  className="w-20 h-10 cursor-pointer"
                  required
                />
                <Input
                  type="text"
                  placeholder="#000000"
                  value={String(formData.data.hex || "#000000")}
                  onChange={(e) => {
                    const hex = e.target.value;
                    // Validate hex format
                    if (hex.match(/^#[0-9A-F]{6}$/i) || hex === "") {
                      const newFormData = {
                        ...formData,
                        data: { ...formData.data, hex },
                      };
                      setFormData(newFormData);

                      // Validate hex field
                      if (hex.trim()) {
                        validateField("hex");
                      }
                    }
                  }}
                  className={`flex-1 font-mono uppercase ${
                    validationErrors.hex ? "border-red-500" : ""
                  }`}
                  required
                  maxLength={7}
                />
              </div>
              {validationErrors.hex && (
                <p className="text-sm text-red-600">{validationErrors.hex}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Click the color box to pick a color
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pantone">Pantone Code</Label>
              <Input
                id="pantone"
                placeholder="e.g., PANTONE 533C"
                value={String(formData.data.pantone || "")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data: { ...formData.data, pantone: e.target.value },
                  })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="r">R</Label>
                <Input
                  id="r"
                  type="number"
                  min="0"
                  max="255"
                  placeholder="0"
                  value={String(formData.data.r || "")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, r: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="g">G</Label>
                <Input
                  id="g"
                  type="number"
                  min="0"
                  max="255"
                  placeholder="0"
                  value={String(formData.data.g || "")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, g: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b">B</Label>
                <Input
                  id="b"
                  type="number"
                  min="0"
                  max="255"
                  placeholder="0"
                  value={String(formData.data.b || "")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, b: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            {/* Auto-generated Preview */}
            {formData.data.hex && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <p className="text-sm font-medium">🤖 Auto-Generated:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Code:</span>
                    <span className="font-mono font-semibold">
                      {autoGenerateColorCode(
                        String(formData.data.hex),
                        formData.data.pantone
                          ? String(formData.data.pantone)
                          : undefined
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 🔒 Certification Selector for Colors */}
            {shouldLoadCertifications && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Certifications (optional)
                </Label>
                {certificationsResult.fetching ? (
                  <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
                    Loading certifications...
                  </div>
                ) : relevantCertifications.length === 0 ? (
                  <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
                    No {category.toLowerCase()} certifications available yet.
                    <br />
                    <span className="text-xs">
                      Create certifications with &quot;{category}&quot; tag
                      first.
                    </span>
                  </div>
                ) : (
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {relevantCertifications.map((cert) => {
                      const certData = JSON.parse(cert.data || "{}");
                      const isExpired =
                        certData.validUntil &&
                        new Date(certData.validUntil) < new Date();
                      const isSelected = selectedCertificationIds.includes(
                        Number(cert.id)
                      );

                      return (
                        <div
                          key={cert.id}
                          onClick={() => handleCertToggle(Number(cert.id))}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/10 border border-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {certData.issuer || cert.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cert.code}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isExpired ? (
                              <Badge variant="destructive" className="text-xs">
                                Expired
                              </Badge>
                            ) : (
                              <Badge
                                variant="default"
                                className="text-xs bg-green-600"
                              >
                                Active
                              </Badge>
                            )}
                            <ShieldCheck
                              className={`h-4 w-4 ${
                                isExpired ? "text-red-500" : "text-green-500"
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {relevantCertifications.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Select relevant certifications for this{" "}
                    {category.toLowerCase()}
                  </p>
                )}
              </div>
            )}
          </>
        );

      case "SIZE_GROUP":
        return (
          <div className="space-y-4">
            {/* Regional Standard Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Regional Standard</Label>
                <Select
                  value={String(formData.data.regionalStandard || "EU")}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, regionalStandard: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EU">🇪🇺 European Union</SelectItem>
                    <SelectItem value="US">🇺🇸 United States</SelectItem>
                    <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
                    <SelectItem value="JP">🇯🇵 Japan</SelectItem>
                    <SelectItem value="CN">🇨🇳 China</SelectItem>
                    <SelectItem value="KR">🇰🇷 South Korea</SelectItem>
                    <SelectItem value="TR">🇹🇷 Turkey</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Size System Type</Label>
                <Select
                  value={String(formData.data.sizeSystemType || "ALPHA")}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, sizeSystemType: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALPHA">
                      Alpha (XS, S, M, L, XL)
                    </SelectItem>
                    <SelectItem value="NUMERIC">
                      Numeric (36, 38, 40, 42)
                    </SelectItem>
                    <SelectItem value="INCHES">
                      Inches (28, 30, 32, 34)
                    </SelectItem>
                    <SelectItem value="CHILDREN">
                      Children (2T, 3T, 4, 5, 6)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Size Range Input */}
            <div className="space-y-2">
              <Label htmlFor="sizes">Size Range *</Label>
              <Input
                id="sizes"
                placeholder="e.g., XS, S, M, L, XL, 2XL"
                value={String(formData.data.sizes || "")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data: { ...formData.data, sizes: e.target.value },
                  })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter sizes separated by commas. Adjust based on regional
                standard.
              </p>
            </div>

            {/* Category & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Gender</Label>
                <Select
                  value={String(formData.data.targetGender || "UNISEX")}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, targetGender: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEN">👨 Men</SelectItem>
                    <SelectItem value="WOMEN">👩 Women</SelectItem>
                    <SelectItem value="BOYS">👦 Boys</SelectItem>
                    <SelectItem value="GIRLS">👧 Girls</SelectItem>
                    <SelectItem value="UNISEX">👤 Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Product Category</Label>
                <Select
                  value={String(formData.data.sizeCategory || "")}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, sizeCategory: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TOP">👕 Top</SelectItem>
                    <SelectItem value="BOTTOM">👖 Bottom</SelectItem>
                    <SelectItem value="OUTERWEAR">🧥 Outerwear</SelectItem>
                    <SelectItem value="DRESS">👗 Dress</SelectItem>
                    <SelectItem value="KIDS">👶 Kids</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <>
              {/* Auto-generated Preview */}
              {formData.data.regionalStandard &&
                formData.data.targetGender &&
                formData.data.sizeCategory &&
                formData.data.sizeSystemType && (
                  <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <p className="text-sm font-medium">🤖 Auto-Generated:</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Code:</span>
                        <span className="font-mono font-semibold">
                          {autoGenerateSizeGroupCode(
                            String(formData.data.regionalStandard),
                            String(formData.data.targetGender),
                            String(formData.data.sizeCategory),
                            String(formData.data.sizeSystemType)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">
                          {autoGenerateSizeGroupName(
                            String(formData.data.regionalStandard),
                            String(formData.data.targetGender),
                            String(formData.data.sizeCategory),
                            String(formData.data.sizeSystemType)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
            </>
            {/* Size Conversion Table Preview */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">
                📏 Size Information
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  Regional: {String(formData.data.regionalStandard || "EU")}{" "}
                  Standard
                </div>
                <div>
                  System: {String(formData.data.sizeSystemType || "ALPHA")}{" "}
                  Sizing
                </div>
                <div>
                  Unit:{" "}
                  {formData.data.regionalStandard === "US" ||
                  formData.data.regionalStandard === "UK"
                    ? "inches"
                    : "cm"}
                </div>
              </div>
            </div>
          </div>
        );

      case "FIT":
        const availableSizeGroups =
          sizeGroupsResult.data?.platformStandards || [];
        const selectedSizeGroupId = String(formData.data.sizeGroupId || "");

        // Filter size groups based on selected gender and category
        const fitGender = String(formData.data.gender || "");
        const fitCategory = String(formData.data.fitCategory || "");

        const filteredSizeGroups = availableSizeGroups.filter((sg) => {
          try {
            const sizeGroupData =
              typeof sg.data === "string"
                ? JSON.parse(sg.data || "{}")
                : sg.data || {};

            // If no filters selected, show all
            if (!fitGender && !fitCategory) return true;

            // Check gender match
            const sgGender = String(sizeGroupData.targetGender || "");
            const genderMatch =
              !fitGender || sgGender === fitGender || sgGender === "UNISEX";

            // Check category match
            const sgCategory = String(sizeGroupData.sizeCategory || "");
            const categoryMatch = !fitCategory || sgCategory === fitCategory;

            return genderMatch && categoryMatch;
          } catch {
            return true; // Show if parsing fails
          }
        });

        const selectedSizeGroup = filteredSizeGroups.find(
          (sg) => sg.id === selectedSizeGroupId
        );
        let availableSizes: string[] = [];
        if (selectedSizeGroup) {
          try {
            const sizeGroupData =
              typeof selectedSizeGroup.data === "string"
                ? JSON.parse(selectedSizeGroup.data || "{}")
                : selectedSizeGroup.data || {};
            const sizesStr = String(sizeGroupData.sizes || "");
            availableSizes = sizesStr
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          } catch {
            availableSizes = [];
          }
        }
        const selectedSizes = Array.isArray(formData.data.selectedSizes)
          ? formData.data.selectedSizes
          : [];

        return (
          <div className="space-y-4">
            {/* Gender and Fit Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={
                    typeof formData.data.gender === "string"
                      ? formData.data.gender
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, gender: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border"
                >
                  {GENDERS.map((g) => (
                    <option key={g.key} value={g.key}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="fitCategory">Fit Category</Label>
                <select
                  id="fitCategory"
                  value={String(formData.data.fitCategory ?? "")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, fitCategory: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border"
                >
                  <option value="">Select category</option>
                  <option value="TOP">👕 Top</option>
                  <option value="BOTTOM">👖 Bottom</option>
                  <option value="DRESS">👗 Dress</option>
                  <option value="OUTERWEAR">🧥 Outerwear</option>
                </select>
              </div>
            </div>

            {/* Fit Style */}
            <div>
              <Label htmlFor="fitType">Fit Style</Label>
              <select
                id="fitType"
                value={String(formData.data.fitType ?? "")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data: { ...formData.data, fitType: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-md border"
              >
                <option value="">Select fit</option>
                <option value="SLIM">Slim</option>
                <option value="REGULAR">Regular</option>
                <option value="RELAXED">Relaxed</option>
                <option value="OVERSIZED">Oversized</option>
              </select>
            </div>

            {/* Size Group Selection */}
            <div className="space-y-2">
              <Label htmlFor="sizeGroup">Size Group *</Label>
              {sizeGroupsResult.fetching ? (
                <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
                  Loading size groups...
                </div>
              ) : filteredSizeGroups.length === 0 ? (
                <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
                  {fitGender || fitCategory
                    ? `No size groups match ${
                        fitGender ? `${fitGender} gender` : ""
                      }${fitGender && fitCategory ? " and " : ""}${
                        fitCategory ? `${fitCategory} category` : ""
                      }. Try different selections.`
                    : "No size groups available. Create size groups first."}
                </div>
              ) : (
                <Select
                  value={selectedSizeGroupId || ""}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      data: {
                        ...formData.data,
                        sizeGroupId: value,
                        selectedSizes: [], // Reset selected sizes when size group changes
                      },
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size group" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSizeGroups.map((sizeGroup) => {
                      const sizeGroupData =
                        typeof sizeGroup.data === "string"
                          ? JSON.parse(sizeGroup.data || "{}")
                          : sizeGroup.data || {};
                      const region = sizeGroupData.regionalStandard || "EU";
                      const sizeType = sizeGroupData.sizeSystemType || "ALPHA";
                      const sizeGroupId = sizeGroup.id || "";

                      return (
                        <SelectItem key={sizeGroupId} value={sizeGroupId}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {sizeGroup.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {region} • {sizeType} • {sizeGroup.code}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted-foreground">
                Choose a size group to define available sizes for this fit
              </p>
            </div>

            {/* Size Values Selection (Checkboxes) */}
            {selectedSizeGroup && availableSizes.length > 0 && (
              <div className="space-y-2">
                <Label>Size Values *</Label>
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium">
                    Available sizes from &quot;{selectedSizeGroup.name}&quot;:
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {availableSizes.map((size) => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <label
                          key={size}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/10 border border-primary"
                              : "hover:bg-muted border border-transparent"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            value={size}
                            onChange={(e) => {
                              const newSelectedSizes = e.target.checked
                                ? [...selectedSizes, size]
                                : selectedSizes.filter((s) => s !== size);

                              setFormData({
                                ...formData,
                                data: {
                                  ...formData.data,
                                  selectedSizes: newSelectedSizes,
                                },
                              });
                            }}
                            className="cursor-pointer"
                          />
                          <span className="text-sm font-medium">{size}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select which sizes this fit applies to (
                    {selectedSizes.length} selected)
                  </p>
                </div>
              </div>
            )}

            {/* Tolerances & Notes */}
            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                📐 Standard Tolerances: Chest ±1cm, Waist ±1cm, Length ±1.5cm,
                Shoulder ±0.5cm
              </div>
              <Textarea
                placeholder="Add fitting notes, ease allowances, or special measurements..."
                value={String(formData.data.easeNotes ?? "")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data: { ...formData.data, easeNotes: e.target.value },
                  })
                }
                className="text-sm"
                rows={2}
              />
            </div>
          </div>
        );
      case "CERTIFICATION":
        const issuer = String(formData.data.issuer || "");
        const validUntil = String(formData.data.validUntil || "");
        const autoCode =
          issuer && validUntil ? autoGenerateCertCode(issuer, validUntil) : "";
        const autoName = issuer ? autoGenerateCertName(issuer) : "";
        const autoRenewal = validUntil
          ? autoGenerateRenewalDate(validUntil)
          : null;
        const autoStatus = validUntil
          ? autoGenerateCertStatus(validUntil, autoRenewal)
          : "ACTIVE";

        // Popular certification icons
        const certificationIcons = [
          { value: "shield-check", label: "🛡️ Shield Check", icon: "🛡️" },
          { value: "leaf", label: "🍃 Leaf (Organic)", icon: "🍃" },
          { value: "recycle", label: "♻️ Recycle", icon: "♻️" },
          { value: "award", label: "🏆 Award", icon: "🏆" },
          { value: "star", label: "⭐ Star", icon: "⭐" },
          { value: "check-circle", label: "✅ Check Circle", icon: "✅" },
          { value: "eco", label: "🌱 Eco", icon: "🌱" },
          { value: "quality", label: "💎 Quality", icon: "💎" },
          { value: "global", label: "🌍 Global", icon: "🌍" },
          { value: "certificate", label: "📜 Certificate", icon: "📜" },
        ];

        return (
          <>
            {/* Icon Selection */}
            <div className="space-y-2">
              <Label>Certification Icon</Label>
              <div className="grid grid-cols-5 gap-2">
                {certificationIcons.map((iconOption) => (
                  <button
                    key={iconOption.value}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        data: { ...formData.data, icon: iconOption.value },
                      })
                    }
                    className={`
                      flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-xs
                      ${
                        formData.data.icon === iconOption.value
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                    title={iconOption.label}
                  >
                    <span className="text-lg">{iconOption.icon}</span>
                    <span className="text-[10px] text-center leading-tight">
                      {iconOption.label.split(" ")[1] || iconOption.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select an icon to represent this certification
              </p>
            </div>
            {/* Custom Icon Upload */}
            <FormFileUpload
              value={formData.iconValue}
              onChange={(url) => {
                setFormData({ ...formData, iconValue: url });
              }}
              onDelete={() => {
                setFormData({ ...formData, iconValue: "" });
              }}
              label="Custom Icon Upload (Optional)"
              description="Upload a custom icon for this certification"
              accept=".png,.jpg,.jpeg,.svg,.ico"
              fileType="image"
              uploadType="certifications"
              maxSize={2}
              recommended="32x32px or larger"
              aspectRatio="square"
            />
            {/* OLD MANUAL UPLOAD - REMOVED */}
            <div className="space-y-2 hidden">
              <Label>Custom Icon Upload (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {formData.imageUrl ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center overflow-hidden relative">
                        <Image
                          src={
                            formData.imageUrl.startsWith("/")
                              ? `http://localhost:4001${formData.imageUrl}`
                              : formData.imageUrl
                          }
                          alt="Custom icon"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        Custom icon uploaded
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, imageUrl: "" });
                        setImagePreview(null);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg,.ico"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Store file for upload
                          setFormData({ ...formData, imageFile: file });

                          // Create preview
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreview(reader.result as string);
                            setFormData((prev) => ({
                              ...prev,
                              imageUrl: reader.result as string,
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="icon-upload"
                    />
                    <label
                      htmlFor="icon-upload"
                      className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700"
                    >
                      <div className="w-8 h-8 border-2 border-gray-300 border-dashed rounded flex items-center justify-center">
                        <span className="text-lg">📁</span>
                      </div>
                      <span className="text-xs">Upload PNG, SVG, ICO</span>
                    </label>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload a custom icon file (PNG, SVG, ICO). If not uploaded, the
                selected emoji icon will be used.
              </p>
            </div>{" "}
            {/* END OLD MANUAL UPLOAD */}
            <div className="space-y-2">
              <Label htmlFor="issuer">Issuer *</Label>
              <Input
                id="issuer"
                placeholder="e.g., GOTS, OEKO-TEX, Fair Trade"
                value={issuer}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data: { ...formData.data, issuer: e.target.value },
                  })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Common: GOTS, OEKO-TEX, Fair Trade, GRS, BCI, Bluesign
              </p>
            </div>
            {/* Certification Category Tags */}
            <div className="space-y-2">
              <Label>Applicable Categories *</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    value: "FABRIC",
                    label: "🧵 Fabric",
                    desc: "Textile materials",
                  },
                  {
                    value: "COLOR",
                    label: "🎨 Color/Dyes",
                    desc: "Color safety",
                  },
                  {
                    value: "MATERIAL",
                    label: "🔗 Accessories",
                    desc: "Hardware & trims",
                  },
                  {
                    value: "GENERAL",
                    label: "🏭 General",
                    desc: "Company-wide",
                  },
                ].map((tag) => {
                  const isSelected = Array.isArray(
                    formData.data.applicableCategories
                  )
                    ? formData.data.applicableCategories.includes(tag.value)
                    : false;
                  return (
                    <Button
                      key={tag.value}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="justify-start h-auto p-3"
                      onClick={() => {
                        const current = Array.isArray(
                          formData.data.applicableCategories
                        )
                          ? formData.data.applicableCategories
                          : [];
                        const updated = isSelected
                          ? current.filter((c: string) => c !== tag.value)
                          : [...current, tag.value];
                        setFormData({
                          ...formData,
                          data: {
                            ...formData.data,
                            applicableCategories: updated,
                          },
                        });
                      }}
                    >
                      <div className="text-left">
                        <div className="font-medium">{tag.label}</div>
                        <div className="text-xs opacity-70">{tag.desc}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Select which categories this certification applies to. This
                helps filter relevant certifications when creating items.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificationNumber">Certification Number</Label>
              <Input
                id="certificationNumber"
                placeholder="e.g., GOTS-2024-12345"
                value={String(formData.data.certificationNumber || "")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data: {
                      ...formData.data,
                      certificationNumber: e.target.value,
                    },
                  })
                }
              />
            </div>
            {/* Certification Dates - More logical flow */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={String(formData.data.issueDate || "")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, issueDate: e.target.value },
                    })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Certificate issue date
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="validityPeriod">Validity Period</Label>
                <Select
                  value={String(formData.data.validityPeriod || "no-expiry")}
                  onValueChange={(value) => {
                    const issueDate =
                      String(formData.data.issueDate) ||
                      new Date().toISOString().split("T")[0];
                    let validUntil = "";

                    if (value && value !== "no-expiry" && issueDate) {
                      const issue = new Date(issueDate);
                      const yearsToAdd = parseInt(value);
                      const expiry = new Date(issue);
                      expiry.setFullYear(expiry.getFullYear() + yearsToAdd);
                      validUntil = expiry.toISOString().split("T")[0];
                    }

                    setFormData({
                      ...formData,
                      data: {
                        ...formData.data,
                        validityPeriod: value,
                        validUntil: validUntil,
                      },
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-expiry">⚡ No expiry</SelectItem>
                    <SelectItem value="1">📅 1 Year</SelectItem>
                    <SelectItem value="2">📅 2 Years</SelectItem>
                    <SelectItem value="3">📅 3 Years</SelectItem>
                    <SelectItem value="5">📅 5 Years</SelectItem>
                    <SelectItem value="10">📅 10 Years</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Auto-calculates expiry date
                </p>
              </div>
            </div>
            {/* Certification Document Upload */}
            <FormFileUpload
              value={formData.imageUrl}
              onChange={(url) => {
                setFormData({ ...formData, imageUrl: url });
              }}
              onDelete={() => {
                setFormData({ ...formData, imageUrl: "" });
              }}
              label="Certification Document"
              description="Upload the official certification PDF"
              accept=".pdf"
              fileType="pdf"
              uploadType="certifications"
              maxSize={10}
              recommended="PDF format recommended"
            />
            {/* Calculated Expiry Date Display */}
            {formData.data.validUntil && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">📅 Expires on:</span>
                  <span className="font-medium">
                    {new Date(
                      String(formData.data.validUntil)
                    ).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (
                    {Math.ceil(
                      (new Date(String(formData.data.validUntil)).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days remaining)
                  </span>
                </div>
              </div>
            )}
            {/* Auto-generated Preview */}
            {issuer && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <p className="text-sm font-medium">🤖 Auto-Generated:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Icon:</span>
                    <div className="flex items-center gap-2">
                      {formData.imageUrl ? (
                        <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center overflow-hidden relative">
                          <Image
                            src={
                              formData.imageUrl.startsWith("/")
                                ? `http://localhost:4001${formData.imageUrl}`
                                : formData.imageUrl
                            }
                            alt="Custom icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-lg">
                          {formData.data.icon
                            ? certificationIcons.find(
                                (ic) => ic.value === formData.data.icon
                              )?.icon || "🛡️"
                            : "🛡️"}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formData.imageUrl ? "(custom)" : "(emoji)"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Code:</span>
                    <span className="font-mono font-semibold">
                      {autoCode || "Will be generated"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{autoName}</span>
                  </div>
                  {autoRenewal && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Renewal Alert:
                      </span>
                      <span className="font-medium">{autoRenewal}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span
                      className={`font-medium ${
                        autoStatus === "ACTIVE"
                          ? "text-green-600"
                          : autoStatus === "EXPIRED"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {autoStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        );

      case "MATERIAL":
        return (
          <div className="space-y-4">
            {/* Material/Accessory Image Upload - Using FormImageUpload component */}
            <FormImageUpload
              value={imagePreview || formData.imageUrl}
              onChange={(url) => {
                setFormData({ ...formData, imageUrl: url });
                setImagePreview(url);
              }}
              onDelete={() => {
                setFormData({
                  ...formData,
                  imageUrl: "",
                  imageFile: undefined,
                });
                setImagePreview("");
              }}
              label="Accessory Image"
              description="Upload a photo of the accessory (optional)"
              uploadType="accessories"
              maxSize={5}
              recommended="800x600px"
              aspectRatio="square"
            />

            {/* Accessory Type */}
            <div className="space-y-2">
              <Label htmlFor="accessoryType">Accessory Type *</Label>
              <Select
                value={String(formData.data.type || "")}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    data: { ...formData.data, type: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select accessory type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main Label">🏷️ Main Label</SelectItem>
                  <SelectItem value="Care Label">📋 Care Label</SelectItem>
                  <SelectItem value="Size Label">📏 Size Label</SelectItem>
                  <SelectItem value="Brand Label">🔖 Brand Label</SelectItem>
                  <SelectItem value="Hanger Loop">🪝 Hanger Loop</SelectItem>
                  <SelectItem value="Button">🔘 Button</SelectItem>
                  <SelectItem value="Zipper">🔗 Zipper</SelectItem>
                  <SelectItem value="Thread">🧵 Thread</SelectItem>
                  <SelectItem value="Elastic">〰️ Elastic</SelectItem>
                  <SelectItem value="Trim">✨ Decorative Trim</SelectItem>
                  <SelectItem value="Hardware">⚙️ Hardware</SelectItem>
                  <SelectItem value="Packaging">📦 Packaging</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the type of accessory component
              </p>
            </div>

            {/* 🔒 Certification Selector for Materials */}
            {shouldLoadCertifications && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Certifications (optional)
                </Label>
                {certificationsResult.fetching ? (
                  <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
                    Loading certifications...
                  </div>
                ) : relevantCertifications.length === 0 ? (
                  <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
                    No {category.toLowerCase()} certifications available yet.
                    <br />
                    <span className="text-xs">
                      Create certifications with &quot;{category}&quot; tag
                      first.
                    </span>
                  </div>
                ) : (
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {relevantCertifications.map((cert) => {
                      const certData = JSON.parse(cert.data || "{}");
                      const isExpired =
                        certData.validUntil &&
                        new Date(certData.validUntil) < new Date();
                      const isSelected = selectedCertificationIds.includes(
                        Number(cert.id)
                      );

                      return (
                        <div
                          key={cert.id}
                          onClick={() => handleCertToggle(Number(cert.id))}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/10 border border-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {certData.issuer || cert.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cert.code}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isExpired ? (
                              <Badge variant="destructive" className="text-xs">
                                Expired
                              </Badge>
                            ) : (
                              <Badge
                                variant="default"
                                className="text-xs bg-green-600"
                              >
                                Active
                              </Badge>
                            )}
                            <ShieldCheck
                              className={`h-4 w-4 ${
                                isExpired ? "text-red-500" : "text-green-500"
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {relevantCertifications.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Select relevant certifications for this{" "}
                    {category.toLowerCase()}
                  </p>
                )}
              </div>
            )}

            {/* Accessory Preview */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">
                🔧 Accessory Summary
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {String(formData.data.type) && (
                  <div>Type: {String(formData.data.type as string)}</div>
                )}
                {selectedCertificationIds.length > 0 && (
                  <div>
                    Certifications: {selectedCertificationIds.length} selected
                  </div>
                )}
                <div className="text-xs text-green-600 mt-2">
                  ✅ Code will be auto-generated
                </div>
              </div>
            </div>
          </div>
        );

      case "SEASON":
        return (
          <>
            {/* Season Type Selection (SS/FW) */}
            <div className="space-y-2">
              <Label>Season Type *</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={formData.data.type === "SS" ? "default" : "outline"}
                  className="h-20 flex-col gap-2"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, type: "SS" },
                    })
                  }
                >
                  <span className="text-2xl">☀️</span>
                  <span className="font-semibold">Spring/Summer</span>
                  <span className="text-xs opacity-70">SS</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.data.type === "FW" ? "default" : "outline"}
                  className="h-20 flex-col gap-2"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, type: "FW" },
                    })
                  }
                >
                  <span className="text-2xl">❄️</span>
                  <span className="font-semibold">Fall/Winter</span>
                  <span className="text-xs opacity-70">FW</span>
                </Button>
              </div>
            </div>

            {/* Year Selection */}
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Select
                value={String(formData.data.year || "")}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    data: { ...formData.data, year: value },
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current year: {new Date().getFullYear()}
              </p>
            </div>

            {/* Auto-generated Full Name Preview */}
            {formData.data.type && formData.data.year && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <Label className="text-xs text-muted-foreground">
                  Season Name Preview:
                </Label>
                <p className="text-lg font-semibold mt-1">
                  {formData.data.type === "SS"
                    ? "Spring/Summer"
                    : "Fall/Winter"}{" "}
                  {String(formData.data.year)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Code: {String(formData.data.type)}
                  {String(formData.data.year).slice(-2)}
                </p>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit" : "Create"} {getCategoryLabel()}{" "}
            {scope === "PLATFORM_STANDARD"
              ? "(Platform Standard)"
              : "(Company Custom)"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the information for this item."
              : scope === "PLATFORM_STANDARD"
              ? "This will be visible to all users across the platform."
              : "This will only be visible to your company."}
          </DialogDescription>
        </DialogHeader>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <div className="text-red-600 mt-0.5">⚠️</div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  İşlem Başarısız
                </h4>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-xs text-red-600 hover:text-red-800 underline mt-2"
                >
                  Hata mesajını kapat
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Code Field (hidden for SEASON, CERTIFICATION, MATERIAL, FIT, SIZE_GROUP, COLOR, and FABRIC - auto-generated) */}
            {category !== "SEASON" &&
              category !== "CERTIFICATION" &&
              category !== "MATERIAL" &&
              category !== "FIT" &&
              category !== "SIZE_GROUP" &&
              category !== "COLOR" &&
              category !== "FABRIC" && (
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    placeholder={`e.g., ${
                      category === "FABRIC"
                        ? "CTN-100"
                        : category === "COLOR"
                        ? "BLK-001"
                        : "ITEM-001"
                    }`}
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    required
                  />
                </div>
              )}

            {/* Name Field (hidden for SEASON, CERTIFICATION, and SIZE_GROUP only) */}
            {category !== "SEASON" &&
              category !== "CERTIFICATION" &&
              category !== "SIZE_GROUP" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder={`e.g., ${
                      category === "FABRIC"
                        ? "Premium Cotton"
                        : category === "COLOR"
                        ? "Midnight Black"
                        : category === "MATERIAL"
                        ? "Custom Button Set"
                        : "Item Name"
                    }`}
                    value={formData.name}
                    onChange={(e) => {
                      const newFormData = { ...formData, name: e.target.value };
                      setFormData(newFormData);

                      // Clear validation error when user starts typing
                      if (validationErrors.name && e.target.value.trim()) {
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.name;
                          return newErrors;
                        });
                      }
                    }}
                    onBlur={() => {
                      // Validate on blur only if field has value
                      if (formData.name.trim()) {
                        validateField("name");
                      }
                    }}
                    className={validationErrors.name ? "border-red-500" : ""}
                    required
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-600">
                      {validationErrors.name}
                    </p>
                  )}
                </div>
              )}

            {/* Description - Available for all categories except SEASON, SIZE_GROUP, COLOR, and FABRIC */}
            {category !== "SEASON" &&
              category !== "SIZE_GROUP" &&
              category !== "COLOR" &&
              category !== "FABRIC" && (
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this item..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              )}

            {/* Category-specific Fields */}
            {renderCategorySpecificFields()}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update"
                : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
