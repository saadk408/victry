"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-surface p-8 shadow">
        {/* Logo/Branding */}
        <div className="flex justify-center">
          <Link href="/" className="text-3xl font-bold text-blue-900">
            Victry
          </Link>
        </div>

        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Verification Failed
          </h1>
          <p className="mt-2 text-muted-foreground">
            The verification link is invalid or has expired. This could happen if:
          </p>
          <ul className="mt-4 text-left text-sm text-muted-foreground">
            <li>• The link is older than 1 hour</li>
            <li>• The link has already been used</li>
            <li>• The link was copied incorrectly</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/forgot-password">
              Request New Reset Link
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">
              Back to Login
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link href="/help" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}