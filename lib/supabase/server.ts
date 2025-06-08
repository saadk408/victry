/**
 * Server-Only Supabase Client
 * 
 * Created: 2025-06-08 as part of client/server separation fix
 * 
 * This file provides a Supabase client that uses next/headers for cookie
 * management and can only be used in server-side contexts.
 * 
 * Key Features:
 * - Uses createServerClient from @supabase/ssr
 * - Imports and uses next/headers for cookie management
 * - Handles session persistence across requests
 * - Compatible with Next.js 15 async cookies API
 * 
 * Usage:
 * ```typescript
 * import { createClient } from "@/lib/supabase/server";
 * 
 * const supabase = await createClient();
 * const { data, error } = await supabase.from('table').select();
 * ```
 * 
 * Valid Contexts:
 * - Server Components (no 'use client')
 * - API Route Handlers (/app/api/*)
 * - Server Actions
 * - Middleware
 * 
 * Important:
 * - NEVER import in client components - causes build errors
 * - For client components, use /lib/supabase/browser
 * - Function is async due to Next.js 15 cookies() API
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "../../types/supabase";

/**
 * Creates a Supabase client for use in Server Components, Server Actions, and Route Handlers
 * This client can read and write cookies for session management
 *
 * @returns A typed Supabase client for server usage
 * @example
 * // In a Server Component:
 * import { createClient } from '@/lib/supabase/server';
 *
 * export default async function ServerComponent() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('table').select();
 *   // ...
 * }
 */
export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Server Component context - cookies cannot be set
            // This is normal and can be safely ignored
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client for use in Server Actions and Route Handlers
 * This client can read and write cookies
 *
 * @param cookieStore - Optional cookie store (will fetch if not provided)
 * @returns A typed Supabase client for server actions
 */
export async function createActionClient(cookieStore?: ReturnType<typeof cookies>) {
  const _cookieStore = cookieStore || await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return _cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              _cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Server Component context - ignore
          }
        },
      },
    }
  );
}

/**
 * For backwards compatibility, also export as default
 */
export default createClient;