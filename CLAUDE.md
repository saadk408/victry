# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Victry is an AI-powered resume builder designed to help users create, tailor, and optimize their resumes for job applications. The application dramatically reduces the time and stress associated with resume tailoring while maintaining authenticity and ATS (Applicant Tracking System) compatibility.

### Core Value Propositions
- **Time Efficiency**: Transform hours of resume tailoring into minutes
- **ATS Optimization**: Ensure resumes pass Applicant Tracking Systems
- **Emotional Support**: Reduce anxiety associated with resume writing
- **Authentic Voice**: Preserve the user's unique voice in AI-assisted content
- **Transparency**: Clear visibility into how AI is helping and why changes are suggested

## Common Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type check the project
npx tsc --noEmit

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Technical Architecture

### Frontend
- Next.js 15.2.3 with React 19 and TypeScript 5.8.2
- Styling: Tailwind CSS 3.4.17 with ShadCN components
- State Management: React Context API and custom hooks
- Form Management: react-hook-form with zod validation
- Rich Text Editing: TipTap
- Animation: Framer Motion (imported via motion package)
  - Custom animation utilities in globals.css including fade-in, float, and pulse effects
- Drag and Drop: @dnd-kit/core, @dnd-kit/sortable

### Backend & Services
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- File Storage: Supabase Storage
- API Layer: Next.js API routes
- AI Integration: Claude 3.7 via API

### Infrastructure
- Hosting: Vercel for frontend and API routes
- Database Hosting: Supabase cloud

## Project Structure

- `/app`: Next.js app router structure
  - `/(auth)`: Authentication routes (login, register)
  - `/api`: API routes for server functions
  - `/dashboard`: User dashboard
  - `/resume`: Resume creation, editing, and tailoring
  
- `/components`: Reusable React components
  - `/account`: User account components
  - `/ai`: AI-specific components
  - `/analytics`: Usage and tracking components
  - `/auth`: Authentication forms
  - `/resume`: Resume-specific components
  - `/ui`: UI primitives (ShadCN)
  
- `/lib`: Utility functions and service integrations
  - `/ai`: Claude AI integration
  - `/services`: Business logic services
  - `/supabase`: Database client and utilities
  - `/utils`: General utilities
  
- `/models`: Core data models
- `/types`: TypeScript type definitions
- `/hooks`: Custom React hooks
- `/supabase`: Supabase configuration and migration files
  - `/migrations`: Timestamp-based migration files
  - `/schemas`: Declarative schema files (types, tables, functions, policies)

## Core Data Models

### Resume Model
The Resume model is the central data structure representing a user's resume. It includes:

```typescript
export interface Resume {
  id: string;
  userId?: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  targetJobTitle?: string;
  templateId: string;
  personalInfo?: PersonalInfo;
  professionalSummary?: ProfessionalSummary;
  workExperiences?: WorkExperience[];
  education?: Education[];
  skills?: Skill[];
  projects?: Project[];
  certifications?: Certification[];
  // ... additional fields
  isBaseResume?: boolean;
  originalResumeId?: string;
  jobDescriptionId?: string;
  atsScore?: number;
}
```

### JobDescription Model
The JobDescription model stores job postings for tailoring resumes:

```typescript
export interface JobDescription {
  id: string;
  userId?: string;
  title: string;
  company: string;
  location?: string;
  jobType?: string;
  salary?: string;
  content: string;
  url?: string;
  keywords?: string[];
  analysis?: Record<string, any> | null;
}
```

## Key API Endpoints

- `/api/resume`: CRUD operations for resumes
- `/api/job-description`: CRUD operations for job descriptions
- `/api/ai/analyze-job`: AI analysis of job descriptions
- `/api/ai/tailor-resume`: AI tailoring of resumes to match jobs

## AI Integration

The application uses Claude 3.7 for AI-powered features. The integration is structured around:

- `lib/ai/claude-client.ts`: Client for Claude API communication
- `lib/ai/prompt-builder.ts`: Constructs prompts for different AI operations
- `lib/ai/prompt-templates.ts`: Stores template strings for different AI tasks

AI features include:
- Job description analysis
- Resume tailoring suggestions
- ATS compatibility scoring
- Resume optimization recommendations
- Skills extraction

The Claude client provides several methods for interacting with the AI:
- `generateCompletion`: Main method for generating text completions
- `analyzeText`: Structured analysis of text with a system prompt
- `streamCompletion`: Streaming response for real-time UI updates

## Form Validation

The application uses a combination of:
- TypeScript for static type checking
- Zod for schema validation
- react-hook-form for form state management and validation
- Custom validation utilities in `lib/utils/validation.ts`

When implementing forms, maintain this pattern and leverage the existing validation utilities.

## Supabase Integration

Supabase is used for database, authentication, and storage. The integration includes:

- Client creation utilities in `lib/supabase/client.ts`:
  - `createClient()`: For client components
  - `createServerClient()`: For server components (cached)
  - `createActionClient()`: For server actions
  
- Error handling utilities:
  - `handleSupabaseError()`: Standardized error handling
  - `retryOperation()`: Retry logic with exponential backoff

### Supabase Best Practices

The Supabase integration follows these best practices:

1. **Database Structure**:
   - Timestamp-based migrations (format: YYYYMMDDHHmmss_description.sql)
   - Declarative schema files for different components (types, tables, functions, policies)
   - Table comments for documentation

