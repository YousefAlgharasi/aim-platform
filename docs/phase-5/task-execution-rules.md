# Phase 5 — Task Execution Rules

## Purpose

These rules govern how every Phase 5 task is executed. They exist to keep Phase 5 strictly inside AIM Engine Integration scope, to keep the Backend as the only caller of the AIM Engine, and to prevent any client-side AIM logic, AI Teacher behavior, or unrelated UI work from entering the codebase under a Phase 5 label.

Every Phase 5 task must follow these rules from claim through merge.

## One Task at a Time

- Exactly one Phase 5 task is active per agent at any time.
- A new task may be started only after the previous task is `Done` in Notion with its branch pushed and its completion comment posted.
- Switching tasks without finishing the current one is forbidden. If a task is blocked, it stays `In Progress` with a blocker comment until the blocker is resolved.

## Task Eligibility

A task may be claimed only when all of the following are true:

- Notion `Status = Undone`.
- Notion `Assigned` is empty.
- Every `Dependency` task is `Status = Done` in Notion.
- Every dependency's declared `Output` exists on the `main` branch of the repository.
- The task's exact prompt section exists in `docs/tasks/phase_5_task_prompts.md`.

A task must not be claimed when:

- `Status` is `In Progress`, `Done`, or `Blocked`.
- `Assigned` is non-empty.
- Any dependency is incomplete or its output is missing from `main`.
- The prompt section is missing.
- The working tree contains unrelated changes.

## Pre-Claim Summary

Before claiming, write a task summary covering:

- Task ID, title, purpose, expected output.
- Dependencies checked, with the GitHub paths verified on `main`.
- Scope confirmation across: AIM Engine Integration only, backend-only AIM access, no client-side AIM logic, AI Teacher excluded, secrets excluded.
- Planned files.

## Claim Procedure

Claim a task by, in order:

1. Confirm `Status = Undone`.
2. Confirm `Assigned` is empty.
3. Confirm dependencies are `Done` and their outputs exist on `main`.
4. Set `Assigned` to yourself.
5. Set `Status = In Progress`.
6. Re-open the task and verify `Assigned` and `Status` are correct.

No file may be edited before the claim is confirmed.

## Branch Procedure

- Use the exact branch name defined in the Notion task and in the prompt section.
- Branch from a clean, up-to-date `main`.
- Verify a clean working tree with `git status --short`. If unrelated changes are present, stop and report a blocker.

Example:

```
git checkout main
git pull origin main
git checkout -b phase5/P5-XXX-task-name
git status --short
```

## Prompt Procedure

- Open `docs/tasks/phase_5_task_prompts.md`.
- Locate the exact section header for the task ID, for example `### #P5-002`.
- Follow only that section's Task, Dependencies, Output, Requirements, and Done Test.
- Do not implement unrelated tasks.
- Do not perform unrelated cleanup or refactors.

## Implementation Rules

- Edit only files required by the task.
- Use the existing Phase 1 backend architecture (NestJS + TypeScript, feature-based).
- Use the existing Phase 1 AIM Engine architecture (Python + FastAPI).
- Use the Phase 2 auth, roles, and permissions foundation.
- Use the Phase 3 curriculum, content, skill, and question-bank foundation.
- Use the Phase 4 placement and initial path foundation.
- Do not introduce new technology choices unless the task explicitly requires a documented decision.
- Do not delete prior documentation unless the task explicitly requires it.

For AIM integration work specifically:

- AIM Engine requests must use the defined structured request schemas.
- AIM Engine responses must use the defined structured response schemas.
- All AIM Engine responses must be validated by the backend before any persistence.
- The Backend remains the only caller of the AIM Engine.
- Flutter Mobile and Admin Dashboard never call the AIM Engine.
- The AIM Engine is never exposed on a public route, gateway, or client-accessible path.
- Student skill state, weakness records, difficulty decisions, recommendations, review schedules, frustration signals, and session summaries are persisted only through the backend AIM pipeline.
- Clients never compute mastery, level, weakness, difficulty, recommendations, review schedule, retention, frustration score, or learning decisions.
- AIM result APIs require permission guards based on the Phase 2 auth foundation.
- Failure modes (timeout, invalid response, partial response, engine-down) return safe fallback responses and never persist unvalidated AIM output.

