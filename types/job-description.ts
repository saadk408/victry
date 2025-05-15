// File: /models/job-description.ts
/**
 * Models and interfaces related to job descriptions.
 * These are used for storing job listings, analyzing their content,
 * and tailoring resumes to match job requirements.
 */

/**
 * Represents a specific requirement extracted from a job description.
 * Used to categorize and prioritize skills, qualifications, and experiences.
 */
export interface JobRequirement {
  /** Unique identifier for the requirement */
  id: string;

  /** Category of the requirement */
  type:
    | "hard_skill"
    | "soft_skill"
    | "experience"
    | "education"
    | "certification"
    | "other";

  /** The actual requirement text */
  content: string;

  /** Importance level of the requirement */
  importance: "must_have" | "nice_to_have" | "preferred";

  /** Whether this requirement appears in multiple sections of the job description */
  isRepeated?: boolean;

  /** The section(s) of the job description where this requirement was found */
  sourceSections?: string[];
}

/**
 * Represents a keyword extracted from a job description.
 * Used for ATS optimization and matching with resume content.
 */
export interface JobKeyword {
  /** Unique identifier for the keyword */
  id: string;

  /** The keyword text */
  text: string;

  /** Number of occurrences in the job description */
  frequency: number;

  /** Surrounding text or section where the keyword appears */
  context?: string;

  /** Whether this is an industry-specific term */
  isIndustrySpecific?: boolean;

  /** Whether this keyword relates to tools, technologies, or specific skills */
  category?:
    | "tool"
    | "technology"
    | "skill"
    | "certification"
    | "degree"
    | "soft_skill"
    | "other";
}

/**
 * Represents the analysis of a job description performed by AI.
 * Used to extract structured data from unstructured job listings.
 */
export interface JobAnalysis {
  /** Unique identifier for the analysis */
  id: string;

  /** Reference to the analyzed job description */
  jobDescriptionId: string;

  /** List of requirements extracted from the job description */
  requirements: JobRequirement[];

  /** Important keywords extracted from the job description */
  keywords: JobKeyword[];

  /** Detected experience level (entry, mid, senior, etc.) */
  experienceLevel:
    | "entry"
    | "junior"
    | "mid"
    | "senior"
    | "executive"
    | "unspecified";

  /** Cultural values and work environment indicators */
  companyCulture: string[];

  /** When the analysis was performed */
  createdAt: string;

  /** Estimated salary range if mentioned (in local currency) */
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
    isExplicit: boolean; // Whether salary was explicitly stated or estimated
  };

  /** Primary industry or sector */
  industry?: string;

  /** Department or team within the organization */
  department?: string;

  /** Employment type (full-time, part-time, contract, etc.) */
  employmentType?:
    | "full-time"
    | "part-time"
    | "contract"
    | "temporary"
    | "internship"
    | "other";

  /** Whether remote work is available */
  remoteWork?: "remote" | "hybrid" | "on-site" | "unspecified";

  /** Key responsibilities extracted from the job description */
  responsibilities?: string[];

  /** Estimated ATS compatibility score (0-100) */
  atsCompatibilityScore?: number;
}

/**
 * Represents a job description saved by a user.
 * Core entity for job matching and resume tailoring functionality.
 */
export interface JobDescription {
  /** Unique identifier for the job description */
  id: string;

  /** User who saved this job description */
  userId: string;

  /** Job title */
  title: string;

  /** Company or organization name */
  company: string;

  /** Job location (city, state, country, or "Remote") */
  location: string;

  /** Full text content of the job description */
  content: string;

  /** URL of the original job posting (optional) */
  url?: string;

  /** Application deadline date in ISO format (optional) */
  applicationDeadline?: string;

  /** When the job description was created */
  createdAt: string;

  /** When the job description was last updated */
  updatedAt: string;

  /** AI-generated analysis of the job description (optional) */
  analysis?: JobAnalysis;

  /** Whether the job has been applied to */
  hasApplied?: boolean;

  /** Date of application in ISO format (if applied) */
  applicationDate?: string;

  /** Application status if tracked by the user */
  applicationStatus?:
    | "not_applied"
    | "applied"
    | "interviewing"
    | "offered"
    | "rejected"
    | "accepted"
    | "declined";

  /** Application status notes */
  notes?: string;

  /** Whether this is a favorite/saved job */
  isFavorite?: boolean;

  /** User-assigned tags for organization */
  tags?: string[];

  /** Employment type if specified */
  employmentType?:
    | "full-time"
    | "part-time"
    | "contract"
    | "temporary"
    | "internship"
    | "other";

  /** Whether the position is remote, hybrid, or on-site */
  workplaceType?: "remote" | "hybrid" | "on-site" | "unspecified";

  /** Whether the job description is active/current */
  isActive?: boolean;
}

/**
 * Types of job requirements for categorization
 */
export type RequirementType =
  | "hard_skill"
  | "soft_skill"
  | "experience"
  | "education"
  | "certification"
  | "other";

/**
 * Importance levels for job requirements
 */
export type RequirementImportance = "must_have" | "nice_to_have" | "preferred";

/**
 * Application status types for tracking job applications
 */
export type ApplicationStatus =
  | "not_applied"
  | "applied"
  | "interviewing"
  | "offered"
  | "rejected"
  | "accepted"
  | "declined";

/**
 * Experience levels for job positions
 */
export type ExperienceLevel =
  | "entry"
  | "junior"
  | "mid"
  | "senior"
  | "executive"
  | "unspecified";

/**
 * Employment types
 */
export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "temporary"
  | "internship"
  | "other";

/**
 * Workplace types
 */
export type WorkplaceType = "remote" | "hybrid" | "on-site" | "unspecified";
