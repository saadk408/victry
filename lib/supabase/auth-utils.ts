/**
 * Auth utilities for role-based access control in Supabase
 * This module provides utilities for checking user roles and permissions
 */

import { createClient, createServerClient } from '../../lib/supabase/client';
import type { User } from '../../types/user';
import { Database } from '../../types/supabase';
import { cookies } from 'next/headers';

/**
 * Represents a role in the system
 */
export type UserRole = 'admin' | 'premium' | 'basic';

/**
 * Represents a resource and action pair for permission checks
 */
export interface Permission {
  resource: string;
  action: string;
}

/**
 * Get user roles from JWT claims
 * @returns Array of user roles
 */
export async function getUserRoles(): Promise<UserRole[]> {
  const cookieStore = await cookies();
  const supabase = await createServerClient(cookieStore);
  
  // Get the user's session which contains JWT claims
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return []; // No active session
  }
  
  // The roles claim would be added by our custom JWT function in the database
  const roles = session.user.app_metadata?.roles as UserRole[] || [];
  
  return roles;
}

/**
 * Check if the current user has a specific role
 * @param role Role to check for
 * @returns Whether the user has the specified role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const roles = await getUserRoles();
  return roles.includes(role);
}

/**
 * Check if the current user is an admin
 * @returns Whether the user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin');
}

/**
 * Check if the current user has premium access (admin or premium role)
 * @returns Whether the user has premium access
 */
export async function isPremium(): Promise<boolean> {
  const roles = await getUserRoles();
  return roles.includes('admin') || roles.includes('premium');
}

/**
 * Check if the current user has a specific permission
 * @param resource Resource to check permission for
 * @param action Action to check permission for
 * @returns Whether the user has the specified permission
 */
export async function hasPermission(resource: string, action: string): Promise<boolean> {
  const cookieStore = await cookies();
  const supabase = await createServerClient(cookieStore);
  
  // Using RPC call to the database function we created
  const { data, error } = await supabase.rpc('has_permission', {
    resource_param: resource,
    action_param: action
  });
  
  if (error) {
    console.error('Error checking permission:', error);
    return false;
  }
  
  return data === true || false;
}

/**
 * Check if user has reached the resume limit based on their role
 * @returns Whether the user has reached their resume limit
 */
export async function hasReachedResumeLimit(): Promise<boolean> {
  // If the user is premium or admin, they have unlimited resumes
  if (await isPremium()) {
    return false;
  }
  
  // Otherwise, check the database limit
  const cookieStore = await cookies();
  const supabase = await createServerClient(cookieStore);
  
  // Get the user's ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return true; // No user found, so consider limit reached
  }
  
  // Count user's resumes
  const { count, error } = await supabase
    .from('resumes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error checking resume count:', error);
    return true; // Error case, consider limit reached
  }
  
  // Basic users are limited to 3 resumes
  return (count || 0) >= 3;
}

/**
 * Check if user can access a specific AI feature based on their role and usage
 * @param feature Name of the AI feature to check
 * @returns Whether the user can use the specified AI feature
 */
export async function canUseAiFeature(feature: string): Promise<boolean> {
  // If the user is premium or admin, they have unlimited AI features
  if (await isPremium()) {
    return true;
  }
  
  // Otherwise, check the database limit
  const cookieStore = await cookies();
  const supabase = await createServerClient(cookieStore);
  
  // Using RPC call to the database function we created
  const { data, error } = await supabase.rpc('check_ai_usage_limit', {
    feature_param: feature
  });
  
  if (error) {
    console.error('Error checking AI feature limit:', error);
    return false;
  }
  
  return data === true || false;
}

/**
 * Record usage of an AI feature
 * @param feature Name of the AI feature used
 * @returns Whether the usage was successfully recorded
 */
export async function recordAiFeatureUsage(feature: string): Promise<boolean> {
  const cookieStore = await cookies();
  const supabase = await createServerClient(cookieStore);
  
  // Call the database function to record usage
  const { error } = await supabase.rpc('record_ai_feature_usage', {
    feature_param: feature
  });
  
  if (error) {
    console.error('Error recording AI feature usage:', error);
    return false;
  }
  
  return true;
}

/**
 * Client-side hook-friendly version for checking roles
 * @param role Role to check
 * @returns Promise resolving to a boolean indicating if user has the role
 */
export function useHasRole(role: UserRole): Promise<boolean> {
  const supabase = createClient();
  
  return new Promise((resolve) => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        resolve(false);
        return;
      }
      
      const roles = session.user.app_metadata?.roles as UserRole[] || [];
      resolve(roles.includes(role));
    });
  });
}

/**
 * Client-side hook-friendly version for checking if user is admin
 * @returns Promise resolving to a boolean indicating if user is admin
 */
export function useIsAdmin(): Promise<boolean> {
  return useHasRole('admin');
}

/**
 * Client-side hook-friendly version for checking if user has premium access
 * @returns Promise resolving to a boolean indicating if user has premium access
 */
export function useIsPremium(): Promise<boolean> {
  const supabase = createClient();
  
  return new Promise((resolve) => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        resolve(false);
        return;
      }
      
      const roles = session.user.app_metadata?.roles as UserRole[] || [];
      resolve(roles.includes('admin') || roles.includes('premium'));
    });
  });
}

/**
 * Assign a role to a user (admin only function)
 * @param userId User ID to assign role to
 * @param role Role to assign
 * @returns Whether the role was successfully assigned
 */
export async function assignRole(userId: string, role: UserRole): Promise<boolean> {
  // Check if current user is admin
  if (!await isAdmin()) {
    console.error('Only admins can assign roles');
    return false;
  }
  
  const cookieStore = await cookies();
  const supabase = await createServerClient(cookieStore);
  
  // Call the database function to assign role
  const { error } = await supabase.rpc('assign_role', {
    p_user_id: userId,
    p_role_name: role
  });
  
  if (error) {
    console.error('Error assigning role:', error);
    return false;
  }
  
  return true;
}

/**
 * Get all permissions for the current user
 * @returns Object mapping resource.action to boolean
 */
export async function getUserPermissions(): Promise<Record<string, boolean>> {
  const cookieStore = await cookies();
  const supabase = await createServerClient(cookieStore);
  
  // Call a view or function that returns all user permissions
  const { data, error } = await supabase.rpc('get_user_permissions', {});
  
  if (error) {
    console.error('Error getting user permissions:', error);
    return {};
  }
  
  // Transform array of permissions into a map
  const permissionsMap: Record<string, boolean> = {};
  
  if (data && Array.isArray(data)) {
    for (const perm of data as Array<{resource: string, action: string}>) {
      permissionsMap[`${perm.resource}.${perm.action}`] = true;
    }
  }
  
  return permissionsMap;
}