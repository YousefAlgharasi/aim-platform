# AIM Question Bank Standards

## Purpose

This document defines how questions are authored, tagged, validated, versioned, and connected to skills, placement tests, and lessons in the AIM platform. It is the canonical standard that all content authors and backend engineers must follow when creating or maintaining question content.

## Scope

Phase 0 planning documentation only. No backend code, database schemas, or Flutter code is implemented here. All skill IDs reference `docs/learning/english-skill-tree.md` (P0-009). Placement test rules reference `docs/learning/placement-test-strategy.md` (P0-010). Lesson block types reference `docs/content/lesson-content-structure.md` (P0-011).

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-009 | `docs/learning/english-skill-tree.md` | Present. Canonical skill IDs. |
| P0-010 | `docs/learning/placement-test-strategy.md` | Present. Placement test question requirements. |
| P0-011 | `docs/content/lesson-content-structure.md` | Present. Practice block question requirements. |

---

## Question Identity Fields

Every question in the bank must have the following fields. These are stored in the backend and referenced by lesson and placement content.

| Field | Type | Required | Description |
|---|---|---|---|
| `question_id` | string | Yes | Unique stable identifier. Format: `Q-{language}-{category}-{sequence}`. Example: `Q-EN-GRA-0042`. |
| `question_type` | enum | Yes | One of: `mcq`, `true_false`, `matching`, `fill_blank`, `drag_order`. |
| `skill_id` | string | Yes | The single primary skill this question assesses. Must exist in the English skill tree. |
| `difficulty` | int (1–4) | Yes | Aligned to the skill tree difficulty scale. Must match or be within one level of the skill's difficulty. |
| `category` | enum | Yes | One of: `PHO`, `VOC`, `GRA`, `READ`, `WRITE`. Derived from `skill_id`. |
| `question_text` | string | Yes | The question prompt shown to the student. |
| `options` | array[string] | Conditional | Required for `mcq` and `true_false`. |
| `correct_answer` | string or array | Yes | Correct answer key(s). Backend-only. Never exposed to client. |
| `distractors` | array[object] | Conditional | Required for `mcq`. Each object: `{value: string, distractor_reason: string}`. |
| `hint` | string | No | Shown after student hesitates or requests help. Max 80 characters. |
| `feedback_correct` | string | Yes | Shown on correct answer. Max 80 characters. |
| `feedback_incorrect` | string | Yes | Shown on incorrect answer. Must include the correct answer. Max 120 characters. |
| `placement_eligible` | bool | Yes | `true` if this question may be served in the placement test. |
| `lesson_eligible` | bool | Yes | `true` if this question may be served in lesson practice blocks. |
| `arabic_note` | string | No | Optional Arabic-language clarification for the A1 Arabic-speaker pilot. |
| `version` | int | Yes | Content version. Starts at 1. Incremented on any change to question_text, options, or correct_answer. |
| `status` | enum | Yes | One of: `draft`, `review`, `active`, `retired`. Only `active` questions are served. |
| `created_by` | string | Yes | Author identifier. |
| `reviewed_by` | string | No | Reviewer identifier. Required before status can move to `active`. |
| `last_updated_at` | datetime | Yes | ISO 8601 UTC. |

---

## Question Types

### MCQ (Multiple Choice)

| Attribute | Rule |
|---|---|
| Options count | Exactly 4 options. |
| Correct answers | Exactly 1 correct answer. |
| Distractor quality | Each distractor must be a plausible wrong answer for Arabic-speaking A1 learners. Random or nonsensical distractors are rejected. |
| Distractor reason | Each distractor must have a `distractor_reason` field explaining the common error it targets (e.g., "Confuses subject pronoun with object pronoun"). |
| Option order | Randomized at serve time. Correct answer position is not fixed in authoring. |

### True / False

| Attribute | Rule |
|---|---|
| Options | Always exactly two: `True` and `False`. |
| Statement | The `question_text` must be a complete declarative statement, not a question. |
| Balance | A question set for a lesson should not have more than 60% of true/false questions resolving to the same answer. |

