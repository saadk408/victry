// File: /services/job-description-service.ts
import { createClient } from "@/lib/supabase/server";
import { JobDescription } from "@/models/job-description";
import {
  CreateJobDescriptionRequest,
  UpdateJobDescriptionRequest,
  JobDescriptionsResponse,
} from "@/types/api";

/**
 * Error class for job description service operations
 */
export class JobDescriptionError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "JobDescriptionError";
    this.code = code;
  }
}

/**
 * Fetch all job descriptions for the current user
 * Supports pagination, search, and sorting
 *
 * @param options Options for filtering, sorting, and pagination
 * @returns Promise resolving to an array of job descriptions and count
 */
export async function getJobDescriptions(
  options: {
    limit?: number;
    page?: number;
    search?: string;
    sortBy?: "created_at" | "updated_at" | "title" | "company";
    sortOrder?: "asc" | "desc";
  } = {},
): Promise<JobDescriptionsResponse> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new JobDescriptionError(
        userError?.message ||
          "Authentication required to fetch job descriptions",
        "auth_required",
      );
    }

    // Set up pagination
    const limit = Math.min(Math.max(1, options.limit || 20), 100); // Between 1 and 100, default 20
    const page = Math.max(1, options.page || 1); // At least 1
    const offset = (page - 1) * limit;

    // Set up sorting
    const sortBy: string = [
      "created_at",
      "updated_at",
      "title",
      "company",
    ].includes(options.sortBy || "")
      ? options.sortBy || "created_at"
      : "created_at";

    const sortOrder = options.sortOrder === "asc" ? true : false; // true for ascending

    // Start query
    let query = supabase
      .from("job_descriptions")
      .select("*, job_analysis(*)", { count: "exact" })
      .eq("user_id", user.id);

    // Add search filter if provided
    if (options.search) {
      const searchTerm = `%${options.search}%`;
      query = query.or(
        `title.ilike.${searchTerm},company.ilike.${searchTerm},content.ilike.${searchTerm}`,
      );
    }

    // Add sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder })
      .range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      throw new JobDescriptionError(
        `Failed to fetch job descriptions: ${error.message}`,
        error.code,
      );
    }

    // Transform the data to our model format
    const jobDescriptions: JobDescription[] = data.map((item) => ({
      id: item.id,
      userId: item.user_id,
      title: item.title,
      company: item.company,
      location: item.location,
      content: item.content,
      url: item.url || undefined,
      applicationDeadline: item.application_deadline || undefined,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      hasApplied: item.has_applied || undefined,
      applicationDate: item.application_date || undefined,
      applicationStatus: (item.application_status as any) || undefined,
      notes: item.notes || undefined,
      isFavorite: item.is_favorite || undefined,
      tags: item.tags || undefined,
      employmentType: (item.employment_type as any) || undefined,
      workplaceType: (item.workplace_type as any) || undefined,
      isActive: item.is_active !== null ? item.is_active : true,
      // Map job analysis if it exists
      analysis: item.job_analysis
        ? {
            id: item.job_analysis.id,
            jobDescriptionId: item.job_analysis.job_description_id,
            requirements: item.job_analysis.requirements,
            keywords: item.job_analysis.keywords,
            experienceLevel: item.job_analysis.experience_level,
            companyCulture: item.job_analysis.company_culture,
            createdAt: item.job_analysis.created_at,
            // Optional fields
            salaryRange: item.job_analysis.salary_range || undefined,
            industry: item.job_analysis.industry || undefined,
            department: item.job_analysis.department || undefined,
            employmentType:
              (item.job_analysis.employment_type as any) || undefined,
            remoteWork: (item.job_analysis.remote_work as any) || undefined,
            responsibilities: item.job_analysis.responsibilities || undefined,
            atsCompatibilityScore:
              item.job_analysis.ats_compatibility_score || undefined,
          }
        : undefined,
    }));

    return {
      data: jobDescriptions,
      count: count || 0,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: page < Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    if (error instanceof JobDescriptionError) {
      throw error;
    }
    throw new JobDescriptionError(
      `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      "unknown_error",
    );
  }
}

/**
 * Fetch a job description by ID
 *
 * @param id Job description ID
 * @returns Promise resolving to the job description or null if not found
 */
export async function getJobDescriptionById(
  id: string,
): Promise<JobDescription | null> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new JobDescriptionError(
        userError?.message ||
          "Authentication required to fetch job description",
        "auth_required",
      );
    }

    // Fetch the job description with its analysis
    const { data, error } = await supabase
      .from("job_descriptions")
      .select("*, job_analysis(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new JobDescriptionError(
        `Failed to fetch job description: ${error.message}`,
        error.code,
      );
    }

    if (!data) {
      return null;
    }

    // Transform to our model
    const jobDescription: JobDescription = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      company: data.company,
      location: data.location,
      content: data.content,
      url: data.url || undefined,
      applicationDeadline: data.application_deadline || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      hasApplied: data.has_applied || undefined,
      applicationDate: data.application_date || undefined,
      applicationStatus: (data.application_status as any) || undefined,
      notes: data.notes || undefined,
      isFavorite: data.is_favorite || undefined,
      tags: data.tags || undefined,
      employmentType: (data.employment_type as any) || undefined,
      workplaceType: (data.workplace_type as any) || undefined,
      isActive: data.is_active !== null ? data.is_active : true,
      // Map job analysis if it exists
      analysis: data.job_analysis
        ? {
            id: data.job_analysis.id,
            jobDescriptionId: data.job_analysis.job_description_id,
            requirements: data.job_analysis.requirements,
            keywords: data.job_analysis.keywords,
            experienceLevel: data.job_analysis.experience_level,
            companyCulture: data.job_analysis.company_culture,
            createdAt: data.job_analysis.created_at,
            // Optional fields
            salaryRange: data.job_analysis.salary_range || undefined,
            industry: data.job_analysis.industry || undefined,
            department: data.job_analysis.department || undefined,
            employmentType:
              (data.job_analysis.employment_type as any) || undefined,
            remoteWork: (data.job_analysis.remote_work as any) || undefined,
            responsibilities: data.job_analysis.responsibilities || undefined,
            atsCompatibilityScore:
              data.job_analysis.ats_compatibility_score || undefined,
          }
        : undefined,
    };

    return jobDescription;
  } catch (error) {
    if (error instanceof JobDescriptionError) {
      throw error;
    }
    throw new JobDescriptionError(
      `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      "unknown_error",
    );
  }
}

