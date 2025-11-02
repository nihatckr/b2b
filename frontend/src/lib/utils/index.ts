/**
 * Utilities Module
 *
 * @module lib/utils
 * @description Common utility functions and helpers
 *
 * Categories:
 * - User utilities: Role badges, department labels, filtering
 * - Category utilities: Tree operations, hierarchy management
 * - Date utilities: Formatting, timezone handling
 * - General helpers: String manipulation, type guards
 *
 * Backend Integration:
 * - User roles aligned with Prisma schema
 * - Department enums synchronized
 * - Category levels: ROOT, MAIN, SUB, DETAIL
 *
 * @version 2.0.0
 */

// User management utilities
export * from "./user";
export {
  DEPARTMENT_LABELS,
  filterUsers,
  filterUsersByRole,
  filterUsersBySearch,
  filterUsersByStatus,
  getDepartmentLabel,
  getRoleBadge,
  getRoleIcon,
  getUserStatusLabel,
  isCompanyRole,
  ROLE_CONFIG,
  validateUserForm,
  type UserFormData,
  type ValidationError,
} from "./user";

// Re-export enums from auth module (single source of truth)
export { CompanyType, Department, UserRole } from "@/lib/auth";

// Date utilities
export * from "./date";

// Main utils (shadcn/ui cn() function)
export { cn } from "../utils";
