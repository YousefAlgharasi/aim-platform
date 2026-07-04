You are producing a complete inventory of the AIM Platform repository
(`aim-platform`, Supabase project `yrarpdkvdxszgxxondkt`).

This is not the repo-understanding audit
(`chief-architect-repo-understanding-prompt.md`) and it is not a redesign
exercise. It is a **catalog** — every real, load-bearing unit in this
codebase, listed once, described accurately. If you already have
`docs/architect-onboarding/project-memory.json` loaded, use it as a
starting point but verify every claim against the actual repo/database —
memory is a cache, not a substitute for checking.

Do not sample. Walk the whole tree. If you're not sure whether something
counts as a distinct "module" or "feature," include it and say why you
weren't sure, rather than silently dropping it.

## Include

- **Every module** — every `src/features/*` folder in
  `services/backend-api`, every top-level feature folder in
  `services/aim-engine/app`, every `lib/features/*` folder in
  `apps/mobile`, every `app/*`/`features/*` grouping in
  `apps/admin-dashboard`, `apps/student-web`, `apps/web`.
- **Every feature** — the user-facing or system-facing capability each
  module actually implements, not what its name implies.
- **Every service** — every `*.service.ts` / `*Service` class, every
  Python service/pipeline stage in `aim-engine`, and the top-level
  services themselves (`backend-api`, `aim-engine`).
- **Every package** — everything under `packages/` (`ai_core`, `content`,
  `ml`, `shared-contracts` — confirm this list is still current) and
  `services/api` (the reference-only package) — what each actually
  contains and who (if anyone) still imports from it.
- **Every database table** — every table in the live Supabase project,
  cross-checked against `services/backend-api/prisma/schema.prisma`. Note
  RLS status for each.
- **Every API** — every REST endpoint exposed by `backend-api`
  (controller-by-controller), the AIM Engine's own HTTP surface
  (`POST /aim/v1/analysis` and any others), and cross-check against
  `docs/mobile-app-api-endpoints.md` (or equivalent) for drift.
- **Every background job** — anything scheduled, queued, or fired
  asynchronously outside the request/response cycle: notification
  reminders (`reminder-schedule.service.ts`, `notification-queue.service.ts`,
  `admin-broadcast.service.ts` and similar under
  `services/backend-api/src/features/notifications/`), any cron-style
  trigger, any fire-and-forget pipeline call (e.g. the AIM orchestrator
  call from lesson/assessment/placement submission). Confirm this list is
  exhaustive, not just the obvious ones.
- **Every AI component** — every AIM Engine pipeline stage (mastery
  calculator, retention tracker, recommendation engine, difficulty
  adapter, emotional-state detector, weakness detector), every AI Teacher
  / Voice Teacher backend piece (context builder adapters, prompt
  builder, orchestrator, safety/governance services, provider gateway),
  and anything under `packages/ai_core`/`packages/ml`.
- **Every external integration** — Supabase (auth + Postgres), the AI
  provider gateway (whichever LLM provider(s) are actually wired, not
  just documented), STT/TTS providers, any payment/billing provider
  behind `services/backend-api/src/features/billing/`, any notification
  delivery provider (push/email/SMS), and anything else the codebase
  actually calls out to over the network.

## For each item, report

- **Purpose** — what it actually does, in one or two sentences, based on
  reading it, not its folder name or a doc's description.
- **Dependencies** — what it requires to function: other
  modules/services, specific tables, specific env vars, other packages.
  Distinguish hard dependencies from optional/soft ones.
- **Current status** — one of: `live and wired`, `built but not wired`
  (e.g. `VoiceMessageSubmitModule`, confirmed not imported by
  `VoiceTeacherModule` as of last check), `dead/orphaned`, `reference-only`,
  `partially implemented`, `unknown`. State how you determined this
  (grep result, test run, live query) — not an assumption.
- **Missing parts** — anything the item's own code/comments/tests
  indicate is incomplete, stubbed, deferred, or a known gap (e.g. a
  documented "known gap" comment, a TODO, a test explicitly marked as
  covering only part of a flow).
- **Unknown information** — anything you could not verify from the repo,
  live Supabase, or a test run. Mark it plainly as **Unknown** — do not
  infer or fill the gap with a plausible-sounding guess.

## Priority rule (same as the repo-understanding audit)

1. Documentation vs code → **code wins.**
2. Code vs database schema → **database wins.**
3. Either vs runtime evidence (an actual test run, an actual live query)
   → **runtime wins.**

## Output shape

Organize as one section per category (Modules, Features, Services,
Packages, Database Tables, APIs, Background Jobs, AI Components, External
Integrations), each a flat list of items in the five-field format above.
Cross-reference by name where the same underlying thing shows up in two
categories (e.g. a "service" that is also the sole implementation of a
"feature") rather than describing it twice from scratch.

## Do not

- Do not propose improvements, refactors, or a roadmap.
- Do not fix anything you find broken, dead, or missing.
- Do not skip an item because it seems unimportant — completeness is the
  point of this exercise, not editorial judgment about what matters.

Your only goal is a complete, accurate, verifiable catalog of what
exists in this repository right now.
