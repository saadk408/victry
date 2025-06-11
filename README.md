# Victry: AI-Powered Resume Builder

Victry is an AI-powered resume builder designed to dramatically reduce the time and stress associated with resume tailoring while maintaining authenticity and ATS compatibility. It achieves this through a user-friendly interface, intelligent AI-assisted content generation, and transparent resume optimization.

## Core Features & Value

- **Time Efficiency**: Transform hours of resume tailoring into minutes.
- **ATS Optimization**: Ensure resumes pass Applicant Tracking Systems.
- **Emotional Support**: Reduce anxiety associated with resume writing.
- **Authentic Voice**: Preserve the user's unique voice in AI-assisted content.
- **Transparency**: Clear visibility into how AI is helping and why changes are suggested.

## Tech Stack

- **Frontend**: Next.js 15.3.2 with React 19.1.0 and TypeScript 5.8.2
- **Styling**: Tailwind CSS 4.1.7 with ShadCN components and tailwindcss-animate
- **State Management**: React Context API and custom hooks
- **Form Management**: react-hook-form with zod validation
- **Rich Text Editing**: TipTap with extensions (link, underline, placeholder, starter-kit)
- **Animation**: Framer Motion 12.12.1
- **Drag and Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Database**: Supabase (PostgreSQL) with @supabase/ssr integration
- **Authentication**: Supabase Auth with role-based access control
- **File Storage**: Supabase Storage
- **AI Integration**: Claude 3.7 Sonnet via @anthropic-ai/sdk v0.51.0 with tools and streaming
- **Testing**: Jest 29.7.0 with React Testing Library and MSW
- **Date Handling**: date-fns and react-day-picker
- **Utilities**: clsx, class-variance-authority, tailwind-merge
- **Icons**: Lucide React
- **Command Interface**: cmdk
- **Diff Generation**: diff package for change tracking

## Project Structure

- `/app`: Next.js app router structure
  - `/(auth)`: Authentication routes (login, register, reset-password)
  - `/api`: API routes for AI, auth, monitoring, and data operations
  - `/dashboard`: User dashboard with analytics
  - `/resume`: Resume creation, editing, and tailoring
  - `/onboarding`: User onboarding flow
  
- `/components`: Reusable React components
  - `/account`: User account and subscription management
  - `/ai`: AI-specific components and controls
  - `/analytics`: Usage tracking and application analytics
  - `/auth`: Authentication forms and OAuth buttons
  - `/resume`: Resume editing, preview, and analysis components
  - `/ui`: UI primitives (ShadCN)
  
- `/lib`: Utility functions and service integrations
  - `/ai`: Claude AI integration with tools and streaming
  - `/services`: Business logic services
  - `/supabase`: Database client utilities (browser/server separation)
  - `/utils`: General utilities, error handling, validation
  - `/middlewares`: Request processing middlewares
  
- `/supabase`: Database configuration and migrations
  - `/migrations`: Database schema migrations
  - `/schemas`: SQL schema definitions
  
- `/tests`: Test suites with 70% coverage requirement
  - `/unit`: Unit tests for services and utilities
  - `/integration`: API route and middleware tests
  - `/supabase`: Database testing utilities and seed data
  
- `/types`: TypeScript type definitions
- `/hooks`: Custom React hooks for state management
- `/models`: Data models and interfaces

## Database Optimizations

The application features a highly optimized PostgreSQL database on Supabase with:

1. **Data Integrity Controls**: Custom domains and constraints ensure data validity
2. **Optimized Indexing**: Strategic indexes for foreign keys, text search, and timestamp queries
3. **JSON Storage**: JSONB columns for flexible storage with proper indexing
4. **Row Level Security**: Policies ensuring users can only access their own data
5. **Transaction Management**: Robust stored procedures with error handling
6. **Performance Monitoring**: Functions to identify slow queries and database health
7. **Materialized Views**: Pre-computed results for common queries
8. **Connection Pooling**: Functions optimized for PgBouncer compatibility
9. **Audit Trails**: Efficient change tracking with BRIN indexes

## Setup Instructions

### Prerequisites

- Node.js 18.17.0 or later
- npm 8.0.0+ or pnpm 8.0.0+ (project supports both package managers)
- Supabase account and CLI for database management
- Anthropic account with API access for Claude integration
- TypeScript knowledge (project is fully TypeScript-based)
- Git for version control

### Environment Variables

Create a `.env.local` file with the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/victry.git
   cd victry
   ```

2. Install dependencies (choose your preferred package manager):
   ```bash
   npm install
   # OR
   pnpm install
   ```

3. Install Supabase CLI globally:
   ```bash
   npm install -g supabase
   ```

4. Set up environment variables:
   - Copy `.env.local` template and fill in your credentials
   - Ensure all required keys are present (see Environment Variables section)

5. Initialize and start Supabase locally:
   ```bash
   npx supabase init
   npx supabase start
   ```

6. Run database migrations:
   ```bash
   npx supabase migration up
   ```

7. Generate TypeScript types:
   ```bash
   npx supabase gen types typescript --local
   ```

8. Verify setup by running tests:
   ```bash
   npm test
   ```

9. Start the development server:
   ```bash
   npm run dev
   ```

10. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Development Workflow

```bash
# Development
npm run dev                          # Start dev server (localhost:3000)
npm run build && npx tsc --noEmit    # Build + type check (always run together)
npm run lint                         # Lint code

