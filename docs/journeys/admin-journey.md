# AIM Admin Journey

## Purpose

This document defines the MVP pilot admin journey for operating the AIM web/cloud pilot, monitoring learners, reviewing adaptive outputs, and managing internal support workflows.

## Scope

This is Phase 0 planning documentation for internal admin workflows. It does not implement backend APIs, admin dashboard runtime code, database migrations, Flutter code, Student Web App code, or AIM Engine code.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-003 | `docs/product/roles-and-permissions.md` | Checked locally and present. |
| P0-004 | `docs/product/mvp-scope.md` | Checked locally and present. |
| P0-004 | `docs/product/out-of-scope.md` | Checked locally and present. |

## Admin Role Summary

The pilot admin is an internal operator who keeps the two-week pilot running. The admin role supports learners, monitors progress, checks AIM outputs, and coordinates content or review issues.

The admin is not an AIM decision authority. AIM recommendations must remain backend-generated and aligned with the decision conflict resolver.

## Admin Journey Summary

```text
Sign in -> Review pilot overview -> Check learner progress
-> Inspect session/adaptive summaries -> Handle support issue
-> Flag content/AIM issue -> Review reports -> Prepare pilot handoff
```

## Admin Goals

| Goal | MVP Support |
|---|---|
| Know pilot status | Cohort overview, lesson completion, active sessions, and blockers. |
| Support learners | Account/session support and safe learner progress visibility. |
| Monitor AIM behavior | Adaptive result summaries, recommendation distribution, and audit references. |
| Catch content issues | Question quality flags, repeated error clusters, and reviewer notes. |
| Prepare analysis | Export or view pilot metrics needed for closeout. |

## Journey Stages

| Stage | Admin Action | System Response | Boundary |
|---|---|---|---|
| Sign in | Admin logs in. | Backend verifies internal role. | No privileged access without backend authorization. |
| Pilot overview | Reviews cohort status. | Shows learner counts, completion, alerts, and recent activity. | Internal pilot only, not public analytics. |
| Learner support | Opens learner summary. | Shows linked progress, sessions, and safe adaptive summaries. | Access must be scoped and auditable. |
| Session inspection | Reviews a session result. | Shows attempts summary, AIM result, recommendation, and explanation reference. | Do not expose or edit secrets. |
| Content issue triage | Reviews flagged questions or poor quality signals. | Routes item to content manager/reviewer workflow. | Admin does not silently rewrite content without process. |
| AIM issue triage | Reviews unusual recommendation or conflict output. | Creates review note or follow-up task. | Admin does not override runtime decision authority. |
| Report review | Checks pilot metrics. | Shows completion, accuracy, mastery changes, retention, and recommendation outcomes. | Reports remain educational and non-diagnostic. |
| Closeout handoff | Summarizes operational notes. | Produces inputs for pilot analysis and Phase 1 decisions. | No broad product expansion decisions without owner approval. |

## Admin Dashboard Planning Scope

Admin MVP surfaces may include:

- Pilot overview.
- Learner list and learner summary.
- Lesson completion status.
- Session/adaptive result summary.
- Recommendation outcome summary.
- Question quality and content issue queue.
- Audit/explanation log reference view.
- Reports/export area.
- Basic settings for pilot operations.

Admin MVP surfaces should not become a full production admin suite.

## Learner Management Workflow

Admin may:

- View pilot learner account status.
- Help with sign-in or session access issues.
- View learner progress and session summaries for support.
- Link or revoke parent access if parent feature is included.
- Mark operational notes for pilot review.

Admin must not:

- Submit answers for learners.
- Change mastery, difficulty, or AIM recommendations.
- Access data outside the pilot need.
- Use clinical or diagnostic language.
- Export private data beyond approved pilot analysis needs.

## AIM Monitoring Workflow

Admin may review:

- Adaptive result summaries.
- Recommendation action distribution.
- Decision conflict outputs.
- Weakness and prerequisite gap summaries.
- Retention review signals.
- Evidence quality and reliability summaries.
- Question quality flags.
- Explanation log IDs or references.

Admin must not:

- Override the conflict resolver.
- Increase difficulty manually because a learner is fast.
- Treat response time as direct mastery evidence.
- Modify AIM Engine logic in an admin workflow.
- Expose raw sensitive audit details to students or parents.

## Content Issue Workflow

When admin sees a content issue:

1. Identify the lesson or question.
2. Record the issue type, such as unclear wording, metadata gap, repeated error cluster, or poor question quality.
3. Route to content manager or human reviewer.
4. Mark whether the issue affects pilot analysis.
5. Avoid changing live pilot content without a review path.

## Settings Workflow

MVP admin settings should be minimal:

- Pilot cohort status.
- Lesson publication status visibility.
- Internal role assignment visibility where authorized.
- Notification/report settings only if those features are included.

Settings must not include:

- AI provider key display.
- Client-side secret management.
- Runtime AIM formula editing.
- Production billing controls.
- Multi-tenant organization management.

## Admin Data Boundaries

| Data Category | Admin Access | Rule |
|---|---|---|
| Learner profile | Pilot support access | Use only for support and operations. |
| Attempts/session summaries | Scoped access | Prefer summaries and audit references. |
| AIM audit logs | Internal access | Keep raw detail internal and secure. |
| Parent links | Conditional access | Only if parent feature is included. |
| Content metadata | Review/triage access | Route changes through content workflow. |
| Secrets/provider keys | No access in UI | Server-only environment. |

## Non-Goals

- This document does not implement an admin dashboard.
- This document does not create backend runtime code.
- This document does not create database migrations.
- This document does not create a Student Web App.
- This document does not create Flutter code.
- This document does not move AIM Engine logic into a client or admin UI.
- This document does not define a production-grade school admin system.

## Assumptions

- The first pilot is small and internally operated.
- Admin access is for support, monitoring, review, and analysis.
- Backend authorization enforces admin scope.
- Admin surfaces can be functional and minimal for MVP.
- Deeper admin modules can be deferred until after pilot validation.

## Open Questions

| Question | Current Handling |
|---|---|
| Which admin views are mandatory for the first pilot? | Admin sitemap task should define final module list. |
| Should admins be able to export identifiable data? | Security/privacy and analytics tasks should decide. |
| Can admin notes become part of audit logs? | Decide during data/entity planning. |
| Who approves live content changes during pilot? | Content manager and reviewer journeys should define approval path. |

## Related Documents

- `docs/product/roles-and-permissions.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/journeys/student-journey.md`
- `docs/journeys/parent-journey.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-003 and P0-004.
- This document has a title, purpose, scope, admin journey, workflows, boundaries, assumptions, non-goals, and open questions.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.

