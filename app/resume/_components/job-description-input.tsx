// File: /app/resume/_components/job-description-input.tsx
"use client";

import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation"; // Removed unused import
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { JobDescription } from "@/models/job-description";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface JobDescriptionInputProps {
  onSubmit: (jobDescription: JobDescription) => void;
}

export function JobDescriptionInput({ onSubmit }: JobDescriptionInputProps) {
  // const router = useRouter(); // Removed unused variable
  const supabase = createClient();

  // State for the job description form
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobContent, setJobContent] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for saved jobs section
  const [savedJobs, setSavedJobs] = useState<JobDescription[]>([]);
  const [isSavedJobsLoading, setIsSavedJobsLoading] = useState(false);
  const [showSavedJobs, setShowSavedJobs] = useState(false);
  const [hasSavedJobs, setHasSavedJobs] = useState(false);

  // Load saved jobs on component mount
  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        setIsSavedJobsLoading(true);

        const { data, error } = await supabase
          .from("job_descriptions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;

        if (data && data.length > 0) {
          // Transform the data to match our JobDescription model
          const transformedJobs: JobDescription[] = data.map((job) => ({
            id: job.id,
            userId: job.user_id,
            title: job.title,
            company: job.company,
            location: job.location || "",
            content: job.content,
            url: job.url || "",
            applicationDeadline: job.application_deadline || "",
            createdAt: job.created_at,
            updatedAt: job.updated_at,
          }));

          setSavedJobs(transformedJobs);
          setHasSavedJobs(true);
        } else {
          setHasSavedJobs(false);
        }
      } catch (err) {
        console.error("Error fetching saved jobs:", err);
        setHasSavedJobs(false);
      } finally {
        setIsSavedJobsLoading(false);
      }
    };

    fetchSavedJobs();
  }, [supabase]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobTitle.trim() || !company.trim() || !jobContent.trim()) {
      setError(
        "Please fill in the required fields: Job Title, Company, and Job Description",
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Save the job description to the database
      const { data, error } = await supabase
        .from("job_descriptions")
        .insert({
          title: jobTitle,
          company,
          location,
          content: jobContent,
          url: jobUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Transform the saved job to match our JobDescription model
      const newJobDescription: JobDescription = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        company: data.company,
        location: data.location || "",
        content: data.content,
        url: data.url || "",
        applicationDeadline: data.application_deadline || "",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      // Call the onSubmit callback with the new job description
      onSubmit(newJobDescription);
    } catch (err) {
      console.error("Error saving job description:", err);
      setError("Failed to save the job description. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting a saved job
  const handleSelectSavedJob = (job: JobDescription) => {
    onSubmit(job);
    setShowSavedJobs(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Tailor Your Resume to a Job</h2>
        <p className="mt-1 text-gray-600">
          Enter a job description or select one of your saved jobs to tailor
          your resume.
        </p>
      </div>

      {/* Saved Jobs Section */}
      {hasSavedJobs && (
        <div className="rounded-md border">
          <button
            type="button"
            className="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50"
            onClick={() => setShowSavedJobs(!showSavedJobs)}
          >
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              <span className="font-medium">Select from your saved jobs</span>
            </div>
            {showSavedJobs ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {showSavedJobs && (
            <div className="border-t p-2">
              {isSavedJobsLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto p-2">
                  {savedJobs.map((job) => (
                    <button
                      key={job.id}
                      className="w-full rounded-md p-3 text-left transition-colors hover:bg-blue-50"
                      onClick={() => handleSelectSavedJob(job)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.company}</p>
                        </div>
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                              e.stopPropagation()
                            }
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* OR Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">OR</span>
        </div>
      </div>

      {/* New Job Description Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="job-title"
              className="mb-1 block text-sm font-medium"
            >
              Job Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="job-title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Software Engineer"
              required
            />
          </div>

          <div>
            <label htmlFor="company" className="mb-1 block text-sm font-medium">
              Company <span className="text-red-500">*</span>
            </label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Acme Inc."
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="location"
              className="mb-1 block text-sm font-medium"
            >
              Location
            </label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., New York, NY"
            />
          </div>

          <div>
            <label htmlFor="job-url" className="mb-1 block text-sm font-medium">
              Job Posting URL
            </label>
            <Input
              id="job-url"
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="job-content"
            className="mb-1 block text-sm font-medium"
          >
            Job Description <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="job-content"
            value={jobContent}
            onChange={(e) => setJobContent(e.target.value)}
            placeholder="Paste the complete job description here..."
            className="min-h-[200px] resize-y"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            For best results, include the full job description with all
            responsibilities and requirements.
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Use This Job Description"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
