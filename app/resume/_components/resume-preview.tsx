// File: /app/resume/_components/resume-preview.tsx
"use client";

import { useState, useEffect } from "react";
import { useResume } from "@/hooks/use-resume";
import { Loader2, AlertCircle } from "lucide-react";
import { formatDate, formatDateRange } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils/utils";

// Define template configurations
const templates = {
  modern: {
    container: "font-sans",
    header: "border-b-2 border-blue-600 pb-4 mb-6",
    name: "text-3xl font-bold text-blue-900",
    jobTitle: "text-xl text-foreground mt-1",
    contactInfo: "flex flex-wrap mt-3 text-sm text-muted-foreground",
    sectionTitle:
      "text-lg font-bold text-blue-900 mb-2 uppercase tracking-wider",
    sectionContainer: "mb-6",
    experienceTitle: "font-bold",
    experienceCompany: "text-foreground",
    experienceDate: "text-muted-foreground",
    skillBadge:
      "bg-info/10 text-info rounded-full px-3 py-1 text-sm mr-2 mb-2",
  },
  professional: {
    container: "font-serif",
    header: "text-center border-b border-border pb-6 mb-6",
    name: "text-3xl font-bold text-foreground uppercase tracking-wide",
    jobTitle: "text-xl text-muted-foreground mt-1",
    contactInfo: "flex justify-center flex-wrap mt-3 text-sm text-muted-foreground",
    sectionTitle:
      "text-base font-bold text-foreground mb-3 uppercase border-b border-border pb-1",
    sectionContainer: "mb-6",
    experienceTitle: "font-bold text-foreground",
    experienceCompany: "font-medium text-foreground",
    experienceDate: "text-muted-foreground italic",
    skillBadge: "mb-2 mr-4 text-sm",
  },
  minimal: {
    container: "font-sans",
    header: "mb-8",
    name: "text-2xl font-bold",
    jobTitle: "text-muted-foreground",
    contactInfo: "flex flex-wrap mt-1 text-sm text-muted-foreground space-x-3",
    sectionTitle:
      "text-sm uppercase tracking-wider font-bold text-muted-foreground mb-3",
    sectionContainer: "mb-6",
    experienceTitle: "font-medium",
    experienceCompany: "text-muted-foreground",
    experienceDate: "text-muted-foreground text-sm",
    skillBadge: "mr-3 mb-1 text-sm",
  },
  creative: {
    container: "font-sans",
    header:
      "flex items-center justify-between border-l-4 border-indigo-500 pl-3 py-2 mb-6",
    name: "text-2xl font-bold text-indigo-700",
    jobTitle: "text-indigo-600 mt-1",
    contactInfo: "mt-2 flex flex-wrap text-sm text-muted-foreground",
    sectionTitle: "text-indigo-700 font-bold text-lg mb-3 flex items-center",
    sectionContainer: "mb-8",
    experienceTitle: "font-semibold text-indigo-600",
    experienceCompany: "text-foreground",
    experienceDate: "text-muted-foreground text-sm",
    skillBadge:
      "bg-indigo-50 text-indigo-700 px-2 py-1 rounded mr-2 mb-2 text-sm",
  },
};

interface ResumePreviewProps {
  id: string;
}

