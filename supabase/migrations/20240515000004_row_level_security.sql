-- Migration: 20240515000004_row_level_security.sql
-- Description: Implements row level security policies for all tables
-- Created by: Victry Database Team
-- Created at: 2024-05-15
-- 
-- Affected tables:
-- - All resume-related tables (enabled RLS with appropriate policies)
-- - Added security enforcement for both anon and authenticated roles

-- enable rls on all tables
alter table public.resumes enable row level security;
alter table public.personal_info enable row level security;
alter table public.professional_summary enable row level security;
alter table public.work_experiences enable row level security;
alter table public.education enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.certifications enable row level security;
alter table public.social_links enable row level security;
alter table public.custom_sections enable row level security;
alter table public.custom_entries enable row level security;

-- create a private schema for security functions
create schema if not exists private;

-- create a helper function to check resume ownership
-- this uses security definer to run with elevated permissions
-- but limits functionality to only checking ownership
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

-- resumes table policies
-- authenticated users can view their own resumes
create policy "Users can view their own resumes" 
  on public.resumes for select 
  to authenticated
  using (user_id = (select auth.uid()));

-- authenticated users can create resumes (with their user_id)
create policy "Users can create their own resumes" 
  on public.resumes for insert 
  to authenticated
  with check (user_id = (select auth.uid()));

-- authenticated users can update their own resumes
create policy "Users can update their own resumes" 
  on public.resumes for update 
  to authenticated
  using (user_id = (select auth.uid()));

-- authenticated users can delete their own resumes
create policy "Users can delete their own resumes" 
  on public.resumes for delete 
  to authenticated
  using (user_id = (select auth.uid()));

-- anon users cannot access resumes
create policy "Anon users cannot view resumes" 
  on public.resumes for select 
  to anon
  using (false);

create policy "Anon users cannot create resumes" 
  on public.resumes for insert 
  to anon
  with check (false);

-- personal info policies with exists check for better performance
-- authenticated users can view their own personal info
create policy "Users can view their own personal info" 
  on public.personal_info for select 
  to authenticated
  using (exists (
    select 1 from public.resumes 
    where resumes.id = personal_info.resume_id 
    and resumes.user_id = (select auth.uid())
  ));

-- authenticated users can create their own personal info
create policy "Users can create their own personal info" 
  on public.personal_info for insert 
  to authenticated
  with check (exists (
    select 1 from public.resumes 
    where resumes.id = personal_info.resume_id 
    and resumes.user_id = (select auth.uid())
  ));

-- authenticated users can update their own personal info
create policy "Users can update their own personal info" 
  on public.personal_info for update 
  to authenticated
  using (exists (
    select 1 from public.resumes 
    where resumes.id = personal_info.resume_id 
    and resumes.user_id = (select auth.uid())
  ));

-- authenticated users can delete their own personal info
create policy "Users can delete their own personal info" 
  on public.personal_info for delete 
  to authenticated
  using (exists (
    select 1 from public.resumes 
    where resumes.id = personal_info.resume_id 
    and resumes.user_id = (select auth.uid())
  ));

-- anon users cannot access personal info
create policy "Anon users cannot view personal info" 
  on public.personal_info for select 
  to anon
  using (false);

-- professional summary policies
-- authenticated users can view their own professional summary
create policy "Users can view their own professional summary" 
  on public.professional_summary for select 
  to authenticated
  using (private.is_resume_owner(resume_id));

-- authenticated users can insert their own professional summary
create policy "Users can create their own professional summary" 
  on public.professional_summary for insert 
  to authenticated
  with check (private.is_resume_owner(resume_id));

-- authenticated users can update their own professional summary
create policy "Users can update their own professional summary" 
  on public.professional_summary for update 
  to authenticated
  using (private.is_resume_owner(resume_id));

-- authenticated users can delete their own professional summary
create policy "Users can delete their own professional summary" 
  on public.professional_summary for delete 
  to authenticated
  using (private.is_resume_owner(resume_id));

-- anon users cannot access professional summary
create policy "Anon users cannot view professional summary" 
  on public.professional_summary for select 
  to anon
  using (false);

