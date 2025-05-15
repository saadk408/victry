-- Migration: 10_log_tracking_system.sql
-- Description: Creates tables and functions for comprehensive error tracking and logging

-- Create a type for log levels
CREATE TYPE log_level AS ENUM ('debug', 'info', 'warn', 'error', 'fatal');

-- Create a table for system logs
CREATE TABLE system_logs (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    level log_level NOT NULL,
    message TEXT NOT NULL,
    source TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    request_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    error_category TEXT,
    error_code TEXT,
    stack_trace TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add BRIN index for timestamp-based queries which are efficient for time-series data
CREATE INDEX system_logs_timestamp_idx ON system_logs USING BRIN (timestamp);

-- Add index for filtering by log level
CREATE INDEX system_logs_level_idx ON system_logs (level);

-- Add index for filtering by user
CREATE INDEX system_logs_user_id_idx ON system_logs (user_id) WHERE user_id IS NOT NULL;

-- Add index for filtering by request
CREATE INDEX system_logs_request_id_idx ON system_logs (request_id) WHERE request_id IS NOT NULL;

-- Add GIN index on metadata for JSON querying
CREATE INDEX system_logs_metadata_idx ON system_logs USING GIN (metadata jsonb_path_ops);

-- Create a table for tracking API errors specifically
CREATE TABLE api_errors (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_id TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INT NOT NULL,
    error_message TEXT NOT NULL,
    error_category TEXT,
    error_code TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    request_body JSONB,
    request_headers JSONB,
    stack_trace TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add BRIN index for timestamp-based queries
CREATE INDEX api_errors_timestamp_idx ON api_errors USING BRIN (timestamp);

-- Add index for filtering by endpoint
CREATE INDEX api_errors_endpoint_idx ON api_errors (endpoint);

-- Add index for filtering by status code
CREATE INDEX api_errors_status_code_idx ON api_errors (status_code);

-- Add index for filtering by error code
CREATE INDEX api_errors_error_code_idx ON api_errors (error_code) WHERE error_code IS NOT NULL;

-- Add index for filtering by user
CREATE INDEX api_errors_user_id_idx ON api_errors (user_id) WHERE user_id IS NOT NULL;

-- Create a function to log system messages
CREATE OR REPLACE FUNCTION log_system_message(
    p_level log_level,
    p_message TEXT,
    p_source TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_request_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_error_category TEXT DEFAULT NULL,
    p_error_code TEXT DEFAULT NULL,
    p_stack_trace TEXT DEFAULT NULL
) RETURNS UUID
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    -- Generate a UUID for the log entry
    v_log_id := gen_random_uuid();
    
    -- Insert the log entry
    INSERT INTO system_logs (
        id,
        timestamp,
        level,
        message,
        source,
        user_id,
        request_id,
        metadata,
        error_category,
        error_code,
        stack_trace
    ) VALUES (
        v_log_id,
        NOW(),
        p_level,
        p_message,
        p_source,
        p_user_id,
        p_request_id,
        p_metadata,
        p_error_category,
        p_error_code,
        p_stack_trace
    );
    
    RETURN v_log_id;
END;
$$;

-- Create a function to log API errors
CREATE OR REPLACE FUNCTION log_api_error(
    p_endpoint TEXT,
    p_method TEXT,
    p_status_code INT,
    p_error_message TEXT,
    p_request_id TEXT,
    p_error_category TEXT DEFAULT NULL,
    p_error_code TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_request_body JSONB DEFAULT NULL,
    p_request_headers JSONB DEFAULT NULL,
    p_stack_trace TEXT DEFAULT NULL
) RETURNS UUID
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    v_error_id UUID;
BEGIN
    -- Generate a UUID for the error entry
    v_error_id := gen_random_uuid();
    
    -- Insert the error entry
    INSERT INTO api_errors (
        id,
        timestamp,
        request_id,
        endpoint,
        method,
        status_code,
        error_message,
        error_category,
        error_code,
        user_id,
        request_body,
        request_headers,
        stack_trace
    ) VALUES (
        v_error_id,
        NOW(),
        p_request_id,
        p_endpoint,
        p_method,
        p_status_code,
        p_error_message,
        p_error_category,
        p_error_code,
        p_user_id,
        p_request_body,
        p_request_headers,
        p_stack_trace
    );
    
    -- Also log to system_logs for centralized logging
    PERFORM log_system_message(
        'error'::log_level,
        p_error_message,
        'api',
        p_user_id,
        p_request_id,
        jsonb_build_object(
            'endpoint', p_endpoint,
            'method', p_method,
            'status_code', p_status_code
        ),
        p_error_category,
        p_error_code,
        p_stack_trace
    );
    
    RETURN v_error_id;
END;
$$;

-- Create a view for recent errors (last 24 hours)
CREATE OR REPLACE VIEW recent_errors AS
SELECT 
    id,
    timestamp,
    level,
    message,
    source,
    user_id,
    request_id,
    error_category,
    error_code
FROM 
    system_logs
WHERE 
    level IN ('error', 'fatal')
    AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY 
    timestamp DESC;

-- Create a view for error frequency by category
CREATE OR REPLACE VIEW error_frequency_by_category AS
SELECT 
    error_category,
    COUNT(*) as error_count,
    MIN(timestamp) as first_occurrence,
    MAX(timestamp) as last_occurrence
FROM 
    system_logs
WHERE 
    level IN ('error', 'fatal')
    AND error_category IS NOT NULL
GROUP BY 
    error_category
ORDER BY 
    error_count DESC;

-- Create a function to purge old logs (retaining errors longer)
CREATE OR REPLACE FUNCTION purge_old_logs(
    p_retain_info_days INT DEFAULT 30,
    p_retain_error_days INT DEFAULT 90
)
RETURNS INT
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    v_info_count INT;
    v_error_count INT;
    v_total_count INT;
BEGIN
    -- Delete old info, debug, and warn logs
    DELETE FROM system_logs
    WHERE level IN ('info', 'debug', 'warn')
    AND timestamp < NOW() - (p_retain_info_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS v_info_count = ROW_COUNT;
    
    -- Delete old error and fatal logs
    DELETE FROM system_logs
    WHERE level IN ('error', 'fatal')
    AND timestamp < NOW() - (p_retain_error_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS v_error_count = ROW_COUNT;
    
    -- Calculate total
    v_total_count := v_info_count + v_error_count;
    
    -- Log the purge operation
    PERFORM log_system_message(
        'info'::log_level,
        'Purged ' || v_total_count || ' old log entries',
        'system',
        NULL,
        NULL,
        jsonb_build_object(
            'info_logs_purged', v_info_count,
            'error_logs_purged', v_error_count,
            'retain_info_days', p_retain_info_days,
            'retain_error_days', p_retain_error_days
        )
    );
    
    RETURN v_total_count;
END;
$$;

-- RLS Policies
-- Allow service roles to insert logs
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY system_logs_insert_policy ON system_logs 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Only allow service roles and administrators to view logs
CREATE POLICY system_logs_select_policy ON system_logs 
    FOR SELECT 
    TO authenticated 
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin'
        ) 
        OR 
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'service'
        )
    );

-- Similar RLS for API errors
ALTER TABLE api_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY api_errors_insert_policy ON api_errors 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY api_errors_select_policy ON api_errors 
    FOR SELECT 
    TO authenticated 
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin'
        ) 
        OR 
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'service'
        )
    );

