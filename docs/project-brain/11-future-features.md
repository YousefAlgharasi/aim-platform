# 11 — Future Features

> Last verified: 2026-07-04. This is a record of stated intent found in the repo or session history — not a brainstormed feature list.

## Explicitly deferred, with a stated future task ID

- **`VoiceMessageSubmitModule` wiring into `VoiceTeacherModule`** — the
  module's own file header states this integration is deferred to "a
  separate, later task (P9-068+)." No controller/route currently invokes it.

## Explicitly noted as a real, undecided product/engineering decision (from `PROJECT_STATE.md`, dated 2026-07-04)

These are framed in the source doc as *open decisions*, not committed
roadmap items — recorded here as stated intent to decide, not intent to
build:

1. Decide the RLS fix approach for the (now-fixed, see `10-known-problems.md`)
   previously-exposed 8 tables.
2. Decide whether `apps/web`'s Parent Dashboard should be kept, deleted, or
   have its features migrated into `admin-dashboard`/`student-web`.
3. Wire a real microphone/recorder plugin into Voice Teacher — **this has
   since been done** (PR #1310, confirmed by this session's mobile catalog:
   `RealVoiceRecorderClient` is real and wired) — listed here only because
   it was the source doc's stated next priority at time of writing; treat
   as **resolved**, not still-pending.
4. Decide on a feature-flag mechanism for the Phase 20/21 AIM pipeline
   rollout — confirmed this session that no such flag exists in code.

## Pilot-arc documents (stated intent, execution status not verified)

`docs/AIM_023_PILOT_READINESS.md` through `AIM_027_CLOUD_DEPLOYMENT.md`
describe a pilot readiness → operations → analysis → hardening →
cloud-deployment progression. These are **stated planning documents**;
whether their content represents future work or already-completed work was
not independently re-verified in this session — see `08-roadmap.md`.

## What is Unknown

- Whether any phase beyond Phase 21 has been planned in a document or
  conversation not available to this session.
- Whether the `apps/web` decision (item 2 above) has been made since
  `PROJECT_STATE.md` was last updated.
