// File: /app/resume/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
// Client components should use API routes, not service functions directly
import { Resume } from "@/types/resume";
import { formatDate } from "@/lib/utils/formatting";
import { Button } from "@/components/ui/button";
import { ResumesResponse } from "@/types/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Edit,
  FileDown,
  Zap,
  Trash2,
  Plus,
  Search,
  Loader2,
  SortAsc,
  Grid,
  List,
  Download,
} from "lucide-react";

// Resume type for type safety
type ResumeType = "base" | "tailored";

export default function ResumeListPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [baseResumes, setBaseResumes] = useState<Resume[]>([]);
  const [tailoredResumes, setTailoredResumes] = useState<Resume[]>([]);
  const [activeTab, setActiveTab] = useState<ResumeType>("base");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updatedAt" | "title">("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  // Fetch resumes on component mount
  useEffect(() => {
    async function fetchResumes() {
      try {
        setLoading(true);
        const response = await fetch('/api/resume');
        const resumesResponse: ResumesResponse = await response.json();
        const resumeList = resumesResponse.data || [];

        setResumes(resumeList);

        // Separate resumes into base and tailored
        const base = resumeList.filter((resume) => !resume.originalResumeId);
        const tailored = resumeList.filter((resume) => resume.originalResumeId);

        setBaseResumes(base);
        setTailoredResumes(tailored);
      } catch (err) {
        console.error("Error fetching resumes:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch resumes"),
        );
      } finally {
        setLoading(false);
      }
    }

    fetchResumes();
  }, []);

  // Get current resumes based on active tab
  const getCurrentResumes = () => {
    const currentResumes = activeTab === "base" ? baseResumes : tailoredResumes;

    // Apply search filter
    if (!searchQuery) return currentResumes;

    const query = searchQuery.toLowerCase();
    return currentResumes.filter(
      (resume) =>
        resume.title.toLowerCase().includes(query) ||
        resume.targetJobTitle.toLowerCase().includes(query),
    );
  };

  // Get sorted resumes
  const getSortedResumes = () => {
    const filteredResumes = getCurrentResumes();

    return [...filteredResumes].sort((a, b) => {
      if (sortBy === "updatedAt") {
        return sortDirection === "asc"
          ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else {
        return sortDirection === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });
  };

  // Handle delete resume
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this resume?")) {
      return;
    }

    try {
      // Call the delete API
      await fetch(`/api/resume/${id}`, {
        method: "DELETE",
      });

      // Update the UI by removing the deleted resume
      setResumes(resumes.filter((resume) => resume.id !== id));
      setBaseResumes(baseResumes.filter((resume) => resume.id !== id));
      setTailoredResumes(tailoredResumes.filter((resume) => resume.id !== id));
    } catch (err) {
      console.error("Error deleting resume:", err);
      alert("Failed to delete resume. Please try again.");
    }
  };

  // Toggle sort direction or change sort field
  const handleSort = (field: "updatedAt" | "title") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  // Navigate to resume when clicking on a card/row
  const handleResumeClick = (id: string) => {
    router.push(`/resume/${id}`);
  };

  // Render base resume grid
  const renderBaseResumeGrid = () => {
    const sortedResumes = getSortedResumes();

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {sortedResumes.map((resume) => (
          <div key={resume.id} className="overflow-hidden rounded-lg border">
            <div className="flex">
              <div className="relative h-48 w-36 bg-muted">
                <Image
                  src={`/templates/${resume.templateId || "classic"}.png`}
                  alt={resume.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
                <div className="absolute bottom-2 left-2 right-2 rounded bg-surface/80 py-1 text-center text-xs">
                  Classic <span className="text-muted-foreground">Light</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-1 font-semibold">{resume.title}</h3>
                <p className="text-sm text-muted-foreground">{resume.targetJobTitle}</p>

                <div className="mt-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mb-2 w-full justify-start"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/resume/${resume.id}/edit`);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Resume
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mb-2 w-full justify-start"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/resume/${resume.id}/tailor`);
                    }}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Tailor to Job
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mb-2 w-full justify-start"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600"
                    onClick={(e) => handleDelete(resume.id, e)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t px-4 py-2 text-xs text-muted-foreground">
              Last Edited: {formatDate(resume.updatedAt, "short")}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render tailored resume grid
  const renderTailoredResumeGrid = () => {
    const sortedResumes = getSortedResumes();

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {sortedResumes.map((resume) => (
          <div key={resume.id} className="overflow-hidden rounded-lg border">
            <div className="flex">
              <div className="relative h-48 w-36 bg-muted">
                <Image
                  src={`/templates/${resume.templateId || "classic"}.png`}
                  alt={resume.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
                <div className="absolute bottom-2 left-2 right-2 rounded bg-surface/80 py-1 text-center text-xs">
                  Classic <span className="text-muted-foreground">Light</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-1 font-semibold">{resume.title}</h3>
                <p className="text-sm text-muted-foreground">{resume.targetJobTitle}</p>

                <div className="mt-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mb-2 w-full justify-start"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/resume/${resume.id}/edit`);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Resume
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mb-2 w-full justify-start"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600"
                    onClick={(e) => handleDelete(resume.id, e)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t px-4 py-2 text-xs text-muted-foreground">
              Last Edited: {formatDate(resume.updatedAt, "short")}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render table/list view
  const renderListView = () => {
    const sortedResumes = getSortedResumes();

    // Different columns based on resume type
    if (activeTab === "base") {
      return (
        <div className="overflow-x-auto">
          <table className="w-full rounded-lg border bg-surface">
            <thead className="bg-muted/50 text-sm text-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  <button
                    className="flex items-center focus:outline-none"
                    onClick={() => handleSort("title")}
                  >
                    Resume Name
                    {sortBy === "title" && (
                      <SortAsc
                        className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180 transform" : ""}`}
                      />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium">Target Job</th>
                <th className="px-4 py-3 text-left font-medium">
                  <button
                    className="flex items-center focus:outline-none"
                    onClick={() => handleSort("updatedAt")}
                  >
                    Last Updated
                    {sortBy === "updatedAt" && (
                      <SortAsc
                        className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180 transform" : ""}`}
                      />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedResumes.map((resume) => (
                <tr
                  key={resume.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleResumeClick(resume.id)}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {resume.title}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {resume.targetJobTitle}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(resume.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/resume/${resume.id}/edit`);
                        }}
                        title="Edit Resume"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/resume/${resume.id}/tailor`);
                        }}
                        title="Tailor Resume"
                      >
                        <Zap className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        title="Download Resume"
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-red-700"
                        onClick={(e) => handleDelete(resume.id, e)}
                        title="Delete Resume"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      // Tailored resumes table view
      return (
        <div className="overflow-x-auto">
          <table className="w-full rounded-lg border bg-surface">
            <thead className="bg-muted/50 text-sm text-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Resume Name</th>
                <th className="px-4 py-3 text-left font-medium">Job Match</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
                <th className="px-4 py-3 text-left font-medium">Target Job</th>
                <th className="px-4 py-3 text-left font-medium">
                  Target Title
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  Source Resume
                </th>
                <th className="px-4 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedResumes.map((resume) => (
                <tr
                  key={resume.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleResumeClick(resume.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <button className="mr-2 text-muted-foreground">...</button>
                      <span className="font-medium text-foreground">
                        {resume.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      {resume.atsScore ?? "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(resume.createdAt, "short")}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {resume.targetJobTitle}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {resume.targetJobTitle}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {baseResumes.find(
                      (base) => base.id === resume.originalResumeId,
                    )?.title || "Unknown"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/resume/${resume.id}/edit`);
                        }}
                        title="Edit Resume"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                        title="Download Resume"
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-red-700"
                        onClick={(e) => handleDelete(resume.id, e)}
                        title="Delete Resume"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Your Resumes</h1>

        <div className="flex gap-2">
          <Link href="/resume/create">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create New Resume
            </Button>
          </Link>
        </div>
      </div>

      {/* Resume Type Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex rounded-lg border bg-surface p-6">
          <div className="mr-4 rounded-md bg-blue-100 p-3">
            <FileText className="h-6 w-6 text-blue-700" />
          </div>
          <div className="flex-1">
            <h2 className="mb-1 text-lg font-semibold">Base Resume</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              A main resume targeted to a specific role/title and seniority. We
              suggest you create one or two of these at most, one for each role
              you are targeting.
            </p>
            <Link href="/resume/create">
              <Button size="sm" variant="outline" className="text-blue-600">
                Create New <span className="ml-2">→</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex rounded-lg border bg-surface p-6">
          <div className="mr-4 rounded-md bg-green-100 p-3">
            <Zap className="h-6 w-6 text-green-700" />
          </div>
          <div className="flex-1">
            <h2 className="mb-1 text-lg font-semibold">Job Tailored Resume</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              A resume targeted to a specific job description and built off of a
              Base Resume.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="text-green-600"
              disabled={baseResumes.length === 0}
            >
              Create New <span className="ml-2">→</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs
        defaultValue="base"
        onValueChange={(value) => setActiveTab(value as ResumeType)}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="base" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Base Resumes
          </TabsTrigger>
          <TabsTrigger value="tailored" className="flex items-center">
            <Zap className="mr-2 h-4 w-4" />
            Job Tailored Resumes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="base" className="mt-4">
          {/* Search and View Controls for Base Resumes */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search base resumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 self-end">
              <Tabs
                defaultValue={viewType}
                onValueChange={(value) => setViewType(value as "grid" | "list")}
              >
                <TabsList>
                  <TabsTrigger value="grid" title="Grid View">
                    <Grid className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list" title="List View">
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Base Resumes Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-muted-foreground">
                Loading your resumes...
              </span>
            </div>
          ) : error ? (
            <div className="relative mb-6 rounded border border-red-200 bg-destructive/10 px-4 py-3 text-red-700">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline">
                {" "}
                {error.message || "Failed to load resumes"}
              </span>
              <button
                className="mt-2 rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-800 hover:bg-red-200"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {baseResumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <FileText className="mx-auto mb-4 h-16 w-16 text-muted" />
                  <h3 className="mb-1 text-lg font-medium text-foreground">
                    You don&apos;t have any base resumes yet
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    Create your first base resume to get started with Victry.
                  </p>
                  <Link href="/resume/create">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Resume
                    </Button>
                  </Link>
                </div>
              ) : getSortedResumes().length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <FileText className="mx-auto mb-4 h-16 w-16 text-muted" />
                  <h3 className="mb-1 text-lg font-medium text-foreground">
                    No matching resumes found
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    Try adjusting your search or clear the search field to see
                    all resumes.
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                </div>
              ) : viewType === "grid" ? (
                renderBaseResumeGrid()
              ) : (
                renderListView()
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="tailored" className="mt-4">
          {/* Search and View Controls for Tailored Resumes */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tailored resumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 self-end">
              <Tabs
                defaultValue={viewType}
                onValueChange={(value) => setViewType(value as "grid" | "list")}
              >
                <TabsList>
                  <TabsTrigger value="grid" title="Grid View">
                    <Grid className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list" title="List View">
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Tailored Resumes Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-muted-foreground">
                Loading your resumes...
              </span>
            </div>
          ) : error ? (
            <div className="relative mb-6 rounded border border-red-200 bg-destructive/10 px-4 py-3 text-red-700">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline">
                {" "}
                {error.message || "Failed to load resumes"}
              </span>
              <button
                className="mt-2 rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-800 hover:bg-red-200"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {tailoredResumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <FileText className="mx-auto mb-4 h-16 w-16 text-muted" />
                  {baseResumes.length === 0 ? (
                    <>
                      <h3 className="mb-1 text-lg font-medium text-foreground">
                        Create a base resume first
                      </h3>
                      <p className="mb-4 text-muted-foreground">
                        You need to create a base resume before you can create
                        tailored resumes.
                      </p>
                      <Link href="/resume/create">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Base Resume
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3 className="mb-1 text-lg font-medium text-foreground">
                        You don&apos;t have any tailored resumes yet
                      </h3>
                      <p className="mb-4 text-muted-foreground">
                        Create a tailored resume by selecting a base resume and
                        a job description.
                      </p>
                      <Button>
                        <Zap className="mr-2 h-4 w-4" />
                        Tailor a Resume
                      </Button>
                    </>
                  )}
                </div>
              ) : getSortedResumes().length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <FileText className="mx-auto mb-4 h-16 w-16 text-muted" />
                  <h3 className="mb-1 text-lg font-medium text-foreground">
                    No matching resumes found
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    Try adjusting your search or clear the search field to see
                    all resumes.
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                </div>
              ) : viewType === "grid" ? (
                renderTailoredResumeGrid()
              ) : (
                renderListView()
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
