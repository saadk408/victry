// File: /types/api.ts
import { Resume } from "../models/resume";
import {
  JobDescription,
  JobAnalysis,
  JobRequirement,
  JobKeyword,
} from "../models/job-description";
import {
  ATSScoreResult,
  KeywordMatch,
  TailoringSettings,
  ResumeTemplate,
} from "./resume";
import { User, SubscriptionTier } from "../models/user";

/**
 * Pagination metadata returned with list responses
 */
export interface PaginationMetadata {
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there are more pages after the current one */
  hasMore: boolean;
}

// ======== Resume API Types ========

/**
 * Request type for creating a new resume
 * Omits server-generated fields
 */
export type CreateResumeRequest = Omit<
  Resume,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

/**
 * Request type for updating an existing resume
 * All fields are optional to support partial updates
 */
export type UpdateResumeRequest = Partial<
  Omit<Resume, "id" | "userId" | "createdAt" | "updatedAt">
>;

/**
 * Single resume response
 */
export type ResumeResponse = Resume;

/**
 * Multiple resumes response with pagination
 */
export interface ResumesResponse {
  /** Array of resume objects */
  data: Resume[];
  /** Total count of resumes matching the query */
  count: number;
  /** Pagination metadata */
  pagination?: PaginationMetadata;
}

/**
 * Request type for duplicating a resume
 */
export interface DuplicateResumeRequest {
  /** ID of the source resume to duplicate */
  sourceResumeId: string;
  /** Optional new title for the duplicated resume */
  newTitle?: string;
  /** Optional flag to create as a new base resume */
  asBaseResume?: boolean;
}

// ======== Job Description API Types ========

/**
 * Request type for creating a new job description
 * Omits server-generated fields
 */
export type CreateJobDescriptionRequest = Omit<
  JobDescription,
  "id" | "userId" | "createdAt" | "updatedAt" | "analysis"
>;

/**
 * Request type for updating an existing job description
 * All fields are optional to support partial updates
 */
export type UpdateJobDescriptionRequest = Partial<
  Omit<JobDescription, "id" | "userId" | "createdAt" | "updatedAt" | "analysis">
>;

/**
 * Single job description response
 */
export type JobDescriptionResponse = JobDescription;

/**
 * Multiple job descriptions response with pagination
 */
export interface JobDescriptionsResponse {
  /** Array of job description objects */
  data: JobDescription[];
  /** Total count of job descriptions matching the query */
  count: number;
  /** Pagination metadata */
  pagination?: PaginationMetadata;
}

/**
 * Request params for updating application status
 */
export interface UpdateApplicationStatusRequest {
  /** New application status */
  status:
    | "not_applied"
    | "applied"
    | "interviewing"
    | "offered"
    | "rejected"
    | "accepted"
    | "declined";
  /** Optional notes about the application */
  notes?: string;
  /** Optional application date, defaults to current date if status is 'applied' */
  applicationDate?: string;
}

// ======== AI API Types ========

/**
 * Request for analyzing a job description
 */
export interface AnalyzeJobRequest {
  /** ID of the job description to analyze */
  jobDescriptionId: string;
}

/**
 * Response from job description analysis
 */
export interface AnalyzeJobResponse {
  /** Structured analysis of the job description */
  analysis: JobAnalysis;
}

/**
 * Request for tailoring a resume to a job description
 */
export interface TailorResumeRequest {
  /** ID of the resume to tailor */
  resumeId: string;
  /** ID of the job description to tailor to */
  jobDescriptionId: string;
  /** Tailoring settings to control the AI */
  settings: TailoringSettings;
}

/**
 * Response from resume tailoring
 */
export interface TailorResumeResponse {
  /** The tailored resume */
  tailoredResume: Resume;
  /** ATS compatibility score for the tailored resume */
  atsScore: ATSScoreResult;
  /** Keywords matched between resume and job description */
  keywordMatches: KeywordMatch[];
}

/**
 * Request for AI enhancement of a bullet point
 */
export interface EnhanceBulletRequest {
  /** Original bullet text */
  bulletText: string;
  /** Job description ID to target */
  jobDescriptionId: string;
  /** Role context information */
  roleContext: {
    /** Job title */
    roleTitle: string;
    /** Other bullets in the same section (for context) */
    otherBullets?: string[];
  };
  /** Tailoring intensity (0-100) */
  intensity?: number;
}

/**
 * Response from bullet point enhancement
 */
export interface EnhanceBulletResponse {
  /** Enhanced bullet text */
  enhancedBullet: string;
  /** Explanation of changes made */
  explanation: string;
  /** Keywords incorporated from job description */
  keywordsIncorporated: string[];
}

/**
 * Request for generating a professional summary
 */
export interface GenerateSummaryRequest {
  /** Resume ID to use as basis */
  resumeId: string;
  /** Optional job description ID to tailor to */
  jobDescriptionId?: string;
}

/**
 * Response from professional summary generation
 */
