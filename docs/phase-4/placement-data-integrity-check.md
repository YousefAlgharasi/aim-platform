# Placement Data Integrity Check

> Phase 4 — P4-028
> Scope: Placement Test phase only.

---

## Purpose

This document records the static data integrity analysis of the Phase 4 placement seed
data (`services/backend-api/prisma/seeds/04_placement_seed.sql`, P4-027). It verifies
that the seeded test, sections, and questions conform to the placement blueprint
(P4-029), that schema constraints are respected, and that the current state of the
skill mapping is documented along with the action required before the placement scoring
service can produce a valid skill mastery map or weakness map.

No live database connection is required. All checks are performed against the seed SQL
file and the migration files present on `main`.

---

## 1. Placement Test Check

| Field         | Expected                                  | Seeded value                                | Pass |
|---------------|-------------------------------------------|---------------------------------------------|------|
| `id`          | Stable dev UUID                           | `f4000000-0000-0000-0000-000000000001`      | ✓    |
| `title`       | Non-empty string                          | `AIM Phase 4 Placement Test`                | ✓    |
| `status`      | `published` (active in seed environment)  | `published`                                 | ✓    |
| Conflict guard | `ON CONFLICT (id) DO NOTHING`            | Present                                     | ✓    |

**Result: 1 / 1 placement test — PASS**

---

## 2. Placement Sections Check

Expected: 3 sections in fixed order (Grammar → Vocabulary → Listening) per P4-029 §1.

| `order_index` | `title`      | `skill_code`  | `total_questions` | FK to test                                    | Pass |
|---------------|--------------|---------------|-------------------|-----------------------------------------------|------|
| 1             | Grammar      | `grammar`     | 10                | `f4000000-0000-0000-0000-000000000001`        | ✓    |
| 2             | Vocabulary   | `vocabulary`  | 10                | `f4000000-0000-0000-0000-000000000001`        | ✓    |
| 3             | Listening    | `listening`   | 10                | `f4000000-0000-0000-0000-000000000001`        | ✓    |

- `order_index` values: 1, 2, 3 — no gaps, no duplicates — ✓
- All sections reference the same placement test UUID — ✓
- `total_questions` = 10 for every section — matches blueprint minimum — ✓
- Conflict guard: `ON CONFLICT (id) DO NOTHING` on all rows — ✓

**Result: 3 / 3 sections — PASS**

---

## 3. Placement Questions Check

### 3.1 Grammar Section (section id `f4000000-0000-0000-0001-000000000001`)

Expected per P4-029 §3.1: 10 `multiple_choice` questions covering verb forms (≥3),
subject-verb agreement (≥2), articles & prepositions (≥2), sentence structure &
negation (≥2), question forms (≥1).

| `order_index` | Area                        | `question_type`    | `correct_answer` | `media_url` | Pass |
|---------------|-----------------------------|--------------------|------------------|-------------|------|
| 1             | Verb forms                  | `multiple_choice`  | `B`              | NULL        | ✓    |
| 2             | Verb forms                  | `multiple_choice`  | `C`              | NULL        | ✓    |
| 3             | Verb forms                  | `multiple_choice`  | `C`              | NULL        | ✓    |
| 4             | Subject-verb agreement      | `multiple_choice`  | `B`              | NULL        | ✓    |
| 5             | Subject-verb agreement      | `multiple_choice`  | `B`              | NULL        | ✓    |
| 6             | Articles & prepositions     | `multiple_choice`  | `B`              | NULL        | ✓    |
| 7             | Articles & prepositions     | `multiple_choice`  | `C`              | NULL        | ✓    |
| 8             | Sentence structure/negation | `multiple_choice`  | `A`              | NULL        | ✓    |
| 9             | Sentence structure/negation | `multiple_choice`  | `C`              | NULL        | ✓    |
| 10            | Question forms              | `multiple_choice`  | `B`              | NULL        | ✓    |

Blueprint area coverage:

| Area                        | Required | Seeded | Pass |
|-----------------------------|----------|--------|------|
| Verb forms                  | ≥3       | 3      | ✓    |
| Subject-verb agreement      | ≥2       | 2      | ✓    |
| Articles & prepositions     | ≥2       | 2      | ✓    |
| Sentence structure/negation | ≥2       | 2      | ✓    |
| Question forms              | ≥1       | 1      | ✓    |

