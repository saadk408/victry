/**
 * Test environment configuration for Supabase tests
 */
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Supabase connection details
export const testConfig = {
  // Supabase connection details
  supabaseUrl: process.env.TEST_SUPABASE_URL || 'http://127.0.0.1:54321',
  supabaseAnonKey: process.env.TEST_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  supabaseServiceKey: process.env.TEST_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  
  // Test user credentials
  testUsers: {
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
  },
  
  // Test limits
  limits: {
    basic: {
      maxResumes: 3,
      aiTailoringPerMonth: 5
    },
    premium: {
      maxResumes: -1, // unlimited
      aiTailoringPerMonth: -1 // unlimited
    }
  }
};

export type TestUserType = 'admin' | 'premium' | 'basic';
// Extended client type with sql method
export interface TestSupabaseClient extends SupabaseClient {
  sql?: (query: TemplateStringsArray, ...params: any[]) => Promise<any>;
}

/**
 * Create an admin client for database operations
 */
export const createAdminClient = (): TestSupabaseClient => {
  return createClient(
    testConfig.supabaseUrl,
    testConfig.supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

/**
 * Create an authenticated client for a specific user type
 */
export const createAuthenticatedClient = async (userType: TestUserType): Promise<TestSupabaseClient> => {
  const client = createClient(
    testConfig.supabaseUrl,
    testConfig.supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  const user = testConfig.testUsers[userType];
  
  const { error } = await client.auth.signInWithPassword({
    email: user.email,
    password: user.password
  });
  
  if (error) {
    throw new Error(`Failed to authenticate as ${userType}: ${error.message}`);
  }
  
  return client;
};

/**
 * Create an anonymous client
 */
export const createAnonClient = (): TestSupabaseClient => {
  return createClient(
    testConfig.supabaseUrl,
    testConfig.supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};
