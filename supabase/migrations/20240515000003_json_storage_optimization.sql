-- Migration: 20240515000003_json_storage_optimization.sql
-- Description: Optimizes JSON storage using JSONB type
-- Created by: Victry Database Team
-- Created at: 2024-05-15
-- 
-- Affected tables:
-- - public.resumes (converted format_options and metadata to JSONB)
--
-- Functions added:
-- - public.get_resume_font_settings
-- - public.get_resume_colors

-- convert format_options column to jsonb with schema validation
-- create temporary column, copy data, then switch columns
alter table public.resumes add column format_options_jsonb jsonb;

-- convert existing data to jsonb format
update public.resumes set format_options_jsonb = format_options::jsonb where format_options is not null;

-- drop original column and rename the jsonb version
-- note: this is a destructive operation that drops the original column
alter table public.resumes drop column format_options;
alter table public.resumes rename column format_options_jsonb to format_options;

-- add jsonb index for efficient json queries (gin index allows searching within json)
create index idx_resumes_format_options on public.resumes using gin(format_options);

-- convert metadata to jsonb (if not already)
-- follow same pattern: create temp column, copy data, switch columns
alter table public.resumes add column metadata_jsonb jsonb;
update public.resumes set metadata_jsonb = metadata::jsonb where metadata is not null;
alter table public.resumes drop column metadata;
alter table public.resumes rename column metadata_jsonb to metadata;

-- add jsonb index for metadata
create index idx_resumes_metadata on public.resumes using gin(metadata);

-- function to extract specific jsonb paths efficiently
-- uses security invoker model with search_path protection
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

-- function to extract primary color from format_options
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

-- add json schema validation if pg_jsonschema extension is available
do $$
begin
  if exists (
    select 1 from pg_extension where extname = 'pg_jsonschema'
  ) then
    execute $sql$
      alter table public.resumes add constraint format_options_schema check (
        json_matches_schema(
          '{
            "type": "object",
            "properties": {
              "fontFamily": { "type": "string" },
              "fontSize": { "type": "number" },
              "primaryColor": { "type": "string" },
              "secondaryColor": { "type": "string" },
              "sectionOrder": { 
                "type": "array",
                "items": { "type": "string" }
              },
              "margins": {
                "type": "object",
                "properties": {
                  "top": { "type": "number" },
                  "right": { "type": "number" },
                  "bottom": { "type": "number" },
                  "left": { "type": "number" }
                }
              }
            }
          }',
          format_options
        )
      );
    $sql$;
  end if;
end
$$;