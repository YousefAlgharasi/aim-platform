# AIM Lesson Content Structure

## Purpose

This document defines the structure of a lesson in the AIM platform, including required fields, content block types, practice block types, AI Teacher hook points, and metadata requirements. It is the canonical reference for content authors, backend engineers, and the AIM Engine when building, serving, and evaluating lessons.

## Scope

Phase 0 planning documentation only. No backend code, Flutter code, database schemas, or AIM Engine runtime logic is implemented here. All skill IDs reference `docs/learning/english-skill-tree.md` (P0-009).

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-009 | `docs/learning/english-skill-tree.md` | Present. Full 70-skill A1 tree with skill IDs, categories, difficulty levels. |

---

## Lesson Identity Fields

Every lesson must have the following identity fields. These are stored in the backend and consumed by the AIM Engine and the Flutter app.

| Field | Type | Required | Description |
|---|---|---|---|
| `lesson_id` | string | Yes | Unique stable identifier. Format: `LES-{language}-{level}-{sequence}`. Example: `LES-EN-A1-001`. |
| `title` | string | Yes | Short human-readable title for display in the app. Max 60 characters. |
| `language` | string | Yes | Language being taught. MVP: `EN` (English). |
| `cefr_level` | string | Yes | CEFR level. MVP: `A1`. |
| `lesson_type` | enum | Yes | One of: `intro`, `skill`, `review`, `remediation`. See Lesson Types below. |
| `primary_skill_ids` | array[string] | Yes | One to three skill IDs from the English skill tree that this lesson primarily teaches. |
| `supporting_skill_ids` | array[string] | No | Additional skill IDs reinforced in this lesson but not the primary focus. |
| `difficulty` | int (1–4) | Yes | Lesson difficulty aligned to the skill tree difficulty scale. Derived from primary_skill_ids. |
| `estimated_duration_minutes` | int | Yes | Estimated time to complete the lesson. Typical range: 5–15 minutes for MVP. |
| `prerequisite_lesson_ids` | array[string] | No | Lesson IDs that should be completed before this lesson is served. Used by AIM Engine scheduling. |
| `version` | int | Yes | Content version. Starts at 1. Incremented on significant content changes. |
| `status` | enum | Yes | One of: `draft`, `review`, `active`, `archived`. Only `active` lessons are served to students. |
| `created_by` | string | Yes | Content author identifier. |
| `last_updated_at` | datetime | Yes | ISO 8601 UTC timestamp of last content update. |

---

## Lesson Types

| Type | Description | When Served |
|---|---|---|
| `intro` | Introduces a new skill concept for the first time. Includes explanation, examples, and light practice. | When a student encounters a skill with mastery = 0 for the first time. |
| `skill` | Focused practice on a specific skill after introduction. Heavier practice block, less explanation. | When a student has seen the skill but mastery < threshold. |
| `review` | Reviews multiple previously learned skills. Tests retention across skill clusters. | Scheduled periodically by AIM Engine based on retention signals. |
| `remediation` | Targets a specific skill weakness identified by the AIM Engine. Short, focused, low-friction. | Triggered when weakness_score exceeds threshold for a skill. |

---

## Lesson Block Architecture

A lesson is composed of an ordered sequence of blocks. Each block has a type, content, and optional AI Teacher hook. Blocks are served in order; the AIM Engine may skip or reorder blocks based on student state in future phases (post-MVP).

```
Lesson
├── [required] Lesson Header
├── [1–3 blocks] Content Blocks
├── [2–5 blocks] Practice Blocks
├── [optional] Remediation Block
└── [required] Lesson Close
```

### Block Types

#### 1. Lesson Header Block

Displayed at the start of every lesson. Not scored.

