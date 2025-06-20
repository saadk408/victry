// File: /app/resume/[id]/tailor/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useResume } from "@/hooks/use-resume";
import { TailoringControls } from "@/components/ai/tailoring-controls";
import { JobDescriptionInput } from "@/app/resume/_components/job-description-input";
import { JobMatchPanel } from "@/app/resume/_components/job-match-panel";
import { Button } from "@/components/ui/button";
import { ATSScore } from "@/components/resume/ats-score";
import { KeywordAnalysis } from "@/components/resume/keyword-analysis";
import { JobDescription } from "@/models/job-description";
import {
  Resume,
  ATSScoreResult,
  KeywordMatch,
  TailoringSettings,
} from "@/types/resume";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Save, Download, RefreshCw } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define type alias for the analysis tabs
type ActiveAnalysisTab = "preview" | "ats" | "keywords";

interface TailorResumePageProps {
  params: {
    id: string;
  };
}

export default function TailorResumePage({ params }: TailorResumePageProps) {
  const { id } = params;
  const router = useRouter();
  const { resume, loading, error, duplicateResume } = useResume(id);

  // States for the tailoring process
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(
    null,
  );
  const [tailoringSettings, setTailoringSettings] = useState<TailoringSettings>(
    {
      intensity: 50,
      preserveVoice: true,
      focusKeywords: true,
    },
  );
  const [tailoredResume, setTailoredResume] = useState<Resume | null>(null);
  const [atsScore, setAtsScore] = useState<ATSScoreResult | null>(null);
  const [keywordMatches, setKeywordMatches] = useState<KeywordMatch[]>([]);
  const [tailoringState, setTailoringState] = useState<
    "idle" | "processing" | "completed" | "error"
  >("idle");
  const [tailoringError, setTailoringError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveAnalysisTab>("preview");

  // Reset the form if the resume ID changes
  useEffect(() => {
    setJobDescription(null);
    setTailoredResume(null);
    setAtsScore(null);
    setKeywordMatches([]);
    setTailoringState("idle");
    setTailoringError(null);
  }, [id]);

  // Handle job description submission
  const handleJobDescriptionSubmit = (jobDescription: JobDescription) => {
    setJobDescription(jobDescription);
  };

  // Handle tailoring settings change
  const handleTailoringSettingsChange = (settings: TailoringSettings) => {
    setTailoringSettings(settings);
  };

  // Start the tailoring process
  const handleStartTailoring = async () => {
    if (!resume || !jobDescription) return;

    try {
      setTailoringState("processing");
      setTailoringError(null);

      // Call the API to tailor the resume
      const response = await fetch("/api/ai/tailor-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: id,
          jobDescriptionId: jobDescription.id,
          settings: tailoringSettings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to tailor resume");
      }

      const data = await response.json();

      // Update state with the results
      setTailoredResume(data.tailoredResume);
      setAtsScore(data.atsScore);
      setKeywordMatches(data.keywordMatches);
      setTailoringState("completed");
      setActiveTab("preview");
    } catch (error) {
      console.error("Error tailoring resume:", error);
      setTailoringState("error");
      setTailoringError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    }
  };

  // Save the tailored resume as a new resume
  const handleSaveTailoredResume = async () => {
    if (!tailoredResume) return;

    try {
      // Create a duplicate of the tailored resume
      const newResume = await duplicateResume(
        `${resume?.title || "Resume"} - Tailored for ${jobDescription?.title || "Job"}`,
      );

      if (newResume) {
        // Navigate to the new resume
        router.push(`/resume/${newResume.id}`);
      }
    } catch (error) {
      console.error("Error saving tailored resume:", error);
      // Show error notification
    }
  };

  // Download the tailored resume as PDF
  const handleDownloadPDF = async () => {
    if (!tailoredResume) return;

    try {
      const response = await fetch(`/api/export/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: tailoredResume,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tailoredResume.title || "Resume"}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      // Show error notification
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-bold">Error</h1>
        <p className="mb-4 text-destructive">
          {error?.message || "We couldn't load your resume. Please try again."}
        </p>
        <Link href="/resume" className="text-blue-600 hover:underline">
          Back to Resumes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header with navigation */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.push(`/resume/${id}`)}
            className="mr-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resume
          </Button>
          <h1 className="text-2xl font-bold">Tailor Your Resume</h1>
        </div>

        {tailoringState === "completed" && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={handleSaveTailoredResume}>
              <Save className="mr-2 h-4 w-4" />
              Save as New Resume
            </Button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - Job Description & Controls */}
        <div className="lg:col-span-1">
          {tailoringState !== "completed" ? (
            <div className="rounded-lg bg-surface p-6 shadow">
              {!jobDescription ? (
                <JobDescriptionInput onSubmit={handleJobDescriptionSubmit} />
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="mb-2 text-xl font-semibold">Job Details</h2>
                    <div className="rounded-md bg-muted/50 p-4">
                      <h3 className="font-medium">{jobDescription.title}</h3>
                      <p className="text-muted-foreground">{jobDescription.company}</p>
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setJobDescription(null)}
                          className="mr-2"
                        >
                          Change Job
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="mb-4 text-xl font-semibold">
                      Tailoring Options
                    </h2>
                    <TailoringControls
                      onSettingsChange={handleTailoringSettingsChange}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleStartTailoring}
                    disabled={tailoringState === "processing"}
                  >
                    {tailoringState === "processing" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Tailoring Resume...
                      </>
                    ) : (
                      "Tailor My Resume"
                    )}
                  </Button>

                  {tailoringState === "error" && (
                    <div className="mt-4 rounded-md bg-destructive/10 p-4 text-destructive">
                      <p className="font-medium">Error tailoring resume</p>
                      <p className="text-sm">{tailoringError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setTailoringState("idle")}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-surface p-6 shadow">
              <div className="space-y-6">
                <div>
                  <h2 className="mb-2 text-xl font-semibold">
                    Job Match Summary
                  </h2>
                  <JobMatchPanel
                    score={atsScore?.score || 0}
                    jobDescription={jobDescription!}
                  />
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTailoringState("idle");
                      setTailoredResume(null);
                    }}
                  >
                    Start Over
                  </Button>

                  <Button onClick={handleSaveTailoredResume}>
                    <Save className="mr-2 h-4 w-4" />
                    Save as New Resume
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column - Resume Preview or Analysis */}
        <div className="lg:col-span-2">
          {tailoringState === "completed" ? (
            <div className="rounded-lg bg-surface shadow">
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as ActiveAnalysisTab)
                }
              >
                <TabsList className="w-full rounded-none border-b p-0">
                  <TabsTrigger value="preview" className="flex-1 rounded-none">
                    Resume Preview
                  </TabsTrigger>
                  <TabsTrigger value="ats" className="flex-1 rounded-none">
                    ATS Score ({atsScore?.score || 0})
                  </TabsTrigger>
                  <TabsTrigger value="keywords" className="flex-1 rounded-none">
                    Keyword Matches
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="m-0 p-0">
                  <div className="p-6">
                    <h3 className="mb-4 text-xl font-bold">
                      {tailoredResume?.title}
                    </h3>
                    <h4 className="mb-6 text-lg text-muted-foreground">
                      {tailoredResume?.targetJobTitle}
                    </h4>

                    <div className="mb-6 border-t pt-4">
                      <h5 className="mb-2 font-semibold">
                        Professional Summary
                      </h5>
                      <p className="text-foreground">
                        {tailoredResume?.professionalSummary.content}
                      </p>
                    </div>

                    <div className="mb-6 border-t pt-4">
                      <h5 className="mb-2 font-semibold">Work Experience</h5>
                      {tailoredResume?.workExperiences.map((exp) => (
                        <div key={exp.id} className="mb-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{exp.position}</p>
                              <p className="text-muted-foreground">{exp.company}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {exp.startDate} -{" "}
                              {exp.current ? "Present" : exp.endDate}
                            </p>
                          </div>
                          <ul className="mt-2 list-disc pl-5">
                            {exp.highlights.map(
                              (highlight: string, index: number) => (
                                <li
                                  key={index}
                                  className="mt-1 text-sm text-foreground"
                                >
                                  {highlight}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="mb-6 border-t pt-4">
                      <h5 className="mb-2 font-semibold">Skills</h5>
                      <div className="flex flex-wrap gap-2">
                        {tailoredResume?.skills.map((skill) => (
                          <span
                            key={skill.id}
                            className="rounded-full bg-info/10 px-3 py-1 text-sm text-blue-700"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 text-center">
                      <p className="italic text-muted-foreground">
                        Download the PDF or save this resume to see the complete
                        version
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ats" className="m-0 p-6">
                  {atsScore && (
                    <ATSScore
                      score={atsScore.score}
                      feedback={atsScore.feedback}
                    />
                  )}
                </TabsContent>

                <TabsContent value="keywords" className="m-0 p-6">
                  <KeywordAnalysis
                    matches={keywordMatches}
                    jobTitle={jobDescription?.title || ""}
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-surface p-6 text-center shadow">
              {tailoringState === "processing" ? (
                <div>
                  <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
                  <h3 className="mb-2 text-xl font-medium">
                    Tailoring your resume...
                  </h3>
                  <p className="text-muted-foreground">
                    Our AI is optimizing your resume for this job description.
                    This might take a minute.
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="mb-2 text-xl font-medium">Resume Preview</h3>
                  <p className="mb-4 text-gray-500">
                    Enter a job description and customize your tailoring options
                    to see your AI-tailored resume.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The AI will highlight key skills, optimize your content, and
                    ensure ATS compatibility.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
