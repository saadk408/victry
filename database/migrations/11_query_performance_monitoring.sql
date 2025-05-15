-- Migration: 11_query_performance_monitoring.sql
-- Description: Sets up comprehensive query performance monitoring for the database
-- This migration implements:
-- 1. Query statistics tracking with detailed execution metrics
-- 2. Slow query logging with configurable thresholds
-- 3. Performance analysis views for identifying bottlenecks
-- 4. Automatic query fingerprinting for pattern detection
-- 5. Secure access control through RLS policies

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create schema for monitoring
CREATE SCHEMA IF NOT EXISTS monitoring;

-- Create custom types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'query_source') THEN
        CREATE TYPE monitoring.query_source AS ENUM ('application', 'admin', 'migration', 'system');
    END IF;
END
$$;

-- Table for storing query performance metrics
CREATE TABLE IF NOT EXISTS monitoring.query_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    query_fingerprint TEXT NOT NULL, -- Normalized query pattern
    execution_time DOUBLE PRECISION NOT NULL, -- in milliseconds
    rows_processed INTEGER,
    database_name TEXT NOT NULL,
    schema_name TEXT NOT NULL,
    user_name TEXT NOT NULL,
    application_name TEXT,
    client_addr INET,
    query_source monitoring.query_source NOT NULL DEFAULT 'application',
    query_plan JSONB,
    explain_analyze TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Add indexes for common query patterns
    CONSTRAINT valid_execution_time CHECK (execution_time > 0)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_query_performance_created_at ON monitoring.query_performance (created_at);
CREATE INDEX IF NOT EXISTS idx_query_performance_execution_time ON monitoring.query_performance (execution_time DESC);
CREATE INDEX IF NOT EXISTS idx_query_performance_fingerprint ON monitoring.query_performance (query_fingerprint);
CREATE INDEX IF NOT EXISTS idx_query_performance_user_name ON monitoring.query_performance (user_name);
CREATE INDEX IF NOT EXISTS idx_query_performance_application_name ON monitoring.query_performance (application_name);

-- Table for storing slow query configuration
CREATE TABLE IF NOT EXISTS monitoring.slow_query_config (
    id SERIAL PRIMARY KEY,
    threshold_ms INTEGER NOT NULL DEFAULT 1000, -- Default: 1 second
    enabled BOOLEAN NOT NULL DEFAULT true,
    capture_plan BOOLEAN NOT NULL DEFAULT true,
    ignore_patterns TEXT[] DEFAULT ARRAY['%pg_stat_statements%', '%pg_catalog%'],
    application_patterns TEXT[] DEFAULT NULL, -- NULL means all applications
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by TEXT
);

-- Insert default configuration if not exists
INSERT INTO monitoring.slow_query_config 
    (threshold_ms, enabled, capture_plan, ignore_patterns)
VALUES
    (1000, true, true, ARRAY['%pg_stat_statements%', '%pg_catalog%', '%monitoring.%'])
ON CONFLICT DO NOTHING;

-- Function to capture slow queries
CREATE OR REPLACE FUNCTION monitoring.log_slow_query()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    config_record monitoring.slow_query_config;
    query_fingerprint TEXT;
    normalized_query TEXT;
    plan_text TEXT;
    plan_json JSONB;
    should_capture BOOLEAN := true;
