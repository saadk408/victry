// File: /app/_lib/hooks/use-resume.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  type Resume,
  type PersonalInfo,
  type ProfessionalSummary,
  type WorkExperience,
  type Education,
  type Skill,
  type Project,
  type Certification,
  type SocialLink,
  type CustomSection,
  type CustomSectionEntry,
} from "@/models/resume"; // Assuming models are defined here
import { type Database } from "@/types/supabase";

// Type alias for Supabase row types for easier reference
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
// Note: The custom_entries table definition is missing from the provided types/supabase.ts
// We'll assume its structure for now or use Record<string, unknown>
type CustomSectionEntryRow =
  Database["public"]["Tables"]["custom_entries"]["Row"]; // Corrected table name

// Helper to map snake_case to camelCase for a single object or array of objects
// Uses unknown internally for better type safety than any
function mapSnakeToCamel<T>(input: unknown): T {
  if (typeof input !== "object" || input === null) {
    return input as T;
  }

  if (Array.isArray(input)) {
    // Map each item in the array recursively
    return input.map((item) => mapSnakeToCamel(item)) as T;
  }

  const newObj = {} as Record<string, unknown>;
  for (const key in input as Record<string, unknown>) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, char) =>
        char.toUpperCase(),
      );
      // Recursively map nested properties
      newObj[camelKey] = mapSnakeToCamel(
        (input as Record<string, unknown>)[key],
      );
    }
  }
  return newObj as T;
}

// Define a type for the combined resume data fetched from Supabase
// This uses the Row types and expects nested structures based on the query
type FetchedResumeData = ResumeRow & {
  personal_info: PersonalInfoRow[];
  professional_summary: ProfessionalSummaryRow[];
  work_experiences: WorkExperienceRow[];
  education: EducationRow[];
  skills: SkillRow[];
  projects: ProjectRow[];
  certifications: CertificationRow[];
  social_links: SocialLinkRow[];
  custom_sections: (CustomSectionRow & {
    custom_section_entries: CustomSectionEntryRow[]; // Corrected property name
  })[];
};

