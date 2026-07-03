-- P20-004: Backfill initial_learning_path.skill_id for existing entry_type='skill' rows.
-- The application-level bug (PlacementInitialLearningPathService always writing
-- skill_id: null) meant entry_type was in practice never actually 'skill' for
-- rows written before the code fix, so this is a defensive one-off cleanup for
-- any pre-existing skill-type rows this join can resolve, not a bulk data
-- rewrite of section-type rows.
--
-- Resolution: join on skills.key (unique), trying skill_key first, then
-- skill_code, since either may hold the matching key value depending on how
-- the row was written.

DO $$
DECLARE
  r RECORD;
  matched_id UUID;
BEGIN
  FOR r IN
    SELECT id, skill_code, skill_key, skill_name
    FROM initial_learning_path
    WHERE entry_type = 'skill' AND skill_id IS NULL
  LOOP
    SELECT id INTO matched_id
    FROM skills
    WHERE key = COALESCE(r.skill_key, r.skill_code)
    LIMIT 1;

    IF matched_id IS NOT NULL THEN
      UPDATE initial_learning_path
      SET skill_id = matched_id
      WHERE id = r.id;
    ELSE
      RAISE NOTICE 'initial_learning_path.% (skill_name: "%", skill_code: %, skill_key: %) is entry_type=skill with skill_id NULL but no matching skills.key was found — left unresolved.', r.id, r.skill_name, r.skill_code, r.skill_key;
    END IF;
  END LOOP;
END $$;
