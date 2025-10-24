/**
 * Centralized Validation Utilities
 *
 * Common validation patterns used across the application.
 * Reduces code duplication and ensures consistency.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Common validation patterns
 */
export const validators = {
  /**
   * Required field validation
   */
  required: (value: string | undefined | null, fieldName: string): string | null => {
    if (!value || value.trim().length === 0) {
      return `${fieldName} gereklidir`;
    }
    return null;
  },

  /**
   * String length validation
   */
  length: (
    value: string,
    min: number,
    max: number,
    fieldName: string
  ): string | null => {
    if (value.length < min || value.length > max) {
      return `${fieldName} ${min}-${max} karakter arasında olmalıdır`;
    }
    return null;
  },

  /**
   * Email validation
   */
  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Geçerli bir email adresi giriniz";
    }
    return null;
  },

  /**
   * Code validation (uppercase, numbers, dashes only)
   */
  code: (value: string): string | null => {
    const codeRegex = /^[A-Z0-9-]+$/;
    if (!codeRegex.test(value)) {
      return "Kod sadece büyük harf, rakam ve tire içermelidir";
    }
    return null;
  },

  /**
   * Phone number validation
   */
  phone: (value: string): string | null => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(value)) {
      return "Geçerli bir telefon numarası giriniz";
    }
    return null;
  },

  /**
   * URL validation
   */
  url: (value: string): string | null => {
    try {
      new URL(value);
      return null;
    } catch {
      return "Geçerli bir URL giriniz";
    }
  },

  /**
   * Number range validation
   */
  numberRange: (
    value: number,
    min: number,
    max: number,
    fieldName: string
  ): string | null => {
    if (value < min || value > max) {
      return `${fieldName} ${min}-${max} arasında olmalıdır`;
    }
    return null;
  },

  /**
   * JSON validation
   */
  json: (value: string): string | null => {
    try {
      JSON.parse(value);
      return null;
    } catch {
      return "Geçerli JSON formatı giriniz";
    }
  },
};

/**
 * Generic form validation helper
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  rules: Record<keyof T, Array<(value: unknown, fieldName: string) => string | null>>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [field, validators] of Object.entries(rules)) {
    const value = data[field as keyof T];
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1);

    for (const validator of validators) {
      const error = validator(value, fieldName);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Common validation rule sets
 */
export const commonRules = {
  /**
   * Required string field
   */
  requiredString: (fieldName: string) => [
    (value: unknown) => validators.required(value as string, fieldName),
    (value: unknown) => validators.length(value as string, 1, 1000, fieldName),
  ],

  /**
   * Code field (uppercase, numbers, dashes)
   */
  code: (fieldName: string) => [
    (value: unknown) => validators.required(value as string, fieldName),
    (value: unknown) => validators.length(value as string, 3, 20, fieldName),
    (value: unknown) => validators.code(value as string),
  ],

  /**
   * Email field
   */
  email: () => [
    (value: unknown) => validators.required(value as string, "Email"),
    (value: unknown) => validators.email(value as string),
  ],

  /**
   * Phone field
   */
  phone: () => [
    (value: unknown) => validators.required(value as string, "Telefon"),
    (value: unknown) => validators.phone(value as string),
  ],

  /**
   * URL field
   */
  url: (fieldName: string) => [
    (value: unknown) => validators.required(value as string, fieldName),
    (value: unknown) => validators.url(value as string),
  ],

  /**
   * Optional string field
   */
  optionalString: (fieldName: string, maxLength: number = 500) => [
    (value: unknown) => {
      if (value && typeof value === 'string' && value.trim().length > 0) {
        return validators.length(value, 1, maxLength, fieldName);
      }
      return null;
    },
  ],

  /**
   * Number field
   */
  number: (fieldName: string, min: number = 0, max: number = 999999) => [
    (value: unknown) => validators.required(value as string, fieldName),
    (value: unknown) => {
      const num = Number(value);
      if (isNaN(num)) {
        return `${fieldName} geçerli bir sayı olmalıdır`;
      }
      return validators.numberRange(num, min, max, fieldName);
    },
  ],
};

/**
 * Debounced validation helper
 */
export function createDebouncedValidator<T>(
  validator: (data: T) => ValidationResult,
  delay: number = 500
) {
  let timeoutId: NodeJS.Timeout | null = null;

  return (data: T, callback: (result: ValidationResult) => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      const result = validator(data);
      callback(result);
    }, delay);
  };
}

/**
 * Real-time validation hook helper
 */
export function useRealtimeValidation<T extends Record<string, unknown>>(
  data: T,
  rules: Record<keyof T, Array<(value: unknown, fieldName: string) => string | null>>,
  debounceMs: number = 500
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const debouncedValidate = useMemo(
    () => createDebouncedValidator(validateForm, debounceMs),
    [debounceMs]
  );

  useEffect(() => {
    setIsValidating(true);
    debouncedValidate(data, (result) => {
      setErrors(result.errors);
      setIsValidating(false);
    });
  }, [data, debouncedValidate]);

  return {
    errors,
    isValidating,
    isValid: Object.keys(errors).length === 0,
  };
}

// Import React hooks for the hook helper
import { useEffect, useMemo, useState } from 'react';
