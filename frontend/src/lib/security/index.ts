/**
 * Security Module
 *
 * @module lib/security
 * @description Security utilities and protection mechanisms
 *
 * Features:
 * - Rate limiting for authentication endpoints
 * - Brute force attack prevention
 * - IP-based request throttling
 * - Automatic blocking after max attempts
 * - Time-based window for attempt counting
 *
 * Configuration:
 * - Max attempts: 5 per 15 minutes
 * - Block duration: 30 minutes
 * - Auto cleanup: Every 5 minutes
 *
 * Backend Integration:
 * - Protects login, signup, password reset endpoints
 * - Synchronized with backend rate limiting
 *
 * @version 2.0.0
 */

// Rate limiting utilities
export * from "./rate-limit";
export {
  checkRateLimit,
  cleanupRateLimitStore,
  getRateLimitStatus,
  resetRateLimit,
} from "./rate-limit";
