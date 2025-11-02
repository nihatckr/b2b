/**
 * Validation Module
 *
 * @module lib/validations
 * @description Centralized validation schemas and utilities for ProtexFlow
 *
 * Features:
 * - Zod schemas for type-safe validation
 * - 100% Turkish error messages
 * - Backend ValidationError compatibility
 * - Composable validation rules
 * - React hooks for real-time validation
 * - Debounced validation for performance
 *
 * Backend Integration:
 * - Aligned with Prisma schema constraints
 * - Error messages match backend ValidationErrors
 * - Field limits synchronized (NAME_MIN: 2, NAME_MAX: 100, etc.)
 * - Enum values: OrderStatus (30), SampleStatus (28), Role (4), etc.
 *
 * Architecture:
 * - Domain-separated schemas (auth, user, company, category, library, review, bulk)
 * - Shared validation utilities (validators, commonRules, hooks)
 * - Constants for limits and patterns
 *
 * @see {@link ./README.md} for comprehensive documentation
 * @version 2.0.0
 */

// ============================================
// ZOD SCHEMAS (Domain-Separated)
// ============================================

/**
 * Authentication schemas
 * - Login, Register, Password Reset
 * Backend: authMutation.ts
 */
export * from "./auth";

/**
 * User profile schemas
 * - Profile, Notification, Preferences, Password
 * Backend: userMutation.ts, authMutation.ts
 */
export * from "./user";

/**
 * Company schemas
 * - Company information, branding, social links
 * Backend: companyMutation.ts
 */
export * from "./company";

/**
 * Library item schemas (7 types)
 * - Fabric, Color, SizeGroup, Fit, Material, Certification, Season
 * Backend: libraryMutation.ts
 */
export * from "./library";

/**
 * Category schemas
 * - Category management with validation helpers
 * - Duplicate code detection, circular reference prevention
 * Backend: categoryMutation.ts
 */
export * from "./category";

/**
 * Order review schemas (NEW in v2.0.0)
 * - Order reviews (1-5 star ratings)
 * - Manufacturer replies
 * Backend: reviewMutation.ts
 */
export * from "./review";

/**
 * Bulk operation schemas (NEW in v2.0.0)
 * - Bulk update order status (max 50)
 * - Bulk update sample status (max 50)
 * - Bulk delete (max 50)
 * Backend: bulkMutation.ts
 */
export * from "./bulk";

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validation utilities and React hooks
 * - Core validators (email, phone, url, etc.)
 * - Common validation rules (composable)
 * - Form validation functions
 * - React hooks (useRealtimeValidation, useFieldValidation)
 * - Utility functions (combine, filter, custom validators)
 * - Constants (VALIDATION_LIMITS, VALIDATION_PATTERNS)
 */
export * from "./utils";
