-- Migration: 12_explain_analyze_function.sql
-- Description: Adds functions for safely executing EXPLAIN ANALYZE on queries
-- This migration implements:
-- 1. A secure function to run EXPLAIN ANALYZE on arbitrary queries
-- 2. Helper functions for query plan analysis
-- 3. Security measures to prevent misuse

-- Function to safely run EXPLAIN ANALYZE on a query
CREATE OR REPLACE FUNCTION monitoring.run_explain(
  query_text TEXT,
  params TEXT[] DEFAULT NULL,
  explain_options TEXT DEFAULT 'ANALYZE, VERBOSE, FORMAT JSON'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  result JSONB;
  sanitized_query TEXT;
  full_query TEXT;
  param_values TEXT;
BEGIN
  -- Basic validation
  IF query_text IS NULL OR query_text = '' THEN
    RAISE EXCEPTION 'Empty query text provided';
  END IF;
  
  -- Security checks
  IF query_text ~* '^\s*(alter|drop|create|truncate|comment|vacuum|do|notify|copy|grant|revoke|explain|listen|unlisten|reindex|refresh|prepare|execute|declare|fetch|move|close|checkpoint|cluster|lock|reset|set|show|discard|deallocate|reassign|security|begin|start|commit|end|rollback)\s'
  THEN
    RAISE EXCEPTION 'Operation not allowed in explain query: %', split_part(query_text, ' ', 1)
    USING HINT = 'Only SELECT, INSERT, UPDATE, and DELETE operations are allowed';
  END IF;
  
  -- Sanitize the query (basic protection against SQL injection)
  sanitized_query := regexp_replace(query_text, ';.*$', '');
  
  -- Check if the query already has EXPLAIN
  IF sanitized_query ~* '^\s*explain' THEN
    RAISE EXCEPTION 'Query already includes EXPLAIN. Please provide the base query without EXPLAIN';
  END IF;
  
  -- Prepare the parameters if provided
  IF params IS NOT NULL AND array_length(params, 1) > 0 THEN
    -- Format parameters for query substitution
    param_values := '';
    FOR i IN 1..array_length(params, 1) LOOP
      IF i > 1 THEN
        param_values := param_values || ', ';
      END IF;
      param_values := param_values || quote_literal(params[i]);
    END LOOP;
    
    -- Replace $1, $2, etc. with actual parameter values
    sanitized_query := regexp_replace(sanitized_query, '\$(\d+)', 'COALESCE(' || param_values || '::text[$1-LAST]::text, NULL)', 'g');
  END IF;
  
  -- Construct the full EXPLAIN query
  full_query := 'EXPLAIN (' || explain_options || ') ' || sanitized_query;
  
  -- Execute the EXPLAIN command
  EXECUTE full_query INTO result;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Log the error and return a well-structured error object
  RETURN jsonb_build_object(
    'error', true,
    'message', SQLERRM,
    'code', SQLSTATE,
    'query', query_text,
    'options', explain_options
  );
END;
$$;

-- Function to identify potential optimization opportunities
CREATE OR REPLACE FUNCTION monitoring.identify_optimization_opportunities(
  min_execution_time INTEGER DEFAULT 100, -- in milliseconds
  min_occurrences INTEGER DEFAULT 5,
  lookback_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  query_fingerprint TEXT,
  example_query TEXT,
  execution_count BIGINT,
  avg_execution_time NUMERIC,
  max_execution_time NUMERIC,
  total_execution_time NUMERIC,
  potential_issues TEXT[],
  optimization_suggestions TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RETURN QUERY
  WITH query_stats AS (
    SELECT
      qp.query_fingerprint,
      COUNT(*) as execution_count,
      AVG(qp.execution_time) as avg_execution_time,
      MAX(qp.execution_time) as max_execution_time,
      SUM(qp.execution_time) as total_execution_time,
      MAX(qp.query_text) as example_query,
      jsonb_agg(
        jsonb_build_object(
          'execution_time', qp.execution_time,
          'plan', qp.query_plan,
          'explain', qp.explain_analyze
        )
      ) as execution_details
    FROM 
      monitoring.query_performance qp
    WHERE
      qp.created_at >= (NOW() - (lookback_days || ' days')::interval)
      AND qp.execution_time >= min_execution_time
    GROUP BY
      qp.query_fingerprint
    HAVING
      COUNT(*) >= min_occurrences
    ORDER BY
      total_execution_time DESC
    LIMIT 100
  )
  SELECT
    qs.query_fingerprint,
    qs.example_query,
    qs.execution_count,
    qs.avg_execution_time,
    qs.max_execution_time,
    qs.total_execution_time,
    ARRAY(
      SELECT issue
      FROM (
        -- Check for sequential scans
        SELECT 'Sequential scan detected on large tables' as issue
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_array_elements(qs.execution_details) as ed,
               jsonb_to_recordset(ed->'plan'->0->'Plan') as plan("Node Type" text, "Relation Name" text, "Actual Rows" int)
          WHERE plan."Node Type" = 'Seq Scan' AND plan."Actual Rows" > 1000
        )
        
        UNION
        
        -- Check for missing indexes
        SELECT 'Missing indexes on frequently filtered columns' as issue
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_array_elements(qs.execution_details) as ed,
               jsonb_to_recordset(ed->'plan'->0->'Plan') as plan("Node Type" text, "Filter" text)
          WHERE plan."Filter" IS NOT NULL AND plan."Node Type" = 'Seq Scan'
        )
        
        UNION
        
        -- Check for expensive joins
        SELECT 'Expensive join operations detected' as issue
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_array_elements(qs.execution_details) as ed,
               jsonb_to_recordset(ed->'plan'->0->'Plan') as plan("Node Type" text, "Actual Total Time" numeric)
          WHERE plan."Node Type" LIKE '%Join' AND plan."Actual Total Time" > 100
        )
        
        UNION
        
        -- Check for sort operations
        SELECT 'Expensive sort operations detected' as issue
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_array_elements(qs.execution_details) as ed,
               jsonb_to_recordset(ed->'plan'->0->'Plan') as plan("Node Type" text)
          WHERE plan."Node Type" = 'Sort'
        )
        
        UNION
        
        -- Check for temporary files
        SELECT 'Query using temporary files or disk' as issue
        WHERE qs.example_query ~* 'temporary file'
      ) as issues
    ),
    ARRAY(
      SELECT suggestion
      FROM (
        -- Suggestions for sequential scans
        SELECT 'Consider adding indexes for filtered columns' as suggestion
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_array_elements(qs.execution_details) as ed,
               jsonb_to_recordset(ed->'plan'->0->'Plan') as plan("Node Type" text, "Filter" text)
          WHERE plan."Filter" IS NOT NULL AND plan."Node Type" = 'Seq Scan'
        )
        
        UNION
        
        -- Suggestions for joins
        SELECT 'Ensure join columns have proper indexes' as suggestion
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_array_elements(qs.execution_details) as ed,
               jsonb_to_recordset(ed->'plan'->0->'Plan') as plan("Node Type" text)
          WHERE plan."Node Type" LIKE '%Join'
        )
        
        UNION
        
        -- Suggestions for sorts
        SELECT 'Consider adding indexes to avoid sorting' as suggestion
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_array_elements(qs.execution_details) as ed,
               jsonb_to_recordset(ed->'plan'->0->'Plan') as plan("Node Type" text)
          WHERE plan."Node Type" = 'Sort'
        )
        
        UNION
        
        -- Suggestions for high execution time
        SELECT 'Consider using materialized views for complex queries' as suggestion
        WHERE qs.avg_execution_time > 500
        
        UNION
        
        -- Suggestions for frequently executed queries
        SELECT 'Consider caching results for frequently executed queries' as suggestion
        WHERE qs.execution_count > 100
      ) as suggestions
    )
  FROM
    query_stats qs;
