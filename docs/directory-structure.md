# Victry Directory Structure

This document provides a comprehensive overview of the Victry codebase organization and file structure.

## Project Root

```
victry/
├── .eslintrc.json                    # ESLint configuration
├── CLAUDE.md                         # AI assistant instructions
├── README.md                         # Project documentation
├── README-task-master.md             # Task master documentation
├── components.json                   # Shadcn/UI component configuration
├── jest.config.js                    # Jest testing configuration
├── jest.hasteConfig.js              # Jest haste configuration
├── masterplan.md                     # Project roadmap and planning
├── middleware.ts                     # Next.js middleware for auth/RBAC
├── next.config.ts                    # Next.js configuration
├── package.json                      # Dependencies and scripts
├── package-lock.json                 # Locked dependency versions
├── pnpm-lock.yaml                    # PNPM lock file
├── postcss.config.js                 # PostCSS configuration
├── postcss.config.mjs                # PostCSS ESM configuration
├── prettier.config.js                # Prettier formatting configuration
├── tailwind.config.js.backup         # Tailwind v3 backup
├── tailwind.config.v4.js             # Tailwind v4 configuration
└── tsconfig.json                     # TypeScript configuration
```

## Application Structure

### `/app` - Next.js App Router

```
app/
├── (auth)/                           # Auth route group
│   ├── login/
│   │   └── page.tsx                 # Login page
│   └── register/
│       └── page.tsx                 # Registration page
├── access-denied/
│   └── page.tsx                     # Access denied page
├── api/                             # API route handlers
│   ├── ai/                          # AI-powered endpoints
│   │   ├── analyze-job/
│   │   │   └── route.ts            # Job description analysis
│   │   ├── claude/
│   │   │   └── route.ts            # General Claude queries
│   │   ├── claude-stream/
│   │   │   └── route.ts            # Streaming Claude responses
│   │   └── tailor-resume/
│   │       └── route.ts            # Resume tailoring service
│   ├── audit-logs/
│   │   └── route.ts                # Security audit logging
│   ├── db-monitoring/
│   │   └── route.ts                # Database performance monitoring
│   ├── example-with-error-handler/
│   │   └── route.ts                # Error handling example
│   ├── example-with-error-tracking/
│   │   └── route.ts                # Error tracking example
│   ├── job-description/
│   │   └── route.ts                # Job description CRUD
│   ├── query-analyzer/
│   │   └── route.ts                # Query performance analysis
│   └── resume/
│       └── route.ts                # Resume CRUD operations
├── browser-compatibility-test/
│   └── page.tsx                     # Browser compatibility testing
├── dashboard/
│   ├── _components/
│   │   └── stats-card.tsx          # Dashboard statistics card
│   └── page.tsx                     # Main dashboard
├── performance-test/
│   └── page.tsx                     # Performance testing page
├── resume/
│   ├── [id]/                        # Dynamic resume routes
│   │   ├── edit/
│   │   │   └── page.tsx            # Resume editing interface
│   │   ├── page.tsx                # Resume detail view
│   │   └── tailor/
│   │       └── page.tsx            # AI resume tailoring
│   ├── _components/                 # Resume-specific components
│   │   ├── job-description-input.tsx
│   │   ├── job-match-panel.tsx
│   │   ├── resume-editor.tsx
│   │   ├── resume-preview.tsx
│   │   ├── resume-score-panel.tsx
│   │   └── templates-panel.tsx
│   ├── create/
│   │   └── page.tsx                # Resume creation
│   └── page.tsx                     # Resume listing
├── test-tailwind-v4/
│   └── page.tsx                     # Tailwind v4 testing
├── upgrade/
│   └── page.tsx                     # Premium upgrade page
├── favicon.ico                      # Site favicon
├── globals.css                      # Global CSS styles
├── globals.css.backup               # CSS backup during migration
├── layout.tsx                       # Root layout component
└── page.tsx                         # Home page
```

### `/components` - Reusable Components

