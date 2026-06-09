# AIM Content Manager Journey

## Purpose

This document defines the AIM content manager journey for preparing, reviewing, publishing, and maintaining AIM lesson and question content.

It is the content workflow planning reference for post-MVP Phase 1 foundation work.

## Scope

This is Phase 0 planning documentation only.

This document does not implement:

- CMS runtime code.
- Backend runtime code.
- NestJS API code.
- FastAPI routes.
- Admin dashboard runtime code.
- Flutter Mobile code.
- React Web code.
- Database migrations.
- AIM Engine runtime code.
- AI Teacher Gateway runtime code.
- AI-generated content automation.
- A separate Student Web App.

Content management is an internal workflow. It is not a learner-facing app, parent-facing app, or Student Web App.

## Current Product Direction

| Area | Confirmed Direction |
|---|---|
| Completed MVP pilot learner interface | React Web |
| Completed MVP pilot backend API | FastAPI |
| Completed MVP pilot AIM Engine | Python backend AIM Engine |
| Completed MVP pilot database | Supabase PostgreSQL |
| Completed MVP pilot auth | Supabase Auth |
| Post-MVP Phase 1 learner client | Flutter Mobile |
| Post-MVP Phase 1 Backend API | NestJS + TypeScript |
| Post-MVP Phase 1 AIM Engine | Python AIM Engine as a backend service/module |
| Post-MVP Phase 1 database/auth | Supabase PostgreSQL/Auth unless changed by a later documented decision |
| Post-MVP Student Web App | No separate Student Web App is planned unless a later documented product decision changes this |

## Phase Clarification

The completed MVP pilot used React Web and FastAPI.

Post-MVP Phase 1 uses Flutter Mobile and NestJS + TypeScript.

Content manager workflows are internal admin/content workflows. They support content served to Flutter Mobile, completed React Web pilot context if referenced historically, and any approved future clients. They must not move AIM Engine logic into content tools.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for content, safety, and AIM/client guardrails. |
| P0-003 | `docs/product/roles-and-permissions.md` | Checked for content manager role boundaries. |
| P0-004 | `docs/product/mvp-scope.md` | Checked for completed pilot and post-MVP scope. |
| P0-004 | `docs/product/out-of-scope.md` | Checked for out-of-scope boundaries. |
| P0-007 | `docs/journeys/admin-journey.md` | Checked for admin/content routing workflow. |
| P0-009 | `docs/journeys/human-reviewer-journey.md` | Checked for review workflow boundaries. |
| P0-012 | `docs/content/lesson-content-structure.md` | Checked for lesson content requirements. |
| P0-013 | `docs/content/question-bank-standards.md` | Checked for question quality and metadata expectations. |
| P0-022 | `docs/security/ai-safety-privacy-rules.md` | Checked for safety and privacy rules. |

## Content Manager Role Summary

The content manager prepares English learning content for AIM learners. This role owns lesson structure, question metadata, content readiness, and content issue triage in coordination with reviewers, admins, and project owner.

The content manager does not own:

- learner mastery
- student level
- AIM recommendations
- runtime algorithm decisions
- retention calculations
- difficulty adaptation decisions
- AI provider configuration
- backend secrets
- learner private data by default

## Content Manager Journey Summary

```text
Sign in
-> Review content inventory
-> Draft or edit lesson
-> Add question metadata
-> Validate content readiness
-> Submit for review
-> Publish approved content
-> Monitor content issues
-> Revise through review path
```

## Content Manager Goals

| Goal | Phase 1 Foundation Support |
|---|---|
| Prepare learner-ready lessons | Maintain short lessons with examples, questions, and explanations. |
| Support AIM evidence | Add skill, concept, difficulty, prerequisite, and error tag metadata. |
| Improve quality | Route unclear or poor-quality questions through review. |
| Protect learner experience | Keep content beginner-friendly, supportive, and non-diagnostic. |
| Support reporting | Preserve stable content identifiers and metadata for analytics/reporting. |
| Support Flutter Mobile delivery | Ensure content is structured enough for mobile rendering. |
| Preserve backend AIM boundary | Provide metadata only; do not compute AIM outputs in content tools. |

