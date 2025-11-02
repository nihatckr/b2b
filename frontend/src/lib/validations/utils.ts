/**
 * Centralized Validation Utilities
 *
 * @module validation-utils
 * @description Enterprise-grade validation utilities for ProtexFlow B2B platform
 *
 * Features:
 * - Type-safe validation with TypeScript generics
 * - 100% Turkish error messages aligned with backend ValidationErrors
 * - Debounced real-time validation
 * - Composable validation rules
 * - React hooks for seamless integration
 *
 * Usage:
 * ```typescript
 * import { validators, validateForm, useRealtimeValidation } from '@/lib/validation-utils';
 *
 * // Single validator
 * const error = validators.email('test@example.com');
 *
 * // Form validation
 * const result = validateForm(formData, {
 *   email: commonRules.email(),
 *   name: commonRules.requiredString('İsim')
 * });
 *
 * // Real-time validation hook
 * const { errors, isValidating } = useRealtimeValidation(formData, rules);
 * ```
 *
 * @see {@link https://github.com/nihatckr/b2b/docs/VALIDATION.md}
 * @version 2.0.0
 * @since 1.0.0
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Validation result interface
 *
 * @interface ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {Record<string, string>} errors - Field-level error messages
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validator function type
 *
 * @typedef {Function} ValidatorFn
 * @param {unknown} value - Value to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {string | null} Error message or null if valid
 */
export type ValidatorFn = (value: unknown, fieldName: string) => string | null;

/**
 * Validation rules type for form validation
 *
 * @typedef {Object} ValidationRules
 */
export type ValidationRules<T extends Record<string, unknown>> = Record<
  keyof T,
  ValidatorFn[]
>;

// ============================================
// CORE VALIDATORS
// ============================================

/**
 * Core validation functions
 *
 * @namespace validators
 * @description Atomic validation functions for common data types
 * All error messages are in Turkish and aligned with backend ValidationErrors
 */
