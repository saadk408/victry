# Victry Troubleshooting Guide

## Error Handling System

### Error Categories & Codes
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

## Victry-Specific Debugging

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

## Debugging File Checklist

When debugging AI features, check these files in order:
1. `/lib/ai/prompt-templates.ts` - Verify prompt structure
2. `/lib/services/ai-service.ts` - Check extraction logic  
3. `/lib/ai/claude-client.ts` - Verify retry/rate limiting
4. `/hooks/use-job-description.ts` - Check state management
5. Browser console - Check AI response format

## Common Error Patterns

### Authentication Issues
- Profile creation trigger failures
- RLS policy misconfigurations
- Token expiration in long sessions

### AI Service Issues
- Rate limiting during high usage
- Temperature setting impacts on accuracy
- Prompt template format mismatches

### Database Issues
- Complex resume data validation
- Foreign key constraint violations
- Case sensitivity in custom section ordering

### Premium Feature Issues
- Middleware route protection bypasses
- Subscription status caching issues
- Feature flag inconsistencies