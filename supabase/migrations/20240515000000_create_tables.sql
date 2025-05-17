-- Migration: 20240515000000_create_tables.sql
-- Description: Creates all base tables needed for the application
-- Created by: Victry Database Team
-- Created at: 2024-05-15

-- Main resume table
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_job_title text,
  template_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_base_resume boolean default true,
  original_resume_id uuid references public.resumes(id),
  job_description_id uuid,
  ats_score numeric,
  metadata jsonb,
  format_options jsonb
);

-- Personal information table
create table public.personal_info (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  location text not null,
  linkedin text,
  website text,
  github text,
  additional_info jsonb
);

-- Professional summary
create table public.professional_summary (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  content text not null
);

-- Work experience
create table public.work_experiences (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  company text not null,
  position text not null,
  location text not null,
  start_date text not null,
  end_date text,
  current boolean default false,
  highlights text[] not null default '{}',
  description text,
  industry text,
  department text
);

-- Education
create table public.education (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  institution text not null,
  degree text not null,
  field text not null,
  location text not null,
  start_date text not null,
  end_date text,
  current boolean default false,
  gpa text,
  highlights text[],
  honors text[],
  thesis text
);

-- Skills
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  name text not null,
  level text,
  category text,
  years_of_experience integer,
  is_key_skill boolean
);

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  name text not null,
  description text not null,
  start_date text,
  end_date text,
  url text,
  highlights text[] not null default '{}',
  technologies text[],
  role text,
  organization text
);

-- Certifications
create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  name text not null,
  issuer text not null,
  date text not null,
  expires text,
  url text,
  credential_id text,
  description text
);

-- Social links
create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  platform text not null,
  url text not null,
  username text,
  display_text text,
  is_primary boolean
);

-- Custom sections
create table public.custom_sections (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  title text not null,
  section_order integer,
  is_visible boolean default true
);

-- Custom entries for custom sections
create table public.custom_entries (
  id uuid primary key default gen_random_uuid(),
  custom_section_id uuid not null references public.custom_sections(id) on delete cascade,
  title text,
  subtitle text,
  date text,
  description text,
  bullets text[]
);

-- Create job application status enum
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

-- Create tailoring status enum
create type public.tailoring_status_enum as enum (
  'not_started',
  'in_progress',
  'completed',
  'needs_review'
);

-- Job descriptions
create table public.job_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  company text not null,
  location text,
  content text not null,
  url text,
  application_deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  has_applied boolean default false,
  application_date timestamptz,
  application_status public.application_status_enum default 'not_applied',
  notes text,
  is_favorite boolean default false,
  tags text[],
  employment_type text,
  workplace_type text,
  is_active boolean default true,
  salary_range jsonb,
  industry text,
  department text
);

-- Table for AI analysis of job descriptions
create table public.job_analysis (
  id uuid primary key default gen_random_uuid(),
  job_description_id uuid not null references public.job_descriptions(id) on delete cascade,
  requirements jsonb[] not null,
  keywords jsonb[] not null,
  experience_level text not null,
  company_culture text[] not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  salary_range jsonb,
  industry text,
  department text,
  employment_type text,
  remote_work text,
  responsibilities text[],
  ats_compatibility_score numeric
);