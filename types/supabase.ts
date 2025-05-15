// File: /types/supabase.ts
/**
 * TypeScript definitions for Supabase database schema
 * This file defines the type structure for interacting with the database
 * with proper type safety throughout the application.
 */

/**
 * Generic JSON type for database JSON columns
 * Allows for strongly-typed JSON data in the database
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Master Database interface that defines the complete database schema
 * Includes all tables, views, functions, and their relations
 */
export interface Database {
  public: {
    Tables: {
      /**
       * Users table - contains user authentication and profile data
       */
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          created_at: string;
          updated_at: string;
          subscription_tier: string;
          subscription_status: string;
          trial_ends: string | null;
          preferences: Json | null;
          email_verified: boolean;
          last_login_at: string | null;
          professional_profile: Json | null;
          usage_metrics: Json | null;
          auth_provider: string | null;
          auth_provider_user_id: string | null;
          scheduled_for_deletion_at: string | null;
          notification_preferences: Json | null;
          onboarding_status: Json | null;
          privacy_settings: Json | null;
          billing_info: Json | null;
        };
        Insert: {
          id?: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          created_at?: string;
          updated_at?: string;
          subscription_tier?: string;
          subscription_status?: string;
          trial_ends?: string | null;
          preferences?: Json | null;
          email_verified?: boolean;
          last_login_at?: string | null;
          professional_profile?: Json | null;
          usage_metrics?: Json | null;
          auth_provider?: string | null;
          auth_provider_user_id?: string | null;
          scheduled_for_deletion_at?: string | null;
          notification_preferences?: Json | null;
          onboarding_status?: Json | null;
          privacy_settings?: Json | null;
          billing_info?: Json | null;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          created_at?: string;
          updated_at?: string;
          subscription_tier?: string;
          subscription_status?: string;
          trial_ends?: string | null;
          preferences?: Json | null;
          email_verified?: boolean;
          last_login_at?: string | null;
          professional_profile?: Json | null;
          usage_metrics?: Json | null;
          auth_provider?: string | null;
          auth_provider_user_id?: string | null;
          scheduled_for_deletion_at?: string | null;
          notification_preferences?: Json | null;
          onboarding_status?: Json | null;
          privacy_settings?: Json | null;
          billing_info?: Json | null;
        };
        Relationships: [];
      };

