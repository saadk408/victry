// File: /components/cover-letter/cover-letter-editor.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useEditor, Editor, EditorContent } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
/* // Commenting out again due to persistent module resolution error
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
*/
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
/* // Commenting out again due to persistent module resolution error
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
*/
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Save,
  FileDown,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Heading1,
  Heading2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/utils";
import { Resume, Skill } from "@/types/resume";
import { JobDescription } from "@/types/job-description";
// import TextAlign from '@tiptap/extension-text-align'; // Commented out - likely needs npm install

// Cover letter content model
export interface CoverLetterContent {
  id?: string;
  userId?: string;
  title: string;
  resumeId?: string;
  jobDescriptionId?: string;
  recipient?: string;
  companyName?: string;
  position?: string;
  content: string;
  letterFormat?: "modern" | "traditional" | "creative";
  tone?: "formal" | "conversational" | "enthusiastic";
  hiringManager?: string;
  whyInterested?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Editor props
interface CoverLetterEditorProps {
  initialContent?: CoverLetterContent;
  resumeId?: string;
  jobDescriptionId?: string;
  onSave?: (content: CoverLetterContent) => void;
  readOnly?: boolean;
  showAiGeneration?: boolean;
}

/**
 * Cover Letter Editor Component
 *
 * Provides a rich text editing experience for creating and editing cover letters.
 * Supports AI generation, formatting controls, and multiple templates.
 */
export function CoverLetterEditor({
  initialContent,
  resumeId,
  jobDescriptionId,
  onSave,
  readOnly = false,
  showAiGeneration = true,
}: CoverLetterEditorProps) {
  const supabase = createClient();

  // State for cover letter content
  const [coverLetter, setCoverLetter] = useState<CoverLetterContent>(
    initialContent || {
      title: "My Cover Letter",
      content: getDefaultTemplate("modern"),
      letterFormat: "modern",
      tone: "conversational",
    },
  );

  // State for editing and UI
  const [resume, setResume] = useState<Resume | null>(null);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  // Track if the content has been modified
  const [, _setIsModified] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Editor configuration with rich text capabilities
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      // Commented out - likely needs npm install
      // TextAlign.configure({
      //   types: ["heading", "paragraph"],
      // }),
    ],
    content: coverLetter.content,
    editable: !readOnly,
    onUpdate: ({ editor }: { editor: Editor }) => {
      setCoverLetter((prev) => ({
        ...prev,
        content: editor.getHTML(),
      }));
      _setIsModified(true);
    },
  });

  // Wrap fetch functions in useCallback
  const fetchResume = useCallback(
    async (id: string) => {
      try {
        const { data, error } = await supabase
          .from("resumes")
          .select(
            `
          *,
          personal_info(*),
          professional_summary(*),
          work_experiences(*),
          education(*),
          skills(*)
        `,
          )
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          // Transform database model to application model
          const resumeData: Resume = {
            id: data.id,
            userId: data.user_id,
            title: data.title,
            targetJobTitle: data.target_job_title,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            templateId: data.template_id,
            personalInfo: data.personal_info || {
              fullName: "",
              email: "",
              phone: "",
              location: "",
            },
            professionalSummary: data.professional_summary || {
              content: "",
            },
            workExperiences: data.work_experiences || [],
            education: data.education || [],
            skills: data.skills || [],
            projects: [],
            certifications: [],
            socialLinks: [],
            customSections: [],
          };

          setResume(resumeData);

          // Update cover letter with resume information if it's not already set
          setCoverLetter((prev) => ({
            ...prev,
            resumeId: id,
            companyName: prev.companyName || "",
            position: prev.position || resumeData.targetJobTitle,
          }));
        }
      } catch (err) {
        console.error("Error fetching resume:", err);
        setError("Failed to load resume data");
      }
    },
    [supabase],
  );

  const fetchJobDescription = useCallback(
    async (id: string) => {
      try {
        const { data, error } = await supabase
          .from("job_descriptions")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          // Transform database model to application model
          const jobDescriptionData: JobDescription = {
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

          setJobDescription(jobDescriptionData);

          // Update cover letter with job information if it's not already set
          setCoverLetter((prev) => ({
            ...prev,
            jobDescriptionId: id,
            companyName: prev.companyName || jobDescriptionData.company,
            position: prev.position || jobDescriptionData.title,
          }));
        }
      } catch (err) {
        console.error("Error fetching job description:", err);
        setError("Failed to load job description data");
      }
    },
    [supabase],
  );

  // Fetch related data (resume and job description) on component mount
  useEffect(() => {
    if (resumeId) {
      fetchResume(resumeId);
    }

    if (jobDescriptionId) {
      fetchJobDescription(jobDescriptionId);
    }
  }, [resumeId, jobDescriptionId, fetchResume, fetchJobDescription]);

  // Get default template based on selected format
  function getDefaultTemplate(
    format: "modern" | "traditional" | "creative",
  ): string {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    switch (format) {
      case "modern":
        return `
          <p>${currentDate}</p>
          <p>&nbsp;</p>
          <p>[Hiring Manager's Name]</p>
          <p>[Company Name]</p>
          <p>[Company Address]</p>
          <p>&nbsp;</p>
          <p>Dear [Hiring Manager's Name],</p>
          <p>&nbsp;</p>
          <p>I am writing to express my interest in the [Position] role at [Company Name] as advertised on [Job Board/Website]. With my background in [relevant experience], I am excited about the opportunity to contribute to your team.</p>
          <p>&nbsp;</p>
          <p>Through my experience at [Previous Company], I have developed strong skills in [Skill 1], [Skill 2], and [Skill 3] that align well with this position. [Brief accomplishment that relates to the job].</p>
          <p>&nbsp;</p>
          <p>I am particularly drawn to [Company Name] because of [specific reason you're interested in the company]. Your company's focus on [company value/mission] resonates with my professional values, and I am enthusiastic about the possibility of contributing to your innovative work.</p>
          <p>&nbsp;</p>
          <p>I would welcome the opportunity to discuss how my background and skills would benefit your team. Thank you for considering my application, and I look forward to the possibility of working with you.</p>
          <p>&nbsp;</p>
          <p>Sincerely,</p>
          <p>&nbsp;</p>
          <p>[Your Name]</p>
          <p>[Your Phone]</p>
          <p>[Your Email]</p>
        `;

      case "traditional":
        return `
          <p>${currentDate}</p>
          <p>&nbsp;</p>
          <p>[Hiring Manager's Name]</p>
          <p>[Company Name]</p>
          <p>[Company Address]</p>
          <p>&nbsp;</p>
          <p>Dear [Hiring Manager's Name],</p>
          <p>&nbsp;</p>
          <p>I am writing to apply for the position of [Position] at [Company Name], as advertised on [Job Board/Website]. I believe that my experience and qualifications make me an ideal candidate for this role.</p>
          <p>&nbsp;</p>
          <p>Throughout my professional career at [Previous Company], I have consistently demonstrated [relevant skill/quality] and a strong ability to [relevant responsibility]. My accomplishments include [specific achievement relevant to the position].</p>
          <p>&nbsp;</p>
          <p>My enclosed resume provides further detail about my qualifications and experience. I am particularly interested in joining [Company Name] because of your reputation for [specific aspect of the company that appeals to you].</p>
          <p>&nbsp;</p>
          <p>I would appreciate the opportunity to discuss my application with you further and to provide any additional information you may require. Thank you for your time and consideration.</p>
          <p>&nbsp;</p>
          <p>Yours sincerely,</p>
          <p>&nbsp;</p>
          <p>[Your Name]</p>
          <p>[Your Phone]</p>
          <p>[Your Email]</p>
        `;

      case "creative":
        return `
          <p>${currentDate}</p>
          <p>&nbsp;</p>
          <p>Dear [Hiring Manager's Name],</p>
          <p>&nbsp;</p>
          <p>When I discovered the [Position] opening at [Company Name], I knew it was an opportunity I couldn't pass up. Your company's innovative work in [company field/industry] has inspired me, and I'm excited about the possibility of bringing my unique perspective to your team.</p>
          <p>&nbsp;</p>
          <p>My journey through [relevant industry/field] has equipped me with a diverse skill set that includes [Skill 1], [Skill 2], and [Skill 3]. At [Previous Company], I had the opportunity to [specific project or achievement] which resulted in [positive outcome]. This experience taught me the value of [relevant lesson] and strengthened my ability to [relevant skill].</p>
          <p>&nbsp;</p>
          <p>What excites me most about [Company Name] is [specific aspect of the company's work or culture]. I admire how your team has [specific company achievement], and I'm eager to contribute to your continued success in this area.</p>
          <p>&nbsp;</p>
          <p>I would love the chance to discuss how my background, passion, and fresh ideas could benefit your team. Thank you for considering my application, and I look forward to the possibility of creating something amazing together.</p>
          <p>&nbsp;</p>
          <p>Enthusiastically,</p>
          <p>&nbsp;</p>
          <p>[Your Name]</p>
          <p>[Your Phone]</p>
          <p>[Your Email]</p>
        `;

      default:
        return `<p>Dear Hiring Manager,</p><p>I am writing to express my interest in the position at your company...</p>`;
    }
  }

  // Handle input changes for form fields
  const handleInputChange = (
    field: keyof CoverLetterContent,
    value: string,
  ) => {
    setCoverLetter((prev) => ({ ...prev, [field]: value }));
    _setIsModified(true);
  };

  // Generate cover letter using AI
  const generateCoverLetter = async () => {
    if (!resume) {
      setError("Please select a resume to generate a cover letter");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      // Call the API to generate cover letter
      const response = await fetch("/api/ai/generate-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: resume.id,
          jobDescriptionId: jobDescription?.id,
          settings: {
            tone: coverLetter.tone,
            companyName: coverLetter.companyName,
            hiringManager: coverLetter.hiringManager,
            whyInterested: coverLetter.whyInterested,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate cover letter");
      }

      // Parse the response and update the editor
      const data = await response.json();

      if (editor && data.content) {
        editor.commands.setContent(data.content);
        setCoverLetter((prev) => ({
          ...prev,
          content: data.content,
        }));
        _setIsModified(true);
      }
    } catch (err) {
      console.error("Error generating cover letter:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate cover letter",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Save cover letter
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      // Validate required fields
      if (!coverLetter.title.trim()) {
        setError("Please enter a title for your cover letter");
        setIsSaving(false);
        return;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to save a cover letter");
        setIsSaving(false);
        return;
      }

      const now = new Date().toISOString();

      if (coverLetter.id) {
        // Update existing cover letter
        const { error: updateError } = await supabase
          .from("cover_letters")
          .update({
            title: coverLetter.title,
            resume_id: coverLetter.resumeId,
            job_description_id: coverLetter.jobDescriptionId,
            recipient: coverLetter.recipient,
            company_name: coverLetter.companyName,
            position: coverLetter.position,
            content: coverLetter.content,
            letter_format: coverLetter.letterFormat,
            tone: coverLetter.tone,
            hiring_manager: coverLetter.hiringManager,
            why_interested: coverLetter.whyInterested,
            updated_at: now,
          })
          .eq("id", coverLetter.id);

        if (updateError) throw updateError;

        setSuccess("Cover letter updated successfully");
      } else {
        // Create new cover letter
        const { data: newCoverLetter, error: createError } = await supabase
          .from("cover_letters")
          .insert({
            user_id: user.id,
            title: coverLetter.title,
            resume_id: coverLetter.resumeId,
            job_description_id: coverLetter.jobDescriptionId,
            recipient: coverLetter.recipient,
            company_name: coverLetter.companyName,
            position: coverLetter.position,
            content: coverLetter.content,
            letter_format: coverLetter.letterFormat,
            tone: coverLetter.tone,
            hiring_manager: coverLetter.hiringManager,
            why_interested: coverLetter.whyInterested,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Update local state with the new ID
        setCoverLetter((prev) => ({
          ...prev,
          id: newCoverLetter.id,
          userId: user.id,
          createdAt: now,
          updatedAt: now,
        }));

        setSuccess("Cover letter saved successfully");
      }

      // Call onSave callback if provided
      if (onSave) {
        onSave({
          ...coverLetter,
          updatedAt: now,
        });
      }

      _setIsModified(false);

      // Hide success message after a delay
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error saving cover letter:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save cover letter",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Export as PDF
  const handleExportPdf = async () => {
    try {
      // Call the PDF export API
      const response = await fetch("/api/export/cover-letter-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coverLetter,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to export PDF");
      }

      // Convert the response to a blob
      const blob = await response.blob();

      // Create a download link and trigger a download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${coverLetter.title || "Cover Letter"}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      setError(err instanceof Error ? err.message : "Failed to export PDF");
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      if (!previewRef.current) return;

      // Get text content from HTML
      const content = previewRef.current.innerText;

      // Copy to clipboard
      await navigator.clipboard.writeText(content);

      setIsCopied(true);

      // Reset copied state after delay
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Error copying to clipboard:", err);
      setError("Failed to copy to clipboard");
    }
  };

  // Editor toolbar button component
  const EditorButton = ({
    icon,
    action,
    isActive = false,
    tooltip,
  }: {
    icon: React.ReactNode;
    action: () => void;
    isActive?: boolean;
    tooltip: string;
  }) => (
    /* // Commenting out again
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
    */
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("h-8 w-8 p-0", isActive && "bg-gray-100 text-gray-900")}
      onClick={action}
      disabled={!editor || readOnly}
    >
      {icon}
      <span className="sr-only">{tooltip}</span>
    </Button>
    /* // Commenting out again
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    */
  );

  return (
    <div className="space-y-4">
      {/* Header with title input */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-md">
          <Label htmlFor="cover-letter-title" className="mb-1 block">
            Cover Letter Title
          </Label>
          <Input
            id="cover-letter-title"
            value={coverLetter.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="My Cover Letter"
            disabled={readOnly}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          {!readOnly && (
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
              className="flex w-full items-center gap-2 sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleExportPdf}
            className="flex w-full items-center gap-2 sm:w-auto"
          >
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="flex items-center border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
          <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center border-l-4 border-green-500 bg-green-50 p-4 text-green-700">
          <Check className="mr-2 h-5 w-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left sidebar - Settings */}
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Cover Letter Settings</CardTitle>
              <CardDescription>
                Customize your letter format and content
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Format selection - Commenting out again */}
              {/* 
              <div className="space-y-2">
                <Label htmlFor="letter-format">Layout Style</Label>
                <Select
                  value={coverLetter.letterFormat || "modern"}
                  onValueChange={(
                    value: "modern" | "traditional" | "creative",
                  ) => handleFormatChange(value)}
                  disabled={readOnly}
                >
                  <SelectTrigger id="letter-format" className="w-full">
                    <SelectValue placeholder="Select a layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern Layout</SelectItem>
                    <SelectItem value="traditional">
                      Traditional Layout
                    </SelectItem>
                    <SelectItem value="creative">Creative Layout</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Changes will replace current content
                </p>
              </div>
              */}

              {/* Tone selection - Commenting out again */}
              {/* 
              <div className="space-y-2">
                <Label htmlFor="tone">Writing Tone</Label>
                <Select
                  value={coverLetter.tone || "conversational"}
                  onValueChange={(
                    value: "formal" | "conversational" | "enthusiastic",
                  ) => handleInputChange("tone", value)}
                  disabled={readOnly}
                >
                  <SelectTrigger id="tone" className="w-full">
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">
                      Formal & Professional
                    </SelectItem>
                    <SelectItem value="conversational">
                      Conversational & Balanced
                    </SelectItem>
                    <SelectItem value="enthusiastic">
                      Enthusiastic & Passionate
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Used for AI generation</p>
              </div>
              */}

              {/* Company and position */}
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={coverLetter.companyName || ""}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  placeholder="e.g., Acme Inc."
                  disabled={readOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={coverLetter.position || ""}
                  onChange={(e) =>
                    handleInputChange("position", e.target.value)
                  }
                  placeholder="e.g., Senior Software Engineer"
                  disabled={readOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hiring-manager">Hiring Manager</Label>
                <Input
                  id="hiring-manager"
                  value={coverLetter.hiringManager || ""}
                  onChange={(e) =>
                    handleInputChange("hiringManager", e.target.value)
                  }
                  placeholder="e.g., John Smith"
                  disabled={readOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="why-interested">
                  Why You&apos;re Interested
                </Label>
                <textarea
                  id="why-interested"
                  value={coverLetter.whyInterested || ""}
                  onChange={(e) =>
                    handleInputChange("whyInterested", e.target.value)
                  }
                  placeholder="Briefly explain what interests you about this role or company..."
                  className="min-h-24 w-full rounded-md border border-gray-300 p-2 text-sm"
                  disabled={readOnly}
                />
                <p className="text-xs text-gray-500">
                  Used to personalize AI-generated content
                </p>
              </div>

              {/* AI Generation Button */}
              {showAiGeneration && !readOnly && (
                <div className="mt-6">
                  <Button
                    onClick={generateCoverLetter}
                    disabled={isGenerating || !resume}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>

                  {!resume && (
                    <p className="mt-1 text-xs text-amber-600">
                      Please select a resume first
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {resume && (
            <Card>
              <CardHeader>
                <CardTitle>Resume Information</CardTitle>
                <CardDescription>Details from {resume.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Name:</span>{" "}
                  {resume.personalInfo.fullName}
                </div>
                <div>
                  <span className="font-medium">Target position:</span>{" "}
                  {resume.targetJobTitle}
                </div>
                <div>
                  <span className="font-medium">Top skills:</span>{" "}
                  {resume.skills
                    .slice(0, 3)
                    .map((skill: Skill) => skill.name)
                    .join(", ")}
                </div>
                <div>
                  <span className="font-medium">Latest experience:</span>{" "}
                  {resume.workExperiences.length > 0
                    ? `${resume.workExperiences[0].position} at ${resume.workExperiences[0].company}`
                    : "No work experience found"}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main content area */}
        <div className="lg:col-span-2">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "edit" | "preview")}
          >
            <div className="mb-2 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              {activeTab === "preview" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-2"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Text
                    </>
                  )}
                </Button>
              )}
            </div>

            <TabsContent value="edit" className="mt-0">
              <Card>
                <CardHeader className="border-b p-2">
                  {/* Editor Toolbar */}
                  <div className="flex flex-wrap gap-1">
                    <EditorButton
                      icon={<Bold className="h-4 w-4" />}
                      action={() => editor?.chain().focus().toggleBold().run()}
                      isActive={editor?.isActive("bold") || false}
                      tooltip="Bold"
                    />
                    <EditorButton
                      icon={<Italic className="h-4 w-4" />}
                      action={() =>
                        editor?.chain().focus().toggleItalic().run()
                      }
                      isActive={editor?.isActive("italic") || false}
                      tooltip="Italic"
                    />
                    <EditorButton
                      icon={<UnderlineIcon className="h-4 w-4" />}
                      action={() =>
                        editor?.chain().focus().toggleUnderline().run()
                      }
                      isActive={editor?.isActive("underline") || false}
                      tooltip="Underline"
                    />
                    <div className="mx-1 h-6 w-px bg-gray-200" />
                    <EditorButton
                      icon={<Heading1 className="h-4 w-4" />}
                      action={() =>
                        editor
                          ?.chain()
                          .focus()
                          .toggleHeading({ level: 1 })
                          .run()
                      }
                      isActive={
                        editor?.isActive("heading", { level: 1 }) || false
                      }
                      tooltip="Heading 1"
                    />
                    <EditorButton
                      icon={<Heading2 className="h-4 w-4" />}
                      action={() =>
                        editor
                          ?.chain()
                          .focus()
                          .toggleHeading({ level: 2 })
                          .run()
                      }
                      isActive={
                        editor?.isActive("heading", { level: 2 }) || false
                      }
                      tooltip="Heading 2"
                    />
                    <div className="mx-1 h-6 w-px bg-gray-200" />
                    <EditorButton
                      icon={<List className="h-4 w-4" />}
                      action={() =>
                        editor?.chain().focus().toggleBulletList().run()
                      }
                      isActive={editor?.isActive("bulletList") || false}
                      tooltip="Bullet List"
                    />
                    <EditorButton
                      icon={<ListOrdered className="h-4 w-4" />}
                      action={() =>
                        editor?.chain().focus().toggleOrderedList().run()
                      }
                      isActive={editor?.isActive("orderedList") || false}
                      tooltip="Numbered List"
                    />
                    <div className="mx-1 h-6 w-px bg-gray-200" />
                    <EditorButton
                      icon={<AlignLeft className="h-4 w-4" />}
                      action={() =>
                        // editor?.chain().focus().setTextAlign("left").run() // Commented out due to missing extension
                        {}
                      }
                      isActive={
                        // editor?.isActive({ textAlign: "left" }) || false // Commented out
                        false
                      }
                      tooltip="Align Left"
                    />
                    <EditorButton
                      icon={<AlignCenter className="h-4 w-4" />}
                      action={() =>
                        // editor?.chain().focus().setTextAlign("center").run() // Commented out
                        {}
                      }
                      isActive={
                        // editor?.isActive({ textAlign: "center" }) || false // Commented out
                        false
                      }
                      tooltip="Align Center"
                    />
                    <EditorButton
                      icon={<AlignRight className="h-4 w-4" />}
                      action={() =>
                        // editor?.chain().focus().setTextAlign("right").run() // Commented out
                        {}
                      }
                      isActive={
                        // editor?.isActive({ textAlign: "right" }) || false // Commented out
                        false
                      }
                      tooltip="Align Right"
                    />
                    <div className="mx-1 h-6 w-px bg-gray-200" />
                    <EditorButton
                      icon={<LinkIcon className="h-4 w-4" />}
                      action={() => {
                        const previousUrl = editor?.getAttributes("link").href;
                        const url = window.prompt("URL", previousUrl);

                        // cancelled
                        if (url === null) {
                          return;
                        }

                        // empty
                        if (url === "") {
                          editor
                            ?.chain()
                            .focus()
                            .extendMarkRange("link")
                            .unsetLink()
                            .run();
                          return;
                        }

                        // set link
                        editor
                          ?.chain()
                          .focus()
                          .extendMarkRange("link")
                          .setLink({ href: url })
                          .run();
                      }}
                      isActive={editor?.isActive("link") || false}
                      tooltip="Insert Link"
                    />
                    <EditorButton
                      icon={<RefreshCw className="h-4 w-4" />}
                      action={() => {
                        if (
                          confirm(
                            "Reset the editor content? This cannot be undone.",
                          )
                        ) {
                          editor?.commands.clearContent();
                        }
                      }}
                      tooltip="Clear Content"
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Rich Text Editor */}
                  <div
                    className={cn(
                      "min-h-[500px] border-0 bg-white p-5",
                      readOnly ? "opacity-70" : "prose-sm",
                    )}
                  >
                    {editor && <EditorContent editor={editor} />}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <Card>
                <CardContent className="p-5">
                  {/* Preview rendered content */}
                  <div
                    ref={previewRef}
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: coverLetter.content }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
