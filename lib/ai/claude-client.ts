// File: /lib/ai/claude-client.ts
// Client for interacting with Claude API using the Messages API format

import Anthropic from '@anthropic-ai/sdk';
import { getAnthropicClient, DEFAULT_CLAUDE_MODEL, handleAnthropicError } from './anthropic-client';

/**
 * Response structure from Claude API
 * Based on Anthropic Claude API Messages response format
 */
export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: string | AnthropicContentBlock[];
  model: string;
  stopReason: string | null;
  stopSequence: string | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  toolResults?: ToolCallResult[];
}

/**
 * Content block for Claude API
 * Supports both string and structured content formats
 */
export interface AnthropicContentBlock {
  type: "text" | "image" | "tool_use" | "tool_result";
  text?: string;
  source?: {
    type: "base64";
    media_type: string;
    data: string;
  };
  id?: string;
  input?: Record<string, any>;
  tool_results?: {
    tool_call_id: string;
    output: any;
  }[];
}

/**
 * Legacy content block type (kept for backward compatibility)
 */
export interface ContentBlock {
  type: "text" | "image";
  text?: string;
  source?: {
    type: "base64";
    media_type: string;
    data: string;
  };
}

/**
 * Message format for Claude API
 * Can have different roles and content blocks
 */
export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[] | AnthropicContentBlock[] | Anthropic.Content[];
}

/**
 * Options for Claude API requests
 */
export interface ClaudeRequestOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  system?: string;
  model?: string;
  stream?: boolean;
  messages?: ClaudeMessage[];
  tools?: ClaudeTool[];
  toolHandlers?: ToolHandlers;
}

/**
 * Tool for Claude API
 * Represents a tool that Claude can use
 */
export interface ClaudeTool {
  name: string;
  description?: string;
  input_schema: Record<string, any>;
}

/**
 * Tool call result
 */
export interface ToolCallResult {
  input: {
    name: string;
    arguments: Record<string, any>;
  };
  output?: {
    output: any;
    error?: string;
  };
}

/**
 * Handler for tool calls
 */
export type ToolHandler = (args: Record<string, any>) => Promise<any> | any;

/**
 * Map of tool names to handlers
 */
export interface ToolHandlers {
  [name: string]: ToolHandler;
}

/**
 * Error returned from Claude API
 */
export interface ClaudeError {
  status: number;
  message: string;
  type: string;
}

// Default Claude API options
const DEFAULT_OPTIONS: ClaudeRequestOptions = {
  maxTokens: 1024,
  temperature: 0.7,
  model: DEFAULT_CLAUDE_MODEL,
  topP: 1,
};

/**
 * Maximum retry attempts for API calls
 */
const MAX_RETRIES = 3;

/**
 * Format a prompt for the Messages API
 * Converts a string prompt to a message array, preserving system prompt if provided
 */
function formatPromptAsMessages(
  prompt: string,
  system?: string
): Pick<ClaudeRequestOptions, "messages" | "system"> {
  const result: Pick<ClaudeRequestOptions, "messages" | "system"> = {
    messages: [{ role: "user", content: prompt }]
  };

  if (system) {
    result.system = system;
  }

  return result;
}

/**
 * Convert legacy message format to SDK format
 * This ensures compatibility with the new SDK while preserving old behavior
 */
export function convertToSDKMessageFormat(
  messages: ClaudeMessage[]
): Anthropic.MessageParam[] {
  return messages.map(message => {
    // If content is a string, it's already in the right format
    if (typeof message.content === 'string') {
      return {
        role: message.role,
        content: message.content
      };
    }

    // If content is an array, convert to SDK format
    const sdkContent: Anthropic.Content[] = message.content.map(block => {
      if (block.type === 'text') {
        return { type: 'text', text: block.text || '' };
      } else if (block.type === 'image') {
        if (!block.source || block.source.type !== 'base64') {
          throw new Error('Unsupported image source type');
        }
        return {
          type: 'image',
          source: {
            type: 'base64',
            media_type: block.source.media_type,
            data: block.source.data
          }
        };
      } else if (block.type === 'tool_result') {
        return block as unknown as Anthropic.Content;
      } else {
        // Default to text if type is unknown
        return { type: 'text', text: JSON.stringify(block) };
      }
    });

    return {
      role: message.role,
      content: sdkContent
    };
  });
}

/**
 * Generate a completion using the Claude API.
 * This function calls our internal API endpoint which handles the actual Claude API call.
 *
 * @param prompt - The prompt to send to Claude (string or messages array)
 * @param options - Additional options for the request
 * @returns Promise resolving to the Claude API response
 */
export async function generateCompletion(
  prompt: string | ClaudeMessage[],
  options: ClaudeRequestOptions = {},
): Promise<ClaudeResponse> {
  // Merge default options with user-provided options
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Handle string prompt vs message array
  const messageParams = typeof prompt === "string"
    ? formatPromptAsMessages(prompt, mergedOptions.system)
    : { messages: prompt, system: mergedOptions.system };

  // Retry mechanism with exponential backoff
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Calculate backoff time if not the first attempt
      if (attempt > 0) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 8000);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }

      const response = await fetch("/api/ai/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...messageParams,
          maxTokens: mergedOptions.maxTokens,
          temperature: mergedOptions.temperature,
          topP: mergedOptions.topP,
          topK: mergedOptions.topK,
          stopSequences: mergedOptions.stopSequences,
          model: mergedOptions.model,
          stream: mergedOptions.stream || false,
          tools: mergedOptions.tools,
          toolHandlers: mergedOptions.toolHandlers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Claude API error: ${response.status} - ${
            errorData.message || response.statusText
          }`,
        );
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Claude API error (attempt ${attempt + 1}/${MAX_RETRIES}):`,
        lastError,
      );

      // Only retry on server or network errors, not on client errors
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        continue;
      }

      // If it's a rate limit error (429), retry after backoff
      if (error instanceof Error && error.message.includes("429")) {
        continue;
      }

      // For other errors, throw immediately rather than retrying
      throw lastError;
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError;
}

