"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, CheckCircle } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const supabase = createClient();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send reset email');
      }

      // Show success message (API always returns success to prevent user enumeration)
      setSubmittedEmail(data.email);
      setSuccess(true);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError("root", {
        type: "manual",
        message: err instanceof Error ? err.message : "Unable to process your request. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
          <p className="mt-2 text-sm text-gray-600">
            If an account with that email exists, we've sent password reset 
            instructions to <strong>{submittedEmail}</strong>.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            The link will expire in 1 hour for security reasons.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setSuccess(false);
              setSubmittedEmail("");
            }}
          >
            Send to a different email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errors.root && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errors.root.message}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Mail className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id="email"
            type="email"
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email")}
            placeholder="you@example.com"
            disabled={loading}
            className="w-full pl-10"
            autoComplete="email"
            autoFocus
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
        <p className="text-sm text-gray-500">
          Enter the email address associated with your account.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending reset link...
          </span>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  );
}