BEGIN
    -- Get current configuration
    SELECT * INTO config_record FROM monitoring.slow_query_config ORDER BY id DESC LIMIT 1;
    
    -- Check if slow query logging is enabled
    IF NOT config_record.enabled THEN
        RETURN NULL;
    END IF;
    
    -- Check if the query duration exceeds the threshold
    IF TG_ARGV[0]::float < config_record.threshold_ms THEN
        RETURN NULL;
    END IF;
    
    -- Check if query matches ignore patterns
    FOREACH normalized_query IN ARRAY config_record.ignore_patterns
    LOOP
        IF TG_ARGV[1] LIKE normalized_query THEN
            should_capture := false;
            EXIT;
        END IF;
    END LOOP;
    
    -- Return if query should be ignored
    IF NOT should_capture THEN
        RETURN NULL;
    END IF;
    
    -- Generate query fingerprint (normalized form)
    normalized_query := regexp_replace(TG_ARGV[1], '[0-9]+', 'N', 'g');
    normalized_query := regexp_replace(normalized_query, '''[^'']*''', 'S', 'g');
    query_fingerprint := normalized_query;
    
    -- Capture explain plan if enabled
    IF config_record.capture_plan THEN
        BEGIN
            -- This would be replaced with a safer mechanism in production
            -- as dynamic execution has security implications
            EXECUTE 'EXPLAIN (FORMAT JSON) ' || TG_ARGV[1] INTO plan_json;
            EXECUTE 'EXPLAIN ANALYZE ' || TG_ARGV[1] INTO plan_text;
        EXCEPTION WHEN OTHERS THEN
            plan_json := NULL;
            plan_text := 'Error capturing plan: ' || SQLERRM;
        END;
    END IF;
    
    -- Insert into monitoring table
    INSERT INTO monitoring.query_performance (
        query_text,
        query_fingerprint,
        execution_time,
        database_name,
        schema_name,
        user_name,
        application_name,
        client_addr,
        query_source,
        query_plan,
        explain_analyze
    ) VALUES (
        TG_ARGV[1],
        query_fingerprint,
        TG_ARGV[0]::float,
        current_database(),
        current_schema(),
        session_user,
        current_setting('application_name'),
        inet_client_addr(),
        'application',
        plan_json,
        plan_text
    );
    
    RETURN NULL;
END;
$$;

-- Function to explicitly log a query with its performance metrics
CREATE OR REPLACE FUNCTION monitoring.record_query_performance(
    query_text TEXT,
    execution_time_ms DOUBLE PRECISION,
    rows_processed INTEGER DEFAULT NULL,
    source monitoring.query_source DEFAULT 'application',
    capture_plan BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    new_id UUID;
    normalized_query TEXT;
    plan_json JSONB;
    plan_text TEXT;
BEGIN
    -- Generate query fingerprint (normalized form)
    normalized_query := regexp_replace(query_text, '[0-9]+', 'N', 'g');
    normalized_query := regexp_replace(normalized_query, '''[^'']*''', 'S', 'g');
    
    -- Capture explain plan if requested
    IF capture_plan THEN
        BEGIN
            -- This would be replaced with a safer mechanism in production
            EXECUTE 'EXPLAIN (FORMAT JSON) ' || query_text INTO plan_json;
            EXECUTE 'EXPLAIN ANALYZE ' || query_text INTO plan_text;
        EXCEPTION WHEN OTHERS THEN
            plan_json := NULL;
            plan_text := 'Error capturing plan: ' || SQLERRM;
        END;
    END IF;
    
    -- Insert into monitoring table
    INSERT INTO monitoring.query_performance (
        query_text,
        query_fingerprint,
        execution_time,
        rows_processed,
        database_name,
        schema_name,
        user_name,
        application_name,
        client_addr,
        query_source,
        query_plan,
        explain_analyze
    ) VALUES (
        query_text,
        normalized_query,
        execution_time_ms,
        rows_processed,
        current_database(),
        current_schema(),
        session_user,
        current_setting('application_name'),
        inet_client_addr(),
        source,
        plan_json,
        plan_text
    )
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$;

-- Create a view for analyzing slow queries
CREATE OR REPLACE VIEW monitoring.slow_queries AS
SELECT
    id,
    query_text,
    query_fingerprint,
    execution_time,
    rows_processed,
    database_name,
    schema_name,
    user_name,
    application_name,
    created_at,
    explain_analyze
FROM
    monitoring.query_performance
WHERE
    execution_time > (SELECT threshold_ms FROM monitoring.slow_query_config ORDER BY id DESC LIMIT 1)
ORDER BY
    execution_time DESC;

-- Create a view for query pattern analysis
CREATE OR REPLACE VIEW monitoring.query_patterns AS
SELECT
    query_fingerprint,
    COUNT(*) as execution_count,
    AVG(execution_time) as avg_execution_time,
    MAX(execution_time) as max_execution_time,
    MIN(execution_time) as min_execution_time,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time) as p95_execution_time,
    SUM(CASE WHEN rows_processed IS NOT NULL THEN rows_processed ELSE 0 END) as total_rows_processed,
    AVG(CASE WHEN rows_processed IS NOT NULL THEN rows_processed ELSE 0 END) as avg_rows_processed,
    MAX(created_at) as last_executed_at
