// File: /app/_lib/hooks/use-job-description.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { type JobDescription } from "@/models/job-description";

/**
 * Hook for managing a job description
 * Handles fetching, updating, and state management for job descriptions
 *
 * @param id - Optional job description ID to fetch
 */
export function useJobDescription(id?: string) {
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  /**
   * Fetch a job description by ID
   */
  const fetchJobDescription = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Get the current user's ID for permission checking
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to access job descriptions");
      }

      // Fetch the job description with its analysis
      const { data, error: fetchError } = await supabase
        .from("job_descriptions")
        .select(
          `
          *,
          analysis:job_analysis(*)
        `,
        )
        .eq("id", id)
        .eq("userId", user.id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!data) {
        throw new Error("Job description not found");
      }

      setJobDescription(data as JobDescription);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch job description"),
      );
      console.error("Error fetching job description:", err);
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  /**
   * Update a job description
   *
   * @param updates - Partial job description object with fields to update
   */
  const updateJobDescription = async (
    updates: Partial<
      Omit<
        JobDescription,
        "id" | "userId" | "createdAt" | "updatedAt" | "analysis"
      >
    >,
  ) => {
    if (!id || !jobDescription) {
      throw new Error("No job description loaded to update");
    }

    try {
      setLoading(true);
      setError(null);

      // Get the current user's ID for permission checking
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to update job descriptions");
      }

      // Ensure the user owns this job description
      if (jobDescription.userId !== user.id) {
        throw new Error(
          "You do not have permission to update this job description",
        );
      }

      // Update the job description
      const { data, error: updateError } = await supabase
        .from("job_descriptions")
        .update({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("userId", user.id)
        .select(
          `
          *,
          analysis:job_analysis(*)
        `,
        )
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      setJobDescription(data as JobDescription);
      return data as JobDescription;
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to update job description"),
      );
      console.error("Error updating job description:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a job description
   */
  const deleteJobDescription = async () => {
    if (!id || !jobDescription) {
      throw new Error("No job description loaded to delete");
    }

    try {
      setLoading(true);
      setError(null);

      // Get the current user's ID for permission checking
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to delete job descriptions");
      }

      // Ensure the user owns this job description
      if (jobDescription.userId !== user.id) {
        throw new Error(
          "You do not have permission to delete this job description",
        );
      }

      // First delete any related analysis
      if (jobDescription.analysis?.id) {
        const { error: analysisDeleteError } = await supabase
          .from("job_analysis")
          .delete()
          .eq("id", jobDescription.analysis.id)
          .eq("jobDescriptionId", id);

        if (analysisDeleteError) {
          throw new Error(
            `Failed to delete job analysis: ${analysisDeleteError.message}`,
          );
        }
      }

      // Delete the job description
      const { error: deleteError } = await supabase
        .from("job_descriptions")
        .delete()
        .eq("id", id)
        .eq("userId", user.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      setJobDescription(null);
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to delete job description"),
      );
      console.error("Error deleting job description:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Analyze the job description using Claude API
   * This triggers the AI analysis process for the job description
   */
  const analyzeJobDescription = async () => {
    if (!id || !jobDescription) {
      throw new Error("No job description loaded to analyze");
    }

    try {
      setLoading(true);
      setError(null);

      // Call our API endpoint for job analysis
      const response = await fetch(`/api/ai/analyze-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDescriptionId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to analyze job description",
        );
      }

      const data = await response.json();

      // Update our local state with the analysis results
      setJobDescription((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          analysis: data.analysis,
        };
      });

      return data.analysis;
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to analyze job description"),
      );
      console.error("Error analyzing job description:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch job description on mount or when ID changes
  useEffect(() => {
    if (!id) {
      setJobDescription(null);
      setLoading(false);
      return;
    }

    fetchJobDescription();
  }, [id, fetchJobDescription]);

  return {
    jobDescription,
    loading,
    error,
    updateJobDescription,
    deleteJobDescription,
    analyzeJobDescription,
    refreshJobDescription: fetchJobDescription,
  };
}
