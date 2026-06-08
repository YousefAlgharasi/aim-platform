# AIM Placement Test Strategy and Rules

## Purpose

This document defines the placement test goal, levels, question distribution, scoring algorithm, routing rules, and fallback cases for the AIM platform. The placement test is the entry gate that maps a new student to the correct starting point in the English skill tree.

## Scope

This is Phase 0 planning documentation. It does not implement backend APIs, database schemas, Flutter code, or AIM Engine runtime logic. All skill IDs referenced here are sourced from `docs/learning/english-skill-tree.md` (P0-009).

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-009 | `docs/learning/english-skill-tree.md` | Checked and present. Full 70-skill A1 tree with skill IDs, categories, difficulty levels, and prerequisite graph. |

---

## Placement Test Goals

| Goal | Detail |
|---|---|
| Primary | Determine which A1 skill cluster a new student already knows so the AIM Engine does not start them at absolute zero if they have prior knowledge. |
| Secondary | Identify skill gaps early so the AIM Engine can prioritize weak areas from the first lesson. |
| Non-goal | Certify the student at any CEFR level. The placement test is a routing mechanism, not an assessment certificate. |
| Non-goal | Test all 70 skills in the skill tree. The test is short and adaptive, not exhaustive. |

---

## Placement Levels

The placement test routes students into one of four entry bands. These bands map directly to the difficulty scale defined in the English skill tree.

| Band | Label | Entry Skill Cluster | Criteria |
|---|---|---|---|
| Band 1 | Absolute Beginner | PHO-001, PHO-002, VOC-001, GRA-001 (all difficulty 1) | Student scores 0–40% on the screening set. |
| Band 2 | Beginner | PHO-003 through PHO-005, VOC-003–VOC-010, GRA-002–GRA-007 (difficulty 2) | Student scores 41–65% on the screening set. |
| Band 3 | Elementary | PHO-006 through PHO-008, VOC-011–VOC-018, GRA-008–GRA-016, READ-003–READ-006 (difficulty 3) | Student scores 66–85% on the screening set. |
| Band 4 | Early A1+ | Remaining difficulty-4 skills (PHO-009, PHO-010, VOC-019–020, GRA-017–020, READ-007–010, WRITE-007–010) | Student scores above 85% on the screening set. |

A student routed to Band 4 is near A1 completion. The AIM Engine will target gap skills rather than restart from Band 1.

---

## Test Structure

### Total Question Count

| Parameter | Value | Rationale |
|---|---|---|
| Minimum questions | 10 | Produces a reliable band placement with minimal student fatigue. |
| Maximum questions | 20 | Hard cap to prevent abandonment. |
| Target adaptive path | 12–15 questions | Expected path for most students. |

### Question Distribution by Category

| Category | Questions at Difficulty 1–2 | Questions at Difficulty 3–4 | Notes |
|---|---|---|---|
| PHO — Phonics | 2 | 1 | Letter recognition and basic CVC decoding; text-based only in MVP. |
| VOC — Vocabulary | 3 | 2 | Core word recognition and simple matching. |
| GRA — Grammar | 2 | 2 | Subject pronouns, to be, and present simple. |
| READ — Reading | 1 | 1 | Sentence-level comprehension only; no long texts in placement. |
| WRITE — Writing | 0 | 0 | Writing is not tested in placement. Writing skills are profiled during lessons. |
| LIS — Listening | 0 | 0 | Listening is excluded from MVP automated placement. Audio delivery is not confirmed for the pilot; LIS skills are tagged `placement_eligible = false`. |
| SPE — Speaking | 0 | 0 | Speaking is excluded from MVP automated placement. Free-speech scoring is out of MVP scope; SPE skills are tagged `placement_eligible = false`. |

Writing is excluded from placement because letter formation and copying tasks are not reliably scorable with automated scoring in MVP. The AIM Engine assigns writing skill states after the first lesson. Listening and Speaking are excluded because audio delivery and speech scoring are not confirmed for the MVP pilot; both skill categories are defined in the skill tree but require infrastructure confirmation before serving.

### Adaptive Branching Logic

The placement test uses a simple binary adaptive path:

1. Start with the Band 1–2 screening set (first 8–10 questions covering difficulty 1 and 2 skills).
2. If the student scores ≥ 60% on the screening set, continue to the Band 3–4 extension set (4–6 additional questions covering difficulty 3 and 4 skills).
3. If the student scores < 60% on the screening set, stop. Do not serve the extension set. Route to Band 1 or Band 2 based on screening score.
4. Final band is determined after all served questions are evaluated.

