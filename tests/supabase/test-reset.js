/**
 * Test database reset utility
 * Used to prepare the test database before running tests
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load test environment
dotenv.config({ path: path.join(__dirname, '../../.env.test.local') });
dotenv.config({ path: path.join(__dirname, '../../.env.local') }); // Fallback to local if test env doesn't exist

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.TEST_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('Service/Anon Key:', supabaseKey ? 'Set' : 'Not set');
  console.error('');
  console.error('Please ensure you have set up your environment variables properly.');
  console.error('You need either:');
  console.error('1. SUPABASE_SERVICE_ROLE_KEY (preferred for tests)');
  console.error('2. NEXT_PUBLIC_SUPABASE_ANON_KEY (fallback)');
  process.exit(1);
}

// Warn if using anon key instead of service role key
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  Warning: Using anon key instead of service role key.');
  console.warn('Some operations may fail due to insufficient permissions.');
  console.warn('For full test capabilities, please set SUPABASE_SERVICE_ROLE_KEY.');
  console.warn('');
}

// Create admin client for database operations
const createAdminClient = () => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  });
};

/**
 * Reset the test database
 */
async function resetTestDatabase() {
  console.log('Resetting test database...');
  console.log('Using Supabase URL:', supabaseUrl);
  
  const supabase = createAdminClient();
  
  try {
    // Test connection first with a simple table
    console.log('Testing database connection...');
    const { data: testData, error: pingError } = await supabase
      .from('resumes')
      .select('count')
      .limit(1)
      .maybeSingle();
    
    if (pingError) {
      console.error('Database connection failed:', pingError);
      console.error('Error code:', pingError.code);
      console.error('Error message:', pingError.message);
      console.error('');
      console.error('This could mean:');
      console.error('1. The database is not accessible');
      console.error('2. The API key is invalid');
      console.error('3. RLS policies are blocking access');
      console.error('');
      console.error('Please check your Supabase project settings.');
      throw pingError;
    }
    
    console.log('Database connection successful');
    
    // Tables to reset (in correct order for foreign keys)
    const tables = [
      'ai_usage_tracking',
      'audit_logs',
      'job_analysis',
      'job_descriptions',
      'custom_entries',
      'custom_sections',
      'social_links',
      'projects',
      'skills',
      'work_experiences',
      'professional_summary',
      'education',
      'certifications',
      'personal_info',
      'resumes',
      'profiles'
    ];
    
    // Clear tables
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const table of tables) {
      try {
        console.log(`Clearing table: ${table}...`);
        
        // First try to select to ensure table exists
        const { error: selectError } = await supabase
          .from(table)
          .select('count')
          .limit(1)
          .maybeSingle();
        
        if (selectError) {
          if (selectError.code === 'PGRST116') {
            console.log(`Table ${table} does not exist, skipping...`);
            skipCount++;
            continue;
          } else if (selectError.code === '42501') {
            console.log(`Permission denied for ${table}, skipping...`);
            skipCount++;
            continue;
          } else {
            console.warn(`Cannot access ${table}: ${selectError.message}`);
            errorCount++;
            continue;
          }
        }
        
        // Delete all rows
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything
        
        if (deleteError) {
          console.warn(`Failed to clear ${table}: ${deleteError.message}`);
          errorCount++;
        } else {
          console.log(`✓ Cleared table: ${table}`);
          successCount++;
        }
      } catch (error) {
        console.warn(`Error with table ${table}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('');
    console.log('Database reset summary:');
    console.log(`✓ Success: ${successCount} tables`);
    console.log(`○ Skipped: ${skipCount} tables`);
    console.log(`✗ Errors: ${errorCount} tables`);
    
    return successCount > 0; // Consider it successful if at least some tables were cleared
  } catch (error) {
    console.error('Fatal error resetting database:', error);
    throw error;
  }
}

// Create test users (only works with service role key)
async function createTestUsers() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Skipping user creation - requires service role key');
    return;
  }
  
  console.log('Creating test users...');
  const supabase = createAdminClient();
  
  const testUsers = [
    {
      email: 'admin@test.com',
      password: 'test123456',
      user_metadata: { role: 'admin' }
    },
    {
      email: 'premium@test.com',
      password: 'test123456',
      user_metadata: { role: 'premium' }
    },
    {
      email: 'basic@test.com',
      password: 'test123456',
      user_metadata: { role: 'basic' }
    }
  ];
  
  try {
    for (const userData of testUsers) {
      // First check if user exists and delete if so
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === userData.email);
      
      if (existingUser) {
        console.log(`Deleting existing user: ${userData.email}`);
        await supabase.auth.admin.deleteUser(existingUser.id);
      }
      
      // Create new user
      console.log(`Creating user: ${userData.email}`);
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: userData.user_metadata
      });
      
      if (error) {
        console.error(`Error creating user ${userData.email}:`, error);
      } else {
        console.log(`✓ Created user: ${userData.email}`);
      }
    }
  } catch (error) {
    console.error('Error creating test users:', error);
  }
}

// Execute database reset when this script is run directly
if (require.main === module) {
  (async () => {
    try {
      const success = await resetTestDatabase();
      await createTestUsers();
      
      console.log('');
      if (success) {
        console.log('Test database setup complete');
        process.exit(0);
      } else {
        console.log('Test database setup completed with warnings');
        process.exit(0); // Still exit successfully if some tables were cleared
      }
    } catch (error) {
      console.error('Test database setup failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  resetTestDatabase,
  createTestUsers,
  createAdminClient
};