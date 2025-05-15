// File: /lib/middlewares/error-handler.ts
import { NextRequest, NextResponse } from "next/server";
import {
  ApiErrorResponse,
  ErrorCategory,
  ErrorCode,
  createApiError,
  createServerError,
  createAuthError,
  getErrorStatusCode,
} from "@/lib/utils/error-utils";
import { createId } from "@paralleldrive/cuid2";

export type ApiHandler = (
  request: NextRequest,
  context: { params: Record<string, string | string[]> }
) => Promise<NextResponse>;

export type ErrorHandlerOptions = {
  /**
   * Whether to include request IDs in error responses for tracking
   * @default true in production, false otherwise
   */
  includeRequestId?: boolean;
  
  /**
   * Whether to log detailed error information
   * @default true in development, false in production
   */
  logDetails?: boolean;
  
  /**
   * Custom logger function
   * @default console.error
   */
  logger?: (message: string, error: unknown) => void;
  
  /**
   * Custom error mapper function
   * @default undefined (use default error handling)
   */
  errorMapper?: (error: unknown) => ApiErrorResponse | undefined;
};

/**
 * Default options for error handler
 */
const defaultOptions: ErrorHandlerOptions = {
  includeRequestId: process.env.NODE_ENV === "production",
  logDetails: process.env.NODE_ENV !== "production",
  logger: (message, error) => console.error(message, error),
};

/**
 * Higher-order function that wraps an API handler with standardized error handling
 * @param handler The API handler function to wrap
 * @param options Options for error handling
 * @returns A wrapped handler function with error handling
 */
export function withErrorHandler(
  handler: ApiHandler,
  options: ErrorHandlerOptions = {}
): ApiHandler {
  // Merge options with defaults
  const { includeRequestId, logDetails, logger, errorMapper } = {
    ...defaultOptions,
    ...options,
  };

  return async (request: NextRequest, context: { params: Record<string, string | string[]> }) => {
    try {
      // Generate a request ID for tracking
      const requestId = includeRequestId ? createId() : undefined;

      // Execute the original handler
      return await handler(request, context);
    } catch (error) {
      const url = request.url;
      const method = request.method;
      const requestInfo = `${method} ${new URL(url).pathname}`;
      
      // Log the error
      if (logger) {
        logger(`API error in ${requestInfo}:`, error);
      }

      // Generate detailed logs in development
      if (logDetails && process.env.NODE_ENV !== "production") {
        console.error("Request URL:", url);
        console.error("Request method:", method);
        console.error("Request headers:", Object.fromEntries(request.headers.entries()));
        
        try {
          if (["POST", "PUT", "PATCH"].includes(method)) {
            const body = await request.clone().json();
            console.error("Request body:", JSON.stringify(body, null, 2));
          }
        } catch (e) {
          console.error("Could not parse request body");
        }
      }

      // Generate a request ID for the error response if enabled
      const requestId = includeRequestId ? createId() : undefined;

      // Use custom error mapper if provided
      if (errorMapper) {
        const mappedError = errorMapper(error);
        if (mappedError) {
          // Add request ID to the mapped error if needed
          const errorWithId = requestId
            ? { ...mappedError, requestId }
            : mappedError;
            
          // Determine status code
          let statusCode = 500;
          if ("code" in errorWithId && errorWithId.code) {
            const code = errorWithId.code as ErrorCode;
            const category = Object.entries(ErrorCode).find(
              ([_, value]) => value === code
            )?.[0]?.split("_")?.[0]?.toLowerCase() as ErrorCategory | undefined;
            
            if (category) {
              statusCode = getErrorStatusCode(category, code);
            }
          }
          
          return NextResponse.json(errorWithId, { status: statusCode });
        }
      }

      // Handle authentication errors
      if (
        error instanceof Error &&
        (error.message.includes("auth") || error.message.includes("authentication"))
      ) {
        const authError = createAuthError(error.message);
        const errorWithId = requestId ? { ...authError, requestId } : authError;
        return NextResponse.json(errorWithId, { status: 401 });
      }

      // Handle expected errors (those created by our createApiError functions)
      if (
        error &&
        typeof error === "object" &&
        "error" in error &&
        "category" in error
      ) {
        const apiError = error as ApiErrorResponse & { category: ErrorCategory; code?: ErrorCode };
        const statusCode = getErrorStatusCode(apiError.category, apiError.code as ErrorCode);
        const errorWithId = requestId ? { ...apiError, requestId } : apiError;
        
        return NextResponse.json(errorWithId, { status: statusCode });
      }

      // Handle unknown errors
      const serverError = createServerError(
        "An unexpected error occurred",
        error
      );
      const errorWithId = requestId ? { ...serverError, requestId } : serverError;
      
      return NextResponse.json(errorWithId, { status: 500 });
    }
  };
}

/**
 * Utility function to wrap all API handlers in a route file with error handling
 * @param handlers Object containing HTTP method handlers
 * @param options Error handling options
 * @returns Object with wrapped HTTP method handlers
 * 
 * @example
 * ```
 * export const { GET, POST, PUT, DELETE } = withRouteErrorHandlers({
 *   async GET(request) { ... },
 *   async POST(request) { ... },
 *   // ...
 * });
 * ```
 */
export function withRouteErrorHandlers<
  T extends Record<string, ApiHandler>
>(handlers: T, options: ErrorHandlerOptions = {}): T {
  const wrappedHandlers = {} as T;
  
  for (const [method, handler] of Object.entries(handlers)) {
    wrappedHandlers[method as keyof T] = withErrorHandler(
      handler as ApiHandler,
      options
    ) as T[keyof T];
  }
  
  return wrappedHandlers;
}

/**
 * Middleware to ensure a request is authenticated
 * @param request The Next.js request object
 * @returns Error response if not authenticated, null otherwise
 */
export async function ensureAuthenticated(
  request: NextRequest
): Promise<NextResponse | null> {
  // Check for authenticated session (your actual auth check logic may differ)
  // This is a placeholder for your actual authentication check
  const isAuthenticated = Boolean(request.headers.get("authorization"));
  
  if (!isAuthenticated) {
    return NextResponse.json(
      createAuthError("Authentication required", ErrorCode.AUTH_NOT_AUTHENTICATED),
      { status: 401 }
    );
  }
  
  return null;
}

/**
 * Middleware to validate request body against a schema
 * @param request The Next.js request object
 * @param validateFn Function to validate the request body
 * @returns Error response if validation fails, null otherwise
 */
export async function validateRequest<T>(
  request: NextRequest,
  validateFn: (data: unknown) => 
    { valid: boolean; errors?: Array<{ field: string; message: string }> }
): Promise<{ validatedData: T; response: NextResponse | null }> {
  try {
    const body = await request.json();
    const validation = validateFn(body);
    
    if (!validation.valid) {
      const errorResponse = createApiError({
        message: "Validation failed",
        category: ErrorCategory.VALIDATION,
        code: ErrorCode.VALIDATION_INVALID_DATA,
        validationErrors: validation.errors,
      });
      
      return {
        validatedData: {} as T,
        response: NextResponse.json(errorResponse, { status: 400 }),
      };
    }
    
    return { validatedData: body as T, response: null };
  } catch (error) {
    const errorResponse = createApiError({
      message: "Invalid request body",
      category: ErrorCategory.VALIDATION,
      code: ErrorCode.VALIDATION_INVALID_FORMAT,
    });
    
    return {
      validatedData: {} as T,
      response: NextResponse.json(errorResponse, { status: 400 }),
    };
  }
}