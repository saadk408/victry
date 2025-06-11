/**
 * Audit Logging Middleware
 * 
 * This middleware automatically logs critical API operations to the audit system.
 * It tracks API requests and their outcomes for security and compliance purposes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createActionClient } from '../supabase/server';
import { logCriticalOperation, OperationCategory } from '../supabase/audit-logger';
import { logger } from '../utils/logger';

export type ApiHandler = (
  req: NextRequest,
  params?: Record<string, string | string[]>
) => Promise<NextResponse>;

export interface AuditLoggingOptions {
  /** Whether to enable audit logging */
  enabled?: boolean;
  /** The category of operation being performed */
  category?: OperationCategory;
  /** The specific operation type within the category */
  operationType?: string;
  /** Custom function to extract table name from request */
  getTableName?: (req: NextRequest) => string | undefined;
  /** Custom function to extract record ID from request */
  getRecordId?: (req: NextRequest) => string | undefined;
  /** Custom function to extract additional details from request */
  getDetails?: (req: NextRequest, response?: NextResponse) => Record<string, any> | undefined;
  /** Whether to include request body in the audit log */
  includeRequestBody?: boolean;
  /** Whether to include response body in the audit log */
  includeResponseBody?: boolean;
  /** Array of paths for which audit logging should be skipped */
  excludePaths?: string[];
}

const defaultOptions: AuditLoggingOptions = {
  enabled: true,
  category: OperationCategory.Api,
  includeRequestBody: false,
  includeResponseBody: false,
};

/**
 * Extract operation type from request
 * 
 * @param req Next.js request object
 * @returns Operation type string
 */
function getDefaultOperationType(req: NextRequest): string {
  const method = req.method.toUpperCase();
  const path = req.nextUrl.pathname;
  
  // Extract the main resource from the path
  const pathParts = path.split('/').filter(Boolean);
  const resource = pathParts.length > 1 ? pathParts[1] : 'unknown';
  
  return `${method}_${resource}`;
}

/**
 * Extract table name from request path
 * 
 * @param req Next.js request object
 * @returns Table name or undefined
 */
function getDefaultTableName(req: NextRequest): string | undefined {
  const path = req.nextUrl.pathname;
  const pathParts = path.split('/').filter(Boolean);
  
  // Try to determine table name from path
  if (pathParts.length > 1) {
    // Convert path segment to potential table name
    // e.g., /api/resumes -> resumes
    return pathParts[1];
  }
  
  return undefined;
}

/**
 * Extract record ID from request path
 * 
 * @param req Next.js request object
 * @returns Record ID or undefined
 */
function getDefaultRecordId(req: NextRequest): string | undefined {
  const path = req.nextUrl.pathname;
  const pathParts = path.split('/').filter(Boolean);
  
  // Try to determine record ID from path
  // e.g., /api/resumes/123 -> 123
  if (pathParts.length > 2) {
    return pathParts[2];
  }
  
  // Check query parameters
  const id = req.nextUrl.searchParams.get('id');
  if (id) {
    return id;
  }
  
  return undefined;
}

/**
 * Extract details from request and response
 * 
 * @param req Next.js request object
 * @param res Next.js response object
 * @param options Middleware options
 * @returns Details object
 */
