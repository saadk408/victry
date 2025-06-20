// File: /components/resume/section-editor/education.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateRangePicker } from "@/components/resume/editor-controls/date-range-picker";
import { SortableList } from "@/components/resume/editor-controls/sortable-list";
import { Education } from "@/types/resume";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Trash2,
  Plus,
  GraduationCap,
  School,
  MapPin,
  ListChecks,
  Award,
} from "lucide-react";
import { formatDateRange } from "@/lib/utils/formatting";
import * as React from "react";

/**
 * Props for the EducationEditor component
 */
interface EducationEditorProps {
  /** Array of education entries to edit */
  education: Education[];
  /** Callback function called when education data changes */
  onChange: (education: Education[]) => void;
  /** Whether the editor is in a disabled state */
  disabled?: boolean;
}

/**
 * Component for editing education section of a resume
 * Allows adding, editing, removing, and reordering education entries
 */
export function EducationEditor({
  education,
  onChange,
  disabled = false,
}: EducationEditorProps) {
  // Track which education entry is being edited
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Create a new empty education entry
  const createNewEducation = (): Education => ({
    id: crypto.randomUUID(),
    institution: "",
    degree: "",
    field: "",
    location: "",
    startDate: new Date().toISOString(),
    endDate: null,
    current: true,
    gpa: "",
    highlights: [],
  });

  // Add a new education entry
  const handleAddEducation = () => {
    const newEducation = createNewEducation();
    const updatedEducation = [...education, newEducation];
    onChange(updatedEducation);
    setExpandedId(newEducation.id);
  };

  // Update a specific education entry
  const handleUpdateEducation = (
    updatedEntry: Partial<Education>,
    index: number,
  ) => {
    const updatedEducation = [...education];
    updatedEducation[index] = { ...updatedEducation[index], ...updatedEntry };
    onChange(updatedEducation);
  };

  // Delete an education entry
  const handleDeleteEducation = (index: number) => {
    const updatedEducation = education.filter((_, i) => i !== index);
    onChange(updatedEducation);
  };

  // Add a highlight bullet point to an education entry
  const handleAddHighlight = (index: number) => {
    const updatedEducation = [...education];
    const highlights = updatedEducation[index].highlights || [];
    updatedEducation[index].highlights = [...highlights, ""];
    onChange(updatedEducation);
  };

  // Update a highlight bullet point
  const handleUpdateHighlight = (
    educationIndex: number,
    highlightIndex: number,
    text: string,
  ) => {
    const updatedEducation = [...education];
    const highlights = [...(updatedEducation[educationIndex].highlights || [])];
    highlights[highlightIndex] = text;
    updatedEducation[educationIndex].highlights = highlights;
    onChange(updatedEducation);
  };

  // Remove a highlight bullet point
  const handleRemoveHighlight = (
    educationIndex: number,
    highlightIndex: number,
  ) => {
    const updatedEducation = [...education];
    const highlights = [...(updatedEducation[educationIndex].highlights || [])];
    highlights.splice(highlightIndex, 1);
    updatedEducation[educationIndex].highlights = highlights;
    onChange(updatedEducation);
  };

  // Handle reordering of education entries
  const handleReorderEducation = (reorderedEducation: Education[]) => {
    onChange(reorderedEducation);
  };

  // Handle reordering of highlights within an education entry
  const handleReorderHighlights = (
    educationIndex: number,
    reorderedHighlights: string[],
  ) => {
    const updatedEducation = [...education];
    updatedEducation[educationIndex].highlights = reorderedHighlights;
    onChange(updatedEducation);
  };

  // Handle date range changes
  const handleDateChange = (
    index: number,
    dates: { startDate: string; endDate: string | null; isCurrent: boolean },
  ) => {
    handleUpdateEducation(
      {
        startDate: dates.startDate,
        endDate: dates.endDate,
        current: dates.isCurrent,
      },
      index,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Education</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddEducation}
          disabled={disabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Education
        </Button>
      </div>

      {education.length === 0 ? (
        <div className="rounded-md border-2 border-dashed py-8 text-center">
          <GraduationCap className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <h4 className="mb-1 text-base font-medium text-foreground">
            No education added yet
          </h4>
          <p className="mx-auto mb-3 max-w-sm text-sm text-muted-foreground">
            Add your educational background, including degrees, certificates,
            and relevant coursework.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddEducation}
            disabled={disabled}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Education
          </Button>
        </div>
      ) : (
        <SortableList
          items={education}
          onReorder={handleReorderEducation}
          disabled={disabled}
          getItemKey={(item) => item.id}
          addButtonText="Add Education"
          onAdd={handleAddEducation}
          emptyPlaceholder={
            <div className="py-6 text-center">
              <p className="text-muted-foreground">No education added yet</p>
            </div>
          }
          renderItem={(edu, index) => (
            <Accordion
              type="single"
              collapsible
              value={expandedId === edu.id ? edu.id : undefined}
              onValueChange={(value: string | undefined) =>
                setExpandedId(value || null)
              }
              className="w-full"
            >
              <AccordionItem
                value={edu.id}
                className="overflow-hidden rounded-md border"
              >
                <AccordionTrigger className="px-4 py-3 hover:bg-accent data-[state=open]:bg-accent">
                  <div className="flex w-full flex-col items-start text-left">
                    <div className="flex w-full items-center justify-between">
                      <h4 className="truncate font-medium">
                        {edu.institution || "Unnamed Institution"}
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        {formatDateRange(
                          edu.startDate,
                          edu.endDate,
                          edu.current,
                        )}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {edu.degree}
                      {edu.field ? ` in ${edu.field}` : ""}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-surface px-4 pb-4 pt-2">
                  <div className="space-y-4">
                    {/* Institution Name */}
                    <div>
                      <Label
                        htmlFor={`education-institution-${index}`}
                        className="flex items-center"
                      >
                        <School className="mr-2 h-4 w-4 text-muted-foreground" />
                        Institution
                        <span className="ml-1 text-destructive">*</span>
                      </Label>
                      <Input
                        id={`education-institution-${index}`}
                        value={edu.institution}
                        onChange={(e) =>
                          handleUpdateEducation(
                            { institution: e.target.value },
                            index,
                          )
                        }
                        placeholder="University or School Name"
                        className="mt-1"
                        disabled={disabled}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* Degree */}
                      <div>
                        <Label
                          htmlFor={`education-degree-${index}`}
                          className="flex items-center"
                        >
                          <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                          Degree/Certificate
                          <span className="ml-1 text-destructive">*</span>
                        </Label>
                        <Input
                          id={`education-degree-${index}`}
                          value={edu.degree}
                          onChange={(e) =>
                            handleUpdateEducation(
                              { degree: e.target.value },
                              index,
                            )
                          }
                          placeholder="Bachelor of Science, Master's, etc."
                          className="mt-1"
                          disabled={disabled}
                          required
                        />
                      </div>

                      {/* Field of Study */}
                      <div>
                        <Label htmlFor={`education-field-${index}`}>
                          Field of Study
                        </Label>
                        <Input
                          id={`education-field-${index}`}
                          value={edu.field}
                          onChange={(e) =>
                            handleUpdateEducation(
                              { field: e.target.value },
                              index,
                            )
                          }
                          placeholder="Computer Science, Business, etc."
                          className="mt-1"
                          disabled={disabled}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* Location */}
                      <div>
                        <Label
                          htmlFor={`education-location-${index}`}
                          className="flex items-center"
                        >
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          Location
                        </Label>
                        <Input
                          id={`education-location-${index}`}
                          value={edu.location}
                          onChange={(e) =>
                            handleUpdateEducation(
                              { location: e.target.value },
                              index,
                            )
                          }
                          placeholder="City, State or Country"
                          className="mt-1"
                          disabled={disabled}
                        />
                      </div>

                      {/* GPA */}
                      <div>
                        <Label htmlFor={`education-gpa-${index}`}>GPA</Label>
                        <Input
                          id={`education-gpa-${index}`}
                          value={edu.gpa || ""}
                          onChange={(e) =>
                            handleUpdateEducation(
                              { gpa: e.target.value },
                              index,
                            )
                          }
                          placeholder="3.8/4.0"
                          className="mt-1"
                          disabled={disabled}
                        />
                      </div>
                    </div>

                    {/* Date Range */}
                    <div>
                      <Label className="mb-1 flex items-center">
                        <ListChecks className="mr-2 h-4 w-4 text-muted-foreground" />
                        Date Range
                      </Label>
                      <DateRangePicker
                        startDate={edu.startDate}
                        endDate={edu.endDate}
                        isCurrent={edu.current}
                        onChange={(dates) => handleDateChange(index, dates)}
                        labels={{
                          startDate: "Start Date",
                          endDate: "End Date",
                          current: "Currently Studying Here",
                        }}
                        disabled={disabled}
                      />
                    </div>

                    {/* Highlights / Achievements */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <Label>Achievements & Activities</Label>
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

                      {(edu.highlights?.length || 0) === 0 ? (
                        <p className="text-sm italic text-muted-foreground">
                          Add key achievements, activities, honors, or relevant
                          coursework
                        </p>
                      ) : (
                        <SortableList
                          items={edu.highlights || []}
                          onReorder={(reordered) =>
                            handleReorderHighlights(index, reordered)
                          }
                          disabled={disabled}
                          onAdd={() => handleAddHighlight(index)}
                          onRemove={(highlightIndex) =>
                            handleRemoveHighlight(index, highlightIndex)
                          }
                          className="rounded-md border p-2"
                          emptyPlaceholder="No achievements added yet"
                          addButtonText="Add Achievement"
                          renderItem={(highlight, highlightIndex) => (
                            <div className="w-full">
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
                                placeholder="Describe an achievement, honor, or relevant coursework"
                                className="min-h-[60px] w-full resize-none"
                                disabled={disabled}
                              />
                            </div>
                          )}
                        />
                      )}
                    </div>

                    {/* Delete Education Button */}
                    <div className="flex justify-end border-t pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEducation(index)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={disabled}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Education
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
          Tips for Education Section
        </h4>
        <ul className="list-inside list-disc space-y-1">
          <li>List your most recent education first</li>
          <li>
            Include relevant coursework, projects, and academic achievements
          </li>
          <li>
            For recent graduates, highlight your GPA if it&apos;s 3.0 or higher
          </li>
          <li>
            Include certifications, honors, and awards related to your education
          </li>
        </ul>
      </div>
    </div>
  );
}