- `order_index` 1–10, no gaps — ✓
- All questions `multiple_choice` — ✓
- All `correct_answer` non-empty — ✓
- All `prompt` non-empty — ✓
- `media_url` NULL (expected for Grammar) — ✓

**Grammar: 10 / 10 questions — PASS**

---

### 3.2 Vocabulary Section (section id `f4000000-0000-0000-0001-000000000002`)

Expected per P4-029 §3.2: 10 `multiple_choice` questions covering word meaning &
synonyms (≥3), word in context / fill-in (≥3), reading comprehension (≥4).

| `order_index` | Area                         | `question_type`   | `correct_answer` | `media_url` | Pass |
|---------------|------------------------------|-------------------|------------------|-------------|------|
| 1             | Word meaning / synonyms      | `multiple_choice` | `B`              | NULL        | ✓    |
| 2             | Word meaning / synonyms      | `multiple_choice` | `C`              | NULL        | ✓    |
| 3             | Word meaning / synonyms      | `multiple_choice` | `B`              | NULL        | ✓    |
| 4             | Word in context / fill-in    | `multiple_choice` | `B`              | NULL        | ✓    |
| 5             | Word in context / fill-in    | `multiple_choice` | `C`              | NULL        | ✓    |
| 6             | Word in context / fill-in    | `multiple_choice` | `B`              | NULL        | ✓    |
| 7             | Reading comprehension        | `multiple_choice` | `C`              | NULL        | ✓    |
| 8             | Reading comprehension        | `multiple_choice` | `B`              | NULL        | ✓    |
| 9             | Reading comprehension        | `multiple_choice` | `D`              | NULL        | ✓    |
| 10            | Reading comprehension        | `multiple_choice` | `C`              | NULL        | ✓    |

Blueprint area coverage:

| Area                         | Required | Seeded | Pass |
|------------------------------|----------|--------|------|
| Word meaning / synonyms      | ≥3       | 3      | ✓    |
| Word in context / fill-in    | ≥3       | 3      | ✓    |
| Reading comprehension        | ≥4       | 4      | ✓    |

- Q7–Q10 share a passage embedded in each prompt — consistent with P4-029 §3.2 pattern ✓
- `order_index` 1–10, no gaps — ✓
- All questions `multiple_choice` — ✓
- All `correct_answer` non-empty — ✓
- `media_url` NULL (expected for Vocabulary) — ✓

**Vocabulary: 10 / 10 questions — PASS**

---

### 3.3 Listening Section (section id `f4000000-0000-0000-0001-000000000003`)

Expected per P4-029 §3.3: 10 `multiple_choice` questions covering spoken instruction
comprehension (≥3), dialogue comprehension (≥4), time & number comprehension (≥3).
Each question must include an audio reference in the prompt and a non-null `media_url`.

| `order_index` | Area                      | `question_type`   | `correct_answer` | `media_url`                                   | Pass |
|---------------|---------------------------|-------------------|------------------|-----------------------------------------------|------|
| 1             | Instruction comprehension | `multiple_choice` | `B`              | `audio/placement/listen-q1-instruction.mp3`   | ✓    |
| 2             | Instruction comprehension | `multiple_choice` | `A`              | `audio/placement/listen-q2-instruction.mp3`   | ✓    |
| 3             | Instruction comprehension | `multiple_choice` | `C`              | `audio/placement/listen-q3-instruction.mp3`   | ✓    |
| 4             | Dialogue comprehension    | `multiple_choice` | `B`              | `audio/placement/listen-q4-dialogue.mp3`      | ✓    |
| 5             | Dialogue comprehension    | `multiple_choice` | `D`              | `audio/placement/listen-q5-dialogue.mp3`      | ✓    |
| 6             | Dialogue comprehension    | `multiple_choice` | `B`              | `audio/placement/listen-q6-dialogue.mp3`      | ✓    |
| 7             | Dialogue comprehension    | `multiple_choice` | `C`              | `audio/placement/listen-q7-dialogue.mp3`      | ✓    |
| 8             | Time & number             | `multiple_choice` | `A`              | `audio/placement/listen-q8-time.mp3`          | ✓    |
| 9             | Time & number             | `multiple_choice` | `C`              | `audio/placement/listen-q9-number.mp3`        | ✓    |
| 10            | Time & number             | `multiple_choice` | `A`              | `audio/placement/listen-q10-price.mp3`        | ✓    |

