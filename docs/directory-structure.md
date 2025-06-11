# Victry Directory Structure

This document provides a comprehensive overview of the Victry AI-powered resume builder codebase organization and file structure. Updated for June 2025 with latest architectural changes including Supabase client/server separation, OAuth integration, and Tailwind v4 migration.

## Project Root

```
victry/
├── .eslintrc.json                    # ESLint configuration
├── .gitignore                        # Git ignore patterns
├── CLAUDE.md                         # Claude Code assistant instructions & patterns
├── README.md                         # Main project documentation
├── README-task-master.md             # Task Master AI integration documentation
├── components.json                   # Shadcn/UI component configuration
├── jest.config.js                    # Jest 29.7.0 testing configuration
├── jest.hasteConfig.js               # Jest haste map configuration
├── masterplan.md                     # Project roadmap and strategic planning
├── middleware.ts                     # Next.js 15 middleware (auth/RBAC/rate limiting)
├── next.config.ts                    # Next.js 15.3.2 configuration
├── package.json                      # Dependencies and npm scripts
├── package-lock.json                 # Locked dependency versions (npm)
├── pnpm-lock.yaml                    # PNPM lock file (alternative package manager)
├── postcss.config.js                 # PostCSS configuration for Tailwind
├── postcss.config.mjs                # PostCSS ESM configuration
├── prettier.config.js                # Prettier code formatting rules
└── tsconfig.json                     # TypeScript 5.8.2 configuration
```

## Application Structure

### `/app` - Next.js App Router

```
app/
├── (auth)/                           # Auth route group (grouped routes)
│   ├── forgot-password/
│   │   └── page.tsx                 # Password reset request page
│   ├── login/
│   │   └── page.tsx                 # Login page with OAuth buttons
│   ├── register/
│   │   └── page.tsx                 # Registration page with OAuth
│   └── reset-password/
│       └── page.tsx                 # Password reset completion page
├── access-denied/
│   └── page.tsx                     # Access denied page (RBAC)
├── api/                             # API route handlers (Next.js 15)
│   ├── ai/                          # AI-powered endpoints
│   │   ├── analyze-job/
│   │   │   └── route.ts            # Job description analysis (Claude)
│   │   ├── claude/
│   │   │   └── route.ts            # General Claude queries
│   │   ├── claude-stream/
│   │   │   └── route.ts            # Streaming Claude responses (NEW)
│   │   └── tailor-resume/
│   │       └── route.ts            # AI resume tailoring service
│   ├── audit-logs/
│   │   └── route.ts                # Security audit logging (admin only)
│   ├── auth/                        # Authentication endpoints
│   │   └── forgot-password/
│   │       └── route.ts            # Password reset API
│   ├── db-monitoring/
│   │   └── route.ts                # Database performance monitoring
│   ├── example-with-error-handler/
│   │   └── route.ts                # Error handling middleware example
│   ├── example-with-error-tracking/
│   │   └── route.ts                # Error tracking example
│   ├── job-description/
│   │   └── route.ts                # Job description CRUD operations
│   ├── query-analyzer/
│   │   └── route.ts                # SQL query performance analysis
│   └── resume/
│       └── route.ts                # Resume CRUD operations
├── auth/                            # Authentication flow pages
│   ├── auth-code-error/
│   │   └── page.tsx                # OAuth error handling page
│   ├── callback/
│   │   └── route.ts                # OAuth callback handler
│   ├── confirm/
│   │   └── route.ts                # Email confirmation handler
│   └── verify-email/
│       └── page.tsx                # Email verification page (NEW)
├── dashboard/
│   ├── _components/
│   │   └── stats-card.tsx          # Dashboard statistics component
│   └── page.tsx                     # Main dashboard (role-based features)
├── onboarding/
│   └── complete-profile/
│       └── page.tsx                # Profile completion after OAuth
├── performance-test/
│   └── page.tsx                     # Performance testing page
├── resume/
│   ├── [id]/                        # Dynamic resume routes
│   │   ├── edit/
│   │   │   └── page.tsx            # Resume editing interface
│   │   ├── page.tsx                # Resume detail view
│   │   └── tailor/
│   │       └── page.tsx            # AI resume tailoring interface
│   ├── _components/                 # Resume-specific components
│   │   ├── job-description-input.tsx # Job input component
│   │   ├── job-match-panel.tsx      # Job matching analysis
│   │   ├── resume-editor.tsx        # Main resume editor
│   │   ├── resume-preview.tsx       # Live resume preview
│   │   ├── resume-score-panel.tsx   # ATS score display
│   │   └── templates-panel.tsx      # Template selection panel
│   ├── create/
│   │   └── page.tsx                # New resume creation
│   └── page.tsx                     # Resume listing/dashboard
├── upgrade/
│   └── page.tsx                     # Premium subscription upgrade
├── favicon.ico                      # Site favicon
├── globals.css                      # Global Tailwind CSS styles
├── layout.tsx                       # Root layout (React 19)
└── page.tsx                         # Home page
```

