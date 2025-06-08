# TypeScript Migration Guide for Next.js 15

## Overview

This guide addresses the TypeScript compatibility issues arising from Next.js 15's new async params and searchParams requirements.

## Phase 1 Completion Status - COMPLETED ✅

Phase 1 of the TypeScript migration focused on fixing critical build-blocking errors. The following issues have been resolved:

1. **ESLint Configuration** - Fixed with proper `.eslintrc.json`
2. **Test Database Connectivity** - Resolved with improved error handling
3. **Critical TypeScript Errors** - Fixed the most urgent type mismatches
   - Added missing properties to JobAnalysis interface
   - Fixed async cookie handling in auth utilities
   - Updated API route cookie management
   - Corrected monitoring RPC function calls

## Key Changes in Next.js 15

### 1. Async Page Props

Next.js 15 requires `params` and `searchParams` to be Promises:

```typescript
// Before (Next.js 14)
interface PageProps {
  params: { id: string };
  searchParams: { query?: string };
}

// After (Next.js 15)
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ query?: string }>;
}
```

### 2. API Route Context

API routes now expect async params:

```typescript
// Before
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
}

// After
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
}
```

## Implementation Steps

### Step 1: Update All Page Components

```typescript
// app/access-denied/page.tsx
interface AccessDeniedPageProps {
  searchParams: Promise<{
    reason?: string;
  }>;
}

export default async function AccessDeniedPage({ 
  searchParams 
}: AccessDeniedPageProps) {
  const params = await searchParams;
  const reason = params.reason || 'unauthorized';
  
  return (
    <div className="container">
      <h1>Access Denied</h1>
      <p>Reason: {reason}</p>
    </div>
  );
}
```

### Step 2: Update Dynamic Routes

```typescript
// app/resume/[id]/page.tsx
interface ResumePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResumePage({ 
  params 
}: ResumePageProps) {
  const { id } = await params;
  
  // Fetch resume data
  const resume = await getResume(id);
  
  return <ResumeView resume={resume} />;
}
```

### Step 3: Update API Routes

```typescript
// app/api/audit-logs/route.ts
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  context?: { params?: Promise<Record<string, string>> }
) {
  // Handle optional context
  if (context?.params) {
    const params = await context.params;
    // Use params
  }
  
  // API logic...
}
```

### Step 4: Fix Supabase Auth Utils

```typescript
// lib/supabase/auth-utils.ts
import { cookies } from 'next/headers';

export async function getUser() {
  const cookieStore = await cookies();
  
  const supabase = createServiceRoleClient({
    cookies: () => cookieStore
  });
  
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const cookieStore = await cookies();
  
  const supabase = createServiceRoleClient({
    cookies: () => cookieStore
  });
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}
```

### Step 5: Fix Type Definitions

```typescript
// types/supabase.ts
export interface Database {
  public: {
    Tables: {
      resumes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          template: string;
          // ... other fields
        };
        Insert: {
          // ... insert types
        };
        Update: {
          // ... update types
        };
      };
      // ... other tables
    };
  };
}
```

### Step 6: Update Service Layer Types

```typescript
// lib/services/resume-service.ts
export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean; // Changed from 'current'
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  achievements: string[]; // Changed from 'highlights'
}
```

## Common Patterns

### Pattern 1: Async Component Props

```typescript
// Generic page component pattern
interface PageProps<TParams = {}, TSearchParams = {}> {
  params: Promise<TParams>;
  searchParams: Promise<TSearchParams>;
}

// Usage
interface MyPageProps extends PageProps<
  { id: string },
  { query?: string; page?: string }
> {}

export default async function MyPage({ params, searchParams }: MyPageProps) {
  const { id } = await params;
  const { query, page } = await searchParams;
  // ... component logic
}
```

### Pattern 2: Error Boundaries

```typescript
// app/error.tsx
'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Pattern 3: Loading States

```typescript
// app/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

## Testing Updates

### Update Test Utilities

```typescript
// tests/utils/test-utils.ts
import { render } from '@testing-library/react';

export async function renderPage<TProps>(
  Component: React.ComponentType<TProps>,
  props: TProps
) {
  // Handle async props
  const resolvedProps = {
    ...props,
    params: Promise.resolve(props.params),
    searchParams: Promise.resolve(props.searchParams)
  };
  
  return render(<Component {...resolvedProps} />);
}
```

### Update Component Tests

```typescript
// __tests__/pages/access-denied.test.tsx
import { renderPage } from '@/tests/utils/test-utils';
import AccessDeniedPage from '@/app/access-denied/page';

describe('AccessDeniedPage', () => {
  it('renders with reason', async () => {
    const { getByText } = await renderPage(AccessDeniedPage, {
      searchParams: Promise.resolve({ reason: 'forbidden' })
    });
    
    expect(getByText(/forbidden/i)).toBeInTheDocument();
  });
});
```

## Migration Checklist

### Phase 1 (COMPLETED)
- [x] Fix critical build-blocking TypeScript errors
- [x] Update JobAnalysis interface with missing properties
- [x] Fix Supabase auth utilities for async cookies
- [x] Update API route cookie handling
- [x] Fix monitoring RPC function calls

### Phase 2 (IN PROGRESS)
- [ ] Update all page components to use async props
- [ ] Update all API routes to handle async params
- [ ] Update type definitions for database schema
- [ ] Fix interface property names (current → isCurrent, etc.)
- [ ] Update service layer to match new types
- [ ] Generate complete Supabase types including monitoring schema
- [ ] Resolve remaining type mismatches

### Phase 3 (PENDING)
- [ ] Update test utilities for async props
- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Ensure all tests pass: `npm test`
- [ ] Verify build succeeds: `npm run build`

## Troubleshooting

### Issue: "Type 'X' does not satisfy the constraint 'PageProps'"

Solution: Make sure params and searchParams are Promises:
```typescript
interface MyPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ query?: string }>;
}
```

### Issue: "Property 'X' does not exist on type 'Y'"

Solution: Check interface definitions match actual usage:
```typescript
// If error says "Property 'current' does not exist"
// Change to:
interface WorkExperience {
  isCurrent: boolean; // not 'current'
}
```

### Issue: "Cannot read properties of undefined"

Solution: Ensure proper null checks and await async values:
```typescript
const params = await searchParams;
const value = params?.key || 'default';
```

## Resources

- [Next.js 15 Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Supabase TypeScript Guide](https://supabase.com/docs/guides/api/generating-types)