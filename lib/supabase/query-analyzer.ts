/**
 * Query Analyzer
 *
 * Provides utilities for analyzing database query performance using EXPLAIN ANALYZE.
 * This module helps identify query optimization opportunities and diagnose performance issues.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './client';
import { logger } from '../utils/logger';

export interface QueryPlanNode {
  /** Node type (e.g., 'Seq Scan', 'Index Scan', 'Hash Join') */
  nodeType: string;
  /** Relation name if applicable */
  relation?: string;
  /** Estimated startup cost */
  startupCost?: number;
  /** Estimated total cost */
  totalCost?: number;
  /** Estimated number of rows */
  planRows?: number;
  /** Estimated row width in bytes */
  planWidth?: number;
  /** Actual startup time in milliseconds */
  actualStartupTime?: number;
  /** Actual total time in milliseconds */
  actualTotalTime?: number;
  /** Actual number of rows */
  actualRows?: number;
  /** Number of loops executed */
  actualLoops?: number;
  /** Child nodes */
  children?: QueryPlanNode[];
  /** Other properties specific to node type */
  [key: string]: any;
}

export interface QueryPlan {
  /** Query plan execution time in milliseconds */
  executionTime: number;
  /** Planning time in milliseconds */
  planningTime: number;
  /** Root node of the query plan */
  plan: QueryPlanNode;
  /** Any triggers executed during the query */
  triggers?: any[];
  /** Original query text */
  query?: string;
  /** Any warnings about the query plan */
  warnings?: string[];
}

export interface QueryAnalysisResult {
  /** The analyzed query plan */
  plan: QueryPlan;
  /** Plan in text format */
  planText: string;
  /** Identified issues in the query plan */
  issues: QueryIssue[];
  /** Recommendations for improving the query */
  recommendations: string[];
  /** Overall health score (0-100) */
  healthScore: number;
}

export interface QueryIssue {
  /** Issue type */
  type: string;
  /** Issue description */
  description: string;
  /** Severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Related node in the query plan */
  relatedNode?: string;
  /** Possible solution */
  suggestedFix?: string;
}

/**
 * Analyze a SQL query using EXPLAIN ANALYZE
 * 
 * @param query SQL query to analyze
 * @param params Query parameters (if any)
 * @param options Options for analysis
 * @returns Analysis results
 */
export async function analyzeQuery(
  query: string,
  params: any[] = [],
  options: {
    client?: SupabaseClient;
    verbose?: boolean;
    buffers?: boolean;
    timing?: boolean;
    format?: 'json' | 'text' | 'xml' | 'yaml';
  } = {}
): Promise<QueryAnalysisResult | null> {
  const {
    client = createClient(),
    verbose = true,
    buffers = false,
    timing = true,
    format = 'json'
  } = options;

  try {
    // Build EXPLAIN options
    const explainOptions = [
      'ANALYZE',
      verbose ? 'VERBOSE' : '',
      buffers ? 'BUFFERS' : '',
      timing ? 'TIMING' : '',
      `FORMAT ${format.toUpperCase()}`
    ].filter(Boolean).join(', ');

    // Get JSON plan
    const explainQuery = `EXPLAIN (${explainOptions}) ${query}`;
    const { data: jsonPlan, error: jsonError } = await client.rpc('monitoring.run_explain', {
      query_text: query,
      params: params,
      explain_options: explainOptions
    });

    if (jsonError || !jsonPlan) {
      logger.error('Error getting JSON query plan', { error: jsonError, query });
      return null;
    }

    // Get text format plan for readability
    const { data: textPlan, error: textError } = await client.rpc('monitoring.run_explain', {
      query_text: query,
      params: params,
      explain_options: 'ANALYZE, VERBOSE'
    });

    if (textError) {
      logger.warn('Error getting text query plan', { error: textError, query });
    }

    // Parse and analyze the plan
    const plan = parsePlan(jsonPlan);
    const issues = analyzeQueryPlan(plan);
    const recommendations = generateRecommendations(plan, issues);
    const healthScore = calculateHealthScore(issues);

    return {
      plan,
      planText: textPlan || '',
      issues,
      recommendations,
      healthScore
    };
  } catch (error) {
    logger.error('Error analyzing query', { error, query });
    return null;
  }
}

/**
 * Get a history of query analysis results for a specific query pattern
 * 
 * @param queryFingerprint Query fingerprint to look up
 * @param limit Maximum number of results to return
 * @param client Supabase client to use
 * @returns Array of query analysis results
 */
