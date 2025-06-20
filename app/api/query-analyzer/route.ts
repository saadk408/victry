/**
 * API route for the Query Analyzer
 * 
 * This endpoint provides functionality to analyze database queries and identify
 * optimization opportunities. It's primarily intended for admin and development use.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createActionClient } from '@/lib/supabase/client';
import { withErrorLogging } from '@/lib/middlewares/error-logging-middleware';
import { withQueryMonitoringMiddleware } from '@/lib/middlewares/query-monitoring-middleware';
import { QuerySource } from '@/lib/supabase/query-monitoring';
import { analyzeQuery, getQueryAnalysisHistory } from '@/lib/supabase/query-analyzer';
import { logger } from '@/lib/utils/logger';

// Schema for query analysis request body
const AnalyzeQuerySchema = z.object({
  query: z.string().min(1),
  params: z.array(z.any()).optional(),
  options: z
    .object({
      verbose: z.boolean().optional(),
      buffers: z.boolean().optional(),
      timing: z.boolean().optional(),
    })
    .optional(),
});

// Schema for optimization opportunities request
const OptimizationOpportunitiesSchema = z.object({
  minExecutionTime: z.number().min(1).optional(),
  minOccurrences: z.number().min(1).optional(),
  lookbackDays: z.number().min(1).max(90).optional(),
});

// Schema for query plan comparison request
const ComparePlansSchema = z.object({
  queryFingerprint: z.string().min(1),
  lookbackDays: z.number().min(1).max(90).optional(),
});

/**
 * Handler for GET requests - fetch query analysis data
 */
async function handleGet(req: NextRequest): Promise<NextResponse> {
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  // Only allow admin users to access query analysis data
  const supabase = createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Check if user has admin role
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);
  
  const isAdmin = userRoles?.some(ur => ur.role === 'admin');
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  
  switch (action) {
    case 'optimization-opportunities': {
      try {
        const params = OptimizationOpportunitiesSchema.parse({
          minExecutionTime: searchParams.get('minExecutionTime') 
            ? parseInt(searchParams.get('minExecutionTime')!, 10) 
            : undefined,
          minOccurrences: searchParams.get('minOccurrences')
            ? parseInt(searchParams.get('minOccurrences')!, 10)
            : undefined,
          lookbackDays: searchParams.get('lookbackDays')
            ? parseInt(searchParams.get('lookbackDays')!, 10)
            : undefined,
        });
        
        const { data, error } = await supabase.rpc('monitoring.identify_optimization_opportunities', {
          min_execution_time: params.minExecutionTime || 100,
          min_occurrences: params.minOccurrences || 5,
          lookback_days: params.lookbackDays || 7,
        });
        
        if (error) {
          logger.error('Error identifying optimization opportunities', { error });
          return NextResponse.json(
            { error: 'Failed to identify optimization opportunities' },
            { status: 500 }
          );
        }
        
        return NextResponse.json(data);
      } catch (error) {
        logger.error('Error parsing optimization opportunities parameters', { error });
        return NextResponse.json(
          { error: 'Invalid parameters' },
          { status: 400 }
        );
      }
    }
    
    case 'compare-plans': {
      try {
        const params = ComparePlansSchema.parse({
          queryFingerprint: searchParams.get('queryFingerprint') || '',
          lookbackDays: searchParams.get('lookbackDays')
            ? parseInt(searchParams.get('lookbackDays')!, 10)
            : undefined,
        });
        
        const { data, error } = await supabase.rpc('monitoring.compare_query_plans', {
          query_fingerprint: params.queryFingerprint,
          lookback_days: params.lookbackDays || 7,
        });
        
        if (error) {
          logger.error('Error comparing query plans', { error });
          return NextResponse.json(
            { error: 'Failed to compare query plans' },
            { status: 500 }
          );
        }
        
        return NextResponse.json(data);
      } catch (error) {
        logger.error('Error parsing compare plans parameters', { error });
        return NextResponse.json(
          { error: 'Invalid parameters' },
          { status: 400 }
        );
      }
    }
    
    case 'query-history': {
      const queryFingerprint = searchParams.get('queryFingerprint');
      const limit = searchParams.get('limit') 
        ? parseInt(searchParams.get('limit')!, 10)
        : 10;
      
      if (!queryFingerprint) {
        return NextResponse.json(
          { error: 'queryFingerprint parameter is required' },
          { status: 400 }
        );
      }
      
      const history = await getQueryAnalysisHistory(queryFingerprint, limit);
      return NextResponse.json(history);
    }
    
    default:
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
  }
}

/**
 * Handler for POST requests - analyze queries
 */
async function handlePost(req: NextRequest): Promise<NextResponse> {
  // Only allow admin users to analyze queries
  const supabase = createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Check if user has admin role
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);
  
  const isAdmin = userRoles?.some(ur => ur.role === 'admin');
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  switch (action) {
    case 'analyze-query': {
      try {
        const body = await req.json();
        const { query, params, options } = AnalyzeQuerySchema.parse(body);
        
        // Validate the query to prevent malicious queries
        if (/^\s*(alter|drop|create|truncate|comment|vacuum|do|notify|copy|grant|revoke)/i.test(query)) {
          return NextResponse.json(
            { error: 'This query type is not allowed for analysis' },
            { status: 400 }
          );
        }
        
        // Analyze the query
        const startTime = performance.now();
        const analysis = await analyzeQuery(query, params, {
          verbose: options?.verbose,
          buffers: options?.buffers,
          timing: options?.timing,
        });
        const executionTime = performance.now() - startTime;
        
        if (!analysis) {
          return NextResponse.json(
            { error: 'Failed to analyze query' },
            { status: 500 }
          );
        }
        
        // Store the analysis result
        if (analysis.plan && executionTime > 10) {
          const { data: analysisRecord } = await supabase
            .from('monitoring.query_performance')
            .insert({
              query_text: query,
              query_fingerprint: query.replace(/\d+/g, 'N').replace(/'[^']*'/g, 'S'),
              execution_time: executionTime,
              query_plan: analysis.plan,
              explain_analyze: analysis.planText,
              analysis_result: {
                issues: analysis.issues,
                recommendations: analysis.recommendations,
                healthScore: analysis.healthScore
              }
            })
            .select('id')
            .single();
            
          // Include the record ID in the response
          if (analysisRecord?.id) {
            analysis['recordId'] = analysisRecord.id;
          }
        }
        
        return NextResponse.json({
          analysis,
          executionTime
        });
      } catch (error) {
        logger.error('Error analyzing query', { error });
        return NextResponse.json(
          { error: 'Failed to analyze query: ' + (error instanceof Error ? error.message : 'Unknown error') },
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