## Journey Stages

| Stage | Content Manager Action | System Response | Boundary |
|---|---|---|---|
| Sign in | Logs into internal tool. | Backend verifies internal content role. | No privileged access without backend authorization. |
| Inventory review | Reviews lessons and questions. | Shows status, metadata completeness, and review state. | No learner private data needed by default. |
| Draft lesson | Creates or updates lesson plan. | Saves draft content. | Implementation later; Phase 0 only plans flow. |
| Add metadata | Tags skill, concept, difficulty, prerequisite, and common errors. | Marks metadata readiness. | Metadata supports AIM inputs but is not AIM logic. |
| Validate content | Checks required fields and safety language. | Shows missing fields or issues. | No clinical or diagnostic labels. |
| Submit review | Sends content to reviewer or project owner. | Tracks review state and notes. | Approval path must be clear before publishing. |
| Publish | Publishes approved content. | Makes content available through backend-approved delivery. | Publishing authority may require approval. |
| Monitor issues | Reviews question quality flags or admin reports. | Routes revisions through review path. | Avoid unreviewed live changes. |
| Revise content | Fixes approved issue. | Creates new version or update record. | Preserve versioning/audit trail. |

## Lesson Content Workflow

Each lesson should have:

- stable lesson ID
- title
- target skill
- target concept
- level or difficulty
- prerequisites
- short explanation
- examples
- guided practice
- independent practice
- practice questions
- answer choices where applicable
- correct answer
- learner-safe explanation
- common error tags
- language support notes for Arabic-speaking learners where useful
- publication status
- review status
- version
- author/reviewer metadata where implementation supports it

## Mobile Content Delivery Considerations

Content should be structured so Flutter Mobile can render:

- short readable sections
- examples
- question cards
- hints
- explanations
- AI Teacher hook points
- review/remediation content
- safe empty/error states
- offline-cache-friendly content where later approved

Content should not require Flutter Mobile to:

- infer skill metadata
- calculate difficulty
- calculate mastery
- choose remediation logic locally
- call AI providers directly
- inspect hidden AIM weights
- edit content at runtime

## Question Metadata Workflow

Question metadata should support AIM analysis and quality review.

| Metadata | Purpose |
|---|---|
| `skill_id` | Links attempt to skill state. |
| `concept_id` or concept label | Supports weakness and concept analysis. |
| Difficulty | Supports backend difficulty performance and adaptation. |
| Prerequisites | Supports prerequisite gap detection. |
| Common error tags | Supports error pattern classification. |
| Correct answer | Supports accuracy validation. |
| Choices | Supports multiple-choice display and analysis where used. |
| Explanation | Supports feedback and review. |
| Hint metadata | Supports guided practice if enabled. |
| Quality notes | Supports question quality review. |
| Version | Supports audit and historical reconstruction. |

## Review and Publishing Rules

Content should not be published unless:

- required metadata is complete
- explanations are clear for target learner level
- language is supportive and educational
- no clinical, medical, psychological, or diagnostic labels appear
- no shame-based wording appears
- skill and prerequisite mapping is plausible
- questions have unambiguous correct answers
- content has passed the agreed review path
- AI Teacher hook points are safe and lesson-scoped if included
- content can be rendered safely in Flutter Mobile

Publishing authority should be decided before implementation.

Until a publishing workflow is approved, default to approval required from project owner, approved content reviewer, or delegated internal role.

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
   - unsafe wording
   - AI Teacher hook issue
3. Decide whether the issue affects reports or analysis.
4. Draft a fix.
5. Route to review.
6. Publish only after approval.
7. Preserve version and audit trail.

## Content Versioning Rules

Content changes should preserve analysis quality.

- Published lessons/questions should have stable IDs.
- Edited content should increment version where implementation supports it.
- Reports and attempts should reference question/lesson version when possible.
- Live content changes should be controlled.
- Significant changes should go through review.
- Emergency fixes should be audit-logged.

## Content Manager Data Boundaries

Content managers may access:

- lesson drafts
- published lessons
- archived lessons
- question bank
- answer choices
- explanations
- metadata completeness status
- content review notes
- aggregated content quality signals
- question-level issue summaries
- de-identified examples if approved

