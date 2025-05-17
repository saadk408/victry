// File: /models/resume.ts
/**
 * Data models for the resume functionality in the Victry application.
 * These interfaces define the structure of resume data used throughout the application.
 */

/**
 * Personal and contact information for the resume owner
 */
export interface PersonalInfo {
  /** Full name of the resume owner */
  fullName: string;
  /** Primary email address */
  email: string;
  /** Phone number with optional formatting */
  phone: string;
  /** Location (city, state, country) */
  location: string;
  /** LinkedIn profile URL (optional) */
  linkedIn?: string;
  /** Personal website URL (optional) */
  website?: string;
  /** GitHub profile URL (optional) */
  github?: string;
  /** Additional optional contact information */
  additionalInfo?: Record<string, string>;
}

/**
 * Professional summary or objective statement
 */
export interface ProfessionalSummary {
  /** Content of the professional summary */
  content: string;
}

/**
 * Work experience entry representing a job position
 */
export interface WorkExperience {
  /** Unique identifier for the work experience */
  id: string;
  /** Company or organization name */
  company: string;
  /** Job title or position */
  position: string;
  /** Location of the job (city, remote, etc.) */
  location: string;
  /** Start date in ISO string format (YYYY-MM-DD) */
  startDate: string;
  /** End date in ISO string format (YYYY-MM-DD), null if current */
  endDate: string | null;
  /** Whether this is a current position */
  current: boolean;
  /** Bullet points describing responsibilities and achievements */
  highlights: string[];
  /** Job description (optional longer format) */
  description?: string;
  /** Industry or sector (optional) */
  industry?: string;
  /** Department or team (optional) */
  department?: string;
}

/**
 * Education entry representing a degree, certificate, or program
 */
export interface Education {
  /** Unique identifier for the education entry */
  id: string;
  /** Institution name (university, college, school) */
  institution: string;
  /** Degree type (BS, MS, PhD, etc.) */
  degree: string;
  /** Field or area of study */
  field: string;
  /** Location of the institution */
  location: string;
  /** Start date in ISO string format (YYYY-MM-DD) */
  startDate: string;
  /** End date in ISO string format (YYYY-MM-DD), null if current */
  endDate: string | null;
  /** Whether this is a current program */
  current: boolean;
  /** Grade point average (optional) */
  gpa?: string;
  /** Additional achievements or coursework (optional) */
  highlights?: string[];
  /** Academic honors or achievements (optional) */
  honors?: string[];
  /** Thesis or dissertation title (optional) */
  thesis?: string;
}

/**
 * Skill entry with optional proficiency level and category
 */
export interface Skill {
  /** Unique identifier for the skill */
  id: string;
  /** Skill name */
  name: string;
  /** Proficiency level (optional) */
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  /** Skill category for grouping (optional) */
  category?: string;
  /** Years of experience with this skill (optional) */
  yearsOfExperience?: number;
  /** Whether this skill is highlighted as a key skill */
  isKeySkill?: boolean;
}

/**
 * Project entry showcasing achievements and practical experience
 */
export interface Project {
  /** Unique identifier for the project */
  id: string;
  /** Project name or title */
  name: string;
  /** Short project description */
  description: string;
  /** Start date in ISO string format (YYYY-MM-DD) (optional) */
  startDate?: string;
  /** End date in ISO string format (YYYY-MM-DD) (optional) */
  endDate?: string;
  /** Project URL or link (optional) */
  url?: string;
  /** Bullet points describing accomplishments and responsibilities */
  highlights: string[];
  /** Technologies or tools used (optional) */
  technologies?: string[];
  /** Project role or position (optional) */
  role?: string;
  /** Associated organization or client (optional) */
  organization?: string;
}

/**
 * Certification or credential entry
 */
export interface Certification {
  /** Unique identifier for the certification */
  id: string;
  /** Certification name or title */
  name: string;
  /** Issuing organization */
  issuer: string;
  /** Issue date in ISO string format (YYYY-MM-DD) */
  date: string;
  /** Expiration date in ISO string format (YYYY-MM-DD) (optional) */
  expires?: string;
  /** URL for verification or more information (optional) */
  url?: string;
  /** Certification ID or credential ID (optional) */
  credentialId?: string;
  /** Description or additional information (optional) */
  description?: string;
}

/**
 * Social media profile or web presence link
 */
export interface SocialLink {
  /** Unique identifier for the social link */
  id: string;
  /** Platform name (LinkedIn, Twitter, etc.) */
  platform: string;
  /** Profile or page URL */
  url: string;
  /** Username on the platform (optional) */
  username?: string;
  /** Display text for the link (optional) */
  displayText?: string;
  /** Whether this is a primary social link */
  isPrimary?: boolean;
}

