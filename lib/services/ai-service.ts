// File: /services/ai-service.ts
import { Resume } from "@/models/resume";
import {
  JobDescription,
  JobRequirement,
  JobKeyword,
} from "@/models/job-description";
import {
  TailoringSettings,
  ATSScoreResult,
  KeywordMatch,
} from "@/types/resume";
import {
  buildJobAnalysisPrompt,
  buildResumeTailoringPrompt,
} from "@/lib/ai/prompt-builder";
import { 
  generateCompletionDirect, 
  DEFAULT_CLAUDE_MODEL, 
  handleAnthropicError 
} from "@/lib/ai/claude-client";
import { PROMPT_TEMPLATES } from "@/lib/ai/prompt-templates";
import Anthropic from "@anthropic-ai/sdk";
import { createTool } from "@/lib/ai/claude-tools";

/**
 * Error class for AI service operations
 */
export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

/**
 * Extract structured data from Claude's response
 * Works with both tool calls and plain JSON responses
 */
function extractStructuredData<T>(response: Anthropic.Message, toolName?: string): T {
  // Check if we have a tool_use content block with the specified name
  if (Array.isArray(response.content) && toolName) {
    for (const block of response.content) {
      if (block.type === 'tool_use' && block.name === toolName && block.input) {
        return block.input as unknown as T;
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
    
  const jsonMatch = fullText.match(/```(?:json)?\n([\s\S]*?)\n```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (err) {
      throw new Error("Failed to parse JSON from Claude response");
    }
  }
  
  // Try to find JSON within the text without code block markers
  const jsonMatch2 = fullText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch2 && jsonMatch2[1]) {
    try {
      return JSON.parse(jsonMatch2[1]);
    } catch (err) {
      // Continue to next approach
    }
  }
  
  // As a last resort, try parsing the entire text
  try {
    if (typeof fullText === 'string') {
      return JSON.parse(fullText);
    }
  } catch (err) {
    // Continue to error handling
  }
  
  throw new Error("Failed to extract structured data from Claude response");
}

/**
 * Analyzes a job description to extract key information like skills, requirements, and keywords
 *
 * @param jobDescription The job description to analyze
 * @returns Structured analysis of the job description
 */
export async function analyzeJobDescription(
  jobDescription: JobDescription,
): Promise<JobDescription["analysis"]> {
  try {
    // Build the prompt for job description analysis
    const prompt = buildJobAnalysisPrompt(jobDescription.content);

    // Define job analysis tool
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

    // Call Claude API directly to analyze the job description
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

    // Parse Claude's response to extract the JSON analysis
    let analysisData;
    try {
      analysisData = extractStructuredData(claudeResponse, "job_analysis");
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      throw new AIServiceError(
        "Failed to parse job analysis response",
        parseError,
      );
    }

    // Transform Claude's response to match our expected schema
    const requirements: JobRequirement[] = [];

    // Process hard skills
    if (analysisData.hardSkills && Array.isArray(analysisData.hardSkills)) {
      analysisData.hardSkills.forEach((skill: any) => {
        requirements.push({
          id: crypto.randomUUID(),
          type: "hard_skill",
          content: skill.skill,
          importance: skill.importance || "nice_to_have",
        });
      });
    }

    // Process soft skills
    if (analysisData.softSkills && Array.isArray(analysisData.softSkills)) {
      analysisData.softSkills.forEach((skill: any) => {
        requirements.push({
          id: crypto.randomUUID(),
          type: "soft_skill",
          content: skill.skill,
          importance: skill.importance || "nice_to_have",
        });
      });
    }

    // Process experience requirements
    if (
      analysisData.qualifications?.experience &&
      Array.isArray(analysisData.qualifications.experience)
    ) {
      analysisData.qualifications.experience.forEach((exp: any) => {
        requirements.push({
          id: crypto.randomUUID(),
          type: "experience",
          content: exp.description,
          importance: exp.importance || "nice_to_have",
        });
      });
    }

    // Process education requirements
    if (
      analysisData.qualifications?.education &&
      Array.isArray(analysisData.qualifications.education)
    ) {
      analysisData.qualifications.education.forEach((edu: any) => {
        requirements.push({
          id: crypto.randomUUID(),
          type: "education",
          content: `${edu.type} in ${edu.field}`,
          importance: edu.importance || "nice_to_have",
        });
      });
    }

    // Process certification requirements
    if (
      analysisData.qualifications?.certifications &&
      Array.isArray(analysisData.qualifications.certifications)
    ) {
      analysisData.qualifications.certifications.forEach((cert: any) => {
        requirements.push({
          id: crypto.randomUUID(),
          type: "certification",
          content: cert.name,
          importance: cert.importance || "nice_to_have",
        });
      });
    }

    // Process keywords
    const keywords: JobKeyword[] = [];
    if (analysisData.keywords && Array.isArray(analysisData.keywords)) {
      analysisData.keywords.forEach((keyword: any) => {
        keywords.push({
          id: crypto.randomUUID(),
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
      analysisData.companyCulture.forEach((culture: any) => {
        if (culture.trait) {
          companyCulture.push(culture.trait);
        }
      });
    }

    // Extract experience level
    const experienceLevel = analysisData.experienceLevel?.level || "mid";

    // Construct the analysis object
    const analysis: JobDescription["analysis"] = {
      id: crypto.randomUUID(),
      jobDescriptionId: jobDescription.id,
      requirements,
      keywords,
      experienceLevel,
      companyCulture,
      createdAt: new Date().toISOString(),
      responsibilities: analysisData.responsibilities || [],
    };

    // Add optional fields if present in the analysis
    if (analysisData.salaryRange) {
      analysis.salaryRange = analysisData.salaryRange;
    }

    if (analysisData.industry) {
      analysis.industry = analysisData.industry;
    }

    if (analysisData.department) {
      analysis.department = analysisData.department;
    }

    if (analysisData.employmentType) {
      analysis.employmentType = analysisData.employmentType;
    }

    if (analysisData.remoteWork) {
      analysis.remoteWork = analysisData.remoteWork;
    }

    return analysis;
  } catch (error) {
    console.error("Error in analyzeJobDescription:", error);
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw new AIServiceError("Failed to analyze job description", error);
  }
}

/**
 * Tailors a resume to better match a job description based on specified settings
 *
 * @param resume The original resume to tailor
 * @param jobDescription The target job description
 * @param settings Tailoring settings like intensity and preferences
 * @returns Tailored resume and related data
 */
export async function tailorResume(
  resume: Resume,
  jobDescription: JobDescription,
  settings: TailoringSettings,
): Promise<{
  tailoredResume: Resume;
  atsScore: ATSScoreResult;
  keywordMatches: KeywordMatch[];
}> {
  try {
    // Build the prompt for resume tailoring
    const prompt = buildResumeTailoringPrompt(resume, jobDescription, settings);

    // Define resume tailoring tool
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

    // Call Claude API directly to tailor the resume
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
    let tailoringData;
    try {
      tailoringData = extractStructuredData(claudeResponse, "resume_tailoring");
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      console.error("Claude response:", claudeResponse.content);
      throw new AIServiceError("Failed to parse tailored resume", parseError);
    }

    // Validate the response structure
    if (!tailoringData?.tailoredResume || !tailoringData?.tailoringNotes) {
      console.error("Invalid response structure from Claude:", tailoringData);
      throw new AIServiceError("Invalid tailoring response structure");
    }

    // Extract the tailored resume and notes
    const tailoredResume: Resume = tailoringData.tailoredResume;
    const tailoringNotes = tailoringData.tailoringNotes;

    // Validate the tailored resume structure
    if (!tailoredResume.personalInfo || !tailoredResume.professionalSummary) {
      console.error("Invalid tailored resume structure:", tailoredResume);
      throw new AIServiceError("Invalid tailored resume structure");
    }

    // Ensure the tailored resume has the same ID as the original
    tailoredResume.id = resume.id;
    tailoredResume.userId = resume.userId;

    // Preserve creation and update timestamps
    tailoredResume.createdAt = resume.createdAt;
    tailoredResume.updatedAt = new Date().toISOString();

    // Generate ATS score based on the tailoring notes
    const keywordMatchCount = Array.isArray(tailoringNotes.keywordMatches)
      ? tailoringNotes.keywordMatches.length
      : 0;

    const improvementSuggestions = Array.isArray(
      tailoringNotes.improvementSuggestions,
    )
      ? tailoringNotes.improvementSuggestions
      : [];

    // Calculate ATS score based on keywords and improvements needed
    const atsScore: ATSScoreResult = {
      score: Math.min(
        100,
        Math.max(
          0,
          60 + keywordMatchCount * 2 - improvementSuggestions.length * 3,
        ),
      ),
      feedback: [
        {
          category: "Keyword Optimization",
          message: `Resume includes ${keywordMatchCount} keywords matching the job description.`,
          severity:
            keywordMatchCount > 10
              ? "low"
              : keywordMatchCount > 5
                ? "medium"
                : "high",
        },
        ...improvementSuggestions.map((suggestion: any) => ({
          category: "Content Improvement",
          message: suggestion.suggestion || "Improve resume content",
          severity: suggestion.reasoning ? "high" : "medium",
        })),
      ],
    };

    // Extract keyword matches
    const keywordMatches: KeywordMatch[] = Array.isArray(
      tailoringNotes.keywordMatches,
    )
      ? tailoringNotes.keywordMatches.map((match: any) => ({
          keyword: match.keyword || "",
          found: match.source === "original",
          importance: match.importance || "medium",
        }))
      : [];

    return {
      tailoredResume,
      atsScore,
      keywordMatches,
    };
  } catch (error) {
    console.error("Error in tailorResume:", error);
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw new AIServiceError("Failed to tailor resume", error);
  }
}

// Helper function to ensure severity is one of the allowed values
function normalizeSeverity(severity: string): "low" | "medium" | "high" {
  if (severity === "low" || severity === "medium" || severity === "high") {
    return severity;
  }
  // Map other values to one of the allowed literals
  return severity.toLowerCase().includes("high")
    ? "high"
    : severity.toLowerCase().includes("low")
      ? "low"
      : "medium";
}

/**
 * Analyzes a resume against a job description to generate an ATS compatibility score
 *
 * @param resume The resume to score
 * @param jobDescription The job description to score against
 * @returns ATS compatibility score and feedback
 */
export async function generateATSScore(
  resume: Resume,
  jobDescription: JobDescription,
): Promise<ATSScoreResult> {
  try {
    // Serialize the resume and job description as text for the prompt
    const resumeText = serializeResumeForATS(resume);

    // Prepare the prompt for ATS scoring
    const prompt = PROMPT_TEMPLATES.ATS_SCORE.replace(
      "{{RESUME}}",
      resumeText,
    ).replace("{{JOB_DESCRIPTION}}", jobDescription.content);

    // Create a tool for the ATS score analysis
    const atsScoreTool = createTool(
      "ats_score_analysis",
      "Tool for analyzing resume ATS compatibility",
      {
        type: "object",
        properties: {
          atsScore: { type: "number" },
          formatAnalysis: {
            type: "object",
            properties: {
              issues: { type: "array", items: { type: "string" } }
            }
          },
          keywordAnalysis: {
            type: "object",
            properties: {
              missingKeywords: { type: "array", items: { type: "string" } },
              keywordSuggestions: { type: "string" }
            }
          },
          qualificationAnalysis: {
            type: "object",
            properties: {
              missingQualifications: { type: "array", items: { type: "string" } }
            }
          },
          sectionFeedback: { type: "object" },
          improvementPriorities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                issue: { type: "string" },
                solution: { type: "string" },
                impact: { type: "string" }
              }
            }
          },
          overallAssessment: { type: "string" }
        },
        required: ["atsScore"]
      }
    );

    // Call Claude API direct for ATS scoring
    let claudeResponse: Anthropic.Message;
    try {
      claudeResponse = await generateCompletionDirect(prompt, {
        model: DEFAULT_CLAUDE_MODEL,
        temperature: 0.2, 
        maxTokens: 2048,
        tools: [atsScoreTool]
      });
    } catch (error) {
      throw handleAnthropicError(error);
    }

    // Parse Claude's response to extract the JSON
    let scoreData;
    try {
      scoreData = extractStructuredData(claudeResponse, "ats_score_analysis");
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      throw new AIServiceError("Failed to parse ATS score", parseError);
    }

    // Validate and extract the score data
    if (!scoreData || typeof scoreData.atsScore !== "number") {
      throw new AIServiceError("Invalid ATS score response format");
    }

    // Extract and format feedback
    const feedback = [];

    // Add format feedback if available
    if (scoreData.formatAnalysis && scoreData.formatAnalysis.issues) {
      scoreData.formatAnalysis.issues.forEach(
        (issue: string, index: number) => {
          feedback.push({
            category: "Format",
            message: issue,
            severity: normalizeSeverity(index < 2 ? "high" : "medium"), // Prioritize first issues as high severity
          });
        },
      );
    }

    // Add keyword feedback if available
    if (
      scoreData.keywordAnalysis &&
      scoreData.keywordAnalysis.missingKeywords
    ) {
      feedback.push({
        category: "Keywords",
        message: `Missing important keywords: ${scoreData.keywordAnalysis.missingKeywords.slice(0, 5).join(", ")}${scoreData.keywordAnalysis.missingKeywords.length > 5 ? "..." : ""}`,
        severity: "high" as const,
      });

      if (scoreData.keywordAnalysis.keywordSuggestions) {
        feedback.push({
          category: "Keywords",
          message: scoreData.keywordAnalysis.keywordSuggestions,
          severity: "medium" as const,
        });
      }
    }

    // Add qualification feedback if available
    if (
      scoreData.qualificationAnalysis &&
      scoreData.qualificationAnalysis.missingQualifications
    ) {
      feedback.push({
        category: "Qualifications",
        message: `Missing qualifications: ${scoreData.qualificationAnalysis.missingQualifications.slice(0, 3).join(", ")}${scoreData.qualificationAnalysis.missingQualifications.length > 3 ? "..." : ""}`,
        severity: "high" as const,
      });
    }

    // Add section feedback if available
    if (scoreData.sectionFeedback) {
      Object.entries(scoreData.sectionFeedback).forEach(
        ([section, message]) => {
          if (message && typeof message === "string") {
            feedback.push({
              category: `Section: ${section.charAt(0).toUpperCase() + section.slice(1)}`,
              message: message as string,
              severity: "medium" as const,
            });
          }
        },
      );
    }

    // Add improvement priorities if available
    if (
      scoreData.improvementPriorities &&
      Array.isArray(scoreData.improvementPriorities)
    ) {
      scoreData.improvementPriorities.forEach((priority: any) => {
        if (priority.issue && priority.solution) {
          feedback.push({
            category: "Priority Improvement",
            message: `${priority.issue}: ${priority.solution}`,
            severity: normalizeSeverity(priority.impact || "medium"),
          });
        }
      });
    }

    // Ensure we have some feedback, even if structure wasn't as expected
    if (feedback.length === 0 && scoreData.overallAssessment) {
      feedback.push({
        category: "Overall",
        message: scoreData.overallAssessment,
        severity:
          scoreData.atsScore < 70 ? ("high" as const) : ("medium" as const),
      });
    }

    return {
      score: Math.min(100, Math.max(0, Math.round(scoreData.atsScore))),
      feedback: feedback,
    };
  } catch (error) {
    console.error("Error in generateATSScore:", error);
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw new AIServiceError("Failed to generate ATS score", error);
  }
}

/**
 * Serializes a resume into text format suitable for ATS analysis
 *
 * @param resume The resume to serialize
 * @returns Text representation of the resume
 */
function serializeResumeForATS(resume: Resume): string {
  const sections: string[] = [];

  // Personal info section
  sections.push(`# CONTACT INFORMATION
${resume.personalInfo.fullName}
${resume.personalInfo.email}
${resume.personalInfo.phone}
${resume.personalInfo.location}
${resume.personalInfo.linkedIn ? `LinkedIn: ${resume.personalInfo.linkedIn}` : ""}
${resume.personalInfo.website ? `Website: ${resume.personalInfo.website}` : ""}
${resume.personalInfo.github ? `GitHub: ${resume.personalInfo.github}` : ""}`);

  // Professional summary
  if (resume.professionalSummary && resume.professionalSummary.content) {
    sections.push(`# PROFESSIONAL SUMMARY
${resume.professionalSummary.content}`);
  }

  // Work experience
  if (resume.workExperiences && resume.workExperiences.length > 0) {
    const experiences = resume.workExperiences.map((exp) => {
      const dateRange = exp.current
        ? `${exp.startDate} - Present`
        : `${exp.startDate} - ${exp.endDate}`;

      const highlights = exp.highlights.map((h) => `- ${h}`).join("\n");

      return `${exp.position}
${exp.company} | ${exp.location} | ${dateRange}
${highlights}`;
    });

    sections.push(`# EXPERIENCE
${experiences.join("\n\n")}`);
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    const educationEntries = resume.education.map((edu) => {
      const dateRange = edu.current
        ? `${edu.startDate} - Present`
        : `${edu.startDate} - ${edu.endDate}`;

      return `${edu.degree} in ${edu.field}
${edu.institution} | ${edu.location} | ${dateRange}
${edu.gpa ? `GPA: ${edu.gpa}` : ""}`;
    });

    sections.push(`# EDUCATION
${educationEntries.join("\n\n")}`);
  }

  // Skills
  if (resume.skills && resume.skills.length > 0) {
    const skillsByCategory = resume.skills.reduce(
      (acc, skill) => {
        const category = skill.category || "Other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(skill.name);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    const skillsText = Object.entries(skillsByCategory)
      .map(([category, skills]) => `${category}: ${skills.join(", ")}`)
      .join("\n");

    sections.push(`# SKILLS
${skillsText}`);
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    const projectEntries = resume.projects.map((proj) => {
      const highlights = proj.highlights.map((h) => `- ${h}`).join("\n");

      return `${proj.name}
${proj.description}
${highlights}`;
    });

    sections.push(`# PROJECTS
${projectEntries.join("\n\n")}`);
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    const certEntries = resume.certifications.map(
      (cert) => `${cert.name} - ${cert.issuer} (${cert.date})`,
    );

    sections.push(`# CERTIFICATIONS
${certEntries.join("\n")}`);
  }

  // Custom sections
  if (resume.customSections && resume.customSections.length > 0) {
    resume.customSections.forEach((section) => {
      if (section.entries && section.entries.length > 0) {
        const entries = section.entries.map((entry) => {
          const parts = [
            entry.title,
            entry.subtitle,
            entry.description,
            entry.bullets ? entry.bullets.map((b) => `- ${b}`).join("\n") : "",
          ].filter(Boolean);

          return parts.join("\n");
        });

        sections.push(`# ${section.title.toUpperCase()}
${entries.join("\n\n")}`);
      }
    });
  }

  return sections.join("\n\n");
}

/**
 * Enhances a specific bullet point for work experience or projects
 * to better match a job description requirements
 *
 * @param bulletPoint The original bullet point to enhance
 * @param jobDescription The target job description
 * @param roleContext Additional context about the role (title, company, etc.)
 * @param intensity Tailoring intensity (0-100)
 * @returns Enhanced bullet point with explanation
 */
export async function enhanceBulletPoint(
  bulletPoint: string,
  jobDescription: JobDescription,
  roleContext: {
    roleTitle: string;
    otherBullets?: string[];
  },
  intensity: number = 50,
): Promise<{
  enhancedBullet: string;
  explanation: string;
  keywordsIncorporated: string[];
}> {
  try {
    // Prepare the prompt for bullet point enhancement
    const prompt = PROMPT_TEMPLATES.BULLET_POINT_ENHANCEMENT.replace(
      "{{JOB_DESCRIPTION}}",
      jobDescription.content,
    )
      .replace("{{RESUME_BULLET}}", bulletPoint)
      .replace("{{ROLE_TITLE}}", roleContext.roleTitle)
      .replace("{{OTHER_BULLETS}}", roleContext.otherBullets?.join("\n") || "")
      .replace("{{INTENSITY}}", intensity.toString());

    // Create a tool for bullet point enhancement
    const bulletEnhancementTool = createTool(
      "bullet_enhancement",
      "Tool for enhancing resume bullet points",
      {
        type: "object",
        properties: {
          enhancedBullet: { type: "string" },
          explanation: { type: "string" },
          keywordsIncorporated: { type: "array", items: { type: "string" } }
        },
        required: ["enhancedBullet"]
      }
    );

    // Call Claude API directly for bullet point enhancement
    let claudeResponse: Anthropic.Message;
    try {
      claudeResponse = await generateCompletionDirect(prompt, {
        model: DEFAULT_CLAUDE_MODEL,
        temperature: 0.3,
        maxTokens: 1024,
        tools: [bulletEnhancementTool]
      });
    } catch (error) {
      throw handleAnthropicError(error);
    }

    // Parse Claude's response
    let enhancementData;
    try {
      enhancementData = extractStructuredData(claudeResponse, "bullet_enhancement");
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      throw new AIServiceError(
        "Failed to parse bullet point enhancement",
        parseError,
      );
    }

    // Validate response format
    if (!enhancementData || !enhancementData.enhancedBullet) {
      throw new AIServiceError(
        "Invalid bullet point enhancement response format",
      );
    }

    return {
      enhancedBullet: enhancementData.enhancedBullet,
      explanation:
        enhancementData.explanation ||
        "Bullet point enhanced to better match job requirements.",
      keywordsIncorporated: enhancementData.keywordsIncorporated || [],
    };
  } catch (error) {
    console.error("Error in enhanceBulletPoint:", error);
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw new AIServiceError("Failed to enhance bullet point", error);
  }
}

/**
 * Generates a professional summary based on resume content and job description
 *
 * @param resume The resume to base the summary on
 * @param jobDescription Optional job description to tailor the summary for
 * @returns Generated professional summary options
 */
export async function generateProfessionalSummary(
  resume: Resume,
  jobDescription?: JobDescription,
): Promise<{
  summaries: Array<{
    text: string;
    focus: string;
    wordCount: number;
    keywords: string[];
  }>;
  recommendedOption: number;
  recommendationReason: string;
}> {
  try {
    // Calculate years of experience from work experiences
    const yearsOfExperience = calculateTotalYearsExperience(
      resume.workExperiences,
    );

    // Prepare the prompt for summary generation
    const prompt = PROMPT_TEMPLATES.PROFESSIONAL_SUMMARY.replace(
      "{{RESUME}}",
      serializeResumeForATS(resume),
    )
      .replace("{{JOB_DESCRIPTION}}", jobDescription?.content || "")
      .replace("{{YEARS_EXPERIENCE}}", yearsOfExperience.toString())
      .replace(
        "{{CURRENT_SUMMARY}}",
        resume.professionalSummary?.content || "",
      );

    // Create a tool for professional summary generation
    const summaryGenerationTool = createTool(
      "professional_summary",
      "Tool for generating professional resume summaries",
      {
        type: "object",
        properties: {
          summaries: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                focus: { type: "string" },
                wordCount: { type: "number" },
                keywords: { type: "array", items: { type: "string" } }
              }
            }
          },
          recommendedOption: { type: "number" },
          recommendationReason: { type: "string" }
        },
        required: ["summaries"]
      }
    );

    // Call Claude API direct for summary generation
    let claudeResponse: Anthropic.Message;
    try {
      claudeResponse = await generateCompletionDirect(prompt, {
        model: DEFAULT_CLAUDE_MODEL,
        temperature: 0.5, // Higher temperature for creativity
        maxTokens: 1536,
        tools: [summaryGenerationTool]
      });
    } catch (error) {
      throw handleAnthropicError(error);
    }

    // Parse Claude's response
    let summaryData;
    try {
      summaryData = extractStructuredData(claudeResponse, "professional_summary");
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      throw new AIServiceError(
        "Failed to parse professional summary generation",
        parseError,
      );
    }

    // Validate response format
    if (!summaryData || !Array.isArray(summaryData.summaries)) {
      throw new AIServiceError("Invalid professional summary response format");
    }

    return {
      summaries: summaryData.summaries,
      recommendedOption: summaryData.recommendedOption || 0,
      recommendationReason:
        summaryData.recommendationReason ||
        "This option best highlights your experience and skills.",
    };
  } catch (error) {
    console.error("Error in generateProfessionalSummary:", error);
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw new AIServiceError("Failed to generate professional summary", error);
  }
}

/**
 * Extract keywords from a job description that should be included in resume
 *
 * @param jobDescription The job description to analyze
 * @returns List of important keywords with context and importance
 */
export async function extractJobKeywords(
  jobDescription: JobDescription,
): Promise<
  Array<{
    keyword: string;
    importance: "high" | "medium" | "low";
    context: string;
  }>
> {
  try {
    // If job description has already been analyzed, use existing keywords
    if (jobDescription.analysis && jobDescription.analysis.keywords) {
      return jobDescription.analysis.keywords.map((keyword) => ({
        keyword: keyword.text,
        importance:
          keyword.frequency > 2
            ? "high"
            : keyword.frequency > 1
              ? "medium"
              : "low",
        context: keyword.context || "",
      }));
    }

    // Otherwise, use skill extraction prompt
    const prompt = PROMPT_TEMPLATES.SKILL_EXTRACTION.replace(
      "{{TEXT}}",
      jobDescription.content,
    ).replace("{{TYPE}}", "job");

    // Create tool for keyword extraction
    const skillExtractionTool = createTool(
      "skill_extraction",
      "Tool for extracting skills and keywords from text",
      {
        type: "object",
        properties: {
          extractedSkills: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                confidence: { type: "string", enum: ["High", "Medium", "Low"] },
                context: { type: "string" }
              }
            }
          }
        },
        required: ["extractedSkills"]
      }
    );

    // Call Claude API direct for keyword extraction
    let claudeResponse: Anthropic.Message;
    try {
      claudeResponse = await generateCompletionDirect(prompt, {
        model: DEFAULT_CLAUDE_MODEL,
        temperature: 0.1, // Very low temperature for consistency
        maxTokens: 1536,
        tools: [skillExtractionTool]
      });
    } catch (error) {
      throw handleAnthropicError(error);
    }

    // Parse Claude's response
    let extractionData;
    try {
      extractionData = extractStructuredData(claudeResponse, "skill_extraction");
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      throw new AIServiceError(
        "Failed to parse keyword extraction",
        parseError,
      );
    }

    // Validate and transform to expected format
    if (!extractionData || !Array.isArray(extractionData.extractedSkills)) {
      throw new AIServiceError("Invalid keyword extraction response format");
    }

    return extractionData.extractedSkills
      .filter((skill: any) => skill.confidence !== "Low")
      .map((skill: any) => ({
        keyword: skill.skill,
        importance: skill.confidence === "High" ? "high" : "medium",
        context: skill.context || "",
      }));
  } catch (error) {
    console.error("Error in extractJobKeywords:", error);
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw new AIServiceError("Failed to extract job keywords", error);
  }
}

