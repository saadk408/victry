# Password Reset Flow Implementation Plan

## Overview
This document outlines the comprehensive implementation plan for adding a password reset flow to the Victry application. The implementation leverages Supabase Auth's built-in password reset capabilities while providing a seamless user experience consistent with the application's design.

## Current State Analysis

### Authentication Setup
- **Framework**: Next.js 15 with App Router
- **Auth Provider**: Supabase Auth (using @supabase/ssr v0.5.2)
- **OAuth Providers**: Email, Google OAuth, LinkedIn OIDC (all configured)
- **Client Configuration**: Properly set up in `/lib/supabase/client.ts`
- **Login Form**: Already has "Forgot password?" link pointing to `/forgot-password` (currently non-existent)

### Key Findings
1. The login form already includes a forgot password link at line 158 in `/components/auth/login-form.tsx`
2. No existing password reset pages or components
3. Supabase client is properly configured with modern SSR patterns
4. Error handling utilities are available in `/lib/utils/error-utils.ts`

## User Flow Design

### 1. Password Reset Request Flow
1. User clicks "Forgot password?" on login page
2. Redirected to `/forgot-password` page
3. User enters their email address
4. System sends password reset email via Supabase
5. User sees confirmation message with instructions

### 2. Password Reset Confirmation Flow
1. User receives email with reset link
2. Clicks link with format: `{SITE_URL}/auth/confirm?token_hash={TOKEN}&type=recovery&next=/reset-password`
3. System validates token via `/auth/confirm` route (needs to be created)
4. Redirected to `/reset-password` page with valid recovery session
5. User enters new password (with confirmation)
6. System updates password and redirects to dashboard

### 3. Error Handling Flow
- Invalid/expired tokens show appropriate error
- Network errors are handled gracefully
- User-friendly messages for all error states
- Same success message for valid and invalid emails (prevent user enumeration)

## Technical Implementation Plan

### Phase 1: Request Password Reset Page

#### 1.1 Create `/app/(auth)/forgot-password/page.tsx`
```typescript
// Page wrapper component that follows existing auth page patterns
- Use same layout as login/register pages
- Include branding header
- Add back to login link
```

#### 1.2 Create `/components/auth/forgot-password-form.tsx`
```typescript
// Form component with:
- Email input field
- Loading states
- Error handling
- Success message display
- Rate limiting awareness
```

### Phase 2: Reset Password Page

#### 2.1 Create `/app/(auth)/reset-password/page.tsx`
```typescript
// Protected page that requires valid recovery session
- Check for valid recovery session
- Redirect to login if no session
- Use consistent auth page layout
```

#### 2.2 Create `/components/auth/reset-password-form.tsx`
```typescript
// Form component with:
- New password input
- Confirm password input
- Password strength indicator
- Show/hide password toggle
- Submit with loading state
```

### Phase 3: Email Template Configuration

#### 3.1 Update Supabase Email Template
Configure in Supabase Dashboard under Authentication > Email Templates > Reset Password:
```html
<h2>Reset Password</h2>

<p>Hello,</p>

<p>You requested to reset your password for your Victry account. Click the link below to proceed:</p>

<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">
    Reset Password
  </a>
</p>

<p>If you didn't request this, please ignore this email. This link will expire in 1 hour.</p>

<p>Best regards,<br>The Victry Team</p>
```

### Phase 4: API Integration

#### 4.1 Create Auth Confirm Route
Create `/app/auth/confirm/route.ts` to handle password reset token verification:
- Extract `token_hash`, `type`, and `next` from URL parameters
- Call `supabase.auth.verifyOtp({ token_hash, type })` 
- Handle `type=recovery` for password resets
- Redirect to `next` parameter on success or error page on failure
- Clean up sensitive parameters from redirect URLs

#### 4.2 Add Rate Limiting Middleware
Implement rate limiting for password reset requests to prevent abuse:
- Max 5 requests per email per hour (more forgiving)
- Max 20 requests per IP per hour
- Use Redis or in-memory store for tracking
- Return same success message regardless of email validity

### Phase 5: Security Enhancements

#### 5.1 Password Validation
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Optional: special character requirement
- Check against common passwords list
- No personal info (email parts) in password

#### 5.2 Token Security
- Tokens expire after 1 hour (Supabase default)
- One-time use only
- Secure random generation (handled by Supabase)
- Add `rel="noopener noreferrer"` to reset links
- Set security headers to prevent token leakage

#### 5.3 User Enumeration Protection
- Always show same success message for valid/invalid emails
- Use consistent timing for responses
- Log attempts for security monitoring
- Don't reveal account existence in error messages

## Implementation Steps

### Step 1: Create Auth Confirm Route (1 hour)
- [ ] Create route at `/app/auth/confirm/route.ts`
- [ ] Implement OTP verification for recovery tokens
- [ ] Handle redirects with proper URL sanitization
- [ ] Add error handling and logging

### Step 2: Create Forgot Password Page (2 hours)
- [ ] Create page component at `/app/(auth)/forgot-password/page.tsx`
- [ ] Create form component at `/components/auth/forgot-password-form.tsx`
- [ ] Add email validation using existing utilities
- [ ] Implement Supabase `resetPasswordForEmail` integration
- [ ] Add loading and error states
- [ ] Implement user enumeration protection

