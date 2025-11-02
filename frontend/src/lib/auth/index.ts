/**
 * Authentication Module
 *
 * @module lib/auth
 * @description Centralized authentication and authorization for ProtexFlow
 *
 * Features:
 * - NextAuth.js configuration with JWT strategy
 * - OAuth providers (GitHub, Google, etc.)
 * - Role-based access control (RBAC)
 * - Session management with 12-hour token rotation
 * - Data Access Layer (DAL) for server components
 * - Rate limiting protection
 *
 * Backend Integration:
 * - GraphQL mutations: login, signup, refreshToken
 * - JWT token validation
 * - User roles: ADMIN, COMPANY_OWNER, COMPANY_EMPLOYEE, INDIVIDUAL_CUSTOMER
 * - Company types: MANUFACTURER, BUYER, BOTH
 *
 * @see {@link https://next-auth.js.org/}
 * @version 2.0.0
 */

// NextAuth configuration
export * from "./config";
export { authOptions, oauthProviders, type OAuthProviderId } from "./config";

// Error handling
export * from "./error-handler";
export {
  AuthErrorCode,
  formatErrorMessage,
  handleAuthError,
  handleGraphQLError,
  handleNetworkError,
  handleValidationError,
  isRecoverableError,
  requiresReauth,
  type AuthError,
} from "./error-handler";

// Data Access Layer (Server Components)
export * from "./dal";
export {
  belongsToCompany,
  CompanyType,
  Department,
  getAuthHeader,
  getSession,
  hasDepartment,
  hasRole,
  isAdmin,
  isBuyer,
  isCompanyEmployee,
  isCompanyMember,
  isCompanyOwner,
  isDesign,
  isIndividualCustomer,
  isManagement,
  isManufacturer,
  isProduction,
  isPurchasing,
  isQuality,
  isSales,
  ownsResource,
  UserRole,
  verifyAdmin,
  verifyCompanyAccess,
  verifyCompanyEmployee,
  verifyCompanyOwner,
  verifyDepartment,
  verifyResourceOwnership,
  verifyRole,
  verifySession,
  type SessionData,
} from "./dal";
