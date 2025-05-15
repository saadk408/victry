// File: /app/_lib/ai/prompt-builder.ts
import { Resume } from "@/models/resume";
import { JobDescription } from "@/models/job-description";
import { TailoringSettings } from "@/types/resume";

/**
 * Build a comprehensive prompt for analyzing a job description
 * This creates a structured prompt for Claude to extract relevant information
 * from a job description that can be used for resume tailoring
 */
export function buildJobAnalysisPrompt(jobDescription: string): string {
  if (!jobDescription || jobDescription.trim() === "") {
    throw new Error("Job description cannot be empty");
  }

  return `
    <instructions>
    You are Claude, acting as an expert resume consultant and job market analyst with 15+ years of experience helping candidates get interviews at top companies.
    
    Your task is to analyze the following job description and extract key information in a structured JSON format.
    
    Be thorough but concise in your analysis. Identify patterns in language and requirements that reveal what the employer prioritizes.
    </instructions>
    
    <job_description>
    ${jobDescription}
    </job_description>
    
    Analyze the above job description and provide a detailed breakdown in the following JSON format:
    
    \`\`\`json
    {
      "hardSkills": [
        {"skill": "skill name", "importance": "must_have|nice_to_have|preferred", "frequency": number, "context": "brief context where this appears"}
      ],
      "softSkills": [
        {"skill": "skill name", "importance": "must_have|nice_to_have|preferred", "frequency": number, "context": "brief context where this appears"}
      ],
      "experienceLevel": {
        "level": "entry|junior|mid|senior|executive",
        "yearsRequired": number or null,
        "confidence": number between 0-1,
        "reasoning": "brief explanation"
      },
      "qualifications": {
        "education": [
          {"type": "degree type", "field": "field of study", "importance": "must_have|nice_to_have|preferred"}
        ],
        "certifications": [
          {"name": "certification name", "importance": "must_have|nice_to_have|preferred"}
        ],
        "experience": [
          {"description": "experience description", "importance": "must_have|nice_to_have|preferred"}
        ]
      },
      "keywords": [
        {"text": "keyword", "frequency": number, "importance": "high|medium|low"}
      ],
      "companyCulture": [
        {"trait": "cultural value or trait", "evidence": "brief text supporting this"}
      ],
      "jobTitle": {
        "parsed": "standardized job title",
        "alternatives": ["similar job title 1", "similar job title 2"]
      },
      "industry": "identified industry",
      "companySize": "startup|small|medium|large|enterprise" or null,
      "remoteStatus": "remote|hybrid|onsite" or null
    }
    \`\`\`
    
    Guidelines for your analysis:
    - Hard skills: Technical abilities, tools, software, programming languages, or specific methodologies
    - Soft skills: Interpersonal capabilities, communication skills, personality traits
    - For importance, use "must_have" for clearly required elements, "nice_to_have" for explicitly mentioned preferences, and "preferred" for implied preferences
    - Experience level should evaluate seniority level based on responsibilities, leadership requirements, and years of experience mentioned
    - Keywords should capture terms appearing multiple times or highlighted in the description
    - Company culture should identify values, work environment traits, and management style indicators
    
    Ensure your JSON is valid and follows the exact structure requested.
  `;
}

/**
 * Build a detailed prompt for tailoring a resume based on a job description
 * This guides Claude in generating a customized version of the resume
 * with options for voice preservation, tailoring intensity, and keyword focus
 */