| Field | Type | Description |
|---|---|---|
| `block_type` | string | Always `header` |
| `lesson_goal` | string | One sentence describing what the student will learn. Shown to student in Arabic and English. |
| `skill_preview` | array[string] | Skill IDs being covered. Used by the app to display skill badges. |
| `motivation_hook` | string | Optional short motivational sentence shown before lesson begins. Max 100 characters. |

---

#### 2. Explanation Block

Delivers new concept or rule. Instructional content only, no questions.

| Field | Type | Description |
|---|---|---|
| `block_type` | string | Always `explanation` |
| `skill_id` | string | The skill this explanation targets |
| `explanation_text` | string | The core explanation in English. Markdown supported for bold/italic/lists. |
| `arabic_note` | string | Optional clarification in Arabic for Arabic-speaking learners. Used for phonics differences, grammar transfer notes. |
| `examples` | array[object] | 2–4 example items. Each example has `english` (string) and optional `arabic_translation` (string). |
| `visual_aid_ref` | string | Optional reference to an image or illustration key. Actual assets managed separately. |
| `ai_teacher_hook` | enum | One of: `none`, `explain_more`, `give_example`. If set, the AI Teacher can be triggered here by the student. |

---

#### 3. Demonstration Block

Shows a worked example or mini-dialogue before practice. Bridges explanation and practice.

| Field | Type | Description |
|---|---|---|
| `block_type` | string | Always `demonstration` |
| `skill_id` | string | Skill being demonstrated |
| `demo_type` | enum | One of: `worked_example`, `mini_dialogue`, `visual_match` |
| `content` | object | Type-specific content. See Demo Content Schemas below. |
| `ai_teacher_hook` | enum | One of: `none`, `explain_step` |

**Demo Content Schemas:**

| demo_type | Content Fields |
|---|---|
| `worked_example` | `steps`: array of {`instruction`: string, `result`: string} |
| `mini_dialogue` | `turns`: array of {`speaker`: enum[teacher, student], `text`: string} |
| `visual_match` | `items`: array of {`label`: string, `image_ref`: string} |

---

#### 4. Practice Block (Question Block)

Delivers a single practice question. Each practice block contains exactly one question.

| Field | Type | Description |
|---|---|---|
| `block_type` | string | Always `practice` |
| `question_id` | string | Reference to a question from the question bank. |
| `skill_id` | string | Skill being practiced |
| `question_type` | enum | MCQ, true_false, matching, fill_blank, drag_order |
| `question_text` | string | The question prompt shown to the student |
| `options` | array[string] | Answer options for MCQ and true_false |
| `correct_answer` | string or array | Correct answer key. Not exposed to client app. Backend-only. |
| `distractor_notes` | string | Author note explaining why each wrong answer was chosen. Not shown to student. |
| `hint` | string | Optional hint shown if student hesitates > 15 seconds or explicitly requests help |
| `feedback_correct` | string | Short feedback shown on correct answer. Max 80 characters. |
| `feedback_incorrect` | string | Short feedback shown on incorrect answer. Max 120 characters. Includes the correct answer. |
| `ai_teacher_hook` | enum | One of: `none`, `explain_why`, `retry_with_help` |
| `attempt_weight` | float (0–1) | Weight of this practice question toward lesson mastery signal. Default 1.0. Reduced for hint-assisted attempts. |

**Question types allowed in lessons (vs placement):**

| Type | Lessons | Notes |
|---|---|---|
| MCQ (4 options) | Yes | Primary type |
| True / False | Yes | Simple grammar checks |
| Matching | Yes | Vocabulary |
| Fill blank | Yes | Short word or phrase only, not free text |
| Drag and order | Yes | Word order (GRA-020 focus) |
| Free text (open) | No | Excluded from MVP. Not auto-scorable reliably. |

---

#### 5. Remediation Block

Optional block inserted by AIM Engine when a student fails 2+ practice blocks on the same skill in the same lesson. Provides a simplified re-explanation and a single easier practice question.

