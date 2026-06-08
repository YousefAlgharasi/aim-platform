# AIM Human Reviewer Journey

## Purpose

This document defines the MVP human reviewer journey for reviewing content quality, AIM teacher behavior audit samples, disputed or high-stakes grading cases, and review queue behavior within the AIM platform pilot.

## Scope

This is Phase 0 planning documentation for the human reviewer workflow. It does not implement backend APIs, reviewer dashboard runtime code, database migrations, Flutter code, Student Web App code, or AIM Engine code.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-003 | `docs/product/roles-and-permissions.md` | Checked locally and present. |
| P0-004 | `docs/product/mvp-scope.md` | Checked locally and present. |

## Reviewer Role Summary

The human reviewer is an internal subject-matter expert who evaluates content quality, inspects AIM recommendation audit samples, and handles cases flagged for human judgment. The reviewer exists to maintain educational safety, content accuracy, and AIM behavior reliability.

The reviewer is not an AIM decision authority. The reviewer does not override the AIM algorithm for live sessions. Review notes and flags inform future content or algorithm updates but do not retroactively change learner session results without an explicit approval workflow.

## Reviewer Journey Summary

```text
Sign in -> Open review queue -> Select flagged item or audit sample
-> Evaluate content or recommendation quality -> Record judgment and notes
-> Suggest or approve correction -> Close review item -> Support analysis closeout
```

## Reviewer Goals

| Goal | MVP Support |
|---|---|
| Ensure content quality | Review lesson and question accuracy, language suitability, and metadata completeness. |
| Audit AIM behavior | Inspect sampled adaptive results, recommendation distributions, and decision patterns. |
| Resolve flagged items | Evaluate items flagged by admin, learner, or automated quality signal for correctness or safety. |
| Maintain learning safety | Confirm that feedback and recommendations remain educational and non-diagnostic. |
| Provide improvement input | Document suggestions for content corrections and AIM behavior refinement. |

## Journey Stages

| Stage | Reviewer Action | System Response | Boundary |
|---|---|---|---|
| Sign in | Reviewer logs in with internal account. | Backend verifies reviewer role. | No privileged access without backend authorization. |
| Review queue | Opens assigned review queue. | Shows open flagged items and audit samples sorted by priority and age. | Scoped to assigned or unowned review items only. |
| Item selection | Selects an item to review. | Opens item detail: content or recommendation summary, flag reason, and context. | Reviewer cannot access student personal data beyond what is needed for review. |
| Content review | Evaluates lesson or question quality and metadata. | Shows question text, skill tag, difficulty, prerequisites, correct answer, explanation, and common error tags. | Reviewer may suggest corrections but cannot publish without approval process. |
| AIM audit review | Inspects a sampled adaptive result. | Shows attempt evidence summary, AIM recommendation, conflict resolution outcome, and explanation log snippet. | Reviewer does not alter algorithm parameters or live recommendation logic. |
| Dispute or escalation review | Evaluates a flagged high-stakes case. | Shows flagged session summary, recommendation, and escalation reason. | Reviewer judgment is recorded as a note, not a runtime override. |
| Record judgment | Adds review notes and decision. | Judgment saved with timestamp and reviewer identity. | Notes are internal and auditable. |
| Suggest or approve correction | Submits content correction suggestion or approves a pending fix. | Routes suggestion to content manager or marks item resolved. | Final publish authority rests with content manager or admin unless delegated. |
| Close review item | Marks item reviewed and closes the queue entry. | Item moves to closed state with judgment and notes preserved. | Audit trail must be retained. |
| Analysis support | Reviews pilot summary metrics and quality signal distribution. | Shows review throughput, flag rate, content issue frequency, and recommendation quality signals. | Reports remain educational and non-diagnostic. |

## Review Item Types

| Item Type | Trigger | Reviewer Action |
|---|---|---|
| Content quality flag | Admin or automated signal detects a potential issue with a question or lesson. | Evaluate accuracy, language suitability, metadata completeness, and recommend correction if needed. |
| AIM audit sample | Randomly or systematically sampled adaptive result for quality assurance. | Inspect decision logic, recommendation type, and compliance with behavioral rules. |
| High-stakes escalation | An AIM result or learner outcome is flagged as requiring human judgment. | Evaluate the case and record a judgment note. No runtime override. |
| Learner dispute | A learner-reported grading concern is routed to reviewer queue. | Review the relevant session attempt and record a judgment. |
| Safety signal | An AI feedback phrase or behavioral label is flagged as potentially clinical or harmful. | Confirm the language is educational and safe or flag for correction. |

## Review Queue Rules

