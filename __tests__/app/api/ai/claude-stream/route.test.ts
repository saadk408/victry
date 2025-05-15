import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ai/claude-stream/route';
import { getAnthropicClient, handleAnthropicError } from '@/lib/ai/anthropic-client';

// Mock the anthropic-client module
jest.mock('@/lib/ai/anthropic-client', () => ({
  getAnthropicClient: jest.fn(),
  handleAnthropicError: jest.fn(error => error),
  convertToSDKMessageFormat: jest.fn(messages => messages.map(msg => ({
    role: msg.role,
    content: typeof msg.content === 'string' ? msg.content : msg.content
  })))
}));

// Mock the Readable Stream API
const mockStream = {
  on: jest.fn(),
  once: jest.fn(),
  controller: null as any,
  abortController: null as any
};

// Mock Anthropic MessageStream
const mockMessageStream = {
  on: jest.fn().mockImplementation((event, handler) => {
    mockStream.on.mockImplementation((mockEvent, mockHandler) => {
      if (mockEvent === event) {
        handler(mockEvent === 'text' ? 'Streamed response' : mockEvent);
      }
      return mockMessageStream;
    });
    return mockMessageStream;
  }),
  
  once: jest.fn().mockImplementation((event, handler) => {
    mockStream.once.mockImplementation((mockEvent, mockHandler) => {
      if (mockEvent === event) {
        handler();
      }
      return mockMessageStream;
    });
    return mockMessageStream;
  }),
  
  abort: jest.fn()
};

describe('Claude Stream API Route', () => {
  let mockAnthropicClient: {
    messages: {
      stream: jest.Mock;
    };
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Anthropic client
    mockAnthropicClient = {
      messages: {
        stream: jest.fn().mockResolvedValue(mockMessageStream)
      }
    };
    
    (getAnthropicClient as jest.Mock).mockReturnValue(mockAnthropicClient);
    
    // Mock ReadableStream
    global.ReadableStream = jest.fn().mockImplementation(({start}) => {
      mockStream.controller = { enqueue: jest.fn(), close: jest.fn(), error: jest.fn() };
      mockStream.abortController = { abort: jest.fn() };
      if (start) start(mockStream.controller);
      return {
        [Symbol.asyncIterator]: jest.fn(),
        getReader: jest.fn()
      };
    });
    
    global.TextEncoder = jest.fn().mockImplementation(() => ({
      encode: jest.fn(text => Buffer.from(text))
    }));
    
    // Setup default stream event handlers
    mockMessageStream.on.mockReturnValue(mockMessageStream);
    mockMessageStream.once.mockReturnValue(mockMessageStream);
  });

  it('should create a streaming response with the correct headers', async () => {
    // Create mock request
    const request = new NextRequest('http://localhost/api/ai/claude-stream', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Hello Claude',
        maxTokens: 1000,
        temperature: 0.5
      })
    });
    
    // Call the API route
    const response = await POST(request);
    
    // Verify response headers
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Connection')).toBe('keep-alive');
  });

  it('should call Anthropic stream API with correct parameters', async () => {
    // Create mock request
    const request = new NextRequest('http://localhost/api/ai/claude-stream', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Hello Claude',
        maxTokens: 1000,
        temperature: 0.5,
        model: 'claude-3-7-sonnet-20250219'
      })
    });
    
    // Call the API route
    await POST(request);
    
    // Verify Anthropic client was called with correct params
    expect(getAnthropicClient).toHaveBeenCalled();
    expect(mockAnthropicClient.messages.stream).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: 'user', content: 'Hello Claude' }],
        max_tokens: 1000,
        temperature: 0.5,
        model: 'claude-3-7-sonnet-20250219',
        stream: true
      })
    );
  });

  it('should handle messages array format', async () => {
    // Create mock request with messages array
    const request = new NextRequest('http://localhost/api/ai/claude-stream', {
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
    expect(mockAnthropicClient.messages.stream).toHaveBeenCalledWith(
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
    const request = new NextRequest('http://localhost/api/ai/claude-stream', {
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
    expect(mockAnthropicClient.messages.stream).toHaveBeenCalledWith(
      expect.objectContaining({
        system: 'You are a helpful assistant',
        stop_sequences: ['END'],
        top_k: 10,
        top_p: 0.9,
        model: 'claude-custom-model'
      })
    );
  });

  it('should stream text chunks to the client', async () => {
    // Create mock request
    const request = new NextRequest('http://localhost/api/ai/claude-stream', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Hello Claude'
      })
    });
    
    // Call the API route
    await POST(request);
    
    // Simulate stream event handlers
    const textHandler = mockMessageStream.on.mock.calls.find(call => call[0] === 'text')[1];
    
    // Manually trigger text event
    textHandler('Chunk 1');
    textHandler('Chunk 2');
    
    // Verify chunks were enqueued
    expect(mockStream.controller.enqueue).toHaveBeenCalledTimes(2);
  });

  it('should handle end of stream correctly', async () => {
    // Create mock request
    const request = new NextRequest('http://localhost/api/ai/claude-stream', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Hello Claude'
      })
    });
    
    // Call the API route
    await POST(request);
    
    // Manually trigger end event
    const endHandler = mockMessageStream.once.mock.calls.find(call => call[0] === 'end')[1];
    endHandler();
    
    // Verify stream was closed
    expect(mockStream.controller.close).toHaveBeenCalled();
  });

  it('should handle errors during streaming', async () => {
    // Create mock request
    const request = new NextRequest('http://localhost/api/ai/claude-stream', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Hello Claude'
      })
    });
    
    // Call the API route
    await POST(request);
    
    // Manually trigger error event
    const errorHandler = mockMessageStream.on.mock.calls.find(call => call[0] === 'error')[1];
    errorHandler(new Error('Stream error'));
    
    // Verify error was passed to controller
    expect(mockStream.controller.error).toHaveBeenCalled();
  });

  it('should handle client disconnection by aborting the stream', async () => {
    // Create mock request
    const request = new NextRequest('http://localhost/api/ai/claude-stream', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Hello Claude'
      }),
      signal: {
        aborted: false,
        addEventListener: jest.fn().mockImplementation((event, handler) => {
          if (event === 'abort') {
            setTimeout(() => {
              handler();
            }, 10);
          }
        }),
        removeEventListener: jest.fn(),
        onabort: null,
        reason: undefined,
        throwIfAborted: jest.fn()
      } as unknown as AbortSignal
    });
    
    // Call the API route
    await POST(request);
    
    // Wait for abort handler to be called
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // Verify stream was aborted
    expect(mockMessageStream.abort).toHaveBeenCalled();
  });

  it('should handle errors from Anthropic client', async () => {
    // Mock Anthropic client to throw error
    const mockError = new Error('API error');
    mockAnthropicClient.messages.stream.mockRejectedValue(mockError);
    
    // Create mock request
    const request = new NextRequest('http://localhost/api/ai/claude-stream', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Hello'
      })
    });
    
    // Call the API route
    const response = await POST(request);
    
    // Verify error handling
    expect(handleAnthropicError).toHaveBeenCalledWith(mockError);
    expect(response.status).toBe(500);
  });

  it('should return 400 if neither prompt nor messages is provided', async () => {
    // Create mock request with missing parameters
    const request = new NextRequest('http://localhost/api/ai/claude-stream', {
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