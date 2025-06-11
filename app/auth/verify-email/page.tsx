"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const supabase = createClient();

  // Debug logging
  useEffect(() => {
    console.log('🔍 Verify email page loaded with params:', {
      tokenHash: tokenHash ? `${tokenHash.substring(0, 10)}...` : null,
      type,
      hasTokenHash: !!tokenHash,
      hasType: !!type
    });
  }, [tokenHash, type]);

  const handleVerifyEmail = async () => {
    if (!tokenHash || !type) {
      setErrorMessage('Invalid verification link. Missing required parameters.');
      setVerificationStatus('error');
      return;
    }

    try {
      setIsVerifying(true);
      setErrorMessage(null);

      console.log('🔍 Starting email verification with:', {
        type,
        tokenLength: tokenHash.length,
        tokenPrefix: tokenHash.substring(0, 10)
      });

      // Verify the OTP token
      const { error: verificationError } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash: tokenHash,
      });

      if (verificationError) {
        console.error('🔍 Verification error:', verificationError);
        throw verificationError;
      }

      console.log('🔍 Email verification successful');
      setVerificationStatus('success');

      // Get the user to check if this is their first email verification
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Failed to get user after verification:', userError);
        setErrorMessage('Verification successful, but failed to get user information. Please try logging in.');
        setVerificationStatus('error');
        return;
      }

      // Check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      // Redirect based on profile status
      setTimeout(() => {
        if (!profile && profileError?.code === 'PGRST116') {
          // First time user - redirect to profile completion
          router.push('/onboarding/complete-profile');
        } else {
          // Existing user - redirect to dashboard
          router.push('/dashboard');
        }
      }, 2000);

    } catch (error) {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          setErrorMessage('This verification link has expired. Please request a new one.');
        } else if (error.message.includes('invalid')) {
          setErrorMessage('This verification link is invalid. Please check your email for the correct link.');
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage('Failed to verify email. Please try again or contact support.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-redirect if verification is successful
  useEffect(() => {
    if (verificationStatus === 'success') {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [verificationStatus, router]);

  if (!tokenHash || !type) {
    return (
      <div className="container mx-auto max-w-md py-16">
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle className="text-red-700">Invalid Verification Link</CardTitle>
            <CardDescription>
              This verification link is missing required parameters. Please check your email for the correct link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="container mx-auto max-w-md py-16">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="text-green-700">Email Verified Successfully!</CardTitle>
            <CardDescription>
              Your email has been confirmed. You will be redirected to your dashboard shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Redirecting...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="container mx-auto max-w-md py-16">
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle className="text-red-700">Verification Failed</CardTitle>
            <CardDescription>
              {errorMessage || 'There was an error verifying your email address.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleVerifyEmail} 
              variant="outline" 
              className="w-full"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </span>
              ) : (
                'Try Again'
              )}
            </Button>
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md py-16">
      <Card>
        <CardHeader className="text-center">
          <Mail className="mx-auto h-12 w-12 text-blue-500" />
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            Click the button below to confirm your email address and activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleVerifyEmail} 
            className="w-full" 
            size="lg"
            disabled={isVerifying}
          >
            {isVerifying ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying Email...
              </span>
            ) : (
              <span className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Email Address
              </span>
            )}
          </Button>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Having trouble? <a href="/login" className="text-blue-600 hover:underline">Go to login</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Suspense 
        fallback={
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </CardContent>
          </Card>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}