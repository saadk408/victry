"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { isValidPassword } from "@/lib/utils/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .refine(
        (password) => isValidPassword(password),
        "Password must meet all security requirements"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface PasswordStrength {
  score: number;
  feedback: string[];
}

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  // Check for valid recovery session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setSessionError(true);
          return;
        }

        // Check if this is a recovery session
        const user = session.user;
        if (!user || user.aud !== 'authenticated') {
          setSessionError(true);
          return;
        }
      } catch (error) {
        console.error('Session check error:', error);
        setSessionError(true);
      }
    };

    checkSession();
  }, [supabase]);

  const getPasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push("At least 8 characters");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("One uppercase letter");

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("One lowercase letter");

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push("One number");

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push("One special character");

    return { score, feedback };
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      
      if (error) {
        console.error('Password update error:', error);
        throw new Error("Failed to update password. Please try again.");
      }
      
      // Redirect to dashboard on success
      router.push("/dashboard?message=Password updated successfully");
    } catch (err) {
      setError("root", {
        type: "manual",
        message: err instanceof Error ? err.message : "Failed to reset password",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show session error if no valid recovery session
  if (sessionError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Session Expired</h3>
          <p className="mt-2 text-sm text-gray-600">
            Your password reset session has expired or is invalid. 
            Please request a new password reset link.
          </p>
        </div>

        <Button asChild className="w-full">
          <a href="/forgot-password">Request New Reset Link</a>
        </Button>
      </div>
    );
  }

  const passwordStrength = password ? getPasswordStrength(password) : { score: 0, feedback: [] };
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errors.root && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errors.root.message}
        </div>
      )}

      {/* New Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          New Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password")}
            placeholder="Enter new password"
            disabled={loading}
            className="w-full pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {errors.password && (
          <p className="text-sm text-red-600" role="alert">
            {errors.password.message}
          </p>
        )}

        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded ${
                    level <= passwordStrength.score
                      ? strengthColors[Math.min(passwordStrength.score - 1, 4)]
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Strength: {strengthLabels[Math.min(passwordStrength.score - 1, 4)] || "Very Weak"}
              </span>
            </div>
            {passwordStrength.feedback.length > 0 && (
              <p className="text-sm text-gray-600">
                Missing: {passwordStrength.feedback.join(", ")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm New Password
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            {...register("confirmPassword")}
            placeholder="Confirm new password"
            disabled={loading}
            className="w-full pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        {errors.confirmPassword && (
          <p className="text-sm text-red-600" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}

        {/* Password Match Indicator */}
        {confirmPassword && password && (
          <div className="flex items-center space-x-2">
            {password === confirmPassword ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Passwords match</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Passwords do not match</span>
              </>
            )}
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !isValid || passwordStrength.score < 4}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating password...
          </span>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}