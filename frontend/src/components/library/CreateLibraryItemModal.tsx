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
import { ImagePlus, ShieldCheck, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useQuery } from "urql";

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
}

export interface LibraryItemFormData {
  code: string;
  name: string;
  description: string;
  data: Record<string, any>;
  imageFile?: File;
  certificationIds?: number[]; // 🔗 Certification IDs
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

export default function CreateLibraryItemModal({
  open,
  onOpenChange,
  category,
  scope,
  onSubmit,
}: CreateLibraryItemModalProps) {
  const [loading, setLoading] = useState(false);
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
  });

  // 🔗 Query certifications for selector (only for FABRIC and COLOR)
  const shouldLoadCertifications = ["FABRIC", "COLOR"].includes(category);
  const [certificationsResult] = useQuery({
    query: DashboardPlatformStandardsDocument,
    variables: { category: "CERTIFICATION" },
    pause: !shouldLoadCertifications,
  });

  const availableCertifications =
    certificationsResult.data?.platformStandards || [];

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageFile: undefined });
    setImagePreview(null);
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

    try {
      let finalData = { ...formData };

      // Auto-generate code and name for SEASON category
      if (category === "SEASON" && formData.data.type && formData.data.year) {
        finalData.code = `${formData.data.type}${formData.data.year.slice(-2)}`;
        finalData.name = `${
          formData.data.type === "SS" ? "Spring/Summer" : "Fall/Winter"
        } ${formData.data.year}`;
      }

      // Auto-generate fields for CERTIFICATION category
      if (category === "CERTIFICATION" && formData.data.issuer) {
        const issuer = formData.data.issuer;
        const validUntil = formData.data.validUntil || "";

        // Auto-generate CODE
        finalData.code = autoGenerateCertCode(issuer, validUntil);

        // Auto-generate NAME
        finalData.name = autoGenerateCertName(issuer);

        // Add auto-generated fields to data
        finalData.data = {
          ...formData.data,
          issueDate:
            formData.data.issueDate || new Date().toISOString().split("T")[0],
          renewalDate: autoGenerateRenewalDate(validUntil),
          status: autoGenerateCertStatus(
            validUntil,
            autoGenerateRenewalDate(validUntil)
          ),
        };
      }

      // 🔗 Add selected certifications
      if (selectedCertificationIds.length > 0) {
        finalData.certificationIds = selectedCertificationIds;
      }

      await onSubmit(finalData);
      // Reset form on success
      setFormData({
        code: "",
        name: "",
        description: "",
        data: {},
        certificationIds: [],
      });
      setImagePreview(null);
      setSelectedCertificationIds([]); // 🔄 Reset selected certifications
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create item:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategorySpecificFields = () => {
    switch (category) {
      case "FABRIC":
        return (
          <>
            {/* Fabric Image Upload */}
            <div className="space-y-2">
              <Label>Fabric Image</Label>
              <div className="flex items-start gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Fabric preview"
                      width={120}
                      height={120}
                      className="rounded-lg border object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
                      <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">
                        Upload
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload a photo of the fabric (optional)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="composition">Composition *</Label>
              <Input
                id="composition"
                placeholder="e.g., 100% Cotton, 65% Polyester 35% Cotton"
                value={formData.data.composition || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data: { ...formData.data, composition: e.target.value },
                  })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (g/m²)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="180"
                  value={formData.data.weight || ""}
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
                  value={formData.data.width || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, width: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                placeholder="Supplier name"
                value={formData.data.supplier || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data: { ...formData.data, supplier: e.target.value },
                  })
                }
              />
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
                ) : availableCertifications.length === 0 ? (
                  <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
                    No certifications available yet.
                    <br />
                    <span className="text-xs">
                      Create certifications first to select them here.
                    </span>
                  </div>
                ) : (
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {availableCertifications.map((cert) => {
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
                {availableCertifications.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Select certifications that apply to this fabric
                  </p>
                )}
              </div>
            )}
          </>
        );

      case "COLOR":
        return (
          <>
            {/* Color Preview */}
            <div className="space-y-2">
              <Label>Color Preview</Label>
              <div className="flex items-center gap-4">
                <div
                  className="w-32 h-32 rounded-lg border-2 shadow-sm"
                  style={{ backgroundColor: formData.data.hex || "#FFFFFF" }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">
                    {formData.name || "Color Name"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {(formData.data.hex || "#FFFFFF").toUpperCase()}
                  </p>
                  {formData.data.pantone && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.data.pantone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hex">Hex Code *</Label>
              <div className="flex gap-2">
                <Input
                  id="hex"
                  type="color"
                  value={formData.data.hex || "#000000"}
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
                  value={formData.data.hex || "#000000"}
                  onChange={(e) => {
                    const hex = e.target.value;
                    // Validate hex format
                    if (hex.match(/^#[0-9A-F]{6}$/i) || hex === "") {
                      setFormData({
                        ...formData,
                        data: { ...formData.data, hex },
                      });
                    }
                  }}
                  className="flex-1 font-mono uppercase"
                  required
                  maxLength={7}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Click the color box to pick a color
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pantone">Pantone Code</Label>
              <Input
                id="pantone"
                placeholder="e.g., PANTONE 533C"
                value={formData.data.pantone || ""}
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
                  value={formData.data.r || ""}
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
                  value={formData.data.g || ""}
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
                  value={formData.data.b || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, b: e.target.value },
                    })
                  }
                />
              </div>
            </div>

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
                ) : availableCertifications.length === 0 ? (
                  <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
                    No certifications available yet.
                    <br />
                    <span className="text-xs">
                      Create certifications first to select them here.
                    </span>
                  </div>
                ) : (
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {availableCertifications.map((cert) => {
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
                {availableCertifications.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Select certifications that apply to this color/dye
                  </p>
                )}
              </div>
            )}
          </>
        );

      case "SIZE_GROUP":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="sizes">Sizes (comma-separated) *</Label>
              <Input
                id="sizes"
                placeholder="e.g., XS, S, M, L, XL"
                value={formData.data.sizes || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data: { ...formData.data, sizes: e.target.value },
                  })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Separate sizes with commas
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sizeCategory">Category</Label>
              <Input
                id="sizeCategory"
                placeholder="e.g., MEN, WOMEN, KIDS"
                value={formData.data.sizeCategory || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data: { ...formData.data, sizeCategory: e.target.value },
                  })
                }
              />
            </div>
          </>
        );

      case "FIT":
        return (
          <div className="space-y-2">
            <Label htmlFor="fitCategory">Fit Category</Label>
            <Input
              id="fitCategory"
              placeholder="e.g., UPPER, LOWER, DRESS"
              value={formData.data.fitCategory || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  data: { ...formData.data, fitCategory: e.target.value },
                })
              }
            />
          </div>
        );

      case "CERTIFICATION":
        const issuer = formData.data.issuer || "";
        const validUntil = formData.data.validUntil || "";
        const autoCode =
          issuer && validUntil ? autoGenerateCertCode(issuer, validUntil) : "";
        const autoName = issuer ? autoGenerateCertName(issuer) : "";
        const autoRenewal = validUntil
          ? autoGenerateRenewalDate(validUntil)
          : null;
        const autoStatus = validUntil
          ? autoGenerateCertStatus(validUntil, autoRenewal)
          : "ACTIVE";

        return (
          <>
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
            <div className="space-y-2">
              <Label htmlFor="certificationNumber">Certification Number</Label>
              <Input
                id="certificationNumber"
                placeholder="e.g., GOTS-2024-12345"
                value={formData.data.certificationNumber || ""}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.data.issueDate || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, issueDate: e.target.value },
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">Default: Today</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, validUntil: e.target.value },
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">Optional</p>
              </div>
            </div>

            {/* Auto-generated Preview */}
            {issuer && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <p className="text-sm font-medium">🤖 Auto-Generated:</p>
                <div className="space-y-1 text-xs">
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

            {/* 📄 Certification Document Upload */}
            <div className="space-y-2">
              <Label>Certification Document</Label>
              <div className="flex items-start gap-4">
                {imagePreview ? (
                  <div className="relative">
                    {/* Check if it's an image or PDF */}
                    {formData.imageFile?.type.startsWith("image/") ? (
                      <Image
                        src={imagePreview}
                        alt="Certification preview"
                        width={120}
                        height={120}
                        className="rounded-lg border object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-lg border bg-muted flex flex-col items-center justify-center p-2">
                        <svg
                          className="h-12 w-12 text-red-600 mb-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                        </svg>
                        <span className="text-xs text-center font-medium truncate w-full">
                          {formData.imageFile?.name}
                        </span>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
                      <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">
                        Upload
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload certificate document (PDF or image) - Optional
              </p>
            </div>
          </>
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
                value={formData.data.year || ""}
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
                  {formData.data.year}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Code: {formData.data.type}
                  {formData.data.year.slice(-2)}
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
            Create {getCategoryLabel()}{" "}
            {scope === "PLATFORM_STANDARD"
              ? "(Platform Standard)"
              : "(Company Custom)"}
          </DialogTitle>
          <DialogDescription>
            {scope === "PLATFORM_STANDARD"
              ? "This will be visible to all users across the platform."
              : "This will only be visible to your company."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Common Fields (hidden for SEASON and CERTIFICATION) */}
            {category !== "SEASON" && category !== "CERTIFICATION" && (
              <>
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

                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder={`e.g., ${
                      category === "FABRIC"
                        ? "Premium Cotton"
                        : category === "COLOR"
                        ? "Midnight Black"
                        : "Item Name"
                    }`}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
              </>
            )}

            {/* Description - Available for all categories except SEASON */}
            {category !== "SEASON" && (
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
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
