# Onboarding Improvement Implementation Plan

## Overview

This plan addresses the immediate post-registration crash bug while implementing a comprehensive onboarding improvement strategy for Victry. The approach is phased to ensure quick value delivery while building toward an optimal user experience.

## Phase 1: Critical Bug Fix (Immediate - Day 1)

### 1.1 Fix PremiumUpgradePrompt Component
**File**: `/components/resume/premium-feature.tsx`

**Issue**: Line 93 references undefined `children` variable

**Solution**: Remove the `{children}` reference since PremiumUpgradePrompt doesn't need children
```typescript
// Remove line 93:
// {children}

// The div should remain empty for the blurred preview effect
<div className="opacity-50 pointer-events-none">
  {/* Blurred preview placeholder - no content needed */}
</div>
```

### 1.2 Create Missing Database Function
**File**: Create new migration `/supabase/migrations/[timestamp]_add_user_permissions_function.sql`

**Options**:
1. **Create the function** (if permissions system is needed):
```sql
CREATE OR REPLACE FUNCTION get_user_permissions()
RETURNS TABLE(resource TEXT, action TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return empty set for now, implement role-based permissions later
  RETURN;
END;
$$;
```

2. **Remove the function call** (simpler approach):
   - Modify `/components/auth/role-based-access.tsx`
   - Remove the `get_user_permissions` RPC call
   - Use role-based access only (already working via JWT claims)

**Recommendation**: Option 2 - Remove the call since role-based access is working

### 1.3 Add Error Boundaries
**File**: Create `/components/error-boundary.tsx`
```typescript
'use client';
import { Component, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
          <p className="text-sm text-gray-600">Please refresh the page and try again</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usage**: Wrap dashboard page and other critical components

## Phase 2: Quick Onboarding Wins (Week 1)

### 2.1 Enhanced Profile Completion Page
**File**: `/app/onboarding/complete-profile/page.tsx`

**Current**: Only collects first/last name
**Improvement**: Add career context
```typescript
interface ProfileData {
  firstName: string;
  lastName: string;
  currentRole: string;        // NEW
  experienceLevel: string;    // NEW
  industry: string;           // NEW
  jobSearchStatus: string;    // NEW
}
```

**Database Schema Update**:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  current_role VARCHAR(255),
  experience_level VARCHAR(50), -- entry, mid, senior, executive
  industry VARCHAR(100),
  job_search_status VARCHAR(50); -- active, passive, not_looking
```

### 2.2 Welcome Modal for New Users
**File**: Create `/components/onboarding/welcome-modal.tsx`

**Trigger**: Show when user first visits dashboard and `onboarding_completed = false`

**Content**:
- Welcome message personalized with their name
- "What would you like to do first?" with 3 options:
  - Create first resume (primary CTA)
  - Upload existing resume
  - Explore templates

### 2.3 Improved Dashboard Empty State
**File**: `/app/dashboard/page.tsx`

**Current**: Shows empty lists with generic quick actions
**Improvement**: 
```typescript
// When resumes.length === 0, show:
<OnboardingDashboard>
  <WelcomeSection firstName={user.firstName} />
  <QuickStartCards>
    <CreateFirstResumeCard />
    <UploadResumeCard />
    <AIFeaturesPreview />
  </QuickStartCards>
  <ProgressTracker />
</OnboardingDashboard>
```

### 2.4 Onboarding Progress Tracking
**File**: `/lib/services/onboarding-service.ts`

**Database Schema**:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_current_step VARCHAR(50),
  profile_completion_percentage INTEGER DEFAULT 0;
