# Database Performance Monitoring Guide

This guide explains the database performance monitoring system implemented in the Victry application. The system provides comprehensive tracking and analysis of database queries, helping to identify and optimize slow or problematic queries.

## Overview

The database monitoring system consists of several components:

1. **Database Schema** - PostgreSQL tables, functions, and views in the `monitoring` schema
2. **Client Utilities** - TypeScript utilities for recording and analyzing query performance
3. **API Middleware** - Automatic monitoring of database queries in API routes
4. **Admin API** - Endpoints for viewing and managing monitoring data

## Architecture

![Architecture Overview](https://mermaid.ink/img/pako:eNqNks9uwjAMxl8lynkwdugNJA47TJvaG4rIkggsIqlJlbgwNPHuS0uZNE1j5JL4-_zzo1ieQRsFyIDZx8bZyqLxYG0NZt_Uzl27DjrMVm8J5DH4lTvdwQTusUZPCSRs4xJIptaVgEuAW2WWNA9kL78iJHN6pFWjI3zQiLVfI_m5zWMVsXGj-SJyeCTfCnmG9zSRJJPpZDqXixny-dMCphO-pqF5vbcljfPw2RhTdAi32KFfYyC9F6ZzHk3QqmkU-gGl9u4PZOzdQPbVmwYJpJYJlNEPipjA1dkNfPWLDFKHDWxj8DFkk_zkz9s2pn5uJPCkPEeJI9z8yG_VcPBUqEOhx8NP2BWcqVwgZ1LoBXDGVFfJqeAiL49Sf-dDVD7KnJeHPVfyWKhiL-XpeLyRUuyfPwDwV7mU?type=png)

## Database Schema

The database schema (`monitoring`) is created in migration 11 and includes:

- **query_performance** table - Stores query execution metrics
- **slow_query_config** table - Configuration for slow query thresholds
- **slow_queries** view - View of queries exceeding the threshold
- **query_patterns** view - Analysis of query patterns by fingerprint
- **application_performance** view - Performance by application

### Key Functions

- `monitoring.log_slow_query()` - Captures slow queries automatically
- `monitoring.record_query_performance()` - Manually record query performance
- `monitoring.get_slow_query_report()` - Generate a report of slow queries
- `monitoring.purge_old_data()` - Clean up old monitoring data

## Monitoring Utilities

### Query Monitoring Utilities

The `lib/supabase/query-monitoring.ts` module provides:

- `recordQueryPerformance()` - Record a query's performance metrics
- `withQueryMonitoring()` - Wrap a query with performance monitoring
- `getSlowQueryReport()` - Get a report of slow queries
- `getQueryPatterns()` - Get statistics about query patterns
- `purgeOldMonitoringData()` - Purge old monitoring data

### Usage Examples

#### Recording Query Performance Manually

```typescript
import { recordQueryPerformance, QuerySource } from '@/lib/supabase/query-monitoring';

// After executing a query, record its performance
await recordQueryPerformance(
  'SELECT * FROM resumes WHERE user_id = $1', // Query text
  150.5,                                       // Execution time (ms)
  5,                                           // Rows processed
  {
    source: QuerySource.Application,
    capturePlan: true
  }
);
```

#### Wrapping Queries with Performance Monitoring

```typescript
import { withQueryMonitoring } from '@/lib/supabase/query-monitoring';

// Wrap a Supabase query with performance monitoring
const result = await withQueryMonitoring(
  () => supabase.from('resumes').select('*').eq('user_id', userId),
  'Get user resumes',
  { context: { userId } }
);
```

## API Route Middleware

The `lib/middlewares/query-monitoring-middleware.ts` module provides middleware that automatically monitors database queries in API routes.

### Usage Example

```typescript
import { withQueryMonitoring } from '@/lib/middlewares/query-monitoring-middleware';
import { QuerySource } from '@/lib/supabase/query-monitoring';

// Apply the middleware to an API route handler
export const GET = withQueryMonitoring(
  async (req: NextRequest) => {
    // Handler implementation
    const supabase = createActionClient();
    const { data } = await supabase.from('resumes').select('*');
    return NextResponse.json(data);
  },
  {
    source: QuerySource.Application,
    capturePlans: true,
    minExecutionTime: 50
  }
);
```

## Admin API Endpoints

The following endpoints are available at `/api/db-monitoring`:

### GET Endpoints

- `?action=slow-queries` - Get slow query report
  - Optional parameters: `startTime`, `endTime`, `minExecutionTime`
- `?action=query-patterns` - Get query pattern statistics
- `?action=application-performance` - Get application performance stats
- `?action=configuration` - Get current monitoring configuration

### POST Endpoints

- `?action=update-config` - Update monitoring configuration
  - Parameters: `thresholdMs`, `enabled`, `capturePlan`, `ignorePatterns`
- `?action=purge-data` - Purge old monitoring data
  - Parameters: `retentionDays`
- `?action=record-test-query` - Record a test query
- `?action=reset-configuration` - Reset monitoring configuration to defaults

## Security Considerations

- Access to monitoring data is restricted to admin users only
- Row Level Security (RLS) policies protect monitoring data in the database
- The `monitoring.is_db_admin()` function controls access to monitoring functions
- All monitoring functions use `SECURITY DEFINER` with restricted search path

## Performance Impact

The monitoring system is designed to have minimal impact on application performance:

- Only queries exceeding a threshold (default: 50ms) are recorded
- Query plans are only captured for slow queries
- Old monitoring data is automatically purged
- Indexes are optimized for efficient querying of monitoring data

## Maintenance Tasks

1. **Regular Data Purging**
   - Set up a cron job to purge old monitoring data:
   ```typescript
   await purgeOldMonitoringData(30); // Keep 30 days of data
   ```

2. **Monitoring Configuration**
   - Adjust slow query threshold as needed:
   ```typescript
   const response = await fetch('/api/db-monitoring?action=update-config', {
     method: 'POST',
     body: JSON.stringify({ thresholdMs: 2000 }) // 2 seconds
   });
   ```

3. **Performance Review**
   - Regularly review slow query reports to identify optimization opportunities

## Integration with Error Tracking

The query monitoring system integrates with the error tracking system:

- Slow queries are logged to the error tracking system
- Database errors include query performance metrics
- The middleware automatically logs query errors

## Best Practices

1. **Use the Middleware for API Routes**
   - Apply the `withQueryMonitoring` middleware to API routes
   
2. **Wrap Complex Queries**
   - Use `withQueryMonitoring()` for complex or critical queries
   
3. **Set Appropriate Thresholds**
   - Configure thresholds based on application requirements
   
4. **Review Slow Queries Regularly**
   - Schedule regular performance reviews
   
5. **Track Query Pattern Changes**
   - Monitor query patterns after code changes

## Troubleshooting

### Common Issues

1. **Missing Query Plans**
   - Ensure `capture_plan` is enabled in configuration
   - Check for permissions issues

2. **Performance Impact**
   - Increase `threshold_ms` to reduce monitoring overhead
   - Adjust `ignore_patterns` to exclude frequent queries

3. **Excessive Data Growth**
   - Set up regular purging of old data
   - Increase purge frequency for high-volume applications

### Analyzing Slow Queries

When a slow query is identified:

1. Review the query plan (EXPLAIN ANALYZE)
2. Check for missing or inefficient indexes
3. Investigate query parameter usage
4. Consider refactoring the query or adding materialized views