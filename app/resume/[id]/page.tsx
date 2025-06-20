// File: /app/resume/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResumePreview } from "@/app/resume/_components/resume-preview";
import { useResume } from "@/hooks/use-resume";
import { createClient } from "@/lib/supabase/browser";
import {
  Edit,
  Download,
  Share,
  ArrowLeft,
  Loader2,
  Trash2,
  Zap,
} from "lucide-react";

interface ResumeViewPageProps {
  params: {
    id: string;
  };
}

export default function ResumeViewPage({ params }: ResumeViewPageProps) {
  const { id } = params;
  const router = useRouter();
  const supabase = createClient();
  const { resume, loading, error, deleteResume } = useResume(id);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login?returnUrl=" + encodeURIComponent(`/resume/${id}`));
      }
    };

    checkAuth();
  }, [supabase, router, id]);

  // Handle delete resume
  const handleDeleteResume = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this resume? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteResume();
      router.push("/resume");
    } catch (err) {
      console.error("Error deleting resume:", err);
      alert("Failed to delete resume. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle export PDF
  const handleExportPDF = async () => {
    try {
      // In a real implementation, this would call an API endpoint to generate a PDF
      const response = await fetch(`/api/export/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeId: id }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume?.title || "Resume"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("PDF export failed. Please try again later.");
    }
  };

  // Handle share
  const handleShare = () => {
    // In a real implementation, this would open a share dialog
    // For now, we'll just simulate sharing by copying the URL
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => alert("Resume URL copied to clipboard!"))
      .catch(() => alert("Failed to copy URL. Please try again."));
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <Link href="/resume" className="mb-4 inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resumes
          </Button>
        </Link>

        <div className="flex flex-col justify-between sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-1 text-2xl font-bold">
              {loading
                ? "Loading..."
                : resume
                  ? resume.title
                  : "Resume Preview"}
            </h1>
            {!loading && resume && (
              <p className="text-muted-foreground">{resume.targetJobTitle}</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
            <Link href={`/resume/${id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>

            <Link href={`/resume/${id}/tailor`}>
              <Button variant="outline">
                <Zap className="mr-2 h-4 w-4" />
                Tailor
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={loading || !!error}
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={loading || !!error}
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>

            <Button
              variant="destructive"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteResume}
              disabled={loading || !!error || isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex items-center rounded-md border border-red-200 bg-destructive/10 p-6">
          <div className="mr-4 rounded-full bg-red-100 p-2 text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-destructive">Error loading resume</h3>
            <p className="mt-1 text-destructive">
              {error.message || "Failed to load resume. Please try again."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => router.refresh()}
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-surface shadow-xs">
          {loading ? (
            <div className="flex h-[800px] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                <p className="text-muted-foreground">Loading resume...</p>
              </div>
            </div>
          ) : (
            <ResumePreview id={id} />
          )}
        </div>
      )}
    </div>
  );
}