export function buildResumeTailoringPrompt(
  resume: Resume,
  jobDescription: JobDescription,
  settings: TailoringSettings = {} as TailoringSettings,
): string {
  if (!resume) throw new Error("Resume cannot be null or undefined");
  if (!jobDescription)
    throw new Error("Job description cannot be null or undefined");
  if (!jobDescription.content)
    throw new Error("Job description content cannot be empty");

  const intensity = settings?.intensity || 50;
  const intensityLevel =
    intensity < 33 ? "low" : intensity < 66 ? "medium" : "high";
  const preserveVoice =
    settings?.preserveVoice !== undefined ? settings.preserveVoice : true;
  const focusKeywords =
    settings?.focusKeywords !== undefined ? settings.focusKeywords : true;

  // Extract job analysis if available
  const analysisSection = jobDescription.analysis
    ? `
    <job_analysis>
    ${JSON.stringify(jobDescription.analysis, null, 2)}
    </job_analysis>
  `
    : "";

  return `
    <instructions>
    You are Claude, acting as an expert resume tailoring consultant with extensive experience helping candidates secure interviews at competitive companies.
    
    Your task is to tailor the provided resume to better match the job description, following specific guidelines on tailoring intensity, voice preservation, and keyword focus.
    </instructions>
    
    <resume>
    ${JSON.stringify(resume, null, 2)}
    </resume>
    
    <job_description>
    ${jobDescription.content}
    </job_description>
    
    ${analysisSection}
    
    <tailoring_settings>
    - Tailoring intensity: ${intensityLevel} (${intensity}/100)
    - Preserve original voice and style: ${preserveVoice ? "Yes" : "No"}
    - Focus on keyword matching: ${focusKeywords ? "Yes" : "No"}
    </tailoring_settings>
    
    <tailoring_guidelines>
    ## Intensity Guidelines (${intensityLevel}):
    ${
      intensityLevel === "low"
        ? `
    - Make subtle improvements to match the job description
    - Focus on minor wording adjustments and order of information
    - Primarily adjust the professional summary and skills sections
    - Retain most of the original content and structure
    `
        : intensityLevel === "medium"
          ? `
    - Make moderate changes to better align with the job description
    - Rephrase bullet points to emphasize relevant experience
    - Adjust terminology throughout to match the job description
    - Reorganize content to prioritize the most relevant experiences
    `
          : `
    - Make substantial changes to strongly align with the job description
    - Significantly rework bullet points and section content
    - Reframe experiences to directly address job requirements
    - Aggressively incorporate keywords and reorganize for relevance
    `
    }
    
    ## Voice Preservation Guidelines (${preserveVoice ? "Enabled" : "Disabled"}):
    ${
      preserveVoice
        ? `
    - Maintain the candidate's unique writing style and tone
    - Preserve sentence structure patterns when possible
    - Keep distinctive phrases and personal expressions
    - Ensure changes sound authentic to the candidate's voice
    `
        : `
    - Focus on optimal wording for the job rather than voice consistency
    - Use industry-standard terminology and phrasing
    - Implement best practices for resume writing
    - Prioritize clarity and impact over personal style
    `
    }
    
    ## Keyword Focus Guidelines (${focusKeywords ? "Enabled" : "Disabled"}):
    ${
      focusKeywords
        ? `
    - Incorporate key terms from the job description throughout
    - Ensure exact keyword matches when appropriate
    - Replace generic terms with specific terms from the listing
    - Include industry jargon and technical terminology
    `
        : `
    - Focus on conceptual alignment rather than exact keyword matching
    - Emphasize relevant experiences and skills regardless of terminology
    - Aim for natural language rather than keyword stuffing
    - Maintain readability and flow over keyword density
    `
    }
    </tailoring_guidelines>
    
    <section_specific_guidelines>
    ## Professional Summary:
    - Align career narrative with the target position
    - Highlight most relevant skills and experiences for this role
    - Set appropriate career level and trajectory
    
    ## Work Experience:
    - Prioritize achievements relevant to the target role
    - Use strong action verbs and quantifiable results
    - Focus on transferable skills if changing industries
    - For each bullet point, ensure it demonstrates value and relevance
    
    ## Skills:
    - Reorganize to prioritize skills mentioned in the job description
    - Match terminology used in the job listing
    - Remove skills with low relevance to create focus
    
    ## Education and Certifications:
    - Highlight relevant coursework or projects if applicable
    - Emphasize education that aligns with job requirements
    </section_specific_guidelines>
    
    <output_format>
    Return the tailored resume as a valid JSON object that matches the exact structure of the original resume object, with your tailored changes applied. Do not add or remove fields from the original structure.
    
    Additionally, provide a separate JSON object with your tailoring notes:
    
    \`\`\`json
    {
      "tailoredResume": {
        // Full modified resume JSON here
      },
      "tailoringNotes": {
        "summary": "Brief overview of changes made",
        "keywordMatches": [
          {"keyword": "matched term", "source": "original|added", "section": "section name"}
        ],
        "majorChanges": [
          {"section": "section name", "description": "description of significant change"}
        ],
        "improvementSuggestions": [
          {"suggestion": "suggestion description", "reasoning": "why this would help"}
        ]
      }
    }
    \`\`\`
    </output_format>
    
    Remember to:
    1. Never fabricate experience or qualifications
    2. Keep changes appropriate to the tailoring intensity level
    3. Ensure all content remains truthful and authentic
    4. Preserve the candidate's voice as specified in the settings
    5. Return the complete tailored resume in valid JSON format
  `;
}

