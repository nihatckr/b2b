/**
 * String utility functions for text processing and formatting
 */

/**
 * Generate URL-friendly slug from a given name
 * Supports Turkish characters (ş, ğ, ü, ı, ö, ç)
 *
 * @param name - The input string to convert to slug
 * @returns URL-friendly slug string
 *
 * @example
 * generateSlug("Yaz Koleksiyonu 2024") // "yaz-koleksiyonu-2024"
 * generateSlug("Şık & Güzel Ürün!!") // "sik-guzel-urun"
 */
export function generateSlug(name: string): string {
  if (!name || typeof name !== "string") {
    return "";
  }

  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9şğüıöçŞĞÜİÖÇ]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate a string to a specified length
 *
 * @param str - The string to truncate
 * @param maxLength - Maximum length (default: 100)
 * @param suffix - Suffix to add when truncated (default: "...")
 * @returns Truncated string
 *
 * @example
 * truncateString("Çok uzun bir açıklama metni", 10) // "Çok uzun..."
 */
export function truncateString(
  str: string,
  maxLength: number = 100,
  suffix: string = "..."
): string {
  if (!str || str.length <= maxLength) {
    return str;
  }

  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter of a string
 *
 * @param str - The string to capitalize
 * @returns Capitalized string
 *
 * @example
 * capitalizeFirst("merhaba") // "Merhaba"
 */
export function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to title case
 *
 * @param str - The string to convert
 * @returns Title case string
 *
 * @example
 * toTitleCase("yaz koleksiyonu") // "Yaz Koleksiyonu"
 */
export function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => capitalizeFirst(word))
    .join(" ");
}