/**
 * Create a new job description
 *
 * @param data Job description data
 * @returns Promise resolving to the created job description
 */
export async function createJobDescription(
  data: CreateJobDescriptionRequest,
): Promise<JobDescription> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new JobDescriptionError(
        userError?.message ||
          "Authentication required to create job description",
        "auth_required",
      );
    }

    // Validate required fields
    if (!data.title || !data.company || !data.content) {
      throw new JobDescriptionError(
        "Title, company, and content are required",
        "validation_error",
      );
    }

    // Prepare data for insertion
    const now = new Date().toISOString();
    const jobDescriptionData = {
      user_id: user.id,
      title: data.title,
      company: data.company,
      location: data.location || "",
      content: data.content,
      url: data.url || null,
      application_deadline: data.applicationDeadline || null,
      created_at: now,
      updated_at: now,
      has_applied: data.hasApplied || false,
      application_date: data.applicationDate || null,
      application_status: data.applicationStatus || "not_applied",
      notes: data.notes || null,
      is_favorite: data.isFavorite || false,
      tags: data.tags || [],
      employment_type: data.employmentType || null,
      workplace_type: data.workplaceType || null,
      is_active: data.isActive !== undefined ? data.isActive : true,
    };

    // Insert into database
    const { data: insertedData, error } = await supabase
      .from("job_descriptions")
      .insert(jobDescriptionData)
      .select()
      .single();

    if (error) {
      throw new JobDescriptionError(
        `Failed to create job description: ${error.message}`,
        error.code,
      );
    }

    if (!insertedData) {
      throw new JobDescriptionError(
        "Failed to create job description: No data returned",
        "insertion_error",
      );
    }

    // Transform to our model
    const jobDescription: JobDescription = {
      id: insertedData.id,
      userId: insertedData.user_id,
      title: insertedData.title,
      company: insertedData.company,
      location: insertedData.location,
      content: insertedData.content,
      url: insertedData.url || undefined,
      applicationDeadline: insertedData.application_deadline || undefined,
      createdAt: insertedData.created_at,
      updatedAt: insertedData.updated_at,
      hasApplied: insertedData.has_applied || undefined,
      applicationDate: insertedData.application_date || undefined,
      applicationStatus: (insertedData.application_status as any) || undefined,
      notes: insertedData.notes || undefined,
      isFavorite: insertedData.is_favorite || undefined,
      tags: insertedData.tags || undefined,
      employmentType: (insertedData.employment_type as any) || undefined,
      workplaceType: (insertedData.workplace_type as any) || undefined,
      isActive: insertedData.is_active !== null ? insertedData.is_active : true,
    };

    // Track analytics event (optional, implement if analytics service exists)
    try {
      // Example: await analytics.trackEvent('job_description_created', { userId: user.id });
    } catch (analyticsError) {
      // Log but don't fail if analytics tracking fails
      console.error(
        "Failed to track job description creation:",
        analyticsError,
      );
    }

    return jobDescription;
  } catch (error) {
    if (error instanceof JobDescriptionError) {
      throw error;
    }
    throw new JobDescriptionError(
      `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      "unknown_error",
    );
  }
}

/**
 * Update an existing job description
 *
 * @param id Job description ID
 * @param data Updated job description data
 * @returns Promise resolving to the updated job description
 */
export async function updateJobDescription(
  id: string,
  data: UpdateJobDescriptionRequest,
): Promise<JobDescription> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new JobDescriptionError(
        userError?.message ||
          "Authentication required to update job description",
        "auth_required",
      );
    }

    // Check if job description exists and belongs to user
    const { data: existingData, error: fetchError } = await supabase
      .from("job_descriptions")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        throw new JobDescriptionError(
          "Job description not found or you do not have permission to update it",
          "not_found",
        );
      }
      throw new JobDescriptionError(
        `Failed to fetch job description: ${fetchError.message}`,
        fetchError.code,
      );
    }

    // Prepare data for update
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that are provided
    if (data.title !== undefined) updateData.title = data.title;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.applicationDeadline !== undefined)
      updateData.application_deadline = data.applicationDeadline;
    if (data.hasApplied !== undefined) updateData.has_applied = data.hasApplied;
    if (data.applicationDate !== undefined)
      updateData.application_date = data.applicationDate;
    if (data.applicationStatus !== undefined)
      updateData.application_status = data.applicationStatus;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.isFavorite !== undefined) updateData.is_favorite = data.isFavorite;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.employmentType !== undefined)
      updateData.employment_type = data.employmentType;
    if (data.workplaceType !== undefined)
      updateData.workplace_type = data.workplaceType;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    // Update the job description
    const { data: updatedData, error: updateError } = await supabase
      .from("job_descriptions")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*, job_analysis(*)")
      .single();

    if (updateError) {
      throw new JobDescriptionError(
        `Failed to update job description: ${updateError.message}`,
        updateError.code,
      );
    }

    if (!updatedData) {
      throw new JobDescriptionError(
        "Failed to update job description: No data returned",
        "update_error",
      );
    }

    // Transform to our model
    const jobDescription: JobDescription = {
      id: updatedData.id,
      userId: updatedData.user_id,
      title: updatedData.title,
      company: updatedData.company,
      location: updatedData.location,
      content: updatedData.content,
      url: updatedData.url || undefined,
      applicationDeadline: updatedData.application_deadline || undefined,
      createdAt: updatedData.created_at,
      updatedAt: updatedData.updated_at,
      hasApplied: updatedData.has_applied || undefined,
      applicationDate: updatedData.application_date || undefined,
      applicationStatus: (updatedData.application_status as any) || undefined,
      notes: updatedData.notes || undefined,
      isFavorite: updatedData.is_favorite || undefined,
      tags: updatedData.tags || undefined,
      employmentType: (updatedData.employment_type as any) || undefined,
      workplaceType: (updatedData.workplace_type as any) || undefined,
      isActive: updatedData.is_active !== null ? updatedData.is_active : true,
      // Map job analysis if it exists
      analysis: updatedData.job_analysis
        ? {
            id: updatedData.job_analysis.id,
            jobDescriptionId: updatedData.job_analysis.job_description_id,
            requirements: updatedData.job_analysis.requirements,
            keywords: updatedData.job_analysis.keywords,
            experienceLevel: updatedData.job_analysis.experience_level,
            companyCulture: updatedData.job_analysis.company_culture,
            createdAt: updatedData.job_analysis.created_at,
            // Optional fields
            salaryRange: updatedData.job_analysis.salary_range || undefined,
            industry: updatedData.job_analysis.industry || undefined,
            department: updatedData.job_analysis.department || undefined,
            employmentType:
              (updatedData.job_analysis.employment_type as any) || undefined,
            remoteWork:
              (updatedData.job_analysis.remote_work as any) || undefined,
            responsibilities:
              updatedData.job_analysis.responsibilities || undefined,
            atsCompatibilityScore:
              updatedData.job_analysis.ats_compatibility_score || undefined,
          }
        : undefined,
    };

    return jobDescription;
  } catch (error) {
    if (error instanceof JobDescriptionError) {
      throw error;
    }
    throw new JobDescriptionError(
      `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      "unknown_error",
    );
  }
}

