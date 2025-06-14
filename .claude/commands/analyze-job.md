# Analyze Job Descriptions

Test job description analysis with different formats and sources. Pass the source type as an argument.

Usage: `/project:analyze-job [source]`

Examples:
- `/project:analyze-job linkedin` - Test LinkedIn job posting format
- `/project:analyze-job indeed` - Test Indeed job posting format  
- `/project:analyze-job company` - Test company website job posting
- `/project:analyze-job pdf` - Test PDF job description parsing
- `/project:analyze-job large` - Test large job descriptions (>2000 words)

## Analysis Workflow

1. **Test API Endpoint**:
   ```bash
   curl -X POST localhost:3000/api/ai/analyze-job \
     -H "Content-Type: application/json" \
     -d '{
       "jobDescription": "Software Engineer position requiring React, TypeScript, Node.js. 3+ years experience. Remote work available. Competitive salary and benefits."
     }'
   ```

2. **Verify Extraction Quality**:
   - Skills extraction accuracy
   - Requirements categorization (required vs preferred)
   - Company information parsing
   - Job type classification (remote, hybrid, on-site)
   - Experience level detection
   - Salary/benefits parsing

3. **Test Different Formats**:
   - **LinkedIn**: Structured format with clear sections
   - **Indeed**: Variable format with mixed content
   - **Company Sites**: Custom formatting, may include HTML
   - **PDF**: Text extraction challenges
   - **Large Descriptions**: Performance and accuracy with >2000 words

4. **Monitor Performance**:
   - Response times for different job sizes
   - Token usage and cost efficiency
   - Rate limiting behavior
   - Error handling for malformed input

5. **Validate AI Settings**:
   - Temperature: 0.2 (factual extraction)
   - Prompt templates: /lib/ai/prompt-templates.ts
   - Structured extraction: /lib/services/ai-service.ts
   - Rate limiting: /lib/ai/claude-client.ts

6. **Check Integration Points**:
   - State management: /hooks/use-job-description.ts
   - API route: /api/ai/analyze-job
   - Error handling: ErrorCategory.AI
   - Premium checks: Middleware validation

7. **Common Issues to Watch**:
   - Inconsistent skill extraction
   - Missing company information
   - Incorrect experience level parsing
   - Rate limit errors during high usage
   - Malformed JSON responses

Use `/compact` to maintain context when testing multiple job formats in sequence.