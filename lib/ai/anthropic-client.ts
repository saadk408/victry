// File: /lib/ai/anthropic-client.ts
// Singleton Anthropic client for shared use across the application

import '@anthropic-ai/sdk/shims/web';
import Anthropic from '@anthropic-ai/sdk';

// Export a module with all the necessary functions
export { getAnthropicClient, handleAnthropicError, resetAnthropicClient, DEFAULT_CLAUDE_MODEL };

// Singleton instance with lazy initialization
let anthropicClient: Anthropic | null = null;

/**
 * Get the singleton Anthropic client instance
 * Creates a new instance if one doesn't exist
 */
function getAnthropicClient(): Anthropic {
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
function resetAnthropicClient(): void {
  anthropicClient = null;
}

/**
 * Default Claude model to use if not specified
 */
const DEFAULT_CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';

/**
 * Helper function to properly handle errors from the Anthropic SDK
 */
function handleAnthropicError(error: unknown): Error {
  if (error instanceof Anthropic.APIError) {
    // Handle specific API errors with useful information
    const message = `Anthropic API error (${error.status}): ${error.message}`;
    // Prepare error details object with known properties
    const errorDetails: Record<string, any> = { status: error.status };
    
    // Add additional properties if they exist on the error object
    // Use type assertion since APIError type definition might be incomplete
    const apiError = error as any;
    if (apiError.type) errorDetails.type = apiError.type;
    if (apiError.request_id) errorDetails.requestId = apiError.request_id;
    
    console.error(message, errorDetails);
    return new Error(message);
  } else if (error instanceof Error) {
    console.error('Anthropic client error:', error);
    return error;
  } else {
    console.error('Unknown error with Anthropic client:', error);
    return new Error(String(error));
  }
}