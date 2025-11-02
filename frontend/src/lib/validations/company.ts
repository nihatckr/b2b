import * as z from "zod";

// ============================================
// COMPANY VALIDATION SCHEMAS
// Backend: companyMutation.ts
// ============================================

// Firma bilgileri schema
export const CompanySchema = z.object({
  name: z.string().min(1, "Firma adı gereklidir"),
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
// TYPE EXPORTS
// ============================================

export type CompanyInput = z.infer<typeof CompanySchema>;