### Step 3: Create Reset Password Page (2.5 hours)
- [ ] Create page component at `/app/(auth)/reset-password/page.tsx`
- [ ] Create form component at `/components/auth/reset-password-form.tsx`
- [ ] Add session validation check
- [ ] Add password validation logic
- [ ] Implement Supabase `updateUser` for password change
- [ ] Add success redirect to dashboard
- [ ] Handle OAuth user edge cases

### Step 4: Update Email Templates (30 minutes)
- [ ] Configure reset password email template in Supabase dashboard
- [ ] Test email delivery and formatting
- [ ] Ensure links work correctly with the app URL
- [ ] Add security headers to email links

### Step 5: Testing & Error Handling (2 hours)
- [ ] Test complete flow end-to-end
- [ ] Test error scenarios (invalid email, expired token, etc.)
- [ ] Add proper error messages for all cases
- [ ] Test OAuth user password reset behavior
- [ ] Test user enumeration protection
- [ ] Test rate limiting functionality

### Step 6: Security & Polish (1.5 hours)
- [ ] Implement rate limiting with proper storage
- [ ] Add password strength indicator
- [ ] Ensure CSRF protection
- [ ] Add analytics tracking for password reset events
- [ ] Add security headers to prevent token leakage
- [ ] Implement audit logging for password changes

## Code Examples

### Auth Confirm Route Implementation
```typescript
// /app/auth/confirm/route.ts
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
        // Successful verification - redirect to next page
        return NextResponse.redirect(redirectTo);
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
```

### Forgot Password Form Implementation
```typescript
// /components/auth/forgot-password-form.tsx
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidEmail } from "@/lib/utils/validation";
import { Loader2 } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm`,
      });
      
      if (error) throw error;
      
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4">
        <h3 className="font-medium text-green-800">Check your email</h3>
        <p className="mt-2 text-sm text-green-700">
          We've sent a password reset link to {email}. 
          Please check your inbox and follow the instructions.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form implementation */}
    </form>
  );
}
```

### Reset Password Form Implementation
```typescript
// /components/auth/reset-password-form.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) throw error;
      
      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form implementation */}
    </form>
  );
}
```

## Testing Checklist

### Functional Tests
- [ ] Can request password reset with valid email
- [ ] Cannot request reset with invalid email
- [ ] Receive email with working reset link
- [ ] Can set new password with valid token
- [ ] Cannot use expired token
- [ ] Cannot use token twice
- [ ] Passwords must match
- [ ] Password validation works correctly
- [ ] Successful reset redirects to dashboard

### Edge Cases
- [ ] OAuth users can set initial password
- [ ] Rate limiting prevents spam
- [ ] Works on mobile devices
- [ ] Handles network errors gracefully
- [ ] Deep linking works correctly

### Security Tests
- [ ] Tokens are one-time use
- [ ] Tokens expire after 1 hour
- [ ] No user enumeration via timing attacks
- [ ] No user enumeration via response differences
- [ ] CSRF protection is active
- [ ] Password requirements enforced
- [ ] No token leakage through referrer headers
- [ ] Rate limiting works correctly
- [ ] Invalid tokens handled securely
- [ ] Failed verification attempts are logged

## Monitoring & Analytics

### Events to Track
1. `password_reset_requested` - User requests password reset
2. `password_reset_email_sent` - Email successfully sent
3. `password_reset_completed` - User successfully resets password
4. `password_reset_failed` - Reset attempt failed (with reason)
5. `password_reset_token_verified` - Token successfully verified
6. `password_reset_rate_limited` - Request blocked by rate limiting
7. `password_reset_invalid_token` - Invalid/expired token used

### Metrics to Monitor
- Password reset request rate
- Success rate of password resets
- Time to complete password reset
- Most common error reasons
- Token verification failure rate
- Rate limiting trigger frequency
- Security incident detection (multiple failures)

## Future Enhancements

1. **Security Questions**: Add optional security questions for additional verification
2. **SMS Reset**: Support password reset via SMS for phone-based accounts
3. **Password History**: Prevent reuse of recent passwords
4. **Account Lockout**: Temporary lockout after multiple failed attempts
5. **Passwordless Option**: Offer to switch to magic link authentication

## Conclusion

This comprehensive implementation plan provides a secure, user-friendly password reset flow that integrates seamlessly with the existing Victry authentication system. The implementation leverages Supabase's built-in capabilities while maintaining consistency with the application's design patterns and security requirements.

### Key Security Features
- Protection against user enumeration attacks
- Comprehensive rate limiting
- Secure token handling with proper cleanup
- Strong password validation requirements
- Audit logging for security monitoring

### Critical Updates Made
1. Added the essential `/auth/confirm` route implementation
2. Enhanced security measures against enumeration attacks
3. Improved rate limiting with more forgiving limits
4. Added comprehensive testing checklist
5. Included audit logging and monitoring requirements

### OAuth User Considerations
Special attention should be paid to OAuth users who may not have passwords initially. The implementation should handle these cases gracefully, potentially offering to link their OAuth account with an email/password method.

**Estimated Total Implementation Time: 10-12 hours** (revised to account for comprehensive security testing and edge case handling)