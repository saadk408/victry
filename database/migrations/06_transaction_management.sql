-- Victry Database Optimization: Part 6 - Robust Transaction Management
-- This migration creates stored procedures for complex operations

-- Create resume creation function with error handling
CREATE OR REPLACE FUNCTION create_resume_complete(
  p_user_id UUID,
  p_title TEXT,
  p_target_job_title TEXT,
  p_template_id TEXT,
  p_personal_info JSONB,
  p_professional_summary JSONB,
  p_work_experiences JSONB,
  p_education JSONB,
  p_skills JSONB,
  p_projects JSONB,
  p_certifications JSONB,
  p_social_links JSONB,
  p_custom_sections JSONB,
  OUT resume_id UUID
) RETURNS UUID AS $$
DECLARE
  v_error_context TEXT;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Start transaction
  BEGIN
    -- Insert resume
    INSERT INTO resumes(
      id, user_id, title, target_job_title, template_id, 
      created_at, updated_at, version, is_base_resume
    )
    VALUES(
      gen_random_uuid(), p_user_id, p_title, p_target_job_title, p_template_id, 
      v_now, v_now, 1, COALESCE((p_personal_info->>'isBaseResume')::BOOLEAN, false)
    )
    RETURNING id INTO resume_id;
    
    -- Insert personal info with error handling
    BEGIN
      INSERT INTO personal_info(
        resume_id, full_name, email, phone, location, 
        linkedin, website, github
      )
      VALUES(
        resume_id,
        p_personal_info->>'fullName',
        p_personal_info->>'email',
        p_personal_info->>'phone',
        p_personal_info->>'location',
        p_personal_info->>'linkedIn',
        p_personal_info->>'website',
        p_personal_info->>'github'
      );
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
      RAISE WARNING 'Personal info insert failed: %, Context: %', SQLERRM, v_error_context;
      -- Continue with transaction, don't abort entirely
    END;
    
    -- Insert professional summary
    BEGIN
      INSERT INTO professional_summary(resume_id, content)
      VALUES(resume_id, p_professional_summary->>'content');
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Professional summary insert failed: %', SQLERRM;
    END;
    
    -- Insert work experiences if provided
    IF p_work_experiences IS NOT NULL AND jsonb_array_length(p_work_experiences) > 0 THEN
      FOR i IN 0..jsonb_array_length(p_work_experiences)-1 LOOP
        BEGIN
          INSERT INTO work_experiences(
            id, resume_id, company, position, location, 
            start_date, end_date, current, highlights,
            description, industry, department
          )
          VALUES(
            gen_random_uuid(),
            resume_id,
            p_work_experiences->i->>'company',
            p_work_experiences->i->>'position',
            p_work_experiences->i->>'location',
            (p_work_experiences->i->>'startDate')::DATE,
            CASE WHEN (p_work_experiences->i->>'current')::BOOLEAN = true 
              THEN NULL 
              ELSE (p_work_experiences->i->>'endDate')::DATE 
            END,
            COALESCE((p_work_experiences->i->>'current')::BOOLEAN, false),
            COALESCE((p_work_experiences->i->'highlights')::TEXT::TEXT[], ARRAY[]::TEXT[]),
            p_work_experiences->i->>'description',
            p_work_experiences->i->>'industry',
            p_work_experiences->i->>'department'
          );
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Work experience insert failed: %', SQLERRM;
        END;
      END LOOP;
    END IF;
    
    -- Insert education entries if provided
    IF p_education IS NOT NULL AND jsonb_array_length(p_education) > 0 THEN
      FOR i IN 0..jsonb_array_length(p_education)-1 LOOP
        BEGIN
          INSERT INTO education(
            id, resume_id, institution, degree, field, location,
            start_date, end_date, current, gpa, highlights
          )
          VALUES(
            gen_random_uuid(),
            resume_id,
            p_education->i->>'institution',
            p_education->i->>'degree',
            p_education->i->>'field',
            p_education->i->>'location',
            (p_education->i->>'startDate')::DATE,
            CASE WHEN (p_education->i->>'current')::BOOLEAN = true 
              THEN NULL 
              ELSE (p_education->i->>'endDate')::DATE 
            END,
            COALESCE((p_education->i->>'current')::BOOLEAN, false),
            p_education->i->>'gpa',
            COALESCE((p_education->i->'highlights')::TEXT::TEXT[], ARRAY[]::TEXT[])
          );
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Education insert failed: %', SQLERRM;
        END;
      END LOOP;
    END IF;
    
    -- Insert skills if provided
    IF p_skills IS NOT NULL AND jsonb_array_length(p_skills) > 0 THEN
      FOR i IN 0..jsonb_array_length(p_skills)-1 LOOP
        BEGIN
          INSERT INTO skills(
            id, resume_id, name, level, category, 
            years_of_experience, is_key_skill
          )
          VALUES(
            gen_random_uuid(),
            resume_id,
            p_skills->i->>'name',
            (p_skills->i->>'level')::skill_level_enum,
            p_skills->i->>'category',
            (p_skills->i->>'yearsOfExperience')::INTEGER,
            (p_skills->i->>'isKeySkill')::BOOLEAN
          );
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Skill insert failed: %', SQLERRM;
        END;
      END LOOP;
    END IF;
    
    -- Insert projects if provided
    IF p_projects IS NOT NULL AND jsonb_array_length(p_projects) > 0 THEN
      FOR i IN 0..jsonb_array_length(p_projects)-1 LOOP
        BEGIN
          INSERT INTO projects(
            id, resume_id, name, description, url,
            start_date, end_date, highlights, technologies,
            role, organization
          )
          VALUES(
            gen_random_uuid(),
            resume_id,
            p_projects->i->>'name',
            p_projects->i->>'description',
            p_projects->i->>'url',
            (p_projects->i->>'startDate')::DATE,
            (p_projects->i->>'endDate')::DATE,
            COALESCE((p_projects->i->'highlights')::TEXT::TEXT[], ARRAY[]::TEXT[]),
            COALESCE((p_projects->i->'technologies')::TEXT::TEXT[], ARRAY[]::TEXT[]),
            p_projects->i->>'role',
            p_projects->i->>'organization'
          );
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Project insert failed: %', SQLERRM;
        END;
      END LOOP;
    END IF;
    
    -- Insert certifications if provided
    IF p_certifications IS NOT NULL AND jsonb_array_length(p_certifications) > 0 THEN
      FOR i IN 0..jsonb_array_length(p_certifications)-1 LOOP
        BEGIN
          INSERT INTO certifications(
            id, resume_id, name, issuer, date, expires,
            url, description, credential_id
          )
          VALUES(
            gen_random_uuid(),
            resume_id,
            p_certifications->i->>'name',
            p_certifications->i->>'issuer',
            (p_certifications->i->>'date')::DATE,
            (p_certifications->i->>'expires')::DATE,
            p_certifications->i->>'url',
            p_certifications->i->>'description',
            p_certifications->i->>'credentialId'
          );
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Certification insert failed: %', SQLERRM;
        END;
      END LOOP;
    END IF;
    
    -- Insert social links if provided
    IF p_social_links IS NOT NULL AND jsonb_array_length(p_social_links) > 0 THEN
      FOR i IN 0..jsonb_array_length(p_social_links)-1 LOOP
        BEGIN
          INSERT INTO social_links(
            id, resume_id, platform, url, username,
            display_text, is_primary
          )
          VALUES(
            gen_random_uuid(),
            resume_id,
            p_social_links->i->>'platform',
            p_social_links->i->>'url',
            p_social_links->i->>'username',
            p_social_links->i->>'displayText',
            (p_social_links->i->>'isPrimary')::BOOLEAN
          );
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Social link insert failed: %', SQLERRM;
        END;
      END LOOP;
    END IF;
    
    -- Insert custom sections if provided
    IF p_custom_sections IS NOT NULL AND jsonb_array_length(p_custom_sections) > 0 THEN
      FOR i IN 0..jsonb_array_length(p_custom_sections)-1 LOOP
        DECLARE
          v_section_id UUID;
          v_entries JSONB;
        BEGIN
          -- Insert custom section
          INSERT INTO custom_sections(
            id, resume_id, title
          )
          VALUES(
            gen_random_uuid(),
            resume_id,
            p_custom_sections->i->>'title'
          )
          RETURNING id INTO v_section_id;
          
          -- Get entries array
          v_entries := p_custom_sections->i->'entries';
          
          -- Insert entries if provided
          IF v_entries IS NOT NULL AND jsonb_array_length(v_entries) > 0 THEN
            FOR j IN 0..jsonb_array_length(v_entries)-1 LOOP
              BEGIN
                INSERT INTO custom_entries(
                  id, custom_section_id, title, subtitle,
                  date, description, bullets
                )
                VALUES(
                  gen_random_uuid(),
                  v_section_id,
                  v_entries->j->>'title',
                  v_entries->j->>'subtitle',
                  (v_entries->j->>'date')::DATE,
                  v_entries->j->>'description',
                  COALESCE((v_entries->j->'bullets')::TEXT::TEXT[], ARRAY[]::TEXT[])
                );
              EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Custom entry insert failed: %', SQLERRM;
              END;
            END LOOP;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Custom section insert failed: %', SQLERRM;
        END;
      END LOOP;
    END IF;
    
  COMMIT;
  RETURN;
  EXCEPTION WHEN OTHERS THEN
    ROLLBACK;
    RAISE EXCEPTION 'Resume creation failed: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql;

