/**
 * @deprecated This file is deprecated. Use imports from @/lib/validations instead
 *
 * Migration guide:
 * - import { ProfileSchema } from "@/lib/zod-schema" → import { ProfileSchema } from "@/lib/validations"
 * - All schemas are now modular and organized by domain
 */

// Re-export all schemas from validations for backward compatibility
export * from "./validations";

import * as z from "zod";

// ============================================
// COMMON VALIDATIONS
// ============================================

// Güçlü şifre doğrulama regex'i
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// ============================================
// AUTH SCHEMAS
// ============================================

// Şifre sıfırlama talebi için schema
export const ResetSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gerekli")
    .email("Geçersiz e-posta adresi"),
});

// Yeni şifre belirleme için schema (token ile)
export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir")
      .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir")
      .regex(/[0-9]/, "Şifre en az bir rakam içermelidir"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

// Yeni şifre belirleme için schema (genel)
export const NewPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .regex(
      strongPasswordRegex,
      "Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir"
    ),
});

// Giriş yapmak için schema
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gerekli")
    .email("Geçersiz e-posta adresi"),
  password: z.string().min(1, "Şifre gerekli"),
});

// Kayıt olmak için schema
export const RegisterSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gerekli")
    .email("Geçersiz e-posta adresi"),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .regex(
      strongPasswordRegex,
      "Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir"
    ),
  name: z.string().min(1, "İsim gerekli"),
  accountType: z.enum(["INDIVIDUAL", "MANUFACTURER", "BUYER"]),
});

// ============================================
// USER PROFILE SCHEMAS
// ============================================

// Kullanıcı profil bilgileri schema
export const ProfileSchema = z.object({
  name: z.string().min(1, "Ad soyad gerekli"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  bio: z
    .string()
    .max(500, "Biyografi en fazla 500 karakter olabilir")
    .optional(),
  avatar: z
    .string()
    .url("Geçerli bir URL giriniz")
    .optional()
    .or(z.literal("")),
  customAvatar: z
    .string()
    .url("Geçerli bir URL giriniz")
    .optional()
    .or(z.literal("")),
  // Social Links
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
});

// Bildirim ayarları schema
export const NotificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
});

// Kullanıcı tercihleri schema
export const PreferencesSchema = z.object({
  language: z.string(),
  timezone: z.string(),
});

