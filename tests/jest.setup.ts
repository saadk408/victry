/**
 * Jest setup file for Supabase testing
 */

import { resetTestDatabase } from './supabase/test-reset';

// Global setup for all tests
beforeAll(async () => {
  // Reset the database before running any tests
  await resetTestDatabase();
});

// Global teardown
afterAll(async () => {
  // Any global cleanup if needed
});
