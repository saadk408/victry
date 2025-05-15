/**
 * Audit Logger for Critical Database Operations
 * 
 * This module provides utilities for logging critical operations to the audit system.
 * It integrates with the database audit schema created in migration 13.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './client';
import { logger } from '../utils/logger';

/**
 * Operation categories for audit logging
 */
export enum OperationCategory {
  DataModification = 'data_modification',
  Security = 'security',
  Authentication = 'authentication',
  Configuration = 'configuration',
  Subscription = 'subscription',
  Payment = 'payment',
  Export = 'export',
  Import = 'import',
  Api = 'api',
  Admin = 'admin',
  UserManagement = 'user_management',
  System = 'system',
}

/**
 * Options for logging critical operations
 */
export interface LogOperationOptions {
  /** Client to use (defaults to creating a new client) */
  client?: SupabaseClient;
  /** Additional context information */
  context?: Record<string, any>;
}

/**
 * Options for logging security events
 */
export interface SecurityEventOptions extends LogOperationOptions {
  /** Whether the security action was successful */
  success?: boolean;
}

/**
 * Options for logging authentication events
 */
export interface AuthenticationEventOptions extends LogOperationOptions {
  /** Whether the authentication was successful */
  success?: boolean;
}

/**
 * Options for logging payment events
 */
export interface PaymentEventOptions extends LogOperationOptions {
  /** Whether the payment was successful */
  success?: boolean;
}

/**
 * Log a critical operation to the audit system
 * 
 * @param operationType Type of operation being performed
 * @param category Category of the operation
 * @param details Additional details about the operation
 * @param recordId ID of the affected record (optional)
 * @param tableName Name of the affected table (optional)
 * @param options Additional options
 * @returns ID of the created audit log entry
 */