-- Create a function to get error statistics
CREATE OR REPLACE FUNCTION get_error_statistics(
    p_start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '7 days'),
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    date_bucket DATE,
    error_count BIGINT,
    error_category TEXT,
    error_code TEXT,
    most_common_message TEXT
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH daily_errors AS (
        SELECT
            DATE_TRUNC('day', timestamp) AS date_bucket,
            error_category,
            error_code,
            message,
            COUNT(*) AS message_count
        FROM
            system_logs
        WHERE
            level IN ('error', 'fatal')
            AND timestamp BETWEEN p_start_date AND p_end_date
        GROUP BY
            date_bucket, error_category, error_code, message
    ),
    ranked_messages AS (
        SELECT
            date_bucket,
            error_category,
            error_code,
            message,
            message_count,
            ROW_NUMBER() OVER (
                PARTITION BY date_bucket, error_category, error_code
                ORDER BY message_count DESC
            ) AS message_rank
        FROM
            daily_errors
    ),
    error_counts AS (
        SELECT
            DATE_TRUNC('day', timestamp) AS date_bucket,
            error_category,
            error_code,
            COUNT(*) AS error_count
        FROM
            system_logs
        WHERE
            level IN ('error', 'fatal')
            AND timestamp BETWEEN p_start_date AND p_end_date
        GROUP BY
            date_bucket, error_category, error_code
    )
    SELECT
        ec.date_bucket::DATE,
        ec.error_count,
        ec.error_category,
        ec.error_code,
        rm.message AS most_common_message
    FROM
        error_counts ec
    LEFT JOIN
        ranked_messages rm
        ON ec.date_bucket = rm.date_bucket
        AND ec.error_category = rm.error_category
        AND ec.error_code = rm.error_code
        AND rm.message_rank = 1
    ORDER BY
        ec.date_bucket DESC,
        ec.error_count DESC;
END;
$$;

-- Comments for documentation
COMMENT ON TABLE system_logs IS 'Centralized system logs for error tracking and debugging';
COMMENT ON TABLE api_errors IS 'Detailed tracking of API errors for monitoring and debugging';
COMMENT ON FUNCTION log_system_message IS 'Helper function to log system messages with consistent formatting';
COMMENT ON FUNCTION log_api_error IS 'Helper function to log API errors with detailed information';
COMMENT ON FUNCTION purge_old_logs IS 'Maintenance function to remove old logs while retaining important error data';
COMMENT ON FUNCTION get_error_statistics IS 'Analytical function to retrieve error statistics for monitoring and reporting';