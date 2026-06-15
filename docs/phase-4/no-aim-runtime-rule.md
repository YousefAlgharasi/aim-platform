# Phase 4 — No-AIM-Runtime Rule

## Rule Statement

Phase 4 must not call the AIM Engine runtime under any circumstances.

The AIM Engine runtime is reserved exclusively for **Phase 5 and beyond**. No Phase 4 task, service, API, migration, Flutter screen, admin UI, or review document may invoke, import, reference, or depend on AIM Engine runtime behavior.

---

## What This Rule Covers

This rule applies to every part of the AIM Platform touched during Phase 4:

| Layer | Rule |
|---|---|
| Backend NestJS services | Must not call AIM Engine APIs, endpoints, or internal modules |
| Backend placement scoring | Must be implemented entirely from database records and predefined rules — no AIM Engine calls |
| Backend result generation | Estimated level, skill mastery map, weakness map, and initial learning path must be produced from placement data only |
| Admin Dashboard | Must not trigger AIM Engine runtime operations when managing placement tests, sections, or questions |
| Flutter Mobile | Must not call AIM Engine APIs or pass placement data to any AIM Engine endpoint |
| Database migrations | Must not create AIM Engine runtime tables, columns, or foreign keys |
| Seed data | Must not reference AIM Engine runtime records |
| Shared contracts | Must not define request or response shapes for AIM Engine runtime endpoints |
| Documentation | Must not provide instructions for integrating AIM Engine runtime in Phase 4 |

---

## What the AIM Engine Runtime Is

The AIM Engine runtime is the adaptive learning engine responsible for:

- Generating personalized lesson sequences after placement
- Adapting practice difficulty based on learner session performance
- Running AI Teacher behavior during active learning sessions
- Producing dynamic recommendations and retention schedules
- Managing learner progress signals during lesson and practice flows

None of these capabilities are needed to run a placement test. A placement test requires only:

1. Delivering a fixed set of questions from a predefined pool
2. Collecting learner answers
3. Scoring answers using backend rules derived from the question pool and section weights
4. Producing a static result record with estimated level, skill signals, and initial path

All four steps can be completed without the AIM Engine runtime.

---

## Why This Rule Exists

### Separation of Concerns

Phase 4 establishes the placement foundation. Phase 5 integrates AIM Engine runtime behavior on top of that foundation. Mixing AIM Engine runtime calls into Phase 4 would:

- Create untested dependencies on an unready runtime
- Make Phase 4 impossible to verify independently
- Introduce Phase 5 complexity before Phase 4 contracts, migrations, and APIs are stable
- Violate the Phase 4 scope boundary defined in docs/phase-4/placement-test-charter.md

### Backend Authority Principle

The backend is the final authority for placement scoring and result generation. Backend-authoritative scoring means the backend applies rules from the database — not from an external runtime. AIM Engine runtime calls would delegate scoring authority outside the placement API boundary, which contradicts this principle.

### Auditability

Placement results must be auditable from database records alone. If scoring called the AIM Engine runtime, results would depend on external state that is not captured in the placement audit log. This would make the result non-reproducible from local data.

---

## Prohibited Patterns

The following patterns are explicitly prohibited in Phase 4:

// PROHIBITED — AIM Engine runtime import
import { AimEngineService } from '@aim/engine';

// PROHIBITED — AIM Engine runtime call inside placement scoring
const adaptedScore = await this.aimEngine.scoreAttempt(attemptId);

// PROHIBITED — Forwarding placement answers to AIM Engine
await this.aimEngine.processPlacementAnswers(answers);

// PROHIBITED — AIM Engine result enrichment
const enrichedResult = await this.aimEngine.enrichPlacementResult(result);

// PROHIBITED — AIM Engine level estimation
const level = await this.aimEngine.estimateLevel(skillSignals);

---

## Required Patterns

Phase 4 scoring and result generation must use only data from the placement database:

// CORRECT — Backend computes score from placement_answers and placement_questions
const score = await this.placementScoringService.computeScore(attemptId);

// CORRECT — Backend derives estimated level from score thresholds defined in placement rules
const level = await this.placementResultService.deriveLevel(score);

// CORRECT — Backend builds skill map from placement_question_skills and answer correctness
const skillMap = await this.placementResultService.buildSkillMap(attemptId);

// CORRECT — Backend writes result to placement_results table
const result = await this.placementResultService.createResult(attemptId, level, skillMap);

---

## Flutter Specific Restrictions

Flutter must not:

- Import or call any AIM Engine client library
- Perform local scoring of placement answers
- Estimate a CEFR level locally from answers
- Build a skill mastery map or weakness map locally
- Forward placement data to AIM Engine endpoints

Flutter may only:

- Call the placement backend APIs defined in Phase 4
- Display the level and summary returned from the backend result endpoint
- Pass user answers to the backend answer submission API

---

## Verification Checklist

Before marking any Phase 4 task Done, verify:

- No AimEngine, aim-engine, or @aim/engine import appears in changed files
- No HTTP call targets an AIM Engine endpoint
- Placement scoring logic reads only from placement tables and rule documents
- Level estimation uses only score thresholds and CEFR boundary rules
- Flutter does not calculate score, level, skill map, or weakness map locally
- Audit log records can reconstruct results from local database data alone

---

## Enforcement

Any Phase 4 pull request that introduces AIM Engine runtime calls must be blocked at review and the Notion task must be marked Blocked with a comment explaining the violation.

The reviewer must confirm this document was read and applied before approving any Phase 4 scoring, result, or backend service implementation.

---

## References

- docs/phase-4/placement-test-charter.md — Phase 4 scope boundary
- Phase 4 Non-Negotiable Rules section in docs/tasks/phase_4_task_prompts.md
- P4-035 — Document No Client-Side Scoring Rule (Flutter-specific companion rule)
- P4-077 — Run No-AIM Runtime Review (end-of-phase verification)

---

## Metadata

| Field | Value |
|---|---|
| Task ID | P4-004 |
| Branch | phase4/P4-004-no-aim-runtime-rule |
| Priority | P0 |
| Dependency | P4-001 |
| Output | docs/phase-4/no-aim-runtime-rule.md |