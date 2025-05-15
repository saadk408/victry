import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getLogger } from '@/lib/utils/logger';
import { 
  ErrorCategory, 
  ErrorCode, 
  getErrorStatusCode, 
  createApiError 
} from '@/lib/utils/error-utils';
import { ApiErrorResponse } from '@/types/api';
import { createClient } from '@/lib/supabase/client';

// Create a logger for API requests
const apiLogger = getLogger().child('api-middleware');

// Type for API handlers
export type ApiHandler = (
  req: NextRequest,
  params?: Record<string, string | string[]>
) => Promise<NextResponse> | NextResponse;

// Options for error logging middleware
export interface ErrorLoggingOptions {
  // Whether to log to database
  logToDatabase?: boolean;
  // Maximum size of request/response to log (in bytes)
  maxBodySize?: number;
  // Whether to include request body in logs
  includeRequestBody?: boolean;
  // Headers to exclude from logs (case-insensitive)
  excludeHeaders?: string[];
  // Whether to include stack traces in the response during development
  includeStackInDev?: boolean;
}

// Default options
const defaultOptions: ErrorLoggingOptions = {
  logToDatabase: true,
  maxBodySize: 10000, // 10KB
  includeRequestBody: true,
  excludeHeaders: ['authorization', 'cookie', 'set-cookie'],
  includeStackInDev: true,
};

/**
 * Middleware function for logging API errors
 * @param handler The API route handler
 * @param options Options for error logging
 * @returns A wrapped handler with error logging
 */
export function withErrorLogging(
  handler: ApiHandler,
  options: ErrorLoggingOptions = {}
): ApiHandler {
  // Merge options with defaults
  const opts = { ...defaultOptions, ...options };
  
  return async (req: NextRequest, params?: Record<string, string | string[]>) => {
    // Generate a unique request ID
    const requestId = uuidv4();
    const url = new URL(req.url);
    const start = Date.now();
    
    // Extract request information for logging
    const requestInfo = {
      method: req.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
      headers: getFilteredHeaders(req.headers, opts.excludeHeaders || []),
      requestId,
    };
    
    // Add request body if configured
    if (opts.includeRequestBody) {
      try {
        // Clone the request to read the body
        const clonedReq = req.clone();
        const contentType = req.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          const body = await clonedReq.json();
          
          // Truncate body if it's too large
          if (JSON.stringify(body).length <= (opts.maxBodySize || 10000)) {
            // Remove sensitive fields
            const filteredBody = sanitizeBody(body);
            Object.assign(requestInfo, { body: filteredBody });
          } else {
            Object.assign(requestInfo, { body: '[BODY_TOO_LARGE]' });
          }
        }
      } catch (e) {
        // Ignore errors reading the body
      }
    }
    
    // Log the incoming request
    apiLogger.debug(`API Request: ${req.method} ${url.pathname}`, requestInfo);
    
    try {
      // Add the request ID to the request headers
      const requestWithId = new Request(req.url, {
        method: req.method,
        headers: new Headers(req.headers),
        body: req.body,
        signal: req.signal,
      });
      requestWithId.headers.set('x-request-id', requestId);
      
      // Call the original handler
      const response = await handler(requestWithId as NextRequest, params);
      
      // Log successful response
      const duration = Date.now() - start;
      apiLogger.debug(`API Response: ${response.status}`, {
        requestId,
        status: response.status,
        duration,
      });
      
      // Add request ID to response headers
      response.headers.set('x-request-id', requestId);
      
      return response;
    } catch (error) {
      // Calculate request duration
      const duration = Date.now() - start;
      
      // Convert error to a standardized format
      const { status, apiError, errorInfo } = processError(error, requestId);
      
      // Log the error with full details
      apiLogger.error(
        `API Error: ${req.method} ${url.pathname}`,
        error,
        {
          requestId,
          status,
          duration,
          ...errorInfo,
        }
      );
      
      // Log to database if configured
      if (opts.logToDatabase) {
        try {
          await logErrorToDatabase(req, error, status, requestId, errorInfo);
        } catch (dbError) {
          // If database logging fails, log the failure but don't block the response
          apiLogger.error('Failed to log error to database', dbError, { requestId });
        }
      }
      
      // Create error response
      const response = NextResponse.json(apiError, { status });
      
      // Add request ID to response headers
      response.headers.set('x-request-id', requestId);
      
      return response;
    }
  };
}

/**
 * Processes an error and converts it to a standardized format
 * @param error The error to process
 * @param requestId The request ID
 * @returns The processed error information
 */