```

**Service Functions**:
```typescript
export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus>
export async function updateOnboardingStep(userId: string, step: string): Promise<void>
export async function completeOnboarding(userId: string): Promise<void>
export async function calculateProfileCompletion(userId: string): Promise<number>
```

## Phase 3: Guided Onboarding Wizard (Week 2-3)

### 3.1 Onboarding Wizard Framework
**Files**: 
- `/components/onboarding/onboarding-wizard.tsx`
- `/components/onboarding/onboarding-provider.tsx`
- `/app/onboarding/wizard/page.tsx`

**Architecture**:
```typescript
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<OnboardingStepProps>;
  skippable: boolean;
  required: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep, skippable: false },
  { id: 'goals', title: 'Your Goals', component: GoalsStep, skippable: true },
  { id: 'import', title: 'Import Resume', component: ImportStep, skippable: true },
  { id: 'ai-demo', title: 'AI Enhancement', component: AIDemoStep, skippable: false },
  { id: 'profile', title: 'Complete Profile', component: ProfileStep, skippable: false },
];
```

### 3.2 Individual Onboarding Steps

#### WelcomeStep
```typescript
// Goal discovery and personalization
"What brings you to Victry today?"
- Job searching (show job-focused features)
- Updating resume (show enhancement features) 
- Career transition (show guidance features)
- Just exploring (show all features)
```

#### ImportStep
```typescript
// Multiple entry points
"How would you like to get started?"
[Upload Resume] [LinkedIn Import] [Start Fresh] [Browse Templates]
```

#### AIDemoStep
```typescript
// Show AI capabilities without requiring premium
"Here's how Victry's AI can enhance your resume"
- Take basic info (current role, years experience)
- Generate sample professional summary
- Show before/after comparison
- "This is just the beginning - see what else AI can do"
```

### 3.3 New Routes
- `/onboarding/wizard` - Main wizard flow
- `/onboarding/import` - Resume upload/LinkedIn import
- `/onboarding/ai-demo` - AI capabilities demo
- `/api/onboarding/*` - Backend endpoints

## Phase 4: Advanced Onboarding Features (Week 3-4)

### 4.1 Smart Resume Templates
**File**: `/components/onboarding/smart-templates.tsx`

**Logic**:
```typescript
// Show relevant templates based on:
- User's industry
- Experience level  
- Role type (technical, creative, business, etc.)
- Job search status
```

### 4.2 Interactive Tutorials
**File**: `/components/onboarding/feature-tours.tsx`

**Implementation**:
- Use tooltips and highlights for first-time feature usage
- Progressive disclosure of advanced features
- Context-sensitive help

### 4.3 LinkedIn Integration Enhancement
**File**: `/lib/services/linkedin-import-service.ts`

**Features**:
- Parse LinkedIn profile data
- Map to resume sections automatically
- Show AI enhancement suggestions
- Handle missing profile permissions gracefully

## Phase 5: Analytics & Optimization (Week 4+)

### 5.1 Onboarding Analytics
**File**: `/lib/services/onboarding-analytics.ts`

**Events to Track**:
```typescript
- onboarding_started
- onboarding_step_completed  
- onboarding_skipped
- onboarding_completed
- first_resume_created
- ai_demo_viewed
- feature_discovered
- template_selected
```

### 5.2 A/B Testing Framework
**File**: `/lib/services/ab-testing.ts`

**Tests to Run**:
- Welcome message variations
- AI demo presentation styles
- Template recommendation algorithms
- CTA button text and placement

### 5.3 Conversion Optimization
**Focus Areas**:
- Reduce drop-off between steps
- Optimize AI demo for maximum impact
- Improve template selection UX
- Streamline profile completion

## Implementation Guidelines

### Technical Standards
1. **Follow CLAUDE.md Guidelines**:
   - Use error handling patterns from `/lib/utils/error-utils.ts`
   - Follow service layer architecture
   - Use TypeScript with explicit types
   - Add comprehensive tests

2. **Client/Server Separation**:
   - Use browser client for onboarding components
   - API routes for all data operations
   - No direct service imports in client components

3. **Progressive Enhancement**:
   - Core functionality works without JavaScript
   - Enhanced features load progressively
   - Graceful degradation for slower connections

### Database Migrations
**Naming Convention**: `[timestamp]_onboarding_[feature].sql`

**Required Migrations**:
1. `add_onboarding_tracking_columns.sql`
2. `add_profile_enhancement_columns.sql`
3. `create_onboarding_analytics_table.sql`

### Testing Strategy
1. **Unit Tests**: All service functions and utilities
2. **Integration Tests**: Onboarding flow end-to-end
3. **User Testing**: A/B test different flows
4. **Performance Tests**: Load time for wizard steps

### Deployment Strategy
1. **Phase 1**: Deploy immediately (critical bug fix)
2. **Phase 2**: Feature flag behind `ENABLE_ENHANCED_ONBOARDING`
3. **Phase 3**: A/B test against current flow
4. **Phase 4**: Gradual rollout to all users

## Success Metrics

### Primary KPIs
- **Activation Rate**: % who create first resume within 7 days
  - Baseline: Unknown
  - Target: 60%

- **Time to First Value**: Minutes to see AI enhancement
  - Baseline: Never
  - Target: <3 minutes

### Secondary KPIs
- **Onboarding Completion**: % who finish all steps
  - Target: 80%

- **Profile Completion**: Average % of profile filled
  - Baseline: 20%
  - Target: 70%

- **Feature Discovery**: % who try AI features in first session
  - Baseline: <5%
  - Target: 90%

### Business Impact
- **Premium Conversion**: % who upgrade within 14 days
  - Target: 15%

- **User Retention**: % still active after 30 days
  - Target: 40%

## Risk Mitigation

### Technical Risks
1. **Performance**: Large onboarding wizard impacts load time
   - **Mitigation**: Lazy load steps, optimize bundle size

2. **Complexity**: Too many steps overwhelm users
   - **Mitigation**: Make most steps optional, clear progress indicators

3. **Mobile Experience**: Wizard doesn't work well on mobile
   - **Mitigation**: Mobile-first design, responsive components

### Product Risks
1. **User Confusion**: Complex flow confuses existing users
   - **Mitigation**: Only show to new users, maintain skip options

2. **Over-Engineering**: Complex solution for simple problem
   - **Mitigation**: Phased approach, validate each step

3. **AI Demo Expectations**: Users expect more than free tier provides
   - **Mitigation**: Clear communication about free vs premium features

## Conclusion

This implementation plan transforms Victry's onboarding from a liability (crashes) into a competitive advantage (guided AI-powered experience). The phased approach ensures immediate stability while building toward long-term user engagement and conversion optimization.