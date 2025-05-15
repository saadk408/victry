// File: /app/_lib/utils/diff-utils.ts
import { diffWords } from "diff";

/**
 * Generate HTML with highlighted differences between two strings
 * Uses the 'diff' library to identify added/removed/unchanged content
 *
 * @param oldText - Original text
 * @param newText - New text to compare against
 * @returns HTML string with highlighted differences
 */
export function generateDiffHtml(oldText: string, newText: string): string {
  try {
    const diff = diffWords(oldText, newText);

    // Convert diff results to HTML with appropriate styling
    const htmlParts = diff.map((part) => {
      if (part.added) {
        return `<span class="bg-green-100 text-green-800 rounded px-0.5">${part.value}</span>`;
      } else if (part.removed) {
        // Removed parts are not shown in the "new" text view
        return "";
      } else {
        return part.value;
      }
    });

    return htmlParts.join("");
  } catch (error) {
    console.error("Error generating diff:", error);
    return newText; // Fallback to plain text if diff fails
  }
}

/**
 * Generate HTML with both added and removed differences highlighted
 * Useful for showing a complete diff view of two texts
 *
 * @param oldText - Original text
 * @param newText - New text to compare against
 * @returns HTML string with both additions and removals highlighted
 */
export function generateFullDiffHtml(
  oldText: string,
  newText: string,
): { oldHtml: string; newHtml: string } {
  try {
    const diff = diffWords(oldText, newText);

    // Create HTML for both old and new text
    const oldHtmlParts: string[] = [];
    const newHtmlParts: string[] = [];

    diff.forEach((part) => {
      if (part.added) {
        // Added parts only appear in new text
        newHtmlParts.push(
          `<span class="bg-green-100 text-green-800 rounded px-0.5">${part.value}</span>`,
        );
      } else if (part.removed) {
        // Removed parts only appear in old text
        oldHtmlParts.push(
          `<span class="bg-red-100 text-red-800 rounded px-0.5">${part.value}</span>`,
        );
      } else {
        // Unchanged parts appear in both
        oldHtmlParts.push(part.value);
        newHtmlParts.push(part.value);
      }
    });

    return {
      oldHtml: oldHtmlParts.join(""),
      newHtml: newHtmlParts.join(""),
    };
  } catch (error) {
    console.error("Error generating full diff:", error);
    return {
      oldHtml: oldText,
      newHtml: newText,
    };
  }
}
