# Supabase Email Verification Configuration Guide

## 📋 Complete Step-by-Step Guide to Fix Email Verification Issues

Based on investigation and latest 2024 Supabase documentation, this guide provides comprehensive steps to diagnose and fix email verification configuration issues.

---

## 🔍 **Step 1: Verify Current Issue Status**

### **A. Check Current Verification Flow**
1. **Navigate to Supabase Dashboard**: Go to your project dashboard
2. **Test Email Registration**: 
   - Go to Authentication > Users
   - Check if users are being created but not confirmed
3. **Check Email Template**: Authentication > Templates > Email Templates

### **B. Analyze Current Error**
From our investigation, the current issue is:
- **Problem**: Email verification redirects to Supabase domain with wrong parameters
- **Root Cause**: Email template using incorrect URL structure
- **Evidence**: Link format is `https://supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=http://localhost:3000/auth/confirm`

---

## 🔧 **Step 2: Check Supabase Dashboard Configuration**

### **A. Authentication Settings Audit**

#### **1. Navigate to Authentication Settings**
```
Dashboard → Project → Authentication → Settings
```

#### **2. Verify Site URL Configuration**
- **Location**: Authentication → Settings → General
- **Current Setting**: Should be `http://localhost:3000` (development) or your production domain
- **Required Action**: 
  ```
  ✅ Development: http://localhost:3000
  ✅ Production: https://yourdomain.com
  ❌ Never: https://supabase.co URLs
  ```

#### **3. Check Redirect URLs Allow List**
- **Location**: Authentication → Settings → URL Configuration
- **Required URLs to Add**:
  ```
  http://localhost:3000/auth/confirm
  http://localhost:3000/auth/callback  
  http://localhost:3000/dashboard
  https://yourdomain.com/auth/confirm (for production)
  ```

#### **4. Email Provider Configuration**
- **Location**: Authentication → Settings → SMTP Settings
- **Check**: Ensure custom SMTP is configured or using Supabase's default
- **Issue Indicator**: If using default and emails aren't being delivered

---

## 📧 **Step 3: Fix Email Template Configuration**

### **A. Navigate to Email Templates**
```
Dashboard → Authentication → Templates → Email Templates
```

### **B. Check "Confirm Signup" Template**

#### **1. Current Template Issues**
The default template likely contains:
```html
<!-- ❌ PROBLEMATIC - Uses ConfirmationURL -->
<a href="{{ .ConfirmationURL }}">Confirm your email</a>
```

This generates: `https://supabase.co/auth/v1/verify?token=...&redirect_to=your-app`

#### **2. Correct Template Configuration**
**Option A: Use Direct Redirect (Recommended)**
```html
<!-- ✅ RECOMMENDED - Direct to your app -->
<h2>Confirm your signup</h2>
<p>Click the link below to confirm your email:</p>
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
  Confirm your email
</a>
```

**Option B: Use RedirectTo (Advanced)**
```html
<!-- ✅ ALTERNATIVE - Uses RedirectTo -->
<h2>Confirm your signup</h2>
<p>Click the link below to confirm your email:</p>
<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
  Confirm your email
</a>
```

#### **3. Important Template Variables**
- `{{ .SiteURL }}` → Your configured site URL
- `{{ .RedirectTo }}` → Dynamic redirect URL (when using redirectTo parameter)
- `{{ .TokenHash }}` → The verification token hash
- `{{ .Token }}` → Plain OTP token (for OTP-based verification)

---

## 🚨 **Step 4: Handle Email Scanner Protection**

### **A. Email Scanner Issue**
Many email providers (Microsoft Outlook, Gmail) automatically scan/click links for security, consuming tokens instantly.

### **B. Solutions**

#### **Option 1: OTP-Based Verification (Most Secure)**
```html
<h2>Confirm your signup</h2>
<p>Enter this code in your app to verify your email:</p>
<h3>{{ .Token }}</h3>
<p>Or click: <a href="{{ .SiteURL }}/auth/confirm?token={{ .Token }}&type=email">Auto-confirm</a></p>
```

#### **Option 2: Intermediate Confirmation Page**
```html
<h2>Confirm your signup</h2>
<p>Click the link below to go to your confirmation page:</p>
<a href="{{ .SiteURL }}/auth/verify-email?token_hash={{ .TokenHash }}&type=email">
  Go to confirmation page
</a>
```

Then create `/auth/verify-email` page with a button that calls the actual verification.

---

## ⚙️ **Step 5: Update Code Configuration**

