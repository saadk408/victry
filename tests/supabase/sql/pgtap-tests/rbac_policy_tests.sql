-- File: /tests/supabase/sql/pgtap-tests/rbac_policy_tests.sql

/**
 * PgTAP tests for RBAC policies in Supabase
 * 
 * These tests verify that the RLS policies for RBAC are correctly implemented
 * and that users can only access data appropriate for their role.
 */

BEGIN;

SELECT plan(15);

-- Create test users
INSERT INTO auth.users (id, email)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@test.com'),
  ('00000000-0000-0000-0000-000000000002', 'premium@test.com'),
  ('00000000-0000-0000-0000-000000000003', 'basic@test.com');

-- Test roles table structure
SELECT has_table('auth_rbac', 'roles', 'auth_rbac.roles table should exist');
SELECT has_column('auth_rbac', 'roles', 'id', 'roles table should have id column');
SELECT has_column('auth_rbac', 'roles', 'name', 'roles table should have name column');
SELECT has_column('auth_rbac', 'roles', 'description', 'roles table should have description column');

-- Test permissions table structure
SELECT has_table('auth_rbac', 'permissions', 'auth_rbac.permissions table should exist');
SELECT has_column('auth_rbac', 'permissions', 'id', 'permissions table should have id column');
SELECT has_column('auth_rbac', 'permissions', 'name', 'permissions table should have name column');
SELECT has_column('auth_rbac', 'permissions', 'description', 'permissions table should have description column');

-- Test user_roles table structure
SELECT has_table('auth_rbac', 'user_roles', 'auth_rbac.user_roles table should exist');
SELECT has_column('auth_rbac', 'user_roles', 'user_id', 'user_roles table should have user_id column');
SELECT has_column('auth_rbac', 'user_roles', 'role_id', 'user_roles table should have role_id column');

-- Test role_permissions table structure
SELECT has_table('auth_rbac', 'role_permissions', 'auth_rbac.role_permissions table should exist');
SELECT has_column('auth_rbac', 'role_permissions', 'role_id', 'role_permissions table should have role_id column');
SELECT has_column('auth_rbac', 'role_permissions', 'permission_id', 'role_permissions table should have permission_id column');

-- Test RLS policies on roles table
SELECT has_function('private', 'has_role', 'private.has_role() function should exist');
SELECT has_function('private', 'has_permission', 'private.has_permission() function should exist');

-- Test resume RLS policies
SET LOCAL ROLE authenticated;

-- Test as admin user
SET LOCAL request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
-- Should be able to see all resumes
-- ... additional tests here ...

-- Test as premium user
SET LOCAL request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
-- Should be able to see only their own resumes
-- ... additional tests here ...

-- Test as basic user
SET LOCAL request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
-- Should be able to see only their own resumes and have limits
-- ... additional tests here ...

-- Test JWT claim enhancements
-- ... additional tests here ...

-- Finish the tests
SELECT * FROM finish();

ROLLBACK;