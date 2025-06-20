"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatsCard } from "./_components/stats-card";
// Client components should use API routes, not service functions directly
import { Resume } from "@/types/resume";
import { JobDescription } from "@/types/job-description";
import { formatDate } from "@/lib/utils/formatting";
import { ResumesResponse } from "@/types/api";
import { JobDescriptionsResponse } from "@/types/api";
import { AdminOnly, PremiumOnly } from "@/components/auth/role-based-access";
import { PremiumFeature } from "@/components/resume/premium-feature";

// Icons
import {
  FileText,
  Briefcase,
  Clock,
  Plus,
  FileEdit,
  Search,
  Zap,
  ChevronRight,
  BarChart3,
  Settings,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Call API routes instead of service functions directly
        const [resumesRes, jobDescriptionsRes] = await Promise.all([
          fetch('/api/resume'),
          fetch('/api/job-description')
        ]);

        const resumesResponse: ResumesResponse = await resumesRes.json();
        const jobDescriptionsResponse: JobDescriptionsResponse = await jobDescriptionsRes.json();

        setResumes(resumesResponse.data || []);
        setJobDescriptions(jobDescriptionsResponse.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setResumes([]);
        setJobDescriptions([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Get recent resumes (last 5)
  const recentResumes = [...resumes]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);

  // Get recent job descriptions (last 3)
  const recentJobs = [...jobDescriptions]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      {isLoading ? (
        <div className="grid animate-pulse grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Total Resumes"
              value={resumes.length}
              icon={<FileText className="h-6 w-6" />}
              description="Across all templates"
            />
            <StatsCard
              title="Job Descriptions"
              value={jobDescriptions.length}
              icon={<Briefcase className="h-6 w-6" />}
              description="Saved job postings"
            />
            <StatsCard
              title="Last Activity"
              value={
                resumes.length
                  ? formatDate(
                      [...resumes].sort(
                        (a, b) =>
                          new Date(b.updatedAt).getTime() -
                          new Date(a.updatedAt).getTime(),
                      )[0]?.updatedAt,
                    )
                  : "No activity"
              }
              icon={<Clock className="h-6 w-6" />}
              description="Last resume update"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent Resumes */}
            <div className="lg:col-span-2">
              <div className="rounded-lg bg-surface p-6 shadow">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Recent Resumes</h2>
                  <Link
                    href="/resume"
                    className="flex items-center text-sm text-blue-600 hover:underline"
                  >
                    View all <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>

                {recentResumes.length === 0 ? (
                  <div className="rounded-lg bg-muted/50 py-8 text-center">
                    <FileText className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                    <p className="mb-4 text-muted-foreground">
                      You haven&apos;t created any resumes yet
                    </p>
                    <Link
                      href="/resume/create"
                      className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create your first resume
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentResumes.map((resume) => (
                      <div
                        key={resume.id}
                        className="cursor-pointer rounded-lg border border-border p-4 transition-colors hover:bg-info/10"
                        onClick={() => router.push(`/resume/${resume.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-blue-900">
                              {resume.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {resume.targetJobTitle} • Updated{" "}
                              {formatDate(resume.updatedAt)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/resume/${resume.id}/edit`);
                              }}
                              className="rounded-full p-2 text-muted-foreground hover:bg-blue-100 hover:text-blue-600"
                              title="Edit Resume"
                            >
                              <FileEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/resume/${resume.id}/tailor`);
                              }}
                              className="rounded-full p-2 text-muted-foreground hover:bg-blue-100 hover:text-blue-600"
                              title="Tailor Resume"
                            >
                              <Zap className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="mb-6 rounded-lg bg-surface p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
                <div className="space-y-2">
                  <Link
                    href="/resume/create"
                    className="flex items-center rounded-lg bg-info/10 p-3 text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    <Plus className="mr-3 h-5 w-5" />
                    <span>Create new resume</span>
                  </Link>
                  <Link
                    href="/resume"
                    className="flex items-center rounded-lg bg-muted/50 p-3 text-foreground transition-colors hover:bg-muted/80"
                  >
                    <Search className="mr-3 h-5 w-5" />
                    <span>Browse all resumes</span>
                  </Link>
                  {recentResumes.length > 0 && (
                    <Link
                      href={`/resume/${recentResumes[0].id}/tailor`}
                      className="flex items-center rounded-lg bg-orange-50 p-3 text-orange-700 transition-colors hover:bg-orange-100"
                    >
                      <Zap className="mr-3 h-5 w-5" />
                      <span>Tailor latest resume</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Recent Job Descriptions */}
              <div className="rounded-lg bg-surface p-6 shadow">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Recent Jobs</h2>
                </div>

                {recentJobs.length === 0 ? (
                  <p className="py-4 text-center text-muted-foreground">
                    No job descriptions saved
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recentJobs.map((job) => (
                      <div
                        key={job.id}
                        className="rounded-lg border border-border p-3"
                      >
                        <h3 className="font-medium">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Role-Based Access Demo Section */}
              <div className="mt-6 space-y-4">
                {/* Admin Panel Access */}
                <AdminOnly fallback={null}>
                  <div className="rounded-lg bg-purple-50 p-6 shadow border border-purple-200">
                    <h2 className="mb-4 text-xl font-semibold flex items-center gap-2 text-purple-800">
                      <Settings className="h-5 w-5" />
                      Admin Controls
                    </h2>
                    <div className="space-y-2">
                      <Link
                        href="/dashboard/admin"
                        className="flex items-center rounded-lg bg-surface p-3 text-purple-700 transition-colors hover:bg-purple-100 border border-purple-200"
                      >
                        <Users className="mr-3 h-5 w-5" />
                        <span>Manage Users</span>
                      </Link>
                      <Link
                        href="/dashboard/analytics"
                        className="flex items-center rounded-lg bg-surface p-3 text-purple-700 transition-colors hover:bg-purple-100 border border-purple-200"
                      >
                        <BarChart3 className="mr-3 h-5 w-5" />
                        <span>Analytics Dashboard</span>
                      </Link>
                    </div>
                  </div>
                </AdminOnly>
                
                {/* Premium Feature Demo */}
                <PremiumFeature
                  title="Application Tracking"
                  description="Track and manage your job applications in one place"
                  featureName="Application Tracking"
                >
                  <div className="p-4 border rounded-lg bg-surface">
                    <h3 className="text-lg font-semibold mb-2">Job Applications</h3>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Senior Frontend Developer</h4>
                            <p className="text-sm text-muted-foreground">TechCorp Inc.</p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Interview</span>
                        </div>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">UX Designer</h4>
                            <p className="text-sm text-muted-foreground">Design Studio</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Applied</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </PremiumFeature>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
