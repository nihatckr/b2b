/**
 * Input Sanitization Utilities
 * Prevents XSS and SQL injection attacks
 */

/**
 * Sanitize string input
 * Removes HTML tags and trims whitespace
 */
export function sanitizeString(
  input: string | null | undefined
): string | null {
  if (!input) return null;

  return (
    input
      // Remove script tags and content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remove all HTML tags
      .replace(/<[^>]+>/g, "")
      // Remove SQL injection attempts
      .replace(/('|(--)|;|\/\*|\*\/|xp_|sp_)/gi, "")
      // Trim whitespace
      .trim()
  );
}

/**
 * Sanitize email input
 * Validates and normalizes email format
 */
export function sanitizeEmail(input: string | null | undefined): string | null {
  if (!input) return null;

  const sanitized = sanitizeString(input);
  if (!sanitized) return null;

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return null;
  }

  // Normalize to lowercase
  return sanitized.toLowerCase();
}

/**
 * Sanitize phone number
 * Removes non-numeric characters except + at start
 */
export function sanitizePhone(input: string | null | undefined): string | null {
  if (!input) return null;

  // Keep only numbers and + at the beginning
  const sanitized = input.replace(/[^\d+]/g, "");

  // Ensure + is only at the start
  if (sanitized.startsWith("+")) {
    return "+" + sanitized.slice(1).replace(/\+/g, "");
  }

  return sanitized.replace(/\+/g, "");
}

/**
 * Sanitize URL
 * Validates and sanitizes URL input
 */
export function sanitizeUrl(input: string | null | undefined): string | null {
  if (!input) return null;

  const sanitized = sanitizeString(input);
  if (!sanitized) return null;

  try {
    const url = new URL(sanitized);
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize integer
 * Ensures input is a valid integer
 */
export function sanitizeInt(
  input: number | string | null | undefined
): number | null {
  if (input === null || input === undefined) return null;

  const num = typeof input === "string" ? parseInt(input, 10) : input;

  if (isNaN(num) || !Number.isInteger(num)) {
    return null;
  }

  return num;
}

/**
 * Sanitize float
 * Ensures input is a valid float
 */
export function sanitizeFloat(
  input: number | string | null | undefined
): number | null {
  if (input === null || input === undefined) return null;

  const num = typeof input === "string" ? parseFloat(input) : input;

  if (isNaN(num)) {
    return null;
  }

  return num;
}

/**
 * Sanitize boolean
 * Converts various truthy/falsy values to boolean
 */
export function sanitizeBoolean(
  input: boolean | string | number | null | undefined
): boolean | null {
  if (input === null || input === undefined) return null;

  if (typeof input === "boolean") return input;

  if (typeof input === "string") {
    const lower = input.toLowerCase();
    if (["true", "1", "yes"].includes(lower)) return true;
    if (["false", "0", "no"].includes(lower)) return false;
  }

  if (typeof input === "number") {
    return input !== 0;
  }

  return null;
}

/**
 * Sanitize object recursively
 * Sanitizes all string values in an object
 */
export function sanitizeObject<T extends Record<string, any>>(input: T): T {
  const sanitized = { ...input };

  for (const key in sanitized) {
    const value = sanitized[key];

    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value) as any;
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string"
          ? sanitizeString(item)
          : typeof item === "object"
          ? sanitizeObject(item)
          : item
      ) as any;
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize JSON string
 * Returns parsed object or null if invalid
 */
export function sanitizeJson(input: string | null | undefined): any | null {
  if (!input) return null;

  const sanitized = sanitizeString(input);
  if (!sanitized) return null;

  try {
    return JSON.parse(sanitized);
  } catch {
    return null;
  }
}

/**
 * Generic sanitizer with type detection
 * Automatically detects type and applies appropriate sanitization
 */
export function sanitize(input: any): any {
  if (input === null || input === undefined) return null;

  if (typeof input === "string") {
    return sanitizeString(input);
  }

  if (typeof input === "number") {
    return Number.isInteger(input) ? sanitizeInt(input) : sanitizeFloat(input);
  }

  if (typeof input === "boolean") {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(sanitize);
  }

  if (typeof input === "object") {
    return sanitizeObject(input);
  }

  return input;
}
