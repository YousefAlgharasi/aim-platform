# Phase 4 — Placement Blueprint Rules

> Phase 4 — P4-029
> Scope: Placement Test phase only.

---

## Purpose

This document defines the structural blueprint for the AIM Phase 4 placement test. It specifies section composition, question counts per section, section order, skill coverage requirements, and measurability rules.

All backend implementations must conform to this blueprint when creating or validating placement tests. The blueprint does not define scoring thresholds or weights — those are defined in P4-030 and P4-031.

---

## 1. Placement Test Structure

The Phase 4 placement test consists of **three sections** delivered in a fixed order.

| Order | Section | Skill Area | Question Count | Estimated Minutes |
|---|---|---|---|---|
| 1 | Grammar | Grammar & Verb Forms | 10 | 7 |
| 2 | Vocabulary | Vocabulary & Reading | 10 | 8 |
| 3 | Listening | Listening Comprehension | 10 | 5 |

**Total:** 30 questions across 3 sections. Estimated 20 minutes.

---

## 2. Section Rules

### 2.1 Section Order

- Sections are delivered in the order defined in §1.
- Students may not skip a section.
- Students may not return to a previous section once it is submitted.
- The backend enforces section order on every answer submission.

### 2.2 Minimum Question Count

- Each section must have exactly 10 questions in the published test.
- A section with fewer than 10 questions cannot be published.
- The backend enforces this minimum at publish time.

### 2.3 Section Completeness

- All 10 questions in a section must be answered or explicitly skipped before the next section begins.
- An unanswered question counts as a skip and receives zero score for that question.

---

## 3. Question Distribution Rules

### 3.1 Grammar Section (10 questions)

Questions must cover the following grammar areas:

| Area | Minimum Questions |
|---|---|
| Verb forms (present, past, future) | 3 |
| Subject-verb agreement | 2 |
| Articles and prepositions | 2 |
| Sentence structure and negation | 2 |
| Question forms | 1 |

- All questions must be `multiple_choice` type with exactly 4 options.
- Exactly 1 option per question must be marked `isCorrect: true`.

### 3.2 Vocabulary Section (10 questions)

Questions must cover the following vocabulary areas:

| Area | Minimum Questions |
|---|---|
| Word meaning and synonyms | 3 |
| Word in context (fill-in) | 3 |
| Reading comprehension (short passage) | 4 |

- All questions must be `multiple_choice` type with exactly 4 options.
- Exactly 1 option per question must be marked `isCorrect: true`.

### 3.3 Listening Section (10 questions)

Questions must cover the following listening areas:

| Area | Minimum Questions |
|---|---|
| Short spoken instruction comprehension | 3 |
| Dialogue comprehension | 4 |
| Time and number comprehension | 3 |

- All questions must be `multiple_choice` type with exactly 4 options.
- Exactly 1 option per question must be marked `isCorrect: true`.
- Listening questions must include an audio prompt reference in the `prompt` field or metadata.

---

## 4. Skill Coverage Rules

Every question in the placement test must be linked to at least one skill via `placement_question_skills`. A question with no skill links cannot be published.

### 4.1 Required Skill Coverage

The published placement test must link questions to skills from all of the following skill areas:

| Skill Area | Minimum Linked Questions |
|---|---|
| Grammar — verb forms | 3 |
| Grammar — sentence structure | 2 |
| Vocabulary — word meaning | 3 |
| Vocabulary — reading comprehension | 3 |
| Listening — instruction comprehension | 3 |
| Listening — dialogue comprehension | 3 |

- A single question may be linked to multiple skills.
- The backend validates skill coverage at publish time.
- Skill coverage is used by the backend result service to produce the skill map (P4-007).

### 4.2 Skill Link Rules

- `skillId` values in `placement_question_skills` must reference valid published skills in the skills table.
- Orphaned skill links (referencing deleted or unpublished skills) are not allowed.
- A question linked to no valid published skills must not appear in a published section.

---

## 5. Difficulty Distribution Rules

Questions within each section must cover three difficulty tiers to allow the backend to differentiate between A1, A2, and B1 learners.

| Tier | Difficulty Value | Questions per Section |
|---|---|---|
| Basic | 1 | 4 |
| Intermediate | 2 | 4 |
| Advanced | 3 | 2 |

- `difficulty` is set per question at creation time by the admin.
- The backend uses `difficulty` values as inputs to the scoring service (P4-032).
- Flutter must never receive or use raw `difficulty` values.

---

## 6. CEFR Coverage Rules

The placement test must be capable of placing a learner at A1, A2, or B1.

- B2, C1, and C2 are explicitly out of scope for Phase 4.
- The question set must include enough Basic-tier questions to identify A1 learners.
- The question set must include enough Intermediate-tier questions to differentiate A1 from A2.
- The question set must include enough Advanced-tier questions to identify B1 learners.

These requirements are satisfied by the distribution in §5.

---

## 7. Published Test Validity Rules

Before a placement test may be published, the backend must confirm all of the following:

| Rule | Check |
|---|---|
| Exactly 3 sections | Section count = 3 |
| Sections in correct order | order values = 1, 2, 3 with no gaps |
| Each section has exactly 10 questions | question count per section = 10 |
| All questions are `multiple_choice` | type = `multiple_choice` for all |
| Each question has exactly 4 options | option count = 4 for all |
| Each question has exactly 1 correct option | isCorrect count = 1 per question |
| All questions linked to at least 1 skill | placement_question_skills rows ≥ 1 per question |
| Required skill areas covered | See §4.1 |
| Difficulty distribution met | See §5 |
| No other test currently published | Enforced by status transition rules in P4-009 |

If any check fails, the publish transition must be rejected with a structured error.

---

## 8. Admin Responsibilities

- Admin must create sections in the correct order (§2.1).
- Admin must link questions to skills before publishing (§4.2).
- Admin must set `difficulty` on each question at creation time (§5).
- Admin must mark exactly one option `isCorrect` per question (§3).
- The admin UI must surface validation errors from the backend when a publish attempt fails.

---

## 9. Out of Scope

The following must not be defined here or added in Phase 4:

- Scoring weights or CEFR thresholds (defined in P4-030 and P4-031)
- Adaptive question selection
- Speaking or writing sections (deferred — see P4-036)
- B2, C1, or C2 level placement
- AIM Engine runtime integration
- Lesson delivery or practice session questions
- AI Teacher-generated questions

---

## 10. References

- `docs/phase-4/placement-result-definition.md` (P4-007)
- `docs/phase-4/placement-skill-map-rules.md` (P4-008)
- `docs/phase-4/placement-api-map.md` (P4-006)
- `docs/phase-4/placement-scope-boundaries.md` (P4-003)
- P4-030 — Define CEFR Level Thresholds
- P4-031 — Define Section Weighting Rules
- P4-032 — Define Skill Scoring Rules

---

## Metadata

| Field | Value |
|---|---|
| Task ID | P4-029 |
| Branch | phase4/P4-029-placement-blueprint-rules |
| Priority | P0 |
| Dependency | P4-007, P4-008 |
| Output | docs/phase-4/placement-blueprint-rules.md |
