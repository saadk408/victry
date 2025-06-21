# E2E Testing for Critical User Flows

This directory contains end-to-end tests for the three critical user flows identified in the risk assessment:

1. **Authentication Flow** - Login, registration, OAuth, and logout
2. **Resume Creation Flow** - Creating, editing, and managing resumes
3. **AI Analysis Features** - ATS scoring, job matching, and content generation

## Test Organization

### Test Files
- `auth-flow.test.ts` - Authentication and user access flows
- `resume-creation-flow.test.ts` - Resume builder and editor functionality
- `ai-analysis-flow.test.ts` - AI-powered features and premium functionality

### Configuration
- `playwright.config.ts` - Playwright configuration with risk-based tolerances

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e auth-flow

# Run tests in headed mode (see browser)
npm run test:e2e -- --headed

# Run tests for specific project
npm run test:e2e -- --project=mobile-safari

# Run only high-risk component tests
npm run test:e2e -- --project=high-risk
```

## Risk-Based Testing Strategy

Based on the risk assessment, tests use different visual regression tolerances:

- **High Risk** (tabs, switch): 5% tolerance
- **Medium Risk** (card, textarea, popover): 10% tolerance  
- **Low Risk** (progress, alert): 15% tolerance

## Test Coverage

### Authentication Flow
- ✅ Login with valid/invalid credentials
- ✅ Registration with validation
- ✅ OAuth provider buttons
- ✅ Password reset flow
- ✅ Logout functionality
- ✅ Responsive design (mobile/tablet)

### Resume Creation Flow
- ✅ Create new resume from scratch
- ✅ Create from template
- ✅ Add/edit work experience
- ✅ Add/edit education
- ✅ Manage skills
- ✅ Reorder sections
- ✅ Preview and export
- ✅ Resume management (list, duplicate, delete)
- ✅ Responsive editing

### AI Analysis Features
- ✅ ATS score calculation and display
- ✅ Improvement suggestions
- ✅ Real-time score updates
- ✅ Job matching analysis
- ✅ Tailoring suggestions
- ✅ AI content generation
- ✅ Bullet point enhancement
- ✅ Keyword optimization
- ✅ Premium feature gating
- ✅ Responsive AI panels

## Visual Regression Testing

Visual regression baselines are automatically created on first run. To update baselines:

```bash
# Update all baselines
npm run test:e2e -- --update-snapshots

# Update specific test baselines
npm run test:e2e auth-flow -- --update-snapshots
```

## Accessibility Testing

All tests include basic accessibility checks. For comprehensive accessibility testing:

```bash
# Run accessibility-focused tests
npm run test:e2e -- --project=accessibility
```

## Performance Testing

Tests monitor key performance metrics:
- First Contentful Paint < 2s
- Largest Contentful Paint < 2.5s
- Total Blocking Time < 300ms
- Cumulative Layout Shift < 0.1

## CI/CD Integration

Tests are automatically run in CI with:
- Retry logic for flaky tests (2 retries in CI)
- Parallel execution disabled in CI for consistency
- HTML and JSON reports generated
- Failure screenshots and videos captured

## Debugging Failed Tests

```bash
# Run with debug logs
DEBUG=pw:api npm run test:e2e

# Run specific test with trace
npm run test:e2e auth-flow -- --trace on

# Open last HTML report
npx playwright show-report
```

## Test Data Management

Tests use:
- Mock user accounts for authentication
- Test resume IDs for editing flows
- Cleanup after test runs to maintain state

## Best Practices

1. **Isolation**: Each test should be independent
2. **Selectors**: Use data-* attributes for reliable element selection
3. **Waits**: Use explicit waits over arbitrary timeouts
4. **Assertions**: Make assertions specific and meaningful
5. **Cleanup**: Clean up test data after runs

## Maintenance

- Review and update tests when UI changes
- Monitor test execution times
- Fix flaky tests immediately
- Keep visual baselines current
- Document any test-specific setup required