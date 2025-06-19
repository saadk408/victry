// File: /components/resume/section-editor/skills.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Skill } from "@/types/resume";
import { SkillInput } from "@/components/resume/editor-controls/skill-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AISuggestion } from "@/components/ai/ai-suggestion";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/utils";
import { type StatusType } from "@/lib/utils/status-colors";

/**
 * Props for the SkillsEditor component
 */
interface SkillsEditorProps {
  /** Skills array to edit */
  skills: Skill[];
  /** Callback function called when skills change */
  onChange: (skills: Skill[]) => void;
  /** Whether the editor is in a disabled state */
  disabled?: boolean;
  /** Whether to show AI suggestion options */
  showAiSuggestions?: boolean;
  /** Callback for requesting AI skill suggestions */
  onAiSuggest?: () => void;
  /** Suggested skills based on job description or user profile */
  suggestedSkills?: string[];
  /** Current AI suggestion state */
  aiSuggestionState?: {
    isLoading: boolean;
    suggestedSkills: Skill[];
    error: string | null;
  };
}

/**
 * Component for editing skills section of a resume
 * Allows adding, categorizing, and rating skills
 */
export function SkillsEditor({
  skills,
  onChange,
  disabled = false,
  showAiSuggestions = false,
  onAiSuggest,
  suggestedSkills = [],
  aiSuggestionState,
}: SkillsEditorProps) {
  // Maximum number of skills allowed
  const MAX_SKILLS = 50;

  // State for skill sets (sets of skills grouped by category)
  const [skillsByCategory, setSkillsByCategory] = useState<
    Record<string, Skill[]>
  >({});

  // Get all categories from existing skills
  const categories = Array.from(
    new Set(skills.filter((s) => s.category).map((s) => s.category)),
  );

  // Track if we've shown the max skills warning
  const [hasShownMaxWarning, setHasShownMaxWarning] = useState(false);

  // Track analytics events
  const [lastSkillCount, setLastSkillCount] = useState(skills.length);

  // Organize skills by category
  useEffect(() => {
    const grouped: Record<string, Skill[]> = {};

    // Group skills by category
    skills.forEach((skill) => {
      const category = skill.category || "Uncategorized";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    });

    setSkillsByCategory(grouped);

    // Track skills count changes for analytics
    if (skills.length !== lastSkillCount) {
      setLastSkillCount(skills.length);
    }

    // Show warning when max skills reached
    if (skills.length >= MAX_SKILLS && !hasShownMaxWarning) {
      setHasShownMaxWarning(true);
    } else if (skills.length < MAX_SKILLS) {
      setHasShownMaxWarning(false);
    }
  }, [skills, lastSkillCount, categories.length, hasShownMaxWarning]);

  /**
   * Handle requesting AI skill suggestions with analytics tracking
   */
  const handleAiSuggest = useCallback(() => {
    if (onAiSuggest) {
      onAiSuggest();
    }
  }, [onAiSuggest]);

  /**
   * Accept AI suggested skills
   * @param suggestedSkills - Array of skills suggested by AI
   */
  const handleAcceptSuggestedSkills = useCallback(
    (suggestedSkills: Skill[]) => {
      // Filter out skills that are already in the list (case-insensitive comparison)
      const existingSkillNames = skills.map((s) => s.name.toLowerCase());
      const newSkills = suggestedSkills.filter(
        (s) => !existingSkillNames.includes(s.name.toLowerCase()),
      );

      // Check if adding new skills would exceed the limit
      const availableSlots = MAX_SKILLS - skills.length;
      const skillsToAdd = newSkills.slice(0, availableSlots);

      if (skillsToAdd.length > 0) {
        // Add new skills
        const updatedSkills = [...skills, ...skillsToAdd];
        onChange(updatedSkills);
      }
    },
    [skills, onChange, MAX_SKILLS],
  );

  /**
   * Add a single empty skill
   */
  const handleAddFirstSkill = useCallback(() => {
    if (skills.length >= MAX_SKILLS) {
      return;
    }

    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: "",
      level: undefined,
      category: undefined,
    };

    onChange([...skills, newSkill]);
  }, [skills, onChange, MAX_SKILLS]);

  return (
    <div className="space-y-6">
      {/* Header with AI suggestion button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Skills</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {skills.length} of {MAX_SKILLS} skills added
          </p>
        </div>

        {showAiSuggestions && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAiSuggest}
            disabled={disabled || (aiSuggestionState?.isLoading ?? false)}
            className="border-info text-info hover:bg-info/10"
          >
            {aiSuggestionState?.isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Suggest Skills
              </>
            )}
          </Button>
        )}
      </div>

      {/* AI Suggestion Panel */}
      <AnimatePresence>
        {aiSuggestionState?.suggestedSkills &&
          aiSuggestionState.suggestedSkills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mb-4">
                <AISuggestion
                  original={JSON.stringify(
                    skills.map((s) => s.name).join(", "),
                  )}
                  suggestion={JSON.stringify(
                    aiSuggestionState.suggestedSkills
                      .map((s) => s.name)
                      .join(", "),
                  )}
                  onAccept={() =>
                    handleAcceptSuggestedSkills(
                      aiSuggestionState.suggestedSkills,
                    )
                  }
                  onReject={() => {
                    // Track rejection
                  }}
                  category="skill"
                  isLoading={aiSuggestionState.isLoading}
                  highlightDifferences={false}
                />
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* AI Error Alert */}
      {aiSuggestionState?.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{aiSuggestionState.error}</AlertDescription>
        </Alert>
      )}

      {/* Max Skills Alert */}
      {skills.length >= MAX_SKILLS && (
        <Alert className="mb-4 border-warning bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning-foreground">
            You&apos;ve reached the maximum of {MAX_SKILLS} skills. Consider
            removing less relevant skills before adding new ones.
          </AlertDescription>
        </Alert>
      )}

      {/* Skill Input */}
      <div className="space-y-4">
        <Label className="flex items-center">
          Add and organize your skills
          <span className="ml-2 text-xs text-muted-foreground">
            (tip: try grouping by category and adding proficiency levels)
          </span>
        </Label>

        {/* SkillInput component integrates: adding, deleting, categorizing, and rating skills */}
        <SkillInput
          skills={skills}
          onChange={onChange}
          maxSkills={MAX_SKILLS}
          allowCategories={true}
          allowLevels={true}
          suggestedSkills={suggestedSkills}
          disabled={disabled}
          className="mb-4"
        />
      </div>

      {/* Skills by category preview (visible only when there are skills) */}
      {skills.length > 0 && Object.keys(skillsByCategory).length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium">Skills Overview by Category</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.entries(skillsByCategory).map(
              ([category, categorySkills]) => (
                <Card
                  key={category}
                  className={cn(
                    "overflow-hidden transition-all",
                    categorySkills.length > 0 ? "opacity-100" : "opacity-70",
                  )}
                >
                  <CardContent className="p-4">
                    <h5 className="mb-2 flex items-center justify-between font-medium text-foreground">
                      <span>{category}</span>
                      {
                        <Badge variant="outline" className="text-xs">
                          {categorySkills.length}
                        </Badge>
                      }
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {categorySkills.map((skill) => {
                        // Map skill levels to semantic status types
                        const getSkillLevelStatus = (level?: string): StatusType => {
                          switch (level) {
                            case 'beginner':
                              return 'info';        // Blue tones
                            case 'intermediate':
                              return 'success';     // Green tones
                            case 'advanced':
                              return 'warning';     // Amber/warning tones
                            case 'expert':
                              return 'active';      // Accent/special color
                            default:
                              return 'neutral';     // Gray tones for no level
                          }
                        };

                        const skillStatus = getSkillLevelStatus(skill.level);

                        return (
                          <Badge
                            key={skill.id}
                            status={skillStatus}
                            statusVariant="soft"
                            className="font-normal"
                          >
                            {skill.name}
                            {skill.level && (
                              <span className="ml-1 text-xs opacity-70">
                                ({skill.level.charAt(0).toUpperCase()})
                              </span>
                            )}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
        <h4 className="mb-1 font-medium text-foreground">
          Tips for Skills Section
        </h4>
        <ul className="list-inside list-disc space-y-1">
          <li>List specific technical skills relevant to your target job</li>
          <li>
            Include both hard skills (technical) and soft skills (communication,
            teamwork)
          </li>
          <li>Organize skills into categories for better readability</li>
          <li>Prioritize skills mentioned in the job description</li>
          <li>Be honest about your proficiency levels</li>
          <li>
            Use the AI suggestions tool to discover skills you might have
            forgotten
          </li>
        </ul>
      </div>

      {/* Empty State */}
      {skills.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center rounded-md border-2 border-dashed py-8"
          initial={{ opacity: 0.8, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Sparkles className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="mb-1 font-medium text-foreground">No skills added yet</p>
          <p className="mb-4 max-w-sm text-center text-sm text-muted-foreground">
            Skills are essential for passing ATS systems. Add skills relevant to
            your target job to increase your chances.
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddFirstSkill}
              disabled={disabled}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Skill
            </Button>

            {showAiSuggestions && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAiSuggest}
                disabled={disabled || (aiSuggestionState?.isLoading ?? false)}
                className="border-info text-info hover:bg-info/10"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {aiSuggestionState?.isLoading
                  ? "Generating..."
                  : "Get AI Suggestions"}
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