export interface GenerateSummaryResponse {
  /** Multiple summary options */
  summaries: Array<{
    /** Summary text */
    text: string;
    /** Focus or emphasis of this version */
    focus: string;
    /** Word count */
    wordCount: number;
    /** Keywords included */
    keywords: string[];
  }>;
  /** Index of recommended option */
  recommendedOption: number;
  /** Reason for recommendation */
  recommendationReason: string;
}

/**
 * Request for extracting keywords from a job description
 */
export interface ExtractKeywordsRequest {
  /** ID of the job description */
  jobDescriptionId: string;
}

/**
 * Response from keyword extraction
 */
export interface ExtractKeywordsResponse {
  /** Extracted keywords with importance and context */
  keywords: Array<{
    /** Keyword text */
    keyword: string;
    /** Importance level */
    importance: "high" | "medium" | "low";
    /** Context where keyword appears */
    context: string;
  }>;
}

/**
 * Request for job match analysis
 */
export interface JobMatchRequest {
  /** Resume ID to analyze */
  resumeId: string;
  /** Job description ID to match against */
  jobDescriptionId: string;
}

/**
 * Response from job match analysis
 */
export interface JobMatchResponse {
  /** Overall match assessment */
  overallMatch: {
    /** Match score (0-100) */
    score: number;
    /** Textual assessment */
    assessment: string;
    /** General recommendation */
    recommendation: string;
  };
  /** Scores for different dimensions of matching */
  dimensionScores: Record<string, number>;
  /** Key strengths of the resume for this job */
  keyStrengths: Array<{
    /** Strength description */
    strength: string;
    /** Evidence from resume */
    evidence: string;
    /** Relevance to job */
    relevance: string;
  }>;
  /** Key gaps between resume and job requirements */
  keyGaps: Array<{
    /** Gap description */
    gap: string;
    /** Importance of addressing */
    importance: string;
    /** Suggestion to mitigate */
    mitigation: string;
  }>;
  /** Keyword matching analysis */
  keywordAnalysis: {
    /** Keywords found in resume */
    presentKeywords: Array<{
      /** Keyword text */
      keyword: string;
      /** Where it appears */
      context: string;
      /** Importance to job */
      importance: string;
    }>;
    /** Keywords from job missing in resume */
    missingKeywords: Array<{
      /** Keyword text */
      keyword: string;
      /** Where it appears in job */
      context: string;
      /** Importance to job */
      importance: string;
    }>;
  };
  /** Recommendations for tailoring */
  tailoringRecommendations: string[];
}

/**
 * Request for generating cover letter
 */
export interface GenerateCoverLetterRequest {
  /** Resume ID to use as basis */
  resumeId: string;
  /** Job description ID to tailor to */
  jobDescriptionId: string;
  /** Optional customization parameters */
  options?: {
    /** Tone of the letter */
    tone?: "formal" | "conversational" | "enthusiastic";
    /** Length preference */
    length?: "concise" | "standard" | "detailed";
    /** Specific aspects to emphasize */
    emphasize?: ("experience" | "skills" | "culture_fit" | "achievements")[];
    /** Custom introduction paragraph */
    customIntro?: string;
    /** Custom closing paragraph */
    customClosing?: string;
  };
}

/**
 * Response for cover letter generation
 */
export interface GenerateCoverLetterResponse {
  /** Cover letter content */
  content: string;
  /** Analysis of the cover letter */
  analysis: {
    /** Areas highlighted in the letter */
    highlightedAreas: string[];
    /** Keywords incorporated */
    keywords: string[];
    /** Suggestions for improvement */
    suggestions?: string[];
  };
}

// ======== Export/Import API Types ========

/**
 * Request for exporting a resume to PDF
 */
export interface ExportPdfRequest {
  /** ID of the resume to export */
  resumeId: string;
  /** Optional export settings */
  settings?: {
    /** Paper size */
    paperSize?: "a4" | "letter" | "legal";
    /** Margin size in mm */
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    /** Include QR code with link */
    includeQrCode?: boolean;
    /** Whether to include contact info */
    includeContactInfo?: boolean;
  };
}

/**
 * Response for PDF export
 */
export interface ExportPdfResponse {
  /** URL to download the PDF */
  downloadUrl: string;
  /** Expiration time of download URL */
  expiresAt: string;
}

/**
 * Request for importing a resume from file
 */
export interface ImportResumeRequest {
  /** File format */
  format: "pdf" | "docx" | "txt" | "json";
  /** Whether to attempt AI enhancement during import */
  enhanceWithAI?: boolean;
  /** Resume title */
  title?: string;
  /** Target job title */
  targetJobTitle?: string;
}

/**
 * Response for resume import
 */
export interface ImportResumeResponse {
  /** ID of the created resume */
  resumeId: string;
  /** Import success status */
  success: boolean;
  /** Confidence level of the import (0-100) */
  confidenceScore: number;
  /** Fields that couldn't be extracted */
  missingFields?: string[];
  /** Fields that may need review */
  uncertainFields?: string[];
  /** Suggestions for improvement */
  suggestions?: string[];
}