---

## Question Tags Required for Placement

Every placement question must carry the following metadata tags to support AIM Engine processing:

| Tag | Description | Example |
|---|---|---|
| `skill_id` | The canonical skill ID from the English skill tree | `EN-A1-GRA-006` |
| `difficulty` | Difficulty level (1–4) from the skill tree | `1` |
| `category` | PHO, VOC, GRA, READ | `GRA` |
| `placement_eligible` | Boolean flag; only `true` questions are served in placement | `true` |
| `question_type` | MCQ (multiple choice), matching, fill-blank, or true-false | `MCQ` |

Question types allowed in placement:

| Type | Allowed | Notes |
|---|---|---|
| MCQ (4 options) | Yes | Primary type. Fast to answer, unambiguous scoring. |
| True / False | Yes | For basic grammar structures. |
| Matching | Yes | Vocabulary only. Match word to image or word to definition. |
| Fill-blank | No | Excluded from placement. Too dependent on spelling at early stages. |
| Free text | No | Excluded from placement. Not auto-scorable reliably. |

---

## Scoring Algorithm

### Per-Question Scoring

| Result | Score |
|---|---|
| Correct answer | 1 point |
| Incorrect answer | 0 points |
| Skipped (timeout or explicit skip) | 0 points |

There is no partial credit in the placement test.

### Band Score Calculation

```
screening_score_pct = correct_answers_in_screening_set / total_screening_questions_served * 100
extension_score_pct = correct_answers_in_extension_set / total_extension_questions_served * 100  (only if extension was served)
```

Band assignment rules:

| Condition | Assigned Band |
|---|---|
| screening_score_pct < 40% | Band 1 |
| 40% ≤ screening_score_pct < 60% | Band 2 |
| screening_score_pct ≥ 60% AND extension not served (fallback) | Band 2 |
| screening_score_pct ≥ 60% AND extension_score_pct < 60% | Band 3 |
| screening_score_pct ≥ 60% AND extension_score_pct ≥ 60% | Band 4 |

### Speed Signal (Optional, MVP Consideration)

Response time per question is recorded but does not affect band assignment in MVP. It is stored in the session event payload for AIM Engine analysis. Fast correct answers on low-difficulty questions increase confidence signals post-placement; this is processed by the AIM Engine, not the placement test scorer.

---

## Routing Rules

After scoring, the placement test produces two outputs:

1. **Entry Band** — one of Band 1, 2, 3, or 4.
2. **Initial Skill State Map** — a per-skill initial state object for every skill in the student's entry band, pre-populated with `mastery: 0`, `confidence: 0.5` (neutral prior), and flagged skills where the student answered correctly with `mastery: 0.3` (weak signal, not confirmed mastery).

### AIM Engine Handoff Contract

The placement test result passed to the AIM Engine contains:

| Field | Type | Description |
|---|---|---|
| `student_id` | string | Unique student identifier |
| `entry_band` | int (1–4) | Assigned placement band |
| `placement_score_pct` | float | Overall score as a percentage |
| `screening_score_pct` | float | Screening set score |
| `extension_score_pct` | float or null | Extension score if served, otherwise null |
| `answered_questions` | array | List of question IDs, skill IDs, correctness, and response times |
| `initial_skill_states` | object | Map of skill_id → initial mastery estimate per skill in the entry band |
| `placement_completed_at` | datetime | ISO 8601 UTC timestamp |

This contract is a planning definition. The exact field names and types will be finalized in P0-015 (Data Captured During Learning Session) and P0-016 (Initial Data Model).

---

## Fallback Cases

| Scenario | Rule |
|---|---|
| Student abandons test after fewer than 5 questions answered | Route to Band 1 (safest default). Flag student for re-placement prompt on next session. |
| Student answers all served questions in under 30 seconds total | Flag as suspicious speed. Route normally but set a review flag for admin dashboard. Do not block the student. |
| Network interruption mid-test | Resume from last unanswered question if session token is valid within 60 minutes. After 60 minutes, restart the test. |
| All questions in the screening set are skipped | Route to Band 1. |
| Extension set served but all questions skipped | Route to Band 3 (screened at ≥ 60%, extension inconclusive). |
| Student completes placement twice (re-test) | The most recent placement result overwrites the prior result. AIM Engine receives the latest result. |
| Question bank insufficient (fewer than 10 placement-eligible questions tagged) | Block placement and surface a content-gap alert to admin. Do not route student into lessons. |

---

## Repeat Placement Rules

