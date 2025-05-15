-- Victry Database Optimization: Part 3 - JSON Storage Optimization
-- This migration converts appropriate columns to JSONB for more flexible storage

-- Convert format_options column to JSONB with schema validation
ALTER TABLE resumes ADD COLUMN format_options_jsonb JSONB;
UPDATE resumes SET format_options_jsonb = format_options::JSONB WHERE format_options IS NOT NULL;
ALTER TABLE resumes DROP COLUMN format_options;
ALTER TABLE resumes RENAME COLUMN format_options_jsonb TO format_options;

-- Add JSONB index for efficient JSON queries
CREATE INDEX idx_resumes_format_options ON resumes USING GIN(format_options);

-- Convert metadata to JSONB (if not already)
ALTER TABLE resumes ADD COLUMN metadata_jsonb JSONB;
UPDATE resumes SET metadata_jsonb = metadata::JSONB WHERE metadata IS NOT NULL;
ALTER TABLE resumes DROP COLUMN metadata;
ALTER TABLE resumes RENAME COLUMN metadata_jsonb TO metadata;

-- Add JSONB index for metadata
CREATE INDEX idx_resumes_metadata ON resumes USING GIN(metadata);

-- Function to extract specific JSONB paths efficiently
CREATE OR REPLACE FUNCTION get_resume_font_settings(resume_id UUID)
RETURNS TABLE(font_family TEXT, font_size INTEGER) AS $$
  SELECT 
    (format_options->>'fontFamily')::TEXT,
    (format_options->>'fontSize')::INTEGER
  FROM resumes 
  WHERE id = resume_id;
$$ LANGUAGE SQL STABLE;

-- Function to extract primary color from format_options
CREATE OR REPLACE FUNCTION get_resume_colors(resume_id UUID)
RETURNS TABLE(primary_color TEXT, secondary_color TEXT) AS $$
  SELECT 
    (format_options->>'primaryColor')::TEXT,
    (format_options->>'secondaryColor')::TEXT
  FROM resumes 
  WHERE id = resume_id;
$$ LANGUAGE SQL STABLE;

-- Add JSON schema validation if pg_jsonschema extension is available
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_jsonschema'
  ) THEN
    EXECUTE $SQL$
      ALTER TABLE resumes ADD CONSTRAINT format_options_schema CHECK (
        json_matches_schema(
          '{
            "type": "object",
            "properties": {
              "fontFamily": { "type": "string" },
              "fontSize": { "type": "number" },
              "primaryColor": { "type": "string" },
              "secondaryColor": { "type": "string" },
              "sectionOrder": { 
                "type": "array",
                "items": { "type": "string" }
              },
              "margins": {
                "type": "object",
                "properties": {
                  "top": { "type": "number" },
                  "right": { "type": "number" },
                  "bottom": { "type": "number" },
                  "left": { "type": "number" }
                }
              }
            }
          }',
          format_options
        )
      );
    $SQL$;
  END IF;
END
$$;