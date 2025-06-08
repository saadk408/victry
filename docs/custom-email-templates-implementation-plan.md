# Custom Email Templates Implementation Plan

## Executive Summary

This document provides a comprehensive implementation plan for creating branded, accessible, and high-converting email templates for all authentication flows in the Victry application. The templates will enhance user experience, improve email deliverability, and strengthen brand identity.

**Estimated Time**: 16-20 hours
**Priority**: High (User-facing improvement)
**Dependencies**: Supabase email system understanding

## Table of Contents

1. [Design System & Brand Guidelines](#design-system--brand-guidelines)
2. [Technical Architecture](#technical-architecture)
3. [Template Specifications](#template-specifications)
4. [Implementation Details](#implementation-details)
5. [Cross-Client Compatibility](#cross-client-compatibility)
6. [Accessibility Standards](#accessibility-standards)
7. [Dark Mode Support](#dark-mode-support)
8. [Testing Strategy](#testing-strategy)
9. [Performance Optimization](#performance-optimization)
10. [Localization Support](#localization-support)
11. [Analytics & Tracking](#analytics--tracking)
12. [Deployment Process](#deployment-process)
13. [A/B Testing Framework](#ab-testing-framework)
14. [Success Metrics](#success-metrics)

## Design System & Brand Guidelines

### Brand Colors
```css
/* Primary Palette */
--victry-primary: #2563eb;      /* Blue 600 */
--victry-primary-dark: #1e40af; /* Blue 700 */
--victry-secondary: #7c3aed;    /* Purple 600 */
--victry-success: #16a34a;      /* Green 600 */
--victry-warning: #ea580c;      /* Orange 600 */
--victry-error: #dc2626;        /* Red 600 */

/* Neutral Palette */
--victry-gray-900: #111827;
--victry-gray-700: #374151;
--victry-gray-500: #6b7280;
--victry-gray-300: #d1d5db;
--victry-gray-100: #f3f4f6;
--victry-gray-50: #f9fafb;

/* Dark Mode Palette */
--victry-dark-bg: #1f2937;
--victry-dark-surface: #111827;
--victry-dark-text: #f3f4f6;
--victry-dark-text-muted: #9ca3af;
```

### Typography
```css
/* Font Stack */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 
             'Segoe UI Emoji', 'Segoe UI Symbol';

/* Type Scale */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### Spacing System
```css
/* Consistent spacing scale */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

## Technical Architecture

### Supabase Email System Overview
```yaml
# Email Template Variables Available
{{ .SiteURL }}           # Your site URL
{{ .Token }}             # 6-digit OTP code
{{ .TokenHash }}         # Token hash for magic links
{{ .Email }}             # User's email
{{ .ConfirmationURL }}   # Full confirmation URL
{{ .RedirectTo }}        # Redirect URL after action
```

### Template Structure
```
supabase/
├── templates/
│   ├── base.html                    # Base template with shared styles
│   ├── auth/
│   │   ├── confirm.html            # Email confirmation
│   │   ├── recovery.html           # Password reset
│   │   ├── magic-link.html         # Magic link login
│   │   └── change-email.html       # Email change confirmation
│   ├── notifications/
│   │   ├── welcome.html            # Welcome email
│   │   ├── security-alert.html     # Security notifications
│   │   └── account-deleted.html    # Account deletion
│   └── partials/
│       ├── header.html             # Reusable header
│       ├── footer.html             # Reusable footer
│       ├── button.html             # CTA button component
│       └── social-links.html       # Social media links
```

## Template Specifications

### 1. Base Template (base.html)
```html
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>{{ .Subject }}</title>
  
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  
  <style>
    /* Reset Styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    /* Remove default styling */
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }
    
    /* Base Styles */
    body {
      background-color: #f5f5f7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #111827;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* Container Styles */
    .email-wrapper {
      background-color: #f5f5f7;
      padding: 40px 20px;
    }
    
    .email-container {
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      margin: 0 auto;
      max-width: 600px;
      overflow: hidden;
    }
    
    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      color: #111827;
      font-weight: 600;
      line-height: 1.25;
      margin: 0 0 16px;
    }
    
    h1 { font-size: 30px; }
    h2 { font-size: 24px; }
    h3 { font-size: 20px; }
    
    p {
      color: #374151;
      font-size: 16px;
      line-height: 1.625;
      margin: 0 0 16px;
    }
    
    /* Button Styles */
    .btn {
      border-radius: 8px;
      display: inline-block;
      font-size: 16px;
      font-weight: 600;
      line-height: 1;
      padding: 16px 32px;
      text-align: center;
      text-decoration: none;
      transition: all 0.15s ease;
      -webkit-text-size-adjust: none;
      mso-padding-alt: 0;
    }
    
    .btn-primary {
      background-color: #2563eb;
      color: #ffffff;
    }
    
    .btn-secondary {
      background-color: #f3f4f6;
      color: #111827;
    }
    
    /* Utility Classes */
    .text-center { text-align: center; }
    .text-muted { color: #6b7280; }
    .text-small { font-size: 14px; }
    .mt-4 { margin-top: 16px; }
    .mb-4 { margin-bottom: 16px; }
    .py-8 { padding-top: 32px; padding-bottom: 32px; }
    
    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      body, .email-wrapper { background-color: #1f2937 !important; }
      .email-container { background-color: #111827 !important; }
      h1, h2, h3, h4, h5, h6 { color: #f3f4f6 !important; }
      p { color: #d1d5db !important; }
      .text-muted { color: #9ca3af !important; }
      .btn-secondary { background-color: #374151 !important; color: #f3f4f6 !important; }
    }
    
    /* Mobile Responsive */
    @media screen and (max-width: 600px) {
      .email-wrapper { padding: 20px 10px !important; }
      .email-container { border-radius: 8px !important; }
      h1 { font-size: 24px !important; }
      h2 { font-size: 20px !important; }
      .btn { padding: 14px 24px !important; font-size: 14px !important; }
      .hide-mobile { display: none !important; }
      .stack-mobile { display: block !important; width: 100% !important; }
    }
    
    /* Outlook Specific */
    <!--[if mso]>
    <style type="text/css">
      .btn { border: none !important; }
      table { border-collapse: collapse; }
    </style>
    <![endif]-->
  </style>
</head>
<body>
  <div role="article" aria-roledescription="email" aria-label="{{ .Subject }}" lang="en" class="email-wrapper">
    <!--[if mso]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
    <td align="center">
    <![endif]-->
    
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container">
      <!-- Header -->
      <tr>
        <td align="center" style="padding: 40px 40px 20px;">
          <a href="{{ .SiteURL }}" style="display: inline-block;">
            <img src="{{ .SiteURL }}/images/logo.png" alt="Victry" width="150" height="50" style="display: block; max-width: 150px; height: auto;">
          </a>
        </td>
      </tr>
      
      <!-- Main Content -->
      {{ template "content" . }}
      
      <!-- Footer -->
      <tr>
        <td style="padding: 40px; background-color: #f9fafb;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" class="text-small text-muted">
                <p style="margin: 0 0 8px;">
                  © 2024 Victry. All rights reserved.
                </p>
                <p style="margin: 0 0 8px;">
                  123 Innovation Way, San Francisco, CA 94105
                </p>
                <p style="margin: 0;">
                  <a href="{{ .SiteURL }}/privacy" style="color: #6b7280; text-decoration: underline;">Privacy Policy</a> • 
                  <a href="{{ .SiteURL }}/terms" style="color: #6b7280; text-decoration: underline;">Terms of Service</a> • 
                  <a href="{{ .SiteURL }}/unsubscribe?token={{ .UnsubscribeToken }}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!--[if mso]>
    </td>
    </tr>
    </table>
    <![endif]-->
  </div>
</body>
</html>
```

### 2. Password Reset Template (recovery.html)
```html
{{ define "content" }}
<tr>
  <td style="padding: 20px 40px 40px;">
    <!-- Icon -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding-bottom: 20px;">
          <div style="background-color: #dbeafe; border-radius: 12px; display: inline-block; padding: 16px;">
            <img src="{{ .SiteURL }}/images/icons/lock.png" alt="" width="32" height="32" style="display: block;">
          </div>
        </td>
      </tr>
    </table>
    
    <!-- Content -->
    <h1 style="text-align: center; margin: 0 0 8px;">Reset Your Password</h1>
    <p style="text-align: center; color: #6b7280; margin: 0 0 32px;">
      We received a request to reset your password for your Victry account.
    </p>
    
    <!-- OTP Code Display -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 32px;">
      <tr>
        <td align="center">
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; display: inline-block;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
              Your verification code:
            </p>
            <p style="margin: 0; font-size: 32px; font-weight: 700; color: #111827; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              {{ .Token }}
            </p>
            <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">
              Valid for 1 hour
            </p>
          </div>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 32px;">
      <tr>
        <td align="center">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="17%" stroke="f" fillcolor="#2563eb">
            <w:anchorlock/>
            <center>
          <![endif]-->
          <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password" class="btn btn-primary" style="display: inline-block; mso-hide: all;">
            Reset Password
          </a>
          <!--[if mso]>
            </center>
          </v:roundrect>
          <![endif]-->
        </td>
      </tr>
    </table>
    
    <!-- Alternative Link -->
    <p style="text-align: center; font-size: 14px; color: #6b7280; margin: 0 0 32px;">
      Or copy and paste this link into your browser:<br>
      <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password" style="color: #2563eb; text-decoration: underline; word-break: break-all;">
        {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
      </a>
    </p>
    
    <!-- Security Notice -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="border-top: 1px solid #e5e7eb; padding-top: 32px;">
          <p style="font-size: 14px; color: #6b7280; margin: 0;">
            <strong>Didn't request this?</strong><br>
            If you didn't request a password reset, you can safely ignore this email. Your password won't be changed until you click the link above and create a new password.
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>
{{ end }}
```

### 3. Welcome Email Template (welcome.html)
```html
{{ define "content" }}
<tr>
  <td style="padding: 20px 40px 40px;">
    <!-- Hero Section -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding-bottom: 32px;">
          <h1 style="margin: 0 0 8px; font-size: 36px;">Welcome to Victry! 🎉</h1>
          <p style="margin: 0; font-size: 18px; color: #6b7280;">
            Your journey to landing your dream job starts here.
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Features Grid -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 32px;">
      <!-- Feature 1 -->
      <tr>
        <td style="padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="48" valign="top">
                <img src="{{ .SiteURL }}/images/icons/sparkles.png" alt="" width="32" height="32" style="display: block;">
              </td>
              <td style="padding-left: 16px;">
                <h3 style="margin: 0 0 4px; font-size: 18px;">AI-Powered Resume Tailoring</h3>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  Match your resume perfectly to any job description with our Claude AI integration.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <tr><td style="height: 12px;"></td></tr>
      
      <!-- Feature 2 -->
      <tr>
        <td style="padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="48" valign="top">
                <img src="{{ .SiteURL }}/images/icons/chart.png" alt="" width="32" height="32" style="display: block;">
              </td>
              <td style="padding-left: 16px;">
                <h3 style="margin: 0 0 4px; font-size: 18px;">ATS Optimization</h3>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  Ensure your resume passes applicant tracking systems with our real-time scoring.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <tr><td style="height: 12px;"></td></tr>
      
      <!-- Feature 3 -->
      <tr>
        <td style="padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="48" valign="top">
                <img src="{{ .SiteURL }}/images/icons/template.png" alt="" width="32" height="32" style="display: block;">
              </td>
              <td style="padding-left: 16px;">
                <h3 style="margin: 0 0 4px; font-size: 18px;">Professional Templates</h3>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  Choose from modern, ATS-friendly designs that make you stand out.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- CTA Buttons -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 32px;">
      <tr>
        <td align="center">
          <a href="{{ .SiteURL }}/resume/create" class="btn btn-primary" style="display: inline-block; margin: 0 8px 8px 0;">
            Create Your First Resume
          </a>
          <a href="{{ .SiteURL }}/dashboard" class="btn btn-secondary" style="display: inline-block; margin: 0 0 8px;">
            Explore Dashboard
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Getting Started Tips -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="border-top: 1px solid #e5e7eb; padding-top: 32px;">
          <h3 style="margin: 0 0 16px;">Quick Start Guide:</h3>
          <ol style="margin: 0; padding-left: 20px; color: #374151;">
            <li style="margin-bottom: 8px;">Complete your profile to unlock all features</li>
            <li style="margin-bottom: 8px;">Upload your existing resume or start from scratch</li>
            <li style="margin-bottom: 8px;">Find a job posting and let AI tailor your resume</li>
            <li style="margin-bottom: 8px;">Download in multiple formats (PDF, DOCX, TXT)</li>
          </ol>
        </td>
      </tr>
    </table>
    
    <!-- Support Section -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px;">
      <tr>
        <td align="center" style="padding: 24px; background-color: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0 0 8px; font-weight: 600;">Need Help?</p>
          <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">
            Our support team is here to help you succeed.
          </p>
          <a href="{{ .SiteURL }}/support" style="color: #2563eb; text-decoration: underline; font-weight: 600;">
            Visit Help Center
          </a>
        </td>
      </tr>
    </table>
  </td>
</tr>
{{ end }}
```

### 4. Security Alert Template (security-alert.html)
```html
{{ define "content" }}
<tr>
  <td style="padding: 20px 40px 40px;">
    <!-- Alert Banner -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px;">
      <tr>
        <td style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="24" valign="top">
                <img src="{{ .SiteURL }}/images/icons/alert.png" alt="" width="20" height="20" style="display: block;">
              </td>
              <td style="padding-left: 12px;">
                <p style="margin: 0; color: #991b1b; font-weight: 600;">
                  Security Alert: {{ .AlertType }}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Content -->
    <h2 style="margin: 0 0 16px;">Unusual Activity Detected</h2>
    <p style="margin: 0 0 24px;">
      We noticed {{ .ActivityDescription }} on your Victry account.
    </p>
    
    <!-- Activity Details -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 32px;">
      <tr>
        <td style="background-color: #f9fafb; border-radius: 8px; padding: 24px;">
          <h3 style="margin: 0 0 16px; font-size: 16px;">Activity Details:</h3>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding-bottom: 8px;">
                <strong style="color: #6b7280;">Date & Time:</strong><br>
                {{ .ActivityTime }}
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 8px;">
                <strong style="color: #6b7280;">Location:</strong><br>
                {{ .Location }}
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 8px;">
                <strong style="color: #6b7280;">Device:</strong><br>
                {{ .Device }}
              </td>
            </tr>
            <tr>
              <td>
                <strong style="color: #6b7280;">IP Address:</strong><br>
                {{ .IPAddress }}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Action Buttons -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 32px;">
      <tr>
        <td align="center">
          <p style="margin: 0 0 16px; font-weight: 600;">Was this you?</p>
          <a href="{{ .SiteURL }}/security/verify?token={{ .VerifyToken }}&action=confirm" class="btn btn-primary" style="display: inline-block; margin: 0 8px 8px 0;">
            Yes, This Was Me
          </a>
          <a href="{{ .SiteURL }}/security/verify?token={{ .VerifyToken }}&action=secure" class="btn btn-secondary" style="display: inline-block; margin: 0 0 8px; background-color: #dc2626; color: #ffffff;">
            Secure My Account
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Security Tips -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="border-top: 1px solid #e5e7eb; padding-top: 32px;">
          <h3 style="margin: 0 0 16px; font-size: 16px;">Keep Your Account Secure:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            <li style="margin-bottom: 8px;">Use a strong, unique password</li>
            <li style="margin-bottom: 8px;">Enable two-factor authentication</li>
            <li style="margin-bottom: 8px;">Review your account activity regularly</li>
            <li style="margin-bottom: 8px;">Never share your login credentials</li>
          </ul>
        </td>
      </tr>
    </table>
  </td>
</tr>
{{ end }}
```

## Implementation Details

### 1. Supabase Configuration

```toml
# supabase/config.toml
[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[auth.email.template.recovery]
subject = "Reset Your Victry Password"
content_path = "./templates/auth/recovery.html"

[auth.email.template.confirmation]
subject = "Confirm Your Victry Email"
content_path = "./templates/auth/confirm.html"

[auth.email.template.magic_link]
subject = "Your Victry Magic Link"
content_path = "./templates/auth/magic-link.html"

[auth.email.template.change_email]
subject = "Confirm Your New Email"
content_path = "./templates/auth/change-email.html"
```

### 2. Local Development Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize local project
supabase init

# Start local development
supabase start

# Test email templates
supabase functions serve send-test-email --env-file .env.local
```

### 3. Test Email Function

```typescript
// supabase/functions/send-test-email/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

serve(async (req) => {
  const { email, template } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Send test email
  const { error } = await supabase.auth.admin.generateLink({
    type: template || 'recovery',
    email,
  })
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## Cross-Client Compatibility

### Email Client Support Matrix

| Client | Version | HTML | CSS | Dark Mode | Notes |
|--------|---------|------|-----|-----------|-------|
| **Gmail** | Web/Mobile | ✅ | Partial | ✅ | No `<style>` in `<head>` |
| **Outlook** | 2019+ | ✅ | Limited | ✅ | Use VML for buttons |
| **Apple Mail** | 13+ | ✅ | ✅ | ✅ | Full support |
| **Yahoo Mail** | Current | ✅ | Partial | ❌ | Media queries issues |
| **Outlook.com** | Current | ✅ | Partial | ✅ | Better than desktop |
| **iOS Mail** | 13+ | ✅ | ✅ | ✅ | Excellent support |
| **Android** | 6+ | ✅ | Partial | Varies | Depends on app |

### Compatibility Guidelines

1. **Use Tables for Layout**
   ```html
   <!-- ✅ DO: Table-based layout -->
   <table role="presentation" width="100%">
     <tr>
       <td align="center">Content</td>
     </tr>
   </table>
   
   <!-- ❌ DON'T: Flexbox/Grid -->
   <div style="display: flex;">Content</div>
   ```

2. **Inline CSS for Critical Styles**
   ```html
   <!-- ✅ DO: Inline styles -->
   <p style="color: #111827; font-size: 16px;">Text</p>
   
   <!-- ❌ DON'T: Only external styles -->
   <p class="body-text">Text</p>
   ```

3. **VML for Outlook Buttons**
   ```html
   <!--[if mso]>
   <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" 
                xmlns:w="urn:schemas-microsoft-com:office:word" 
                href="https://example.com" 
                style="height:48px;v-text-anchor:middle;width:200px;" 
                arcsize="17%" 
                stroke="f" 
                fillcolor="#2563eb">
     <w:anchorlock/>
     <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">
       Button Text
     </center>
   </v:roundrect>
   <![endif]-->
   ```

## Accessibility Standards

### WCAG 2.1 AA Compliance

1. **Semantic HTML**
   ```html
   <!-- Use proper heading hierarchy -->
   <h1>Main Title</h1>
   <h2>Section Title</h2>
   <h3>Subsection Title</h3>
   
   <!-- Role attributes for tables -->
   <table role="presentation">
   ```

2. **Color Contrast**
   ```css
   /* Minimum contrast ratios */
   /* Normal text: 4.5:1 */
   color: #374151; /* on #ffffff = 7.04:1 ✅ */
   
   /* Large text: 3:1 */
   color: #6b7280; /* on #ffffff = 4.65:1 ✅ */
   ```

3. **Alt Text**
   ```html
   <!-- Informative images -->
   <img src="logo.png" alt="Victry Logo" width="150" height="50">
   
   <!-- Decorative images -->
   <img src="decoration.png" alt="" role="presentation">
   ```

4. **Link Context**
   ```html
   <!-- ✅ DO: Descriptive link text -->
   <a href="/reset">Reset your password</a>
   
   <!-- ❌ DON'T: Generic link text -->
   <a href="/reset">Click here</a>
   ```

### Screen Reader Testing

```javascript
// Test with NVDA/JAWS
describe('Email Accessibility', () => {
  it('should announce heading hierarchy correctly', () => {
    const headings = screen.getAllByRole('heading');
    expect(headings[0]).toHaveProperty('level', 1);
  });
  
  it('should have descriptive link text', () => {
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link.textContent).not.toMatch(/click here|here|link/i);
    });
  });
});
```

## Dark Mode Support

### Implementation Strategy

1. **Meta Tags**
   ```html
   <meta name="color-scheme" content="light dark">
   <meta name="supported-color-schemes" content="light dark">
   ```

2. **CSS Media Query**
   ```css
   @media (prefers-color-scheme: dark) {
     /* Dark mode overrides */
     body { background-color: #1f2937 !important; }
     .email-container { background-color: #111827 !important; }
     h1, h2, h3 { color: #f3f4f6 !important; }
     p { color: #d1d5db !important; }
   }
   ```

3. **Duplicate Styles for Outlook**
   ```html
   <style>
     /* Light mode (default) */
     .content { background-color: #ffffff; color: #111827; }
     
     /* Dark mode */
     @media (prefers-color-scheme: dark) {
       .content { background-color: #111827 !important; color: #f3f4f6 !important; }
     }
   </style>
   
   <!--[if mso]>
   <style>
     @media (prefers-color-scheme: dark) {
       .content { background-color: #111827 !important; color: #f3f4f6 !important; }
     }
   </style>
   <![endif]-->
   ```

### Testing Dark Mode

```bash
# Test in different clients
1. Gmail: Settings > Theme > Dark
2. Outlook: File > Office Account > Office Theme > Black
3. Apple Mail: System Preferences > General > Appearance > Dark
4. iOS: Settings > Display & Brightness > Dark
```

## Testing Strategy

### 1. Unit Testing

```typescript
// __tests__/email-templates/template-renderer.test.ts
import { renderTemplate } from '@/lib/email/template-renderer';

describe('Email Template Renderer', () => {
  it('should render password reset template correctly', () => {
    const html = renderTemplate('recovery', {
      SiteURL: 'https://victry.com',
      Token: '123456',
      TokenHash: 'abc123',
      Email: 'user@example.com',
    });
    
    expect(html).toContain('Reset Your Password');
    expect(html).toContain('123456');
    expect(html).toContain('user@example.com');
  });
  
  it('should escape HTML in user input', () => {
    const html = renderTemplate('welcome', {
      Email: '<script>alert("xss")</script>@example.com',
    });
    
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
```

### 2. Visual Regression Testing

```typescript
// __tests__/email-templates/visual-regression.test.ts
import { emailScreenshot } from '@/tests/utils/email-screenshot';

describe('Email Visual Regression', () => {
  const templates = ['recovery', 'welcome', 'confirmation'];
  const viewports = [
    { width: 600, height: 800, name: 'desktop' },
    { width: 375, height: 667, name: 'mobile' },
  ];
  
  templates.forEach(template => {
    viewports.forEach(viewport => {
      it(`should match ${template} on ${viewport.name}`, async () => {
        const screenshot = await emailScreenshot(template, viewport);
        expect(screenshot).toMatchImageSnapshot({
          customSnapshotIdentifier: `${template}-${viewport.name}`,
          threshold: 0.01,
        });
      });
    });
  });
});
```

### 3. Email Client Testing Tools

1. **Litmus** (Recommended)
   - Test in 90+ email clients
   - Spam testing
   - Link validation
   - Load time analysis

2. **Email on Acid**
   - Similar to Litmus
   - Good Outlook testing
   
3. **Mail Tester**
   - Free spam scoring
   - Deliverability checks

### 4. Manual Testing Checklist

```markdown
## Email Template Testing Checklist

### Desktop Clients
- [ ] Gmail (Chrome, Firefox, Safari)
- [ ] Outlook 2019/365
- [ ] Apple Mail
- [ ] Yahoo Mail
- [ ] Outlook.com

### Mobile Clients
- [ ] Gmail (iOS/Android)
- [ ] Apple Mail (iOS)
- [ ] Outlook (iOS/Android)
- [ ] Samsung Mail

### Dark Mode
- [ ] Gmail Dark Mode
- [ ] Outlook Dark Mode
- [ ] Apple Mail Dark Mode
- [ ] iOS Dark Mode

### Accessibility
- [ ] Screen reader testing (NVDA/JAWS)
- [ ] Keyboard navigation
- [ ] Color contrast (WCAG AA)
- [ ] Font size minimum 14px

### Functionality
- [ ] All links work
- [ ] Images load (and alt text shows when blocked)
- [ ] Buttons clickable
- [ ] Responsive on mobile
- [ ] Preheader text correct
```

## Performance Optimization

### 1. Image Optimization

```html
<!-- Use appropriate formats -->
<img src="logo.png" width="150" height="50" alt="Victry">

<!-- Provide 2x for retina -->
<img src="logo.png" srcset="logo@2x.png 2x" width="150" height="50" alt="Victry">

<!-- Inline critical images as base64 -->
<img src="data:image/png;base64,iVBORw0KG..." alt="Icon">
```

### 2. CSS Optimization

```css
/* Minify and inline critical CSS */
<style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}</style>

/* Remove unused styles */
/* Use CSS inliner tools for production */
```

### 3. Load Time Guidelines

- **Total size**: < 102KB (Gmail clipping threshold)
- **Image total**: < 1MB
- **Load time**: < 3 seconds on 3G
- **External resources**: Minimize (host on CDN)

### 4. Preheader Optimization

```html
<!-- Hidden preheader text -->
<div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
  Reset your password with this secure link. Valid for 1 hour.
  &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>
```

## Localization Support

### 1. Template Structure

```html
<!-- templates/auth/recovery.{{.Locale}}.html -->
<!-- templates/auth/recovery.es.html -->
<!-- templates/auth/recovery.fr.html -->
```

### 2. Locale Detection

```typescript
// lib/email/locale-detector.ts
export function detectUserLocale(user: User): string {
  return user.locale || 
         user.browser_locale || 
         'en';
}
```

### 3. Translation Management

```json
// translations/email/en.json
{
  "recovery": {
    "subject": "Reset Your Password",
    "title": "Reset Your Password",
    "description": "We received a request to reset your password",
    "button": "Reset Password",
    "expires": "Valid for 1 hour"
  }
}
```

### 4. RTL Support

```css
/* RTL languages */
[dir="rtl"] .email-container {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .btn {
  direction: ltr; /* Keep buttons LTR */
}
```

## Analytics & Tracking

### 1. UTM Parameters

```html
<!-- Add tracking to links -->
<a href="{{ .SiteURL }}/dashboard?utm_source=email&utm_medium=welcome&utm_campaign=onboarding">
  View Dashboard
</a>
```

### 2. Pixel Tracking

```html
<!-- Open tracking pixel -->
<img src="{{ .SiteURL }}/api/email/track/open/{{ .EmailID }}" 
     width="1" 
     height="1" 
     alt=""
     style="display: block; width: 1px; height: 1px; border: 0;">
```

### 3. Click Tracking

```typescript
// api/email/track/click/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const emailId = searchParams.get('id');
  const link = searchParams.get('url');
  
  // Log click event
  await logEmailEvent({
    emailId,
    event: 'click',
    link,
    timestamp: new Date(),
  });
  
  // Redirect to actual URL
  return Response.redirect(link);
}
```

### 4. Analytics Dashboard

```sql
-- Email performance metrics
SELECT 
  template,
  COUNT(*) as sent,
  SUM(CASE WHEN opened THEN 1 ELSE 0 END) as opens,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicks,
  AVG(CASE WHEN opened THEN 1 ELSE 0 END) as open_rate,
  AVG(CASE WHEN clicked THEN 1 ELSE 0 END) as click_rate
FROM email_events
WHERE sent_at > NOW() - INTERVAL '7 days'
GROUP BY template
ORDER BY sent DESC;
```

## Deployment Process

### 1. Local Development

```bash
# Start local Supabase
supabase start

# Test templates locally
npm run test:emails

# Preview in browser
npm run preview:emails
```

### 2. Staging Deployment

```bash
# Deploy to staging
supabase deploy --project-ref staging-project-ref

# Run E2E tests
npm run test:emails:e2e

# Manual verification
npm run verify:emails:staging
```

### 3. Production Deployment

```bash
# Final checks
npm run lint:emails
npm run test:emails:production

# Deploy to production
supabase deploy --project-ref prod-project-ref

# Monitor for 24 hours
npm run monitor:emails
```

### 4. Rollback Procedure

```bash
# Quick rollback
supabase deploy --project-ref prod-project-ref --version previous

# Or specific version
supabase deploy --project-ref prod-project-ref --version v1.2.3
```

## A/B Testing Framework

### 1. Test Configuration

```typescript
// lib/email/ab-testing.ts
interface EmailABTest {
  id: string;
  variants: {
    control: string;
    variant: string;
  };
  allocation: number; // 0-1 percentage for variant
  metrics: string[];
}

const activeTests: EmailABTest[] = [
  {
    id: 'welcome-cta-color',
    variants: {
      control: 'templates/welcome.html',
      variant: 'templates/welcome-green-cta.html',
    },
    allocation: 0.5,
    metrics: ['open_rate', 'click_rate', 'activation_rate'],
  },
];
```

### 2. Variant Selection

```typescript
export function selectEmailVariant(
  userId: string, 
  testId: string
): 'control' | 'variant' {
  const test = activeTests.find(t => t.id === testId);
  if (!test) return 'control';
  
  // Consistent assignment based on user ID
  const hash = createHash('sha256')
    .update(`${userId}-${testId}`)
    .digest('hex');
  
  const assignment = parseInt(hash.substring(0, 8), 16) / 0xffffffff;
  
  return assignment < test.allocation ? 'variant' : 'control';
}
```

### 3. Results Analysis

```sql
-- A/B test results
WITH test_results AS (
  SELECT 
    variant,
    COUNT(*) as sent,
    SUM(opened::int) as opens,
    SUM(clicked::int) as clicks,
    SUM(converted::int) as conversions
  FROM email_ab_tests
  WHERE test_id = 'welcome-cta-color'
    AND sent_at > NOW() - INTERVAL '7 days'
  GROUP BY variant
)
SELECT 
  variant,
  sent,
  opens::float / sent as open_rate,
  clicks::float / opens as click_to_open_rate,
  conversions::float / sent as conversion_rate
FROM test_results;
```

## Success Metrics

### 1. Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Delivery Rate | >98% | Sent - Bounced / Sent |
| Inbox Placement | >95% | Inbox / (Inbox + Spam) |
| Load Time | <3s | Time to full render |
| Template Size | <102KB | Total HTML size |
| Spam Score | <3.0 | SpamAssassin score |

### 2. Engagement Metrics

| Metric | Target | Current | Industry Avg |
|--------|--------|---------|--------------|
| Open Rate | >25% | TBD | 21.5% |
| Click Rate | >3.5% | TBD | 2.3% |
| Click-to-Open | >15% | TBD | 10.5% |
| Unsubscribe | <0.5% | TBD | 0.7% |

### 3. Business Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Password Reset Completion | >70% | Completed / Initiated |
| Welcome Email Activation | >40% | Created Resume / Welcome Sent |
| Re-engagement Rate | >20% | Returned / Dormant Emailed |

### 4. Monitoring Dashboard

```typescript
// app/api/email/metrics/route.ts
export async function GET() {
  const metrics = await db.query(`
    SELECT 
      template,
      DATE_TRUNC('day', sent_at) as date,
      COUNT(*) as sent,
      AVG(CASE WHEN opened THEN 1 ELSE 0 END) as open_rate,
      AVG(CASE WHEN clicked THEN 1 ELSE 0 END) as click_rate,
      AVG(CASE WHEN bounced THEN 1 ELSE 0 END) as bounce_rate,
      AVG(CASE WHEN marked_spam THEN 1 ELSE 0 END) as spam_rate
    FROM email_events
    WHERE sent_at > NOW() - INTERVAL '30 days'
    GROUP BY template, date
    ORDER BY date DESC, template
  `);
  
  return Response.json({ metrics });
}
```

## Conclusion

This comprehensive implementation plan provides everything needed to create professional, accessible, and high-converting email templates for the Victry application. The templates will significantly improve user experience, strengthen brand identity, and provide valuable metrics for continuous improvement.

### Immediate Next Steps

1. Set up local Supabase environment
2. Create base template with brand styles
3. Implement password reset template
4. Begin cross-client testing
5. Deploy to staging environment

### Long-term Roadmap

1. **Month 1**: Core transactional emails
2. **Month 2**: Marketing automation templates  
3. **Month 3**: Advanced personalization
4. **Month 4**: Multi-language support

The investment in quality email templates will pay dividends in improved user engagement, reduced support burden, and stronger brand perception.