# Victry AI Resume Builder - Development Guide

## 🎯 Project Overview

**Victry** is an AI-powered resume builder that helps job seekers optimize their resumes for specific job opportunities. It uses Claude AI to analyze job descriptions and intelligently tailor resumes while preserving authenticity.

### Core Capabilities
- **Job Analysis**: Extract skills, requirements, and keywords from job postings
- **Resume Tailoring**: Optimize resumes for ATS while maintaining truthfulness
- **Intelligent Suggestions**: AI-powered recommendations for resume improvements
- **Premium Features**: Advanced AI capabilities for subscribers

### Architectural Philosophy
- **API-First AI**: All AI operations go through API routes for security
- **Semantic Design System**: Strict color token system for consistency
- **Type-Safe Development**: TypeScript with comprehensive error handling
- **Progressive Enhancement**: Free features with premium upgrades

## 🚀 Quick Command Reference

```bash
# Development
npm run dev                    # Start development server (localhost:3000)
npm run build && npx tsc      # Build and type-check (run together)

# Quality Checks (Run before committing)
npm run validate:colors        # Must show 0 hard-coded colors
npm run audit:styles          # Verify styling patterns
npm test                      # Run tests (auto-resets DB)

# After Database Changes
npx supabase gen types typescript --local  # Regenerate TypeScript types
```

## 🏗️ Development Workflows

### Creating a New Component

1. **Start with the pattern**:
```typescript
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const componentVariants = cva(
  "inline-flex items-center justify-center", // Base classes
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
      }
    }
  }
);

export function MyComponent({ className, variant, ...props }: ComponentProps) {
  return (
    <div 
      data-slot="component-name"  // Required for all components
      className={cn(componentVariants({ variant }), className)}
      {...props}
    />
  );
}
```

2. **Use semantic colors only** (bg-primary, text-foreground, border-border)
3. **Add to appropriate section** in components/
4. **Test with different variants**

### Adding AI Features

1. **Create API route** in /app/api/ai/
```typescript
export async function POST(request: Request) {
  // Step 1: Authenticate
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Step 2: Check premium (if needed)
  if (requiresPremium && !user?.subscription) {
    return createApiError('Premium required', ErrorCategory.PERMISSION, 403);
  }
  
  // Step 3: Process with AI
  const result = await aiService.process(data);
  return NextResponse.json({ data: result });
}
```

2. **Configure AI parameters**:
   - Job analysis: Temperature 0.2 (factual)
   - Resume tailoring: Temperature 0.3 (balanced)
   - Use structured extraction with JSON schema

3. **Update prompt templates** in /lib/ai/prompt-templates.ts

### Working with Resume Data

Resume data spans 7 related tables. When updating:

1. **Database**: Update migration in /supabase/migrations/
2. **Types**: Update /types/resume.ts
3. **Service**: Update /lib/services/resume-service.ts
4. **UI**: Update section editor in /components/resume/section-editor/
5. **Preview**: Update /components/resume/resume-preview.tsx
6. **Regenerate types**: `npx supabase gen types typescript --local`

### Working with Supabase

**IMPORTANT**: Before working with Supabase features, read the relevant guide in `/supabase-rules/`:

#### Database Operations
- **Schema Design**: Read `@supabase-rules/supabase-database-schema-guide.md`
- **Migrations**: Read `@supabase-rules/supabase-create-migrations.md`
- **Style Guide**: Read `@supabase-rules/postgresql-style-guide.md`

#### Authentication
- **Next.js Auth**: Read `@supabase-rules/supabase-auth-nextjs-guide.md`
- Profile auto-creation trigger is active (see migration 20250609153510)

#### Security
- **RLS Policies**: Read `@supabase-rules/supabase-create-rls-policies-guidelines.md`
- Always implement RLS for user data isolation
- Test policies with different user roles

#### Functions
- **Database Functions**: Read `@supabase-rules/supabase-create-functions-guide.md`
- **Edge Functions**: Read `@supabase-rules/supabase-edge-functions-guidelines.md`

Example workflow for new database feature:
1. Read relevant guides in `/supabase-rules/`
2. Create migration following conventions
3. Implement RLS policies for security
4. Update TypeScript types
5. Test with different user contexts

## 🎨 Styling System

### The One Rule: Semantic Colors Only

```typescript
// ✅ CORRECT - Use semantic tokens
className="bg-background text-foreground"
className="bg-primary hover:bg-primary/90"
className="border-border"

// ❌ WRONG - Never hard-code colors
className="bg-gray-50 text-gray-900"
className="bg-white border-gray-200"
```

### Available Tokens
- **Brand**: primary, secondary, accent, destructive
- **Neutral**: background, foreground, muted, card
- **Status**: success, warning, error, info
- **Interactive**: border, input, ring

### Performance Targets
- Total CSS < 50KB compressed
- Critical CSS < 14KB inline
- Use `contain-paint` for isolated components
- Use `content-visibility-auto` for long lists

## 🧩 Critical Patterns

### Supabase Client Selection
```typescript
// Client components
import { createClient } from "@/lib/supabase/browser";

// Server components & API routes
import { createClient } from "@/lib/supabase/server";
```

### Error Handling System
```typescript
import { createApiError, ErrorCategory } from '@/lib/utils/error-utils';

// 12 categories: AUTH, PERMISSION, VALIDATION, NOT_FOUND, 
// CONFLICT, RATE_LIMIT, SERVICE, DATABASE, AI, SERVER, IO, NETWORK

// Handle Supabase RLS errors
if (error.code === 'PGRST116') {
  return createApiError('Access denied', ErrorCategory.PERMISSION, 403);
}
```

### Import Order Convention
```typescript
// 1. React/Next.js core
import * as React from "react";
// 2. Third-party libraries
import { cva } from "class-variance-authority";
// 3. Internal imports (@/)
import { cn } from "@/lib/utils";
// 4. Types
import type { Resume } from "@/types/resume";
```

## 🚨 Common Pitfalls & Solutions

### AI Integration
- **Pitfall**: Direct Claude API calls from frontend
- **Solution**: Always use API routes (/api/ai/*)

### Resume Data
- **Pitfall**: Forgetting snake_case ↔ camelCase conversion
- **Solution**: Use service layer transformations

### Styling
- **Pitfall**: Using Tailwind color classes directly
- **Solution**: Semantic tokens only, validate before commit

### Premium Features
- **Pitfall**: Inconsistent access checks
- **Solution**: Middleware + API route validation

## 📋 Testing Checklist

Before committing:
- [ ] `npm run validate:colors` shows 0 violations
- [ ] `npm run build && npx tsc` passes
- [ ] Tests pass with `npm test`
- [ ] Premium features check authentication
- [ ] New components use data-slot attributes

## 🔗 Key File References

### AI System
- Prompts: `/lib/ai/prompt-templates.ts`
- Service: `/lib/services/ai-service.ts`
- Client: `/lib/ai/claude-client.ts`

### Resume System
- Types: `/types/resume.ts`
- Service: `/lib/services/resume-service.ts`
- Editors: `/components/resume/section-editor/*`

### Configuration
- Middleware: `/middleware.ts`
- Error Utils: `/lib/utils/error-utils.ts`
- Status Colors: `/lib/utils/status-colors.ts`

## 📈 Current Status

- **Migration**: 117+ files need semantic color updates
- **Coverage**: 70% test coverage requirement
- **Performance**: Meeting CSS bundle targets
- **AI Features**: Stable with rate limiting

---

*When in doubt: Use semantic colors, check premium access, handle errors comprehensively, and validate before committing.*