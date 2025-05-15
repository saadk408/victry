# Query Analyzer Guide

This guide explains the Query Analyzer system implemented in the Victry application. The Query Analyzer provides in-depth analysis of database queries, helping developers identify optimization opportunities and troubleshoot performance issues.

## Overview

The Query Analyzer consists of several components:

1. **PostgreSQL Functions** - Secure functions for running EXPLAIN ANALYZE
2. **TypeScript Analyzer** - Query plan parsing and analysis utilities
3. **API Endpoints** - Endpoints for running and retrieving analysis
4. **Monitoring Integration** - Integration with the query performance monitoring system

## Architecture

![Architecture Overview](https://mermaid.ink/img/pako:eNqNks2OgjAQx19l0rOa6METjYsHD7uavWHCdKQ1toVOB2JcfPfdIouKgLKXdub_634kPYHRCjkgezOVMYWF2qLRJZh9VVpb2gZaUyeDGQSsq-7HVYuQVhB9U_6aCzgGRejXrXQUYE6s9z7OXXf4HVLOI_QojE3QRbcM0WB61Y0NKSrKu9ZoX7dMGIu5E08FEg_jP9p3Qrz3zlkU6bDlSfK0m04TXzbcmOsqJ15k6dN0mOFgQnxpqoLWVw9KZk9CJrM5yWfLF5LlizlJB-TCuv5zpwqaTMKnVqu8RXKLDdoSHdGduLp1qJxSdSXReu9f2nTSxJ4Ny3kbhNDfL-H5vA1CZ7U1ztLpZhM5LX2j8aNa-N4C0gZL2Drn7yGaJEd_wTYx9PVEwIP0HCWMcPMjj6Ux8GSogyiT4SfkBWcqS-TMi1QAZywUJU98P8gOR_3FG6c8yHyQHQ58_yjJKxW_ylDpunP-Ar7aub4?type=png)

## PostgreSQL Functions (EXPLAIN ANALYZE)

The database migration `12_explain_analyze_function.sql` adds several functions:

### `monitoring.run_explain(query_text, params, explain_options)`

Safely runs EXPLAIN ANALYZE on a SQL query, with security measures to prevent abuse.

Parameters:
- `query_text`: The SQL query to analyze
- `params`: Array of parameter values (optional)
- `explain_options`: Options for EXPLAIN (default: "ANALYZE, VERBOSE, FORMAT JSON")

Returns: JSON result of the EXPLAIN command

Example usage:
```sql
SELECT * FROM monitoring.run_explain(
  'SELECT * FROM resumes WHERE user_id = $1',
  ARRAY['123e4567-e89b-12d3-a456-426614174000'],
  'ANALYZE, VERBOSE, BUFFERS, FORMAT JSON'
);
```

### `monitoring.identify_optimization_opportunities()`

Identifies queries that could benefit from optimization based on historical data.

Parameters:
- `min_execution_time`: Minimum execution time to consider (default: 100ms)
- `min_occurrences`: Minimum number of executions to consider (default: 5)
- `lookback_days`: Days of history to analyze (default: 7)

Returns: Table of queries with optimization suggestions

Example usage:
```sql
SELECT * FROM monitoring.identify_optimization_opportunities(200, 10, 14);
```

### `monitoring.compare_query_plans()`

Compares execution plans for a query pattern over time to identify changes.

Parameters:
- `query_fingerprint`: Normalized query pattern to analyze
- `lookback_days`: Days of history to analyze (default: 7)

Returns: Table of query executions with plan differences

Example usage:
```sql
SELECT * FROM monitoring.compare_query_plans(
  'SELECT * FROM users WHERE email LIKE S'
);
```

## TypeScript Analyzer

The `lib/supabase/query-analyzer.ts` module provides:

### `analyzeQuery(query, params, options)`

Analyzes a SQL query using EXPLAIN ANALYZE and identifies optimization opportunities.

Parameters:
- `query`: SQL query to analyze
- `params`: Query parameters (optional)
- `options`: Analysis options (verbose, buffers, timing, format)

Returns: `QueryAnalysisResult` with plan, issues, and recommendations

Example usage:
```typescript
import { analyzeQuery } from '@/lib/supabase/query-analyzer';

const analysis = await analyzeQuery(
  'SELECT * FROM resumes WHERE user_id = $1',
  ['123e4567-e89b-12d3-a456-426614174000'],
  { verbose: true, buffers: true }
);

console.log(analysis.issues);
console.log(analysis.recommendations);
```

### `getQueryAnalysisHistory(queryFingerprint, limit, client)`

Gets historical analysis results for a query pattern.

Parameters:
- `queryFingerprint`: Normalized query pattern
- `limit`: Maximum number of results (default: 10)
- `client`: Supabase client (optional)

Returns: Array of historical analysis results

Example usage:
```typescript
import { getQueryAnalysisHistory } from '@/lib/supabase/query-analyzer';

const history = await getQueryAnalysisHistory(
  'SELECT * FROM users WHERE email LIKE S',
  5
);
```

### `storeQueryAnalysis(query, analysis, executionTime, client)`

Stores query analysis results in the database.

Parameters:
- `query`: SQL query that was analyzed
- `analysis`: Analysis results
- `executionTime`: Query execution time in milliseconds
- `client`: Supabase client (optional)

Returns: ID of the created record

Example usage:
```typescript
import { storeQueryAnalysis } from '@/lib/supabase/query-analyzer';

const recordId = await storeQueryAnalysis(
  'SELECT * FROM users WHERE email LIKE $1',
  analysisResult,
  150.5
);
```

## API Endpoints

The `/api/query-analyzer` endpoint provides:

### GET Endpoints

- `?action=optimization-opportunities`: Get optimization opportunities
  - Optional parameters: `minExecutionTime`, `minOccurrences`, `lookbackDays`
- `?action=compare-plans`: Compare query plans for a fingerprint
  - Parameters: `queryFingerprint`, `lookbackDays` (optional)
- `?action=query-history`: Get history for a query pattern
  - Parameters: `queryFingerprint`, `limit` (optional)

### POST Endpoints

- `?action=analyze-query`: Analyze a SQL query
  - Body: `{ query, params?, options? }`

## Example Usage

### Analyzing a Query

```typescript
// Client-side code
async function analyzeQuery(query: string, params: any[] = []) {
  const response = await fetch('/api/query-analyzer?action=analyze-query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      params,
      options: {
        verbose: true,
        buffers: true,
      },
    }),
  });
  
  return await response.json();
}

// Usage
const result = await analyzeQuery(
  'SELECT * FROM resumes WHERE user_id = $1',
  ['123e4567-e89b-12d3-a456-426614174000']
);

console.log('Health Score:', result.analysis.healthScore);
console.log('Issues:', result.analysis.issues);
console.log('Recommendations:', result.analysis.recommendations);
```

### Finding Optimization Opportunities

```typescript
// Client-side code
async function findOptimizationOpportunities() {
  const response = await fetch(
    '/api/query-analyzer?action=optimization-opportunities&minExecutionTime=200&lookbackDays=14'
  );
  
  return await response.json();
}

// Usage
const opportunities = await findOptimizationOpportunities();
console.log('Optimization opportunities:', opportunities);
```

## Issue Types and Recommendations

The Query Analyzer identifies several types of issues:

### Sequential Scan Issues

**Issue**: `sequential_scan`
- Description: Sequential scan on large tables
- Severity: medium/high depending on row count
- Recommendation: Add indexes on columns in WHERE clause

### Join Issues

**Issue**: `expensive_join`
- Description: Expensive joins with high row counts
- Severity: medium/high depending on execution time
- Recommendation: Add indexes on join columns or restructure query

### Estimation Errors

**Issue**: `estimation_error`
- Description: Misestimated row counts affecting plan selection
- Severity: medium/high depending on ratio
- Recommendation: Run ANALYZE to update statistics

### Temporary File Issues

**Issue**: `temporary_files`
- Description: Query using temporary files for sorting/hashing
- Severity: high
- Recommendation: Increase work_mem or restructure query

### Index Efficiency Issues

**Issue**: `inefficient_index`
- Description: Index scans with high filter ratios
- Severity: medium
- Recommendation: Create more specific indexes

### Parallelism Issues

**Issue**: `missing_parallelism`
- Description: Slow query not utilizing parallel execution
- Severity: medium
- Recommendation: Enable parallel query execution

## Security Considerations

The Query Analyzer has several security measures:

1. **Function Security**: The `monitoring.run_explain` function uses `SECURITY DEFINER` with a restricted search path
2. **Query Validation**: Prevents potentially harmful operations (ALTER, DROP, etc.)
3. **Parameter Sanitization**: Safely handles query parameters
4. **Access Control**: Restricted to admin users only
5. **Audit Logging**: Records all analysis activity

## Best Practices

### When to Use Query Analyzer

The Query Analyzer is most useful for:

1. **Performance Troubleshooting**: When a specific query is slow
2. **Query Optimization**: Before deploying new or modified queries
3. **Index Selection**: When deciding which indexes to create
4. **Performance Monitoring**: Regular analysis of frequently run queries

### Analysis Workflow

1. **Identify Slow Queries**: Use the Query Performance Monitoring to find slow queries
2. **Analyze Query Plans**: Use Query Analyzer to examine execution plans
3. **Review Recommendations**: Consider the suggested optimizations
4. **Implement Changes**: Apply the recommended changes (add indexes, restructure queries)
5. **Verify Improvements**: Re-analyze to confirm performance improvements

## Troubleshooting

### Common Issues

1. **Access Denied**
   - Ensure the user has admin role
   - Check that the necessary database permissions are granted

2. **Analysis Errors**
   - Check that the query syntax is correct
   - Verify that all referenced tables and columns exist
   - Ensure query parameters are provided if using placeholder syntax

3. **Incomplete Analysis**
   - Try enabling verbose and buffers options
   - Check that the query is not too complex for automated analysis

## Integration with Monitoring

The Query Analyzer integrates with the Database Monitoring system:

- Analysis results are stored in the `monitoring.query_performance` table
- The Query Analyzer uses historical data from the monitoring system
- Slow queries identified by monitoring can be directly analyzed
- Both systems contribute to the same performance optimization goals