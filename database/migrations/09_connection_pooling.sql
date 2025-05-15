-- Victry Database Optimization: Part 9 - Connection Pooling Optimizations
-- This migration creates functions optimized for PgBouncer transaction pooling

-- Create small, focused functions compatible with PgBouncer transaction pooling
CREATE OR REPLACE FUNCTION get_resume_basic_details(p_resume_id UUID)
RETURNS TABLE(
  id UUID,
  title TEXT,
  updated_at TIMESTAMPTZ,
  target_job_title TEXT,
  template_id TEXT,
  personal_name TEXT,
  personal_email TEXT,
  personal_location TEXT
) AS $$
  SELECT 
    r.id, 
    r.title, 
    r.updated_at, 
    r.target_job_title, 
    r.template_id,
    p.full_name, 
    p.email, 
    p.location
  FROM resumes r
  JOIN personal_info p ON r.id = p.resume_id
  WHERE r.id = p_resume_id;
$$ LANGUAGE SQL STABLE;

-- Create function to get work experiences
CREATE OR REPLACE FUNCTION get_resume_work_experiences(p_resume_id UUID)
RETURNS TABLE(
  id UUID,
  company TEXT,
  position TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  current BOOLEAN,
  highlights TEXT[],
  description TEXT
) AS $$
  SELECT 
    id, 
    company, 
    position, 
    location, 
    start_date, 
    end_date, 
    current, 
    highlights, 
    description
  FROM work_experiences
  WHERE resume_id = p_resume_id
  ORDER BY 
    CASE WHEN current THEN 0 ELSE 1 END, 
    COALESCE(end_date, '9999-12-31'::DATE) DESC, 
    start_date DESC;
$$ LANGUAGE SQL STABLE;

-- Create function to get education
CREATE OR REPLACE FUNCTION get_resume_education(p_resume_id UUID)
RETURNS TABLE(
  id UUID,
  institution TEXT,
  degree TEXT,
  field TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  current BOOLEAN,
  gpa TEXT,
  highlights TEXT[]
) AS $$
  SELECT 
    id, 
    institution, 
    degree, 
    field, 
    location, 
    start_date, 
    end_date, 
    current, 
    gpa, 
    highlights
  FROM education
  WHERE resume_id = p_resume_id
  ORDER BY 
    CASE WHEN current THEN 0 ELSE 1 END, 
    COALESCE(end_date, '9999-12-31'::DATE) DESC, 
    start_date DESC;
$$ LANGUAGE SQL STABLE;

-- Create function to get skills
CREATE OR REPLACE FUNCTION get_resume_skills(p_resume_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  level skill_level_enum,
  category TEXT,
  years_of_experience INTEGER,
  is_key_skill BOOLEAN
) AS $$
  SELECT 
    id, 
    name, 
    level, 
    category, 
    years_of_experience, 
    is_key_skill
  FROM skills
  WHERE resume_id = p_resume_id
  ORDER BY 
    CASE 
      WHEN is_key_skill THEN 0 
      ELSE 1 
    END, 
    CASE level
      WHEN 'expert' THEN 0
      WHEN 'advanced' THEN 1
      WHEN 'intermediate' THEN 2
      WHEN 'beginner' THEN 3
      ELSE 4
    END,
    name;
$$ LANGUAGE SQL STABLE;

-- Create function to get projects
CREATE OR REPLACE FUNCTION get_resume_projects(p_resume_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  url TEXT,
  start_date DATE,
  end_date DATE,
  highlights TEXT[],
  technologies TEXT[],
  role TEXT,
  organization TEXT
) AS $$
  SELECT 
    id, 
    name, 
    description, 
    url, 
    start_date, 
    end_date, 
    highlights, 
    technologies, 
    role, 
    organization
  FROM projects
  WHERE resume_id = p_resume_id
  ORDER BY 
    COALESCE(end_date, '9999-12-31'::DATE) DESC, 
    COALESCE(start_date, '0001-01-01'::DATE) DESC;
$$ LANGUAGE SQL STABLE;

-- Create function to get certifications
CREATE OR REPLACE FUNCTION get_resume_certifications(p_resume_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  issuer TEXT,
  date DATE,
  expires DATE,
  url TEXT,
  description TEXT,
  credential_id TEXT
) AS $$
  SELECT 
    id, 
    name, 
    issuer, 
    date, 
    expires, 
    url, 
    description, 
    credential_id
  FROM certifications
  WHERE resume_id = p_resume_id
  ORDER BY 
    COALESCE(date, '0001-01-01'::DATE) DESC;
