-- Migration: Add automatic profile creation trigger
-- Purpose: Fix profile creation error by automating profile creation on user signup
-- Affected Tables: public.profiles (insert operations via trigger)
-- Dependencies: auth.users table must exist with raw_user_meta_data column
-- Special Considerations: Uses SECURITY DEFINER to bypass RLS during profile creation
-- Reference: https://supabase.com/docs/guides/auth/managing-user-data
-- Created: 2025-06-09

-- Create function with enhanced metadata handling for multiple auth providers
-- This function automatically creates a profile entry when a new user signs up
-- through any authentication method (email, Google OAuth, LinkedIn OAuth)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Insert new profile record using user metadata from various auth providers
  insert into public.profiles (
    id, 
    first_name, 
    last_name, 
    subscription_tier, 
    created_at, 
    updated_at
  )
  values (
    new.id,
    -- Handle OAuth providers (Google: given_name, LinkedIn: first_name)
    -- and manual signup (first_name) with graceful fallback
    coalesce(
      new.raw_user_meta_data ->> 'given_name',  -- google oauth standard
      new.raw_user_meta_data ->> 'first_name'   -- manual signup & linkedin
    ),
    -- Handle OAuth providers (Google: family_name, LinkedIn: last_name)  
    -- and manual signup (last_name) with graceful fallback
    coalesce(
      new.raw_user_meta_data ->> 'family_name', -- google oauth standard
      new.raw_user_meta_data ->> 'last_name'    -- manual signup & linkedin
    ),
    'free',                                      -- default subscription tier
    now(),                                       -- creation timestamp
    now()                                        -- update timestamp
  );
  return new;
end;
$$;

-- Create trigger to execute function on new user creation
-- This trigger fires after each new user insertion in auth.users table
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- CRITICAL: Grant required permissions to supabase_auth_admin role
-- Without these permissions, the trigger will fail silently during user signup
-- The supabase_auth_admin role is used by Supabase's authentication system
grant execute on function public.handle_new_user to supabase_auth_admin;
grant usage on schema public to supabase_auth_admin;
grant insert on table public.profiles to supabase_auth_admin;

-- Add descriptive comment for future maintenance and debugging
comment on function public.handle_new_user() is 
  'Automatically creates user profile when new user signs up through any auth method. Handles metadata from OAuth providers and manual signup forms. Uses SECURITY DEFINER to bypass RLS policies during profile creation.';