FROM
    monitoring.query_performance
GROUP BY
    query_fingerprint
ORDER BY
    avg_execution_time * COUNT(*) DESC; -- Order by total time impact

-- Create a view for application performance analysis
CREATE OR REPLACE VIEW monitoring.application_performance AS
SELECT
    application_name,
    COUNT(*) as query_count,
    AVG(execution_time) as avg_execution_time,
    SUM(execution_time) as total_execution_time,
    MAX(execution_time) as max_execution_time,
    COUNT(DISTINCT query_fingerprint) as unique_query_patterns,
    MAX(created_at) as last_activity
FROM
    monitoring.query_performance
WHERE
    application_name IS NOT NULL
GROUP BY
    application_name
ORDER BY
    total_execution_time DESC;

-- Function to get slow query report for a time period
CREATE OR REPLACE FUNCTION monitoring.get_slow_query_report(
    start_time TIMESTAMPTZ DEFAULT (now() - interval '24 hours'),
    end_time TIMESTAMPTZ DEFAULT now(),
    min_execution_time INTEGER DEFAULT NULL
)
RETURNS TABLE (
    query_pattern TEXT,
    execution_count BIGINT,
    avg_time_ms DOUBLE PRECISION,
    max_time_ms DOUBLE PRECISION,
    p95_time_ms DOUBLE PRECISION,
    total_time_ms DOUBLE PRECISION,
    avg_rows DOUBLE PRECISION,
    last_seen TIMESTAMPTZ,
    example_query TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
    WITH query_stats AS (
        SELECT
            query_fingerprint,
            COUNT(*) as execution_count,
            AVG(execution_time) as avg_time_ms,
            MAX(execution_time) as max_time_ms,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time) as p95_time_ms,
            SUM(execution_time) as total_time_ms,
            AVG(CASE WHEN rows_processed IS NOT NULL THEN rows_processed ELSE 0 END) as avg_rows,
            MAX(created_at) as last_seen
        FROM
            monitoring.query_performance
        WHERE
            created_at BETWEEN start_time AND end_time
            AND (min_execution_time IS NULL OR execution_time >= min_execution_time)
        GROUP BY
            query_fingerprint
        ORDER BY
            total_time_ms DESC
    ),
    example_queries AS (
        SELECT DISTINCT ON (query_fingerprint)
            query_fingerprint,
            query_text
        FROM
            monitoring.query_performance
        WHERE
            created_at BETWEEN start_time AND end_time
            AND query_fingerprint IN (SELECT query_fingerprint FROM query_stats)
        ORDER BY
            query_fingerprint,
            created_at DESC
    )
    SELECT
        qs.query_fingerprint,
        qs.execution_count,
        qs.avg_time_ms,
        qs.max_time_ms,
        qs.p95_time_ms,
        qs.total_time_ms,
        qs.avg_rows,
        qs.last_seen,
        eq.query_text
    FROM
        query_stats qs
    JOIN
        example_queries eq ON qs.query_fingerprint = eq.query_fingerprint
    ORDER BY
        qs.total_time_ms DESC
    LIMIT 100;