# Testing (70% coverage required)
npm run test                         # Run all tests (auto-resets DB)
npm run test:unit                    # Unit tests only  
npm run test:integration             # Integration tests only
npm run test:db                      # Database tests
npm run test:reset-db                # Reset DB with test data
npm test -- --testNamePattern="resume" # Test specific functionality
npm run test:watch                   # Tests in watch mode

# AI Feature Testing
curl -X POST localhost:3000/api/ai/analyze-job \
  -H "Content-Type: application/json" \
  -d '{"jobDescription": "Software Engineer at TechCorp..."}'

curl -X POST localhost:3000/api/ai/tailor-resume \
  -H "Authorization: Bearer token" \
  -d '{"resumeId": "123", "jobId": "456"}'

# Database Operations
npx supabase gen types typescript --local  # After schema changes
npx supabase migration new <name>          # Create new migration
npx supabase migration up                  # Apply migrations

# Production
npm run build                        # Build for production
npm run start                       # Start production server
```

## Testing Infrastructure

The application uses Jest with comprehensive testing requirements:

**Coverage Requirements:**
- Minimum 70% coverage across branches, functions, lines, and statements
- Automatic database reset with resume test data before each test run

**Test Structure:**
Tests are located in the `/tests` directory (not `__tests__`):
- `tests/unit/`: Unit tests for services, utilities, and components
- `tests/integration/`: API route and middleware integration tests
- `tests/supabase/`: Database testing utilities and seed data

**Test Categories:**
- **AI Integration**: Claude client, prompt templates, and structured extraction
- **Authentication**: Auth utilities and role-based access
- **Resume Services**: CRUD operations and data validation
- **Error Handling**: 12-category error system with 40+ specific codes
- **API Routes**: All `/api` endpoints with proper mocking

**Running Tests:**
```bash
npm test                    # All tests with coverage report
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm test -- --watch       # Watch mode for development
```

**Test Environment:**
- MSW for API mocking
- Automatic database reset with seed data
- Mocked Anthropic SDK for AI testing
- Jest environment: jsdom for React components

## Database Management

### Migrations

The project uses Supabase CLI for database management:

```bash
# Apply all pending migrations
npx supabase migration up

# Create a new migration
npx supabase migration new <migration_name>

# Reset local database
npx supabase db reset

# Generate TypeScript types after schema changes
npx supabase gen types typescript --local
```

**Migration Locations:**
- `/supabase/migrations/`: Schema migrations
- `/supabase/schemas/`: Organized SQL schema definitions

**Manual Migration (if needed):**
1. Navigate to your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste migration scripts from `/supabase/migrations/` in sequence
4. Execute each script in order

See `/supabase/migrations/` for migration files and `/supabase/README.md` for detailed instructions.

## AI Integration Features

Victry includes sophisticated AI capabilities powered by Claude 3.7 Sonnet:

### Core AI Features
- **Job Analysis**: Structured extraction of skills, requirements, and keywords
- **Resume Tailoring**: AI-powered content optimization for specific jobs (Premium)
- **ATS Optimization**: Automatic optimization for Applicant Tracking Systems
- **Keyword Matching**: Intelligent keyword analysis and suggestion

### Technical Implementation
- **Claude Tools**: JSON schema validation for structured data extraction
- **Streaming Responses**: Real-time AI interaction capabilities
- **Temperature Control**: Configurable creativity (0.2 factual, 0.5 creative)
- **Premium Gates**: Subscription-based access to advanced AI features
- **Retry Logic**: Exponential backoff with rate limit handling
- **Error Handling**: Comprehensive error tracking and user feedback

### AI API Endpoints
```bash
# Analyze job description
POST /api/ai/analyze-job
# Tailor resume (Premium)
POST /api/ai/tailor-resume  
# General Claude queries
POST /api/ai/claude
# Streaming responses
POST /api/ai/claude-stream
```

### Usage Examples
See `/lib/ai/prompt-templates.ts` for structured prompts and `/lib/services/ai-service.ts` for implementation details.

## Error Handling System

Victry implements a comprehensive error handling system:

### Error Categories (12 total)
- AUTH, PERMISSION, VALIDATION, NOT_FOUND, CONFLICT, RATE_LIMIT
- SERVICE, DATABASE, AI, SERVER, IO, NETWORK

### Specific Error Codes (40+ available)
- `ErrorCode.AUTH_INVALID_CREDENTIALS`
- `ErrorCode.AI_TOKEN_LIMIT`
- `ErrorCode.DATABASE_FOREIGN_KEY_ERROR`
- And many more...

### Implementation
```typescript
import { createApiError, ErrorCategory, ErrorCode } from '@/lib/utils/error-utils';

// Usage example
return createApiError('Access denied', ErrorCategory.PERMISSION, 403);
```

See `/lib/utils/error-utils.ts` for complete error handling implementation.

## Monitoring & Analytics

### Database Monitoring
- Query performance analysis via `/api/query-analyzer`
- Database health metrics via `/api/db-monitoring`
- Audit logging for all critical operations

### Analytics System
- Client-safe analytics via `/lib/utils/client-analytics.ts`
- Server-side analytics service with direct Supabase writes
- User activity tracking and performance metrics

### Development Monitoring
```bash
# Check database performance
curl http://localhost:3000/api/db-monitoring

# Analyze query performance
curl http://localhost:3000/api/query-analyzer

# View audit logs
curl http://localhost:3000/api/audit-logs
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## License

[MIT License](LICENSE)