# Phase 9 — Voice RLS/Permission Policy Review

> Phase 9 — P9-026  
> Scope: Row-level security and permission policy for AI Teacher Voice Mode
> tables (`voice_sessions`, `voice_messages`, `voice_audio_assets`,
> `voice_provider_logs`, `voice_transcripts`, `voice_safety_events`,
> `voice_feedback`).

## Review Status

**Status: FAIL — RLS is not yet enabled on any AI Teacher Voice Mode table.**

The ownership columns and FK structure required for backend-enforced
ownership are in place across all seven voice tables, consistent with
the authority boundary rules documented in each migration file and with
`docs/phase-9/voice-architecture.md`. However, none of the voice tables
created in P9-018 through P9-024 have Row Level Security enabled, unlike
the equivalent Phase 3/4/5 tables, which all received a dedicated
deny-all-by-default RLS migration
(`20260617110000_apply_foundation_rls_policies`). The Phase 8 AI Teacher
chat tables share this same gap (documented in
`docs/quality/phase-8-ai-chat-rls-review.md`). This should be closed
with a follow-up migration before any direct Supabase client access path
is exposed.

---

## Method

This is a static review of migration files; no live database connection
is available in this agent environment (`psql` is installed, but no
`DATABASE_URL`/`.env` with real connection details exists in this
sandbox; live `SELECT * FROM pg_policies WHERE tablename = '...'`
verification could not be run). Findings below are based on direct
inspection of the migration SQL that defines each voice table.

---

## Migrations Reviewed

| Migration | Table | Task |
|---|---|---|
| `20260619000000_create_voice_sessions_table` | `voice_sessions` | P9-018 |
| `20260619001000_create_voice_messages_table` | `voice_messages` | P9-019 |
| `20260619002000_create_voice_audio_assets_table` | `voice_audio_assets` | P9-020 |
| `20260619003000_create_voice_provider_logs_table` | `voice_provider_logs` | P9-022 |
| `20260619004000_create_voice_transcripts_table` | `voice_transcripts` | P9-021 |
| `20260619005000_create_voice_safety_events_table` | `voice_safety_events` | P9-023 |
| `20260619006000_create_voice_feedback_table` | `voice_feedback` | P9-024 |
| `20260619007000_add_voice_table_indexes` | (indexes only) | P9-025 |
| `20260617110000_apply_foundation_rls_policies` | Phase 3/4/5 tables (reference pattern) | Phase 5 |

---

## Findings

| ID | Severity | Status | Finding | Evidence | Required Follow-up |
|----|----------|--------|---------|----------|-------------------|
| VRLS-001 | FAIL | Open | None of the seven AI Teacher Voice Mode tables have `ENABLE ROW LEVEL SECURITY` applied. | Searched all P9-018..P9-025 migration files for `ENABLE ROW LEVEL SECURITY`; no match found, unlike `20260617110000_apply_foundation_rls_policies` which enables it for every Phase 3/4/5 table. The Phase 8 AI Chat tables share this gap (see `docs/quality/phase-8-ai-chat-rls-review.md` ARLS-001). | Add a dedicated migration enabling RLS with deny-all-by-default policies for all seven voice tables, following the same pattern as `20260617110000_apply_foundation_rls_policies` (no permissive policies for `anon`/`authenticated`; backend-only access via backend-controlled credentials). |
| VRLS-002 | PASS | Closed | Ownership columns exist on every table that needs per-student scoping. | `voice_sessions.student_id` (NOT NULL FK → `users(id)`); `voice_messages.student_id` (denormalized NOT NULL FK); `voice_audio_assets.student_id` (denormalized NOT NULL FK); `voice_feedback.student_id` (NOT NULL FK → `users(id)`). Tables that scope through session (`voice_messages`, `voice_audio_assets`, `voice_provider_logs`, `voice_transcripts`, `voice_safety_events`) all carry `session_id NOT NULL FK → voice_sessions(id)`, which resolves to a `student_id` via `voice_sessions`. | Maintain this FK structure; do not allow a future migration to make `student_id`/`session_id` nullable or client-writable on any voice table. |
| VRLS-003 | PASS | Closed | No voice table stores AIM Engine-owned learning-decision columns. | Reviewed every `CREATE TABLE` statement in P9-018..P9-024; no `mastery`, `level`, `weakness`, `difficulty`, `recommendation`, or `review_schedule` column exists anywhere in the voice table set. Status columns (`voice_sessions.status`, `voice_messages.status`) are lifecycle flags only, explicitly documented as carrying no AIM semantics. | Keep this boundary enforced in all future voice schema changes. |
| VRLS-004 | PASS | Closed | No STT/TTS/AI provider credentials are stored in any voice table. | All seven migration files explicitly document this constraint in their authority boundary header comments. No column in any voice table stores API keys, tokens, provider secrets, or raw provider response payloads. `voice_audio_assets.storage_key` is an internal backend-managed object-storage reference, never returned to the client. `voice_provider_logs` records request/response metadata only (latency, status, provider_type), not credentials. | Never add a secrets or credentials column to any voice table. |
| VRLS-005 | PASS | Closed | Cascade behavior on deletion is consistent and safe across all voice tables. | All FK columns use `ON DELETE CASCADE` (session deletion cascades to messages, audio assets, transcripts, safety events, feedback) or `ON DELETE SET NULL` where optional (e.g. `voice_safety_events.message_id`). No orphaned rows accessible by id reuse. | None — current behavior is correct. |
| VRLS-006 | PASS | Closed | `voice_feedback.rating` is advisory only and carries no AIM semantics. | The `rating` column has a `CHECK (rating IN ('helpful', 'not_helpful'))` constraint, is documented as "advisory only; never feeds back into AIM Engine mastery, level, weakness, difficulty, recommendation, or review-schedule decisions", and has a UNIQUE constraint on `message_id` (one feedback row per voice turn). | Ensure the backend service layer does not pass `rating` to the AIM Engine in future Group D/E implementation. |
| VRLS-007 | PASS | Closed | `voice_transcripts.confidence` carries no mastery or difficulty semantics. | `confidence NUMERIC(4,3)` has a range CHECK `[0, 1]`, is documented as "advisory quality signal only; never used as a mastery, level, or difficulty decision", and is NULL for turns where the STT provider did not return a confidence score. | Ensure backend code never uses `confidence` as input to AIM Engine scoring or difficulty decisions. |
| VRLS-008 | INFO | Open | No backend repository/API code exists yet that reads or writes the voice tables. | `grep` of `services/backend-api/src` for references to any of the seven voice table names returns no matches; Voice Repositories (Group C, P9-027) and Voice API Endpoints (later groups) are scheduled but not yet implemented. | Runtime ownership-check verification (e.g. "student A's JWT cannot read student B's session") must be re-run once P9-027 (repositories) and the voice API endpoints exist. This review only confirms the schema-level foundation is ownership-safe; it does not yet confirm enforced runtime behavior. |
| VRLS-009 | PASS | Closed | `voice_audio_assets.storage_key` is internal and never exposed to the client. | The migration comment explicitly states: "Internal backend-managed storage reference (e.g. object storage key) for the raw audio bytes. Never returned to the client; only this row's id (the audioRef) crosses the API boundary." This aligns with `docs/phase-9/voice-privacy-policy.md`. | Backend audio-stream endpoint (Group D) must return a signed/proxied stream URL, never the raw `storage_key`. |

