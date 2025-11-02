/**
 * Authentication Error Handler
 *
 * @module lib/auth/error-handler
 * @description Centralizes error handling for authentication operations
 *
 * Features:
 * - Maps GraphQL errors to user-friendly Turkish messages
 * - Handles network errors, validation errors, and authentication errors
 * - Provides consistent error formatting
 * - Logs errors for debugging
 *
 * Error Types:
 * - AuthenticationError: Invalid credentials, expired tokens
 * - ValidationError: Invalid input format, missing fields
 * - NetworkError: Connection issues, timeout
 * - UnknownError: Unexpected errors
 *
 * @version 2.0.0
 */

/**
 * GraphQL Error structure from backend
 */
interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
}

interface GraphQLResponse {
  data?: unknown;
  errors?: GraphQLError[];
}

/**
 * Error types matching backend GraphQL errors
 */
export enum AuthErrorCode {
  // Authentication errors
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  UNAUTHENTICATED = "UNAUTHENTICATED",

  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  BAD_USER_INPUT = "BAD_USER_INPUT",

  // Rate limiting
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // Network errors
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",

  // Token errors
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",

  // Unknown
  UNKNOWN = "UNKNOWN",
}

/**
 * Structured error result
 */
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  originalMessage?: string;
  details?: unknown;
}

/**
 * Error message mappings (Backend → Frontend)
 * Ensures consistent Turkish messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors (from backend)
  "Email veya şifre hatalı": "Email veya şifre hatalı",
  "Invalid credentials": "Email veya şifre hatalı",
  "Authentication failed": "Kimlik doğrulama başarısız",
  "Kullanıcı bulunamadı": "Kullanıcı bulunamadı",

  // Validation errors (from backend)
  "Geçerli bir email adresi giriniz": "Geçerli bir email adresi giriniz",
  "İsim en az 2 karakter olmalıdır": "İsim en az 2 karakter olmalıdır",
  "Şifre en az 6 karakter uzunluğunda olmalıdır":
    "Şifre en az 6 karakter uzunluğunda olmalıdır",
  "Bu email adresi zaten kayıtlı": "Bu email adresi zaten kayıtlı",
  "Hesap tipi seçiniz": "Hesap tipi seçiniz",
  "Mevcut şifre gerekli": "Mevcut şifre gerekli",

  // Network errors
  "Failed to fetch":
    "Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.",
  "Network request failed":
    "Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.",
  ECONNREFUSED: "Sunucuya bağlanılamıyor. Lütfen daha sonra tekrar deneyin.",

  // Token errors
  "Token expired": "Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.",
  "Invalid token": "Geçersiz oturum. Lütfen tekrar giriş yapın.",
  "jwt expired": "Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.",

  // Generic fallbacks
  Unauthorized: "Yetkisiz erişim. Lütfen giriş yapın.",
  Forbidden: "Bu işlem için yetkiniz yok.",
  "Internal server error": "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
};

/**
 * Extract error code from GraphQL error
 */
function extractErrorCode(error: GraphQLError): AuthErrorCode {
  const code = error.extensions?.code;

  if (code === "UNAUTHENTICATED" || code === "AUTHENTICATION_ERROR") {
    return AuthErrorCode.AUTHENTICATION_ERROR;
  }

  if (code === "BAD_USER_INPUT" || code === "VALIDATION_ERROR") {
    return AuthErrorCode.VALIDATION_ERROR;
  }

  // Check message patterns
  const message = error.message.toLowerCase();

  if (
    message.includes("email") ||
    message.includes("şifre") ||
    message.includes("password")
  ) {
    return AuthErrorCode.INVALID_CREDENTIALS;
  }

  if (
    message.includes("token") ||
    message.includes("jwt") ||
    message.includes("expired")
  ) {
    return AuthErrorCode.TOKEN_EXPIRED;
  }

  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection")
  ) {
    return AuthErrorCode.NETWORK_ERROR;
  }

  return AuthErrorCode.UNKNOWN;
}

/**
 * Get user-friendly Turkish message
 */
