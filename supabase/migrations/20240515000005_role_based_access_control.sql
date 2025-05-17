-- Migration: 20240515000005_role_based_access_control.sql
-- Description: Implements role-based access control (RBAC) system
-- Created by: Victry Database Team
-- Created at: 2024-05-15
-- 
-- This migration sets up a complete RBAC system with:
-- - Role management (admin, premium, basic)
-- - Permission management
-- - Role-permission associations
-- - User-role associations
-- - Helper functions for role and permission checks
-- - JWT claim enhancements for role information
-- - Table-specific RLS policies based on roles

-- Create auth schema for role and permission management
CREATE SCHEMA IF NOT EXISTS auth_rbac;

-- Role-related tables
CREATE TABLE IF NOT EXISTS auth_rbac.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Permission-related tables
CREATE TABLE IF NOT EXISTS auth_rbac.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(resource, action)
);

-- Role-permission associations
CREATE TABLE IF NOT EXISTS auth_rbac.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES auth_rbac.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES auth_rbac.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- User-role associations
CREATE TABLE IF NOT EXISTS auth_rbac.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role_id UUID NOT NULL REFERENCES auth_rbac.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON auth_rbac.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON auth_rbac.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON auth_rbac.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON auth_rbac.user_roles(role_id);

-- Enable RLS on RBAC tables
ALTER TABLE auth_rbac.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_rbac.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_rbac.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_rbac.user_roles ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO auth_rbac.roles (name, description)
VALUES 
  ('admin', 'Administrative users with full system access'),
  ('premium', 'Premium users with access to all premium features'),
  ('basic', 'Basic users with limited feature access')
ON CONFLICT (name) DO NOTHING;

-- Create helper functions in private schema for role and permission checks