-- work experiences policies
-- authenticated users can view their own work experiences
create policy "Users can view their own work experiences" 
  on public.work_experiences for select 
  to authenticated
  using (private.is_resume_owner(resume_id));

-- authenticated users can insert their own work experiences
create policy "Users can create their own work experiences" 
  on public.work_experiences for insert 
  to authenticated
  with check (private.is_resume_owner(resume_id));

-- authenticated users can update their own work experiences
create policy "Users can update their own work experiences" 
  on public.work_experiences for update 
  to authenticated
  using (private.is_resume_owner(resume_id));

-- authenticated users can delete their own work experiences
create policy "Users can delete their own work experiences" 
  on public.work_experiences for delete 
  to authenticated
  using (private.is_resume_owner(resume_id));

-- anon users cannot access work experiences
create policy "Anon users cannot view work experiences" 
  on public.work_experiences for select 
  to anon
  using (false);

-- education policies
-- authenticated users can view their own education
create policy "Users can view their own education" 
  on public.education for select 
  to authenticated
  using (private.is_resume_owner(resume_id));

-- authenticated users can insert their own education
create policy "Users can create their own education" 
  on public.education for insert 
  to authenticated
  with check (private.is_resume_owner(resume_id));

-- authenticated users can update their own education
create policy "Users can update their own education" 
  on public.education for update 
  to authenticated
  using (private.is_resume_owner(resume_id));

-- authenticated users can delete their own education
create policy "Users can delete their own education" 
  on public.education for delete 
  to authenticated
  using (private.is_resume_owner(resume_id));

-- anon users cannot access education
create policy "Anon users cannot view education" 
  on public.education for select 
  to anon
  using (false);

-- skills policies
-- authenticated users can view their own skills
create policy "Users can view their own skills" 
  on public.skills for select 
  to authenticated
  using (private.is_resume_owner(resume_id));

-- authenticated users can insert their own skills
create policy "Users can create their own skills" 
  on public.skills for insert 
  to authenticated
  with check (private.is_resume_owner(resume_id));

-- authenticated users can update their own skills
create policy "Users can update their own skills" 
  on public.skills for update 
  to authenticated
  using (private.is_resume_owner(resume_id));

-- authenticated users can delete their own skills
create policy "Users can delete their own skills" 
  on public.skills for delete 
  to authenticated
  using (private.is_resume_owner(resume_id));

-- anon users cannot access skills
create policy "Anon users cannot view skills" 
  on public.skills for select 
  to anon
  using (false);

-- custom section entries policies
-- authenticated users can view their own custom section entries
create policy "Users can view their own custom section entries" 
  on public.custom_entries for select 
  to authenticated
  using (exists (
    select 1 from public.custom_sections
    join public.resumes on custom_sections.resume_id = resumes.id
    where custom_entries.custom_section_id = custom_sections.id
    and resumes.user_id = (select auth.uid())
  ));

-- authenticated users can insert their own custom section entries
create policy "Users can create their own custom section entries" 
  on public.custom_entries for insert 
  to authenticated
  with check (exists (
    select 1 from public.custom_sections
    join public.resumes on custom_sections.resume_id = resumes.id
    where custom_entries.custom_section_id = custom_sections.id
    and resumes.user_id = (select auth.uid())
  ));

-- authenticated users can update their own custom section entries
create policy "Users can update their own custom section entries" 
  on public.custom_entries for update 
  to authenticated
  using (exists (
    select 1 from public.custom_sections
    join public.resumes on custom_sections.resume_id = resumes.id
    where custom_entries.custom_section_id = custom_sections.id
    and resumes.user_id = (select auth.uid())
  ));

-- authenticated users can delete their own custom section entries
create policy "Users can delete their own custom section entries" 
  on public.custom_entries for delete 
  to authenticated
  using (exists (
    select 1 from public.custom_sections
    join public.resumes on custom_sections.resume_id = resumes.id
    where custom_entries.custom_section_id = custom_sections.id
    and resumes.user_id = (select auth.uid())
  ));

-- anon users cannot access custom section entries
create policy "Anon users cannot view custom section entries" 
  on public.custom_entries for select 
  to anon
  using (false);