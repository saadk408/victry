// File: /components/resume/import-controls.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { isValidResumeFile, formatFileSize } from "@/lib/utils";
import { Resume, WorkExperience, Education, Skill } from "@/models/resume";
import { cn } from "@/lib/utils";
import { getStatusBadgeClasses, getStatusColors } from '@/lib/utils/status-colors';
import {
  Upload,
  File,
  FileText,
  AlertCircle,
  X,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ClipboardCheck,
} from "lucide-react";

/**
 * Props for ImportControls component
 */
interface ImportControlsProps {
  /** Callback called when a resume is successfully imported */
  onImportSuccess: (resumeId: string) => void;
  /** Whether to use a compact layout */
  compact?: boolean;
  /** Optional className for styling */
  className?: string;
  /** Called when import operation starts */
  onImportStart?: () => void;
  /** Called when import operation fails */
  onImportError?: (error: Error) => void;
}

/**
 * Import source types
 */
type ImportSource = "file" | "paste";

/**
 * Status of the import operation
 */
type ImportStatus =
  | "idle"
  | "uploading"
  | "parsing"
  | "preview"
  | "importing"
  | "success"
  | "error";

/**
 * Component for importing resumes from various file formats
 * Provides options for uploading files or pasting resume content
 */
export function ImportControls({
  onImportSuccess,
  compact = false,
  className,
  onImportStart,
  onImportError,
}: ImportControlsProps) {
  // Dialog open state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Active import source tab
  const [activeSource, setActiveSource] = useState<ImportSource>("file");

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedContent, setPastedContent] = useState("");
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Preview state
  const [parsedResume, setParsedResume] = useState<Partial<Resume> | null>(
    null,
  );

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast notifications
  const { toast } = useToast();

  /**
   * Handle dialog open state
   */
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // If import is in progress, confirm before closing
      if (["uploading", "parsing", "importing"].includes(importStatus)) {
        if (
          !window.confirm(
            "Import is in progress. Are you sure you want to cancel?",
          )
        ) {
          return;
        }
      }

      // Reset state on close
      resetState();
    }

    setIsDialogOpen(open);
  };

  /**
   * Reset component state
   */
  const resetState = () => {
    setSelectedFile(null);
    setPastedContent("");
    setImportStatus("idle");
    setUploadProgress(0);
    setError(null);
    setParsedResume(null);
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isValidResumeFile(file.name)) {
      setError(
        "Invalid file type. Please upload a PDF, Word document, or text file.",
      );
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    setSelectedFile(file);
  };

  /**
   * Handle pasted content
   */
  const handlePastedContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setPastedContent(e.target.value);
    setError(null);
  };

  /**
   * Handle file drop
   */
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setError(null);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isValidResumeFile(file.name)) {
      setError(
        "Invalid file type. Please upload a PDF, Word document, or text file.",
      );
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    setSelectedFile(file);
  };

  /**
   * Handle drag over event
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * Process selected file
   */
  const handleProcessFile = async () => {
    if (!selectedFile) {
      setError("Please select a file to import.");
      return;
    }

    // Notify parent that import has started
    if (onImportStart) {
      onImportStart();
    }

    setImportStatus("uploading");
    setError(null);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Simulate upload progress
      const uploadProgressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(uploadProgressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);

      // Upload file to import API
      const response = await fetch("/api/import/resume", {
        method: "POST",
        body: formData,
      });

      clearInterval(uploadProgressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Import failed with status ${response.status}`,
        );
      }

      // Get parsed resume data
      const data = await response.json();

      setImportStatus("preview");
      setParsedResume(data.resume);
    } catch (err) {
      console.error("Error importing resume:", err);

      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";

      setError(errorMessage);
      setImportStatus("error");

      // Show error toast
      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Notify parent about import error
      if (onImportError) {
        onImportError(err instanceof Error ? err : new Error(errorMessage));
      }
    }
  };

  /**
   * Process pasted content
   */
  const handleProcessPastedContent = async () => {
    if (!pastedContent.trim()) {
      setError("Please paste resume content to import.");
      return;
    }

    // Notify parent that import has started
    if (onImportStart) {
      onImportStart();
    }

    setImportStatus("parsing");
    setError(null);

    try {
      // Send pasted content to import API
      const response = await fetch("/api/import/resume/paste", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: pastedContent }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Import failed with status ${response.status}`,
        );
      }

      // Get parsed resume data
      const data = await response.json();

      setImportStatus("preview");
      setParsedResume(data.resume);
    } catch (err) {
      console.error("Error importing resume from pasted content:", err);

      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";

      setError(errorMessage);
      setImportStatus("error");

      // Show error toast
      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Notify parent about import error
      if (onImportError) {
        onImportError(err instanceof Error ? err : new Error(errorMessage));
      }
    }
  };

  /**
   * Handle resuming from error state
   */
  const handleRetry = () => {
    setImportStatus("idle");
    setError(null);
  };

  /**
   * Handle confirming the parsed resume import
   */
  const handleConfirmImport = async () => {
    if (!parsedResume) {
      setError("No resume data to import.");
      return;
    }

    setImportStatus("importing");
    setError(null);

    try {
      // Create resume from parsed data
      const response = await fetch("/api/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedResume),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to create resume with status ${response.status}`,
        );
      }

      // Get created resume data
      const data = await response.json();

      setImportStatus("success");

      // Show success toast
      toast({
        title: "Resume imported successfully",
        description: "Your resume has been imported and is ready to edit.",
        variant: "default",
      });

      // Notify parent about successful import
      onImportSuccess(data.id);

      // Close dialog after a short delay
      setTimeout(() => {
        setIsDialogOpen(false);
        resetState();
      }, 2000);
    } catch (err) {
      console.error("Error creating resume:", err);

      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";

      setError(errorMessage);
      setImportStatus("error");

      // Show error toast
      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Notify parent about import error
      if (onImportError) {
        onImportError(err instanceof Error ? err : new Error(errorMessage));
      }
    }
  };

  /**
   * Render file upload UI
   */
  const renderFileUpload = () => {
    return (
      <div className="space-y-4">
        <div
          className={cn(
            "rounded-lg border-2 border-dashed p-6 transition-colors",
            selectedFile
              ? "border-info bg-info/10"
              : "border-border hover:border-border/80",
            error ? "border-destructive bg-destructive/10" : "",
          )}
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="mb-2 rounded-full bg-info/10 p-3">
                  <FileText className="h-6 w-6 text-info" />
                </div>
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-full bg-muted p-3">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Drag & drop your resume file or
                  </p>
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse files
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.rtf,.txt"
                      onChange={handleFileSelect}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Supported formats: PDF, Word (.docx, .doc), Rich Text (.rtf),
                  and Plain Text (.txt)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className={cn(
            "flex items-start space-x-2 rounded-md p-3 text-sm",
            getStatusBadgeClasses('error', 'default', 'soft')
          )}>
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedFile || importStatus === "uploading"}
            onClick={handleProcessFile}
          >
            {importStatus === "uploading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              "Import Resume"
            )}
          </Button>
        </div>

        {/* Upload progress */}
        {importStatus === "uploading" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}
      </div>
    );
  };

  /**
   * Render paste content UI
   */
  const renderPasteContent = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="pasted-content">Paste your resume content</Label>
          <div className="mt-1">
            <textarea
              id="pasted-content"
              value={pastedContent}
              onChange={handlePastedContentChange}
              className="h-64 w-full rounded-md border p-3"
              placeholder="Paste your resume text here..."
            />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Copy and paste the content of your resume from another document.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className={cn(
            "flex items-start space-x-2 rounded-md p-3 text-sm",
            getStatusBadgeClasses('error', 'default', 'soft')
          )}>
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!pastedContent.trim() || importStatus === "parsing"}
            onClick={handleProcessPastedContent}
          >
            {importStatus === "parsing" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing...
              </>
            ) : (
              "Parse Content"
            )}
          </Button>
        </div>
      </div>
    );
  };

  /**
   * Render resume preview UI
   */
  const renderResumePreview = () => {
    if (!parsedResume) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-center text-lg font-medium">Resume Preview</h3>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          Review the imported information before confirming.
        </p>

        <div className="max-h-96 space-y-4 overflow-y-auto rounded-md border p-4">
          {/* Personal Info */}
          <div>
            <h4 className="mb-2 border-b pb-1 font-medium">
              Personal Information
            </h4>
            <p className="text-lg font-bold">
              {parsedResume.personalInfo?.fullName || "Unnamed"}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {parsedResume.personalInfo?.email && (
                <span>{parsedResume.personalInfo.email}</span>
              )}
              {parsedResume.personalInfo?.phone && (
                <span>{parsedResume.personalInfo.phone}</span>
              )}
              {parsedResume.personalInfo?.location && (
                <span>{parsedResume.personalInfo.location}</span>
              )}
            </div>
          </div>

          {/* Summary */}
          {parsedResume.professionalSummary?.content && (
            <div>
              <h4 className="mb-2 border-b pb-1 font-medium">
                Professional Summary
              </h4>
              <p className="text-sm text-foreground">
                {parsedResume.professionalSummary.content}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {parsedResume.workExperiences &&
            parsedResume.workExperiences.length > 0 && (
              <div>
                <h4 className="mb-2 border-b pb-1 font-medium">
                  Work Experience
                </h4>
                <div className="space-y-3">
                  {parsedResume.workExperiences.map(
                    (exp: WorkExperience, index: number) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium">{exp.position}</p>
                        <p className="text-muted-foreground">{exp.company}</p>
                        <ul className="mt-1 list-inside list-disc text-foreground">
                          {exp.highlights
                            ?.slice(0, 2)
                            .map((highlight: string, i: number) => (
                              <li key={i}>{highlight}</li>
                            ))}
                          {(exp.highlights?.length || 0) > 2 && (
                            <li>
                              +{(exp.highlights?.length || 0) - 2} more bullet
                              points
                            </li>
                          )}
                        </ul>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Education */}
          {parsedResume.education && parsedResume.education.length > 0 && (
            <div>
              <h4 className="mb-2 border-b pb-1 font-medium">Education</h4>
              <div className="space-y-2">
                {parsedResume.education.map((edu: Education, index: number) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium">
                      {edu.degree} in {edu.field}
                    </p>
                    <p className="text-muted-foreground">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {parsedResume.skills && parsedResume.skills.length > 0 && (
            <div>
              <h4 className="mb-2 border-b pb-1 font-medium">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {parsedResume.skills.map((skill: Skill, index: number) => (
                  <span
                    key={index}
                    className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // Go back to file or paste selection
              setImportStatus("idle");
            }}
          >
            Back
          </Button>
          <Button
            type="button"
            disabled={importStatus === "importing"}
            onClick={handleConfirmImport}
          >
            {importStatus === "importing" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Resume...
              </>
            ) : (
              "Confirm Import"
            )}
          </Button>
        </div>
      </div>
    );
  };

  /**
   * Render error UI
   */
  const renderError = () => {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-foreground">
          Import Failed
        </h3>
        <p className="mb-4 text-center text-muted-foreground">
          {error ||
            "There was an error importing your resume. Please try again."}
        </p>
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  };

  /**
   * Render success UI
   */
  const renderSuccess = () => {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <div className="mb-4 rounded-full bg-success/10 p-3 text-success">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-foreground">
          Resume Imported Successfully
        </h3>
        <p className="mb-4 text-center text-muted-foreground">
          Your resume has been imported and is ready to edit.
        </p>
      </div>
    );
  };

  /**
   * Render dialog content based on current import status
   */
  const renderDialogContent = () => {
    if (importStatus === "error") {
      return renderError();
    }

    if (importStatus === "success") {
      return renderSuccess();
    }

    if (importStatus === "preview") {
      return renderResumePreview();
    }

    return (
      <Tabs
        defaultValue="file"
        value={activeSource}
        onValueChange={(value) => {
          setActiveSource(value as ImportSource);
          setError(null);
        }}
      >
        <TabsList className="mb-4 grid grid-cols-2">
          <TabsTrigger value="file" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="paste" className="flex items-center">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Paste Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file">{renderFileUpload()}</TabsContent>

        <TabsContent value="paste">{renderPasteContent()}</TabsContent>
      </Tabs>
    );
  };

  // Compact render (single button)
  if (compact) {
    return (
      <div className={className}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center"
        >
          <Upload className="mr-2 h-4 w-4" />
          Import Resume
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Import Resume</DialogTitle>
              <DialogDescription>
                Upload an existing resume to get started quickly.
              </DialogDescription>
            </DialogHeader>

            {renderDialogContent()}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Full render (card component)
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Import Existing Resume</CardTitle>
        <CardDescription>
          Upload or paste an existing resume to get started quickly.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* File Upload Option */}
          <div
            className={cn(
              "cursor-pointer rounded-lg border p-4 transition-colors hover:border-primary hover:bg-primary/10",
              activeSource === "file"
                ? "border-primary bg-primary/10"
                : "border-border",
            )}
            onClick={() => {
              setActiveSource("file");
              setIsDialogOpen(true);
            }}
          >
            <div className="flex flex-col items-center p-4 text-center">
              <div className="mb-3 rounded-full bg-primary/10 p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-1 font-medium text-foreground">Upload a File</h3>
              <p className="text-sm text-muted-foreground">
                Import from PDF, Word, or text file
              </p>
            </div>
          </div>

          {/* Paste Content Option */}
          <div
            className={cn(
              "cursor-pointer rounded-lg border p-4 transition-colors hover:border-primary hover:bg-primary/10",
              activeSource === "paste"
                ? "border-primary bg-primary/10"
                : "border-border",
            )}
            onClick={() => {
              setActiveSource("paste");
              setIsDialogOpen(true);
            }}
          >
            <div className="flex flex-col items-center p-4 text-center">
              <div className="mb-3 rounded-full bg-primary/10 p-3">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-1 font-medium text-foreground">Paste Content</h3>
              <p className="text-sm text-muted-foreground">
                Copy and paste from another document
              </p>
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-sm text-muted-foreground">
          Victry will automatically parse your resume and extract its content.
        </p>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button
          onClick={() => {
            setIsDialogOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <Upload className="mr-2 h-4 w-4" />
          Import Resume
        </Button>
      </CardFooter>

      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Resume</DialogTitle>
            <DialogDescription>
              Upload an existing resume to get started quickly.
            </DialogDescription>
          </DialogHeader>

          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
