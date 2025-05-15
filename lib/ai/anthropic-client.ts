// File: /lib/ai/anthropic-client.ts
// Singleton Anthropic client for shared use across the application

import '@anthropic-ai/sdk/shims/web';
import Anthropic from '@anthropic-ai/sdk';

// Singleton instance with lazy initialization
let anthropicClient: Anthropic | null = null;

/**
 * Get the singleton Anthropic client instance
 * Creates a new instance if one doesn't exist
 */
export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }
    
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxRetries: 3,
      timeout: 60 * 1000, // 60 seconds timeout
    });
  }
  
  return anthropicClient;
}

/**
 * Reset the Anthropic client instance
 * Useful for testing or when configuration changes
 */
export function resetAnthropicClient(): void {
  anthropicClient = null;
}

/**
 * Default Claude model to use if not specified
 */
export const DEFAULT_CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';

/**
 * Helper function to properly handle errors from the Anthropic SDK
 */
export function handleAnthropicError(error: unknown): Error {
  if (error instanceof Anthropic.APIError) {
    // Handle specific API errors with useful information
    const message = `Anthropic API error (${error.status}): ${error.message}`;
    console.error(message, { 
      status: error.status, 
      type: error.type,
      requestId: error.requestId 
    });
    return new Error(message);
  } else if (error instanceof Error) {
    console.error('Anthropic client error:', error);
    return error;
  } else {
    console.error('Unknown error with Anthropic client:', error);
    return new Error(String(error));
  }
}