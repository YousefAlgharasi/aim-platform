# Phase 8 — AI Chat RLS/Permission Policy Review

> Phase 8 — P8-025
> Scope: Row-level security and permission policy for AI Teacher chat
> tables (`ai_chat_sessions`, `ai_chat_messages`, `ai_context_snapshots`,
> `ai_provider_logs`, `ai_safety_events`, `ai_teacher_feedback`).

## Review Status

**Status: FAIL — RLS is not yet enabled on any AI Teacher chat table.**

The ownership columns and FK structure needed for backend-enforced
ownership are in place, consistent with
`docs/phase-8/permission-policy.md`. However, none of the AI Teacher
chat tables created in P8-018 through P8-023 have Row Level Security
enabled, unlike the equivalent Phase 3/4/5 tables, which all received a
dedicated "deny-all-by-default" RLS migration
(`20260617110000_apply_foundation_rls_policies`). This is a gap that
should be closed with a follow-up migration before any direct Supabase
client access path is exposed.

---

## Method

This is a static review of migration files; no live database connection
is available in this agent environment (`psql` is installed, but no
`DATABASE_URL`/`.env` with real connection details exists in this
sandbox; live `SELECT * FROM pg_policies WHERE tablename = '...'`
verification could not be run). Findings below are based on direct
inspection of the migration SQL that defines each table.

---

## Migrations Reviewed

| Migration | Table | Task |
|---|---|---|
| `20260618000000_create_ai_chat_sessions_table` | `ai_chat_sessions` | P8-018 |
| `20260618001000_create_ai_chat_messages_table` | `ai_chat_messages` | P8-019 |
| `20260618002000_create_ai_context_snapshots_table` | `ai_context_snapshots` | P8-020 |
| `20260618003000_create_ai_provider_logs_table` | `ai_provider_logs` | P8-021 |
| `20260618004000_create_ai_safety_events_table` | `ai_safety_events` | P8-022 |
| `20260618005000_create_ai_teacher_feedback_table` | `ai_teacher_feedback` | P8-023 |
| `20260618006000_add_ai_chat_indexes` | (indexes only) | P8-024 |
| `20260617110000_apply_foundation_rls_policies` | Phase 3/4/5 tables (reference pattern) | Phase 5 |

---

## Findings

| ID | Severity | Status | Finding | Evidence | Required Follow-up |
|----|----------|--------|---------|----------|--------------------|
| ARLS-001 | FAIL | Open | None of the six AI Teacher chat tables have `ENABLE ROW LEVEL SECURITY` applied. | Searched all P8-018..P8-024 migration files for `ENABLE ROW LEVEL SECURITY`; no match found, unlike `20260617110000_apply_foundation_rls_policies` which enables it for every Phase 3/4/5 table. | Add a dedicated migration enabling RLS with deny-all-by-default policies for `ai_chat_sessions`, `ai_chat_messages`, `ai_context_snapshots`, `ai_provider_logs`, `ai_safety_events`, and `ai_teacher_feedback`, following the same pattern as `20260617110000_apply_foundation_rls_policies` (no permissive policies for `anon`/`authenticated`; backend-only access). |
| ARLS-002 | PASS | Closed | Ownership columns exist on every table that needs per-student scoping. | `ai_chat_sessions.student_id`, `ai_chat_messages.student_id` (denormalized FK), `ai_teacher_feedback.student_id` are all `NOT NULL` FKs to `users(id)`. `ai_context_snapshots`, `ai_provider_logs`, and `ai_safety_events` scope through `session_id → ai_chat_sessions.student_id`. | Maintain this FK structure; do not allow a future migration to make `student_id`/`session_id` nullable or client-writable. |
| ARLS-003 | PASS | Closed | No table stores AIM Engine-owned learning-decision columns. | Reviewed every `CREATE TABLE` statement in P8-018..P8-023; no `mastery`, `level`, `weakness`, `difficulty`, `recommendation`, or `review_schedule` column exists anywhere in this table set. | Keep this boundary enforced in all future AI Teacher schema changes. |
| ARLS-004 | INFO | Open | No backend repository/API code exists yet that reads or writes these tables. | `grep` of `services/backend-api/src` for references to any of the six table names returns no matches; Chat Persistence (Group G, P8-026) and AI Teacher API Endpoints (Group H) are scheduled but not yet implemented per `docs/phase-8/ai-teacher-architecture.md`'s sequencing. | Runtime ownership-check verification (e.g. "student A's JWT cannot read student B's session") must be re-run once P8-026 (repositories) and the Group H endpoints exist. This review only confirms the schema-level foundation is ownership-safe; it does not yet confirm enforced runtime behavior, since there is no runtime behavior to test. |
| ARLS-005 | PASS | Closed | Cascade behavior on `student_id`/`session_id` deletion is consistent and safe. | All FK columns reviewed use `ON DELETE CASCADE`, so a deleted student or session correctly removes dependent chat data instead of leaving orphaned rows accessible by id reuse. | None — current behavior is correct. |

---

## Permission Policy Cross-Reference

Per `docs/phase-8/permission-policy.md`:
- Ownership is meant to be enforced on the backend at every relevant
  step (session creation, send-message, read-history), never assumed
  from client input. The schema reviewed here supports that model
  (ARLS-002), but the actual enforcement code does not exist yet
  (ARLS-004) — it is correctly scheduled for Group G/H, not this task.
- RLS is meant to be defense-in-depth on top of backend enforcement,
  matching the strategy already documented in
  `20260617110000_apply_foundation_rls_policies`'s header comment
  ("Backend-first... RLS is defense-in-depth for direct Supabase
  PostgREST/anon/authenticated access... Default: deny all direct
  client access"). ARLS-001 shows this second layer is currently
  missing for AI Teacher tables.

---

## Security Boundary Summary (Target State, Once Group G/H Land)

```
Flutter AI Teacher Chat UI
        ↓  (HTTPS, backend REST only)
AI Teacher API Endpoints (Group H)  ←  sole authority for:
  • authenticated studentId resolution from JWT
  • session/message ownership checks
        ↓  (backend-controlled DB credentials)
Chat Persistence (Group G)  →  ai_chat_sessions / ai_chat_messages / ...
        ↓
Postgres RLS (defense-in-depth, currently MISSING — ARLS-001)  →  deny anon/authenticated direct access
```

---

## Limitations

- No live database connection was available in this agent environment;
  this review is based on static migration file inspection only
  (documented under Method above).
- ARLS-004's runtime ownership-check verification could not be
  performed because the code that would enforce it (Group G/H) has not
  been implemented yet; this is expected at this point in the Phase 8
  sequencing, not a defect introduced by this review.
- This task's scope is review only; ARLS-001's required follow-up (a
  new RLS-enabling migration) is intentionally not implemented here to
  avoid out-of-scope work, per this task's Requirements.
