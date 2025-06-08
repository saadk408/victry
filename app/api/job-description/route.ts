// File: /app/api/job-description/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createActionClient } from "@/lib/supabase/client";
import { cookies } from "next/headers";
import {
  CreateJobDescriptionRequest,
  JobDescriptionResponse,
  JobDescriptionsResponse,
} from "@/types/api";
import { Database } from "@/types/supabase"; // Import Database type

/**
 * Validates job description data before saving to database
 * @param data Job description data to validate
 * @returns Object containing validation result and optional error message
 */
function validateJobDescription(data: CreateJobDescriptionRequest): {
  valid: boolean;
  error?: string;
} {
  if (!data.title || data.title.trim() === "") {
    return { valid: false, error: "Job title is required" };
  }

  if (!data.company || data.company.trim() === "") {
    return { valid: false, error: "Company name is required" };
  }

  if (!data.content || data.content.trim() === "") {
    return { valid: false, error: "Job description content is required" };
  }

  return { valid: true };
}

// Type alias for Job Description table columns for sorting
type JobDescriptionSortableColumns =
  keyof Database["public"]["Tables"]["job_descriptions"]["Row"];

/**
 * POST /api/job-description - Save a job description
 * Creates a new job description in the database
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createActionClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse request body
    const data: CreateJobDescriptionRequest = await request.json();

    // Validate job description data
    const validation = validateJobDescription(data);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Get current timestamp
    const now = new Date().toISOString();

    // Create job description in database
    const { data: jobDescription, error } = await supabase
      .from("job_descriptions")
      .insert({
        user_id: session.user.id,
        title: data.title,
        company: data.company,
        location: data.location || "",
        content: data.content,
        url: data.url || null,
        application_deadline: data.applicationDeadline || null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving job description:", error);
      return NextResponse.json(
        { error: "Failed to save job description" },
        { status: 500 },
      );
    }

    // Transform database record to API response format
    const response: JobDescriptionResponse = {
      id: jobDescription.id,
      userId: jobDescription.user_id,
      title: jobDescription.title,
      company: jobDescription.company,
      location: jobDescription.location,
      content: jobDescription.content,
      url: jobDescription.url,
      applicationDeadline: jobDescription.application_deadline,
      createdAt: jobDescription.created_at,
      updatedAt: jobDescription.updated_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unexpected error in job description API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/job-description - Get all job descriptions for the current user
 * Supports pagination, search, and sorting
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createActionClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const page = parseInt(url.searchParams.get("page") || "1");
    const search = url.searchParams.get("search") || "";
    const sortBy = url.searchParams.get("sortBy") || "created_at";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";

    // Validate pagination parameters
    const validatedLimit = Math.min(Math.max(1, limit), 100); // Between 1 and 100
    const validatedPage = Math.max(1, page); // At least 1
    const offset = (validatedPage - 1) * validatedLimit;

    // Validate sorting parameters
    const allowedSortFields: JobDescriptionSortableColumns[] = [
      "created_at",
      "updated_at",
      "title",
      "company",
      // Add other sortable columns as needed, ensuring they exist in the Row type
    ];
    let validatedSortBy: JobDescriptionSortableColumns = "created_at"; // Default value
    if (allowedSortFields.includes(sortBy as JobDescriptionSortableColumns)) {
      validatedSortBy = sortBy as JobDescriptionSortableColumns;
    }

    const validatedSortOrder = ["asc", "desc"].includes(sortOrder)
      ? sortOrder
      : "desc";

    // Start building the query
    let query = supabase
      .from("job_descriptions")
      .select("*", { count: "exact" })
      .eq("user_id", session.user.id);

    // Add search filter if provided
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,content.ilike.%${search}%,company.ilike.%${search}%`,
      );
    }

    // Add sorting and pagination (using validated and typed sort field)
    query = query
      .order(validatedSortBy, {
        // No longer needs 'as any'
        ascending: validatedSortOrder === "asc",
      })
      .range(offset, offset + validatedLimit - 1);

    // Execute the query
    const { data: jobDescriptions, error, count } = await query;

    if (error) {
      console.error("Error fetching job descriptions:", error);
      return NextResponse.json(
        { error: "Failed to fetch job descriptions" },
        { status: 500 },
      );
    }

    // Transform database records to API response format
    const transformedData = jobDescriptions.map((jd) => ({
      id: jd.id,
      userId: jd.user_id,
      title: jd.title,
      company: jd.company,
      location: jd.location,
      content: jd.content,
      url: jd.url ?? undefined,
      applicationDeadline: jd.application_deadline ?? undefined,
      createdAt: jd.created_at,
      updatedAt: jd.updated_at,
    }));

    // Prepare pagination metadata
    const totalPages = Math.ceil((count || 0) / validatedLimit);

    const response: JobDescriptionsResponse = {
      data: transformedData,
      count: count || 0,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        totalPages,
        hasMore: validatedPage < totalPages,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unexpected error in job description API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
