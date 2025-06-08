import { NextRequest, NextResponse } from 'next/server';
import { createActionClient } from '@/lib/supabase/client';
import { isValidEmail } from '@/lib/utils/validation';
import {
  checkPasswordResetEmailRateLimit,
  checkPasswordResetIPRateLimit,
  getClientIP,
  formatRemainingTime,
} from '@/lib/utils/rate-limiter';
import { createApiError, ErrorCategory, ErrorCode } from '@/lib/utils/error-utils';

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const body = await request.json();
    const { email } = body;

    // Validate email format
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(createApiError({
        message: 'Please provide a valid email address',
        category: ErrorCategory.VALIDATION,
        code: ErrorCode.VALIDATION_INVALID_FORMAT,
      }), { status: 400 });
    }

    // Check IP rate limiting first (broader protection)
    const ipRateLimit = checkPasswordResetIPRateLimit(clientIP);
    if (!ipRateLimit.allowed) {
      const remainingTime = formatRemainingTime(ipRateLimit.remainingTime || 0);
      return NextResponse.json(createApiError({
        message: `Too many password reset requests from this location. Please try again in ${remainingTime}.`,
        category: ErrorCategory.RATE_LIMIT,
        code: ErrorCode.RATE_LIMIT_EXCEEDED,
      }), { status: 429 });
    }

    // Check email-specific rate limiting
    const emailRateLimit = checkPasswordResetEmailRateLimit(email);
    if (!emailRateLimit.allowed) {
      const remainingTime = formatRemainingTime(emailRateLimit.remainingTime || 0);
      // Return success message to prevent user enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.',
        data: { email }
      });
    }

    // Create Supabase client and attempt password reset
    const supabase = await createActionClient();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${request.nextUrl.origin}/auth/confirm?next=/reset-password`,
    });

    if (error) {
      // Log the actual error for monitoring but don't expose it
      console.error('Password reset error:', {
        error: error.message,
        email: email,
        ip: clientIP,
        timestamp: new Date().toISOString(),
      });
    }

    // Always return success to prevent user enumeration
    // This is a security best practice for password reset endpoints
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
      data: { email }
    });

  } catch (error) {
    console.error('Unexpected error in forgot password endpoint:', error);
    return NextResponse.json(createApiError({
      message: 'An unexpected error occurred. Please try again later.',
      category: ErrorCategory.SERVER,
      code: ErrorCode.SERVER_INTERNAL_ERROR,
    }), { status: 500 });
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(createApiError({
    message: 'Method not allowed',
    category: ErrorCategory.VALIDATION,
    code: ErrorCode.VALIDATION_INVALID_DATA,
  }), { status: 405 });
}

export async function PUT() {
  return NextResponse.json(createApiError({
    message: 'Method not allowed',
    category: ErrorCategory.VALIDATION,
    code: ErrorCode.VALIDATION_INVALID_DATA,
  }), { status: 405 });
}

export async function DELETE() {
  return NextResponse.json(createApiError({
    message: 'Method not allowed',
    category: ErrorCategory.VALIDATION,
    code: ErrorCode.VALIDATION_INVALID_DATA,
  }), { status: 405 });
}