/**
 * Generate a completion using the Claude API directly.
 * This function bypasses the API route and calls the Anthropic API directly.
 * 
 * @param prompt - The prompt to send to Claude (string or messages array)
 * @param options - Additional options for the request
 */
export async function generateCompletionDirect(
  prompt: string | ClaudeMessage[],
  options: ClaudeRequestOptions = {}
): Promise<Anthropic.Message> {
  const anthropic = getAnthropicClient();
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Convert messages to SDK format
  let messages: Anthropic.MessageParam[];
  if (typeof prompt === 'string') {
    messages = [{ role: 'user', content: prompt }];
  } else {
    messages = convertToSDKMessageFormat(prompt);
  }
  
  try {
    const messageParams: Anthropic.MessageCreateParams = {
      model: mergedOptions.model || DEFAULT_CLAUDE_MODEL,
      max_tokens: mergedOptions.maxTokens,
      messages,
      temperature: mergedOptions.temperature,
      top_p: mergedOptions.topP,
    };
    
    // Add optional parameters
    if (mergedOptions.system) {
      messageParams.system = mergedOptions.system;
    }
    
    if (mergedOptions.stopSequences && mergedOptions.stopSequences.length > 0) {
      messageParams.stop_sequences = mergedOptions.stopSequences;
    }
    
    if (mergedOptions.topK) {
      messageParams.top_k = mergedOptions.topK;
    }
    
    // Add tools if provided
    if (mergedOptions.tools && mergedOptions.tools.length > 0) {
      messageParams.tools = mergedOptions.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.input_schema
      }));
    }
    
    return await anthropic.messages.create(messageParams);
  } catch (error) {
    throw handleAnthropicError(error);
  }
}

/**
 * Generate a structured response from Claude by analyzing text using a specific prompt template
 *
 * @param text - The text to analyze
 * @param systemPrompt - System prompt to guide Claude's response
 * @param options - Additional options for the request
 * @returns Promise resolving to the Claude API response
 */
export async function analyzeText(
  text: string,
  systemPrompt: string,
  options: ClaudeRequestOptions = {},
): Promise<ClaudeResponse> {
  return generateCompletion(text, {
    ...options,
    system: systemPrompt,
  });
}

/**
 * Stream a completion from Claude API
 * Note: This requires server-side implementation for proper streaming
 *
 * @param prompt - The prompt to send to Claude (string or messages array)
 * @param options - Additional options for the request
 * @returns Promise resolving to a ReadableStream of completion chunks
 */
export async function streamCompletion(
  prompt: string | ClaudeMessage[],
  options: ClaudeRequestOptions = {},
): Promise<ReadableStream> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options, stream: true };

  // Handle string prompt vs message array
  const messageParams = typeof prompt === "string"
    ? formatPromptAsMessages(prompt, mergedOptions.system)
    : { messages: prompt, system: mergedOptions.system };

  const response = await fetch("/api/ai/claude-stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...messageParams,
      maxTokens: mergedOptions.maxTokens,
      temperature: mergedOptions.temperature,
      topP: mergedOptions.topP,
      topK: mergedOptions.topK,
      stopSequences: mergedOptions.stopSequences,
      model: mergedOptions.model,
      tools: mergedOptions.tools,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Claude API error: ${response.status} - ${
        errorData.message || response.statusText
      }`,
    );
  }

  return response.body as ReadableStream;
}

/**
 * Stream a completion directly from Claude API
 * This function bypasses the API route and calls the Anthropic API directly.
 * 
 * @param prompt - The prompt to send to Claude
 * @param options - Additional options for the request
 */
export async function streamCompletionDirect(
  prompt: string | ClaudeMessage[],
  options: ClaudeRequestOptions = {}
): Promise<Anthropic.MessageStream> {
  const anthropic = getAnthropicClient();
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options, stream: true };
  
  // Convert messages to SDK format
  let messages: Anthropic.MessageParam[];
  if (typeof prompt === 'string') {
    messages = [{ role: 'user', content: prompt }];
  } else {
    messages = convertToSDKMessageFormat(prompt);
  }
  
  try {
    const messageParams: Anthropic.MessageCreateParams = {
      model: mergedOptions.model || DEFAULT_CLAUDE_MODEL,
      max_tokens: mergedOptions.maxTokens,
      messages,
      temperature: mergedOptions.temperature,
      top_p: mergedOptions.topP,
      stream: true
    };
    
    // Add optional parameters
    if (mergedOptions.system) {
      messageParams.system = mergedOptions.system;
    }
    
    if (mergedOptions.stopSequences && mergedOptions.stopSequences.length > 0) {
      messageParams.stop_sequences = mergedOptions.stopSequences;
    }
    
    if (mergedOptions.topK) {
      messageParams.top_k = mergedOptions.topK;
    }
    
    // Add tools if provided
    if (mergedOptions.tools && mergedOptions.tools.length > 0) {
      messageParams.tools = mergedOptions.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.input_schema
      }));
    }
    
    return await anthropic.messages.stream(messageParams);
  } catch (error) {
    throw handleAnthropicError(error);
  }
}