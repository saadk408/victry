import { NextRequest, NextResponse } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/dashboard';

  // Handle authentication errors from Supabase
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('Auth error:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // If we have verification parameters, process them
  if (token_hash && type) {
    try {
      const supabase = await createClient();
      
      // Verify the OTP token
      const { error: verificationError } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });
      
      if (!verificationError) {
        // Get the user after successful verification
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Failed to get user after verification:', userError);
          return NextResponse.redirect(
            `${origin}/login?error=${encodeURIComponent('Failed to get user information')}`
          );
        }

        // Check if user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        // Create profile if it doesn't exist (fallback for database trigger)
        if (!profile && profileError?.code === 'PGRST116') {
          const { error: createError } = await supabase.from('profiles').insert({
            id: user.id,
            first_name: user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.given_name || '',
            last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || user.user_metadata?.family_name || '',
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            subscription_tier: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (createError) {
            console.error('Error creating user profile:', createError);
            // Continue anyway - the auth account exists
          } else {
            // First time verification - redirect to profile completion
            const response = NextResponse.redirect(`${origin}/onboarding/complete-profile`);
            response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
            return response;
          }
        }

        // Existing user - redirect to intended destination
        const cleanUrl = new URL(origin + next);
        cleanUrl.searchParams.delete('token_hash');
        cleanUrl.searchParams.delete('type');
        
        const response = NextResponse.redirect(cleanUrl);
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        return response;
      }
      
      // Verification failed
      console.error('Verification failed:', verificationError.message);
      
    } catch (error) {
      console.error('Unexpected error during verification:', error);
    }
  }

  // Default fallback - redirect to auth error page
  const errorUrl = new URL(`${origin}/auth/auth-code-error`);
  errorUrl.searchParams.set('reason', 'verification_failed');
  return NextResponse.redirect(errorUrl);
}