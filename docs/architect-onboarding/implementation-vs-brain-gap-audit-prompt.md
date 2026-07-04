Now compare:

**Current implementation** (the actual code, live Supabase schema, actual
CI workflows, actual test results — in `aim-platform` right now)

vs

**Project Brain** (`docs/project-brain/*.md`, all 14 documents + the
index — the recorded understanding of the system as of its last
verification date).

This is a gap audit, not a re-run of either the repo-understanding audit
or the Project Brain build. You already have both sides of the
comparison; your job is to find where they disagree, or where reality has
moved since the Project Brain was last verified.

## Find every mismatch

Check systematically against each Project Brain document:

- `04-database.md` vs the live Supabase schema — new tables, dropped
  columns, RLS status changes, migrations applied after the Brain's
  `last_verified_at`.
- `05-api-contracts.md` vs the actual controllers — new/removed/renamed
  endpoints, changed request/response shapes, contract-test drift between
  `aim-engine-contract.spec.ts` and the Pydantic schemas.
- `02-system-architecture.md` vs actual call paths — a dependency that's
  been added, removed, or changed from sync to async (or vice versa)
  since the Brain was written.
- `06-folder-structure.md` vs the actual tree — folders added, removed,
  or whose status changed (e.g. `apps/web` being deleted then restored —
  confirm the Brain reflects whatever its actual current state is, not a
  stale snapshot from mid-episode).
- `12-dependency-map.md` vs actual imports/package manifests — dependency
  edges that no longer exist, or new ones that formed.
- `10-known-problems.md` vs reality — problems marked open that have
  since been fixed (check `project-memory.json.known_issues` and recent
  commit/PR history), or new problems that exist but aren't logged yet.
- `13-risk-register.md` vs reality — has a registered risk been
  mitigated (e.g. RLS enabled on a previously-flagged table)? Has a new
  single-point-of-failure or drift emerged?
- `03-tech-stack.md` vs actual lockfiles/pinned versions — version bumps,
  new dependencies, resolved mismatches (e.g. check whether the
  `@prisma/client`/`prisma` CLI mismatch noted in
  `project-memory.json.open_questions` still reproduces).
- `01-business-rules.md` vs actual enforcement — a rule the Brain
  documents as enforced in code that no longer is (or vice versa — a new
  rule shipped that isn't yet documented).
- `08-roadmap.md`/`11-future-features.md` vs what's actually landed since
  — anything the Brain listed as "planned" that has since shipped (should
  move to `09-decisions.md`/`10-known-problems.md`/wherever it now
  belongs, not stay parked as "future").

Don't stop at the first mismatch per document — walk each one fully. A
document can have multiple independent gaps.

## Classify each mismatch

- **Critical** — actively broken in a way that affects real users/data
  right now, or a security exposure (e.g. an RLS-disabled table holding
  learner data, a contract drift that would silently corrupt AIM Engine
  input/output, an endpoint the Brain documents as auth-protected that
  the live controller does not actually guard).
- **High** — not actively broken today but load-bearing and fragile — a
  latent bug like the pre-P21-021b `AudioUploadService` stale-session
  check (would break the moment a currently-unwired module gets wired
  in), a single point of failure with no fallback, a documented business
  rule that's silently unenforced.
- **Medium** — real drift that affects correctness of understanding or
  causes confusion/rework, but doesn't threaten data or users directly —
  a stale dependency-map edge, a folder whose status changed and wasn't
  updated, an outdated endpoint list.
- **Low** — cosmetic or informational drift — a version number that
  moved, a comment referencing an old table name, a roadmap item that
  shipped and just needs to move sections.

## For every gap, explain

- **Why it exists** — root cause: was the Brain never updated after a
  merge, was something verified against a stale branch, was a
  since-reverted decision not logged, was this simply never checked in
  the first place (mark honestly if you can't determine why).
- **Impact** — concretely, what breaks or what someone relying on the
  Brain would get wrong if they trusted it as-is.
- **Recommended solution** — the smallest correct fix: usually "update
  the Brain document to match verified reality," sometimes "fix the code
  to match a still-valid documented rule," occasionally "escalate to the
  user because this is a product decision, not a doc-sync issue." Do not
  propose a redesign — this audit is about closing the gap, not
  improving the system beyond that.
- **Estimated effort** — rough, honest: doc-only fix (minutes), small
  code fix (hours), needs a real task/migration (treat as its own future
  P2x-XXX-style task, don't attempt inline).
- **Risk if ignored** — what compounds if this gap sits unresolved
  through the next few sessions (e.g. a persistent CTO session trusting a
  stale `known_issues` entry and telling the user something's still
  broken when it's actually fixed, or vice versa).

## Priority rule (same as every other audit in this repo)

1. Documentation (including the Project Brain itself) vs code → **code
   wins.**
2. Code vs live database schema → **database wins.**
3. Either vs runtime evidence (an actual test run, an actual live query,
   an actual API call) → **runtime wins.**

The Project Brain is not exempt from this rule just because it's meant to
be authoritative — it's authoritative *when accurate*, and this audit
exists specifically to find where it no longer is.

## Output

One table or list per Project Brain document, each row a gap:
`| Severity | Gap | Why it exists | Impact | Recommended solution | Effort | Risk if ignored |`.
Save as `docs/project-brain/GAP-AUDIT.md` with a `generated_at` timestamp
at the top, and update `project-memory.json`'s `known_issues` and
`change_log` with anything newly found here.

## Do not

- Do not fix any gap inline as part of this pass — this is an audit
  producing a prioritized list, not a remediation session. Fixes happen
  as separate, explicit follow-up tasks the user assigns.
- Do not soften a Critical finding to avoid an awkward conversation — if
  it's genuinely critical, say so plainly.
- Do not report a "gap" that's actually just the Brain correctly
  documenting something you personally would have built differently —
  this audit is about factual drift, not design opinions.