### `/components` - Reusable Components

```
components/
├── account/
│   ├── profile-editor.tsx           # User profile editing component
│   └── subscription-plans.tsx      # Subscription tier display & upgrade
├── ai/
│   ├── ai-suggestion.tsx           # AI suggestion display component
│   └── tailoring-controls.tsx      # Resume tailoring configuration
├── analytics/
│   └── application-tracking.tsx    # Job application status tracking
├── auth/
│   ├── forgot-password-form.tsx    # Password reset request form
│   ├── login-form.tsx              # Login form with OAuth integration
│   ├── oauth-buttons/              # OAuth provider components
│   │   ├── google-oauth-button.tsx # Google OAuth integration
│   │   ├── index.ts                # OAuth button exports
│   │   ├── linkedin-oauth-button.tsx # LinkedIn OIDC integration
│   │   └── oauth-error-alert.tsx   # OAuth error handling
│   ├── register-form.tsx           # Registration form with OAuth
│   ├── reset-password-form.tsx     # Password reset completion form
│   └── role-based-access.tsx       # RBAC component wrapper
├── cover-letter/
│   └── cover-letter-editor.tsx     # Cover letter editing interface
├── layout/
│   ├── footer.tsx                  # Site footer component
│   ├── header.tsx                  # Site header with navigation
│   └── sidebar.tsx                 # Dashboard navigation sidebar
├── resume/
│   ├── ats-score.tsx               # ATS compatibility score display
│   ├── editor-controls/            # Resume editing controls
│   │   ├── date-range-picker.tsx   # Date range selection
│   │   ├── rich-text-editor.tsx    # TipTap rich text editor
│   │   ├── skill-input.tsx         # Skills input with categorization
│   │   └── sortable-list.tsx       # Drag & drop list component
│   ├── export-controls.tsx         # PDF export functionality
│   ├── import-controls.tsx         # Resume import functionality
│   ├── keyword-analysis.tsx        # Job keyword analysis display
│   ├── premium-feature.tsx         # Premium feature access wrapper
│   ├── section-editor/             # Resume section editors
│   │   ├── certifications.tsx      # Professional certifications
│   │   ├── education.tsx           # Educational background
│   │   ├── personal-info.tsx       # Contact information
│   │   ├── projects.tsx            # Portfolio projects
│   │   ├── skills.tsx              # Technical & soft skills
│   │   ├── social-links.tsx        # Professional social links
│   │   ├── summary.tsx             # Professional summary
│   │   └── work-experience.tsx     # Employment history
│   └── templates/
│       ├── template-picker.tsx     # Resume template selection
│       └── template-preview.tsx    # Template preview component
├── ui/                             # Base UI components (Shadcn + Radix)
│   ├── accordion.tsx               # Accordion component
│   ├── alert.tsx                   # Alert/notification component
│   ├── badge.tsx                   # Badge/tag component
│   ├── button.tsx                  # Button component (variants)
│   ├── calendar.tsx                # Calendar picker
│   ├── card.tsx                    # Card layout component
│   ├── checkbox.tsx                # Checkbox input
│   ├── command.tsx                 # Command palette component
│   ├── date-picker.tsx             # Date picker component
│   ├── dialog.tsx                  # Modal/dialog component
│   ├── form.tsx                    # Form components & validation
│   ├── input.tsx                   # Text input component
│   ├── label.tsx                   # Form label component
│   ├── popover.tsx                 # Popover overlay component
│   ├── progress.tsx                # Progress bar component
│   ├── radio-group.tsx             # Radio button group
│   ├── select.tsx                  # Select dropdown component
│   ├── slider.tsx                  # Range slider component
│   ├── switch.tsx                  # Toggle switch component
│   ├── tabs.tsx                    # Tab navigation component
│   ├── textarea.tsx                # Multi-line text input
│   ├── toast.tsx                   # Toast notification component
│   ├── toaster.tsx                 # Toast container & manager
│   └── use-toast.ts                # Toast hook for notifications
├── client-home-page.tsx            # Client-side home page component
└── theme-provider.tsx              # Next-themes provider wrapper
```

