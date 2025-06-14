# Debug AI Features

Debug AI-related issues in Victry systematically. Pass the component name as an argument.

Usage: `/project:debug-ai [component]`

Examples:
- `/project:debug-ai job-analysis` - Debug job description analysis
- `/project:debug-ai resume-tailoring` - Debug resume tailoring features
- `/project:debug-ai extraction` - Debug data extraction issues
- `/project:debug-ai rate-limits` - Debug Claude API rate limiting

## Debug Workflow

1. **Check AI Service Files** (in order):
   - `/lib/ai/prompt-templates.ts` - Verify prompt structure for {{component}}
   - `/lib/services/ai-service.ts` - Check extractStructuredData function
   - `/lib/ai/claude-client.ts` - Verify retry/rate limiting logic
   - `/hooks/use-job-description.ts` - Check state management

2. **Test AI Endpoints**:
   ```bash
   # Job Analysis
   curl -X POST localhost:3000/api/ai/analyze-job \
     -H "Content-Type: application/json" \
     -d '{"jobDescription": "Test job posting with React, TypeScript, Node.js"}'
   
   # Resume Tailoring (requires auth)
   curl -X POST localhost:3000/api/ai/tailor-resume \
     -H "Authorization: Bearer TOKEN" \
     -d '{"resumeId": "test-id", "jobId": "test-job-id"}'
   ```

3. **Check Common Issues**:
   - Temperature settings (0.2 factual, 0.3-0.5 creative)
   - Prompt template format matching expected response
   - Claude API rate limits and retry logic
   - JSON schema validation for structured extraction
   - Error handling in API routes

4. **Verify Configuration**:
   - `ANTHROPIC_API_KEY` is set in environment
   - Rate limiting settings in claude-client.ts
   - Premium feature access checks in middleware

5. **Browser Console Debugging**:
   - Check AI response format in Network tab
   - Verify structured data extraction
   - Monitor for JavaScript errors during AI calls

Use `/clear` if context gets cluttered during debugging session.