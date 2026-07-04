# 09 — Decisions

> Last verified: 2026-07-04. Sourced directly from `project-memory.json.decisions_log` (kept in sync — every decision below is also present there).

| Date | Decision | Made by | Context |
|---|---|---|---|
| 2026-07-04 | Git identity for all commits/pushes on this repo is **GHOST3030 / ahmedalalawi41@gmail.com**, never Claude/Anthropic attribution. | user | Set explicitly at start of Phase 21 work; applies to all subsequent sessions. |
| 2026-07-04 | Agent must **never open PRs** — user opens/merges all PRs manually. | user | Stated alongside the git-identity instruction. |
| 2026-07-04 | Any multi-task batch of work must be **fully tested** (build + full test suite) before pushing; failures must not be discovered after landing. | user | Stated before Phase 21 batch 1 (P21-001..010). |
| 2026-07-04 | Enable RLS on the 8 previously-exposed tables, applied live and committed as a migration. | user (approved via AskUserQuestion) | No permissive policies added, matching the existing default-deny pattern used by every other table in the schema. |
| 2026-07-04 | Reconcile `_prisma_migrations` for the 11 migrations applied out-of-band but never recorded in the Prisma ledger. | agent, user approved the batch | Done in the same session as the RLS fix and the `backend.env` untracking. |
| 2026-07-04 | Stop tracking `services/backend-api/backend.env` (contained a live Supabase service-role key, DB URL, JWT secret, AI/STT provider keys); harden `.gitignore`. | agent, flagged to user | The exposed keys remain in git history and still need rotation — **not done**, only the tracking was stopped. |
| 2026-07-04 | Install Flutter 3.44.1 / Dart 3.12.1 (exact match to `apps/mobile/.metadata`'s pinned hash) into this environment, add to PATH persistently. | user request | Closed the "mobile test pass/fail count Unknown" gap — 838/838 tests confirmed passing. |

## What is Unknown

- Whether any decisions were made in sessions/PRs prior to this
  memory file's creation that were never logged (the memory file itself
  states it was seeded incidentally, not from a systematic history scan).
