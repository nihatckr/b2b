/**
 * Manual Retry Utilities for URQL
 *
 * Auto-retry yerine manuel retry kullanıyoruz çünkü:
 * - ERP/Dashboard ortamı (stable network)
 * - Kullanıcı kontrolü (double submit riski yok)
 * - Debug kolay
 * - Gereksiz network trafiği yok
 *
 * Auto-retry sadece mobil/unstable network'lerde mantıklı.
 */

import { CombinedError } from 'urql';

/**
 * Retry edilebilir hata mı kontrol et
 *
 * Retry edilebilir:
 * - Network errors (fetch failed, timeout)
 * - Server errors (500, 502, 503, 504)
 * - Rate limiting (429)
 *
 * Retry EDİLEMEZ:
 * - Auth errors (401, 403)
 * - Validation errors (400)
 * - Not found (404)
 * - GraphQL errors (field errors)
 */
export function isRetryableError(error: CombinedError): boolean {
  // Network error (fetch failed)
  if (error.networkError) {
    return true;
  }

  // GraphQL errors genellikle retry edilmez (validation, auth, vb.)
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    // Eğer sadece GraphQL error varsa retry etme
    return false;
  }

  // HTTP status code kontrolü
  const response = error.response;
  if (response) {
    const status = response.status;

    // Retry edilebilir status codes
    if (
      status === 429 || // Rate limiting
      status === 500 || // Internal server error
      status === 502 || // Bad gateway
      status === 503 || // Service unavailable
      status === 504    // Gateway timeout
    ) {
      return true;
    }

    // Auth/validation errors - retry etme
    if (status === 401 || status === 403 || status === 400 || status === 404) {
      return false;
    }
  }

  // Bilinmeyen error - retry etme (güvenli taraf)
  return false;
}

/**
 * Error mesajını kullanıcı dostu hale getir
 */
export function getErrorMessage(error: CombinedError): string {
  // Network error
  if (error.networkError) {
    return 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.';
  }

  // GraphQL errors
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    const firstError = error.graphQLErrors[0];
    return firstError.message || 'İşlem başarısız oldu.';
  }

  // HTTP errors
  const response = error.response;
  if (response) {
    switch (response.status) {
      case 401:
        return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
      case 403:
        return 'Bu işlem için yetkiniz yok.';
      case 404:
        return 'İstenen kaynak bulunamadı.';
      case 429:
        return 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.';
      case 500:
        return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      case 502:
      case 503:
      case 504:
        return 'Sunucu geçici olarak kullanılamıyor. Lütfen tekrar deneyin.';
      default:
        return `Hata oluştu (${response.status})`;
    }
  }

  // Fallback
  return error.message || 'Bilinmeyen bir hata oluştu.';
}

/**
 * Retry delay hesapla (exponential backoff)
 * @param attempt - Kaçıncı deneme (0-based)
 * @param baseDelay - Temel gecikme (ms)
 * @param maxDelay - Maksimum gecikme (ms)
 */
export function getRetryDelay(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 10s (max)
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

  // Add jitter (±20%) to avoid thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);

  return Math.round(delay + jitter);
}

/**
 * Wait helper
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for mutations
 *
 * @example
 * ```tsx
 * const [, executeMutation] = useMutation(UpdateUser);
 *
 * const handleUpdate = () => {
 *   retryMutation(
 *     () => executeMutation({ id: 1, name: 'New' }),
 *     { maxAttempts: 3 }
 *   );
 * };
 * ```
 */
export async function retryMutation<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error: any) {
      lastError = error;

      // Son denemeyse throw et
      if (attempt === maxAttempts - 1) {
        throw error;
      }

      // Retry edilemez error'sa hemen throw et
      if (error instanceof CombinedError && !isRetryableError(error)) {
        throw error;
      }

      // Retry callback
      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      // Wait before retry
      const delay = getRetryDelay(attempt, baseDelay, maxDelay);
      await wait(delay);
    }
  }

  throw lastError;
}

/**
 * Error recovery strategies
 */
export const errorRecovery = {
  /**
   * Auth error - redirect to login
   */
  handleAuthError: () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  },

  /**
   * Network error - show toast with retry button
   */
  handleNetworkError: (retry: () => void) => {
    // Toast integration (sonner)
    if (typeof window !== 'undefined') {
      // toast.error('Bağlantı hatası', { action: { label: 'Tekrar Dene', onClick: retry } });
    }
  },

  /**
   * Server error - show toast
   */
  handleServerError: () => {
    // toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
  },

  /**
   * Validation error - show in form
   */
  handleValidationError: (errors: Record<string, string>) => {
    // Form'a error'ları set et
    return errors;
  },
};

export default {
  isRetryableError,
  getErrorMessage,
  getRetryDelay,
  retryMutation,
  errorRecovery,
};
