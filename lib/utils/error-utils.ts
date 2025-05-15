// File: /lib/utils/error-utils.ts
import { ApiErrorResponse } from "@/types/api";
import { isUniqueConstraintError, isForeignKeyConstraintError, isAuthError } from "@/lib/supabase/client";

/**
 * Error categories for consistent error classification
 */
export enum ErrorCategory {
  // Authentication errors
  AUTH = "auth",
  // Authorization/permission errors
  PERMISSION = "permission",
  // Client-side validation errors
  VALIDATION = "validation",
  // Resource not found errors
  NOT_FOUND = "not_found",
  // Resource conflict errors (duplicate entry, etc.)
  CONFLICT = "conflict",
  // Rate limiting errors
  RATE_LIMIT = "rate_limit",
  // External service errors (third-party APIs)
  SERVICE = "service",
  // Database errors
  DATABASE = "database",
  // AI service errors
  AI = "ai",
  // Server-side unexpected errors
  SERVER = "server",
  // Input/output errors (file handling, etc.)
  IO = "io",
  // Network-related errors
  NETWORK = "network",
}

/**
 * Specific error codes for more granular error classification
 * Format: CATEGORY_SPECIFIC_ERROR
 */
export enum ErrorCode {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS = "auth_invalid_credentials",
  AUTH_SESSION_EXPIRED = "auth_session_expired",
  AUTH_NOT_AUTHENTICATED = "auth_not_authenticated",
  AUTH_TOKEN_INVALID = "auth_token_invalid",
  AUTH_MFA_REQUIRED = "auth_mfa_required",

  // Authorization errors
  PERMISSION_DENIED = "permission_denied",
  PERMISSION_INSUFFICIENT_TIER = "permission_insufficient_tier",
  PERMISSION_RESOURCE_LIMIT = "permission_resource_limit",

  // Validation errors
  VALIDATION_REQUIRED_FIELD = "validation_required_field",
  VALIDATION_INVALID_FORMAT = "validation_invalid_format",
  VALIDATION_INVALID_DATA = "validation_invalid_data",
  
  // Resource errors
  NOT_FOUND_RESOURCE = "not_found_resource",
  NOT_FOUND_USER = "not_found_user",
  NOT_FOUND_RESUME = "not_found_resume",
  NOT_FOUND_JOB_DESCRIPTION = "not_found_job_description",
  
  // Conflict errors
  CONFLICT_DUPLICATE_ENTRY = "conflict_duplicate_entry",
  CONFLICT_VERSION_MISMATCH = "conflict_version_mismatch",
  CONFLICT_ALREADY_EXISTS = "conflict_already_exists",
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  RATE_LIMIT_COOL_DOWN = "rate_limit_cool_down",
  
  // External service errors
  SERVICE_UNAVAILABLE = "service_unavailable",
  SERVICE_TIMEOUT = "service_timeout",
  SERVICE_ERROR = "service_error",
  
  // Database errors
  DATABASE_CONNECTION_ERROR = "database_connection_error",
  DATABASE_QUERY_ERROR = "database_query_error",
  DATABASE_INTEGRITY_ERROR = "database_integrity_error",
  DATABASE_FOREIGN_KEY_ERROR = "database_foreign_key_error",
  
  // AI service errors
  AI_GENERATION_ERROR = "ai_generation_error",
  AI_CONTENT_POLICY = "ai_content_policy",
  AI_TOKEN_LIMIT = "ai_token_limit",
  AI_MODEL_ERROR = "ai_model_error",
  
  // Server errors
  SERVER_INTERNAL_ERROR = "server_internal_error",
  SERVER_NOT_IMPLEMENTED = "server_not_implemented",
  SERVER_MAINTENANCE = "server_maintenance",
  
  // I/O errors
  IO_FILE_ERROR = "io_file_error",
  IO_STORAGE_LIMIT = "io_storage_limit",
  IO_UPLOAD_ERROR = "io_upload_error",
  
  // Network errors
  NETWORK_CONNECTION_ERROR = "network_connection_error",
  NETWORK_TIMEOUT = "network_timeout",
}

