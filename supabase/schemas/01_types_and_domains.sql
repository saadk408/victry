-- Types and domains for the Victry database
-- This schema file defines all custom types and domains used across the application

-- Custom domains for data validation
create domain public.email as text check(value ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
comment on domain public.email is 'Email addresses in standard format';

create domain public.phone as varchar(20) check(value ~ '^\+?[0-9\s\-\(\)]+$');
comment on domain public.phone is 'Phone numbers with optional formatting';

create domain public.url_string as text check(value ~ '^https?://');
comment on domain public.url_string is 'URL strings that start with http:// or https://';

-- Create enum types
create type public.skill_level_enum as enum ('beginner', 'intermediate', 'advanced', 'expert');
comment on type public.skill_level_enum is 'Skill proficiency levels';

-- Job status enums
create type public.application_status_enum as enum (
  'not_applied',
  'applied',
  'interview_scheduled',
  'interview_completed',
  'offer_received',
  'accepted',
  'rejected',
  'withdrawn'
);
comment on type public.application_status_enum is 'Status of job applications';

-- Resume status enums
create type public.tailoring_status_enum as enum (
  'not_started',
  'in_progress',
  'completed',
  'needs_review'
);
comment on type public.tailoring_status_enum is 'Status of resume tailoring process';