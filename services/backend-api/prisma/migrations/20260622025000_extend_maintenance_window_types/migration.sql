ALTER TABLE maintenance_windows
  DROP CONSTRAINT maintenance_windows_type_check;

ALTER TABLE maintenance_windows
  ADD CONSTRAINT maintenance_windows_type_check
    CHECK (type IN ('planned', 'emergency', 'routine', 'upgrade'));
