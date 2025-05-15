-- Victry Database Optimization: Part 1 - Advanced Data Integrity Controls
-- This migration adds custom domains and constraints to enforce data integrity

-- Create custom domains for data validation
CREATE DOMAIN email AS TEXT CHECK(VALUE ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
CREATE DOMAIN phone AS VARCHAR(20) CHECK(VALUE ~ '^\+?[0-9\s\-\(\)]+$');
CREATE DOMAIN url_string AS TEXT CHECK(VALUE ~ '^https?://');

-- Create enum type for skill levels
CREATE TYPE skill_level_enum AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Apply domains to existing columns
ALTER TABLE personal_info ALTER COLUMN email TYPE email;
ALTER TABLE personal_info ALTER COLUMN phone TYPE phone;
ALTER TABLE personal_info ALTER COLUMN linkedin TYPE url_string;
ALTER TABLE personal_info ALTER COLUMN website TYPE url_string;
ALTER TABLE personal_info ALTER COLUMN github TYPE url_string;

-- Add constraint to ensure date integrity in work experiences
ALTER TABLE work_experiences ADD CONSTRAINT valid_work_dates
  CHECK ((end_date IS NULL AND current = TRUE) OR 
         (end_date IS NOT NULL AND current = FALSE AND start_date <= end_date));

-- Add constraint for education dates
ALTER TABLE education ADD CONSTRAINT valid_education_dates
  CHECK ((end_date IS NULL AND current = TRUE) OR 
         (end_date IS NOT NULL AND current = FALSE AND start_date <= end_date));

-- Prevent future dates in resume creation and updates
ALTER TABLE resumes ADD CONSTRAINT valid_creation_date
  CHECK (created_at <= CURRENT_TIMESTAMP);
ALTER TABLE resumes ADD CONSTRAINT valid_update_date
  CHECK (updated_at <= CURRENT_TIMESTAMP);

-- Add version column for optimistic concurrency control
ALTER TABLE resumes ADD COLUMN version INTEGER DEFAULT 1;

-- Convert skill level to enum for type safety and storage efficiency
ALTER TABLE skills ADD COLUMN level_enum skill_level_enum;
UPDATE skills SET level_enum = level::skill_level_enum WHERE level IS NOT NULL;
ALTER TABLE skills DROP COLUMN level;
ALTER TABLE skills RENAME COLUMN level_enum TO level;

-- Add constraint to resume title (not empty)
ALTER TABLE resumes ADD CONSTRAINT valid_resume_title
  CHECK (char_length(title) > 0);

-- Add constraint to personal_info full_name (not empty)
ALTER TABLE personal_info ADD CONSTRAINT valid_full_name
  CHECK (char_length(full_name) > 0);