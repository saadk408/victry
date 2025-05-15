-- Victry Database Optimization: Part 8 - Materialized Views for Resume Listings
-- This migration creates materialized views for common query patterns

-- Create materialized view for resume listings
CREATE MATERIALIZED VIEW resume_listings AS
SELECT 
  r.id, 
  r.user_id, 
  r.title, 
  r.target_job_title, 
  r.created_at, 
  r.updated_at,
  r.template_id, 
  r.is_base_resume, 
  r.original_resume_id, 
  r.job_description_id,
  r.ats_score, 
  p.full_name, 
  p.email, 
  p.location
FROM resumes r
LEFT JOIN personal_info p ON r.id = p.resume_id;

-- Index the materialized view
CREATE INDEX idx_resume_listings_user_id ON resume_listings(user_id);
CREATE INDEX idx_resume_listings_updated_at ON resume_listings(updated_at DESC);
CREATE UNIQUE INDEX idx_resume_listings_id ON resume_listings(id);

-- Create refresh function
CREATE OR REPLACE FUNCTION refresh_resume_listings()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY resume_listings;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to maintain the view
CREATE TRIGGER refresh_resume_listings_resumes
AFTER INSERT OR UPDATE OR DELETE ON resumes
FOR EACH STATEMENT EXECUTE PROCEDURE refresh_resume_listings();

CREATE TRIGGER refresh_resume_listings_personal_info
AFTER INSERT OR UPDATE OR DELETE ON personal_info
FOR EACH STATEMENT EXECUTE PROCEDURE refresh_resume_listings();

-- Create function to get resume listings efficiently
CREATE OR REPLACE FUNCTION get_user_resumes(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  target_job_title TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  template_id TEXT,
  is_base_resume BOOLEAN,
  full_name TEXT,
  email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rl.id,
    rl.title,
    rl.target_job_title,
    rl.created_at,
    rl.updated_at,
    rl.template_id,
    rl.is_base_resume,
    rl.full_name,
    rl.email
  FROM resume_listings rl
  WHERE rl.user_id = p_user_id
  AND (
    p_search IS NULL OR 
    rl.title ILIKE '%' || p_search || '%' OR 
    rl.target_job_title ILIKE '%' || p_search || '%'
  )
  ORDER BY rl.updated_at DESC, rl.id
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for skill statistics
CREATE MATERIALIZED VIEW skill_statistics AS
SELECT
  s.name,
  s.level,
  COUNT(*) AS usage_count,
  string_agg(DISTINCT r.target_job_title, ', ' ORDER BY r.target_job_title) AS job_titles
FROM skills s
JOIN resumes r ON s.resume_id = r.id
GROUP BY s.name, s.level
HAVING COUNT(*) > 1;

-- Index skill statistics view
CREATE INDEX idx_skill_statistics_name ON skill_statistics(name);
CREATE INDEX idx_skill_statistics_usage_count ON skill_statistics(usage_count DESC);

-- Create refresh function for skill statistics
CREATE OR REPLACE FUNCTION refresh_skill_statistics()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW skill_statistics;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain skill statistics view
CREATE TRIGGER refresh_skill_statistics
AFTER INSERT OR UPDATE OR DELETE ON skills
FOR EACH STATEMENT EXECUTE PROCEDURE refresh_skill_statistics();

-- Set up scheduled refreshes for materialized views
CREATE OR REPLACE PROCEDURE refresh_materialized_views()
LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY resume_listings;
  REFRESH MATERIALIZED VIEW skill_statistics;
END;
$$;