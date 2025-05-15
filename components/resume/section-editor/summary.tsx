// File: /components/resume/section-editor/summary.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
/* // Commented out missing Alert component
import { Alert, AlertDescription } from "@/components/ui/alert";
*/
import { RichTextEditor } from "@/components/resume/editor-controls/rich-text-editor";
import { ProfessionalSummary } from "@/models/resume";
import { AISuggestion } from "@/components/ai/ai-suggestion";
import { Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Props for the SummaryEditor component
 */
interface SummaryEditorProps {
  /** Professional summary data to edit */
  summary: ProfessionalSummary;
  /** Callback function called when summary changes */
  onChange: (summary: ProfessionalSummary) => void;
  /** Whether the editor is in a disabled state */
  disabled?: boolean;
  /** Whether to show AI enhancement options */
  showAiOptions?: boolean;
  /** Callback for requesting AI summary enhancement */
  onAiEnhance?: () => void;
  /** Current AI suggestion state */
  aiSuggestionState?: {
    isLoading: boolean;
    suggestedContent: string;
    error: string | null;
  };
}

/**
 * Component for editing professional summary section of a resume
 * Provides rich text editing and AI enhancement options
 */
export function SummaryEditor({
  summary,
  onChange,
  disabled = false,
  showAiOptions = false,
  onAiEnhance,
  aiSuggestionState,
}: SummaryEditorProps) {
  // Track when content was last modified for analytics
  const [lastModified, setLastModified] = useState<number>(Date.now());

  // Handle content changes from the rich text editor
  const handleContentChange = (content: string) => {
    // Update the summary
    onChange({ content });

    // Track modification time for analytics
    setLastModified(Date.now());
  };

  // Request AI enhancement
  const handleAiEnhance = () => {
    if (onAiEnhance) {
      onAiEnhance();
    }
  };

  // Track summary edits
  useEffect(() => {
    const trackEditAnalytics = () => {
      // Remove undefined analytics event
      // if (summary.content && Date.now() - lastModified > 5000) {
      //   analytics.trackEvent("summary_edited", ...).catch(console.error);
      // }
    };

    // Track edit when component unmounts or after delay
    const timeoutId = setTimeout(trackEditAnalytics, 5000);
    return () => {
      clearTimeout(timeoutId);
      trackEditAnalytics();
    };
  }, [summary.content, lastModified]);

  return (
    <div className="space-y-4">
      {/* Header with AI enhancement button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Professional Summary</h3>

        {showAiOptions && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAiEnhance}
            disabled={
              disabled ||
              !summary.content ||
              (aiSuggestionState?.isLoading ?? false)
            }
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            {aiSuggestionState?.isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Enhance with AI
              </>
            )}
          </Button>
        )}
      </div>

      {/* AI Suggestion Panel */}
      <AnimatePresence>
        {aiSuggestionState?.suggestedContent && summary.content && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <AISuggestion
              original={summary.content}
              suggestion={aiSuggestionState.suggestedContent}
              onAccept={() =>
                handleContentChange(aiSuggestionState.suggestedContent)
              }
              onReject={() => {
                // Remove undefined analytics event
                // analytics.trackEvent("summary_ai_suggestion_rejected", ...).catch(console.error);
              }}
              category="summary"
              isLoading={aiSuggestionState?.isLoading}
              highlightDifferences={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message - Commented out due to missing Alert component 
      {aiSuggestionState?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{aiSuggestionState.error}</AlertDescription>
        </Alert>
      )}
      */}

      {/* Main Editor */}
      <div className="space-y-2">
        <Label htmlFor="professional-summary">
          Write a compelling summary of your skills, experience, and career
          goals
        </Label>

        {/* Using RichTextEditor instead of simple Textarea */}
        <RichTextEditor
          initialContent={summary.content}
          onChange={handleContentChange}
          placeholder="Experienced software engineer with 5+ years of expertise in web development, specializing in React and Node.js. Passionate about creating clean, efficient code and delivering exceptional user experiences."
          minHeight={150}
          maxHeight={300}
          readOnly={disabled}
          toolbarButtons={["bold", "italic", "underline"]}
          analyticsCategory="professional_summary"
        />

        <div className="flex justify-between text-xs text-gray-500">
          <span>Recommended: 30-100 words</span>
        </div>
      </div>

      {/* Help Text */}
      <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">
        <h4 className="mb-1 font-medium text-gray-700">
          Tips for a Strong Professional Summary
        </h4>
        <ul className="list-inside list-disc space-y-1">
          <li>Keep it concise (3-5 sentences)</li>
          <li>Highlight your years of experience and key skills</li>
          <li>Target your skills to the job you&apos;re applying for</li>
          <li>Include your most impressive achievements</li>
          <li>Avoid first-person pronouns (I, me, my)</li>
          <li>Use action verbs and quantify results when possible</li>
        </ul>
      </div>

      {/* Empty State - Show when there's no content */}
      {!summary.content && (
        <div className="rounded-md border-2 border-dashed border-gray-200 p-4 text-center">
          <Sparkles className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="font-medium text-gray-700">
            Your professional summary is empty
          </p>
          <p className="mx-auto mb-4 mt-1 max-w-md text-sm text-gray-500">
            A strong professional summary helps recruiters quickly understand
            your qualifications and increases your chances of getting an
            interview.
          </p>
          {showAiOptions && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Insert a starter template that AI can enhance
                handleContentChange(
                  "Experienced professional with expertise in [your field]. Skilled in [key skills] with a proven track record of [achievements].",
                );
              }}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Use Template
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