function processError(error: unknown, requestId: string): {
  status: number;
  apiError: ApiErrorResponse;
  errorInfo: {
    category?: ErrorCategory;
    code?: ErrorCode;
    stack?: string;
  };
} {
  // Default category and code
  let category = ErrorCategory.SERVER;
  let code = ErrorCode.SERVER_INTERNAL_ERROR;
  let message = 'An unexpected error occurred';
  let details: unknown;
  let status = 500;
  
  // Extract error information based on the error type
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      message = error.message;
    }
    
    if ('category' in error && typeof error.category === 'string') {
      category = error.category as ErrorCategory;
    }
    
    if ('code' in error && typeof error.code === 'string') {
      code = error.code as ErrorCode;
    }
    
    if ('details' in error) {
      details = (error as any).details;
    }
    
    // Get stack trace if available
    const stack = error instanceof Error ? error.stack : undefined;
    
    // Determine status code
    status = getErrorStatusCode(category, code as ErrorCode);
    
    // Create API error response
    const apiError = createApiError({
      message,
      category,
      code: code as ErrorCode,
      details,
      requestId,
      cause: error,
    });
    
    return {
      status,
      apiError,
      errorInfo: {
        category,
        code: code as ErrorCode,
        stack,
      },
    };
  }
  
  // Fallback for non-object errors
  const apiError = createApiError({
    message: typeof error === 'string' ? error : message,
    category,
    code,
    requestId,
    cause: error,
  });
  
  return {
    status,
    apiError,
    errorInfo: {
      category,
      code,
    },
  };
}

/**
 * Logs an error to the database
 * @param req The request
 * @param error The error
 * @param status The HTTP status code
 * @param requestId The request ID
 * @param errorInfo Additional error information
 */
async function logErrorToDatabase(
  req: NextRequest,
  error: unknown,
  status: number,
  requestId: string,
  errorInfo: {
    category?: ErrorCategory;
    code?: ErrorCode;
    stack?: string;
  }
): Promise<void> {
  try {
    const supabase = createClient();
    const url = new URL(req.url);
    const clonedReq = req.clone();
    let body: any = null;
    
    // Try to parse request body for logging
    try {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        body = await clonedReq.json();
        body = sanitizeBody(body);
      }
    } catch (e) {
      // Ignore body parsing errors
    }
    
    // Extract user ID from auth if available
    let userId = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      userId = session?.user?.id;
    } catch (e) {
      // Ignore auth errors
    }
    
    // Filter headers for logging
    const filteredHeaders = Object.fromEntries(
      Array.from(req.headers.entries())
        .filter(([key]) => !defaultOptions.excludeHeaders?.includes(key.toLowerCase()))
        .map(([key, value]) => [key, value])
    );
    
    // Call the database function to log the error
    await supabase.rpc('log_api_error', {
      p_endpoint: url.pathname,
      p_method: req.method,
      p_status_code: status,
      p_error_message: error instanceof Error ? error.message : String(error),
      p_request_id: requestId,
      p_error_category: errorInfo.category,
      p_error_code: errorInfo.code,
      p_user_id: userId,
      p_request_body: body ? JSON.stringify(body) : null,
      p_request_headers: JSON.stringify(filteredHeaders),
      p_stack_trace: errorInfo.stack,
    });
  } catch (error) {
    // Swallow errors logging to the database to prevent cascading failures
    console.error('Failed to log error to database:', error);
  }
}

/**
 * Filters sensitive headers from request headers
 * @param headers Request headers
 * @param exclude Headers to exclude
 * @returns Filtered headers
 */
function getFilteredHeaders(
  headers: Headers,
  exclude: string[]
): Record<string, string> {
  const filtered: Record<string, string> = {};
  
  const excludeLower = exclude.map(h => h.toLowerCase());
  
  headers.forEach((value, key) => {
    if (!excludeLower.includes(key.toLowerCase())) {
      filtered[key] = value;
    } else {
      filtered[key] = '[REDACTED]';
    }
  });
  
  return filtered;
}

/**
 * Sanitizes request body to remove sensitive information
 * @param body Request body
 * @returns Sanitized body
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  // List of sensitive field names to redact
  const sensitiveFields = [
    'password', 'passwordConfirm', 'confirmPassword', 'currentPassword', 'newPassword',
    'token', 'accessToken', 'refreshToken', 'secret', 'apiKey', 'key',
    'authorization', 'auth', 'credentials', 'credit_card', 'creditCard', 'cvv', 'ssn',
  ];
  
  const sanitized = { ...body };
  
  // Recursively sanitize objects
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeBody(sanitized[key]);
    } else if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Creates a wrapper for all route handlers with error logging
 * @param handlers Object containing route handlers
 * @param options Options for error logging
 * @returns Object with wrapped handlers
 */
export function withRouteErrorLogging<T extends Record<string, ApiHandler>>(
  handlers: T,
  options: ErrorLoggingOptions = {}
): T {
  const wrappedHandlers = { ...handlers };
  
  for (const method in wrappedHandlers) {
    wrappedHandlers[method] = withErrorLogging(handlers[method], options);
  }
  
  return wrappedHandlers;
}