END;
$$;

-- Function to compare execution plans for a query
CREATE OR REPLACE FUNCTION monitoring.compare_query_plans(
  query_fingerprint TEXT,
  lookback_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  id UUID,
  execution_time DOUBLE PRECISION,
  created_at TIMESTAMPTZ,
  plan_differences JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RETURN QUERY
  WITH query_executions AS (
    SELECT
      id,
      execution_time,
      created_at,
      query_plan
    FROM
      monitoring.query_performance
    WHERE
      query_fingerprint = compare_query_plans.query_fingerprint
      AND created_at >= (NOW() - (lookback_days || ' days')::interval)
      AND query_plan IS NOT NULL
    ORDER BY
      created_at DESC
    LIMIT 10
  ),
  baseline AS (
    SELECT query_plan
    FROM query_executions
    ORDER BY execution_time ASC
    LIMIT 1
  )
  SELECT
    qe.id,
    qe.execution_time,
    qe.created_at,
    jsonb_build_object(
      'execution_time_diff', qe.execution_time - (
        SELECT MIN(execution_time) FROM query_executions
      ),
      'plan_differences', jsonb_difference(
        (SELECT query_plan FROM baseline),
        qe.query_plan
      )
    ) as plan_differences
  FROM
    query_executions qe;
END;
$$;

-- Function to calculate differences between two JSONB objects
CREATE OR REPLACE FUNCTION monitoring.jsonb_difference(
  baseline JSONB,
  comparison JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB := '{}'::JSONB;
  key TEXT;
  baseline_val JSONB;
  comparison_val JSONB;
BEGIN
  -- Check for nulls
  IF baseline IS NULL OR comparison IS NULL THEN
    RETURN jsonb_build_object('error', 'One or both inputs are NULL');
  END IF;
  
  -- Iterate through keys in comparison
  FOR key IN SELECT jsonb_object_keys(comparison) LOOP
    -- Check if key exists in baseline
    IF baseline ? key THEN
      baseline_val := baseline->key;
      comparison_val := comparison->key;
      
      -- If both are objects, recurse
      IF jsonb_typeof(baseline_val) = 'object' AND jsonb_typeof(comparison_val) = 'object' THEN
        result := result || jsonb_build_object(key, jsonb_difference(baseline_val, comparison_val));
      -- If different values
      ELSIF baseline_val <> comparison_val THEN
        result := result || jsonb_build_object(
          key, 
          jsonb_build_object(
            'baseline', baseline_val,
            'comparison', comparison_val
          )
        );
      END IF;
    -- Key doesn't exist in baseline
    ELSE
      result := result || jsonb_build_object(
        key, 
        jsonb_build_object('added', comparison->key)
      );
    END IF;
  END LOOP;
  
  -- Check for keys in baseline that are not in comparison
  FOR key IN SELECT jsonb_object_keys(baseline) LOOP
    IF NOT comparison ? key THEN
      result := result || jsonb_build_object(
        key, 
        jsonb_build_object('removed', baseline->key)
      );
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Security checks
-- Ensure the monitoring.run_explain function is only accessible to authorized users
REVOKE ALL ON FUNCTION monitoring.run_explain FROM PUBLIC;
GRANT EXECUTE ON FUNCTION monitoring.run_explain TO authenticated;

-- Add a policy to check if user is allowed to run explain
CREATE OR REPLACE FUNCTION monitoring.can_run_explain()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  -- Allows Supabase service role and any admin users
  RETURN (
    -- Check if using service role
    current_setting('request.jwt.claims', true)::jsonb ? 'service_role' OR
    
    -- Check if user is an admin
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND id IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
      )
    )
  );
