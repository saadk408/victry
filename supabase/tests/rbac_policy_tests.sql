-- Tests for RBAC policies
BEGIN;

-- Plan how many tests we'll run
SELECT plan(10);

-- Install pgTAP if not already available
CREATE EXTENSION IF NOT EXISTS pgtap;

-- Create test users
DO $$
DECLARE
  admin_id UUID := '00000000-0000-0000-0000-000000000001';
  premium_id UUID := '00000000-0000-0000-0000-000000000002';
  basic_id UUID := '00000000-0000-0000-0000-000000000003';
BEGIN
  -- Insert test users if they don't exist
  INSERT INTO auth.users (id, email)
  VALUES 
    (admin_id, 'test_admin@example.com'),
    (premium_id, 'test_premium@example.com'),
    (basic_id, 'test_basic@example.com')
  ON CONFLICT (id) DO NOTHING;
  
  -- Assign roles
  INSERT INTO auth_rbac.roles (name, description)
  VALUES 
    ('admin', 'Administrator role'),
    ('premium', 'Premium user role'),
    ('basic', 'Basic user role')
  ON CONFLICT (name) DO NOTHING;
  
  -- Get role IDs
  WITH roles AS (
    SELECT id, name FROM auth_rbac.roles
  )
  -- Link users to roles
  INSERT INTO auth_rbac.user_roles (user_id, role_id)
  SELECT 
    users.id, 
    roles.id
  FROM 
    (VALUES 
      (admin_id, 'admin'),
      (premium_id, 'premium'),
      (basic_id, 'basic')
    ) AS users(id, role_name)
  JOIN roles ON roles.name = users.role_name
  ON CONFLICT (user_id, role_id) DO NOTHING;
END; $$;

-- 1. Test that RLS is enabled on all tables in the public schema
SELECT has_rls('public', 'resumes', 'RLS is enabled on resumes table');
SELECT has_rls('public', 'job_descriptions', 'RLS is enabled on job_descriptions table');

-- 2. Test permission functions
-- First set role to a test admin user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';

-- Test admin permissions
SELECT is(
  (SELECT private.is_admin()),
  TRUE,
  'Admin user is correctly identified by is_admin() function'
);

-- Test premium permissions
SELECT is(
  (SELECT private.is_premium()),
  TRUE,
  'Admin user is correctly identified as premium by is_premium() function'
);

-- Change to premium user
SET LOCAL request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

-- Test admin permissions with premium user
SELECT is(
  (SELECT private.is_admin()),
  FALSE,
  'Premium user is correctly identified as not admin by is_admin() function'
);

-- Test premium permissions with premium user
SELECT is(
  (SELECT private.is_premium()),
  TRUE,
  'Premium user is correctly identified as premium by is_premium() function'
);

-- 3. Insert test data
-- Create a resume as the premium user
INSERT INTO public.resumes (title, template_id, user_id)
VALUES ('Premium User Resume', 'modern', '00000000-0000-0000-0000-000000000002');

-- Create a job description as the premium user
INSERT INTO public.job_descriptions (title, company, content, user_id)
VALUES ('Premium Job', 'Test Company', 'Test content', '00000000-0000-0000-0000-000000000002');

-- 4. Test role-based data access
-- Change to basic user
SET LOCAL request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';

-- Basic user should not see premium user's resume
SELECT is(
  (SELECT COUNT(*) FROM public.resumes WHERE user_id = '00000000-0000-0000-0000-000000000002'),
  0::bigint,
  'Basic user cannot see premium user resumes'
);

-- Basic user should not see premium user's job description
SELECT is(
  (SELECT COUNT(*) FROM public.job_descriptions WHERE user_id = '00000000-0000-0000-0000-000000000002'),
  0::bigint,
  'Basic user cannot see premium user job descriptions'
);

-- 5. Test update permissions
-- Try to update premium user's resume as basic user
UPDATE public.resumes 
SET title = 'Hacked Title' 
WHERE user_id = '00000000-0000-0000-0000-000000000002';

-- Verify the update failed
SET LOCAL request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

SELECT is(
  (SELECT title FROM public.resumes WHERE user_id = '00000000-0000-0000-0000-000000000002' LIMIT 1),
  'Premium User Resume',
  'Basic user cannot update premium user resumes'
);

-- 6. Test resume limit for basic user
SET LOCAL request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';

-- Insert 3 resumes (maximum for basic users)
INSERT INTO public.resumes (title, template_id, user_id)
VALUES 
  ('Basic Resume 1', 'basic', '00000000-0000-0000-0000-000000000003'),
  ('Basic Resume 2', 'basic', '00000000-0000-0000-0000-000000000003'),
  ('Basic Resume 3', 'basic', '00000000-0000-0000-0000-000000000003');

-- Count resumes and verify we have 3
SELECT is(
  (SELECT COUNT(*) FROM public.resumes WHERE user_id = '00000000-0000-0000-0000-000000000003'),
  3::bigint,
  'Basic user can create up to 3 resumes'
);

-- Finish tests and clean up
SELECT * FROM finish();
ROLLBACK;
EOL < /dev/null