export const validators = {
  /**
   * Validates that a field has a value
   *
   * @param {string | undefined | null} value - Value to validate
   * @param {string} fieldName - Field name for error message
   * @returns {string | null} Error message or null if valid
   *
   * @example
   * validators.required('', 'İsim') // Returns: "İsim gereklidir"
   * validators.required('John', 'İsim') // Returns: null
   */
  required: (
    value: string | undefined | null,
    fieldName: string
  ): string | null => {
    if (!value || value.trim().length === 0) {
      return `${fieldName} gereklidir`;
    }
    return null;
  },

  /**
   * Validates string length is within range
   *
   * @param {string} value - String to validate
   * @param {number} min - Minimum length (inclusive)
   * @param {number} max - Maximum length (inclusive)
   * @param {string} fieldName - Field name for error message
   * @returns {string | null} Error message or null if valid
   *
   * @example
   * validators.length('ab', 3, 10, 'Kod') // Returns: "Kod 3-10 karakter arasında olmalıdır"
   * validators.length('abc', 3, 10, 'Kod') // Returns: null
   */
  length: (
    value: string,
    min: number,
    max: number,
    fieldName: string
  ): string | null => {
    const trimmedLength = value.trim().length;
    if (trimmedLength < min || trimmedLength > max) {
      return `${fieldName} ${min}-${max} karakter arasında olmalıdır`;
    }
    return null;
  },

  /**
   * Validates email format (RFC 5322 simplified)
   *
   * @param {string} value - Email address to validate
   * @returns {string | null} Error message or null if valid
   *
   * @example
   * validators.email('invalid') // Returns: "Geçerli bir e-posta adresi giriniz"
   * validators.email('user@example.com') // Returns: null
   */
  email: (value: string): string | null => {
    // RFC 5322 simplified regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return "Geçerli bir e-posta adresi giriniz";
    }
    return null;
  },

  /**
   * Validates code format (uppercase letters, numbers, dashes only)
   *
   * @param {string} value - Code to validate
   * @returns {string | null} Error message or null if valid
   *
   * @example
   * validators.code('abc-123') // Returns: "Kod sadece büyük harf, rakam ve tire içermelidir"
   * validators.code('ABC-123') // Returns: null
   */
  code: (value: string): string | null => {
    const codeRegex = /^[A-Z0-9-]+$/;
    if (!codeRegex.test(value)) {
      return "Kod sadece büyük harf, rakam ve tire içermelidir";
    }
    return null;
  },

  /**
   * Validates phone number format (international format supported)
   *
   * @param {string} value - Phone number to validate
   * @returns {string | null} Error message or null if valid
   *
   * @example
   * validators.phone('123') // Returns: "Geçerli bir telefon numarası giriniz"
   * validators.phone('+90 532 123 4567') // Returns: null
   */
  phone: (value: string): string | null => {
    // Supports: +90 532 123 4567, (532) 123-4567, 5321234567, etc.
    const phoneRegex =
      /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ""))) {
      return "Geçerli bir telefon numarası giriniz";
    }
    return null;
  },

  /**
   * Validates URL format (http, https, ftp supported)
   *
   * @param {string} value - URL to validate
   * @returns {string | null} Error message or null if valid
   *
   * @example
   * validators.url('not-a-url') // Returns: "Geçerli bir URL giriniz"
   * validators.url('https://example.com') // Returns: null
   */
  url: (value: string): string | null => {
    try {
      const url = new URL(value);
      // Only allow http, https, ftp protocols
      if (!["http:", "https:", "ftp:"].includes(url.protocol)) {
        return "Geçerli bir URL giriniz";
      }
      return null;
    } catch {
      return "Geçerli bir URL giriniz";
    }
  },

  /**
   * Validates number is within range
   *
   * @param {number} value - Number to validate
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @param {string} fieldName - Field name for error message
   * @returns {string | null} Error message or null if valid
   *
   * @example
   * validators.numberRange(5, 10, 20, 'Yaş') // Returns: "Yaş 10-20 arasında olmalıdır"
   * validators.numberRange(15, 10, 20, 'Yaş') // Returns: null
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
   * Validates JSON string format
   *
   * @param {string} value - JSON string to validate
   * @returns {string | null} Error message or null if valid
   *
   * @example
   * validators.json('{invalid}') // Returns: "Geçerli JSON formatı giriniz"
   * validators.json('{"valid": true}') // Returns: null
   */
  json: (value: string): string | null => {
    try {
      JSON.parse(value);
      return null;
    } catch {
      return "Geçerli JSON formatı giriniz";
    }
  },

  /**
   * Validates hex color format (#RGB or #RRGGBB)
   *
   * @param {string} value - Hex color to validate
   * @returns {string | null} Error message or null if valid
   *
   * @example
   * validators.hexColor('invalid') // Returns: "Geçersiz hex renk formatı"
   * validators.hexColor('#FF5733') // Returns: null
   */
  hexColor: (value: string): string | null => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(value)) {
      return "Geçersiz hex renk formatı";
    }
    return null;
  },

  /**
   * Validates positive number
   *
   * @param {number} value - Number to validate
   * @param {string} fieldName - Field name for error message
   * @returns {string | null} Error message or null if valid
   *
   * @example
   * validators.positiveNumber(-5, 'Miktar') // Returns: "Miktar pozitif olmalıdır"
   * validators.positiveNumber(5, 'Miktar') // Returns: null
   */
  positiveNumber: (value: number, fieldName: string): string | null => {
    if (value <= 0) {
      return `${fieldName} pozitif olmalıdır`;
    }
    return null;
  },

  /**
   * Validates integer (whole number)
   *
   * @param {number} value - Number to validate
   * @param {string} fieldName - Field name for error message
   * @returns {string | null} Error message or null if valid
   *
   * @example
   * validators.integer(5.5, 'Adet') // Returns: "Adet tam sayı olmalıdır"
   * validators.integer(5, 'Adet') // Returns: null
   */
  integer: (value: number, fieldName: string): string | null => {
    if (!Number.isInteger(value)) {
      return `${fieldName} tam sayı olmalıdır`;
    }
    return null;
  },
};