| Rule | Detail |
|---|---|
| Initial placement | Mandatory for all new students. Cannot be skipped. |
| Manual re-test request | A student may request re-placement once every 30 days. Admin can override this limit. |
| Admin-triggered re-test | Admin can reset any student's placement at any time from the admin dashboard. |
| Automatic re-test trigger | Not in MVP. Future: AIM Engine may flag a student for re-placement if performance diverges significantly from placement prediction over multiple sessions. |

---

## Placement Test UX Constraints

These constraints are planning-level notes for the Flutter app implementation in Phase 1. They are not implemented here.

| Constraint | Requirement |
|---|---|
| Time per question | No hard timer in MVP. Students may take as long as needed. Response time is recorded passively. |
| Question display | One question per screen. No question list navigation. |
| Progress indicator | Show approximate progress (e.g., "Question 5 of ~12"). |
| Skip option | Students may skip a question. Skipped questions are scored as incorrect for band calculation. |
| Feedback during test | No right/wrong feedback shown during placement. Feedback is reserved for lessons. |
| Language of instructions | Instructions displayed in Arabic (native language) for the MVP A1 pilot targeting Arabic-speaking students. |
| Retry on network error | Auto-retry up to 3 times silently. Surface error and pause test if all retries fail. |

---

## Assumptions

- All placement questions are authored and tagged before Phase 1 implementation. The question bank standards (P0-012) will define the authoring workflow and validation rules.
- The placement test is text and image based only in MVP. Audio-based phonics placement is deferred until audio delivery is confirmed. Listening (LIS) skills are excluded from placement until audio delivery is confirmed.
- Speaking (SPE) skills are excluded from placement in MVP. Automated free-speech scoring is out of MVP scope.
- Placement test content is static (not dynamically generated by AI) in MVP. AI-generated placement is a post-MVP consideration.
- The two-stage adaptive structure (screening + extension) is the minimum viable adaptive design. More sophisticated IRT-based adaptive testing is out of scope for MVP.
- The AIM Engine consumes the placement result immediately after submission. There is no async delay in the handoff.

---

## Open Questions

| Question | Current Handling |
|---|---|
| Should the placement test include a writing sample (even one sentence) to give the AIM Engine an early writing baseline? | Deferred. Writing is excluded from MVP placement due to scoring complexity. Revisit when handwriting or typed input is more reliably scorable. |
| Should Band 4 students be allowed to skip A1 content entirely and begin A2 screening? | Out of scope for MVP. The skill tree currently covers A1 only. When A2 skills are added, this routing rule should be revisited. |
| What is the minimum acceptable question bank size before placement is enabled for a student cohort? | Open decision. Recommend a minimum of 3 placement-eligible questions per skill category per difficulty level before enabling. To be confirmed with content manager in P0-012. |
| Should placement test results be visible to parents in the parent dashboard? | Open decision. The summary band (Band 1–4) and overall score percentage should be visible. Detailed per-question results should be admin-only. Defer to P0-006. |
| How should the AIM Engine handle a Band 4 student who later demonstrates Band 1 behavior in lessons? | Open decision. This is a post-placement AIM Engine recalibration problem. The AIM Engine should adjust skill state mastery signals within the session; re-placement is a last resort. Defer to AIM Engine boundary doc (P0-014). |

---

## Related Documents

- `docs/learning/english-skill-tree.md` — Source of all skill IDs, difficulty levels, and prerequisite graph
- `docs/product/mvp-scope.md` — MVP boundaries that govern placement test scope
- `docs/product/roles-and-permissions.md` — Which roles can trigger or view placement results
- `docs/journeys/student-journey.md` — Student flow that includes placement as the entry step
- `docs/content/lesson-content-structure.md` (P0-011) — How lessons are structured after placement routing
- `docs/content/question-bank-standards.md` (P0-012) — Question authoring and tagging standards that placement questions must follow
- `docs/aim-engine/boundary-and-io-contract.md` (P0-014) — AIM Engine contract that receives placement output
- `docs/data/session-data-capture.md` (P0-015) — Full data captured during placement session

---

## Acceptance Notes

- Dependency checked: P0-009 (`docs/learning/english-skill-tree.md`) is present and meaningful.
- This document covers placement goal, entry bands, test structure, question distribution, adaptive branching, scoring algorithm, routing rules, fallback cases, repeat placement rules, UX constraints, assumptions, and open questions.
- No runtime source code, Student Web App, Flutter AIM logic, database migrations, or backend implementation was added.
- Task is ready to mark Done in Notion.