| Field | Type | Description |
|---|---|---|
| `block_type` | string | Always `remediation` |
| `skill_id` | string | Skill to remediate |
| `simplified_explanation` | string | Shorter, simpler version of the explanation block content |
| `arabic_clarification` | string | Arabic-language clarification for common error patterns |
| `remediation_question_id` | string | A difficulty-1 question for the same skill. Must be different from the questions already served. |
| `ai_teacher_hook` | enum | Always `retry_with_help` for remediation blocks |

---

#### 6. Lesson Close Block

Displayed at the end of every lesson. Not scored.

| Field | Type | Description |
|---|---|---|
| `block_type` | string | Always `close` |
| `summary_points` | array[string] | 1–3 bullet points summarizing what was learned |
| `skills_covered` | array[string] | Skill IDs covered in this lesson, echoed for AIM Engine logging |
| `next_lesson_preview` | string | Optional one-sentence hint about the next lesson |
| `xp_awarded` | int | Experience points awarded for lesson completion. Used for gamification in app. |

---

## AI Teacher Hook Points

The AI Teacher is an optional in-lesson assistant. In MVP, it is text-based. The following hook types define when and how the AI Teacher can be invoked:

| Hook Type | Triggered By | Behavior |
|---|---|---|
| `explain_more` | Student taps "Explain more" on an explanation block | AI Teacher provides an additional explanation of the concept in simpler terms. |
| `give_example` | Student taps "Give me another example" | AI Teacher generates one more example using the same pattern. |
| `explain_step` | Student taps on a demonstration step | AI Teacher narrates the step in plain language. |
| `explain_why` | Student answers incorrectly on a practice block | AI Teacher explains why the correct answer is correct. Does not simply repeat the feedback string. |
| `retry_with_help` | Student requests help mid-practice, or remediation block is triggered | AI Teacher walks the student through the question step by step before they retry. |

**AI Teacher Constraints (from Phase 0 rules):**
- AI Teacher operates in the lesson context only. It cannot answer questions unrelated to the current skill.
- AI Teacher behavior is educational, not clinical. It does not diagnose learning disabilities.
- AI provider keys are never exposed to the Flutter client. All AI Teacher calls are proxied through the backend.
- AI Teacher responses are capped at 150 words per response in MVP to control latency and cost.

---

## Lesson Metadata for AIM Engine

The AIM Engine requires the following metadata from each completed lesson to update student skill states:

| Field | Type | Description |
|---|---|---|
| `lesson_id` | string | Identifier of the completed lesson |
| `student_id` | string | Student identifier |
| `started_at` | datetime | ISO 8601 UTC |
| `completed_at` | datetime | ISO 8601 UTC |
| `completion_status` | enum | One of: `completed`, `abandoned`, `partial` |
| `practice_results` | array[object] | Per-practice-block result: `{question_id, skill_id, correct, attempts, time_seconds, hint_used, ai_teacher_invoked}` |
| `remediation_triggered` | bool | Whether a remediation block was served |
| `ai_teacher_invocations` | int | Total number of AI Teacher hook calls during the lesson |
| `total_time_seconds` | int | Wall time from lesson start to close |

This metadata contract will be finalized in P0-015 (Data Captured During Learning Session). The fields listed here are the minimum needed to update mastery, confidence, attempts, avg_speed, and frustration_score in the StudentSkillState model.

---

## Lesson Sequence Rules

These rules govern how the AIM Engine selects and orders lessons for a student:

| Rule | Detail |
|---|---|
| Prerequisite enforcement | A lesson is only served if all `prerequisite_lesson_ids` have `completion_status = completed` in the student's history. |
| Skill state gating | An `intro` lesson for a skill is only served when the skill's mastery = 0 and the student has not previously seen the skill. |
| Remediation priority | If a student's `weakness_score` for a skill exceeds 0.7, the AIM Engine schedules a `remediation` lesson for that skill ahead of new content. |
| Review scheduling | A `review` lesson covering skill clusters is inserted every 5 new lessons or when retention signals drop below 0.4. |
| Session length cap | The AIM Engine will not schedule more than 3 lessons per session in MVP. |
| Abandonment handling | If `completion_status = abandoned`, the lesson is rescheduled. The AIM Engine does not advance to the next lesson until the current one is completed or marked skipped by admin. |

