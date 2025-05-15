# Context7 Integration Guide

Context7 provides up-to-date documentation for LLMs (Large Language Models) and AI code editors. It helps AI assistants access the most recent documentation for libraries and frameworks, ensuring more accurate and up-to-date code generation.

## How to Use Context7

When interacting with AI assistants like Claude in Cursor, you can trigger Context7 by adding the phrase `use context7` to your prompts.

### Examples:

```
Create a basic Next.js page with a counter component. use context7
```

```
How do I implement a REST API endpoint in Next.js? use context7
```

```
Show me how to use the Supabase client in a Next.js app. use context7
```

## Supported Libraries

Context7 provides documentation for many popular libraries, including:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Many other popular libraries and frameworks

## How It Works

1. When you include `use context7` in your prompt, the MCP (Model Context Protocol) server intercepts the request
2. Context7 identifies relevant library documentation based on your query
3. It retrieves up-to-date documentation from the official sources
4. The AI assistant receives this documentation as part of its context for generating a response
5. This results in more accurate, current, and useful code generation

## Troubleshooting

If Context7 doesn't seem to be working:

1. Ensure Cursor is restarted after adding Context7 to your configuration
2. Check the `.cursor/mcp.json` file to make sure the configuration is correct
3. Try using a more specific prompt that clearly mentions the library you need help with
4. Ensure you include the phrase `use context7` in your prompt

## Benefits

- Get accurate, up-to-date code examples
- Reduce errors from outdated library information
- Access documentation for new features that may not be in the AI's training data
- Improve development efficiency with more accurate code generation 