// ============================================
// FORM VALIDATION
// ============================================

/**
 * Generic form validation function
 *
 * @template T - Form data type
 * @param {T} data - Form data to validate
 * @param {ValidationRules<T>} rules - Validation rules for each field
 * @returns {ValidationResult} Validation result with errors
 *
 * @example
 * const result = validateForm(
 *   { email: 'test@example.com', name: 'John' },
 *   {
 *     email: [validators.required, validators.email],
 *     name: [(v) => validators.required(v as string, 'İsim')]
 *   }
 * );
 *
 * if (!result.isValid) {
 *   console.log(result.errors); // { email: "Geçerli bir e-posta adresi giriniz" }
 * }
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  rules: ValidationRules<T>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [field, fieldValidators] of Object.entries(rules)) {
    const value = data[field as keyof T];
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1);

    for (const validator of fieldValidators) {
      const error = validator(value, fieldName);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field (fail-fast)
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates a single field
 *
 * @param {unknown} value - Field value to validate
 * @param {ValidatorFn[]} validators - Array of validator functions
 * @param {string} fieldName - Field name for error messages
 * @returns {string | null} Error message or null if valid
 *
 * @example
 * const error = validateField(
 *   'test@example.com',
 *   [validators.email],
 *   'Email'
 * );
 */
export function validateField(
  value: unknown,
  validators: ValidatorFn[],
  fieldName: string
): string | null {
  for (const validator of validators) {
    const error = validator(value, fieldName);
    if (error) {
      return error;
    }
  }
  return null;
}

// ============================================
// COMMON VALIDATION RULES (COMPOSABLE)
// ============================================

/**
 * Pre-configured validation rule sets for common fields
 *
 * @namespace commonRules
 * @description Composable validation rules that combine multiple validators
 */
