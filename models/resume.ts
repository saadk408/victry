/**
 * Resume model types
 */

// Resume information
export interface Resume {
  id: string;
  userId?: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  targetJobTitle?: string;
  templateId: string;
  personalInfo?: PersonalInfo;
  professionalSummary?: ProfessionalSummary;
  workExperiences?: WorkExperience[];
  education?: Education[];
  skills?: Skill[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  interests?: string[];
  customSections?: CustomSection[];
  isBaseResume?: boolean;
  originalResumeId?: string;
  jobDescriptionId?: string;
  atsScore?: number;
  socialLinks?: SocialLink[];
  metadata?: Record<string, any>;
  version?: number;
  formatOptions?: {
    fontFamily?: string;
    fontSize?: number;
    primaryColor?: string;
    secondaryColor?: string;
    sectionOrder?: string[];
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
}

// Personal information
export interface PersonalInfo {
  fullName: string;
  email?: string;
  phone?: string;
  location?: string;
  profileImage?: string;
  linkedIn?: string;
  github?: string;
  website?: string;
}

// Professional summary
export interface ProfessionalSummary {
  content: string;
}

// Work experience
export interface WorkExperience {
  id?: string;
  position: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate: string | null;
  isCurrent?: boolean;
  highlights?: string[];
  description?: string;
  industry?: string;
  department?: string;
}

// Education
export interface Education {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate?: string;
  endDate: string | null;
  current?: boolean;
  gpa?: string;
  achievements?: string[];
  description?: string;
  honors?: string;
  thesis?: string;
}

// Skill
export interface Skill {
  id?: string;
  name: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  category?: string;
  yearsOfExperience?: number;
  isKeySkill?: boolean;
}

// Project
export interface Project {
  id?: string;
  name: string;
  description?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  highlights?: string[];
  technologies?: string[];
  role?: string;
  organization?: string;
}

// Certification
export interface Certification {
  id?: string;
  name: string;
  issuer?: string;
  date?: string;
  expires?: string;
  url?: string;
  description?: string;
  credentialId?: string;
}

// Language
export interface Language {
  id?: string;
  name: string;
  proficiency?:
    | "elementary"
    | "limited_working"
    | "professional_working"
    | "full_professional"
    | "native";
}

// Custom section
export interface CustomSection {
  id?: string;
  title: string;
  items: CustomSectionItem[];
}

// Custom section item
export interface CustomSectionItem {
  id?: string;
  title?: string;
  subtitle?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  highlights?: string[];
}

// Added missing SocialLink interface from types/resume.ts
export interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  username?: string;
  displayText?: string;
  isPrimary?: boolean;
}
