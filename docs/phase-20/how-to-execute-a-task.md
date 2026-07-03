# How to execute one Phase 20 task

This is the standing operating procedure for working through
`docs/phase-20/aim-engine-adaptive-rollout-tasks.md`. It's written so you can
hand a Claude Code (web) session **just the task number** plus this file, and
it will do the right thing — including refusing to start if you give it a
task whose dependencies aren't merged yet.

Give it to Claude Code exactly like this:

> Follow the procedure in `docs/phase-20/how-to-execute-a-task.md` for task
> **P20-00X**.

Everything below is what that procedure means.

---

## Step 0 — Identify the task

1. Open `docs/phase-20/aim-engine-adaptive-rollout-tasks.md`.
2. Find the section for the given task number (e.g. `## P20-005 — ...`).
3. Read that section in full: **Why**, **Read first**, the schema/implementation
   details, **Acceptance criteria**, and the **Claude Code web prompt** at the
   end of the section.

If the task number doesn't exist in the file, stop and say so. Do not
improvise a task that isn't written down.

---

## Step 1 — Check the dependency table below. Do not skip this.

Some tasks touch the same files as others, or read tables/columns/services
that an earlier task creates. Starting out of order either won't compile,
won't have anything to test against, or will produce a merge conflict later.
**This step is mandatory before creating a branch.**

