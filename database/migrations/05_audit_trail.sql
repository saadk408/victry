-- Victry Database Optimization: Part 5 - Efficient Audit Trail Implementation
-- This migration creates an audit schema with tables and functions to track changes

-- Create audit schema
CREATE SCHEMA audit;

-- Create audit table for resume changes
CREATE TABLE audit.resume_changes (
  id BIGSERIAL PRIMARY KEY,
  resume_id UUID NOT NULL,
  user_id UUID NOT NULL,
  change_type TEXT NOT NULL,
  section TEXT NOT NULL,
  field TEXT,
  previous_value JSONB,
  new_value JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  client_info JSONB
);

-- Create efficient BRIN index for timestamp-based queries (good for append-only tables)
CREATE INDEX idx_resume_changes_timestamp ON audit.resume_changes 
  USING BRIN(timestamp) WITH (pages_per_range = 32);

-- Create index for resume_id for efficient filtering
CREATE INDEX idx_resume_changes_resume_id ON audit.resume_changes(resume_id);

-- Create trigger function for tracking resume changes
CREATE OR REPLACE FUNCTION audit.track_resume_changes()
RETURNS TRIGGER AS $$
DECLARE
  client_info JSONB;
BEGIN
  -- Try to get client info from current session
  BEGIN
    client_info := jsonb_build_object(
      'ip', current_setting('request.headers', true)::json->>'x-forwarded-for',
      'user_agent', current_setting('request.headers', true)::json->>'user-agent'
    );
  EXCEPTION WHEN OTHERS THEN
    client_info := '{}'::jsonb;
  END;

  IF TG_OP = 'UPDATE' THEN
    -- Track title changes
    IF OLD.title IS DISTINCT FROM NEW.title THEN
      INSERT INTO audit.resume_changes(
        resume_id, user_id, change_type, section, field, 
        previous_value, new_value, client_info
      )
      VALUES(
        NEW.id, 
        NEW.user_id, 
        'UPDATE', 
        'resume', 
        'title', 
        jsonb_build_object('title', OLD.title), 
        jsonb_build_object('title', NEW.title),
        client_info
      );
    END IF;
    
    -- Track target job title changes
    IF OLD.target_job_title IS DISTINCT FROM NEW.target_job_title THEN
      INSERT INTO audit.resume_changes(
        resume_id, user_id, change_type, section, field, 
        previous_value, new_value, client_info
      )
      VALUES(
        NEW.id, 
        NEW.user_id, 
        'UPDATE', 
        'resume', 
        'target_job_title', 
        jsonb_build_object('target_job_title', OLD.target_job_title), 
        jsonb_build_object('target_job_title', NEW.target_job_title),
        client_info
      );
    END IF;
    
    -- Track template changes
    IF OLD.template_id IS DISTINCT FROM NEW.template_id THEN
      INSERT INTO audit.resume_changes(
        resume_id, user_id, change_type, section, field, 
        previous_value, new_value, client_info
      )
      VALUES(
        NEW.id, 
        NEW.user_id, 
        'UPDATE', 
        'resume', 
        'template_id', 
        jsonb_build_object('template_id', OLD.template_id), 
        jsonb_build_object('template_id', NEW.template_id),
        client_info
      );
    END IF;
    
    -- Track format_options changes
    IF OLD.format_options IS DISTINCT FROM NEW.format_options THEN
      INSERT INTO audit.resume_changes(
        resume_id, user_id, change_type, section, field, 
        previous_value, new_value, client_info
      )
      VALUES(
        NEW.id, 
        NEW.user_id, 
        'UPDATE', 
        'resume', 
        'format_options', 
        jsonb_build_object('format_options', OLD.format_options), 
        jsonb_build_object('format_options', NEW.format_options),
        client_info
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit.resume_changes(
      resume_id, user_id, change_type, section, field, 
      previous_value, new_value, client_info
    )
    VALUES(
      OLD.id, 
      OLD.user_id, 
      'DELETE', 
      'resume', 
      NULL, 
      jsonb_build_object('resume', row_to_json(OLD)), 
      NULL,
      client_info
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit.resume_changes(
      resume_id, user_id, change_type, section, field, 
      previous_value, new_value, client_info
    )
    VALUES(
      NEW.id, 
      NEW.user_id, 
      'INSERT', 
      'resume', 
      NULL, 
      NULL, 
      jsonb_build_object('resume', row_to_json(NEW)),
      client_info
    );
  END IF;
  
  -- Always return NEW for INSERT/UPDATE or OLD for DELETE
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on resumes table
CREATE TRIGGER audit_resume_changes
AFTER INSERT OR UPDATE OR DELETE ON resumes
FOR EACH ROW EXECUTE FUNCTION audit.track_resume_changes();

-- Function to get resume change history
CREATE OR REPLACE FUNCTION get_resume_history(p_resume_id UUID)
RETURNS TABLE(
  change_id BIGINT,
  change_type TEXT,
  section TEXT,
  field TEXT,
  previous_value JSONB,
  new_value JSONB,
  timestamp TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id, change_type, section, field, previous_value, new_value, timestamp
  FROM audit.resume_changes
  WHERE resume_id = p_resume_id
  ORDER BY timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;