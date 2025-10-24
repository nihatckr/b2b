
   // Helper: Get sizes array from data
 export const getSizes = (data: unknown): string[] => {
    if (!data) return [];
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      const sizes = parsed.sizes || "";
      // If sizes is a string (comma-separated), split it
      if (typeof sizes === "string") {
        return sizes
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
      // If sizes is already an array, return it
      if (Array.isArray(sizes)) {
        return sizes;
      }
      return [];
    } catch {
      return [];
    }
  };


 // Helper: Get size category
 export const getSizeCategory = (data: unknown): string | null => {
    if (!data) return null;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return parsed.sizeCategory || null;
    } catch {
      return null;
    }
  };

  // Helper: Get regional standard
export  const getRegionalStandard = (data: unknown): string | null => {
    if (!data) return null;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return parsed.regionalStandard || null;
    } catch {
      return null;
    }
  };

  // Helper: Get target gender
export  const getTargetGender = (data: unknown): string | null => {
    if (!data) return null;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return parsed.targetGender || null;
    } catch {
      return null;
    }
  };
