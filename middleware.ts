// File: /middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Route protection configuration
const ROUTE_PROTECTION = {
  // Routes that require admin role
  adminRoutes: [
    '/dashboard/admin',
    '/dashboard/users',
    '/dashboard/analytics',
    '/dashboard/templates',
    '/dashboard/system',
    '/api/admin'
  ],
  // Routes that require premium or admin role
  premiumRoutes: [
    '/resume/templates/premium',
    '/api/ai/tailor-resume',
    '/api/export/premium',
    '/resume/*/tailor'
  ]
};

// This middleware handles authentication and role-based access control
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      } as any,
    }
  )

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser(). This could cause authentication issues.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl;
  
  // Get user roles from JWT
  const roles = user?.app_metadata?.roles || [];
  const isAdmin = roles.includes('admin');
  const isPremium = isAdmin || roles.includes('premium');

  // Function to check if a path matches any pattern in an array
  const matchesPattern = (path: string, patterns: string[]) => {
    return patterns.some(pattern => {
      // Convert wildcard pattern to regex
      if (pattern.includes('*')) {
        const regexPattern = pattern.replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(path);
      }
      return path.startsWith(pattern);
    });
  };

  // Check if path requires admin role
  const requiresAdmin = matchesPattern(pathname, ROUTE_PROTECTION.adminRoutes);
  
  // Check if path requires premium role
  const requiresPremium = matchesPattern(pathname, ROUTE_PROTECTION.premiumRoutes);

  if (!user) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (pathname.startsWith("/dashboard") || pathname.startsWith("/resume")) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check role-based access
  if (requiresAdmin && !isAdmin) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    
    // Redirect to access denied page
    const accessDeniedUrl = request.nextUrl.clone();
    accessDeniedUrl.pathname = "/access-denied";
    accessDeniedUrl.searchParams.set("reason", "admin");
    return NextResponse.redirect(accessDeniedUrl);
  }
  
  if (requiresPremium && !isPremium) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: "Premium access required" },
        { status: 403 }
      );
    }
    
    // Redirect to premium upgrade page
    const upgradeUrl = request.nextUrl.clone();
    upgradeUrl.pathname = "/upgrade";
    upgradeUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(upgradeUrl);
  }
  
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/resume/:path*", 
    "/api/:path*",
    "/upgrade",
    "/access-denied"
  ],
};