## Forbidden Work Inside Phase 5

Phase 5 tasks must not introduce or modify:

- Student Mobile App UI features beyond consuming backend AIM result APIs.
- Student Web App.
- AI Teacher behavior, dialogue, persona, or pedagogy.
- AI Prompt Management surfaces.
- AI Cost Control surfaces.
- Voice AI features.
- Payments and billing.
- Parent dashboard.
- Admin Dashboard UI features beyond consuming backend AIM result APIs.
- Full analytics dashboards.
- Human review workflows.
- Quiz or exam UI.
- Any client-side AIM calculation.

If a task brief or generated change would touch any of the above, stop and raise a blocker.

## Secret Hygiene

- No real secret may be committed in code, documentation, comments, logs, prompts, or task notes.
- This includes Supabase service-role keys, database credentials, OpenAI keys, other AI provider keys, signing keys, and production environment variables.
- Audit logs record metadata only by default. Any payload field that must be logged requires explicit justification documented next to the log site.

## Commit Rules

- Commit after finishing every single file.
- Commits are small and scoped to the task.
- Every commit message includes the task ID.
- Format: `P5-XXX: <short task title>`.

Example:

```
git add docs/phase-5/task-execution-rules.md
git commit -m "P5-002: create Phase 5 task execution rules"
```

## Pre-Push Checks

Before pushing, always run:

```
git status --short
```

Run available checks based on the files changed:

- Backend (NestJS + TypeScript) changes: `npm run lint` and `npm test`.
- AIM Engine (Python) changes: `python -m pytest` from the AIM Engine project root.
- Migration changes: verify the migration is additive, the new tables fit Phase 5 scope, and no AI Teacher, payment, or parent dashboard tables were introduced.

If a check cannot run in the current environment, document the reason in the completion comment.

## Push Procedure

- Push only after all required checks have run or been explicitly documented as not runnable.
- Push the task branch:

```
git push origin phase5/P5-XXX-task-name
```

- Do not mark the Notion task `Done` until the push succeeds.

## Completion Comment

After a successful push, add a Notion completion comment containing:

- Files created or updated.
- Branch name.
- Commit hashes and messages.
- Checks run (or documented reason if not runnable).
- AIM validation entries:
  - Backend-only AIM access preserved
  - No client-side AIM logic added
  - AIM request contract followed
  - AIM response contract followed
  - AIM persistence handled safely
  - Permission guards preserved
  - Secrets excluded
- Limitations.

Then set:

- `Status = Done`
- `Assigned` stays on the executing agent.

## Blocked Tasks

If a task cannot proceed safely:

- Keep `Assigned` on the executing agent.
- Keep `Status = In Progress`.
- Post a blocker comment with: reason, missing dependency or file, failed command, Phase 5 risk category, and the next required action.
- Do not mark the task `Done`.
- Do not start another task unless explicitly instructed.

Phase 5 risk categories for blocker comments: AIM adapter risk, AIM pipeline risk, persistence risk, permission risk, client-side AIM risk, AI Teacher scope risk, secret risk, none.

## Conflict Resolution

If a Phase 5 task conflicts with a Phase 0, Phase 1, Phase 2, Phase 3, or Phase 4 decision:

1. Stop work.
2. Document the conflict, listing the exact files and decisions in conflict.
3. Post a Notion blocker comment.
4. Do not silently override prior phase decisions.

A Phase 5 decision that intentionally supersedes a prior phase decision must be explicit, documented, and confined to AIM Engine Integration scope.

## Done Definition for a Phase 5 Task

A Phase 5 task is `Done` only when:

- It was claimed in Notion per the claim procedure.
- It is assigned to the executing agent.
- All declared dependencies were complete at claim time.
- The exact prompt section was followed and no unrelated work was added.
- Backend remains the only caller of the AIM Engine.
- No client-side AIM calculation exists.
- AIM request and response contracts are respected.
- Persistence flows through the backend AIM pipeline only.
- AIM result APIs are permission-guarded.
- No secrets are present.
- Applicable checks ran successfully or are explicitly documented as not runnable.
- Every file is committed.
- The branch is pushed.
- A completion comment is posted.
- `Status` is set to `Done`.
