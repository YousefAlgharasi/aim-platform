# 04 — Database

> Last verified: 2026-07-04, by live query against Supabase project `yrarpdkvdxszgxxondkt` (`list_tables`, `execute_sql`) in this session. RLS status re-verified live (not reused from a stale doc) since this session also fixed the 8 previously-disabled tables.

**132 tables in the `public` schema.** `schema.prisma` models only **15 of
132** — it is not a complete schema; the live DB is the sole complete
source of truth (confirmed drift, not assumed).

**RLS status: all 132 tables now have RLS enabled**, verified live via
`pg_tables.rowsecurity = true` after this session applied migration
`20260704030000_apply_rls_missing_tables`. Before this session, 8 tables
were disabled (see `13-risk-register.md` for the incident detail;
`09-decisions.md` for the fix decision).

## By domain (one line each, RLS status noted only where it's the interesting case — all are now `true`)

### Auth / Identity
`users`, `roles`, `permissions`, `role_permissions`, `student_profiles`,
`admin_profiles`, `user_roles`, `auth_audit_logs` (append-only) — backend-owned
identity/authorization tables, Supabase Auth UID-linked.

### Curriculum (Phase 3)
`courses`, `levels`, `chapters`, `skills`, `objectives`, `objective_skills`,
`lessons`, `lesson_assets`, `lesson_objectives`, `lesson_skills`,
`question_bank`, `question_choices`, `question_answers`, `questions`,
`question_skill_links`, `question_skills`, `curriculum_audit_logs`
(append-only) — backend is sole authority for status/ordering/publish
gating (see `01-business-rules.md`).

### Placement (Phase 4)
`placement_tests`, `placement_sections`, `placement_attempts`,
`placement_questions`, `placement_answers`, `placement_question_skills`,
`placement_results`, `initial_learning_path` (immutable after write),
`placement_audit_log`.

### AIM Engine output (Phase 5)
`student_skill_states`, `learning_sessions`, `session_events`,
`lesson_attempts`, `weakness_records`, `difficulty_decisions`,
`recommendations`, `review_schedules`, `session_summaries`, `aim_audit_log`
(append-only, backend-only writer), `answers`, `mistakes`, `error_patterns`
— all row counts were `0` at verification time except where noted; this is
consistent with a low-activity/pilot environment, not necessarily a broken
pipeline (the pipeline itself was independently confirmed real/wired this
session).

### AI Teacher / Voice Teacher (Phases 8–9, unified Phase 21)
`ai_chat_sessions` (26 rows), `ai_chat_messages` (34 rows — real live data,
confirming Phase 21 unification is actually in use), `ai_context_snapshots`
(15), `ai_provider_logs` (15), `ai_safety_events` (15), `ai_teacher_feedback`
(2). Legacy, now historical-only per P21-021: `voice_sessions`,
`voice_messages`, `voice_audio_assets`, `voice_provider_logs`,
`voice_transcripts`, `voice_safety_events`, `voice_feedback` — **all 0 rows**,
confirming the frozen/historical status live, not just per doc claim.
Separate, later-added AI-teacher-admin tables (Phase 22-ish naming,
`ai_teacher_conversations`, `ai_teacher_messages`, `ai_voice_sessions`,
`ai_prompt_templates`, `ai_model_configs`, `ai_teacher_safety_checks`,
`ai_usage_cost_events`, `ai_teacher_feedback_entries`,
`ai_teacher_audit_logs`) exist alongside the above — their relationship to
the Phase 8/9/21 tables (duplicate admin-governance layer vs. distinct
system) was **not fully traced in this pass**; treat as **Unknown** pending
a dedicated read of `admin/ai-teacher/*` services against both table sets.

### Assessments (Phase 10)
`assessments`, `assessment_sections`, `assessment_settings`,
`assessment_deadlines`, `assessment_questions`, `assessment_attempts`,
`deadline_events` (append-only), `assessment_attempt_answers`,
`assessment_results`, `assessment_result_breakdowns`, `assessment_audit_logs`.

### Parents
`parent_child_links`, `parent_invitations`, `parent_consents`,
`parent_access_audit_logs`, `parent_notification_preferences`.

### Notifications
`notification_templates`, `notification_preferences`, `device_tokens`,
`notification_events` (62 rows — real activity, but see `13-risk-register.md`:
delivery is never actually dispatched, only enqueued), `reminder_schedules`,
`notification_delivery_attempts`, `notification_digests`,
`notification_quiet_hours`, `notification_audit_logs`.

### Billing
`billing_products`, `billing_prices`, `billing_plans`,
`billing_entitlements` (36 rows), `subscriptions` (7), `checkout_sessions`
(9), `payments`, `invoices`, `invoice_items`, `refunds`, `coupons` (1),
`promotion_codes` (1), `payment_provider_events`, `billing_audit_logs` (11)
— real DB activity exists despite no real payment-provider SDK being bound
(see `13-risk-register.md`); this data is either seed/test fixtures or
represents flows exercised before an adapter was stubbed out — which,
is **Unknown**.

### Analytics
`analytics_events` (139), `metric_definitions`, `metric_aggregates`,
`report_definitions`, `report_runs`, `dashboard_widgets`, `export_jobs`,
`analytics_access_audit_logs` (34), `analytics_cohorts` (1),
`analytics_cohort_members`.

### Operations / Support
`support_tickets`, `support_ticket_comments`, `user_feedback`,
`feature_requests`, `incident_records`, `maintenance_windows`,
`release_notes`, `operational_status`, `feature_flags`,
`operations_audit_logs`.

### Engagement / Achievements / Level state (the previously-RLS-disabled set)
`lesson_progress`, `student_learning_goals`, `daily_challenge_templates`,
`admin_broadcast_schedules`, `achievement_definitions`,
`student_achievements`, `xp_levels`, `student_level_state` (drives real
course-gating decisions, see `01-business-rules.md`), `ai_focus_directives`
— **these 8 are the tables whose RLS was disabled until this session's
fix**; all now confirmed `rowsecurity = true`.

### Migrations bookkeeping
`_prisma_migrations` (155 rows at last check, RLS enabled).

## Migration ledger status

159 migration directories exist under
`services/backend-api/prisma/migrations/`. As of this session:
- Reconciled: 11 migrations that were applied to the live DB out-of-band
  (via `mcp__Supabase__apply_migration`, not `prisma migrate deploy`) but
  were missing from `_prisma_migrations` were inserted with real sha256
  checksums matching their `.sql` files (see `09-decisions.md`).
- Known pre-existing duplicate/rolled-back rows in `_prisma_migrations`
  (e.g. `add_assessment_db_constraints` recorded 3×, `create_lesson_progress_table`
  recorded 3×) were **not** cleaned up this session — only the 11 missing
  entries were added. `prisma migrate status` could not be run in this
  environment (no reachable `DATABASE_URL` from this sandbox — connection
  attempt failed with P1001).

## What is Unknown

- Whether the newer `ai_teacher_*`/`ai_voice_sessions`/`ai_prompt_templates`
  admin-governance table set is a parallel system to the Phase 8/9 chat/voice
  tables or feeds from/into them.
- Whether `packages/content`'s static curriculum JSON was ever used to seed
  any of the curriculum tables, or the current rows were entered by a
  different, unidentified process.
- Whether the pre-existing duplicate rows in `_prisma_migrations` cause any
  real problem for `prisma migrate deploy` beyond the 11 gaps this session
  closed — not exhaustively tested against a real `migrate deploy` run.