/**
 * Delete a job description
 *
 * @param id Job description ID
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteJobDescription(id: string): Promise<void> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new JobDescriptionError(
        userError?.message ||
          "Authentication required to delete job description",
        "auth_required",
      );
    }

    // Check if job description exists and belongs to user
    const { data: existingData, error: fetchError } = await supabase
      .from("job_descriptions")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        throw new JobDescriptionError(
          "Job description not found or you do not have permission to delete it",
          "not_found",
        );
      }
      throw new JobDescriptionError(
        `Failed to fetch job description: ${fetchError.message}`,
        fetchError.code,
      );
    }

    // Delete the job description
    // Note: Job analysis should be automatically deleted via cascade in the database
    const { error: deleteError } = await supabase
      .from("job_descriptions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      throw new JobDescriptionError(
        `Failed to delete job description: ${deleteError.message}`,
        deleteError.code,
      );
    }

    // Track analytics event (optional, implement if analytics service exists)
    try {
      // Example: await analytics.trackEvent('job_description_deleted', { userId: user.id });
    } catch (analyticsError) {
      // Log but don't fail if analytics tracking fails
      console.error(
        "Failed to track job description deletion:",
        analyticsError,
      );
    }
  } catch (error) {
    if (error instanceof JobDescriptionError) {
      throw error;
    }
    throw new JobDescriptionError(
      `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      "unknown_error",
    );
  }
}

/**
 * Search for job descriptions with more advanced filtering options
 *
 * @param options Advanced search and filter options
 * @returns Promise resolving to job descriptions that match the criteria
 */
