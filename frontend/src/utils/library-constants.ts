// Frontend copy of backend constants for library management
// Keep in sync with /backend/src/utils/library-constants.ts

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
    icon: "👦",
    measurements: ["chest", "waist", "height", "age"],
    sizeSystems: ["BOYS_GENERAL"],
  },
  {
    key: "GIRLS",
    label: "Girls",
    icon: "👧",
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

export const SIZE_SYSTEMS = {
  MEN_UPPER: {
    label: "Men's Upper Body",
    sizeRanges: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    productTypes: ["shirts", "t-shirts", "jackets", "blazers", "sweaters"],
    measurements: {
      XS: { chest: "86-91", length: "68" },
      S: { chest: "91-97", length: "70" },
      M: { chest: "97-102", length: "72" },
      L: { chest: "102-107", length: "74" },
      XL: { chest: "107-112", length: "76" },
      "2XL": { chest: "112-117", length: "78" },
      "3XL": { chest: "117-122", length: "80" },
    },
  },
  MEN_LOWER: {
    label: "Men's Lower Body",
    sizeRanges: ["28", "30", "32", "34", "36", "38", "40", "42"],
    productTypes: ["pants", "jeans", "shorts", "trousers"],
    measurements: {
      "28": { waist: "71", length: "81" },
      "30": { waist: "76", length: "81" },
      "32": { waist: "81", length: "81" },
      "34": { waist: "86", length: "81" },
      "36": { waist: "91", length: "81" },
      "38": { waist: "97", length: "81" },
      "40": { waist: "102", length: "81" },
      "42": { waist: "107", length: "81" },
    },
  },
  WOMEN_UPPER: {
    label: "Women's Upper Body",
    sizeRanges: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    productTypes: ["blouses", "shirts", "t-shirts", "tops", "jackets"],
    measurements: {
      XS: { bust: "81-84", waist: "63-66", length: "58" },
      S: { bust: "84-89", waist: "66-71", length: "60" },
      M: { bust: "89-94", waist: "71-76", length: "62" },
      L: { bust: "94-99", waist: "76-81", length: "64" },
      XL: { bust: "99-104", waist: "81-86", length: "66" },
      "2XL": { bust: "104-109", waist: "86-91", length: "68" },
      "3XL": { bust: "109-114", waist: "91-97", length: "70" },
    },
  },
  WOMEN_LOWER: {
    label: "Women's Lower Body",
    sizeRanges: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    productTypes: ["pants", "jeans", "skirts", "shorts", "leggings"],
    measurements: {
      XS: { waist: "63-66", hips: "89-92" },
      S: { waist: "66-71", hips: "92-97" },
      M: { waist: "71-76", hips: "97-102" },
      L: { waist: "76-81", hips: "102-107" },
      XL: { waist: "81-86", hips: "107-112" },
      "2XL": { waist: "86-91", hips: "112-117" },
      "3XL": { waist: "91-97", hips: "117-122" },
    },
  },
  WOMEN_DRESS: {
    label: "Women's Dresses",
    sizeRanges: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    productTypes: ["dresses", "gowns", "cocktail dresses", "casual dresses"],
    measurements: {
      XS: { bust: "81-84", waist: "63-66", hips: "89-92", length: "95" },
      S: { bust: "84-89", waist: "66-71", hips: "92-97", length: "96" },
      M: { bust: "89-94", waist: "71-76", hips: "97-102", length: "97" },
      L: { bust: "94-99", waist: "76-81", hips: "102-107", length: "98" },
      XL: { bust: "99-104", waist: "81-86", hips: "107-112", length: "99" },
      "2XL": {
        bust: "104-109",
        waist: "86-91",
        hips: "112-117",
        length: "100",
      },
      "3XL": {
        bust: "109-114",
        waist: "91-97",
        hips: "117-122",
        length: "101",
      },
    },
  },
  BOYS_GENERAL: {
    label: "Boys General",
    sizeRanges: ["2T", "3T", "4T", "5", "6", "7", "8", "10", "12", "14", "16"],
    productTypes: ["t-shirts", "hoodies", "sweatshirts", "casual wear"],
    measurements: {
      "2T": { chest: "53", waist: "51", height: "89-94" },
      "3T": { chest: "56", waist: "53", height: "94-99" },
      "4T": { chest: "58", waist: "55", height: "99-104" },
      "5": { chest: "61", waist: "57", height: "104-109" },
      "6": { chest: "63", waist: "58", height: "109-114" },
      "7": { chest: "66", waist: "60", height: "114-119" },
      "8": { chest: "68", waist: "61", height: "119-124" },
      "10": { chest: "71", waist: "63", height: "124-132" },
      "12": { chest: "76", waist: "66", height: "132-140" },
      "14": { chest: "81", waist: "69", height: "140-147" },
      "16": { chest: "86", waist: "71", height: "147-155" },
    },
  },
  GIRLS_GENERAL: {
    label: "Girls General",
    sizeRanges: ["2T", "3T", "4T", "5", "6", "7", "8", "10", "12", "14", "16"],
    productTypes: ["dresses", "tops", "casual wear", "school uniforms"],
    measurements: {
      "2T": { chest: "53", waist: "52", hips: "56", height: "89-94" },
      "3T": { chest: "56", waist: "54", hips: "58", height: "94-99" },
      "4T": { chest: "58", waist: "55", hips: "60", height: "99-104" },
      "5": { chest: "61", waist: "57", hips: "63", height: "104-109" },
      "6": { chest: "63", waist: "58", hips: "66", height: "109-114" },
      "7": { chest: "66", waist: "60", hips: "68", height: "114-119" },
      "8": { chest: "68", waist: "61", hips: "71", height: "119-124" },
      "10": { chest: "71", waist: "63", hips: "76", height: "124-132" },
      "12": { chest: "76", waist: "66", hips: "81", height: "132-140" },
      "14": { chest: "81", waist: "69", hips: "86", height: "140-147" },
      "16": { chest: "86", waist: "71", hips: "91", height: "147-155" },
    },
  },
  UNISEX_GENERAL: {
    label: "Unisex General",
    sizeRanges: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    productTypes: ["t-shirts", "hoodies", "sweatshirts", "casual wear"],
    measurements: {
      XS: { chest: "86-91", waist: "73-78", length: "66" },
      S: { chest: "91-97", waist: "78-83", length: "68" },
      M: { chest: "97-102", waist: "83-88", length: "70" },
      L: { chest: "102-107", waist: "88-93", length: "72" },
      XL: { chest: "107-112", waist: "93-98", length: "74" },
      "2XL": { chest: "112-117", waist: "98-103", length: "76" },
      "3XL": { chest: "117-122", waist: "103-108", length: "78" },
    },
  },
} as const;

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

// ========================================
// HELPER FUNCTIONS
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
