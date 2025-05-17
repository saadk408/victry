// File: /tests/supabase/seed-test-data.ts

/**
 * Seed the test database with test data
 * This file contains functions to populate the test database with test users,
 * resumes, job descriptions, and other data needed for testing
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { testConfig } from './test-environment';
import { Database } from '../../types/supabase';

// Adding the schema tables typing
type SchemaTable = keyof Database['public']['Tables'] | 'auth_rbac.roles' | 'auth_rbac.permissions' | 'auth_rbac.role_permissions' | 'auth_rbac.user_roles' | 'pg_proc';

// Extended Supabase client type
type TestSupabaseClient = SupabaseClient<Database> & {
  from(table: SchemaTable): any;
};

/**
 * Main function to seed test data
 * This runs all the seeding functions in sequence
 */
export async function seedTestData(supabase: TestSupabaseClient) {
  try {
    // Seed data in correct order to maintain referential integrity
    await seedTestUsers(supabase);
    await seedTestRoles(supabase);
    await seedTestPermissions(supabase);
    await seedTestUserRoles(supabase);
    await seedTestResumes(supabase);
    await seedTestJobDescriptions(supabase);
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
}

/**
 * Create test users with Supabase Auth
 */
async function seedTestUsers(supabase: TestSupabaseClient) {
  console.log('Creating test users...');
  
  for (const userType of Object.keys(testConfig.testUsers)) {
    const { email, password, id, role } = testConfig.testUsers[userType as keyof typeof testConfig.testUsers];
    
    console.log(`Creating ${userType} user: ${email}`);
    
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role },
      id
    });
    
    if (error) {
      // Ignore if user already exists
      if (error.message.includes('already exists')) {
        console.log(`User ${email} already exists, skipping`);
      } else {
        console.error(`Error creating ${userType} user:`, error);
        throw error;
      }
    }
  }
  
  console.log('Test users created successfully!');
}

/**
 * Seed roles in the auth_rbac.roles table
 */
async function seedTestRoles(supabase: TestSupabaseClient) {
  console.log('Creating test roles...');
  
  const roles = [
    { name: 'admin', description: 'Administrator with full system access' },
    { name: 'premium', description: 'Premium user with enhanced features' },
    { name: 'basic', description: 'Basic user with limited features' },
  ];
  
  const { error } = await supabase
    .from('auth_rbac.roles')
    .upsert(roles, { onConflict: 'name' });
  
  if (error) {
    console.error('Error creating roles:', error);
    throw error;
  }
  
  console.log('Test roles created successfully!');
}

/**
 * Seed permissions in the auth_rbac.permissions table
 */
async function seedTestPermissions(supabase: TestSupabaseClient) {
  console.log('Creating test permissions...');
  
  const permissions = [
    // Admin permissions
    { name: 'users:read', description: 'Read user data' },
    { name: 'users:write', description: 'Modify user data' },
    { name: 'analytics:read', description: 'View analytics data' },
    { name: 'system:settings', description: 'Modify system settings' },
    
    // Resume permissions
    { name: 'resumes:create', description: 'Create resumes' },
    { name: 'resumes:read', description: 'Read resumes' },
    { name: 'resumes:update', description: 'Update resumes' },
    { name: 'resumes:delete', description: 'Delete resumes' },
    { name: 'resumes:tailor', description: 'Tailor resumes to job descriptions' },
    
    // Job description permissions
    { name: 'job_descriptions:create', description: 'Create job descriptions' },
    { name: 'job_descriptions:read', description: 'Read job descriptions' },
    { name: 'job_descriptions:update', description: 'Update job descriptions' },
    { name: 'job_descriptions:delete', description: 'Delete job descriptions' },
    { name: 'job_descriptions:analyze', description: 'Analyze job descriptions with AI' },
    
    // Premium features
    { name: 'templates:premium', description: 'Access premium templates' },
    { name: 'ai:unlimited', description: 'Unlimited AI operations' },
    { name: 'export:premium', description: 'Premium export options' },
  ];
  
  const { error } = await supabase
    .from('auth_rbac.permissions')
    .upsert(permissions, { onConflict: 'name' });
  
  if (error) {
    console.error('Error creating permissions:', error);
    throw error;
  }
  
  console.log('Test permissions created successfully!');
  
  // Now assign permissions to roles
  await seedRolePermissions(supabase);
}

/**
 * Assign permissions to roles in the auth_rbac.role_permissions table
 */