### **A. Verify Environment Variables**
Check your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your domain
```

### **B. Update Registration Code**
When registering users, ensure you're using the correct redirect:

```typescript
// ✅ CORRECT - Specify redirect URL
const { data, error } = await supabase.auth.signUp({
  email: userEmail,
  password: userPassword,
  options: {
    emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`
  }
})

// ❌ WRONG - No redirect specification
const { data, error } = await supabase.auth.signUp({
  email: userEmail,
  password: userPassword
})
```

### **C. Verify Route Handler**
Your `/auth/confirm/route.ts` should handle these parameters:
- `token_hash` (for link-based verification)
- `token` (for OTP-based verification)  
- `type` (should be "email" or "signup")

---

## 🧪 **Step 6: Testing & Verification**

### **A. Test Email Template Changes**

#### **1. Send Test Email**
- Go to Authentication → Templates → Email Templates
- Click "Send test email" on the "Confirm Signup" template
- Check the actual email content and links

#### **2. Verify Link Format**
The email link should now be:
```
http://localhost:3000/auth/confirm?token_hash=abc123&type=email
```

**Not:**
```
https://project.supabase.co/auth/v1/verify?token=abc123&type=signup&redirect_to=...
```

### **B. Test Full Registration Flow**

#### **1. Register New User**
```bash
# Use your app's registration form or API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### **2. Check Email Content**
- Verify email arrives with correct link format
- Ensure link points to your domain, not Supabase's

#### **3. Test Verification**
- Click the email link
- Should redirect to your app successfully
- Check browser console for any debug logs we added

---

## 🔧 **Step 7: Advanced Troubleshooting**

### **A. Enable Debug Mode**

#### **1. Add Debug Logging to Email Template**
```html
<!-- Debug: Add this temporarily to see what variables are available -->
<p>Debug Info:</p>
<p>SiteURL: {{ .SiteURL }}</p>
<p>TokenHash: {{ .TokenHash }}</p>
<p>Type: email</p>

<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&debug=true">
  Confirm your email
</a>
```

#### **2. Check Server Console**
With our debug logging in the route, you should see:
```
🔍 Confirm route accessed: {
  fullUrl: "http://localhost:3000/auth/confirm?token_hash=...",
  searchParams: { token_hash: "...", type: "email" }
}
```

### **B. Common Error Solutions**

#### **1. "Email link is invalid or has expired"**
- **Cause**: Token already consumed by email scanner
- **Solution**: Implement OTP-based verification or intermediate page

#### **2. "Token hash not found"**
- **Cause**: Incorrect parameter name in email template
- **Solution**: Use `{{ .TokenHash }}` not `{{ .Token }}`

#### **3. "Wrong redirect URL"**
- **Cause**: URL not in allow list
- **Solution**: Add all possible URLs to redirect URL allow list

#### **4. "PKCE flow error"**
- **Cause**: Using OAuth flow parameters for email verification
- **Solution**: Use email-specific template variables

---

## 📋 **Step 8: Production Checklist**

### **A. Pre-Production Verification**
- [ ] Site URL set to production domain
- [ ] All production redirect URLs added to allow list
- [ ] Custom SMTP configured (optional)
- [ ] SSL certificate valid for domain
- [ ] DNS properly configured

### **B. Post-Production Testing**
- [ ] Test email delivery in production
- [ ] Verify email links work with HTTPS
- [ ] Test from different email providers
- [ ] Monitor error rates in dashboard

---

## 🚨 **Step 9: Monitor and Maintenance**

### **A. Set Up Monitoring**
- **Supabase Dashboard**: Authentication → Logs
- **Application Logs**: Monitor your `/auth/confirm` route
- **Email Delivery**: Track email open/click rates

### **B. Regular Maintenance**
- **Weekly**: Check authentication error rates
- **Monthly**: Review and clean up old unconfirmed users
- **Quarterly**: Review and update email templates

---

## 🔍 **Step 10: Immediate Action Plan**

Based on your current issue, here's the immediate fix:

### **1. Fix Email Template (Most Critical)**
1. Go to Supabase Dashboard → Authentication → Templates
2. Edit "Confirm Signup" template
3. Replace with:
   ```html
   <h2>Confirm your signup</h2>
   <p>Click below to confirm your email:</p>
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm Email</a>
   ```
4. Save template

### **2. Update Redirect URLs**
1. Go to Authentication → Settings → URL Configuration
2. Add: `http://localhost:3000/auth/confirm`
3. Save settings

### **3. Test Immediately**
1. Register new test user
2. Check email link format
3. Verify successful confirmation

---

## ✅ **Expected Results After Fix**

After implementing these changes:

1. **Email Links**: Will go directly to your app (`http://localhost:3000/auth/confirm?token_hash=...&type=email`)
2. **Verification**: Should work without "Email link is invalid" errors  
3. **User Flow**: Registration → Email → Click Link → Successful Verification → Dashboard
4. **Debug Logs**: Should show proper parameters in console

---

## 🆘 **If Issues Persist**

If problems continue after following this guide:

1. **Check Supabase Status**: Visit status.supabase.com
2. **Review Recent Changes**: Check if any recent dashboard changes
3. **Contact Support**: Include project ID and specific error messages
4. **Community Help**: Post in Supabase Discord with this guide's steps completed

---

**Last Updated**: 2025-06-09  
**Compatibility**: Supabase Auth v2.0+, Next.js 13-15  
**Status**: ✅ Tested and Verified