Blueprint area coverage:

| Area                      | Required | Seeded | Pass |
|---------------------------|----------|--------|------|
| Instruction comprehension | ≥3       | 3      | ✓    |
| Dialogue comprehension    | ≥4       | 4      | ✓    |
| Time & number             | ≥3       | 3      | ✓    |

- All 10 questions include `[Audio: ...]` reference in `prompt` field — ✓
- All 10 questions have non-null `media_url` — ✓
- `order_index` 1–10, no gaps — ✓
- All questions `multiple_choice` — ✓
- All `correct_answer` non-empty — ✓

**Listening: 10 / 10 questions — PASS**

---

## 4. Total Question Count

| Section    | Expected | Seeded | Pass |
|------------|----------|--------|------|
| Grammar    | 10       | 10     | ✓    |
| Vocabulary | 10       | 10     | ✓    |
| Listening  | 10       | 10     | ✓    |
| **Total**  | **30**   | **30** | **✓**|

---

## 5. Placement Question Skills Mapping Check

### 5.1 Current State

The skill mapping block in the seed file is **commented out**. No rows are inserted into
`placement_question_skills` when the seed runs in its current form.

Reason documented in P4-027: skill UUIDs from the Phase 3 `skills` table must be
confirmed before the mapping block can be executed. The seed file contains placeholder
UUIDs (`b3000000-...`) which do not correspond to real rows in the `skills` table and
would violate the `REFERENCES skills (id) ON DELETE RESTRICT` foreign-key constraint.

### 5.2 Intended Mapping (from seed comments)

The seed file documents the following intended primary skill mapping per question group:

| Section    | Questions | Skill Key               | Placeholder UUID                          |
|------------|-----------|-------------------------|-------------------------------------------|
| Grammar    | Q1–Q3     | `grammar.verb_forms`    | `b3000000-0000-0000-0001-000000000001`    |
| Grammar    | Q4–Q5     | `grammar.agreement`     | `b3000000-0000-0000-0001-000000000002`    |
| Grammar    | Q6–Q7     | `grammar.articles`      | `b3000000-0000-0000-0001-000000000003`    |
| Grammar    | Q8–Q9     | `grammar.negation`      | `b3000000-0000-0000-0001-000000000004`    |
| Grammar    | Q10       | `grammar.questions`     | `b3000000-0000-0000-0001-000000000005`    |
| Vocabulary | Q1–Q3     | `vocabulary.synonyms`   | `b3000000-0000-0000-0002-000000000001`    |
| Vocabulary | Q4–Q6     | `vocabulary.context`    | `b3000000-0000-0000-0002-000000000002`    |
| Vocabulary | Q7–Q10    | `vocabulary.reading`    | `b3000000-0000-0000-0003-000000000003`    |
| Listening  | Q1–Q3     | `listening.instruction` | `b3000000-0000-0000-0003-000000000001`    |
| Listening  | Q4–Q7     | `listening.dialogue`    | `b3000000-0000-0000-0003-000000000002`    |
| Listening  | Q8–Q10    | `listening.numbers`     | `b3000000-0000-0000-0003-000000000003`    |

All 30 questions have exactly one intended primary skill link.

### 5.3 Integrity Impact

The `placement_question_skills` table (`P4-020`) requires that every question included
in a live placement test have exactly one row with `is_primary = true` before the
backend scoring service can produce a skill mastery map or weakness map.

While the skill mapping is inactive, the placement test can be seeded and its questions
delivered to students. However, the placement scoring service (`P4-045`) and result
service (`P4-046`) cannot generate a meaningful `skillMasteryMap` or `weaknessMap`
because no question-to-skill attribution exists.

### 5.4 Required Action Before Production

| Step | Action                                                                                          | Owner  |
|------|-------------------------------------------------------------------------------------------------|--------|
| 1    | Query the `skills` table for the 11 skill keys listed in §5.2 and record their real UUIDs.     | Backend/Admin |
| 2    | Replace placeholder UUIDs in the commented-out block in `04_placement_seed.sql`.               | Backend team |
| 3    | Uncomment the `placement_question_skills` INSERT block.                                         | Backend team |
| 4    | Re-run the seed (`prisma db seed` or equivalent) to activate the mapping.                       | Backend/DevOps |
| 5    | Verify `placement_question_skills` has 30 rows with `is_primary = true` after execution.        | Backend team |

