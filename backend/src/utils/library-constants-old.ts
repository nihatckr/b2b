/**
 * Library Constants - Fit Categories and Standard Data
 * Used across library management system
 */

// ========================================
// FIT CATEGORIES & TYPES
// ========================================

export const FIT_CATEGORIES = {
  UPPER: {
    code: "UPPER",
    name: "Upper Body",
    description: "Shirts, Tops, Jackets, Blazers",
    icon: "👕",
    examples: ["Slim Fit Shirt", "Regular Fit T-Shirt", "Oversized Hoodie"],
  },
  LOWER: {
    code: "LOWER",
    name: "Lower Body",
    description: "Pants, Jeans, Shorts, Skirts",
    icon: "👖",
    examples: ["Skinny Jeans", "Regular Fit Pants", "Wide Leg Trousers"],
  },
  DRESS: {
    code: "DRESS",
    name: "Dresses & One-Piece",
    description: "Dresses, Jumpsuits, Rompers",
    icon: "👗",
    examples: ["A-Line Dress", "Bodycon Dress", "Maxi Dress"],
  },
  OUTERWEAR: {
    code: "OUTERWEAR",
    name: "Outerwear",
    description: "Coats, Jackets, Vests, Cardigans",
    icon: "🧥",
    examples: ["Slim Fit Blazer", "Oversized Coat", "Regular Fit Cardigan"],
  },
  UNDERWEAR: {
    code: "UNDERWEAR",
    name: "Underwear & Intimates",
    description: "Underwear, Bras, Shapewear",
    icon: "🩲",
    examples: ["Push-up Bra", "Boxer Brief", "High-waist Brief"],
  },
  FOOTWEAR: {
    code: "FOOTWEAR",
    name: "Footwear",
    description: "Shoes, Boots, Sandals",
    icon: "👟",
    examples: ["Slim Fit Boot", "Wide Fit Sneaker", "Regular Fit Sandal"],
  },
} as const;

// ========================================
// GENDER DEFINITIONS
// ========================================

export const GENDERS = {
  MEN: {
    code: "MEN",
    name: "Men",
    description: "Menswear fits and sizing",
    icon: "👨",
    sizeRanges: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    measurements: ["chest", "waist", "neck", "sleeve", "inseam"],
  },
  WOMEN: {
    code: "WOMEN",
    name: "Women",
    description: "Womenswear fits and sizing",
    icon: "👩",
    sizeRanges: [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "0",
      "2",
      "4",
      "6",
      "8",
      "10",
      "12",
      "14",
      "16",
      "18",
    ],
    measurements: ["bust", "waist", "hips", "sleeve", "inseam"],
  },
  GIRLS: {
    code: "GIRLS",
    name: "Girls",
    description: "Girls clothing fits",
    icon: "👧",
    sizeRanges: [
      "2T",
      "3T",
      "4T",
      "4",
      "5",
      "6",
      "6X",
      "7",
      "8",
      "10",
      "12",
      "14",
      "16",
    ],
    measurements: ["chest", "waist", "hips", "height"],
  },
  BOYS: {
    code: "BOYS",
    name: "Boys",
    description: "Boys clothing fits",
    icon: "👦",
    sizeRanges: [
      "2T",
      "3T",
      "4T",
      "4",
      "5",
      "6",
      "7",
      "8",
      "10",
      "12",
      "14",
      "16",
      "18",
      "20",
    ],
    measurements: ["chest", "waist", "neck", "height"],
  },
  UNISEX: {
    code: "UNISEX",
    name: "Unisex",
    description: "Gender-neutral fits",
    icon: "👤",
    sizeRanges: ["XS", "S", "M", "L", "XL", "XXL"],
    measurements: ["chest", "waist", "length"],
  },
} as const;

// ========================================
// STANDARD FIT TYPES (Gender-Specific)
// ========================================

