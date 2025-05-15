"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
        {/* Logo/Branding */}
        <div className="flex justify-center">
          <Link href="/" className="text-3xl font-bold text-blue-900">
            Victry
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold">Create your Victry account</h1>
          <p className="mt-2 text-gray-600">
            Start building your professional resume today!
          </p>
        </div>

        <RegisterForm />

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
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
