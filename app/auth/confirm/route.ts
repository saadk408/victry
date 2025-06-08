import { NextRequest, NextResponse } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createActionClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/dashboard';

  // Clean up the redirect URL by deleting sensitive parameters
  const redirectTo = new URL(origin + next);
  redirectTo.searchParams.delete('token_hash');
  redirectTo.searchParams.delete('type');

  if (token_hash && type) {
    try {
      const supabase = await createActionClient();
      
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });
      
      if (!error) {
        // Set security headers to prevent token leakage
        const response = NextResponse.redirect(redirectTo);
        response.headers.set('Referrer-Policy', 'no-referrer');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        return response;
      }
      
      console.error('Token verification failed:', error);
    } catch (error) {
      console.error('Unexpected error during token verification:', error);
    }
  }

  // Return user to error page with instructions
  const errorUrl = new URL(`${origin}/auth/auth-code-error`);
  return NextResponse.redirect(errorUrl);
}