/**
 * Maps error categories to HTTP status codes
 */
export const HTTP_STATUS_MAP: Record<ErrorCategory, number> = {
  [ErrorCategory.AUTH]: 401,
  [ErrorCategory.PERMISSION]: 403,
  [ErrorCategory.VALIDATION]: 400,
  [ErrorCategory.NOT_FOUND]: 404,
  [ErrorCategory.CONFLICT]: 409,
  [ErrorCategory.RATE_LIMIT]: 429,
  [ErrorCategory.SERVICE]: 503,
  [ErrorCategory.DATABASE]: 500,
  [ErrorCategory.AI]: 500,
  [ErrorCategory.SERVER]: 500,
  [ErrorCategory.IO]: 500,
  [ErrorCategory.NETWORK]: 500,
};

/**
 * Maps specific error codes to more appropriate HTTP status codes
 * where the category default isn't sufficient
 */
export const ERROR_CODE_STATUS_MAP: Partial<Record<ErrorCode, number>> = {
  [ErrorCode.NOT_FOUND_RESOURCE]: 404,
  [ErrorCode.NOT_FOUND_USER]: 404,
  [ErrorCode.NOT_FOUND_RESUME]: 404,
  [ErrorCode.NOT_FOUND_JOB_DESCRIPTION]: 404,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.SERVER_NOT_IMPLEMENTED]: 501,
  [ErrorCode.SERVER_MAINTENANCE]: 503,
};

/**
 * Options for creating an API error
 */
export interface ApiErrorOptions {
  /** The error message */
  message: string;
  /** The error category */
  category: ErrorCategory;
  /** The specific error code */
  code?: ErrorCode;
  /** Additional error details for debugging */
  details?: unknown;
  /** Field-specific validation errors */
  validationErrors?: Array<{ field: string; message: string }>;
  /** The original error that caused this error */
  cause?: Error | unknown;
  /** Request ID for tracking */
  requestId?: string;
}

/**
 * Creates a standardized error response object
 * @param options Error options
 * @returns A standardized API error response
 */
export function createApiError(options: ApiErrorOptions): ApiErrorResponse {
  const response: ApiErrorResponse = {
    error: options.message,
  };

  if (options.code) {
    response.code = options.code;
  }

  if (options.validationErrors && options.validationErrors.length > 0) {
    response.validationErrors = options.validationErrors;
  }

  if (options.requestId) {
    response.requestId = options.requestId;
  }

  // Log error details in development
  if (process.env.NODE_ENV !== "production" && options.details) {
    console.error("API Error Details:", {
      message: options.message,
      category: options.category,
      code: options.code,
      details: options.details,
      cause: options.cause,
    });
  } else if (options.cause) {
    // Always log the cause in any environment if it exists
    console.error("API Error Cause:", options.cause);
  }

  return response;
}

/**
 * Gets the appropriate HTTP status code for an error
 * @param category Error category
 * @param code Optional specific error code
 * @returns The appropriate HTTP status code
 */
export function getErrorStatusCode(category: ErrorCategory, code?: ErrorCode): number {
  if (code && ERROR_CODE_STATUS_MAP[code]) {
    return ERROR_CODE_STATUS_MAP[code]!;
  }
  return HTTP_STATUS_MAP[category];
}

/**
 * Creates a standardized error response for validation errors
 * @param message The error message
 * @param validationErrors List of field-specific validation errors
 * @returns A validation error response
 */
export function createValidationError(
  message: string = "Validation failed",
  validationErrors?: Array<{ field: string; message: string }>
): ApiErrorResponse {
  return createApiError({
    message,
    category: ErrorCategory.VALIDATION,
    code: ErrorCode.VALIDATION_INVALID_DATA,
    validationErrors,
  });
}

/**
 * Creates a standardized error response for authentication errors
 * @param message The error message
 * @param code The specific error code
 * @returns An authentication error response
 */
export function createAuthError(
  message: string = "Authentication failed",
  code: ErrorCode = ErrorCode.AUTH_NOT_AUTHENTICATED
): ApiErrorResponse {
  return createApiError({
    message,
    category: ErrorCategory.AUTH,
    code,
  });
}