Content managers must not access by default:

- raw learner private data
- full raw attempt logs
- other internal users' secrets
- AI provider keys
- backend credentials
- Supabase service role keys
- raw AIM audit logs unless explicitly approved for content quality review
- raw behavioral scores tied to identifiable learners

## Safety Rules

Content must:

- use beginner-friendly English where appropriate
- use educational and behavior-safe language only
- avoid shame, pressure, or learner labeling
- avoid clinical, medical, psychological, or diagnostic terms
- avoid implying speed equals mastery
- avoid implying slow answers mean low ability
- include explanations that help learners recover from mistakes
- avoid cultural or regional assumptions that could confuse learners
- remain appropriate for younger learners if minors are allowed

## AI Teacher Hook Rules

If a lesson or block includes an AI Teacher hook:

- The hook must be lesson-scoped.
- The hook must specify the skill and context.
- The hook must not pass unnecessary learner identity data.
- The hook must not expose correct answer directly when guided retry is intended.
- The hook must route through backend-only AI Teacher Gateway.
- The hook must not require Flutter Mobile to call an AI provider directly.
- The hook must use safe prompt constraints defined by AI Teacher behavior rules.

## Non-Goals

This document does not:

- Implement a CMS.
- Create backend runtime code.
- Create NestJS API code.
- Create FastAPI routes.
- Create database migrations.
- Create a Student Web App.
- Create Flutter Mobile code.
- Create React Web code.
- Move AIM Engine logic into a client or content tool.
- Automate AI-generated content.
- Define final visual design.
- Define final localization/copywriting strategy.

## Assumptions

- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- Target early content focuses on A1 English for Arabic-speaking learners.
- Content is curated and reviewed before broad learner use.
- Content metadata is required for meaningful AIM analysis.
- Content changes during live use should be controlled to preserve analysis quality.
- Full CMS sophistication can be deferred until after Phase 1 foundation work.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.
- Phase 0 remains documentation/planning only.

## Open Questions

| Question | Current Handling |
|---|---|
| Who has final publish authority for Phase 1 content? | Default to approval required; finalize in admin/reviewer planning. |
| Are content changes allowed during active learning periods? | Allow only reviewed fixes for material issues. |
| How many lessons are required for first Phase 1 seed content? | Content planning should narrow the seed target. |
| Should content managers see learner examples for question issues? | Prefer aggregated/de-identified examples unless privacy planning approves more. |
| Should AI-assisted content drafting be allowed later? | Not in Phase 0; requires separate safety/review workflow. |
| What localization strategy is required for Arabic-speaking learners? | Defer to content and UI planning. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/journeys/admin-journey.md`
- `docs/journeys/human-reviewer-journey.md`
- `docs/journeys/student-journey.md`
- `docs/admin/admin-dashboard-sitemap.md`
- `docs/content/lesson-content-structure.md`
- `docs/content/question-bank-standards.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/security/ai-safety-privacy-rules.md`
- `docs/data/initial-data-model.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-001, P0-003, P0-004, P0-007, P0-009, P0-012, P0-013, and P0-022.
- This document has a title, purpose, scope, current product direction, content manager journey, workflows, boundaries, assumptions, non-goals, and open questions.
- Content manager scope is internal only.
- Completed MVP pilot stack and post-MVP Phase 1 target stack are separated.
- React Web is described as the completed MVP pilot learner interface.
- FastAPI is tied only to the completed MVP pilot backend API.
- Flutter Mobile is described as the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is described as the post-MVP Phase 1 Backend API.
- AIM Engine remains Python/backend-owned.
- AI Teacher Gateway remains backend-only.
- AI provider keys and privileged backend credentials remain backend/server-only.
- Client boundaries remain strict everywhere.
- Speed remains educational behavior evidence only and does not directly affect mastery, student level, or direct difficulty increase.
- Learner behavior language remains educational, non-clinical, non-medical, and non-diagnostic.
- No separate Student Web App is planned for post-MVP unless a later documented decision changes this.
- No runtime source code, Student Web App, Flutter AIM logic, CMS implementation, database migration, or backend implementation was added.
