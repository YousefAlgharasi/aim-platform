# AIM Human Reviewer Journey

## Purpose

This document defines the AIM human reviewer journey for reviewing content quality, AI Teacher behavior samples, disputed learning results, safety flags, AIM recommendation audit samples, and review queue behavior.

It is the human review workflow planning reference for post-MVP Phase 1 foundation work.

## Scope

This is Phase 0 planning documentation only.

This document does not implement:

- Reviewer dashboard runtime code.
- Backend runtime code.
- NestJS API code.
- FastAPI routes.
- Flutter Mobile code.
- React Web code.
- Database migrations.
- AIM Engine runtime code.
- AI Teacher Gateway runtime code.
- A separate Student Web App.

The human reviewer journey describes internal quality and safety review only. It does not create learner-facing authority, parent-facing authority, or runtime AIM decision authority.

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

The reviewer workflow is an internal operations/review workflow. It must not be confused with a learner client, parent client, or Student Web App.

Human reviewers do not run, modify, or override AIM Engine logic during live learner sessions.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for AIM/client/safety guardrails. |
| P0-003 | `docs/product/roles-and-permissions.md` | Checked for reviewer role boundaries. |
| P0-004 | `docs/product/mvp-scope.md` | Checked for completed pilot and post-MVP scope. |
| P0-004 | `docs/product/out-of-scope.md` | Checked for out-of-scope boundaries. |
| P0-007 | `docs/journeys/admin-journey.md` | Checked for review routing and admin boundaries. |
| P0-008 | `docs/journeys/content-manager-journey.md` | Checked for content correction workflow. |
| P0-019 | `docs/admin/admin-dashboard-sitemap.md` | Checked for review queue/admin surface alignment. |
| P0-022 | `docs/security/ai-safety-privacy-rules.md` | Checked for learner-safe and privacy rules. |

## Reviewer Role Summary

The human reviewer is an internal subject-matter or quality reviewer who evaluates content quality, AI Teacher behavior examples, AIM recommendation audit samples, disputed learning results, and safety flags.

The reviewer exists to maintain:

- educational safety
- content accuracy
- question quality
- learner-safe feedback
- AIM behavior reliability
- review traceability

The reviewer is not:

- an AIM Engine authority
- a live-session override authority
- a direct database editor
- a secret manager
- a learner support admin by default
- a content publisher by default

Review notes and flags inform future content, support, and algorithm review decisions. They must not retroactively change learner session results without an explicit approved backend workflow.

## Reviewer Journey Summary

```text
Sign in
-> Open review queue
-> Select flagged item or audit sample
-> Evaluate content, feedback, or recommendation quality
-> Record judgment and notes
-> Suggest correction or escalation
-> Close review item
-> Support quality analysis
```

## Reviewer Goals

| Goal | Phase 1 Foundation Support |
|---|---|
| Ensure content quality | Review lesson and question accuracy, language suitability, and metadata completeness. |
| Audit AIM behavior | Inspect sampled adaptive results, recommendation distributions, and decision patterns. |
| Resolve flagged items | Evaluate items flagged by admin, learner, or automated quality signal. |
| Maintain learning safety | Confirm feedback and recommendations remain educational and non-diagnostic. |
| Provide improvement input | Document suggestions for content corrections and AIM behavior refinement. |
| Preserve privacy | Use only the minimum learner context needed for review. |
| Preserve traceability | Record notes, decision, timestamp, and reviewer identity. |

## Journey Stages

| Stage | Reviewer Action | System Response | Boundary |
|---|---|---|---|
| Sign in | Reviewer logs in with internal account. | Backend verifies reviewer role. | No privileged access without backend authorization. |
| Review queue | Opens assigned review queue. | Shows open flagged items and audit samples sorted by priority and age. | Scoped to assigned or unowned review items only. |
| Item selection | Selects an item to review. | Opens item detail: content, result, safe summary, flag reason, and context. | Reviewer sees only needed context. |
| Content review | Evaluates lesson or question quality and metadata. | Shows question text, skill tag, difficulty, prerequisites, correct answer, explanation, and tags. | Reviewer suggests corrections but does not publish by default. |
| AI Teacher review | Evaluates AI Teacher response sample. | Shows approved scoped context and response text. | Reviewer does not see provider keys or unnecessary prompts/secrets. |
| AIM audit review | Inspects sampled adaptive result. | Shows attempt evidence summary, AIM recommendation, conflict outcome, and safe explanation reference. | Reviewer does not alter algorithm parameters or live logic. |
| Dispute review | Evaluates learner-reported or admin-routed issue. | Shows flagged session summary, safe evidence, and escalation reason. | Judgment is recorded as review note, not runtime override. |
| Record judgment | Adds review decision and notes. | Saves with timestamp and reviewer identity. | Notes are internal and auditable. |
| Suggest correction | Submits content correction suggestion or AIM issue note. | Routes suggestion to content manager, admin, or project owner. | Final publish/change authority follows approved workflow. |
| Close review item | Marks item reviewed and closes queue entry. | Item moves to closed state with judgment preserved. | Audit trail is retained. |
| Analysis support | Reviews quality metrics and flag distribution. | Shows review throughput and issue patterns. | Reports remain educational and non-diagnostic. |

