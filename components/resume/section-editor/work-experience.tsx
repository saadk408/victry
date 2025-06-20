// File: /components/resume/section-editor/work-experience.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateRangePicker } from "@/components/resume/editor-controls/date-range-picker";
import { SortableList } from "@/components/resume/editor-controls/sortable-list";
import { WorkExperience } from "@/types/resume";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatDateRange } from "@/lib/utils/formatting";
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  PenTool,
  Plus,
  Trash2,
} from "lucide-react";
import { AISuggestion } from "@/components/ai/ai-suggestion";
import * as React from "react";

/**
 * Props for WorkExperienceEditor component
 */
interface WorkExperienceEditorProps {
  /** Array of work experience entries to edit */
  experiences: WorkExperience[];
  /** Callback function called when experiences data changes */
  onChange: (experiences: WorkExperience[]) => void;
  /** Whether the editor is in a disabled state */
  disabled?: boolean;
  /** Optional function to request AI suggestions for a bullet point */
  onRequestAiSuggestion?: (
    bulletPoint: string,
    context: string,
  ) => Promise<string>;
}

export function WorkExperienceEditor({
  experiences,
  onChange,
  disabled = false,
  onRequestAiSuggestion,
}: WorkExperienceEditorProps) {
  // Track which experience is being edited
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Track AI suggestion state for bullet points
  const [aiSuggestion, setAiSuggestion] = useState<{
    loading: boolean;
    experienceIndex: number;
    highlightIndex: number;
    original: string;
    suggestion: string | null;
    error: string | null;
  } | null>(null);

  /**
   * Create a new empty work experience
   */
  const createNewExperience = (): WorkExperience => ({
    id: crypto.randomUUID(),
    company: "",
    position: "",
    location: "",
    startDate: new Date().toISOString(),
    endDate: null,
    current: true,
    highlights: [""],
  });

  /**
   * Add a new work experience
   */
  const handleAddExperience = () => {
    const newExperience = createNewExperience();
    const updatedExperiences = [...experiences, newExperience];
    onChange(updatedExperiences);
    setExpandedId(newExperience.id);
  };

  /**
   * Update a specific work experience
   */
  const handleUpdateExperience = (
    updatedFields: Partial<WorkExperience>,
    index: number,
  ) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      ...updatedFields,
    };
    onChange(updatedExperiences);
  };

  /**
   * Delete a work experience
   */
  const handleDeleteExperience = (index: number) => {
    const updatedExperiences = experiences.filter((_, i) => i !== index);
    onChange(updatedExperiences);
  };

  /**
   * Add a highlight bullet point to a work experience
   */
  const handleAddHighlight = (index: number) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index].highlights.push("");
    onChange(updatedExperiences);
  };

  /**
   * Update a highlight bullet point
   */
  const handleUpdateHighlight = (
    experienceIndex: number,
    highlightIndex: number,
    text: string,
  ) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[experienceIndex].highlights[highlightIndex] = text;
    onChange(updatedExperiences);
  };

  /**
   * Remove a highlight bullet point
   */
  const handleRemoveHighlight = (
    experienceIndex: number,
    highlightIndex: number,
  ) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[experienceIndex].highlights = updatedExperiences[
      experienceIndex
    ].highlights.filter((_, i) => i !== highlightIndex);
    onChange(updatedExperiences);
  };

  /**
   * Handle reordering of work experiences
   */
  const handleReorderExperiences = (reorderedExperiences: WorkExperience[]) => {
    onChange(reorderedExperiences);
  };

  /**
   * Handle reordering of highlights within a work experience
   */
  const handleReorderHighlights = (
    experienceIndex: number,
    reorderedHighlights: string[],
  ) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[experienceIndex].highlights = reorderedHighlights;
    onChange(updatedExperiences);
  };

  /**
   * Handle date range changes
   */
  const handleDateChange = (
    index: number,
    dates: { startDate: string; endDate: string | null; isCurrent: boolean },
  ) => {
    handleUpdateExperience(
      {
        startDate: dates.startDate,
        endDate: dates.endDate,
        current: dates.isCurrent,
      },
      index,
    );
  };

  /**
   * Request AI suggestion for a bullet point
   */
  const handleRequestAiSuggestion = async (
    experienceIndex: number,
    highlightIndex: number,
  ) => {
    if (!onRequestAiSuggestion) return;

    const experience = experiences[experienceIndex];
    const highlightText = experience.highlights[highlightIndex];

    // If the highlight is empty, don't suggest
    if (!highlightText.trim()) return;

    // Set loading state
    setAiSuggestion({
      loading: true,
      experienceIndex,
      highlightIndex,
      original: highlightText,
      suggestion: null,
      error: null,
    });

    try {
      // Generate context from the experience
      const context = `Position: ${experience.position}
Company: ${experience.company}
Location: ${experience.location}
Duration: ${formatDateRange(experience.startDate, experience.endDate, experience.current)}`;

      // Request the suggestion
      const suggestion = await onRequestAiSuggestion(highlightText, context);

      // Update with the suggestion
      setAiSuggestion((prev) => ({
        ...prev!,
        loading: false,
        suggestion,
      }));
    } catch (error) {
      // Handle error
      setAiSuggestion((prev) => ({
        ...prev!,
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to get suggestion",
      }));
    }
  };

  /**
   * Accept AI suggestion for a bullet point
   */
  const handleAcceptAiSuggestion = () => {
    if (!aiSuggestion || !aiSuggestion.suggestion) return;

    const { experienceIndex, highlightIndex, suggestion } = aiSuggestion;

    // Update the highlight with the suggestion
    handleUpdateHighlight(experienceIndex, highlightIndex, suggestion);

    // Clear the suggestion
    setAiSuggestion(null);
  };

  /**
   * Reject AI suggestion for a bullet point
   */
  const handleRejectAiSuggestion = () => {
    // Just clear the suggestion
    setAiSuggestion(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Work Experience</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddExperience}
          disabled={disabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </Button>
      </div>

      {/* Empty state */}
      {experiences.length === 0 ? (
        <div className="rounded-md border-2 border-dashed py-8 text-center">
          <Briefcase className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h4 className="mb-1 text-base font-medium text-foreground">
            No work experience added yet
          </h4>
          <p className="mx-auto mb-3 max-w-sm text-sm text-muted-foreground">
            Add your relevant work history. Focus on achievements and
            responsibilities that showcase your skills for the target job.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddExperience}
            disabled={disabled}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Work Experience
          </Button>
        </div>
      ) : (
        <SortableList
          items={experiences}
          onReorder={handleReorderExperiences}
          disabled={disabled}
          getItemKey={(item) => item.id}
          addButtonText="Add Work Experience"
          onAdd={handleAddExperience}
          onRemove={(index) => handleDeleteExperience(index)}
          emptyPlaceholder={
            <div className="py-6 text-center">
              <p className="text-muted-foreground">No work experience added yet</p>
            </div>
          }
          renderItem={(experience, index) => (
            <Accordion
              type="single"
              collapsible
              value={expandedId === experience.id ? experience.id : undefined}
              onValueChange={(value: string | undefined) =>
                setExpandedId(value || null)
              }
              className="w-full"
            >
              <AccordionItem
                value={experience.id}
                className="overflow-hidden rounded-md border"
              >
                <AccordionTrigger className="px-4 py-3 hover:bg-muted data-[state=open]:bg-muted">
                  <div className="flex w-full flex-col items-start text-left">
                    <div className="flex w-full items-center justify-between">
                      <h4 className="truncate font-medium">
                        {experience.position || "Untitled Position"}
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        {formatDateRange(
                          experience.startDate,
                          experience.endDate,
                          experience.current,
                        )}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {experience.company}
                      {experience.location ? `, ${experience.location}` : ""}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-background px-4 pb-4 pt-2">
                  <div className="space-y-4">
                    {/* Position/Title */}
                    <div>
                      <Label
                        htmlFor={`work-position-${index}`}
                        className="flex items-center"
                      >
                        <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                        Position/Title
                        <span className="ml-1 text-destructive">*</span>
                      </Label>
                      <Input
                        id={`work-position-${index}`}
                        value={experience.position}
                        onChange={(e) =>
                          handleUpdateExperience(
                            { position: e.target.value },
                            index,
                          )
                        }
                        placeholder="Software Engineer, Project Manager, etc."
                        className="mt-1"
                        disabled={disabled}
                        required
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <Label
                        htmlFor={`work-company-${index}`}
                        className="flex items-center"
                      >
                        <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                        Company
                        <span className="ml-1 text-destructive">*</span>
                      </Label>
                      <Input
                        id={`work-company-${index}`}
                        value={experience.company}
                        onChange={(e) =>
                          handleUpdateExperience(
                            { company: e.target.value },
                            index,
                          )
                        }
                        placeholder="Company Name"
                        className="mt-1"
                        disabled={disabled}
                        required
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <Label
                        htmlFor={`work-location-${index}`}
                        className="flex items-center"
                      >
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        Location
                      </Label>
                      <Input
                        id={`work-location-${index}`}
                        value={experience.location}
                        onChange={(e) =>
                          handleUpdateExperience(
                            { location: e.target.value },
                            index,
                          )
                        }
                        placeholder="City, State or Remote"
                        className="mt-1"
                        disabled={disabled}
                      />
                    </div>

                    {/* Date Range */}
                    <div>
                      <Label className="mb-1 flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        Date Range
                      </Label>
                      <DateRangePicker
                        startDate={experience.startDate}
                        endDate={experience.endDate}
                        isCurrent={experience.current}
                        onChange={(dates) => handleDateChange(index, dates)}
                        labels={{
                          startDate: "Start Date",
                          endDate: "End Date",
                          current: "I Currently Work Here",
                        }}
                        disabled={disabled}
                      />
                    </div>

                    {/* Responsibilities/Achievements */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <Label className="flex items-center">
                          <PenTool className="mr-2 h-4 w-4 text-muted-foreground" />
                          Accomplishments & Responsibilities
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddHighlight(index)}
                          className="h-7 px-2"
                          disabled={disabled}
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          Add Bullet
                        </Button>
                      </div>

                      {(experience.highlights?.length || 0) === 0 ? (
                        <p className="text-sm italic text-muted-foreground">
                          Add key accomplishments and responsibilities relevant
                          to your target job
                        </p>
                      ) : (
                        <SortableList
                          items={experience.highlights}
                          onReorder={(reordered) =>
                            handleReorderHighlights(index, reordered)
                          }
                          disabled={disabled}
                          onAdd={() => handleAddHighlight(index)}
                          onRemove={(highlightIndex) =>
                            handleRemoveHighlight(index, highlightIndex)
                          }
                          className="rounded-md border p-2"
                          emptyPlaceholder="No bullets added yet"
                          addButtonText="Add Bullet"
                          renderItem={(highlight, highlightIndex) => (
                            <div className="w-full">
                              <div className="flex flex-col">
                                <Textarea
                                  value={highlight}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLTextAreaElement>,
                                  ) =>
                                    handleUpdateHighlight(
                                      index,
                                      highlightIndex,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Describe a key achievement or responsibility"
                                  className="mb-1 min-h-[80px] w-full resize-none"
                                  disabled={disabled}
                                />

                                {onRequestAiSuggestion &&
                                  highlight.trim().length > 10 && (
                                    <div className="mt-1 self-end">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-primary hover:text-primary"
                                        onClick={() =>
                                          handleRequestAiSuggestion(
                                            index,
                                            highlightIndex,
                                          )
                                        }
                                        disabled={
                                          disabled || aiSuggestion?.loading
                                        }
                                      >
                                        Enhance with AI
                                      </Button>
                                    </div>
                                  )}
                              </div>

                              {/* Show AI suggestion if available for this bullet */}
                              {aiSuggestion &&
                                aiSuggestion.experienceIndex === index &&
                                aiSuggestion.highlightIndex ===
                                  highlightIndex &&
                                aiSuggestion.suggestion && (
                                  <div className="mt-2">
                                    <AISuggestion
                                      original={aiSuggestion.original}
                                      suggestion={aiSuggestion.suggestion}
                                      onAccept={handleAcceptAiSuggestion}
                                      onReject={handleRejectAiSuggestion}
                                      category="bullet"
                                      isLoading={aiSuggestion.loading}
                                    />
                                  </div>
                                )}
                            </div>
                          )}
                        />
                      )}
                    </div>

                    {/* Delete Experience Button */}
                    <div className="flex justify-end border-t pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExperience(index)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={disabled}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Experience
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        />
      )}

      {/* Help Text */}
      <div className="mt-4 rounded-md bg-muted p-4 text-sm text-muted-foreground">
        <h4 className="mb-1 font-medium text-foreground">
          Tips for Work Experience
        </h4>
        <ul className="list-inside list-disc space-y-1">
          <li>List your most recent positions first</li>
          <li>Focus on accomplishments rather than just responsibilities</li>
          <li>
            Use action verbs and specific metrics when possible (e.g.,
            &quot;Increased sales by 20%&quot;)
          </li>
          <li>Tailor your bullets to be relevant to your target job</li>
          <li>Keep bullet points concise and impactful</li>
        </ul>
      </div>
    </div>
  );
}
