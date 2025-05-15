// File: /lib/ai/claude-tools.ts
// Utilities for configuring and using Claude's tools capability

import Anthropic from "@anthropic-ai/sdk";
import { ClaudeTool } from "./claude-client";

/**
 * Types for tool input and output
 */
export interface ToolInput {
  name: string;
  arguments: Record<string, any>;
}

export interface ToolOutput {
  output: any;
  error?: string;
}

export interface ToolCall {
  input: ToolInput;
  output?: ToolOutput;
}

/**
 * Type for a tool handler function
 * Takes tool input and returns tool output or a promise of tool output
 */
export type ToolHandler = (args: Record<string, any>) => Promise<any> | any;

/**
 * Map of tool names to handler functions
 */
export interface ToolHandlers {
  [name: string]: ToolHandler;
}

/**
 * Create a tool definition for Claude
 * 
 * @param name - The name of the tool
 * @param description - Description of what the tool does
 * @param inputSchema - JSON Schema definition for the tool's input
 * @returns A ClaudeTool object ready to be used with Claude API
 */
export function createTool(
  name: string,
  description: string,
  inputSchema: Record<string, any>
): ClaudeTool {
  return {
    name,
    description,
    input_schema: inputSchema,
  };
}

/**
 * Convert a Claude tool to the Anthropic SDK format
 * 
 * @param tool - The Claude tool to convert
 * @returns An Anthropic SDK tool object
 */
export function convertToSDKTool(tool: ClaudeTool): Anthropic.Tool {
  return {
    name: tool.name,
    description: tool.description,
    input_schema: tool.input_schema
  };
}

/**
 * Parse and extract tool calls from Claude's response
 * Works with both old and new response formats
 * 
 * @param content - Content from Claude's response
 * @returns Array of parsed tool calls or null if none
 */
export function extractToolCalls(content: any): ToolInput[] | null {
  // Handle empty content
  if (!content) {
    return null;
  }
  
  // Handle string content (no tool calls)
  if (typeof content === 'string') {
    return null;
  }

  // Handle array of content blocks (new format)
  if (Array.isArray(content)) {
    const toolCalls: ToolInput[] = [];
    
    for (const block of content) {
      if (block.type === 'tool_use') {
        toolCalls.push({
          name: block.id || block.name, // Handle both formats
          arguments: block.input,
        });
      }
    }
    
    return toolCalls.length > 0 ? toolCalls : null;
  }
  
  return null;
}

/**
 * Execute tool calls using registered handlers
 * 
 * @param toolCalls - Array of tool calls to execute
 * @param handlers - Map of tool names to handler functions
 * @returns Promise resolving to array of tool calls with outputs
 */
export async function executeToolCalls(
  toolCalls: ToolInput[],
  handlers: ToolHandlers
): Promise<ToolCall[]> {
  const results: ToolCall[] = [];
  
  for (const call of toolCalls) {
    const handler = handlers[call.name];
    
    if (!handler) {
      console.warn(`No handler registered for tool: ${call.name}`);
      results.push({
        input: call,
        output: { 
          output: null,
          error: `No handler registered for tool: ${call.name}`
        },
      });
      continue;
    }
    
    try {
      const output = await handler(call.arguments);
      results.push({
        input: call,
        output: { output },
      });
    } catch (error) {
      console.error(`Error executing tool ${call.name}:`, error);
      results.push({
        input: call,
        output: { 
          output: null,
          error: error instanceof Error ? error.message : String(error) 
        },
      });
    }
  }
  
  return results;
}

/**
 * Format tool results for use with the Anthropic SDK
 * 
 * @param toolCalls - Array of tool calls with results
 * @returns Tool results content block in the SDK format
 */
export function formatSDKToolResults(toolCalls: ToolCall[]): Anthropic.ContentBlock {
  return {
    type: 'tool_result',
    tool_results: toolCalls.map(call => ({
      tool_call_id: call.input.name,
      output: call.output?.output || null
    }))
  };
}

/**
 * Common tools that can be used across the application
 * These are pre-defined tools ready to be used with the Claude API
 */

// Resume keyword extraction tool schema
export const keywordExtractionTool = createTool(
  "extract_keywords",
  "Extract relevant keywords from a text",
  {
    type: "object",
    properties: {
      text: { type: "string", description: "The text to extract keywords from" },
      maxKeywords: { type: "number", description: "Maximum number of keywords to extract" },
    },
    required: ["text"],
  }
);

// ATS score calculation tool schema
export const atsScoreTool = createTool(
  "calculate_ats_score",
  "Calculate an ATS compatibility score for a resume against a job description",
  {
    type: "object",
    properties: {
      resumeText: { type: "string", description: "The resume text" },
      jobDescription: { type: "string", description: "The job description text" },
    },
    required: ["resumeText", "jobDescription"],
  }
);

// Job skill matching tool schema
export const skillMatchingTool = createTool(
  "match_skills",
  "Match resume skills with job description requirements",
  {
    type: "object",
    properties: {
      resumeSkills: { 
        type: "array", 
        items: { type: "string" },
        description: "List of skills from the resume" 
      },
      jobSkills: { 
        type: "array", 
        items: { type: "string" },
        description: "List of skills from the job description" 
      },
    },
    required: ["resumeSkills", "jobSkills"],
  }
);

// Default tool handlers
export const defaultToolHandlers: ToolHandlers = {
  extract_keywords: async ({ text, maxKeywords = 10 }) => {
    // Simplified keyword extraction
    const words = text.toLowerCase().split(/\W+/);
    const wordCounts: Record<string, number> = {};
    
    for (const word of words) {
      if (word.length < 3) continue; // Skip short words
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
    
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word, count]) => ({ word, count }));
  },
  
  calculate_ats_score: async ({ resumeText, jobDescription }) => {
    // Simplified ATS scoring implementation
    // In a real implementation, this would use more sophisticated algorithms
    const resumeWords = new Set(resumeText.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    const jobWords = new Set(jobDescription.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    
    // Calculate word overlap
    let matchCount = 0;
    for (const word of resumeWords) {
      if (jobWords.has(word)) {
        matchCount++;
      }
    }
    
    // Calculate score (simplified)
    const score = Math.min(100, Math.round((matchCount / Math.min(jobWords.size, 50)) * 100));
    
    return {
      score,
      matchedWords: matchCount,
      feedback: `Found ${matchCount} matching keywords between resume and job description.`
    };
  },
  
  match_skills: async ({ resumeSkills, jobSkills }) => {
    // Convert arrays to sets (case-insensitive)
    const resumeSkillsSet = new Set(resumeSkills.map(s => s.toLowerCase()));
    const jobSkillsSet = new Set(jobSkills.map(s => s.toLowerCase()));
    
    // Find matches
    const matches = [];
    for (const skill of resumeSkillsSet) {
      if (jobSkillsSet.has(skill)) {
        matches.push(skill);
      }
    }
    
    // Find missing skills
    const missing = [];
    for (const skill of jobSkillsSet) {
      if (!resumeSkillsSet.has(skill)) {
        missing.push(skill);
      }
    }
    
    return {
      matches,
      missing,
      matchCount: matches.length,
      missingCount: missing.length,
      matchPercentage: Math.round((matches.length / jobSkillsSet.size) * 100)
    };
  }
};