---

## Permission Policy Cross-Reference

Per `docs/phase-9/voice-architecture.md` and the authority rules embedded
in each migration:

- Ownership is meant to be enforced on the backend at every relevant step
  (session creation, audio upload, turn processing, history reads), never
  assumed from client input. The schema reviewed here supports that model
  (VRLS-002), but the actual enforcement code does not exist yet (VRLS-008)
  — it is correctly scheduled for Group D/E, not this task.
- RLS is meant to be defense-in-depth on top of backend enforcement,
  matching the strategy already documented in
  `20260617110000_apply_foundation_rls_policies`'s header comment
  ("Backend-first... RLS is defense-in-depth for direct Supabase
  PostgREST/anon/authenticated access... Default: deny all direct client
  access"). VRLS-001 shows this second layer is currently missing for all
  voice tables.
- The gap in VRLS-001 is consistent with the Phase 8 AI Chat gap
  (ARLS-001 in `docs/quality/phase-8-ai-chat-rls-review.md`). Both should
  be addressed together in a combined "deny-all voice + AI chat RLS"
  follow-up migration, or as individual follow-ups when Group D/E work
  begins.

---

## Security Boundary Summary (Target State, Once Group D/E Land)

```
Flutter Voice UI
      ↓  (HTTPS, backend REST only — no direct Supabase client access)
Voice API Endpoints (Group D/E)  ←  sole authority for:
  • authenticated studentId resolution from JWT
  • session/turn ownership checks before any DB read/write
  • STT/TTS/AI provider call routing (never client-direct)
      ↓  (backend-controlled DB credentials)
Voice Repositories (P9-027)  →  voice_sessions / voice_messages /
                                 voice_audio_assets / voice_provider_logs /
                                 voice_transcripts / voice_safety_events /
                                 voice_feedback
      ↓
Postgres RLS (defense-in-depth, currently MISSING — VRLS-001)
  →  deny anon/authenticated direct access
      ↓
AIM Engine  ←  sole authority for mastery, weakness, difficulty,
               recommendations, review schedules (unchanged)
```

---

## Limitations

- No live database connection was available in this agent environment;
  this review is based on static migration file inspection only
  (documented under Method above).
- VRLS-008's runtime ownership-check verification could not be performed
  because the code that would enforce it (Group D/E) has not been
  implemented yet; this is expected at this point in the Phase 9
  sequencing, not a defect introduced by this review.
- This task's scope is review only; VRLS-001's required follow-up (a new
  RLS-enabling migration) is intentionally not implemented here to avoid
  out-of-scope work, per this task's Requirements.
