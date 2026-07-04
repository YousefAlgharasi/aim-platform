# Project Memory Schema — aim-platform

Defines the structure of `docs/architect-onboarding/project-memory.json`,
the living state store the persistent CTO system prompt reads and updates
every session. This file describes the schema; `project-memory.json` is
the actual data.

## Top-level shape

```
{
  "meta": { ... },
  "architecture": { ... },
  "database": { ... },
  "apis": { ... },
  "ai_engine": { ... },
  "decisions_log": [ ... ],
  "phase_history": [ ... ],
  "known_issues": [ ... ],
  "open_questions": [ ... ],
  "environment": { ... },
  "ci_cd": { ... },
  "change_log": [ ... ]
}
```

## Field-by-field

### `meta`
- `project_name`, `repo`, `supabase_project_id`
- `last_full_audit_at` — timestamp of the last time the full
  `chief-architect-repo-understanding-prompt.md` procedure was actually
  run end-to-end.
- `last_verified_at` — timestamp of the last incremental verification of
  *any* section (bump the relevant section's own timestamp too, see
  below — this top-level one is "most recent touch of anything").

### `architecture`
One entry per app/service under `apps/` and `services/`. Each entry:
```
{
  "path": "services/backend-api",
  "kind": "backend" | "frontend" | "ai-engine" | "mobile" | "reference-only",
  "stack": "NestJS/TypeScript",
  "status": "live" | "orphaned" | "legacy" | "unknown",
  "wired_into_ci": true | false | "unknown",
  "notes": "free text, cite what was actually checked",
  "verified_at": "ISO timestamp",
  "confidence": "verified" | "unverified" | "stale"
}
```

### `database`
- `schema_source_of_truth`: usually `"live Supabase, cross-checked against schema.prisma"`
- `known_drift`: list of `{ table, column, issue, verified_at }` — any
  place `schema.prisma` and live Supabase disagreed at last check.
- `rls_status`: list of `{ table, rls_enabled, should_be_enabled, notes }`
  for anything flagged as a gap.
- `migration_history_notes`: free text on linearity/gaps, with the
  migration folder name range last reviewed.

### `apis`
- `documented_vs_actual_drift`: list of endpoints where docs and code
  disagreed at last check.
- `contract_sync_status`: state of the backend↔AIM-Engine contract test
  (`aim-engine-contract.spec.ts` vs Pydantic schemas) as of last check.

### `ai_engine`
- `ported_modules`: list of what's actually been ported from
  `services/api` into `services/aim-engine` (mastery calculator, retention
  tracker, recommendation engine, etc.), each with `verified_at`.
- `services_api_status`: `"reference-only, zero live imports"` or
  otherwise, with how it was verified (grep results, date).

### `decisions_log`
Append-only. Each entry:
```
{
  "date": "ISO timestamp",
  "decision": "one-sentence statement of what was decided",
  "made_by": "user" | "inferred from code/repo state",
  "context": "why, and what it affects"
}
```
Never edit or delete past entries — if a decision is later reversed, add
a new entry noting the reversal and reference the original.

### `phase_history`
One entry per phase (Phase 20, Phase 21, ...):
```
{
  "phase": "phase-20",
  "task_range": "P20-001..P20-023",
  "status": "fully merged" | "partially merged" | "in progress",
  "merged_at": "ISO timestamp or null",
  "source_doc": "docs/phase-20/aim-engine-adaptive-rollout-tasks.md",
  "notes": "anything notable — extra fixes beyond the plan, branches still open"
}
```

### `known_issues`
Things found broken, dead, duplicated, or drifted — not yet fixed, or
fixed and worth remembering as a pattern:
```
{
  "id": "short-slug",
  "summary": "one line",
  "found_at": "ISO timestamp",
  "status": "open" | "fixed" | "wontfix",
  "fixed_in": "commit/PR reference, if applicable"
}
```

### `open_questions`
Things explicitly marked Unknown during an audit, not yet resolved:
```
{ "question": "...", "raised_at": "ISO timestamp", "blocking": true|false }
```

### `environment`
- Per-app/service: required vs optional env vars, at a summary level (no
  actual secret values, ever).

### `ci_cd`
- `workflows`: list of `.github/workflows/*.yml` with what each covers,
  and which apps/services have **no** workflow at all.

### `change_log`
Append-only audit trail of edits to this memory file itself:
```
{
  "date": "ISO timestamp",
  "summary": "what changed in project-memory.json and why",
  "session_context": "one line on what prompted the update"
}
```

## Rules for updating this file

1. **Append, don't silently overwrite.** `decisions_log`, `phase_history`,
   `known_issues`, `change_log` are additive logs. Correcting a past entry
   means adding a new one that supersedes it, not rewriting history.
2. **Every fact carries a `verified_at` and, where applicable, a
   `confidence` marker.** Never assert something as `"verified"` you
   haven't actually checked against code/DB/runtime this session or a
   prior one.
3. **Unknown stays Unknown.** Don't fill a field with a guess to make the
   schema look complete. An honest `"unknown"` is more valuable than a
   confident fabrication.
4. **This schema can grow.** If a new category of durable project fact
   emerges that doesn't fit an existing section, add a new top-level key
   here first, document it, then use it in `project-memory.json`.
