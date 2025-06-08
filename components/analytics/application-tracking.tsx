// File: /components/analytics/application-tracking.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Briefcase,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Filter,
  SortAsc,
  Loader2,
  Trash,
  MessageCircle,
  Edit,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { Resume } from "../../models/resume";
import { JobDescription } from "../../models/job-description";
import { analytics } from "../../lib/services/analytics-service";

// Application status options
export const APPLICATION_STATUSES = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

// Application status type
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

// Color mappings for different statuses
const STATUS_COLORS: Record<
  ApplicationStatus,
  { bg: string; text: string; border: string }
> = {
  saved: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
  },
  applied: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  interviewing: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-300",
  },
  offer: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-300",
  },
  accepted: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
  },
  rejected: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
  },
  withdrawn: {
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-300",
  },
};

// User-friendly status labels
const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer Received",
  accepted: "Accepted Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

// Application interview stage options
export const INTERVIEW_STAGES = [
  "screening",
  "phone",
  "technical",
  "behavioral",
  "onsite",
  "final",
] as const;

export type InterviewStage = (typeof INTERVIEW_STAGES)[number];

// Job application interface
export interface JobApplication {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  location: string;
  jobType: string;
  salary?: string;
  status: ApplicationStatus;
  appliedDate?: string;
  interviewStage?: InterviewStage;
  resumeId?: string;
  resumeVersion?: string;
  resumeTitle?: string;
  jobDescriptionId?: string;
  nextStep?: string;
  nextStepDate?: string;
  notes?: string;
  lastStatusChangeDate?: string;
  statusHistory?: {
    status: ApplicationStatus;
    date: string;
    notes?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Form data for creating/editing an application
interface ApplicationFormData {
  jobTitle: string;
  company: string;
  location: string;
  jobType: string;
  salary: string;
  status: ApplicationStatus;
  appliedDate: string;
  interviewStage?: InterviewStage;
  resumeId?: string;
  jobDescriptionId?: string;
  nextStep?: string;
  nextStepDate?: string;
  notes?: string;
}

// Filter options for applications
interface ApplicationFilters {
  status?: ApplicationStatus[];
  company?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  search?: string;
}

// Application status history item type (assuming structure)
interface StatusHistoryItem {
  status: ApplicationStatus;
  date: string;
  notes?: string;
}

// Component props
interface ApplicationTrackingProps {
  userId?: string;
  initialTab?: "list" | "kanban" | "stats";
  limit?: number;
  showTitle?: boolean;
}

/**
 * Application Tracking component
 * Helps users track their job applications and monitor progress
 */
export function ApplicationTracking({
  userId,
  initialTab = "list",
  limit = 25,
  showTitle = true,
}: ApplicationTrackingProps) {
  const supabase = createClient();

  // Component state
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "kanban" | "stats">(
    initialTab,
  );
  const [filters, setFilters] = useState<ApplicationFilters>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<keyof JobApplication>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<ApplicationFormData>({
    jobTitle: "",
    company: "",
    location: "",
    jobType: "full-time",
    salary: "",
    status: "saved",
    appliedDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [editingApplicationId, setEditingApplicationId] = useState<
    string | null
  >(null);
  const [expandedApplicationId, setExpandedApplicationId] = useState<
    string | null
  >(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch user applications from the database
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user if not provided
      let currentUserId = userId;
      if (!currentUserId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("You must be logged in to view applications");
          setLoading(false);
          return;
        }
        currentUserId = user.id;
      }

      // Fetch applications from database
      const { data, error: fetchError } = await supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", currentUserId)
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (fetchError) {
        throw fetchError;
      }

      // Transform database records to application objects
      const transformedApplications: JobApplication[] = data.map((app) => ({
        id: app.id,
        userId: app.user_id,
        jobTitle: app.job_title,
        company: app.company,
        location: app.location || "",
        jobType: app.job_type || "full-time",
        salary: app.salary,
        status: app.status,
        appliedDate: app.applied_date,
        interviewStage: app.interview_stage,
        resumeId: app.resume_id,
        resumeVersion: app.resume_version,
        resumeTitle: app.resume_title,
        jobDescriptionId: app.job_description_id,
        nextStep: app.next_step,
        nextStepDate: app.next_step_date,
        notes: app.notes,
        lastStatusChangeDate: app.last_status_change_date,
        statusHistory: app.status_history || [],
        createdAt: app.created_at,
        updatedAt: app.updated_at,
      }));

      setApplications(transformedApplications);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [supabase, userId, limit]);

  // Fetch user resumes
  const fetchResumes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("resumes")
        .select("id, title, target_job_title, created_at")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setResumes(
        data.map(
          (item) =>
            ({
              id: item.id,
              title: item.title,
              targetJobTitle: item.target_job_title,
              createdAt: item.created_at,
            }) as Resume,
        ),
      );
    } catch (err) {
      console.error("Error fetching resumes:", err);
      // Don't set error state here as it's not critical
    }
  }, [supabase]);

