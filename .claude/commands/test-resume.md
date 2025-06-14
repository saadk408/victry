# Test Resume Features

Test resume functionality with specific scenarios. Pass the test type as an argument.

Usage: `/project:test-resume [type]`

Examples:
- `/project:test-resume validation` - Test resume data validation
- `/project:test-resume crud` - Test resume CRUD operations
- `/project:test-resume nested` - Test complex nested data structures
- `/project:test-resume rls` - Test RLS policies and access control
- `/project:test-resume transformation` - Test data transformations

## Testing Workflow

1. **Run Core Tests**:
   ```bash
   npm run test                                    # All tests with DB reset
   npm test -- --testNamePattern="resume"         # Resume-specific tests
   npm test -- lib/services/resume-service.test.ts # Service layer tests
   ```

2. **Test Resume Data Validation**:
   - Check complex nested structure (PersonalInfo, WorkExperience, etc.)
   - Verify required field validation
   - Test edge cases: overlapping employment dates
   - Validate custom_sections.display_order (not 'order' - reserved keyword)

3. **Test Database Operations**:
   ```bash
   # Reset test database with resume data
   npm run test:reset-db
   
   # Generate types after schema changes
   npx supabase gen types typescript --local
   ```

4. **Test RLS Policies**:
   - Verify user_id = auth.uid() access patterns
   - Test unauthorized access scenarios
   - Check profile auto-creation trigger

5. **Test Data Transformations**:
   - Database snake_case ↔ Application camelCase
   - work_experiences → workExperiences
   - custom_sections → customSections

6. **Test API Endpoints**:
   ```bash
   # Resume CRUD
   curl -X GET localhost:3000/api/resume
   curl -X POST localhost:3000/api/resume -d '{"resume_data": "..."}'
   curl -X PUT localhost:3000/api/resume/[id] -d '{"updated_data": "..."}'
   ```

7. **Common Test Scenarios**:
   - Creating resume with all sections
   - Updating individual sections
   - Handling missing optional fields
   - Testing premium feature access
   - Validating file size limits

Use `/clear` between different test types to avoid context confusion.