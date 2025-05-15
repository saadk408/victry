# Victry: AI-Powered Resume Builder

Victry is an AI-powered resume builder designed to dramatically reduce the time and stress associated with resume tailoring while maintaining authenticity and ATS compatibility. It achieves this through a user-friendly interface, intelligent AI-assisted content generation, and transparent resume optimization.

## Core Features & Value

- **Time Efficiency**: Transform hours of resume tailoring into minutes.
- **ATS Optimization**: Ensure resumes pass Applicant Tracking Systems.
- **Emotional Support**: Reduce anxiety associated with resume writing.
- **Authentic Voice**: Preserve the user's unique voice in AI-assisted content.
- **Transparency**: Clear visibility into how AI is helping and why changes are suggested.

## Tech Stack

- **Frontend**: Next.js 15.2.3 with React 19.0 and TypeScript 5.8.2
- **Styling**: Tailwind CSS 3.4.17 with ShadCN components
- **State Management**: React Context API and custom hooks
- **Form Management**: react-hook-form with zod validation
- **Rich Text Editing**: TipTap
- **Animation**: Framer Motion (imported via motion package)
- **Drag and Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Database**: Supabase (PostgreSQL with optimized schema)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **AI Integration**: Claude 3.7 via API

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

- `/database`: Database migration scripts
  - `/migrations`: Optimization migrations for PostgreSQL

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
- npm 8.0.0 or later
- Supabase account for database and authentication

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

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Development Workflow

```bash
# Start development server
npm run dev

# Type check the project
npx tsc --noEmit

# Lint code
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Start production server
npm run start
```

## Testing

The application uses Jest for testing. Tests are located in the `__tests__` directory mirroring the application structure:

- Unit tests for AI client integration
- API route tests

Run tests with:
```bash
npm test
```

## Database Migrations

To apply database migrations:

1. Navigate to your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the migration scripts from `/database/migrations` in sequence
4. Execute each script in order

See `/database/migrations/00_migration_readme.md` for detailed instructions on each migration.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## License

[MIT License](LICENSE)