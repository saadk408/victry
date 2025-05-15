-- Victry Database Optimization: Part 4 - Row Level Security Implementation
-- This migration enables RLS on all tables and creates security policies

-- Enable RLS on all tables
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_entries ENABLE ROW LEVEL SECURITY;

-- Create a private schema for security functions
CREATE SCHEMA IF NOT EXISTS private;

-- Create a helper function to check resume ownership
CREATE OR REPLACE FUNCTION private.is_resume_owner(resume_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM resumes
    WHERE id = resume_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Resumes table policies
CREATE POLICY "Users can view their own resumes" 
  ON resumes FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own resumes" 
  ON resumes FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own resumes" 
  ON resumes FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own resumes" 
  ON resumes FOR DELETE 
  TO authenticated
  USING (user_id = auth.uid());

-- Personal info policies with EXISTS check for better performance
CREATE POLICY "Users can view their own personal info" 
  ON personal_info FOR SELECT 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM resumes 
    WHERE resumes.id = personal_info.resume_id 
    AND resumes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own personal info" 
  ON personal_info FOR UPDATE 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM resumes 
    WHERE resumes.id = personal_info.resume_id 
    AND resumes.user_id = auth.uid()
  ));

-- Apply similar policies to all other tables
-- Professional summary
CREATE POLICY "Users can view their own professional summary" 
  ON professional_summary FOR SELECT 
  TO authenticated
  USING (private.is_resume_owner(resume_id));

CREATE POLICY "Users can update their own professional summary" 
  ON professional_summary FOR ALL 
  TO authenticated
  USING (private.is_resume_owner(resume_id));

-- Work experiences
CREATE POLICY "Users can access their own work experiences" 
  ON work_experiences FOR ALL 
  TO authenticated
  USING (private.is_resume_owner(resume_id));

-- Education
CREATE POLICY "Users can access their own education" 
  ON education FOR ALL 
  TO authenticated
  USING (private.is_resume_owner(resume_id));

-- Skills
CREATE POLICY "Users can access their own skills" 
  ON skills FOR ALL 
  TO authenticated
  USING (private.is_resume_owner(resume_id));

-- Projects
CREATE POLICY "Users can access their own projects" 
  ON projects FOR ALL 
  TO authenticated
  USING (private.is_resume_owner(resume_id));

-- Certifications
CREATE POLICY "Users can access their own certifications" 
  ON certifications FOR ALL 
  TO authenticated
  USING (private.is_resume_owner(resume_id));

-- Social links
CREATE POLICY "Users can access their own social links" 
  ON social_links FOR ALL 
  TO authenticated
  USING (private.is_resume_owner(resume_id));

-- Custom sections
CREATE POLICY "Users can access their own custom sections" 
  ON custom_sections FOR ALL 
  TO authenticated
  USING (private.is_resume_owner(resume_id));

-- Custom section entries
CREATE POLICY "Users can access their own custom section entries" 
  ON custom_entries FOR ALL 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM custom_sections
    JOIN resumes ON custom_sections.resume_id = resumes.id
    WHERE custom_entries.custom_section_id = custom_sections.id
    AND resumes.user_id = auth.uid()
  ));