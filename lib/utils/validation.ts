// File: /lib/utils/validation.ts
// Utility functions for validation

import {
  Resume,
  PersonalInfo,
  ProfessionalSummary,
  WorkExperience,
  Education,
  Skill,
  Project,
  Certification,
  CustomSection,
  CustomSectionItem,
} from "@/models/resume";
import { JobDescription } from "@/models/job-description";

// These interfaces are defined in other files and imported where needed

/**
 * Validate an email address
 * @param email Email to validate
 * @returns Boolean indicating if the email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;

  // RFC 5322 compliant regex for email validation
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
}

/**
 * Validate a password
 * @param password Password to validate
 * @returns Boolean indicating if the password meets security requirements
 */
export function isValidPassword(password: string): boolean {
  if (!password) return false;

  // Password must be at least 8 characters and contain:
  // - At least one uppercase letter
  // - At least one lowercase letter
  // - At least one number
  // - At least one special character
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-!@#$%^&*()_+=[\]{};':"\\|,.<>/?]).{8,}$/;
  return regex.test(password);
}

/**
 * Validate a phone number
 * Supports multiple formats including:
 * - (123) 456-7890
 * - 123-456-7890
 * - 123.456.7890
 * - 1234567890
 *
 * @param phone Phone number to validate
 * @returns Boolean indicating if the phone is valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;

  // Allows various common phone number formats
  const regex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return regex.test(phone);
}

/**
 * Validate a URL
 * @param url URL to validate
 * @returns Boolean indicating if the URL is valid
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;

  try {
    // Check if already has a protocol
    const urlToCheck = url.match(/^https?:\/\//i) ? url : `https://${url}`;
    new URL(urlToCheck);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate a LinkedIn URL
 * @param url LinkedIn URL to validate
 * @returns Boolean indicating if the URL is a valid LinkedIn profile
 */
export function isValidLinkedInUrl(url: string): boolean {
  if (!url) return false;

  // First check if it's a valid URL
  if (!isValidUrl(url)) return false;

  // Check if it contains linkedin.com
  return /linkedin\.com/i.test(url);
}

/**
 * Validate a GitHub URL
 * @param url GitHub URL to validate
 * @returns Boolean indicating if the URL is a valid GitHub profile
 */
export function isValidGithubUrl(url: string): boolean {
  if (!url) return false;

  // First check if it's a valid URL
  if (!isValidUrl(url)) return false;

  // Check if it contains github.com
  return /github\.com/i.test(url);
}

/**
 * Validate a date string
 * @param date Date string to validate
 * @param format Expected format ('YYYY-MM-DD' or 'MM/DD/YYYY')
 * @returns Boolean indicating if the date is valid and in correct format
 */
export function isValidDate(
  date: string,
  format: "YYYY-MM-DD" | "MM/DD/YYYY" = "YYYY-MM-DD",
): boolean {
  if (!date) return false;

  // Match the date against the specified format
  let day: number, month: number, year: number;

  if (format === "YYYY-MM-DD") {
    const regex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = date.match(regex);
    if (!match) return false;

    year = parseInt(match[1], 10);
    month = parseInt(match[2], 10);
    day = parseInt(match[3], 10);
  } else {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = date.match(regex);
    if (!match) return false;

    month = parseInt(match[1], 10);
    day = parseInt(match[2], 10);
    year = parseInt(match[3], 10);
  }

  // Check if the date is valid
  const dateObj = new Date(year, month - 1, day);
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}

/**
 * Validate date range (start date must be before or equal to end date)
 * @param startDate Start date string
 * @param endDate End date string
 * @returns Boolean indicating if the date range is valid
 */
export function isValidDateRange(
  startDate: string,
  endDate: string | null,
): boolean {
  if (!startDate) return false;
  if (!endDate) return true; // End date can be null (ongoing)

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  // Start date must be before or equal to end date
  return start <= end;
}