---

## Content Authoring Constraints

| Constraint | Rule |
|---|---|
| Primary skills per lesson | 1 to 3 skill IDs maximum |
| Practice blocks per lesson | 2 minimum, 5 maximum in MVP |
| Explanation blocks per lesson | 1 minimum, 3 maximum |
| Total blocks per lesson | 4 minimum, 12 maximum |
| Question uniqueness | No question ID may appear more than once in the same lesson |
| Skill coverage | Every practice block must reference a skill ID present in `primary_skill_ids` or `supporting_skill_ids` |
| Arabic content | Every lesson must include at least one `arabic_note` in an explanation block for the MVP A1 Arabic-speaker pilot |
| Image references | Image refs are string keys resolved by the asset pipeline. Content authors do not store image binary in lesson JSON. |

---

## Assumptions

- Lessons are stored as structured JSON documents in the backend. The JSON schema will be defined in Phase 1 based on this planning doc.
- Lesson content is authored by content managers through the admin dashboard, not generated by AI, in MVP.
- AI-generated lesson content is a post-MVP feature.
- The lesson block order is fixed in MVP. Dynamic reordering by the AIM Engine is a Phase 2 capability.
- All skill IDs in lessons must exist in `docs/learning/english-skill-tree.md`. Orphaned skill IDs are a validation error at content authoring time.

---

## Open Questions

| Question | Current Handling |
|---|---|
| Should a lesson be able to target Writing skills in MVP? | Tentatively yes, with fill-blank and drag-order questions. Writing from scratch (free text) is excluded. Confirm during P0-012 question bank standards. |
| Should the AI Teacher hook `retry_with_help` count as a new attempt or the same attempt? | Open decision. Recommend: same attempt, but with a `hint_used = true` flag. Defer to P0-013 (AI Teacher Behavior Rules). |
| Should explanation blocks support embedded audio for phonics skills? | Deferred. Audio delivery is not confirmed for MVP pilot. If confirmed, audio_ref field should be added to explanation blocks. |
| What is the XP formula for lesson completion? | Open decision. Defer to gamification design. Placeholder: base 10 XP + 2 XP per correct practice answer. |
| Should remediation blocks be authored manually or auto-generated by AI? | MVP: manually authored. AI generation is post-MVP. |

---

## Related Documents

- `docs/learning/english-skill-tree.md` — Canonical skill ID source
- `docs/product/mvp-scope.md` — MVP scope governing lesson complexity limits
- `docs/journeys/student-journey.md` — Student flow in which lessons appear
- `docs/learning/placement-test-strategy.md` — Placement test output that determines first lesson served
- `docs/content/question-bank-standards.md` (P0-012) — Question authoring standards referenced by practice blocks
- `docs/ai-teacher/behavior-rules.md` (P0-013) — AI Teacher behavior spec for hook types defined here
- `docs/aim-engine/boundary-and-io-contract.md` (P0-014) — AIM Engine contract that consumes lesson metadata
- `docs/data/session-data-capture.md` (P0-015) — Full event data captured during a lesson session

---

## Acceptance Notes

- Dependency checked: P0-009 (`docs/learning/english-skill-tree.md`) is present and meaningful.
- This document covers lesson identity fields, lesson types, full block architecture (header, explanation, demonstration, practice, remediation, close), AI Teacher hook points and constraints, AIM Engine metadata contract, lesson sequence rules, and content authoring constraints.
- No runtime source code, Student Web App, Flutter AIM logic, database migrations, or backend API implementation was added.
- Task is ready to mark Done in Notion.
