-- P17-015: Create incident records table
-- Tracks platform incidents with severity, status, and postmortem workflow.

CREATE TABLE IF NOT EXISTS incident_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,

  severity VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'investigating',

  impact TEXT,

  started_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,

  owner_id UUID
    REFERENCES users (id),

  postmortem_url TEXT,

  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT incident_records_severity_check
    CHECK (severity IN ('minor', 'major', 'critical')),

  CONSTRAINT incident_records_status_check
    CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved', 'postmortem'))
);

CREATE OR REPLACE FUNCTION set_incident_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS incident_records_set_updated_at ON incident_records;

CREATE TRIGGER incident_records_set_updated_at
BEFORE UPDATE ON incident_records
FOR EACH ROW
EXECUTE FUNCTION set_incident_records_updated_at();
