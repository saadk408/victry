-- Migration: 13_critical_operations_logging.sql
-- Description: Implements comprehensive logging for critical database operations
-- This migration implements:
-- 1. Audit logging for critical table operations (insert, update, delete)
-- 2. Functions to log critical application operations
-- 3. Views for audit log analysis
-- 4. RLS policies for secure access to audit logs

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS audit;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit.operations_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type TEXT NOT NULL,
    table_name TEXT,
    record_id TEXT,
    user_id UUID,
    user_email TEXT,
    ip_address INET,
    operation_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    old_data JSONB,
    new_data JSONB,
    details JSONB,
    application_context JSONB,
    operation_category TEXT NOT NULL
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_operations_log_timestamp ON audit.operations_log (operation_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_operations_log_table ON audit.operations_log (table_name);
CREATE INDEX IF NOT EXISTS idx_operations_log_user_id ON audit.operations_log (user_id);
CREATE INDEX IF NOT EXISTS idx_operations_log_operation_type ON audit.operations_log (operation_type);
CREATE INDEX IF NOT EXISTS idx_operations_log_operation_category ON audit.operations_log (operation_category);
CREATE INDEX IF NOT EXISTS idx_operations_log_record_id ON audit.operations_log (record_id);

-- Define operation categories
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'operation_category') THEN
        CREATE TYPE audit.operation_category AS ENUM (
            'data_modification',
            'security',
            'authentication',
            'configuration',
            'subscription',
            'payment',
            'export',
            'import',
            'api',
            'admin',
            'user_management',
            'system'
        );
    END IF;
END
$$;

-- Function to log data modifications
CREATE OR REPLACE FUNCTION audit.log_table_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    record_id TEXT;
    user_id UUID;
    user_email TEXT;
    operation_data JSONB;
    client_info JSONB;
BEGIN
    -- Determine the record ID
    IF TG_OP = 'DELETE' THEN
        record_id = OLD.id::TEXT;
    ELSE
        record_id = NEW.id::TEXT;
    END IF;
    
    -- Get user information from auth context
    BEGIN
        user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        user_id := NULL;
    END;
    
    -- Try to get user email (if available)
    IF user_id IS NOT NULL THEN
        SELECT email INTO user_email
        FROM auth.users
        WHERE id = user_id;
    END IF;
    
    -- Get client information
    client_info := jsonb_build_object(
        'application_name', current_setting('application_name', true),
        'ip_address', inet_client_addr(),
        'session_id', current_setting('request.jwt.claim.session_id', true)
    );
    
    -- Store old and new data
    CASE TG_OP
        WHEN 'INSERT' THEN
            operation_data := jsonb_build_object(
                'old_data', NULL,
                'new_data', to_jsonb(NEW)
            );
            
            INSERT INTO audit.operations_log (
                operation_type,
                table_name,
                record_id,
                user_id,
                user_email,
                ip_address,
                old_data,
                new_data,
                details,
                application_context,
                operation_category
            ) VALUES (
                TG_OP,
                TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
                record_id,
                user_id,
                user_email,
                inet_client_addr(),
                NULL,
                to_jsonb(NEW),
                NULL,
                client_info,
                'data_modification'
            );
            
        WHEN 'UPDATE' THEN
            -- Only log if there are actual changes
            IF to_jsonb(OLD) <> to_jsonb(NEW) THEN
                operation_data := jsonb_build_object(
                    'old_data', to_jsonb(OLD),
                    'new_data', to_jsonb(NEW),
                    'changed_fields', (
                        SELECT jsonb_object_agg(key, value)
                        FROM jsonb_each(to_jsonb(NEW))
                        WHERE to_jsonb(OLD) -> key <> to_jsonb(NEW) -> key
                            OR (to_jsonb(OLD) -> key IS NULL AND to_jsonb(NEW) -> key IS NOT NULL)
                            OR (to_jsonb(OLD) -> key IS NOT NULL AND to_jsonb(NEW) -> key IS NULL)
                    )
                );
                
                INSERT INTO audit.operations_log (
                    operation_type,
                    table_name,
                    record_id,
                    user_id,
                    user_email,
                    ip_address,
                    old_data,
                    new_data,
                    details,
                    application_context,
                    operation_category
                ) VALUES (
                    TG_OP,
                    TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
                    record_id,
                    user_id,
                    user_email,
                    inet_client_addr(),
                    to_jsonb(OLD),
                    to_jsonb(NEW),
                    (
                        SELECT jsonb_object_agg(key, value)
                        FROM jsonb_each(to_jsonb(NEW))
                        WHERE to_jsonb(OLD) -> key <> to_jsonb(NEW) -> key
                            OR (to_jsonb(OLD) -> key IS NULL AND to_jsonb(NEW) -> key IS NOT NULL)
                            OR (to_jsonb(OLD) -> key IS NOT NULL AND to_jsonb(NEW) -> key IS NULL)
                    ),
                    client_info,
                    'data_modification'
                );
            END IF;
            
        WHEN 'DELETE' THEN
            operation_data := jsonb_build_object(
                'old_data', to_jsonb(OLD),
                'new_data', NULL
            );
            
            INSERT INTO audit.operations_log (
                operation_type,
                table_name,
                record_id,
                user_id,
                user_email,
                ip_address,
                old_data,
                new_data,
                details,
                application_context,
                operation_category
            ) VALUES (
                TG_OP,
                TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
                record_id,
                user_id,
                user_email,
                inet_client_addr(),
                to_jsonb(OLD),
                NULL,
                NULL,
                client_info,
                'data_modification'
            );
    END CASE;
    
    -- Return the appropriate record based on operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Function to manually log critical operations