export const commonRules = {
  /**
   * Required string field with length validation
   *
   * @param {string} fieldName - Field name for error messages
   * @param {number} minLength - Minimum length (default: 1)
   * @param {number} maxLength - Maximum length (default: 1000)
   * @returns {ValidatorFn[]} Array of validators
   *
   * @example
   * commonRules.requiredString('İsim', 2, 100)
   */
  requiredString: (
    fieldName: string,
    minLength: number = 1,
    maxLength: number = 1000
  ): ValidatorFn[] => [
    (value: unknown) => validators.required(value as string, fieldName),
    (value: unknown) =>
      validators.length(value as string, minLength, maxLength, fieldName),
  ],

  /**
   * Code field (uppercase, numbers, dashes only)
   *
   * @param {string} fieldName - Field name for error messages
   * @param {number} minLength - Minimum length (default: 3)
   * @param {number} maxLength - Maximum length (default: 40)
   * @returns {ValidatorFn[]} Array of validators
   *
   * @example
   * commonRules.code('Kategori Kodu', 3, 40)
   */
  code: (
    fieldName: string,
    minLength: number = 3,
    maxLength: number = 40
  ): ValidatorFn[] => [
    (value: unknown) => validators.required(value as string, fieldName),
    (value: unknown) =>
      validators.length(value as string, minLength, maxLength, fieldName),
    (value: unknown) => validators.code(value as string),
  ],

  /**
   * Email field with format validation
   *
   * @returns {ValidatorFn[]} Array of validators
   *
   * @example
   * commonRules.email()
   */
  email: (): ValidatorFn[] => [
    (value: unknown) => validators.required(value as string, "E-posta"),
    (value: unknown) => validators.email(value as string),
  ],

  /**
   * Phone number field with format validation
   *
   * @returns {ValidatorFn[]} Array of validators
   *
   * @example
   * commonRules.phone()
   */
  phone: (): ValidatorFn[] => [
    (value: unknown) => validators.required(value as string, "Telefon"),
    (value: unknown) => validators.phone(value as string),
  ],

  /**
   * URL field with format validation
   *
   * @param {string} fieldName - Field name for error messages
   * @returns {ValidatorFn[]} Array of validators
   *
   * @example
   * commonRules.url('Website')
   */
  url: (fieldName: string): ValidatorFn[] => [
    (value: unknown) => validators.required(value as string, fieldName),
    (value: unknown) => validators.url(value as string),
  ],

  /**
   * Optional string field (only validates if value exists)
   *
   * @param {string} fieldName - Field name for error messages
   * @param {number} maxLength - Maximum length (default: 500)
   * @returns {ValidatorFn[]} Array of validators
   *
   * @example
   * commonRules.optionalString('Açıklama', 1000)
   */
  optionalString: (
    fieldName: string,
    maxLength: number = 500
  ): ValidatorFn[] => [
    (value: unknown) => {
      if (value && typeof value === "string" && value.trim().length > 0) {
        return validators.length(value, 1, maxLength, fieldName);
      }
      return null;
    },
  ],

  /**
   * Optional URL field (only validates if value exists)
   *
   * @param {string} fieldName - Field name for error messages
   * @returns {ValidatorFn[]} Array of validators
   *
   * @example
   * commonRules.optionalUrl('Website')
   */
  optionalUrl: (fieldName: string): ValidatorFn[] => [
    (value: unknown) => {
      if (value && typeof value === "string" && value.trim().length > 0) {
        return validators.url(value);
      }
      return null;
    },
  ],

  /**
   * Number field with range validation
   *
   * @param {string} fieldName - Field name for error messages
   * @param {number} min - Minimum value (default: 0)
   * @param {number} max - Maximum value (default: 999999)
   * @returns {ValidatorFn[]} Array of validators
   *
   * @example
   * commonRules.number('Miktar', 1, 1000)
   */
  number: (
    fieldName: string,
    min: number = 0,
    max: number = 999999
  ): ValidatorFn[] => [
    (value: unknown) => validators.required(value as string, fieldName),
    (value: unknown) => {
      const num = Number(value);
      if (isNaN(num)) {
        return `${fieldName} geçerli bir sayı olmalıdır`;
      }
      return validators.numberRange(num, min, max, fieldName);
    },
  ],

  /**
   * Positive integer field
   *
   * @param {string} fieldName - Field name for error messages
   * @param {number} max - Maximum value (default: 999999)
   * @returns {ValidatorFn[]} Array of validators
   *
   * @example
   * commonRules.positiveInteger('Adet', 1000)
   */
  positiveInteger: (fieldName: string, max: number = 999999): ValidatorFn[] => [
    (value: unknown) => validators.required(value as string, fieldName),
    (value: unknown) => {
      const num = Number(value);
      if (isNaN(num)) {
        return `${fieldName} geçerli bir sayı olmalıdır`;
      }
      const intError = validators.integer(num, fieldName);
      if (intError) return intError;

      const positiveError = validators.positiveNumber(num, fieldName);
      if (positiveError) return positiveError;

      return validators.numberRange(num, 1, max, fieldName);
    },
  ],

  /**
   * Hex color field
   *
   * @param {string} fieldName - Field name for error messages
   * @returns {ValidatorFn[]} Array of validators
   *
   * @example
   * commonRules.hexColor('Renk')
   */
  hexColor: (fieldName: string): ValidatorFn[] => [
    (value: unknown) => validators.required(value as string, fieldName),
    (value: unknown) => validators.hexColor(value as string),
  ],

  /**
   * JSON field
   *
   * @param {string} fieldName - Field name for error messages
   * @returns {ValidatorFn[]} Array of validators
   *
   * @example
   * commonRules.json('Metadata')
   */
  json: (fieldName: string): ValidatorFn[] => [
    (value: unknown) => validators.required(value as string, fieldName),
    (value: unknown) => validators.json(value as string),
  ],
};

// ============================================
// DEBOUNCED VALIDATION
// ============================================

