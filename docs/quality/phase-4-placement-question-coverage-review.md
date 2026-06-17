# Phase 4 — Placement Question Coverage Review

> Phase 4 — P4-072
> Scope: Placement Test phase only.
> Source: `services/backend-api/prisma/seeds/04_placement_seed.sql` (P4-027)
> Blueprint: `docs/phase-4/placement-blueprint-rules.md` (P4-029)
> Skill linking status: `placement_question_skills` INSERT block **commented out** — pending real skill UUIDs.

---

## Purpose

This review verifies that the seeded placement test has sufficient, balanced question
content across all sections and skill areas as required by the P4-029 blueprint.
It identifies gaps, coverage risks, and content quality concerns before the test
is promoted to a production environment.

---

## 1. Section Coverage

### 1.1 Summary

| Section | Blueprint Minimum | Seeded | Status |
|---------|:-----------------:|:------:|:------:|
| Grammar | 10 | 10 | ✓ PASS |
| Vocabulary | 10 | 10 | ✓ PASS |
| Listening | 10 | 10 | ✓ PASS |
| **Total** | **30** | **30** | **✓ PASS** |

All three sections meet the minimum question count requirement (P4-029 §2.2).

### 1.2 Section Order

Blueprint: Grammar (1) → Vocabulary (2) → Listening (3).

| `order_index` | Section | Status |
|:-------------:|---------|:------:|
| 1 | Grammar | ✓ |
| 2 | Vocabulary | ✓ |
| 3 | Listening | ✓ |

No gaps, no duplicates. Section order is correct.

---

## 2. Grammar Section Question Distribution

Blueprint requirement (P4-029 §3.1):

| Area | Min. Required | Seeded | Questions | Status |
|------|:-------------:|:------:|-----------|:------:|
| Verb forms (present, past, future) | 3 | 3 | Q1 (present simple), Q2 (past simple), Q3 (future perfect) | ✓ PASS |
| Subject-verb agreement | 2 | 2 | Q4 (plural subject), Q5 (correlative conjunction) | ✓ PASS |
| Articles and prepositions | 2 | 2 | Q6 (indefinite article), Q7 (preposition 'at') | ✓ PASS |
| Sentence structure and negation | 2 | 2 | Q8 (past negation), Q9 (third person negation) | ✓ PASS |
| Question forms | 1 | 1 | Q10 (wh-question 'when') | ✓ PASS |

**All grammar area minimums met. Grammar section: PASS.**

### Grammar Difficulty Assessment

| Level | Questions | Justification |
|-------|:---------:|--------------|
| A1 | Q1, Q4, Q6 | Present simple, basic plural agreement, basic article |
| A2 | Q2, Q7, Q8, Q10 | Past simple, common preposition, simple negation, wh-question |
| B1+ | Q3, Q5, Q9 | Future perfect, correlative conjunction, nuanced negation |

Coverage spans A1–B1+ range, appropriate for a placement test targeting A1–B1
learners. Q3 (future perfect) may be challenging for pure A1 learners, but its
presence allows differentiation up to B1 band.

---

## 3. Vocabulary Section Question Distribution

Blueprint requirement (P4-029 §3.2):

| Area | Min. Required | Seeded | Questions | Status |
|------|:-------------:|:------:|-----------|:------:|
| Word meaning and synonyms | 3 | 3 | Q1 ('happy' synonym), Q2 ('enormous' meaning), Q3 ('begin' synonym) | ✓ PASS |
| Word in context / fill-in | 3 | 3 | Q4 (door/close), Q5 (weather/rainy), Q6 (lost keys) | ✓ PASS |
| Reading comprehension (short passage) | 4 | 4 | Q7–Q10 (Tom/library passage) | ✓ PASS |

**All vocabulary area minimums met. Vocabulary section: PASS.**

### Vocabulary Difficulty Assessment

| Level | Questions | Justification |
|-------|:---------:|--------------|
| A1 | Q1, Q3, Q4 | Basic adjective synonym, simple antonym, imperative fill-in |
| A2 | Q2, Q5, Q6 | Intermediate adjective, context clue, past tense inference |
| A1–A2 | Q7–Q10 | Short factual passage with explicit answers; suitable entry point |

### Reading Passage Note

Q7–Q10 share a single passage (Tom/library). The passage is:

- Short (3 sentences) ✓
- Factual and explicit ✓
- Free of inference requirements ✓
- All four questions have unique answers from the passage ✓

