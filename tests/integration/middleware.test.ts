// File: /tests/integration/middleware.test.ts

/**
 * Integration tests for middleware functionality
 * Tests authentication and role-based access control
 */

import { withTestUser, withAnonUser } from '../supabase/test-utils';
import { testConfig } from '../supabase/test-environment';
import { resetTestDatabase } from '../supabase/test-reset';
import fetch from 'node-fetch';

// Base URL for app requests
const APP_BASE_URL = 'http://localhost:3000';

describe('Middleware', () => {
  // Reset the database before all tests
  beforeAll(async () => {
    await resetTestDatabase();
  });
  
  describe('Authentication Middleware', () => {
    it('should redirect unauthenticated users to login when accessing protected routes', async () => {
      await withAnonUser(async (supabase) => {
        const response = await fetch(`${APP_BASE_URL}/dashboard`, {
          redirect: 'manual' // Don't automatically follow redirects
        });
        
        expect(response.status).toBe(307); // Temporary redirect
        const redirectUrl = response.headers.get('location');
        expect(redirectUrl).toContain('/login');
      });
    });
    
    it('should allow authenticated users to access protected routes', async () => {
      await withTestUser('basic', async (supabase) => {
        // Get authentication token
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        
        // Create a cookie with the token
        const cookies = [`sb-access-token=${token}`, `sb-refresh-token=dummy-refresh-token`];
        
        const response = await fetch(`${APP_BASE_URL}/dashboard`, {
          headers: {
            'Cookie': cookies.join('; ')
          }
        });
        
        // Should not redirect to login
        expect(response.status).toBe(200);
      });
    });
  });
  
  describe('Role-Based Access Control Middleware', () => {
    it('should redirect basic users to upgrade page when accessing premium routes', async () => {
      await withTestUser('basic', async (supabase) => {
        // Get authentication token
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        
        // Create a cookie with the token
        const cookies = [`sb-access-token=${token}`, `sb-refresh-token=dummy-refresh-token`];
        
        const response = await fetch(`${APP_BASE_URL}/resume/templates/premium`, {
          headers: {
            'Cookie': cookies.join('; ')
          },
          redirect: 'manual'
        });
        
        expect(response.status).toBe(307); // Temporary redirect
        const redirectUrl = response.headers.get('location');
        expect(redirectUrl).toContain('/upgrade');
      });
    });
    
    it('should redirect non-admin users to access denied page when accessing admin routes', async () => {
      await withTestUser('premium', async (supabase) => {
        // Get authentication token
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        
        // Create a cookie with the token
        const cookies = [`sb-access-token=${token}`, `sb-refresh-token=dummy-refresh-token`];
        
        const response = await fetch(`${APP_BASE_URL}/dashboard/admin`, {
          headers: {
            'Cookie': cookies.join('; ')
          },
          redirect: 'manual'
        });
        
        expect(response.status).toBe(307); // Temporary redirect
        const redirectUrl = response.headers.get('location');
        expect(redirectUrl).toContain('/access-denied');
        expect(redirectUrl).toContain('reason=admin');
      });
    });
    
    it('should allow premium users to access premium routes', async () => {
      await withTestUser('premium', async (supabase) => {
        // Get authentication token
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        
        // Create a cookie with the token
        const cookies = [`sb-access-token=${token}`, `sb-refresh-token=dummy-refresh-token`];
        
        const response = await fetch(`${APP_BASE_URL}/resume/templates/premium`, {
          headers: {
            'Cookie': cookies.join('; ')
          },
          redirect: 'manual'
        });
        
        // Should not redirect to upgrade page
        expect(response.status).toBe(200);
      });
    });
    
    it('should allow admin users to access admin routes', async () => {
      await withTestUser('admin', async (supabase) => {
        // Get authentication token
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        
        // Create a cookie with the token
        const cookies = [`sb-access-token=${token}`, `sb-refresh-token=dummy-refresh-token`];
        
        const response = await fetch(`${APP_BASE_URL}/dashboard/admin`, {
          headers: {
            'Cookie': cookies.join('; ')
          },
          redirect: 'manual'
        });
        
        // Should not redirect to access denied page
        expect(response.status).toBe(200);
      });
    });
  });
});
