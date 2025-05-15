// Mock environment variables
process.env.ANTHROPIC_API_KEY = 'test_api_key_for_testing';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock ReadableStream and TextEncoder for streaming tests
global.ReadableStream = class MockReadableStream {
  constructor(options) {
    if (options && options.start) {
      const controller = {
        enqueue: jest.fn(),
        close: jest.fn(),
        error: jest.fn()
      };
      options.start(controller);
    }

    this.getReader = jest.fn();
  }
};

global.TextEncoder = class MockTextEncoder {
  encode(text) {
    return Buffer.from(text);
  }
};

// Mock Request and Response for Next.js API routes
global.Request = class MockRequest {};
global.Response = class MockResponse {};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});