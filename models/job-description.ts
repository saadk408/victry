/**
 * Job Description model types
 */

export interface JobDescription {
  id: string;
  userId?: string;
  title: string;
  company: string;
  location?: string;
  jobType?: string;
  salary?: string;
  content: string;
  url?: string;
  contactEmail?: string;
  applicationDeadline?: string;
  keywords?: string[];
  createdAt?: string;
  updatedAt?: string;
  analysis?: JobAnalysis | null;
}

/**
 * Job requirement information
 */
export interface JobRequirement {
  id: string;
  category: "must_have" | "preferred" | "bonus";
  description: string;
  importance: "high" | "medium" | "low";
  keywords: string[];
}

/**
 * Job keyword information
 */
export interface JobKeyword {
  id: string;
  keyword: string;
  count: number;
  context: string[];
  importance: "high" | "medium" | "low";
  type: "skill" | "qualification" | "experience" | "tool" | "industry" | "soft_skill" | "other";
}

/**
 * Job analysis information
 */
export interface JobAnalysis {
  id: string;
  jobDescriptionId: string;
  companyInfo: {
    size?: string;
    industry?: string;
    culture?: string;
    mission?: string;
    values?: string[];
  };
  jobSummary: string;
  responsibilities: string[];
  requirements: JobRequirement[];
  keywords: JobKeyword[];
  benefits?: string[];
  culture?: string[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: "hourly" | "daily" | "weekly" | "monthly" | "yearly";
    benefits?: string[];
  };
  createdAt: string;
  updatedAt?: string;
}