export const STANDARD_FITS = {
  // ========================================
  // MEN'S FITS
  // ========================================

  // Men's Upper Body
  MEN_SLIM_UPPER: {
    code: "MEN_SLIM_UPPER",
    name: "Slim Fit",
    gender: "MEN",
    description: "Tailored close to body, modern masculine silhouette",
    characteristics: ["Close-fitting", "Tapered", "Modern", "Sharp"],
    bodyTypes: ["Athletic", "Slim", "Average"],
    categories: ["UPPER"],
  },

  MEN_REGULAR_UPPER: {
    code: "MEN_REGULAR_UPPER",
    name: "Regular Fit",
    gender: "MEN",
    description: "Classic comfortable fit for everyday wear",
    characteristics: ["Comfortable", "Classic", "Professional"],
    bodyTypes: ["All body types"],
    categories: ["UPPER"],
  },
  RELAXED: {
    code: "RELAXED",
    name: "Relaxed Fit",
    description: "Loose and comfortable, casual silhouette",
    characteristics: ["Loose", "Comfortable", "Casual"],
    bodyTypes: ["All body types", "Plus size"],
  },
  OVERSIZED: {
    code: "OVERSIZED",
    name: "Oversized",
    description: "Intentionally large, trend-focused fit",
    characteristics: ["Extra loose", "Trendy", "Statement"],
    bodyTypes: ["Fashion-forward", "All sizes"],
  },

  // Upper Body Specific
  FITTED: {
    code: "FITTED",
    name: "Fitted",
    description: "Very close to body, emphasizes silhouette",
    characteristics: ["Body-hugging", "Shaped", "Feminine"],
    bodyTypes: ["Slim", "Athletic"],
    categories: ["UPPER", "DRESS"],
  },
  LOOSE: {
    code: "LOOSE",
    name: "Loose Fit",
    description: "Relaxed through body, comfortable drape",
    characteristics: ["Flowing", "Comfortable", "Casual"],
    bodyTypes: ["All body types"],
    categories: ["UPPER", "DRESS"],
  },

  // Lower Body Specific
  SKINNY: {
    code: "SKINNY",
    name: "Skinny Fit",
    description: "Very tight fit, follows leg shape closely",
    characteristics: ["Form-fitting", "Tapered", "Modern"],
    bodyTypes: ["Slim", "Athletic"],
    categories: ["LOWER"],
  },
  STRAIGHT: {
    code: "STRAIGHT",
    name: "Straight Fit",
    description: "Straight cut from hip to hem, classic style",
    characteristics: ["Classic", "Uniform width", "Timeless"],
    bodyTypes: ["All body types"],
    categories: ["LOWER"],
  },
  WIDE_LEG: {
    code: "WIDE_LEG",
    name: "Wide Leg",
    description: "Wide through thigh and leg, flowing silhouette",
    characteristics: ["Wide", "Flowing", "Fashionable"],
    bodyTypes: ["All body types", "Petite", "Tall"],
    categories: ["LOWER"],
  },
  BOOTCUT: {
    code: "BOOTCUT",
    name: "Bootcut",
    description: "Slightly flared from knee, accommodates boots",
    characteristics: ["Slight flare", "Classic", "Versatile"],
    bodyTypes: ["All body types"],
    categories: ["LOWER"],
  },

  // Dress Specific
  A_LINE: {
    code: "A_LINE",
    name: "A-Line",
    description: "Fitted at waist, flares out like letter A",
    characteristics: ["Fitted waist", "Flared skirt", "Flattering"],
    bodyTypes: ["All body types", "Pear shape", "Apple shape"],
    categories: ["DRESS"],
  },
  BODYCON: {
    code: "BODYCON",
    name: "Bodycon",
    description: "Body-conscious, emphasizes curves",
    characteristics: ["Form-fitting", "Stretchy", "Curve-enhancing"],
    bodyTypes: ["Hourglass", "Athletic"],
    categories: ["DRESS"],
  },
  SHIFT: {
    code: "SHIFT",
    name: "Shift Dress",
    description: "Straight silhouette, minimal shaping",
    characteristics: ["Straight", "Minimal shaping", "Comfortable"],
    bodyTypes: ["All body types"],
    categories: ["DRESS"],
  },
} as const;

// ========================================
// BODY TYPES
// ========================================

export const BODY_TYPES = {
  PEAR: { name: "Pear", description: "Smaller shoulders, larger hips" },
  APPLE: { name: "Apple", description: "Fuller midsection" },
  HOURGLASS: {
    name: "Hourglass",
    description: "Balanced shoulders and hips, defined waist",
  },
  RECTANGLE: {
    name: "Rectangle",
    description: "Straight silhouette, minimal curves",
  },
  INVERTED_TRIANGLE: {
    name: "Inverted Triangle",
    description: "Broader shoulders, narrower hips",
  },
  ATHLETIC: {
    name: "Athletic",
    description: "Muscular build, defined shoulders",
  },
  PLUS_SIZE: { name: "Plus Size", description: "Fuller figure, size 14+" },
  PETITE: { name: "Petite", description: "Under 5'4\" height" },
  TALL: { name: "Tall", description: "Over 5'8\" height" },
} as const;

// ========================================
// SEASONALITY
// ========================================

