// File: /components/ai/ai-suggestion.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, CheckCircle2, XCircle, Loader2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { generateFullDiffHtml } from "@/lib/utils/diff-utils";
import { clientAnalytics } from "@/lib/utils/client-analytics";

interface AISuggestionProps {
  original: string;
  suggestion: string;
  onAccept: () => void;
  onReject: () => void;
  category?: "bullet" | "summary" | "skill" | "general";
  isLoading?: boolean;
  highlightDifferences?: boolean;
  className?: string;
}

/**
 * Component for displaying AI-suggested content improvements with side-by-side comparison
 * Allows users to accept or reject suggestions with visual feedback
 * Includes animations, diff highlighting, analytics tracking, and undo functionality
 */
export function AISuggestion({
  original,
  suggestion,
  onAccept,
  onReject,
  category = "general",
  isLoading = false,
  highlightDifferences = true,
  className,
}: AISuggestionProps) {
  const [showDiff, setShowDiff] = useState<boolean>(highlightDifferences);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [diffHighlighted, setDiffHighlighted] = useState({
    newText: suggestion,
    oldText: original,
  });
  const [accepted, setAccepted] = useState<boolean>(false);
  const [showUndoButton, setShowUndoButton] = useState<boolean>(false);
  const acceptedTimestampRef = useRef<number | null>(null);

  // Process the suggestion to highlight differences when that option is enabled
  useEffect(() => {
    if (!highlightDifferences) {
      setDiffHighlighted({
        newText: suggestion,
        oldText: original,
      });
      return;
    }

    try {
      // Use the diff utility for more sophisticated difference highlighting
      const { oldHtml, newHtml } = generateFullDiffHtml(original, suggestion);

      setDiffHighlighted({
        oldText: oldHtml,
        newText: newHtml,
      });
    } catch (error) {
      console.error("Error highlighting differences:", error);
      setDiffHighlighted({
        newText: suggestion,
        oldText: original,
      });
    }
  }, [original, suggestion, highlightDifferences]);

  // Track when component is shown
  useEffect(() => {
    if (!isLoading) {
      analytics.trackAISuggestionShown(category, suggestion.length);
    }
  }, [category, suggestion, isLoading]);

  // Clear undo button after delay
  useEffect(() => {
    let undoTimer: NodeJS.Timeout | null = null;

    if (showUndoButton) {
      undoTimer = setTimeout(() => {
        setShowUndoButton(false);
      }, 10000); // Hide undo button after 10 seconds
    }

    return () => {
      if (undoTimer) clearTimeout(undoTimer);
    };
  }, [showUndoButton]);

  // Get category-specific label
  const getCategoryLabel = (): string => {
    switch (category) {
      case "bullet":
        return "Bullet Point Improvement";
      case "summary":
        return "Summary Enhancement";
      case "skill":
        return "Skill Optimization";
      default:
        return "AI Suggestion";
    }
  };

  // Handle accept with tracking
  const handleAccept = () => {
    if (isLoading || accepted) return;

    // Track acceptance in analytics
    clientAnalytics.trackAISuggestionAccepted(category, suggestion.length);

    // Update UI state
    setAccepted(true);
    setShowUndoButton(true);
    acceptedTimestampRef.current = Date.now();

    // Call the parent's callback
    onAccept();
  };

  // Handle reject with tracking
  const handleReject = () => {
    if (isLoading || accepted) return;

    // Track rejection in analytics
    clientAnalytics.trackAISuggestionRejected(category, suggestion.length);

    // Call the parent's callback
    onReject();
  };

  // Handle undo with tracking
  const handleUndo = () => {
    if (!accepted || !acceptedTimestampRef.current) return;

    // Calculate time elapsed since acceptance
    const timeElapsed = Date.now() - acceptedTimestampRef.current;

    // Track undo in analytics
    clientAnalytics.trackAISuggestionUndone(category, timeElapsed);

    // Reset state
    setAccepted(false);
    setShowUndoButton(false);
    acceptedTimestampRef.current = null;

    // Call reject function which will revert to original
    onReject();
  };

  return (
    <div
      className={cn(
        "my-2 rounded-md border border-primary/20 bg-primary/5 p-4",
        isHovering && "border-primary/30 shadow-xs",
        className,
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="mr-2 h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-primary-foreground">
            {getCategoryLabel()}
          </h4>
        </div>

        {highlightDifferences && (
          <button
            onClick={() => setShowDiff(!showDiff)}
            className="text-xs text-primary transition-colors hover:text-primary/80"
          >
            {showDiff ? "Hide Changes" : "Show Changes"}
          </button>
        )}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col">
          <span className="mb-1 ml-1 text-xs font-medium text-muted-foreground">
            Original
          </span>
          <div className="flex-1 rounded border border-border bg-background p-3 text-foreground">
            <p
              className="whitespace-pre-wrap text-sm leading-relaxed"
              dangerouslySetInnerHTML={
                showDiff ? { __html: diffHighlighted.oldText } : undefined
              }
            >
              {!showDiff && original}
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="mb-1 ml-1 text-xs font-medium text-muted-foreground">
            Suggested
          </span>
          <div className="flex-1 rounded border border-primary/30 bg-background p-3 text-foreground">
            {isLoading ? (
              <div className="flex h-full items-center justify-center py-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Generating suggestion...
                </p>
              </div>
            ) : (
              <p
                className="whitespace-pre-wrap text-sm leading-relaxed"
                dangerouslySetInnerHTML={
                  showDiff ? { __html: diffHighlighted.newText } : undefined
                }
              >
                {!showDiff && suggestion}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Help text to guide the user */}
      <p className="mb-3 text-xs text-muted-foreground">
        Review the AI&apos;s suggestion above. You can accept to replace your
        original text or reject to keep it.
      </p>

      <div className="flex justify-end gap-2">
        {showUndoButton && (
          <button
            onClick={handleUndo}
            className="flex items-center rounded-md border border-warning/30 bg-warning/10 px-3 py-1.5 text-sm text-warning-foreground transition-colors hover:bg-warning/20"
          >
            <Undo2 className="mr-1.5 h-4 w-4" />
            Undo
          </button>
        )}

        <button
          onClick={handleReject}
          disabled={isLoading || accepted}
          className={cn(
            "flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors",
            isLoading || accepted
              ? "cursor-not-allowed bg-muted text-muted-foreground"
              : "text-foreground hover:bg-muted",
          )}
          aria-label="Reject suggestion"
        >
          <XCircle className="mr-1.5 h-4 w-4" />
          Reject
        </button>

        <button
          onClick={handleAccept}
          disabled={isLoading || accepted}
          className={cn(
            "flex items-center rounded-md px-3 py-1.5 text-sm transition-colors",
            isLoading || accepted
              ? "cursor-not-allowed bg-primary/60 text-primary-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
          aria-label="Accept suggestion"
        >
          <CheckCircle2 className="mr-1.5 h-4 w-4" />
          Accept
        </button>
      </div>
    </div>
  );
}