**Note on Tailwind v4 Migration**: Many UI components have `.new` and `.backup` versions during the ongoing Tailwind CSS v3 to v4 migration. The directory listing above shows the current active versions.

### `/lib` - Core Libraries and Utilities

```
lib/
├── ai/                             # AI integration layer (Anthropic Claude)
│   ├── anthropic-client.ts         # Anthropic SDK client wrapper
│   ├── claude-client.ts            # Claude API operations with retry logic
│   ├── claude-tools.ts             # Claude tool definitions for structured data
│   ├── prompt-builder.ts           # Dynamic prompt construction utilities
│   └── prompt-templates.ts         # Static prompt templates for AI tasks
├── hooks/
│   └── use-api-error.ts            # Client-side API error handling hook
├── middlewares/                    # Request/response middleware
│   ├── audit-logging-middleware.ts # Security audit trail logging
│   ├── error-handler.ts            # Standardized error handling (withErrorHandler)
│   ├── error-logging-middleware.ts # Error logging and tracking
│   └── query-monitoring-middleware.ts # Database query performance monitoring
├── services/                       # Business logic layer
│   ├── ai-service.ts               # AI operations & structured data extraction
│   ├── analytics-service.ts        # Server-side analytics service
│   ├── job-description-service.ts  # Job description CRUD & analysis
│   └── resume-service.ts           # Resume CRUD operations & business logic
├── supabase/                       # Supabase integration (CRITICAL: See separation pattern)
│   ├── audit-logger.ts             # Audit logging utility for security events
│   ├── auth-utils.ts               # RBAC utilities & permission checking
│   ├── browser.ts                  # Browser-safe Supabase client (client components)
│   ├── client.ts                   # Legacy unified client (being phased out)
│   ├── query-analyzer.ts           # SQL query analysis & optimization
│   ├── query-monitoring.ts         # Real-time query performance monitoring
│   └── server.ts                   # Server-only Supabase client (API routes/SSR)
├── utils/                          # General utilities
│   ├── api-utils.ts                # API helper functions & request utilities
│   ├── client-analytics.ts         # Browser-safe analytics (client components)
│   ├── diff-utils.ts               # Text/object comparison utilities
│   ├── error-utils.ts              # Error classification & standardized responses
│   ├── formatting.ts               # Text formatting & transformation utilities
│   ├── logger.ts                   # Structured logging utilities
│   ├── rate-limiter.ts             # Rate limiting utilities
│   ├── retry-utils.ts              # Exponential backoff & retry logic
│   ├── utils.ts                    # Core utility functions (cn, etc.)
│   └── validation.ts               # Input validation with Zod schemas
└── utils.ts                        # Main utility exports (clsx, tailwind-merge)
```

**CRITICAL - Supabase Client/Server Separation**: 
- `browser.ts` - Use in client components (`'use client'`)
- `server.ts` - Use in API routes, server components, middleware
- `client.ts` - Legacy file being phased out

### `/hooks` - React Hooks

```
hooks/
├── use-api-error.ts                # API error state management
├── use-job-description.ts          # Job description operations
├── use-resume.ts                   # Resume operations
├── use-toast.ts                    # Toast notifications
└── use-undo-history.ts             # Undo/redo functionality
```

### `/types` - TypeScript Type Definitions

