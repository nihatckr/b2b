/**
 * Validation helper functions for GraphQL mutations
 */

import { ValidationError } from "./errors";

/**
 * Validate an array of IDs
 *
 * @param ids - Array of IDs to validate
 * @param fieldName - Name of the field for error message
 * @param maxLength - Maximum array length (optional)
 * @throws ValidationError if validation fails
 *
 * @example
 * validateIdArray([1, 2, 3], "colorIds") // OK
 * validateIdArray([-1, 2], "colorIds") // Throws error
 */
export function validateIdArray(
  ids: (number | null | undefined)[] | null | undefined,
  fieldName: string,
  maxLength?: number
): void {
  if (!ids) return;

  if (!Array.isArray(ids)) {
    throw new ValidationError(`${fieldName} bir dizi olmalıdır`);
  }

  if (maxLength && ids.length > maxLength) {
    throw new ValidationError(
      `${fieldName} maksimum ${maxLength} öğe içerebilir`
    );
  }

  // Check for invalid IDs
  const hasInvalidId = ids.some((id) => {
    if (id === null || id === undefined) return false;
    return typeof id !== "number" || id <= 0 || !Number.isInteger(id);
  });

  if (hasInvalidId) {
    throw new ValidationError(
      `${fieldName} içinde geçersiz ID değeri bulundu. Tüm ID'ler pozitif tam sayı olmalıdır.`
    );
  }
}

/**
 * Validate a numeric range
 *
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @throws ValidationError if validation fails
 *
 * @example
 * validateRange(5, "quantity", 1, 10) // OK
 * validateRange(15, "quantity", 1, 10) // Throws error
 */
export function validateRange(
  value: number | null | undefined,
  fieldName: string,
  min: number,
  max: number
): void {
  if (value === null || value === undefined) return;

  if (typeof value !== "number" || isNaN(value)) {
    throw new ValidationError(`${fieldName} geçerli bir sayı olmalıdır`);
  }

  if (value < min) {
    throw new ValidationError(
      `${fieldName} en az ${min} olmalıdır (şu an: ${value})`
    );
  }

  if (value > max) {
    throw new ValidationError(
      `${fieldName} en fazla ${max} olabilir (şu an: ${value})`
    );
  }
}

/**
 * Validate string length
 *
 * @param value - String to validate
 * @param fieldName - Name of the field for error message
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @throws ValidationError if validation fails
 *
 * @example
 * validateStringLength("Test", "name", 2, 10) // OK
 * validateStringLength("A", "name", 2, 10) // Throws error
 */
export function validateStringLength(
  value: string | null | undefined,
  fieldName: string,
  minLength: number,
  maxLength: number
): void {
  if (!value) return;

  const trimmedValue = value.trim();

  if (trimmedValue.length < minLength) {
    throw new ValidationError(
      `${fieldName} en az ${minLength} karakter olmalıdır`
    );
  }

  if (trimmedValue.length > maxLength) {
    throw new ValidationError(
      `${fieldName} en fazla ${maxLength} karakter olabilir`
    );
  }
}

/**
 * Validate required field
 *
 * @param value - Value to check
 * @param fieldName - Name of the field for error message
 * @throws ValidationError if value is null/undefined/empty
 *
 * @example
 * validateRequired("test", "name") // OK
 * validateRequired(null, "name") // Throws error
 */
export function validateRequired(value: any, fieldName: string): void {
  if (value === null || value === undefined) {
    throw new ValidationError(`${fieldName} gerekli`);
  }

  if (typeof value === "string" && value.trim().length === 0) {
    throw new ValidationError(`${fieldName} boş olamaz`);
  }
}

/**
 * Validate enum value
 *
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @param allowedValues - Array of allowed values
 * @throws ValidationError if value is not in allowed values
 *
 * @example
 * validateEnum("MALE", "gender", ["MALE", "FEMALE", "UNISEX"]) // OK
 * validateEnum("INVALID", "gender", ["MALE", "FEMALE"]) // Throws error
 */
export function validateEnum<T>(
  value: T | null | undefined,
  fieldName: string,
  allowedValues: T[]
): void {
  if (value === null || value === undefined) return;

  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${fieldName} geçersiz değer. İzin verilen değerler: ${allowedValues.join(
        ", "
      )}`
    );
  }
}

/**
 * Validate JSON string
 *
 * @param value - JSON string to validate
 * @param fieldName - Name of the field for error message
 * @throws ValidationError if JSON is invalid
 *
 * @example
 * validateJSON('{"key": "value"}', "metadata") // OK
 * validateJSON('{invalid}', "metadata") // Throws error
 */
export function validateJSON(
  value: string | null | undefined,
  fieldName: string
): void {
  if (!value) return;

  const trimmed = value.trim();
  if (trimmed === "") return;

  try {
    JSON.parse(trimmed);
  } catch (error) {
    throw new ValidationError(
      `${fieldName} geçerli bir JSON formatında olmalıdır`
    );
  }
}

/**
 * Validate date range
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @param fieldName - Name of the field for error message
 * @throws ValidationError if date range is invalid
 *
 * @example
 * validateDateRange(new Date("2024-01-01"), new Date("2024-12-31"), "period") // OK
 * validateDateRange(new Date("2024-12-31"), new Date("2024-01-01"), "period") // Throws error
 */
export function validateDateRange(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  fieldName: string
): void {
  if (!startDate || !endDate) return;

  if (startDate > endDate) {
    throw new ValidationError(
      `${fieldName}: Başlangıç tarihi bitiş tarihinden önce olmalıdır`
    );
  }
}

/**
 * Validate email format
 *
 * @param email - Email to validate
 * @param fieldName - Name of the field for error message
 * @throws ValidationError if email format is invalid
 *
 * @example
 * validateEmail("test@example.com", "email") // OK
 * validateEmail("invalid", "email") // Throws error
 */
export function validateEmail(
  email: string | null | undefined,
  fieldName: string
): void {
  if (!email) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError(
      `${fieldName} geçerli bir e-posta adresi olmalıdır`
    );
  }
}

/**
 * Validate URL format
 *
 * @param url - URL to validate
 * @param fieldName - Name of the field for error message
 * @throws ValidationError if URL format is invalid
 *
 * @example
 * validateURL("https://example.com", "website") // OK
 * validateURL("invalid", "website") // Throws error
 */
export function validateURL(
  url: string | null | undefined,
  fieldName: string
): void {
  if (!url) return;

  try {
    new URL(url);
  } catch (error) {
    throw new ValidationError(`${fieldName} geçerli bir URL olmalıdır`);
  }
}