export async function searchJobDescriptions(
  options: {
    searchTerm?: string;
    company?: string;
    location?: string;
    applicationStatus?: string[];
    dateRange?: { from?: string; to?: string };
    isFavorite?: boolean;
    tags?: string[];
    employmentType?: string[];
    workplaceType?: string[];
    isActive?: boolean;
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {},
): Promise<JobDescriptionsResponse> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new JobDescriptionError(
        userError?.message ||
          "Authentication required to search job descriptions",
        "auth_required",
      );
    }

    // Set up pagination
    const limit = Math.min(Math.max(1, options.limit || 20), 100); // Between 1 and 100, default 20
    const page = Math.max(1, options.page || 1); // At least 1
    const offset = (page - 1) * limit;

    // Start query
    let query = supabase
      .from("job_descriptions")
      .select("*, job_analysis(*)", { count: "exact" })
      .eq("user_id", user.id);

    // Apply filters
    if (options.searchTerm) {
      const searchTerm = `%${options.searchTerm}%`;
      query = query.or(
        `title.ilike.${searchTerm},company.ilike.${searchTerm},content.ilike.${searchTerm}`,
      );
    }

    if (options.company) {
      query = query.ilike("company", `%${options.company}%`);
    }

    if (options.location) {
      query = query.ilike("location", `%${options.location}%`);
    }

    if (options.applicationStatus && options.applicationStatus.length > 0) {
      query = query.in("application_status", options.applicationStatus);
    }

    if (options.dateRange) {
      if (options.dateRange.from) {
        query = query.gte("created_at", options.dateRange.from);
      }
      if (options.dateRange.to) {
        query = query.lte("created_at", options.dateRange.to);
      }
    }

    if (options.isFavorite !== undefined) {
      query = query.eq("is_favorite", options.isFavorite);
    }

    if (options.tags && options.tags.length > 0) {
      query = query.contains("tags", options.tags);
    }

    if (options.employmentType && options.employmentType.length > 0) {
      query = query.in("employment_type", options.employmentType);
    }

    if (options.workplaceType && options.workplaceType.length > 0) {
      query = query.in("workplace_type", options.workplaceType);
    }

    if (options.isActive !== undefined) {
      query = query.eq("is_active", options.isActive);
    }

    // Add sorting
    const validSortFields = [
      "created_at",
      "updated_at",
      "title",
      "company",
      "application_deadline",
    ];
    const sortBy: string = validSortFields.includes(options.sortBy || "")
      ? options.sortBy || "created_at"
      : "created_at";

    const sortOrder = options.sortOrder === "asc" ? true : false; // true for ascending

    query = query
      .order(sortBy as any, { ascending: sortOrder })
      .range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      throw new JobDescriptionError(
        `Failed to search job descriptions: ${error.message}`,
        error.code,
      );
    }

    // Transform the data to our model format
    const jobDescriptions: JobDescription[] = data.map((item) => ({
      id: item.id,
      userId: item.user_id,
      title: item.title,
      company: item.company,
      location: item.location,
      content: item.content,
      url: item.url || undefined,
      applicationDeadline: item.application_deadline || undefined,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      hasApplied: item.has_applied || undefined,
      applicationDate: item.application_date || undefined,
      applicationStatus: (item.application_status as any) || undefined,
      notes: item.notes || undefined,
      isFavorite: item.is_favorite || undefined,
      tags: item.tags || undefined,
      employmentType: (item.employment_type as any) || undefined,
      workplaceType: (item.workplace_type as any) || undefined,
      isActive: item.is_active !== null ? item.is_active : true,
      // Map job analysis if it exists
      analysis: item.job_analysis
        ? {
            id: item.job_analysis.id,
            jobDescriptionId: item.job_analysis.job_description_id,
            requirements: item.job_analysis.requirements,
            keywords: item.job_analysis.keywords,
            experienceLevel: item.job_analysis.experience_level,
            companyCulture: item.job_analysis.company_culture,
            createdAt: item.job_analysis.created_at,
            // Optional fields
            salaryRange: item.job_analysis.salary_range || undefined,
            industry: item.job_analysis.industry || undefined,
            department: item.job_analysis.department || undefined,
            employmentType:
              (item.job_analysis.employment_type as any) || undefined,
            remoteWork: (item.job_analysis.remote_work as any) || undefined,
            responsibilities: item.job_analysis.responsibilities || undefined,
            atsCompatibilityScore:
              item.job_analysis.ats_compatibility_score || undefined,
          }
        : undefined,
    }));

    return {
      data: jobDescriptions,
      count: count || 0,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: page < Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    if (error instanceof JobDescriptionError) {
      throw error;
    }
    throw new JobDescriptionError(
      `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      "unknown_error",
    );
  }
}

/**
 * Update the application status for a job description
 *
 * @param id Job description ID
 * @param status New application status
 * @param notes Optional notes about the application status
 * @param applicationDate Optional application date
 * @returns Promise resolving to the updated job description
 */
export async function updateApplicationStatus(
  id: string,
  status:
    | "not_applied"
    | "applied"
    | "interviewing"
    | "offered"
    | "rejected"
    | "accepted"
    | "declined",
  notes?: string,
  applicationDate?: string,
): Promise<JobDescription> {
  try {
    const hasApplied = status !== "not_applied";
    const updateData: UpdateJobDescriptionRequest = {
      applicationStatus: status,
      hasApplied,
      notes,
    };

    // If application date is provided or status is changing to applied
    if (applicationDate) {
      updateData.applicationDate = applicationDate;
    } else if (status === "applied" && !applicationDate) {
      // Auto-set application date to today if not provided
      updateData.applicationDate = new Date().toISOString();
    }

    return updateJobDescription(id, updateData);
  } catch (error) {
    if (error instanceof JobDescriptionError) {
      throw error;
    }
    throw new JobDescriptionError(
      `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      "unknown_error",
    );
  }
}

/**
 * Toggle favorite status for a job description
 *
 * @param id Job description ID
 * @param isFavorite Whether the job should be marked as favorite
 * @returns Promise resolving to the updated job description
 */
export async function toggleFavorite(
  id: string,
  isFavorite: boolean,
): Promise<JobDescription> {
  return updateJobDescription(id, { isFavorite });
}

/**
 * Add or remove tags for a job description
 *
 * @param id Job description ID
 * @param tags New tags array
 * @returns Promise resolving to the updated job description
 */
export async function updateTags(
  id: string,
  tags: string[],
): Promise<JobDescription> {
  return updateJobDescription(id, { tags });
}
