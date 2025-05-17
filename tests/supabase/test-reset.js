/**
 * Test database reset utility
 * Used to prepare the test database before running tests
 */

const { createClient } = require('@supabase/supabase-js');

// Test environment configuration
const supabaseUrl = process.env.TEST_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.TEST_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create admin client for database operations
const createAdminClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Test user definitions
const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'test-password',
    id: '00000000-0000-0000-0000-000000000001',
    role: 'admin'
  },
  premium: {
    email: 'premium@test.com',
    password: 'test-password',
    id: '00000000-0000-0000-0000-000000000002',
    role: 'premium'
  },
  basic: {
    email: 'basic@test.com',
    password: 'test-password',
    id: '00000000-0000-0000-0000-000000000003',
    role: 'basic'
  }
};

/**
 * Reset the test database by truncating tables and recreating test users
 */
async function resetTestDatabase() {
  console.log('Resetting test database...');
  
  const supabase = createAdminClient();
  
  try {
    // Tables to truncate
    const tables = [
      'resumes',
      'personal_info',
      'professional_summary',
      'work_experiences',
      'education',
      'skills',
      'projects',
      'certifications',
      'social_links',
      'custom_sections',
      'custom_entries',
      'job_descriptions',
      'job_analysis',
      'auth_rbac.user_roles',
      'ai_usage_tracking'
    ];
    
    // Truncate tables in reverse to avoid foreign key constraints
    for (const table of tables.reverse()) {
      console.log(`Truncating ${table}...`);
      const { error } = await supabase.rpc('admin_truncate_table', { table_name: table });
      if (error) {
        console.error(`Error truncating ${table}:`, error);
        // Try direct SQL if RPC fails
        const { error: sqlError } = await supabase.from(table).delete();
        if (sqlError) {
          console.error(`SQL truncate error for ${table}:`, sqlError);
        }
      }
    }
    
    // Recreate test users
    await createTestUsers(supabase);
    
    console.log('Test database reset complete');
  } catch (error) {
    console.error('Error resetting test database:', error);
    process.exit(1);
  }
}

/**
 * Create test users for different roles
 */
async function createTestUsers(supabase) {
  console.log('Creating test users...');
  
  try {
    // Create admin function for directly inserting auth users
    const { error: fnError } = await supabase.rpc('create_test_users_function_if_not_exists');
    if (fnError) {
      console.error('Error creating test user function:', fnError);
    }
    
    // Create test users for each role
    for (const [role, user] of Object.entries(testUsers)) {
      console.log(`Creating ${role} user...`);
      
      // First try to delete existing user if any
      await supabase.rpc('admin_delete_user_if_exists', { 
        p_email: user.email 
      });
      
      // Create the user in auth.users
      const { error: createError } = await supabase.rpc('admin_create_test_user', { 
        p_id: user.id,
        p_email: user.email,
        p_password: user.password
      });
      
      if (createError) {
        console.error(`Error creating ${role} user:`, createError);
        continue;
      }
      
      // Assign the appropriate role
      const { error: roleError } = await supabase.rpc('admin_assign_role', { 
        p_user_id: user.id, 
        p_role_name: user.role 
      });
      
      if (roleError) {
        console.error(`Error assigning ${role} role:`, roleError);
      }
    }
    
    console.log('Test users created successfully');
  } catch (error) {
    console.error('Error creating test users:', error);
  }
}

// Execute database reset when this script is run directly
if (require.main === module) {
  (async () => {
    try {
      await resetTestDatabase();
      process.exit(0);
    } catch (error) {
      console.error('Error in reset script:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  resetTestDatabase,
  createTestUsers,
  createAdminClient,
  testUsers
};