async function seedRolePermissions(supabase: TestSupabaseClient) {
  console.log('Assigning permissions to roles...');
  
  // Get role IDs
  const { data: roles, error: rolesError } = await supabase
    .from('auth_rbac.roles')
    .select('id, name');
  
  if (rolesError || !roles) {
    console.error('Error fetching roles:', rolesError);
    throw rolesError;
  }
  
  // Get permission IDs
  const { data: permissions, error: permissionsError } = await supabase
    .from('auth_rbac.permissions')
    .select('id, name');
  
  if (permissionsError || !permissions) {
    console.error('Error fetching permissions:', permissionsError);
    throw permissionsError;
  }
  
  // Create role-permission mappings
  const roleMap = Object.fromEntries(roles.map(role => [role.name, role.id]));
  const permissionMap = Object.fromEntries(permissions.map(perm => [perm.name, perm.id]));
  
  // Define role permissions
  const adminPermissions = permissions.map(perm => ({
    role_id: roleMap['admin'],
    permission_id: perm.id
  }));
  
  const premiumPermissions = [
    // Resume permissions
    { role_id: roleMap['premium'], permission_id: permissionMap['resumes:create'] },
    { role_id: roleMap['premium'], permission_id: permissionMap['resumes:read'] },
    { role_id: roleMap['premium'], permission_id: permissionMap['resumes:update'] },
    { role_id: roleMap['premium'], permission_id: permissionMap['resumes:delete'] },
    { role_id: roleMap['premium'], permission_id: permissionMap['resumes:tailor'] },
    
    // Job description permissions
    { role_id: roleMap['premium'], permission_id: permissionMap['job_descriptions:create'] },
    { role_id: roleMap['premium'], permission_id: permissionMap['job_descriptions:read'] },
    { role_id: roleMap['premium'], permission_id: permissionMap['job_descriptions:update'] },
    { role_id: roleMap['premium'], permission_id: permissionMap['job_descriptions:delete'] },
    { role_id: roleMap['premium'], permission_id: permissionMap['job_descriptions:analyze'] },
    
    // Premium features
    { role_id: roleMap['premium'], permission_id: permissionMap['templates:premium'] },
    { role_id: roleMap['premium'], permission_id: permissionMap['ai:unlimited'] },
    { role_id: roleMap['premium'], permission_id: permissionMap['export:premium'] },
  ];
  
  const basicPermissions = [
    // Resume permissions (limited)
    { role_id: roleMap['basic'], permission_id: permissionMap['resumes:create'] },
    { role_id: roleMap['basic'], permission_id: permissionMap['resumes:read'] },
    { role_id: roleMap['basic'], permission_id: permissionMap['resumes:update'] },
    { role_id: roleMap['basic'], permission_id: permissionMap['resumes:delete'] },
    
    // Job description permissions (limited)
    { role_id: roleMap['basic'], permission_id: permissionMap['job_descriptions:create'] },
    { role_id: roleMap['basic'], permission_id: permissionMap['job_descriptions:read'] },
    { role_id: roleMap['basic'], permission_id: permissionMap['job_descriptions:update'] },
    { role_id: roleMap['basic'], permission_id: permissionMap['job_descriptions:delete'] },
  ];
  
  // Insert role permissions
  const allRolePermissions = [...adminPermissions, ...premiumPermissions, ...basicPermissions];
  
  const { error } = await supabase
    .from('auth_rbac.role_permissions')
    .upsert(allRolePermissions, { onConflict: 'role_id,permission_id' });
  
  if (error) {
    console.error('Error assigning permissions to roles:', error);
    throw error;
  }
  
  console.log('Permissions assigned to roles successfully!');
}

/**
 * Assign roles to users in the auth_rbac.user_roles table
 */
async function seedTestUserRoles(supabase: TestSupabaseClient) {
  console.log('Assigning roles to users...');
  
  // Get role IDs
  const { data: roles, error: rolesError } = await supabase
    .from('auth_rbac.roles')
    .select('id, name');
  
  if (rolesError || !roles) {
    console.error('Error fetching roles:', rolesError);
    throw rolesError;
  }
  
  const roleMap = Object.fromEntries(roles.map(role => [role.name, role.id]));
  
  // Create user-role mappings
  const userRoles = [
    { user_id: testConfig.testUsers.admin.id, role_id: roleMap['admin'] },
    { user_id: testConfig.testUsers.premium.id, role_id: roleMap['premium'] },
    { user_id: testConfig.testUsers.basic.id, role_id: roleMap['basic'] },
  ];
  
  const { error } = await supabase
    .from('auth_rbac.user_roles')
    .upsert(userRoles, { onConflict: 'user_id,role_id' });
  
  if (error) {
    console.error('Error assigning roles to users:', error);
    throw error;
  }
  
  console.log('Roles assigned to users successfully!');
}

/**
 * Seed test resumes for each user
 */
