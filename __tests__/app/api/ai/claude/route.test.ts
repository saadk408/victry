import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ai/claude/route';
import { getAnthropicClient, handleAnthropicError } from '@/lib/ai/anthropic-client';
import { extractToolCalls, executeToolCalls } from '@/lib/ai/claude-tools';

// Mock the anthropic-client module
jest.mock('@/lib/ai/anthropic-client', () => ({
  getAnthropicClient: jest.fn(),
  handleAnthropicError: jest.fn(error => error),
  convertToSDKMessageFormat: jest.fn(messages => messages.map(msg => ({
    role: msg.role,
    content: typeof msg.content === 'string' ? msg.content : msg.content
  })))
}));

// Mock the claude-tools module
jest.mock('@/lib/ai/claude-tools', () => ({
  extractToolCalls: jest.fn(),
  executeToolCalls: jest.fn()
}));

describe('Claude API Route', () => {
  let mockAnthropicClient: {
    messages: {
      create: jest.Mock;
    };
  };

  let mockResponse: {
    id: string;
    model: string;
    content: any;
    role: string;
    stop_reason: string | null;
    stop_sequence: string | null;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Anthropic client
    mockAnthropicClient = {
      messages: {
        create: jest.fn()
      }
    };
    
    (getAnthropicClient as jest.Mock).mockReturnValue(mockAnthropicClient);
    
    // Mock response
    mockResponse = {
      id: 'msg_123',
      model: 'claude-3-7-sonnet-20250219',
      content: [{ type: 'text', text: 'Response from Claude' }],
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: {
        input_tokens: 10,
        output_tokens: 5
      }
    };
    
    mockAnthropicClient.messages.create.mockResolvedValue(mockResponse);
    
    // Mock extractToolCalls to return null by default (no tool calls)
    (extractToolCalls as jest.Mock).mockReturnValue(null);
  });

  it('should handle basic text prompt and return formatted response', async () => {
    // Create mock request
    const request = new NextRequest('http://localhost/api/ai/claude', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Hello Claude',
        maxTokens: 1000,
        temperature: 0.5
      })
    });
    
    // Call the API route
    const response = await POST(request);
    const responseData = await response.json();
    
    // Verify client was called with correct params
    expect(getAnthropicClient).toHaveBeenCalled();
    expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: 'user', content: 'Hello Claude' }],
        max_tokens: 1000,
        temperature: 0.5,
        model: 'claude-3-7-sonnet-20250219'
      })
    );
    
    // Verify response formatting
    expect(responseData).toEqual({
      id: 'msg_123',
      type: 'completion',
      role: 'assistant',
      content: 'Response from Claude',
      model: 'claude-3-7-sonnet-20250219',
      stopReason: 'end_turn',
      stopSequence: null,
      usage: {
        inputTokens: 10,
        outputTokens: 5
      }
    });
  });

  it('should handle messages array format', async () => {
    // Create mock request with messages array
    const request = new NextRequest('http://localhost/api/ai/claude', {
      method: 'POST',
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there' },
          { role: 'user', content: 'How are you?' }
        ],
        maxTokens: 1000
      })
    });
    
    // Call the API route
    await POST(request);
    
    // Verify client was called with messages array
    expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there' },
          { role: 'user', content: 'How are you?' }
        ]
      })
    );
  });

  it('should handle optional parameters when provided', async () => {
    // Create mock request with optional params
    const request = new NextRequest('http://localhost/api/ai/claude', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Hello',
        system: 'You are a helpful assistant',
        stopSequences: ['END'],
        topK: 10,
        topP: 0.9,
        model: 'claude-custom-model'
      })
    });
    
    // Call the API route
    await POST(request);
    
    // Verify client was called with optional params
    expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        system: 'You are a helpful assistant',
        stop_sequences: ['END'],
        top_k: 10,
        top_p: 0.9,
        model: 'claude-custom-model'
      })
    );
  });

  it('should handle tools and execute tool calls when present', async () => {
    // Mock extractToolCalls to return tool calls
    const mockToolCalls = [
      {
        name: 'test_tool',
        arguments: { value: 'test' }
      }
    ];
    
    (extractToolCalls as jest.Mock).mockReturnValue(mockToolCalls);
    
    // Mock executeToolCalls to return results
    const mockToolResults = [
      {
        input: { name: 'test_tool', arguments: { value: 'test' } },
        output: { output: 'Tool result' }
      }
    ];
    
    (executeToolCalls as jest.Mock).mockResolvedValue(mockToolResults);
    
    // Mock response for follow-up call with tool results
    const mockFollowUpResponse = {
      ...mockResponse,
      content: [{ type: 'text', text: 'Response after tool execution' }]
    };
    
    mockAnthropicClient.messages.create
      .mockResolvedValueOnce(mockResponse)  // First call response
      .mockResolvedValueOnce(mockFollowUpResponse);  // Follow-up call response
    
    // Create mock request with tools
    const request = new NextRequest('http://localhost/api/ai/claude', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Use the tool',
        tools: [
          {
            name: 'test_tool',
            description: 'A test tool',
            input_schema: { type: 'object' }
          }
        ],
        toolHandlers: {
          test_tool: (args: any) => 'Tool result'
        }
      })
    });
    
    // Call the API route
    const response = await POST(request);
    const responseData = await response.json();
    
    // Verify tool execution flow
    expect(extractToolCalls).toHaveBeenCalledWith(mockResponse.content);
    expect(executeToolCalls).toHaveBeenCalledWith(mockToolCalls, expect.any(Object));
    
    // Verify follow-up call with tool results
    expect(mockAnthropicClient.messages.create).toHaveBeenCalledTimes(2);
    expect(mockAnthropicClient.messages.create.mock.calls[1][0].messages).toContainEqual({
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_results: [
            {
              tool_call_id: 'test_tool',
              output: 'Tool result'
            }
          ]
        }
      ]
    });
    
    // Verify final response includes tool results
    expect(responseData).toEqual({
      id: mockFollowUpResponse.id,
      type: 'completion',
      role: 'assistant',
      content: 'Response after tool execution',
      model: mockFollowUpResponse.model,
      stopReason: mockFollowUpResponse.stop_reason,
      stopSequence: mockFollowUpResponse.stop_sequence,
      usage: {
        inputTokens: mockFollowUpResponse.usage.input_tokens,
        outputTokens: mockFollowUpResponse.usage.output_tokens,
      },
      toolResults: mockToolResults
    });
  });

  it('should handle errors from Anthropic client', async () => {
    // Mock Anthropic client to throw error
    const mockError = new Error('API error');
    mockAnthropicClient.messages.create.mockRejectedValue(mockError);
    
    // Create mock request
    const request = new NextRequest('http://localhost/api/ai/claude', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Hello'
      })
    });
    
    // Call the API route
    const response = await POST(request);
    const responseData = await response.json();
    
    // Verify error handling
    expect(handleAnthropicError).toHaveBeenCalledWith(mockError);
    expect(response.status).toBe(500);
    expect(responseData).toHaveProperty('error');
  });

  it('should handle rate limit errors with 429 status', async () => {
    // Mock Anthropic client to throw rate limit error
    const mockError = new Error('rate limit exceeded');
    mockAnthropicClient.messages.create.mockRejectedValue(mockError);
    
    // Create mock request
    const request = new NextRequest('http://localhost/api/ai/claude', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Hello'
      })
    });
    
    // Call the API route
    const response = await POST(request);
    
    // Verify rate limit specific status code
    expect(response.status).toBe(429);
  });

  it('should handle authentication errors with 401 status', async () => {
    // Mock Anthropic client to throw authentication error
    const mockError = new Error('authentication failed');
    mockAnthropicClient.messages.create.mockRejectedValue(mockError);
    
    // Create mock request
    const request = new NextRequest('http://localhost/api/ai/claude', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Hello'
      })
    });
    
    // Call the API route
    const response = await POST(request);
    
    // Verify authentication specific status code
    expect(response.status).toBe(401);
  });

  it('should return 400 if neither prompt nor messages is provided', async () => {
    // Create mock request with missing parameters
    const request = new NextRequest('http://localhost/api/ai/claude', {
      method: 'POST',
      body: JSON.stringify({
        temperature: 0.5
      })
    });
    
    // Call the API route
    const response = await POST(request);
    const responseData = await response.json();
    
    // Verify validation error
    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: 'Either prompt or messages is required' });
  });
});