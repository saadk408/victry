// File: /app/resume/_components/resume-editor.tsx
"use client";

import { useState, useEffect } from "react";
import { useResume } from "@/hooks/use-resume";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { Resume } from "@/types/resume";

// Import section editors
import { PersonalInfoEditor } from "@/components/resume/section-editor/personal-info";
import { SummaryEditor } from "@/components/resume/section-editor/summary";
import { WorkExperienceEditor } from "@/components/resume/section-editor/work-experience";
import { EducationEditor } from "@/components/resume/section-editor/education";
import { SkillsEditor } from "@/components/resume/section-editor/skills";
import { ProjectsEditor } from "@/components/resume/section-editor/projects";
import { CertificationsEditor } from "@/components/resume/section-editor/certifications";
import { SocialLinksEditor } from "@/components/resume/section-editor/social-links";
// import { CustomSectionsEditor } from "@/components/resume/section-editor/custom-sections"; // Commented out - component likely missing

interface ResumeEditorProps {
  id: string;
}

export function ResumeEditor({ id }: ResumeEditorProps) {
  const { resume, loading, error, fetchResume } = useResume(id);

  // Local state for the resume being edited
  const [editedResume, setEditedResume] = useState<Resume | null>(null);
  const [activeSection, setActiveSection] = useState<string>("personal-info");
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Update local state when resume data is loaded
  useEffect(() => {
    if (resume && !editedResume) {
      setEditedResume({ ...resume });
    }
  }, [resume, editedResume]);

  // Handle beforeunload event to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [unsavedChanges]);

  // Generic function to update a section of the resume
  const updateSection = <T extends keyof Resume>(
    section: T,
    value: Resume[T],
  ) => {
    if (!editedResume) return;

    setEditedResume((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [section]: value,
      };
    });

    setUnsavedChanges(true);
  };

  if (loading && !editedResume) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-500">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error || (!resume && !loading)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="font-medium text-gray-700">Failed to load resume</p>
          <p className="max-w-md text-gray-500">
            {error?.message ||
              "The resume couldn't be loaded. Please try again or contact support."}
          </p>
          <Button onClick={() => fetchResume()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!editedResume) {
    return null;
  }

  // List of sections in the editor
  const sections = [
    { id: "personal-info", label: "Personal Info" },
    { id: "professional-summary", label: "Professional Summary" },
    { id: "work-experience", label: "Work Experience" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "certifications", label: "Certifications" },
    { id: "social-links", label: "Social Links" },
    // { id: "custom-sections", label: "Custom Sections" }, // Commented out
  ];

  return (
    <div className="space-y-4 p-3">
      {/* Basic Resume Info - always visible */}
      <div>
        <div className="mb-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Resume Title
            </label>
            <input
              type="text"
              value={editedResume.title}
              onChange={(e) => {
                updateSection("title", e.target.value);
              }}
              className="w-full rounded-md border p-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Target Job Title
            </label>
            <input
              type="text"
              value={editedResume.targetJobTitle}
              onChange={(e) => {
                updateSection("targetJobTitle", e.target.value);
              }}
              className="w-full rounded-md border p-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="rounded-md bg-gray-50 p-2">
        <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-500">
          Resume Sections
        </h3>
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              className={cn(
                "w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                activeSection === section.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div className="mt-4 space-y-4">
        {/* Personal Info */}
        <div className={activeSection === "personal-info" ? "block" : "hidden"}>
          <PersonalInfoEditor
            personalInfo={editedResume.personalInfo}
            onChange={(personalInfo) => {
              updateSection("personalInfo", personalInfo);
            }}
          />
        </div>
        {/* Professional Summary */}
        <div
          className={
            activeSection === "professional-summary" ? "block" : "hidden"
          }
        >
          <SummaryEditor
            summary={editedResume.professionalSummary}
            onChange={(summary) => {
              updateSection("professionalSummary", summary);
            }}
          />
        </div>
        {/* Work Experience */}
        <div
          className={activeSection === "work-experience" ? "block" : "hidden"}
        >
          <WorkExperienceEditor
            experiences={editedResume.workExperiences}
            onChange={(experiences) => {
              updateSection("workExperiences", experiences);
            }}
          />
        </div>
        {/* Education */}
        <div className={activeSection === "education" ? "block" : "hidden"}>
          <EducationEditor
            education={editedResume.education}
            onChange={(education) => {
              updateSection("education", education);
            }}
          />
        </div>
        {/* Skills */}
        <div className={activeSection === "skills" ? "block" : "hidden"}>
          <SkillsEditor
            skills={editedResume.skills}
            onChange={(skills) => {
              updateSection("skills", skills);
            }}
          />
        </div>
        {/* Projects */}
        <div className={activeSection === "projects" ? "block" : "hidden"}>
          <ProjectsEditor
            projects={editedResume.projects}
            onChange={(projects) => {
              updateSection("projects", projects);
            }}
          />
        </div>
        {/* Certifications */}
        <div
          className={activeSection === "certifications" ? "block" : "hidden"}
        >
          <CertificationsEditor
            certifications={editedResume.certifications}
            onChange={(certifications) => {
              updateSection("certifications", certifications);
            }}
          />
        </div>
        {/* Social Links */}
        <div className={activeSection === "social-links" ? "block" : "hidden"}>
          <SocialLinksEditor
            socialLinks={editedResume.socialLinks}
            onChange={(socialLinks) => {
              updateSection("socialLinks", socialLinks);
            }}
          />
        </div>
        {/* Custom Sections */}
        {/* <div
          className={activeSection === "custom-sections" ? "block" : "hidden"}
        >
          <CustomSectionsEditor
            customSections={editedResume.customSections}
            onChange={(customSections) => {
              updateSection("customSections", customSections);
            }}
          />
        </div> */}
      </div>

      {/* Unsaved changes indicator */}
      {unsavedChanges && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-2 text-center text-sm text-yellow-700">
          You have unsaved changes. Click Save Changes in the header to save.
        </div>
      )}
    </div>
  );
}
