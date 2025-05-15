-- Functions for the Victry database
-- This schema file defines all functions and procedures

-- Create a helper function to check resume ownership
create or replace function private.is_resume_owner(resume_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  return exists (
    select 1 from public.resumes
    where id = resume_id and user_id = (select auth.uid())
  );
end;
$$;

comment on function private.is_resume_owner(uuid) is 'Securely checks if the current user owns the specified resume';

-- Function to extract specific JSONB paths efficiently for font settings
create or replace function public.get_resume_font_settings(resume_id uuid)
returns table(font_family text, font_size integer)
language sql
stable
security invoker
set search_path = ''
as $$
  select 
    (format_options->>'fontFamily')::text,
    (format_options->>'fontSize')::integer
  from public.resumes 
  where id = resume_id
  and (
    -- security check to ensure user can only access their own resume
    select public.resumes.user_id from public.resumes where public.resumes.id = resume_id
  ) = (select auth.uid());
$$;

comment on function public.get_resume_font_settings(uuid) is 'Securely extracts font settings from a resume''s format_options';

-- Function to extract primary color from format_options
create or replace function public.get_resume_colors(resume_id uuid)
returns table(primary_color text, secondary_color text)
language sql
stable
security invoker
set search_path = ''
as $$
  select 
    (format_options->>'primaryColor')::text,
    (format_options->>'secondaryColor')::text
  from public.resumes 
  where id = resume_id
  and (
    -- security check to ensure user can only access their own resume
    select public.resumes.user_id from public.resumes where public.resumes.id = resume_id
  ) = (select auth.uid());
$$;

comment on function public.get_resume_colors(uuid) is 'Securely extracts color settings from a resume''s format_options';

-- Function to duplicate a resume
create or replace function public.duplicate_resume(
  p_resume_id uuid,
  p_new_title text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_source_resume public.resumes%rowtype;
  v_new_resume_id uuid;
  v_title text;
begin
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Verify user owns the source resume
  select * into v_source_resume 
  from public.resumes
  where id = p_resume_id and user_id = v_user_id;
  
  if not found then
    raise exception 'Resume not found or you do not have permission to access it';
  end if;
  
  -- Set new title
  if p_new_title is null then
    v_title := v_source_resume.title || ' (Copy)';
  else
    v_title := p_new_title;
  end if;
  
  -- Create new resume record
  insert into public.resumes (
    user_id,
    title,
    target_job_title,
    template_id,
    is_base_resume,
    original_resume_id,
    format_options,
    metadata
  ) values (
    v_user_id,
    v_title,
    v_source_resume.target_job_title,
    v_source_resume.template_id,
    v_source_resume.is_base_resume,
    p_resume_id,
    v_source_resume.format_options,
    v_source_resume.metadata
  )
  returning id into v_new_resume_id;
  
  -- Copy personal info
  insert into public.personal_info (
    resume_id,
    full_name,
    email,
    phone,
    location,
    linkedin,
    website,
    github,
    additional_info
  )
  select 
    v_new_resume_id,
    full_name,
    email,
    phone,
    location,
    linkedin,
    website,
    github,
    additional_info
  from public.personal_info
  where resume_id = p_resume_id;
  
  -- Copy professional summary
  insert into public.professional_summary (
    resume_id,
    content
  )
  select 
    v_new_resume_id,
    content
  from public.professional_summary
  where resume_id = p_resume_id;
  
  -- Copy work experiences
  insert into public.work_experiences (
    resume_id,
    company,
    position,
    location,
    start_date,
    end_date,
    current,
    highlights,
    description,
    industry,
    department
  )
  select 
    v_new_resume_id,
    company,
    position,
    location,
    start_date,
    end_date,
    current,
    highlights,
    description,
    industry,
    department
  from public.work_experiences
  where resume_id = p_resume_id;
  
  -- Copy education
  insert into public.education (
    resume_id,
    institution,
    degree,
    field,
    location,
    start_date,
    end_date,
    current,
    gpa,
    highlights,
    honors,
    thesis
  )
  select 
    v_new_resume_id,
    institution,
    degree,
    field,
    location,
    start_date,
    end_date,
    current,
    gpa,
    highlights,
    honors,
    thesis
  from public.education
  where resume_id = p_resume_id;
  
  -- Copy skills
  insert into public.skills (
    resume_id,
    name,
    level,
    category,
    years_of_experience,
    is_key_skill
  )
  select 
    v_new_resume_id,
    name,
    level,
    category,
    years_of_experience,
    is_key_skill
  from public.skills
  where resume_id = p_resume_id;
  
  -- Return the new resume ID
  return v_new_resume_id;
end;
$$;

comment on function public.duplicate_resume(uuid, text) is 'Creates a copy of an existing resume with optional new title';

-- Function to analyze a job description for keywords
create or replace function public.analyze_job_description(
  p_job_description_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_job_description public.job_descriptions%rowtype;
  v_analysis_id uuid;
begin
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Verify user owns the job description
  select * into v_job_description 
  from public.job_descriptions
  where id = p_job_description_id and user_id = v_user_id;
  
  if not found then
    raise exception 'Job description not found or you do not have permission to access it';
  end if;
  
  -- Note: In a real implementation, this would call the AI service
  -- For demonstration purposes, we're creating a placeholder record
  
  -- Create or update job analysis
  insert into public.job_analysis (
    job_description_id,
    requirements,
    keywords,
    experience_level,
    company_culture
  ) values (
    p_job_description_id,
    array[jsonb_build_object('skill', 'Example Skill', 'importance', 'high')]::jsonb[],
    array[jsonb_build_object('keyword', 'Example Keyword', 'count', 3)]::jsonb[],
    'Entry Level',
    array['Example Culture Value']
  )
  on conflict (job_description_id) do update
  set 
    requirements = array[jsonb_build_object('skill', 'Example Skill', 'importance', 'high')]::jsonb[],
    keywords = array[jsonb_build_object('keyword', 'Example Keyword', 'count', 3)]::jsonb[],
    experience_level = 'Entry Level',
    company_culture = array['Example Culture Value'],
    updated_at = now()
  returning id into v_analysis_id;
  
  -- Return the analysis ID
  return v_analysis_id;
end;
$$;

comment on function public.analyze_job_description(uuid) is 'Analyzes a job description to extract requirements, keywords, and other insights';