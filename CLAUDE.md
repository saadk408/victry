# CLAUDE.md

*AI-powered resume builder with Claude API integration for job analysis and resume tailoring*

## 🚀 Essential Commands

```bash
# Development
npm run dev                          # Start dev server (localhost:3000)
npm run build && npx tsc --noEmit    # Build + type check (always run together)
npm run lint                         # Lint code

# Testing
npm run test                         # Run all tests (auto-resets DB with resume data)
npm run test:unit                    # Unit tests only  
npm run test:integration             # Integration tests only
npm test -- --testNamePattern="resume" # Test resume-specific functionality
npm test -- path/to/test.ts          # Run specific test file

# AI Feature Testing (Critical for Victry)
curl -X POST localhost:3000/api/ai/analyze-job \
  -H "Content-Type: application/json" \
  -d '{"jobDescription": "Software Engineer at TechCorp..."}' # Test job analysis

curl -X POST localhost:3000/api/ai/tailor-resume \
  -H "Authorization: Bearer token" \
  -d '{"resumeId": "123", "jobId": "456"}'        # Test resume tailoring (premium)

# Database & Types (Critical after schema changes)
npx supabase gen types typescript --local         # Regenerate after resume schema updates
npm run test:reset-db                             # Reset DB with test resume data
```

## 🎯 Victry AI Workflows

### When Analyzing Job Descriptions
```typescript
// Always use API route, never direct Claude API from frontend
POST /api/ai/analyze-job
- Temperature: 0.2 (factual extraction)
- Check prompts: /lib/ai/prompt-templates.ts
- Validate extraction: /lib/services/ai-service.ts extractStructuredData()
- Handle rate limits: /lib/ai/claude-client.ts withRetry()
- Claude tools with JSON schema validation for structured extraction
```

### When Tailoring Resumes  
```typescript
// Premium feature - requires authentication + subscription
POST /api/ai/tailor-resume  
- Middleware protection: /middleware.ts premiumRoutes
- Wildcard pattern matching: '/resume/*/tailor' requires premium
- Preserve authenticity while optimizing ATS keywords
- Temperature: 0.3 (balanced factual + creative)
- State management: /hooks/use-resume.ts
```

### When Adding Resume Sections
```bash
# 5-step process for new resume fields:
1. Update /supabase/migrations/ - Add database columns/tables
2. Update /types/resume.ts - Add TypeScript interfaces  
3. Update /lib/services/resume-service.ts - Add business logic
4. Update /components/resume/section-editor/ - Add UI components
5. Update /components/resume/resume-preview.tsx - Add display logic
```

### When Working with Authentication
```typescript
// Profile auto-creation trigger active
- New users get profiles automatically via DB trigger
- Check /supabase/migrations/20250609153510_add_profile_creation_trigger.sql
- Use /lib/supabase/browser.ts for client components
- Use /lib/supabase/server.ts for API routes
```

### When Working with Databases, Authentication & Supabase
```typescript
// 🔒 CRITICAL REQUIREMENT: Always follow Supabase rules
- MUST review all relevant guidelines in /supabase-rules/ folder before coding
- Check postgresql-style-guide.md for database schema conventions
- Follow supabase-auth-nextjs-guide.md for authentication patterns
- Use supabase-create-migrations.md for database changes
- Apply supabase-create-rls-policies-guidelines.md for security
- Reference supabase-database-schema-guide.md for schema design
- Follow supabase-edge-functions-guidelines.md for serverless functions
```

### AI Tools & Structured Extraction
```typescript
// Claude tools with JSON schema validation
import { createTool } from '@/lib/ai/claude-tools';

// Structured data extraction with fallback parsing
- Primary: Claude tools with JSON schema
- Fallback: Manual parsing for unstructured responses
- Temperature tuning: 0.2 (factual) to 0.5 (creative)
```

### When Debugging AI Features
```typescript
// Check these files in order:
1. /lib/ai/prompt-templates.ts - Verify prompt structure
2. /lib/services/ai-service.ts - Check extraction logic  
3. /lib/ai/claude-client.ts - Verify retry/rate limiting
4. /hooks/use-job-description.ts - Check state management
5. Browser console - Check AI response format
```

## 📁 Essential Victry Files

```typescript
// AI Core Files
/lib/ai/prompt-templates.ts              # AI prompts for job/resume analysis (1,611 lines)
/lib/ai/claude-client.ts                 # Rate limiting & exponential backoff
/lib/services/ai-service.ts              # Structured data extraction from Claude (1,401 lines)

// Resume Domain Files  
/models/resume.ts                        # Resume data models & interfaces
/models/job-description.ts               # Job analysis data models
/hooks/use-resume.ts                     # Resume state & CRUD operations
/hooks/use-job-description.ts            # Job analysis state management
/types/resume.ts                         # TypeScript interfaces for resume data

// UI Components (Complex Resume Editing)
/components/resume/section-editor/       # All resume section editors
/components/resume/resume-preview.tsx    # Live resume preview
/components/resume/ats-score.tsx         # ATS compatibility scoring
/components/resume/keyword-analysis.tsx  # Job keyword matching

// Database & Services
/lib/services/resume-service.ts          # Resume business logic
/lib/services/job-description-service.ts # Job analysis business logic
/lib/services/analytics-service.ts       # 950-line analytics (writes to Supabase directly)
/lib/utils/error-utils.ts                # 12 categories + 40+ specific error codes
/supabase/migrations/                    # Database schema changes
```

## 💻 Code Patterns

### Supabase Client Usage (Critical for Victry)
```typescript
// ✅ Client components ("use client")
import { createClient } from "@/lib/supabase/browser";

// ✅ API routes & server components
import { createClient } from "@/lib/supabase/server";

// ✅ Client-safe analytics
import { clientAnalytics } from "@/lib/utils/client-analytics";
```

