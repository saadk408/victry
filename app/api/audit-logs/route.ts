/**
 * API route for Audit Logs
 * 
 * This endpoint provides functionality to view and manage audit logs.
 * It's primarily intended for admin use.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createActionClient } from '@/lib/supabase/client';
import { withErrorLogging } from '@/lib/middlewares/error-logging-middleware';
import { withQueryMonitoring } from '@/lib/middlewares/query-monitoring-middleware';
import { withAuditLogging } from '@/lib/middlewares/audit-logging-middleware';
import { OperationCategory } from '@/lib/supabase/audit-logger';
import { isAdmin } from '@/lib/supabase/auth-utils';
import { cookies } from 'next/headers';
import {
  getRecentOperations,
  getSecurityEvents,
  getAuthenticationEvents,
  getPaymentEvents,
  getUserActivity,
  getRecordHistory,
  purgeOldAuditLogs,
} from '@/lib/supabase/audit-logger';
import logger from '@/lib/utils/logger';

// Schema for record history request
const RecordHistorySchema = z.object({
  tableName: z.string().min(1),
  recordId: z.string().min(1),
});

// Schema for user activity request
const UserActivitySchema = z.object({
  userId: z.string().uuid(),
  limit: z.number().min(1).max(1000).optional(),
});

// Schema for purge logs request
const PurgeLogsSchema = z.object({
  retentionDays: z.number().min(1).max(365),
});

/**
 * Handler for GET requests - fetch audit logs
 */
async function handleGet(req: NextRequest): Promise<NextResponse> {
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  // Only allow admin users to access audit logs
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
    case 'recent-operations': {
      const operations = await getRecentOperations();
      return NextResponse.json(operations);
    }
    
    case 'security-events': {
      const limit = searchParams.get('limit') 
        ? parseInt(searchParams.get('limit')!, 10)
        : 100;
      
      const events = await getSecurityEvents(limit);
      return NextResponse.json(events);
    }
    
    case 'authentication-events': {
      const limit = searchParams.get('limit') 
        ? parseInt(searchParams.get('limit')!, 10)
        : 100;
      
      const events = await getAuthenticationEvents(limit);
      return NextResponse.json(events);
    }
    
    case 'payment-events': {
      const limit = searchParams.get('limit') 
        ? parseInt(searchParams.get('limit')!, 10)
        : 100;
      
      const events = await getPaymentEvents(limit);
      return NextResponse.json(events);
    }
    
    case 'user-activity': {
      try {
        const params = UserActivitySchema.parse({
          userId: searchParams.get('userId') || '',
          limit: searchParams.get('limit')
            ? parseInt(searchParams.get('limit')!, 10)
            : undefined,
        });
        
        const activity = await getUserActivity(params.userId, params.limit);
        return NextResponse.json(activity);
      } catch (error) {
        logger.error('Error parsing user activity parameters', { error });
        return NextResponse.json(
          { error: 'Invalid parameters' },
          { status: 400 }
        );
      }
    }
    
    case 'record-history': {
      try {
        const params = RecordHistorySchema.parse({
          tableName: searchParams.get('tableName') || '',
          recordId: searchParams.get('recordId') || '',
        });
        
        const history = await getRecordHistory(params.tableName, params.recordId);
        return NextResponse.json(history);
      } catch (error) {
        logger.error('Error parsing record history parameters', { error });
        return NextResponse.json(
          { error: 'Invalid parameters' },
          { status: 400 }
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

/**
 * Handler for POST requests - manage audit logs
 */
async function handlePost(req: NextRequest): Promise<NextResponse> {
  // Only allow admin users to access audit logs
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
    case 'purge-logs': {
      try {
        const body = await req.json();
        const params = PurgeLogsSchema.parse(body);
        
        const count = await purgeOldAuditLogs(params.retentionDays);
        
        return NextResponse.json({
          message: `Purged ${count} audit logs older than ${params.retentionDays} days`,
          count,
        });
      } catch (error) {
        logger.error('Error purging audit logs', { error });
        return NextResponse.json(
          { error: 'Failed to purge audit logs' },
          { status: 400 }
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

// Apply middlewares
export const GET = withErrorLogging(
  withQueryMonitoring(
    withAuditLogging(handleGet, {
      category: OperationCategory.Admin,
      operationType: 'view_audit_logs',
    })
  )
);

export const POST = withErrorLogging(
  withQueryMonitoring(
    withAuditLogging(handlePost, {
      category: OperationCategory.Admin,
      operationType: 'manage_audit_logs',
    })
  )
);