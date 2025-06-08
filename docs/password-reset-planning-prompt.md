# Prompt 1: Password Reset Flow Planning Phase

## Context
You are planning the implementation of a complete password reset functionality for the Victry AI-powered resume builder application. The current implementation references a password reset link in `login-form.tsx` but the functionality is not implemented.

### Current Tech Stack
- Next.js 15.2.3 with App Router
- TypeScript 5.8.2 (strict mode)
- React 19.1.0
- Supabase Auth with @supabase/ssr v0.5.2
- TailwindCSS 4.1.7 with ShadCN components
- Framer Motion 12.12.1 for animations

### Current Authentication Architecture
- Uses modern `@supabase/ssr` implementation
- Has email/password, Google OAuth, and LinkedIn OIDC authentication
- Implements RBAC with middleware protection
- Uses multiple Supabase client contexts (browser, server components, server actions)
- Has comprehensive error handling with retry logic
- Email validation using `isValidEmail()` function
- Password validation (8+ chars, letter + number requirement)

### Existing File Structure
- Auth pages: `/app/(auth)/login/page.tsx`, `/app/(auth)/register/page.tsx`
- Auth components: `/components/auth/login-form.tsx`, `/components/auth/register-form.tsx`
- Auth callback: `/app/auth/callback/route.ts`
- Supabase utilities: `/lib/supabase/client.ts`, `/lib/supabase/auth-utils.ts`
- UI components: `/components/ui/` (button, input, form, etc.)

## Planning Requirements

Please provide a comprehensive plan that includes:

### 1. Architecture Design
- High-level flow diagram of the password reset process
- Integration points with existing auth system
- State management approach
- Security architecture considerations

### 2. User Journey Mapping
- Detailed user flow from "forgot password" click to successful password reset
- All possible user paths and decision points
- Error scenarios and recovery flows
- Success scenarios and next steps

### 3. Technical Design
- List of all files to be created with their purposes
- List of all files to be modified with specific changes needed
- Database/Supabase configuration requirements
- Email template requirements and variables
- API endpoint design if needed

### 4. Edge Cases Analysis
Provide comprehensive analysis of:
- Invalid/expired tokens
- Non-existent email addresses
- Network errors and retries
- Rate limiting scenarios
- Already used tokens
- Password validation failures
- Email delivery failures
- User cancellation flows
- Browser back/forward navigation
- Multiple password reset requests
- Cross-device reset flows

### 5. Security Considerations
- User enumeration attack prevention strategy
- Rate limiting implementation approach
- Token security and expiration strategy
- CSRF protection approach
- Session handling during reset
- Audit logging requirements

### 6. Integration Points
- How it integrates with existing error handling
- Toast notification usage
- Loading state management
- Form validation integration
- Middleware considerations
- RBAC implications

### 7. Testing Strategy
- Unit testing approach
- Integration testing scenarios
- Security testing requirements
- User acceptance testing scenarios
- Performance testing considerations

### 8. Configuration Requirements
- Supabase Dashboard settings needed
- Environment variables required
- Email provider configuration
- Default vs custom SMTP considerations

### 9. Future Considerations
- Custom SMTP integration readiness
- Scalability considerations
- i18n readiness
- Analytics/tracking hooks
- A/B testing possibilities

### 10. Implementation Order
- Prioritized list of implementation steps
- Dependencies between components
- Parallel work possibilities
- Risk mitigation strategies

## Constraints to Consider
- Default Supabase email rate limit (2 emails/hour)
- Mobile responsiveness requirements
- Accessibility standards (WCAG)
- SEO requirements for auth pages
- Existing design system consistency
- Performance budget considerations

## Deliverables

Please provide:
1. **Visual flow diagram** (described in text/ASCII)
2. **Detailed technical specification** for each component
3. **Complete file manifest** with create/modify indicators
4. **Risk assessment** with mitigation strategies
5. **Success metrics** definition

Note: This planning phase should NOT include any code. Focus on thorough analysis, design decisions, and comprehensive planning that will guide the implementation phase.

Use the latest documentation for everything. Use context7