  // Fetch user job descriptions
  const fetchJobDescriptions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("job_descriptions")
        .select("id, title, company, content")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setJobDescriptions(
        data.map(
          (item) =>
            ({
              id: item.id,
              title: item.title,
              company: item.company,
              content: item.content,
            }) as JobDescription,
        ),
      );
    } catch (err) {
      console.error("Error fetching job descriptions:", err);
      // Don't set error state here as it's not critical
    }
  }, [supabase]);

  // Fetch data on component mount and when tab changes (for tracking)
  useEffect(() => {
    fetchApplications();
    fetchResumes();
    fetchJobDescriptions();

    // Use correct event type for tracking view
    analytics
      .trackEvent("feature_viewed", {
        feature: "application_tracker",
        view: activeTab,
      })
      .catch(console.error);
  }, [activeTab, fetchApplications, fetchResumes, fetchJobDescriptions]);

  // Get filtered and sorted applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Apply status filter
        if (
          filters.status &&
          filters.status.length > 0 &&
          !filters.status.includes(app.status)
        ) {
          return false;
        }

        // Apply company filter
        if (
          filters.company &&
          app.company.toLowerCase() !== filters.company.toLowerCase()
        ) {
          return false;
        }

        // Apply date range filter
        if (filters.dateRange) {
          const { start, end } = filters.dateRange;

          if (
            start &&
            app.appliedDate &&
            new Date(app.appliedDate) < new Date(start)
          ) {
            return false;
          }

          if (
            end &&
            app.appliedDate &&
            new Date(app.appliedDate) > new Date(end)
          ) {
            return false;
          }
        }

        // Apply search term filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          const matchesJobTitle = app.jobTitle.toLowerCase().includes(search);
          const matchesCompany = app.company.toLowerCase().includes(search);
          const matchesLocation = app.location?.toLowerCase().includes(search);
          const matchesNotes = app.notes?.toLowerCase().includes(search);

          if (
            !matchesJobTitle &&
            !matchesCompany &&
            !matchesLocation &&
            !matchesNotes
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const valueA = a[sortBy];
        const valueB = b[sortBy];

        if (!valueA && !valueB) return 0;
        if (!valueA) return sortDirection === "asc" ? -1 : 1;
        if (!valueB) return sortDirection === "asc" ? 1 : -1;

        if (typeof valueA === "string" && typeof valueB === "string") {
          const comparison = valueA.localeCompare(valueB);
          return sortDirection === "asc" ? comparison : -comparison;
        }

        return 0;
      });
  }, [applications, filters, sortBy, sortDirection, searchTerm]);

  // Calculate statistics for the dashboard
  const stats = useMemo(() => {
    const total = applications.length;
    const statusCounts = applications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      },
      {} as Record<ApplicationStatus, number>,
    );

    // Calculate application success rate
    const appliedCount = statusCounts.applied || 0;
    const interviewingCount = statusCounts.interviewing || 0;
    const offerCount = statusCounts.offer || 0;
    const acceptedCount = statusCounts.accepted || 0;
    const rejectedCount = statusCounts.rejected || 0;

    const responseRate =
      appliedCount > 0
        ? ((interviewingCount + offerCount + acceptedCount + rejectedCount) /
            appliedCount) *
          100
        : 0;

    const successRate =
      appliedCount > 0
        ? ((offerCount + acceptedCount) / appliedCount) * 100
        : 0;

    // Get applications in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentApplications = applications.filter(
      (app) => app.appliedDate && new Date(app.appliedDate) >= thirtyDaysAgo,
    );

    return {
      total,
      statusCounts,
      responseRate: Math.round(responseRate),
      successRate: Math.round(successRate),
      recentCount: recentApplications.length,
      activeCount: interviewingCount + offerCount,
    };
  }, [applications]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      jobTitle: "",
      company: "",
      location: "",
      jobType: "full-time",
      salary: "",
      status: "saved",
      appliedDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setEditingApplicationId(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.jobTitle || !formData.company) {
        setError("Job title and company are required");
        return;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to track applications");
        return;
      }

      // Prepare status history entry
      const now = new Date().toISOString();
      const statusHistoryEntry = {
        status: formData.status,
        date: now,
        notes: formData.notes,
      };

      if (editingApplicationId) {
        // Update existing application
        const existingApp = applications.find(
          (app) => app.id === editingApplicationId,
        );

        if (!existingApp) {
          setError("Application not found");
          return;
        }

        // Check if status has changed and update history accordingly
        const statusHistory = [...(existingApp.statusHistory || [])];
        if (existingApp.status !== formData.status) {
          statusHistory.push(statusHistoryEntry);
        }

        // Update application in database
        const { error: updateError } = await supabase
          .from("job_applications")
          .update({
            job_title: formData.jobTitle,
            company: formData.company,
            location: formData.location,
            job_type: formData.jobType,
            salary: formData.salary,
            status: formData.status,
            applied_date: formData.appliedDate,
            interview_stage: formData.interviewStage,
            resume_id: formData.resumeId,
            job_description_id: formData.jobDescriptionId,
            next_step: formData.nextStep,
            next_step_date: formData.nextStepDate,
            notes: formData.notes,
            status_history: statusHistory,
            last_status_change_date:
              existingApp.status !== formData.status
                ? now
                : existingApp.lastStatusChangeDate,
            updated_at: now,
          })
          .eq("id", editingApplicationId);

        if (updateError) throw updateError;
      } else {
        // Create new application
        const { error: createError } = await supabase
          .from("job_applications")
          .insert({
            user_id: user.id,
            job_title: formData.jobTitle,
            company: formData.company,
            location: formData.location,
            job_type: formData.jobType,
            salary: formData.salary,
            status: formData.status,
            applied_date: formData.appliedDate,
            interview_stage: formData.interviewStage,
            resume_id: formData.resumeId,
            job_description_id: formData.jobDescriptionId,
            next_step: formData.nextStep,
            next_step_date: formData.nextStepDate,
            notes: formData.notes,
            status_history: [statusHistoryEntry],
            last_status_change_date: now,
            created_at: now,
            updated_at: now,
          });

        if (createError) throw createError;
      }

      // Refresh applications and reset form
      await fetchApplications();
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error("Error saving application:", err);
      setError("Failed to save application. Please try again.");
    }
  };

  // Handle editing an application
  const handleEdit = (app: JobApplication) => {
    setFormData({
      jobTitle: app.jobTitle,
      company: app.company,
      location: app.location || "",
      jobType: app.jobType || "full-time",
      salary: app.salary || "",
      status: app.status,
      appliedDate: app.appliedDate || new Date().toISOString().split("T")[0],
      interviewStage: app.interviewStage,
      resumeId: app.resumeId,
      jobDescriptionId: app.jobDescriptionId,
      nextStep: app.nextStep,
      nextStepDate: app.nextStepDate,
      notes: app.notes || "",
    });

    setEditingApplicationId(app.id);
    setShowForm(true);
  };

  // Handle deleting an application
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this application? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setApplications(applications.filter((app) => app.id !== id));
    } catch (err) {
      console.error("Error deleting application:", err);
      setError("Failed to delete application. Please try again.");
    }
  };

  // Handle status change (e.g., from Kanban board)
  const handleStatusChange = async (
    id: string,
    newStatus: ApplicationStatus,
  ) => {
    try {
      const app = applications.find((a) => a.id === id);
      if (!app) return;

      // Don't update if status hasn't changed
      if (app.status === newStatus) return;

      const now = new Date().toISOString();

      // Add entry to status history
      const statusHistory = [
        ...(app.statusHistory || []),
        {
          status: newStatus,
          date: now,
        },
      ];

      // Update in database
      const { error } = await supabase
        .from("job_applications")
        .update({
          status: newStatus,
          status_history: statusHistory,
          last_status_change_date: now,
          updated_at: now,
        })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setApplications(
        applications.map((a) =>
          a.id === id
            ? {
                ...a,
                status: newStatus,
                statusHistory,
                lastStatusChangeDate: now,
                updatedAt: now,
              }
            : a,
        ),
      );
    } catch (err) {
      console.error("Error updating application status:", err);
      setError("Failed to update application status. Please try again.");
    }
  };

  // Toggle showing details for an application
  const toggleApplicationDetails = (id: string) => {
    setExpandedApplicationId(expandedApplicationId === id ? null : id);
  };

  // Handle sorting applications
  const handleSort = (field: keyof JobApplication) => {
    if (sortBy === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Render application list view
  const renderListView = () => {
    if (filteredApplications.length === 0) {
      return (
        <div className="rounded-md bg-gray-50 py-10 text-center">
          <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h3 className="mb-1 text-lg font-medium text-gray-900">
            No applications found
          </h3>
          <p className="mb-4 text-gray-500">
            {applications.length > 0
              ? "Try adjusting your filters or search term"
              : "Start tracking your job applications"}
          </p>
          {applications.length === 0 && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Application
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg border bg-white">
          <thead className="bg-gray-50 text-sm text-gray-700">
            <tr>
              <th className="p-3 text-left font-medium">
                <button
                  onClick={() => handleSort("jobTitle")}
                  className="flex items-center focus:outline-none"
                >
                  Job Title
                  {sortBy === "jobTitle" && (
                    <SortAsc
                      className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180 transform" : ""}`}
                    />
                  )}
                </button>
              </th>
              <th className="p-3 text-left font-medium">
                <button
                  onClick={() => handleSort("company")}
                  className="flex items-center focus:outline-none"
                >
                  Company
                  {sortBy === "company" && (
                    <SortAsc
                      className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180 transform" : ""}`}
                    />
                  )}
                </button>
              </th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">
                <button
                  onClick={() => handleSort("appliedDate")}
                  className="flex items-center focus:outline-none"
                >
                  Applied Date
                  {sortBy === "appliedDate" && (
                    <SortAsc
                      className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180 transform" : ""}`}
                    />
                  )}
                </button>
              </th>
              <th className="p-3 text-left font-medium">
                <button
                  onClick={() => handleSort("updatedAt")}
                  className="flex items-center focus:outline-none"
                >
                  Last Updated
                  {sortBy === "updatedAt" && (
                    <SortAsc
                      className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180 transform" : ""}`}
                    />
                  )}
                </button>
              </th>
              <th className="p-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredApplications.map((app) => (
              <React.Fragment key={app.id}>
                <tr
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleApplicationDetails(app.id)}
                >
                  <td className="p-3">
                    <div className="font-medium text-blue-700">
                      {app.jobTitle}
                    </div>
                    <div className="text-xs text-gray-500">{app.location}</div>
                  </td>
                  <td className="p-3 text-gray-800">{app.company}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_COLORS[app.status].bg
                      } ${STATUS_COLORS[app.status].text}`}
                    >
                      {STATUS_LABELS[app.status]}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">
                    {app.appliedDate
                      ? formatDate(app.appliedDate, "short")
                      : "-"}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {formatDate(app.updatedAt, "short")}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(app);
                        }}
                        className="rounded-full p-1 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                        title="Edit Application"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(app.id);
                        }}
                        className="rounded-full p-1 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        title="Delete Application"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                      <button className="rounded-full p-1 text-blue-600">
                        {expandedApplicationId === app.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded details row */}
                {expandedApplicationId === app.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="p-3">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="mb-2 font-medium">
                            Application Details
                          </h4>
                          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <dt className="text-gray-500">Job Type</dt>
                            <dd>{app.jobType || "-"}</dd>

                            <dt className="text-gray-500">Salary</dt>
                            <dd>{app.salary || "-"}</dd>

                            {app.status === "interviewing" && (
                              <>
                                <dt className="text-gray-500">
                                  Interview Stage
                                </dt>
                                <dd className="capitalize">
                                  {app.interviewStage || "-"}
                                </dd>
                              </>
                            )}

                            <dt className="text-gray-500">Resume Used</dt>
                            <dd>
                              {app.resumeTitle ||
                                (app.resumeId ? (
                                  <Link
                                    href={`/resume/${app.resumeId}`}
                                    className="text-blue-600 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View Resume
                                  </Link>
                                ) : (
                                  "-"
                                ))}
                            </dd>

                            <dt className="text-gray-500">Next Step</dt>
                            <dd>
                              {app.nextStep ? (
                                <>
                                  {app.nextStep}{" "}
                                  {app.nextStepDate &&
                                    `(${formatDate(app.nextStepDate, "short")})`}
                                </>
                              ) : (
                                "-"
                              )}
                            </dd>
                          </dl>
                        </div>

                        <div>
                          <h4 className="mb-2 font-medium">Notes</h4>
                          <div className="min-h-24 rounded border bg-white p-2 text-sm">
                            {app.notes ||
                              "No notes added for this application."}
                          </div>

                          {app.statusHistory &&
                            app.statusHistory.length > 0 && (
                              <div className="mt-4">
                                <h4 className="mb-2 font-medium">
                                  Status History
                                </h4>
                                <ul className="space-y-2 text-sm">
                                  {app.statusHistory.map(
                                    (
                                      history: StatusHistoryItem,
                                      index: number,
                                    ) => (
                                      <li
                                        key={index}
                                        className="flex items-start"
                                      >
                                        <div className="mr-2 flex-shrink-0">
                                          <div
                                            className={`mt-1.5 h-2 w-2 rounded-full ${
                                              STATUS_COLORS[history.status].bg
                                            } ${STATUS_COLORS[history.status].border}`}
                                          ></div>
                                        </div>
                                        <div>
                                          <div className="flex items-baseline">
                                            <span className="font-medium">
                                              {STATUS_LABELS[history.status]}
                                            </span>
                                            <span className="ml-2 text-xs text-gray-500">
                                              {formatDate(
                                                history.date,
                                                "short",
                                              )}
                                            </span>
                                          </div>
                                          {history.notes && (
                                            <p className="mt-1 text-xs text-gray-600">
                                              {history.notes}
                                            </p>
                                          )}
                                        </div>
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render Kanban board view
  const renderKanbanView = () => {
    // Group applications by status for Kanban columns
    const applicationsByStatus = APPLICATION_STATUSES.reduce(
      (acc, status) => {
        acc[status] = filteredApplications.filter(
          (app) => app.status === status,
        );
        return acc;
      },
      {} as Record<ApplicationStatus, JobApplication[]>,
    );

    // Defined which statuses to show in the board
    const displayStatuses: ApplicationStatus[] = [
      "saved",
      "applied",
      "interviewing",
      "offer",
      "accepted",
      "rejected",
    ];

    return (
      <div className="grid min-h-96 grid-cols-1 gap-4 overflow-x-auto md:grid-cols-3 lg:grid-cols-6">
        {displayStatuses.map((status) => (
          <div key={status} className="min-w-72">
            <div
              className={`rounded-t-md p-3 ${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].text} flex items-center justify-between font-medium`}
            >
              <span>{STATUS_LABELS[status]}</span>
              <span className="rounded-full bg-white bg-opacity-90 px-2 py-0.5 text-xs">
                {applicationsByStatus[status].length}
              </span>
            </div>
            <div className="h-full min-h-72 rounded-b-md bg-gray-50 p-2">
              {applicationsByStatus[status].length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  No applications
                </div>
              ) : (
                <div className="space-y-2">
                  {applicationsByStatus[status].map((app) => (
                    <div
                      key={app.id}
                      className="cursor-pointer rounded border border-gray-200 bg-white p-3 shadow-xs transition-shadow hover:shadow"
                      onClick={() => toggleApplicationDetails(app.id)}
                    >
                      <div className="mb-1 font-medium text-blue-700">
                        {app.jobTitle}
                      </div>
                      <div className="mb-2 text-sm text-gray-700">
                        {app.company}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {app.appliedDate
                            ? formatDate(app.appliedDate, "short")
                            : "Not applied"}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(app);
                            }}
                            className="rounded-full p-1 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit Application"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Status change buttons */}
                      <div className="mt-3 grid grid-cols-2 gap-1 border-t border-gray-100 pt-2 text-xs">
                        {status === "saved" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(app.id, "applied");
                            }}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                          >
                            Mark Applied
                          </button>
                        )}
                        {status === "applied" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(app.id, "interviewing");
                            }}
                            className="rounded p-1 text-amber-600 hover:bg-amber-50"
                          >
                            Got Interview
                          </button>
                        )}
                        {status === "interviewing" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(app.id, "offer");
                            }}
                            className="rounded p-1 text-purple-600 hover:bg-purple-50"
                          >
                            Got Offer
                          </button>
                        )}
                        {status === "offer" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(app.id, "accepted");
                            }}
                            className="rounded p-1 text-green-600 hover:bg-green-50"
                          >
                            Accept Offer
                          </button>
                        )}
                        {(status === "applied" ||
                          status === "interviewing" ||
                          status === "offer") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(app.id, "rejected");
                            }}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                          >
                            Rejected
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render statistics view
  const renderStatsView = () => {
    return (
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-4 shadow-xs">
            <h3 className="mb-1 text-sm font-medium text-gray-500">
              Total Applications
            </h3>
            <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
            <p className="mt-1 text-sm text-gray-600">All time</p>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-xs">
            <h3 className="mb-1 text-sm font-medium text-gray-500">
              Active Applications
            </h3>
            <p className="text-3xl font-bold text-amber-600">
              {stats.activeCount}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Interviewing or received offers
            </p>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-xs">
            <h3 className="mb-1 text-sm font-medium text-gray-500">
              Response Rate
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats.responseRate}%
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Applications with feedback
            </p>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-xs">
            <h3 className="mb-1 text-sm font-medium text-gray-500">
              Success Rate
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {stats.successRate}%
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Applications with offers
            </p>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="rounded-lg border bg-white p-6 shadow-xs">
          <h3 className="mb-4 text-lg font-medium">
            Application Status Distribution
          </h3>
          <div className="flex h-8 overflow-hidden rounded-full">
            {APPLICATION_STATUSES.map((status) => {
              const count = stats.statusCounts[status] || 0;
              const percentage =
                stats.total > 0 ? (count / stats.total) * 100 : 0;

              if (percentage === 0) return null;

              return (
                <div
                  key={status}
                  className={`${STATUS_COLORS[status].bg} group relative cursor-pointer`}
                  style={{ width: `${percentage}%` }}
                  title={`${STATUS_LABELS[status]}: ${count} (${percentage.toFixed(1)}%)`}
                >
                  <div className="invisible absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full transform whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:visible">
                    {STATUS_LABELS[status]}: {count} ({percentage.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {APPLICATION_STATUSES.map((status) => {
              const count = stats.statusCounts[status] || 0;
              if (count === 0) return null;

              return (
                <div key={status} className="flex items-center text-sm">
                  <div
                    className={`mr-2 h-3 w-3 rounded-full ${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].border}`}
                  ></div>
                  <span className="text-gray-700">
                    {STATUS_LABELS[status]}:{" "}
                  </span>
                  <span className="ml-1 font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Activity */}
        <div className="rounded-lg border bg-white p-6 shadow-xs">
          <h3 className="mb-4 text-lg font-medium">Application Activity</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-500">
                Recent Activity
              </h4>

              {applications.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No application activity yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {applications
                    .sort(
                      (a, b) =>
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime(),
                    )
                    .slice(0, 5)
                    .map((app) => (
                      <div key={app.id} className="flex items-start">
                        <div
                          className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full ${STATUS_COLORS[app.status].bg}`}
                        >
                          {app.status === "applied" && (
                            <Briefcase className="h-4 w-4 text-blue-700" />
                          )}
                          {app.status === "interviewing" && (
                            <MessageCircle className="h-4 w-4 text-amber-700" />
                          )}
                          {app.status === "offer" && (
                            <FileText className="h-4 w-4 text-purple-700" />
                          )}
                          {app.status === "accepted" && (
                            <CheckCircle className="h-4 w-4 text-green-700" />
                          )}
                          {app.status === "rejected" && (
                            <XCircle className="h-4 w-4 text-red-700" />
                          )}
                          {app.status === "withdrawn" && (
                            <XCircle className="h-4 w-4 text-gray-700" />
                          )}
                          {app.status === "saved" && (
                            <Briefcase className="h-4 w-4 text-gray-700" />
                          )}
                        </div>

                        <div>
                          <p className="font-medium">
                            {app.jobTitle} at {app.company}
                          </p>
                          <p className="text-sm text-gray-500">
                            {app.lastStatusChangeDate
                              ? `Updated to ${STATUS_LABELS[app.status]} on ${formatDate(app.lastStatusChangeDate, "short")}`
                              : `Added on ${formatDate(app.createdAt, "short")}`}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-500">
                Application Insights
              </h4>

              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                  <span>
                    <strong>{stats.recentCount}</strong> applications in the
                    last 30 days
                  </span>
                </li>

                <li className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-blue-600" />
                  <span>
                    Average response time: <strong>14 days</strong>
                  </span>
                </li>

                {stats.statusCounts.interviewing > 0 && (
                  <li className="flex items-center">
                    <MessageCircle className="mr-2 h-4 w-4 text-amber-600" />
                    <span>
                      <strong>{stats.statusCounts.interviewing}</strong> active
                      interviews
                    </span>
                  </li>
                )}

                {stats.statusCounts.offer > 0 && (
                  <li className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-purple-600" />
                    <span>
                      <strong>{stats.statusCounts.offer}</strong> pending offers
                    </span>
                  </li>
                )}

                {stats.statusCounts.accepted > 0 && (
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    <span>
                      <strong>{stats.statusCounts.accepted}</strong> accepted
                      offers all time
                    </span>
                  </li>
                )}
              </ul>

              <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
                <h5 className="mb-1 font-medium">Quick Tip</h5>
                <p>
                  Track follow-ups to boost your response rate. Adding notes
                  after each interview helps prepare for future ones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render application form
  const renderApplicationForm = () => {
    return (
      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-xl font-semibold">
          {editingApplicationId ? "Edit Application" : "Add New Application"}
        </h3>

        {error && (
          <div className="mb-4 border-l-4 border-red-500 bg-red-50 p-3 text-red-700">
            <div className="flex">
              <AlertCircle className="mr-2 h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="jobTitle">
                Job Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                required
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div>
              <Label htmlFor="company">
                Company <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                placeholder="e.g., Acme Inc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., New York, NY"
              />
            </div>

            <div>
              <Label htmlFor="jobType">Job Type</Label>
              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="e.g., $120,000 - $150,000"
              />
            </div>

            <div>
              <Label htmlFor="appliedDate">Applied Date</Label>
              <Input
                id="appliedDate"
                name="appliedDate"
                type="date"
                value={formData.appliedDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="status">Application Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            {formData.status === "interviewing" && (
              <div>
                <Label htmlFor="interviewStage">Interview Stage</Label>
                <select
                  id="interviewStage"
                  name="interviewStage"
                  value={formData.interviewStage}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">Select stage</option>
                  {INTERVIEW_STAGES.map((stage) => (
                    <option key={stage} value={stage} className="capitalize">
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="resumeId">Resume Used</Label>
              <select
                id="resumeId"
                name="resumeId"
                value={formData.resumeId || ""}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select a resume</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title} ({resume.targetJobTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="jobDescriptionId">Job Description</Label>
              <select
                id="jobDescriptionId"
                name="jobDescriptionId"
                value={formData.jobDescriptionId || ""}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select a job description</option>
                {jobDescriptions.map((jd) => (
                  <option key={jd.id} value={jd.id}>
                    {jd.title} at {jd.company}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="nextStep">Next Step</Label>
              <Input
                id="nextStep"
                name="nextStep"
                value={formData.nextStep || ""}
                onChange={handleInputChange}
                placeholder="e.g., Technical Interview"
              />
            </div>

            <div>
              <Label htmlFor="nextStepDate">Next Step Date</Label>
              <Input
                id="nextStepDate"
                name="nextStepDate"
                type="date"
                value={formData.nextStepDate || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleInputChange}
              className="min-h-32 w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Add any notes about this application..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingApplicationId ? "Update Application" : "Add Application"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      {showTitle && (
        <div>
          <h1 className="text-2xl font-bold">Application Tracker</h1>
          <p className="text-gray-600">
            Track your job applications and monitor your progress
          </p>
        </div>
      )}

      {/* Controls and filters */}
      {!showForm && (
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">
              {/* Search icon */}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>

            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </div>
        </div>
      )}

      {/* Filter options */}
      {showFilters && !showForm && (
        <div className="space-y-4 rounded-md border bg-gray-50 p-4">
          <h3 className="mb-2 font-medium">Filter Applications</h3>

          {/* Status filter */}
          <div>
            <Label className="mb-2 block">Status</Label>
            <div className="flex flex-wrap gap-2">
              {APPLICATION_STATUSES.map((status) => (
                <button
                  key={status}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    filters.status?.includes(status)
                      ? `${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].text} ${STATUS_COLORS[status].border}`
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setFilters((prev) => {
                      const currentStatuses = prev.status || [];
                      const newStatuses = currentStatuses.includes(status)
                        ? currentStatuses.filter((s) => s !== status)
                        : [...currentStatuses, status];

                      return {
                        ...prev,
                        status:
                          newStatuses.length > 0 ? newStatuses : undefined,
                      };
                    });
                  }}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>

          {/* Date range filter */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="dateStart" className="mb-2 block">
                Start Date
              </Label>
              <Input
                id="dateStart"
                type="date"
                value={filters.dateRange?.start || ""}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      start: e.target.value || undefined,
                    },
                  }));
                }}
              />
            </div>

            <div>
              <Label htmlFor="dateEnd" className="mb-2 block">
                End Date
              </Label>
              <Input
                id="dateEnd"
                type="date"
                value={filters.dateRange?.end || ""}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      end: e.target.value || undefined,
                    },
                  }));
                }}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({});
                setSearchTerm("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Main content area */}
      {showForm ? (
        renderApplicationForm()
      ) : (
        <div>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "list" | "kanban" | "stats")
            }
          >
            <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              {loading ? (
                <div className="flex justify-center rounded-lg border bg-white p-12">
                  <div className="flex flex-col items-center">
                    <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-gray-600">Loading applications...</p>
                  </div>
                </div>
              ) : error && applications.length === 0 ? (
                <div className="rounded-lg border bg-white p-6">
                  <div className="mb-4 text-center text-red-600">
                    <AlertCircle className="mx-auto mb-2 h-10 w-10" />
                    <p>{error}</p>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={fetchApplications}>Try Again</Button>
                  </div>
                </div>
              ) : (
                renderListView()
              )}
            </TabsContent>

            <TabsContent value="kanban">
              {loading ? (
                <div className="flex justify-center rounded-lg border bg-white p-12">
                  <div className="flex flex-col items-center">
                    <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-gray-600">Loading applications...</p>
                  </div>
                </div>
              ) : error && applications.length === 0 ? (
                <div className="rounded-lg border bg-white p-6">
                  <div className="mb-4 text-center text-red-600">
                    <AlertCircle className="mx-auto mb-2 h-10 w-10" />
                    <p>{error}</p>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={fetchApplications}>Try Again</Button>
                  </div>
                </div>
              ) : (
                renderKanbanView()
              )}
            </TabsContent>

            <TabsContent value="stats">
              {loading ? (
                <div className="flex justify-center rounded-lg border bg-white p-12">
                  <div className="flex flex-col items-center">
                    <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-gray-600">Loading statistics...</p>
                  </div>
                </div>
              ) : error && applications.length === 0 ? (
                <div className="rounded-lg border bg-white p-6">
                  <div className="mb-4 text-center text-red-600">
                    <AlertCircle className="mx-auto mb-2 h-10 w-10" />
                    <p>{error}</p>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={fetchApplications}>Try Again</Button>
                  </div>
                </div>
              ) : (
                renderStatsView()
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
