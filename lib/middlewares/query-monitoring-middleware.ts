/**
 * Query Monitoring Middleware
 * 
 * This middleware tracks database query performance for API routes,
 * automatically capturing query metrics and logging slow queries.
 * It integrates with the query-monitoring system for comprehensive
 * database performance analysis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { createActionClient } from '../supabase/client';
import { withQueryMonitoring, QuerySource } from '../supabase/query-monitoring';
import { logger } from '../utils/logger';

export type ApiHandler = (
  req: NextRequest,
  params?: Record<string, string | string[]>
) => Promise<NextResponse>;

export interface QueryMonitoringOptions {
  /** Whether to enable performance monitoring */
  enabled?: boolean;
  /** The source to record for queries */
  source?: QuerySource;
  /** Whether to capture query execution plans */
  capturePlans?: boolean;
  /** Minimum execution time (ms) to record (default: 50ms) */
  minExecutionTime?: number;
  /** Supabase client to use (default: createActionClient) */
  client?: SupabaseClient;
}

const defaultOptions: QueryMonitoringOptions = {
  enabled: true,
  source: QuerySource.Application,
  capturePlans: true,
  minExecutionTime: 50,
};

/**
 * Create a proxy around the Supabase client to monitor query performance
 * 
 * @param client The Supabase client to wrap
 * @param options Monitoring options
 * @param context Additional context information
 * @returns Proxied Supabase client
 */
function createMonitoredClient(
  client: SupabaseClient,
  options: QueryMonitoringOptions,
  context: Record<string, any>
): SupabaseClient {
  if (!options.enabled) {
    return client;
  }
  
  // Create a Proxy to intercept and monitor method calls
  return new Proxy(client, {
    get(target, prop: string) {
      const originalMethod = target[prop];
      
      if (typeof originalMethod === 'function') {
        // Handle method calls
        return function(...args: any[]) {
          const methodResult = originalMethod.apply(target, args);
          
          // If this is a query method that returns a Promise
          if (methodResult?.then && ['from', 'rpc', 'select', 'insert', 'update', 'delete'].includes(prop)) {
            // Get query description based on the method and arguments
            const queryDescription = getQueryDescription(prop, args);
            
            return withQueryMonitoring(
              () => methodResult,
              queryDescription,
              {
                source: options.source,
                capturePlan: options.capturePlans,
                context: { 
                  ...context,
                  method: prop,
                  args: getSerializableArgs(args) 
                },
              }
            );
          }
          
          // For chainable methods (from, select, etc.) that return builder objects
          if (methodResult && typeof methodResult === 'object' && ['from', 'select', 'insert', 'update', 'delete'].includes(prop)) {
            return createMonitoredClient(methodResult, options, {
              ...context,
              method: prop,
              args: getSerializableArgs(args)
            });
          }
          
          // For other methods, just pass through
          return methodResult;
        };
      }
      
      // For properties, just pass through
      return originalMethod;
    }
  }) as SupabaseClient;
}

/**
 * Get a human-readable description of a query from method and args
 */
function getQueryDescription(method: string, args: any[]): string {
  switch (method) {
    case 'from':
      return `from(${args[0]})`;
    case 'rpc':
      return `rpc(${args[0]})`;
    case 'select':
      return `select(${args[0] || '*'})`;
    case 'insert':
      return `insert into ${args?.[0]?.table || 'unknown'}`;
    case 'update':
      return `update ${args?.[0]?.table || 'unknown'}`;
    case 'delete':
      return `delete from ${args?.[0]?.table || 'unknown'}`;
    default:
      return `${method}()`;
  }
}

/**
 * Convert args to a serializable form for logging
 */
function getSerializableArgs(args: any[]): any {
  try {
    // Simple serialization for logging - handles basic types
    return args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        // Convert objects to string representation for logging
        return JSON.stringify(arg).substring(0, 200); // Truncate to avoid massive logs
      }
      return String(arg).substring(0, 200); // Truncate to avoid massive logs
    });
  } catch (error) {
    return ['[unserializable args]'];
  }
}

/**
 * Middleware that adds query performance monitoring to API routes
 * 
 * @param handler The API route handler
 * @param options Query monitoring options
 * @returns Enhanced handler with query monitoring
 */
export function withQueryMonitoring(
  handler: ApiHandler,
  options: QueryMonitoringOptions = {}
): ApiHandler {
  const opts = { ...defaultOptions, ...options };
  
  return async (req: NextRequest, params?: Record<string, string | string[]>) => {
    // If monitoring is disabled, just run the handler
    if (!opts.enabled) {
      return handler(req, params);
    }
    
    // Create a monitored Supabase client
    const originalClient = opts.client || createActionClient();
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
    const context = {
      requestId,
      path: req.nextUrl.pathname,
      method: req.method,
    };
    
    const monitoredClient = createMonitoredClient(originalClient, opts, context);
    
    // Create a patched createActionClient function that returns our monitored client
    const originalCreateActionClient = require('../supabase/client').createActionClient;
    const createActionClientPatch = () => monitoredClient;
    
    try {
      // Replace the createActionClient function with our patched version
      require('../supabase/client').createActionClient = createActionClientPatch;
      
      // Execute the handler with the monitored client
      return await handler(req, params);
    } catch (error) {
      logger.error('Error in API route with query monitoring', {
        error,
        requestId,
        path: req.nextUrl.pathname,
        method: req.method,
      });
      throw error;
    } finally {
      // Restore the original createActionClient function
      require('../supabase/client').createActionClient = originalCreateActionClient;
    }
  };
}