2. **Security**:
   - Granular Row Level Security (RLS) policies for each operation (select, insert, update, delete)
   - Separate RLS policies for authenticated and anonymous users
   - Security definer functions with empty search_path to prevent SQL injection
   - Function-based permissions (e.g., is_resume_owner()) for complex checks

3. **Performance**:
   - Strategic indexes (B-tree, GIN, BRIN) for different query patterns
   - GIN indexes for JSONB columns and text search
   - BRIN indexes for timestamp data
   - Composite indexes for common filter combinations
   - Connection pooling compatibility

4. **Type Safety**:
   - Generated TypeScript types for database schema
   - Enum types for constrained values
   - Custom domains for data validation

## Hooks and State Management

Key custom hooks include:

- `useResume`: Managing resume state and operations
- `useJobDescription`: Managing job description state and operations
- `useUndoHistory`: Tracking changes for undo/redo functionality
- `useToast`: Notification system

## Authentication Flow

User authentication is handled via Supabase Auth, with routes in `/app/(auth)`:
- `/login`: User login page
- `/register`: New user registration

Protected routes use middleware to verify authentication status.

## Component Structure

UI components follow a consistent pattern:
- ShadCN UI primitives as the foundation
- Feature-specific components built on these primitives
- Complex components broken down into smaller subcomponents
- React composition pattern with children props for flexibility

When adding new components:
1. Consider if a UI primitive already exists
2. Place components in the appropriate feature directory
3. Follow the existing patterns for props, state, and styling

## Best Practices

When working in this codebase:

1. Follow TypeScript types for all data structures
2. Use Supabase client utilities for database operations
3. Handle potential errors with proper error handling
4. Use the AI client for Claude interactions
5. Follow the component structure for new UI elements
6. Use the existing hooks for state management
7. Maintain strict type checking with TypeScript

## Testing

The project uses Jest for testing with the following structure:
- Unit tests for AI client integration
- API route tests
- Configuration in jest.config.js and jest.hasteConfig.js

When adding new features, include corresponding tests in the __tests__ directory.

## Code Formatting

Code formatting is handled by Prettier with Tailwind plugin configuration.
Follow the project's formatting rules defined in prettier.config.js.

## Environment Variables

The project uses environment variables for configuration. Reference `.env.example` for required variables. For local development, create a `.env.local` file with your development credentials.

Key variables include:
- Supabase configuration
- API keys for Claude 3.7
- Application URLs

## Database Schema Optimizations

The database schema has been optimized for performance and scalability:

1. **Data Integrity Controls**: Custom domains and constraints ensure data validity.
2. **Optimized Indexing**: Strategic indexes for foreign keys, text search, and timestamp queries.
3. **JSON Storage**: JSONB columns for flexible storage with proper indexing.
4. **Row Level Security**: Policies ensuring users can only access their own data.
5. **Transaction Management**: Robust stored procedures with error handling.
6. **Performance Monitoring**: Functions to identify slow queries and database health.
7. **Materialized Views**: Pre-computed results for common queries.
8. **Connection Pooling**: Functions optimized for PgBouncer compatibility.
9. **Audit Trails**: Efficient change tracking with BRIN indexes.

Migration scripts for these optimizations are located in `/supabase/migrations/` (following Supabase's recommended timestamp-based format).

## To-Do List for Supabase Implementation

The following tasks should be completed to ensure a robust Supabase implementation:

1. **Database Monitoring**:
   - Set up performance monitoring for slow queries
   - Implement query analysis using EXPLAIN ANALYZE to identify bottlenecks
   - Consider adding logging for critical operations

2. **Advanced Authorization**:
   - Implement role-based access control for admin functions
   - Create middleware for handling JWTs in server-side operations
   - Add session handling utilities

3. **Error Handling Enhancement**:
   - ✅ Implement standardized error responses across all API endpoints
   - ✅ Create a comprehensive error tracking system
   - ✅ Add retry mechanisms for transient database errors

4. **Testing Strategy**:
   - Develop unit tests for database operations
   - Create integration tests for Supabase client functions
   - Set up CI/CD pipeline for automated testing

5. **Edge Functions**:
   - Evaluate operations that would benefit from Edge Functions
   - Implement serverless functions for performance-critical operations
   - Set up proper environment configuration for Edge Functions

6. **Performance Optimization**:
   - Analyze and optimize query patterns
   - Consider implementing materialized views for complex reports
   - Set up intelligent caching strategies

7. **CI/CD Integration**:
   - Implement GitHub Actions workflow for database migrations
   - Set up automated type generation when schema changes
   - Create deployment pipelines for different environments

8. **Security Audit**:
   - ✅ Conduct comprehensive review of RLS policies
   - ✅ Test authentication flows thoroughly
   - ✅ Audit function permissions and security contexts

## Development Areas for Improvement

The following areas need further development:
1. Error boundary implementation for better error handling
2. ✅ Enhanced logging for debugging
3. Implement the Supabase to-do list items above

## Context7 Integration

The project uses Context7 for up-to-date documentation access. To leverage this:

1. Include `use context7` in your prompts when working with libraries
2. Context7 supports documentation for Next.js, React, TypeScript, Tailwind CSS, and Supabase
3. This ensures more accurate and current code generation