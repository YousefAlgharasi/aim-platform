-- P17-017: Create release notes table
-- Platform release notes with audience targeting and publishing workflow.

CREATE TABLE IF NOT EXISTS release_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  version VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  body TEXT,

  audience VARCHAR(30) NOT NULL DEFAULT 'all',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',

  published_at TIMESTAMPTZ,
  published_by UUID
    REFERENCES users (id),

  created_by UUID NOT NULL
    REFERENCES users (id),

  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT release_notes_audience_check
    CHECK (audience IN ('all', 'students', 'parents', 'admins', 'internal')),

  CONSTRAINT release_notes_status_check
    CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE OR REPLACE FUNCTION set_release_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS release_notes_set_updated_at ON release_notes;

CREATE TRIGGER release_notes_set_updated_at
BEFORE UPDATE ON release_notes
FOR EACH ROW
EXECUTE FUNCTION set_release_notes_updated_at();
