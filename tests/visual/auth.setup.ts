import { test as setup, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const authFile = '.auth/user.json';

/**
 * Global setup for authenticated user session
 * Creates a test user and stores authentication state
 */
setup('authenticate test user', async ({ page }) => {
  // Skip authentication if no Supabase URL configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('Skipping authentication setup - no Supabase URL configured');
    return;
  }
  
  // Create Supabase client for test environment
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Test user credentials
  const testEmail = 'test@victry.app';
  const testPassword = 'test123456';

  try {
    // Try to sign in existing test user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError && signInError.message.includes('Invalid login credentials')) {
      // Create test user if doesn't exist
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (signUpError) {
        throw new Error(`Failed to create test user: ${signUpError.message}`);
      }

      console.log('Test user created successfully');
    } else if (signInError) {
      throw new Error(`Failed to sign in test user: ${signInError.message}`);
    }

    // Navigate to sign-in page
    await page.goto('/sign-in');
    
    // Fill in credentials
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', testPassword);
    
    // Submit form
    await page.click('[data-testid="sign-in-button"]');
    
    // Wait for successful authentication (redirect to dashboard)
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Verify we're authenticated
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Save authentication state
    await page.context().storageState({ path: authFile });
    
    console.log('Authentication setup completed successfully');
    
  } catch (error) {
    console.error('Authentication setup failed:', error);
    throw error;
  }
});