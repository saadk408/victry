# Victry Reference Documentation

## Essential Victry Files

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

## API Endpoints Reference

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

## Testing Requirements

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

## Testing Commands Reference

```bash
# Core Testing
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
```

## Database Commands

```bash
# Database & Types (Critical after schema changes)
npx supabase gen types typescript --local         # Regenerate after resume schema updates
npm run test:reset-db                             # Reset DB with test resume data
```

## Environment Variables Reference

```bash
# Required .env.local variables for AI features
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_service_key
ANTHROPIC_API_KEY=your_claude_api_key        # Critical for AI features
NEXT_PUBLIC_APP_URL=http://localhost:3000
```