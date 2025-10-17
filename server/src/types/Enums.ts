import { enumType } from "nexus";

export const OrderStatus = enumType({
  name: "OrderStatus",
  members: [
    "PENDING",
    "REVIEWED",
    "QUOTE_SENT",
    "CONFIRMED",
    "REJECTED",
    "IN_PRODUCTION",
    "PRODUCTION_COMPLETE",
    "QUALITY_CHECK",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ],
  description: "Status workflow for order production",
});

export const SampleType = enumType({
  name: "SampleType",
  members: ["STANDARD", "REVISION", "CUSTOM", "DEVELOPMENT"],
  description: "Types of samples that can be requested",
});

export const SampleStatus = enumType({
  name: "SampleStatus",
  members: [
    "AI_DESIGN", // AI-generated design not sent to manufacturer yet
    "PENDING_APPROVAL",
    "REQUESTED",
    "RECEIVED",
    "IN_DESIGN",
    "PATTERN_READY",
    "IN_PRODUCTION",
    "ON_HOLD",
    "QUALITY_CHECK",
    "COMPLETED",
    "REJECTED",
    "CANCELLED",
    "SHIPPED",
  ],
  description: "Status workflow for sample production - 13 stages (including AI design, hold and cancel options)",
});
export const Role = enumType({
  name: "Role",
  members: [
    "ADMIN",
    "COMPANY_OWNER",
    "COMPANY_EMPLOYEE",
    "INDIVIDUAL_CUSTOMER",
    "MANUFACTURE", // Backward compatibility
    "CUSTOMER", // Backward compatibility
  ],
  description: "User roles in the system",
});

export const CompanyType = enumType({
  name: "CompanyType",
  members: ["MANUFACTURER", "BUYER", "BOTH"],
  description: "Type of company (manufacturer/buyer)",
});

export const SortOrder = enumType({
  name: "SortOrder",
  members: ["asc", "desc"],
  description: "Sort order for queries",
});

// Production Tracking Enums
export const ProductionStage = enumType({
  name: "ProductionStage",
  members: [
    "PLANNING",
    "FABRIC",
    "CUTTING",
    "SEWING",
    "QUALITY",
    "PACKAGING",
    "SHIPPING",
  ],
  description: "7-stage production process",
});

export const StageStatus = enumType({
  name: "StageStatus",
  members: [
    "NOT_STARTED",
    "IN_PROGRESS",
    "ON_HOLD",
    "COMPLETED",
    "REQUIRES_REVISION",
  ],
  description: "Status of individual production stage",
});

export const ProductionStatus = enumType({
  name: "ProductionStatus",
  members: ["IN_PROGRESS", "WAITING", "BLOCKED", "COMPLETED", "CANCELLED"],
  description: "Overall production status",
});

export const QualityResult = enumType({
  name: "QualityResult",
  members: ["PENDING", "PASSED", "FAILED", "CONDITIONAL_PASS"],
  description: "Quality control test results",
});

export const WorkshopType = enumType({
  name: "WorkshopType",
  members: ["SEWING", "PACKAGING", "QUALITY_CONTROL", "GENERAL"],
  description: "Types of workshops",
});

// Textile Industry Enums
export const Season = enumType({
  name: "Season",
  members: ["SS25", "FW25", "SS26", "FW26", "SS27", "FW27"],
  description: "Fashion seasons (Spring/Summer, Fall/Winter)",
});

export const Gender = enumType({
  name: "Gender",
  members: ["WOMEN", "MEN", "GIRLS", "BOYS", "UNISEX"],
  description: "Target gender for products",
});

export const Fit = enumType({
  name: "Fit",
  members: ["REGULAR", "SLIM", "RELAXED", "OVERSIZED", "FITTED", "LOOSE"],
  description: "Clothing fit types",
});

export const CertificationCategory = enumType({
  name: "CertificationCategory",
  members: [
    "FIBER", // Lif/Hammadde: GOTS, OCS, RCS, GRS, BCI
    "CHEMICAL", // Üretim/Kimyasal: OEKO-TEX, bluesign, ZDHC
    "SOCIAL", // Sosyal/Etik: BSCI, SA8000, WRAP
    "ENVIRONMENTAL", // Çevresel: LCA, ISO 14067, Carbon Footprint
    "TRACEABILITY", // İzlenebilirlik: DPP, Blockchain, QR
  ],
  description: "Certification categories for products",
});
