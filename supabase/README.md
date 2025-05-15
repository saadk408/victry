# Victry Supabase Implementation

This directory contains the Supabase database schema and migrations for the Victry project, following Supabase best practices.

## Directory Structure

- `/supabase/schemas/` - Declarative schema files defining the desired database state
- `/supabase/migrations/` - Migration files generated from schema changes

## Schema Files

Schema files are executed in lexicographic order:

1. `00_schema_init.sql` - Schema initialization and default privileges
2. `01_types_and_domains.sql` - Custom types and domains
3. `02_tables.sql` - Table definitions
4. `03_indexes.sql` - Indexes for query optimization
5. `04_functions.sql` - Functions and procedures
6. `05_policies.sql` - Row Level Security policies
7. `06_materialized_views.sql` - Materialized views for query optimization

## Migration Files

Migration files follow the Supabase naming convention:

```
YYYYMMDDHHmmss_short_description.sql
```

For example:
```
20240515000001_advanced_data_integrity.sql
```

## Key Database Features

- **Advanced Data Integrity**: Custom domains and constraints
- **Optimized Indexing**: Strategic use of B-tree, GIN, and BRIN indexes
- **Row Level Security**: Comprehensive policies for data isolation
- **JSONB Storage**: Efficient storage of flexible schema elements
- **Materialized Views**: Pre-computed query results for performance

## Development Workflow

### Adding Schema Changes

1. Update the appropriate file in `/supabase/schemas/`
2. Stop the local Supabase instance:
   ```bash
   supabase stop
   ```
3. Generate migration files:
   ```bash
   supabase db diff -f new_migration_name
   ```
4. Start the local Supabase instance:
   ```bash
   supabase start
   ```

### Applying Migrations

```bash
supabase db push
```

### Edge Cases and Manual Migrations

For features not supported by the declarative schema approach:

- DML statements (INSERT, UPDATE, DELETE)
- View ownership and grants
- Schema privileges
- Comments
- Partitions
- Publication changes
- Domain statements
- Grant statements duplicated from default privileges

These must be handled with manual migrations.

## Row Level Security

All tables have Row Level Security enabled with policies for both `anon` and `authenticated` roles.

- `anon` role: Limited access (typically read-only for public data)
- `authenticated` role: Access to own data only

Policies follow the principle of least privilege with:

- Separate policies for SELECT, INSERT, UPDATE, and DELETE operations
- Clear documentation of policy intentions and security implications
- Optimized policy expressions for performance

## Security Considerations

1. All functions use `set search_path = ''` to prevent security risks
2. Most functions use `security invoker` to run with caller's permissions
3. `security definer` functions are limited to specific security operations
4. All tables have explicit comments
5. Function parameters and return types are explicitly defined

## Backups and Rollbacks

To roll back a migration:

1. Update schema files to reflect the desired state
2. Generate a new migration:
   ```bash
   supabase db diff -f rollback_migration_name
   ```
3. Apply the new migration:
   ```bash
   supabase db push
   ```

## Performance Optimizations

- Indexes on frequently queried columns
- Partial indexes for common filters
- Materialized views for repeated complex queries
- Function-based indexes for computed values
- Text search indexes using GIN and pg_trgm

## Database Maintenance

Automated maintenance functions:

- `public.refresh_materialized_views()` - Refreshes all materialized views
- Trigger-based refresh for specific materialized views