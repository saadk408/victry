// File: /tests/supabase/test-reset.ts

/**
 * Reset test database and seed with test data
 * This script is used to reset the test database before running tests
 */

import { createAdminClient, testConfig } from './test-environment';
import { seedTestData } from './seed-test-data';

/**
 * Reset the test database by truncating all test tables
 * and recreating test users
 */
export async function resetTestDatabase() {
  console.log('Resetting test database...');
  
  const supabase = createAdminClient();
  
  try {
    // Truncate test tables but preserve schema
    // Using cascade to handle foreign key constraints
    const tables = [
      'resumes',
      'job_descriptions',
      'auth_rbac.user_roles',
      'auth_rbac.role_permissions',
      'auth_rbac.permissions'
    ];
    
    for (const table of tables) {
      console.log(`Truncating table: ${table}`);
      const { error } = await supabase.rpc('truncate_table', { table_name: table });
      
      if (error) {
        console.error(`Error truncating ${table}:`, error);
        throw error;
      }
    }
    
    // Delete test users from auth.users
    console.log('Deleting test users...');
    for (const userType of Object.keys(testConfig.testUsers)) {
      const user = testConfig.testUsers[userType as keyof typeof testConfig.testUsers];
      await supabase.auth.admin.deleteUser(user.id);
    }
    
    // Seed with baseline test data
    console.log('Seeding test data...');
    await seedTestData(supabase);
    
    console.log('Test database reset complete!');
  } catch (error) {
    console.error('Error resetting test database:', error);
    throw error;
  } finally {
    // End the Supabase client session
    await supabase.auth.signOut();
  }
}

/**
 * Create a stored procedure to safely truncate tables
 * This handles foreign key constraints properly
 */
export async function createTruncateFunction() {
  const supabase = createAdminClient();
  
  try {
    const { error } = await supabase.rpc('create_truncate_function');
    
    if (error) {
      console.error('Error creating truncate function:', error);
      throw error;
    }
    
    console.log('Truncate function created successfully!');
  } catch (error) {
    console.error('Error creating truncate function:', error);
    throw error;
  } finally {
    await supabase.auth.signOut();
  }
}

// Add a setup function for the truncate RPC if it doesn't exist
export async function setupTruncateFunction() {
  const supabase = createAdminClient();
  
  try {
    // Check if function exists first
    const { data, error } = await supabase
      .from('pg_proc')
      .select('*')
      .eq('proname', 'truncate_table')
      .single();
    
    if (error || !data) {
      console.log('Creating truncate_table function...');
      
      // Create the function
      await supabase.sql`
        CREATE OR REPLACE FUNCTION truncate_table(table_name text)
        RETURNS void AS $$
        BEGIN
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(table_name) || ' CASCADE';
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      console.log('truncate_table function created successfully!');
    } else {
      console.log('truncate_table function already exists');
    }
  } catch (error) {
    console.error('Error setting up truncate function:', error);
    throw error;
  } finally {
    await supabase.auth.signOut();
  }
}

// Allow running this file directly
if (require.main === module) {
  (async () => {
    try {
      await setupTruncateFunction();
      await resetTestDatabase();
    } catch (error) {
      console.error('Error running test reset:', error);
      process.exit(1);
    }
  })();
}