**Concern (Minor):** Q10 ("How many hours does Tom work per day?") requires arithmetic
(17:00 − 09:00 = 8 hours). The answer is correct (C: 8), but arithmetic inference
adds complexity beyond pure reading comprehension at A1–A2. Acceptable for placement
differentiation; flag for content review before production.

---

## 4. Listening Section Question Distribution

Blueprint requirement (P4-029 §3.3):

| Area | Min. Required | Seeded | Questions | Status |
|------|:-------------:|:------:|-----------|:------:|
| Short spoken instruction comprehension | 3 | 3 | Q1 (action), Q2 (bring item), Q3 (direction) | ✓ PASS |
| Dialogue comprehension | 4 | 4 | Q4 (phone call reason), Q5 (decision), Q6 (emotion), Q7 (location) | ✓ PASS |
| Time and number comprehension | 3 | 3 | Q8 (clock time), Q9 (phone number), Q10 (price) | ✓ PASS |

**All listening area minimums met. Listening section: PASS.**

### Audio Reference Compliance

Blueprint §3.3 requires each listening question to include an audio prompt reference:

| Question | `prompt` contains `[Audio: …]` | `media_url` present | Status |
|----------|:-------------------------------:|:-------------------:|:------:|
| Q1–Q10 | ✓ (all 10) | ✓ (all 10) | ✓ PASS |

All 10 listening questions include both an audio reference in the prompt field and
a non-null `media_url`.

### Audio Asset Status

**⚠ All 10 `media_url` values are placeholder paths** (`audio/placement/listen-qN-*.mp3`).
Real audio files have not been created or uploaded to a CDN. This is a known limitation
from P4-028 (integrity check). The test cannot be used in production without real audio assets.

---

## 5. Skill Mapping Coverage

### 5.1 Current State

The `placement_question_skills` INSERT block in the seed file is **commented out**.
Zero rows exist in `placement_question_skills` after seed execution.

### 5.2 Intended Primary Skill Coverage (from seed comments)

| Section | Questions | Skill Key | Skill UUID Status | Questions Covered |
|---------|:---------:|-----------|:-----------------:|:-----------------:|
| Grammar | Q1–Q3 | `grammar.verb_forms` | Placeholder | 3 |
| Grammar | Q4–Q5 | `grammar.agreement` | Placeholder | 2 |
| Grammar | Q6–Q7 | `grammar.articles` | Placeholder | 2 |
| Grammar | Q8–Q9 | `grammar.negation` | Placeholder | 2 |
| Grammar | Q10 | `grammar.questions` | Placeholder | 1 |
| Vocabulary | Q1–Q3 | `vocabulary.synonyms` | Placeholder | 3 |
| Vocabulary | Q4–Q6 | `vocabulary.context` | Placeholder | 3 |
| Vocabulary | Q7–Q10 | `vocabulary.reading` | Placeholder | 4 |
| Listening | Q1–Q3 | `listening.instruction` | Placeholder | 3 |
| Listening | Q4–Q7 | `listening.dialogue` | Placeholder | 4 |
| Listening | Q8–Q10 | `listening.numbers` | Placeholder | 3 |

**When activated, all 30 questions will have exactly one primary skill link.**

### 5.3 Blueprint Skill Coverage Check (Intended — Not Yet Active)

Per P4-029 §4.1:

| Required Skill Area | Min. Questions | Intended Links | Status |
|--------------------|:--------------:|:--------------:|:------:|
| Grammar — verb forms | 3 | 3 | ✓ (when activated) |
| Grammar — sentence structure | 2 | 4 (negation + articles) | ✓ (when activated) |
| Vocabulary — word meaning | 3 | 3 | ✓ (when activated) |
| Vocabulary — reading comprehension | 3 | 4 | ✓ (when activated) |
| Listening — instruction comprehension | 3 | 3 | ✓ (when activated) |

**When skill mapping is activated, all P4-029 §4.1 minimums will be satisfied.**

### 5.4 Skill Mapping Activation Blockers

| Step | Action | Owner |
|------|--------|-------|
| 1 | Query `skills` table for the 11 skill keys listed above; record real UUIDs | Backend/Admin |
| 2 | Replace placeholder UUIDs in `04_placement_seed.sql` commented block | Backend team |
| 3 | Uncomment the `placement_question_skills` INSERT block | Backend team |
| 4 | Re-execute seed in staging environment | Backend/DevOps |
| 5 | Verify 30 rows in `placement_question_skills` with `is_primary = true` | Backend team |

