/**
 * Supabase Client Re-exports (Updated 2025-06-08)
 * 
 * This file was updated as part of the client/server separation fix to resolve
 * the Next.js build error: "You're importing a component that needs 'next/headers'"
 * 
 * Previous Issue:
 * This file previously imported 'cookies' from 'next/headers' directly, making
 * it server-only, but it was being imported by 18+ client components causing
 * build failures.
 * 
 * Current Solution:
 * Now provides re-exports from separate browser and server client files for
 * backwards compatibility while maintaining proper separation.
 * 
 * Recommended Usage:
 * - Client components: import { createClient } from "@/lib/supabase/browser"
 * - Server components: import { createClient } from "@/lib/supabase/server"
 * - Legacy code: Can continue using this file (automatically routed)
 * 
 * Architecture:
 * - /lib/supabase/browser.ts - Browser-safe client (no next/headers)
 * - /lib/supabase/server.ts - Server-only client (uses next/headers)
 * - /lib/supabase/client.ts - Re-exports for compatibility (this file)
 */

import { Database } from "../../types/supabase";

/**
 * For Client Components, import from browser client
 * @example
 * 'use client';
 * import { createClient } from '@/lib/supabase/browser';
 */
export { createClient } from './browser';

/**
 * For Server Components, Server Actions, and Route Handlers
 * @example
 * import { createClient } from '@/lib/supabase/server';
 */
export { 
  createClient as createServerClient,
  createActionClient 
} from './server';

/**
 * Alias for createServerClient for backwards compatibility
 * @deprecated Use createServerClient directly
 */
export { createClient as createServerComponentClient } from './server';

/**
 * Maximum retry attempts for database operations
 */
const MAX_RETRIES = 3;

/**
 * Base delay for exponential backoff (in milliseconds)
 */
const BASE_DELAY = 500;

/**
 * Utility function to handle Supabase errors consistently across the application
 *
 * @param error - The error thrown by Supabase
 * @returns A standardized error object
 */
export const handleSupabaseError = (
  error: unknown,
): { message: string; code?: string; details?: unknown } => {
  console.error("Supabase error:", error);

  // Check if error is an object with expected properties
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  ) {
    const typedError = error as {
      code: string;
      message: string;
      details?: unknown;
    };

    // Handle known error codes
    switch (typedError.code) {
      case "PGRST116":
        return {
          message: "Resource not found",
          code: typedError.code,
          details: typedError.details,
        };
      case "P0001":
        return {
          message: "Database constraint violated",
          code: typedError.code,
          details: typedError.details,
        };
      case "42P01":
        return {
          message: "Table not found",
          code: typedError.code,
          details: typedError.details,
        };
      case "23505":
        return {
          message: "Unique constraint violation",
          code: typedError.code,
          details: typedError.details,
        };
      case "auth-user-not-found":
        return {
          message: "User not found",
          code: typedError.code,
          details: typedError.details,
        };
      default:
        return {
          message: typedError.message || "An unexpected error occurred",
          code: typedError.code,
          details: typedError.details,
        };
    }
  }

  // Return a generic error message for non-specific or non-object errors
  return {
    message:
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : typeof error === "string"
          ? error
          : "An unexpected error occurred",
    details: error, // Keep original error details
  };
};

/**
 * Check if a database error is a unique constraint violation
 *
 * @param error - The error to check
 * @returns True if the error is a unique constraint violation
 */
export const isUniqueConstraintError = (error: unknown): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23505"
  );
};

/**
 * Check if a database error is a foreign key constraint violation
 *
 * @param error - The error to check
 * @returns True if the error is a foreign key constraint violation
 */
export const isForeignKeyConstraintError = (error: unknown): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23503"
  );
};

/**
 * Check if an error is an authentication error
 *
 * @param error - The error to check
 * @returns True if the error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    (error as { code: string }).code.startsWith("auth-")
  );
};

/**
 * Determine if an error is retryable
 *
 * @param error - The error to check
 * @returns True if the error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  // Don't retry user input errors or validation errors
  if (isUniqueConstraintError(error) || isForeignKeyConstraintError(error)) {
    return false;
  }

  // Don't retry authentication errors (these need user interaction)
  if (isAuthError(error)) {
    return false;
  }

  // Check if error is an object with potential message/code properties
  if (typeof error === "object" && error !== null) {
    const typedError = error as { message?: unknown; code?: unknown }; // Assert potential properties

    // Check message content for retryable keywords
    if (typeof typedError.message === "string") {
      if (
        typedError.message.includes("network") ||
        typedError.message.includes("timeout") ||
        typedError.message.includes("connection") ||
        typedError.message.includes("too many connections")
      ) {
        return true;
      }
    }

    // Check specific retryable error codes
    if (
      typedError.code === "40001" || // serialization failure
      typedError.code === "40P01" // deadlock detected
    ) {
      return true;
    }
  }

  // By default, don't retry
  return false;
}

/**
 * Retry a database operation with exponential backoff
 *
 * @param operation - The function to retry
 * @param maxRetries - Maximum number of retry attempts (default: MAX_RETRIES)
 * @param baseDelay - Base delay for exponential backoff in ms (default: BASE_DELAY)
 * @returns The result of the operation
 * @throws The last error encountered if all retries fail
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = BASE_DELAY,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Wait before retrying (except for the first attempt)
      if (attempt > 0) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        console.log(`Retry attempt ${attempt}/${maxRetries}`);
      }

      // Attempt the operation
      return await operation();
    } catch (error) {
      console.error(
        `Operation failed (attempt ${attempt + 1}/${maxRetries + 1}):`,
        error,
      );
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if it's not a retryable error
      if (!isRetryableError(error)) {
        throw lastError;
      }
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError;
}