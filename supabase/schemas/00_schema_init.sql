-- Schema initialization file for the Victry database
-- This file ensures proper schema setup and defines execution order

-- Create schemas
create schema if not exists public;
create schema if not exists private;

-- Set default privileges
alter default privileges in schema public grant all on tables to postgres, service_role;
alter default privileges in schema public grant all on functions to postgres, service_role;
alter default privileges in schema public grant all on sequences to postgres, service_role;

-- Extensions will be handled separately
-- Note: pg_trgm is included in the indexes file (03_indexes.sql)

-- Document schema files load order
comment on schema public is 'Main schema for Victry application';
comment on schema private is 'Private schema for security-related functions and utilities';