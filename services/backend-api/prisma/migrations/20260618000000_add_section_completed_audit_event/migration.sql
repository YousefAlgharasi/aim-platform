-- P19-008: Add section_completed event type to placement_audit_log
-- Branch: phase19/P19-008-placement-analytics
-- Dependency: P4-025 (placement_audit_log migration)
-- Scope: Extend the placement_audit_log event_type CHECK constraint only.
--
-- The placement analytics service reuses placement_audit_log to record
-- section-level completion events (accuracy, time spent) needed for
-- per-section analytics aggregation. No new table is required.

ALTER TABLE placement_audit_log
  DROP CONSTRAINT placement_audit_log_event_type_check;

ALTER TABLE placement_audit_log
  ADD CONSTRAINT placement_audit_log_event_type_check
  CHECK (event_type IN (
    'attempt_started',
    'answer_submitted',
    'attempt_submitted',
    'attempt_completed',
    'attempt_abandoned',
    'result_generated',
    'path_assigned',
    'section_completed'
  ));
