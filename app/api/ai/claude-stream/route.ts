// File: /app/api/ai/claude-stream/route.ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { 
  ClaudeRequestOptions, 
  getAnthropicClient,
  handleAnthropicError,
  convertToSDKMessageFormat,
  DEFAULT_CLAUDE_MODEL
} from "@/lib/ai/claude-client";

// POST /api/ai/claude-stream - Streaming implementation of Claude API
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const {
      prompt,
      messages,
      maxTokens = 1024,
      temperature = 0.7,
      topP = 1,
      topK,
      stopSequences,
      system,
      model = DEFAULT_CLAUDE_MODEL,
      tools,
    } = await request.json() as ClaudeRequestOptions & { prompt?: string };

    // Validate required fields
    if (!prompt && (!messages || messages.length === 0)) {
      return NextResponse.json(
        { error: "Either prompt or messages is required" },
        { status: 400 }
      );
    }

    // Initialize the Anthropic client using the singleton
    const anthropic = getAnthropicClient();

    // Prepare message content
    const messageContent = messages || [{ role: "user", content: prompt! }];
    
    // Convert to SDK-compatible format
    const sdkMessages = convertToSDKMessageFormat(messageContent);

    // Create message parameters
    const messageParams: Anthropic.MessageCreateParams = {
      model,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      stream: true,
      messages: sdkMessages,
    };

    // Add optional parameters if provided
    if (system) {
      messageParams.system = system;
    }

    if (stopSequences && stopSequences.length > 0) {
      messageParams.stop_sequences = stopSequences;
    }

    if (topK) {
      messageParams.top_k = topK;
    }

    // Add tools if provided
    if (tools && tools.length > 0) {
      messageParams.tools = tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.input_schema
      }));
    }

    // Call the Anthropic API with streaming
    let stream: Anthropic.MessageStream;
    try {
      stream = await anthropic.messages.stream(messageParams);
    } catch (error) {
      throw handleAnthropicError(error);
    }

    // Set up the response as a stream
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          // Use the improved streaming helper pattern
          stream.on('text', (text) => {
            // Stream text as it comes in
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          });
          
          // Handle potential errors
          stream.on('error', (error) => {
            console.error("Streaming error:", error);
            controller.error(error);
          });
          
          // Wait for the stream to complete and then close the controller
          await stream.finalMessage();
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    // Return the stream as a response
    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache, no-transform'
      },
    });
  } catch (error) {
    console.error("Error in Claude streaming API:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("rate limit") ? 429 : 
                     errorMessage.includes("authentication") ? 401 : 500;
                     
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}