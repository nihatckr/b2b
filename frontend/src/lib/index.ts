/**
 * ProtexFlow Frontend Library
 *
 * @module lib
 * @description Central export point for all frontend utilities and configurations
 *
 * Architecture:
 * - lib/auth/          - Authentication and authorization (NextAuth, DAL, RBAC)
 * - lib/graphql/       - GraphQL client configuration (URQL, WebSocket, SSR)
 * - lib/security/      - Security utilities (rate limiting, protection)
 * - lib/validations/   - Zod schemas and validation utilities
 * - lib/utils/         - Common utilities (user, category, date, helpers)
 *
 * Design Principles:
 * - Modular: Domain-separated for easy navigation
 * - Type-Safe: Full TypeScript support with strict types
 * - Backend-Compatible: Aligned with backend Prisma schema and GraphQL API
 * - Performance: Optimized with caching, memoization, debouncing
 * - Documented: Comprehensive JSDoc for IntelliSense
 *
 * Backend Integration:
 * - GraphQL endpoint: http://localhost:4001/graphql
 * - WebSocket endpoint: ws://localhost:4001/graphql
 * - Prisma schema: 21 models, 26 enums
 * - Roles: ADMIN, COMPANY_OWNER, COMPANY_EMPLOYEE, INDIVIDUAL_CUSTOMER
 * - Departments: PURCHASING, PRODUCTION, QUALITY, DESIGN, SALES, MANAGEMENT
 *
 * @version 2.0.0
 * @since 1.0.0
 */

// ============================================
// AUTHENTICATION & AUTHORIZATION
// ============================================

/**
 * Authentication module
 * - NextAuth configuration with JWT strategy
 * - OAuth providers (GitHub, Google)
 * - Session management with token rotation
 * - Data Access Layer for server components
 * - Role-based access control (RBAC)
 */
export * from "./auth";

// ============================================
// GRAPHQL CLIENT
// ============================================

/**
 * GraphQL client module
 * - URQL client with SSR support
 * - WebSocket subscriptions
 * - Authentication integration
 * - Caching and optimistic updates
 */
export * from "./graphql";

// ============================================
// SECURITY
// ============================================

/**
 * Security utilities
 * - Rate limiting for auth endpoints
 * - Brute force protection
 * - Request throttling
 */
export * from "./security";

// ============================================
// VALIDATIONS
// ============================================

/**
 * Validation schemas and utilities
 * - Zod schemas (auth, user, company, category, library, review, bulk)
 * - Validation functions with Turkish error messages
 * - React hooks for real-time validation
 * - Backend-compatible error messages
 */
export * from "./validations";

// ============================================
// UTILITIES
// ============================================

/**
 * Common utilities
 * - User management (roles, badges, filtering)
 * - Category operations (tree, hierarchy)
 * - Date formatting and timezone handling
 * - General helpers
 */
export * from "./utils";

// ============================================
// LEGACY EXPORTS (Backward Compatibility)
// ============================================

/**
 * Main utils file (shadcn/ui)
 * Contains cn() function for className merging
 */
export { cn } from "./utils";

/**
 * @deprecated Use imports from @/lib/validations instead
 * Kept for backward compatibility
 */
export * from "./zod-schema";
