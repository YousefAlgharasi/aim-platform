# 01 — Business Rules

> Last verified: 2026-07-04, by direct code reads in `services/backend-api/src`, cross-checked against `docs/phase-18/ai-teacher-authority-rules.md` for the Authority Matrix section only (doc content itself not line-by-line re-verified beyond the cross-check noted).

Each rule below states what's actually enforced and exactly where. Where the
rule is *described* in a doc but the code enforcement is what was checked,
both are cited.

## Course/level progression gating (CEFR rank)

- **Enforced in**: `services/backend-api/src/features/lessons/course-completion.service.ts`
- A course only unlocks the next CEFR-rank course for a student when
  `course.cefr_rank === student_level_state.max_unlocked_cefr_rank` (i.e. the
  completed course is at the frontier of what the student has already
  unlocked) — finishing a lower course the student chose to revisit does
  **not** advance the ceiling (comment at lines 6-11 states this explicitly
  as a design decision, and the code at line 114 checks equality, not `<=`).
- On completion of a frontier course, `max_unlocked_cefr_rank` advances to
  `course.cefr_rank + 1`, gated by a check that a published course actually
  exists at that next rank (line 121-123) — it will not advance the ceiling
  past the last published course.
- Placement-time exception: on first placement, `max_unlocked_cefr_rank` is
  seeded directly (comment line 11) rather than derived from completion.
- Underlying table: `student_level_state` (currently one of the 8 tables
  where RLS was disabled until this session's fix — see `13-risk-register.md`).

## Lesson sequential ordering / progress

- **Enforced in**: `services/backend-api/src/features/lessons/lesson-progress.service.ts`
- Confirmed real test coverage exists specifically for course-gating and
  sequential-ordering behavior: `lesson-progress-course-gating.service.spec.ts`,
  `lesson-progress-sequential-ordering.service.spec.ts` (both pass as part of
  the 298/3,158 green backend suite).

## Placement → initial learning path

- Live DB table `initial_learning_path` (comment: "Ordered list of curriculum
  entry points derived from a completed placement result... Written once by
  the backend after result finalisation. Immutable after creation.").
- Enforcement in `services/backend-api/src/features/placement/*` — the
  placement scoring/result services (`placement-scoring.service.ts`,
  `placement-result.service.ts`) are backend-only; the DB comment on
  `placement_questions` states `correct_answer is server-side only and must
  never be exposed to students or Flutter clients` — this was not
  independently re-verified line-by-line against every placement controller
  response DTO in this pass; treat as **verified at the schema-comment level,
  not at the full response-serialization level**.

## AI Teacher Authority Matrix

Cross-checked `docs/phase-18/ai-teacher-authority-rules.md`'s existence and
topic against actual code behavior confirmed elsewhere in this session's
audit:

- The AI Teacher backend pipeline (context builder → prompt builder →
  provider gateway → response safety filter) never computes mastery, level,
  weakness, difficulty, recommendation, or review-schedule values itself —
  confirmed by DB table comments on `ai_teacher_feedback`, `voice_feedback`,
  `voice_transcripts` ("Advisory only; never feeds back into AIM Engine
  mastery/level/weakness/difficulty/recommendation/review-schedule
  decisions") and by the AIM pipeline code review in this session showing
  those computations live exclusively in `services/aim-engine`'s pipeline
  stages, fed only by backend-assembled read-only context.
- `voice_teacher_page.dart`'s own header comment (mobile) states the same
  boundary from the client side: "This screen never calls an STT/TTS/AI
  provider directly and never computes mastery/level/weakness/difficulty/
  recommendation/review-schedule values."
- Full enumeration of every rule in `ai-teacher-authority-rules.md` against
  every code path was **not** exhaustively performed this session — the
  above are the specific rules independently corroborated by code/DB
  evidence gathered so far. Treat the rest of that doc's content as
  **stated intent, not independently re-verified** until a future pass.

## Rate limits / quota gates

- **Enforced in**: `services/backend-api/src/features/ai-teacher/rate-limit-policy.service.ts`
  and `.../governance/ai-cost-quota.service.ts`.
- **Enforced in**: `services/backend-api/src/features/voice-teacher/rate-limit-policy.service.ts`.
- Exact thresholds/quota numbers were **not** extracted verbatim in this
  session — file existence and wiring (both are non-orphaned, live services
  per the full inventory) confirmed; specific limit values are **Unknown**
  without a further targeted read.

## Safety filtering

- **Enforced in**: `services/backend-api/src/features/ai-teacher/ai-teacher-safety.validator.ts`
  (input) and `.../response-safety/response-safety-filter.service.ts` (output).
- **Enforced in**: `services/backend-api/src/features/voice-teacher/stt-gateway/stt-safe-failure.service.ts`
  and `.../tts-gateway/tts-safe-failure.service.ts` for voice-specific safety.
- Outcomes are recorded, never the raw rejected content, per DB comments on
  `ai_safety_events`/`voice_safety_events` ("Records that a safety check ran
  and its outcome, never the rejected raw message/response content").

## Publish-gating rules on curriculum content (from live DB table comments — these are enforced at the DB-comment level and cross-checked against the described backend publish endpoints, not independently re-derived from the endpoint code itself in this pass)

- A **lesson** cannot be published without ≥1 linked published **skill**
  (`lessons` table comment, cites P3-006; enforced per comment "at the
  backend publish endpoint").
- A **question_bank** item cannot be published without ≥1 linked published
  skill (comment cites P3-014).
- A **placement question** must have exactly one `is_primary = true` skill
  link before activation (comment on `placement_question_skills`, "Enforced
  by the backend activation endpoint — not by this migration alone").
- An **asset** cannot be published while its parent lesson is in draft
  status (`lesson_assets` comment).
