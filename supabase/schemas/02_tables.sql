-- Tables for the Victry database
-- This schema file defines all tables in the database

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
  version integer default 1,
  metadata jsonb,
  format_options jsonb,
  
  -- Constraints
  constraint valid_creation_date check (created_at <= current_timestamp),
  constraint valid_update_date check (updated_at <= current_timestamp),
  constraint valid_resume_title check (char_length(title) > 0)
);
comment on table public.resumes is 'Stores user resume metadata including titles, versions, and references to related content. Each resume belongs to a single user and may link to job descriptions for tailoring.';

-- Personal information
create table public.personal_info (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  full_name text not null,
  email public.email not null,
  phone public.phone not null,
  location text not null,
  linkedin public.url_string,
  website public.url_string,
  github public.url_string,
  additional_info jsonb,
  
  -- Constraints
  constraint valid_full_name check (char_length(full_name) > 0)
);
comment on table public.personal_info is 'Contains personal contact information for each resume, including validated email, phone, and web presence links.';

-- Professional summary
create table public.professional_summary (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  content text not null
);
comment on table public.professional_summary is 'Resume summary or objective statement that highlights career goals and qualifications.';

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
  department text,
  
  -- Constraints
  constraint valid_work_dates check (
    (end_date is null and current = true) or 
    (end_date is not null and current = false and start_date <= end_date)
  )
);
comment on table public.work_experiences is 'Work history entries for resumes, including positions, companies, timeframes, and achievements.';

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
  thesis text,
  
  -- Constraints
  constraint valid_education_dates check (
    (end_date is null and current = true) or 
    (end_date is not null and current = false and start_date <= end_date)
  )
);
comment on table public.education is 'Educational background information for resumes, including institutions, degrees, and timeframes.';

-- Skills
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  name text not null,
  level public.skill_level_enum,
  category text,
  years_of_experience integer,
  is_key_skill boolean
);
comment on table public.skills is 'Skills listed on resumes with categorization and proficiency levels.';

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  name text not null,
  description text not null,
  start_date text,
  end_date text,
  url public.url_string,
  highlights text[] not null default '{}',
  technologies text[],
  role text,
  organization text
);
comment on table public.projects is 'Project portfolio entries for resumes showing relevant work samples and achievements.';

-- Certifications
create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  name text not null,
  issuer text not null,
  date text not null,
  expires text,
  url public.url_string,
  credential_id text,
  description text
);
comment on table public.certifications is 'Professional certifications and licenses earned by the user.';

-- Social links
create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  platform text not null,
  url public.url_string not null,
  username text,
  display_text text,
  is_primary boolean
);
comment on table public.social_links is 'Social media profiles and professional networking links.';

-- Custom sections
create table public.custom_sections (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  title text not null,
  order integer,
  is_visible boolean default true
);
comment on table public.custom_sections is 'User-defined resume sections for additional content types.';

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
comment on table public.custom_entries is 'Content items within custom sections of resumes.';

-- Job descriptions
create table public.job_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  company text not null,
  location text,
  content text not null,
  url public.url_string,
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
comment on table public.job_descriptions is 'Job postings for tailoring resumes, including company details, requirements, and application status.';

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
comment on table public.job_analysis is 'AI-generated analysis of job descriptions for better matching and tailoring.';