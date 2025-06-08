'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { UserRole } from '@/lib/supabase/auth-utils';

// Context for role-based access control
interface RbacContextType {
  roles: UserRole[];
  isAdmin: boolean;
  isPremium: boolean;
  permissions: Record<string, boolean>;
  hasPermission: (resource: string, action: string) => boolean;
  loading: boolean;
}

const RbacContext = createContext<RbacContextType>({
  roles: [],
  isAdmin: false,
  isPremium: false,
  permissions: {},
  hasPermission: () => false,
  loading: true,
});

// Provider component that wraps your app and makes RBAC context available to children
export function RbacProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const isAdmin = roles.includes('admin');
  const isPremium = isAdmin || roles.includes('premium');
  const supabase = createClient();
  
  useEffect(() => {
    async function loadRolesAndPermissions() {
      try {
        // Get the user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }
        
        // Get roles from JWT claims
        const userRoles = session.user.app_metadata?.roles as UserRole[] || [];
        setRoles(userRoles);
        
        // Get permissions from the server
        const { data, error } = await supabase.rpc('get_user_permissions');
        
        if (error) {
          console.error('Error fetching permissions:', error);
        } else if (data) {
          // Transform array of permissions into a map
          const permissionsMap: Record<string, boolean> = {};
          
          for (const perm of data) {
            permissionsMap[`${perm.resource}.${perm.action}`] = true;
          }
          
          setPermissions(permissionsMap);
        }
      } catch (error) {
        console.error('Error in RBAC provider:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadRolesAndPermissions();
    
    // Listen for authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadRolesAndPermissions();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);
  
  // Check if user has a specific permission
  const hasPermission = (resource: string, action: string): boolean => {
    return permissions[`${resource}.${action}`] === true;
  };
  
  return (
    <RbacContext.Provider
      value={{
        roles,
        isAdmin,
        isPremium,
        permissions,
        hasPermission,
        loading,
      }}
    >
      {children}
    </RbacContext.Provider>
  );
}

// Hook for using the RBAC context
export function useRbac() {
  const context = useContext(RbacContext);
  
  if (context === undefined) {
    throw new Error('useRbac must be used within a RbacProvider');
  }
  
  return context;
}

// Component that renders its children only if the user has the required role
interface RoleGuardProps {
  children: ReactNode;
  role: UserRole | UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, role, fallback = null }: RoleGuardProps) {
  const { roles, loading } = useRbac();
  const router = useRouter();
  
  // Handle loading state
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Check if user has any of the required roles
  const requiredRoles = Array.isArray(role) ? role : [role];
  const hasRequiredRole = requiredRoles.some(r => roles.includes(r));
  
  // Render children only if user has the required role
  return hasRequiredRole ? <>{children}</> : <>{fallback}</>;
}

// Component that renders its children only if the user has the required permission
interface PermissionGuardProps {
  children: ReactNode;
  resource: string;
  action: string;
  fallback?: ReactNode;
}

export function PermissionGuard({ children, resource, action, fallback = null }: PermissionGuardProps) {
  const { hasPermission, loading } = useRbac();
  
  // Handle loading state
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Render children only if user has the required permission
  return hasPermission(resource, action) ? <>{children}</> : <>{fallback}</>;
}

// Components for specific role checks
export function AdminOnly({ children, fallback = null }: Omit<RoleGuardProps, 'role'>) {
  return <RoleGuard role="admin" fallback={fallback}>{children}</RoleGuard>;
}

export function PremiumOnly({ children, fallback = null }: Omit<RoleGuardProps, 'role'>) {
  return <RoleGuard role={['admin', 'premium']} fallback={fallback}>{children}</RoleGuard>;
}

// Higher-order component to wrap a component with role-based access control
export function withRoleAccess<T>(Component: React.ComponentType<T>, role: UserRole | UserRole[]) {
  return function WithRoleAccess(props: T) {
    return (
      <RoleGuard role={role}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}

// Higher-order component to wrap a component with permission-based access control
export function withPermissionAccess<T>(Component: React.ComponentType<T>, resource: string, action: string) {
  return function WithPermissionAccess(props: T) {
    return (
      <PermissionGuard resource={resource} action={action}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
}