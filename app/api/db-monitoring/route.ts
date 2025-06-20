/**
 * API route for database monitoring
 * 
 * This route provides endpoints for:
 * 1. Getting slow query reports
 * 2. Viewing query patterns
 * 3. Purging old monitoring data
 * 4. Adjusting monitoring configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createActionClient } from '@/lib/supabase/client';
import { withQueryMonitoring, QuerySource } from '@/lib/supabase/query-monitoring';
import { withErrorLogging } from '@/lib/middlewares/error-logging-middleware';
import { withQueryMonitoringMiddleware } from '@/lib/middlewares/query-monitoring-middleware';
// Remove validateRequest import as it doesn't exist in api-utils
import { logger } from '@/lib/utils/logger';
import { isAdmin } from '@/lib/supabase/auth-utils';
import { cookies } from 'next/headers';

// Schema for GET request query parameters
const GetSlowQueriesSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  minExecutionTime: z.coerce.number().optional(),
});

// Schema for configuration updates
const UpdateConfigSchema = z.object({
  thresholdMs: z.number().min(100).max(60000).optional(),
  enabled: z.boolean().optional(),
  capturePlan: z.boolean().optional(),
  ignorePatterns: z.array(z.string()).optional(),
});

/**
 * Handle GET requests - fetch monitoring data
 */