/**
 * Creates a standardized error response for resource not found errors
 * @param resource The resource type (e.g., "resume", "job description")
 * @param id The resource ID that was not found
 * @returns A not found error response
 */
export function createNotFoundError(
  resource: string,
  id?: string
): ApiErrorResponse {
  let message = `${resource} not found`;
  if (id) {
    message = `${resource} with ID ${id} not found`;
  }
  
  // Map resource to specific not found code
  let code = ErrorCode.NOT_FOUND_RESOURCE;
  if (resource.toLowerCase() === "resume") {
    code = ErrorCode.NOT_FOUND_RESUME;
  } else if (resource.toLowerCase() === "job description") {
    code = ErrorCode.NOT_FOUND_JOB_DESCRIPTION;
  } else if (resource.toLowerCase() === "user") {
    code = ErrorCode.NOT_FOUND_USER;
  }
  
  return createApiError({
    message,
    category: ErrorCategory.NOT_FOUND,
    code,
  });
}

/**
 * Creates a standardized error response for permission errors
 * @param message The error message
 * @param code The specific error code
 * @returns A permission error response
 */
export function createPermissionError(
  message: string = "Permission denied",
  code: ErrorCode = ErrorCode.PERMISSION_DENIED
): ApiErrorResponse {
  return createApiError({
    message,
    category: ErrorCategory.PERMISSION,
    code,
  });
}

/**
 * Creates a standardized error response for server errors
 * @param message The error message
 * @param error The original error
 * @returns A server error response
 */
export function createServerError(
  message: string = "An unexpected server error occurred",
  error?: unknown
): ApiErrorResponse {
  return createApiError({
    message,
    category: ErrorCategory.SERVER,
    code: ErrorCode.SERVER_INTERNAL_ERROR,
    cause: error,
    details: error,
  });
}

/**
 * Determines if an error is retryable
 * @param error The error to check
 * @param category The error category
 * @returns Whether the error is retryable
 */
export function isRetryableError(error: unknown, category?: ErrorCategory): boolean {
  // If category is provided, use it for quick determination
  if (category) {
    return [
      ErrorCategory.NETWORK,
      ErrorCategory.DATABASE,
      ErrorCategory.SERVICE,
      ErrorCategory.RATE_LIMIT
    ].includes(category);
  }

  // Check error code for specific retryable errors
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    const errorCode = error.code as string;
    return [
      ErrorCode.DATABASE_CONNECTION_ERROR,
      ErrorCode.NETWORK_CONNECTION_ERROR,
      ErrorCode.NETWORK_TIMEOUT,
      ErrorCode.SERVICE_TIMEOUT,
      ErrorCode.SERVICE_UNAVAILABLE,
      ErrorCode.RATE_LIMIT_EXCEEDED
    ].includes(errorCode as ErrorCode);
  }

  // Check error message for common retryable patterns
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    const message = (error as { message: string }).message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("connection") ||
      message.includes("unavailable") ||
      message.includes("temporary") ||
      message.includes("rate limit") ||
      message.includes("try again")
    );
  }

  return false;
}

/**
 * Handles Supabase errors and converts them to standardized API errors
 * @param error The Supabase error
 * @returns A standardized API error
 */