export async function logCriticalOperation(
  operationType: string,
  category: OperationCategory,
  details: Record<string, any>,
  recordId?: string,
  tableName?: string,
  options?: LogOperationOptions
): Promise<string | null> {
  const client = options?.client || createClient();
  
  try {
    const { data, error } = await client.rpc('audit.log_critical_operation', {
      operation_type: operationType,
      operation_category: category,
      record_id: recordId,
      table_name: tableName,
      details: details ? JSON.stringify(details) : null,
    });
    
    if (error) {
      logger.error('Failed to log critical operation', {
        error,
        operationType,
        category,
        recordId,
        tableName,
        ...options?.context,
      });
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error('Exception logging critical operation', { 
      error, 
      operationType, 
      category,
      recordId,
      tableName,
      ...options?.context,
    });
    return null;
  }
}

/**
 * Log a security event to the audit system
 * 
 * @param eventType Type of security event
 * @param details Details about the event
 * @param options Additional options
 * @returns ID of the created audit log entry
 */
export async function logSecurityEvent(
  eventType: string,
  details: Record<string, any>,
  options?: SecurityEventOptions
): Promise<string | null> {
  const client = options?.client || createClient();
  
  try {
    const { data, error } = await client.rpc('audit.log_security_event', {
      event_type: eventType,
      details: details ? JSON.stringify(details) : null,
      success: options?.success !== undefined ? options.success : true,
    });
    
    if (error) {
      logger.error('Failed to log security event', {
        error,
        eventType,
        ...options?.context,
      });
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error('Exception logging security event', { 
      error, 
      eventType,
      ...options?.context,
    });
    return null;
  }
}

/**
 * Log an authentication event to the audit system
 * 
 * @param eventType Type of authentication event
 * @param userId ID of the user
 * @param details Additional details
 * @param options Additional options
 * @returns ID of the created audit log entry
 */
export async function logAuthenticationEvent(
  eventType: string,
  userId: string,
  details: Record<string, any>,
  options?: AuthenticationEventOptions
): Promise<string | null> {
  const client = options?.client || createClient();
  
  try {
    const { data, error } = await client.rpc('audit.log_authentication_event', {
      event_type: eventType,
      user_id: userId,
      details: details ? JSON.stringify(details) : null,
      success: options?.success !== undefined ? options.success : true,
    });
    
    if (error) {
      logger.error('Failed to log authentication event', {
        error,
        eventType,
        userId,
        ...options?.context,
      });
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error('Exception logging authentication event', { 
      error, 
      eventType,
      userId,
      ...options?.context,
    });
    return null;
  }
}

/**
 * Log a payment event to the audit system
 * 
 * @param eventType Type of payment event
 * @param userId ID of the user
 * @param amount Payment amount
 * @param currency Currency code
 * @param paymentProvider Name of payment provider
 * @param paymentId ID of the payment
 * @param details Additional details
 * @param options Additional options
 * @returns ID of the created audit log entry
 */
export async function logPaymentEvent(
  eventType: string,
  userId: string,
  amount: number,
  currency: string,
  paymentProvider: string,
  paymentId: string,
  details: Record<string, any>,
  options?: PaymentEventOptions
): Promise<string | null> {
  const client = options?.client || createClient();
  
  try {
    const { data, error } = await client.rpc('audit.log_payment_event', {
      event_type: eventType,
      user_id: userId,
      amount,
      currency,
      payment_provider: paymentProvider,
      payment_id: paymentId,
      details: details ? JSON.stringify(details) : null,
      success: options?.success !== undefined ? options.success : true,
    });
    
    if (error) {
      logger.error('Failed to log payment event', {
        error,
        eventType,
        userId,
        amount,
        currency,
        paymentProvider,
        paymentId,
        ...options?.context,
      });
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error('Exception logging payment event', { 
      error, 
      eventType,
      userId,
      amount,
      currency,
      paymentProvider,
      paymentId,
      ...options?.context,
    });
    return null;
  }
}

/**
 * Get the history of a specific record
 * 
 * @param tableName Name of the table
 * @param recordId ID of the record
 * @param client Supabase client to use
 * @returns Array of audit log entries for the record
 */
export async function getRecordHistory(
  tableName: string,
  recordId: string,
  client?: SupabaseClient
): Promise<any[]> {
  const supabase = client || createClient();
  
  try {
    const { data, error } = await supabase.rpc('audit.get_record_history', {
      table_name: tableName,
      record_id: recordId,
    });
    
    if (error) {
      logger.error('Failed to get record history', { error, tableName, recordId });
      return [];
    }
    
    return data || [];
  } catch (error) {
    logger.error('Exception getting record history', { error, tableName, recordId });
    return [];
  }
}

/**
 * Get recent operations from the audit log
 * 
 * @param client Supabase client to use
 * @returns Array of recent operations
 */
export async function getRecentOperations(client?: SupabaseClient): Promise<any[]> {
  const supabase = client || createClient();
  
  try {
    const { data, error } = await supabase.from('audit.recent_operations').select('*');
    
    if (error) {
      logger.error('Failed to get recent operations', { error });
      return [];
    }
    
    return data || [];
  } catch (error) {
    logger.error('Exception getting recent operations', { error });
    return [];
  }
}

/**
 * Get security events from the audit log
 * 
 * @param limit Maximum number of events to return
 * @param client Supabase client to use
 * @returns Array of security events
 */
export async function getSecurityEvents(
  limit: number = 100,
  client?: SupabaseClient
): Promise<any[]> {
  const supabase = client || createClient();
  
  try {
    const { data, error } = await supabase
      .from('audit.security_events')
      .select('*')
      .limit(limit);
    
    if (error) {
      logger.error('Failed to get security events', { error });
      return [];
    }
    
    return data || [];
  } catch (error) {
    logger.error('Exception getting security events', { error });
    return [];
  }
}

/**
 * Get authentication events from the audit log
 * 
 * @param limit Maximum number of events to return
 * @param client Supabase client to use
 * @returns Array of authentication events
 */
export async function getAuthenticationEvents(
  limit: number = 100,
  client?: SupabaseClient
): Promise<any[]> {
  const supabase = client || createClient();
  
  try {
    const { data, error } = await supabase
      .from('audit.authentication_events')
      .select('*')
      .limit(limit);
    
    if (error) {
      logger.error('Failed to get authentication events', { error });
      return [];
    }
    
    return data || [];
  } catch (error) {
    logger.error('Exception getting authentication events', { error });
    return [];
  }
}

/**
 * Get payment events from the audit log
 * 
 * @param limit Maximum number of events to return
 * @param client Supabase client to use
 * @returns Array of payment events
 */
export async function getPaymentEvents(
  limit: number = 100,
  client?: SupabaseClient
): Promise<any[]> {
  const supabase = client || createClient();
  
  try {
    const { data, error } = await supabase
      .from('audit.payment_events')
      .select('*')
      .limit(limit);
    
    if (error) {
      logger.error('Failed to get payment events', { error });
      return [];
    }
    
    return data || [];
  } catch (error) {
    logger.error('Exception getting payment events', { error });
    return [];
  }
}

/**
 * Get activity for a specific user
 * 
 * @param userId ID of the user
 * @param limit Maximum number of activities to return
 * @param client Supabase client to use
 * @returns Array of user activities
 */
export async function getUserActivity(
  userId: string,
  limit: number = 100,
  client?: SupabaseClient
): Promise<any[]> {
  const supabase = client || createClient();
  
  try {
    const { data, error } = await supabase
      .from('audit.user_activity')
      .select('*')
      .eq('user_id', userId)
      .limit(limit);
    
    if (error) {
      logger.error('Failed to get user activity', { error, userId });
      return [];
    }
    
    return data || [];
  } catch (error) {
    logger.error('Exception getting user activity', { error, userId });
    return [];
  }
}

/**
 * Purge old audit logs
 * 
 * @param retentionDays Number of days to retain logs (default: 90)
 * @param client Supabase client to use
 * @returns Number of logs purged
 */
export async function purgeOldAuditLogs(
  retentionDays: number = 90,
  client?: SupabaseClient
): Promise<number> {
  const supabase = client || createClient();
  
  try {
    const { data, error } = await supabase.rpc('audit.purge_old_logs', {
      retention_days: retentionDays,
    });
    
    if (error) {
      logger.error('Failed to purge old audit logs', { error });
      return 0;
    }
    
    return data || 0;
  } catch (error) {
    logger.error('Exception purging old audit logs', { error });
    return 0;
  }
}