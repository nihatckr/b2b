import * as z from "zod";

// ============================================
// LIBRARY ITEM VALIDATION SCHEMAS
// Backend: libraryMutation.ts
// ============================================

// Base library item schema
const BaseLibraryItemSchema = z.object({
  name: z
    .string()
    .min(1, "İsim gereklidir")
    .max(100, "İsim en fazla 100 karakter olabilir"),
  description: z
    .string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .optional()
    .or(z.literal("")),
  code: z.string().max(50, "Kod en fazla 50 karakter olabilir").optional(),
});

// Fabric schema
export const FabricSchema = BaseLibraryItemSchema.extend({
  composition: z
    .string()
    .min(1, "Kompozisyon gereklidir")
    .max(200, "Kompozisyon en fazla 200 karakter olabilir"),
  weight: z
    .number()
    .positive("Ağırlık pozitif olmalıdır")
    .max(9999, "Ağırlık 9999'dan küçük olmalıdır")
    .optional(),
  width: z
    .number()
    .positive("Genişlik pozitif olmalıdır")
    .max(9999, "Genişlik 9999'dan küçük olmalıdır")
    .optional(),
  certificationIds: z.array(z.number()).optional(),
});

// Color schema
export const ColorSchema = BaseLibraryItemSchema.extend({
  hex: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Geçersiz hex renk formatı"),
  pantone: z
    .string()
    .max(20, "Pantone kodu en fazla 20 karakter olabilir")
    .optional()
    .or(z.literal("")),
});

// Size Group schema
export const SizeGroupSchema = BaseLibraryItemSchema.extend({
  regionalStandard: z.string().min(1, "Bölgesel standart gereklidir"),
  targetGender: z
    .enum(["MEN", "WOMEN", "UNISEX"])
    .refine((val) => val !== undefined, {
      message: "Hedef cinsiyet gereklidir",
    }),
  sizeCategory: z.string().min(1, "Beden kategorisi gereklidir"),
  sizeSystemType: z.string().min(1, "Beden sistem tipi gereklidir"),
});

// Fit schema
export const FitSchema = BaseLibraryItemSchema.extend({
  gender: z.enum(["MEN", "WOMEN", "UNISEX"]),
  fitType: z.string().min(1, "Kalıp tipi gereklidir"),
  fitCategory: z.enum(["TOP", "BOTTOM", "DRESS", "OUTERWEAR"]),
  sizeGroupId: z.number().positive("Beden grubu seçimi gereklidir"),
  selectedSizes: z.array(z.string()).min(1, "En az bir beden seçilmelidir"),
  easeNotes: z
    .string()
    .max(500, "Kalıp notları en fazla 500 karakter olabilir")
    .optional()
    .or(z.literal("")),
});

// Material schema (Accessory)
export const MaterialSchema = BaseLibraryItemSchema.extend({
  accessoryType: z.string().min(1, "Aksesuar tipi gereklidir"),
  material: z
    .string()
    .max(100, "Malzeme en fazla 100 karakter olabilir")
    .optional()
    .or(z.literal("")),
  color: z
    .string()
    .max(50, "Renk en fazla 50 karakter olabilir")
    .optional()
    .or(z.literal("")),
  size: z
    .string()
    .max(50, "Beden en fazla 50 karakter olabilir")
    .optional()
    .or(z.literal("")),
  weight: z.number().positive("Ağırlık pozitif olmalıdır").optional(),
  dimensions: z
    .string()
    .max(100, "Boyutlar en fazla 100 karakter olabilir")
    .optional()
    .or(z.literal("")),
  finish: z
    .string()
    .max(100, "Finish en fazla 100 karakter olabilir")
    .optional()
    .or(z.literal("")),
  packaging: z
    .string()
    .max(100, "Paketleme en fazla 100 karakter olabilir")
    .optional()
    .or(z.literal("")),
  minimumOrderQuantity: z
    .number()
    .positive("Minimum sipariş miktarı pozitif olmalıdır")
    .optional(),
  leadTime: z
    .string()
    .max(50, "Teslimat süresi en fazla 50 karakter olabilir")
    .optional()
    .or(z.literal("")),
  pricePerUnit: z.number().positive("Birim fiyat pozitif olmalıdır").optional(),
  currency: z
    .string()
    .length(3, "Para birimi kodu 3 karakter olmalıdır")
    .optional()
    .or(z.literal("")),
});

// Certification schema
export const CertificationSchema = BaseLibraryItemSchema.extend({
  issuer: z.string().min(1, "Yayınlayan kurum gereklidir"),
  certificationNumber: z
    .string()
    .max(100, "Sertifika numarası en fazla 100 karakter olabilir")
    .optional()
    .or(z.literal("")),
  issueDate: z
    .string()
    .min(1, "Yayın tarihi gereklidir")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-MM-DD formatında olmalıdır"),
  validityPeriod: z.enum([
    "1-year",
    "2-years",
    "3-years",
    "5-years",
    "no-expiry",
  ]),
  applicableCategories: z
    .array(z.enum(["FABRIC", "COLOR", "MATERIAL", "GENERAL"]))
    .min(1, "En az bir geçerli kategori seçilmelidir"),
});

// Season schema
export const SeasonSchema = BaseLibraryItemSchema.extend({
  type: z.enum(["SS", "FW"]),
  year: z
    .number()
    .int("Yıl tam sayı olmalıdır")
    .min(2020, "Yıl 2020 veya sonrası olmalıdır")
    .max(2030, "Yıl 2030 veya öncesi olmalıdır"),
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
