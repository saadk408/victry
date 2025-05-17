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
export type Database = {
  public: {
    Tables: {
      certifications: {
        Row: {
          credential_id: string | null
          date_expires: string | null
          date_issued: string | null
          id: string
          issuer: string
          name: string
          resume_id: string
          url: string | null
        }
        Insert: {
          credential_id?: string | null
          date_expires?: string | null
          date_issued?: string | null
          id?: string
          issuer: string
          name: string
          resume_id: string
          url?: string | null
        }
        Update: {
          credential_id?: string | null
          date_expires?: string | null
          date_issued?: string | null
          id?: string
          issuer?: string
          name?: string
          resume_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_entries: {
        Row: {
          custom_section_id: string
          date_range: string | null
          description: string | null
          display_order: number
          id: string
          location: string | null
          subtitle: string | null
          title: string | null
        }
        Insert: {
          custom_section_id: string
          date_range?: string | null
          description?: string | null
          display_order?: number
          id?: string
          location?: string | null
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          custom_section_id?: string
          date_range?: string | null
          description?: string | null
          display_order?: number
          id?: string
          location?: string | null
          subtitle?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_entries_custom_section_id_fkey"
            columns: ["custom_section_id"]
            isOneToOne: false
            referencedRelation: "custom_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_sections: {
        Row: {
          display_order: number
          id: string
          resume_id: string
          title: string
        }
        Insert: {
          display_order?: number
          id?: string
          resume_id: string
          title: string
        }
        Update: {
          display_order?: number
          id?: string
          resume_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_sections_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      education: {
        Row: {
          achievements: string[] | null
          current: boolean | null
          degree: string
          description: string | null
          end_date: string | null
          field_of_study: string | null
          id: string
          institution: string
          location: string | null
          resume_id: string
          start_date: string
        }
        Insert: {
          achievements?: string[] | null
          current?: boolean | null
          degree: string
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          institution: string
          location?: string | null
          resume_id: string
          start_date: string
        }
        Update: {
          achievements?: string[] | null
          current?: boolean | null
          degree?: string
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          institution?: string
          location?: string | null
          resume_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_descriptions: {
        Row: {
          analysis: Json | null
          company: string
          content: string
          created_at: string
          id: string
          job_type: string | null
          keywords: string[] | null
          location: string | null
          salary: string | null
          title: string
          updated_at: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          company: string
          content: string
          created_at?: string
          id?: string
          job_type?: string | null
          keywords?: string[] | null
          location?: string | null
          salary?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          analysis?: Json | null
          company?: string
          content?: string
          created_at?: string
          id?: string
          job_type?: string | null
          keywords?: string[] | null
          location?: string | null
          salary?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      personal_info: {
        Row: {
          email: string | null
          full_name: string
          github: string | null
          id: string
          linkedin: string | null
          location: string | null
          phone: string | null
          resume_id: string
          website: string | null
        }
        Insert: {
          email?: string | null
          full_name: string
          github?: string | null
          id?: string
          linkedin?: string | null
          location?: string | null
          phone?: string | null
          resume_id: string
          website?: string | null
        }
        Update: {
          email?: string | null
          full_name?: string
          github?: string | null
          id?: string
          linkedin?: string | null
          location?: string | null
          phone?: string | null
          resume_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_info_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_summary: {
        Row: {
          content: string
          id: string
          resume_id: string
        }
        Insert: {
          content: string
          id?: string
          resume_id: string
        }
        Update: {
          content?: string
          id?: string
          resume_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_summary_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          job_description_count: number | null
          last_name: string | null
          resume_count: number | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          job_description_count?: number | null
          last_name?: string | null
          resume_count?: number | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          job_description_count?: number | null
          last_name?: string | null
          resume_count?: number | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          current: boolean | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          resume_id: string
          start_date: string | null
          technologies: string[] | null
          url: string | null
        }
        Insert: {
          current?: boolean | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          resume_id: string
          start_date?: string | null
          technologies?: string[] | null
          url?: string | null
        }
        Update: {
          current?: boolean | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          resume_id?: string
          start_date?: string | null
          technologies?: string[] | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          ats_score: number | null
          created_at: string
          format_options: Json | null
          id: string
          is_base_resume: boolean | null
          job_description_id: string | null
          metadata: Json | null
          original_resume_id: string | null
          target_job_title: string | null
          template_id: string
          title: string
          updated_at: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          ats_score?: number | null
          created_at?: string
          format_options?: Json | null
          id?: string
          is_base_resume?: boolean | null
          job_description_id?: string | null
          metadata?: Json | null
          original_resume_id?: string | null
          target_job_title?: string | null
          template_id: string
          title: string
          updated_at?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          ats_score?: number | null
          created_at?: string
          format_options?: Json | null
          id?: string
          is_base_resume?: boolean | null
          job_description_id?: string | null
          metadata?: Json | null
          original_resume_id?: string | null
          target_job_title?: string | null
          template_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          id: string
          level: Database["public"]["Enums"]["skill_level_enum"] | null
          name: string
          resume_id: string
        }
        Insert: {
          category?: string | null
          id?: string
          level?: Database["public"]["Enums"]["skill_level_enum"] | null
          name: string
          resume_id: string
        }
        Update: {
          category?: string | null
          id?: string
          level?: Database["public"]["Enums"]["skill_level_enum"] | null
          name?: string
          resume_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      social_links: {
        Row: {
          id: string
          platform: string
          resume_id: string
          url: string
        }
        Insert: {
          id?: string
          platform: string
          resume_id: string
          url: string
        }
        Update: {
          id?: string
          platform?: string
          resume_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_links_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      work_experiences: {
        Row: {
          achievements: string[] | null
          company: string
          current: boolean | null
          description: string | null
          end_date: string | null
          highlights: string[] | null
          id: string
          location: string | null
          position: string
          resume_id: string
          start_date: string
        }
        Insert: {
          achievements?: string[] | null
          company: string
          current?: boolean | null
          description?: string | null
          end_date?: string | null
          highlights?: string[] | null
          id?: string
          location?: string | null
          position: string
          resume_id: string
          start_date: string
        }
        Update: {
          achievements?: string[] | null
          company?: string
          current?: boolean | null
          description?: string | null
          end_date?: string | null
          highlights?: string[] | null
          id?: string
          location?: string | null
          position?: string
          resume_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_experiences_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_role: {
        Args: { p_user_id: string; p_role_name: string }
        Returns: void
      }
      check_ai_usage_limit: {
        Args: { feature_param: string }
        Returns: boolean
      }
      get_resume_colors: {
        Args: { resume_id: string }
        Returns: {
          primary_color: string
          secondary_color: string
        }[]
      }
      get_resume_font_settings: {
        Args: { resume_id: string }
        Returns: {
          font_family: string
          font_size: number
        }[]
      }
      get_user_permissions: {
        Args: Record<PropertyKey, never>
        Returns: Array<{ resource: string; action: string }>
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_permission: {
        Args: { resource_param: string; action_param: string }
        Returns: boolean
      }
      record_ai_feature_usage: {
        Args: { feature_param: string }
        Returns: void
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      skill_level_enum: "beginner" | "intermediate" | "advanced" | "expert"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      skill_level_enum: ["beginner", "intermediate", "advanced", "expert"],
    },
  },
} as const