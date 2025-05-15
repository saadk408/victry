// File: /app/resume/[id]/edit/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useResume } from "@/hooks/use-resume";
// import { Resume } from "@/models/resume"; // Removed unused import
import { JobDescription } from "@/types/job-description";
import { ResumeEditor } from "@/app/resume/_components/resume-editor";
import { ResumePreview } from "@/app/resume/_components/resume-preview";
import { TemplatesPanel } from "@/app/resume/_components/templates-panel";
import { ResumeScorePanel } from "@/app/resume/_components/resume-score-panel";
import { JobMatchPanel } from "@/app/resume/_components/job-match-panel";
import { JobDescriptionInput } from "@/app/resume/_components/job-description-input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// Removed unused Download icon import
import { Loader2, Save, ArrowLeft, FileDown } from "lucide-react";

// Define the type for activeTab state
type ActivePanelTab = "templates" | "resumeScore" | "jobMatch";

interface EditResumePageProps {
  params: {
    id: string;
  };
}

export default function EditResumePage({ params }: EditResumePageProps) {
  const { id } = params;
  const router = useRouter();
  const { resume, loading, error, updateResume } = useResume(id);
  const [activeTab, setActiveTab] = useState<ActivePanelTab>("templates"); // Use defined type
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(
    null,
  );
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);
  const [jobMatchScore, setJobMatchScore] = useState<number | null>(null);
  const [resumeScore, setResumeScore] = useState<number | null>(null);

  // Initialize scores when resume data is loaded
  useEffect(() => {
    if (resume) {
      // In a real implementation, these would be calculated based on actual data
      setResumeScore(60); // Example score

      // Only set job match score if we have a job description
      if (jobDescription) {
        setJobMatchScore(78); // Example score
      }
    }
  }, [resume, jobDescription]);

  const handleBack = () => {
    router.push("/resume");
  };

  const handleSave = async () => {
    // Save resume implementation
    if (resume) {
      try {
        await updateResume(resume);
        // Show success notification
      } catch (error) {
        // Show error notification
        console.error("Error saving resume:", error);
      }
    }
  };

  const handleDownloadPDF = () => {
    // PDF download implementation
    console.log("Downloading PDF...");
  };

  const handleJobDescriptionSubmit = (jobDesc: JobDescription) => {
    setIsAnalyzingJob(true);

    // Simulate job analysis - in real implementation, this would call API
    setTimeout(() => {
      setJobDescription(jobDesc);
      setJobMatchScore(78); // Example score after analysis
      setIsAnalyzingJob(false);
      setActiveTab("jobMatch"); // Switch to job match tab after analysis
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold">Error Loading Resume</h1>
        <p className="mb-4 text-red-600">
          {error?.message || "The resume couldn't be loaded."}
        </p>
        <Button onClick={handleBack}>Back to Resumes</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white p-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleBack} className="mr-4">
            <ArrowLeft className="mr-1 h-5 w-5" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">
            {resume.title || "Untitled Resume"}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button onClick={handleDownloadPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </header>

      {/* Main content - three-panel layout */}
      <div className="flex flex-grow overflow-hidden">
        {/* Left panel - Section navigation and editing */}
        <div className="w-[300px] overflow-y-auto border-r">
          <Suspense fallback={<div>Loading editor...</div>}>
            <ResumeEditor id={id} />
          </Suspense>
        </div>

        {/* Center panel - Resume preview */}
        <div className="flex-grow overflow-y-auto bg-gray-50">
          <div className="mx-auto max-w-[800px] p-4">
            <div className="sticky top-0 z-10 mb-2 flex items-center justify-between bg-gray-50 p-2">
              <div className="flex items-center">
                <span className="mr-2 text-sm font-medium">Resume Score:</span>
                <div className="rounded-md bg-yellow-100 px-2 py-1 text-sm font-medium text-yellow-800">
                  {resumeScore || "--"}
                </div>

                {jobMatchScore && (
                  <>
                    <span className="mx-2 text-sm font-medium">
                      Job Match Score:
                    </span>
                    <div className="rounded-md bg-green-100 px-2 py-1 text-sm font-medium text-green-800">
                      {jobMatchScore}
                    </div>
                  </>
                )}
              </div>
            </div>

            <Suspense fallback={<div>Loading preview...</div>}>
              <ResumePreview id={id} />
            </Suspense>
          </div>
        </div>

        {/* Right panel - Templates, Resume Score, Job Match */}
        <div className="w-[350px] overflow-y-auto border-l bg-white">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as ActivePanelTab)}
          >
            <TabsList className="w-full">
              <TabsTrigger value="templates" className="flex-1">
                Templates
              </TabsTrigger>
              <TabsTrigger value="resumeScore" className="flex-1">
                Score {resumeScore && `(${resumeScore})`}
              </TabsTrigger>
              <TabsTrigger
                value="jobMatch"
                className="flex-1"
                disabled={!jobDescription && !isAnalyzingJob}
              >
                Job Match {jobMatchScore && `(${jobMatchScore})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="p-4">
              <TemplatesPanel
                currentTemplateId={resume.templateId}
                onTemplateSelect={(templateId) => {
                  // Update resume template
                  console.log("Selected template:", templateId);
                }}
              />
            </TabsContent>

            <TabsContent value="resumeScore" className="p-4">
              <ResumeScorePanel score={resumeScore || 0} />
            </TabsContent>

            <TabsContent value="jobMatch" className="p-4">
              {jobDescription ? (
                <JobMatchPanel
                  score={jobMatchScore || 0}
                  jobDescription={jobDescription}
                />
              ) : isAnalyzingJob ? (
                <div className="p-4 text-center">
                  <h3 className="mb-4 text-lg font-medium">
                    Creating your job tailored resume...
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Extracting job responsibilities...
                  </p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full w-1/2 rounded-full bg-green-500"></div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    Please stay on this page while we analyze everything for
                    you. Time remaining ~3 seconds.
                  </p>
                </div>
              ) : (
                <JobDescriptionInput onSubmit={handleJobDescriptionSubmit} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
