# Phase 20 — Making the AIM Engine Actually Run the App

This is a punch list, not a design doc. Each task below is meant to be handed to
Claude Code (web) **on its own**, as a self-contained prompt. Do the tasks in
order — later tasks depend on earlier ones being merged first, because they
read/write the same tables and services.

Decisions already made (do not re-litigate these in the tasks):

1. **Level gating** uses a CEFR ordinal rank added to `courses`, grouped into a
   `track`. A student may access any course whose rank is `<=` their computed
   level's rank, within the same track. Recommending a course never blocks
   access to lower-ranked courses in the same track.
2. **The richer algorithms in `services/api/src/aim`** (weighted mastery
   formula, personalized retention curves, the 12-action recommendation
   engine) get ported into the real `services/aim-engine`, replacing its
   current weaker inline logic. `services/api` itself becomes a documented,
   inert reference package afterward — nothing there is deleted, but nothing
   in production may import from it directly (aim-engine keeps its own copies).
3. **The AI Teacher's per-lesson "focus on this skill" directive** is
   persisted (new table), not recomputed from scratch on every chat turn.
4. **Existing broken data gets backfilled**, not just fixed going forward.

Every task must use the Supabase project `yrarpdkvdxszgxxondkt` ("Aim
Supabase") as the source of truth for current schema, and every schema change
must be shipped as a Prisma migration under
`services/backend-api/prisma/migrations/` (the authoritative migration
history — `database/supabase/migrations/` is docs-only and `backend/migrations/`
belongs to an unrelated legacy service; ignore both). Apply the migration to
the live Supabase project the same way existing migrations were applied
(`prisma migrate deploy` against `DATABASE_URL`), so `schema.prisma`, the
migration folder, and the live database never drift apart — anyone spinning up
a fresh DB from the migrations alone must land on the exact same schema.

---

## P20-001 — Add CEFR rank + track grouping to courses

**Why:** Today each CEFR level (A1, A2, A3...) is its own row in `courses`,
with no shared "track" and no numeric rank to compare against a student's
computed level. Gating logic (task P20-010) needs both.

**Read first:**
- `services/backend-api/prisma/schema.prisma` — find the `Course` and `Level` models.
- Supabase: `select id, title, sort_order from courses order by sort_order;` — confirm current rows (as of this audit: `English for Beginners A1`, `English for Beginners (A1)`, `Elementary English (A2)`, `English Basics`, `Pre-Intermediate English (A3)` — five rows, not cleanly one-per-CEFR-level; some of these look like duplicates/legacy seed data from different phases. **Do not guess which ones are real** — ask a human-readable confirmation by printing the list with `created_at` before writing the backfill, and flag any row whose title doesn't cleanly map to a CEFR code (e.g. "English Basics") instead of silently assigning it a rank.

**Schema change:**
- Add `courses.track_slug text not null default 'english'` — the subject/track this course belongs to (only one track exists today, but don't hardcode "english" into gating logic — read it from the column).
- Add `courses.cefr_code text null` — e.g. `'A1'`, `'A2'`, `'A3'`, `'B1'`... (null allowed for non-CEFR/legacy courses that must be excluded from gating, not force-mapped).
- Add `courses.cefr_rank smallint null` — `1` for A1, `2` for A2, `3` for A3, etc. Add a check constraint `courses_cefr_rank_positive check (cefr_rank is null or cefr_rank > 0)`.
- Add a partial unique index `unique (track_slug, cefr_rank) where cefr_rank is not null` so two courses in the same track can never claim the same rank.

**Data backfill (in the same migration, as a data-fixup SQL step, not a separate script):**
- For the rows that clearly map (title/slug contains "A1"/"A2"/"A3"/etc.), set `cefr_code`/`cefr_rank` accordingly.
- For rows that don't clearly map (e.g. "English Basics"), leave `cefr_code`/`cefr_rank` NULL and add a one-line `NOTICE` (via `RAISE NOTICE`) in the migration listing which course ids were left unmapped, so it's visible in the migration output — a human needs to decide what those are later, don't guess.

**Acceptance criteria:**
- `prisma migrate deploy` runs clean against the Supabase project.
- `select id, title, track_slug, cefr_code, cefr_rank from courses order by cefr_rank nulls last;` shows correct ranks for the CEFR-named courses and NULL for ambiguous ones.
- `schema.prisma`'s `Course` model has the three new fields and the unique index reflected.

**Claude Code web prompt:**
> Read `services/backend-api/prisma/schema.prisma` and the `courses` table in the Supabase project `yrarpdkvdxszgxxondkt` (via the Supabase MCP tools — `list_tables` and `execute_sql`) before changing anything. Add three columns to `courses`: `track_slug text not null default 'english'`, `cefr_code text null`, `cefr_rank smallint null`, plus a check constraint requiring `cefr_rank` to be null or positive, and a partial unique index on `(track_slug, cefr_rank) where cefr_rank is not null`. Write this as a new Prisma migration under `services/backend-api/prisma/migrations/`, following the naming and structure of the existing migrations in that folder (look at `20260616041000_create_initial_learning_path_table` for the house style). In the same migration's SQL, backfill `cefr_code`/`cefr_rank` for existing course rows whose title unambiguously indicates a CEFR level (A1/A2/A3/etc. — actually query the live `courses` table for the current rows and their titles rather than assuming any specific list, since seed data may have changed). For any course row where the CEFR level is not unambiguous from its title/slug, leave the columns NULL and emit a `RAISE NOTICE` naming that course's id and title so it's visible in migration output — do not guess a mapping for it. Update `schema.prisma`'s `Course` model to match. Apply the migration to the live Supabase project the same way existing migrations are applied in this repo (check `services/backend-api/package.json` or `README.md` for the exact deploy command used, e.g. `npx prisma migrate deploy`). Do not touch any other files. Report back the final column list and which courses were left unmapped.

---

## P20-002 — Persist the student's computed proficiency level and unlock ceiling

**Why:** Nothing in the schema currently stores "what level does the AIM
engine currently think this student is at" as a durable, queryable value.
`placement_results.estimated_level` only captures the one-time placement
snapshot; there's no ongoing, engine-updated level that reflects post-placement
progress (e.g. after finishing a course, or after enough attempts shift their
skill states).

**Read first:**
- `services/backend-api/prisma/schema.prisma` — `PlacementResult`, `StudentProfile` models.
- `services/backend-api/src/features/placement/placement-scoring.config.ts` — existing CEFR threshold/level constants, reuse them, don't reinvent.

**Schema change:**
- New table `student_level_state`:
  - `id uuid primary key default gen_random_uuid()`
  - `student_id uuid not null references student_profiles(id)`
  - `track_slug text not null default 'english'`
  - `current_cefr_rank smallint not null` — the engine's current best estimate, as a rank (matches `courses.cefr_rank`).
  - `max_unlocked_cefr_rank smallint not null` — usually equal to `current_cefr_rank`, but this is the actual gating field (see P20-011: it only advances once a course is *completed*, not merely recommended).
  - `source text not null` — `'placement'` or `'aim_engine'`, so you can tell whether the row reflects the initial placement test or a later recompute.
  - `last_computed_at timestamptz not null default now()`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
  - unique `(student_id, track_slug)` — one current-state row per student per track.

**Acceptance criteria:**
- Migration applies cleanly.
- Table supports one row per student per track, upsertable.

**Claude Code web prompt:**
> Read `services/backend-api/prisma/schema.prisma` (models `PlacementResult`, `StudentProfile`) and `services/backend-api/src/features/placement/placement-scoring.config.ts` (for the existing CEFR level constants/thresholds — reuse them, don't redefine new ones). Add a new table `student_level_state` as a Prisma model and migration: `id` (uuid pk), `student_id` (uuid, fk to `student_profiles.id`), `track_slug` (text, default `'english'`), `current_cefr_rank` (smallint, not null), `max_unlocked_cefr_rank` (smallint, not null), `source` (text, not null — values will be `'placement'` or `'aim_engine'`, add a check constraint restricting to those two values), `last_computed_at` (timestamptz, default now()), `created_at`/`updated_at` (timestamptz, default now()). Add a unique constraint on `(student_id, track_slug)`. Follow the existing migration folder's file naming/structure (`services/backend-api/prisma/migrations/`). This task only creates the table — do not wire anything to populate or read it yet (that happens in later tasks P20-006 and P20-010). Apply the migration to the Supabase project `yrarpdkvdxszgxxondkt` the same way other migrations in this repo are deployed. Report the final table DDL.

---

## P20-003 — Persist the AI Teacher's per-student "focus directive"

**Why:** You want each lesson's system prompt (`lessons.system_prompt`,
already real) to be paired with a second, engine-maintained piece of text that
tells the AI Teacher what to emphasize/practice more, updated every time the
AIM engine recomputes (after a quiz, exam, or lesson attempt). That second
piece needs somewhere durable to live, separate from the lesson content.

**Read first:**
- `services/backend-api/src/features/ai-teacher/context-builder/context-builder.types.ts`
- `services/backend-api/src/features/ai-teacher/context-builder/adapters/` (all adapter files, to match existing style)
- Supabase: `ai_context_snapshots` table columns — check if it can be reused instead of a brand-new table.

**Schema change:**
- New table `ai_focus_directives` (do not overload `ai_context_snapshots` — it's a snapshot log, this is a single current-state row that gets replaced in place):
  - `id uuid primary key default gen_random_uuid()`
  - `student_id uuid not null references student_profiles(id)`
  - `skill_id text not null` — matches the `skill_id text` convention already used in `student_skill_states`/`weakness_records`/`recommendations` (these are AIM-engine skill identifiers, not necessarily FKs to the `skills` table — confirm this against `student_skill_states.skill_id`'s actual values before assuming, and match its type/semantics exactly).
  - `directive_text text not null` — the actual sentence(s) to inject into the AI Teacher prompt, e.g. "The student struggles with past-tense irregular verbs; use extra examples and check understanding before moving on."
  - `source text not null` — `'weakness_record' | 'recommendation' | 'difficulty_decision'`, whichever AIM output triggered this directive, with a check constraint.
  - `source_id uuid null` — the id of the weakness_record/recommendation/difficulty_decision row that produced it, for auditability.
  - `generated_at timestamptz not null default now()`
  - `active boolean not null default true` — only one active directive per student should be current; superseding a directive sets the old one's `active = false` rather than deleting it (audit trail).
  - `created_at timestamptz not null default now()`
  - index on `(student_id, active)`.

**Acceptance criteria:**
- Migration applies cleanly.
- `schema.prisma` model added, matching the naming conventions of sibling AIM models (`WeaknessRecord`, `Recommendation`, etc.) already in the file.

**Claude Code web prompt:**
> Read `services/backend-api/src/features/ai-teacher/context-builder/context-builder.types.ts`, every file under `services/backend-api/src/features/ai-teacher/context-builder/adapters/`, and the existing `WeaknessRecord`/`Recommendation`/`StudentSkillState` models in `services/backend-api/prisma/schema.prisma` — match their conventions exactly (in particular, check what type and semantics `student_skill_states.skill_id` actually uses today, via the Supabase MCP tools against project `yrarpdkvdxszgxxondkt`, before deciding the new table's `skill_id` column type). Add a new table `ai_focus_directives`: `id` (uuid pk), `student_id` (uuid, fk to `student_profiles.id`), `skill_id` (same type/semantics as `student_skill_states.skill_id`), `directive_text` (text, not null), `source` (text, not null, check constraint restricting to `'weakness_record'`, `'recommendation'`, `'difficulty_decision'`), `source_id` (uuid, nullable), `generated_at` (timestamptz, default now()), `active` (boolean, default true), `created_at` (timestamptz, default now()). Add an index on `(student_id, active)`. Write this as a Prisma migration following the existing folder's conventions, add the corresponding Prisma model to `schema.prisma`, and deploy it to the Supabase project the same way other migrations in this repo are deployed. Do not wire any application code to read/write this table yet — that is a separate task (P20-013). Report the final table DDL and confirm the migration applied.

---

## P20-004 — Fix `initial_learning_path.skill_id` always-NULL bug, and backfill existing rows

**Why:** `PlacementInitialLearningPathService.createInitialPath()` hardcodes
`skill_id: null` on every row it writes (both `buildFromWeaknessMap` and
`buildFallback`), which breaks the `WHERE skill_id IS NOT NULL` filter in
`LessonProgressService.findRecommendedCourse`/`findQuickStartLesson`, so the
placement-driven recommendation path never fires for anyone, ever, and every
student silently gets the generic fallback instead.

**Read first:**
- `services/backend-api/src/features/placement/placement-initial-learning-path.service.ts` — both `buildFromWeaknessMap` (~line 228) and `buildFallback` (~lines 259-261).
- `services/backend-api/src/features/lessons/lesson-progress.service.ts` — `findRecommendedCourse`/`findQuickStartLesson`, to see exactly what shape of `skill_id` they expect (they join against `skills.id` — confirm this).
- `services/backend-api/prisma/migrations/20260616041000_create_initial_learning_path_table/migration.sql` — the CHECK constraint `initial_learning_path_skill_requires_skill_id`.
- Supabase: `select entry_type, skill_code, skill_key, skill_id, skill_name from initial_learning_path limit 20;` to see what data is actually available to derive `skill_id` from on existing rows.

**Code fix:**
- In both `buildFromWeaknessMap` and `buildFallback`, resolve the real `skill_id` by looking up the `skills` table using whatever identifying field is available at that point (`skill_code` or `skill_key` — check which the `skills` table's unique columns actually are, via Supabase, don't assume). Only write `skill_id: null` when `entry_type !== 'skill'` (the CHECK constraint already encodes this rule — respect it, don't just always populate it).
- Add/update the unit test for this service to assert `skill_id` is populated for `entry_type: 'skill'` rows.

**Backfill (existing data):**
- Write a one-off backfill migration (SQL, in `services/backend-api/prisma/migrations/`) that, for existing `initial_learning_path` rows where `entry_type = 'skill'` and `skill_id is null`, joins to `skills` on whichever code/key column matches and sets `skill_id` accordingly. Log (via `RAISE NOTICE`) any row that can't be resolved (no matching skill) instead of silently leaving it broken or guessing.

**Acceptance criteria:**
- New placement completions produce `initial_learning_path` rows with real `skill_id` values.
- Existing rows backfilled where resolvable; unresolvable rows reported, not silently dropped.
- `LessonProgressService.findRecommendedCourse`/`findQuickStartLesson`'s primary CTE now actually returns rows for at least one real backfilled student — verify with a manual query against Supabase after backfill, not just unit tests.

**Claude Code web prompt:**
> Read `services/backend-api/src/features/placement/placement-initial-learning-path.service.ts` in full, `services/backend-api/src/features/lessons/lesson-progress.service.ts` (specifically `findRecommendedCourse` and `findQuickStartLesson`), and `services/backend-api/prisma/migrations/20260616041000_create_initial_learning_path_table/migration.sql`. Then query the live Supabase project `yrarpdkvdxszgxxondkt` (via MCP tools) for the `skills` table's actual unique/identifying columns and for a sample of existing `initial_learning_path` rows (`select entry_type, skill_code, skill_key, skill_id, skill_name from initial_learning_path limit 20`) to see what's really there — do not assume the shape. Fix `placement-initial-learning-path.service.ts` so that both `buildFromWeaknessMap` and `buildFallback` resolve and populate a real `skill_id` (by looking up the `skills` table on whatever code/key field is actually available and correct) whenever `entry_type === 'skill'`, while continuing to write `skill_id: null` when `entry_type !== 'skill'` (per the existing CHECK constraint `initial_learning_path_skill_requires_skill_id` — do not violate it). Update or add unit tests asserting this. Then write a separate one-off SQL migration under `services/backend-api/prisma/migrations/` that backfills `skill_id` on existing `initial_learning_path` rows where `entry_type = 'skill' and skill_id is null`, by joining `skills` on the matching code/key column, and emits a `RAISE NOTICE` for any row it cannot resolve rather than skipping silently. Deploy the migration to the Supabase project the same way others are deployed, then run a verification query confirming the backfill worked and report the before/after counts of NULL `skill_id` rows.

---

## P20-005 — Implement `AimStateAssemblyService.assemble()` (the root-cause stub)

**Why:** This is the single highest-leverage fix. `assemble()` currently
always `return null`s (marked `// Stub`, "not yet implemented (P5-047)"),
which makes `AimPipelineOrchestratorService` treat every real invocation as a
no-op. Until this is implemented, nothing downstream in this punch list
(course gating recompute, focus directives, review scheduling) ever actually
runs for a real student, no matter what else gets built.

**Read first:**
- `services/backend-api/src/features/aim/pipeline/aim-state-assembly.service.ts` (the stub itself).
- `services/backend-api/src/features/aim/pipeline/aim-pipeline-orchestrator.service.ts` — see exactly what shape `assemble()`'s return value needs to be, and what it's called with.
- `services/aim-engine/app/schemas/aim_analysis_request.py` — the Pydantic contract `assemble()`'s output must eventually satisfy (via the backend's request mapper) — session block, attempts array, level_context, placement_context, behavioral_context, contract_version, etc.
- `services/backend-api/src/features/aim/adapter/aim-engine-contract.spec.ts` — the field-name parity test; your assembled object must survive being mapped through whatever mapper feeds this contract test.
- Whatever tables hold session/attempt data today: `learning_sessions`, `lesson_attempts`, `session_events` (check Supabase for exact columns — confirm which table is session-level vs attempt-level before writing queries).
- `services/backend-api/src/features/aim/pipeline/aim-pipeline-orchestrator.service.spec.ts` — currently asserts "state assembly null → no-op" as *passing* behavior; this test's expectation must change once assembly is real, so update it, don't just leave it contradicting the new behavior.

**Implementation:**
- `assemble(sessionId, studentId)` must query the real session/attempt data (from `learning_sessions`/`lesson_attempts`/`session_events`, whichever combination is authoritative — confirm by reading how those tables are populated elsewhere in the codebase, e.g. `sessions/*.service.ts`) and build the exact object shape the orchestrator expects to hand to the AIM Engine client, matching every field the Pydantic schema in `aim_analysis_request.py` requires (do not invent optional fields casually — check which are actually required vs optional in the schema).
- Handle the "not enough data yet" case explicitly and intentionally (e.g. a session with zero attempts) — return a value that causes a clean, deliberate skip further up the pipeline, not an exception, and not a silent null that gets misread as "stub still not implemented." Make this distinction visible in the code (e.g. a distinct return type/tag), since the orchestrator currently can't tell "no-op because stub" from "no-op because no data" and that ambiguity should not survive this task.

**Acceptance criteria:**
- `aim-pipeline-orchestrator.service.spec.ts` updated to reflect: real assembly → real HTTP call to AIM Engine → real persistence, with a new explicit test for the "not enough data" skip path.
- Manually trigger a real lesson attempt end-to-end in a dev/staging environment and confirm (via Supabase) that `student_skill_states`, `weakness_records`, `recommendations`, and `review_schedules` actually get rows written for that student — this was previously impossible; it's the core proof this task worked.

**Claude Code web prompt:**
> Read, in this order: `services/backend-api/src/features/aim/pipeline/aim-state-assembly.service.ts` (the stub to implement), `services/backend-api/src/features/aim/pipeline/aim-pipeline-orchestrator.service.ts` and its spec file, `services/aim-engine/app/schemas/aim_analysis_request.py` (the exact contract the assembled state must eventually satisfy), and `services/backend-api/src/features/aim/adapter/aim-engine-contract.spec.ts`. Then find and read whichever of `learning_sessions`, `lesson_attempts`, `session_events` (check Supabase project `yrarpdkvdxszgxxondkt` for their actual columns via MCP tools, and grep the codebase for where each is written) actually holds the authoritative per-session, per-attempt data today. Implement `AimStateAssemblyService.assemble()` to query that real data and build the exact request-shaped object the orchestrator passes on to the AIM Engine client, matching every required field in `aim_analysis_request.py` — do not add fields that schema doesn't require, and do not guess a field's meaning if it's ambiguous; grep for other real usages of the same field name first. Explicitly handle the case where a session has no/insufficient attempts yet: return something the orchestrator can distinguish from "not implemented" (e.g. a tagged result type), and make sure this causes a clean, intentional skip rather than an exception or a silently-wrong analysis call. Update `aim-pipeline-orchestrator.service.spec.ts`, which currently encodes the *old* stub behavior ("state assembly null (stub phase) → ok: true (no-op skipped)") as a passing test — that test needs to change to reflect real assembly running the real pipeline, plus a new test for the intentional-skip path. Do not modify the AIM Engine service itself in this task. When done, describe how you'd manually verify against the Supabase project that a real lesson attempt produces rows in `student_skill_states`, `weakness_records`, `recommendations`, and `review_schedules` — and if you have a way to actually run this end-to-end in this environment, do so and report the result.

---

## P20-006 — Wire the pipeline to fire after every quiz/exam/attempt event

**Why:** Even with P20-005 done, the orchestrator needs to actually be called
at the right moments: after a lesson attempt, after an assessment/exam
submission, and after placement completion (which also needs to seed
`student_level_state`, task P20-002's table).

**Read first:**
- Every call site (or lack thereof) of `AimPipelineOrchestratorService` — grep for it across `services/backend-api/src/features/`.
- `services/backend-api/src/features/lessons/` attempt-submission endpoint.
- `services/backend-api/src/features/placement/placement-attempt-complete.service.ts` and `placement-result.service.ts`.
- Whatever assessment-attempt-submit service exists under `services/backend-api/src/features/assessments/` (per `docs/mobile-app-api-endpoints.md` §10, `POST /student/assessments/attempts/:attemptId/submit`).

**Implementation:**
- Call the orchestrator (async, non-blocking to the student-facing response — the response should not wait on the AIM Engine round trip beyond what the existing retry/timeout policy already governs) from: lesson attempt submission, assessment attempt submission, and placement attempt completion.
- On placement completion specifically, also upsert `student_level_state` (P20-002) with `source = 'placement'`, `current_cefr_rank` derived from `placement_results.estimated_level` via `courses.cefr_rank`/`cefr_code` (P20-001), and `max_unlocked_cefr_rank` set per the rule in P20-011 (do not set it equal to `current_cefr_rank` — read P20-011 first, since first-time placement is a special case where the recommended level's rank IS the initial unlock ceiling, since there's no prior course to have "completed").
- Do not duplicate calls if multiple events fire close together — check whether the orchestrator already has idempotency/debouncing; if not, note this as a limitation in the PR description rather than inventing a debounce mechanism speculatively.

**Acceptance criteria:**
- Submitting a lesson attempt, an assessment attempt, or completing placement all trigger a real orchestrator call (visible via logs and via new rows in the AIM tables).
- Existing tests for these submission endpoints still pass; add tests asserting the orchestrator is invoked (via a mock/spy), not asserting on real AIM Engine network behavior.

**Claude Code web prompt:**
> Grep the whole `services/backend-api/src/features/` tree for existing usages of `AimPipelineOrchestratorService` to find where (if anywhere) it's currently called. Read the lesson-attempt-submission service, `services/backend-api/src/features/placement/placement-attempt-complete.service.ts` and `placement-result.service.ts`, and the assessment-attempt-submit service (find it under `services/backend-api/src/features/assessments/` — check `docs/mobile-app-api-endpoints.md` section 10 for the exact endpoint name if needed). Wire a call to `AimPipelineOrchestratorService` from all three flows (lesson attempt submit, assessment attempt submit, placement attempt complete), in a way that doesn't block the student-facing HTTP response beyond the orchestrator's own existing retry/timeout budget (`aim-adapter-timeout-policy.service.ts` already governs this — read it, don't add a second timeout layer). For the placement-completion path specifically, also upsert a row in `student_level_state` (added in task P20-002 — read that task's description and the resulting Prisma model before writing this) with `source = 'placement'` and `current_cefr_rank` derived by joining `placement_results.estimated_level` against `courses.cefr_code`/`cefr_rank` (added in task P20-001). For `max_unlocked_cefr_rank` on first placement, read task P20-011 in this same document first — first-time placement is a special case, don't just copy `current_cefr_rank` without checking. Add tests (using mocks/spies on the orchestrator, not real network calls) confirming each of the three flows invokes it exactly once. If you find evidence the orchestrator isn't safe to call multiple times in quick succession (no idempotency guard), do not build a debounce mechanism speculatively — just note it clearly in your final report as a known limitation.

---

## P20-007 — Port the real weighted mastery formula into aim-engine

**Why:** The deployed pipeline currently computes mastery as bare session
accuracy (`accuracy = correct/total; mastery_score = round(accuracy, 2)`) —
no history, no consistency, no retention, no difficulty weighting. The unused
`services/api/src/aim/domain/services/mastery_calculator.py` already has the
real formula (`accuracy*0.40 + consistency*0.20 + retention*0.15 +
difficulty*0.20 + evidence_quality*0.05`, with reliability blending against
previous mastery and movement caps). Port it in.

**Read first:**
- `services/aim-engine/app/pipeline/aim_analysis_pipeline.py` lines ~262-286 (current mastery calc) — understand exactly what inputs it currently has available (session attempts only, no cross-session history).
- `services/api/src/aim/domain/services/mastery_calculator.py` in full — note it expects historical/previous-mastery inputs that the current pipeline doesn't fetch yet.
- `services/aim-engine/Dockerfile` — see exactly how `services/api/src/aim` files get copied in (`PYTHONPATH` hack) and which 3 files are currently used (`difficulty_adapter.py`, `emotional_state_detector.py`, `weakness_detector.py`) — you're adding a 4th.
- `student_skill_states` table (Supabase) — `previous_mastery_score`, `mastery_trend` columns already exist and are exactly the kind of history `MasteryCalculator` needs; confirm the pipeline can read the student's existing `student_skill_states` row before computing the new one (it currently doesn't — check `aim_analysis_request.py` for whether prior skill state is even passed into the request at all; if it isn't, this task also needs to extend the request contract, coordinate with what P20-005 assembles).

**Implementation:**
- Copy (don't just import across the sibling-package boundary in a fragile way — follow whatever pattern the Dockerfile already establishes for the 3 existing ported files) `mastery_calculator.py`'s logic into the aim-engine's pipeline, or add it to the Dockerfile's copy list if the existing import mechanism already supports adding new modules from `services/api/src/aim` cleanly.
- Replace the session-only accuracy calculation with a call to `MasteryCalculator`, feeding it the student's previous mastery/skill-state (from the request payload — extend `aim_analysis_request.py` and the backend's assembly/mapper from P20-005 to include it if it's not already there) plus the current session's accuracy/consistency/evidence-quality inputs.
- Update `aim-engine-contract.spec.ts` and the Python-side request schema together if you change the request contract — they must never drift (that's the entire point of that test).

**Acceptance criteria:**
- Unit tests for the new mastery path in `services/aim-engine/tests/`.
- Contract test still passes after any schema field additions.
- Mastery scores now reflect more than single-session accuracy when a student has prior history.

**Claude Code web prompt:**
> Read `services/aim-engine/app/pipeline/aim_analysis_pipeline.py` (the current mastery calculation, ~lines 262-286), `services/api/src/aim/domain/services/mastery_calculator.py` in full, `services/aim-engine/Dockerfile` (to see exactly how the 3 currently-used files from `services/api/src/aim` — `difficulty_adapter.py`, `emotional_state_detector.py`, `weakness_detector.py` — get copied into the image and imported), and `services/aim-engine/app/schemas/aim_analysis_request.py`. Check via the Supabase MCP tools (project `yrarpdkvdxszgxxondkt`) what `student_skill_states.previous_mastery_score` and `mastery_trend` actually contain for real rows. Determine whether the current request payload sent to `POST /aim/v1/analysis` already includes the student's prior skill state for the skill(s) in question — if not, extend `aim_analysis_request.py` with the minimum necessary field(s), and correspondingly extend whatever backend service builds that request (this depends on task P20-005 having been completed — read `AimStateAssemblyService.assemble()` after that task lands, to add the prior-skill-state lookup there rather than duplicating logic). Port `MasteryCalculator`'s weighted formula (`accuracy*0.40 + consistency*0.20 + retention*0.15 + difficulty*0.20 + evidence_quality*0.05`, with its reliability blending and movement caps) into the aim-engine's pipeline, following the same copy/import pattern the Dockerfile already uses for the other 3 ported files, and replace the current bare-accuracy mastery calculation with it. If you change the request/response contract, update `services/backend-api/src/features/aim/adapter/aim-engine-contract.spec.ts` and the Pydantic schema in the same change — they must stay in exact camelCase/snake_case parity, that's what the contract test enforces. Add unit tests for the new mastery path under `services/aim-engine/tests/`. Report what changed in the request contract, if anything.

---

## P20-008 — Port real retention curves and fix the hardcoded difficulty inputs

**Why:** Two separate hardcodes exist in the same file
(`services/aim-engine/app/pipeline/aim_analysis_pipeline.py`): review
scheduling uses a single fixed `retention_lambda = 0.15` for every student and
skill (line ~495), and the difficulty decision is fed `consistency = 100.0`
(line ~378) and `retention = 100.0` (line ~392) regardless of the student's
actual behavior — meaning `DifficultyAdapter.decide()` is real code operating
on fake inputs for two of its five signals. `services/api/src/aim/domain/services/retention_tracker.py`
already has per-category default lambdas and a least-squares personalized-lambda
fit from history — port it in and use its output for both places.

**Read first:**
- `services/aim-engine/app/pipeline/aim_analysis_pipeline.py` lines ~370-500 (difficulty decision inputs and review scheduling) in full.
- `services/api/src/aim/domain/services/retention_tracker.py` in full, including `_fit_lambda`.
- `review_schedules` table (Supabase) — it already stores `interval_days`/`repetition_count`/`based_on_attempt_id` per student per skill; this is exactly the history `RetentionTracker` needs to fit a personalized lambda. Confirm the aim-engine currently has no way to read a student's own `review_schedules` history before computing a new one (it's side-effect-free/stateless per its own docstring — this task necessarily changes that assumption for reads, though writes still happen only in the backend, per the existing "AIM Engine doesn't write to any DB" design — don't violate that; the engine should receive history as part of the request payload, not query the DB directly itself).

**Implementation:**
- Extend the request payload (`aim_analysis_request.py` + the backend's `AimStateAssemblyService.assemble()` from P20-005) to include the student's recent review-schedule/retention history for the skill(s) being analyzed, sourced from `review_schedules`.
- Port `RetentionTracker`'s per-category default lambdas and personalized-fit logic into the aim-engine pipeline (same Dockerfile-copy pattern as P20-007).
- Use the fitted/derived retention value to replace the hardcoded `retention = 100.0` difficulty input, and use the category-appropriate (or personalized, once enough history exists) lambda to replace the hardcoded `retention_lambda = 0.15` in the review-scheduling calculation.
- For `consistency = 100.0`: this needs a real measure of how consistent the student's recent performance has been (e.g. variance across recent attempts/sessions) — check whether `MasteryCalculator` (P20-007) already produces a consistency figure as a byproduct; if so reuse it rather than computing a second, possibly-inconsistent definition of "consistency."

**Acceptance criteria:**
- No literal `100.0` or `0.15` hardcodes remain in `aim_analysis_pipeline.py` for these two inputs.
- Unit tests confirming retention/consistency vary sensibly given different synthetic history inputs (e.g., a student who's been failing recently gets a lower retention estimate than one who's been passing consistently).

**Claude Code web prompt:**
> Read `services/aim-engine/app/pipeline/aim_analysis_pipeline.py` lines ~370-500 in full (the difficulty decision inputs and the review-scheduling calculation), and `services/api/src/aim/domain/services/retention_tracker.py` in full including `_fit_lambda`. Check the `review_schedules` table's real columns via the Supabase MCP tools on project `yrarpdkvdxszgxxondkt`. This task depends on P20-005 and P20-007 having landed — read `AimStateAssemblyService.assemble()` and whatever consistency figure `MasteryCalculator` now produces (from P20-007) before writing new code, so you don't duplicate a second, inconsistent definition of "consistency." Extend `aim_analysis_request.py` and the backend's state-assembly step to include the student's recent `review_schedules` history for the relevant skill(s) — the AIM Engine must stay side-effect-free/stateless per its own module docstring, so it receives this history as part of the request payload; it does not query the database directly. Port `RetentionTracker`'s per-category default lambdas and its least-squares personalized-lambda fit into the aim-engine pipeline (same copy/import pattern the Dockerfile already uses). Replace the hardcoded `retention = 100.0` difficulty-decision input with the tracker's derived retention estimate, and replace the hardcoded `retention_lambda = 0.15` in the review-scheduling formula with the category-appropriate or personalized lambda. Replace the hardcoded `consistency = 100.0` difficulty-decision input by reusing whatever consistency figure `MasteryCalculator` (from task P20-007) now produces. Add unit tests with synthetic attempt histories confirming retention/consistency estimates move in the expected direction (a recently-struggling student should score lower on both than a consistently-succeeding one). Update the contract test and Pydantic schema together if the request shape changes, keeping exact field-name parity.

---

## P20-009 — Port the real recommendation engine, replace the shallow if/elif

**Why:** Recommendations today are a 3-branch if/elif on skill accuracy
thresholds with no prerequisite awareness, no spaced-review integration, and
rank = enumeration order. `services/api/src/aim/domain/services/recommendation_engine.py`
already has a 12-action priority cascade (tutor intervention, easy-win,
prerequisite review, reteach, targeted practice, spaced review,
confidence-builder, mixed practice/transfer learning, etc.) with skill-graph
and contextual-memory awareness. Port it in.

**Read first:**
- `services/aim-engine/app/pipeline/aim_analysis_pipeline.py` lines ~444-452 (current shallow logic).
- `services/api/src/aim/domain/services/recommendation_engine.py` in full — note what inputs it expects (skill graph, contextual memory, error-pattern classifier, confidence matrix) and which of those the current request payload doesn't yet supply.
- `recommendations` table (Supabase) columns — `kind`, `target_skill_id`, `target_lesson_id`, `rank`, `reason`, `based_on_weakness_id` — confirm the ported engine's output action types map cleanly onto whatever `kind` values the backend/mobile app already expect (grep the mobile app and backend read services for any hardcoded `kind` string comparisons before renaming/expanding the enum).
- `skills` table and whatever prerequisite-relationship data exists (check for a `skill_prerequisites` table or similar — if none exists, this is a gap; report it rather than fabricating prerequisite data).

**Implementation:**
- Port the recommendation engine, feeding it real inputs from the (by now, post-P20-007/008) richer pipeline state.
- If prerequisite-graph data doesn't exist in the schema yet, do not invent placeholder prerequisite data — implement the engine so prerequisite-dependent branches degrade gracefully (skip that consideration) when no prerequisite data is available, and flag this gap explicitly in your report rather than guessing at a fake skill graph.
- Keep `kind`/`reason` values backward-compatible with whatever the mobile app and backend currently expect, or coordinate a matching mobile-side change if you need new `kind` values (check `apps/mobile` for any hardcoded switch/case on recommendation `kind` first).

**Acceptance criteria:**
- Unit tests covering at least the priority ordering between a few of the 12 action types with synthetic inputs.
- Contract test still passes.
- No fabricated prerequisite/skill-graph data introduced.

**Claude Code web prompt:**
> Read `services/aim-engine/app/pipeline/aim_analysis_pipeline.py` lines ~444-452 (current recommendation logic) and `services/api/src/aim/domain/services/recommendation_engine.py` in full. Check the `recommendations` table's columns on Supabase project `yrarpdkvdxszgxxondkt`, and grep `apps/mobile` and `services/backend-api/src/features/` for every place that reads/switches on a recommendation's `kind` field, so you know what values are already load-bearing on the client side before changing or expanding that enum. Check whether any prerequisite/skill-graph table exists in the schema (e.g. something like `skill_prerequisites`) — if it does not exist, do not invent one or fabricate placeholder prerequisite data; instead implement the ported recommendation engine so that its prerequisite-dependent branches degrade gracefully (are simply skipped) when no real prerequisite data is available, and say so explicitly in your final report as a known gap for a future task. Port the 12-action recommendation engine into the aim-engine pipeline (same copy/import pattern as prior tasks), feeding it from the richer pipeline state produced by tasks P20-007 and P20-008 (read those tasks' resulting code before starting, since this depends on them). Preserve backward compatibility with existing `kind`/`reason` values consumed elsewhere, or clearly call out in your report any new `kind` value you introduce and where the client would need to handle it. Add unit tests exercising priority ordering between several of the 12 action types under different synthetic inputs. Confirm the contract test still passes.

---

## P20-010 — Enforce course/level gating in the backend (and surface it to the app)

**Why:** This is the actual "student can access A1/A2/A3 but not A4" rule.
Nothing enforces it today — `/curriculum/courses` and `/student/chapters`
return everything regardless of the student's level.

**Read first:**
- `services/backend-api/src/features/lessons/lesson-progress.service.ts` and whatever controller backs `GET /curriculum/courses` and `GET /student/chapters` (per `docs/mobile-app-api-endpoints.md` §4).
- The new `courses.track_slug`/`cefr_rank` columns (P20-001) and `student_level_state` table (P20-002).
- Whatever endpoint handles "start a course/lesson" — you need a server-side check there too, not just a filtered list (a locked course must be un-startable even if its id is guessed/hardcoded client-side).

**Implementation:**
- `GET /curriculum/courses`: for the authenticated student, join against `student_level_state` (falling back to "no state yet → only rank-1 courses in each track unlocked" if the student hasn't completed placement) and return each course with an explicit `locked: boolean` field (extend `CourseModel`/`CourseResponse` shape — check `apps/mobile` model for whether adding a field is additive/safe, since Flutter's `fromJson` needs the field to be optional-safe if the app isn't updated in lockstep).
- Server-side enforcement: whatever endpoint starts a lesson/chapter/course attempt must re-check `cefr_rank <= max_unlocked_cefr_rank` and reject (403 or a clear domain error) if the course is locked — do this even though the list endpoint already filters, because list-endpoint filtering alone is not access control.
- Do not touch `/curriculum/lessons`/`/curriculum/chapters` (the non-progress, admin/content-authoring endpoints per the existing doc) — gating applies to the student-facing progress endpoints (`/student/chapters`, `/student/lessons`) and course start, not the raw content-listing endpoints.

**Acceptance criteria:**
- A student whose `max_unlocked_cefr_rank` is 2 sees A1/A2 courses unlocked and A3+ locked in `/curriculum/courses`.
- Attempting to start a lesson inside a locked course is rejected server-side, independent of what the client shows.
- Existing tests for these endpoints still pass; new tests cover both the locked-list and the locked-start-rejection cases.

**Claude Code web prompt:**
> This task depends on P20-001 (courses.track_slug/cefr_rank) and P20-002 (student_level_state) having landed — read the resulting Prisma models first. Read `services/backend-api/src/features/lessons/lesson-progress.service.ts`, the controller behind `GET /curriculum/courses` and `GET /student/chapters` (see `docs/mobile-app-api-endpoints.md` section 4 for the endpoint list), and whichever service handles starting a lesson/chapter/course attempt. Modify the course-listing path used by the student-facing app (not the raw `/curriculum/lessons`/`/curriculum/chapters` content-authoring endpoints — leave those alone) to join against `student_level_state` for the authenticated student and return each course with an explicit `locked` boolean, unlocking every course whose `cefr_rank <= max_unlocked_cefr_rank` for that student's track (and treating a student with no `student_level_state` row yet as only having rank-1 courses unlocked). Check `apps/mobile`'s corresponding model (`CourseModel` or similar, under `apps/mobile/lib/features/lessons/data/models/`) to confirm adding a new field to the JSON response won't break its `fromJson` parsing — make the mobile-side field nullable/optional if you touch it, or note explicitly in your report if you're intentionally leaving the mobile model unchanged for now. Separately, add a server-side check in whichever endpoint actually starts a lesson/chapter within a course, rejecting the start (403 or a clear domain error, following this codebase's existing error-handling conventions — check a neighboring feature for the pattern) if that course's `cefr_rank > max_unlocked_cefr_rank` for the student — this check must exist independently of the list-endpoint filtering, since a client could otherwise start a "locked" course directly by id. Add tests for both the locked-list case and the locked-start-rejection case.

---

## P20-011 — Course completion gates the *next* unlock, independent of what was recommended

**Why:** You were explicit: no matter which course/level gets recommended as
the starting point, a course only counts as "done" — and only unlocks the
next level — once **every** lesson in it is completed. Starting at A3
(because that's what's recommended) doesn't let a student skip straight to
A4; they still need to finish A3 (or A1/A2, if they chose to start lower)
before the next rank unlocks.

**Read first:**
- `lesson_progress` table — per-student, per-lesson `completed` boolean already exists; a course is "complete" when every lesson under every chapter under that course has `completed = true` for that student.
- `chapters`/`lessons` tables — to compute "every lesson in course X" (courses → chapters → lessons, all filtered to `status = 'published'` presumably — confirm against existing query patterns in `lesson-progress.service.ts`, which already does similar joins).
- `student_level_state` (P20-002).

**Implementation:**
- Add a method (e.g. `CourseCompletionService.isCourseComplete(studentId, courseId)`) that checks 100% lesson completion for that course.
- Trigger this check whenever a lesson is marked complete (find and hook into wherever `lesson_progress.completed` gets set to `true`). If the just-completed lesson's course is now 100% complete AND that course's `cefr_rank === student's current max_unlocked_cefr_rank` (i.e., they just finished the course at the frontier of their unlock ceiling — finishing a course *below* their ceiling shouldn't re-advance anything), advance `student_level_state.max_unlocked_cefr_rank` to the next rank in that track (if a course with `cefr_rank = max_unlocked_cefr_rank + 1` exists; if none exists yet, leave it as the highest available and do not error).
- Placement-time initial value (coordinate with P20-006): on first placement, `max_unlocked_cefr_rank` should equal the recommended course's `cefr_rank` — since the student hasn't "completed" anything yet, this is a deliberate exception to the "only completion advances the ceiling" rule, and should be commented as such in the code so a future reader doesn't "fix" it into an inconsistency.

**Acceptance criteria:**
- Finishing every lesson in the frontier-ranked course advances the unlock ceiling by exactly one rank.
- Finishing every lesson in a lower, already-unlocked course (one the student started below their recommendation) does NOT advance the ceiling further than it already is.
- Tests cover: finishing the frontier course advances; finishing a lower course does not; finishing a course when no higher-ranked course exists doesn't error.

**Claude Code web prompt:**
> This depends on P20-002 (`student_level_state`) and ideally P20-010 having landed — read those first. Read the `lesson_progress`, `chapters`, and `lessons` tables' real schema on Supabase project `yrarpdkvdxszgxxondkt`, and read `services/backend-api/src/features/lessons/lesson-progress.service.ts` for the existing join patterns used to go from course → chapters → lessons (reuse the same filtering conventions, e.g. `status = 'published'`, rather than inventing new ones). Find wherever `lesson_progress.completed` is currently set to `true` (grep for it) and add a hook there. Implement a method that checks whether 100% of a given course's lessons are now complete for a given student. When a lesson completion causes its course to become 100% complete, only advance `student_level_state.max_unlocked_cefr_rank` to the next rank in that track if the completed course's `cefr_rank` equals the student's *current* `max_unlocked_cefr_rank` (i.e., they just finished the course at the frontier of what's unlocked — completing a lower, already-unlocked course they chose to start from must not advance the ceiling). If no course exists yet at `cefr_rank + 1` in that track, leave the ceiling unchanged and do not error. Add a code comment explaining that first-time placement (handled in task P20-006) is a deliberate one-time exception where the ceiling is set to the recommended course's rank without a completion having happened, so a future reader doesn't "fix" it into inconsistency with this task's rule. Write tests for: (a) completing the frontier course advances the ceiling by one rank, (b) completing a lower course does not advance the ceiling further, (c) completing a course when no next-rank course exists yet doesn't throw.

---

## P20-012 — Verify/enforce strictly sequential lesson ordering

**Why:** You want lessons to always proceed chapter 1 → lesson 1 → lesson 2 →
... in order, never randomized or skipped, regardless of what the AIM engine
recommends elsewhere.

**Read first:**
- `services/backend-api/src/features/lessons/lesson-progress.service.ts` — specifically whatever currently determines "current lesson" (`findQuickStartLesson` and any "next lesson" logic) — check if it already orders strictly by `chapters.sort_order, lessons.sort_order`, or if there's any path that could jump ahead.
- The lesson/chapter start endpoints — confirm there's a server-side check preventing starting lesson N+1 before lesson N is complete (not just a UI convention).

**Implementation:**
- If sequential enforcement is already correct: this task becomes "add a regression test proving it and document it," not a rewrite. **Do not refactor working code just to match this task's framing — verify first.**
- If a gap is found (e.g., a student can start lesson 3 while lesson 2 is incomplete, via direct id), add a server-side check mirroring the pattern from P20-010's course-lock enforcement: reject starting lesson N unless lesson N-1 (by `sort_order` within the same chapter, or the last lesson of the previous chapter if N is the first in its chapter) is already `completed`.
- The AIM engine's recommendations (task P20-009) may still *point at* a specific lesson/skill as the reasoning surfaced to the AI Teacher (P20-013) — that's about what to emphasize, not about reordering which lesson the student is actually allowed to open next. Keep these two concerns separate in the code; don't let a recommendation's `target_lesson_id` accidentally become a way to skip ahead.

**Acceptance criteria:**
- A written confirmation (in the PR description) of what was found: either "already enforced, here's the proof" or "gap found and fixed, here's the test."
- If a fix was needed: a test proving lesson N+1 cannot be started while lesson N is incomplete.

**Claude Code web prompt:**
> Read `services/backend-api/src/features/lessons/lesson-progress.service.ts` in full, focusing on `findQuickStartLesson` and any other logic that determines which lesson a student should currently be on or is allowed to start, and read whatever endpoint actually starts a lesson attempt. Determine, with certainty, whether the current implementation already strictly enforces chapter-then-lesson `sort_order` progression server-side (not just in what the app's UI happens to display) — specifically, check whether a student can start lesson N+1 while lesson N is not yet `completed`, by looking for any authorization/validation check in the lesson-start path. Do not refactor or rewrite this logic speculatively — first determine whether it's already correct. If it is already correctly enforced, write a regression test that proves it (attempt to start a later lesson out of order and assert rejection) and state clearly in your report that no functional change was needed. If you find a real gap, add a server-side check — mirroring the access-control pattern from task P20-010 — that rejects starting a lesson unless the immediately preceding lesson (by `sort_order` within the chapter, or the last lesson of the prior chapter) is complete, and add a test proving the fix. Also confirm, by reading task P20-009's description of the recommendation engine, that a recommendation's `target_lesson_id` is used only as "what to emphasize" context for the AI Teacher and never as a mechanism that lets a student open a lesson out of sequence — flag it in your report if you find that it currently does.

---

## P20-013 — Wire the AI Teacher's focus directive: generate it, store it, prompt with it

**Why:** This is the actual "AI adapts" mechanism you described: each lesson
already gets its content system prompt (`lessons.system_prompt`); now every
time the AIM engine recomputes (after a quiz/exam/attempt, via P20-006), a
second, focused directive should be generated and persisted (P20-003's
`ai_focus_directives` table), and the AI Teacher's prompt for every lesson
should include both — lesson content, plus "here's what to focus extra
practice/explanation on right now."

**Read first:**
- `services/backend-api/src/features/ai-teacher/context-builder/context-builder.types.ts` and every adapter under `.../adapters/`.
- `services/backend-api/src/features/ai-teacher/prompt-builder/prompt-builder.service.ts` and `prompt-builder.constants.ts` (`AI_TEACHER_PROMPT_SECTION_ORDER`).
- `docs/phase-18/ai-teacher-authority-rules.md` (P18-003) — the Authority Matrix. **This task must not violate that rule.** The AI Teacher still never computes mastery/weakness/difficulty itself — it only ever reads a pre-computed `directive_text` string that the *backend* (fed by AIM engine outputs) wrote. Confirm your design keeps this boundary: the directive-generation step lives in the backend (a new service, e.g. `AimFocusDirectiveService`), not in the AI Teacher's context builder.
- The result services already reading AIM output tables: `services/backend-api/src/features/aim/result/recommendation-read.service.ts` and siblings for weakness/skill-state.

**Implementation:**
- New backend service `AimFocusDirectiveService` (or similar), invoked as part of the AIM pipeline persistence step (`aim-persistence.service.ts` — read it first, this is where the six existing write categories happen; this becomes a seventh, or a follow-on step right after persistence commits) that:
  - Looks at the just-persisted weakness records / recommendations / difficulty decision for the student.
  - Generates a `directive_text` (a plain-language instruction — this is a template-based text generation, not a call to an LLM; keep it deterministic and testable, e.g. `"The student is showing difficulty with {skill_name} (severity: {severity}). Provide extra examples and check understanding before moving on."` built from real field values, not free-form generation).
  - Marks any previous active directive for that student `active = false` and inserts the new one.
- New context-builder adapter (alongside `student-profile-context.adapter.ts`, `current-lesson-context.adapter.ts`, `curriculum-skill-context.adapter.ts`) — e.g. `focus-directive-context.adapter.ts` — that reads the current active row from `ai_focus_directives` for the student and returns it as a new field on `AiTeacherContextSnapshot` (extend the type).
- Extend `AI_TEACHER_PROMPT_SECTION_ORDER` to include the new section (decide placement — likely last, after `curriculumSkill`, so it reads as "and specifically focus on...").
- If there's no active directive (new student, nothing computed yet), the adapter returns `null` for that field, same fail-closed pattern the other adapters already use — do not fabricate a default directive.

**Acceptance criteria:**
- After a real AIM pipeline run (P20-005/006 working end-to-end), a `ai_focus_directives` row is created/updated for the student, and the very next AI Teacher chat message includes that directive text in its assembled system prompt (verify by inspecting the actual prompt sent, e.g. via a test or a debug log, not just the DB row).
- No mastery/weakness/difficulty *computation* happens inside the AI Teacher feature folder — it strictly reads a precomputed string, preserving the Phase-18 Authority Rule.

**Claude Code web prompt:**
> This depends on P20-003 (`ai_focus_directives` table) and P20-006 (pipeline actually firing) having landed — read those first. Read `services/backend-api/src/features/ai-teacher/context-builder/context-builder.types.ts`, every adapter under `services/backend-api/src/features/ai-teacher/context-builder/adapters/`, `services/backend-api/src/features/ai-teacher/prompt-builder/prompt-builder.service.ts` and `prompt-builder.constants.ts`, `docs/phase-18/ai-teacher-authority-rules.md`, and `services/backend-api/src/features/aim/persistence/aim-persistence.service.ts`. This task must not violate the Phase-18 Authority Rule: the AI Teacher must never compute mastery/weakness/difficulty itself, it must only read an already-computed string. Add a new backend service (e.g. `AimFocusDirectiveService`) invoked right after `aim-persistence.service.ts` commits its existing six write categories, which reads the student's just-persisted weakness records/recommendations/difficulty decision and generates a deterministic, template-based `directive_text` (built from real field values like skill name and severity — not free-form/LLM generation) into the `ai_focus_directives` table, marking any prior active row for that student `active = false` first. Add a new context-builder adapter (matching the exact style of the existing three adapters in that folder) that reads the student's current active `ai_focus_directives` row and returns it as a new field on `AiTeacherContextSnapshot` (extend the type accordingly), returning `null` if none exists — do not fabricate a default. Add this new section to `AI_TEACHER_PROMPT_SECTION_ORDER` (placed after `curriculumSkill`). Add tests: one confirming the directive service generates the expected deterministic text from a sample weakness/recommendation record, one confirming the new adapter's fail-closed `null` behavior, and one confirming the prompt builder includes the new section in the right order when present. In your final report, explicitly confirm which files you touched are inside `ai-teacher/` versus inside `aim/`, to make it easy to verify no computation crossed the boundary.

---

## P20-014 — Placement result recommends a course using the new gating rules

**Why:** Ties placement, gating, and recommendation together: after the
placement test, the student should be told "start here" (their computed
level's course) while remaining free to pick anything at or below it.

**Read first:**
- `services/backend-api/src/features/placement/placement-result.service.ts` and the `GET /placement/attempts/:id/result` controller.
- `placement_results.estimated_level`, and the new `courses.cefr_code`/`cefr_rank` (P20-001), `student_level_state` (P20-002, now populated per P20-006).

**Implementation:**
- Extend the placement result response with a `recommendedCourseId` (the course whose `cefr_rank` matches the placement's estimated level in the student's track) and an `unlockedCourseIds` array (every course with `cefr_rank <= max_unlocked_cefr_rank`) — check `docs/mobile-app-api-endpoints.md` and the mobile app's placement-result screen/model to decide the exact response field names that fit existing conventions rather than inventing new ones ad hoc.
- If no course exists at the exact recommended rank (gap in content), fall back to the closest lower rank that does exist, and say so in a `note` field rather than erroring — do not recommend a course that doesn't exist.

**Acceptance criteria:**
- `GET /placement/attempts/:id/result` includes both fields, verified end-to-end against a real placement attempt in a dev/staging environment.
- Mobile app model updated to parse the new field(s) if you decide the mobile app should surface it now (check with existing mobile placement-result screen first — if it's out of scope for this backend-focused punch list, explicitly note the mobile follow-up as a separate task in your report rather than silently leaving the field unused).

**Claude Code web prompt:**
> This depends on P20-001, P20-002, and P20-006 having landed — read the resulting schema/code first. Read `services/backend-api/src/features/placement/placement-result.service.ts`, the controller behind `GET /placement/attempts/:id/result`, and check `apps/mobile` for whatever screen/model currently consumes that endpoint's response (search for the placement result screen under `apps/mobile/lib/features/placement/`). Extend the result response with a recommended course id (the course whose `cefr_rank` matches the placement's estimated level, within the student's track) and a list of currently-unlocked course ids (`cefr_rank <= max_unlocked_cefr_rank`) — pick field names consistent with this codebase's existing camelCase API response conventions, checking `docs/mobile-app-api-endpoints.md` for the established style, rather than inventing arbitrary names. If no course exists at the exact recommended rank, fall back to the nearest lower rank that does exist and include a short explanatory `note` field rather than throwing an error. Add a test covering the fallback case. If updating the mobile app's model to parse the new field(s) is in scope, do it (checking the existing `fromJson` pattern in that feature's models directory); if you judge it out of scope for this backend task, say so explicitly in your report and describe what a follow-up mobile task would need to do.

---

## P20-015 — Mark `services/api` as reference-only; prevent future accidental prod use

**Why:** Once P20-007/008/009 port the useful logic into aim-engine,
`services/api/src/aim` should be unambiguously documented as "this is where we
prototype/test the algorithm before porting it into the real engine" — not
deleted (you may want it again for the next algorithm iteration), but clearly
labelled so nobody mistakes it for something already wired into production.

**Read first:**
- `services/api/src/aim/` root — confirm there's currently no README.
- `render.yaml`, `infra/docker/docker-compose.yml` — confirm (still) no deployment entry for this package, to make sure the documentation matches reality.

**Implementation:**
- Add `services/api/src/aim/README.md` stating plainly: this package is a sandbox for testing/prototyping AIM algorithms before they're ported into `services/aim-engine`; it is not deployed anywhere; changes here have zero effect on the running app until manually ported (list which pieces have already been ported, referencing tasks P20-007/008/009 once merged, and which haven't).
- Add a short module-level docstring note to the same effect at the top of `services/api/src/aim/presentation/api/app.py` (the standalone FastAPI app that's never started) so it's obvious even to someone who jumps straight into that file.
- No functional/behavioral code changes in this task.

**Acceptance criteria:**
- A new engineer reading `services/api/src/aim/README.md` cold understands the relationship to `services/aim-engine` in under a minute.

**Claude Code web prompt:**
> Confirm, by checking `render.yaml` and `infra/docker/docker-compose.yml`, that `services/api/src/aim` still has no deployment entry anywhere (it shouldn't, after all prior tasks — those only ever copy specific files into the aim-engine Docker image, they don't deploy the package itself). Write a new `services/api/src/aim/README.md` that plainly states: this is a sandbox for prototyping/testing AIM algorithms before they get ported into the real, deployed `services/aim-engine`; nothing here runs in production; list, by name, which modules have already been ported into `services/aim-engine` (check git history / the aim-engine Dockerfile's copy list for `mastery_calculator.py`, `retention_tracker.py`, `recommendation_engine.py`, `difficulty_adapter.py`, `emotional_state_detector.py`, `weakness_detector.py` — some of these were ported in tasks P20-007/008/009, note whichever have actually landed by the time you do this task) and which remain unported/prototype-only. Add a short docstring at the top of `services/api/src/aim/presentation/api/app.py` noting the same thing, since someone could open that file directly and mistake it for a live service. Do not change any other code or behavior in this task.

---

## P20-016 — Update the contract test and add an end-to-end smoke test

**Why:** Closing task — after all the above, make sure the one test that has
historically caught real production bugs (the camelCase/snake_case contract
test between backend and aim-engine) still covers every field you've added,
and add one true end-to-end test proving the whole chain works.

**Read first:**
- `services/backend-api/src/features/aim/adapter/aim-engine-contract.spec.ts`.
- Every schema change made in P20-005 through P20-009.

**Implementation:**
- Update the contract spec to assert parity for every new/changed request and response field introduced across this punch list.
- Add one end-to-end test (or a clearly-documented manual test script, if true E2E infra doesn't exist in this repo) that: creates a student, runs them through placement, completes a lesson attempt, and asserts — via real Supabase queries — that `student_skill_states`, `weakness_records`, `recommendations`, `review_schedules`, `student_level_state`, and `ai_focus_directives` all end up populated as expected. This is the single test that proves P20-005 (the root-cause fix) actually worked in practice, not just in isolated unit tests.

**Claude Code web prompt:**
> Read `services/backend-api/src/features/aim/adapter/aim-engine-contract.spec.ts` and diff it against every request/response schema change made across tasks P20-005 through P20-009 (check each task's resulting code, and check `services/aim-engine/app/schemas/aim_analysis_request.py` / `aim_analysis_response.py` for their current state). Update the contract spec so it asserts exact camelCase/snake_case field-name parity for every field that exists now, including anything newly added. Then write one true end-to-end test (check this repo's existing e2e test setup, e.g. under a top-level `e2e/` or `test/integration/` folder if one exists — if none exists, write a clearly-commented integration test in the backend's test suite that hits real service boundaries rather than mocks, or if that's genuinely not feasible in this environment, write a manual verification script plus a written runbook) that: creates a test student, submits a placement attempt through to completion, submits a lesson attempt, and then asserts — via direct Supabase queries against project `yrarpdkvdxszgxxondkt`, or against a local/staging equivalent if writing to production data isn't appropriate — that rows now exist in `student_skill_states`, `weakness_records`, `recommendations`, `review_schedules`, `student_level_state`, and `ai_focus_directives` for that student. This test is the proof that the root-cause fix in P20-005 actually works end-to-end, not just in unit isolation — treat it as the most important test in this entire punch list.

---

## P20-017 — Remove the dead duplicate `FrustrationSignalService`

**Why:** Confirmed by direct comparison — `frustration-signal.service.ts`
(P5-062) and `session-summary.service.ts` (P5-063) write the exact same
`session_summaries` row, with byte-for-byte identical INSERT/UPDATE SQL and
field lists. `session-summary.service.ts`'s own header comment says as much:
*"FrustrationSignalService (P5-062) writes the same row from the
behavioral-signal angle; in a composed pipeline one or the other is called,
not both, to avoid duplicate writes."* `aim-persistence.service.ts` already
only calls `SessionSummaryService`. `FrustrationSignalService` has no live
callers anywhere in the codebase — it isn't "pending a decision," the decision
already happened implicitly (SessionSummaryService won), it just was never
cleaned up. This is a deletion, not a wiring task.

**Read first:**
- `services/backend-api/src/features/aim/persistence/frustration-signal.service.ts` and `session-summary.service.ts` — confirm for yourself they're duplicates (they should be, as of this audit, but re-verify since files may have diverged since).
- `services/backend-api/src/features/aim/persistence/aim-persistence.service.ts` and `aim.module.ts` — confirm `FrustrationSignalService` genuinely has zero live callers before deleting (grep the whole repo, not just this folder).

**Implementation:**
- If still confirmed dead and duplicate: delete `frustration-signal.service.ts` and its spec file, remove it from `aim.module.ts`'s providers if it's still registered there.
- If it turns out something *does* call it (re-verify, don't trust this doc blindly if the code has moved on), stop and report back instead of deleting — don't guess.

**Acceptance criteria:**
- `FrustrationSignalService` no longer exists in the codebase, `SessionSummaryService` remains the sole writer of `session_summaries`.
- Full backend test suite still green (removing dead code shouldn't break anything real).

**Claude Code web prompt:**
> Read `services/backend-api/src/features/aim/persistence/frustration-signal.service.ts` and `services/backend-api/src/features/aim/persistence/session-summary.service.ts` side by side and confirm whether they are still functionally duplicate writers of the `session_summaries` table (as of a prior audit, they were byte-for-byte identical in their SQL and field handling). Then grep the entire `services/backend-api` tree for every reference to `FrustrationSignalService` to confirm it has zero live callers (check `aim-persistence.service.ts`, which per its own design should only call `SessionSummaryService`, and `aim.module.ts`'s provider list). If both checks confirm it's dead, duplicate code, delete `frustration-signal.service.ts` and `frustration-signal.service.spec.ts`, and remove any leftover registration of it from `aim.module.ts`. If your investigation finds it is NOT actually dead (something changed since this was documented), stop and report what you found instead of deleting anything. Run the backend test suite afterward and confirm it's still green.

---

## P20-018 — Surface difficulty decisions to the student and the AI Teacher

**Why:** `difficulty_decisions` gets written by the real, working
`DifficultyAdapter.decide()` pipeline output, but nothing ever reads it back —
no endpoint, no AI Teacher context adapter. A student whose questions just got
easier or harder has no way to know that happened, and the AI Teacher can't
acknowledge it either ("since you've been finding this tough, let's slow
down").

**Read first:**
- `difficulty_decisions` table columns (Supabase) — `current_difficulty`, `previous_difficulty`, `rationale`, `based_on_attempt_ids`, `decided_at`.
- `services/backend-api/src/features/aim/result/recommendation-read.service.ts` — the existing pattern for a pure pass-through AIM-output read service; mirror this exactly for difficulty decisions rather than inventing a different shape.
- `docs/phase-18/ai-teacher-authority-rules.md` — confirm surfacing `rationale` text (already backend/AIM-generated) to the AI Teacher doesn't cross the authority line; it doesn't, since the AI Teacher would only be reading a precomputed rationale string, same as the focus-directive pattern in P20-013.

**Implementation:**
- Add `DifficultyDecisionReadService` (mirroring `RecommendationReadService`) with a `getLatestForStudent(studentId, skillId?)` method.
- Add a read endpoint, e.g. `GET /aim/students/:studentId/difficulty-decisions`, consistent with the existing sibling endpoints listed in `docs/mobile-app-api-endpoints.md` §7 — update that doc file too.
- Add a new AI Teacher context-builder adapter (same pattern as P20-013's focus-directive adapter) that pulls the latest difficulty decision's `rationale` in as context, so the AI Teacher can acknowledge a difficulty change without ever computing one itself.

**Acceptance criteria:**
- New endpoint returns real data for a student with existing `difficulty_decisions` rows.
- `docs/mobile-app-api-endpoints.md` updated with the new endpoint.
- AI Teacher prompt includes the difficulty rationale when one exists, `null`/omitted when it doesn't (fail-closed, matching every other adapter).

**Claude Code web prompt:**
> This can be done independently of the other P20 tasks, though it reads more naturally after P20-013 (focus directives) since it follows the same adapter pattern — read that task's resulting code if it exists yet. Read the `difficulty_decisions` table's columns on Supabase project `yrarpdkvdxszgxxondkt`, `services/backend-api/src/features/aim/result/recommendation-read.service.ts` in full (as the pattern to mirror), and `docs/phase-18/ai-teacher-authority-rules.md`. Add a `DifficultyDecisionReadService` mirroring `RecommendationReadService`'s structure exactly, with a method returning the latest difficulty decision for a student (optionally filtered by skill). Add a `GET /aim/students/:studentId/difficulty-decisions` endpoint following this codebase's existing conventions for the sibling AIM read endpoints (see `docs/mobile-app-api-endpoints.md` section 7 for the existing list, and update that doc with the new row). Add a new AI Teacher context-builder adapter, matching the exact style of `services/backend-api/src/features/ai-teacher/context-builder/adapters/student-profile-context.adapter.ts` and its siblings, that reads the latest difficulty decision's `rationale` field and exposes it on the context snapshot, returning `null` when none exists (fail-closed, same as every other adapter — do not fabricate a default). Wire it into `AI_TEACHER_PROMPT_SECTION_ORDER`. Add tests for the read service, the endpoint, and the adapter's null-handling.

---

## P20-019 — Delete or finish the dead `prompt-renderer` code

**Why:** `prompt-renderer.service.ts`, `prompt-renderer.module.ts`, and its
`templates/` directory were confirmed to have zero importers outside their own
files/specs — the live prompt-assembly path is entirely
`prompt-builder.service.ts` (which just `JSON.stringify()`s each context
section). Dead code that looks like a live feature is worse than no code —
someone will eventually edit it thinking it does something.

**Read first:**
- `services/backend-api/src/features/ai-teacher/prompt-builder/prompt-renderer.service.ts`, `prompt-renderer.module.ts`, everything under its `templates/` directory, and their spec files.
- Re-confirm zero live importers (grep the whole repo — not just `ai-teacher/` — in case something outside the feature folder references it).
- Check git history / commit messages for these files (e.g. `git log --follow`) for any stated intent to finish wiring them later, so you don't delete something mid-flight that was deliberately paused.

**Implementation:**
- If genuinely dead with no stated future plan: delete the service, module, templates directory, and their specs. Remove any leftover reference in `ai-teacher.module.ts` or similar aggregator modules.
- If you find evidence (commit messages, TODOs referencing a specific future phase/task) that this was intentionally left mid-build for a real planned reason: do not delete it — instead report exactly what you found and stop, so a decision can be made explicitly rather than silently picking one path.

**Acceptance criteria:**
- Either the dead code is gone and the backend still builds/tests clean, or you've reported back with the specific evidence that stopped you from deleting it.

**Claude Code web prompt:**
> Read `services/backend-api/src/features/ai-teacher/prompt-builder/prompt-renderer.service.ts`, `prompt-renderer.module.ts`, every file under its `templates/` directory, and their spec files. Grep the entire repository (not just the `ai-teacher` folder) for any import of these files to re-confirm they have zero live callers — the live prompt-assembly path is `prompt-builder.service.ts`. Also check `git log --follow` on these files for any commit message or code comment indicating they were intentionally left mid-build for a specific planned reason. If they are confirmed dead with no stated future intent, delete `prompt-renderer.service.ts`, `prompt-renderer.module.ts`, the `templates/` directory, and their spec files, and remove any leftover reference to them from `ai-teacher.module.ts` or any other aggregator module. Run the backend build and test suite to confirm nothing broke. If you find real evidence they were deliberately paused for a specific future purpose, do not delete anything — report exactly what you found instead.

---

## P20-020 — Surface the emotional/frustration signal that's already being computed

**Why:** `EmotionalStateDetector` (imported from `services/api`, already
wired into the real aim-engine pipeline) produces a real `frustration_score`
(derived from `consecutive_incorrect * 20.0`) and maps it to a coarse
`frustration_level`/`engagement_level` enum, persisted into
`session_summaries` by `SessionSummaryService` (confirmed real, see P20-017).
Nothing downstream ever reads it back — it's computed and stored, then
ignored.

**Read first:**
- `services/aim-engine/app/pipeline/aim_analysis_pipeline.py` lines ~520-605 (the frustration/engagement level mapping and where it lands in the response).
- `session_summaries` table columns — `frustration_level`, `engagement_level`, `signal_basis`.
- `services/backend-api/src/features/ai-teacher/context-builder/` — same adapter pattern as P20-013/P20-018.
- `docs/phase-18/ai-teacher-authority-rules.md` — frustration/engagement level are explicitly documented as "coarse educational signals only, never clinical/diagnostic" (see the comments in `frustration-signal.service.ts`/`session-summary.service.ts`) — respect this boundary in whatever text you generate from it; never construct clinical/psychological-sounding language.

**Implementation:**
- Add a context-builder adapter that reads the most recent `session_summaries` row for the student's active session and exposes `frustrationLevel`/`engagementLevel` as coarse enum values (not the raw numeric score) to the AI Teacher context, so the AI Teacher can adjust tone (e.g. slow down, add encouragement) — phrased as pedagogical guidance in the prompt, never as a label shown verbatim to the student as a diagnosis.
- Optionally (confirm with the user before doing this part — it's a UI decision, not just backend plumbing): add a lightweight, encouraging student-facing indicator (e.g. "Taking it steady today? Let's slow down" copy variants keyed off `engagement_level`), gated behind the same coarse-enum-only rule.

**Acceptance criteria:**
- AI Teacher prompt includes the current coarse frustration/engagement signal when available, absent when not (fail-closed).
- No clinical/diagnostic-sounding language introduced anywhere in generated text.

**Claude Code web prompt:**
> Read `services/aim-engine/app/pipeline/aim_analysis_pipeline.py` lines ~520-605 (the frustration/engagement level computation and mapping), the `session_summaries` table's columns on Supabase project `yrarpdkvdxszgxxondkt`, `docs/phase-18/ai-teacher-authority-rules.md`, and the existing context-builder adapters under `services/backend-api/src/features/ai-teacher/context-builder/adapters/` (for the pattern to follow — this is the same shape of task as P20-013 and P20-018, read those tasks' resulting code if it exists). Add a new context-builder adapter that reads the most recent `session_summaries` row for the student and exposes the coarse `frustration_level`/`engagement_level` enum values (never the raw numeric `frustration_score`, and never any invented clinical/diagnostic-sounding label — the existing code comments in `frustration-signal.service.ts` and `session-summary.service.ts` are explicit that these are educational signals only) to the AI Teacher's context. Wire it into `AI_TEACHER_PROMPT_SECTION_ORDER`, phrased in the prompt as pedagogical guidance (e.g. "the student may be finding this challenging right now — consider slowing down and offering encouragement") rather than a label. Do not build a student-facing UI indicator for this in the same task — that's a separate UI/copy decision; note it in your report as a possible follow-up instead of building it speculatively. Add tests for the adapter's fail-closed `null` behavior when no recent session summary exists.

---

## P20-021 — Connect review-schedule due dates to actual notifications

**Why:** `review_schedules` already computes real, per-skill spaced-repetition
due dates (the exponential forgetting-curve math is real, see the original
audit). But nothing connects a due review to the existing notification system
— `reminder_schedules`, `notification_events`, `notification_preferences` all
already exist and are wired for other purposes (per
`docs/mobile-app-api-endpoints.md` §12), just not for this. Today, a student
only ever sees a due review if they manually open the review-schedule screen.

**Read first:**
- `services/backend-api/src/features/aim/result/` — whatever currently reads `review_schedules` (the `GET /aim/students/:studentId/review-schedules` endpoint).
- `reminder_schedules` table and whatever service manages it — find the existing pattern for how a reminder gets created/scheduled today (for something else, e.g. streak reminders) and mirror it, don't invent a parallel notification mechanism.
- `notification_preferences`/`notification_quiet_hours` — a review-due notification must respect these like every other notification type does; don't bypass them.

**Implementation:**
- When a `review_schedules` row is created/updated with a `due_at` (as part of P20-006's pipeline wiring, or as a follow-on step in the same persistence transaction), create or update a corresponding `reminder_schedules` entry so the existing reminder/notification delivery pipeline picks it up at the right time, respecting the student's quiet hours and channel preferences exactly like other reminder types.
- Do not build a second, separate notification delivery path — this task only needs to produce the right `reminder_schedules` row; delivery should reuse whatever mechanism already sends other reminder types.

**Acceptance criteria:**
- A newly created/updated `review_schedules` row results in a corresponding `reminder_schedules` row with the correct due time.
- Existing reminder-delivery tests still pass; new tests cover the review-due reminder specifically.

**Claude Code web prompt:**
> This depends on P20-006 (the pipeline actually firing and writing real `review_schedules` rows) having landed — read that task's resulting code first. Read whatever currently reads/writes `review_schedules` under `services/backend-api/src/features/aim/`, the `reminder_schedules` table's schema on Supabase project `yrarpdkvdxszgxxondkt`, and find the existing service that creates/manages reminder schedules for at least one other feature already wired to notifications (check `docs/mobile-app-api-endpoints.md` section 12 for what's already active, e.g. streak or deadline reminders, and grep for whatever writes to `reminder_schedules` today) — mirror that exact pattern rather than inventing a second notification mechanism. When a `review_schedules` row is created or its `due_at` updated (hook into the same persistence step that writes it, from P20-006), create or update a corresponding `reminder_schedules` row so the review reaches the student through the existing reminder delivery pipeline, respecting `notification_preferences` and `notification_quiet_hours` exactly as other reminder types do — do not bypass them. Add tests confirming a review-schedule write produces the correct reminder-schedule row, and that existing reminder-delivery tests are unaffected.

---

## P20-022 — Auto-resolve weaknesses when mastery actually improves

**Why:** `weakness_records` has a `resolved_at` column and a `status` field,
but nothing currently checks whether a previously-flagged weakness has
actually improved and closes it out. Left as-is, the weakness list only ever
grows — a student who's since mastered a skill still shows as "weak" in it
forever, which would make both the AI Teacher's focus directives (P20-013)
and any weakness-facing UI increasingly wrong over time.

**Read first:**
- `weakness_records` table columns — `severity`, `status`, `trigger_attempt_ids`, `detected_at`, `resolved_at`.
- `services/aim-engine`'s `WeaknessDetector.calculate_by_skill()` (the real, already-wired weighted formula) — check whether it already has a notion of "this skill is no longer weak" that just isn't being acted on, versus needing new logic.
- `services/backend-api/src/features/aim/persistence/` — whichever service currently writes new `weakness_records` rows (`WeaknessUpdateService` per the earlier audit) — this task extends it, doesn't replace it.

**Implementation:**
- When the AIM engine's weakness-detection output for a skill no longer flags it as weak (or flags a materially lower severity) for a student who has an existing unresolved `weakness_records` row for that skill, set `status` to resolved and `resolved_at = now()` on that row rather than only ever inserting new rows.
- Decide (and document in code comments) the exact threshold/rule for "no longer weak" using the real severity output already computed by `WeaknessDetector` — don't invent a second, separate definition of "resolved" from scratch; derive it from the same weighted signal that flagged it as weak in the first place.

**Acceptance criteria:**
- A synthetic test where a student's weakness-triggering pattern stops recurring and mastery improves results in the existing `weakness_records` row being marked resolved, not a growing pile of permanently-open rows.
- Existing weakness-creation tests still pass.

**Claude Code web prompt:**
> This depends on P20-006 (pipeline actually firing) having landed. Read the `weakness_records` table's columns on Supabase project `yrarpdkvdxszgxxondkt`, `services/aim-engine`'s `WeaknessDetector.calculate_by_skill()` (the real weighted weakness formula — error frequency 25%, hint usage 20%, retry rate 15%, skip rate 15%, hesitation 10%, retention drop 10%, prerequisite gap 5%), and whichever backend service currently writes new `weakness_records` rows (grep for `WeaknessUpdateService` or similar under `services/backend-api/src/features/aim/persistence/`). Extend that service so that when the AIM engine's weakness output for a skill no longer flags it as weak (or drops materially in severity) for a student with an existing unresolved `weakness_records` row for that skill, the existing row is updated to a resolved status with `resolved_at = now()`, instead of only ever inserting new rows and leaving old ones open forever. Derive the "no longer weak" threshold from the same severity signal `WeaknessDetector` already computes — do not invent a second, independent definition of "resolved." Document the exact threshold you chose in a code comment, since it's a judgment call. Add tests covering: a weakness getting resolved when severity drops below the threshold, and a weakness staying open when it doesn't.

---

## P20-023 — Make `/student/analytics/summary` surface real AIM output, not just report metadata

**Why:** Checked directly: `StudentAnalyticsSummaryController.getSummary()`
only calls `ReportDefinitionService.listVisibleToRole()`, which returns
report *definitions* (metadata — which reports exist and are visible to this
role), not computed data. `ReportRunnerService` (which actually executes a
report and returns real numbers) has no report definition anywhere that reads
`student_skill_states`, `weakness_records`, or `review_schedules` — confirmed
by grep, zero matches. So even after every other task in this list makes
those tables real and populated, there is currently no report that would ever
show a student their own real mastery/weakness/review-adherence trend.

**Read first:**
- `services/backend-api/src/features/analytics/report-definition.service.ts`, `report-runner.service.ts`, `analytics.repository.ts`, and `analytics.entities.ts` — understand exactly how a `ReportDefinition` row maps to what `ReportRunnerService` actually queries (it appears to be a generic, key-driven system reading from `metric_aggregates`/`metric_definitions` for most existing reports — confirm this and follow the same registration pattern for a new one, don't build a parallel bespoke endpoint).
- The `report_definitions`/`metric_definitions`/`metric_aggregates` tables on Supabase, to see how existing reports are actually seeded and computed.

**Implementation:**
- Register a new report definition (e.g. key `student_aim_progress`) visible to the `student` role (and reuse for `parent` if that role already has an equivalent pattern — check `parent-reports.controller.ts`), whose underlying computation reads `student_skill_states` (current mastery per skill + trend), `weakness_records` (currently open ones, plus recently resolved ones per P20-022), and `review_schedules` (upcoming due reviews) for the authenticated student.
- Follow whatever existing mechanism `ReportRunnerService` uses to execute a report's underlying query (it may be a generic metric-aggregate lookup, or a per-report-key dispatch — read the file fully before assuming which) — extend that mechanism rather than adding a special-cased branch that only this one report uses, unless the existing system genuinely has no way to add a custom, non-metric-aggregate-backed query, in which case say so explicitly and propose the smallest addition that fits the existing architecture.

**Acceptance criteria:**
- A student with real `student_skill_states`/`weakness_records`/`review_schedules` rows (from a real pipeline run, per P20-005/006) gets back real numbers when this report is run — not another layer of mocked/placeholder data.
- Existing analytics reports/tests unaffected.

**Claude Code web prompt:**
> This depends on P20-005/006 (real AIM tables actually getting populated) to be meaningfully testable end-to-end, though the report-definition plumbing itself can be built independently. Read `services/backend-api/src/features/analytics/report-definition.service.ts`, `report-runner.service.ts`, `analytics.repository.ts`, and `analytics.entities.ts` in full, and check the `report_definitions`, `metric_definitions`, and `metric_aggregates` tables on Supabase project `yrarpdkvdxszgxxondkt` to understand exactly how an existing report definition's key maps to what `ReportRunnerService` actually computes when it's run — confirmed by prior investigation, `StudentAnalyticsSummaryController.getSummary()` today only returns report *definitions* via `ReportDefinitionService.listVisibleToRole()`, not computed data, and no existing report reads any AIM output table. Register a new report definition (e.g. key `student_aim_progress`) visible to the `student` role, whose execution reads the authenticated student's `student_skill_states` (mastery + trend per skill), `weakness_records` (open and recently-resolved), and `review_schedules` (upcoming due reviews). Follow the exact existing mechanism `ReportRunnerService` uses to execute report queries — read the whole file before deciding whether that's a generic metric-aggregate lookup you should feed correctly-shaped aggregate rows into, or a per-report dispatch you should add a case to. If the existing architecture has no clean way to add a custom query for this report, say so explicitly in your report and propose the smallest addition that fits its existing pattern rather than bolting on a special case. Check `parent-reports.controller.ts` to see if the same report should also be exposed to the `parent` role under its existing pattern. Add tests confirming the new report returns real, correctly-shaped data given synthetic AIM table rows.

---

## Anything else? (final check before you start)

That's now 23 tasks. Two structural things worth flagging one more time, since
you asked for anything that would make the algorithm "full and correct" —
neither is a bug, both are judgment calls only you can make:

- **Sequencing risk**: P20-007/008/009 (porting the richer algorithms) touch
  the same pipeline file as P20-005 (the stub fix) and P20-006 (wiring
  triggers). Doing them in the listed order (005 → 006 → 007 → 008 → 009)
  avoids merge conflicts and lets you verify the wiring works with the
  *current* simple formulas before swapping in the more complex ones — don't
  parallelize 005/006 with 007/008/009.
- **Rollout risk**: once P20-005/006 land, every real student's next lesson
  attempt starts actually calling the AIM Engine, computing real mastery, and
  (once P20-010/011 land) getting gated by level for the first time — this is
  a behavior change for anyone already using the app, not just new users.
  Worth deciding whether you want a feature flag around P20-006's trigger
  wiring so it can be turned on for a small cohort first, or whether you're
  comfortable with it going live for everyone as soon as it's merged. Not
  building this speculatively — flagging it as a decision, same as everything
  else in this section.
