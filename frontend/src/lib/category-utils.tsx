import * as LucideIcons from "lucide-react";
import { FileIcon, FolderIcon, FolderTreeIcon, LayersIcon } from "lucide-react";

/**
 * Category Level Enum (matches backend)
 */
export type CategoryLevel = "ROOT" | "MAIN" | "SUB" | "DETAIL";

/**
 * Category Level Translations (i18n keys veya direkt metinler)
 */
export const CATEGORY_LEVEL_LABELS: Record<CategoryLevel, string> = {
  ROOT: "Ana Kategori",
  MAIN: "Ana Grup",
  SUB: "Alt Grup",
  DETAIL: "Detay",
};

/**
 * Category Level Icons
 */
export const CATEGORY_LEVEL_ICONS: Record<
  CategoryLevel,
  React.ComponentType<any>
> = {
  ROOT: FolderTreeIcon,
  MAIN: FolderIcon,
  SUB: LayersIcon,
  DETAIL: FileIcon,
};

/**
 * Category Level Colors (Tailwind classes)
 */
export const CATEGORY_LEVEL_COLORS: Record<CategoryLevel, string> = {
  ROOT: "text-purple-600 bg-purple-50 border-purple-200",
  MAIN: "text-blue-600 bg-blue-50 border-blue-200",
  SUB: "text-green-600 bg-green-50 border-green-200",
  DETAIL: "text-orange-600 bg-orange-50 border-orange-200",
};

/**
 * Get category level badge
 */
export function getCategoryLevelBadge(level: CategoryLevel) {
  const Icon = CATEGORY_LEVEL_ICONS[level];
  const label = CATEGORY_LEVEL_LABELS[level];
  const colorClass = CATEGORY_LEVEL_COLORS[level];

  return {
    icon: Icon,
    label,
    colorClass,
  };
}

/**
 * Get category icon based on level
 */
export function getCategoryIcon(level: CategoryLevel) {
  return CATEGORY_LEVEL_ICONS[level];
}

/**
 * Get dynamic icon component from Lucide
 * Falls back to default level icon if custom icon not found
 */
export function getDynamicIcon(
  iconName?: string | null,
  level?: CategoryLevel
): React.ComponentType<any> {
  // If no icon name provided, use default level icon
  if (!iconName && level) {
    return CATEGORY_LEVEL_ICONS[level];
  }

  // Try to get custom icon from Lucide
  if (iconName) {
    const Icon = (LucideIcons as any)[iconName];
    if (Icon) {
      return Icon;
    }
  }

  // Fallback to folder icon
  return FolderIcon;
}

/**
 * Render category icon component
 */
export function renderCategoryIcon(
  iconName?: string | null,
  level?: CategoryLevel,
  className: string = "h-4 w-4"
) {
  const Icon = getDynamicIcon(iconName, level);
  return <Icon className={className} />;
}

/**
 * Format category path (Breadcrumb)
 * Example: "Tekstil > Giyim > Üst Giyim > Gömlek"
 */
export function formatCategoryPath(
  category: {
    name: string;
    parentCategory?: {
      name: string;
      parentCategory?: {
        name: string;
        parentCategory?: { name: string } | null;
      } | null;
    } | null;
  },
  separator: string = " > "
): string {
  const path: string[] = [];

  let current: any = category;
  while (current) {
    path.unshift(current.name);
    current = current.parentCategory;
  }

  return path.join(separator);
}

/**
 * Get category depth/level in hierarchy
 */
export function getCategoryDepth(category: {
  parentCategory?: {
    parentCategory?: {
      parentCategory?: any;
    } | null;
  } | null;
}): number {
  let depth = 0;
  let current: any = category;

  while (current?.parentCategory) {
    depth++;
    current = current.parentCategory;
  }

  return depth;
}

/**
 * Build hierarchical tree structure
 */
export interface CategoryTreeNode {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  level: CategoryLevel;
  order: number;
  icon?: string | null;
  image?: string | null;
  isActive: boolean;
  isPublic: boolean;
  children: CategoryTreeNode[];
}

