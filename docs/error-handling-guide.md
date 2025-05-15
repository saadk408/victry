# Victry API Error Handling Guide

This document provides guidelines and best practices for using the standardized error handling system in the Victry application.

## Table of Contents

1. [Overview](#overview)
2. [Error Categories and Codes](#error-categories-and-codes)
3. [Server-Side Error Handling](#server-side-error-handling)
   - [API Route Error Handling](#api-route-error-handling)
   - [Database Error Handling](#database-error-handling)
   - [AI Service Error Handling](#ai-service-error-handling)
4. [Client-Side Error Handling](#client-side-error-handling)
   - [Using the useApiError Hook](#using-the-useapierror-hook)
   - [Field-Specific Validation Errors](#field-specific-validation-errors)
5. [Error Response Format](#error-response-format)
6. [Success Response Format](#success-response-format)
7. [Best Practices](#best-practices)

## Overview

The Victry error handling system provides a consistent way to handle errors across the application. It includes:

- Standardized error categories and codes
- Consistent error response format
- Error handling middleware for API routes
- Client-side error handling hook
- Utility functions for creating and handling errors

## Error Categories and Codes

Errors are classified into categories and specific error codes to provide consistent error handling and appropriate HTTP status codes.

### Error Categories

- `auth`: Authentication-related errors (401)
- `permission`: Authorization-related errors (403)
- `validation`: Client-side validation errors (400)
- `not_found`: Resource not found errors (404)
- `conflict`: Resource conflict errors (409)
- `rate_limit`: Rate limiting errors (429)
- `service`: External service errors (503)
- `database`: Database errors (500)
- `ai`: AI service errors (500)
- `server`: Server-side unexpected errors (500)
- `io`: Input/output errors (500)
- `network`: Network-related errors (500)

### Error Codes

Each error category has specific error codes to provide more detailed information about the error. For example:

- `auth_not_authenticated`: User is not authenticated
- `validation_required_field`: Required field is missing
- `not_found_resource`: Resource not found
- `conflict_duplicate_entry`: Duplicate entry conflict

See `lib/utils/error-utils.ts` for a complete list of error codes.

## Server-Side Error Handling

### API Route Error Handling

The `withRouteErrorHandlers` function provides a convenient way to add error handling to API routes:

```typescript
// app/api/example/route.ts
import { withRouteErrorHandlers } from "@/lib/middlewares/error-handler";

async function handleGet(request: NextRequest) {
  // Implementation...
}

async function handlePost(request: NextRequest) {
  // Implementation...
}

export const { GET, POST } = withRouteErrorHandlers({
  GET: handleGet,
  POST: handlePost,
});
```

### Using Validation Middleware

The `validateRequest` function provides a convenient way to validate request bodies:

```typescript
import { validateRequest } from "@/lib/middlewares/error-handler";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

function validateData(data: unknown) {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join("."),
      message: err.message,
    }));
    
    return { valid: false, errors };
  }
  
  return { valid: true };
}

async function handlePost(request: NextRequest) {
  const { validatedData, response } = await validateRequest(request, validateData);
  if (response) {
    return response;
  }
  
  // validatedData is type-safe and validated
  // ...
}
```

### Database Error Handling

The `handleSupabaseError` function converts Supabase errors to standardized error responses:

```typescript
import { handleSupabaseError } from "@/lib/utils/error-utils";

try {
  const { data, error } = await supabase
    .from("examples")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    throw handleSupabaseError(error);
  }
  
  // Use data...
} catch (error) {
  // Error will be handled by middleware
  throw error;
}
```

### AI Service Error Handling

The `handleAIError` function converts Claude AI errors to standardized error responses:

```typescript
import { handleAIError } from "@/lib/utils/error-utils";

try {
  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });
  
  // Use response...
} catch (error) {
  throw handleAIError(error);
}
```

## Client-Side Error Handling

### Using the useApiError Hook

The `useApiError` hook provides a convenient way to handle API errors in components:

```tsx
import { useApiError } from "@/hooks/use-api-error";
import { apiFetch } from "@/lib/utils/api-utils";

function ExampleComponent() {
  const { error, isLoading, withErrorHandling } = useApiError();
  
  const handleSubmit = async (data: FormData) => {
    const result = await withErrorHandling(async () => {
      return await apiFetch("/api/example", {
        method: "POST",
        body: data,
      });
    });
    
    if (result) {
      // Success handling
    }
  };
  
  return (
    <div>
      {error && <div className="error">{error.error}</div>}
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Loading..." : "Submit"}
      </button>
    </div>
  );
}
```

### Field-Specific Validation Errors

The `getFieldError` function allows you to extract field-specific validation errors:

```tsx
import { useApiError, getFieldError } from "@/hooks/use-api-error";

function ExampleForm() {
  const { error, isLoading, withErrorHandling } = useApiError();
  
  // Form handling...
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" />
        {getFieldError(error, "name") && (
          <div className="error">{getFieldError(error, "name")}</div>
        )}
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />
        {getFieldError(error, "email") && (
          <div className="error">{getFieldError(error, "email")}</div>
        )}
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

## Error Response Format

API error responses follow a consistent format:

```json
{
  "error": "Error message",
  "code": "error_code",
  "validationErrors": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ],
  "requestId": "unique_request_id"
}
```

- `error`: Human-readable error message
- `code`: Machine-readable error code (optional)
- `validationErrors`: Array of field-specific validation errors (optional)
- `requestId`: Unique request ID for tracking (optional, only in production)

## Success Response Format

API success responses follow a consistent format:

```json
{
  "data": {
    // Response data goes here
  },
  "metadata": {
    // Optional metadata
  },
  "requestId": "unique_request_id"
}
```

- `data`: Response data
- `metadata`: Optional metadata (e.g., pagination info)
- `requestId`: Unique request ID for tracking (optional, only in production)

## Best Practices

1. **Use Specific Error Codes**: Use the most specific error code possible to provide clear information about what went wrong.

2. **Include Validation Errors**: For validation errors, include field-specific validation errors to help users understand what's wrong.

3. **Use Error Handling Middleware**: Always use `withRouteErrorHandlers` for API routes to ensure consistent error handling.

4. **Use Error Utilities**: Use the provided utility functions for creating and handling errors.

5. **Handle Errors at the Source**: Try to handle errors as close to their source as possible.

6. **Log Errors Appropriately**: Log errors with appropriate severity levels.

7. **Provide Clear Error Messages**: Error messages should be clear and helpful for users.

8. **Don't Leak Sensitive Information**: Be careful not to include sensitive information in error messages.

9. **Use Request IDs**: Request IDs help with debugging and tracking issues.

10. **Validate Input Data**: Always validate input data to prevent errors due to invalid input.