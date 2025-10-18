/**
 * Rate Limiting Utility for Authentication Endpoints
 *
 * Prevents brute force attacks by limiting login/signup attempts
 * Uses in-memory store (replace with Redis in production)
 */

interface RateLimitStore {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

// In-memory store (use Redis in production for distributed systems)
const store = new Map<string, RateLimitStore>();

// Configuration
const config = {
  maxAttempts: 5, // Maximum attempts allowed
  windowMs: 15 * 60 * 1000, // Time window: 15 minutes
  blockDurationMs: 30 * 60 * 1000, // Block duration: 30 minutes
};

/**
 * Check if request is rate limited
 * @param identifier - Unique identifier (email or IP address)
 * @returns Object with allowed status and retry information
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetAt?: Date;
  blockedUntil?: Date;
} {
  const now = Date.now();
  const record = store.get(identifier);

  // No previous attempts
  if (!record) {
    store.set(identifier, {
      attempts: 1,
      firstAttempt: now,
    });
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
    };
  }

  // Check if currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      blockedUntil: new Date(record.blockedUntil),
    };
  }

  // Reset window if expired
  if (now - record.firstAttempt > config.windowMs) {
    store.set(identifier, {
      attempts: 1,
      firstAttempt: now,
    });
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
    };
  }

  // Increment attempts
  record.attempts++;

  // Block if exceeded max attempts
  if (record.attempts > config.maxAttempts) {
    record.blockedUntil = now + config.blockDurationMs;
    store.set(identifier, record);
    return {
      allowed: false,
      remaining: 0,
      blockedUntil: new Date(record.blockedUntil),
    };
  }

  // Update record
  store.set(identifier, record);

  return {
    allowed: true,
    remaining: config.maxAttempts - record.attempts,
    resetAt: new Date(record.firstAttempt + config.windowMs),
  };
}

/**
 * Reset rate limit for identifier (e.g., after successful login)
 * @param identifier - Unique identifier (email or IP address)
 */
export function resetRateLimit(identifier: string): void {
  store.delete(identifier);
}

/**
 * Get rate limit status without incrementing
 * @param identifier - Unique identifier (email or IP address)
 */
export function getRateLimitStatus(identifier: string): {
  attempts: number;
  remaining: number;
  blockedUntil?: Date;
} {
  const record = store.get(identifier);
  const now = Date.now();

  if (!record) {
    return {
      attempts: 0,
      remaining: config.maxAttempts,
    };
  }

  if (record.blockedUntil && record.blockedUntil > now) {
    return {
      attempts: record.attempts,
      remaining: 0,
      blockedUntil: new Date(record.blockedUntil),
    };
  }

  return {
    attempts: record.attempts,
    remaining: Math.max(0, config.maxAttempts - record.attempts),
  };
}

/**
 * Clean up old entries (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    // Remove if window expired and not blocked
    if (
      now - record.firstAttempt > config.windowMs &&
      (!record.blockedUntil || record.blockedUntil < now)
    ) {
      store.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof window === "undefined") {
  // Server-side only
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