// Stub for the useResume hook - actual implementation needs to fetch/update related tables
export function useResume(id?: string) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchResume = useCallback(async () => {
    if (!id) {
      setResume(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to access resumes");
      }

      // Fetch data using the generated types and explicit column selection for clarity
      // The select string now includes all related tables we need
      const { data, error: fetchError } = await supabase
        .from("resumes")
        .select(
          `
          *,
          personal_info(*),
          professional_summary(*),
          work_experiences(*),
          education(*),
          skills(*),
          projects(*),
          certifications(*),
          social_links(*),
          custom_sections(*, custom_section_entries:custom_entries(*))
        `,
        ) // Corrected relation name for custom entries
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle<FetchedResumeData>(); // Apply the combined type

      if (fetchError) {
        throw new Error(`Supabase error: ${fetchError.message}`);
      }

      if (!data) {
        setResume(null);
        setLoading(false);
        console.log(`Resume with id ${id} not found.`);
        return;
      }

      // Map data to Resume model, now leveraging the typed 'data' object
      // Add checks for null/undefined where the database schema allows it
      // and provide defaults matching the Resume type structure
      const mappedResume: Resume = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        targetJobTitle: data.target_job_title ?? "",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        templateId: data.template_id ?? "default",
        isBaseResume: data.is_base_resume ?? false,
        originalResumeId: data.original_resume_id ?? undefined,
        jobDescriptionId: data.job_description_id ?? undefined,
        atsScore: data.ats_score ?? undefined,
        // Safely handle metadata: Cast to Record<string, any> if it's an object, else undefined
        metadata:
          typeof data.metadata === "object" &&
          data.metadata !== null &&
          !Array.isArray(data.metadata)
            ? (data.metadata as Record<string, unknown>)
            : undefined,
        version: data.version ?? 1,

        // Map nested items using mapSnakeToCamel and provide defaults
        personalInfo: data.personal_info?.[0]
          ? mapSnakeToCamel<PersonalInfo>(data.personal_info[0])
          : {
              fullName: "",
              email: "",
              phone: "",
              location: "",
            },
        professionalSummary: data.professional_summary?.[0]
          ? mapSnakeToCamel<ProfessionalSummary>(data.professional_summary[0])
          : { content: "" },

        workExperiences: Array.isArray(data.work_experiences)
          ? mapSnakeToCamel<WorkExperience[]>(data.work_experiences)
          : [],
        education: Array.isArray(data.education)
          ? mapSnakeToCamel<Education[]>(data.education)
          : [],
        skills: Array.isArray(data.skills)
          ? mapSnakeToCamel<Skill[]>(data.skills)
          : [],
        projects: Array.isArray(data.projects)
          ? mapSnakeToCamel<Project[]>(data.projects)
          : [],
        certifications: Array.isArray(data.certifications)
          ? mapSnakeToCamel<Certification[]>(data.certifications)
          : [],
        socialLinks: Array.isArray(data.social_links)
          ? mapSnakeToCamel<SocialLink[]>(data.social_links)
          : [],

        // Map custom sections and their nested entries
        customSections: Array.isArray(data.custom_sections)
          ? data.custom_sections.map((section) => {
              // 'section' is now typed based on FetchedResumeData
              const mappedSectionBase =
                mapSnakeToCamel<Omit<CustomSection, "entries">>(section);
              const entries = Array.isArray(section.custom_section_entries)
                ? mapSnakeToCamel<CustomSectionEntry[]>(
                    section.custom_section_entries,
                  )
                : [];
              return {
                ...mappedSectionBase,
                entries,
              };
            })
          : [],
        // Add formatOptions mapping if needed (assuming it's nullable in DB)
        formatOptions: data.format_options
          ? mapSnakeToCamel<Resume["formatOptions"]>(data.format_options)
          : undefined,
      };

      setResume(mappedResume);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch resume"),
      );
      console.error("Error fetching resume:", err);
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  // Placeholder update resume function
  const updateResume = async (
    updates: Partial<Omit<Resume, "id" | "userId" | "createdAt" | "updatedAt">>,
  ) => {
    if (!id || !resume) {
      // Also check if resume is loaded
      throw new Error("No resume loaded or ID provided for update");
    }
    try {
      // Placeholder update logic - needs camelToSnake conversion before sending to Supabase
      // Corrected template literal
      console.log(`Simulating update for resume ID ${id} with data:`, updates);
      // Example: Convert updates back to snake_case before sending (using a similar helper)
      // const snakeUpdates = mapCamelToSnake(updates);
      // const { error: updateError } = await supabase
      //   .from('resumes')
      //   .update(snakeUpdates) // Send snake_case data
      //   .eq('id', id);
      // if (updateError) throw updateError;

      // Update nested tables separately (e.g., personal_info)
      // if (updates.personalInfo) {
      //   const snakePersonalInfo = mapCamelToSnake(updates.personalInfo);
      //   await supabase.from('personal_info').update(snakePersonalInfo).eq('resume_id', id); // Assuming resume_id links them
      // }
      // ... update other sections

      // Update local state optimistically (or after successful DB update)
      const updatedResume = {
        ...resume,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      setResume(updatedResume);
      return updatedResume; // Return updated local state
    } catch (err) {
      console.error("Error updating resume (placeholder):", err);
      setError(
        err instanceof Error ? err : new Error("Failed to update resume"),
      );
      throw err;
    }
  };

  // Placeholder delete resume function
  const deleteResume = async () => {
    if (!id) {
      throw new Error("No resume ID provided for delete");
    }
    try {
      setLoading(true); // Indicate loading state
      // Corrected template literal
      console.log(`Simulating delete for resume ID ${id}`);
      // const { error: deleteError } = await supabase.from('resumes').delete().eq('id', id);
      // if (deleteError) throw deleteError;

      setResume(null); // Clear local state
      // Potentially navigate away or show success message
      return true;
    } catch (err) {
      console.error("Error deleting resume (placeholder):", err);
      setError(
        err instanceof Error ? err : new Error("Failed to delete resume"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Placeholder duplicate resume function
  const duplicateResume = async (newTitle: string): Promise<Resume> => {
    // Added return type promise
    if (!id || !resume) {
      throw new Error("No resume loaded to duplicate");
    }
    try {
      setLoading(true);
      // Corrected template literal
      console.log(
        `Simulating duplicate for resume ID ${id} with new title ${newTitle}`,
      );
      // 1. Create a deep copy of the current resume data, converting back to snake_case for insertion
      // This is complex as it involves all nested structures.
      // A helper function mapCamelToSnakeDeep would be needed.
      // 2. Prepare the new top-level resume object (example)
      // const newResumeDataSnake = {
      //   user_id: resume.userId,
      //   title: newTitle,
      //   target_job_title: resume.targetJobTitle,
      //   template_id: resume.templateId,
      //   is_base_resume: false,
      //   original_resume_id: resume.id,
      //   version: 1,
      //   // other fields can be null/default or copied
      // };
      // 3. Insert the new top-level resume record
      // const { data: newResumeResult, error: insertResumeError } = await supabase
      //   .from('resumes')
      //   .insert(newResumeDataSnake)
      //   .select()
      //   .single();
      // if (insertResumeError || !newResumeResult) {
      //   throw new Error(insertResumeError?.message || 'Failed to insert new resume record');
      // }
      // const newId = newResumeResult.id;

      // 4. Duplicate all related records (personal_info, work_experiences, etc.)
      // For each related table, fetch the original data, modify the resume_id to the newId,
      // remove the original id, and insert the new records.
      // Example for work_experiences:
      // const workExperiencesToInsert = resume.workExperiences.map(exp => {
      //   const { id, ...rest } = exp; // Remove original ID
      //   return mapCamelToSnake({ ...rest, resume_id: newId }); // Add new resume_id, convert to snake_case
      // });
      // await supabase.from('work_experiences').insert(workExperiencesToInsert);
      // // Repeat for all other related tables...

      // 5. Fetch the fully duplicated resume (optional, or construct locally)
      // Could call fetchResume(newId) or construct the new Resume object locally

      // --- Placeholder Logic ---
      const newId = crypto.randomUUID(); // Simulate new ID
      const now = new Date().toISOString();
      const duplicated: Resume = {
        // Constructing with camelCase for local state
        ...resume,
        id: newId,
        title: newTitle,
        createdAt: now,
        updatedAt: now,
        isBaseResume: false,
        originalResumeId: resume.id,
        jobDescriptionId: undefined, // Reset job-specific fields
        atsScore: undefined,
        metadata: undefined, // Reset metadata
        version: 1,
        // Nested items would need deep copying in a real implementation
        // For simulation, we might shallow copy or re-use references which isn't correct for duplication
        // Provide default empty objects if fields are missing but required by the type
        personalInfo: resume.personalInfo
          ? { ...resume.personalInfo }
          : ({
              fullName: "",
              email: "",
              phone: "",
              location: "",
            } as PersonalInfo), // Default empty object
        professionalSummary: resume.professionalSummary
          ? { ...resume.professionalSummary }
          : ({ content: "" } as ProfessionalSummary), // Default empty object
        workExperiences: resume.workExperiences.map((exp) => ({
          ...exp,
          id: crypto.randomUUID(),
        })), // Simulate new IDs for nested items
        education: resume.education.map((edu) => ({
          ...edu,
          id: crypto.randomUUID(),
        })),
        skills: resume.skills.map((skill) => ({
          ...skill,
          id: crypto.randomUUID(),
        })),
        projects: resume.projects.map((proj) => ({
          ...proj,
          id: crypto.randomUUID(),
        })),
        certifications: resume.certifications.map((cert) => ({
          ...cert,
          id: crypto.randomUUID(),
        })),
        socialLinks: resume.socialLinks.map((link) => ({
          ...link,
          id: crypto.randomUUID(),
        })),
        customSections: resume.customSections.map((section) => ({
          ...section,
          id: crypto.randomUUID(),
          entries: section.entries.map((entry) => ({
            ...entry,
            id: crypto.randomUUID(),
          })),
        })),
      };
      console.log("Simulated duplicated resume (local state):", duplicated);
      // In a real implementation, return the fully formed Resume object fetched/constructed after DB operations.
      // setResume(duplicated); // Optionally update the hook's state to the new resume
      // return duplicated;
      // --- End Placeholder ---
      throw new Error(
        "Duplication database logic not yet implemented in mock hook",
      );
    } catch (err) {
      console.error("Error duplicating resume (placeholder):", err);
      setError(
        err instanceof Error ? err : new Error("Failed to duplicate resume"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Placeholder functions for nested items (Work Experiences, etc.)
  // These would ideally interact with the resume state and call Supabase
  const addWorkExperience = async (experience: Omit<WorkExperience, "id">) => {
    if (!resume?.id) throw new Error("Resume not loaded");
    console.log("Simulating addWorkExperience", experience);

    // Construct the new object safely matching the type
    const newExperience: WorkExperience = {
      id: crypto.randomUUID(),
      ...experience,
    };
    setResume(
      (
        prev, // Removed redundant type annotation
      ) =>
        prev
          ? {
              ...prev,
              workExperiences: [...prev.workExperiences, newExperience],
            }
          : null,
    );
    return newExperience;
  };

  const updateWorkExperience = async (
    expId: string,
    experienceUpdate: Partial<Omit<WorkExperience, "id">>,
  ) => {
    if (!resume?.id) throw new Error("Resume not loaded");
    console.log("Simulating updateWorkExperience", expId, experienceUpdate);
    setResume(
      (
        prev, // Removed redundant type annotation
      ) =>
        prev
          ? {
              ...prev,
              workExperiences: prev.workExperiences.map(
                (
                  exp, // Removed redundant type annotation
                ) => (exp.id === expId ? { ...exp, ...experienceUpdate } : exp),
              ),
            }
          : null,
    );
  };

  const deleteWorkExperience = async (expId: string) => {
    if (!resume?.id) throw new Error("Resume not loaded");
    console.log("Simulating deleteWorkExperience", expId);
    setResume(
      (
        prev, // Removed redundant type annotation
      ) =>
        prev
          ? {
              ...prev,
              workExperiences: prev.workExperiences.filter(
                (exp) => exp.id !== expId, // Removed redundant type annotation
              ),
            }
          : null,
    );
  };

  // ... add stubs for other nested sections (education, skills, etc.)

  useEffect(() => {
    fetchResume();
    // NOTE: Consider dependency array carefully. If fetchResume itself changes (e.g., due to changes in supabase client instance), it should re-run.
    // If 'id' or 'supabase' are stable references expected *within* fetchResume, including them in fetchResume's useCallback dependencies is correct.
    // Including fetchResume here means the effect re-runs if the fetchResume function instance changes.
  }, [fetchResume]);

  return {
    resume,
    loading,
    error,
    updateResume,
    deleteResume,
    duplicateResume,
    fetchResume, // Expose refresh
    addWorkExperience, // Placeholder for nested item management
    updateWorkExperience,
    deleteWorkExperience,
    // ... expose other nested section hooks
  };
}
