import {
  createTool,
  convertToSDKTool,
  extractToolCalls,
  executeToolCalls,
  formatSDKToolResults,
  keywordExtractionTool,
  atsScoreTool,
  skillMatchingTool,
  defaultToolHandlers
} from '@/lib/ai/claude-tools';
import { ClaudeTool } from '@/lib/ai/claude-client';

describe('Claude Tools', () => {
  describe('createTool', () => {
    it('should create a tool with the correct structure', () => {
      const tool = createTool(
        'test_tool',
        'A test tool',
        { 
          type: 'object',
          properties: {
            text: { type: 'string' }
          }
        }
      );
      
      expect(tool).toEqual({
        name: 'test_tool',
        description: 'A test tool',
        input_schema: {
          type: 'object',
          properties: {
            text: { type: 'string' }
          }
        }
      });
    });
  });

  describe('convertToSDKTool', () => {
    it('should convert a Claude tool to SDK format', () => {
      const claudeTool: ClaudeTool = {
        name: 'test_tool',
        description: 'A test tool',
        input_schema: {
          type: 'object',
          properties: {
            text: { type: 'string' }
          }
        }
      };
      
      const sdkTool = convertToSDKTool(claudeTool);
      
      expect(sdkTool).toEqual({
        name: 'test_tool',
        description: 'A test tool',
        input_schema: {
          type: 'object',
          properties: {
            text: { type: 'string' }
          }
        }
      });
    });
  });

  describe('extractToolCalls', () => {
    it('should return null for empty content', () => {
      expect(extractToolCalls(null)).toBeNull();
      expect(extractToolCalls(undefined)).toBeNull();
    });

    it('should return null for string content', () => {
      expect(extractToolCalls('This is a text response')).toBeNull();
    });

    it('should extract tool calls from content blocks', () => {
      const content = [
        { type: 'text', text: 'I will help you with that.' },
        { 
          type: 'tool_use', 
          id: 'tool_1',
          input: { query: 'weather in New York' }
        }
      ];
      
      const toolCalls = extractToolCalls(content);
      
      expect(toolCalls).toEqual([
        {
          name: 'tool_1',
          arguments: { query: 'weather in New York' }
        }
      ]);
    });

    it('should handle multiple tool calls', () => {
      const content = [
        { 
          type: 'tool_use', 
          id: 'tool_1',
          input: { query: 'weather in New York' }
        },
        { 
          type: 'tool_use', 
          id: 'tool_2',
          input: { location: 'San Francisco' }
        }
      ];
      
      const toolCalls = extractToolCalls(content);
      
      expect(toolCalls).toEqual([
        {
          name: 'tool_1',
          arguments: { query: 'weather in New York' }
        },
        {
          name: 'tool_2',
          arguments: { location: 'San Francisco' }
        }
      ]);
    });

    it('should handle both id and name formats', () => {
      const content = [
        { 
          type: 'tool_use', 
          name: 'search',
          input: { query: 'weather' }
        }
      ];
      
      const toolCalls = extractToolCalls(content);
      
      expect(toolCalls).toEqual([
        {
          name: 'search',
          arguments: { query: 'weather' }
        }
      ]);
    });

    it('should return null if no tool calls are found', () => {
      const content = [
        { type: 'text', text: 'This is just a text response' }
      ];
      
      expect(extractToolCalls(content)).toBeNull();
    });
  });

  describe('executeToolCalls', () => {
    it('should execute tool calls with registered handlers', async () => {
      const toolCalls = [
        {
          name: 'calculator',
          arguments: { a: 2, b: 3, operation: 'add' }
        }
      ];
      
      const handlers = {
        calculator: jest.fn().mockResolvedValue(5)
      };
      
      const results = await executeToolCalls(toolCalls, handlers);
      
      expect(handlers.calculator).toHaveBeenCalledWith({ a: 2, b: 3, operation: 'add' });
      expect(results).toEqual([
        {
          input: toolCalls[0],
          output: { output: 5 }
        }
      ]);
    });

    it('should handle missing handlers', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const toolCalls = [
        {
          name: 'unknown_tool',
          arguments: { query: 'test' }
        }
      ];
      
      const handlers = {};
      
      const results = await executeToolCalls(toolCalls, handlers);
      
      expect(consoleSpy).toHaveBeenCalledWith('No handler registered for tool: unknown_tool');
      expect(results).toEqual([
        {
          input: toolCalls[0],
          output: { 
            output: null,
            error: 'No handler registered for tool: unknown_tool'
          }
        }
      ]);
      
      consoleSpy.mockRestore();
    });

    it('should handle errors in tool handlers', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const toolCalls = [
        {
          name: 'buggy_tool',
          arguments: { query: 'test' }
        }
      ];
      
      const handlers = {
        buggy_tool: jest.fn().mockRejectedValue(new Error('Tool execution failed'))
      };
      
      const results = await executeToolCalls(toolCalls, handlers);
      
      expect(handlers.buggy_tool).toHaveBeenCalled();
      expect(results).toEqual([
        {
          input: toolCalls[0],
          output: { 
            output: null,
            error: 'Tool execution failed'
          }
        }
      ]);
      
      consoleSpy.mockRestore();
    });

    it('should execute multiple tool calls', async () => {
      const toolCalls = [
        {
          name: 'tool1',
          arguments: { value: 1 }
        },
        {
          name: 'tool2',
          arguments: { value: 2 }
        }
      ];
      
      const handlers = {
        tool1: jest.fn().mockResolvedValue('Result 1'),
        tool2: jest.fn().mockResolvedValue('Result 2')
      };
      
      const results = await executeToolCalls(toolCalls, handlers);
      
      expect(handlers.tool1).toHaveBeenCalledWith({ value: 1 });
      expect(handlers.tool2).toHaveBeenCalledWith({ value: 2 });
      
      expect(results).toEqual([
        {
          input: toolCalls[0],
          output: { output: 'Result 1' }
        },
        {
          input: toolCalls[1],
          output: { output: 'Result 2' }
        }
      ]);
    });
  });

  describe('formatSDKToolResults', () => {
    it('should format tool results for Anthropic SDK', () => {
      const toolCalls = [
        {
          input: {
            name: 'tool1',
            arguments: { value: 1 }
          },
          output: { output: 'Result 1' }
        },
        {
          input: {
            name: 'tool2',
            arguments: { value: 2 }
          },
          output: { output: 'Result 2' }
        }
      ];
      
      const formattedResults = formatSDKToolResults(toolCalls);
      
      expect(formattedResults).toEqual({
        type: 'tool_result',
        tool_results: [
          {
            tool_call_id: 'tool1',
            output: 'Result 1'
          },
          {
            tool_call_id: 'tool2',
            output: 'Result 2'
          }
        ]
      });
    });

    it('should handle null output values', () => {
      const toolCalls = [
        {
          input: {
            name: 'tool1',
            arguments: { value: 1 }
          },
          output: { output: null }
        }
      ];
      
      const formattedResults = formatSDKToolResults(toolCalls);
      
      expect(formattedResults).toEqual({
        type: 'tool_result',
        tool_results: [
          {
            tool_call_id: 'tool1',
            output: null
          }
        ]
      });
    });
  });

  describe('predefined tools', () => {
    it('should provide keywordExtractionTool with correct schema', () => {
      expect(keywordExtractionTool).toEqual({
        name: 'extract_keywords',
        description: 'Extract relevant keywords from a text',
        input_schema: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'The text to extract keywords from' },
            maxKeywords: { type: 'number', description: 'Maximum number of keywords to extract' },
          },
          required: ['text'],
        }
      });
    });

    it('should provide atsScoreTool with correct schema', () => {
      expect(atsScoreTool).toEqual({
        name: 'calculate_ats_score',
        description: 'Calculate an ATS compatibility score for a resume against a job description',
        input_schema: {
          type: 'object',
          properties: {
            resumeText: { type: 'string', description: 'The resume text' },
            jobDescription: { type: 'string', description: 'The job description text' },
          },
          required: ['resumeText', 'jobDescription'],
        }
      });
    });

    it('should provide skillMatchingTool with correct schema', () => {
      expect(skillMatchingTool).toEqual({
        name: 'match_skills',
        description: 'Match resume skills with job description requirements',
        input_schema: {
          type: 'object',
          properties: {
            resumeSkills: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of skills from the resume' 
            },
            jobSkills: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of skills from the job description' 
            },
          },
          required: ['resumeSkills', 'jobSkills'],
        }
      });
    });
  });

  describe('defaultToolHandlers', () => {
    it('should have a functional extract_keywords handler', async () => {
      const result = await defaultToolHandlers.extract_keywords({
        text: 'This is a test of the keyword extraction system',
        maxKeywords: 3
      });
      
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBeLessThanOrEqual(3);
      
      // Each item should have word and count properties
      result.forEach(item => {
        expect(item).toHaveProperty('word');
        expect(item).toHaveProperty('count');
      });
    });

    it('should have a functional calculate_ats_score handler', async () => {
      const result = await defaultToolHandlers.calculate_ats_score({
        resumeText: 'I have experience with JavaScript, React, and Node.js',
        jobDescription: 'Looking for developers with JavaScript and React experience'
      });
      
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('matchedWords');
      expect(result).toHaveProperty('feedback');
      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should have a functional match_skills handler', async () => {
      const result = await defaultToolHandlers.match_skills({
        resumeSkills: ['JavaScript', 'React', 'Node.js', 'CSS'],
        jobSkills: ['JavaScript', 'React', 'TypeScript']
      });
      
      expect(result).toHaveProperty('matches');
      expect(result).toHaveProperty('missing');
      expect(result).toHaveProperty('matchCount');
      expect(result).toHaveProperty('missingCount');
      expect(result).toHaveProperty('matchPercentage');
      
      // Case insensitive matching
      expect(result.matches).toContain('javascript');
      expect(result.matches).toContain('react');
      expect(result.missing).toContain('typescript');
    });
  });
});