      /**
       * Resumes table - core table for storing resume data
       */
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          target_job_title: string;
          template_id: string;
          created_at: string;
          updated_at: string;
          is_base_resume: boolean;
          original_resume_id: string | null;
          job_description_id: string | null;
          ats_score: number | null;
          version: number | null;
          metadata: Json | null;
          format_options: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          target_job_title: string;
          template_id: string;
          created_at?: string;
          updated_at?: string;
          is_base_resume?: boolean;
          original_resume_id?: string | null;
          job_description_id?: string | null;
          ats_score?: number | null;
          version?: number | null;
          metadata?: Json | null;
          format_options?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          target_job_title?: string;
          template_id?: string;
          created_at?: string;
          updated_at?: string;
          is_base_resume?: boolean;
          original_resume_id?: string | null;
          job_description_id?: string | null;
          ats_score?: number | null;
          version?: number | null;
          metadata?: Json | null;
          format_options?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "resumes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resumes_original_resume_id_fkey";
            columns: ["original_resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resumes_job_description_id_fkey";
            columns: ["job_description_id"];
            referencedRelation: "job_descriptions";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Personal information for resumes
       */
      personal_info: {
        Row: {
          id: string;
          resume_id: string;
          full_name: string;
          email: string;
          phone: string;
          location: string;
          linkedin: string | null;
          website: string | null;
          github: string | null;
          additional_info: Json | null;
        };
        Insert: {
          id?: string;
          resume_id: string;
          full_name: string;
          email: string;
          phone: string;
          location: string;
          linkedin?: string | null;
          website?: string | null;
          github?: string | null;
          additional_info?: Json | null;
        };
        Update: {
          id?: string;
          resume_id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          location?: string;
          linkedin?: string | null;
          website?: string | null;
          github?: string | null;
          additional_info?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "personal_info_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Professional summary/objective for resumes
       */
      professional_summary: {
        Row: {
          id: string;
          resume_id: string;
          content: string;
        };
        Insert: {
          id?: string;
          resume_id: string;
          content: string;
        };
        Update: {
          id?: string;
          resume_id?: string;
          content?: string;
        };
        Relationships: [
          {
            foreignKeyName: "professional_summary_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Work experience entries for resumes
       */
      work_experiences: {
        Row: {
          id: string;
          resume_id: string;
          company: string;
          position: string;
          location: string;
          start_date: string;
          end_date: string | null;
          current: boolean;
          highlights: string[];
          description: string | null;
          industry: string | null;
          department: string | null;
        };
        Insert: {
          id?: string;
          resume_id: string;
          company: string;
          position: string;
          location: string;
          start_date: string;
          end_date?: string | null;
          current?: boolean;
          highlights?: string[];
          description?: string | null;
          industry?: string | null;
          department?: string | null;
        };
        Update: {
          id?: string;
          resume_id?: string;
          company?: string;
          position?: string;
          location?: string;
          start_date?: string;
          end_date?: string | null;
          current?: boolean;
          highlights?: string[];
          description?: string | null;
          industry?: string | null;
          department?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "work_experiences_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Education entries for resumes
       */
      education: {
        Row: {
          id: string;
          resume_id: string;
          institution: string;
          degree: string;
          field: string;
          location: string;
          start_date: string;
          end_date: string | null;
          current: boolean;
          gpa: string | null;
          highlights: string[] | null;
          honors: string[] | null;
          thesis: string | null;
        };
        Insert: {
          id?: string;
          resume_id: string;
          institution: string;
          degree: string;
          field: string;
          location: string;
          start_date: string;
          end_date?: string | null;
          current?: boolean;
          gpa?: string | null;
          highlights?: string[] | null;
          honors?: string[] | null;
          thesis?: string | null;
        };
        Update: {
          id?: string;
          resume_id?: string;
          institution?: string;
          degree?: string;
          field?: string;
          location?: string;
          start_date?: string;
          end_date?: string | null;
          current?: boolean;
          gpa?: string | null;
          highlights?: string[] | null;
          honors?: string[] | null;
          thesis?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "education_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Skills for resumes
       */
      skills: {
        Row: {
          id: string;
          resume_id: string;
          name: string;
          level: string | null;
          category: string | null;
          years_of_experience: number | null;
          is_key_skill: boolean | null;
        };
        Insert: {
          id?: string;
          resume_id: string;
          name: string;
          level?: string | null;
          category?: string | null;
          years_of_experience?: number | null;
          is_key_skill?: boolean | null;
        };
        Update: {
          id?: string;
          resume_id?: string;
          name?: string;
          level?: string | null;
          category?: string | null;
          years_of_experience?: number | null;
          is_key_skill?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "skills_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Projects for resumes
       */
      projects: {
        Row: {
          id: string;
          resume_id: string;
          name: string;
          description: string;
          start_date: string | null;
          end_date: string | null;
          url: string | null;
          highlights: string[];
          technologies: string[] | null;
          role: string | null;
          organization: string | null;
        };
        Insert: {
          id?: string;
          resume_id: string;
          name: string;
          description: string;
          start_date?: string | null;
          end_date?: string | null;
          url?: string | null;
          highlights: string[];
          technologies?: string[] | null;
          role?: string | null;
          organization?: string | null;
        };
        Update: {
          id?: string;
          resume_id?: string;
          name?: string;
          description?: string;
          start_date?: string | null;
          end_date?: string | null;
          url?: string | null;
          highlights?: string[];
          technologies?: string[] | null;
          role?: string | null;
          organization?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Certifications for resumes
       */
      certifications: {
        Row: {
          id: string;
          resume_id: string;
          name: string;
          issuer: string;
          date: string;
          expires: string | null;
          url: string | null;
          credential_id: string | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          resume_id: string;
          name: string;
          issuer: string;
          date: string;
          expires?: string | null;
          url?: string | null;
          credential_id?: string | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          resume_id?: string;
          name?: string;
          issuer?: string;
          date?: string;
          expires?: string | null;
          url?: string | null;
          credential_id?: string | null;
          description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "certifications_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Social media links for resumes
       */
      social_links: {
        Row: {
          id: string;
          resume_id: string;
          platform: string;
          url: string;
          username: string | null;
          display_text: string | null;
          is_primary: boolean | null;
        };
        Insert: {
          id?: string;
          resume_id: string;
          platform: string;
          url: string;
          username?: string | null;
          display_text?: string | null;
          is_primary?: boolean | null;
        };
        Update: {
          id?: string;
          resume_id?: string;
          platform?: string;
          url?: string;
          username?: string | null;
          display_text?: string | null;
          is_primary?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "social_links_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Custom sections for resumes
       */
      custom_sections: {
        Row: {
          id: string;
          resume_id: string;
          title: string;
          order: number | null;
          is_visible: boolean | null;
        };
        Insert: {
          id?: string;
          resume_id: string;
          title: string;
          order?: number | null;
          is_visible?: boolean | null;
        };
        Update: {
          id?: string;
          resume_id?: string;
          title?: string;
          order?: number | null;
          is_visible?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "custom_sections_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Custom section entries for resumes
       */
      custom_entries: {
        Row: {
          id: string;
          custom_section_id: string;
          title: string | null;
          subtitle: string | null;
          date: string | null;
          description: string | null;
          bullets: string[] | null;
        };
        Insert: {
          id?: string;
          custom_section_id: string;
          title?: string | null;
          subtitle?: string | null;
          date?: string | null;
          description?: string | null;
          bullets?: string[] | null;
        };
        Update: {
          id?: string;
          custom_section_id?: string;
          title?: string | null;
          subtitle?: string | null;
          date?: string | null;
          description?: string | null;
          bullets?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "custom_entries_custom_section_id_fkey";
            columns: ["custom_section_id"];
            referencedRelation: "custom_sections";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Job descriptions for tailoring resumes
       */
      job_descriptions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          company: string;
          location: string;
          content: string;
          url: string | null;
          application_deadline: string | null;
          created_at: string;
          updated_at: string;
          has_applied: boolean | null;
          application_date: string | null;
          application_status: string | null;
          notes: string | null;
          is_favorite: boolean | null;
          tags: string[] | null;
          employment_type: string | null;
          workplace_type: string | null;
          is_active: boolean | null;
          salary_range: Json | null;
          industry: string | null;
          department: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          company: string;
          location: string;
          content: string;
          url?: string | null;
          application_deadline?: string | null;
          created_at?: string;
          updated_at?: string;
          has_applied?: boolean | null;
          application_date?: string | null;
          application_status?: string | null;
          notes?: string | null;
          is_favorite?: boolean | null;
          tags?: string[] | null;
          employment_type?: string | null;
          workplace_type?: string | null;
          is_active?: boolean | null;
          salary_range?: Json | null;
          industry?: string | null;
          department?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          company?: string;
          location?: string;
          content?: string;
          url?: string | null;
          application_deadline?: string | null;
          created_at?: string;
          updated_at?: string;
          has_applied?: boolean | null;
          application_date?: string | null;
          application_status?: string | null;
          notes?: string | null;
          is_favorite?: boolean | null;
          tags?: string[] | null;
          employment_type?: string | null;
          workplace_type?: string | null;
          is_active?: boolean | null;
          salary_range?: Json | null;
          industry?: string | null;
          department?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "job_descriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * AI analysis of job descriptions
       */
      job_analysis: {
        Row: {
          id: string;
          job_description_id: string;
          requirements: Json[];
          keywords: Json[];
          experience_level: string;
          company_culture: string[];
          created_at: string;
          updated_at: string | null;
          salary_range: Json | null;
          industry: string | null;
          department: string | null;
          employment_type: string | null;
          remote_work: string | null;
          responsibilities: string[] | null;
          ats_compatibility_score: number | null;
        };
        Insert: {
          id?: string;
          job_description_id: string;
          requirements: Json[];
          keywords: Json[];
          experience_level: string;
          company_culture: string[];
          created_at?: string;
          updated_at?: string | null;
          salary_range?: Json | null;
          industry?: string | null;
          department?: string | null;
          employment_type?: string | null;
          remote_work?: string | null;
          responsibilities?: string[] | null;
          ats_compatibility_score?: number | null;
        };
        Update: {
          id?: string;
          job_description_id?: string;
          requirements?: Json[];
          keywords?: Json[];
          experience_level?: string;
          company_culture?: string[];
          created_at?: string;
          updated_at?: string | null;
          salary_range?: Json | null;
          industry?: string | null;
          department?: string | null;
          employment_type?: string | null;
          remote_work?: string | null;
          responsibilities?: string[] | null;
          ats_compatibility_score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "job_analysis_job_description_id_fkey";
            columns: ["job_description_id"];
            referencedRelation: "job_descriptions";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Tailored resumes for specific job descriptions
       */
      tailored_resumes: {
        Row: {
          id: string;
          user_id: string;
          original_resume_id: string;
          job_description_id: string;
          title: string;
          target_job_title: string;
          template_id: string;
          created_at: string;
          updated_at: string;
          tailoring_settings: Json;
          ats_score: Json;
          keyword_matches: Json[];
          modified_sections: string[] | null;
          change_explanations: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          original_resume_id: string;
          job_description_id: string;
          title: string;
          target_job_title: string;
          template_id: string;
          created_at?: string;
          updated_at?: string;
          tailoring_settings: Json;
          ats_score: Json;
          keyword_matches: Json[];
          modified_sections?: string[] | null;
          change_explanations?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          original_resume_id?: string;
          job_description_id?: string;
          title?: string;
          target_job_title?: string;
          template_id?: string;
          created_at?: string;
          updated_at?: string;
          tailoring_settings?: Json;
          ats_score?: Json;
          keyword_matches?: Json[];
          modified_sections?: string[] | null;
          change_explanations?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "tailored_resumes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tailored_resumes_original_resume_id_fkey";
            columns: ["original_resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tailored_resumes_job_description_id_fkey";
            columns: ["job_description_id"];
            referencedRelation: "job_descriptions";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * User analytics events
       */
      analytics_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          metadata: Json | null;
          created_at: string;
          session_id: string | null;
          path: string | null;
          client_info: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          metadata?: Json | null;
          created_at?: string;
          session_id?: string | null;
          path?: string | null;
          client_info?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          metadata?: Json | null;
          created_at?: string;
          session_id?: string | null;
          path?: string | null;
          client_info?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Resume templates available in the system
       */
      resume_templates: {
        Row: {
          id: string;
          name: string;
          description: string;
          thumbnail_url: string;
          is_premium: boolean;
          created_at: string;
          updated_at: string;
          category: string | null;
          slug: string | null;
          color_schemes: Json[] | null;
          font_options: Json[] | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          thumbnail_url: string;
          is_premium: boolean;
          created_at?: string;
          updated_at?: string;
          category?: string | null;
          slug?: string | null;
          color_schemes?: Json[] | null;
          font_options?: Json[] | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          thumbnail_url?: string;
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
          category?: string | null;
          slug?: string | null;
          color_schemes?: Json[] | null;
          font_options?: Json[] | null;
          is_active?: boolean;
        };
        Relationships: [];
      };

      /**
       * Resume snapshots for version history
       */
      resume_snapshots: {
        Row: {
          id: string;
          resume_id: string;
          user_id: string;
          label: string | null;
          created_at: string;
          resume_data: Json;
          tags: string[] | null;
          is_tailored: boolean;
          job_description_id: string | null;
        };
        Insert: {
          id?: string;
          resume_id: string;
          user_id: string;
          label?: string | null;
          created_at?: string;
          resume_data: Json;
          tags?: string[] | null;
          is_tailored?: boolean;
          job_description_id?: string | null;
        };
        Update: {
          id?: string;
          resume_id?: string;
          user_id?: string;
          label?: string | null;
          created_at?: string;
          resume_data?: Json;
          tags?: string[] | null;
          is_tailored?: boolean;
          job_description_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "resume_snapshots_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resume_snapshots_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resume_snapshots_job_description_id_fkey";
            columns: ["job_description_id"];
            referencedRelation: "job_descriptions";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Resume change history
       */
      resume_changes: {
        Row: {
          id: string;
          resume_id: string;
          user_id: string;
          change_type: string;
          section: string;
          field: string | null;
          previous_value: Json | null;
          new_value: Json | null;
          created_at: string;
          change_source: string;
          note: string | null;
        };
        Insert: {
          id?: string;
          resume_id: string;
          user_id: string;
          change_type: string;
          section: string;
          field?: string | null;
          previous_value?: Json | null;
          new_value?: Json | null;
          created_at?: string;
          change_source: string;
          note?: string | null;
        };
        Update: {
          id?: string;
          resume_id?: string;
          user_id?: string;
          change_type?: string;
          section?: string;
          field?: string | null;
          previous_value?: Json | null;
          new_value?: Json | null;
          created_at?: string;
          change_source?: string;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "resume_changes_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resume_changes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Cover letters
       */
      cover_letters: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string | null;
          job_description_id: string | null;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
          analysis: Json | null;
          settings: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          resume_id?: string | null;
          job_description_id?: string | null;
          title: string;
          content: string;
          created_at?: string;
          updated_at?: string;
          analysis?: Json | null;
          settings?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          resume_id?: string | null;
          job_description_id?: string | null;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
          analysis?: Json | null;
          settings?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "cover_letters_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cover_letters_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cover_letters_job_description_id_fkey";
            columns: ["job_description_id"];
            referencedRelation: "job_descriptions";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * User subscriptions
       */
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          created_at: string;
          updated_at: string;
          billing_frequency: string;
          amount: number;
          currency: string;
          payment_method_id: string | null;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          provider: string;
          provider_subscription_id: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          created_at?: string;
          updated_at?: string;
          billing_frequency: string;
          amount: number;
          currency: string;
          payment_method_id?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          provider: string;
          provider_subscription_id?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          status?: string;
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
          billing_frequency?: string;
          amount?: number;
          currency?: string;
          payment_method_id?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          provider?: string;
          provider_subscription_id?: string | null;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            referencedRelation: "subscription_plans";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Subscription plans
       */
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          description: string;
          price_monthly: number;
          price_annually: number;
          currency: string;
          features: string[];
          max_resumes: number;
          max_tailored_resumes: number;
          include_cover_letter: boolean;
          include_advanced_ats: boolean;
          include_premium_templates: boolean;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          trial_days: number | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price_monthly: number;
          price_annually: number;
          currency: string;
          features: string[];
          max_resumes: number;
          max_tailored_resumes: number;
          include_cover_letter: boolean;
          include_advanced_ats: boolean;
          include_premium_templates: boolean;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          trial_days?: number | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price_monthly?: number;
          price_annually?: number;
          currency?: string;
          features?: string[];
          max_resumes?: number;
          max_tailored_resumes?: number;
          include_cover_letter?: boolean;
          include_advanced_ats?: boolean;
          include_premium_templates?: boolean;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          trial_days?: number | null;
          metadata?: Json | null;
        };
        Relationships: [];
      };

      /**
       * User feedback submissions
       */
      feedback: {
        Row: {
          id: string;
          user_id: string;
          feedback_type: string;
          content: string;
          rating: number | null;
          created_at: string;
          feature: string | null;
          status: string;
          metadata: Json | null;
          resolved_at: string | null;
          resolved_by: string | null;
          resolution_note: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          feedback_type: string;
          content: string;
          rating?: number | null;
          created_at?: string;
          feature?: string | null;
          status?: string;
          metadata?: Json | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          resolution_note?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          feedback_type?: string;
          content?: string;
          rating?: number | null;
          created_at?: string;
          feature?: string | null;
          status?: string;
          metadata?: Json | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          resolution_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_resolved_by_fkey";
            columns: ["resolved_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Shared resumes
       */
      shared_resumes: {
        Row: {
          id: string;
          resume_id: string;
          user_id: string;
          access_token: string;
          is_public: boolean;
          allow_indexing: boolean;
          expires_at: string | null;
          access_password: string | null;
          allowed_domains: string[] | null;
          created_at: string;
          updated_at: string;
          view_count: number;
          last_viewed_at: string | null;
        };
        Insert: {
          id?: string;
          resume_id: string;
          user_id: string;
          access_token?: string;
          is_public?: boolean;
          allow_indexing?: boolean;
          expires_at?: string | null;
          access_password?: string | null;
          allowed_domains?: string[] | null;
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          last_viewed_at?: string | null;
        };
        Update: {
          id?: string;
          resume_id?: string;
          user_id?: string;
          access_token?: string;
          is_public?: boolean;
          allow_indexing?: boolean;
          expires_at?: string | null;
          access_password?: string | null;
          allowed_domains?: string[] | null;
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          last_viewed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shared_resumes_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shared_resumes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      /**
       * Shared resume access grants
       */
      shared_resume_access: {
        Row: {
          id: string;
          shared_resume_id: string;
          email: string;
          access_level: string;
          shared_at: string;
          expires_at: string | null;
          used_at: string | null;
          use_count: number;
        };
        Insert: {
          id?: string;
          shared_resume_id: string;
          email: string;
          access_level: string;
          shared_at?: string;
          expires_at?: string | null;
          used_at?: string | null;
          use_count?: number;
        };
        Update: {
          id?: string;
          shared_resume_id?: string;
          email?: string;
          access_level?: string;
          shared_at?: string;
          expires_at?: string | null;
          used_at?: string | null;
          use_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "shared_resume_access_shared_resume_id_fkey";
            columns: ["shared_resume_id"];
            referencedRelation: "shared_resumes";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