async function seedTestResumes(supabase: TestSupabaseClient) {
  console.log('Creating test resumes...');
  
  // Create a few sample resumes for each user
  const adminResumes = [
    {
      user_id: testConfig.testUsers.admin.id,
      title: 'Admin Resume 1',
      target_job_title: 'Senior Administrator',
      template_id: 'professional',
      personal_info: {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@test.com',
        phone: '555-123-4567',
        location: 'San Francisco, CA'
      },
      professional_summary: {
        content: 'Experienced administrator with 10+ years of expertise in system management and team leadership.'
      },
      is_base_resume: true,
      ats_score: 85
    }
  ];
  
  const premiumResumes = [
    {
      user_id: testConfig.testUsers.premium.id,
      title: 'Premium Resume 1',
      target_job_title: 'Senior Developer',
      template_id: 'modern',
      personal_info: {
        first_name: 'Premium',
        last_name: 'User',
        email: 'premium@test.com',
        phone: '555-987-6543',
        location: 'New York, NY'
      },
      professional_summary: {
        content: 'Full-stack developer with 8+ years of experience building web and mobile applications.'
      },
      is_base_resume: true,
      ats_score: 90
    },
    {
      user_id: testConfig.testUsers.premium.id,
      title: 'Premium Resume 2',
      target_job_title: 'Product Manager',
      template_id: 'professional',
      personal_info: {
        first_name: 'Premium',
        last_name: 'User',
        email: 'premium@test.com',
        phone: '555-987-6543',
        location: 'New York, NY'
      },
      professional_summary: {
        content: 'Product manager with experience leading cross-functional teams and delivering user-centered products.'
      },
      is_base_resume: false,
      original_resume_id: null, // Will be updated after insertion
      ats_score: 78
    }
  ];
  
  const basicResumes = [
    {
      user_id: testConfig.testUsers.basic.id,
      title: 'Basic Resume 1',
      target_job_title: 'Junior Developer',
      template_id: 'simple',
      personal_info: {
        first_name: 'Basic',
        last_name: 'User',
        email: 'basic@test.com',
        phone: '555-555-5555',
        location: 'Austin, TX'
      },
      professional_summary: {
        content: 'Entry-level developer with a passion for learning and building web applications.'
      },
      is_base_resume: true,
      ats_score: 65
    }
  ];
  
  // Insert all resumes
  const allResumes = [...adminResumes, ...premiumResumes, ...basicResumes];
  
  const { data, error } = await supabase
    .from('resumes')
    .insert(allResumes)
    .select();
  
  if (error) {
    console.error('Error creating test resumes:', error);
    throw error;
  }
  
  // Update the original_resume_id for Premium Resume 2
  if (data && data.length >= 3) {
    const premiumResume1Id = data[1].id; // Second resume in our array
    
    const { error: updateError } = await supabase
      .from('resumes')
      .update({ original_resume_id: premiumResume1Id })
      .eq('title', 'Premium Resume 2');
    
    if (updateError) {
      console.error('Error updating original_resume_id:', updateError);
      throw updateError;
    }
  }
  
  console.log('Test resumes created successfully!');
}

/**
 * Seed test job descriptions
 */
async function seedTestJobDescriptions(supabase: TestSupabaseClient) {
  console.log('Creating test job descriptions...');
  
  const jobDescriptions = [
    {
      user_id: testConfig.testUsers.admin.id,
      title: 'Senior Administrator',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      job_type: 'Full-time',
      content: 'TechCorp is seeking an experienced Senior Administrator to oversee our IT systems and infrastructure. The ideal candidate will have 5+ years of experience in system administration, strong knowledge of security protocols, and excellent communication skills.',
      keywords: ['administration', 'IT', 'security', 'leadership']
    },
    {
      user_id: testConfig.testUsers.premium.id,
      title: 'Senior Software Developer',
      company: 'InnovateTech',
      location: 'New York, NY',
      job_type: 'Full-time',
      content: 'We are looking for a Senior Software Developer to join our team and help build innovative web applications. The ideal candidate will have experience with React, Node.js, and TypeScript, and a passion for clean, maintainable code.',
      keywords: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'web development']
    },
    {
      user_id: testConfig.testUsers.premium.id,
      title: 'Product Manager',
      company: 'ProductFirst',
      location: 'Remote',
      job_type: 'Full-time',
      content: 'ProductFirst is seeking a Product Manager to lead our product development efforts. You will work closely with engineering, design, and marketing teams to deliver exceptional products that meet user needs.',
      keywords: ['product management', 'agile', 'user research', 'roadmap', 'leadership']
    },
    {
      user_id: testConfig.testUsers.basic.id,
      title: 'Junior Web Developer',
      company: 'StartupCo',
      location: 'Austin, TX',
      job_type: 'Full-time',
      content: 'StartupCo is seeking a Junior Web Developer to join our team. This is a great opportunity for someone looking to start their career in web development. Knowledge of HTML, CSS, and JavaScript is required.',
      keywords: ['HTML', 'CSS', 'JavaScript', 'junior', 'web development']
    }
  ];
  
  const { error } = await supabase
    .from('job_descriptions')
    .insert(jobDescriptions);
  
  if (error) {
    console.error('Error creating test job descriptions:', error);
    throw error;
  }
  
  console.log('Test job descriptions created successfully!');
}