/**
 * Build a prompt for enhancing a bullet point to be more impactful
 * This creates targeted prompts for individual bullet point improvements
 */
export function buildBulletPointEnhancementPrompt(
  bulletPoint: string,
  jobContext: string,
  keywords: string[] = [],
  preserveVoice: boolean = true,
): string {
  if (!bulletPoint || bulletPoint.trim() === "") {
    throw new Error("Bullet point cannot be empty");
  }

  return `
    <instructions>
    You are Claude, acting as an expert resume bullet point optimizer who specializes in creating impactful, achievement-oriented bullet points.
    
    Your task is to enhance the provided bullet point to make it more effective for a job application, while maintaining authenticity and accuracy.
    </instructions>
    
    <original_bullet_point>
    ${bulletPoint}
    </original_bullet_point>
    
    <job_context>
    ${jobContext}
    </job_context>
    
    <keywords>
    ${keywords.join(", ")}
    </keywords>
    
    <voice_preservation>
    ${preserveVoice ? "Maintain the original voice and writing style." : "Optimize for clarity and impact over maintaining original voice."}
    </voice_preservation>
    
    <enhancement_guidelines>
    Enhance this bullet point following these principles:
    
    1. Start with a strong action verb appropriate to the achievement
    2. Incorporate measurable results and specific metrics when possible
    3. Highlight the impact or outcome of the action
    4. Include relevant keywords from the provided list when natural
    5. Maintain approximately the same length as the original
    6. Ensure the enhancement is truthful and doesn't exaggerate
    7. Make the accomplishment clear and concrete
    8. Avoid vague language and generalities
    </enhancement_guidelines>
    
    <output_format>
    Respond with the enhanced bullet point only, without explanation or additional formatting.
    </output_format>
  `;
}

/**
 * Build a prompt for analyzing a resume's ATS compatibility
 * Evaluates how well the resume will perform with Applicant Tracking Systems
 */
export function buildATSScorePrompt(
  resume: Resume,
  jobDescription: JobDescription,
): string {
  if (!resume) throw new Error("Resume cannot be null or undefined");
  if (!jobDescription)
    throw new Error("Job description cannot be null or undefined");

  return `
    <instructions>
    You are Claude, acting as an expert ATS (Applicant Tracking System) optimization consultant with deep knowledge of how modern ATS systems parse and score resumes.
    
    Your task is to evaluate the provided resume against the job description and provide an ATS compatibility score along with detailed feedback.
    </instructions>
    
    <resume>
    ${JSON.stringify(resume, null, 2)}
    </resume>
    
    <job_description>
    ${jobDescription.content}
    </job_description>
    
    <ats_evaluation_criteria>
    Evaluate the resume on these key ATS compatibility factors:
    
    1. Keyword matching: Presence of key terms from the job description
    2. Keyword placement: Strategic use of keywords in important sections
    3. Formatting: Clean structure that ATS systems can parse correctly
    4. Content relevance: Alignment of experience with job requirements
    5. Section organization: Proper labeling and organization of sections
    6. File type compatibility: Considerations based on the intended format
    7. Readability: Balance between keyword optimization and human readability
    </ats_evaluation_criteria>
    
    <output_format>
    Provide your evaluation in this JSON format:
    
    \`\`\`json
    {
      "atsScore": {
        "score": number between 0-100,
        "overall": "brief summary of overall compatibility"
      },
      "keywordAnalysis": {
        "matchedKeywords": [
          {"keyword": "matched term", "frequency": number, "sections": ["section names"]}
        ],
        "missingKeywords": [
          {"keyword": "missing term", "importance": "high|medium|low"}
        ]
      },
      "sectionScores": [
        {"section": "section name", "score": number between 0-100, "feedback": "specific feedback"}
      ],
      "improvementSuggestions": [
        {"category": "category name", "suggestion": "specific recommendation", "impact": "high|medium|low"}
      ]
    }
    \`\`\`
    </output_format>
    
    Provide specific, actionable feedback that will help the candidate improve their ATS score while maintaining the authenticity and truthfulness of their resume.
  `;
}