$$ LANGUAGE SQL STABLE;

-- Create function to get social links
CREATE OR REPLACE FUNCTION get_resume_social_links(p_resume_id UUID)
RETURNS TABLE(
  id UUID,
  platform TEXT,
  url TEXT,
  username TEXT,
  display_text TEXT,
  is_primary BOOLEAN
) AS $$
  SELECT 
    id, 
    platform, 
    url, 
    username, 
    display_text, 
    is_primary
  FROM social_links
  WHERE resume_id = p_resume_id
  ORDER BY 
    CASE WHEN is_primary THEN 0 ELSE 1 END,
    platform;
$$ LANGUAGE SQL STABLE;

-- Create function to get custom sections with entries
CREATE OR REPLACE FUNCTION get_resume_custom_sections(p_resume_id UUID)
RETURNS TABLE(
  section_id UUID,
  section_title TEXT,
  entries JSONB
) AS $$
  SELECT 
    cs.id AS section_id,
    cs.title AS section_title,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', ce.id,
          'title', ce.title,
          'subtitle', ce.subtitle,
          'date', ce.date,
          'description', ce.description,
          'bullets', ce.bullets
        ) ORDER BY ce.id
      ) FILTER (WHERE ce.id IS NOT NULL),
      '[]'::jsonb
    ) AS entries
  FROM custom_sections cs
  LEFT JOIN custom_entries ce ON cs.id = ce.custom_section_id
  WHERE cs.resume_id = p_resume_id
  GROUP BY cs.id, cs.title
  ORDER BY cs.id;
$$ LANGUAGE SQL STABLE;

