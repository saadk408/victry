-- Migration: 20240515000002_optimized_indexing.sql
-- Description: Adds optimized indexes for improved query performance
-- Created by: Victry Database Team
-- Created at: 2024-05-15
-- 
-- Affected tables:
-- - All tables with foreign keys (added FK indexes)
-- - public.resumes (added timestamp, text search, and composite indexes)
-- - public.work_experiences (added text search and array indexes)
-- - public.skills (added text search indexes)
-- - public.projects (added array indexes)

-- install necessary extensions
create extension if not exists pg_trgm;

-- primary foreign key indexes
create index if not exists idx_personal_info_resume_id on public.personal_info(resume_id);
create index if not exists idx_professional_summary_resume_id on public.professional_summary(resume_id);
create index if not exists idx_work_experiences_resume_id on public.work_experiences(resume_id);
create index if not exists idx_education_resume_id on public.education(resume_id);
create index if not exists idx_skills_resume_id on public.skills(resume_id);
create index if not exists idx_projects_resume_id on public.projects(resume_id);
create index if not exists idx_certifications_resume_id on public.certifications(resume_id);
create index if not exists idx_social_links_resume_id on public.social_links(resume_id);
create index if not exists idx_custom_sections_resume_id on public.custom_sections(resume_id);
create index if not exists idx_custom_entries_section_id on public.custom_entries(custom_section_id);

-- timestamp column optimization with brin indexes (more efficient than btree for sequential timestamp data)
create index if not exists idx_resumes_created_at on public.resumes using brin(created_at);
create index if not exists idx_resumes_updated_at on public.resumes using brin(updated_at);

-- b-tree indexes for common sorting operations
create index if not exists idx_resumes_updated_at_btree on public.resumes(updated_at desc);

-- text search optimization with trigram indexes for partial matching
create index if not exists idx_resumes_title_trgm on public.resumes using gin(title gin_trgm_ops);
create index if not exists idx_resumes_target_job_title_trgm on public.resumes using gin(target_job_title gin_trgm_ops);
create index if not exists idx_work_experiences_company_trgm on public.work_experiences using gin(company gin_trgm_ops);
create index if not exists idx_work_experiences_position_trgm on public.work_experiences using gin(position gin_trgm_ops);
create index if not exists idx_skills_name_trgm on public.skills using gin(name gin_trgm_ops);

-- composite indexes for common queries (user's resumes by date)
create index if not exists idx_resumes_user_id_updated_at on public.resumes(user_id, updated_at desc);

-- optimize for keyset pagination (more efficient than OFFSET/LIMIT)
create index if not exists idx_resumes_user_id_updated_at_id on public.resumes(user_id, updated_at desc, id);

-- partial indexes for common filters (more efficient than full index scans with WHERE clause)
create index if not exists idx_resumes_is_base_resume on public.resumes(user_id) where is_base_resume = true;
create index if not exists idx_work_experiences_current on public.work_experiences(resume_id) where current = true;

-- indexes for array columns
create index if not exists idx_work_experiences_highlights on public.work_experiences using gin(highlights);
create index if not exists idx_projects_technologies on public.projects using gin(technologies);

-- update table statistics to improve query planner decisions
analyze public.resumes;
analyze public.personal_info;
analyze public.work_experiences;
analyze public.education;
analyze public.skills;
analyze public.projects;
analyze public.certifications;
analyze public.social_links;
analyze public.custom_sections;
analyze public.custom_entries;