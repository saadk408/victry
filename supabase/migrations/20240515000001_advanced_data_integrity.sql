-- Migration: 20240515000001_advanced_data_integrity.sql
-- Description: Adds custom domains and constraints for data integrity
-- Created by: Victry Database Team
-- Created at: 2024-05-15
-- 
-- Affected tables:
-- - public.resumes (added constraints and version column)
-- - public.personal_info (applied domains for contact information)
-- - public.work_experiences (added date validation constraints)
-- - public.education (added date validation constraints)
-- - public.skills (converted level to enum type)

-- create custom domains for data validation
create domain public.email as text check(value ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
create domain public.phone as varchar(20) check(value ~ '^\+?[0-9\s\-\(\)]+$');
create domain public.url_string as text check(value ~ '^https?://');

-- create enum type for skill levels
create type public.skill_level_enum as enum ('beginner', 'intermediate', 'advanced', 'expert');

-- apply domains to existing columns
alter table public.personal_info alter column email type public.email;
alter table public.personal_info alter column phone type public.phone;
alter table public.personal_info alter column linkedin type public.url_string;
alter table public.personal_info alter column website type public.url_string;
alter table public.personal_info alter column github type public.url_string;

-- add constraint to ensure date integrity in work experiences
alter table public.work_experiences add constraint valid_work_dates
  check ((end_date is null and current = true) or 
         (end_date is not null and current = false and start_date <= end_date));

-- add constraint for education dates
alter table public.education add constraint valid_education_dates
  check ((end_date is null and current = true) or 
         (end_date is not null and current = false and start_date <= end_date));

-- prevent future dates in resume creation and updates
alter table public.resumes add constraint valid_creation_date
  check (created_at <= current_timestamp);
alter table public.resumes add constraint valid_update_date
  check (updated_at <= current_timestamp);

-- add version column for optimistic concurrency control
alter table public.resumes add column version integer default 1;

-- convert skill level to enum for type safety and storage efficiency
alter table public.skills add column level_enum public.skill_level_enum;
update public.skills set level_enum = level::public.skill_level_enum where level is not null;
alter table public.skills drop column level;
alter table public.skills rename column level_enum to level;

-- add constraint to resume title (not empty)
alter table public.resumes add constraint valid_resume_title
  check (char_length(title) > 0);

-- add constraint to personal_info full_name (not empty)
alter table public.personal_info add constraint valid_full_name
  check (char_length(full_name) > 0);

-- add comments to tables for documentation
comment on table public.resumes is 'Stores user resume metadata including titles, versions, and references to related content. Each resume belongs to a single user and may link to job descriptions for tailoring.';
comment on table public.personal_info is 'Contains personal contact information for each resume, including validated email, phone, and web presence links.';
comment on table public.work_experiences is 'Work history entries for resumes, including positions, companies, timeframes, and achievements.';
comment on table public.education is 'Educational background information for resumes, including institutions, degrees, and timeframes.';
comment on table public.skills is 'Skills listed on resumes with categorization and proficiency levels.';