export function handleSupabaseError(error: unknown): ApiErrorResponse {
  console.error("Supabase error:", error);

  // Check if error is an object with expected properties
  if (
    error &&
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  ) {
    const typedError = error as { code: string; message: string; details?: unknown };

    // Handle known Supabase error codes
    switch (typedError.code) {
      case "PGRST116":
        return createNotFoundError("Resource");
      
      case "42P01":
        return createApiError({
          message: "Database table not found",
          category: ErrorCategory.DATABASE, 
          code: ErrorCode.DATABASE_QUERY_ERROR,
          details: typedError.details,
        });
      
      case "23505":
        return createApiError({
          message: "Unique constraint violation",
          category: ErrorCategory.CONFLICT,
          code: ErrorCode.CONFLICT_DUPLICATE_ENTRY,
          details: typedError.details,
        });
      
      case "23503":
        return createApiError({
          message: "Foreign key constraint violation",
          category: ErrorCategory.DATABASE,
          code: ErrorCode.DATABASE_FOREIGN_KEY_ERROR,
          details: typedError.details,
        });
      
      case "auth-user-not-found":
        return createNotFoundError("User");
      
      case "auth-invalid-credentials":
        return createAuthError("Invalid credentials", ErrorCode.AUTH_INVALID_CREDENTIALS);
      
      default:
        // Check for specific error patterns
        if (isUniqueConstraintError(error)) {
          return createApiError({
            message: "A record with this information already exists",
            category: ErrorCategory.CONFLICT,
            code: ErrorCode.CONFLICT_DUPLICATE_ENTRY,
            details: typedError.details,
          });
        }
        
        if (isForeignKeyConstraintError(error)) {
          return createApiError({
            message: "Referenced record does not exist",
            category: ErrorCategory.DATABASE,
            code: ErrorCode.DATABASE_FOREIGN_KEY_ERROR,
            details: typedError.details,
          });
        }
        
        if (isAuthError(error)) {
          return createAuthError(
            typedError.message || "Authentication error",
            ErrorCode.AUTH_INVALID_CREDENTIALS
          );
        }
        
        // General error fallback
        return createApiError({
          message: typedError.message || "An unexpected database error occurred",
          category: ErrorCategory.DATABASE,
          details: typedError.details,
          cause: error,
        });
    }
  }

  // Fallback for non-specific errors
  return createServerError(
    typeof error === "string" 
      ? error 
      : "An unexpected error occurred while accessing the database",
    error
  );
}

/**
 * Handles Anthropic/Claude AI errors and converts them to standardized API errors
 * @param error The Anthropic/Claude error
 * @returns A standardized API error
 */
export function handleAIError(error: unknown): ApiErrorResponse {
  console.error("AI service error:", error);

  // Check if error is an Anthropic error
  if (
    error &&
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "error" in error
  ) {
    const typedError = error as { 
      status: number; 
      error: { 
        type: string; 
        message: string; 
        param?: string;
      } 
    };

    // Map Anthropic error types to our error codes
    switch (typedError.error.type) {
      case "authentication_error":
        return createApiError({
          message: "AI service authentication error",
          category: ErrorCategory.SERVICE,
          code: ErrorCode.SERVICE_ERROR,
          details: typedError,
        });
      
      case "invalid_request_error":
        return createApiError({
          message: typedError.error.message || "Invalid request to AI service",
          category: ErrorCategory.VALIDATION,
          code: ErrorCode.VALIDATION_INVALID_DATA,
          details: typedError,
        });
      
      case "permission_error":
        return createApiError({
          message: "AI service permission error",
          category: ErrorCategory.PERMISSION,
          code: ErrorCode.PERMISSION_DENIED,
          details: typedError,
        });
      
      case "rate_limit_error":
        return createApiError({
          message: "AI service rate limit exceeded",
          category: ErrorCategory.RATE_LIMIT,
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          details: typedError,
        });
      
      case "content_policy_violation":
        return createApiError({
          message: "Content policy violation",
          category: ErrorCategory.AI,
          code: ErrorCode.AI_CONTENT_POLICY,
          details: typedError,
        });
      
      case "server_error":
        return createApiError({
          message: "AI service is currently unavailable",
          category: ErrorCategory.SERVICE,
          code: ErrorCode.SERVICE_UNAVAILABLE,
          details: typedError,
        });
      
      default:
        return createApiError({
          message: typedError.error.message || "AI service error",
          category: ErrorCategory.AI,
          code: ErrorCode.AI_GENERATION_ERROR,
          details: typedError,
        });
    }
  }

  // Fallback for non-specific AI errors
  return createApiError({
    message: error instanceof Error ? error.message : "AI processing error",
    category: ErrorCategory.AI,
    code: ErrorCode.AI_GENERATION_ERROR,
    cause: error,
  });
}