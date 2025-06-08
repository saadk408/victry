-- Indexes for the Victry database
-- This schema file defines all indexes for query optimization

-- Install necessary extensions
create extension if not exists pg_trgm;

-- Resumes table indexes
create index if not exists idx_resumes_user_id on public.resumes(user_id);
create index if not exists idx_resumes_created_at on public.resumes using brin(created_at);
create index if not exists idx_resumes_updated_at on public.resumes using brin(updated_at);
create index if not exists idx_resumes_updated_at_btree on public.resumes(updated_at desc);
create index if not exists idx_resumes_title_trgm on public.resumes using gin(title gin_trgm_ops);
create index if not exists idx_resumes_target_job_title_trgm on public.resumes using gin(target_job_title gin_trgm_ops);
create index if not exists idx_resumes_user_id_updated_at on public.resumes(user_id, updated_at desc);
create index if not exists idx_resumes_user_id_updated_at_id on public.resumes(user_id, updated_at desc, id);
create index if not exists idx_resumes_is_base_resume on public.resumes(user_id) where is_base_resume = true;
create index if not exists idx_resumes_format_options on public.resumes using gin(format_options);
create index if not exists idx_resumes_metadata on public.resumes using gin(metadata);

-- Profiles table indexes
create index if not exists idx_profiles_subscription_tier 
  on public.profiles(subscription_tier);
  
create index if not exists idx_profiles_created_at 
  on public.profiles(created_at desc);
  
create index if not exists idx_profiles_updated_at 
  on public.profiles(updated_at desc);

-- Personal info indexes
create index if not exists idx_personal_info_resume_id on public.personal_info(resume_id);
create index if not exists idx_personal_info_full_name_trgm on public.personal_info using gin(full_name gin_trgm_ops);

-- Professional summary indexes
create index if not exists idx_professional_summary_resume_id on public.professional_summary(resume_id);

-- Work experiences indexes
create index if not exists idx_work_experiences_resume_id on public.work_experiences(resume_id);
create index if not exists idx_work_experiences_company_trgm on public.work_experiences using gin(company gin_trgm_ops);
create index if not exists idx_work_experiences_position_trgm on public.work_experiences using gin(position gin_trgm_ops);
create index if not exists idx_work_experiences_current on public.work_experiences(resume_id) where current = true;
create index if not exists idx_work_experiences_highlights on public.work_experiences using gin(highlights);

-- Education indexes
create index if not exists idx_education_resume_id on public.education(resume_id);
create index if not exists idx_education_institution_trgm on public.education using gin(institution gin_trgm_ops);
create index if not exists idx_education_degree_trgm on public.education using gin(degree gin_trgm_ops);

-- Skills indexes
create index if not exists idx_skills_resume_id on public.skills(resume_id);
create index if not exists idx_skills_name_trgm on public.skills using gin(name gin_trgm_ops);
create index if not exists idx_skills_category on public.skills(category);

-- Projects indexes
create index if not exists idx_projects_resume_id on public.projects(resume_id);
create index if not exists idx_projects_technologies on public.projects using gin(technologies);

-- Certifications indexes
create index if not exists idx_certifications_resume_id on public.certifications(resume_id);

-- Social links indexes
create index if not exists idx_social_links_resume_id on public.social_links(resume_id);

-- Custom sections indexes
create index if not exists idx_custom_sections_resume_id on public.custom_sections(resume_id);

-- Custom entries indexes
create index if not exists idx_custom_entries_section_id on public.custom_entries(custom_section_id);

-- Job descriptions indexes
create index if not exists idx_job_descriptions_user_id on public.job_descriptions(user_id);
create index if not exists idx_job_descriptions_created_at on public.job_descriptions using brin(created_at);
create index if not exists idx_job_descriptions_company_trgm on public.job_descriptions using gin(company gin_trgm_ops);
create index if not exists idx_job_descriptions_title_trgm on public.job_descriptions using gin(title gin_trgm_ops);
create index if not exists idx_job_descriptions_has_applied on public.job_descriptions(user_id) where has_applied = true;
create index if not exists idx_job_descriptions_is_favorite on public.job_descriptions(user_id) where is_favorite = true;
create index if not exists idx_job_descriptions_tags on public.job_descriptions using gin(tags);

-- Job analysis indexes
create index if not exists idx_job_analysis_job_description_id on public.job_analysis(job_description_id);