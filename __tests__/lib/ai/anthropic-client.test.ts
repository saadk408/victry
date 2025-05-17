// Mock the import to shims/web which may not exist in test environment
jest.mock('@anthropic-ai/sdk/shims/web', () => {}, { virtual: true });

import { getAnthropicClient, resetAnthropicClient, handleAnthropicError, DEFAULT_CLAUDE_MODEL } from '../../../lib/ai/anthropic-client';
import Anthropic from '@anthropic-ai/sdk';

// Mock the Anthropic SDK constructor
jest.mock('@anthropic-ai/sdk', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      // Mock Anthropic client methods here
    })),
    APIError: class APIError extends Error {
      status: number;
      name: string;
      
      constructor(message: string, status = 400) {
        super(message);
        this.status = status;
        this.name = 'APIError';
      }
    },
    // Mock expected constructors with all parameters to avoid TS errors
    mockAPIErrorWithAllParams: (message: string, status = 400, type = '', requestId = '') => new Error(message)
  };
});

const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Anthropic Client', () => {
  beforeEach(() => {
    // Reset the module state before each test
    resetAnthropicClient();
    jest.clearAllMocks();
  });

  describe('getAnthropicClient', () => {
    it('should create a new client with correct config', () => {
      const client = getAnthropicClient();
      
      // Check if Anthropic constructor was called with correct params
      expect(Anthropic).toHaveBeenCalledWith({
        apiKey: 'test_api_key_for_testing',
        maxRetries: 3,
        timeout: 60000 // 60 seconds
      });
      
      // Client should not be null
      expect(client).toBeTruthy();
    });

    it('should return the same instance on subsequent calls', () => {
      const client1 = getAnthropicClient();
      const client2 = getAnthropicClient();
      
      // Should only initialize once
      expect(Anthropic).toHaveBeenCalledTimes(1);
      
      // Same instance should be returned
      expect(client1).toBe(client2);
    });

    it('should throw error if API key is missing', () => {
      // Temporarily clear the API key
      const originalApiKey = process.env.ANTHROPIC_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;
      
      // Should throw error when API key is missing
      expect(() => getAnthropicClient()).toThrow('ANTHROPIC_API_KEY is not set in environment variables');
      
      // Restore the API key
      process.env.ANTHROPIC_API_KEY = originalApiKey;
    });
  });

  describe('resetAnthropicClient', () => {
    it('should reset the client instance', () => {
      // Initialize client
      getAnthropicClient();
      expect(Anthropic).toHaveBeenCalledTimes(1);
      
      // Reset client
      resetAnthropicClient();
      
      // Get a new client - should call constructor again
      getAnthropicClient();
      expect(Anthropic).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleAnthropicError', () => {
    it('should handle APIError with detailed logging', () => {
      // Create a mock error with basic properties
      const apiError = {
        name: 'APIError',
        message: 'Rate limit exceeded', 
        status: 429
      } as any;
      // Mock properties needed for the test
      (apiError as any).type = 'rate_limit_error';
      (apiError as any).request_id = 'req123';
      const error = handleAnthropicError(apiError);
      
      expect(error.message).toBe('Anthropic API error (429): Rate limit exceeded');
      expect(mockConsoleError).toHaveBeenCalledWith('Anthropic API error (429): Rate limit exceeded', {
        status: 429,
        type: 'rate_limit_error',
        requestId: 'req123'
      });
    });

    it('should handle regular Error', () => {
      const regularError = new Error('Network error');
      const error = handleAnthropicError(regularError);
      
      expect(error).toBe(regularError);
      expect(mockConsoleError).toHaveBeenCalledWith('Anthropic client error:', regularError);
    });

    it('should handle unknown error types', () => {
      const unknownError = 'Something went wrong';
      const error = handleAnthropicError(unknownError);
      
      expect(error.message).toBe('Something went wrong');
      expect(mockConsoleError).toHaveBeenCalledWith('Unknown error with Anthropic client:', unknownError);
    });
  });

  describe('DEFAULT_CLAUDE_MODEL', () => {
    it('should export the correct default model', () => {
      expect(DEFAULT_CLAUDE_MODEL).toBe('claude-3-7-sonnet-20250219');
    });
  });
});