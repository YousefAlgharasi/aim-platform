-- P17-022: Add post-launch seed fixtures
-- Safe development seed data for operational status, feature flags, and release notes.
-- No real user data, secrets, or production data.

-- Seed operational status components
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM operational_status WHERE component = 'API') THEN
    INSERT INTO operational_status (id, component, status)
    VALUES ('a0000000-0000-0000-0000-000000000001', 'API', 'operational');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM operational_status WHERE component = 'Database') THEN
    INSERT INTO operational_status (id, component, status)
    VALUES ('a0000000-0000-0000-0000-000000000002', 'Database', 'operational');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM operational_status WHERE component = 'Mobile App') THEN
    INSERT INTO operational_status (id, component, status)
    VALUES ('a0000000-0000-0000-0000-000000000003', 'Mobile App', 'operational');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM operational_status WHERE component = 'Admin Dashboard') THEN
    INSERT INTO operational_status (id, component, status)
    VALUES ('a0000000-0000-0000-0000-000000000004', 'Admin Dashboard', 'operational');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM operational_status WHERE component = 'Parent Dashboard') THEN
    INSERT INTO operational_status (id, component, status)
    VALUES ('a0000000-0000-0000-0000-000000000005', 'Parent Dashboard', 'operational');
  END IF;
END $$;

-- Seed sample feature flag
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM feature_flags WHERE flag_key = 'dark_mode') THEN
    INSERT INTO feature_flags (id, flag_key, name, description, enabled, rollout_percentage)
    VALUES (
      'b0000000-0000-0000-0000-000000000001',
      'dark_mode',
      'Dark Mode',
      'Enable dark mode theme across the platform',
      false,
      0
    );
  END IF;
END $$;

-- Seed sample release note
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM release_notes WHERE version = 'v1.0.0') THEN
    INSERT INTO release_notes (id, version, title, body, audience, status, created_by)
    VALUES (
      'c0000000-0000-0000-0000-000000000001',
      'v1.0.0',
      'AIM Platform v1.0.0',
      'Initial release of the AIM Platform with core learning, assessment, and communication features.',
      'all',
      'draft',
      (SELECT id FROM users LIMIT 1)
    );
  END IF;
END $$;
