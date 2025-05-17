# Testing Guide for Victry

This guide outlines the testing strategy and setup for the Victry application with Supabase integration.

## Overview

The testing strategy includes:

1. **Unit Tests** - Testing isolated components and functionality
2. **Integration Tests** - Testing API routes and middleware
3. **Database Tests** - Testing the database schema and RLS policies
4. **E2E Tests** - Testing user flows (future implementation)

## Setup and Configuration

### Environment Setup

Tests rely on a dedicated Supabase test environment. To set up:

1. Start local Supabase instance:
   ```bash
   supabase start
   ```

2. Reset the test database:
   ```bash
   node tests/supabase/test-reset.js
   ```

### Test Structure

- `/tests/supabase` - Test environment setup and utilities
  - `test-environment.ts` - Test configuration
  - `test-reset.ts` - Database reset scripts
  - `seed-test-data.ts` - Test data generation
  - `test-utils.ts` - Testing helper functions
  - `sql/` - SQL test files for PgTAP

- `/tests/unit` - Unit tests
  - `auth-utils.test.ts` - Tests for auth utilities
  - `resume-service.test.ts` - Tests for resume functionality
  - `job-description-service.test.ts` - Tests for job description functionality
  - `error-handling.test.ts` - Tests for error handling utilities

- `/tests/integration` - Integration tests
  - `api-routes.test.ts` - Tests for API routes
  - `middleware.test.ts` - Tests for authentication middleware

## Running Tests

### Unit Tests

```bash
npm test -- tests/unit
```

### Integration Tests

```bash
# Start the application first
npm run dev

# In another terminal
npm test -- tests/integration
```

### Database Tests

```bash
supabase test db
```

### All Tests

```bash
npm test
```

## Testing with Different User Roles

The test utilities include helper functions to authenticate as different user types:

```typescript
// Test as an admin user
await withTestUser('admin', async (supabase) => {
  // Test code here
});

// Test as a premium user
await withTestUser('premium', async (supabase) => {
  // Test code here
});

// Test as a basic user
await withTestUser('basic', async (supabase) => {
  // Test code here
});

// Test as an anonymous user
await withAnonUser(async (supabase) => {
  // Test code here
});
```

## Continuous Integration

GitHub Actions is used for running tests on PRs and pushes to the main branch. The configuration is in `.github/workflows/test.yml`.

It:
1. Sets up Node.js and Supabase CLI
2. Starts a local Supabase instance
3. Runs unit tests
4. Runs database tests
5. Lints SQL with pgTAP

## Adding New Tests

When adding new tests:

1. For unit tests, follow the patterns in the existing tests
2. For integration tests, ensure the test environment is properly set up
3. For database tests, add SQL files to `/tests/supabase/sql/pgtap-tests`

## Mocking

The test environment uses:

- Fixed UUIDs for test users
- Predefined roles and permissions
- Standard test data
- Controlled environment variables

This ensures tests are consistent and reproducible.

## Notes

- Integration tests require a running Next.js application
- Tests will reset the database, so don't run in a production environment
- The test database is isolated from the development database