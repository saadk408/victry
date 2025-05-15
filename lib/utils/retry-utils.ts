import { isRetryableError } from './error-utils';
import { getLogger } from './logger';

// Create a logger for retry operations
const logger = getLogger().child('retry');

/**
 * Options for retry operations
 */
export interface RetryOptions {
  /** Maximum number of attempts (including the initial attempt) */
  maxAttempts?: number;
  /** Initial delay in milliseconds before the first retry */
  initialDelay?: number;
  /** Maximum delay in milliseconds between retries */
  maxDelay?: number;
  /** Backoff factor for exponential backoff (e.g., 2 means each retry doubles the delay) */
  backoffFactor?: number;
  /** Jitter factor to add randomness to delays (0-1) */
  jitter?: number;
  /** Custom function to determine if an error should be retried */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Custom function to calculate delay between retries */
  calculateDelay?: (attempt: number, options: RetryOptions) => number;
  /** Callback to execute before each retry */
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
}

/**
 * Default retry options
 */
const defaultRetryOptions: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 100,
  maxDelay: 5000,
  backoffFactor: 2,
  jitter: 0.1,
};

/**
 * Calculates delay between retries using exponential backoff with jitter
 * @param attempt Current attempt number (1-based)
 * @param options Retry options
 * @returns Delay in milliseconds
 */
export function calculateExponentialDelay(attempt: number, options: RetryOptions): number {
  const { initialDelay = 100, backoffFactor = 2, maxDelay = 5000, jitter = 0.1 } = options;
  
  // Calculate base delay using exponential backoff
  const baseDelay = Math.min(
    initialDelay * Math.pow(backoffFactor, attempt - 1),
    maxDelay
  );
  
  // Add jitter to prevent synchronized retry storms
  const jitterAmount = baseDelay * jitter;
  const jitterFactor = 1 - jitter + Math.random() * jitter * 2;
  
  return Math.floor(baseDelay * jitterFactor);
}

/**
 * Executes an operation with automatic retries for transient errors
 * @param operation The operation to execute
 * @param options Retry options
 * @returns The result of the operation
 * @throws The last error encountered if all retries fail
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  // Merge with default options
  const mergedOptions: RetryOptions = {
    ...defaultRetryOptions,
    ...options,
  };
  
  const {
    maxAttempts = 3,
    shouldRetry = isRetryableError,
    calculateDelay = calculateExponentialDelay,
    onRetry,
  } = mergedOptions;
  
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Execute operation
      return await operation();
    } catch (error) {
      // Store the last error
      lastError = error;
      
      // Check if we should retry
      const isLastAttempt = attempt === maxAttempts;
      if (isLastAttempt || !shouldRetry(error, attempt)) {
        // No more retries, rethrow the error
        throw error;
      }
      
      // Calculate delay for this retry
      const delay = calculateDelay(attempt, mergedOptions);
      
      // Log retry attempt
      logger.warn(
        `Operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`,
        {
          attempt,
          maxAttempts,
          delay,
          error,
        }
      );
      
      // Execute onRetry callback if provided
      if (onRetry) {
        try {
          onRetry(error, attempt, delay);
        } catch (callbackError) {
          logger.warn('Error in onRetry callback', { callbackError });
        }
      }
      
      // Wait before retrying
      await sleep(delay);
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Utility function to sleep for a specified amount of time
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a retryable version of a function
 * @param fn Function to make retryable
 * @param options Retry options
 * @returns Retryable function
 */
export function createRetryable<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    return withRetry(() => fn(...args), options) as ReturnType<T>;
  }) as T;
}