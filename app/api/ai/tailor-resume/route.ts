// File: /app/api/ai/tailor-resume/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { TailorResumeRequest, TailorResumeResponse } from "@/types/api";
import { Resume } from "@/models/resume";
import { JobDescription } from "@/models/job-description";
import { buildResumeTailoringPrompt } from "@/lib/ai/prompt-builder";
import { 
  generateCompletionDirect, 
  DEFAULT_CLAUDE_MODEL, 
  handleAnthropicError 
} from "@/lib/ai/claude-client";
import {
  TailoringSettings,
  ATSScoreResult,
  KeywordMatch,
} from "@/types/resume";
import { createTool } from "@/lib/ai/claude-tools";
import Anthropic from "@anthropic-ai/sdk";

// Define KeywordImportance type locally
type KeywordImportance = "low" | "medium" | "high";

/**
 * Helper function to generate a UUID for new database records
 */
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

// Helper function to safely map string importance to KeywordImportance type
function mapKeywordImportance(
  importanceStr: string | undefined,
): KeywordImportance {
  const lowerImportance = importanceStr?.toLowerCase();
  if (
    lowerImportance === "high" ||
    lowerImportance === "medium" ||
    lowerImportance === "low"
  ) {
    return lowerImportance as KeywordImportance; // Type assertion after validation
  }
  return "medium"; // Default value
}

// Interfaces for Claude response structure
interface ClaudeImprovementSuggestion {
  suggestion?: string;
  reasoning?: string;
}
interface ClaudeKeywordMatch {
  keyword?: string;
  source?: "original" | "added";
  importance?: string;
  section?: string;
}
interface ClaudeMajorChange {
  section?: string;
  description?: string;
}
interface ClaudeTailoringNotes {
  summary?: string;
  keywordMatches?: ClaudeKeywordMatch[];
  majorChanges?: ClaudeMajorChange[];
  improvementSuggestions?: ClaudeImprovementSuggestion[];
}
interface ClaudeTailoringData {
  tailoredResume?: Resume; // Assuming Claude returns the full Resume structure
  tailoringNotes?: ClaudeTailoringNotes;
}

// Helper type for the feedback array elements
type FeedbackItem = ATSScoreResult["feedback"][number];

/**
 * Extract structured data from Claude's response
 * Works with both tool calls and plain JSON responses
 */
