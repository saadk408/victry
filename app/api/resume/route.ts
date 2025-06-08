// File: /app/api/resume/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createActionClient } from "@/lib/supabase/client";
import { cookies } from "next/headers";
import {
  CreateResumeRequest,
  ResumesResponse,
  ResumeResponse,
} from "@/types/api";
import {
  Education,
  Resume,
  Skill,
  WorkExperience,
  Project,
  Certification,
  SocialLink,
  CustomSection,
} from "@/types/resume";
import { Database } from "@/types/supabase";

// Type aliases for Rows (as defined in use-resume.ts previously)
type ResumeRow = Database["public"]["Tables"]["resumes"]["Row"];
type PersonalInfoRow = Database["public"]["Tables"]["personal_info"]["Row"];
type ProfessionalSummaryRow =
  Database["public"]["Tables"]["professional_summary"]["Row"];
type WorkExperienceRow =
  Database["public"]["Tables"]["work_experiences"]["Row"];
type EducationRow = Database["public"]["Tables"]["education"]["Row"];
type SkillRow = Database["public"]["Tables"]["skills"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type CertificationRow = Database["public"]["Tables"]["certifications"]["Row"];
type SocialLinkRow = Database["public"]["Tables"]["social_links"]["Row"];
type CustomSectionRow = Database["public"]["Tables"]["custom_sections"]["Row"];
// Assuming CustomSectionEntryRow is defined similarly if needed

// Type alias for Skill level union
type SkillLevel = Skill["level"]; // "beginner" | "intermediate" | "advanced" | "expert" | undefined

// Flexible type for Supabase query result - relations are unknown
type DbResumeData = ResumeRow & {
  personal_info?: unknown;
  professional_summary?: unknown;
  work_experiences?: unknown;
  education?: unknown;
  skills?: unknown;
  projects?: unknown;
  certifications?: unknown;
  social_links?: unknown;
  custom_sections?: unknown;
};

// Helper function to map skill level string to SkillLevel type
function mapSkillLevel(levelStr: string | null | undefined): SkillLevel {
  const lowerLevel = levelStr?.toLowerCase();
  if (
    lowerLevel === "beginner" ||
    lowerLevel === "intermediate" ||
    lowerLevel === "advanced" ||
    lowerLevel === "expert"
  ) {
    return lowerLevel as SkillLevel; // Assert after validation
  }
  return undefined; // Default to undefined if invalid or null
}

/**
 * Validates resume data before saving to database
 */
function validateResumeData(data: CreateResumeRequest): {
  valid: boolean;
  error?: string;
} {
  if (!data.title || data.title.trim() === "") {
    return { valid: false, error: "Resume title is required" };
  }

  if (!data.targetJobTitle || data.targetJobTitle.trim() === "") {
    return { valid: false, error: "Target job title is required" };
  }

  if (!data.templateId || data.templateId.trim() === "") {
    return { valid: false, error: "Template ID is required" };
  }

  if (
    !data.personalInfo ||
    !data.personalInfo.fullName ||
    data.personalInfo.fullName.trim() === ""
  ) {
    return { valid: false, error: "Full name is required" };
  }

  return { valid: true };
}

/**
 * Transforms a database resume record to the API response format
 */
function transformDatabaseResumeToApiFormat(
  dbResume: DbResumeData,
  includeRelated: boolean = true,
): Resume {
  // Type guard to check if data is a valid array of a specific Row type
  // This is a basic check; more robust checks might be needed depending on data
  function isRowArray<T>(
    data: unknown,
    checkFn: (item: unknown) => item is T,
  ): data is T[] {
    return Array.isArray(data) && data.every(checkFn);
  }

  // Simple check functions (adjust property checks as needed for required fields)
  const isPersonalInfoRow = (item: unknown): item is PersonalInfoRow =>
    typeof item === "object" &&
    item !== null &&
    typeof (item as PersonalInfoRow).full_name === "string";
  const isProfessionalSummaryRow = (
    item: unknown,
  ): item is ProfessionalSummaryRow =>
    typeof item === "object" &&
    item !== null &&
    typeof (item as ProfessionalSummaryRow).content === "string";
  const isWorkExperienceRow = (item: unknown): item is WorkExperienceRow =>
    typeof item === "object" &&
    item !== null &&
    typeof (item as WorkExperienceRow).company === "string";
  const isEducationRow = (item: unknown): item is EducationRow =>
    typeof item === "object" &&
    item !== null &&
    typeof (item as EducationRow).institution === "string";
  const isSkillRow = (item: unknown): item is SkillRow =>
    typeof item === "object" &&
    item !== null &&
    typeof (item as SkillRow).name === "string";
  const isProjectRow = (item: unknown): item is ProjectRow =>
    typeof item === "object" &&
    item !== null &&
    typeof (item as ProjectRow).name === "string";
  const isCertificationRow = (item: unknown): item is CertificationRow =>
    typeof item === "object" &&
    item !== null &&
    typeof (item as CertificationRow).name === "string";
  const isSocialLinkRow = (item: unknown): item is SocialLinkRow =>
    typeof item === "object" &&
    item !== null &&
    typeof (item as SocialLinkRow).platform === "string";
  const isCustomSectionRow = (item: unknown): item is CustomSectionRow =>
    typeof item === "object" &&
    item !== null &&
    typeof (item as CustomSectionRow).title === "string";

  // Get related data with type checking
  const personalInfoRows = isRowArray(dbResume.personal_info, isPersonalInfoRow)
    ? dbResume.personal_info
    : [];
  const summaryRows = isRowArray(
    dbResume.professional_summary,
    isProfessionalSummaryRow,
  )
    ? dbResume.professional_summary
    : [];
  const workExperienceRows = isRowArray(
    dbResume.work_experiences,
    isWorkExperienceRow,
  )
    ? dbResume.work_experiences
    : [];
  const educationRows = isRowArray(dbResume.education, isEducationRow)
    ? dbResume.education
    : [];
  const skillRows = isRowArray(dbResume.skills, isSkillRow)
    ? dbResume.skills
    : [];
  const projectRows = isRowArray(dbResume.projects, isProjectRow)
    ? dbResume.projects
    : [];
  const certificationRows = isRowArray(
    dbResume.certifications,
    isCertificationRow,
  )
    ? dbResume.certifications
    : [];
  const socialLinkRows = isRowArray(dbResume.social_links, isSocialLinkRow)
    ? dbResume.social_links
    : [];
  const customSectionRows = isRowArray(
    dbResume.custom_sections,
    isCustomSectionRow,
  )
    ? dbResume.custom_sections
    : [];

  const personalInfoData =
    includeRelated && personalInfoRows.length > 0 ? personalInfoRows[0] : null;
  const summaryData =
    includeRelated && summaryRows.length > 0 ? summaryRows[0] : null;

  const resume: Resume = {
    id: dbResume.id,
    userId: dbResume.user_id,
    title: dbResume.title,
    targetJobTitle: dbResume.target_job_title ?? "", // Default if null
    createdAt: dbResume.created_at,
    updatedAt: dbResume.updated_at,
    templateId: dbResume.template_id ?? "default",

    personalInfo: personalInfoData
      ? {
          // Map snake_case fields from Row type to camelCase in Resume type
          fullName: personalInfoData.full_name,
          email: personalInfoData.email,
          phone: personalInfoData.phone,
          location: personalInfoData.location,
          linkedIn: personalInfoData.linkedin ?? undefined,
          website: personalInfoData.website ?? undefined,
          github: personalInfoData.github ?? undefined,
          // additionalInfo: personalInfoData.additional_info ?? undefined, // Assuming mapping needed
        }
      : { fullName: "", email: "", phone: "", location: "" }, // Default

    professionalSummary: summaryData
      ? { content: summaryData.content }
      : { content: "" }, // Default

    // Map arrays, converting snake_case if necessary (Resume type uses camelCase)
    workExperiences: includeRelated
      ? workExperienceRows.map((exp) => ({
          id: exp.id,
          company: exp.company,
          position: exp.position,
          location: exp.location,
          startDate: exp.start_date,
          endDate: exp.end_date,
          current: exp.current,
          highlights: exp.highlights || [],
          description: exp.description ?? undefined,
          industry: exp.industry ?? undefined,
          department: exp.department ?? undefined,
        }))
      : [],

    education: includeRelated
      ? educationRows.map((edu) => ({
          id: edu.id,
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          location: edu.location,
          startDate: edu.start_date,
          endDate: edu.end_date,
          current: edu.current,
          gpa: edu.gpa ?? undefined,
          highlights: edu.highlights || [],
          honors: edu.honors ?? undefined,
          thesis: edu.thesis ?? undefined,
        }))
      : [],

    skills: includeRelated
      ? skillRows.map((skill) => ({
          id: skill.id,
          name: skill.name,
          level: mapSkillLevel(skill.level),
          category: skill.category ?? undefined,
          yearsOfExperience: skill.years_of_experience ?? undefined,
          isKeySkill: skill.is_key_skill ?? undefined,
        }))
      : [],

    projects: includeRelated
      ? projectRows.map((project) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          startDate: project.start_date ?? undefined,
          endDate: project.end_date ?? undefined,
          url: project.url ?? undefined,
          highlights: project.highlights || [],
          technologies: project.technologies ?? undefined,
          role: project.role ?? undefined,
          organization: project.organization ?? undefined,
        }))
      : [],

    certifications: includeRelated
      ? certificationRows.map((cert) => ({
          id: cert.id,
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date,
          expires: cert.expires ?? undefined,
          url: cert.url ?? undefined,
          credentialId: cert.credential_id ?? undefined,
          description: cert.description ?? undefined,
        }))
      : [],

    socialLinks: includeRelated
      ? socialLinkRows.map((link) => ({
          id: link.id,
          platform: link.platform,
          url: link.url,
          username: link.username ?? undefined,
          displayText: link.display_text ?? undefined,
          isPrimary: link.is_primary ?? undefined,
        }))
      : [],

    customSections: includeRelated
      ? customSectionRows.map((section) => ({
          id: section.id,
          title: section.title,
          order: section.order ?? undefined,
          isVisible: section.is_visible ?? undefined,
          // entries need mapping if included in DbResumeData/query
          entries: [], // Placeholder - map entries if fetched
        }))
      : [],

    // Map optional Resume fields from dbResume if they exist
    isBaseResume: dbResume.is_base_resume ?? undefined,
    originalResumeId: dbResume.original_resume_id ?? undefined,
    jobDescriptionId: dbResume.job_description_id ?? undefined,
    atsScore: dbResume.ats_score ?? undefined,
    metadata:
      typeof dbResume.metadata === "object" &&
      dbResume.metadata !== null &&
      !Array.isArray(dbResume.metadata)
        ? (dbResume.metadata as Record<string, unknown>) // More type-safe alternative to any
        : undefined,
    version: dbResume.version ?? undefined,
    formatOptions:
      typeof dbResume.format_options === "object" &&
      dbResume.format_options !== null &&
      !Array.isArray(dbResume.format_options)
        ? (dbResume.format_options as Resume["formatOptions"]) // Keep simple cast for now
        : undefined,
  };

  return resume;
}