```
types/
├── api.ts                          # API request/response types
├── job-description.ts              # Job description types
├── monitoring.ts                   # Monitoring/analytics types
├── resume.ts                       # Resume data types
├── supabase.ts                     # Generated Supabase types
└── user.ts                         # User and auth types
```

### `/models` - Data Models

```
models/
├── job-description.ts              # Job description data model
├── resume.ts                       # Resume data model
└── user.ts                         # User data model
```

## Database and Infrastructure

### `/supabase` - Supabase Database Configuration

```
supabase/
├── migrations/                     # Versioned database migrations
│   ├── 20240515000000_create_tables.sql           # Initial table creation
│   ├── 20240515000001_advanced_data_integrity.sql # Data validation constraints
│   ├── 20240515000002_optimized_indexing.sql      # Performance indexes
│   ├── 20240515000003_json_storage_optimization.sql # JSONB optimizations
│   ├── 20240515000004_row_level_security.sql      # RLS policies
│   ├── 20240515000005_role_based_access_control.sql # RBAC implementation
│   ├── 20250603113009_create_profiles_table_clean.sql # Profiles table (June 2025)
│   └── 20250609153510_add_profile_creation_trigger.sql # Auto profile creation
├── schemas/                        # Declarative schema definitions
│   ├── 00_schema_init.sql          # Schema initialization
│   ├── 01_types_and_domains.sql    # Custom types & enums
│   ├── 02_tables.sql               # Table definitions
│   ├── 03_indexes.sql              # Performance indexes
│   ├── 04_functions.sql            # Database functions & triggers
│   ├── 05_policies.sql             # Row Level Security policies
│   └── 06_materialized_views.sql   # Materialized views for analytics
├── tests/
│   └── rbac_policy_tests.sql       # RBAC policy validation tests
├── README.md                       # Supabase setup & migration guide
└── config.toml                     # Supabase local development configuration
```

### `/database` - Database Utilities

```
database/
└── migrations/                     # Additional migration files
    ├── 00_migration_readme.md
    ├── 01_advanced_data_integrity.sql
    ├── 02_optimized_indexing.sql
    ├── 03_json_storage_optimization.sql
    ├── 04_row_level_security.sql
    ├── 05_audit_trail.sql
    ├── 06_transaction_management.sql
    ├── 07_performance_monitoring.sql
    ├── 08_materialized_views.sql
    ├── 09_connection_pooling.sql
    ├── 10_log_tracking_system.sql
    ├── 11_query_performance_monitoring.sql
    ├── 12_explain_analyze_function.sql
    └── 13_critical_operations_logging.sql
```

### `/supabase-rules` - Supabase Guidelines

```
supabase-rules/
├── postgresql-style-guide.md       # PostgreSQL best practices
├── supabase-auth-nextjs-guide.md   # Auth integration guide
├── supabase-create-functions-guide.md # Database functions guide
├── supabase-create-migrations.md   # Migration guide
├── supabase-create-rls-policies-guidelines.md # RLS policy guide
├── supabase-database-schema-guide.md # Schema design guide
└── supabase-edge-functions-guidelines.md # Edge functions guide
```

## Testing

### `/tests` - Test Suite

```
tests/
├── integration/                    # Integration tests
│   ├── api-routes.test.ts         # API route testing
│   ├── api-routes.test.ts.bak     # Backup test file
│   └── middleware.test.ts         # Middleware testing
├── unit/                          # Unit tests
│   ├── auth-utils.test.ts         # Auth utility tests
│   ├── error-handling.test.ts     # Error handling tests
│   ├── job-description-service.test.ts # Job service tests
│   ├── job-description-service.test.ts.bak # Backup
│   ├── resume-service.test.ts     # Resume service tests
│   └── resume-service.test.ts.bak # Backup
├── supabase/                      # Supabase-specific tests
│   ├── sql/
│   │   └── pgtap-tests/
│   │       └── rbac_policy_tests.sql # Policy tests
│   ├── seed-test-data.ts          # Test data seeding
│   ├── test-environment.ts        # Test environment setup
│   ├── test-reset.js              # Database reset utility
│   ├── test-reset.ts              # TypeScript reset utility
│   └── test-utils.ts              # Testing utilities
├── jest.setup.ts                  # Jest setup configuration
└── README.md                      # Testing documentation
```

