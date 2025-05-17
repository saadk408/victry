import {
  generateCompletion,
  generateCompletionDirect,
  analyzeText,
  streamCompletion,
  convertToSDKMessageFormat,
  ClaudeMessage
} from '../../../lib/ai/claude-client';
import { getAnthropicClient, handleAnthropicError } from '../../../lib/ai/anthropic-client';

// Mock the anthropic-client module
jest.mock('../../../lib/ai/anthropic-client', () => ({
  getAnthropicClient: jest.fn(),
  handleAnthropicError: jest.fn(error => error),
  DEFAULT_CLAUDE_MODEL: 'claude-3-7-sonnet-20250219'
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Claude Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('convertToSDKMessageFormat', () => {
    it('should handle string content correctly', () => {
      const messages: ClaudeMessage[] = [
        { role: 'user', content: 'Hello Claude' }
      ];
      
      const converted = convertToSDKMessageFormat(messages);
      
      expect(converted).toEqual([
        { role: 'user', content: 'Hello Claude' }
      ]);
    });

    it('should handle text content blocks', () => {
      const messages: ClaudeMessage[] = [
        { 
          role: 'user', 
          content: [{ type: 'text', text: 'Hello Claude' }] 
        }
      ];
      
      const converted = convertToSDKMessageFormat(messages);
      
      expect(converted).toEqual([
        { 
          role: 'user', 
          content: [{ type: 'text', text: 'Hello Claude' }] 
        }
      ]);
    });

    it('should handle image content blocks', () => {
      const messages: ClaudeMessage[] = [
        { 
          role: 'user', 
          content: [
            { 
              type: 'image', 
              source: { 
                type: 'base64', 
                media_type: 'image/jpeg', 
                data: 'base64data' 
              } 
            }
          ] 
        }
      ];
      
      const converted = convertToSDKMessageFormat(messages);
      
      expect(converted).toEqual([
        { 
          role: 'user', 
          content: [
            { 
              type: 'image', 
              source: { 
                type: 'base64', 
                media_type: 'image/jpeg', 
                data: 'base64data' 
              } 
            }
          ] 
        }
      ]);
    });

    it('should throw error for unsupported image source types', () => {
      const messages: ClaudeMessage[] = [
        { 
          role: 'user', 
          content: [
            { 
              type: 'image',
              // Missing source property
            } as any
          ] 
        }
      ];
      
      expect(() => convertToSDKMessageFormat(messages)).toThrow('Unsupported image source type');
    });

    it('should handle mixed content types', () => {
      const messages: ClaudeMessage[] = [
        { 
          role: 'user', 
          content: [
            { type: 'text', text: 'Hello Claude' },
            { 
              type: 'image', 
              source: { 
                type: 'base64', 
                media_type: 'image/jpeg', 
                data: 'base64data' 
              } 
            }
          ] 
        }
      ];
      
      const converted = convertToSDKMessageFormat(messages);
      
      expect(converted).toEqual([
        { 
          role: 'user', 
          content: [
            { type: 'text', text: 'Hello Claude' },
            { 
              type: 'image', 
              source: { 
                type: 'base64', 
                media_type: 'image/jpeg', 
                data: 'base64data' 
              } 
            }
          ] 
        }
      ]);
    });

    it('should handle unknown content types by converting to string', () => {
      const messages: ClaudeMessage[] = [
        { 
          role: 'user', 
          content: [
            { type: 'unknown' as any, data: { key: 'value' } } as any
          ] 
        }
      ];
      
      const converted = convertToSDKMessageFormat(messages);
      
      expect(converted[0].role).toBe('user');
      // The type check should be done on the content block, not directly on the string
      expect((converted[0].content[0] as { type: string }).type).toBe('text');
      expect(typeof (converted[0].content[0] as { text: string }).text).toBe('string');
    });
  });

  describe('generateCompletion', () => {
    beforeEach(() => {
      // Setup mock for fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 'msg_123',
          type: 'completion',
          role: 'assistant',
          content: 'Hello, I am Claude',
          model: 'claude-3-7-sonnet-20250219',
          stopReason: 'end_turn',
          stopSequence: null,
          usage: {
            inputTokens: 10,
            outputTokens: 5
          }
        })
      });
    });

    it('should call the API with correct parameters for string prompt', async () => {
      const response = await generateCompletion('Hello Claude', {
        temperature: 0.5,
        maxTokens: 500
      });
      
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.stringContaining('"messages":[{"role":"user","content":"Hello Claude"}]')
      });
      
      expect(response).toEqual({
        id: 'msg_123',
        type: 'completion',
        role: 'assistant',
        content: 'Hello, I am Claude',
        model: 'claude-3-7-sonnet-20250219',
        stopReason: 'end_turn',
        stopSequence: null,
        usage: {
          inputTokens: 10,
          outputTokens: 5
        }
      });
    });

    it('should call the API with correct parameters for message array', async () => {
      const messages: ClaudeMessage[] = [
        { role: 'user', content: 'Hello Claude' }
      ];
      
      await generateCompletion(messages, {
        temperature: 0.5,
        maxTokens: 500
      });
      
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.stringContaining('"messages":[{"role":"user","content":"Hello Claude"}]')
      });
    });

    it('should handle API errors correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: jest.fn().mockResolvedValue({
          message: 'Rate limit exceeded'
        })
      });
      
      await expect(generateCompletion('Hello')).rejects.toThrow('Claude API error: 429 - Rate limit exceeded');
    });

    it('should retry on network errors', async () => {
      // Clear previous mocks
      (global.fetch as jest.Mock).mockReset();

      // First call fails with network error, second succeeds
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            id: 'msg_123',
            content: 'Hello',
            role: 'assistant'
          })
        });

      const response = await generateCompletion('Hello');

      // It should have called fetch exactly twice
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(response.content).toBe('Hello');
    });
  });

  describe('generateCompletionDirect', () => {
    const mockAnthropicClient = {
      messages: {
        create: jest.fn()
      }
    };

    beforeEach(() => {
      (getAnthropicClient as jest.Mock).mockReturnValue(mockAnthropicClient);
      mockAnthropicClient.messages.create.mockResolvedValue({
        id: 'msg_123',
        model: 'claude-3-7-sonnet-20250219',
        content: [{ type: 'text', text: 'Hello from Claude' }],
        role: 'assistant',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 10,
          output_tokens: 5
        }
      });
    });

    it('should call Anthropic SDK directly with string prompt', async () => {
      await generateCompletionDirect('Hello Claude', {
        temperature: 0.5,
        maxTokens: 500
      });
      
      expect(getAnthropicClient).toHaveBeenCalled();
      expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: 'Hello Claude' }],
          temperature: 0.5,
          max_tokens: 500
        })
      );
    });

    it('should call Anthropic SDK directly with message array', async () => {
      const messages: ClaudeMessage[] = [
        { role: 'user', content: 'Hello Claude' }
      ];
      
      await generateCompletionDirect(messages, {
        temperature: 0.5,
        maxTokens: 500
      });
      
      expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: 'Hello Claude' }],
          temperature: 0.5,
          max_tokens: 500
        })
      );
    });

    it('should include optional parameters when provided', async () => {
      await generateCompletionDirect('Hello', {
        system: 'You are a helpful assistant',
        stopSequences: ['END'],
        topK: 10,
        tools: [
          {
            name: 'test_tool',
            description: 'A test tool',
            input_schema: { type: 'object' }
          }
        ]
      });
      
      expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          system: 'You are a helpful assistant',
          stop_sequences: ['END'],
          top_k: 10,
          tools: [
            {
              name: 'test_tool',
              description: 'A test tool',
              input_schema: { type: 'object' }
            }
          ]
        })
      );
    });

    it('should handle errors via handleAnthropicError', async () => {
      const testError = new Error('Test error');
      mockAnthropicClient.messages.create.mockRejectedValue(testError);
      
      await expect(generateCompletionDirect('Hello')).rejects.toThrow();
      expect(handleAnthropicError).toHaveBeenCalledWith(testError);
    });
  });

  describe('analyzeText', () => {
    it('should call generateCompletion with system prompt', async () => {
      // Mock fetch for this test
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 'msg_123',
          content: 'Analysis',
          role: 'assistant'
        })
      });

      // Call analyzeText
      await analyzeText('Text to analyze', 'Analyze this text', { temperature: 0.2 });

      // Verify fetch was called with the right params
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.stringContaining('"system":"Analyze this text"')
      });
    });
  });

  describe('streamCompletion', () => {
    beforeEach(() => {
      // Setup mock for fetch with a readable stream response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('Streamed response'));
            controller.close();
          }
        })
      });
    });

    it('should call the streaming API endpoint with correct parameters', async () => {
      const stream = await streamCompletion('Hello Claude', {
        temperature: 0.5,
        maxTokens: 500
      });
      
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/claude-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.stringContaining('"messages":[{"role":"user","content":"Hello Claude"}]')
      });
      
      expect(stream).toBeInstanceOf(ReadableStream);
    });

    it('should handle API errors correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: jest.fn().mockResolvedValue({
          message: 'Rate limit exceeded'
        })
      });
      
      await expect(streamCompletion('Hello')).rejects.toThrow('Claude API error: 429 - Rate limit exceeded');
    });
  });
});