"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  // Check authentication status
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      // If user is already authenticated with a regular session (not recovery),
      // redirect to dashboard
      if (session && session.user.aud === 'authenticated') {
        const isRecoverySession = session.user.user_metadata?.recovery_session;
        if (!isRecoverySession) {
          router.push("/dashboard");
        }
      }
    };

    checkSession();
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
        {/* Logo/Branding */}
        <div className="flex justify-center">
          <Link href="/" className="text-3xl font-bold text-blue-900">
            Victry
          </Link>
        </div>

        {/* Page Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Choose a strong password for your account.
          </p>
        </div>

        {/* Reset Password Form Component */}
        <ResetPasswordForm />

        {/* Security Notice */}
        <div className="rounded-md bg-blue-50 p-3">
          <p className="text-sm text-blue-700">
            <strong>Security tip:</strong> Use a unique password that you don't use 
            anywhere else. Consider using a password manager to generate and store 
            strong passwords.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Victry. All rights reserved.</p>
        <div className="mt-2 flex justify-center space-x-4">
          <Link href="/privacy" className="hover:text-gray-800">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-gray-800">
            Terms of Service
          </Link>
          <Link href="/help" className="hover:text-gray-800">
            Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}