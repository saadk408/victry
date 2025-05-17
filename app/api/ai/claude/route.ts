// File: /app/api/ai/claude/route.ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { 
  ClaudeMessage, 
  ClaudeRequestOptions, 
  ClaudeTool,
  getAnthropicClient,
  handleAnthropicError,
  convertToSDKMessageFormat 
} from "../../../../lib/ai/claude-client";
import { extractToolCalls, executeToolCalls, ToolHandlers } from "../../../../lib/ai/claude-tools";

// POST /api/ai/claude - Modern Messages API implementation of Claude
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const requestData = await request.json();
    const {
      prompt,
      messages,
      maxTokens = 1024,
      temperature = 0.7,
      topP = 1,
      topK,
      stopSequences,
      system,
      model = "claude-3-7-sonnet-20250219",
      tools,
      toolHandlers,
    } = requestData as ClaudeRequestOptions & {
      prompt?: string;
      toolHandlers?: Record<string, any>;
    };

    // Validate required fields - either prompt or messages must be provided
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
    
    // Convert to SDK-compatible message format
    const sdkMessages = convertToSDKMessageFormat(messageContent);
    
    // Create message parameters with optional fields included when provided
    const messageParams: Anthropic.MessageCreateParams = {
      model,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
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
      // Use type assertion to avoid TypeScript errors with input_schema.type
      messageParams.tools = tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.input_schema
      } as any));
    }

    // Call the Anthropic API
    let response: Anthropic.Message;
    try {
      response = await anthropic.messages.create(messageParams);
    } catch (error) {
      throw handleAnthropicError(error);
    }

    // Check if the response contains tool calls
    const responseContent = response.content;
    const toolCalls = extractToolCalls(responseContent);

    // Execute tool calls if present and handlers are provided
    if (toolCalls && toolHandlers) {
      const toolResults = await executeToolCalls(toolCalls, toolHandlers as ToolHandlers);

      // Create tool results content block for the follow-up request
      const toolResultsContent: any = {
        type: 'tool_result',
        tool_results: toolResults.map(result => ({
          tool_call_id: result.input.name,
          output: result.output?.output
        }))
      };

      // Create a new request with tool call results
      const newMessages: Anthropic.MessageParam[] = [
        ...sdkMessages,
        {
          role: "assistant",
          content: responseContent,
        },
        {
          role: "user",
          content: [toolResultsContent]
        }
      ];

      // Make a follow-up request to Claude with tool results
      let followUpResponse: Anthropic.Message;
      try {
        followUpResponse = await anthropic.messages.create({
          ...messageParams,
          messages: newMessages,
        });
      } catch (error) {
        throw handleAnthropicError(error);
      }

      // Transform the response to match our expected format
      const transformedResponse = {
        id: followUpResponse.id,
        type: "completion",
        role: "assistant",
        content: extractContentText(followUpResponse.content),
        model: followUpResponse.model,
        stopReason: followUpResponse.stop_reason || null,
        stopSequence: followUpResponse.stop_sequence || null,
        usage: {
          inputTokens: followUpResponse.usage.input_tokens,
          outputTokens: followUpResponse.usage.output_tokens,
        },
        toolResults: toolResults,
      };

      return NextResponse.json(transformedResponse);
    }

    // Transform the response to match our expected format (no tool calls)
    const transformedResponse = {
      id: response.id,
      type: "completion",
      role: "assistant",
      content: extractContentText(response.content),
      model: response.model,
      stopReason: response.stop_reason || null,
      stopSequence: response.stop_sequence || null,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };

    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error("Error in Claude API:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("rate limit") ? 429 :
                     errorMessage.includes("authentication") ? 401 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * Extract text content from Claude's response content blocks
 * Handles both string and array formats
 */
function extractContentText(content: Anthropic.ContentBlock[] | string): string {
  if (typeof content === 'string') {
    return content;
  }
  
  // If it's an array of content blocks, extract text from all text blocks
  let result = '';
  for (const block of content) {
    if (block.type === 'text') {
      result += block.text;
    }
  }
  
  return result;
}