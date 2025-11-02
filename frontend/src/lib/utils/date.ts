/**
 * Date formatting utilities for consistent timezone handling
 */

export const formatters = {
  /**
   * Format date to Turkish locale with Istanbul timezone
   */
  toTurkishDate: (date: string | Date | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("tr-TR", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  /**
   * Format date and time to Turkish locale with Istanbul timezone
   */
  toTurkishDateTime: (date: string | Date | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  toRelativeTime: (date: string | Date | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    // Debug logging
    // Debug: console.log("🔍 toRelativeTime debug:", { input: date, diffInSeconds });

    if (diffInSeconds < 60) return "Az önce";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} gün önce`;

    return formatters.toTurkishDate(date);
  },

  /**
   * Debug: Show all timezone info for troubleshooting
   */
  debugTime: (date: string | Date | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    return `
UTC: ${d.toISOString()}
Turkish: ${d.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
Browser: ${d.toLocaleString()}
Timestamp: ${d.getTime()}
    `.trim();
  },
};

// Export individual functions for convenience
export const { toTurkishDate, toTurkishDateTime, toRelativeTime, debugTime } =
  formatters;