```
components/
├── account/
│   ├── profile-editor.tsx           # User profile editing
│   └── subscription-plans.tsx      # Subscription plan display
├── ai/
│   ├── ai-suggestion.tsx           # AI suggestion component
│   └── tailoring-controls.tsx      # Resume tailoring controls
├── analytics/
│   └── application-tracking.tsx    # Job application tracking
├── auth/
│   ├── login-form.tsx              # Login form component
│   ├── register-form.tsx           # Registration form
│   └── role-based-access.tsx       # Role-based access control
├── cover-letter/
│   └── cover-letter-editor.tsx     # Cover letter editing
├── layout/
│   ├── footer.tsx                  # Site footer
│   ├── header.tsx                  # Site header
│   └── sidebar.tsx                 # Navigation sidebar
├── resume/
│   ├── ats-score.tsx               # ATS compatibility score
│   ├── editor-controls/            # Resume editing controls
│   │   ├── date-range-picker.tsx
│   │   ├── rich-text-editor.tsx
│   │   ├── skill-input.tsx
│   │   └── sortable-list.tsx
│   ├── export-controls.tsx         # Export functionality
│   ├── import-controls.tsx         # Import functionality
│   ├── keyword-analysis.tsx        # Keyword analysis display
│   ├── premium-feature.tsx         # Premium feature wrapper
│   ├── section-editor/             # Resume section editors
│   │   ├── certifications.tsx
│   │   ├── education.tsx
│   │   ├── personal-info.tsx
│   │   ├── projects.tsx
│   │   ├── skills.tsx
│   │   ├── social-links.tsx
│   │   ├── summary.tsx
│   │   └── work-experience.tsx
│   └── templates/
│       ├── template-picker.tsx     # Template selection
│       └── template-preview.tsx    # Template preview
├── ui/                             # Base UI components (Radix-based)
│   ├── accordion.tsx               # Accordion component
│   ├── accordion.tsx.backup        # Tailwind v3 backup
│   ├── accordion.tsx.new           # Tailwind v4 version
│   ├── alert.tsx                   # Alert component
│   ├── alert.tsx.new               # Tailwind v4 version
│   ├── badge.tsx                   # Badge component
│   ├── button.tsx                  # Button component
│   ├── button.tsx.backup           # Tailwind v3 backup
│   ├── button.tsx.new              # Tailwind v4 version
│   ├── calendar.tsx                # Calendar component
│   ├── card.tsx                    # Card component
│   ├── card.tsx.new                # Tailwind v4 version
│   ├── checkbox.tsx                # Checkbox component
│   ├── checkbox.tsx.new            # Tailwind v4 version
│   ├── command.tsx                 # Command palette
│   ├── command.tsx.new             # Tailwind v4 version
│   ├── date-picker.tsx             # Date picker
│   ├── date-picker.tsx.new         # Tailwind v4 version
│   ├── dialog.tsx                  # Dialog/modal component
│   ├── dialog.tsx.new              # Tailwind v4 version
│   ├── form.tsx                    # Form components
│   ├── form.tsx.new                # Tailwind v4 version
│   ├── input.tsx                   # Input component
│   ├── input.tsx.backup            # Tailwind v3 backup
│   ├── input.tsx.new               # Tailwind v4 version
│   ├── label.tsx                   # Label component
│   ├── label.tsx.new               # Tailwind v4 version
│   ├── popover.tsx                 # Popover component
│   ├── popover.tsx.new             # Tailwind v4 version
│   ├── progress.tsx                # Progress bar
│   ├── progress.tsx.new            # Tailwind v4 version
│   ├── radio-group.tsx             # Radio group
│   ├── radio-group.tsx.new         # Tailwind v4 version
│   ├── select.tsx                  # Select dropdown
│   ├── select.tsx.new              # Tailwind v4 version
│   ├── slider.tsx                  # Slider component
│   ├── slider.tsx.new              # Tailwind v4 version
│   ├── switch.tsx                  # Switch/toggle
│   ├── switch.tsx.new              # Tailwind v4 version
│   ├── tabs.tsx                    # Tabs component
│   ├── tabs.tsx.new                # Tailwind v4 version
│   ├── test-tailwind-v4-components.tsx      # Testing components
│   ├── test-tailwind-v4-components.tsx.new  # Updated test components
│   ├── test-tailwind-v4.tsx        # Tailwind v4 testing
│   ├── textarea.tsx                # Textarea component
│   ├── textarea.tsx.new            # Tailwind v4 version
│   ├── toast.tsx                   # Toast notifications
│   ├── toast.tsx.new               # Tailwind v4 version
│   ├── toaster.tsx                 # Toast container
│   └── use-toast.ts                # Toast hook
├── client-home-page.tsx            # Client-side home page
└── theme-provider.tsx              # Theme context provider
```

### `/lib` - Core Libraries and Utilities