// Şifre değiştirme schema
export const PasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Mevcut şifre gerekli"),
    newPassword: z.string().min(8, "Yeni şifre en az 8 karakter olmalı"),
    confirmPassword: z.string().min(1, "Şifre onayı gerekli"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

// ============================================
// COMPANY SCHEMAS
// ============================================

// Firma bilgileri schema
export const CompanySchema = z.object({
  name: z.string().min(1, "Firma adı gerekli"),
  email: z
    .string()
    .email("Geçerli bir e-posta adresi giriniz")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  description: z
    .string()
    .max(1000, "Açıklama en fazla 1000 karakter olabilir")
    .optional(),
  website: z
    .string()
    .url("Geçerli bir URL giriniz")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  taxNumber: z.string().optional(),
  // Logo
  logo: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
  coverImage: z
    .string()
    .url("Geçerli bir URL giriniz")
    .optional()
    .or(z.literal("")),
  // Social Links
  instagram: z.string().optional(),
  companyLinkedin: z.string().optional(),
  facebook: z.string().optional(),
  // Brand Colors
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  // Public Profile
  profileSlug: z.string().optional(),
  isPublicProfile: z.boolean().optional(),
});

// ============================================
// CATEGORY SCHEMAS
// ============================================

// Category Level enum
export const CategoryLevelEnum = z.enum(["ROOT", "MAIN", "SUB", "DETAIL"]);

// Base category schema
export const CategorySchema = z.object({
  code: z
    .string()
    .min(3, "Kod en az 3 karakter olmalıdır")
    .max(40, "Kod en fazla 40 karakter olmalıdır")
    .regex(/^[A-Z0-9-]+$/, "Kod sadece büyük harf, rakam ve tire içermelidir")
    .trim(),
  name: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(100, "Ad en fazla 100 karakter olabilir")
    .trim(),
  description: z
    .string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .optional()
    .or(z.literal("")),
  level: CategoryLevelEnum,
  order: z
    .number()
    .int("Sıralama tam sayı olmalıdır")
    .min(0, "Sıralama 0'dan küçük olamaz")
    .max(9999, "Sıralama 9999'dan büyük olamaz")
    .optional(),
  icon: z.string().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  parentId: z.number().int().positive().optional(),
  keywords: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      },
      { message: "Keywords JSON array formatında olmalıdır" }
    )
    .or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

// Category form schema with refinements
export const CategoryFormSchema = CategorySchema;

// Helper function to create category schema with custom validations
export function createCategorySchema(options?: {
  existingCategories?: Array<{
    id: string;
    code: string;
    level: string;
    parentCategory?: { id: string } | null;
  }>;
  currentCategoryId?: string;
}) {
  let schema = CategoryFormSchema;

  // Add duplicate code check
  if (options?.existingCategories) {
    schema = schema.refine(
      (data) => {
        const duplicate = options.existingCategories!.some(
          (cat) =>
            cat.code.toLowerCase() === data.code.toLowerCase() &&
            cat.id !== options.currentCategoryId
        );
        return !duplicate;
      },
      {
        message: "Bu kod zaten kullanılıyor",
        path: ["code"],
      }
    );
  }

  // Add circular parent check
  if (options?.existingCategories && options?.currentCategoryId) {
    schema = schema.refine(
      (data) => {
        if (!data.parentId) return true;

        const categoryId = options.currentCategoryId!;
        const parentId = data.parentId;

        // Self-parent check
        if (categoryId === String(parentId)) return false;

        // Build parent chain
        let currentParentId: string | null = String(parentId);
        const visited = new Set<string>();

        while (currentParentId) {
          if (currentParentId === categoryId) return false;
          if (visited.has(currentParentId)) break;
          visited.add(currentParentId);

          const parent = options.existingCategories!.find(
            (c) => c.id === currentParentId
          );
          currentParentId = parent?.parentCategory?.id || null;
        }

        return true;
      },
      {
        message:
          "Döngüsel ilişki hatası: Bu kategori kendi alt kategorisi olamaz",
        path: ["parentId"],
      }
    );
  }

  // Add max depth check
  if (options?.existingCategories) {
    schema = schema.refine(
      (data) => {
        if (!data.parentId) return true;

        const maxDepths: Record<string, number> = {
          ROOT: 0,
          MAIN: 1,
          SUB: 2,
          DETAIL: 3,
        };

        const maxDepth = maxDepths[data.level];
        const parent = options.existingCategories!.find(
          (c) => c.id === String(data.parentId)
        );

        if (!parent) return true;

        // Count parent chain depth
        let depth = 1;
        let currentParent = parent;

        while (currentParent.parentCategory) {
          depth++;
          currentParent =
            options.existingCategories!.find(
              (c) => c.id === currentParent.parentCategory!.id
            ) || currentParent;

          if (depth > maxDepth) return false;
        }

        return true;
      },
      {
        message: "Maksimum derinlik aşıldı",
        path: ["parentId"],
      }
    );
  }

  return schema;
}

// ============================================
// LIBRARY ITEM SCHEMAS
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
// TYPE EXPORTS (TypeScript utility types)
// ============================================

export type ResetInput = z.infer<typeof ResetSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof NewPasswordSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ProfileInput = z.infer<typeof ProfileSchema>;
export type NotificationInput = z.infer<typeof NotificationSchema>;
export type PreferencesInput = z.infer<typeof PreferencesSchema>;
export type PasswordInput = z.infer<typeof PasswordSchema>;
export type CompanyInput = z.infer<typeof CompanySchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
export type CategoryLevel = z.infer<typeof CategoryLevelEnum>;
export type FabricInput = z.infer<typeof FabricSchema>;
export type ColorInput = z.infer<typeof ColorSchema>;
export type SizeGroupInput = z.infer<typeof SizeGroupSchema>;
export type FitInput = z.infer<typeof FitSchema>;
export type MaterialInput = z.infer<typeof MaterialSchema>;
export type CertificationInput = z.infer<typeof CertificationSchema>;
export type SeasonInput = z.infer<typeof SeasonSchema>;
export type LibraryItemInput = z.infer<typeof LibraryItemSchema>;