-- Create resume update function with optimistic concurrency control
CREATE OR REPLACE FUNCTION update_resume(
  p_resume_id UUID,
  p_title TEXT,
  p_target_job_title TEXT,
  p_template_id TEXT,
  p_version INTEGER,
  OUT new_version INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE resumes
  SET 
    title = p_title,
    target_job_title = p_target_job_title,
    template_id = p_template_id,
    updated_at = NOW(),
    version = version + 1
  WHERE id = p_resume_id AND version = p_version
  RETURNING version INTO new_version;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  IF v_count = 0 THEN
    RAISE EXCEPTION 'Concurrent update detected - resume may have been modified by another user';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create resume duplication function
CREATE OR REPLACE FUNCTION duplicate_resume(
  p_original_id UUID,
  p_title TEXT,
  OUT new_id UUID
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Start transaction
  BEGIN
    -- Get user ID from original resume
    SELECT user_id INTO v_user_id
    FROM resumes
    WHERE id = p_original_id;
    
    IF v_user_id IS NULL THEN
      RAISE EXCEPTION 'Original resume not found';
    END IF;
    
    -- Insert new resume record
    INSERT INTO resumes (
      id, user_id, title, target_job_title, template_id, 
      created_at, updated_at, is_base_resume, original_resume_id,
      job_description_id, ats_score, metadata, format_options, version
    )
    SELECT 
      gen_random_uuid(), user_id, p_title, target_job_title, template_id,
      v_now, v_now, FALSE, id,
      job_description_id, ats_score, metadata, format_options, 1
    FROM resumes
    WHERE id = p_original_id
    RETURNING id INTO new_id;
    
    -- Duplicate personal info
    INSERT INTO personal_info (
      resume_id, full_name, email, phone, location, 
      linkedin, website, github
    )
    SELECT 
      new_id, full_name, email, phone, location,
      linkedin, website, github
    FROM personal_info
    WHERE resume_id = p_original_id;
    
    -- Duplicate professional summary
    INSERT INTO professional_summary (
      resume_id, content
    )
    SELECT 
      new_id, content
    FROM professional_summary
    WHERE resume_id = p_original_id;
    
    -- Duplicate work experiences
    INSERT INTO work_experiences (
      id, resume_id, company, position, location, 
      start_date, end_date, current, highlights,
      description, industry, department
    )
    SELECT 
      gen_random_uuid(), new_id, company, position, location,
      start_date, end_date, current, highlights,
      description, industry, department
    FROM work_experiences
    WHERE resume_id = p_original_id;
    
    -- Duplicate education
    INSERT INTO education (
      id, resume_id, institution, degree, field, 
      location, start_date, end_date, current, 
      gpa, highlights
    )
    SELECT 
      gen_random_uuid(), new_id, institution, degree, field,
      location, start_date, end_date, current,
      gpa, highlights
    FROM education
    WHERE resume_id = p_original_id;
    
    -- Duplicate skills
    INSERT INTO skills (
      id, resume_id, name, level, category,
      years_of_experience, is_key_skill
    )
    SELECT 
      gen_random_uuid(), new_id, name, level, category,
      years_of_experience, is_key_skill
    FROM skills
    WHERE resume_id = p_original_id;
    
    -- Duplicate projects
    INSERT INTO projects (
      id, resume_id, name, description, url,
      start_date, end_date, highlights, technologies,
      role, organization
    )
    SELECT 
      gen_random_uuid(), new_id, name, description, url,
      start_date, end_date, highlights, technologies,
      role, organization
    FROM projects
    WHERE resume_id = p_original_id;
    
    -- Duplicate certifications
    INSERT INTO certifications (
      id, resume_id, name, issuer, date,
      expires, url, description, credential_id
    )
    SELECT 
      gen_random_uuid(), new_id, name, issuer, date,
      expires, url, description, credential_id
    FROM certifications
    WHERE resume_id = p_original_id;
    
    -- Duplicate social links
    INSERT INTO social_links (
      id, resume_id, platform, url, username,
      display_text, is_primary
    )
    SELECT 
      gen_random_uuid(), new_id, platform, url, username,
      display_text, is_primary
    FROM social_links
    WHERE resume_id = p_original_id;
    
    -- Duplicate custom sections and their entries
    FOR r IN SELECT id, title FROM custom_sections WHERE resume_id = p_original_id LOOP
      DECLARE
        v_section_id UUID;
      BEGIN
        -- Insert custom section
        INSERT INTO custom_sections (
          id, resume_id, title
        ) VALUES (
          gen_random_uuid(), new_id, r.title
        ) 
        RETURNING id INTO v_section_id;
        
        -- Insert entries for this section
        INSERT INTO custom_entries (
          id, custom_section_id, title, subtitle,
          date, description, bullets
        )
        SELECT 
          gen_random_uuid(), v_section_id, title, subtitle,
          date, description, bullets
        FROM custom_entries
        WHERE custom_section_id = r.id;
      END;
    END LOOP;
    
  COMMIT;
  RETURN;
  EXCEPTION WHEN OTHERS THEN
    ROLLBACK;
    RAISE EXCEPTION 'Resume duplication failed: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql;