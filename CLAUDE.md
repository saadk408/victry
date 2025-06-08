# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [🚀 Quick Start](#-quick-start)
- [🚨 Critical Rules - DO NOT VIOLATE](#-critical-rules---do-not-violate)
- [🏗️ Architecture Patterns](#️-architecture-patterns)
- [⚠️ Current Gotchas](#️-current-gotchas)
- [🔧 Common Tasks & Solutions](#-common-tasks--solutions)
- [📡 API Endpoints](#-api-endpoints)
- [🧪 Testing Guidelines](#-testing-guidelines)
- [🐛 Debugging & Monitoring](#-debugging--monitoring)
- [🔄 Recent Updates](#-recent-updates)

## 🎯 Project Overview

Victry is an AI-powered resume builder that helps professionals create, tailor, and optimize resumes for job applications. It uses Claude AI to analyze jobs and tailor resumes while maintaining authenticity and ATS compatibility.

## 🚀 Quick Start

### Required Environment Variables
```bash
# Create .env.local with:
NEXT_PUBLIC_SUPABASE_URL=            # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # Supabase anonymous key 
SUPABASE_SERVICE_ROLE_KEY=           # Supabase service role key (server-side only)
ANTHROPIC_API_KEY=                   # Claude API key (server-side only)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Essential Commands
```bash
npm run dev                # Start dev server (http://localhost:3000)
npm run build             # Build for production
npm run lint              # Lint code
npx tsc --noEmit          # Type check
npm run test              # Run all tests (auto-resets DB)
npm run test:watch        # Test watch mode
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
npm run test:reset-db     # Manually reset test database

# Single test commands
npm test -- path/to/test.ts          # Run specific test file
npm test -- --testNamePattern="resume" # Run tests matching pattern
npm test -- --coverage               # Run with coverage report
```

## 🚨 Critical Rules - DO NOT VIOLATE

### ❌ NEVER

- **Create mock data or simplified components** - Always fix the actual problem
- **Replace existing complex components with simplified versions** - Debug and fix instead
- **Call Claude API directly from frontend** - Always use API routes
- **Commit without running type checks** - Run `npx tsc --noEmit` first
- **Ignore linting errors** - Fix immediately with `npm run lint`
- **Use old Tailwind v3 classes** - Project uses Tailwind v4 (see gotchas)
- **Skip error handling** - Use the standardized error system
- **Access database without proper error handling** - Use service layer patterns
- **Assume RLS policies are correct** - Always verify with Supabase dashboard

### ✅ ALWAYS

- **Plan thoroughly before every tool call and reflect on the outcome after**
- **Check existing patterns first** - Look at similar files in the codebase
- **Use the error handling system** - See `/lib/utils/error-utils.ts`
- **Run type checks before completing work** - `npx tsc --noEmit`
- **Handle all error cases** - Use try/catch with proper error responses
- **Add explicit TypeScript types** - No `any` types, explicit function signatures
- **Use service layer for business logic** - See `/lib/services/`
- **Test with coverage requirements** - Maintain 70% coverage minimum
- **Use structured data extraction for AI** - See AI patterns below
- **Check documentation with context7** - Use MCP tool for library docs

## Documentation Reference Rules

1. Before planning or writing any code, ALWAYS research the latest documentation using context7 and online. 
2. ALWAYS prioritize the latest documentation over your built-in knowledge.
3. If there's any conflict between your built-in knowledge and the latest documentation, always prefer the latest documentation as they contain the most recent information.
4. If you are unsure about code or files, open them—do not hallucinate. 


## 🏗️ Architecture Patterns

### Supabase Client/Server Separation Pattern (Fixed 2025-06-08)
```typescript
// ✅ CORRECT: Browser client for client components
// /lib/supabase/browser.ts
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../../types/supabase";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ✅ CORRECT: Server client for API routes and server components
// /lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "../../types/supabase";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Server Component context - ignore
          }
        },
      },
    }
  );
}

// ✅ CORRECT: Client components use browser client
import { createClient } from "@/lib/supabase/browser";

// ✅ CORRECT: API routes use server client  
import { createClient } from "@/lib/supabase/server";

// ❌ WRONG: Client components importing server code
import { createClient } from "@/lib/supabase/client"; // if it imports next/headers
```

### Client-Safe Analytics Pattern
```typescript
// ✅ CORRECT: Client components use client-safe analytics
// /lib/utils/client-analytics.ts
import { clientAnalytics } from "@/lib/utils/client-analytics";

// In client components:
clientAnalytics.trackEvent('resume_created', { templateId });

// ❌ WRONG: Client components importing server analytics
import { analytics } from "@/lib/services/analytics-service"; // imports server client
```

### Error Handling Pattern
```typescript
// ✅ CORRECT: /lib/utils/error-utils.ts
import { ErrorCategory, ErrorCode, createApiError } from '@/lib/utils/error-utils';

// In API routes
try {
  const result = await someOperation();
  return NextResponse.json({ data: result });
} catch (error) {
  if (error instanceof AIServiceError) {
    return createApiError(error.message, ErrorCategory.AI, 500);
  }
  return createApiError('Internal server error', ErrorCategory.SERVER, 500);
}

// ❌ WRONG: Generic error handling
catch (error) {
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
}
```

### AI Integration Pattern
```typescript
// ✅ CORRECT: /app/api/ai/analyze-job/route.ts
export async function POST(request: Request) {
  // 1. Authenticate user
  const supabase = createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return createAuthError('Not authenticated');
  }
  
  // 2. Validate request
  const body = await request.json();
  
  // 3. Call AI service (not Claude directly)
  try {
    const analysis = await analyzeJobDescription(body.jobDescription);
    return NextResponse.json({ data: analysis });
  } catch (error) {
    return handleAIError(error);
  }
}

// ❌ WRONG: Direct Claude API call from route
const response = await anthropic.messages.create({...});
```

### Structured Data Extraction Pattern
```typescript
// ✅ CORRECT: /lib/services/ai-service.ts - extractStructuredData function
function extractStructuredData<T>(response: Anthropic.Message, toolName?: string): T {
  // 1. Check for tool_use content blocks
  if (Array.isArray(response.content) && toolName) {
    for (const block of response.content) {
      if (block.type === 'tool_use' && block.name === toolName) {
        return block.input as T;
      }
    }
  }
  
  // 2. Fall back to JSON in code blocks
  const fullText = /* extract text */;
  const jsonMatch = fullText.match(/```(?:json)?\n([\s\S]*?)\n```/);
  
  // 3. Try plain JSON extraction
  // 4. Multiple fallback approaches...
}
```

### Database Pattern with RLS
```typescript
// ✅ CORRECT: /lib/services/resume-service.ts
export async function getUserResumes(userId: string) {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('resumes')
    .select(`
      *,
      personal_info (*),
      work_experiences (*),
      education (*),
      skills (*)
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
    
  if (error) {
    throw new ResumeError('Failed to fetch resumes', error);
  }
  
  return data;
}

// RLS Policy Example: /supabase/schemas/05_policies.sql
CREATE POLICY "Users can only see their own resumes" 
ON resumes FOR SELECT 
USING (user_id = auth.uid());
```

### Service Layer Pattern
```typescript
// ✅ CORRECT: /lib/services/ai-service.ts
export class AIServiceError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "AIServiceError";
  }
}

// Use in service functions
export async function analyzeJobDescription(jobDescription: JobDescription) {
  try {
    // Service logic here
  } catch (error) {
    throw new AIServiceError("Failed to analyze job", error);
  }
}
```

### Middleware Pattern
```typescript
// ✅ CORRECT: /middleware.ts
const ROUTE_PROTECTION = {
  adminRoutes: ['/dashboard/admin', '/api/admin'],
  premiumRoutes: ['/api/ai/tailor-resume', '/resume/*/tailor']
};

// Applied automatically to all matching routes
```

## ⚠️ Current Gotchas

### 🎨 Tailwind v4 Migration In Progress
```bash
# ⚠️ CRITICAL: Project uses Tailwind v4
# Many UI components have .new versions being migrated
# Check for both versions when editing components:
components/ui/button.tsx       # Current version
components/ui/button.tsx.new   # Tailwind v4 version

# Tailwind v4 uses different syntax:
# ❌ OLD: className="bg-blue-500 hover:bg-blue-600"
# ✅ NEW: className="bg-blue-500 hover:bg-blue-600"
# (Similar but check docs/tailwind-v4-migration-guide.md for changes)
```

### 🔐 Supabase RLS Issues
```typescript
// Common error: PGRST116 - "No rows found"
// Solution: Check RLS policies in Supabase dashboard
// All tables must have proper RLS policies for user_id = auth.uid()
```

### 🤖 Claude API Rate Limits
```typescript
// Implement exponential backoff (already in codebase)
// See: /lib/ai/claude-client.ts - withRetry function
// Lower temperature (0.2-0.3) for factual outputs
// Higher temperature (0.5-0.7) for creative outputs
```

### 📝 Type Errors with Supabase
```typescript
// Generated types might be outdated
// Regenerate with: npx supabase gen types typescript --local
// Output to: /types/supabase.ts
```

## 🔧 Common Tasks & Solutions

### Adding a New API Endpoint
1. Create route in `/app/api/[feature]/route.ts`
2. Use error handling middleware: `withErrorHandler`
3. Authenticate with `supabase.auth.getUser()`
4. Validate input with Zod schemas
5. Use service layer for business logic
6. Return standardized responses

### Adding a New Resume Section
1. Update database schema in `/supabase/migrations/`
2. Update types in `/types/resume.ts`
3. Add service methods in `/lib/services/resume-service.ts`
4. Create UI components in `/components/resume/section-editor/`
5. Update resume preview in `/components/resume/resume-preview.tsx`

### Debugging AI Responses
1. Check structured data extraction in `/lib/services/ai-service.ts`
2. Verify tool definitions in API routes
3. Check Claude response format with console.log
4. Use lower temperature for consistency
5. Verify prompt templates in `/lib/ai/prompt-templates.ts`

## 📡 API Endpoints

```typescript
// AI Endpoints
POST /api/ai/analyze-job        # Analyze job description
POST /api/ai/tailor-resume      # Tailor resume to job  
POST /api/ai/claude             # General Claude queries
POST /api/ai/claude-stream      # Streaming responses

// Resource Endpoints  
POST /api/resume                # Resume CRUD
POST /api/job-description       # Job description CRUD

// Monitoring Endpoints (Admin only)
GET  /api/db-monitoring         # Slow query analysis
GET  /api/audit-logs           # Security audit trail
GET  /api/query-analyzer       # Query performance
```

## 🧪 Testing Guidelines

### Test Coverage Requirements
```javascript
// jest.config.js - Minimum 70% coverage required
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  }
}
```

### Test Structure
```typescript
// ✅ CORRECT: Comprehensive test with proper setup
describe('ResumeService', () => {
  beforeEach(async () => {
    await resetTestDatabase(); // Automatic in pretest
  });
  
  it('should handle errors gracefully', async () => {
    // Mock Supabase error
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } 
      })
    });
    
    await expect(getUserResumes('123')).rejects.toThrow(ResumeError);
  });
});
```

## 🐛 Debugging & Monitoring

### Key Debugging Endpoints
```bash
# Check slow queries (requires admin)
GET /api/db-monitoring?minExecutionTime=100

# View security events  
GET /api/audit-logs?action=resume.create

# Analyze query patterns
GET /api/query-analyzer
```

### Common Debug Locations
- Browser console for client errors
- Terminal for server errors  
- Supabase dashboard for database/RLS issues
- `/screenshots/` directory for UI issues
- Network tab for API failures

### Error Categories Reference
```typescript
// /lib/utils/error-utils.ts
enum ErrorCategory {
  AUTH = "auth",           // 401 - Authentication
  PERMISSION = "permission", // 403 - Authorization  
  VALIDATION = "validation", // 400 - Input errors
  NOT_FOUND = "not_found",  // 404 - Missing resource
  CONFLICT = "conflict",    // 409 - Duplicate/conflict
  AI = "ai",               // 500 - AI service errors
  DATABASE = "database",    // 500 - Database errors
  SERVER = "server"        // 500 - General server errors
}
```

## 🚧 Critical Work In Progress

### Database Schema Alignment (2025-06-04)
**Status**: Phase 1 COMPLETED, Phase 2 COMPLETED, OAuth CONFIGURED, Phase 3 ready to start
**Document**: `/docs/database-schema-alignment-plan.md`

#### Phase 1: Authentication System Overhaul ✅ COMPLETED (2025-06-04)
- **AUTH-001**: ✅ COMPLETED - Replace auth-helpers-nextjs in all 30 files
  - ✅ Updated package.json to remove deprecated package
  - ✅ Components: auth forms, layout, account, analytics
  - ✅ API routes: analyze-job, tailor-resume, resume, job-description, example
  - ✅ Pages: auth, onboarding, resume
  - ✅ Services: analytics-service, resume-service, job-description-service
  - ✅ Hooks: use-resume, use-job-description
  - ✅ Components: cover-letter-editor, job-description-input
- **AUTH-002**: ✅ COMPLETED - Updated lib/supabase/client.ts 
- **AUTH-003**: ✅ COMPLETED - middleware.ts already using modern patterns

#### Phase 2: Profiles Table Implementation ✅ COMPLETED (2025-06-03)
- **SCHEMA-001**: ✅ COMPLETED - Added profiles table to declarative schema (supabase/schemas/02_tables.sql)
- **SCHEMA-002**: ✅ COMPLETED - Added comprehensive RLS policies for profiles (supabase/schemas/05_policies.sql)
- **SCHEMA-003**: ✅ COMPLETED - Added performance indexes for profiles (supabase/schemas/03_indexes.sql)
- **SCHEMA-004**: ✅ COMPLETED - Generated and applied clean migration (20250603113009_create_profiles_table_clean.sql)
- **SCHEMA-BONUS**: ✅ COMPLETED - Fixed reserved keyword issue (custom_sections.order → display_order)

#### OAuth Configuration ✅ COMPLETED (2025-06-04)
- **OAUTH-001**: ✅ COMPLETED - Email Authentication configured
- **OAUTH-002**: ✅ COMPLETED - Google OAuth configured
- **OAUTH-003**: ✅ COMPLETED - LinkedIn OIDC configured

#### Upcoming Phases
- **Phase 3**: Schema consistency resolution
- **Phase 4**: Performance & security optimization
- **Phase 5**: RBAC system alignment
- **Phase 6**: Testing & validation

**Critical Issues Status**:
- ✅ RESOLVED: 30+ files using deprecated @supabase/auth-helpers-nextjs
- ✅ RESOLVED: Missing profiles table with complete RLS policies and performance indexes
- ✅ RESOLVED: OAuth providers now configured (Email, Google, LinkedIn)
- 🟡 PENDING: Schema mismatches between declarative files and migrations
- 🟡 PENDING: Missing RLS policies and performance indexes for some tables

## 🔄 Recent Updates

- **2025-06-08**: ✅ **Client/Server Separation Fixed** - Resolved Next.js build error "You're importing a component that needs 'next/headers'"
  - Created separate browser (`/lib/supabase/browser.ts`) and server (`/lib/supabase/server.ts`) clients
  - Fixed 18+ client components to use browser-safe imports
  - Created client-safe analytics utility (`/lib/utils/client-analytics.ts`)
  - Updated dashboard and resume pages to use API routes instead of direct service imports
- **2025-06-04**: ✅ **OAuth Configured** - Email, Google OAuth, and LinkedIn OIDC configured in Supabase
- **2025-06-04**: ✅ **Phase 1 COMPLETED** - All authentication files migrated to @supabase/ssr
- **2025-06-03**: ✅ **Phase 2 COMPLETED** - Profiles table implementation with RLS policies and performance indexes
- **2025-06-03**: Fixed PostgreSQL reserved keyword issue (custom_sections.order → display_order)
- **2025-06-03**: Successfully applied clean migration approach using declarative schemas
- **2025-01-06**: Database schema alignment work started (critical OAuth blocker)
- **2024-01-20**: Migration to Tailwind CSS v4 (in progress)
- **2024-01-18**: Implemented comprehensive error tracking system
- **2024-01-15**: Added database monitoring and query analysis  
- **2024-01-12**: Implemented RBAC system with admin/user/viewer roles
- **2024-01-10**: Added audit logging for sensitive operations
- **2024-01-08**: Standardized error handling across all API routes

---

**Remember**: When in doubt, look for existing patterns in the codebase. The best code follows the patterns already established. Update this file when adding new patterns or discovering important gotchas.