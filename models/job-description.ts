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
  analysis?: Record<string, any> | null;
}