### `/__tests__` - Component Tests

```
__tests__/
├── app/
│   └── api/
│       └── ai/
│           ├── claude/
│           │   └── route.test.ts  # Claude API tests
│           └── claude-stream/
│               └── route.test.ts  # Streaming API tests
├── lib/
│   └── ai/
│       ├── anthropic-client.test.ts # Anthropic client tests
│       ├── claude-client.test.ts    # Claude client tests
│       └── claude-tools.test.ts     # Claude tools tests
└── setup.js                       # Test setup
```

## Documentation

### `/docs` - Project Documentation

```
docs/
├── audit-logging-guide.md                           # Security audit logging setup
├── authentication-implementation-analysis.md        # Auth system analysis
├── comprehensive-application-guide.md               # Complete technical documentation (PRIMARY)
├── context7-guide.md                               # Context7 AI documentation tool guide
├── custom-email-templates-implementation-plan.md    # Email template customization
├── database-monitoring-guide.md                    # Database performance monitoring
├── database-schema-alignment-plan.md               # Schema migration strategy
├── directory-structure.md                          # This file - codebase organization
├── email-confirmation-fix-implementation-plan.md    # Email verification fixes
├── email-verification-failure-investigation-plan.md # Email debugging guide
├── email-verification-modernization-plan.md        # Email system improvements
├── email-verification-testing-guide.md             # Email verification testing
├── error-handling-guide.md                         # Error handling patterns
├── error-tracking-guide.md                         # Error tracking implementation
├── immediate-next-steps-implementation-plan.md      # Priority task planning
├── issue-resolution-plan.md                        # Issue resolution procedures
├── onboarding-improvement-implementation-plan.md    # User onboarding enhancements
├── optimal-onboarding-flow-analysis.md             # Onboarding flow optimization
├── password-reset-implementation-plan.md           # Password reset feature
├── password-reset-planning-prompt.md               # Password reset planning
├── post-registration-error-investigation.md        # Post-signup error debugging
├── profile-creation-fix.md                         # Profile creation error fixes
├── query-analyzer-guide.md                         # SQL query analysis
├── redis-rate-limiting-implementation-plan.md      # Rate limiting with Redis
├── signup-flow-oauth-implementation-plan.md        # OAuth integration planning
├── signup-flow-update-PRD.md                       # Signup flow requirements
├── supabase-client-separation-fix.md               # Client/server separation guide
├── supabase-email-verification-configuration-guide.md # Supabase email config
├── test-environment-fix.md                         # Testing environment setup
├── typescript-migration-guide.md                   # TypeScript migration
└── unit-testing-implementation-plan.md             # Unit testing strategy
```

**Key Documentation Files**:
- `comprehensive-application-guide.md` - Primary technical documentation
- `directory-structure.md` - This file, codebase organization reference
- `authentication-implementation-analysis.md` - Auth system deep dive
- `database-schema-alignment-plan.md` - Database evolution strategy

## Assets and Static Files

### `/public` - Static Assets

```
public/
├── images/
│   └── logo.svg                    # Application logo
├── templates/                      # Resume template previews
│   ├── modern.png
│   └── professional.png
├── file.svg                        # File icons
├── globe.svg
├── grid.svg
├── next.svg                        # Next.js logo
├── vercel.svg                      # Vercel logo
└── window.svg
```

### `/screenshots` - Development Screenshots

```
screenshots/
├── image.png                       # Various development screenshots
├── image copy.png                  # for testing and documentation
├── screenshot-2025-05-17T07-00-35-993Z.png
├── screenshot-2025-05-17T07-04-22-061Z.png
├── [... many timestamped screenshots ...]
└── screenshot-2025-06-02T14-51-40-103Z.png
```

## Scripts and Utilities

### `/scripts` - Development Scripts

```
scripts/
├── context7-test.js                # Context7 testing script
├── example_prd.txt                 # Example PRD document
├── prd.txt                         # Product requirements document
├── replace-components.sh           # Component replacement script
├── replace-components.sh.new       # Updated replacement script
└── validation-plan.md              # Validation planning document
```

