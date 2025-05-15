/**
 * Query Performance Monitoring for Supabase
 * 
 * This module provides utilities for monitoring database query performance
 * and integrates with the PostgreSQL monitoring schema created in migration 11.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './client';
import { logger } from '../utils/logger';

export enum QuerySource {
  Application = 'application',
  Admin = 'admin',
  Migration = 'migration',
  System = 'system',
}

export interface QueryPerformanceOptions {
  /** Source of the query */
  source?: QuerySource;
  /** Whether to capture the execution plan */
  capturePlan?: boolean;
  /** Additional context information */
  context?: Record<string, any>;
  /** Client to use (defaults to creating a new client) */
  client?: SupabaseClient;
}

export interface QueryPerformanceRecord {
  id: string;
  query_text: string;
  execution_time: number;
  rows_processed?: number;
  created_at: string;
}

const DEFAULT_OPTIONS: QueryPerformanceOptions = {
  source: QuerySource.Application,
  capturePlan: true,
  context: {},
};

/**
 * Records the performance of a database query
 * 
 * @param queryText The SQL query text that was executed
 * @param executionTimeMs Execution time in milliseconds
 * @param rowsProcessed Number of rows processed (optional)
 * @param options Additional options
 * @returns The ID of the created performance record
 */
export async function recordQueryPerformance(
  queryText: string,
  executionTimeMs: number,
  rowsProcessed?: number,
  options?: QueryPerformanceOptions
): Promise<string | null> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const client = opts.client || createClient();
  
  try {
    const { data, error } = await client.rpc('monitoring.record_query_performance', {
      query_text: queryText,
      execution_time_ms: executionTimeMs,
      rows_processed: rowsProcessed,
      source: opts.source,
      capture_plan: opts.capturePlan,
    });
    
    if (error) {
      logger.error('Failed to record query performance', {
        error,
        query: queryText,
        executionTime: executionTimeMs,
        ...opts.context,
      });
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error('Exception recording query performance', { 
      error, 
      query: queryText, 
      executionTime: executionTimeMs,
      ...opts.context,
    });
    return null;
  }
}

/**
 * Wraps a Supabase query with performance monitoring
 * 
 * @param queryFn Function that performs the Supabase query
 * @param queryDescription Human-readable description of the query
 * @param options Performance monitoring options
 * @returns Result of the query function
 */
export async function withQueryMonitoring<T>(
  queryFn: () => Promise<{ data: any; error: any }>,
  queryDescription: string,
  options?: QueryPerformanceOptions
): Promise<{ data: any; error: any }> {
  const startTime = performance.now();
  let result: { data: any; error: any };
  
  try {
    result = await queryFn();
    const executionTime = performance.now() - startTime;
    
    // Only record performance if the threshold is exceeded (10ms default)
    if (executionTime > 10) {
      const rowCount = Array.isArray(result.data) ? result.data.length : undefined;
      await recordQueryPerformance(
        queryDescription,
        executionTime,
        rowCount,
        options
      );
    }
    
    return result;
  } catch (error) {
    const executionTime = performance.now() - startTime;
    
    logger.error('Query error with performance monitoring', {
      error,
      query: queryDescription,
      executionTime,
      ...options?.context,
    });
    
    // Re-throw the error to maintain the same behavior
    throw error;
  }
}

/**
 * Gets a report of slow queries for a specified time period
 * 
 * @param startTime Start of the time period (default: 24 hours ago)
 * @param endTime End of the time period (default: now)
 * @param minExecutionTime Minimum execution time in ms to include (default: based on configuration)
 * @param client Supabase client to use (default: create new client)
 * @returns Array of slow query records
 */
export async function getSlowQueryReport(
  startTime?: Date,
  endTime?: Date,
  minExecutionTime?: number,
  client?: SupabaseClient
): Promise<any[]> {
  const supabase = client || createClient();
  
  try {
    const { data, error } = await supabase.rpc('monitoring.get_slow_query_report', {
      start_time: startTime?.toISOString(),
      end_time: endTime?.toISOString(),
      min_execution_time: minExecutionTime,
    });
    
    if (error) {
      logger.error('Failed to get slow query report', { error });
      return [];
    }
    
    return data || [];
  } catch (error) {
    logger.error('Exception getting slow query report', { error });
    return [];
  }
}

/**
 * Gets statistics about query patterns executed in the database
 * 
 * @param client Supabase client to use (default: create new client)
 * @returns Query pattern statistics
 */
export async function getQueryPatterns(client?: SupabaseClient): Promise<any[]> {
  const supabase = client || createClient();
  
  try {
    const { data, error } = await supabase.from('monitoring.query_patterns').select('*');
    
    if (error) {
      logger.error('Failed to get query patterns', { error });
      return [];
    }
    
    return data || [];
  } catch (error) {
    logger.error('Exception getting query patterns', { error });
    return [];
  }
}

/**
 * Purges old monitoring data beyond the specified retention period
 * 
 * @param retentionDays Number of days to retain data (default: 30)
 * @param client Supabase client to use (default: create new client)
 * @returns Number of records deleted
 */
export async function purgeOldMonitoringData(
  retentionDays = 30,
  client?: SupabaseClient
): Promise<number> {
  const supabase = client || createClient();
  
  try {
    const { data, error } = await supabase.rpc('monitoring.purge_old_data', {
      retention_days: retentionDays,
    });
    
    if (error) {
      logger.error('Failed to purge old monitoring data', { error });
      return 0;
    }
    
    return data || 0;
  } catch (error) {
    logger.error('Exception purging old monitoring data', { error });
    return 0;
  }
}