export async function getQueryAnalysisHistory(
  queryFingerprint: string,
  limit: number = 10,
  client?: SupabaseClient
): Promise<any[]> {
  const supabase = client || createClient();

  try {
    const { data, error } = await supabase
      .from('monitoring.query_performance')
      .select('*')
      .eq('query_fingerprint', queryFingerprint)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error getting query analysis history', { error, queryFingerprint });
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Exception getting query analysis history', { error, queryFingerprint });
    return [];
  }
}

/**
 * Store query analysis results in the database
 * 
 * @param query SQL query that was analyzed
 * @param analysis Analysis results
 * @param executionTime Query execution time in milliseconds
 * @param client Supabase client to use
 * @returns ID of the created record
 */
export async function storeQueryAnalysis(
  query: string,
  analysis: QueryAnalysisResult,
  executionTime: number,
  client?: SupabaseClient
): Promise<string | null> {
  const supabase = client || createClient();

  try {
    // Generate query fingerprint
    const queryFingerprint = normalizeQuery(query);

    const { data, error } = await supabase
      .from('monitoring.query_performance')
      .insert({
        query_text: query,
        query_fingerprint: queryFingerprint,
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

    if (error) {
      logger.error('Error storing query analysis', { error, query });
      return null;
    }

    return data?.id;
  } catch (error) {
    logger.error('Exception storing query analysis', { error, query });
    return null;
  }
}

/**
 * Generate a normalized version of a query (fingerprint)
 * 
 * @param query SQL query to normalize
 * @returns Normalized query
 */
function normalizeQuery(query: string): string {
  // Replace literals with placeholders
  let normalized = query;
  
  // Replace numbers
  normalized = normalized.replace(/\b\d+\b/g, 'N');
  
  // Replace string literals
  normalized = normalized.replace(/'[^']*'/g, 'S');
  
  // Replace array literals
  normalized = normalized.replace(/\[[^\]]*\]/g, 'A');
  
  // Replace JSON literals
  normalized = normalized.replace(/{[^}]*}/g, 'J');
  
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Parse the raw plan data into a structured QueryPlan
 * 
 * @param rawPlan Raw plan data from EXPLAIN ANALYZE
 * @returns Structured query plan
 */
function parsePlan(rawPlan: any): QueryPlan {
  // Handle different formats of plan data
  let planData: any;
  
  if (Array.isArray(rawPlan) && rawPlan.length > 0) {
    // If it's an array of plan data
    planData = rawPlan[0];
  } else if (rawPlan && typeof rawPlan === 'object') {
    // If it's already in the expected format
    planData = rawPlan;
  } else {
    // Default empty plan
    return {
      executionTime: 0,
      planningTime: 0,
      plan: { nodeType: 'Unknown' }
    };
  }
  
  // Extract relevant information
  return {
    executionTime: planData.Execution?.['Execution Time'] || 0,
    planningTime: planData.Planning?.['Planning Time'] || 0,
    plan: parsePlanNode(planData.Plan),
    triggers: planData.Triggers,
    query: planData.Query,
    warnings: planData.Warnings || []
  };
}

/**
 * Parse a plan node recursively
 * 
 * @param node Raw plan node
 * @returns Structured query plan node
 */
function parsePlanNode(node: any): QueryPlanNode {
  if (!node) {
    return { nodeType: 'Unknown' };
  }
  
  // Extract basic node information
  const parsedNode: QueryPlanNode = {
    nodeType: node['Node Type'] || 'Unknown',
    relation: node['Relation Name'],
    startupCost: node['Startup Cost'],
    totalCost: node['Total Cost'],
    planRows: node['Plan Rows'],
    planWidth: node['Plan Width'],
    actualStartupTime: node['Actual Startup Time'],
    actualTotalTime: node['Actual Total Time'],
    actualRows: node['Actual Rows'],
    actualLoops: node['Actual Loops']
  };
  
  // Include any other properties from the node
  Object.keys(node).forEach(key => {
    // Skip properties we've already extracted
    const processedKeys = [
      'Node Type', 'Relation Name', 'Startup Cost', 'Total Cost',
      'Plan Rows', 'Plan Width', 'Actual Startup Time', 'Actual Total Time',
      'Actual Rows', 'Actual Loops', 'Plans'
    ];
    
    if (!processedKeys.includes(key)) {
      const camelKey = key.replace(/\s(.)/g, ($1) => $1.toLowerCase())
        .replace(/\s/g, '')
        .replace(/^(.)/, ($1) => $1.toLowerCase());
      
      parsedNode[camelKey] = node[key];
    }
  });
  
  // Process child plans recursively
  if (node.Plans && Array.isArray(node.Plans)) {
    parsedNode.children = node.Plans.map(parsePlanNode);
  }
  
  return parsedNode;
}

/**
 * Analyze a query plan to identify issues
 * 
 * @param plan Query plan to analyze
 * @returns Identified issues
 */
function analyzeQueryPlan(plan: QueryPlan): QueryIssue[] {
  const issues: QueryIssue[] = [];
  
  // Check for sequential scans on large tables
  identifySequentialScans(plan.plan, issues);
  
  // Check for hash joins on large tables
  identifyExpensiveJoins(plan.plan, issues);
  
  // Check for high row count differences between estimated and actual
  identifyEstimationErrors(plan.plan, issues);
  
  // Check for excessive temporary file usage
  identifyTemporaryFileUsage(plan.plan, issues);
  
  // Check for unused indexes (Index Only Scan with high filter ratio)
  identifyUnusedIndexes(plan.plan, issues);
  
  // Check for parallel query opportunities
  identifyParallelQueryOpportunities(plan, issues);
  
  // Check planning time vs execution time ratio
  if (plan.planningTime > plan.executionTime * 0.5) {
    issues.push({
      type: 'high_planning_time',
      description: 'Planning time is high relative to execution time',
      severity: 'medium',
      suggestedFix: 'Consider simplifying the query or creating helper views'
    });
  }
  
  return issues;
}

/**
 * Identify sequential scans in the query plan
 * 
 * @param node Query plan node to analyze
 * @param issues Issues array to append to
 */
function identifySequentialScans(node: QueryPlanNode, issues: QueryIssue[]): void {
  // Check if this node is a sequential scan
  if (node.nodeType === 'Seq Scan' && node.relation) {
    // Check if it's potentially problematic (high row count or time)
    if ((node.actualRows && node.actualRows > 1000) || 
        (node.actualTotalTime && node.actualTotalTime > 100)) {
      issues.push({
        type: 'sequential_scan',
        description: `Sequential scan on table ${node.relation} with ${node.actualRows} rows`,
        severity: node.actualRows > 10000 ? 'high' : 'medium',
        relatedNode: `Seq Scan on ${node.relation}`,
        suggestedFix: `Consider adding an index on columns in the WHERE clause for table ${node.relation}`
      });
    }
  }
  
  // Recurse through child nodes
  if (node.children) {
    node.children.forEach(child => identifySequentialScans(child, issues));
  }
}

/**
 * Identify expensive joins in the query plan
 * 
 * @param node Query plan node to analyze
 * @param issues Issues array to append to
 */
function identifyExpensiveJoins(node: QueryPlanNode, issues: QueryIssue[]): void {
  // Check if this node is a hash join or nested loop
  if (node.nodeType.includes('Join')) {
    // Check if it's potentially problematic
    if ((node.actualRows && node.actualRows > 10000) || 
        (node.actualTotalTime && node.actualTotalTime > 500)) {
      issues.push({
        type: 'expensive_join',
        description: `Expensive ${node.nodeType} producing ${node.actualRows} rows`,
        severity: node.actualTotalTime > 1000 ? 'high' : 'medium',
        relatedNode: node.nodeType,
        suggestedFix: 'Consider adding indexes on join columns or restructuring the query'
      });
    }
  }
  
  // Recurse through child nodes
  if (node.children) {
    node.children.forEach(child => identifyExpensiveJoins(child, issues));
  }
}

/**
 * Identify estimation errors in the query plan
 * 
 * @param node Query plan node to analyze
 * @param issues Issues array to append to
 */
function identifyEstimationErrors(node: QueryPlanNode, issues: QueryIssue[]): void {
  // Check for significant differences between estimated and actual rows
  if (node.planRows && node.actualRows) {
    const ratio = node.actualRows / node.planRows;
    
    if (ratio > 10 || ratio < 0.1) {
      issues.push({
        type: 'estimation_error',
        description: `Row estimation error in ${node.nodeType}: estimated ${node.planRows}, got ${node.actualRows}`,
        severity: (ratio > 100 || ratio < 0.01) ? 'high' : 'medium',
        relatedNode: node.nodeType,
        suggestedFix: 'Run ANALYZE on related tables to update statistics'
      });
    }
  }
  
  // Recurse through child nodes
  if (node.children) {
    node.children.forEach(child => identifyEstimationErrors(child, issues));
  }
}

/**
 * Identify temporary file usage in the query plan
 * 
 * @param node Query plan node to analyze
 * @param issues Issues array to append to
 */
function identifyTemporaryFileUsage(node: QueryPlanNode, issues: QueryIssue[]): void {
  // Check for temporary file usage
  if (node.sortMethod === 'external merge' || node.sortSpaceUsed) {
    issues.push({
      type: 'temporary_files',
      description: `External temporary file used in ${node.nodeType}`,
      severity: 'high',
      relatedNode: node.nodeType,
      suggestedFix: 'Increase work_mem setting or restructure query to reduce memory usage'
    });
  }
  
  // Recurse through child nodes
  if (node.children) {
    node.children.forEach(child => identifyTemporaryFileUsage(child, issues));
  }
}

/**
 * Identify unused indexes in the query plan
 * 
 * @param node Query plan node to analyze
 * @param issues Issues array to append to
 */
function identifyUnusedIndexes(node: QueryPlanNode, issues: QueryIssue[]): void {
  // Check for index scans with high filter ratios
  if ((node.nodeType === 'Index Scan' || node.nodeType === 'Index Only Scan') && 
      node.relation && node.indexName) {
    
    if (node.actualRows && node.actualRows < 10 && node.planRows && node.planRows > 1000) {
      issues.push({
        type: 'inefficient_index',
        description: `Inefficient index ${node.indexName} on ${node.relation}`,
        severity: 'medium',
        relatedNode: `${node.nodeType} on ${node.relation}`,
        suggestedFix: 'Consider creating a more specific index for this query pattern'
      });
    }
  }
  
  // Recurse through child nodes
  if (node.children) {
    node.children.forEach(child => identifyUnusedIndexes(child, issues));
  }
}

/**
 * Identify parallel query opportunities
 * 
 * @param plan Query plan to analyze
 * @param issues Issues array to append to
 */
function identifyParallelQueryOpportunities(plan: QueryPlan, issues: QueryIssue[]): void {
  // Check if this is a heavy query that isn't using parallelism
  if (plan.executionTime > 1000) {
    let hasParallelNodes = false;
    
    // Function to check for parallel nodes
    function checkForParallelNodes(node: QueryPlanNode): boolean {
      if (node.nodeType.includes('Parallel')) {
        return true;
      }
      
      if (node.children) {
        return node.children.some(checkForParallelNodes);
      }
      
      return false;
    }
    
    hasParallelNodes = checkForParallelNodes(plan.plan);
    
    if (!hasParallelNodes) {
      issues.push({
        type: 'missing_parallelism',
        description: 'Query is slow but not utilizing parallel execution',
        severity: 'medium',
        suggestedFix: 'Consider enabling parallel query execution or restructuring the query'
      });
    }
  }
}

/**
 * Generate recommendations based on identified issues
 * 
 * @param plan Query plan
 * @param issues Identified issues
 * @returns Array of recommendations
 */
function generateRecommendations(plan: QueryPlan, issues: QueryIssue[]): string[] {
  const recommendations: string[] = [];
  
  // Group issues by type
  const issuesByType: Record<string, QueryIssue[]> = {};
  issues.forEach(issue => {
    if (!issuesByType[issue.type]) {
      issuesByType[issue.type] = [];
    }
    issuesByType[issue.type].push(issue);
  });
  
  // Generate recommendations for sequential scans
  if (issuesByType.sequential_scan) {
    const tables = issuesByType.sequential_scan
      .map(issue => issue.relatedNode?.replace('Seq Scan on ', '') || '')
      .filter(Boolean);
    
    if (tables.length > 0) {
      const uniqueTables = [...new Set(tables)];
      recommendations.push(
        `Consider adding indexes for tables: ${uniqueTables.join(', ')}`
      );
    }
  }
  
  // Generate recommendations for estimation errors
  if (issuesByType.estimation_error) {
    recommendations.push(
      'Run ANALYZE on tables with statistics errors to improve query planning'
    );
  }
  
  // Generate recommendations for expensive joins
  if (issuesByType.expensive_join) {
    recommendations.push(
      'Review join conditions and add appropriate indexes for join columns'
    );
  }
  
  // Generate recommendations for temporary file usage
  if (issuesByType.temporary_files) {
    recommendations.push(
      'Increase work_mem setting or break down the query into smaller operations'
    );
  }
  
  // Generate recommendations for inefficient indexes
  if (issuesByType.inefficient_index) {
    recommendations.push(
      'Consider creating more specific indexes that better match query patterns'
    );
  }
  
  // Generate recommendations for missing parallelism
  if (issuesByType.missing_parallelism) {
    recommendations.push(
      'Enable parallel query execution for this operation (increase max_parallel_workers)'
    );
  }
  
  // Add general recommendations for slow queries
  if (plan.executionTime > 1000) {
    recommendations.push(
      'Consider caching frequently accessed query results'
    );
  }
  
  return recommendations;
}

/**
 * Calculate an overall health score for the query
 * 
 * @param issues Identified issues
 * @returns Health score (0-100)
 */
function calculateHealthScore(issues: QueryIssue[]): number {
  let score = 100;
  
  // Deduct points based on issue severity
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'low':
        score -= 5;
        break;
      case 'medium':
        score -= 10;
        break;
      case 'high':
        score -= 20;
        break;
      case 'critical':
        score -= 40;
        break;
    }
  });
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, score));
}