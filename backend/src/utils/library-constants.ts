/**
 * Library Constants - Gender-Based Fit Categories and Standard Data
 * Used across library management system with gender-specific fits
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
// SIZE SYSTEMS (Product Type + Gender Based)
// ========================================

export const SIZE_SYSTEMS = {
  // Men's Sizing
  MEN_UPPER: {
    code: "MEN_UPPER",
    name: "Men's Upper Body",
    gender: "MEN",
    category: "UPPER",
    sizeRanges: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    measurements: {
      XS: { chest: "81-86cm", waist: "71-76cm", neck: "35-36cm" },
      S: { chest: "86-91cm", waist: "76-81cm", neck: "37-38cm" },
      M: { chest: "96-101cm", waist: "81-86cm", neck: "39-40cm" },
      L: { chest: "106-111cm", waist: "91-96cm", neck: "41-42cm" },
      XL: { chest: "116-121cm", waist: "101-106cm", neck: "43-44cm" },
      XXL: { chest: "126-131cm", waist: "111-116cm", neck: "45-46cm" },
      XXXL: { chest: "136-141cm", waist: "121-126cm", neck: "47-48cm" },
    },
    productTypes: ["shirts", "t-shirts", "jackets", "blazers", "sweaters"],
  },
  MEN_LOWER: {
    code: "MEN_LOWER",
    name: "Men's Lower Body",
    gender: "MEN",
    category: "LOWER",
    sizeRanges: ["28", "30", "32", "34", "36", "38", "40", "42", "44"],
    measurements: {
      "28": { waist: "71cm", hip: "81cm", inseam: "81cm" },
      "30": { waist: "76cm", hip: "86cm", inseam: "81cm" },
      "32": { waist: "81cm", hip: "91cm", inseam: "84cm" },
      "34": { waist: "86cm", hip: "96cm", inseam: "84cm" },
      "36": { waist: "91cm", hip: "101cm", inseam: "86cm" },
      "38": { waist: "96cm", hip: "106cm", inseam: "86cm" },
      "40": { waist: "101cm", hip: "111cm", inseam: "89cm" },
      "42": { waist: "106cm", hip: "116cm", inseam: "89cm" },
      "44": { waist: "111cm", hip: "121cm", inseam: "91cm" },
    },
    productTypes: ["pants", "jeans", "shorts", "trousers"],
  },

  // Women's Sizing
  WOMEN_UPPER: {
    code: "WOMEN_UPPER",
    name: "Women's Upper Body",
    gender: "WOMEN",
    category: "UPPER",
    sizeRanges: ["XS", "S", "M", "L", "XL", "XXL"],
    measurements: {
      XS: { bust: "78-81cm", waist: "61-64cm", hips: "86-89cm" },
      S: { bust: "81-86cm", waist: "64-69cm", hips: "89-94cm" },
      M: { bust: "86-91cm", waist: "69-74cm", hips: "94-99cm" },
      L: { bust: "91-97cm", waist: "74-80cm", hips: "99-105cm" },
      XL: { bust: "97-103cm", waist: "80-86cm", hips: "105-111cm" },
      XXL: { bust: "103-109cm", waist: "86-92cm", hips: "111-117cm" },
    },
    productTypes: ["blouses", "shirts", "t-shirts", "tops", "jackets"],
  },
  WOMEN_LOWER: {
    code: "WOMEN_LOWER",
    name: "Women's Lower Body",
    gender: "WOMEN",
    category: "LOWER",
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
    measurements: {
      XS: { waist: "61-64cm", hips: "86-89cm", inseam: "76cm" },
      S: { waist: "64-69cm", hips: "89-94cm", inseam: "76cm" },
      M: { waist: "69-74cm", hips: "94-99cm", inseam: "79cm" },
      L: { waist: "74-80cm", hips: "99-105cm", inseam: "79cm" },
      XL: { waist: "80-86cm", hips: "105-111cm", inseam: "81cm" },
      XXL: { waist: "86-92cm", hips: "111-117cm", inseam: "81cm" },
      "0": { waist: "61cm", hips: "86cm", inseam: "76cm" },
      "2": { waist: "64cm", hips: "89cm", inseam: "76cm" },
      "4": { waist: "66cm", hips: "91cm", inseam: "76cm" },
      "6": { waist: "69cm", hips: "94cm", inseam: "79cm" },
      "8": { waist: "71cm", hips: "96cm", inseam: "79cm" },
      "10": { waist: "74cm", hips: "99cm", inseam: "79cm" },
      "12": { waist: "76cm", hips: "101cm", inseam: "81cm" },
      "14": { waist: "79cm", hips: "104cm", inseam: "81cm" },
      "16": { waist: "81cm", hips: "106cm", inseam: "81cm" },
      "18": { waist: "84cm", hips: "109cm", inseam: "84cm" },
    },
    productTypes: ["pants", "jeans", "skirts", "shorts", "leggings"],
  },
  WOMEN_DRESS: {
    code: "WOMEN_DRESS",
    name: "Women's Dresses",
    gender: "WOMEN",
    category: "DRESS",
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
    measurements: {
      XS: {
        bust: "78-81cm",
        waist: "61-64cm",
        hips: "86-89cm",
        length: "91cm",
      },
      S: { bust: "81-86cm", waist: "64-69cm", hips: "89-94cm", length: "94cm" },
      M: { bust: "86-91cm", waist: "69-74cm", hips: "94-99cm", length: "96cm" },
      L: {
        bust: "91-97cm",
        waist: "74-80cm",
        hips: "99-105cm",
        length: "99cm",
      },
      XL: {
        bust: "97-103cm",
        waist: "80-86cm",
        hips: "105-111cm",
        length: "101cm",
      },
      XXL: {
        bust: "103-109cm",
        waist: "86-92cm",
        hips: "111-117cm",
        length: "104cm",
      },
      "0": { bust: "78cm", waist: "61cm", hips: "86cm", length: "91cm" },
      "2": { bust: "81cm", waist: "64cm", hips: "89cm", length: "91cm" },
      "4": { bust: "83cm", waist: "66cm", hips: "91cm", length: "94cm" },
      "6": { bust: "86cm", waist: "69cm", hips: "94cm", length: "94cm" },
      "8": { bust: "89cm", waist: "71cm", hips: "96cm", length: "96cm" },
      "10": { bust: "91cm", waist: "74cm", hips: "99cm", length: "96cm" },
      "12": { bust: "94cm", waist: "76cm", hips: "101cm", length: "99cm" },
      "14": { bust: "97cm", waist: "79cm", hips: "104cm", length: "99cm" },
      "16": { bust: "99cm", waist: "81cm", hips: "106cm", length: "101cm" },
      "18": { bust: "102cm", waist: "84cm", hips: "109cm", length: "101cm" },
    },
    productTypes: ["dresses", "jumpsuits", "rompers", "gowns"],
  },

  // Kids Sizing
  BOYS_GENERAL: {
    code: "BOYS_GENERAL",
    name: "Boys' Clothing",
    gender: "BOYS",
    category: "ALL",
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
    measurements: {
      "2T": { chest: "51cm", waist: "48cm", height: "86-91cm" },
      "3T": { chest: "53cm", waist: "51cm", height: "91-97cm" },
      "4T": { chest: "56cm", waist: "53cm", height: "97-102cm" },
      "4": { chest: "58cm", waist: "56cm", height: "102-107cm" },
      "5": { chest: "61cm", waist: "58cm", height: "107-112cm" },
      "6": { chest: "63cm", waist: "61cm", height: "112-117cm" },
      "7": { chest: "66cm", waist: "63cm", height: "117-122cm" },
      "8": { chest: "69cm", waist: "66cm", height: "122-127cm" },
      "10": { chest: "71cm", waist: "69cm", height: "132-137cm" },
      "12": { chest: "76cm", waist: "71cm", height: "142-147cm" },
      "14": { chest: "81cm", waist: "74cm", height: "152-157cm" },
      "16": { chest: "86cm", waist: "76cm", height: "162-167cm" },
      "18": { chest: "91cm", waist: "79cm", height: "167-172cm" },
      "20": { chest: "96cm", waist: "81cm", height: "172-177cm" },
    },
    productTypes: ["shirts", "pants", "t-shirts", "shorts", "jackets"],
  },
  GIRLS_GENERAL: {
    code: "GIRLS_GENERAL",
    name: "Girls' Clothing",
    gender: "GIRLS",
    category: "ALL",
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
    measurements: {
      "2T": { chest: "51cm", waist: "48cm", hips: "53cm", height: "86-91cm" },
      "3T": { chest: "53cm", waist: "51cm", hips: "56cm", height: "91-97cm" },
      "4T": { chest: "56cm", waist: "53cm", hips: "58cm", height: "97-102cm" },
      "4": { chest: "58cm", waist: "56cm", hips: "61cm", height: "102-107cm" },
      "5": { chest: "61cm", waist: "58cm", hips: "63cm", height: "107-112cm" },
      "6": { chest: "63cm", waist: "61cm", hips: "66cm", height: "112-117cm" },
      "6X": { chest: "66cm", waist: "63cm", hips: "69cm", height: "117-122cm" },
      "7": { chest: "69cm", waist: "66cm", hips: "71cm", height: "117-122cm" },
      "8": { chest: "71cm", waist: "69cm", hips: "74cm", height: "122-127cm" },
      "10": { chest: "76cm", waist: "71cm", hips: "79cm", height: "132-137cm" },
      "12": { chest: "81cm", waist: "74cm", hips: "84cm", height: "142-147cm" },
      "14": { chest: "86cm", waist: "76cm", hips: "89cm", height: "152-157cm" },
      "16": { chest: "91cm", waist: "79cm", hips: "94cm", height: "162-167cm" },
    },
    productTypes: [
      "shirts",
      "pants",
      "dresses",
      "skirts",
      "t-shirts",
      "shorts",
    ],
  },

  // Unisex Sizing
  UNISEX_GENERAL: {
    code: "UNISEX_GENERAL",
    name: "Unisex Clothing",
    gender: "UNISEX",
    category: "ALL",
    sizeRanges: ["XS", "S", "M", "L", "XL", "XXL"],
    measurements: {
      XS: { chest: "81-86cm", waist: "71-76cm" },
      S: { chest: "86-91cm", waist: "76-81cm" },
      M: { chest: "91-96cm", waist: "81-86cm" },
      L: { chest: "96-101cm", waist: "86-91cm" },
      XL: { chest: "101-106cm", waist: "91-96cm" },
      XXL: { chest: "106-111cm", waist: "96-101cm" },
    },
    productTypes: ["t-shirts", "hoodies", "sweatshirts", "casual wear"],
  },
} as const;

// ========================================
// GENDER DEFINITIONS (Enhanced)
// ========================================

export const GENDERS = [
  {
    key: "MEN",
    label: "Men",
    icon: "👨",
    measurements: ["chest", "waist", "length"],
    sizeSystems: ["MEN_UPPER", "MEN_LOWER"],
  },
  {
    key: "WOMEN",
    label: "Women",
    icon: "👩",
    measurements: ["bust", "waist", "hips", "length"],
    sizeSystems: ["WOMEN_UPPER", "WOMEN_LOWER", "WOMEN_DRESS"],
  },
  {
    key: "BOYS",
    label: "Boys",
    icon: "�",
    measurements: ["chest", "waist", "height", "age"],
    sizeSystems: ["BOYS_GENERAL"],
  },
  {
    key: "GIRLS",
    label: "Girls",
    icon: "�",
    measurements: ["chest", "waist", "hips", "height", "age"],
    sizeSystems: ["GIRLS_GENERAL"],
  },
  {
    key: "UNISEX",
    label: "Unisex",
    icon: "👤",
    measurements: ["chest", "waist", "length"],
    sizeSystems: ["UNISEX_GENERAL"],
  },
] as const;

// ========================================
// GENDER-SPECIFIC STANDARD FIT TYPES
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
  MEN_RELAXED_UPPER: {
    code: "MEN_RELAXED_UPPER",
    name: "Relaxed Fit",
    gender: "MEN",
    description: "Loose and comfortable, casual masculine style",
    characteristics: ["Loose", "Comfortable", "Casual"],
    bodyTypes: ["All body types", "Larger builds"],
    categories: ["UPPER"],
  },

  // Men's Lower Body
  MEN_SLIM_LOWER: {
    code: "MEN_SLIM_LOWER",
    name: "Slim Fit",
    gender: "MEN",
    description: "Modern tapered cut through leg",
    characteristics: ["Tapered", "Modern", "Sharp"],
    bodyTypes: ["Athletic", "Slim", "Average"],
    categories: ["LOWER"],
  },
  MEN_STRAIGHT_LOWER: {
    code: "MEN_STRAIGHT_LOWER",
    name: "Straight Fit",
    gender: "MEN",
    description: "Classic straight cut from hip to hem",
    characteristics: ["Classic", "Uniform width", "Timeless"],
    bodyTypes: ["All body types"],
    categories: ["LOWER"],
  },
  MEN_BOOTCUT_LOWER: {
    code: "MEN_BOOTCUT_LOWER",
    name: "Bootcut",
    gender: "MEN",
    description: "Slightly flared from knee, accommodates boots",
    characteristics: ["Slight flare", "Classic", "Western"],
    bodyTypes: ["All body types"],
    categories: ["LOWER"],
  },

  // ========================================
  // WOMEN'S FITS
  // ========================================

  // Women's Upper Body
  WOMEN_FITTED_UPPER: {
    code: "WOMEN_FITTED_UPPER",
    name: "Fitted",
    gender: "WOMEN",
    description: "Close to body, emphasizes feminine silhouette",
    characteristics: ["Body-hugging", "Shaped", "Feminine"],
    bodyTypes: ["Hourglass", "Athletic", "Pear"],
    categories: ["UPPER"],
  },
  WOMEN_SLIM_UPPER: {
    code: "WOMEN_SLIM_UPPER",
    name: "Slim Fit",
    gender: "WOMEN",
    description: "Tailored close to body with feminine lines",
    characteristics: ["Close-fitting", "Tailored", "Modern"],
    bodyTypes: ["Athletic", "Slim", "Hourglass"],
    categories: ["UPPER"],
  },
  WOMEN_REGULAR_UPPER: {
    code: "WOMEN_REGULAR_UPPER",
    name: "Regular Fit",
    gender: "WOMEN",
    description: "Comfortable classic fit with feminine cut",
    characteristics: ["Comfortable", "Classic", "Flattering"],
    bodyTypes: ["All body types"],
    categories: ["UPPER"],
  },
  WOMEN_LOOSE_UPPER: {
    code: "WOMEN_LOOSE_UPPER",
    name: "Loose Fit",
    gender: "WOMEN",
    description: "Relaxed through body, comfortable drape",
    characteristics: ["Flowing", "Comfortable", "Bohemian"],
    bodyTypes: ["All body types", "Apple", "Plus size"],
    categories: ["UPPER"],
  },

  // Women's Lower Body
  WOMEN_SKINNY_LOWER: {
    code: "WOMEN_SKINNY_LOWER",
    name: "Skinny Fit",
    gender: "WOMEN",
    description: "Very tight fit, follows leg shape closely",
    characteristics: ["Form-fitting", "Tapered", "Trendy"],
    bodyTypes: ["Slim", "Athletic", "Pear"],
    categories: ["LOWER"],
  },
  WOMEN_STRAIGHT_LOWER: {
    code: "WOMEN_STRAIGHT_LOWER",
    name: "Straight Fit",
    gender: "WOMEN",
    description: "Straight cut from hip to hem",
    characteristics: ["Classic", "Uniform width", "Professional"],
    bodyTypes: ["All body types"],
    categories: ["LOWER"],
  },
  WOMEN_WIDE_LEG_LOWER: {
    code: "WOMEN_WIDE_LEG_LOWER",
    name: "Wide Leg",
    gender: "WOMEN",
    description: "Wide through thigh and leg, flowing silhouette",
    characteristics: ["Wide", "Flowing", "Fashionable"],
    bodyTypes: ["All body types", "Petite", "Tall"],
    categories: ["LOWER"],
  },
  WOMEN_BOOTCUT_LOWER: {
    code: "WOMEN_BOOTCUT_LOWER",
    name: "Bootcut",
    gender: "WOMEN",
    description: "Slightly flared from knee with feminine lines",
    characteristics: ["Slight flare", "Classic", "Flattering"],
    bodyTypes: ["All body types", "Pear", "Apple"],
    categories: ["LOWER"],
  },

  // Women's Dresses
  WOMEN_A_LINE_DRESS: {
    code: "WOMEN_A_LINE_DRESS",
    name: "A-Line",
    gender: "WOMEN",
    description: "Fitted at waist, flares out like letter A",
    characteristics: ["Fitted waist", "Flared skirt", "Flattering"],
    bodyTypes: ["All body types", "Pear shape", "Apple shape"],
    categories: ["DRESS"],
  },
  WOMEN_BODYCON_DRESS: {
    code: "WOMEN_BODYCON_DRESS",
    name: "Bodycon",
    gender: "WOMEN",
    description: "Body-conscious, emphasizes curves",
    characteristics: ["Form-fitting", "Stretchy", "Curve-enhancing"],
    bodyTypes: ["Hourglass", "Athletic"],
    categories: ["DRESS"],
  },
  WOMEN_SHIFT_DRESS: {
    code: "WOMEN_SHIFT_DRESS",
    name: "Shift Dress",
    gender: "WOMEN",
    description: "Straight silhouette, minimal shaping",
    characteristics: ["Straight", "Minimal shaping", "Professional"],
    bodyTypes: ["All body types", "Apple", "Rectangle"],
    categories: ["DRESS"],
  },
  WOMEN_FIT_FLARE_DRESS: {
    code: "WOMEN_FIT_FLARE_DRESS",
    name: "Fit & Flare",
    gender: "WOMEN",
    description: "Fitted bodice, flared skirt",
    characteristics: ["Fitted top", "Flared bottom", "Feminine"],
    bodyTypes: ["All body types", "Pear", "Apple"],
    categories: ["DRESS"],
  },

  // ========================================
  // UNISEX FITS
  // ========================================

  UNISEX_REGULAR: {
    code: "UNISEX_REGULAR",
    name: "Regular Fit",
    gender: "UNISEX",
    description: "Gender-neutral comfortable fit",
    characteristics: ["Comfortable", "Neutral", "Versatile"],
    bodyTypes: ["All body types"],
    categories: ["UPPER", "LOWER"],
  },
  UNISEX_OVERSIZED: {
    code: "UNISEX_OVERSIZED",
    name: "Oversized",
    gender: "UNISEX",
    description: "Intentionally large, streetwear style",
    characteristics: ["Extra loose", "Trendy", "Street style"],
    bodyTypes: ["All body types"],
    categories: ["UPPER"],
  },

  // ========================================
  // KIDS FITS (GIRLS)
  // ========================================

  GIRLS_REGULAR: {
    code: "GIRLS_REGULAR",
    name: "Regular Fit",
    gender: "GIRLS",
    description: "Comfortable fit for active girls",
    characteristics: ["Comfortable", "Age-appropriate", "Playful"],
    bodyTypes: ["All body types"],
    categories: ["UPPER", "LOWER", "DRESS"],
  },
  GIRLS_A_LINE_DRESS: {
    code: "GIRLS_A_LINE_DRESS",
    name: "A-Line Dress",
    gender: "GIRLS",
    description: "Classic A-line for girls",
    characteristics: ["Fitted waist", "Flared skirt", "Pretty"],
    bodyTypes: ["All body types"],
    categories: ["DRESS"],
  },

  // ========================================
  // KIDS FITS (BOYS)
  // ========================================

  BOYS_REGULAR: {
    code: "BOYS_REGULAR",
    name: "Regular Fit",
    gender: "BOYS",
    description: "Comfortable fit for active boys",
    characteristics: ["Comfortable", "Durable", "Active"],
    bodyTypes: ["All body types"],
    categories: ["UPPER", "LOWER"],
  },
  BOYS_SLIM: {
    code: "BOYS_SLIM",
    name: "Slim Fit",
    gender: "BOYS",
    description: "Modern tapered fit for boys",
    characteristics: ["Modern", "Tapered", "Smart"],
    bodyTypes: ["Slim", "Average"],
    categories: ["UPPER", "LOWER"],
  },
} as const;

// ========================================
// BODY TYPES (Gender-specific)
// ========================================

export const BODY_TYPES = {
  // Women's Body Types
  PEAR: {
    name: "Pear",
    description: "Smaller shoulders, larger hips",
    gender: "WOMEN",
  },
  APPLE: { name: "Apple", description: "Fuller midsection", gender: "WOMEN" },
  HOURGLASS: {
    name: "Hourglass",
    description: "Balanced shoulders and hips, defined waist",
    gender: "WOMEN",
  },
  RECTANGLE: {
    name: "Rectangle",
    description: "Straight silhouette, minimal curves",
    gender: "WOMEN",
  },
  INVERTED_TRIANGLE: {
    name: "Inverted Triangle",
    description: "Broader shoulders, narrower hips",
    gender: "WOMEN",
  },

  // Men's Body Types
  ATHLETIC: {
    name: "Athletic",
    description: "Muscular build, defined shoulders",
    gender: "MEN",
  },
  SLIM: {
    name: "Slim",
    description: "Lean build, narrow frame",
    gender: "MEN",
  },
  AVERAGE: {
    name: "Average",
    description: "Standard proportions",
    gender: "MEN",
  },
  LARGER_BUILD: {
    name: "Larger Build",
    description: "Fuller frame, broader shoulders",
    gender: "MEN",
  },

  // Universal
  PLUS_SIZE: {
    name: "Plus Size",
    description: "Fuller figure, size 14+",
    gender: "ALL",
  },
  PETITE: { name: "Petite", description: "Under 5'4\" height", gender: "ALL" },
  TALL: { name: "Tall", description: "Over 5'8\" height", gender: "ALL" },
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
// STANDARD PLATFORM FITS DATA (Gender-Based)
// ========================================

export const PLATFORM_STANDARD_FITS = [
  // Men's Fits
  {
    code: "STD-FIT-MEN-SLIM-UPPER",
    name: "Slim Fit (Men)",
    description: "Tailored close to body for men's shirts, tops, jackets",
    data: {
      fitCategory: "UPPER",
      fitType: "SLIM",
      gender: "MEN",
      bodyTypes: ["Athletic", "Slim", "Average"],
      seasonality: "ALL_SEASON",
      characteristics: ["Close-fitting", "Tapered", "Modern", "Sharp"],
      measurements: {
        chest: "Body + 4-6cm",
        waist: "Body + 2-4cm",
        armhole: "Fitted",
      },
      sizingGuide: "Measure chest at fullest part, add 4-6cm for comfort",
    },
  },
  {
    code: "STD-FIT-MEN-REGULAR-UPPER",
    name: "Regular Fit (Men)",
    description: "Classic comfortable fit for men's everyday wear",
    data: {
      fitCategory: "UPPER",
      fitType: "REGULAR",
      gender: "MEN",
      bodyTypes: ["All body types"],
      seasonality: "ALL_SEASON",
      characteristics: ["Comfortable", "Classic", "Professional"],
      measurements: {
        chest: "Body + 8-12cm",
        waist: "Body + 6-10cm",
        armhole: "Comfortable",
      },
      sizingGuide: "Most popular men's fit, suitable for all occasions",
    },
  },
  {
    code: "STD-FIT-MEN-STRAIGHT-LOWER",
    name: "Straight Fit Pants (Men)",
    description: "Classic straight cut for men's pants",
    data: {
      fitCategory: "LOWER",
      fitType: "STRAIGHT",
      gender: "MEN",
      bodyTypes: ["All body types"],
      seasonality: "ALL_SEASON",
      characteristics: ["Classic", "Uniform width", "Timeless"],
      measurements: {
        waist: "True to size",
        hip: "Body + 4-6cm",
        thigh: "Body + 4-6cm",
        leg_opening: "18-20cm",
      },
      sizingGuide: "Classic men's fit that works for everyone",
    },
  },

  // Women's Fits
  {
    code: "STD-FIT-WOMEN-FITTED-UPPER",
    name: "Fitted (Women)",
    description: "Close to body, emphasizes feminine silhouette",
    data: {
      fitCategory: "UPPER",
      fitType: "FITTED",
      gender: "WOMEN",
      bodyTypes: ["Hourglass", "Athletic", "Pear"],
      seasonality: "ALL_SEASON",
      characteristics: ["Body-hugging", "Shaped", "Feminine"],
      measurements: {
        bust: "Body + 2-4cm",
        waist: "Body + 0-2cm",
        armhole: "Fitted",
      },
      sizingGuide: "Emphasizes feminine curves, size up for comfort",
    },
  },
  {
    code: "STD-FIT-WOMEN-A-LINE-DRESS",
    name: "A-Line Dress (Women)",
    description: "Fitted at waist, flares out like letter A",
    data: {
      fitCategory: "DRESS",
      fitType: "A_LINE",
      gender: "WOMEN",
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
    code: "STD-FIT-WOMEN-SKINNY-LOWER",
    name: "Skinny Fit (Women)",
    description: "Very tight fit, follows leg shape closely",
    data: {
      fitCategory: "LOWER",
      fitType: "SKINNY",
      gender: "WOMEN",
      bodyTypes: ["Slim", "Athletic", "Pear"],
      seasonality: "ALL_SEASON",
      characteristics: ["Form-fitting", "Tapered", "Trendy"],
      measurements: {
        waist: "True to size",
        hip: "Body + 2-4cm",
        thigh: "Body + 2-3cm",
        leg_opening: "12-14cm",
      },
      sizingGuide: "Size up if you prefer less tight fit",
    },
  },
];

// ========================================
// HELPER FUNCTIONS
// ========================================

export const getFitCategoryInfo = (categoryCode: string) => {
  return FIT_CATEGORIES[categoryCode as keyof typeof FIT_CATEGORIES] || null;
};

export const getGenderInfo = (genderCode: string) => {
  return GENDERS.find((g) => g.key === genderCode) || null;
};

export const getStandardFitInfo = (fitCode: string) => {
  return STANDARD_FITS[fitCode as keyof typeof STANDARD_FITS] || null;
};

// Get fits by gender and category
export const getFitsByGenderAndCategory = (
  gender: string,
  categoryCode?: string
) => {
  return Object.values(STANDARD_FITS).filter((fit) => {
    const matchesGender = fit.gender === gender || fit.gender === "UNISEX";
    const fitWithCategories = fit as any;
    const matchesCategory =
      !categoryCode ||
      (fitWithCategories.categories &&
        fitWithCategories.categories.includes(categoryCode));
    return matchesGender && matchesCategory;
  });
};

// Get fits by category (all genders)
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

// Get appropriate size ranges for gender (from size systems)
export const getSizeRangesForGender = (gender: string) => {
  const genderInfo = getGenderInfo(gender);
  if (!genderInfo?.sizeSystems) return [];

  // Get size ranges from all size systems for this gender
  return genderInfo.sizeSystems.flatMap((systemKey) => {
    const sizeSystem = SIZE_SYSTEMS[systemKey as keyof typeof SIZE_SYSTEMS];
    return sizeSystem?.sizeRanges || [];
  });
};

// Get appropriate measurements for gender
export const getMeasurementsForGender = (gender: string) => {
  const genderInfo = getGenderInfo(gender);
  return genderInfo?.measurements || [];
};

// ========================================
// SIZE SYSTEM HELPER FUNCTIONS
// ========================================

// Get size system by gender and category
export const getSizeSystemByGenderAndCategory = (
  gender: string,
  category: string
) => {
  const systemKey = `${gender}_${category}` as keyof typeof SIZE_SYSTEMS;

  // Special cases for kids (they have general systems)
  if (gender === "BOYS" || gender === "GIRLS") {
    const generalKey = `${gender}_GENERAL` as keyof typeof SIZE_SYSTEMS;
    return SIZE_SYSTEMS[generalKey] || null;
  }

  // For unisex
  if (gender === "UNISEX") {
    return SIZE_SYSTEMS.UNISEX_GENERAL || null;
  }

  return SIZE_SYSTEMS[systemKey] || null;
};

// Get all size systems for a gender
export const getSizeSystemsForGender = (gender: string) => {
  const genderInfo = getGenderInfo(gender);
  if (!genderInfo?.sizeSystems) return [];

  return genderInfo.sizeSystems
    .map((systemKey) => SIZE_SYSTEMS[systemKey as keyof typeof SIZE_SYSTEMS])
    .filter(Boolean);
};

// Get appropriate sizes for gender and category
export const getSizesForGenderAndCategory = (
  gender: string,
  category: string
) => {
  const sizeSystem = getSizeSystemByGenderAndCategory(gender, category);
  return sizeSystem?.sizeRanges || [];
};

// Get measurements for specific size in a system
export const getMeasurementsForSize = (
  gender: string,
  category: string,
  size: string
) => {
  const sizeSystem = getSizeSystemByGenderAndCategory(gender, category);
  if (!sizeSystem?.measurements) return null;

  const measurements = sizeSystem.measurements as any;
  return measurements[size] || null;
};

// Check if a product type is valid for gender/category combination
export const isValidProductTypeForGenderCategory = (
  gender: string,
  category: string,
  productType: string
) => {
  const sizeSystem = getSizeSystemByGenderAndCategory(gender, category);
  if (!sizeSystem?.productTypes) return true; // Allow if no restriction

  return (sizeSystem.productTypes as readonly string[]).includes(
    productType.toLowerCase()
  );
};

// Get product types for gender and category
export const getProductTypesForGenderCategory = (
  gender: string,
  category: string
): readonly string[] => {
  const sizeSystem = getSizeSystemByGenderAndCategory(gender, category);
  return sizeSystem?.productTypes || [];
};

// ========================================
// NEW HELPER FUNCTIONS FOR ENHANCED FEATURES
// ========================================

// Get measurement points for fit category
export const getMeasurementPointsForCategory = (category: string) => {
  return MEASUREMENT_POINTS[category as keyof typeof MEASUREMENT_POINTS] || [];
};

// Get standard tolerance for measurement point
export const getToleranceForMeasurementPoint = (point: string) => {
  return (
    MEASUREMENT_TOLERANCES[point as keyof typeof MEASUREMENT_TOLERANCES] ||
    "±1cm"
  );
};

// Get regional standard info
export const getRegionalStandardInfo = (regionCode: string) => {
  return (
    REGIONAL_STANDARDS[regionCode as keyof typeof REGIONAL_STANDARDS] || null
  );
};

// Get BOM component type info
export const getBOMComponentTypeInfo = (typeCode: string) => {
  return BOM_COMPONENT_TYPES.find((type) => type.key === typeCode) || null;
};

// Get appropriate units for BOM component type
export const getUnitsForBOMComponentType = (typeCode: string) => {
  const componentType = getBOMComponentTypeInfo(typeCode);
  return componentType?.units || ["pieces"];
};

// Get standard waste percentage for component type
export const getStandardWastePercentage = (componentType: string) => {
  return (
    STANDARD_WASTE_PERCENTAGES[
      componentType as keyof typeof STANDARD_WASTE_PERCENTAGES
    ] || 5
  );
};

// Get measurement mode info
export const getMeasurementModeInfo = (mode: string) => {
  return MEASUREMENT_MODES.find((m) => m.key === mode) || null;
};

// Get size system type info
export const getSizeSystemTypeInfo = (type: string) => {
  return SIZE_SYSTEM_TYPES.find((t) => t.key === type) || null;
};

// Get BOM unit info
export const getBOMUnitInfo = (unit: string) => {
  return BOM_UNITS.find((u) => u.key === unit) || null;
};

// Get placement option info
export const getPlacementOptionInfo = (placement: string) => {
  return BOM_PLACEMENT_OPTIONS.find((p) => p.key === placement) || null;
};

// ========================================
// FIT MEASUREMENT POINTS
// ========================================

// Standard measurement points for different fit categories
export const MEASUREMENT_POINTS = {
  UPPER: [
    { point: "CHEST", label: "Chest/Bust", unit: "cm", critical: true },
    { point: "WAIST", label: "Waist", unit: "cm", critical: true },
    { point: "SHOULDER", label: "Shoulder", unit: "cm", critical: true },
    {
      point: "SLEEVE_LENGTH",
      label: "Sleeve Length",
      unit: "cm",
      critical: false,
    },
    { point: "BACK_LENGTH", label: "Back Length", unit: "cm", critical: false },
    { point: "ARMHOLE", label: "Armhole", unit: "cm", critical: false },
    { point: "NECK", label: "Neck", unit: "cm", critical: false },
  ],
  LOWER: [
    { point: "WAIST", label: "Waist", unit: "cm", critical: true },
    { point: "HIP", label: "Hip", unit: "cm", critical: true },
    { point: "THIGH", label: "Thigh", unit: "cm", critical: true },
    { point: "INSEAM", label: "Inseam", unit: "cm", critical: false },
    { point: "OUTSEAM", label: "Outseam", unit: "cm", critical: false },
    { point: "KNEE", label: "Knee", unit: "cm", critical: false },
    { point: "LEG_OPENING", label: "Leg Opening", unit: "cm", critical: false },
    { point: "RISE", label: "Rise", unit: "cm", critical: false },
  ],
  DRESS: [
    { point: "BUST", label: "Bust", unit: "cm", critical: true },
    { point: "WAIST", label: "Waist", unit: "cm", critical: true },
    { point: "HIP", label: "Hip", unit: "cm", critical: true },
    { point: "LENGTH", label: "Total Length", unit: "cm", critical: true },
    { point: "SHOULDER", label: "Shoulder", unit: "cm", critical: true },
    {
      point: "SLEEVE_LENGTH",
      label: "Sleeve Length",
      unit: "cm",
      critical: false,
    },
    { point: "ARMHOLE", label: "Armhole", unit: "cm", critical: false },
  ],
  OUTERWEAR: [
    { point: "CHEST", label: "Chest", unit: "cm", critical: true },
    { point: "WAIST", label: "Waist", unit: "cm", critical: false },
    { point: "SHOULDER", label: "Shoulder", unit: "cm", critical: true },
    {
      point: "SLEEVE_LENGTH",
      label: "Sleeve Length",
      unit: "cm",
      critical: true,
    },
    { point: "BACK_LENGTH", label: "Back Length", unit: "cm", critical: true },
    { point: "ARMHOLE", label: "Armhole", unit: "cm", critical: false },
  ],
} as const;

// Measurement mode types
export const MEASUREMENT_MODES = [
  {
    key: "BODY",
    label: "Body Measurement",
    description: "Measure the body directly",
  },
  {
    key: "GARMENT",
    label: "Garment Measurement",
    description: "Measure the finished garment",
  },
] as const;

// Standard tolerances for different measurement points
export const MEASUREMENT_TOLERANCES = {
  CHEST: "±1cm",
  BUST: "±1cm",
  WAIST: "±1cm",
  HIP: "±1cm",
  SHOULDER: "±0.5cm",
  SLEEVE_LENGTH: "±1cm",
  BACK_LENGTH: "±1cm",
  THIGH: "±1cm",
  INSEAM: "±1.5cm",
  OUTSEAM: "±1.5cm",
  LENGTH: "±1.5cm",
  ARMHOLE: "±0.5cm",
  NECK: "±0.5cm",
  KNEE: "±1cm",
  LEG_OPENING: "±0.5cm",
  RISE: "±1cm",
} as const;

// ========================================
// REGIONAL SIZE STANDARDS
// ========================================

export const REGIONAL_STANDARDS = {
  EU: {
    name: "European Union",
    code: "EU",
    description: "Standard European sizing",
    measurementUnit: "cm",
  },
  US: {
    name: "United States",
    code: "US",
    description: "US sizing standards",
    measurementUnit: "inches",
  },
  UK: {
    name: "United Kingdom",
    code: "UK",
    description: "British sizing standards",
    measurementUnit: "inches",
  },
  JP: {
    name: "Japan",
    code: "JP",
    description: "Japanese sizing standards",
    measurementUnit: "cm",
  },
  CN: {
    name: "China",
    code: "CN",
    description: "Chinese sizing standards",
    measurementUnit: "cm",
  },
  KR: {
    name: "South Korea",
    code: "KR",
    description: "Korean sizing standards",
    measurementUnit: "cm",
  },
  TR: {
    name: "Turkey",
    code: "TR",
    description: "Turkish sizing standards",
    measurementUnit: "cm",
  },
} as const;

export const SIZE_SYSTEM_TYPES = [
  { key: "ALPHA", label: "Alpha Sizing", description: "XS, S, M, L, XL..." },
  { key: "NUMERIC", label: "Numeric Sizing", description: "36, 38, 40, 42..." },
  { key: "INCHES", label: "Inch Sizing", description: "28, 30, 32, 34..." },
  {
    key: "CHILDREN",
    label: "Children Sizing",
    description: "2T, 3T, 4, 5, 6...",
  },
] as const;

// ========================================
// BOM (BILL OF MATERIALS) CONSTANTS
// ========================================

export const BOM_COMPONENT_TYPES = [
  {
    key: "FABRIC",
    label: "Fabrics",
    icon: "🧵",
    description: "Main fabrics, linings, interfacing",
    units: ["meters", "yards", "kg", "pieces"],
  },
  {
    key: "MATERIAL",
    label: "Materials & Accessories",
    icon: "🔘",
    description: "Buttons, zippers, labels, threads",
    units: ["pieces", "meters", "sets", "pairs"],
  },
  {
    key: "LABOR",
    label: "Labor Operations",
    icon: "✂️",
    description: "Sewing, cutting, finishing operations",
    units: ["hours", "minutes", "operations"],
  },
  {
    key: "OTHER",
    label: "Other Components",
    icon: "📦",
    description: "Packaging, accessories, misc",
    units: ["pieces", "sets", "units"],
  },
] as const;

export const BOM_UNITS = [
  { key: "meters", label: "Meters", type: "length" },
  { key: "yards", label: "Yards", type: "length" },
  { key: "cm", label: "Centimeters", type: "length" },
  { key: "pieces", label: "Pieces", type: "count" },
  { key: "sets", label: "Sets", type: "count" },
  { key: "pairs", label: "Pairs", type: "count" },
  { key: "kg", label: "Kilograms", type: "weight" },
  { key: "grams", label: "Grams", type: "weight" },
  { key: "hours", label: "Hours", type: "time" },
  { key: "minutes", label: "Minutes", type: "time" },
  { key: "operations", label: "Operations", type: "process" },
  { key: "units", label: "Units", type: "count" },
] as const;

export const BOM_PLACEMENT_OPTIONS = [
  { key: "front", label: "Front" },
  { key: "back", label: "Back" },
  { key: "sleeve", label: "Sleeve" },
  { key: "collar", label: "Collar" },
  { key: "pocket", label: "Pocket" },
  { key: "waistband", label: "Waistband" },
  { key: "hem", label: "Hem" },
  { key: "all", label: "All Over" },
  { key: "left", label: "Left Side" },
  { key: "right", label: "Right Side" },
  { key: "center", label: "Center" },
] as const;

// Standard waste percentages by component type
export const STANDARD_WASTE_PERCENTAGES = {
  FABRIC: 10, // 10% fabric waste typical
  MATERIAL: 2, // 2% material waste
  LABOR: 0, // No waste for labor
  OTHER: 5, // 5% other components
} as const;

// ========================================
// ACCESSORY CATEGORIES
// ========================================

// Accessory categories for grouping
export const ACCESSORY_CATEGORIES = [
  {
    key: "buttons",
    label: "Buttons",
    icon: "🔘",
    description: "Plastic, metal, wood buttons",
  },
  {
    key: "zippers",
    label: "Zippers",
    icon: "🤐",
    description: "Metal, plastic, invisible zippers",
  },
  {
    key: "labels",
    label: "Labels",
    icon: "🏷️",
    description: "Woven, printed, care labels",
  },
  {
    key: "hardware",
    label: "Hardware",
    icon: "🔧",
    description: "Buckles, rings, eyelets",
  },
  {
    key: "elastic",
    label: "Elastic & Cord",
    icon: "🪢",
    description: "Elastic bands, drawstrings",
  },
  {
    key: "threads",
    label: "Threads",
    icon: "🧵",
    description: "Sewing threads, embroidery",
  },
  {
    key: "trims",
    label: "Trims",
    icon: "✨",
    description: "Lace, ribbons, tapes",
  },
  {
    key: "other",
    label: "Other",
    icon: "📦",
    description: "Misc accessories",
  },
] as const;