/**
 * Represents a single entry within a custom section.
 */
export interface CustomSectionEntry {
  /** Unique identifier for the entry */
  id: string;
  /** Entry title (optional) */
  title?: string;
  /** Entry subtitle (optional) */
  subtitle?: string;
  /** Entry date or date range (optional) */
  date?: string;
  /** Entry description (optional) */
  description?: string;
  /** Bullet points for the entry (optional) */
  bullets?: string[];
}

/**
 * Custom section for additional resume components
 */
export interface CustomSection {
  /** Unique identifier for the custom section */
  id: string;
  /** Section title */
  title: string;
  /** Content entries for the section */
  entries: CustomSectionEntry[];
  /** Section display order (optional) */
  order?: number;
  /** Whether this section is visible in the resume */
  isVisible?: boolean;
}

/**
 * Complete resume model containing all sections and metadata
 */
export interface Resume {
  /** Unique identifier for the resume */
  id: string;
  /** User ID of the resume owner */
  userId: string;
  /** Resume title for user reference */
  title: string;
  /** Target job title the resume is tailored for */
  targetJobTitle: string;
  /** Creation timestamp in ISO format */
  createdAt: string;
  /** Last update timestamp in ISO format */
  updatedAt: string;
  /** Selected template identifier */
  templateId: string;
  /** Personal and contact information */
  personalInfo: PersonalInfo;
  /** Professional summary section */
  professionalSummary: ProfessionalSummary;
  /** Work experience entries */
  workExperiences: WorkExperience[];
  /** Education entries */
  education: Education[];
  /** Skills entries */
  skills: Skill[];
  /** Project entries */
  projects: Project[];
  /** Certification entries */
  certifications: Certification[];
  /** Social media and web presence links */
  socialLinks: SocialLink[];
  /** Custom sections */
  customSections: CustomSection[];
  /** Whether this is a base resume or tailored version */
  isBaseResume?: boolean;
  /** ID of the original resume if this is a tailored version */
  originalResumeId?: string;
  /** Job description ID this resume is tailored for */
  jobDescriptionId?: string;
  /** ATS compatibility score (0-100) */
  atsScore?: number;
  /** Additional metadata such as view count, share count, etc. */
  metadata?: Record<string, any>;
  /** Resume version for tracking changes */
  version?: number;
  /** Format options for PDF export */
  formatOptions?: {
    /** Font name */
    fontFamily?: string;
    /** Base font size */
    fontSize?: number;
    /** Primary color */
    primaryColor?: string;
    /** Secondary color */
    secondaryColor?: string;
    /** Section order */
    sectionOrder?: string[];
    /** Page margins */
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
}

/**
 * Represents a single item of feedback for an ATS score
 */
export interface ATSScoreFeedbackItem {
  category: string;
  message: string;
  severity: "low" | "medium" | "high";
}

/**
 * Represents the result of an ATS (Applicant Tracking System) score calculation
 */
export interface ATSScoreResult {
  score: number;
  feedback: ATSScoreFeedbackItem[];
}

/**
 * Represents a keyword match between a resume and a job description
 */
export interface KeywordMatch {
  keyword: string;
  found: boolean;
  importance: "high" | "medium" | "low";
  context?: string;
}

/**
 * Represents the settings used for tailoring a resume
 */
export interface TailoringSettings {
  intensity: number;
  preserveVoice: boolean;
  focusKeywords: boolean;
  // ... existing code ...
}

/**
 * Resume template with styling and format options
 */
export interface ResumeTemplate {
  /** Unique identifier for the template */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Template category */
  category: "modern" | "professional" | "creative" | "simple" | "academic" | "technical";
  /** Template preview image URL */
  previewImageUrl: string;
  /** Is this a premium template requiring subscription */
  isPremium: boolean;
  /** Predefined format options for the template */
  defaultFormatOptions: {
    /** Font family */
    fontFamily: string;
    /** Base font size in px */
    fontSize: number;
    /** Primary color in hex */
    primaryColor: string;
    /** Secondary color in hex */
    secondaryColor?: string;
    /** Section order */
    sectionOrder: string[];
    /** Page margins in mm */
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    /** Additional template-specific styling options */
    additionalOptions?: Record<string, any>;
  };
  /** Tags for filtering templates */
  tags?: string[];
  /** Rating out of 5 */
  rating?: number;
  /** Number of users who have used this template */
  usageCount?: number;
}