$$;

-- Function to reset monitoring configuration to defaults
CREATE OR REPLACE FUNCTION monitoring.reset_configuration(
    new_threshold_ms INTEGER DEFAULT 1000
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
    UPDATE monitoring.slow_query_config
    SET
        threshold_ms = new_threshold_ms,
        enabled = true,
        capture_plan = true,
        ignore_patterns = ARRAY['%pg_stat_statements%', '%pg_catalog%', '%monitoring.%'],
        application_patterns = NULL,
        updated_at = now(),
        updated_by = session_user
    WHERE
        id = (SELECT id FROM monitoring.slow_query_config ORDER BY id DESC LIMIT 1);
        
    IF NOT FOUND THEN
        INSERT INTO monitoring.slow_query_config 
            (threshold_ms, enabled, capture_plan, ignore_patterns, updated_by)
        VALUES
            (new_threshold_ms, true, true, ARRAY['%pg_stat_statements%', '%pg_catalog%', '%monitoring.%'], session_user);
    END IF;
END;
$$;

-- Function to purge old monitoring data
CREATE OR REPLACE FUNCTION monitoring.purge_old_data(
    retention_days INTEGER DEFAULT 30
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM monitoring.query_performance
    WHERE created_at < (now() - (retention_days || ' days')::interval)
    RETURNING COUNT(*) INTO deleted_count;
    
    RETURN deleted_count;
END;
$$;

-- Create RLS policies for secure access

-- Enable RLS on monitoring tables
ALTER TABLE monitoring.query_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring.slow_query_config ENABLE ROW LEVEL SECURITY;

-- Create default policies for admins
CREATE POLICY admin_all_query_performance ON monitoring.query_performance
    USING (auth.uid() IN (
        SELECT auth.uid() FROM auth.users 
        WHERE auth.uid() IN (SELECT unnest(supabase_supabase_admin_ids()))
    ));

CREATE POLICY admin_all_slow_query_config ON monitoring.slow_query_config
    USING (auth.uid() IN (
        SELECT auth.uid() FROM auth.users 
        WHERE auth.uid() IN (SELECT unnest(supabase_supabase_admin_ids()))
    ));

-- Helper function to determine if a user is a database admin
CREATE OR REPLACE FUNCTION monitoring.is_db_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
    RETURN (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() IN (SELECT unnest(supabase_supabase_admin_ids()))
        )
    );
END;
$$;

-- Add a maintenance job to regularly purge old monitoring data
-- Note: This would be implemented as a cron job or using pg_cron in a production environment
-- For now, we'll document the need for periodic cleanup
COMMENT ON FUNCTION monitoring.purge_old_data IS 
'This function should be called periodically (e.g., daily) to clean up old monitoring data. 
Consider setting up a cron job or using pg_cron to schedule regular execution, e.g.:
SELECT monitoring.purge_old_data(30); -- Keep 30 days of data';

-- Add sample queries to documentation
COMMENT ON SCHEMA monitoring IS 
'Schema for database performance monitoring and query analysis.
Example usage:

-- Get slow query report for the last 24 hours
SELECT * FROM monitoring.get_slow_query_report();

-- Get slow queries that took more than 5 seconds in the last week
SELECT * FROM monitoring.get_slow_query_report(
    now() - interval ''7 days'',
    now(),
    5000
);

-- View all slow queries
SELECT * FROM monitoring.slow_queries LIMIT 100;

-- View query patterns
SELECT * FROM monitoring.query_patterns LIMIT 50;

-- Reset monitoring configuration
SELECT monitoring.reset_configuration(2000); -- Set threshold to 2 seconds

-- Manually log a query''s performance
SELECT monitoring.record_query_performance(
    ''SELECT * FROM large_table WHERE complex_condition'',
    1250.5, -- execution time in ms
    10000   -- rows processed
);
';