## Review Item Types

| Item Type | Trigger | Reviewer Action |
|---|---|---|
| Content quality flag | Admin, content manager, or automated signal detects potential issue with question or lesson. | Evaluate accuracy, language suitability, metadata completeness, and recommend correction if needed. |
| AI Teacher behavior flag | AI Teacher response or hook is flagged for safety, quality, or lesson-scope issue. | Evaluate wording, answer leakage, tone, and policy compliance. |
| AIM audit sample | Randomly or systematically sampled adaptive result for quality assurance. | Inspect recommendation type, evidence quality, and compliance with behavioral rules. |
| Disputed result | Learner or admin questions grading/result. | Review relevant attempt/session evidence and record judgment. |
| Safety signal | Feedback phrase or behavioral label may be clinical, harmful, or privacy-sensitive. | Confirm safe language or flag for correction. |
| Content metadata issue | Missing or wrong skill, prerequisite, difficulty, or error tag. | Recommend metadata correction. |
| Report/export issue | Report appears to expose too much detail or unsafe wording. | Flag privacy/safety issue and recommend correction. |

## Review Queue Rules

- Items enter the queue via admin triage, content workflow, automated quality signals, or learner dispute reports.
- Safety signals are prioritized first.
- Disputed results are prioritized before routine audit samples.
- Reviewer must not close an item without recording a judgment and note.
- If reviewer cannot make a judgment, they must escalate instead of silently closing.
- Duplicate review items for the same object should be deduplicated before routing.
- Review queues should preserve assignment, status, severity, timestamp, and decision history.
- Raw private learner data should be minimized in queue views.
- Review notes are internal and must not be shown directly to learners or parents unless explicitly transformed into learner-safe language.

## High-Stakes Results and Disputes

High-stakes review applies when:

- A learner reports a grading result they believe is incorrect.
- An AIM recommendation results in an unexpected difficulty or review path that learner/admin questions.
- An automated signal detects unusual outcome cluster for a question or session.
- A content issue may have affected learner result.
- AI Teacher feedback may have been unsafe, misleading, or answer-leaking.

In these cases:

- Reviewer inspects only necessary evidence.
- Reviewer checks the correct answer definition.
- Reviewer checks content metadata.
- Reviewer checks learner-safe explanation and recommendation.
- Reviewer records a judgment note.
- If content is wrong, reviewer submits correction suggestion.
- If AIM behavior appears incorrect, reviewer documents case for algorithm/backend review.
- Reviewer does not alter live session data or retroactively change learner scores without approved backend workflow.
- Any approved correction must be audit-logged.

## Content Quality Standards for Review

Reviewed content must meet these criteria:

- Question text is grammatically correct.
- Question text is appropriate for target learner level.
- Skill tag is present and matches the question domain.
- Difficulty level is assigned and defensible.
- Prerequisite skill IDs are listed where applicable.
- Correct answer is marked and confirmed correct.
- Distractors are plausible but clearly incorrect.
- Explanation is present, clear, and accurate.
- Common error tags are assigned where meaningful.
- Language notes for Arabic-speaking learners are included where helpful.
- No shame-based wording appears.
- No clinical, medical, psychological, or diagnostic language appears in feedback.
- Content can be rendered safely in Flutter Mobile.

## AI Teacher Review Standards

Reviewed AI Teacher samples must conform to:

- response stays within lesson scope
- response uses safe educational tone
- response does not ask unnecessary personal questions
- response does not expose backend secrets or provider traces
- response does not leak direct answer where guided retry is intended
- response does not use clinical, medical, or diagnostic claims
- response does not shame learner
- response supports understanding, not engagement maximization
- response can be safely shown in Flutter Mobile

## AIM Behavior Review Standards

Reviewed AIM audit samples must conform to:

- Recommendation type matches approved backend output categories.
- Recommendation is consistent with attempt evidence and reliability.
- Mastery and difficulty direction are defensible from approved evidence.
- Speed data does not raise mastery, student level, or difficulty directly.
- Response time is treated as educational behavior evidence only.
- Behavioral labels in feedback use educational language only.
- No clinical, medical, psychological, or diagnostic language is present.
- Fairness/quality signal is present where required.
- Conflict resolution outcome is logged and traceable.
- Client did not calculate or override AIM output.