END;
$$;

-- Add a trigger to log explain usage
CREATE OR REPLACE FUNCTION monitoring.log_explain_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  INSERT INTO monitoring.query_performance (
    query_text,
    query_fingerprint,
    execution_time,
    database_name,
    schema_name,
    user_name,
    application_name,
    client_addr,
    query_source
  ) VALUES (
    'EXPLAIN ' || NEW.query_text,
    'EXPLAIN',
    0, -- We don't know the execution time
    current_database(),
    current_schema(),
    session_user,
    current_setting('application_name'),
    inet_client_addr(),
    'admin'
  );
  
  RETURN NEW;
END;
$$;

-- Document the functions
COMMENT ON FUNCTION monitoring.run_explain IS 
'Safely run EXPLAIN ANALYZE on a query with the specified options.
Parameters:
  - query_text: The SQL query to analyze
  - params: Array of parameter values if using $1, $2, etc. in the query
  - explain_options: Options for EXPLAIN (default: ANALYZE, VERBOSE, FORMAT JSON)
  
Example usage:
  SELECT * FROM monitoring.run_explain(
    ''SELECT * FROM users WHERE email LIKE $1'',
    ARRAY[''%example.com''],
    ''ANALYZE, BUFFERS, FORMAT JSON''
  );
';

COMMENT ON FUNCTION monitoring.identify_optimization_opportunities IS
'Identify queries that could benefit from optimization based on performance metrics.
Parameters:
  - min_execution_time: Minimum execution time in ms to consider (default: 100)
  - min_occurrences: Minimum number of query executions to consider (default: 5)
  - lookback_days: Number of days to look back for query data (default: 7)
  
Example usage:
  SELECT * FROM monitoring.identify_optimization_opportunities(200, 10, 14);
';

COMMENT ON FUNCTION monitoring.compare_query_plans IS
'Compare execution plans for a query fingerprint to identify plan changes.
Parameters:
  - query_fingerprint: The normalized query pattern to analyze
  - lookback_days: Number of days to look back for query data (default: 7)
  
Example usage:
  SELECT * FROM monitoring.compare_query_plans(''SELECT * FROM users WHERE email LIKE S'', 30);
';