-- Function to check if current user has a specific role
CREATE OR REPLACE FUNCTION private.has_role(role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the user ID from the JWT
  user_id := auth.uid();
  
  -- If no user is authenticated, return false
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if the user has the specified role
  RETURN EXISTS (
    SELECT 1 
    FROM auth_rbac.user_roles ur
    JOIN auth_rbac.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_id 
    AND r.name = role_name
  );
END;
$$;

-- Specific helper functions for common role checks
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN private.has_role('admin');
END;
$$;

CREATE OR REPLACE FUNCTION private.is_premium()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN private.has_role('admin') OR private.has_role('premium');
END;
$$;

-- Function to check if current user has a specific permission
CREATE OR REPLACE FUNCTION private.has_permission(resource TEXT, action TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the user ID from the JWT
  user_id := auth.uid();
  
  -- If no user is authenticated, return false
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if the user has the specified permission through any of their roles
  RETURN EXISTS (
    SELECT 1 
    FROM auth_rbac.user_roles ur
    JOIN auth_rbac.role_permissions rp ON ur.role_id = rp.role_id
    JOIN auth_rbac.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_id 
    AND p.resource = resource
    AND p.action = action
  );
END;
$$;

-- Create function for assigning role to a user
CREATE OR REPLACE FUNCTION auth_rbac.assign_role(
  p_user_id UUID,
  p_role_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  role_id UUID;
BEGIN
  -- Get the role ID
  SELECT id INTO role_id FROM auth_rbac.roles WHERE name = p_role_name;
  
  IF role_id IS NULL THEN
    RAISE EXCEPTION 'Role % does not exist', p_role_name;
  END IF;
  
  -- Assign the role to the user
  INSERT INTO auth_rbac.user_roles (user_id, role_id)
  VALUES (p_user_id, role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$;

-- Create trigger function to automatically assign basic role to new users
CREATE OR REPLACE FUNCTION auth_rbac.on_auth_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Assign the 'basic' role to the new user
  PERFORM auth_rbac.assign_role(NEW.id, 'basic');
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users to assign basic role to new users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION auth_rbac.on_auth_user_created();

-- Create JWT function to include roles in the JWT claims
CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _role TEXT;
  result JSONB;
  _roles TEXT[] := ARRAY[]::TEXT[];
  _permissions JSONB := '{}'::JSONB;
BEGIN
  -- Get the base JWT claims
  result := get_raw_jwt();
  
  -- Add the user's roles to the JWT
  SELECT ARRAY_AGG(r.name)
  INTO _roles
  FROM auth_rbac.user_roles ur
  JOIN auth_rbac.roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid();
  
  -- Add roles to the JWT
  result := jsonb_set(result, '{roles}', to_jsonb(_roles));
  
  -- Return the enhanced JWT
  RETURN result;
END;
$$;

-- Default permissions
INSERT INTO auth_rbac.permissions (name, resource, action, description)
VALUES
  -- Resume permissions
  ('view_own_resumes', 'resumes', 'read_own', 'View user''s own resumes'),
  ('create_own_resumes', 'resumes', 'create', 'Create new resumes'),
  ('update_own_resumes', 'resumes', 'update_own', 'Update user''s own resumes'),
  ('delete_own_resumes', 'resumes', 'delete_own', 'Delete user''s own resumes'),
  
  -- Premium features
  ('use_ai_tailoring', 'ai', 'tailoring', 'Use AI to tailor resumes'),
  ('use_advanced_templates', 'templates', 'use_premium', 'Use premium templates'),
  ('unlimited_resumes', 'resumes', 'unlimited', 'Create unlimited resumes'),
  ('export_to_all_formats', 'export', 'all_formats', 'Export to all available formats'),
  
  -- Admin permissions
  ('manage_users', 'users', 'manage', 'Manage user accounts'),
  ('view_analytics', 'analytics', 'view', 'View application analytics'),
  ('manage_templates', 'templates', 'manage', 'Manage resume templates'),
  ('system_config', 'system', 'configure', 'Configure system settings')
ON CONFLICT (resource, action) DO NOTHING;

-- Associate permissions with roles
DO $$
DECLARE
  admin_role_id UUID;
  premium_role_id UUID;
  basic_role_id UUID;
  current_permission_id UUID;
BEGIN
  -- Get role IDs
  SELECT id INTO admin_role_id FROM auth_rbac.roles WHERE name = 'admin';
  SELECT id INTO premium_role_id FROM auth_rbac.roles WHERE name = 'premium';
  SELECT id INTO basic_role_id FROM auth_rbac.roles WHERE name = 'basic';
  
  -- Basic permissions (for all users)
  FOR current_permission_id IN 
    SELECT id FROM auth_rbac.permissions 
    WHERE name IN ('view_own_resumes', 'create_own_resumes', 'update_own_resumes', 'delete_own_resumes')
  LOOP
    INSERT INTO auth_rbac.role_permissions (role_id, permission_id)
    VALUES 
      (basic_role_id, current_permission_id),
      (premium_role_id, current_permission_id),
      (admin_role_id, current_permission_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END LOOP;
  
  -- Premium permissions
  FOR current_permission_id IN 
    SELECT id FROM auth_rbac.permissions 
    WHERE name IN ('use_ai_tailoring', 'use_advanced_templates', 'unlimited_resumes', 'export_to_all_formats')
  LOOP
    INSERT INTO auth_rbac.role_permissions (role_id, permission_id)
    VALUES 
      (premium_role_id, current_permission_id),
      (admin_role_id, current_permission_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END LOOP;
  
  -- Admin permissions
  FOR current_permission_id IN 
    SELECT id FROM auth_rbac.permissions 
    WHERE name IN ('manage_users', 'view_analytics', 'manage_templates', 'system_config')
  LOOP
    INSERT INTO auth_rbac.role_permissions (role_id, permission_id)
    VALUES (admin_role_id, current_permission_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END LOOP;
END $$;

-- Update RLS policies to include role-based checks

-- Premium feature tables (example: templates)
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  html_structure JSONB NOT NULL,
  css_styles TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- All users can view basic templates
CREATE POLICY "Users can view basic templates" 
  ON public.templates FOR SELECT 
  TO authenticated
  USING (NOT is_premium OR private.is_premium());

-- Only premium users can use premium templates
CREATE POLICY "Only premium users can use premium templates" 
  ON public.templates FOR SELECT 
  TO authenticated
  USING (NOT is_premium OR private.is_premium());

-- Only admins can modify templates
CREATE POLICY "Only admins can create templates" 
  ON public.templates FOR INSERT 
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "Only admins can update templates" 
  ON public.templates FOR UPDATE 
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "Only admins can delete templates" 
  ON public.templates FOR DELETE 
  TO authenticated
  USING (private.is_admin());

-- Modify resume policies to include role-based limits
-- Basic users have limits on number of resumes they can create
-- Premium users have unlimited resumes

-- Create a function to check if a basic user is within their resume limit
CREATE OR REPLACE FUNCTION private.check_resume_limit()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_id UUID;
  resume_count INTEGER;
  max_resumes INTEGER := 3; -- Basic users can create up to 3 resumes
BEGIN
  -- Get the user ID from the JWT
  user_id := auth.uid();
  
  -- If no user is authenticated, return false
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- If user is premium or admin, they have unlimited resumes
  IF private.is_premium() THEN
    RETURN true;
  END IF;
  
  -- Check if the basic user is within their resume limit
  SELECT COUNT(*) INTO resume_count
  FROM public.resumes
  WHERE user_id = auth.uid();
  
  RETURN resume_count < max_resumes;
END;
$$;

-- Enable RLS on the resumes table
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Add policies to resumes table if not already present
DROP POLICY IF EXISTS "Users can create their own resumes" ON public.resumes;

-- Then create the policy with limits
CREATE POLICY "Users can create their own resumes with limits" 
  ON public.resumes FOR INSERT 
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() 
    AND private.check_resume_limit()
  );

-- Add rate limiting for AI features
CREATE TABLE IF NOT EXISTS public.ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature TEXT NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_tracking_user_id_feature_used_at
  ON public.ai_usage_tracking(user_id, feature, used_at);

ALTER TABLE public.ai_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage tracking
CREATE POLICY "Users can view their own AI usage tracking" 
  ON public.ai_usage_tracking FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

-- Create a function to check if a user is within their AI usage limit
CREATE OR REPLACE FUNCTION private.check_ai_usage_limit(feature TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_id UUID;
  usage_count INTEGER;
  max_usage INTEGER;
  time_window INTERVAL;
BEGIN
  -- Get the user ID from the JWT
  user_id := auth.uid();
  
  -- If no user is authenticated, return false
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- If user is premium or admin, they have unlimited usage
  IF private.is_premium() THEN
    RETURN true;
  END IF;
  
  -- Set limits based on feature
  -- These values would be configured based on business requirements
  IF feature = 'tailoring' THEN
    max_usage := 5; -- Basic users can use tailoring 5 times per month
    time_window := INTERVAL '30 days';
  ELSIF feature = 'analysis' THEN
    max_usage := 10; -- Basic users can use analysis 10 times per month
    time_window := INTERVAL '30 days';
  ELSE
    max_usage := 3; -- Default limit for other AI features
    time_window := INTERVAL '30 days';
  END IF;
  
  -- Check if the basic user is within their usage limit for the time window
  SELECT COUNT(*) INTO usage_count
  FROM public.ai_usage_tracking
  WHERE user_id = auth.uid()
  AND feature = check_ai_usage_limit.feature
  AND used_at > (NOW() - time_window);
  
  RETURN usage_count < max_usage;
END;
$$;

-- Function to record AI feature usage
CREATE OR REPLACE FUNCTION public.record_ai_feature_usage(feature TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.ai_usage_tracking (user_id, feature)
  VALUES (auth.uid(), feature);
END;
$$;