```
lib/
├── ai/                             # AI integration layer
│   ├── anthropic-client.ts         # Anthropic/Claude client
│   ├── claude-client.ts            # Claude API wrapper
│   ├── claude-tools.ts             # Claude tool definitions
│   ├── prompt-builder.ts           # Dynamic prompt construction
│   └── prompt-templates.ts         # Static prompt templates
├── hooks/
│   └── use-api-error.ts            # API error handling hook
├── middlewares/                    # Custom middleware
│   ├── audit-logging-middleware.ts # Audit logging
│   ├── error-handler.ts            # Error handling middleware
│   ├── error-logging-middleware.ts # Error logging
│   └── query-monitoring-middleware.ts # Query performance monitoring
├── services/                       # Business logic layer
│   ├── ai-service.ts               # AI operations service
│   ├── analytics-service.ts        # Analytics service
│   ├── job-description-service.ts  # Job description operations
│   └── resume-service.ts           # Resume operations
├── supabase/                       # Supabase integration
│   ├── audit-logger.ts             # Audit logging utility
│   ├── auth-utils.ts               # Authentication utilities
│   ├── client.ts                   # Supabase client setup
│   ├── query-analyzer.ts           # Query analysis
│   └── query-monitoring.ts         # Query performance monitoring
├── utils/                          # General utilities
│   ├── api-utils.ts                # API utility functions
│   ├── diff-utils.ts               # Diff/comparison utilities
│   ├── error-utils.ts              # Error handling utilities
│   ├── formatting.ts               # Text formatting utilities
│   ├── logger.ts                   # Logging utilities
│   ├── retry-utils.ts              # Retry logic utilities
│   ├── utils.ts                    # General utilities
│   └── validation.ts               # Input validation
└── utils.ts                        # Main utility exports
```

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

### `/supabase` - Supabase Configuration

```
supabase/
├── migrations/                     # Database migrations
│   ├── 20240515000000_create_tables.sql
│   ├── 20240515000001_advanced_data_integrity.sql
│   ├── 20240515000002_optimized_indexing.sql
│   ├── 20240515000003_json_storage_optimization.sql
│   ├── 20240515000004_row_level_security.sql
│   └── 20240515000005_role_based_access_control.sql
├── schemas/                        # Database schema definitions
│   ├── 00_schema_init.sql
│   ├── 01_types_and_domains.sql
│   ├── 02_tables.sql
│   ├── 03_indexes.sql
│   ├── 04_functions.sql
│   ├── 05_policies.sql
│   └── 06_materialized_views.sql
├── tests/
│   └── rbac_policy_tests.sql       # RBAC policy tests
├── README.md                       # Supabase setup instructions
└── config.toml                     # Supabase configuration
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
├── audit-logging-guide.md          # Audit logging implementation
├── context7-guide.md               # Context7 integration guide
├── database-monitoring-guide.md    # Database monitoring setup
├── error-handling-guide.md         # Error handling patterns
├── error-tracking-guide.md         # Error tracking implementation
├── issue-resolution-plan.md        # Issue resolution procedures
├── phase-1-completion-summary.md   # Project phase summaries
├── phase-5-browser-testing-checklist.md
├── phase-5-cross-browser-test-results.md
├── phase-5-hover-effects-fix-plan.md
├── query-analyzer-guide.md         # Query analysis guide
├── tailwind-v4-batch1-progress.md  # Tailwind v4 migration progress
├── tailwind-v4-batch2-plan.md
├── tailwind-v4-batch2-progress.md
├── tailwind-v4-batch3-plan.md
├── tailwind-v4-batch3-progress.md
├── tailwind-v4-component-guide.md  # Component migration guide
├── tailwind-v4-comprehensive-testing-plan.md
├── tailwind-v4-implementation-guide.md
├── tailwind-v4-improvements.md
├── tailwind-v4-migration-plan.md
├── tailwind-v4-migration-summary.md
├── tailwind-v4-performance-report.md
├── tailwind-v4-phase2-milestone.md
├── test-environment-fix.md         # Test environment setup
├── typescript-migration-guide.md   # TypeScript migration
└── comprehensive-application-guide.md # Complete app documentation
```

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

- **Components**: PascalCase (e.g., `ResumeEditor.tsx`)
- **Utilities**: kebab-case (e.g., `auth-utils.ts`)
- **API Routes**: kebab-case (e.g., `tailor-resume/route.ts`)
- **Types**: kebab-case (e.g., `job-description.ts`)

### Component Organization

- **Base UI Components**: `/components/ui/` - Radix UI primitives with custom styling
- **Business Components**: `/components/` - Feature-specific components
- **Page Components**: `/app/` - Route-specific layouts and logic

### Service Layer Pattern

- **API Routes**: Handle HTTP requests and responses
- **Service Layer**: Business logic abstraction (`/lib/services/`)
- **Data Layer**: Supabase client operations (`/lib/supabase/`)

### Migration Strategy

The codebase is currently undergoing a Tailwind CSS v3 to v4 migration:
- Original files: Standard names (e.g., `button.tsx`)
- Backup files: `.backup` suffix (e.g., `button.tsx.backup`)
- New v4 files: `.new` suffix (e.g., `button.tsx.new`)

This structure provides a comprehensive view of the Victry application's organization, showcasing its modular architecture, clear separation of concerns, and systematic approach to feature development and maintenance.