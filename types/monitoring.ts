/**
 * Type definitions for the monitoring schema
 * This temporary file provides types for the monitoring functions that aren't in the generated Supabase types
 */

export interface MonitoringFunctions {
  record_query_performance: {
    Args: {
      query_text: string;
      execution_time_ms: number;
      rows_processed?: number;
      source?: string;
      capture_plan?: boolean;
    };
    Returns: string;
  };
  get_slow_query_report: {
    Args: {
      start_time?: string;
      end_time?: string;
      min_execution_time?: number;
    };
    Returns: Array<{
      query_pattern: string;
      execution_count: number;
      avg_time_ms: number;
      max_time_ms: number;
      p95_time_ms: number;
      total_time_ms: number;
      avg_rows: number;
      last_seen: string;
      example_query: string;
    }>;
  };
  purge_old_data: {
    Args: {
      retention_days?: number;
    };
    Returns: number;
  };
  reset_configuration: {
    Args: Record<PropertyKey, never>;
    Returns: void;
  };
}

export interface MonitoringTables {
  'monitoring.query_patterns': Array<{
    query_fingerprint: string;
    execution_count: number;
    avg_execution_time: number;
    max_execution_time: number;
    min_execution_time: number;
    p95_execution_time: number;
    total_rows_processed: number;
    avg_rows_processed: number;
    last_executed_at: string;
  }>;
  'monitoring.application_performance': Array<{
    application_name: string;
    query_count: number;
    avg_execution_time: number;
    total_execution_time: number;
    max_execution_time: number;
    unique_query_patterns: number;
    last_activity: string;
  }>;
  'monitoring.slow_query_config': Array<{
    id: number;
    threshold_ms: number;
    enabled: boolean;
    capture_plan: boolean;
    ignore_patterns: string[];
    application_patterns: string[] | null;
    updated_at: string;
    updated_by?: string;
  }>;
}