-- Create function to get complete resume
CREATE OR REPLACE FUNCTION get_complete_resume(p_resume_id UUID, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_resume JSONB;
  v_basic JSONB;
  v_personal JSONB;
  v_summary JSONB;
  v_work JSONB;
  v_education JSONB;
  v_skills JSONB;
  v_projects JSONB;
  v_certifications JSONB;
  v_social JSONB;
  v_custom JSONB;
BEGIN
  -- Check ownership (for RLS compatibility)
  IF NOT EXISTS (
    SELECT 1 FROM resumes 
    WHERE id = p_resume_id AND user_id = p_user_id
  ) THEN
    RETURN NULL;
  END IF;

  -- Get basic resume info
  SELECT 
    jsonb_build_object(
      'id', r.id,
      'title', r.title,
      'targetJobTitle', r.target_job_title,
      'createdAt', r.created_at,
      'updatedAt', r.updated_at,
      'templateId', r.template_id,
      'isBaseResume', r.is_base_resume,
      'originalResumeId', r.original_resume_id,
      'jobDescriptionId', r.job_description_id,
      'atsScore', r.ats_score,
      'version', r.version,
      'metadata', r.metadata,
      'formatOptions', r.format_options
    )
  INTO v_basic
  FROM resumes r
  WHERE r.id = p_resume_id;

  -- Get personal info
  SELECT 
    jsonb_build_object(
      'fullName', p.full_name,
      'email', p.email,
      'phone', p.phone,
      'location', p.location,
      'linkedIn', p.linkedin,
      'website', p.website,
      'github', p.github
    )
  INTO v_personal
  FROM personal_info p
  WHERE p.resume_id = p_resume_id;

  -- Get professional summary
  SELECT 
    jsonb_build_object(
      'content', ps.content
    )
  INTO v_summary
  FROM professional_summary ps
  WHERE ps.resume_id = p_resume_id;

  -- Get work experiences
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'id', we.id,
        'company', we.company,
        'position', we.position,
        'location', we.location,
        'startDate', we.start_date,
        'endDate', we.end_date,
        'current', we.current,
        'highlights', we.highlights,
        'description', we.description,
        'industry', we.industry,
        'department', we.department
      ) ORDER BY 
        CASE WHEN we.current THEN 0 ELSE 1 END, 
        COALESCE(we.end_date, '9999-12-31'::DATE) DESC, 
        we.start_date DESC
    )
  INTO v_work
  FROM work_experiences we
  WHERE we.resume_id = p_resume_id;

  -- Get education
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'id', e.id,
        'institution', e.institution,
        'degree', e.degree,
        'field', e.field,
        'location', e.location,
        'startDate', e.start_date,
        'endDate', e.end_date,
        'current', e.current,
        'gpa', e.gpa,
        'highlights', e.highlights
      ) ORDER BY 
        CASE WHEN e.current THEN 0 ELSE 1 END, 
        COALESCE(e.end_date, '9999-12-31'::DATE) DESC, 
        e.start_date DESC
    )
  INTO v_education
  FROM education e
  WHERE e.resume_id = p_resume_id;

  -- Get skills
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'level', s.level,
        'category', s.category,
        'yearsOfExperience', s.years_of_experience,
        'isKeySkill', s.is_key_skill
      ) ORDER BY 
        CASE WHEN s.is_key_skill THEN 0 ELSE 1 END,
        CASE s.level
          WHEN 'expert' THEN 0
          WHEN 'advanced' THEN 1
          WHEN 'intermediate' THEN 2
          WHEN 'beginner' THEN 3
          ELSE 4
        END,
        s.name
    )
  INTO v_skills
  FROM skills s
  WHERE s.resume_id = p_resume_id;

  -- Get projects
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'description', p.description,
        'url', p.url,
        'startDate', p.start_date,
        'endDate', p.end_date,
        'highlights', p.highlights,
        'technologies', p.technologies,
        'role', p.role,
        'organization', p.organization
      ) ORDER BY 
        COALESCE(p.end_date, '9999-12-31'::DATE) DESC, 
        COALESCE(p.start_date, '0001-01-01'::DATE) DESC
    )
  INTO v_projects
  FROM projects p
  WHERE p.resume_id = p_resume_id;

  -- Get certifications
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'issuer', c.issuer,
        'date', c.date,
        'expires', c.expires,
        'url', c.url,
        'description', c.description,
        'credentialId', c.credential_id
      ) ORDER BY 
        COALESCE(c.date, '0001-01-01'::DATE) DESC
    )
  INTO v_certifications
  FROM certifications c
  WHERE c.resume_id = p_resume_id;

  -- Get social links
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'id', sl.id,
        'platform', sl.platform,
        'url', sl.url,
        'username', sl.username,
        'displayText', sl.display_text,
        'isPrimary', sl.is_primary
      ) ORDER BY 
        CASE WHEN sl.is_primary THEN 0 ELSE 1 END,
        sl.platform
    )
  INTO v_social
  FROM social_links sl
  WHERE sl.resume_id = p_resume_id;

  -- Get custom sections with entries
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'id', cs.id,
        'title', cs.title,
        'entries', COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', ce.id,
              'title', ce.title,
              'subtitle', ce.subtitle,
              'date', ce.date,
              'description', ce.description,
              'bullets', ce.bullets
            ) ORDER BY ce.id
          ) FILTER (WHERE ce.id IS NOT NULL),
          '[]'::jsonb
        )
      )
    )
  INTO v_custom
  FROM custom_sections cs
  LEFT JOIN custom_entries ce ON cs.id = ce.custom_section_id
  WHERE cs.resume_id = p_resume_id
  GROUP BY cs.id, cs.title;

  -- Combine all data into a complete resume object
  v_resume := v_basic;
  v_resume := v_resume || jsonb_build_object('personalInfo', COALESCE(v_personal, '{}'::jsonb));
  v_resume := v_resume || jsonb_build_object('professionalSummary', COALESCE(v_summary, '{"content":""}'::jsonb));
  v_resume := v_resume || jsonb_build_object('workExperiences', COALESCE(v_work, '[]'::jsonb));
  v_resume := v_resume || jsonb_build_object('education', COALESCE(v_education, '[]'::jsonb));
  v_resume := v_resume || jsonb_build_object('skills', COALESCE(v_skills, '[]'::jsonb));
  v_resume := v_resume || jsonb_build_object('projects', COALESCE(v_projects, '[]'::jsonb));
  v_resume := v_resume || jsonb_build_object('certifications', COALESCE(v_certifications, '[]'::jsonb));
  v_resume := v_resume || jsonb_build_object('socialLinks', COALESCE(v_social, '[]'::jsonb));
  v_resume := v_resume || jsonb_build_object('customSections', COALESCE(v_custom, '[]'::jsonb));

  RETURN v_resume;
END;
$$ LANGUAGE plpgsql STABLE;