export const SEASONALITY = {
  ALL_SEASON: {
    name: "All Season",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  SPRING_SUMMER: { name: "Spring/Summer", months: [3, 4, 5, 6, 7, 8] },
  FALL_WINTER: { name: "Fall/Winter", months: [9, 10, 11, 12, 1, 2] },
  SPRING: { name: "Spring", months: [3, 4, 5] },
  SUMMER: { name: "Summer", months: [6, 7, 8] },
  FALL: { name: "Fall", months: [9, 10, 11] },
  WINTER: { name: "Winter", months: [12, 1, 2] },
} as const;

// ========================================
// STANDARD PLATFORM FITS DATA
// ========================================

export const PLATFORM_STANDARD_FITS = [
  // Upper Body Fits
  {
    code: "STD-FIT-SLIM-UPPER",
    name: "Slim Fit (Upper)",
    description: "Tailored close to body for shirts, tops, jackets",
    data: {
      fitCategory: "UPPER",
      fitType: "SLIM",
      bodyTypes: ["Athletic", "Slim", "Average"],
      seasonality: "ALL_SEASON",
      characteristics: ["Close-fitting", "Tapered", "Modern"],
      measurements: {
        chest: "Body + 4-6cm",
        waist: "Body + 2-4cm",
        armhole: "Fitted",
      },
      sizingGuide: "Measure chest at fullest part, add 4-6cm for comfort",
    },
  },
  {
    code: "STD-FIT-REGULAR-UPPER",
    name: "Regular Fit (Upper)",
    description: "Classic comfortable fit for everyday wear",
    data: {
      fitCategory: "UPPER",
      fitType: "REGULAR",
      bodyTypes: ["All body types"],
      seasonality: "ALL_SEASON",
      characteristics: ["Comfortable", "Classic", "Versatile"],
      measurements: {
        chest: "Body + 8-12cm",
        waist: "Body + 6-10cm",
        armhole: "Comfortable",
      },
      sizingGuide: "Most popular fit, suitable for all occasions",
    },
  },
  {
    code: "STD-FIT-OVERSIZED-UPPER",
    name: "Oversized (Upper)",
    description: "Intentionally large, trend-focused fit",
    data: {
      fitCategory: "UPPER",
      fitType: "OVERSIZED",
      bodyTypes: ["Fashion-forward", "All sizes"],
      seasonality: "ALL_SEASON",
      characteristics: ["Extra loose", "Trendy", "Statement"],
      measurements: {
        chest: "Body + 16-20cm",
        waist: "Body + 14-18cm",
        armhole: "Oversized",
      },
      sizingGuide: "Intentionally large for street style look",
    },
  },

  // Lower Body Fits
  {
    code: "STD-FIT-SKINNY-LOWER",
    name: "Skinny Fit (Lower)",
    description: "Very tight fit, follows leg shape closely",
    data: {
      fitCategory: "LOWER",
      fitType: "SKINNY",
      bodyTypes: ["Slim", "Athletic"],
      seasonality: "ALL_SEASON",
      characteristics: ["Form-fitting", "Tapered", "Modern"],
      measurements: {
        waist: "True to size",
        hip: "Body + 2-4cm",
        thigh: "Body + 2-3cm",
        leg_opening: "14-16cm",
      },
      sizingGuide: "Size up if you prefer less tight fit",
    },
  },
  {
    code: "STD-FIT-STRAIGHT-LOWER",
    name: "Straight Fit (Lower)",
    description: "Straight cut from hip to hem, classic style",
    data: {
      fitCategory: "LOWER",
      fitType: "STRAIGHT",
      bodyTypes: ["All body types"],
      seasonality: "ALL_SEASON",
      characteristics: ["Classic", "Uniform width", "Timeless"],
      measurements: {
        waist: "True to size",
        hip: "Body + 4-6cm",
        thigh: "Body + 4-6cm",
        leg_opening: "18-20cm",
      },
      sizingGuide: "Classic fit that works for everyone",
    },
  },

  // Dress Fits
  {
    code: "STD-FIT-A-LINE-DRESS",
    name: "A-Line Dress",
    description: "Fitted at waist, flares out like letter A",
    data: {
      fitCategory: "DRESS",
      fitType: "A_LINE",
      bodyTypes: ["All body types", "Pear shape", "Apple shape"],
      seasonality: "ALL_SEASON",
      characteristics: ["Fitted waist", "Flared skirt", "Flattering"],
      measurements: {
        bust: "Body + 4-8cm",
        waist: "Body + 2-4cm",
        hip: "Flared - no restriction",
      },
      sizingGuide: "Most flattering dress silhouette for all body types",
    },
  },
  {
    code: "STD-FIT-BODYCON-DRESS",
    name: "Bodycon Dress",
    description: "Body-conscious, emphasizes curves",
    data: {
      fitCategory: "DRESS",
      fitType: "BODYCON",
      bodyTypes: ["Hourglass", "Athletic"],
      seasonality: "ALL_SEASON",
      characteristics: ["Form-fitting", "Stretchy", "Curve-enhancing"],
      measurements: {
        bust: "Body + 2-4cm",
        waist: "Body + 0-2cm",
        hip: "Body + 2-4cm",
      },
      sizingGuide: "Requires stretch fabric, very fitted silhouette",
    },
  },
];

// ========================================
// HELPER FUNCTIONS
// ========================================

export const getFitCategoryInfo = (categoryCode: string) => {
  return FIT_CATEGORIES[categoryCode as keyof typeof FIT_CATEGORIES] || null;
};

export const getStandardFitInfo = (fitCode: string) => {
  return STANDARD_FITS[fitCode as keyof typeof STANDARD_FITS] || null;
};

export const getFitsByCategory = (categoryCode: string) => {
  return Object.values(STANDARD_FITS).filter((fit) => {
    const fitWithCategories = fit as any;
    return (
      !fitWithCategories.categories ||
      fitWithCategories.categories.includes(categoryCode)
    );
  });
};

export const getBodyTypeInfo = (bodyTypeCode: string) => {
  return BODY_TYPES[bodyTypeCode as keyof typeof BODY_TYPES] || null;
};

export const getSeasonalityInfo = (seasonCode: string) => {
  return SEASONALITY[seasonCode as keyof typeof SEASONALITY] || null;
};
