// File: /lib/utils/api-utils.ts
import { NextRequest, NextResponse } from "next/server";
import { ApiErrorResponse } from "@/types/api";
import { createId } from "@paralleldrive/cuid2";
import { 
  ErrorCategory, 
  ErrorCode, 
  createApiError,
  createAuthError,
  createNotFoundError,
  handleSupabaseError,
  handleAIError,
  getErrorStatusCode
} from "./error-utils";

/**
 * Standard success response interface for API endpoints
 */
export interface ApiSuccessResponse<T> {
  data: T;
  metadata?: Record<string, unknown>;
  requestId?: string;
}

/**
 * Type guard to check if a response is an error response
 * @param response The response to check
 * @returns Whether the response is an API error response
 */
export function isApiErrorResponse(
  response: unknown
): response is ApiErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof (response as { error: unknown }).error === "string"
  );
}

/**
 * Type guard to check if a response is a success response
 * @param response The response to check
 * @returns Whether the response is an API success response
 */
export function isApiSuccessResponse<T = unknown>(
  response: unknown
): response is ApiSuccessResponse<T> {
  return (
    typeof response === "object" &&
    response !== null &&
    "data" in response
  );
}

/**
 * Creates a standardized success response
 * @param data The data to include in the response
 * @param metadata Optional metadata to include in the response
 * @param includeRequestId Whether to include a request ID (default: true in production)
 * @returns A standardized success response object
 */
export function createApiSuccess<T>(
  data: T,
  metadata?: Record<string, unknown>,
  includeRequestId: boolean = process.env.NODE_ENV === "production"
): ApiSuccessResponse<T> {
  const response: ApiSuccessResponse<T> = { data };

  if (metadata) {
    response.metadata = metadata;
  }

  if (includeRequestId) {
    response.requestId = createId();
  }

  return response;
}

/**
 * Creates a NextResponse with a standardized success response
 * @param data The data to include in the response
 * @param status The HTTP status code (default: 200)
 * @param metadata Optional metadata to include in the response
 * @returns A NextResponse with a standardized success response
 */
export function apiResponse<T>(
  data: T,
  status: number = 200,
  metadata?: Record<string, unknown>
): NextResponse {
  const response = createApiSuccess(data, metadata);
  return NextResponse.json(response, { status });
}

/**
 * Creates a NextResponse with a standardized error response
 * @param message The error message
 * @param category The error category
 * @param code The specific error code
 * @param details Additional error details
 * @returns A NextResponse with a standardized error response
 */
export function apiError(
  message: string,
  category: ErrorCategory,
  code?: ErrorCode,
  details?: unknown
): NextResponse {
  const error = createApiError({
    message,
    category,
    code,
    details,
  });

  const status = getErrorStatusCode(category, code);
  return NextResponse.json(error, { status });
}

/**
 * Options for the fetch wrapper
 */
export interface ApiFetchOptions extends RequestInit {
  /**
   * The base URL to use for the request
   * @default "/api"
   */
  baseUrl?: string;
  
  /**
   * Validation function to validate the response data
   */
  validateResponse?: (data: unknown) => boolean;
  
  /**
   * Whether to include credentials in the request
   * @default "include"
   */
  credentials?: RequestCredentials;
  
  /**
   * Whether to retry the request on failure
   * @default false
   */
  retry?: boolean;
  
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;
  
  /**
   * Base delay for exponential backoff in milliseconds
   * @default 500
   */
  retryDelay?: number;
  
  /**
   * Custom error transformer
   */
  errorTransformer?: (
    error: unknown,
    response?: Response
  ) => ApiErrorResponse;
}