| Task | Hard dependencies (must be merged to `main` first) | Soft/recommended (do later if possible, not blocking) |
|---|---|---|
| P20-001 | — | — |
| P20-002 | — | — |
| P20-003 | — | — |
| P20-004 | — | — |
| P20-005 | — | — |
| P20-006 | P20-005 | — |
| P20-007 | P20-005, P20-006 | — |
| P20-008 | P20-007 | — |
| P20-009 | P20-007, P20-008 | — |
| P20-010 | P20-001, P20-002 | — |
| P20-011 | P20-002, P20-010 | — |
| P20-012 | — | Batch 1 (P20-001–004) merged first, for a clean baseline |
| P20-013 | P20-003, P20-006 | — |
| P20-014 | P20-001, P20-002, P20-006 | — |
| P20-015 | — | P20-007, P20-008, P20-009 (so the README can say what's actually ported) |
| P20-016 | P20-005, P20-006, P20-007, P20-008, P20-009 | Every other task, ideally — this is meant to run last |
| P20-017 | — | — |
| P20-018 | — | P20-013 (same adapter pattern, more consistent if done after) |
| P20-019 | — | — |
| P20-020 | — | P20-013, P20-018 (same adapter pattern) |
| P20-021 | P20-006 | — |
| P20-022 | P20-006 | — |
| P20-023 | — | P20-005, P20-006 (needed to have real data to test the report against) |

### How to actually verify a "hard dependency" is merged — don't just trust a branch name

For every hard dependency task ID, do this before writing any code:

1. `git fetch origin main` and check out `origin/main` (don't trust your
   local branch — it may be stale).
2. Go back to that dependency's section in
   `docs/phase-20/aim-engine-adaptive-rollout-tasks.md` and look at what it
   actually said it would produce (a specific column, table, file, method,
   or endpoint).
3. Confirm that specific thing **actually exists on `main`** — grep for the
   file, check the column via the Supabase MCP tools against project
   `yrarpdkvdxszgxxondkt`, or check the method signature. Do not infer
   "it's probably done" from a PR title or a branch existing — PRs can be
   open, draft, or merged-but-reverted. Check the artifact itself, on `main`.

If any hard dependency isn't actually present on `main` yet: **stop.** Do not
start the task, do not create a branch, do not attempt to "work around it
temporarily." Report back exactly which dependency is missing and what you
checked to confirm that. The user will either merge the dependency first or
tell you to proceed anyway with an explicit reason.

If all hard dependencies check out, proceed to Step 2.

---

## Step 2 — Create the branch

Branch naming convention (always, no exceptions):

```
phase-20/P20-0XX-<short-kebab-slug-of-the-task-title>
```

Examples:
- `phase-20/P20-001-course-cefr-rank`
- `phase-20/P20-005-aim-state-assembly-stub`
- `phase-20/P20-013-focus-directive-wiring`

Create it off an up-to-date `main`:

```
git fetch origin main
git checkout -b phase-20/P20-0XX-<slug> origin/main
```

Never branch off your local `main` without fetching first — it may be behind.

---

## Step 3 — Do the task

Use the task's own **"Claude Code web prompt"** block from
`aim-engine-adaptive-rollout-tasks.md` as your actual working instructions —
it already contains the specific files to read, what not to guess at, and
what to check in Supabase. Follow it exactly, including all of its "don't
guess, verify first" instructions — those were written deliberately because
this codebase has a history of stubs and silent no-ops that look done but
aren't.

Rules that apply to every task, restated because they matter most here:

- If the task involves a schema change: write it as a Prisma migration under
  `services/backend-api/prisma/migrations/`, update `schema.prisma` to match,
  and deploy it to the Supabase project (`yrarpdkvdxszgxxondkt`) the same way
  existing migrations are deployed. Schema, migration files, and the live
  database must never drift apart.
- Never fabricate data, thresholds, or mappings the task tells you to verify
  first (e.g. "confirm which courses map to which CEFR code" — check, don't
  assume).
- Stay inside the scope of the one task. If you notice something else that
  looks broken while you're in there, note it in your final report — don't
  fix it as a drive-by change in this branch.

---

## Step 4 — Test locally before pushing anything

Do not push until these pass locally, scoped to whatever this task actually
touched:

- **Backend (NestJS) changes** — from `services/backend-api/`:
  run the unit/integration test suite (check `package.json` for the exact
  script, typically `npm test` or `npm run test`), and run a build
  (`npm run build`) to catch type errors.
- **Prisma migration changes** — run `npx prisma migrate deploy` (or this
  repo's established equivalent — check how prior migrations were applied)
  against the Supabase project and confirm it applies cleanly with no errors,
  then run `npx prisma generate` and confirm the backend still builds against
  the regenerated client.
- **AIM Engine (Python) changes** — from `services/aim-engine/`: run the
  test suite (check `pyproject.toml`/`README` for the exact command,
  typically `pytest`), and confirm the coverage gate
  (`--cov-fail-under=60`) still passes.
- **Mobile (Flutter) changes** — from `apps/mobile/`: run
  `flutter test` for the affected feature's test directory at minimum, full
  suite if the change touches shared models.
- **Contract test** — if you touched anything in
  `services/backend-api/src/features/aim/adapter/` or
  `services/aim-engine/app/schemas/`, specifically re-run
  `aim-engine-contract.spec.ts` and confirm it passes.
- **New tests** — if the task's "Acceptance criteria" section describes a
  behavior (e.g. "locked courses reject a start attempt"), there must be an
  actual automated test proving it, not just a manual claim in your report.

If any test fails: fix it before proceeding. Do not push a task with failing
tests and a note saying "pre-existing failure, unrelated" unless you've
actually confirmed that failure also exists on a clean `origin/main` checkout
(check it, don't assume it).

---

## Step 5 — Commit, push, open the PR

1. Stage only the files this task actually touched (review `git status`
   yourself first — no `git add -A` sweeps).
2. Commit with a message that names the task number, e.g.:
   ```
   P20-005: implement AimStateAssemblyService.assemble()

   <one or two sentences on why, not a restatement of the diff>
   ```
3. Push: `git push -u origin phase-20/P20-0XX-<slug>`
4. Open a **draft** pull request targeting `main`, titled
   `P20-0XX: <task title>`, with a body that:
   - Links back to the task's section in
     `docs/phase-20/aim-engine-adaptive-rollout-tasks.md`.
   - Lists the hard dependencies you verified were already on `main`, and how
     you verified them (per Step 1).
   - Restates the acceptance criteria from the task and confirms each one,
     with what test proves it.
   - Notes anything you flagged as out-of-scope/for-a-human-decision rather
     than fixed inline.

---

## What to tell Claude Code, in short

Every time, all you have to say is:

> Follow `docs/phase-20/how-to-execute-a-task.md` for task **P20-0XX**.

It will look up the task, check the dependency table, verify on `main`
(not just trust you), refuse and report back if something's missing, and
otherwise branch, implement, test, and open the draft PR itself.