CREATE OR REPLACE FUNCTION audit.log_critical_operation(
    operation_type TEXT,
    operation_category TEXT,
    record_id TEXT DEFAULT NULL,
    table_name TEXT DEFAULT NULL,
    details JSONB DEFAULT NULL,
    old_data JSONB DEFAULT NULL,
    new_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    log_id UUID;
    user_id UUID;
    user_email TEXT;
    client_info JSONB;
BEGIN
    -- Get user information from auth context
    BEGIN
        user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        user_id := NULL;
    END;
    
    -- Try to get user email (if available)
    IF user_id IS NOT NULL THEN
        SELECT email INTO user_email
        FROM auth.users
        WHERE id = user_id;
    END IF;
    
    -- Get client information
    client_info := jsonb_build_object(
        'application_name', current_setting('application_name', true),
        'ip_address', inet_client_addr(),
        'session_id', current_setting('request.jwt.claim.session_id', true)
    );
    
    -- Insert log entry
    INSERT INTO audit.operations_log (
        operation_type,
        operation_category,
        table_name,
        record_id,
        user_id,
        user_email,
        ip_address,
        old_data,
        new_data,
        details,
        application_context
    ) VALUES (
        operation_type,
        operation_category,
        table_name,
        record_id,
        user_id,
        user_email,
        inet_client_addr(),
        old_data,
        new_data,
        details,
        client_info
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Function to log security events
CREATE OR REPLACE FUNCTION audit.log_security_event(
    event_type TEXT,
    details JSONB,
    success BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    log_id UUID;
    event_details JSONB;
BEGIN
    -- Add success flag to details
    event_details := jsonb_build_object(
        'event_type', event_type,
        'success', success
    ) || details;
    
    -- Use the general logging function
    SELECT audit.log_critical_operation(
        event_type,
        'security',
        NULL,
        NULL,
        event_details
    ) INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Function to log authentication events
CREATE OR REPLACE FUNCTION audit.log_authentication_event(
    event_type TEXT,
    user_id UUID,
    details JSONB DEFAULT NULL,
    success BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    log_id UUID;
    event_details JSONB;
    user_email TEXT;
BEGIN
    -- Get user email if available
    IF user_id IS NOT NULL THEN
        SELECT email INTO user_email
        FROM auth.users
        WHERE id = user_id;
    END IF;
    
    -- Build event details
    event_details := jsonb_build_object(
        'event_type', event_type,
        'success', success,
        'user_email', user_email
    );
    
    IF details IS NOT NULL THEN
        event_details := event_details || details;
    END IF;
    
    -- Use the general logging function
    SELECT audit.log_critical_operation(
        event_type,
        'authentication',
        user_id::TEXT,
        'auth.users',
        event_details
    ) INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Function to log payment events
CREATE OR REPLACE FUNCTION audit.log_payment_event(
    event_type TEXT,
    user_id UUID,
    amount NUMERIC,
    currency TEXT,
    payment_provider TEXT,
    payment_id TEXT,
    details JSONB DEFAULT NULL,
    success BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    log_id UUID;
    payment_details JSONB;
BEGIN
    -- Build payment details
    payment_details := jsonb_build_object(
        'event_type', event_type,
        'amount', amount,
        'currency', currency,
        'payment_provider', payment_provider,
        'payment_id', payment_id,
        'success', success
    );
    
    IF details IS NOT NULL THEN
        payment_details := payment_details || details;
    END IF;
    
    -- Use the general logging function
    SELECT audit.log_critical_operation(
        event_type,
        'payment',
        payment_id,
        'payments',
        payment_details
    ) INTO log_id;
    
    RETURN log_id;
END;
$$;

-- View for recent operations
CREATE OR REPLACE VIEW audit.recent_operations AS
SELECT
    id,
    operation_type,
    table_name,
    record_id,
    user_id,
    user_email,
    ip_address,
    operation_timestamp,
    details,
    operation_category
FROM
    audit.operations_log
ORDER BY
    operation_timestamp DESC
LIMIT 1000;

-- View for security events
CREATE OR REPLACE VIEW audit.security_events AS
SELECT
    id,
    operation_type as event_type,
    user_id,
    user_email,
    ip_address,
    operation_timestamp,
    details->>'success' as success,
    details,
    application_context
FROM
    audit.operations_log
WHERE
    operation_category = 'security'
ORDER BY
    operation_timestamp DESC;

-- View for authentication events
CREATE OR REPLACE VIEW audit.authentication_events AS
SELECT
    id,
    operation_type as event_type,
    user_id,
    user_email,
    ip_address,
    operation_timestamp,
    details->>'success' as success,
    details,
    application_context
FROM
    audit.operations_log
WHERE
    operation_category = 'authentication'
ORDER BY
    operation_timestamp DESC;

-- View for payment events
CREATE OR REPLACE VIEW audit.payment_events AS
SELECT
    id,
    operation_type as event_type,
    user_id,
    user_email,
    record_id as payment_id,
    operation_timestamp,
    details->>'amount' as amount,
    details->>'currency' as currency,
    details->>'payment_provider' as payment_provider,
    details->>'success' as success,
    details,
    application_context
FROM
    audit.operations_log
WHERE
    operation_category = 'payment'
ORDER BY
    operation_timestamp DESC;

-- View for user activity
CREATE OR REPLACE VIEW audit.user_activity AS
SELECT
    user_id,
    user_email,
    operation_category,
    operation_type,
    table_name,
    operation_timestamp,
    ip_address,
    application_context
FROM
    audit.operations_log
WHERE
    user_id IS NOT NULL
ORDER BY
    operation_timestamp DESC;

-- Enable RLS on the operations log
ALTER TABLE audit.operations_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admins
CREATE POLICY admin_all_operations_log ON audit.operations_log
    USING (auth.uid() IN (
        SELECT user_id FROM user_roles 
        WHERE role = 'admin'
    ));

-- Helper function to check if a user can view audit logs
CREATE OR REPLACE FUNCTION audit.can_view_audit_logs()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
    RETURN (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );
END;
$$;

-- Function to get audit logs for a specific record
CREATE OR REPLACE FUNCTION audit.get_record_history(
    table_name TEXT,
    record_id TEXT
)
RETURNS TABLE (
    id UUID,
    operation_type TEXT,
    user_email TEXT,
    operation_timestamp TIMESTAMPTZ,
    changes JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
    IF NOT audit.can_view_audit_logs() THEN
        RAISE EXCEPTION 'Access denied: User cannot view audit logs';
    END IF;
    
    RETURN QUERY
    SELECT
        ol.id,
        ol.operation_type,
        ol.user_email,
        ol.operation_timestamp,
        CASE
            WHEN ol.operation_type = 'UPDATE' THEN ol.details
            WHEN ol.operation_type = 'INSERT' THEN jsonb_build_object('inserted', ol.new_data)
            WHEN ol.operation_type = 'DELETE' THEN jsonb_build_object('deleted', ol.old_data)
            ELSE NULL
        END as changes
    FROM
        audit.operations_log ol
    WHERE
        ol.table_name = get_record_history.table_name
        AND ol.record_id = get_record_history.record_id
    ORDER BY
        ol.operation_timestamp DESC;
END;
$$;

-- Function to purge old audit logs
CREATE OR REPLACE FUNCTION audit.purge_old_logs(
    retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    IF NOT audit.can_view_audit_logs() THEN
        RAISE EXCEPTION 'Access denied: User cannot purge audit logs';
    END IF;
    
    DELETE FROM audit.operations_log
    WHERE operation_timestamp < (now() - (retention_days || ' days')::interval)
    RETURNING COUNT(*) INTO deleted_count;
    
    RETURN deleted_count;
END;
$$;

-- Add triggers to critical tables
-- Resume table
CREATE TRIGGER audit_resumes_changes
AFTER INSERT OR UPDATE OR DELETE ON resumes
FOR EACH ROW EXECUTE FUNCTION audit.log_table_change();

-- Job description table
CREATE TRIGGER audit_job_descriptions_changes
AFTER INSERT OR UPDATE OR DELETE ON job_descriptions
FOR EACH ROW EXECUTE FUNCTION audit.log_table_change();

-- User roles table
CREATE TRIGGER audit_user_roles_changes
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH ROW EXECUTE FUNCTION audit.log_table_change();

-- User profiles table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        EXECUTE 'CREATE TRIGGER audit_profiles_changes
                 AFTER INSERT OR UPDATE OR DELETE ON profiles
                 FOR EACH ROW EXECUTE FUNCTION audit.log_table_change();';
    END IF;
END $$;

-- Document the functions
COMMENT ON FUNCTION audit.log_table_change IS 
'Trigger function that logs changes to tables.
This function is used by audit triggers to record changes to table data.
It captures the old and new values, along with user information.';

COMMENT ON FUNCTION audit.log_critical_operation IS
'Manually log a critical operation.
Parameters:
  - operation_type: Type of operation being performed
  - operation_category: Category of the operation
  - record_id: ID of the affected record (optional)
  - table_name: Name of the affected table (optional)
  - details: Additional details about the operation (optional)
  - old_data: Previous state of the data (optional)
  - new_data: New state of the data (optional)

Example usage:
  SELECT audit.log_critical_operation(
    ''export_resume'',
    ''export'',
    ''123e4567-e89b-12d3-a456-426614174000'',
    ''resumes'',
    jsonb_build_object(''format'', ''pdf'', ''pages'', 2)
  );
';

COMMENT ON FUNCTION audit.log_security_event IS
'Log a security-related event.
Parameters:
  - event_type: Type of security event
  - details: Details about the event
  - success: Whether the event was successful (default: true)

Example usage:
  SELECT audit.log_security_event(
    ''password_reset_request'',
    jsonb_build_object(''email'', ''user@example.com''),
    TRUE
  );
';

COMMENT ON FUNCTION audit.log_authentication_event IS
'Log an authentication event.
Parameters:
  - event_type: Type of authentication event
  - user_id: ID of the user
  - details: Additional details (optional)
  - success: Whether authentication was successful (default: true)

Example usage:
  SELECT audit.log_authentication_event(
    ''login'',
    ''123e4567-e89b-12d3-a456-426614174000''::uuid,
    jsonb_build_object(''method'', ''email''),
    TRUE
  );
';

COMMENT ON FUNCTION audit.log_payment_event IS
'Log a payment-related event.
Parameters:
  - event_type: Type of payment event
  - user_id: ID of the user
  - amount: Payment amount
  - currency: Currency code
  - payment_provider: Name of payment provider
  - payment_id: ID of the payment
  - details: Additional details (optional)
  - success: Whether payment was successful (default: true)

Example usage:
  SELECT audit.log_payment_event(
    ''subscription_payment'',
    ''123e4567-e89b-12d3-a456-426614174000''::uuid,
    19.99,
    ''USD'',
    ''stripe'',
    ''pi_1234567890'',
    jsonb_build_object(''plan'', ''premium''),
    TRUE
  );
';