## Reviewer Boundaries

Reviewer must not:

- Override live AIM algorithm decisions or parameters.
- Access student personal data beyond what is necessary for review item.
- Publish content corrections without approved process.
- Change learner progress, mastery, difficulty, retention, recommendation, or session result directly.
- Share review notes or flagged session details outside authorized internal team.
- Perform clinical interpretation or diagnosis of learner behavior.
- Expose raw behavior scores to learners or parents.
- Access AI provider keys.
- Access Supabase service role keys.
- Access backend credentials.
- Use reviewer workflow as a general admin/support workflow.

Reviewer is not responsible for:

- Operating learner accounts.
- Managing parent links.
- Creating content from scratch by default.
- Publishing content by default.
- Approving platform scope decisions.
- Editing AIM Engine code.
- Running AIM Engine locally or client-side.

## Reviewer Data Boundaries

| Data Category | Reviewer Access | Rule |
|---|---|---|
| Content text | Yes | Needed for content quality review. |
| Question metadata | Yes | Needed for skill/difficulty/prerequisite validation. |
| Attempt summary | Scoped | Only when needed for dispute or AIM audit review. |
| Learner identity | Minimized | Use references or de-identified context where possible. |
| AIM output summary | Scoped | Needed for recommendation review. |
| Raw behavior scores | Restricted | Avoid unless necessary; never expose to learner/parent. |
| AI Teacher response sample | Scoped | Needed for safety/quality review. |
| Provider keys/secrets | No | Server-only. |
| Audit logs | Scoped | Access only relevant review/audit references. |

## Escalation Rules

Reviewer escalates when:

- Safety language is unclear or potentially harmful.
- Content correction affects many learners.
- AIM behavior appears systematically wrong.
- A dispute may require learner-facing correction.
- Evidence is insufficient for judgment.
- Data privacy issue is suspected.
- AI Teacher output suggests provider/prompt safety issue.
- Review item requires product owner decision.

Escalation target depends on issue:

| Issue | Escalation Target |
|---|---|
| Content correction | Content Manager / Project Owner |
| AIM behavior issue | Project Owner / Backend-AIM owner |
| Privacy issue | Project Owner / Security owner |
| Admin workflow issue | Pilot Admin / Project Owner |
| AI Teacher safety issue | Project Owner / AI safety owner |
| Learner dispute requiring response | Pilot Admin / Project Owner |

## Non-Goals

This document does not:

- Implement a reviewer dashboard.
- Create backend runtime code.
- Create NestJS API code.
- Create FastAPI routes.
- Create database migrations.
- Create Flutter Mobile code.
- Create React Web code.
- Create a Student Web App.
- Move AIM Engine logic into a client or reviewer UI.
- Give reviewers live AIM override authority.
- Define final legal/privacy review workflow.
- Define final staffing model.

## Assumptions

- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- Review queue is internal tooling and may share admin dashboard shell.
- Audit samples are drawn from session results by backend/admin tooling, not directly by reviewer.
- Review throughput is expected to be low during early foundation/pilot-style operation.
- All review notes are stored and accessible only to authorized internal roles.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.
- Phase 0 remains documentation/planning only.

## Open Questions

| Question | Current Handling |
|---|---|
| What is the target audit sample rate? | To be defined in operations planning; suggested starting range is 1% to 5% of sessions. |
| Is review queue built in standalone tool or integrated into admin dashboard? | Defer to Phase 1 admin dashboard implementation planning. |
| Who approves content correction before publishing? | Default to project owner or delegated content authority. |
| What is maximum review item age before escalation? | Suggested: safety flags within 24 hours; final SLA open. |
| Should learner dispute outcomes be visible to learner? | Open. Conservative default is internal note plus learner-safe response if needed. |
| Should AI Teacher samples be stored verbatim? | Requires retention/privacy decision. |
| What fields are safe in reviewer exports? | Defer to analytics/security planning. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/journeys/admin-journey.md`
- `docs/journeys/content-manager-journey.md`
- `docs/journeys/student-journey.md`
- `docs/admin/admin-dashboard-sitemap.md`
- `docs/security/ai-safety-privacy-rules.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/data/session-data-capture.md`
- `docs/data/initial-data-model.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-001, P0-003, P0-004, P0-007, P0-008, P0-019, and P0-022.
- This document has a title, purpose, scope, current product direction, reviewer goals, journey stages, review item types, queue rules, content quality standards, AI Teacher review standards, AIM behavior review standards, boundaries, assumptions, open questions, and related documents.
- Reviewer workflow is internal only.
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
- No runtime source code, Student Web App, Flutter AIM logic, reviewer dashboard implementation, database migration, or backend implementation was added.