export function ResumePreview({ id }: ResumePreviewProps) {
  const { resume, loading, error } = useResume(id);
  const [scale, setScale] = useState(1);

  // Adjust scale based on container size
  useEffect(() => {
    const handleResize = () => {
      const containerWidth =
        document.getElementById("resume-preview-container")?.clientWidth || 800;
      const desiredWidth = 800; // Standard resume width
      const newScale = Math.min(1, containerWidth / desiredWidth);
      setScale(newScale);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[1056px] items-center justify-center rounded bg-surface p-8 shadow">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading resume preview...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="flex h-[1056px] items-center justify-center rounded bg-surface p-8 shadow">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="font-medium text-foreground">
            Failed to load resume preview
          </p>
          <p className="max-w-md text-muted-foreground">
            {error?.message ||
              "The resume couldn't be loaded. Please try again or contact support."}
          </p>
        </div>
      </div>
    );
  }

  // Get template styles - default to 'modern' if template doesn't exist
  const templateId =
    resume.templateId && templates[resume.templateId as keyof typeof templates]
      ? (resume.templateId as keyof typeof templates)
      : "modern";

  const template = templates[templateId];

  return (
    <div
      id="resume-preview-container"
      className="overflow-hidden rounded bg-surface p-8 shadow"
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          height: `${1056 * scale}px`, // A4 height scaled
          width: "800px", // A4 width
        }}
        className="relative mx-auto transition-transform duration-200 ease-in-out"
      >
        <div
          className={cn(
            "h-full w-full bg-surface p-8 text-foreground",
            template.container,
          )}
        >
          {/* Header section */}
          <header className={template.header}>
            <h1 className={template.name}>{resume.personalInfo.fullName}</h1>
            <p className={template.jobTitle}>{resume.targetJobTitle}</p>

            <div className={template.contactInfo}>
              {resume.personalInfo.email && (
                <div className="mb-1 mr-4 flex items-center">
                  <span className="mr-1">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  {resume.personalInfo.email}
                </div>
              )}

              {resume.personalInfo.phone && (
                <div className="mb-1 mr-4 flex items-center">
                  <span className="mr-1">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </span>
                  {resume.personalInfo.phone}
                </div>
              )}

              {resume.personalInfo.location && (
                <div className="mb-1 mr-4 flex items-center">
                  <span className="mr-1">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </span>
                  {resume.personalInfo.location}
                </div>
              )}

              {resume.personalInfo.linkedIn && (
                <div className="mb-1 mr-4 flex items-center">
                  <span className="mr-1">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                    </svg>
                  </span>
                  LinkedIn
                </div>
              )}

              {resume.personalInfo.website && (
                <div className="mb-1 mr-4 flex items-center">
                  <span className="mr-1">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                  </span>
                  {resume.personalInfo.website}
                </div>
              )}
            </div>
          </header>

          {/* Summary section */}
          {resume.professionalSummary?.content && (
            <section className={template.sectionContainer}>
              <h2 className={template.sectionTitle}>Summary</h2>
              <p className="text-sm leading-relaxed">
                {resume.professionalSummary.content}
              </p>
            </section>
          )}

          {/* Work Experience section */}
          {resume.workExperiences.length > 0 && (
            <section className={template.sectionContainer}>
              <h2 className={template.sectionTitle}>
                {templateId === "professional"
                  ? "Professional Experience"
                  : "Work Experience"}
              </h2>

              <div className="space-y-4">
                {resume.workExperiences.map((job) => (
                  <div key={job.id} className="text-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={template.experienceTitle}>
                          {job.position}
                        </h3>
                        <p className={template.experienceCompany}>
                          {job.company}
                          {job.location ? `, ${job.location}` : ""}
                        </p>
                      </div>
                      <p className={template.experienceDate}>
                        {formatDateRange(
                          job.startDate,
                          job.endDate,
                          job.current,
                        )}
                      </p>
                    </div>

                    {job.highlights?.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                        {job.highlights.map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education section */}
          {resume.education.length > 0 && (
            <section className={template.sectionContainer}>
              <h2 className={template.sectionTitle}>Education</h2>

              <div className="space-y-4">
                {resume.education.map((edu) => (
                  <div key={edu.id} className="text-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={template.experienceTitle}>
                          {edu.degree} in {edu.field}
                        </h3>
                        <p className={template.experienceCompany}>
                          {edu.institution}
                          {edu.location ? `, ${edu.location}` : ""}
                        </p>
                        {edu.gpa && (
                          <p className="text-sm text-muted-foreground">
                            GPA: {edu.gpa}
                          </p>
                        )}
                      </div>
                      <p className={template.experienceDate}>
                        {formatDateRange(
                          edu.startDate,
                          edu.endDate,
                          edu.current,
                        )}
                      </p>
                    </div>

                    {edu.highlights?.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                        {edu.highlights.map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills section */}
          {resume.skills.length > 0 && (
            <section className={template.sectionContainer}>
              <h2 className={template.sectionTitle}>Skills</h2>

              <div className="flex flex-wrap">
                {resume.skills.map((skill) => (
                  <span key={skill.id} className={template.skillBadge}>
                    {skill.name}
                    {skill.level && ` • ${skill.level}`}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Projects section */}
          {resume.projects.length > 0 && (
            <section className={template.sectionContainer}>
              <h2 className={template.sectionTitle}>Projects</h2>

              <div className="space-y-4">
                {resume.projects.map((project) => (
                  <div key={project.id} className="text-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={template.experienceTitle}>
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-muted-foreground">{project.description}</p>
                        )}
                      </div>
                      {(project.startDate || project.endDate) && (
                        <p className={template.experienceDate}>
                          {formatDateRange(project.startDate, project.endDate)}
                        </p>
                      )}
                    </div>

                    {project.highlights?.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                        {project.highlights.map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications section */}
          {resume.certifications.length > 0 && (
            <section className={template.sectionContainer}>
              <h2 className={template.sectionTitle}>Certifications</h2>

              <div className="space-y-2">
                {resume.certifications.map((cert) => (
                  <div key={cert.id} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{cert.name}</span>
                      {cert.issuer && (
                        <span className="text-muted-foreground"> • {cert.issuer}</span>
                      )}
                    </div>
                    {cert.date && (
                      <span className="text-muted-foreground">
                        {formatDate(cert.date, "short")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Custom Sections */}
          {resume.customSections.map((section) => (
            <section key={section.id} className={template.sectionContainer}>
              <h2 className={template.sectionTitle}>{section.title}</h2>

              <div className="space-y-4">
                {section.entries.map((entry, index) => (
                  <div key={index} className="text-sm">
                    {(entry.title || entry.subtitle) && (
                      <div className="flex items-start justify-between">
                        <div>
                          {entry.title && (
                            <h3 className={template.experienceTitle}>
                              {entry.title}
                            </h3>
                          )}
                          {entry.subtitle && (
                            <p className={template.experienceCompany}>
                              {entry.subtitle}
                            </p>
                          )}
                        </div>
                        {entry.date && (
                          <p className={template.experienceDate}>
                            {entry.date}
                          </p>
                        )}
                      </div>
                    )}

                    {entry.description && (
                      <p className="mt-1 text-muted-foreground">{entry.description}</p>
                    )}

                    {entry.bullets?.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                        {entry.bullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