/**
 * Fetches data from the API with standardized error handling
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns The response data
 * @throws ApiErrorResponse if the request fails
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const {
    baseUrl = "/api",
    validateResponse,
    retry = false,
    maxRetries = 3,
    retryDelay = 500,
    errorTransformer,
    ...fetchOptions
  } = options;

  // Default headers for JSON API
  const headers = new Headers(fetchOptions.headers);
  if (!headers.has("Content-Type") && fetchOptions.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  // Default credentials for authenticated requests
  const credentials = fetchOptions.credentials || "include";

  // Format request body
  let body = fetchOptions.body;
  if (
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer)
  ) {
    body = JSON.stringify(body);
  }

  // Build the full URL
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;

  // Function to perform the actual fetch
  const performFetch = async (attempt: number): Promise<T> => {
    try {
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
        credentials,
        body: body as BodyInit,
      });

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (contentType && !contentType.includes("application/json")) {
        // For specific content types, handle specially (e.g., text, blob, etc.)
        if (contentType.includes("text/")) {
          const text = await response.text();
          
          if (!response.ok) {
            throw createApiError({
              message: text || `Request failed with status ${response.status}`,
              category: ErrorCategory.SERVICE,
              code: ErrorCode.SERVICE_ERROR,
              details: { status: response.status, statusText: response.statusText },
            });
          }
          
          return text as unknown as T;
        }
        
        // Handle binary responses like PDFs, images, etc.
        if (["application/pdf", "image/"].some(type => contentType.includes(type))) {
          const blob = await response.blob();
          
          if (!response.ok) {
            throw createApiError({
              message: `Binary request failed with status ${response.status}`,
              category: ErrorCategory.SERVICE,
              code: ErrorCode.SERVICE_ERROR,
              details: { status: response.status, statusText: response.statusText },
            });
          }
          
          return blob as unknown as T;
        }
        
        // Default handling for non-JSON, non-special content types
        if (!response.ok) {
          throw createApiError({
            message: `Request failed with status ${response.status}`,
            category: ErrorCategory.SERVICE,
            code: ErrorCode.SERVICE_ERROR,
            details: { 
              status: response.status, 
              statusText: response.statusText,
              contentType 
            },
          });
        }
        
        // Return raw response as a fallback
        return response as unknown as T;
      }

      // Parse JSON response
      let data: unknown;
      try {
        data = await response.json();
      } catch (error) {
        // Handle JSON parse errors
        throw createApiError({
          message: "Invalid JSON response",
          category: ErrorCategory.SERVICE,
          code: ErrorCode.SERVICE_ERROR,
          details: { 
            status: response.status, 
            statusText: response.statusText,
            error 
          },
        });
      }

      // Check for API error response
      if (isApiErrorResponse(data)) {
        // Use error transformer if provided
        if (errorTransformer) {
          throw errorTransformer(data, response);
        }
        
        // Create standard error from the API error response
        throw createApiError({
          message: data.error,
          category: getErrorCategoryFromStatus(response.status),
          code: data.code as ErrorCode | undefined,
          validationErrors: data.validationErrors,
          details: data,
        });
      }

      // Check for success response
      if (isApiSuccessResponse(data)) {
        // Validate the response data if a validator is provided
        if (validateResponse && !validateResponse(data.data)) {
          throw createApiError({
            message: "Invalid response data",
            category: ErrorCategory.SERVICE,
            code: ErrorCode.SERVICE_ERROR,
            details: data,
          });
        }
        
        return data.data as T;
      }

      // If the response is not a standard API response, return the data directly
      // Validate the raw response data if a validator is provided
      if (validateResponse && !validateResponse(data)) {
        throw createApiError({
          message: "Invalid response data",
          category: ErrorCategory.SERVICE,
          code: ErrorCode.SERVICE_ERROR,
          details: data,
        });
      }
      
      return data as T;
    } catch (error) {
      // Check if we should retry the request
      if (
        retry &&
        attempt < maxRetries &&
        isRetryableError(error, response)
      ) {
        // Calculate delay with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        
        // Wait for the delay
        await new Promise((resolve) => setTimeout(resolve, delay));
        
        // Retry the request
        return performFetch(attempt + 1);
      }
      
      // Use error transformer if provided
      if (errorTransformer) {
        throw errorTransformer(error, undefined);
      }
      
      // Format standard errors
      if (error instanceof Error) {
        // Network errors
        if (error.name === "TypeError" && error.message.includes("fetch")) {
          throw createApiError({
            message: "Network error",
            category: ErrorCategory.NETWORK,
            code: ErrorCode.NETWORK_CONNECTION_ERROR,
            cause: error,
          });
        }
        
        // Timeout errors
        if (error.name === "TimeoutError" || error.message.includes("timeout")) {
          throw createApiError({
            message: "Request timed out",
            category: ErrorCategory.NETWORK,
            code: ErrorCode.NETWORK_TIMEOUT,
            cause: error,
          });
        }
      }
      
      // Pass through ApiErrorResponse objects
      if (isApiErrorResponse(error)) {
        throw error;
      }
      
      // Re-throw unknown errors with standard format
      throw createApiError({
        message: error instanceof Error ? error.message : "API request failed",
        category: ErrorCategory.SERVICE,
        code: ErrorCode.SERVICE_ERROR,
        cause: error,
      });
    }
  };

  // Start with first attempt
  return performFetch(1);
}

/**
 * Determines if an error is retryable for API requests
 * @param error The error to check
 * @param response The response object, if available
 * @returns Whether the error is retryable
 */
function isRetryableError(error: unknown, response?: Response): boolean {
  // Retry if no response (network error) or for 5xx status codes
  if (!response || (response.status >= 500 && response.status < 600)) {
    return true;
  }
  
  // Retry on 429 Too Many Requests
  if (response.status === 429) {
    return true;
  }
  
  // Check error message for network-related issues
  if (error instanceof Error) {
    if (
      error.message.includes("network") ||
      error.message.includes("timeout") ||
      error.message.includes("connection") ||
      error.message.includes("abort")
    ) {
      return true;
    }
  }
  
  // Check if it's an API error response with a retryable code
  if (isApiErrorResponse(error) && error.code) {
    return [
      ErrorCode.NETWORK_CONNECTION_ERROR,
      ErrorCode.NETWORK_TIMEOUT,
      ErrorCode.SERVICE_TIMEOUT,
      ErrorCode.SERVICE_UNAVAILABLE,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      ErrorCode.DATABASE_CONNECTION_ERROR
    ].includes(error.code as ErrorCode);
  }
  
  return false;
}

/**
 * Maps HTTP status codes to error categories
 * @param status The HTTP status code
 * @returns The corresponding error category
 */
function getErrorCategoryFromStatus(status: number): ErrorCategory {
  switch (true) {
    case status === 400:
      return ErrorCategory.VALIDATION;
    case status === 401:
      return ErrorCategory.AUTH;
    case status === 403:
      return ErrorCategory.PERMISSION;
    case status === 404:
      return ErrorCategory.NOT_FOUND;
    case status === 409:
      return ErrorCategory.CONFLICT;
    case status === 429:
      return ErrorCategory.RATE_LIMIT;
    case status >= 500:
      return ErrorCategory.SERVER;
    default:
      return ErrorCategory.SERVICE;
  }
}