// File: /app/api/ai/analyze-job/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createActionClient } from "@/lib/supabase/client";
import { cookies } from "next/headers";
import { 
  generateCompletionDirect, 
  DEFAULT_CLAUDE_MODEL, 
  handleAnthropicError 
} from "@/lib/ai/claude-client";
import { buildJobAnalysisPrompt } from "@/lib/ai/prompt-builder";
import { AnalyzeJobRequest, AnalyzeJobResponse } from "@/types/api";
import {
  JobRequirement,
  JobKeyword,
  JobAnalysis,
  RequirementImportance,
} from "@/types/job-description";
import { createTool, convertToSDKTool } from "@/lib/ai/claude-tools";
import Anthropic from "@anthropic-ai/sdk";

// Interface for the expected structure of the JSON parsed from Claude's response
interface ClaudeSkill {
  skill: string;
  importance?: string;
}
interface ClaudeExperience {
  description: string;
  importance?: string;
}
interface ClaudeEducation {
  type: string;
  field: string;
  importance?: string;
}
interface ClaudeCertification {
  name: string;
  importance?: string;
}
interface ClaudeKeyword {
  text: string;
  frequency?: number;
  context?: string;
}
interface ClaudeCulture {
  trait: string;
}
interface ClaudeExperienceLevel {
  level?: string;
}

interface ClaudeAnalysisData {
  hardSkills?: ClaudeSkill[];
  softSkills?: ClaudeSkill[];
  qualifications?: {
    experience?: ClaudeExperience[];
    education?: ClaudeEducation[];
    certifications?: ClaudeCertification[];
  };
  keywords?: ClaudeKeyword[];
  companyCulture?: ClaudeCulture[];
  experienceLevel?: ClaudeExperienceLevel;
}

// Helper function to safely map string importance to RequirementImportance type
function mapImportance(
  importanceStr: string | undefined,
): RequirementImportance {
  const lowerImportance = importanceStr?.toLowerCase();
  if (
    lowerImportance === "must_have" ||
    lowerImportance === "preferred" ||
    lowerImportance === "nice_to_have"
  ) {
    return lowerImportance as RequirementImportance; // Type assertion after validation
  }
  return "nice_to_have"; // Default value
}

// Generate a UUID for database IDs
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Extract structured data from Claude's response
 * Works with both tool calls and plain JSON responses
 */
function extractAnalysisData(response: Anthropic.Message): ClaudeAnalysisData {
  // Check if we have a tool_use content block
  if (Array.isArray(response.content)) {
    for (const block of response.content) {
      if (block.type === 'tool_use' && block.name === 'job_analysis' && block.input) {
        return block.input as unknown as ClaudeAnalysisData;
      }
    }
  }
  
  // Fall back to looking for JSON in text blocks
  const fullText = Array.isArray(response.content) 
    ? response.content
        .filter(block => block.type === 'text')
        .map(block => (block as any).text)
        .join('')
    : '';
    
  const jsonMatch = fullText.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (err) {
      throw new Error("Failed to parse JSON from Claude response");
    }
  }
  
  throw new Error("Failed to extract structured data from Claude response");
}

