# CLAUDE.md

*AI-powered resume builder with Claude API integration for job analysis and resume tailoring*

## 🚀 Essential Commands

```bash
# Development
npm run dev                          # Start dev server (localhost:3000)
npm run build && npx tsc --noEmit    # IMPORTANT: Build + type check (always run together)
npm run lint                         # Lint code

# 🎨 Styling Validation (CRITICAL - Run before committing)
npm run validate:colors              # Check for hard-coded colors (MUST be 0)
npm run audit:styles                 # Audit component styling patterns
npm run build:measure                # Verify CSS bundle < 50KB

# Testing  
npm run test                         # Run all tests (auto-resets DB with resume data)
npm test -- --testNamePattern="resume" # Test resume-specific functionality

# AI Feature Testing (CRITICAL for Victry)
curl -X POST localhost:3000/api/ai/analyze-job \
  -H "Content-Type: application/json" \
  -d '{"jobDescription": "Software Engineer at TechCorp..."}'

curl -X POST localhost:3000/api/ai/tailor-resume \
  -H "Authorization: Bearer token" \
  -d '{"resumeId": "123", "jobId": "456"}'

# Database & Types (CRITICAL after schema changes)
npx supabase gen types typescript --local         # Regenerate after resume schema updates
```

## 🎨 Styling System (CRITICAL - MUST FOLLOW)

### ❌ YOU MUST NEVER Use Hard-Coded Colors
```typescript
// ❌ NEVER do this - Claude Code MUST flag as error:
className="bg-gray-50 text-gray-900"       // Hard-coded grays
className="text-blue-600 hover:text-blue-700" // Hard-coded blues
className="bg-white dark:bg-gray-800"      // Direct colors
className="border-gray-200"                // Hard-coded borders

// ✅ ALWAYS use semantic tokens:
className="bg-background text-foreground"   // Semantic colors
className="text-primary hover:text-primary/90" // Semantic with opacity
className="bg-muted text-muted-foreground" // Semantic neutrals
className="border-border"                  // Semantic borders
```

### ✅ YOU MUST ALWAYS Use Semantic Color System
```typescript
// Import status utilities for consistent colors
import { getStatusClasses, getScoreStatus } from '@/lib/utils/status-colors';

// Status colors (success, warning, error, info)
<Badge variant="success">Active</Badge>
<div className={getStatusClasses('warning')}>Warning message</div>

// Score-based automatic status
const status = getScoreStatus(85); // Returns 'success' for 85%
<div className={getStatusClasses(status)}>Score: 85%</div>

// Available semantic tokens:
// - primary, secondary, accent, destructive
// - background, foreground, card, popover
// - muted, muted-foreground, border, input, ring
// - success, warning, info (with -foreground variants)
```

### 🧩 Component Development Rules
```typescript
// YOU MUST use cn() utility for all className compositions
import { cn } from '@/lib/utils';

// YOU MUST add data-slot attributes to all components
<button data-slot="button" className={cn("base-classes", className)} />
<input data-slot="input" className={cn("base-classes", className)} />
<div data-slot="card" className={cn("base-classes", className)} />

// YOU MUST use CVA for component variants
const variants = cva("base-classes", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      destructive: "bg-destructive text-destructive-foreground",
    }
  }
});
```

### 🚀 Tailwind v4 CSS-First Patterns
```css
/* YOU MUST define utilities in globals.css using @utility */
@utility btn-primary {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  
  &:hover {
    opacity: 0.9;
  }
}

/* YOU MUST use OKLCH for brand colors */
--color-primary: oklch(0.45 0.15 231);     /* Better color accuracy */
--color-success: oklch(0.65 0.15 145);     /* WCAG AA compliant */
```

### 📦 Performance Requirements
```typescript
// CSS Bundle Size Limits:
// - Total CSS: < 50KB (compressed)
// - Critical CSS: < 14KB (inline)
// - Component CSS: Use containment

// YOU MUST use CSS containment for isolated components
<Card className="contain-paint">...</Card>
<section className="contain-content">...</section>

// YOU MUST use content-visibility for long content
<div className="resume-section content-visibility-auto">...</div>
```

### 🧪 Styling Validation Checklist
Before committing ANY styling changes:
- [ ] Run `npm run validate:colors` - MUST show 0 hard-coded colors
- [ ] Run `npm run audit:styles` - MUST pass all checks
- [ ] All new components use semantic tokens
- [ ] All components have data-slot attributes
- [ ] CSS bundle remains under 50KB limit
- [ ] Visual regression tests pass

## 🎯 Victry AI Workflows

### When Analyzing Job Descriptions
```typescript
// IMPORTANT: Always use API route, never direct Claude API from frontend
POST /api/ai/analyze-job
- Temperature: 0.2 (factual extraction)
- Check prompts: /lib/ai/prompt-templates.ts
- Validate extraction: /lib/services/ai-service.ts extractStructuredData()
- Handle rate limits: /lib/ai/claude-client.ts withRetry()
- YOU MUST use Claude tools with JSON schema validation for structured extraction
```

### When Tailoring Resumes  
```typescript
// CRITICAL: Premium feature - requires authentication + subscription
POST /api/ai/tailor-resume  
- Middleware protection: /middleware.ts premiumRoutes
- Wildcard pattern matching: '/resume/*/tailor' requires premium
- YOU MUST preserve authenticity while optimizing ATS keywords
- Temperature: 0.3 (balanced factual + creative)
- State management: /hooks/use-resume.ts
```