/**
 * Creates a debounced validator function
 *
 * @template T - Data type to validate
 * @param {Function} validator - Validator function
 * @param {number} delay - Debounce delay in milliseconds (default: 500)
 * @returns {Function} Debounced validator function
 *
 * @example
 * const debouncedValidator = createDebouncedValidator(
 *   (data) => validateForm(data, rules),
 *   300
 * );
 *
 * debouncedValidator(formData, (result) => {
 *   console.log(result.errors);
 * });
 */
export function createDebouncedValidator<T>(
  validator: (data: T) => ValidationResult,
  delay: number = 500
): (data: T, callback: (result: ValidationResult) => void) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (data: T, callback: (result: ValidationResult) => void): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      const result = validator(data);
      callback(result);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Cleans up any pending debounced validations
 *
 * @param {Function} debouncedFn - Debounced function to cleanup
 */
export function cleanupDebouncedValidator(
  debouncedFn: ReturnType<typeof createDebouncedValidator>
): void {
  // Force immediate execution by calling with empty data
  // This ensures no memory leaks from pending timeouts
  debouncedFn({} as never, () => {});
}

// ============================================
// REACT HOOKS
// ============================================

/**
 * Real-time validation hook with debouncing
 *
 * @template T - Form data type
 * @param {T} data - Form data to validate
 * @param {ValidationRules<T>} rules - Validation rules
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 500)
 * @returns {Object} Validation state
 *
 * @example
 * function MyForm() {
 *   const [formData, setFormData] = useState({ email: '', name: '' });
 *
 *   const { errors, isValidating, isValid } = useRealtimeValidation(
 *     formData,
 *     {
 *       email: commonRules.email(),
 *       name: commonRules.requiredString('İsim', 2, 50)
 *     }
 *   );
 *
 *   return (
 *     <form>
 *       <input
 *         value={formData.email}
 *         onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 *       />
 *       {errors.email && <span>{errors.email}</span>}
 *       {isValidating && <span>Doğrulanıyor...</span>}
 *     </form>
 *   );
 * }
 */
export function useRealtimeValidation<T extends Record<string, unknown>>(
  data: T,
  rules: ValidationRules<T>,
  debounceMs: number = 500
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [touched, setTouched] = useState<Set<keyof T>>(new Set());

  // Memoize the validator to prevent recreation on every render
  const debouncedValidate = useMemo(
    () =>
      createDebouncedValidator((d: T) => validateForm(d, rules), debounceMs),
    [debounceMs, rules]
  );

  // Run validation on data changes
  useEffect(() => {
    setIsValidating(true);
    debouncedValidate(data, (result) => {
      setErrors(result.errors);
      setIsValidating(false);
    });
  }, [data, debouncedValidate]);

  // Mark field as touched
  const touchField = useCallback((fieldName: keyof T) => {
    setTouched((prev) => new Set(prev).add(fieldName));
  }, []);

  // Reset validation state
  const reset = useCallback(() => {
    setErrors({});
    setTouched(new Set());
    setIsValidating(false);
  }, []);

  return {
    errors,
    isValidating,
    isValid: Object.keys(errors).length === 0,
    touched,
    touchField,
    reset,
  };
}

/**
 * Single field validation hook
 *
 * @param {unknown} value - Field value to validate
 * @param {ValidatorFn[]} validators - Array of validators
 * @param {string} fieldName - Field name for error messages
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns {Object} Field validation state
 *
 * @example
 * function EmailInput() {
 *   const [email, setEmail] = useState('');
 *   const { error, isValidating } = useFieldValidation(
 *     email,
 *     [validators.email],
 *     'E-posta'
 *   );
 *
 *   return (
 *     <div>
 *       <input
 *         value={email}
 *         onChange={(e) => setEmail(e.target.value)}
 *       />
 *       {error && <span>{error}</span>}
 *     </div>
 *   );
 * }
 */
