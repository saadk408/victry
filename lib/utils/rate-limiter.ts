/**
 * Simple in-memory rate limiter for password reset requests
 * In production, this should use Redis or a persistent storage solution
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanup: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanup = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);
  }

  private cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (email, IP, etc.)
   * @param limit - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and remaining time
   */
  public isAllowed(
    identifier: string,
    limit: number,
    windowMs: number
  ): { allowed: boolean; remainingTime?: number; count: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      // No entry or expired entry - allow and create new
      this.store.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return { allowed: true, count: 1 };
    }

    if (entry.count >= limit) {
      // Rate limit exceeded
      return {
        allowed: false,
        remainingTime: entry.resetTime - now,
        count: entry.count,
      };
    }

    // Increment count and allow
    entry.count += 1;
    this.store.set(identifier, entry);
    return { allowed: true, count: entry.count };
  }

  /**
   * Reset rate limit for a specific identifier
   * @param identifier - Unique identifier to reset
   */
  public reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Get current rate limit status without incrementing
   * @param identifier - Unique identifier to check
   * @returns Current status or null if no entry exists
   */
  public getStatus(identifier: string): {
    count: number;
    remainingTime: number;
  } | null {
    const entry = this.store.get(identifier);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.resetTime) {
      this.store.delete(identifier);
      return null;
    }

    return {
      count: entry.count,
      remainingTime: entry.resetTime - now,
    };
  }

  /**
   * Clean up and stop the rate limiter
   */
  public destroy(): void {
    if (this.cleanup) {
      clearInterval(this.cleanup);
    }
    this.store.clear();
  }
}

// Create a singleton instance
const rateLimiter = new RateLimiter();

// Password reset specific rate limiting
export const PASSWORD_RESET_LIMITS = {
  // 5 requests per email per hour
  EMAIL_LIMIT: 5,
  EMAIL_WINDOW_MS: 60 * 60 * 1000, // 1 hour

  // 20 requests per IP per hour
  IP_LIMIT: 20,
  IP_WINDOW_MS: 60 * 60 * 1000, // 1 hour
} as const;

/**
 * Check if password reset request is allowed for email
 * @param email - Email address requesting reset
 * @returns Rate limit result
 */
export function checkPasswordResetEmailRateLimit(email: string) {
  return rateLimiter.isAllowed(
    `email:${email.toLowerCase()}`,
    PASSWORD_RESET_LIMITS.EMAIL_LIMIT,
    PASSWORD_RESET_LIMITS.EMAIL_WINDOW_MS
  );
}

/**
 * Check if password reset request is allowed for IP
 * @param ip - IP address making the request
 * @returns Rate limit result
 */
export function checkPasswordResetIPRateLimit(ip: string) {
  return rateLimiter.isAllowed(
    `ip:${ip}`,
    PASSWORD_RESET_LIMITS.IP_LIMIT,
    PASSWORD_RESET_LIMITS.IP_WINDOW_MS
  );
}

/**
 * Get current rate limit status for email without incrementing
 * @param email - Email address to check
 * @returns Current status or null
 */
export function getPasswordResetEmailStatus(email: string) {
  return rateLimiter.getStatus(`email:${email.toLowerCase()}`);
}

/**
 * Get current rate limit status for IP without incrementing
 * @param ip - IP address to check
 * @returns Current status or null
 */
export function getPasswordResetIPStatus(ip: string) {
  return rateLimiter.getStatus(`ip:${ip}`);
}

/**
 * Reset rate limit for a specific email (admin use)
 * @param email - Email address to reset
 */
export function resetPasswordResetEmailRateLimit(email: string) {
  return rateLimiter.reset(`email:${email.toLowerCase()}`);
}

/**
 * Reset rate limit for a specific IP (admin use)
 * @param ip - IP address to reset
 */
export function resetPasswordResetIPRateLimit(ip: string) {
  return rateLimiter.reset(`ip:${ip}`);
}

/**
 * Helper to extract client IP from request headers
 * @param request - Next.js request object
 * @returns Client IP address
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  // Fallback for development
  return '127.0.0.1';
}

/**
 * Format remaining time for user-friendly display
 * @param milliseconds - Remaining time in milliseconds
 * @returns Formatted string
 */
export function formatRemainingTime(milliseconds: number): string {
  const minutes = Math.ceil(milliseconds / (1000 * 60));
  
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
}

export { rateLimiter };
export default rateLimiter;