// ======== User API Types ========

/**
 * Request for user registration
 */
export interface RegisterRequest {
  /** Email address */
  email: string;
  /** Password */
  password: string;
  /** Password confirmation */
  confirmPassword: string;
  /** Optional first name */
  firstName?: string;
  /** Optional last name */
  lastName?: string;
  /** Acceptance of terms */
  termsAccepted: boolean;
}

/**
 * Request for user login
 */
export interface LoginRequest {
  /** Email address */
  email: string;
  /** Password */
  password: string;
  /** Whether to remember the session */
  rememberMe?: boolean;
}

/**
 * User authentication response
 */
export interface AuthResponse {
  /** Authentication token */
  token: string;
  /** Token expiration */
  expiresAt: string;
  /** Refresh token */
  refreshToken: string;
  /** User profile data */
  user: Omit<User, "passwordHash">;
}

/**
 * Request for updating user profile
 */
export interface UpdateProfileRequest {
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** Professional profile updates */
  professionalProfile?: User["professionalProfile"];
  /** User preferences */
  preferences?: User["preferences"];
}

/**
 * Response for user profile
 */
export type ProfileResponse = Omit<User, "passwordHash" | "refreshToken">;

// ======== Subscription/Payment API Types ========

/**
 * Available subscription plans
 */
export interface SubscriptionPlan {
  /** Plan ID */
  id: string;
  /** Plan name */
  name: string;
  /** Monthly price in cents */
  priceMonthly: number;
  /** Annual price in cents */
  priceAnnually: number;
  /** Features included */
  features: string[];
  /** Maximum number of resumes */
  maxResumes: number;
  /** Maximum number of tailored resumes */
  maxTailoredResumes: number;
  /** Whether cover letter generation is included */
  includeCoverLetter: boolean;
  /** Whether advanced ATS features are included */
  includeAdvancedAts: boolean;
  /** Whether premium templates are included */
  includePremiumTemplates: boolean;
}

/**
 * Request for creating a subscription
 */
export interface CreateSubscriptionRequest {
  /** Plan ID to subscribe to */
  planId: string;
  /** Billing frequency */
  billingFrequency: "monthly" | "annually";
  /** Payment method details from payment provider */
  paymentMethodId: string;
  /** Optional coupon code */
  couponCode?: string;
  /** Billing address */
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  /** Tax ID information */
  taxId?: {
    type: "vat" | "gst" | "ein" | "other";
    value: string;
  };
}

/**
 * Response for subscription operations
 */
export interface SubscriptionResponse {
  /** Subscription ID */
  id: string;
  /** Plan ID */
  planId: string;
  /** Subscription status */
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
  /** Current period start */
  currentPeriodStart: string;
  /** Current period end */
  currentPeriodEnd: string;
  /** Billing frequency */
  billingFrequency: "monthly" | "annually";
  /** Amount billed */
  amount: number;
  /** Currency code */
  currency: string;
  /** Subscription tier */
  tier: SubscriptionTier;
}

/**
 * Request for canceling subscription
 */
export interface CancelSubscriptionRequest {
  /** Subscription ID */
  subscriptionId: string;
  /** Reason for cancellation */
  cancellationReason?: string;
  /** Whether to cancel immediately or at period end */
  cancelImmediately?: boolean;
}

// ======== Template API Types ========

/**
 * Response for listing resume templates
 */
export interface TemplatesResponse {
  /** Available templates */
  templates: ResumeTemplate[];
  /** Featured templates */
  featured?: ResumeTemplate[];
  /** Premium templates */
  premium?: ResumeTemplate[];
}

// ======== Analytics API Types ========

/**
 * Application usage analytics
 */
export interface UsageAnalyticsResponse {
  /** Number of resumes created */
  resumesCreated: number;
  /** Number of tailored resumes created */
  tailoredResumesCreated: number;
  /** Number of ATS checks performed */
  atsChecksPerformed: number;
  /** Number of exports */
  exports: {
    /** Total exports */
    total: number;
    /** By format */
    byFormat: Record<string, number>;
  };
  /** Number of job descriptions saved */
  jobDescriptionsSaved: number;
  /** Application tracking */
  applications: {
    /** Total applications tracked */
    total: number;
    /** By status */
    byStatus: Record<string, number>;
  };
  /** AI operations */
  aiOperations: {
    /** Total AI operations */
    total: number;
    /** By type */
    byType: Record<string, number>;
  };
}

/**
 * Error response for API errors
 */
export interface ApiErrorResponse {
  /** Error message */
  error: string;
  /** Optional error code */
  code?: string;
  /** Optional field-specific validation errors */
  validationErrors?: Array<{
    /** Field with error */
    field: string;
    /** Error message */
    message: string;
  }>;
  /** Optional request ID for debugging */
  requestId?: string;
}