/**
 * Validate if a string is empty or only contains whitespace
 * @param str String to validate
 * @returns Boolean indicating if the string is empty or whitespace only
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim() === "";
}

/**
 * Validate a name (must be at least 2 characters, letters, spaces, hyphens only)
 * @param name Name to validate
 * @returns Boolean indicating if the name is valid
 */
export function isValidName(name: string): boolean {
  if (!name || name.trim().length < 2) return false;

  // Allow letters, spaces, hyphens, and apostrophes
  const regex = /^[A-Za-z\s\-']+$/;
  return regex.test(name.trim());
}

/**
 * Validate a resume's personal information section
 * @param personalInfo The personal info object to validate
 * @returns Object with validation status and error messages
 */
export function validatePersonalInfo(personalInfo: Partial<PersonalInfo>): {
  valid: boolean;
  errors: { field: string; message: string }[];
} {
  const errors: { field: string; message: string }[] = [];

  // Check required fields
  if (isEmpty(personalInfo?.fullName)) {
    errors.push({ field: "fullName", message: "Full name is required" });
  } else if (!isValidName(personalInfo?.fullName ?? "")) {
    errors.push({
      field: "fullName",
      message: "Name can only contain letters, spaces, and hyphens",
    });
  }

  if (isEmpty(personalInfo?.email)) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isValidEmail(personalInfo?.email ?? "")) {
    errors.push({
      field: "email",
      message: "Please enter a valid email address",
    });
  }

  if (
    !isEmpty(personalInfo?.phone) &&
    !isValidPhoneNumber(personalInfo?.phone ?? "")
  ) {
    errors.push({
      field: "phone",
      message: "Please enter a valid phone number",
    });
  }

  if (
    !isEmpty(personalInfo?.linkedIn) &&
    !isValidLinkedInUrl(personalInfo?.linkedIn ?? "")
  ) {
    errors.push({
      field: "linkedIn",
      message: "Please enter a valid LinkedIn URL",
    });
  }

  if (
    !isEmpty(personalInfo?.website) &&
    !isValidUrl(personalInfo?.website ?? "")
  ) {
    errors.push({
      field: "website",
      message: "Please enter a valid website URL",
    });
  }

  if (
    !isEmpty(personalInfo?.github) &&
    !isValidGithubUrl(personalInfo?.github ?? "")
  ) {
    errors.push({
      field: "github",
      message: "Please enter a valid GitHub URL",
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a professional summary
 * @param summary The professional summary to validate
 * @returns Object with validation status and error messages
 */
export function validateProfessionalSummary(
  summary: Partial<ProfessionalSummary>,
): {
  valid: boolean;
  errors: { field: string; message: string }[];
} {
  const errors: { field: string; message: string }[] = [];

  if (isEmpty(summary?.content)) {
    errors.push({
      field: "content",
      message: "Professional summary is required",
    });
  } else if ((summary?.content?.length ?? 0) < 50) {
    errors.push({
      field: "content",
      message: "Professional summary should be at least 50 characters",
    });
  } else if ((summary?.content?.length ?? 0) > 2000) {
    errors.push({
      field: "content",
      message: "Professional summary should be no more than 2000 characters",
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a work experience entry
 * @param experience The work experience object to validate
 * @returns Object with validation status and error messages
 */
export function validateWorkExperience(experience: Partial<WorkExperience>): {
  valid: boolean;
  errors: { field: string; message: string }[];
} {
  const errors: { field: string; message: string }[] = [];

  // Check required fields
  if (isEmpty(experience?.company)) {
    errors.push({ field: "company", message: "Company name is required" });
  }

  if (isEmpty(experience?.position)) {
    errors.push({ field: "position", message: "Position title is required" });
  }

  if (isEmpty(experience?.startDate)) {
    errors.push({ field: "startDate", message: "Start date is required" });
  }

  // If not a current position, end date is required
  if (!experience?.isCurrent && isEmpty(experience?.endDate)) {
    errors.push({
      field: "endDate",
      message: "End date is required for past positions",
    });
  }

  // Check date range validity
  if (
    !isEmpty(experience?.startDate) &&
    !isEmpty(experience?.endDate) &&
    !experience?.isCurrent
  ) {
    if (
      !isValidDateRange(
        experience?.startDate ?? "",
        experience?.endDate ?? null,
      )
    ) {
      errors.push({
        field: "dateRange",
        message: "End date must be after start date",
      });
    }
  }

  // Check highlights (bullet points)
  if (Array.isArray(experience?.highlights)) {
    experience.highlights.forEach((highlight: string, index: number) => {
      if (isEmpty(highlight)) {
        errors.push({
          field: `highlights[${index}]`,
          message: "Bullet point cannot be empty",
        });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate an education entry
 * @param education The education object to validate
 * @returns Object with validation status and error messages
 */
export function validateEducation(education: Partial<Education>): {
  valid: boolean;
  errors: { field: string; message: string }[];
} {
  const errors: { field: string; message: string }[] = [];

  // Check required fields
  if (isEmpty(education?.institution)) {
    errors.push({
      field: "institution",
      message: "Institution name is required",
    });
  }

  if (isEmpty(education?.degree)) {
    errors.push({ field: "degree", message: "Degree is required" });
  }

  // Check date range validity
  if (!isEmpty(education?.startDate) && !isEmpty(education?.endDate)) {
    if (
      !isValidDateRange(education?.startDate ?? "", education?.endDate ?? null)
    ) {
      errors.push({
        field: "dateRange",
        message: "End date must be after start date",
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a skill entry
 * @param skill The skill object to validate
 * @returns Object with validation status and error messages
 */
export function validateSkill(skill: Partial<Skill>): {
  valid: boolean;
  errors: { field: string; message: string }[];
} {
  const errors: { field: string; message: string }[] = [];

  if (isEmpty(skill?.name)) {
    errors.push({ field: "name", message: "Skill name is required" });
  }

  // Check if level is valid (if provided)
  if (
    skill?.level &&
    !["beginner", "intermediate", "advanced", "expert"].includes(skill.level)
  ) {
    errors.push({ field: "level", message: "Invalid skill level" });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a project entry
 * @param project The project object to validate
 * @returns Object with validation status and error messages
 */
export function validateProject(project: Partial<Project>): {
  valid: boolean;
  errors: { field: string; message: string }[];
} {
  const errors: { field: string; message: string }[] = [];

  if (isEmpty(project?.name)) {
    errors.push({ field: "name", message: "Project name is required" });
  }

  if (isEmpty(project?.description)) {
    errors.push({
      field: "description",
      message: "Project description is required",
    });
  }

  // Check date range validity if dates are provided
  if (!isEmpty(project?.startDate) && !isEmpty(project?.endDate)) {
    if (!isValidDateRange(project?.startDate ?? "", project?.endDate ?? null)) {
      errors.push({
        field: "dateRange",
        message: "End date must be after start date",
      });
    }
  }

  // Check URL validity if provided
  if (!isEmpty(project?.url) && !isValidUrl(project?.url ?? "")) {
    errors.push({ field: "url", message: "Please enter a valid URL" });
  }

  // Check highlights (bullet points)
  if (Array.isArray(project?.highlights)) {
    if (project.highlights.length === 0) {
      errors.push({
        field: "highlights",
        message: "At least one highlight is required",
      });
    } else {
      project.highlights.forEach((highlight: string, index: number) => {
        if (isEmpty(highlight)) {
          errors.push({
            field: `highlights[${index}]`,
            message: "Bullet point cannot be empty",
          });
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a certification entry
 * @param certification The certification object to validate
 * @returns Object with validation status and error messages
 */
export function validateCertification(certification: Partial<Certification>): {
  valid: boolean;
  errors: { field: string; message: string }[];
} {
  const errors: { field: string; message: string }[] = [];

  if (isEmpty(certification?.name)) {
    errors.push({ field: "name", message: "Certification name is required" });
  }

  if (isEmpty(certification?.issuer)) {
    errors.push({
      field: "issuer",
      message: "Issuing organization is required",
    });
  }

  if (isEmpty(certification?.date)) {
    errors.push({ field: "date", message: "Issue date is required" });
  }

  // Check URL validity if provided
  if (!isEmpty(certification?.url) && !isValidUrl(certification?.url ?? "")) {
    errors.push({ field: "url", message: "Please enter a valid URL" });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a custom section
 * @param section The custom section object to validate
 * @returns Object with validation status and error messages
 */
export function validateCustomSection(section: Partial<CustomSection>): {
  valid: boolean;
  errors: { field: string; message: string }[];
} {
  const errors: { field: string; message: string }[] = [];

  if (isEmpty(section?.title)) {
    errors.push({ field: "title", message: "Section title is required" });
  }

  if (!Array.isArray(section?.items) || section.items.length === 0) {
    errors.push({
      field: "items",
      message: "At least one entry is required",
    });
  } else {
    section.items.forEach((item: Partial<CustomSectionItem>, index: number) => {
      if (
        isEmpty(item?.title) &&
        isEmpty(item?.subtitle) &&
        isEmpty(item?.description) &&
        (!Array.isArray(item?.highlights) || item.highlights.length === 0)
      ) {
        errors.push({
          field: `items[${index}]`,
          message: "Entry must have at least one field filled",
        });
      }

      // Validate highlights if present
      if (Array.isArray(item?.highlights)) {
        item.highlights.forEach((highlight: string, highlightIndex: number) => {
          if (isEmpty(highlight)) {
            errors.push({
              field: `items[${index}].highlights[${highlightIndex}]`,
              message: "Highlight cannot be empty",
            });
          }
        });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a complete resume
 * @param resume Resume data to validate
 * @returns Object with validation status and list of errors
 */
export function validateResume(resume: Resume): {
  valid: boolean;
  errors: {
    section: string;
    field: string;
    message: string;
  }[];
} {
  const errors: { section: string; field: string; message: string }[] = [];

  // Validate base resume info
  if (isEmpty(resume?.title)) {
    errors.push({
      section: "base",
      field: "title",
      message: "Resume title is required",
    });
  }

  if (isEmpty(resume?.targetJobTitle)) {
    errors.push({
      section: "base",
      field: "targetJobTitle",
      message: "Target job title is required",
    });
  }

  // Validate personal info
  const personalInfoValidation = validatePersonalInfo(
    resume?.personalInfo ?? {},
  );
  if (!personalInfoValidation.valid) {
    personalInfoValidation.errors.forEach((error) => {
      errors.push({
        section: "personalInfo",
        field: error.field,
        message: error.message,
      });
    });
  }

  // Validate professional summary
  const summaryValidation = validateProfessionalSummary(
    resume?.professionalSummary ?? {},
  );
  if (!summaryValidation.valid) {
    summaryValidation.errors.forEach((error) => {
      errors.push({
        section: "professionalSummary",
        field: error.field,
        message: error.message,
      });
    });
  }

  // Validate work experiences
  if (Array.isArray(resume?.workExperiences)) {
    resume.workExperiences.forEach(
      (experience: Partial<WorkExperience>, index: number) => {
        const experienceValidation = validateWorkExperience(experience);
        if (!experienceValidation.valid) {
          experienceValidation.errors.forEach((error) => {
            errors.push({
              section: `workExperiences[${index}]`,
              field: error.field,
              message: error.message,
            });
          });
        }
      },
    );
  }

  // Validate education
  if (Array.isArray(resume?.education)) {
    resume.education.forEach((edu: Partial<Education>, index: number) => {
      const eduValidation = validateEducation(edu);
      if (!eduValidation.valid) {
        eduValidation.errors.forEach((error) => {
          errors.push({
            section: `education[${index}]`,
            field: error.field,
            message: error.message,
          });
        });
      }
    });
  }

  // Validate skills
  if (Array.isArray(resume?.skills)) {
    resume.skills.forEach((skill: Partial<Skill>, index: number) => {
      const skillValidation = validateSkill(skill);
      if (!skillValidation.valid) {
        skillValidation.errors.forEach((error) => {
          errors.push({
            section: `skills[${index}]`,
            field: error.field,
            message: error.message,
          });
        });
      }
    });
  }

  // Validate projects
  if (Array.isArray(resume?.projects)) {
    resume.projects.forEach((project: Partial<Project>, index: number) => {
      const projectValidation = validateProject(project);
      if (!projectValidation.valid) {
        projectValidation.errors.forEach((error) => {
          errors.push({
            section: `projects[${index}]`,
            field: error.field,
            message: error.message,
          });
        });
      }
    });
  }

  // Validate certifications
  if (Array.isArray(resume?.certifications)) {
    resume.certifications.forEach(
      (cert: Partial<Certification>, index: number) => {
        const certValidation = validateCertification(cert);
        if (!certValidation.valid) {
          certValidation.errors.forEach((error) => {
            errors.push({
              section: `certifications[${index}]`,
              field: error.field,
              message: error.message,
            });
          });
        }
      },
    );
  }

  // Validate custom sections
  if (Array.isArray(resume?.customSections)) {
    resume.customSections.forEach(
      (section: Partial<CustomSection>, index: number) => {
        const sectionValidation = validateCustomSection(section);
        if (!sectionValidation.valid) {
          sectionValidation.errors.forEach((error) => {
            errors.push({
              section: `customSections[${index}]`,
              field: error.field,
              message: error.message,
            });
          });
        }
      },
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a job description
 * @param jobDescription Job description data to validate
 * @returns Object with validation status and list of errors
 */
export function validateJobDescription(
  jobDescription: Partial<JobDescription>,
): {
  valid: boolean;
  errors: { field: string; message: string }[];
} {
  const errors: { field: string; message: string }[] = [];

  if (isEmpty(jobDescription?.title)) {
    errors.push({ field: "title", message: "Job title is required" });
  }

  if (isEmpty(jobDescription?.company)) {
    errors.push({ field: "company", message: "Company name is required" });
  }

  if (isEmpty(jobDescription?.content)) {
    errors.push({
      field: "content",
      message: "Job description content is required",
    });
  } else if (jobDescription.content && jobDescription.content.length < 100) {
    errors.push({
      field: "content",
      message: "Job description content is too short (minimum 100 characters)",
    });
  }

  // Validate URL if provided
  if (!isEmpty(jobDescription?.url) && !isValidUrl(jobDescription?.url ?? "")) {
    errors.push({ field: "url", message: "Please enter a valid URL" });
  }

  // Validate application deadline if provided
  if (!isEmpty(jobDescription?.applicationDeadline)) {
    const deadline = new Date(jobDescription?.applicationDeadline ?? "");
    const now = new Date();

    if (isNaN(deadline.getTime())) {
      errors.push({
        field: "applicationDeadline",
        message: "Invalid application deadline date",
      });
    } else if (deadline < now) {
      // Allow past deadlines, but add a warning
      errors.push({
        field: "applicationDeadline",
        message: "Warning: Application deadline is in the past",
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Check if content is likely to be ATS-friendly
 * @param text Text to check for ATS compatibility
 * @returns Object with ATS compatibility score and issues found
 */
export function checkATSCompatibility(text: string): {
  score: number;
  issues: string[];
} {
  const issues: string[] = [];

  // 1. Check for non-standard characters
  if (/[^\x20-\x7E]+/.test(text)) {
    issues.push(
      "Contains non-standard characters that may cause parsing issues",
    );
  }

  // 2. Check for excessive formatting or special characters

  return { score: 0, issues };
}
