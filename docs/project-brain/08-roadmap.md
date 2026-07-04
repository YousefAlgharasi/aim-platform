# 08 — Roadmap

> Last verified: 2026-07-04, from `project-memory.json.phase_history` (already-verified, reused directly) plus `git log` confirmation of merge state.

This document records only phases/work items with direct evidence of being
planned or completed — it does not extrapolate a future roadmap.

## Completed phases (confirmed merged)

| Phase | Task range | Status | Source |
|---|---|---|---|
| Phase 20 | P20-001..P20-023 | **Fully merged** — all 23 tasks, individual PRs (#1278-#1302 range, plus #1294 for P20-016) | `docs/phase-20/aim-engine-adaptive-rollout-tasks.md`; confirmed by `project-memory.json.phase_history` |
| Phase 21 | P21-001..P21-021 (+ unplanned follow-up P21-021b) | **Fully merged** — two batches, PR #1303 (P21-001..010) and PR #1304 (P21-011..021); P21-021b merged as PR #1305 | Local planning file `phase21fluttervoicesynctasks.md` (uploaded by user, not committed to repo) |

Confirmed via `git log` this session: subsequent merged PRs after Phase 21
include #1306 (remove apps/web), #1307 (restore apps/web),
#1308–#1313 (Voice Teacher bug fixes: internal-user-id, greeting playback,
mic recorder wiring, Groq STT file-extension fix), and this session's own
work reconciling the migration ledger and enabling RLS (not yet assigned a
phase number).

## Current phase status

**No Phase 22 (or equivalent) has been defined anywhere in the repo or
session history as of this verification.** This matches `PROJECT_STATE.md`'s
own statement. Do not infer a Phase 22 scope from Phase 20/21's shape.

## Stated-intent documents not yet confirmed executed

`docs/AIM_023_PILOT_READINESS.md`, `AIM_024_PILOT_OPERATIONS.md`,
`AIM_025_PILOT_ANALYSIS.md`, `AIM_026_PRODUCTION_HARDENING.md`,
`AIM_027_CLOUD_DEPLOYMENT.md` describe a pilot readiness → operations →
analysis → hardening → cloud-deployment arc. Their existence is confirmed;
whether each stage has actually been executed (vs. still being a plan) was
**not** independently re-verified in this session — treat as stated intent
only.

## What is Unknown

- Whether any next phase is planned beyond what's stated above.
- Timeline/target dates for any phase.
