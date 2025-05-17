/**
 * Tests for authentication utilities
 */
import { withTestUser, userHasRole, userHasPermission } from '../supabase/test-utils';
import { resetTestDatabase } from '../supabase/test-reset';

describe('Authentication Utilities', () => {
  // Reset the database before all tests
  beforeAll(async () => {
    await resetTestDatabase();
  });
  
  describe('Role-based access control', () => {
    it('should correctly identify admin users', async () => {
      await withTestUser('admin', async (supabase) => {
        const isAdmin = await userHasRole(supabase, 'admin');
        expect(isAdmin).toBe(true);
        
        const isPremium = await userHasRole(supabase, 'premium');
        expect(isPremium).toBe(false);
        
        const isBasic = await userHasRole(supabase, 'basic');
        expect(isBasic).toBe(false);
      });
    });
    
    it('should correctly identify premium users', async () => {
      await withTestUser('premium', async (supabase) => {
        const isAdmin = await userHasRole(supabase, 'admin');
        expect(isAdmin).toBe(false);
        
        const isPremium = await userHasRole(supabase, 'premium');
        expect(isPremium).toBe(true);
        
        const isBasic = await userHasRole(supabase, 'basic');
        expect(isBasic).toBe(false);
      });
    });
    
    it('should correctly identify basic users', async () => {
      await withTestUser('basic', async (supabase) => {
        const isAdmin = await userHasRole(supabase, 'admin');
        expect(isAdmin).toBe(false);
        
        const isPremium = await userHasRole(supabase, 'premium');
        expect(isPremium).toBe(false);
        
        const isBasic = await userHasRole(supabase, 'basic');
        expect(isBasic).toBe(true);
      });
    });
  });
  
  describe('Permission-based access control', () => {
    it('should assign correct permissions to admin users', async () => {
      await withTestUser('admin', async (supabase) => {
        // Admin users should have admin permissions
        expect(await userHasPermission(supabase, 'users', 'manage')).toBe(true);
        expect(await userHasPermission(supabase, 'analytics', 'view')).toBe(true);
        expect(await userHasPermission(supabase, 'templates', 'manage')).toBe(true);
        
        // Admin users should also have premium permissions
        expect(await userHasPermission(supabase, 'ai', 'tailoring')).toBe(true);
        expect(await userHasPermission(supabase, 'templates', 'use_premium')).toBe(true);
        expect(await userHasPermission(supabase, 'resumes', 'unlimited')).toBe(true);
        
        // Admin users should also have basic permissions
        expect(await userHasPermission(supabase, 'resumes', 'read_own')).toBe(true);
        expect(await userHasPermission(supabase, 'resumes', 'create')).toBe(true);
        expect(await userHasPermission(supabase, 'resumes', 'update_own')).toBe(true);
      });
    });
    
    it('should assign correct permissions to premium users', async () => {
      await withTestUser('premium', async (supabase) => {
        // Premium users should have premium permissions
        expect(await userHasPermission(supabase, 'ai', 'tailoring')).toBe(true);
        expect(await userHasPermission(supabase, 'templates', 'use_premium')).toBe(true);
        expect(await userHasPermission(supabase, 'resumes', 'unlimited')).toBe(true);
        
        // Premium users should also have basic permissions
        expect(await userHasPermission(supabase, 'resumes', 'read_own')).toBe(true);
        expect(await userHasPermission(supabase, 'resumes', 'create')).toBe(true);
        expect(await userHasPermission(supabase, 'resumes', 'update_own')).toBe(true);
        
        // Premium users should not have admin permissions
        expect(await userHasPermission(supabase, 'users', 'manage')).toBe(false);
        expect(await userHasPermission(supabase, 'analytics', 'view')).toBe(false);
        expect(await userHasPermission(supabase, 'templates', 'manage')).toBe(false);
      });
    });
    
    it('should assign correct permissions to basic users', async () => {
      await withTestUser('basic', async (supabase) => {
        // Basic users should have basic permissions
        expect(await userHasPermission(supabase, 'resumes', 'read_own')).toBe(true);
        expect(await userHasPermission(supabase, 'resumes', 'create')).toBe(true);
        expect(await userHasPermission(supabase, 'resumes', 'update_own')).toBe(true);
        
        // Basic users should not have premium permissions
        expect(await userHasPermission(supabase, 'ai', 'tailoring')).toBe(false);
        expect(await userHasPermission(supabase, 'templates', 'use_premium')).toBe(false);
        expect(await userHasPermission(supabase, 'resumes', 'unlimited')).toBe(false);
        
        // Basic users should not have admin permissions
        expect(await userHasPermission(supabase, 'users', 'manage')).toBe(false);
        expect(await userHasPermission(supabase, 'analytics', 'view')).toBe(false);
        expect(await userHasPermission(supabase, 'templates', 'manage')).toBe(false);
      });
    });
  });
});
