# Audit Logging Guide

This guide explains the audit logging system implemented in the Victry application. The audit logging system provides comprehensive tracking of critical operations, enabling security monitoring, compliance reporting, and troubleshooting.

## Overview

The audit logging system consists of several components:

1. **Database Schema** - PostgreSQL tables, functions, and views in the `audit` schema
2. **Trigger System** - Automatic logging of data modifications on critical tables
3. **TypeScript Utilities** - Functions for manual logging of operations
4. **API Middleware** - Automatic logging of API operations

## Architecture

![Architecture Overview](https://mermaid.ink/img/pako:eNqNk11vgjAUhv9KQ7K5IHFxs8lGiMmyLJmJH5esaRHQQtPSYIlk7L93WBcZQ5x7Q9_n6TnvKe0FtOJIGbC3WVu70qi81Tq_w-JUcW7rjZ9oV9hYBsSLLp9XLgIcQpSHglfKgF3QEkOndQxwBhV95l4PGF1PiB55fEXLWiXok9YEcvUg0oW2tPQNgULdkTehrbqTmLWiiH45PYiT8OlxtsxKYatC1RUmxkCgfj8u6mIXM5a_rDJ_G56yJFtlMd_Gfiz_Oefr08NdlJJPbR1K0SB5qS-4rrUjgcVOYzF-TZLFbBMvlnH2NE6SaU45e55PktH-kPgnnJoSncYe9WZx05RlZQnsZlWrXGrSXRtwCa1L1aCzOv5hdTTGmlZlfSG2HCZhN26nG2DQTi7-a307ZQ6stzLZ37r5I1S1OkOprT7b6X-CZHQ4vv3WLmPrMqHwqixl0o8w7_hJa3mDLWPHgqv1-x9lVXmA?type=png)

## Database Schema

The database schema (`audit`) is created in migration 13 and includes:

- **operations_log** table - Central table for all audit logging
- **operation_category** enum - Categorizes operations (data_modification, security, etc.)
- **log_table_change()** function - Trigger function for data modifications
- **log_critical_operation()** function - Manual logging function
- **Recent operations view** - View of recent operations across categories
- **Security events view** - View focused on security-related events
- **Authentication events view** - View focused on authentication events

## Logging Utilities

The `lib/supabase/audit-logger.ts` module provides:

### `logCriticalOperation()`

```typescript
function logCriticalOperation(
  operationType: string,
  category: OperationCategory,
  details: Record<string, any>,
  recordId?: string,
  tableName?: string,
  options?: LogOperationOptions
): Promise<string | null>
```

Logs a critical operation to the audit system. This is the core function used by other more specialized logging functions.

### `logSecurityEvent()`

```typescript
function logSecurityEvent(
  eventType: string,
  details: Record<string, any>,
  options?: SecurityEventOptions
): Promise<string | null>
```

Logs a security-related event such as permission changes, security settings updates, etc.

### `logAuthenticationEvent()`

```typescript
function logAuthenticationEvent(
  eventType: string,
  userId: string,
  details: Record<string, any>,
  options?: AuthenticationEventOptions
): Promise<string | null>
```

Logs authentication events such as logins, password changes, etc.

### `logPaymentEvent()`

```typescript
function logPaymentEvent(
  eventType: string,
  userId: string,
  amount: number,
  currency: string,
  paymentProvider: string,
  paymentId: string,
  details: Record<string, any>,
  options?: PaymentEventOptions
): Promise<string | null>
```

Logs payment-related events with detailed financial information.

### Retrieval Functions

The module also provides functions for retrieving audit logs:

- `getRecentOperations()` - Get recent operations across all categories
- `getSecurityEvents()` - Get security-related events
- `getAuthenticationEvents()` - Get authentication events
- `getPaymentEvents()` - Get payment events
- `getUserActivity()` - Get activity for a specific user
- `getRecordHistory()` - Get history for a specific record
- `purgeOldAuditLogs()` - Purge logs older than a specified retention period

## Automatic Table Auditing

Critical tables are automatically audited through PostgreSQL triggers. The following tables have automatic audit logging:

- `resumes`
- `job_descriptions`
- `user_roles`
- `profiles` (if exists)

Any INSERT, UPDATE, or DELETE operation on these tables will generate an audit log entry with the old and new values, the user who made the change, and other contextual information.

## API Middleware

The `lib/middlewares/audit-logging-middleware.ts` module provides:

### `withAuditLogging()`

```typescript
function withAuditLogging(
  handler: ApiHandler,
  options?: AuditLoggingOptions
): ApiHandler
```

This middleware automatically logs API requests and responses. It can be configured to include or exclude specific paths, capture request/response bodies, and customize the logging details.

Example usage:

```typescript
// Apply middleware to API route
export const GET = withAuditLogging(
  handleGet,
  {
    category: OperationCategory.Api,
    operationType: 'get_resources',
    includeRequestBody: false,
    includeResponseBody: false,
  }
);
```

## Operation Categories

The audit system uses the following categories to organize logs:

- `data_modification` - Changes to application data
- `security` - Security-related events
- `authentication` - User authentication events
- `configuration` - System configuration changes
- `subscription` - Subscription plan changes
- `payment` - Payment processing events
- `export` - Data export operations
- `import` - Data import operations
- `api` - API access events
- `admin` - Administrative operations
- `user_management` - User account operations
- `system` - System-level events

## Audit Logging in Code

### Data Modifications

Data modifications on critical tables are logged automatically through triggers. No additional code is needed.

### Security Events

```typescript
import { logSecurityEvent } from '@/lib/supabase/audit-logger';

// Log a security event
await logSecurityEvent(
  'role_assignment',
  {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    role: 'admin',
    assignedBy: 'system',
  },
  { success: true }
);
```

### Authentication Events

```typescript
import { logAuthenticationEvent } from '@/lib/supabase/audit-logger';

// Log an authentication event
await logAuthenticationEvent(
  'login',
  userId,
  {
    method: 'email',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
  },
  { success: true }
);
```

### Payment Events

```typescript
import { logPaymentEvent } from '@/lib/supabase/audit-logger';

// Log a payment event
await logPaymentEvent(
  'subscription_renewal',
  userId,
  19.99,
  'USD',
  'stripe',
  'pi_1234567890',
  {
    plan: 'premium',
    period: 'monthly',
    startDate: '2023-01-01',
    endDate: '2023-02-01',
  }
);
```

### Custom Critical Operations

```typescript
import { logCriticalOperation, OperationCategory } from '@/lib/supabase/audit-logger';

// Log a custom critical operation
await logCriticalOperation(
  'resume_export',
  OperationCategory.Export,
  {
    format: 'pdf',
    pages: 2,
    template: 'professional',
    size: '1.2MB',
  },
  resumeId, // Record ID
  'resumes'  // Table name
);
```

## API Routes for Audit Logs

The `/api/audit-logs` endpoint provides:

### GET Endpoints

- `?action=recent-operations` - Get recent operations across all categories
- `?action=security-events` - Get security events
  - Optional parameter: `limit`
- `?action=authentication-events` - Get authentication events
  - Optional parameter: `limit`
- `?action=payment-events` - Get payment events
  - Optional parameter: `limit`
- `?action=user-activity` - Get activity for a specific user
  - Parameters: `userId`, `limit` (optional)
- `?action=record-history` - Get history for a specific record
  - Parameters: `tableName`, `recordId`

### POST Endpoints

- `?action=purge-logs` - Purge old audit logs
  - Body: `{ retentionDays: number }`

## Security Considerations

The audit logging system has several security measures:

1. **Row Level Security** - RLS policies restrict access to audit logs to admin users
2. **Function Security** - All logging functions use `SECURITY DEFINER` with restricted search path
3. **Field Sanitization** - Sensitive fields are automatically redacted in logs
4. **Minimal Logging** - Default options exclude request and response bodies to avoid storing sensitive data
5. **Selective Logging** - Configurable options allow focusing on critical operations

## Best Practices

### When to Use Audit Logging

Audit logging should be used for:

1. **Security-Critical Operations** - Any action affecting security or authentication
2. **Business-Critical Data** - Changes to critical data that requires an audit trail
3. **Financial Transactions** - Any operation involving payments
4. **Compliance Requirements** - Operations subject to regulatory compliance
5. **User Impersonation** - Actions performed by admins on behalf of users

### What to Log

Each audit log should include:

1. **Who** - The user who performed the operation
2. **What** - The specific operation being performed
3. **When** - Timestamp of the operation
4. **Where** - Source of the operation (IP address, application)
5. **How** - Context of the operation (API, UI action, etc.)
6. **Result** - Whether the operation succeeded or failed

### Sensitive Data

Be careful when logging sensitive data:

1. **Avoid Logging Credentials** - Never log passwords, tokens, or keys
2. **Sanitize Personal Data** - Redact or mask personal identifiable information
3. **Exclude Large Payloads** - Only log essential information to avoid storage issues

## Maintenance

The audit logging system requires regular maintenance:

1. **Log Purging** - Set up a regular schedule to purge old logs:
   ```typescript
   await purgeOldAuditLogs(90); // Keep 90 days of logs
   ```

2. **Performance Monitoring** - Monitor the size and growth of the audit logs table
   - Consider partitioning the table if it grows very large

3. **Alert Configuration** - Set up alerts for suspicious activities:
   - Failed login attempts
   - Permission changes
   - Critical data modifications

## Integration with Error Tracking

The audit logging system integrates with the error tracking system:

- API errors are logged in both systems
- Security and authentication failures are tracked in both places
- Cross-referencing between systems is possible through request IDs

## Usage Examples

### Monitoring User Activity

```typescript
// Get activity for a specific user
const activity = await getUserActivity(userId, 100);

// Process and analyze activity
const securityEvents = activity.filter(a => a.operation_category === 'security');
const loginEvents = activity.filter(a => a.operation_type === 'login');
const dataModifications = activity.filter(a => a.operation_category === 'data_modification');
```

### Tracking Record History

```typescript
// Get history for a specific resume
const history = await getRecordHistory('resumes', resumeId);

// Process and display changes
const modifications = history.filter(h => h.operation_type === 'UPDATE');
```

### Security Monitoring

```typescript
// Get recent security events
const securityEvents = await getSecurityEvents(50);

// Check for failed login attempts
const failedLogins = securityEvents.filter(
  e => e.event_type === 'login' && e.success === false
);

// Group by IP address to detect brute force attempts
const attemptsByIp = failedLogins.reduce((acc, event) => {
  const ip = event.ip_address;
  acc[ip] = (acc[ip] || 0) + 1;
  return acc;
}, {});
```