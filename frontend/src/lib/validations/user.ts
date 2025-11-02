import * as z from "zod";

// ============================================
// USER PROFILE VALIDATION SCHEMAS
// Backend: userMutation.ts, authMutation.ts
// Backend errors: "İsim en az 2 karakter olmalıdır", "Şifre en az 8 karakter olmalıdır"
// ============================================

// Kullanıcı profil bilgileri schema
export const ProfileSchema = z.object({
  name: z.string().min(1, "İsim gereklidir"),
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
// Backend error: "Şifre en az 8 karakter olmalıdır"
export const PasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Mevcut şifre gereklidir"),
    newPassword: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
    confirmPassword: z.string().min(1, "Şifre onayı gereklidir"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

// ============================================
// TYPE EXPORTS
// ============================================

export type ProfileInput = z.infer<typeof ProfileSchema>;
export type NotificationInput = z.infer<typeof NotificationSchema>;
export type PreferencesInput = z.infer<typeof PreferencesSchema>;
export type PasswordInput = z.infer<typeof PasswordSchema>;
