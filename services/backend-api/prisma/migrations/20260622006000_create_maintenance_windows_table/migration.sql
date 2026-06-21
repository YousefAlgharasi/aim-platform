-- P17-016: Create maintenance windows table
-- Scheduled and emergency maintenance windows with affected services.

CREATE TABLE IF NOT EXISTS maintenance_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title VARCHAR(500) NOT NULL,
  description TEXT,

  type VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'scheduled',

  affected_services TEXT[] NOT NULL DEFAULT '{}',

  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,

  user_message TEXT,

  created_by UUID NOT NULL
    REFERENCES users (id),

  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT maintenance_windows_type_check
    CHECK (type IN ('planned', 'emergency')),

  CONSTRAINT maintenance_windows_status_check
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'))
);

CREATE OR REPLACE FUNCTION set_maintenance_windows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS maintenance_windows_set_updated_at ON maintenance_windows;

CREATE TRIGGER maintenance_windows_set_updated_at
BEFORE UPDATE ON maintenance_windows
FOR EACH ROW
EXECUTE FUNCTION set_maintenance_windows_updated_at();
