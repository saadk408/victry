/**
 * Test utilities for Supabase tests
 */
import { TestSupabaseClient, TestUserType, createAdminClient, createAuthenticatedClient, createAnonClient } from './test-environment';

/**
 * Execute a test with an authenticated user
 * @param userType The type of user to authenticate as
 * @param testFn The test function to execute
 */
export async function withTestUser<T>(
  userType: TestUserType, 
  testFn: (supabase: TestSupabaseClient) => Promise<T>
): Promise<T> {
  // Create and authenticate the client
  const supabase = await createAuthenticatedClient(userType);
  
  try {
    // Run the test function with the authenticated client
    return await testFn(supabase);
  } finally {
    // Always clean up by signing out
    await supabase.auth.signOut();
  }
}

/**
 * Execute a test with an anonymous user
 * @param testFn The test function to execute
 */
export async function withAnonUser<T>(
  testFn: (supabase: TestSupabaseClient) => Promise<T>
): Promise<T> {
  // Create anonymous client
  const supabase = createAnonClient();
  
  // Run the test function with the anonymous client
  return await testFn(supabase);
}

/**
 * Execute a test with admin privileges
 * @param testFn The test function to execute
 */
export async function withAdminClient<T>(
  testFn: (supabase: TestSupabaseClient) => Promise<T>
): Promise<T> {
  // Create admin client
  const supabase = createAdminClient();
  
  // Run the test function with the admin client
  return await testFn(supabase);
}

/**
 * Check if a user has the specified role
 * @param supabase Authenticated Supabase client
 * @param role The role to check
 */
export async function userHasRole(
  supabase: TestSupabaseClient,
  role: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_role', { role_name: role });
  
  if (error) {
    throw new Error(`Failed to check role: ${error.message}`);
  }
  
  return data || false;
}

/**
 * Check if the user has the specified permission
 * @param supabase Authenticated Supabase client
 * @param resource The resource to check
 * @param action The action to check
 */
export async function userHasPermission(
  supabase: TestSupabaseClient,
  resource: string,
  action: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_permission', { 
    resource: resource,
    action: action
  });
  
  if (error) {
    throw new Error(`Failed to check permission: ${error.message}`);
  }
  
  return data || false;
}
