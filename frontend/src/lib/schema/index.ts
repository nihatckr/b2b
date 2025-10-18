import * as z from "zod";

// Şifre sıfırlama için schema
export const ResetSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gerekli")
    .email("Geçersiz e-posta adresi"),
});

// Güçlü şifre doğrulama regex'i
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Yeni şifre belirleme için schema
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
});
