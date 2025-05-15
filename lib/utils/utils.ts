// File: /app/_lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
 * Useful for conditional and dynamic class names in components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ======== DATE UTILITIES ========

/**
 * Format a date in a consistent way
 * @param date Date or ISO string to format
 * @param format Output format ('short', 'medium', 'long', 'year-month')
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: "short" | "medium" | "long" | "year-month" = "medium",
): string {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date);

  // Check if date is valid
  if (isNaN(dateObj.getTime())) return "";

  switch (format) {
    case "short":
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    case "medium":
      return dateObj.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    case "long":
      return dateObj.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    case "year-month":
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
      });
    default:
      return dateObj.toLocaleDateString();
  }
}

/**
 * Format a date range (e.g., for resume experience)
 * @param startDate Start date string or Date object
 * @param endDate End date string or Date object
 * @param isCurrent Whether this is a current position
 * @param format Date format to use
 */
export function formatDateRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  isCurrent: boolean = false,
  format: "short" | "medium" | "long" = "short",
): string {
  if (!startDate) return "";

  const start = formatDate(startDate, format);

  if (isCurrent) {
    return `${start} - Present`;
  }

  if (endDate) {
    const end = formatDate(endDate, format);
    return `${start} - ${end}`;
  }

  return start;
}

/**
 * Calculate duration between two dates in years and months
 * Useful for automatically calculating job tenure
 */
export function calculateDuration(
  startDate: string | Date,
  endDate: string | Date | null = null,
  includeMonths: boolean = true,
): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "";
  }

  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();

  let years = yearDiff;
  let months = monthDiff;

  if (monthDiff < 0) {
    years -= 1;
    months += 12;
  }

  if (years === 0) {
    if (months === 0) {
      return "Less than a month";
    }
    return `${months} month${months !== 1 ? "s" : ""}`;
  }

  if (includeMonths && months > 0) {
    return `${years} year${years !== 1 ? "s" : ""}, ${months} month${months !== 1 ? "s" : ""}`;
  }

  return `${years} year${years !== 1 ? "s" : ""}`;
}

// ======== TEXT UTILITIES ========

/**
 * Convert a string to title case
 * e.g., "software engineer" -> "Software Engineer"
 */
export function toTitleCase(text: string): string {
  if (!text) return "";

  // Words that shouldn't be capitalized (unless first or last)
  const minorWords = [
    "a",
    "an",
    "the",
    "and",
    "but",
    "or",
    "for",
    "nor",
    "on",
    "at",
    "to",
    "from",
    "by",
    "with",
    "in",
    "of",
    "as",
  ];

  return text
    .toLowerCase()
    .split(" ")
    .map((word, index, arr) => {
      // Always capitalize first and last word
      if (index === 0 || index === arr.length - 1) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }

      // Don't capitalize minor words
      if (minorWords.includes(word)) {
        return word;
      }

      // Capitalize other words
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Truncate text with ellipsis if longer than maxLength
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Strip HTML tags from a string
 * Useful for cleaning pasted content
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Count words in a text
 */
export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Generate a slug from a string (for URLs)
 * e.g., "Senior Software Engineer" -> "senior-software-engineer"
 */
export function generateSlug(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/--+/g, "-") // Replace multiple - with single -
    .trim();
}

// ======== VALIDATION UTILITIES ========

/**
 * Validate an email address
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;

  // RFC 5322 compliant regex for email validation - Reverted unnecessary escape changes
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
}

/**
 * Validate a phone number
 * Accepts various formats like (123) 456-7890, 123-456-7890, 123.456.7890, etc.
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;

  // Regex for phone validation (US format)
  const regex = /^(\+\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/;
  return regex.test(phone);
}

/**
 * Format a phone number consistently
 * e.g., "1234567890" -> "(123) 456-7890"
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Check if the number has the right length
  if (cleaned.length !== 10) {
    // If not exactly 10 digits, return original
    return phone;
  }

  // Format as (XXX) XXX-XXXX
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
}

/**
 * Validate a URL
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    // Try adding https:// if not present
    if (!/^https?:\/\//i.test(url)) {
      try {
        new URL(`https://${url}`);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

/**
 * Validate a LinkedIn URL
 */
export function isValidLinkedInUrl(url: string): boolean {
  if (!url) return false;

  // Normalize the URL
  let normalizedUrl = url;
  if (!/^https?:\/\//i.test(url)) {
    normalizedUrl = `https://${url}`;
  }

  try {
    const urlObj = new URL(normalizedUrl);
    return (
      urlObj.hostname === "linkedin.com" ||
      urlObj.hostname === "www.linkedin.com" ||
      urlObj.hostname.endsWith(".linkedin.com")
    );
  } catch {
    return false;
  }
}

// ======== RESUME UTILITIES ========

/**
 * Check if text is ATS-friendly (no special characters, etc.)
 */
export function isATSFriendly(text: string): boolean {
  if (!text) return true;

  // Check for common issues that cause ATS problems
  const issues = [
    // eslint-disable-next-line no-control-regex -- Intentionally checking for non-ASCII, including control chars
    /[^\x00-\x7F]+/g, // Non-ASCII characters
    /[^\w\s.,;:?!()-]/g, // Special characters beyond basic punctuation
    /\u200B|\u200C|\u200D|\uFEFF/g, // Zero-width spaces and other invisible characters
  ];

  return !issues.some((regex) => regex.test(text));
}

/**
 * Extract keywords from text
 * This is a simple implementation - in production you'd likely use NLP
 */
export function extractKeywords(
  text: string,
  stopWords: string[] = [],
): string[] {
  if (!text) return [];

  // Common English stop words if none provided
  const defaultStopWords = [
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "is",
    "are",
    "was",
    "were",
    "to",
    "of",
    "in",
    "for",
    "with",
    "on",
    "at",
    "by",
    "as",
    "that",
    "this",
    "these",
    "those",
    "it",
    "its",
  ];

  const stopWordList = stopWords.length ? stopWords : defaultStopWords;

  // Tokenize and filter
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .split(/\s+/)
    .filter((word) => word.length > 1) // Remove single-character words
    .filter((word) => !stopWordList.includes(word));
}

// ======== FILE UTILITIES ========

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  if (!filename) return "";
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Check if file is a valid resume type
 */
export function isValidResumeFile(filename: string): boolean {
  if (!filename) return false;

  const validExtensions = ["pdf", "docx", "doc", "rtf", "txt"];
  const extension = getFileExtension(filename).toLowerCase();

  return validExtensions.includes(extension);
}

/**
 * Check if a string is empty or contains only whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim() === "";
}

/**
 * Generate a random ID (useful for keys in lists)
 */
export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Deep clone an object (useful for form state management)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce a function (useful for search inputs and form fields)
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
