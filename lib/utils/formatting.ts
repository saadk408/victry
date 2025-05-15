// File: /lib/utils/formatting.ts
// Utility functions for formatting data

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
 * @param startDate Start date string or Date object
 * @param endDate End date string or Date object (defaults to current date if null)
 * @param includeMonths Whether to include months in the result
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

/**
 * Format a phone number in US format: (XXX) XXX-XXXX
 * @param phone Phone number to format
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Check if the number has the right length for US phone numbers
  if (cleaned.length !== 10) {
    // If not exactly 10 digits, return as-is but still clean it up a bit
    if (cleaned.length > 0) {
      // Try to format it in a reasonable way based on length
      if (cleaned.length <= 3) {
        return cleaned;
      } else if (cleaned.length <= 7) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      } else {
        // For international numbers or other formats, do basic grouping
        return cleaned.replace(/(\d{3})(\d{3})(\d+)/, "$1-$2-$3");
      }
    }
    return phone; // Return original if we can't clean it
  }

  // Format as (XXX) XXX-XXXX
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
}

/**
 * Format a number as currency
 * @param value Number to format
 * @param currency Currency code (default: 'USD')
 * @param locale Locale for formatting (default: 'en-US')
 */
export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
}

/**
 * Format a name with proper capitalization
 * @param name Name to format
 */
export function formatName(name: string): string {
  if (!name) return "";

  // Split by spaces and hyphens
  return name
    .split(/[\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Format text as title case (major words capitalized)
 * @param text Text to format
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
 * Format text as sentence case (first letter capitalized)
 * @param text Text to format
 */
export function toSentenceCase(text: string): string {
  if (!text) return "";

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Truncate text with ellipsis if longer than maxLength
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @param ellipsis String to append when truncated (default: '...')
 */
export function truncateText(
  text: string,
  maxLength: number,
  ellipsis: string = "...",
): string {
  if (!text || text.length <= maxLength) return text;

  return text.slice(0, maxLength) + ellipsis;
}

/**
 * Format a string to be URL-friendly (slug)
 * @param text Text to convert to a slug
 */
export function slugify(text: string): string {
  if (!text) return "";

  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Format a number with commas for thousands separators
 * @param num Number to format
 * @param decimals Number of decimal places (default: 0)
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a file size in bytes to a human-readable format
 * @param bytes File size in bytes
 * @param decimals Number of decimal places (default: 2)
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

/**
 * Format a LinkedIn URL to a consistent format
 * @param url LinkedIn URL to format
 */
export function formatLinkedInUrl(url: string): string {
  if (!url) return "";

  // Remove protocol if present
  let formattedUrl = url.replace(/^https?:\/\//i, "");

  // Remove www. if present
  formattedUrl = formattedUrl.replace(/^www\./i, "");

  // Check if it's a LinkedIn URL
  if (!formattedUrl.startsWith("linkedin.com/")) {
    // If it's just a username, assume it's a LinkedIn profile
    if (!formattedUrl.includes("/")) {
      return `linkedin.com/in/${formattedUrl}`;
    }

    // If it doesn't start with linkedin.com, return as is
    return url;
  }

  return formattedUrl;
}

/**
 * Format a GitHub URL to a consistent format
 * @param url GitHub URL to format
 */
export function formatGitHubUrl(url: string): string {
  if (!url) return "";

  // Remove protocol if present
  let formattedUrl = url.replace(/^https?:\/\//i, "");

  // Remove www. if present
  formattedUrl = formattedUrl.replace(/^www\./i, "");

  // Check if it's a GitHub URL
  if (!formattedUrl.startsWith("github.com/")) {
    // If it's just a username, assume it's a GitHub profile
    if (!formattedUrl.includes("/")) {
      return `github.com/${formattedUrl}`;
    }

    // If it doesn't start with github.com, return as is
    return url;
  }

  return formattedUrl;
}

/**
 * Format a personal website URL to a consistent format
 * @param url Website URL to format
 */
export function formatWebsiteUrl(url: string): string {
  if (!url) return "";

  // If it doesn't have a protocol, add https://
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }

  return url;
}

/**
 * Remove HTML tags from a string
 * @param html HTML string to clean
 */
export function stripHtml(html: string): string {
  if (!html) return "";

  return html.replace(/<[^>]*>/g, "");
}

/**
 * Format a date as a relative time string (e.g., "2 days ago")
 * @param date Date to format
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);

  // Check if date is valid
  if (isNaN(then.getTime())) return "";

  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
}