### When Working with Authentication
```typescript
// IMPORTANT: Profile auto-creation trigger active
- New users get profiles automatically via DB trigger
- Check /supabase/migrations/20250609153510_add_profile_creation_trigger.sql
- YOU MUST use /lib/supabase/browser.ts for client components
- YOU MUST use /lib/supabase/server.ts for API routes
```

### When Working with Databases & Supabase
```typescript
// 🔒 CRITICAL REQUIREMENT: Always follow Supabase rules
- YOU MUST review all relevant guidelines in /supabase-rules/ folder before coding
- Check postgresql-style-guide.md for database schema conventions
- Follow supabase-auth-nextjs-guide.md for authentication patterns
- Apply supabase-create-rls-policies-guidelines.md for security
```

## 💻 Critical Code Patterns

### Styling Patterns (CRITICAL - Apply to ALL Components)
```typescript
// ✅ Component structure pattern
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const componentVariants = cva(
  "base-classes-with-semantic-tokens-only",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        primary: "bg-primary text-primary-foreground",
        muted: "bg-muted text-muted-foreground",
      }
    }
  }
);

export function Component({ className, variant, ...props }: ComponentProps) {
  return (
    <div 
      data-slot="component-name"
      className={cn(componentVariants({ variant }), className)}
      {...props}
    />
  );
}

// ❌ NEVER use hard-coded colors in components
// ❌ NEVER forget data-slot attribute
// ❌ NEVER skip cn() utility for className merging
```

### Supabase Client Usage (CRITICAL for Victry)
```typescript
// ✅ Client components ("use client")
import { createClient } from "@/lib/supabase/browser";

// ✅ API routes & server components
import { createClient } from "@/lib/supabase/server";

// ✅ Client-safe analytics
import { clientAnalytics } from "@/lib/utils/client-analytics";
```

### AI Integration Pattern (ESSENTIAL)
```typescript
// YOU MUST follow this API route structure
export async function POST(request: Request) {
  // 1. Authenticate user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. IMPORTANT: Check premium access for AI features
  if (isPremiumFeature && !user?.subscription) {
    return createApiError('Premium required', ErrorCategory.PERMISSION, 403);
  }
  
  // 3. Call AI service with proper error handling
  try {
    const result = await analyzeJobDescription(body.jobDescription);
    return NextResponse.json({ data: result });
  } catch (error) {
    return createApiError('AI analysis failed', ErrorCategory.AI, 500);
  }
}
```

### Error Handling (CRITICAL)
```typescript
import { createApiError, ErrorCategory, ErrorCode } from '@/lib/utils/error-utils';

// IMPORTANT: 12 Error Categories available
// AUTH, PERMISSION, VALIDATION, NOT_FOUND, CONFLICT, RATE_LIMIT,
// SERVICE, DATABASE, AI, SERVER, IO, NETWORK

// YOU MUST handle RLS policy issues (common with complex user data)
try {
  const resume = await getUserResumes(userId);
} catch (error) {
  if (error.code === 'PGRST116') {
    return createApiError({
      message: 'Access denied', 
      category: ErrorCategory.PERMISSION, 
      code: ErrorCode.PERMISSION_DENIED
    });
  }
  return handleSupabaseError(error);  // Auto-maps 40+ error codes
}
```

## 🔧 Environment Setup

```bash
# CRITICAL: Required .env.local variables for AI features
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_service_key
ANTHROPIC_API_KEY=your_claude_api_key        # ESSENTIAL for AI features
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🧠 Context Management (IMPORTANT)

**Active Context Management**: Use these commands to maintain optimal performance:
- `/clear` - Reset context window between unrelated tasks
- `/compact` - Intelligent summarization while preserving key details
- Real-time context monitoring available in Claude Code terminal

**IMPORTANT**: Context window fills quickly with file contents and conversation. Use `/clear` frequently to maintain Claude's effectiveness across long sessions.

## 🎨 Current Project Status

**AI Integration**: Claude API with structured extraction and rate limiting  
**Tailwind v4**: Migration complete - using CSS-first configuration with design tokens  
**Styling System**: Semantic color tokens enforced, 117+ files need migration from hard-coded colors
**Component Library**: ShadCN UI with data-slot patterns for React 19
**Database**: Profiles table with auto-creation trigger implemented  
**Premium Features**: Route protection and subscription validation active  
**Testing**: 70% coverage requirement with resume-specific test data
**Performance**: CSS bundle target < 50KB, Critical CSS < 14KB

## 📚 Detailed Documentation

**When you need detailed information, import these modules:**

- **Debugging & Troubleshooting**: @docs/claude/troubleshooting-guide.md
- **API Reference & Testing**: @docs/claude/reference-documentation.md  
- **Implementation Patterns**: @docs/claude/code-patterns.md
- **Styling Best Practices**: @docs/style-guide.md

## 🚀 Project Commands Available

**Use these commands for common Victry workflows:**

- `/project:debug-ai [component]` - Debug AI features systematically
- `/project:test-resume [type]` - Test resume functionality with specific scenarios
- `/project:analyze-job [source]` - Test job analysis with different formats
- `/project:audit-colors` - Find and report hard-coded color usage
- `/project:migrate-colors [--dry-run]` - Migrate hard-coded colors to semantic tokens
- `/project:validate-styling` - Comprehensive styling validation

---

*Victry-specific guidance for Claude Code: Focus on AI workflow patterns, resume data complexity, semantic styling enforcement, and premium feature development when working with this codebase. ALWAYS validate styling compliance before committing any UI changes.*