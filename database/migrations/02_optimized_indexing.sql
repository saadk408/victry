-- Victry Database Optimization: Part 2 - Optimized Indexing Strategy
-- This migration adds indexes to improve query performance

-- Install necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Primary Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_personal_info_resume_id ON personal_info(resume_id);
CREATE INDEX IF NOT EXISTS idx_professional_summary_resume_id ON professional_summary(resume_id);
CREATE INDEX IF NOT EXISTS idx_work_experiences_resume_id ON work_experiences(resume_id);
CREATE INDEX IF NOT EXISTS idx_education_resume_id ON education(resume_id);
CREATE INDEX IF NOT EXISTS idx_skills_resume_id ON skills(resume_id);
CREATE INDEX IF NOT EXISTS idx_projects_resume_id ON projects(resume_id);
CREATE INDEX IF NOT EXISTS idx_certifications_resume_id ON certifications(resume_id);
CREATE INDEX IF NOT EXISTS idx_social_links_resume_id ON social_links(resume_id);
CREATE INDEX IF NOT EXISTS idx_custom_sections_resume_id ON custom_sections(resume_id);
CREATE INDEX IF NOT EXISTS idx_custom_entries_section_id ON custom_entries(custom_section_id);

-- Timestamp Column Optimization with BRIN indexes
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes USING BRIN(created_at);
CREATE INDEX IF NOT EXISTS idx_resumes_updated_at ON resumes USING BRIN(updated_at);

-- B-tree indexes for common sorting operations
CREATE INDEX IF NOT EXISTS idx_resumes_updated_at_btree ON resumes(updated_at DESC);

-- Text Search Optimization
CREATE INDEX IF NOT EXISTS idx_resumes_title_trgm ON resumes USING GIN(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_resumes_target_job_title_trgm ON resumes USING GIN(target_job_title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_work_experiences_company_trgm ON work_experiences USING GIN(company gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_work_experiences_position_trgm ON work_experiences USING GIN(position gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_skills_name_trgm ON skills USING GIN(name gin_trgm_ops);

-- Composite Indexes for Common Queries
CREATE INDEX IF NOT EXISTS idx_resumes_user_id_updated_at ON resumes(user_id, updated_at DESC);

-- Optimize for keyset pagination
CREATE INDEX IF NOT EXISTS idx_resumes_user_id_updated_at_id ON resumes(user_id, updated_at DESC, id);

-- Partial Indexes for Common Filters
CREATE INDEX IF NOT EXISTS idx_resumes_is_base_resume ON resumes(user_id) WHERE is_base_resume = true;
CREATE INDEX IF NOT EXISTS idx_work_experiences_current ON work_experiences(resume_id) WHERE current = true;

-- Indexes for array columns
CREATE INDEX IF NOT EXISTS idx_work_experiences_highlights ON work_experiences USING GIN(highlights);
CREATE INDEX IF NOT EXISTS idx_projects_technologies ON projects USING GIN(technologies);

-- Update table statistics
ANALYZE resumes;
ANALYZE personal_info;
ANALYZE work_experiences;
ANALYZE education;
ANALYZE skills;
ANALYZE projects;
ANALYZE certifications;
ANALYZE social_links;
ANALYZE custom_sections;
ANALYZE custom_entries;