function getUserFriendlyMessage(originalMessage: string): string {
  // Exact match
  if (ERROR_MESSAGES[originalMessage]) {
    return ERROR_MESSAGES[originalMessage];
  }

  // Partial match (for dynamic messages)
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (originalMessage.includes(key)) {
      return value;
    }
  }

  // If message is already in Turkish, keep it
  if (/[ğüşıöçĞÜŞİÖÇ]/.test(originalMessage)) {
    return originalMessage;
  }

  // Generic fallback
  return "Bir hata oluştu. Lütfen tekrar deneyin.";
}

/**
 * Handle GraphQL response errors
 */
export function handleGraphQLError(response: GraphQLResponse): AuthError {
  const error = response.errors?.[0];

  if (!error) {
    return {
      code: AuthErrorCode.UNKNOWN,
      message: "Beklenmeyen bir hata oluştu",
    };
  }

  const code = extractErrorCode(error);
  const message = getUserFriendlyMessage(error.message);

  // Log for debugging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.error("🔴 Auth Error:", {
      code,
      message,
      originalMessage: error.message,
      extensions: error.extensions,
    });
  }

  return {
    code,
    message,
    originalMessage: error.message,
    details: error.extensions,
  };
}

/**
 * Handle network/fetch errors
 */
export function handleNetworkError(error: unknown): AuthError {
  let message = "Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.";
  let code = AuthErrorCode.NETWORK_ERROR;

  if (error instanceof Error) {
    // Check for specific network errors
    if (error.message.includes("ECONNREFUSED")) {
      message = "Sunucuya bağlanılamıyor. Lütfen daha sonra tekrar deneyin.";
    } else if (error.message.includes("timeout")) {
      message = "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.";
      code = AuthErrorCode.TIMEOUT;
    } else {
      // Try to get user-friendly message
      message = getUserFriendlyMessage(error.message);
    }

    // Log for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("🔴 Network Error:", error);
    }

    return {
      code,
      message,
      originalMessage: error.message,
    };
  }

  return {
    code,
    message,
  };
}

/**
 * Handle validation errors (client-side)
 */
export function handleValidationError(
  field: string,
  constraint: string
): AuthError {
  const messages: Record<string, string> = {
    email_required: "Email adresi gereklidir",
    email_invalid: "Geçerli bir email adresi giriniz",
    password_required: "Şifre gereklidir",
    password_min: "Şifre en az 6 karakter uzunluğunda olmalıdır",
    password_weak:
      "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir",
    name_required: "İsim gereklidir",
    name_min: "İsim en az 2 karakter olmalıdır",
    account_type_required: "Hesap tipi seçiniz",
  };

  const key = `${field}_${constraint}`;
  const message = messages[key] || `${field} alanı geçersiz`;

  return {
    code: AuthErrorCode.VALIDATION_ERROR,
    message,
    details: { field, constraint },
  };
}

/**
 * Format error for display
 * Returns only the user-friendly message
 */
export function formatErrorMessage(error: AuthError): string {
  return error.message;
}

/**
 * Check if error is recoverable (user can retry)
 */
export function isRecoverableError(error: AuthError): boolean {
  return [AuthErrorCode.NETWORK_ERROR, AuthErrorCode.TIMEOUT].includes(
    error.code
  );
}

/**
 * Check if error requires re-authentication
 */
export function requiresReauth(error: AuthError): boolean {
  return [
    AuthErrorCode.TOKEN_EXPIRED,
    AuthErrorCode.TOKEN_INVALID,
    AuthErrorCode.UNAUTHENTICATED,
  ].includes(error.code);
}

/**
 * Main error handler for auth operations
 * Use this as the primary entry point
 */
export function handleAuthError(error: unknown, context?: string): AuthError {
  // GraphQL response with errors
  if (typeof error === "object" && error !== null && "errors" in error) {
    return handleGraphQLError(error as GraphQLResponse);
  }

  // Network/fetch errors
  if (error instanceof Error) {
    return handleNetworkError(error);
  }

  // Unknown error type
  if (process.env.NODE_ENV === "development") {
    console.error("🔴 Unknown Auth Error:", { error, context });
  }

  return {
    code: AuthErrorCode.UNKNOWN,
    message: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
    details: { error, context },
  };
}
