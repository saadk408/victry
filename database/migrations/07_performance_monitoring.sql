-- Victry Database Optimization: Part 7 - Enhanced Performance Monitoring
-- This migration sets up monitoring tools and functions for database performance

-- Install necessary extensions if not already installed
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;

-- Function to analyze overall schema health
CREATE OR REPLACE FUNCTION analyze_database_health()
RETURNS TABLE(
  name TEXT,
  value TEXT
) AS $$
BEGIN
  -- Return index hit rate
  RETURN QUERY
  SELECT 
    'index hit rate',
    round(
      (sum(idx_blks_hit)) * 100.0 / nullif(sum(idx_blks_hit + idx_blks_read), 0), 
      2
    )::TEXT || '%'
  FROM pg_statio_user_indexes;
  
  -- Return table hit rate
  RETURN QUERY
  SELECT 
    'table hit rate',
    round(
      sum(heap_blks_hit) * 100.0 / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0), 
      2
    )::TEXT || '%'
  FROM pg_statio_user_tables;
  
  -- Return table and index sizes
  RETURN QUERY
  SELECT 
    relname,
    pg_size_pretty(pg_total_relation_size(relid))
  FROM pg_catalog.pg_statio_user_tables
  ORDER BY pg_total_relation_size(relid) DESC
  LIMIT 10;
  
  -- Return unused indexes
  RETURN QUERY
  SELECT
    'unused index: ' || indexrelname,
    'table: ' || relname
  FROM pg_stat_user_indexes
  JOIN pg_statio_user_indexes USING (indexrelid)
  WHERE idx_scan = 0 AND idx_tup_read = 0 AND idx_tup_fetch = 0
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Function to identify slow queries
CREATE OR REPLACE FUNCTION find_slow_resume_queries()
RETURNS TABLE(
  query TEXT, 
  calls BIGINT, 
  avg_time FLOAT, 
  rows_per_call FLOAT
) AS $$
  SELECT 
    query, 
    calls,
    total_exec_time / calls AS avg_time,
    rows / calls AS rows_per_call
  FROM extensions.pg_stat_statements
  WHERE query ILIKE '%resume%' OR query ILIKE '%personal_info%'
  ORDER BY avg_time DESC
  LIMIT 10;
$$ LANGUAGE SQL;

-- Function to maintain statistics
CREATE OR REPLACE FUNCTION maintain_statistics()
RETURNS VOID AS $$
BEGIN
  ANALYZE resumes;
  ANALYZE personal_info;
  ANALYZE work_experiences;
  ANALYZE education;
  ANALYZE skills;
  ANALYZE projects;
  ANALYZE certifications;
  ANALYZE social_links;
  ANALYZE custom_sections;
  ANALYZE custom_entries;
END;
$$ LANGUAGE plpgsql;

-- Function to analyze cache efficiency
CREATE OR REPLACE FUNCTION analyze_cache_efficiency()
RETURNS TABLE(
  name TEXT, 
  hit_rate NUMERIC
) AS $$
  SELECT
    'index hit rate' as name,
    round(
      (sum(idx_blks_hit)) * 100.0 / nullif(sum(idx_blks_hit + idx_blks_read), 0),
      2
    ) as hit_rate
  FROM pg_statio_user_indexes
  UNION ALL
  SELECT
    'table hit rate' as name,
    round(
      sum(heap_blks_hit) * 100.0 / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0),
      2
    ) as hit_rate
  FROM pg_statio_user_tables;
$$ LANGUAGE SQL;

-- Function to get the most frequently updated tables
CREATE OR REPLACE FUNCTION get_most_active_tables()
RETURNS TABLE(
  table_name TEXT,
  select_count BIGINT,
  insert_count BIGINT,
  update_count BIGINT,
  delete_count BIGINT,
  total_operations BIGINT
) AS $$
  SELECT
    relname::TEXT AS table_name,
    seq_scan + idx_scan AS select_count,
    n_tup_ins AS insert_count,
    n_tup_upd AS update_count,
    n_tup_del AS delete_count,
    seq_scan + idx_scan + n_tup_ins + n_tup_upd + n_tup_del AS total_operations
  FROM pg_stat_user_tables
  ORDER BY total_operations DESC
  LIMIT 10;
$$ LANGUAGE SQL;

-- Function to check for table bloat
CREATE OR REPLACE FUNCTION check_table_bloat()
RETURNS TABLE(
  table_name TEXT,
  dead_tuples BIGINT,
  live_tuples BIGINT,
  bloat_ratio NUMERIC
) AS $$
  SELECT
    relname::TEXT AS table_name,
    n_dead_tup AS dead_tuples,
    n_live_tup AS live_tuples,
    CASE WHEN n_live_tup > 0 
         THEN round((n_dead_tup::NUMERIC / n_live_tup::NUMERIC) * 100, 2)
         ELSE 0 
    END AS bloat_ratio
  FROM pg_stat_user_tables
  WHERE n_dead_tup > 0
  ORDER BY bloat_ratio DESC
  LIMIT 10;
$$ LANGUAGE SQL;

-- Create a maintenance procedure to run regularly
CREATE OR REPLACE PROCEDURE perform_db_maintenance()
LANGUAGE plpgsql AS $$
BEGIN
  -- Update statistics
  CALL maintain_statistics();
  
  -- VACUUM tables with significant bloat
  FOR r IN 
    SELECT relname
    FROM pg_stat_user_tables
    WHERE n_dead_tup > 100 AND (n_dead_tup::NUMERIC / n_live_tup::NUMERIC) > 0.1
    LIMIT 5
  LOOP
    EXECUTE 'VACUUM ANALYZE ' || r.relname;
  END LOOP;
  
  -- Clean up pg_stat_statements data
  IF EXISTS (
    SELECT 1 FROM pg_available_extensions
    WHERE name = 'pg_stat_statements' AND installed_version IS NOT NULL
  ) THEN
    PERFORM extensions.pg_stat_statements_reset();
  END IF;
END;
$$;