### Matching

| Attribute | Rule |
|---|---|
| Pairs | 3 to 5 matching pairs per question. |
| Pair types | Word-to-definition, word-to-image-ref, or sentence-to-translation. |
| Correct answer format | Array of `{left: string, right: string}` pairs. |
| Distractors | Matching questions may include 1 decoy item on the right side that does not match any left item, at author discretion. |

### Fill Blank

| Attribute | Rule |
|---|---|
| Blank count | Maximum 1 blank per question in MVP. |
| Answer type | Single word or short phrase (max 3 words). Free-text sentence answers are not allowed. |
| Correct answer variants | Up to 3 accepted answer variants (e.g., `["is", "Is", "IS"]`) to handle capitalisation. |
| Blank marker | The blank is marked with `___` (three underscores) in the question_text. |

### Drag and Order

| Attribute | Rule |
|---|---|
| Item count | 3 to 6 items to be ordered. |
| Use case | Word order tasks (GRA-020), sequence tasks. |
| Correct answer format | Ordered array of item strings. |

---

## Skill Coverage Requirements

### Minimum Question Bank Size Per Skill

Before a skill is activated for student use, the question bank must meet these minimums:

| Context | Minimum Active Questions per Skill | Rationale |
|---|---|---|
| Placement test | 3 `placement_eligible = true` questions | Ensures variety across student cohorts without repetition. |
| Lesson practice | 5 `lesson_eligible = true` questions | Supports multiple lesson instances and prevents question fatigue. |
| Remediation | 2 `lesson_eligible = true`, difficulty ≤ skill difficulty - 1 | Remediation needs easier questions than the primary skill level. |

If a skill does not meet these minimums, it must not be activated (`status = active`) in the system. A content-gap alert is surfaced to the admin dashboard.

### Difficulty Alignment Rule

| Skill Difficulty | Allowed Question Difficulty Range |
|---|---|
| 1 | 1 only |
| 2 | 1–2 |
| 3 | 2–3 |
| 4 | 3–4 |

A question may be one level below the skill difficulty to support remediation targeting. A question must never exceed the skill's difficulty level.

---

## Question Authoring Workflow

```
Draft → Review → Active → (Retired)
```

| Stage | Who | Action | Requirement to Advance |
|---|---|---|---|
| Draft | Content Author | Create question with all required fields | All required fields populated and valid |
| Review | Content Reviewer | Check accuracy, distractor quality, language level, skill alignment | Reviewer approves and sets `reviewed_by` |
| Active | System | Question is eligible to be served | Status set to `active` by reviewer |
| Retired | Content Manager | Question is removed from active pool | Any version or factual issue found post-activation |

A question may not be set to `active` without a `reviewed_by` value.

---

## Language Level Validation Rules

Every question must pass the following language level checks before moving from Draft to Review:

| Check | Rule |
|---|---|
| Vocabulary ceiling | All words in `question_text`, `options`, and `feedback_*` fields must be within A1 CEFR vocabulary unless the question is specifically teaching that word. |
| Sentence length | `question_text` must be ≤ 20 words for difficulty 1–2 questions. ≤ 30 words for difficulty 3–4. |
| Instruction clarity | Instructions must be unambiguous. Preferred stems: "Choose the correct word.", "Which sentence is correct?", "Complete the sentence." |
| Arabic note accuracy | If `arabic_note` is present, it must be reviewed by a bilingual Arabic-English reviewer. |
| No metalinguistic jargon in options | Answer options must not contain unexplained grammatical terminology (e.g., do not use "subjunctive" as an option label for A1 students). |

---

## Versioning Rules

| Scenario | Action |
|---|---|
| Typo fix in feedback text only | Increment version. No need to retire active question. |
| Change to `question_text`, any option, or `correct_answer` | Increment version. Set status to `review`. Requires re-approval before reactivation. |
| Complete replacement of question content | Retire old question. Create new question with a new `question_id`. Do not reuse retired IDs. |
| Skill ID change | Not allowed. A question's `skill_id` is fixed at authoring. Create a new question if the skill mapping is wrong. |

