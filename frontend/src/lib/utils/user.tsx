/**
 * User Management Utilities
 *
 * @module lib/utils/user
 * @description Reusable helpers for user CRUD operations
 *
 * Type Sync:
 * - UserRole: Imported from @/lib/auth (synchronized with Prisma schema)
 * - Department: Imported from @/lib/auth (synchronized with Prisma schema)
 * - NEVER duplicate enums - always import from @/lib/auth
 *
 * @see @/lib/auth/dal.ts - Source of truth for Role & Department enums
 * @see backend/prisma/schema.prisma - Backend schema
 * @version 2.0.0
 */

import { Badge } from "@/components/ui/badge";
import { Department, UserRole } from "@/lib/auth";

/**
 * Role configuration for badges and labels
 * @see backend/prisma/schema.prisma - enum Role
 *
 * Backend Role Descriptions:
 * - ADMIN: Platform admin (Platform yöneticisi)
 * - COMPANY_OWNER: Firma sahibi (hem üretici hem müşteri)
 * - COMPANY_EMPLOYEE: Firma çalışanı (hem üretici hem müşteri)
 * - INDIVIDUAL_CUSTOMER: Bireysel müşteri (firma olmadan)
 */
export const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon?: string;
  }
> = {
  ADMIN: { label: "Platform Yöneticisi", variant: "destructive", icon: "👑" },
  COMPANY_OWNER: { label: "Firma Sahibi", variant: "default", icon: "🏢" },
  COMPANY_EMPLOYEE: {
    label: "Firma Çalışanı",
    variant: "secondary",
    icon: "👤",
  },
  INDIVIDUAL_CUSTOMER: {
    label: "Bireysel Müşteri",
    variant: "outline",
    icon: "🛒",
  },
};

/**
 * Department labels in Turkish
 * @see backend/prisma/schema.prisma - enum Department
 */
export const DEPARTMENT_LABELS: Record<Department, string> = {
  PURCHASING: "Satın Alma",
  PRODUCTION: "Üretim",
  QUALITY: "Kalite",
  DESIGN: "Tasarım",
  SALES: "Satış",
  MANAGEMENT: "Yönetim",
};

/**
 * Get role badge component
 */
export function getRoleBadge(role: string) {
  const config = ROLE_CONFIG[role as UserRole] || {
    label: role,
    variant: "outline" as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * Get department label in Turkish
 * @param department - Department enum value from backend
 * @returns Turkish label or "-" if undefined
 */
export function getDepartmentLabel(
  department: string | null | undefined
): string {
  if (!department) return "-";
  return DEPARTMENT_LABELS[department as Department] || department;
}

/**
 * Check if role requires company assignment
 */
export function isCompanyRole(role: string): boolean {
  return role === "COMPANY_OWNER" || role === "COMPANY_EMPLOYEE";
}

/**
 * Get role icon
 */
export function getRoleIcon(role: string): string {
  return ROLE_CONFIG[role as UserRole]?.icon || "👤";
}

/**
 * Format user status
 */
export function getUserStatusLabel(isActive: boolean): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  return isActive
    ? { label: "Aktif", variant: "default" }
    : { label: "Pasif", variant: "secondary" };
}

/**
 * Validate user form data
 */
export interface UserFormData {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  companyId?: number | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateUserForm(
  data: UserFormData,
  isCreate: boolean = false
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Email validation
  if (isCreate && !data.email) {
    errors.push({ field: "email", message: "E-posta adresi zorunludur" });
  } else if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({
      field: "email",
      message: "Geçerli bir e-posta adresi girin",
    });
  }

  // Password validation (only for create)
  if (isCreate && !data.password) {
    errors.push({ field: "password", message: "Şifre zorunludur" });
  } else if (data.password && data.password.length < 6) {
    errors.push({
      field: "password",
      message: "Şifre en az 6 karakter olmalıdır",
    });
  }

  // Name validation
  if (isCreate && !data.name) {
    errors.push({ field: "name", message: "Ad soyad zorunludur" });
  }

  // Company validation for company roles
  if (data.role && isCompanyRole(data.role) && !data.companyId) {
    errors.push({
      field: "companyId",
      message: "Firma sahibi veya çalışanı için firma seçimi zorunludur",
    });
  }

  return errors;
}

/**
 * Filter users by search term
 */
export function filterUsersBySearch<
  T extends { name?: string | null; email?: string | null }
>(users: T[], searchTerm: string): T[] {
  if (!searchTerm) return users;

  const term = searchTerm.toLowerCase();
  return users.filter(
    (user) =>
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
  );
}

/**
 * Filter users by role
 */
export function filterUsersByRole<T extends { role?: string | null }>(
  users: T[],
  roleFilter: string
): T[] {
  if (roleFilter === "all") return users;
  return users.filter((user) => user.role === roleFilter);
}

/**
 * Filter users by status
 */
export function filterUsersByStatus<
  T extends { isActive?: boolean | null; isPendingApproval?: boolean | null }
>(users: T[], statusFilter: string): T[] {
  if (statusFilter === "all") return users;
  if (statusFilter === "active") return users.filter((u) => u.isActive);
  if (statusFilter === "inactive") return users.filter((u) => !u.isActive);
  if (statusFilter === "pending")
    return users.filter((u) => u.isPendingApproval);
  return users;
}

/**
 * Apply all filters to users
 */
export function filterUsers<
  T extends {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    isActive?: boolean | null;
    isPendingApproval?: boolean | null;
  }
>(
  users: T[],
  filters: {
    searchTerm?: string;
    roleFilter?: string;
    statusFilter?: string;
  }
): T[] {
  let filtered = users;

  if (filters.searchTerm) {
    filtered = filterUsersBySearch(filtered, filters.searchTerm);
  }

  if (filters.roleFilter) {
    filtered = filterUsersByRole(filtered, filters.roleFilter);
  }

  if (filters.statusFilter) {
    filtered = filterUsersByStatus(filtered, filters.statusFilter);
  }

  return filtered;
}