- Items enter the queue via admin triage, automated quality signals, or learner dispute reports.
- Items are prioritized by safety signal first, then dispute, then content quality, then audit sample.
- Reviewer must not close an item without recording a judgment and notes.
- If a reviewer cannot make a judgment, they must escalate to the project owner rather than silently closing.
- Review items for the same content object must be deduplicated before routing to avoid redundant work.
- Audit samples are randomly selected from session results at a rate to be defined in pilot operations planning.

## High-Stakes Grading and Disputes

High-stakes review applies when:

- A learner reports a grading result they believe is incorrect.
- An AIM recommendation results in an unexpected difficulty change that a learner or admin questions.
- An automated signal detects a statistically unusual outcome cluster for a question or session.

In these cases:

- The reviewer inspects the attempt evidence, correct answer definition, and AIM explanation log.
- The reviewer records a judgment note describing the outcome evaluation.
- If content is wrong, the reviewer submits a correction suggestion for approval.
- If AIM behavior appears incorrect, the reviewer documents the case for algorithm review.
- The reviewer does not alter live session data or retroactively change learner scores without owner approval.

## Content Quality Standards for Review

Reviewed content must meet the following criteria:

- Question text is grammatically correct and age-appropriate.
- Skill tag is present and matches the question domain.
- Difficulty level is assigned and defensible.
- Prerequisite skill IDs are listed where applicable.
- Correct answer is marked and confirmed correct.
- Distractors (for multiple choice) are plausible but clearly incorrect.
- Explanation is present, clear, and accurate.
- Common error tags are assigned where meaningful.
- Language notes for Arabic-speaking learners are included where helpful.
- No clinical, diagnostic, or medically sensitive language appears in feedback.

## AIM Behavior Review Standards

Reviewed AIM audit samples must conform to:

- Recommendation type matches one of the approved output types (continue, review, retry, rest, reinforce, escalate, or equivalent approved list from P0-013).
- Mastery and difficulty change direction is consistent with attempt evidence.
- Speed data does not raise mastery, student level, or difficulty directly.
- Behavioral labels in feedback use educational language only (hesitation, rushing, possible guessing, fatigue signal, low confidence signal).
- No clinical, diagnostic, or medically determinative language is present.
- Fairness audit result is present in the output.
- Conflict resolution outcome is logged and traceable.

## Reviewer Boundaries and Non-Goals

The reviewer must not:

- Override live AIM algorithm decisions or parameters.
- Access student personal data beyond what is necessary for the review item.
- Publish content corrections without the approval process.
- Change learner progress, mastery, or session results directly.
- Share review notes or flagged session details outside the authorized internal team.
- Perform clinical interpretation or diagnosis of learner behavior.

The reviewer is not responsible for:

- Operating the pilot or managing learner accounts (admin role).
- Creating or publishing lesson content (content manager role).
- Approving platform changes or scope decisions (project owner role).

## Assumptions

- The pilot review queue is managed within internal tooling; a dedicated reviewer dashboard is a Phase 1 or later build.
- Audit samples are drawn from session results by pilot admin or automated tooling, not by the reviewer.
- Review throughput during the two-week pilot is low enough to be manageable with a single internal reviewer.
- All review notes are stored and accessible to the project owner and pilot admin for analysis.

## Open Questions

| Question | Current Handling |
|---|---|
| What is the target audit sample rate? | To be defined in pilot operations planning. Suggest one to five percent of sessions minimum. |
| Is the review queue built in a standalone admin tool or integrated into the admin dashboard? | Deferred to Phase 1 sitemap planning. Pilot may use a shared internal tool or spreadsheet. |
| Who approves a content correction before it is published? | Admin or project owner based on correction severity. Approval workflow to be detailed in content manager journey. |
| What is the maximum review item age before escalation? | To be defined in pilot operations planning. Suggest safety flags escalate within 24 hours. |
| Should learner dispute submissions be visible to the learner after review? | Open decision. Conservative default is internal-only review notes. |

## Related Documents

- `docs/product/roles-and-permissions.md`
- `docs/product/mvp-scope.md`
- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/journeys/admin-journey.md`
- `docs/journeys/content-manager-journey.md`
- `docs/journeys/student-journey.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-003 (`docs/product/roles-and-permissions.md`) and P0-004 (`docs/product/mvp-scope.md`) are both present and meaningful.
- This document has a title, purpose, scope, reviewer goals, journey stages, review item types, queue rules, content quality standards, AIM behavior review standards, boundaries, assumptions, open questions, and related documents.
- No runtime source code, Student Web App, Flutter AIM logic, database migrations, or backend implementation was added.
- Task is ready to mark Done in Notion.