### `/services` - Additional Services

```
services/
└── analytics-service.ts            # Analytics service implementation
```

### `/tasks` - Task Management

```
tasks/
└── [Task management files - currently empty]
```

## Key Architectural Patterns

### File Naming Conventions

- **Components**: PascalCase (e.g., `ResumeEditor.tsx`, `JobMatchPanel.tsx`)
- **Utilities**: kebab-case (e.g., `auth-utils.ts`, `error-utils.ts`)
- **API Routes**: kebab-case directories (e.g., `tailor-resume/route.ts`, `claude-stream/route.ts`)
- **Types**: kebab-case (e.g., `job-description.ts`, `supabase.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useResume.ts`, `useJobDescription.ts`)

### Component Organization Hierarchy

1. **Base UI Components** (`/components/ui/`): 
   - Radix UI primitives with Shadcn styling
   - Reusable across entire application
   - Currently migrating to Tailwind v4

2. **Business Logic Components** (`/components/`):
   - Feature-specific components (auth, resume, AI)
   - Domain-specific logic and state management
   - Compose base UI components

3. **Page Components** (`/app/`):
   - Route-specific layouts and data fetching
   - Server components for data loading
   - Client components for interactivity

### Service Layer Architecture

```
Frontend (React 19) → API Routes (Next.js 15) → Service Layer → Data Layer (Supabase)
                                ↓
                         Middleware (Error Handling, Auth, Monitoring)
                                ↓
                         External Services (Claude AI, Analytics)
```

1. **API Routes** (`/app/api/`): HTTP request/response handling
2. **Service Layer** (`/lib/services/`): Business logic abstraction
3. **Data Layer** (`/lib/supabase/`): Database operations with RLS
4. **External Services** (`/lib/ai/`): Third-party API integrations

### Critical Separation Patterns

#### Supabase Client/Server Separation (June 8, 2025)
- **Browser Client** (`/lib/supabase/browser.ts`): Client components only
- **Server Client** (`/lib/supabase/server.ts`): API routes, server components
- **Analytics Separation** (`/lib/utils/client-analytics.ts`): Browser-safe analytics

#### Error Handling Architecture
- **Standardized Middleware** (`/lib/middlewares/error-handler.ts`)
- **Error Classification** (`/lib/utils/error-utils.ts`): 12 categories, 40+ codes
- **Service-Specific Handlers**: Supabase, Anthropic, validation errors

### Migration Strategies

#### Tailwind CSS v3 → v4 Migration (In Progress)
- **Current Files**: Active production versions
- **Backup Files**: `.backup` suffix (v3 versions)
- **New Files**: `.new` suffix (v4 versions, testing)
- **Strategy**: Gradual component-by-component migration

#### Authentication Migration (Completed June 4, 2025)
- **Legacy**: `@supabase/auth-helpers-nextjs` (deprecated)
- **Current**: `@supabase/ssr` v0.5.2 with client/server separation
- **OAuth Integration**: Google, LinkedIn OIDC, Email verification

### Database Evolution (June 2025)

#### Recent Migrations
- **Profiles Table**: Critical OAuth integration table
- **Automated Triggers**: Profile creation on user signup
- **RLS Policies**: Comprehensive row-level security
- **Performance Indexes**: Query optimization

### Development Workflow Patterns

#### Testing Strategy
- **Unit Tests**: `/tests/unit/` - Service layer and utilities
- **Integration Tests**: `/tests/integration/` - API routes and flows
- **Component Tests**: `/__tests__/` - React component testing
- **Database Tests**: `/tests/supabase/` - Database operations

#### Code Quality Enforcement
- **TypeScript**: Strict mode, no `any` types
- **ESLint**: Code quality and best practices
- **Prettier**: Consistent code formatting
- **Jest**: 70% minimum test coverage requirement

This directory structure reflects Victry's evolution into a sophisticated AI-powered application with robust authentication, comprehensive error handling, and scalable architecture patterns designed for enterprise-grade resume building and job application management.