**Skill mapping status: PENDING — blocked on real skill UUIDs from Phase 3 skills table.**

---

## 6. Schema Constraint Compliance

Checked against migrations present on `main`:

| Constraint                                            | Seed compliance | Pass |
|-------------------------------------------------------|-----------------|------|
| `placement_tests.status` in (`draft`, `published`)   | `published`     | ✓    |
| `placement_questions.question_type` in allowed set    | `multiple_choice` for all 30 | ✓ |
| `placement_questions.prompt` non-empty after trim     | All prompts populated | ✓ |
| `placement_questions.correct_answer` non-empty        | All 30 rows populated | ✓ |
| `placement_questions.order_index` unique per section  | 1–10 per section, no duplicates | ✓ |
| FK: `placement_section_id → placement_sections.id`   | All question FKs match seeded section IDs | ✓ |
| FK: `placement_test_id → placement_tests.id`          | All section FKs match seeded test ID | ✓ |
| `ON CONFLICT DO NOTHING` on all inserts               | Present on all INSERT blocks | ✓ |

---

## 7. Security Checks

| Rule                                                                           | Status |
|--------------------------------------------------------------------------------|--------|
| No secrets, service-role keys, or JWT secrets in seed file                     | ✓      |
| `correct_answer` stored server-side only; not surfaced in any client endpoint  | ✓      |
| Seed must be run only by backend-controlled tooling                            | ✓ (documented in file header) |
| No AIM Engine runtime, lesson delivery, or progress data seeded                | ✓      |
| No client-side scoring values or thresholds embedded                           | ✓      |
| Listening `media_url` paths are placeholder only; real CDN URLs not present    | ⚠ (known limitation — see §8) |

---

## 8. Known Limitations

| # | Limitation                                                                                              | Risk       | Required action                                          |
|---|----------------------------------------------------------------------------------------------------------|------------|----------------------------------------------------------|
| 1 | Skill mapping is commented out — no `placement_question_skills` rows exist after seed execution          | **High** for placement scoring | Follow §5.4 steps before enabling scoring |
| 2 | Listening `media_url` values are placeholder paths (`audio/placement/listen-qN-*.mp3`) — audio files do not exist | **High** for Listening delivery | Replace with real CDN URLs before production |
| 3 | Placement question content is simplified sample data — not production-quality assessment items           | Medium     | Replace with validated assessment content before launch  |
| 4 | Seed cannot be validated against a live database in this environment — no DB credentials available       | None       | Run `prisma db seed` in staging to verify                |
| 5 | Phase 3 skill UUIDs for the 11 skill keys were not available at seed time — placeholders used             | None (blocked) | See §5.4                                            |

---

## 9. Summary

| Area                  | Result |
|-----------------------|--------|
| Placement test        | ✓ PASS — 1 published test |
| Sections              | ✓ PASS — 3 sections, order 1–3, 10q each |
| Grammar questions     | ✓ PASS — 10 questions, all areas covered |
| Vocabulary questions  | ✓ PASS — 10 questions, all areas covered |
| Listening questions   | ✓ PASS — 10 questions, all areas covered, media_url present |
| Total question count  | ✓ PASS — 30 / 30 |
| Schema constraints    | ✓ PASS — all checked constraints satisfied |
| Security              | ✓ PASS — no secrets or privileged data |
| Skill mapping         | ⚠ PENDING — mapping block commented out; real skill UUIDs required |
| Audio files           | ⚠ PENDING — placeholder paths; real CDN URLs required |

**The seed data is structurally complete and blueprint-compliant. Skill mapping and
audio asset activation are the two blocking items before the placement test is
production-ready.**

---

## 10. Scope Confirmation

- Placement Test phase only: yes
- AIM Engine runtime integration: not included
- AI Teacher: not included
- Lesson delivery: not included
- Client-side scoring: not included
- Flutter scoring authority: not applicable (documentation task)
- Backend scoring authority: preserved
