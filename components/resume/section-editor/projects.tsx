// File: /components/resume/section-editor/projects.tsx
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SortableList } from "@/components/resume/editor-controls/sortable-list";
import { Project } from "@/types/resume";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Trash2,
  Plus,
  FolderGit,
  Calendar,
  Link as LinkIcon,
  FileText,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils/formatting";
import { isValidUrl } from "@/lib/utils/validation";
import * as React from "react";

/**
 * Props for the ProjectsEditor component
 */
interface ProjectsEditorProps {
  /** Projects array to edit */
  projects: Project[];
  /** Callback function called when projects change */
  onChange: (projects: Project[]) => void;
  /** Whether the editor is in a disabled state */
  disabled?: boolean;
}

/**
 * Component for editing projects section of a resume
 * Allows adding, editing, removing, and reordering project entries
 */
export function ProjectsEditor({
  projects,
  onChange,
  disabled = false,
}: ProjectsEditorProps) {
  // Track which project is being edited
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Track validation errors
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>(
    {},
  );

  /**
   * Create a new empty project
   * @returns A new Project object with default values
   */
  const createNewProject = useCallback(
    (): Project => ({
      id: crypto.randomUUID(),
      name: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      url: undefined,
      highlights: [],
    }),
    [],
  );

  /**
   * Add a new project to the list
   */
  const handleAddProject = useCallback(() => {
    const newProject = createNewProject();
    const updatedProjects = [...projects, newProject];
    onChange(updatedProjects);
    setExpandedId(newProject.id);
  }, [projects, onChange, createNewProject]);

  /**
   * Validate project data
   */
  const validateProject = useCallback(
    (project: Project): Record<string, string> => {
      const projectErrors: Record<string, string> = {};

      // Validate required fields
      if (!project.name.trim()) {
        projectErrors.name = "Project name is required";
      }

      // Validate URL if provided
      if (project.url && !isValidUrl(project.url)) {
        projectErrors.url = "Please enter a valid URL";
      }

      return projectErrors;
    },
    [],
  );

  /**
   * Update a specific project with validation
   * @param updatedEntry - Partial project object with fields to update
   * @param index - The index of the project to update
   */
  const handleUpdateProject = useCallback(
    (updatedEntry: Partial<Project>, index: number) => {
      const updatedProjects = [...projects];
      const updatedProject = { ...updatedProjects[index], ...updatedEntry };
      updatedProjects[index] = updatedProject;

      // Validate the updated project
      const projectErrors = validateProject(updatedProject);

      // Update errors state
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (Object.keys(projectErrors).length > 0) {
          newErrors[index] = projectErrors;
        } else {
          delete newErrors[index];
        }
        return newErrors;
      });

      onChange(updatedProjects);
    },
    [projects, onChange, validateProject],
  );

  /**
   * Delete a project from the list
   * @param index - The index of the project to delete
   */
  const handleDeleteProject = useCallback(
    (index: number) => {
      const updatedProjects = projects.filter((_, i) => i !== index);
      onChange(updatedProjects);

      // Clear validation errors for the deleted project
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];

        // Reindex errors for remaining projects
        const reindexedErrors: Record<string, Record<string, string>> = {};
        Object.entries(newErrors).forEach(([key, value]) => {
          const keyNum = parseInt(key);
          if (keyNum > index) {
            reindexedErrors[keyNum - 1] = value;
          } else {
            reindexedErrors[key] = value;
          }
        });

        return reindexedErrors;
      });
    },
    [projects, onChange],
  );

  /**
   * Add a highlight bullet point to a project
   * @param index - The index of the project to add the highlight to
   */
  const handleAddHighlight = useCallback(
    (index: number) => {
      const updatedProjects = [...projects];
      const highlights = updatedProjects[index].highlights || [];
      updatedProjects[index].highlights = [...highlights, ""];
      onChange(updatedProjects);
    },
    [projects, onChange],
  );

  /**
   * Update a highlight bullet point
   * @param projectIndex - The index of the project
   * @param highlightIndex - The index of the highlight to update
   * @param text - The new text for the highlight
   */
  const handleUpdateHighlight = useCallback(
    (projectIndex: number, highlightIndex: number, text: string) => {
      const updatedProjects = [...projects];
      const highlights = [...(updatedProjects[projectIndex].highlights || [])];
      highlights[highlightIndex] = text;
      updatedProjects[projectIndex].highlights = highlights;
      onChange(updatedProjects);
    },
    [projects, onChange],
  );

  /**
   * Remove a highlight bullet point
   * @param projectIndex - The index of the project
   * @param highlightIndex - The index of the highlight to remove
   */
  const handleRemoveHighlight = useCallback(
    (projectIndex: number, highlightIndex: number) => {
      const updatedProjects = [...projects];
      const highlights = [...(updatedProjects[projectIndex].highlights || [])];
      highlights.splice(highlightIndex, 1);
      updatedProjects[projectIndex].highlights = highlights;
      onChange(updatedProjects);
    },
    [projects, onChange],
  );

  /**
   * Handle reordering of projects
   * @param reorderedProjects - The new order of projects
   */
  const handleReorderProjects = useCallback(
    (reorderedProjects: Project[]) => {
      onChange(reorderedProjects);
    },
    [onChange],
  );

  /**
   * Handle reordering of highlights within a project
   */
  const handleReorderHighlights = useCallback(
    (projectIndex: number, reorderedHighlights: string[]) => {
      const updatedProjects = [...projects];
      updatedProjects[projectIndex].highlights = reorderedHighlights;
      onChange(updatedProjects);
    },
    [projects, onChange],
  );

  /**
   * Handle accordion value change
   */
  const handleAccordionChange = useCallback(
    (value: string | null) => {
      setExpandedId(value);
    },
    [setExpandedId],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Projects</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddProject}
          disabled={disabled}
          aria-label="Add a new project"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-md border-2 border-dashed py-8 text-center">
          <FolderGit className="mx-auto mb-3 h-10 w-10 text-gray-400" />
          <h4 className="mb-1 text-base font-medium text-gray-700">
            No projects added yet
          </h4>
          <p className="mx-auto mb-3 max-w-sm text-sm text-gray-500">
            Showcase your best work by adding relevant projects. These could be
            professional, personal, or academic projects.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddProject}
            disabled={disabled}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>
      ) : (
        <SortableList
          items={projects}
          onReorder={handleReorderProjects}
          disabled={disabled}
          getItemKey={(item) => item.id}
          addButtonText="Add Project"
          onAdd={handleAddProject}
          emptyPlaceholder={
            <div className="py-6 text-center">
              <p className="text-gray-500">No projects added yet</p>
            </div>
          }
          renderItem={(project, index) => (
            <Accordion
              type="single"
              collapsible
              value={expandedId === project.id ? project.id : undefined}
              onValueChange={(value: string | undefined) =>
                handleAccordionChange(value || null)
              }
              className="w-full"
            >
              <AccordionItem
                value={project.id}
                className="overflow-hidden rounded-md border"
              >
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 data-[state=open]:bg-gray-50">
                  <div className="flex w-full flex-col items-start text-left">
                    <div className="flex w-full items-center justify-between">
                      <h4 className="font-medium">
                        {project.name || "Untitled Project"}
                      </h4>
                      {(project.startDate || project.endDate) && (
                        <div className="text-sm text-gray-500">
                          {project.startDate
                            ? formatDate(project.startDate, "short")
                            : ""}
                          {project.endDate &&
                            ` - ${formatDate(project.endDate, "short")}`}
                        </div>
                      )}
                    </div>
                    {project.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-gray-600">
                        {project.description}
                      </p>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <div className="space-y-4">
                    {/* Project Name */}
                    <div>
                      <Label
                        htmlFor={`project-name-${index}`}
                        className="flex items-center"
                      >
                        <FolderGit className="mr-2 h-4 w-4 text-gray-500" />
                        Project Name
                        <span className="ml-1 text-red-500">*</span>
                      </Label>
                      <Input
                        id={`project-name-${index}`}
                        value={project.name}
                        onChange={(e) =>
                          handleUpdateProject({ name: e.target.value }, index)
                        }
                        placeholder="E-commerce Website, Mobile App, etc."
                        className="mt-1"
                        disabled={disabled}
                        required
                        aria-invalid={errors[index]?.name ? "true" : "false"}
                        aria-describedby={
                          errors[index]?.name
                            ? `project-name-error-${index}`
                            : undefined
                        }
                      />
                      {errors[index]?.name && (
                        <p
                          id={`project-name-error-${index}`}
                          className="mt-1 flex items-center text-sm text-red-500"
                        >
                          <AlertCircle className="mr-1 h-3.5 w-3.5" />
                          {errors[index].name}
                        </p>
                      )}
                    </div>

                    {/* Project Description */}
                    <div>
                      <Label
                        htmlFor={`project-description-${index}`}
                        className="flex items-center"
                      >
                        <FileText className="mr-2 h-4 w-4 text-gray-500" />
                        Description
                      </Label>
                      <Textarea
                        id={`project-description-${index}`}
                        value={project.description || ""}
                        onChange={(e) =>
                          handleUpdateProject(
                            { description: e.target.value },
                            index,
                          )
                        }
                        placeholder="Brief overview of the project and your role"
                        className="mt-1 min-h-[80px]"
                        disabled={disabled}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* Project URL */}
                      <div>
                        <Label
                          htmlFor={`project-url-${index}`}
                          className="flex items-center"
                        >
                          <LinkIcon className="mr-2 h-4 w-4 text-gray-500" />
                          Project URL
                        </Label>
                        <Input
                          id={`project-url-${index}`}
                          value={project.url || ""}
                          onChange={(e) =>
                            handleUpdateProject({ url: e.target.value }, index)
                          }
                          placeholder="https://project-demo.com"
                          className="mt-1"
                          disabled={disabled}
                          aria-invalid={errors[index]?.url ? "true" : "false"}
                          aria-describedby={
                            errors[index]?.url
                              ? `project-url-error-${index}`
                              : undefined
                          }
                        />
                        {errors[index]?.url && (
                          <p
                            id={`project-url-error-${index}`}
                            className="mt-1 flex items-center text-sm text-red-500"
                          >
                            <AlertCircle className="mr-1 h-3.5 w-3.5" />
                            {errors[index].url}
                          </p>
                        )}
                      </div>

                      {/* Project Date */}
                      <div>
                        <Label
                          htmlFor={`project-date-${index}`}
                          className="flex items-center"
                        >
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          Date (optional)
                        </Label>
                        <Input
                          id={`project-date-${index}`}
                          value={project.startDate || ""}
                          onChange={(e) =>
                            handleUpdateProject(
                              { startDate: e.target.value },
                              index,
                            )
                          }
                          placeholder="June 2023"
                          className="mt-1"
                          disabled={disabled}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Format can be month/year (e.g., &quot;June 2023&quot;) or a
                          specific date
                        </p>
                      </div>
                    </div>

                    {/* Highlights / Key Features */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <Label>Key Features & Accomplishments</Label>
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

                      {(project.highlights?.length || 0) === 0 ? (
                        <p className="text-sm italic text-gray-500">
                          Add bullet points highlighting key features,
                          technologies used, or results achieved
                        </p>
                      ) : (
                        <SortableList
                          items={project.highlights || []}
                          onReorder={(reordered) =>
                            handleReorderHighlights(index, reordered)
                          }
                          disabled={disabled}
                          onAdd={() => handleAddHighlight(index)}
                          onRemove={(highlightIndex) =>
                            handleRemoveHighlight(index, highlightIndex)
                          }
                          className="rounded-md border p-2"
                          emptyPlaceholder="No highlights added yet"
                          addButtonText="Add Highlight"
                          renderItem={(highlight, highlightIndex) => (
                            <div className="w-full">
                              <Textarea
                                value={highlight}
                                onChange={(e) =>
                                  handleUpdateHighlight(
                                    index,
                                    highlightIndex,
                                    e.target.value,
                                  )
                                }
                                placeholder="Built responsive UI with React, resulting in 30% faster page loads"
                                className="min-h-[60px] w-full resize-none"
                                disabled={disabled}
                              />
                            </div>
                          )}
                        />
                      )}
                    </div>

                    {/* Delete Project Button */}
                    <div className="flex justify-end border-t pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProject(index)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={disabled}
                        aria-label={`Remove ${project.name || "project"}`}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Project
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
      <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">
        <h4 className="mb-1 font-medium text-gray-700">
          Tips for Project Section
        </h4>
        <ul className="list-inside list-disc space-y-1">
          <li>Showcase projects relevant to your target job</li>
          <li>Emphasize your specific contributions to team projects</li>
          <li>Highlight technologies, tools, and methodologies used</li>
          <li>When possible, include quantifiable results or achievements</li>
          <li>
            Include project links when available (GitHub, live demos, etc.)
          </li>
        </ul>
      </div>
    </div>
  );
}
