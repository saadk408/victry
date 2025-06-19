// File: /app/resume/_components/resume-editor.tsx
"use client";

import { useState, useEffect } from "react";
import { useResume } from "@/hooks/use-resume";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { Resume } from "@/types/resume";

import dynamic from "next/dynamic";

// Dynamically import section editors to reduce initial bundle size
// Each editor is loaded only when its section is selected
const PersonalInfoEditor = dynamic(
  () => import("@/components/resume/section-editor/personal-info").then(mod => ({ default: mod.PersonalInfoEditor })),
  { 
    ssr: false,
    loading: () => <SectionLoading />
  }
);

const SummaryEditor = dynamic(
  () => import("@/components/resume/section-editor/summary").then(mod => ({ default: mod.SummaryEditor })),
  { 
    ssr: false,
    loading: () => <SectionLoading />
  }
);

const WorkExperienceEditor = dynamic(
  () => import("@/components/resume/section-editor/work-experience").then(mod => ({ default: mod.WorkExperienceEditor })),
  { 
    ssr: false,
    loading: () => <SectionLoading />
  }
);

const EducationEditor = dynamic(
  () => import("@/components/resume/section-editor/education").then(mod => ({ default: mod.EducationEditor })),
  { 
    ssr: false,
    loading: () => <SectionLoading />
  }
);

const SkillsEditor = dynamic(
  () => import("@/components/resume/section-editor/skills").then(mod => ({ default: mod.SkillsEditor })),
  { 
    ssr: false,
    loading: () => <SectionLoading />
  }
);

const ProjectsEditor = dynamic(
  () => import("@/components/resume/section-editor/projects").then(mod => ({ default: mod.ProjectsEditor })),
  { 
    ssr: false,
    loading: () => <SectionLoading />
  }
);

const CertificationsEditor = dynamic(
  () => import("@/components/resume/section-editor/certifications").then(mod => ({ default: mod.CertificationsEditor })),
  { 
    ssr: false,
    loading: () => <SectionLoading />
  }
);

const SocialLinksEditor = dynamic(
  () => import("@/components/resume/section-editor/social-links").then(mod => ({ default: mod.SocialLinksEditor })),
  { 
    ssr: false,
    loading: () => <SectionLoading />
  }
);

// Loading component for section editors
function SectionLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  );
}

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