// POST /api/ai/analyze-job - Analyze a job description using Claude API
export async function POST(request: NextRequest) {
  try {
    const supabase = await createActionClient();

    // 1. Authenticate the user
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const requestData: AnalyzeJobRequest = await request.json();
    const { jobDescriptionId } = requestData;

    if (!jobDescriptionId) {
      return NextResponse.json(
        { error: "Job description ID is required" },
        { status: 400 },
      );
    }

    // 3. Fetch the job description
    const { data: jobDescription, error: fetchError } = await supabase
      .from("job_descriptions")
      .select("*")
      .eq("id", jobDescriptionId)
      .eq("user_id", session.user.id) // Using snake_case for database column
      .single();

    if (fetchError || !jobDescription) {
      return NextResponse.json(
        { error: fetchError?.message || "Job description not found" },
        { status: fetchError ? 500 : 404 },
      );
    }

    // 4. Build the prompt for Claude
    const prompt = buildJobAnalysisPrompt(jobDescription.content);

    // 5. Define job analysis tool with proper schema
    const jobAnalysisTool = createTool(
      "job_analysis",
      "Tool for structured job description analysis",
      {
        type: "object",
        properties: {
          hardSkills: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                importance: { type: "string", enum: ["must_have", "nice_to_have", "preferred"] }
              }
            }
          },
          softSkills: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                importance: { type: "string", enum: ["must_have", "nice_to_have", "preferred"] }
              }
            }
          },
          qualifications: {
            type: "object",
            properties: {
              experience: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    importance: { type: "string", enum: ["must_have", "nice_to_have", "preferred"] }
                  }
                }
              },
              education: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    field: { type: "string" },
                    importance: { type: "string", enum: ["must_have", "nice_to_have", "preferred"] }
                  }
                }
              },
              certifications: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    importance: { type: "string", enum: ["must_have", "nice_to_have", "preferred"] }
                  }
                }
              }
            }
          },
          keywords: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                frequency: { type: "number" },
                context: { type: "string" }
              }
            }
          },
          companyCulture: {
            type: "array",
            items: {
              type: "object",
              properties: {
                trait: { type: "string" }
              }
            }
          },
          experienceLevel: {
            type: "object",
            properties: {
              level: { type: "string" }
            }
          }
        }
      }
    );

    // 6. Call Claude API directly with the new SDK
    let claudeResponse: Anthropic.Message;
    try {
      claudeResponse = await generateCompletionDirect(prompt, {
        model: DEFAULT_CLAUDE_MODEL,
        temperature: 0.3, // Lower temperature for more consistent, factual outputs
        maxTokens: 2048, // Ensure we have enough tokens for a comprehensive analysis
        tools: [jobAnalysisTool]
      });
    } catch (error) {
      throw handleAnthropicError(error);
    }

    // 7. Parse Claude's response to extract the JSON analysis
    let analysisData: ClaudeAnalysisData;
    try {
      analysisData = extractAnalysisData(claudeResponse);
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      return NextResponse.json(
        { error: "Failed to parse job analysis" },
        { status: 500 },
      );
    }

    // 8. Transform Claude's response to match our schema
    const requirements: JobRequirement[] = [];

    // Process hard skills
    if (analysisData.hardSkills && Array.isArray(analysisData.hardSkills)) {
      analysisData.hardSkills.forEach((skill) => {
        requirements.push({
          id: generateUUID(),
          type: "hard_skill",
          content: skill.skill,
          importance: mapImportance(skill.importance),
        });
      });
    }

    // Process soft skills
    if (analysisData.softSkills && Array.isArray(analysisData.softSkills)) {
      analysisData.softSkills.forEach((skill) => {
        requirements.push({
          id: generateUUID(),
          type: "soft_skill",
          content: skill.skill,
          importance: mapImportance(skill.importance),
        });
      });
    }

    // Process experience requirements
    if (
      analysisData.qualifications?.experience &&
      Array.isArray(analysisData.qualifications.experience)
    ) {
      analysisData.qualifications.experience.forEach((exp) => {
        requirements.push({
          id: generateUUID(),
          type: "experience",
          content: exp.description,
          importance: mapImportance(exp.importance),
        });
      });
    }

    // Process education requirements
    if (
      analysisData.qualifications?.education &&
      Array.isArray(analysisData.qualifications.education)
    ) {
      analysisData.qualifications.education.forEach((edu) => {
        requirements.push({
          id: generateUUID(),
          type: "education",
          content: `${edu.type} in ${edu.field}`,
          importance: mapImportance(edu.importance),
        });
      });
    }

    // Process certification requirements
    if (
      analysisData.qualifications?.certifications &&
      Array.isArray(analysisData.qualifications.certifications)
    ) {
      analysisData.qualifications.certifications.forEach((cert) => {
        requirements.push({
          id: generateUUID(),
          type: "certification",
          content: cert.name,
          importance: mapImportance(cert.importance),
        });
      });
    }

    // Process keywords
    const keywords: JobKeyword[] = [];
    if (analysisData.keywords && Array.isArray(analysisData.keywords)) {
      analysisData.keywords.forEach((keyword) => {
        keywords.push({
          id: generateUUID(),
          text: keyword.text,
          frequency: keyword.frequency || 1,
          context: keyword.context,
        });
      });
    }

    // Extract company culture
    const companyCulture: string[] = [];
    if (
      analysisData.companyCulture &&
      Array.isArray(analysisData.companyCulture)
    ) {
      analysisData.companyCulture.forEach((culture) => {
        if (culture.trait) {
          companyCulture.push(culture.trait);
        }
      });
    }

    // Extract experience level
    const experienceLevel = analysisData.experienceLevel?.level || "mid";

    // 9. Store the analysis in the database
    // First, check if an analysis already exists for this job description
    const { data: existingAnalysis } = await supabase
      .from("job_analysis")
      .select("id")
      .eq("job_description_id", jobDescriptionId)
      .single();

    let analysisRecord;
    const now = new Date().toISOString();

    if (existingAnalysis) {
      // Update existing analysis
      const { data, error: updateError } = await supabase
        .from("job_analysis")
        .update({
          requirements,
          keywords,
          experience_level: experienceLevel,
          company_culture: companyCulture,
          updated_at: now,
        })
        .eq("id", existingAnalysis.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating job analysis:", updateError);
        return NextResponse.json(
          { error: "Failed to update job analysis" },
          { status: 500 },
        );
      }

      analysisRecord = data;
    } else {
      // Create new analysis
      const { data, error: insertError } = await supabase
        .from("job_analysis")
        .insert({
          job_description_id: jobDescriptionId,
          requirements,
          keywords,
          experience_level: experienceLevel,
          company_culture: companyCulture,
          created_at: now,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating job analysis:", insertError);
        return NextResponse.json(
          { error: "Failed to create job analysis" },
          { status: 500 },
        );
      }

      analysisRecord = data;
    }

    // 10. Transform the database record to match our API response schema
    const analysis: JobAnalysis = {
      id: analysisRecord.id,
      jobDescriptionId,
      companyInfo: {
        size: analysisRecord.company_size,
        industry: analysisRecord.industry,
        culture: analysisRecord.company_culture_description,
        mission: analysisRecord.company_mission,
        values: analysisRecord.company_values || [],
      },
      jobSummary: analysisRecord.job_summary || "",
      requirements: (analysisRecord.requirements as JobRequirement[]) || [],
      keywords: (analysisRecord.keywords as JobKeyword[]) || [],
      experienceLevel: analysisRecord.experience_level || "unspecified",
      companyCulture: analysisRecord.company_culture || [],
      createdAt: analysisRecord.created_at,
      salaryRange: analysisRecord.salary_range ? {
        min: analysisRecord.salary_range.min,
        max: analysisRecord.salary_range.max,
        currency: analysisRecord.salary_range.currency,
        isExplicit: !!analysisRecord.salary_range.isExplicit, 
      } : undefined,
      industry: analysisRecord.industry,
      department: analysisRecord.department,
      employmentType: analysisRecord.employment_type,
      remoteWork: analysisRecord.remote_work,
      responsibilities: analysisRecord.responsibilities || [],
      atsCompatibilityScore: analysisRecord.ats_compatibility_score,
    };

    // 11. Return the analysis
    const response: AnalyzeJobResponse = {
      analysis,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in analyze-job API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze job description",
      },
      { status: 500 },
    );
  }
}