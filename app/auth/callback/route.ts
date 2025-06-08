import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors (e.g., user cancelled)
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    try {
      const cookieStore = await cookies();
      const supabase = await createServerClient(cookieStore);
      
      // Exchange the code for a session
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) {
        console.error('Session exchange error:', sessionError);
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(sessionError.message)}`
        );
      }

      // Get the user to check if this is their first OAuth login
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Failed to get user after OAuth:', userError);
        return NextResponse.redirect(`${origin}/login?error=Failed to get user information`);
      }

      // Check if user profile exists in the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      // If no profile exists, create one
      if (!profile && !profileError) {
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
          // First time OAuth user - redirect to profile completion
          return NextResponse.redirect(`${origin}/onboarding/complete-profile`);
        }
      }

      // Existing user - redirect to intended destination
      return NextResponse.redirect(`${origin}${next}`);
      
    } catch (error) {
      console.error('Unexpected error in OAuth callback:', error);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('An unexpected error occurred')}`
      );
    }
  }

  // No code provided
  return NextResponse.redirect(`${origin}/login?error=No authorization code provided`);
}