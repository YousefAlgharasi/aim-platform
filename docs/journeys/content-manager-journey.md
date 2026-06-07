# AIM Content Manager Journey

## Purpose

This document defines the MVP content manager journey for preparing, reviewing, publishing, and maintaining AIM lesson and question content.

## Scope

This is Phase 0 planning documentation for content workflows. It does not implement a CMS, backend APIs, admin dashboard runtime code, database migrations, Flutter code, Student Web App code, or AIM Engine code.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-003 | `docs/product/roles-and-permissions.md` | Checked locally and present. |
| P0-004 | `docs/product/mvp-scope.md` | Checked locally and present. |
| P0-004 | `docs/product/out-of-scope.md` | Checked locally and present. |

## Content Manager Role Summary

The content manager prepares A1 English learning content for Arabic-speaking pilot learners. This role owns lesson structure, question metadata, content readiness, and content issue triage in coordination with reviewers and pilot admins.

The content manager does not own learner mastery, AIM recommendations, or runtime algorithm decisions.

## Content Manager Journey Summary

```text
Sign in -> Review content inventory -> Draft or edit lesson
-> Add question metadata -> Validate content readiness
-> Submit for review -> Publish approved content
-> Monitor content issues -> Revise through review path
```

## Content Manager Goals

| Goal | MVP Support |
|---|---|
| Prepare pilot lessons | Maintain short A1 lessons with examples, questions, and explanations. |
| Support AIM evidence | Add skill, concept, difficulty, prerequisite, and error tag metadata. |
| Improve quality | Route unclear or poor-quality questions through review. |
| Protect learner experience | Keep content beginner-friendly, supportive, and non-diagnostic. |
| Support pilot analysis | Preserve stable content identifiers and metadata for reporting. |

## Journey Stages

| Stage | Content Manager Action | System Response | Boundary |
|---|---|---|---|
| Sign in | Logs into internal tool. | Backend verifies internal content role. | No privileged access without authorization. |
| Inventory review | Reviews lessons and questions. | Shows status, metadata completeness, and review state. | No learner private data needed by default. |
| Draft lesson | Creates or updates lesson plan. | Saves draft content. | Planning only in Phase 0; implementation later. |
| Add metadata | Tags skill, concept, difficulty, prerequisite, and common errors. | Marks metadata readiness. | Metadata must support AIM Engine inputs. |
| Validate content | Checks required fields and safety language. | Shows missing fields or issues. | No clinical or diagnostic labels. |
| Submit review | Sends content to reviewer or project owner. | Tracks review state and notes. | Approval path must be clear before publishing. |
| Publish | Publishes approved pilot content. | Makes content available to assigned learners. | Publishing authority may require approval. |
| Monitor issues | Reviews question quality flags or admin reports. | Routes revisions through review path. | Avoid unreviewed live changes during pilot. |

## Lesson Content Workflow

Each MVP lesson should have:

- Stable lesson ID.
- Title.
- Target skill and concept.
- Short A1 explanation.
- Examples.
- Practice questions.
- Choices where applicable.
- Correct answer.
- Explanation.
- Difficulty.
- Prerequisites.
- Common error tags.
- Language support notes for Arabic-speaking learners where useful.
- Publication status.
- Review status.

## Question Metadata Workflow

Question metadata should support AIM analysis:

| Metadata | Purpose |
|---|---|
| `skill_id` | Links attempt to skill state. |
| Concept | Supports weakness and concept analysis. |
| Difficulty | Supports difficulty performance and adaptation. |
| Prerequisites | Supports prerequisite gap detection. |
| Common error tags | Supports error pattern classification. |
| Correct answer | Supports accuracy. |
| Choices | Supports multiple-choice display and analysis where used. |
| Explanation | Supports feedback and review. |
| Quality notes | Supports question quality review. |

## Review and Publishing Rules

Content should not be published unless:

- Required metadata is complete.
- Explanations are clear for A1 learners.
- Language is supportive and educational.
- No clinical or diagnostic labels appear.
- Skill and prerequisite mapping is plausible.
- Questions have unambiguous correct answers.
- Content has passed the agreed review path.

Publishing authority should be decided before implementation. Until then, default to approval required from the project owner, pilot admin, or assigned reviewer.

## Content Issue Workflow

When content is flagged:

1. Identify the lesson/question ID.
2. Classify issue type:
   - unclear wording
   - incorrect answer
   - missing metadata
   - difficulty mismatch
   - prerequisite mismatch
   - repeated learner confusion
   - poor question quality signal
3. Decide whether the issue affects pilot analysis.
4. Draft a fix.
5. Route to review.
6. Publish only after approval.

## Content Manager Data Boundaries

Content managers may access:

- Lesson drafts.
- Question banks.
- Metadata completeness status.
- Content review notes.
- Aggregated content quality signals.
- Question-level issue summaries.

Content managers must not access by default:

- Raw learner private data.
- Other internal users' secrets.
- AI provider keys.
- Backend credentials.
- Raw AIM audit logs unless explicitly approved for content quality review.

## Safety Rules

Content must:

- Use beginner-friendly English.
- Use educational and behavioral language only.
- Avoid shame, pressure, or learner labeling.
- Avoid clinical, medical, or diagnostic terms.
- Avoid implying speed equals mastery.
- Include explanations that help the learner recover from mistakes.

## Non-Goals

- This document does not implement a CMS.
- This document does not create backend runtime code.
- This document does not create database migrations.
- This document does not create a Student Web App.
- This document does not create Flutter code.
- This document does not move AIM Engine logic into a client or content tool.
- This document does not automate AI-generated content.

## Assumptions

- MVP content focuses on A1 English for Arabic-speaking learners.
- Content is curated and reviewed before pilot use.
- Content metadata is required for meaningful AIM analysis.
- Content changes during pilot should be controlled to preserve analysis quality.
- Full CMS sophistication can be deferred until after pilot validation.

## Open Questions

| Question | Current Handling |
|---|---|
| Who has final publish authority for MVP content? | Default to approval required; finalize in admin/reviewer planning. |
| Are content changes allowed during the two-week pilot? | Allow only reviewed fixes for material issues. |
| How many lessons are final for MVP? | Content planning should narrow the six-to-ten lesson target. |
| Should content managers see learner examples for question issues? | Prefer aggregated/de-identified examples unless privacy planning approves more. |

## Related Documents

- `docs/product/roles-and-permissions.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/journeys/admin-journey.md`
- `docs/journeys/student-journey.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-003 and P0-004.
- This document has a title, purpose, scope, content manager journey, workflows, boundaries, assumptions, non-goals, and open questions.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.

