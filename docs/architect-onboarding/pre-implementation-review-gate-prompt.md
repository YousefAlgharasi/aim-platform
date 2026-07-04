Before implementing anything on `aim-platform`, run this gate. This
applies to every new task — a user request, a task-list item, a bug
report — before a single line of code or migration is written.

## Step 1 — Review the entire Project Brain

Read all 14 documents under `docs/project-brain/` (and
`docs/project-brain/GAP-AUDIT.md` if it exists) plus
`docs/architect-onboarding/project-memory.json`. If the Brain's
`last_verified_at` predates something relevant to this task (a recent
merge, a recent schema change), treat the relevant section as
provisional and re-verify it against the actual repo/Supabase before
relying on it — don't build on a stale understanding.

Pay specific attention to:
- `01-business-rules.md` — the rules this new work must not break.
- `02-system-architecture.md` and `12-dependency-map.md` — where this
  work would actually plug in, and what already depends on the things
  it would touch.
- `09-decisions.md` — decisions already made that bear on this work
  (e.g. "git identity is GHOST3030, never Claude attribution," "no PRs
  opened by the agent," or any product/architecture decision logged
  there).
- `10-known-problems.md` and `13-risk-register.md` — whether this task
  is actually a known problem already logged (don't re-discover it from
  scratch), or would touch a registered risk.
- `11-future-features.md` — whether this task overlaps a
  already-planned future feature, which changes how much to build now
  vs leave extensible.

## Step 2 — Review the repository directly

The Brain is a cache, not proof. Before implementing, verify directly
against the actual code/schema for anything the task will touch — same
priority rule as every other audit in this repo:

1. Documentation (including the Project Brain) vs code → **code wins.**
2. Code vs live database schema → **database wins.**
3. Either vs runtime evidence → **runtime wins.**

## Step 3 — Determine whether the requested work

- **Matches the architecture** — does it fit the existing module
  boundaries (e.g. a new AIM output stays inside the backend/AIM-Engine
  contract rather than reaching around it; a new AI Teacher capability
  respects the Authority Matrix — see `docs/phase-18/ai-teacher-authority-rules.md`
  and `01-business-rules.md`)?
- **Violates existing decisions** — check `09-decisions.md` and
  `project-memory.json.decisions_log` line by line. A task that would,
  for example, reintroduce a debounce mechanism explicitly declined
  during Phase 21 (P21-014's finding), or bypass the "backend is the
  sole source of mastery/level/weakness truth" rule, is a violation
  even if the user's phrasing doesn't flag it as one — surface this
  before writing code.
- **Duplicates existing functionality** — this repo has concrete
  precedent for this risk: `apps/web`'s admin-notifications/admin-ai/
  admin-analytics features overlap `apps/admin-dashboard`'s
  `admin/notifications`, `admin/ai-teacher`, `admin/analytics` sections.
  Check `06-folder-structure.md` and `12-dependency-map.md` for any
  existing service/component that already does what's being asked, in
  whole or in part, before building a second one.
- **Creates technical debt** — a stub, a hardcoded value where a real
  computation belongs, a new special-case branch where an existing
  generic mechanism should be extended instead (e.g. `04-database.md`/
  `05-api-contracts.md` note the pattern of extending
  `ReportRunnerService`'s existing metric-aggregate mechanism rather than
  bolting on a bespoke endpoint, per P20-023's precedent).
- **Introduces inconsistencies** — a new table that doesn't follow this
  repo's established conventions (e.g. skipping a Prisma migration and
  hand-editing schema, using `user`/`assistant` instead of this repo's
  actual `student`/`ai_teacher` role vocabulary in `ai_chat_messages`,
  writing to a legacy/frozen table like `voice_messages` for new
  conversational data instead of `ai_chat_messages`).

## Step 4 — If you find a better architectural approach

Explain it **before** writing code, not as a footnote after. State:
- What was actually requested.
- What you'd propose instead, and precisely why (cite the specific
  Brain document/decision/existing pattern that makes the alternative
  better — not a general best-practices argument).
- What the requested approach would cost (debt, duplication,
  inconsistency, or an actual violation) if implemented as literally
  asked.
- Let the user decide — do not silently substitute your approach for
  the one requested. Present it, get a decision, then proceed.

## Step 5 — Only after Steps 1–4 are clear, proceed to implementation

If nothing above blocks the work, proceed normally — but carry forward
whatever you verified (a schema check, a confirmed non-duplication) into
`project-memory.json` if it's new durable knowledge, so the next session
doesn't have to re-derive it.

## Do not

- Do not skip this gate for "small" tasks — duplication and debt are
  usually introduced by tasks that felt too small to check first.
- Do not treat this as a one-time exercise — run it fresh for every new
  piece of requested work, since the Brain and the repo both keep moving.
- Do not use this gate as an excuse to block or slow-walk legitimate,
  already-approved work — if Steps 1–4 come back clean, proceed without
  further ceremony.
