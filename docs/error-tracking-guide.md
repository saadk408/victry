# Error Tracking System Guide

This document outlines the comprehensive error tracking system implemented in the Victry application. The system is designed to provide detailed, structured error logging, tracking, and analysis capabilities across the entire application.

## Overview

The error tracking system consists of the following components:

1. **Centralized Logging** - A unified logging system for all parts of the application
2. **Error Categorization** - Consistent categorization and error codes
3. **Database Tracking** - Persistent storage of errors in Supabase
4. **API Error Middleware** - Automatic error handling and logging for API routes
5. **Retry Mechanisms** - Automatic retry for transient errors
6. **Analytics and Reporting** - SQL functions for error analysis and trends

## Core Components

### 1. Logging System

The logging system is defined in `lib/utils/logger.ts` and provides:

- Standardized log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- Multiple transport options (console, server, database)
- Structured log entries with metadata
- Context-specific loggers with inheritance
- Request tracing with unique IDs

Usage example:

```typescript
import { getLogger } from '@/lib/utils/logger';

// Create a logger for a specific context
const logger = getLogger().child('user-service');

// Log different levels
logger.debug('Processing user data', { userId: '123' });
logger.info('User updated successfully');
logger.warn('Password reset requested', { userId: '123' });
logger.error('Failed to update user', error, { userId: '123' });
logger.fatal('Database connection failed', error);
```

### 2. Error Categorization

The error categorization system is defined in `lib/utils/error-utils.ts` and provides:

- Consistent error categories (AUTH, PERMISSION, VALIDATION, etc.)
- Specific error codes within each category
- Mapping of errors to appropriate HTTP status codes
- Utility functions for creating standard error responses

Usage example:

```typescript
import { 
  ErrorCategory,
  ErrorCode,
  createApiError,
  createValidationError,
  createAuthError
} from '@/lib/utils/error-utils';

// Create specific error types
throw createValidationError('Name is required', [{ field: 'name', message: 'Name is required' }]);
throw createAuthError('Invalid credentials', ErrorCode.AUTH_INVALID_CREDENTIALS);

// Create custom errors
throw {
  message: 'You do not have permission to access this resource',
  category: ErrorCategory.PERMISSION,
  code: ErrorCode.PERMISSION_DENIED,
};
```

### 3. Database Tracking

Error events are stored in two Supabase tables:

- `system_logs` - Central storage for all log entries
- `api_errors` - Detailed tracking of API errors

The database schema includes:

- Efficient BRIN indexes for time-based queries
- GIN indexes for JSONB metadata
- Row-level security policies
- Database functions for error insertion and analysis

### 4. API Error Middleware

The API error middleware (`lib/middlewares/error-logging-middleware.ts`) provides:

- Automatic error handling for API routes
- Request ID tracking for correlation
- Standardized error responses
- Request/response logging
- Integration with the database tracking system

Usage example:

```typescript
import { withRouteErrorLogging } from '@/lib/middlewares/error-logging-middleware';

// Create route handlers
async function handleGet(req: NextRequest) {
  // Implementation
}

async function handlePost(req: NextRequest) {
  // Implementation
}

// Export with error logging middleware
export const { GET, POST } = withRouteErrorLogging({
  GET: handleGet,
  POST: handlePost
});
```

### 5. Retry Mechanisms

The retry utility (`lib/utils/retry-utils.ts`) provides:

- Automatic retries for transient errors
- Exponential backoff with jitter
- Configurable retry policies
- Custom retry conditions
- Detailed logging of retry attempts

Usage example:

```typescript
import { withRetry } from '@/lib/utils/retry-utils';

// Use with async operations
const result = await withRetry(async () => {
  // Operation that might fail transiently
  return await supabase.from('users').select('*');
}, {
  maxAttempts: 3,
  initialDelay: 200
});

// Create a retryable function
const fetchUserWithRetry = createRetryable(fetchUser, { 
  maxAttempts: 5,
  onRetry: (error, attempt) => {
    console.log(`Retrying fetch (${attempt})...`);
  }
});
```

## Error Tracking Workflow

1. **Error Occurrence**:
   - Error occurs in application code
   - Error is caught by error handling mechanism

2. **Error Processing**:
   - Error is categorized and enriched with metadata
   - Error is logged through the logging system
   - For API errors, the error middleware processes the error

3. **Error Storage**:
   - Error is stored in the appropriate database table
   - Request ID is used to correlate related error entries
   - Additional context (user ID, request details, etc.) is stored

4. **Error Analysis**:
   - SQL views and functions analyze error patterns
   - Error frequency by category and code is calculated
   - Time-based trends are identified

## SQL Analysis Functions

The database schema includes several useful SQL functions for error analysis:

- `get_error_statistics` - Get error counts by category, code, and time period
- `recent_errors` - View recent errors in the system
- `error_frequency_by_category` - Analyze error frequency by category

Usage example (from server code):

```typescript
const { data, error } = await supabase.rpc('get_error_statistics', {
  p_start_date: '2023-01-01',
  p_end_date: '2023-01-31'
});
```

## Best Practices

1. **Consistent Error Handling**:
   - Always use the error utilities for creating errors
   - Use appropriate error categories and codes
   - Include relevant contextual information

2. **Logging**:
   - Use the appropriate log level for the message
   - Always include relevant context in the metadata
   - Use child loggers for specific components

3. **Retry Logic**:
   - Only retry operations that are likely to succeed on retry
   - Use appropriate backoff strategies
   - Set reasonable retry limits

4. **API Error Responses**:
   - Return consistent error structures
   - Include a request ID in the response
   - Provide user-friendly error messages

5. **Error Monitoring**:
   - Regularly review error logs and trends
   - Set up alerts for critical errors
   - Use the SQL analysis functions to identify patterns

## Configuration Options

The error tracking system can be configured through environment variables:

- `LOG_LEVEL` - Minimum log level to display (default: INFO in production, DEBUG in development)
- `LOG_TO_DATABASE` - Whether to store logs in the database (default: true in production)
- `LOG_REQUEST_BODY` - Whether to include request bodies in logs (default: false for security)
- `LOG_RETENTION_DAYS` - Number of days to retain logs (default: 30 for INFO, 90 for ERROR)

## Error Tracking Maintenance

The error tracking system includes a maintenance function to manage log storage:

- `purge_old_logs` - Removes old logs based on retention policy
- Automatically preserves error logs longer than informational logs
- Can be run as a scheduled function in Supabase

## Example

The following example demonstrates the error tracking system in action:

```typescript
// API route with error tracking
import { NextRequest, NextResponse } from 'next/server';
import { withRouteErrorLogging } from '@/lib/middlewares/error-logging-middleware';
import { createValidationError } from '@/lib/utils/error-utils';
import { getLogger } from '@/lib/utils/logger';
import { withRetry } from '@/lib/utils/retry-utils';

// Create a logger for this API route
const logger = getLogger().child('users-api');

async function handleGet(req: NextRequest): Promise<NextResponse> {
  logger.info('Fetching users');
  
  // Example of validation
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '10');
  
  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw createValidationError('Limit must be between 1 and 100');
  }
  
  // Example of retry for database operations
  const users = await withRetry(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(limit);
    
    if (error) throw error;
    return data;
  });
  
  logger.info(`Successfully fetched ${users.length} users`);
  
  return NextResponse.json({ users });
}

export const { GET } = withRouteErrorLogging({
  GET: handleGet
});
```