/**
 * Build a prompt for generating a cover letter based on a resume and job description
 */
export function buildCoverLetterPrompt(
  resume: Resume,
  jobDescription: JobDescription,
  additionalInfo: {
    companyName?: string;
    hiringManager?: string;
    whyInterested?: string;
    tone?: "formal" | "conversational" | "enthusiastic";
  } = {},
): string {
  if (!resume) throw new Error("Resume cannot be null or undefined");
  if (!jobDescription)
    throw new Error("Job description cannot be null or undefined");

  const tone = additionalInfo.tone || "conversational";

  return `
    <instructions>
    You are Claude, acting as an expert cover letter writer specializing in creating compelling, personalized cover letters that complement resumes and address specific job requirements.
    
    Your task is to generate a cover letter based on the provided resume and job description, following the specified tone and incorporating any additional information provided.
    </instructions>
    
    <resume>
    ${JSON.stringify(resume, null, 2)}
    </resume>
    
    <job_description>
    ${jobDescription.content}
    </job_description>
    
    <additional_information>
    Company name: ${additionalInfo.companyName || "Not provided"}
    Hiring manager: ${additionalInfo.hiringManager || "Not provided"}
    Why interested in this role: ${additionalInfo.whyInterested || "Not provided"}
    Desired tone: ${tone}
    </additional_information>
    
    <tone_guidelines>
    ${
      tone === "formal"
        ? `
    - Use professional, somewhat traditional language
    - Maintain a respectful, business-appropriate tone
    - Minimize personal anecdotes
    - Structure with clear, formal paragraphs
    `
        : tone === "conversational"
          ? `
    - Use a warm, approachable tone
    - Balance professionalism with personability
    - Include some personality while maintaining credibility
    - Use natural language patterns
    `
          : `
    - Express genuine excitement for the role and company
    - Use dynamic, passionate language 
    - Emphasize forward-looking statements
    - Convey energy while maintaining professionalism
    `
    }
    </tone_guidelines>
    
    <cover_letter_guidelines>
    Structure the cover letter with:
    
    1. A compelling introduction that:
       - Mentions the specific position
       - Includes a strong opening statement
       - References how you learned about the role (if provided)
    
    2. A focused body that:
       - Highlights 2-3 most relevant achievements from the resume
       - Connects past experience to specific job requirements
       - Demonstrates understanding of the company's needs
       - Incorporates important keywords from the job description
    
    3. A conclusion that:
       - Expresses interest in further discussion
       - Includes a clear call to action
       - Thanks the reader for their consideration
       - Maintains the specified tone
    
    Additional guidelines:
    - Keep the letter between 250-350 words
    - Avoid clichés and generic language
    - Don't simply repeat the resume content
    - Make specific connections to the company/role
    - Ensure proper addressing (use hiring manager name if provided)
    </cover_letter_guidelines>
    
    <output_format>
    Return a complete cover letter in plain text format, formatted with appropriate paragraph breaks, salutation, and signature.
    </output_format>
  `;
}