/**
 * Calculate total years of professional experience from work experiences
 *
 * @param workExperiences Array of work experiences
 * @returns Total years of experience (rounded to nearest half year)
 */
function calculateTotalYearsExperience(
  workExperiences: Resume["workExperiences"],
): number {
  if (!workExperiences || workExperiences.length === 0) {
    return 0;
  }

  const now = new Date();
  let totalDays = 0;

  workExperiences.forEach((exp) => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.current ? now : new Date(exp.endDate as string);

    // Skip invalid dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return;
    }

    // Calculate duration in days
    const durationDays =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    totalDays += durationDays;
  });

  // Convert days to years and round to nearest half year
  const years = totalDays / 365.25;
  return Math.round(years * 2) / 2;
}

/**
 * Analyze how well a resume matches a job description
 *
 * @param resume The resume to analyze
 * @param jobDescription The job description to match against
 * @returns Detailed match analysis with scores and recommendations
 */
export async function analyzeJobMatch(
  resume: Resume,
  jobDescription: JobDescription,
): Promise<{
  overallMatch: { score: number; assessment: string; recommendation: string };
  dimensionScores: Record<string, number>;
  keyStrengths: Array<{
    strength: string;
    evidence: string;
    relevance: string;
  }>;
  keyGaps: Array<{ gap: string; importance: string; mitigation: string }>;
  keywordAnalysis: {
    presentKeywords: Array<{
      keyword: string;
      context: string;
      importance: string;
    }>;
    missingKeywords: Array<{
      keyword: string;
      context: string;
      importance: string;
    }>;
  };
  tailoringRecommendations: string[];
}> {
  try {
    // Prepare the prompt for job match analysis
    const prompt = PROMPT_TEMPLATES.JOB_MATCH_ANALYSIS.replace(
      "{{RESUME}}",
      serializeResumeForATS(resume),
    ).replace("{{JOB_DESCRIPTION}}", jobDescription.content);

    // Create tool for job match analysis
    const jobMatchTool = createTool(
      "job_match_analysis",
      "Tool for analyzing how well a resume matches a job description",
      {
        type: "object",
        properties: {
          overallMatch: {
            type: "object",
            properties: {
              score: { type: "number" },
              assessment: { type: "string" },
              recommendation: { type: "string" }
            },
            required: ["score"]
          },
          dimensionScores: { type: "object" },
          keyStrengths: {
            type: "array",
            items: {
              type: "object",
              properties: {
                strength: { type: "string" },
                evidence: { type: "string" },
                relevance: { type: "string" }
              }
            }
          },
          keyGaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                gap: { type: "string" },
                importance: { type: "string" },
                mitigation: { type: "string" }
              }
            }
          },
          keywordAnalysis: {
            type: "object",
            properties: {
              presentKeywords: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    keyword: { type: "string" },
                    context: { type: "string" },
                    importance: { type: "string" }
                  }
                }
              },
              missingKeywords: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    keyword: { type: "string" },
                    context: { type: "string" },
                    importance: { type: "string" }
                  }
                }
              }
            }
          },
          tailoringRecommendations: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["overallMatch"]
      }
    );

    // Call Claude API direct for match analysis
    let claudeResponse: Anthropic.Message;
    try {
      claudeResponse = await generateCompletionDirect(prompt, {
        model: DEFAULT_CLAUDE_MODEL,
        temperature: 0.2,
        maxTokens: 2048,
        tools: [jobMatchTool]
      });
    } catch (error) {
      throw handleAnthropicError(error);
    }

    // Parse Claude's response
    let matchData;
    try {
      matchData = extractStructuredData(claudeResponse, "job_match_analysis");
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      throw new AIServiceError(
        "Failed to parse job match analysis",
        parseError,
      );
    }

    // Validate response structure
    if (!matchData || !matchData.overallMatch) {
      throw new AIServiceError("Invalid job match analysis response format");
    }

    return {
      overallMatch: matchData.overallMatch,
      dimensionScores: matchData.dimensionScores || {},
      keyStrengths: matchData.keyStrengths || [],
      keyGaps: matchData.keyGaps || [],
      keywordAnalysis: matchData.keywordAnalysis || {
        presentKeywords: [],
        missingKeywords: [],
      },
      tailoringRecommendations: matchData.tailoringRecommendations || [],
    };
  } catch (error) {
    console.error("Error in analyzeJobMatch:", error);
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw new AIServiceError("Failed to analyze job match", error);
  }
}