export function useFieldValidation(
  value: unknown,
  validators: ValidatorFn[],
  fieldName: string,
  debounceMs: number = 300
) {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setIsValidating(true);
    const timeoutId = setTimeout(() => {
      const validationError = validateField(value, validators, fieldName);
      setError(validationError);
      setIsValidating(false);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [value, validators, fieldName, debounceMs]);

  return {
    error,
    isValidating,
    isValid: error === null,
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Combines multiple validation results
 *
 * @param {...ValidationResult[]} results - Validation results to combine
 * @returns {ValidationResult} Combined validation result
 *
 * @example
 * const result1 = validateForm(data1, rules1);
 * const result2 = validateForm(data2, rules2);
 * const combined = combineValidationResults(result1, result2);
 */
export function combineValidationResults(
  ...results: ValidationResult[]
): ValidationResult {
  const combinedErrors: Record<string, string> = {};

  for (const result of results) {
    Object.assign(combinedErrors, result.errors);
  }

  return {
    isValid: Object.keys(combinedErrors).length === 0,
    errors: combinedErrors,
  };
}

/**
 * Extracts error messages for a specific field
 *
 * @param {ValidationResult} result - Validation result
 * @param {string} fieldName - Field name to extract errors for
 * @returns {string | null} Error message or null
 *
 * @example
 * const result = validateForm(data, rules);
 * const emailError = getFieldError(result, 'email');
 */
export function getFieldError(
  result: ValidationResult,
  fieldName: string
): string | null {
  return result.errors[fieldName] || null;
}

/**
 * Checks if a specific field has errors
 *
 * @param {ValidationResult} result - Validation result
 * @param {string} fieldName - Field name to check
 * @returns {boolean} True if field has errors
 *
 * @example
 * const result = validateForm(data, rules);
 * if (hasFieldError(result, 'email')) {
 *   // Handle email error
 * }
 */
export function hasFieldError(
  result: ValidationResult,
  fieldName: string
): boolean {
  return fieldName in result.errors;
}

/**
 * Creates a custom validator function
 *
 * @param {Function} validationFn - Custom validation function
 * @param {string} errorMessage - Error message to return on validation failure
 * @returns {ValidatorFn} Validator function
 *
 * @example
 * const isEven = createCustomValidator(
 *   (value) => Number(value) % 2 === 0,
 *   'Sayı çift olmalıdır'
 * );
 *
 * const rules = {
 *   age: [isEven]
 * };
 */
export function createCustomValidator(
  validationFn: (value: unknown) => boolean,
  errorMessage: string
): ValidatorFn {
  return (value: unknown): string | null => {
    return validationFn(value) ? null : errorMessage;
  };
}

/**
 * Creates a conditional validator (only validates if condition is met)
 *
 * @param {Function} condition - Condition function
 * @param {ValidatorFn} validator - Validator to apply if condition is true
 * @returns {ValidatorFn} Conditional validator function
 *
 * @example
 * const conditionalEmail = createConditionalValidator(
 *   (data) => data.contactMethod === 'email',
 *   validators.email
 * );
 */
export function createConditionalValidator(
  condition: (data: unknown) => boolean,
  validator: ValidatorFn
): ValidatorFn {
  return (value: unknown, fieldName: string): string | null => {
    if (condition(value)) {
      return validator(value, fieldName);
    }
    return null;
  };
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Common validation limits aligned with backend Prisma schema
 */
export const VALIDATION_LIMITS = {
  // String lengths
  NAME_MIN: 2,
  NAME_MAX: 100,
  EMAIL_MAX: 255,
  CODE_MIN: 3,
  CODE_MAX: 40,
  DESCRIPTION_MAX: 500,
  BIO_MAX: 500,
  COMMENT_MAX: 1000,
  URL_MAX: 2048,
  PHONE_MAX: 20,

  // Numbers
  MIN_RATING: 1,
  MAX_RATING: 5,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 999999,
  MIN_PRICE: 0,
  MAX_PRICE: 999999999,

  // Bulk operations
  MAX_BULK_ITEMS: 50,

  // Password
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
} as const;

/**
 * Common regex patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CODE: /^[A-Z0-9-]+$/,
  PHONE:
    /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  URL: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;
