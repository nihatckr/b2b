import * as z from "zod";

// ============================================
// LIBRARY ITEM VALIDATION SCHEMAS
// ============================================

// Base library item schema
const BaseLibraryItemSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  code: z.string().max(50, "Code must be less than 50 characters").optional(),
});

// Fabric schema
export const FabricSchema = BaseLibraryItemSchema.extend({
  composition: z
    .string()
    .min(1, "Composition is required")
    .max(200, "Composition must be less than 200 characters"),
  weight: z
    .number()
    .positive("Weight must be positive")
    .max(9999, "Weight must be less than 9999")
    .optional(),
  width: z
    .number()
    .positive("Width must be positive")
    .max(9999, "Width must be less than 9999")
    .optional(),
  certificationIds: z.array(z.number()).optional(),
});

// Color schema
export const ColorSchema = BaseLibraryItemSchema.extend({
  hex: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color format"),
  pantone: z
    .string()
    .max(20, "Pantone code must be less than 20 characters")
    .optional()
    .or(z.literal("")),
});

// Size Group schema
export const SizeGroupSchema = BaseLibraryItemSchema.extend({
  regionalStandard: z.string().min(1, "Regional standard is required"),
  targetGender: z
    .enum(["MEN", "WOMEN", "UNISEX"])
    .refine((val) => val !== undefined, {
      message: "Target gender is required",
    }),
  sizeCategory: z.string().min(1, "Size category is required"),
  sizeSystemType: z.string().min(1, "Size system type is required"),
});

// Fit schema
export const FitSchema = BaseLibraryItemSchema.extend({
  gender: z.enum(["MEN", "WOMEN", "UNISEX"]),
  fitType: z.string().min(1, "Fit type is required"),
  fitCategory: z.enum(["TOP", "BOTTOM", "DRESS", "OUTERWEAR"]),
  sizeGroupId: z.number().positive("Size group selection is required"),
  selectedSizes: z
    .array(z.string())
    .min(1, "At least one size must be selected"),
  easeNotes: z
    .string()
    .max(500, "Ease notes must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

// Material schema
export const MaterialSchema = BaseLibraryItemSchema.extend({
  accessoryType: z.string().min(1, "Accessory type is required"),
  material: z
    .string()
    .max(100, "Material must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  color: z
    .string()
    .max(50, "Color must be less than 50 characters")
    .optional()
    .or(z.literal("")),
  size: z
    .string()
    .max(50, "Size must be less than 50 characters")
    .optional()
    .or(z.literal("")),
  weight: z.number().positive("Weight must be positive").optional(),
  dimensions: z
    .string()
    .max(100, "Dimensions must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  finish: z
    .string()
    .max(100, "Finish must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  packaging: z
    .string()
    .max(100, "Packaging must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  minimumOrderQuantity: z.number().positive("MOQ must be positive").optional(),
  leadTime: z
    .string()
    .max(50, "Lead time must be less than 50 characters")
    .optional()
    .or(z.literal("")),
  pricePerUnit: z.number().positive("Price must be positive").optional(),
  currency: z
    .string()
    .length(3, "Currency code must be 3 characters")
    .optional()
    .or(z.literal("")),
});

// Certification schema
export const CertificationSchema = BaseLibraryItemSchema.extend({
  issuer: z.string().min(1, "Issuer is required"),
  certificationNumber: z
    .string()
    .max(100, "Certification number must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  issueDate: z
    .string()
    .min(1, "Issue date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  validityPeriod: z.enum([
    "1-year",
    "2-years",
    "3-years",
    "5-years",
    "no-expiry",
  ]),
  applicableCategories: z
    .array(z.enum(["FABRIC", "COLOR", "MATERIAL", "GENERAL"]))
    .min(1, "At least one applicable category must be selected"),
});

// Season schema
export const SeasonSchema = BaseLibraryItemSchema.extend({
  type: z.enum(["SS", "FW"]),
  year: z
    .number()
    .int("Year must be a whole number")
    .min(2020, "Year must be 2020 or later")
    .max(2030, "Year must be 2030 or earlier"),
});

// Union schema for all library item types
export const LibraryItemSchema = z.discriminatedUnion("category", [
  z.object({ category: z.literal("FABRIC") }).merge(FabricSchema),
  z.object({ category: z.literal("COLOR") }).merge(ColorSchema),
  z.object({ category: z.literal("SIZE_GROUP") }).merge(SizeGroupSchema),
  z.object({ category: z.literal("FIT") }).merge(FitSchema),
  z.object({ category: z.literal("MATERIAL") }).merge(MaterialSchema),
  z.object({ category: z.literal("CERTIFICATION") }).merge(CertificationSchema),
  z.object({ category: z.literal("SEASON") }).merge(SeasonSchema),
]);

// ============================================
// TYPE EXPORTS
// ============================================

export type FabricInput = z.infer<typeof FabricSchema>;
export type ColorInput = z.infer<typeof ColorSchema>;
export type SizeGroupInput = z.infer<typeof SizeGroupSchema>;
export type FitInput = z.infer<typeof FitSchema>;
export type MaterialInput = z.infer<typeof MaterialSchema>;
export type CertificationInput = z.infer<typeof CertificationSchema>;
export type SeasonInput = z.infer<typeof SeasonSchema>;
export type LibraryItemInput = z.infer<typeof LibraryItemSchema>;
