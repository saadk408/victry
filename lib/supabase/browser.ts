/**
 * Browser-Safe Supabase Client
 * 
 * Created: 2025-06-08 as part of client/server separation fix
 * 
 * This file provides a Supabase client that can be safely imported
 * in client components marked with 'use client' directive.
 * 
 * Key Features:
 * - Uses createBrowserClient from @supabase/ssr
 * - No server-side dependencies (no next/headers)
 * - Handles authentication state in the browser
 * - Safe for client-side rendering
 * 
 * Usage:
 * ```typescript
 * import { createClient } from "@/lib/supabase/browser";
 * 
 * const supabase = createClient();
 * const { data, error } = await supabase.from('table').select();
 * ```
 * 
 * Important:
 * - Only use in client components ('use client')
 * - For server components/API routes, use /lib/supabase/server
 * - This client handles browser-side authentication automatically
 */
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../../types/supabase";

/**
 * Creates a Supabase client for use in Client Components
 * This is safe to use in client-side code (components with 'use client')
 *
 * @returns A typed Supabase client for browser usage
 * @example
 * 'use client';
 * import { createClient } from '@/lib/supabase/browser';
 *
 * export default function Component() {
 *   const supabase = createClient();
 *   // Use supabase client for client-side operations...
 * }
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * For backwards compatibility, also export as default
 */
export default createClient;