export function buildCategoryTree(
  categories: Array<{
    id: string;
    code: string;
    name: string;
    description?: string | null;
    level: string;
    order: number;
    icon?: string | null;
    image?: string | null;
    isActive: boolean;
    isPublic: boolean;
    parentCategory?: { id: string } | null;
  }>
): CategoryTreeNode[] {
  const categoryMap = new Map<string, CategoryTreeNode>();
  const rootCategories: CategoryTreeNode[] = [];

  // Create nodes
  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      id: cat.id,
      code: cat.code,
      name: cat.name,
      description: cat.description,
      level: cat.level as CategoryLevel,
      order: cat.order,
      icon: cat.icon,
      image: cat.image,
      isActive: cat.isActive,
      isPublic: cat.isPublic,
      children: [],
    });
  });

  // Build tree
  categories.forEach((cat) => {
    const node = categoryMap.get(cat.id);
    if (!node) return;

    if (!cat.parentCategory) {
      rootCategories.push(node);
    } else {
      const parent = categoryMap.get(cat.parentCategory.id);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  // Sort by order
  const sortChildren = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    nodes.forEach((node) => sortChildren(node.children));
  };
  sortChildren(rootCategories);

  return rootCategories;
}

/**
 * Flatten tree to list (for display purposes)
 */
export function flattenCategoryTree(
  tree: CategoryTreeNode[],
  level: number = 0
): Array<CategoryTreeNode & { depth: number }> {
  const result: Array<CategoryTreeNode & { depth: number }> = [];

  tree.forEach((node) => {
    result.push({ ...node, depth: level });
    if (node.children.length > 0) {
      result.push(...flattenCategoryTree(node.children, level + 1));
    }
  });

  return result;
}

/**
 * Check if category code is duplicate
 */
export function isDuplicateCode(
  code: string,
  categories: Array<{ id: string; code: string }>,
  currentCategoryId?: string
): boolean {
  return categories.some(
    (cat) =>
      cat.code.toLowerCase() === code.toLowerCase() &&
      cat.id !== currentCategoryId
  );
}

/**
 * Check if parent selection would create circular relationship
 * Returns true if circular relationship detected
 */
export function isCircularParent(
  categoryId: string,
  parentId: number | undefined,
  categories: Array<{
    id: string;
    parentCategory?: { id: string } | null;
  }>
): boolean {
  if (!parentId) return false;
  if (categoryId === String(parentId)) return true; // Self-parent

  // Build parent chain
  let currentParentId: string | null = String(parentId);
  const visited = new Set<string>();

  while (currentParentId) {
    if (currentParentId === categoryId) {
      return true; // Circular relationship detected
    }

    if (visited.has(currentParentId)) {
      break; // Infinite loop protection
    }
    visited.add(currentParentId);

    // Find parent's parent
    const parent = categories.find((c) => c.id === currentParentId);
    currentParentId = parent?.parentCategory?.id || null;
  }

  return false;
}

/**
 * Get max depth limit based on level
 */
export function getMaxDepth(level: CategoryLevel): number {
  const depths: Record<CategoryLevel, number> = {
    ROOT: 0,
    MAIN: 1,
    SUB: 2,
    DETAIL: 3,
  };
  return depths[level];
}

/**
 * Check if category depth exceeds limit
 */
export function exceedsMaxDepth(
  parentId: number | undefined,
  level: CategoryLevel,
  categories: Array<{
    id: string;
    level: string;
    parentCategory?: { id: string } | null;
  }>
): boolean {
  if (!parentId) return false;

  const maxDepth = getMaxDepth(level);
  const parent = categories.find((c) => c.id === String(parentId));

  if (!parent) return false;

  // Count parent chain depth
  let depth = 1;
  let currentParent = parent;

  while (currentParent.parentCategory) {
    depth++;
    currentParent =
      categories.find((c) => c.id === currentParent.parentCategory!.id) ||
      currentParent;

    if (depth > maxDepth) return true;
  }

  return false;
}

/**
 * Validate category form data
 */
export interface CategoryFormData {
  code: string;
  name: string;
  description?: string;
  level: CategoryLevel;
  order?: number;
  icon?: string;
  image?: string;
  parentId?: number;
  keywords?: string;
  tags?: string;
  isActive?: boolean;
  isPublic?: boolean;
}

export interface CategoryFormErrors {
  code?: string;
  name?: string;
  description?: string;
  level?: string;
  order?: string;
  parentId?: string;
  keywords?: string;
}

export interface ValidateCategoryOptions {
  categories?: Array<{
    id: string;
    code: string;
    level: string;
    parentCategory?: { id: string } | null;
  }>;
  currentCategoryId?: string;
}

export function validateCategoryForm(
  data: CategoryFormData,
  options?: ValidateCategoryOptions
): CategoryFormErrors {
  const errors: CategoryFormErrors = {};

  // Code validation
  if (!data.code || data.code.trim().length === 0) {
    errors.code = "Kategori kodu gereklidir";
  } else if (!/^[A-Z0-9-]+$/.test(data.code)) {
    errors.code = "Kod sadece büyük harf, rakam ve tire içermelidir";
  } else if (data.code.length < 3 || data.code.length > 20) {
    errors.code = "Kod 3-20 karakter arasında olmalıdır";
  } else if (
    options?.categories &&
    isDuplicateCode(data.code, options.categories, options.currentCategoryId)
  ) {
    errors.code = "Bu kod zaten kullanılıyor";
  }

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Kategori adı gereklidir";
  } else if (data.name.length < 2 || data.name.length > 100) {
    errors.name = "Ad 2-100 karakter arasında olmalıdır";
  }

  // Description validation
  if (data.description && data.description.length > 500) {
    errors.description = "Açıklama 500 karakterden uzun olamaz";
  }

  // Level validation
  if (!data.level) {
    errors.level = "Kategori seviyesi seçilmelidir";
  }

  // Parent validation
  if (data.parentId !== undefined && options?.categories) {
    // Check circular relationship
    if (
      options.currentCategoryId &&
      isCircularParent(
        options.currentCategoryId,
        data.parentId,
        options.categories
      )
    ) {
      errors.parentId =
        "Döngüsel ilişki hatası: Bu kategori kendi alt kategorisi olamaz";
    }

    // Check max depth
    if (exceedsMaxDepth(data.parentId, data.level, options.categories)) {
      errors.parentId = "Maksimum derinlik aşıldı";
    }
  }

  // Order validation
  if (data.order !== undefined && (data.order < 0 || data.order > 9999)) {
    errors.order = "Sıralama 0-9999 arasında olmalıdır";
  }

  // Keywords validation (JSON array)
  if (data.keywords) {
    try {
      const parsed = JSON.parse(data.keywords);
      if (!Array.isArray(parsed)) {
        errors.keywords = "Keywords JSON array formatında olmalıdır";
      }
    } catch (e) {
      errors.keywords = "Geçersiz JSON formatı";
    }
  }

  return errors;
}