**Skill mapping is the primary hard blocker for production readiness.**

---

## 6. Content Quality Assessment

### 6.1 Question Type Compliance

Blueprint: All questions must be `multiple_choice` with exactly 4 options.

- All 30 questions: `question_type = 'multiple_choice'` ✓
- All 30 questions: prompt includes exactly 4 labeled options (A, B, C, D) ✓
- All 30 questions: `correct_answer` is one of A, B, C, D ✓

### 6.2 Answer Key Distribution

| Section | A | B | C | D |
|---------|:-:|:-:|:-:|:-:|
| Grammar | 1 | 4 | 4 | 1 |
| Vocabulary | 0 | 6 | 3 | 1 |
| Listening | 2 | 4 | 3 | 1 |
| **Total** | **3** | **14** | **10** | **3** |

**Concern (Moderate):** Option B is heavily over-represented as the correct answer
(14 / 30 = 47%). A balanced distribution would target 25% per option (≈ 7–8 per
option). This imbalance could be noticeable to test-taking strategies and may reduce
the quality of placement differentiation.

**Recommendation:** Before production, redistribute answer keys to achieve a more
balanced A:B:C:D ratio (target: 7–8 per option maximum variance).

### 6.3 Prompt Language Quality

All prompts are in grammatically correct English. No Arabic-language content is
present (correct for English placement test targeting Arabic-speaking A1 learners).
Context clues are appropriate for the target level.

### 6.4 Distractors Quality

Selected spot checks:

- Q5 Grammar ("Neither the teacher nor the students"): distractor B ("are") is
  actually the correct answer; distractors are plausible (A: is, C: was, D: were) ✓
- Q3 Vocabulary ("Please ___ the door"): distractors (open, break, paint) are
  contextually meaningful ✓
- Q8 Listening (time comprehension 3:15 vs 3:50 vs 4:15 vs 4:50): minimal pair
  times create appropriate listening challenge ✓

---

## 7. Coverage Gaps and Risks

| # | Gap | Severity | Impact | Recommended Action |
|---|-----|:--------:|--------|-------------------|
| 1 | Skill mapping not active — `placement_question_skills` empty | **Critical** | Placement scoring cannot produce skill mastery map or weakness map | Follow §5.4 activation steps |
| 2 | All 10 listening audio files are placeholder paths — no real audio | **Critical** | Listening section undeliverable in production | Create and upload real MP3 files to CDN; update `media_url` values |
| 3 | Option B over-represented as correct answer (47%) | **Moderate** | Test-taking strategies may inflate scores; reduces differentiation accuracy | Redistribute answer keys before production |
| 4 | Q10 Vocabulary requires arithmetic inference (arithmetic is not a vocabulary skill) | **Minor** | May unfairly penalise strong A1 readers with weak arithmetic; mislabelled as `vocabulary.reading` | Consider replacing with explicit reading comprehension question |
| 5 | Question content is simplified sample data, not psychometrically validated | **Moderate** | Placement accuracy may be limited | Replace with validated assessment items before launch |
| 6 | No Reading section present (blueprint scope deferred) | **Documented** | Reading skill mastery map will be absent; students with strong reading but weak listening may receive inaccurate level | Add Reading section if scope expands; currently intentional per P4-029 §1 |

---

## 8. Overall Verdict

| Category | Result |
|----------|:------:|
| Section count (3/3) | ✓ PASS |
| Question count per section (10/10/10) | ✓ PASS |
| Section order (Grammar → Vocabulary → Listening) | ✓ PASS |
| Grammar area distribution | ✓ PASS |
| Vocabulary area distribution | ✓ PASS |
| Listening area distribution | ✓ PASS |
| Audio reference in prompt | ✓ PASS |
| Question type (all multiple_choice) | ✓ PASS |
| Answer key validity | ✓ PASS |
| Skill mapping (intended when activated) | ✓ PASS (pending) |
| **Skill mapping active in database** | **⚠ BLOCKED** |
| **Audio assets (real CDN URLs)** | **⚠ BLOCKED** |
| **Answer key balance** | **⚠ REVIEW** |

**The placement test is structurally complete and blueprint-compliant. It is NOT
production-ready due to two critical blockers: skill mapping activation and real
audio asset creation.**

---

## 9. Scope Confirmation

- Placement Test phase only: yes
- AIM Engine runtime integration: not covered
- AI Teacher: not covered
- Lesson delivery: not covered
- Client-side scoring: not covered
- Backend scoring authority: preserved — no scoring logic in this document