async function getDefaultDetails(
  req: NextRequest,
  res?: NextResponse,
  options?: AuditLoggingOptions
): Promise<Record<string, any>> {
  const details: Record<string, any> = {
    method: req.method,
    path: req.nextUrl.pathname,
    query: Object.fromEntries(req.nextUrl.searchParams.entries()),
    headers: Object.fromEntries(
      Array.from(req.headers.entries()).filter(([key]) => 
        !['authorization', 'cookie', 'set-cookie'].includes(key.toLowerCase())
      )
    ),
    statusCode: res?.status,
  };
  
  // Include request body if enabled
  if (options?.includeRequestBody && req.body && req.headers.get('content-type')?.includes('application/json')) {
    try {
      // Clone the request to avoid consuming the body
      const clonedReq = req.clone();
      const body = await clonedReq.json();
      
      // Sanitize sensitive fields
      const sanitizedBody = sanitizeObject(body);
      details.requestBody = sanitizedBody;
    } catch (error) {
      // Ignore parsing errors
    }
  }
  
  // Include response body if enabled
  if (options?.includeResponseBody && res) {
    try {
      // Clone the response to avoid consuming the body
      const clonedRes = res.clone();
      if (clonedRes.headers.get('content-type')?.includes('application/json')) {
        const body = await clonedRes.json();
        
        // Sanitize sensitive fields
        const sanitizedBody = sanitizeObject(body);
        details.responseBody = sanitizedBody;
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }
  
  return details;
}

/**
 * Sanitize an object to remove sensitive fields
 * 
 * @param obj Object to sanitize
 * @returns Sanitized object
 */
function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  // List of sensitive field names to redact
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth', 'credential', 'access_token',
    'refresh_token', 'private', 'credit_card', 'card', 'cvv', 'ssn', 'social',
    'passcode', 'pin', 'apikey', 'api_key', 'jwt'
  ];
  
  // Clone the object to avoid modifying the original
  const sanitized = Array.isArray(obj) 
    ? [...obj] 
    : { ...obj };
  
  // Sanitize each property
  for (const key in sanitized) {
    if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
      // Check if field name contains sensitive information
      const isMatched = sensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      );
      
      if (isMatched) {
        // Redact sensitive information
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizeObject(sanitized[key]);
      }
    }
  }
  
  return sanitized;
}

/**
 * Middleware that adds audit logging to API routes
 * 
 * @param handler The API route handler
 * @param options Audit logging options
 * @returns Enhanced handler with audit logging
 */
export function withAuditLogging(
  handler: ApiHandler,
  options?: AuditLoggingOptions
): ApiHandler {
  const opts = { ...defaultOptions, ...options };
  
  return async (req: NextRequest, params?: Record<string, string | string[]>) => {
    // If audit logging is disabled, just run the handler
    if (!opts.enabled) {
      return handler(req, params);
    }
    
    // Check if path is excluded
    if (opts.excludePaths && opts.excludePaths.some(path => req.nextUrl.pathname.startsWith(path))) {
      return handler(req, params);
    }
    
    // Determine operation details
    const operationType = opts.operationType || getDefaultOperationType(req);
    const category = opts.category || OperationCategory.Api;
    
    // Get table name and record ID
    const tableName = opts.getTableName ? opts.getTableName(req) : getDefaultTableName(req);
    const recordId = opts.getRecordId ? opts.getRecordId(req) : getDefaultRecordId(req);
    
    let response: NextResponse;
    const startTime = performance.now();
    
    try {
      // Execute the handler
      response = await handler(req, params);
      const executionTime = performance.now() - startTime;
      
      // Determine if request was successful based on status code
      const isSuccessful = response.status >= 200 && response.status < 300;
      
      // Get details for the audit log
      const details = opts.getDetails 
        ? opts.getDetails(req, response) 
        : await getDefaultDetails(req, response, opts);
      
      // Add execution time to details
      details.executionTime = executionTime;
      details.successful = isSuccessful;
      
      // Create audit log entry
      logCriticalOperation(
        operationType,
        category,
        details,
        recordId,
        tableName,
      ).catch(err => {
        logger.error('Failed to create audit log entry', { err });
      });
      
      return response;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      // Get details for the audit log
      const details = opts.getDetails 
        ? opts.getDetails(req) 
        : await getDefaultDetails(req, undefined, opts);
      
      // Add error and execution time to details
      details.executionTime = executionTime;
      details.successful = false;
      details.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Create audit log entry for the error
      logCriticalOperation(
        operationType,
        category,
        details,
        recordId,
        tableName,
      ).catch(err => {
        logger.error('Failed to create audit log entry for error', { err });
      });
      
      // Re-throw the error
      throw error;
    }
  };
}