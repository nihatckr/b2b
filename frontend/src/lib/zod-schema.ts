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
  logo: z
    .string()
    .url("Geçerli bir URL giriniz")
    .optional()
    .or(z.literal("")),
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
        message: "Döngüsel ilişki hatası: Bu kategori kendi alt kategorisi olamaz",
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