async function handleGet(req: NextRequest): Promise<NextResponse> {
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  // Only allow admin users to access monitoring data
  const cookieStore = await cookies();
  const supabase = createActionClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Check if user has admin role using auth utilities
  const hasAdminRole = await isAdmin();
  
  if (!hasAdminRole) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  
  switch (action) {
    case 'slow-queries': {
      try {
        const params = GetSlowQueriesSchema.parse({
          startTime: searchParams.get('startTime') || undefined,
          endTime: searchParams.get('endTime') || undefined,
          minExecutionTime: searchParams.get('minExecutionTime') || undefined,
        });
        
        const { data, error } = await supabase.rpc('get_slow_query_report', {
          start_time: params.startTime,
          end_time: params.endTime,
          min_execution_time: params.minExecutionTime,
        });
        
        if (error) {
          logger.error('Error fetching slow queries', { error });
          return NextResponse.json(
            { error: 'Failed to fetch slow queries' },
            { status: 500 }
          );
        }
        
        return NextResponse.json(data);
      } catch (error) {
        logger.error('Error parsing slow query parameters', { error });
        return NextResponse.json(
          { error: 'Invalid parameters' },
          { status: 400 }
        );
      }
    }
    
    case 'query-patterns': {
      const { data, error } = await supabase
        .from('monitoring.query_patterns')
        .select('*')
        .limit(100);
      
      if (error) {
        logger.error('Error fetching query patterns', { error });
        return NextResponse.json(
          { error: 'Failed to fetch query patterns' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(data);
    }
    
    case 'application-performance': {
      const { data, error } = await supabase
        .from('monitoring.application_performance')
        .select('*');
      
      if (error) {
        logger.error('Error fetching application performance', { error });
        return NextResponse.json(
          { error: 'Failed to fetch application performance' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(data);
    }
    
    case 'configuration': {
      const { data, error } = await supabase
        .from('monitoring.slow_query_config')
        .select('*')
        .order('id', { ascending: false })
        .limit(1);
      
      if (error) {
        logger.error('Error fetching monitoring configuration', { error });
        return NextResponse.json(
          { error: 'Failed to fetch monitoring configuration' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(data[0] || {});
    }
    
    default:
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
  }
}

/**
 * Handle POST requests - modify monitoring configuration
 */
async function handlePost(req: NextRequest): Promise<NextResponse> {
  // Only allow admin users to modify monitoring settings
  const cookieStore = await cookies();
  const supabase = createActionClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Check if user has admin role using auth utilities
  const hasAdminRole = await isAdmin();
  
  if (!hasAdminRole) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  switch (action) {
    case 'update-config': {
      try {
        const body = await req.json();
        const config = UpdateConfigSchema.parse(body);
        
        // Get current configuration
        const { data: existingConfig, error: fetchError } = await supabase
          .from('monitoring.slow_query_config')
          .select('*')
          .order('id', { ascending: false })
          .limit(1);
        
        if (fetchError) {
          logger.error('Error fetching existing config', { error: fetchError });
          return NextResponse.json(
            { error: 'Failed to fetch existing configuration' },
            { status: 500 }
          );
        }
        
        // Update configuration
        const updatedConfig = {
          ...(existingConfig?.[0] || {}),
          threshold_ms: config.thresholdMs ?? existingConfig?.[0]?.threshold_ms,
          enabled: config.enabled ?? existingConfig?.[0]?.enabled,
          capture_plan: config.capturePlan ?? existingConfig?.[0]?.capture_plan,
          ignore_patterns: config.ignorePatterns ?? existingConfig?.[0]?.ignore_patterns,
          updated_at: new Date().toISOString(),
          updated_by: user.email,
        };
        
        // Insert or update configuration
        const { data, error } = await supabase
          .from('monitoring.slow_query_config')
          .upsert(updatedConfig)
          .select()
          .single();
        
        if (error) {
          logger.error('Error updating monitoring configuration', { error });
          return NextResponse.json(
            { error: 'Failed to update monitoring configuration' },
            { status: 500 }
          );
        }
        
        return NextResponse.json(data);
      } catch (error) {
        logger.error('Error parsing configuration update', { error });
        return NextResponse.json(
          { error: 'Invalid configuration' },
          { status: 400 }
        );
      }
    }
    
    case 'purge-data': {
      try {
        const body = await req.json();
        const { retentionDays } = body;
        
        if (typeof retentionDays !== 'number' || retentionDays < 1 || retentionDays > 365) {
          return NextResponse.json(
            { error: 'Invalid retention days (must be between 1 and 365)' },
            { status: 400 }
          );
        }
        
        const { data, error } = await supabase.rpc('purge_old_data', {
          retention_days: retentionDays,
        });
        
        if (error) {
          logger.error('Error purging monitoring data', { error });
          return NextResponse.json(
            { error: 'Failed to purge monitoring data' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          message: `Purged ${data} records older than ${retentionDays} days`,
          recordsDeleted: data,
        });
      } catch (error) {
        logger.error('Error processing purge request', { error });
        return NextResponse.json(
          { error: 'Invalid request' },
          { status: 400 }
        );
      }
    }
    
    case 'record-test-query': {
      try {
        // Execute a test query to demonstrate monitoring
        const startTime = performance.now();
        
        // Perform a sample database query
        await supabase
          .from('resumes')
          .select('*')
          .limit(10);
        
        const executionTime = performance.now() - startTime;
        
        // Record the query performance
        const { data, error } = await withQueryMonitoring(
          () => supabase.rpc('record_query_performance', {
            query_text: 'SELECT * FROM resumes LIMIT 10',
            execution_time_ms: executionTime,
            rows_processed: 10,
            source: QuerySource.Admin,
            capture_plan: true,
          }),
          'Test query for performance monitoring',
          { source: QuerySource.Admin }
        );
        
        if (error) {
          logger.error('Error recording test query', { error });
          return NextResponse.json(
            { error: 'Failed to record test query' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          message: 'Test query recorded successfully',
          queryId: data,
          executionTime,
        });
      } catch (error) {
        logger.error('Error executing test query', { error });
        return NextResponse.json(
          { error: 'Failed to execute test query' },
          { status: 500 }
        );
      }
    }
    
    case 'reset-configuration': {
      try {
        const { data, error } = await supabase.rpc('reset_configuration');
        
        if (error) {
          logger.error('Error resetting monitoring configuration', { error });
          return NextResponse.json(
            { error: 'Failed to reset monitoring configuration' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          message: 'Monitoring configuration reset successfully',
        });
      } catch (error) {
        logger.error('Error resetting configuration', { error });
        return NextResponse.json(
          { error: 'Failed to reset configuration' },
          { status: 500 }
        );
      }
    }
    
    default:
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
  }
}

// Main handler with monitoring middleware
export const GET = withErrorLogging(
  withQueryMonitoringMiddleware(handleGet, {
    source: QuerySource.Admin,
    capturePlans: true,
  })
);

export const POST = withErrorLogging(
  withQueryMonitoringMiddleware(handlePost, {
    source: QuerySource.Admin,
    capturePlans: true,
  })
);