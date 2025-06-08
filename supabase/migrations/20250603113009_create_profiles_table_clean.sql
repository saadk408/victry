-- Create profiles table - Phase 2 of database schema alignment
-- This migration adds the missing profiles table that is critical for OAuth

-- Create the profiles table
create table "public"."profiles" (
    "id" uuid not null,
    "first_name" text,
    "last_name" text,
    "avatar_url" text,
    "subscription_tier" text not null default 'free'::text,
    "subscription_expires_at" timestamp with time zone,
    "resume_count" integer default 0,
    "job_description_count" integer default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);

-- Enable RLS
alter table "public"."profiles" enable row level security;

-- Fix the custom_sections column name (from reserved keyword "order" to "display_order")
alter table "public"."custom_sections" drop column if exists "section_order";
alter table "public"."custom_sections" add column if not exists "display_order" integer;

-- Create indexes for profiles table
CREATE INDEX if not exists idx_profiles_created_at ON public.profiles USING btree (created_at DESC);
CREATE INDEX if not exists idx_profiles_subscription_tier ON public.profiles USING btree (subscription_tier);
CREATE INDEX if not exists idx_profiles_updated_at ON public.profiles USING btree (updated_at DESC);

-- Create primary key and foreign key constraints
CREATE UNIQUE INDEX if not exists profiles_pkey ON public.profiles USING btree (id);
alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";
alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;
alter table "public"."profiles" validate constraint "profiles_id_fkey";

-- Add validation constraints
alter table "public"."profiles" add constraint "valid_creation_date" CHECK ((created_at <= CURRENT_TIMESTAMP)) not valid;
alter table "public"."profiles" validate constraint "valid_creation_date";

alter table "public"."profiles" add constraint "valid_names" CHECK ((((first_name IS NULL) AND (last_name IS NULL)) OR (char_length(TRIM(BOTH FROM (COALESCE(first_name, ''::text) || COALESCE(last_name, ''::text)))) > 0))) not valid;
alter table "public"."profiles" validate constraint "valid_names";

alter table "public"."profiles" add constraint "valid_subscription_tier" CHECK ((subscription_tier = ANY (ARRAY['free'::text, 'premium'::text, 'enterprise'::text]))) not valid;
alter table "public"."profiles" validate constraint "valid_subscription_tier";

alter table "public"."profiles" add constraint "valid_update_date" CHECK ((updated_at <= CURRENT_TIMESTAMP)) not valid;
alter table "public"."profiles" validate constraint "valid_update_date";

-- Grant permissions
grant delete on table "public"."profiles" to "anon";
grant insert on table "public"."profiles" to "anon";
grant references on table "public"."profiles" to "anon";
grant select on table "public"."profiles" to "anon";
grant trigger on table "public"."profiles" to "anon";
grant truncate on table "public"."profiles" to "anon";
grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";
grant insert on table "public"."profiles" to "authenticated";
grant references on table "public"."profiles" to "authenticated";
grant select on table "public"."profiles" to "authenticated";
grant trigger on table "public"."profiles" to "authenticated";
grant truncate on table "public"."profiles" to "authenticated";
grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";
grant insert on table "public"."profiles" to "service_role";
grant references on table "public"."profiles" to "service_role";
grant select on table "public"."profiles" to "service_role";
grant trigger on table "public"."profiles" to "service_role";
grant truncate on table "public"."profiles" to "service_role";
grant update on table "public"."profiles" to "service_role";

-- Create RLS policies for profiles table
-- Anon users are denied all access
create policy "Anon users cannot create profiles"
on "public"."profiles"
as permissive
for insert
to anon
with check (false);

create policy "Anon users cannot delete profiles"
on "public"."profiles"
as permissive
for delete
to anon
using (false);

create policy "Anon users cannot update profiles"
on "public"."profiles"
as permissive
for update
to anon
using (false);

create policy "Anon users cannot view profiles"
on "public"."profiles"
as permissive
for select
to anon
using (false);

-- Authenticated users can only access their own profile
create policy "Users can create their own profile"
on "public"."profiles"
as permissive
for insert
to authenticated
with check ((id = ( SELECT auth.uid() AS uid)));

create policy "Users can delete their own profile"
on "public"."profiles"
as permissive
for delete
to authenticated
using ((id = ( SELECT auth.uid() AS uid)));

create policy "Users can update their own profile"
on "public"."profiles"
as permissive
for update
to authenticated
using ((id = ( SELECT auth.uid() AS uid)));

create policy "Users can view their own profile"
on "public"."profiles"
as permissive
for select
to authenticated
using ((id = ( SELECT auth.uid() AS uid)));