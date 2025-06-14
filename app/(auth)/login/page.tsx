// File: /app/(auth)/login/page.tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };

    checkSession();
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow">
        {/* Logo/Branding */}
        <div className="flex justify-center">
          <Link href="/" className="text-3xl font-bold text-foreground">
            Victry
          </Link>
        </div>

        {/* Page Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">Log in to Victry</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Please enter your credentials.
          </p>
        </div>

        {/* Login Form Component */}
        <LoginForm />

        {/* Register Link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground/80">
        <p>© {new Date().getFullYear()} Victry. All rights reserved.</p>
        <div className="mt-2 flex justify-center space-x-4">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/help" className="hover:text-foreground">
            Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
