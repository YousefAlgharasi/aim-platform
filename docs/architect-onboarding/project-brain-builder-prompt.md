Using everything you discovered from the repository — via the
repo-understanding audit (`chief-architect-repo-understanding-prompt.md`),
the full inventory (`full-project-inventory-prompt.md`), and
`project-memory.json` if it's already been populated — build the
**Project Brain** for `aim-platform`.

The Project Brain is a fixed set of reference documents under
`docs/project-brain/`. Together they are the single place a new engineer,
a new agent session, or the persistent CTO system prompt goes to get
oriented — instead of re-deriving the architecture from scratch or
trusting a stale phase doc.

Each document must be based **only on verified facts** — things you
actually read in the code, actually queried from the live Supabase
project (`yrarpdkvdxszgxxondkt`), or actually confirmed by running a test
suite/build. Where a fact came from a doc or comment rather than
independent verification, say so explicitly rather than presenting it
with the same confidence as something you checked yourself.

If something is unknown, write **Unknown** — plainly, as its own line or
table cell — instead of guessing, inferring from a similar project, or
filling the gap with something plausible-sounding. An honest "Unknown" is
more valuable to whoever reads this next than a confident fabrication.

Never invent requirements, business rules, or architectural intentions
that aren't actually evidenced in the repo, its history (commits, PRs,
phase docs as *stated intent*, not proof), or something the user has
explicitly told an agent session (e.g. entries already captured in
`project-memory.json`'s `decisions_log`).

## Create the following, under `docs/project-brain/`

### `00-project-vision.md`
What AIM Platform actually is and does, derived from what the product
surfaces (mobile app, admin dashboard, student/parent web) actually let a
user do today — not aspirational copy from a README or landing page.
State the target audience if it's evidenced (e.g. the AI Teacher's
system-instruction comments naming Arabic-speaking English learners).
Anything about business goals, monetization strategy, or target scale
that isn't evidenced in code/config: **Unknown**.

### `01-business-rules.md`
Rules actually enforced in code — course/level gating (CEFR rank vs
`max_unlocked_cefr_rank`), course-completion-gates-next-unlock logic,
placement→recommendation rules, AI Teacher Authority Matrix (what the AI
Teacher may/may not compute, per `docs/phase-18/ai-teacher-authority-rules.md`
cross-checked against actual code), rate limits, quota gates, safety
filtering rules. For each rule: cite where it's enforced (file/service),
not just where it's described.

### `02-system-architecture.md`
How the real pieces actually talk to each other today: backend-api ↔
aim-engine contract and call pattern (sync/async, fire-and-forget vs
blocking), backend ↔ Supabase, mobile/admin-dashboard/student-web/web ↔
backend-api, AI Teacher/Voice Teacher unification as of Phase 21. Diagram
in text/ASCII if useful, but only depicting confirmed call paths.

### `03-tech-stack.md`
Per app/service, the actual stack and pinned versions where determinable
(NestJS/TypeScript for backend-api, FastAPI/Python for aim-engine,
Flutter/Dart with the exact SDK pinned in `apps/mobile/.metadata`,
Next.js for admin-dashboard, CRA/React for student-web and web). Include
the Supabase project as the database/auth layer. Note any version
mismatches found (e.g. the `@prisma/client`/`prisma` CLI version mismatch
already logged in `project-memory.json.open_questions`).

### `04-database.md`
Every table in the live Supabase schema (name, purpose in one line, RLS
status), organized by domain (curriculum, placement, AIM engine output,
AI Teacher/Voice Teacher, billing, notifications, analytics, admin/ops).
Cross-reference `schema.prisma` and flag any drift found. Reuse
`project-memory.json.database` as a starting point but re-verify row/RLS
counts live.

### `05-api-contracts.md`
The backend's real REST surface, controller by controller, cross-checked
against `docs/mobile-app-api-endpoints.md` (or equivalent) for drift. The
backend↔AIM-Engine request/response contract
(`aim-engine-contract.spec.ts` vs the Pydantic schemas) and its current
sync status. Note any endpoint found undocumented or any documented
endpoint found missing.

### `06-folder-structure.md`
Annotated top-level tree: `apps/*`, `services/*`, `packages/*`, `docs/*`,
`database/*` — one line per top-level and second-level folder on what it
actually is and its current status (live/orphaned/legacy/reference-only),
matching `project-memory.json.architecture` where it overlaps.

### `07-coding-standards.md`
Conventions actually observed in the code (not a style guide you're
inventing): naming patterns, module/file organization per language,
comment density/style (this repo favors explaining *why*, with dated
task-number references like `P20-005`), test file placement and naming
(`*.spec.ts` co-located under `tests/` subfolders in backend-api,
`test/features/...` mirroring `lib/features/...` in mobile), commit
message conventions seen in `git log`.

### `08-roadmap.md`
Only what's evidenced: completed phases (Phase 20, Phase 21 — pull exact
status from `project-memory.json.phase_history`), any explicitly-planned
next phase mentioned in an uploaded planning doc or user instruction.
Do not invent a roadmap beyond what's actually been stated or planned.
Mark speculative extrapolation as such if you include it at all — better
to omit it.

### `09-decisions.md`
Pull directly from `project-memory.json.decisions_log`, formatted as
readable prose/table, plus any additional decisions evidenced by commit
messages or PR descriptions that aren't yet in that log (and add them to
the log too, so the two stay in sync).

### `10-known-problems.md`
Pull from `project-memory.json.known_issues`, plus anything newly found
while building the rest of the Project Brain. Each entry: what's wrong,
where, how it was verified, current status (open/fixed).

### `11-future-features.md`
Only things explicitly proposed somewhere real: an uploaded planning doc,
a phase doc's "not yet built" note, a user statement in a session. Do not
brainstorm new features here — this is a record of stated intent, not a
wishlist you're generating.

### `12-dependency-map.md`
Real dependency edges: which modules/services depend on which others
(e.g. `VoiceOrchestratorService` depends on `AiTeacherOrchestratorService`
and `AiChatMessageRepository`; `AudioUploadService` depends on
`AiChatSessionRepository`), which npm/pip packages each service pins
(from `package.json`/`pyproject.toml`, noting major version mismatches),
and which apps depend on which backend endpoints. Distinguish hard vs
soft/optional dependencies.

### `13-risk-register.md`
Concrete, evidenced risks — not generic software-risk boilerplate: the 8
tables with RLS disabled, `apps/web` having no CI coverage, any
service/table found to have drifted from its own documentation, any
single point of failure noted during architecture review (e.g. AIM
Engine being a hard dependency for lesson-attempt submission once wired).
For each: what the risk actually is, how it was found, current severity
if determinable.

### `PROJECT_INDEX.md`
A short index at the root of `docs/project-brain/` linking to all 14
documents above with a one-line description of each, plus the
`last_verified_at` date for the Project Brain as a whole (the latest date
across all documents' own verification dates).

## Rules throughout

- Every document is a living artifact, not a one-time snapshot — note at
  the top of each file when it was last verified, so a future session
  knows whether to trust it or re-check.
- Do not cross-contaminate categories — a fact about database schema
  belongs in `04-database.md`, not repeated at length in
  `02-system-architecture.md` (a short cross-reference is fine).
- Where `project-memory.json` already holds a verified fact, reuse it
  rather than re-deriving from scratch — but if you re-verify it and find
  it's changed, update `project-memory.json` too, not just the Project
  Brain document.
- Do not propose improvements, fixes, or a future plan in any of these
  documents except where a document's own definition above calls for
  recording *already-stated* intent (`08-roadmap.md`, `11-future-features.md`)
  — and even then, record it, don't originate it.