---

## Question Tagging for AIM Engine

The AIM Engine uses question metadata to update student skill states after each attempt. The following tags are critical for AIM Engine processing and must be accurate:

| Tag | AIM Engine Use |
|---|---|
| `skill_id` | Updates mastery, confidence, and weakness_score for that skill |
| `difficulty` | Weights the mastery update (harder correct answers → larger mastery gain) |
| `placement_eligible` | Determines whether question is in placement test pool |
| `question_type` | Used in learning style inference (visual learners respond differently to matching vs. MCQ) |
| `hint` presence | If hint was used, attempt is flagged `hint_used = true`; mastery gain is reduced |

---

## Prohibited Question Patterns

The following patterns are explicitly rejected during review:

| Pattern | Reason |
|---|---|
| Trick questions where correct answer depends on ambiguous wording | Causes frustration; not educational for A1 learners |
| Questions where all distractors are obviously wrong | No diagnostic value; inflates mastery signals |
| Questions that test two skills simultaneously without declaring both in skill_id | Contaminates skill state updates |
| Questions with culturally insensitive content | AIM targets Arabic-speaking learners; content must be culturally neutral or appropriate |
| Questions using images without a valid `image_ref` key in the asset pipeline | Will break rendering in the Flutter app |
| Questions where `correct_answer` is not present in `options` (for MCQ) | Data integrity failure |
| Free-text questions requiring subjective evaluation | Not auto-scorable in MVP |

---

## Assumptions

- Question content is authored by human content managers in MVP. AI-generated questions are a post-MVP feature.
- The question bank is the single source of truth for all practice and placement content. Questions are never hardcoded into lesson documents.
- Image references (`image_ref`, `visual_aid_ref`) point to keys in an asset registry managed separately. Phase 0 does not define the asset pipeline.
- All `correct_answer` values are stored encrypted or access-controlled at the backend layer. The Flutter client never receives the correct answer before the student submits.
- The minimum bank size requirements apply per language per CEFR level. A2 will require its own bank when the A2 skill tree is defined.

---

## Open Questions

| Question | Current Handling |
|---|---|
| Should writing questions (WRITE skill category) be included in the question bank for MVP? | Tentatively yes for fill_blank and drag_order types only. Free-text writing is excluded. Confirm during Phase 1 lesson authoring. |
| Should matching questions support image-based matching in MVP? | Deferred. Image delivery pipeline must be confirmed first. Text-based matching only for launch. |
| Should the question bank support multi-language UI (Arabic question stems)? | Out of scope for MVP. English-language questions with Arabic notes only. |
| What is the SLA for content review turnaround? | Open decision. Recommend 48-hour review SLA for draft → active. Define in team workflow documentation. |
| Should retired question IDs be preserved in a tombstone registry? | Open decision. Recommend yes, to prevent ID reuse and support audit trails. Defer to data model (P0-016). |

---

## Related Documents

- `docs/learning/english-skill-tree.md` — Canonical skill IDs all questions must reference
- `docs/learning/placement-test-strategy.md` — Placement eligibility requirements
- `docs/content/lesson-content-structure.md` — Practice block question requirements
- `docs/ai-teacher/behavior-rules.md` — AI Teacher uses question metadata for correction and hint delivery
- `docs/product/roles-and-permissions.md` — Who can author, review, and activate questions
- `docs/data/initial-data-model.md` (P0-016) — Question entity in the data model

---

## Acceptance Notes

- All three dependencies checked: P0-009, P0-010, P0-011 — all output files present and meaningful.
- This document covers question identity fields, all five question types with per-type rules, skill coverage minimums, difficulty alignment, authoring workflow, language level validation, versioning rules, AIM Engine tagging, and prohibited patterns.
- No runtime source code, database schemas, Flutter code, or backend API implementation was added.
- Task is ready to mark Done in Notion.