### Resume Data Structure (Complex Nested)
```typescript
interface Resume {
  id: string;
  user_id: string;
  personal_info: PersonalInfo;           // Contact + summary
  work_experiences: WorkExperience[];    // Array with achievements
  education: Education[];                // Schools, degrees, dates  
  skills: Skill[];                      // Categorized by type
  certifications: Certification[];       // With expiration tracking
  custom_sections: CustomSection[];      // User-defined sections
  created_at: string;
  updated_at: string;
}

// Always validate complex nested data
import { resumeSchema } from '/lib/utils/validation';

// Database ↔ Application Layer Transformations
// Supabase returns snake_case, app uses camelCase
// Automatic transformation in resume-service.ts:
// database: work_experiences → app: workExperiences
// database: custom_sections → app: customSections
```

### AI Integration Pattern
```typescript
// ✅ API Route Structure
export async function POST(request: Request) {
  // 1. Authenticate user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. Check premium access for AI features
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

### Error Handling (12 Categories + 40+ Specific Codes)
```typescript
import { createApiError, ErrorCategory, ErrorCode } from '@/lib/utils/error-utils';

// 12 Error Categories:
// AUTH, PERMISSION, VALIDATION, NOT_FOUND, CONFLICT, RATE_LIMIT,
// SERVICE, DATABASE, AI, SERVER, IO, NETWORK

// Example with specific error codes:
// ErrorCode.AUTH_INVALID_CREDENTIALS
// ErrorCode.AI_TOKEN_LIMIT
// ErrorCode.DATABASE_FOREIGN_KEY_ERROR
// ... 40+ specific codes available

// Sophisticated error system example:
try {
  const resume = await getUserResumes(userId);
} catch (error) {
  if (error.code === 'PGRST116') {
    // RLS policy issue - common with complex user data
    return createApiError({
      message: 'Access denied', 
      category: ErrorCategory.PERMISSION, 
      code: ErrorCode.PERMISSION_DENIED
    });
  }
  // Use specialized handlers for different error types
  return handleSupabaseError(error);  // Auto-maps 40+ error codes
}
```

## 🔧 Environment Setup

```bash
# Required .env.local variables for AI features
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_service_key
ANTHROPIC_API_KEY=your_claude_api_key        # Critical for AI features
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🐛 Victry-Specific Debugging

### AI Response Extraction Issues
```bash
# Check structured data extraction
- Verify /lib/services/ai-service.ts extractStructuredData function
- Test with different temperature settings (0.2 factual, 0.5 creative)
- Check prompt templates match expected response format
- Monitor Claude API rate limits and retry logic in claude-client.ts
```

### Resume Data Validation Failures  
```bash
# Complex nested structure validation (7 related tables)
- Check /types/resume.ts for interface mismatches (PersonalInfo, WorkExperience, etc.)
- Verify RLS policies for user_id = auth.uid() access
- Test edge cases: missing required fields, overlapping employment dates
- Validate custom_sections.display_order (not 'order' - reserved keyword)
- Debug complex transformations in resume-service.ts
```

### Premium Feature Access Issues
```bash
# Route protection and subscription validation
- Check /middleware.ts ROUTE_PROTECTION for premium routes
- Verify user subscription status in Supabase dashboard
- Test authentication token validity for API calls
- Monitor role-based access in components/auth/role-based-access.tsx
```

### Job Analysis Problems
```bash
# Job description parsing and analysis
- Test with various job posting formats (LinkedIn, Indeed, company sites)
- Check skill extraction accuracy in prompt templates
- Verify requirement categorization logic
- Monitor response times for large job descriptions (>2000 words)
```

## ⚡ API Endpoints Reference

```typescript
// AI Services (Core Victry Features)
POST /api/ai/analyze-job             # Extract skills, requirements from job posting
POST /api/ai/tailor-resume           # Tailor resume for specific job (premium)
POST /api/ai/claude                  # General Claude queries
POST /api/ai/claude-stream           # Streaming AI responses

// Resume Operations
GET/POST/PUT /api/resume             # Resume CRUD operations

// Job Descriptions  
GET/POST /api/job-description        # Job posting CRUD operations

// Authentication & Security
POST /api/auth/forgot-password       # Password reset flow

// Monitoring & Debugging (Development)
GET /api/audit-logs                  # System audit trail
GET /api/db-monitoring               # Database performance metrics
GET /api/query-analyzer              # SQL query analysis
# Analytics: Direct Supabase writes via analytics service (no API endpoint)
```

## 🧪 Testing Requirements

```typescript
// Minimum 70% coverage (jest.config.js)
// Database auto-resets with resume test data before each test

// AI Feature Testing Patterns
describe('Job Analysis', () => {
  it('should extract skills from job description', async () => {
    const mockJob = { description: 'React, TypeScript, Node.js required' };
    const analysis = await analyzeJobDescription(mockJob);
    expect(analysis.skills).toContain('React');
  });
});

// Resume Data Testing
describe('Resume Service', () => {
  it('should handle complex nested resume data', async () => {
    const resume = await createTestResume();
    expect(resume.work_experiences).toBeDefined();
    expect(resume.personal_info.email).toMatch(/.*@.*\..*/);
  });
});
```

## 🎨 Current Project Status

**AI Integration**: Claude API with structured extraction and rate limiting  
**Tailwind v4**: Migration in progress - check for `.new` component versions  
**Database**: Profiles table with auto-creation trigger implemented  
**Premium Features**: Route protection and subscription validation active  
**Testing**: 70% coverage requirement with resume-specific test data

---

*Victry-specific guidance for Claude Code: Focus on AI workflow patterns, resume data complexity, and premium feature development when working with this codebase.*