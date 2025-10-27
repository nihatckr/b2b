import * as z from "zod";

// ============================================
// AUTH VALIDATION SCHEMAS
// ============================================

// Güçlü şifre doğrulama regex'i
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

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
// TYPE EXPORTS
// ============================================

export type ResetInput = z.infer<typeof ResetSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof NewPasswordSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