/**
 * Filter categories by search term
 */
export function filterCategories<
  T extends {
    code: string;
    name: string;
    description?: string | null;
    tags?: string | null;
  }
>(categories: T[], searchTerm: string): T[] {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return categories;
  }

  const term = searchTerm.toLowerCase();

  return categories.filter(
    (cat) =>
      cat.code.toLowerCase().includes(term) ||
      cat.name.toLowerCase().includes(term) ||
      cat.description?.toLowerCase().includes(term) ||
      cat.tags?.toLowerCase().includes(term)
  );
}

/**
 * Get category statistics
 */
export function getCategoryStats(
  categories: Array<{
    level: string;
    isActive: boolean;
    isPublic: boolean;
  }>
) {
  return {
    total: categories.length,
    active: categories.filter((c) => c.isActive).length,
    inactive: categories.filter((c) => !c.isActive).length,
    public: categories.filter((c) => c.isPublic).length,
    private: categories.filter((c) => !c.isPublic).length,
    byLevel: {
      ROOT: categories.filter((c) => c.level === "ROOT").length,
      MAIN: categories.filter((c) => c.level === "MAIN").length,
      SUB: categories.filter((c) => c.level === "SUB").length,
      DETAIL: categories.filter((c) => c.level === "DETAIL").length,
    },
  };
}

/**
 * Check if category can be deleted (no children, no company usage)
 */
export function canDeleteCategory(category: { subCategories?: Array<any> }): {
  canDelete: boolean;
  reason?: string;
} {
  if (category.subCategories && category.subCategories.length > 0) {
    return {
      canDelete: false,
      reason: `Bu kategorinin ${category.subCategories.length} alt kategorisi var`,
    };
  }

  return { canDelete: true };
}

/**
 * Get next order number for new category
 */
export function getNextOrderNumber(
  categories: Array<{ order: number }>,
  parentId?: number | null
): number {
  if (categories.length === 0) return 1;

  const maxOrder = Math.max(...categories.map((c) => c.order));
  return maxOrder + 1;
}

/**
 * Format category code suggestion based on parent and level
 */
export function suggestCategoryCode(
  parentCode: string | null,
  level: CategoryLevel,
  count: number
): string {
  const levelPrefixes: Record<CategoryLevel, string> = {
    ROOT: "CAT",
    MAIN: "MAN",
    SUB: "SUB",
    DETAIL: "DET",
  };

  const prefix = levelPrefixes[level];
  const paddedCount = String(count + 1).padStart(3, "0");

  if (parentCode) {
    return `${parentCode}-${prefix}-${paddedCount}`;
  }

  return `${prefix}-${paddedCount}`;
}