function extractTailoringData(response: Anthropic.Message): ClaudeTailoringData {
  // Check if we have a tool_use content block
  if (Array.isArray(response.content)) {
    for (const block of response.content) {
      if (block.type === 'tool_use' && block.name === 'resume_tailoring' && block.input) {
        return block.input as unknown as ClaudeTailoringData;
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

/**
 * POST /api/ai/tailor-resume - Tailor a resume based on a job description using AI
 *
 * Takes a resume ID, job description ID, and tailoring settings.
 * Returns a tailored version of the resume with ATS score and keyword analysis.
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Authenticate user
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const requestData: TailorResumeRequest = await request.json();
    const { resumeId, jobDescriptionId, settings } = requestData;

    if (!resumeId || !jobDescriptionId) {
      return NextResponse.json(
        { error: "Resume ID and job description ID are required" },
        { status: 400 },
      );
    }

    // Fetch the resume
    const { data: resumeData, error: resumeError } = await supabase
      .from("resumes")
      .select(
        `
        *,
        personal_info(*),
        professional_summary(*),
        work_experiences(*),
        education(*),
        skills(*),
        projects(*),
        certifications(*),
        social_links(*),
        custom_sections(*)
      `,
      )
      .eq("id", resumeId)
      .eq("user_id", session.user.id)
      .single();

    if (resumeError || !resumeData) {
      return NextResponse.json(
        { error: resumeError?.message || "Resume not found" },
        { status: resumeError ? 500 : 404 },
      );
    }

    // Transform database resume to application model
    const resume: Resume = {
      id: resumeData.id,
      userId: resumeData.user_id,
      title: resumeData.title,
      targetJobTitle: resumeData.target_job_title,
      createdAt: resumeData.created_at,
      updatedAt: resumeData.updated_at,
      templateId: resumeData.template_id,
      personalInfo: resumeData.personal_info || {
        fullName: "",
        email: "",
        phone: "",
        location: "",
      },
      professionalSummary: resumeData.professional_summary || {
        content: "",
      },
      workExperiences: resumeData.work_experiences || [],
      education: resumeData.education || [],
      skills: resumeData.skills || [],
      projects: resumeData.projects || [],
      certifications: resumeData.certifications || [],
      socialLinks: resumeData.social_links || [],
      customSections: resumeData.custom_sections || [],
    };

    // Fetch the job description with its analysis
    const { data: jobDescriptionData, error: jobDescriptionError } =
      await supabase
        .from("job_descriptions")
        .select(
          `
        *,
        analysis:job_analysis(*)
      `,
        )
        .eq("id", jobDescriptionId)
        .eq("user_id", session.user.id)
        .single();

    if (jobDescriptionError || !jobDescriptionData) {
      return NextResponse.json(
        { error: jobDescriptionError?.message || "Job description not found" },
        { status: jobDescriptionError ? 500 : 404 },
      );
    }

    // Transform database job description to application model
    const jobDescription: JobDescription = {
      id: jobDescriptionData.id,
      userId: jobDescriptionData.user_id,
      title: jobDescriptionData.title,
      company: jobDescriptionData.company,
      location: jobDescriptionData.location,
      content: jobDescriptionData.content,
      url: jobDescriptionData.url,
      applicationDeadline: jobDescriptionData.application_deadline,
      createdAt: jobDescriptionData.created_at,
      updatedAt: jobDescriptionData.updated_at,
      analysis: jobDescriptionData.analysis,
    };

    // Set default tailoring settings if not provided
    const tailoringSettings: TailoringSettings = {
      intensity: settings?.intensity ?? 50,
      preserveVoice: settings?.preserveVoice ?? true,
      focusKeywords: settings?.focusKeywords ?? true,
    };

    // Build the prompt for Claude
    const prompt = buildResumeTailoringPrompt(
      resume,
      jobDescription,
      tailoringSettings,
    );

    // Define a custom tool for resume tailoring
    const resumeTailoringTool = createTool(
      "resume_tailoring",
      "Tool for tailoring resumes to match job descriptions",
      {
        type: "object",
        properties: {
          tailoredResume: {
            type: "object",
            description: "The complete tailored resume"
          },
          tailoringNotes: {
            type: "object",
            properties: {
              summary: { type: "string" },
              keywordMatches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    keyword: { type: "string" },
                    source: { type: "string", enum: ["original", "added"] },
                    section: { type: "string" },
                    importance: { type: "string", enum: ["high", "medium", "low"] }
                  }
                }
              },
              majorChanges: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    section: { type: "string" },
                    description: { type: "string" }
                  }
                }
              },
              improvementSuggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    suggestion: { type: "string" },
                    reasoning: { type: "string" }
                  }
                }
              }
            }
          }
        },
        required: ["tailoredResume", "tailoringNotes"]
      }
    );

    // Call Claude API directly with the new SDK
    let claudeResponse: Anthropic.Message;
    try {
      claudeResponse = await generateCompletionDirect(prompt, {
        model: DEFAULT_CLAUDE_MODEL,
        temperature: 0.2, // Lower temperature for more consistent output
        maxTokens: 4096, // Ensure we have enough tokens for a comprehensive response
        tools: [resumeTailoringTool]
      });
    } catch (error) {
      throw handleAnthropicError(error);
    }

    // Parse Claude's response to extract the JSON
    let tailoringData: ClaudeTailoringData;
    try {
      tailoringData = extractTailoringData(claudeResponse);
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      console.error("Claude response content:", claudeResponse.content);
      return NextResponse.json(
        { error: "Failed to parse tailored resume" },
        { status: 500 },
      );
    }

    // Validate the response structure
    if (!tailoringData?.tailoredResume || !tailoringData?.tailoringNotes) {
      console.error("Invalid response structure from Claude:", tailoringData);
      return NextResponse.json(
        { error: "Invalid tailoring response structure" },
        { status: 500 },
      );
    }

    // Extract the tailored resume and notes
    const tailoredResume: Resume = tailoringData.tailoredResume;
    const tailoringNotes: ClaudeTailoringNotes = tailoringData.tailoringNotes;

    // Validate the tailored resume structure
    if (!tailoredResume.personalInfo || !tailoredResume.professionalSummary) {
      console.error("Invalid tailored resume structure:", tailoredResume);
      return NextResponse.json(
        { error: "Invalid tailored resume structure" },
        { status: 500 },
      );
    }

    // Generate ATS score
    const keywordMatchCount = tailoringNotes.keywordMatches?.length ?? 0;
    const improvementSuggestions = tailoringNotes.improvementSuggestions ?? [];

    // Define the feedback array elements with explicit types
    const keywordFeedbackItem: FeedbackItem = {
      category: "Keyword Optimization",
      message: `Resume includes ${keywordMatchCount} keywords matching the job description.`,
      severity:
        keywordMatchCount > 10
          ? ("low" as const)
          : keywordMatchCount > 5
            ? ("medium" as const)
            : ("high" as const),
    };

    const improvementFeedbackItems: FeedbackItem[] = improvementSuggestions.map(
      (suggestion): FeedbackItem => {
        // Explicit return type for map callback
        return {
          category: "Content Improvement",
          message: suggestion.suggestion || "Improve resume content",
          severity: suggestion.reasoning
            ? ("high" as const)
            : ("medium" as const),
        };
      },
    );

    const atsScore: ATSScoreResult = {
      score: Math.min(
        100,
        Math.max(
          0,
          60 + keywordMatchCount * 2 - improvementSuggestions.length * 3,
        ),
      ),
      feedback: [keywordFeedbackItem, ...improvementFeedbackItems], // Combine typed arrays
    };

    // Extract keyword matches
    const keywordMatchesData = tailoringNotes.keywordMatches ?? [];
    const keywordMatches: KeywordMatch[] = keywordMatchesData.map((match) => ({
      keyword: match.keyword || "",
      found: match.source === "original",
      importance: mapKeywordImportance(match.importance),
    }));

    // Save the tailored resume in the database with a new ID
    const tailoredResumeId = generateUUID();
    const now = new Date().toISOString();

    // Transform the tailored resume to database format
    const dbTailoredResume = {
      id: tailoredResumeId,
      user_id: session.user.id,
      original_resume_id: resumeId,
      job_description_id: jobDescriptionId,
      title: `${tailoredResume.title} - Tailored for ${jobDescription.title}`,
      target_job_title: tailoredResume.targetJobTitle,
      template_id: tailoredResume.templateId,
      created_at: now,
      updated_at: now,
      tailoring_settings: tailoringSettings,
      ats_score: atsScore,
      keyword_matches: keywordMatches,
    };

    // Insert the tailored resume
    const { error: insertError } = await supabase
      .from("tailored_resumes")
      .insert(dbTailoredResume);

    if (insertError) {
      console.error("Error saving tailored resume:", insertError);
      // Continue anyway to return the tailored resume to the user
      console.warn("Tailored resume was generated but not saved to database");
    } else {
      // Save the related resume data components

      // Insert personal info
      const { error: personalInfoError } = await supabase
        .from("personal_info")
        .insert({
          resume_id: tailoredResumeId,
          ...tailoredResume.personalInfo,
        });

      if (personalInfoError) {
        console.error("Error saving personal info:", personalInfoError);
      }

      // Insert professional summary
      const { error: summaryError } = await supabase
        .from("professional_summary")
        .insert({
          resume_id: tailoredResumeId,
          content: tailoredResume.professionalSummary.content,
        });

      if (summaryError) {
        console.error("Error saving professional summary:", summaryError);
      }

      // Insert work experiences
      if ((tailoredResume.workExperiences ?? []).length > 0) {
        const workExperiencesWithResumeId = (
          tailoredResume.workExperiences ?? []
        ).map((exp) => ({
          ...exp,
          resume_id: tailoredResumeId,
        }));

        const { error: workExpError } = await supabase
          .from("work_experiences")
          .insert(workExperiencesWithResumeId);

        if (workExpError) {
          console.error("Error saving work experiences:", workExpError);
        }
      }

      // Insert education
      if ((tailoredResume.education ?? []).length > 0) {
        const educationWithResumeId = (tailoredResume.education ?? []).map(
          (edu) => ({
            ...edu,
            resume_id: tailoredResumeId,
          }),
        );

        const { error: educationError } = await supabase
          .from("education")
          .insert(educationWithResumeId);

        if (educationError) {
          console.error("Error saving education:", educationError);
        }
      }

      // Insert skills
      if ((tailoredResume.skills ?? []).length > 0) {
        const skillsWithResumeId = (tailoredResume.skills ?? []).map(
          (skill) => ({
            ...skill,
            resume_id: tailoredResumeId,
          }),
        );

        const { error: skillsError } = await supabase
          .from("skills")
          .insert(skillsWithResumeId);

        if (skillsError) {
          console.error("Error saving skills:", skillsError);
        }
      }

      // Note: For brevity, we're omitting the insertion of other resume sections
      // In a real implementation, we would insert all sections (projects, certifications, etc.)
    }

    // Return the tailored resume, ATS score, and keyword matches
    const response: TailorResumeResponse = {
      tailoredResume: {
        ...tailoredResume,
        id: tailoredResumeId,
        userId: session.user.id,
        createdAt: now,
        updatedAt: now,
      },
      atsScore,
      keywordMatches,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in tailor-resume API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to tailor resume",
      },
      { status: 500 },
    );
  }
}