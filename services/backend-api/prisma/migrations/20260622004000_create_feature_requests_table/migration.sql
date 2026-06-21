-- P17-014: Create feature requests table
-- User-submitted feature requests with voting and triage workflow.

CREATE TABLE IF NOT EXISTS feature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  submitted_by UUID NOT NULL
    REFERENCES users (id),

  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,

  status VARCHAR(30) NOT NULL DEFAULT 'new',
  priority VARCHAR(20),

  vote_count INT NOT NULL DEFAULT 0,

  triage_notes TEXT,
  triaged_by UUID
    REFERENCES users (id),
  triaged_at TIMESTAMPTZ,

  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT feature_requests_status_check
    CHECK (status IN ('new', 'under_review', 'planned', 'in_progress', 'completed', 'declined')),

  CONSTRAINT feature_requests_priority_check
    CHECK (priority IS NULL OR priority IN ('low', 'medium', 'high', 'critical'))
);

CREATE OR REPLACE FUNCTION set_feature_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS feature_requests_set_updated_at ON feature_requests;

CREATE TRIGGER feature_requests_set_updated_at
BEFORE UPDATE ON feature_requests
FOR EACH ROW
EXECUTE FUNCTION set_feature_requests_updated_at();
