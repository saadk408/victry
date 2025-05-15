-- Materialized Views for the Victry database
-- This schema file defines materialized views for query optimization

-- Resume listings materialized view
create materialized view if not exists public.resume_listings as
select 
  r.id, 
  r.user_id, 
  r.title, 
  r.target_job_title, 
  r.created_at, 
  r.updated_at,
  r.template_id, 
  r.is_base_resume, 
  r.original_resume_id, 
  r.job_description_id,
  r.ats_score, 
  p.full_name, 
  p.email, 
  p.location
from public.resumes r
left join public.personal_info p on r.id = p.resume_id;

comment on materialized view public.resume_listings is 'Optimized view for listing resumes with basic personal info';

-- Create indexes on the materialized view
create index if not exists idx_resume_listings_user_id on public.resume_listings(user_id);
create index if not exists idx_resume_listings_updated_at on public.resume_listings(updated_at desc);
create unique index if not exists idx_resume_listings_id on public.resume_listings(id);

-- Function to refresh the materialized view
create or replace function public.refresh_resume_listings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  refresh materialized view concurrently public.resume_listings;
  return null;
end;
$$;

comment on function public.refresh_resume_listings() is 'Refreshes the resume_listings materialized view';

-- Create triggers to maintain the view
create trigger refresh_resume_listings_resumes
after insert or update or delete on public.resumes
for each statement execute function public.refresh_resume_listings();

create trigger refresh_resume_listings_personal_info
after insert or update or delete on public.personal_info
for each statement execute function public.refresh_resume_listings();

-- Row level security for the materialized view
alter materialized view public.resume_listings enable row level security;

-- Policies for the materialized view
create policy "Users can view their own resume listings"
  on public.resume_listings
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Anon users cannot view resume listings"
  on public.resume_listings
  for select
  to anon
  using (false);

-- Skill statistics materialized view
create materialized view if not exists public.skill_statistics as
select
  s.name,
  s.level,
  count(*) as usage_count,
  string_agg(distinct r.target_job_title, ', ' order by r.target_job_title) as job_titles
from public.skills s
join public.resumes r on s.resume_id = r.id
group by s.name, s.level
having count(*) > 1;

comment on materialized view public.skill_statistics is 'Statistics about skill usage across resumes for better suggestions';

-- Create indexes on the skill statistics view
create index if not exists idx_skill_statistics_name on public.skill_statistics(name);
create index if not exists idx_skill_statistics_usage_count on public.skill_statistics(usage_count desc);

-- Function to refresh the skill statistics view
create or replace function public.refresh_skill_statistics()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  refresh materialized view public.skill_statistics;
  return null;
end;
$$;

comment on function public.refresh_skill_statistics() is 'Refreshes the skill_statistics materialized view';

-- Create trigger to maintain the skill statistics view
create trigger refresh_skill_statistics
after insert or update or delete on public.skills
for each statement execute function public.refresh_skill_statistics();

-- Set up scheduled refreshes for materialized views
create or replace procedure public.refresh_materialized_views()
language plpgsql
security definer
set search_path = ''
as $$
begin
  refresh materialized view concurrently public.resume_listings;
  refresh materialized view public.skill_statistics;
end;
$$;

comment on procedure public.refresh_materialized_views() is 'Refreshes all materialized views, typically called by a scheduled job';