// Type alias for Resume table columns for sorting
type ResumeSortableColumns =
  keyof Database["public"]["Tables"]["resumes"]["Row"];

/**
 * GET /api/resume - Get all resumes for the current user
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
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");
    const search = url.searchParams.get("search") || "";
    const sortBy = url.searchParams.get("sortBy") || "updated_at";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const includeDetails = url.searchParams.get("includeDetails") === "true";

    // Validate pagination parameters
    const validatedLimit = Math.min(Math.max(1, limit), 50); // Between 1 and 50
    const validatedPage = Math.max(1, page); // At least 1
    const offset = (validatedPage - 1) * validatedLimit;

    // Validate sorting parameters
    const allowedSortFields: ResumeSortableColumns[] = [
      "created_at",
      "updated_at",
      "title",
      "target_job_title",
      // Add other sortable columns as needed
    ];
    let validatedSortBy: ResumeSortableColumns = "updated_at"; // Default value
    if (allowedSortFields.includes(sortBy as ResumeSortableColumns)) {
      validatedSortBy = sortBy as ResumeSortableColumns;
    }

    const validatedSortOrder = ["asc", "desc"].includes(sortOrder)
      ? sortOrder
      : "desc";

    // Start building the query
    let query = supabase
      .from("resumes")
      .select(
        includeDetails
          ? `
            *,
            personal_info (*),
            professional_summary (*),
            work_experiences (*),
            education (*),
            skills (*),
            projects (*),
            certifications (*),
            social_links (*),
            custom_sections (*)
          `
          : "*",
        { count: "exact" },
      )
      .eq("user_id", session.user.id);

    // Add search filter if provided
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,target_job_title.ilike.%${search}%`,
      );
    }

    // Add sorting and pagination
    query = query
      .order(validatedSortBy, {
        ascending: validatedSortOrder === "asc",
      })
      .range(offset, offset + validatedLimit - 1);

    // Execute the query
    const { data: resumes, error, count } = await query;

    if (error) {
      console.error("Error fetching resumes:", error);
      return NextResponse.json(
        { error: "Failed to fetch resumes" },
        { status: 500 },
      );
    }

    // Transform database records to API response format
    const transformedData = resumes.map((resume) =>
      transformDatabaseResumeToApiFormat(
        resume as unknown as DbResumeData,
        includeDetails,
      ),
    );

    // Prepare pagination metadata
    const totalPages = Math.ceil((count || 0) / validatedLimit);

    const response: ResumesResponse = {
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
    console.error("Unexpected error in resume API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/resume - Create a new resume
 * Creates a new resume and related records in the database
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
    const data: CreateResumeRequest = await request.json();

    // Validate resume data
    const validation = validateResumeData(data);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate UUID for the new resume
    const resumeId = crypto.randomUUID();

    // Get current timestamp
    const now = new Date().toISOString();

    // Create the main resume record
    const { /* data: resumeData, */ error: resumeError } = await supabase
      .from("resumes")
      .insert({
        id: resumeId,
        user_id: session.user.id,
        title: data.title,
        target_job_title: data.targetJobTitle,
        template_id: data.templateId,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (resumeError) {
      console.error("Error creating resume:", resumeError);
      return NextResponse.json(
        { error: "Failed to create resume" },
        { status: 500 },
      );
    }

    // Create personal info record
    if (data.personalInfo) {
      const { error: personalInfoError } = await supabase
        .from("personal_info")
        .insert({
          resume_id: resumeId,
          full_name: data.personalInfo.fullName,
          email: data.personalInfo.email || "",
          phone: data.personalInfo.phone || "",
          location: data.personalInfo.location || "",
          linkedin: data.personalInfo.linkedIn || "",
          website: data.personalInfo.website || "",
          github: data.personalInfo.github || "",
        });

      if (personalInfoError) {
        console.error("Error creating personal info:", personalInfoError);
      }
    }

    // Create professional summary record
    if (data.professionalSummary) {
      const { error: summaryError } = await supabase
        .from("professional_summary")
        .insert({
          resume_id: resumeId,
          content: data.professionalSummary.content || "",
        });

      if (summaryError) {
        console.error("Error creating professional summary:", summaryError);
      }
    }

    // Create work experiences
    if (data.workExperiences && data.workExperiences.length > 0) {
      const workExperiencesWithIds = data.workExperiences.map(
        (exp: WorkExperience) => ({
          id: crypto.randomUUID(),
          resume_id: resumeId,
          company: exp.company,
          position: exp.position,
          location: exp.location || "",
          start_date: exp.startDate,
          end_date: exp.endDate,
          current: exp.current || false,
          highlights: exp.highlights || [],
        }),
      );

      const { error: workExpError } = await supabase
        .from("work_experiences")
        .insert(workExperiencesWithIds);

      if (workExpError) {
        console.error("Error creating work experiences:", workExpError);
      }
    }

    // Create education records
    if (data.education && data.education.length > 0) {
      const educationWithIds = data.education.map((edu: Education) => ({
        id: crypto.randomUUID(),
        resume_id: resumeId,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        location: edu.location || "",
        start_date: edu.startDate,
        end_date: edu.endDate,
        current: edu.current || false,
        gpa: edu.gpa || "",
        highlights: edu.highlights || [],
      }));

      const { error: educationError } = await supabase
        .from("education")
        .insert(educationWithIds);

      if (educationError) {
        console.error("Error creating education records:", educationError);
      }
    }

    // Create skills records
    if (data.skills && data.skills.length > 0) {
      const skillsWithIds = data.skills.map((skill: Skill) => ({
        id: crypto.randomUUID(),
        resume_id: resumeId,
        name: skill.name,
        level: skill.level || null,
        category: skill.category || null,
      }));

      const { error: skillsError } = await supabase
        .from("skills")
        .insert(skillsWithIds);

      if (skillsError) {
        console.error("Error creating skills:", skillsError);
      }
    }

    // Create projects records
    if (data.projects && data.projects.length > 0) {
      const projectsWithIds = data.projects.map((project: Project) => ({
        id: crypto.randomUUID(),
        resume_id: resumeId,
        name: project.name,
        description: project.description || "",
        start_date: project.startDate,
        end_date: project.endDate,
        url: project.url || "",
        highlights: project.highlights || [],
      }));

      const { error: projectsError } = await supabase
        .from("projects")
        .insert(projectsWithIds);

      if (projectsError) {
        console.error("Error creating projects:", projectsError);
      }
    }

    // Create certifications records
    if (data.certifications && data.certifications.length > 0) {
      const certificationsWithIds = data.certifications.map(
        (cert: Certification) => ({
          id: crypto.randomUUID(),
          resume_id: resumeId,
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date,
          expires: cert.expires || null,
          url: cert.url || "",
        }),
      );

      const { error: certsError } = await supabase
        .from("certifications")
        .insert(certificationsWithIds);

      if (certsError) {
        console.error("Error creating certifications:", certsError);
      }
    }

    // Create social links records
    if (data.socialLinks && data.socialLinks.length > 0) {
      const socialLinksWithIds = data.socialLinks.map((link: SocialLink) => ({
        id: crypto.randomUUID(),
        resume_id: resumeId,
        platform: link.platform,
        url: link.url,
        username: link.username || "",
      }));

      const { error: linksError } = await supabase
        .from("social_links")
        .insert(socialLinksWithIds);

      if (linksError) {
        console.error("Error creating social links:", linksError);
      }
    }

    // Create custom sections records
    if (data.customSections && data.customSections.length > 0) {
      const customSectionsWithIds = data.customSections.map(
        (section: CustomSection) => ({
          id: crypto.randomUUID(),
          resume_id: resumeId,
          title: section.title,
          entries: section.entries || [],
        }),
      );

      const { error: sectionsError } = await supabase
        .from("custom_sections")
        .insert(customSectionsWithIds);

      if (sectionsError) {
        console.error("Error creating custom sections:", sectionsError);
      }
    }

    // Fetch the complete resume - remove type assertion from .single()
    const { data: completeResume, error: fetchError } = await supabase
      .from("resumes")
      .select(
        `
        *,
        personal_info (*),
        professional_summary (*),
        work_experiences (*),
        education (*),
        skills (*),
        projects (*),
        certifications (*),
        social_links (*),
        custom_sections (*)
      `,
      )
      .eq("id", resumeId)
      .single(); // Let Supabase infer type

    if (fetchError || !completeResume) {
      console.error("Error fetching complete resume:", fetchError);
      // Return partial success with available data
      const response: ResumeResponse = {
        id: resumeId,
        userId: session.user.id,
        title: data.title,
        targetJobTitle: data.targetJobTitle,
        templateId: data.templateId,
        createdAt: now,
        updatedAt: now,
        personalInfo: data.personalInfo || {
          fullName: "",
          email: "",
          phone: "",
          location: "",
        },
        professionalSummary: data.professionalSummary || { content: "" },
        workExperiences: data.workExperiences || [],
        education: data.education || [],
        skills: data.skills || [],
        projects: data.projects || [],
        certifications: data.certifications || [],
        socialLinks: data.socialLinks || [],
        customSections: data.customSections || [],
      };

      return NextResponse.json(response);
    }

    // Transform and return the complete resume
    // Pass potentially less strictly typed completeResume to the transformer
    const transformedResume = transformDatabaseResumeToApiFormat(
      completeResume as DbResumeData, // Cast here, transformer handles internal checks
      true,
    );

    return NextResponse.json(transformedResume);
  } catch (error) {
    console.error("Unexpected error in resume API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
