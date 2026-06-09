# AIM Admin Journey

## Purpose

This document defines the AIM internal admin journey for monitoring learners, supporting operations, reviewing backend-produced AIM summaries, routing content/review issues, and preparing reports.

It is the admin workflow planning reference for post-MVP Phase 1 foundation work.

## Scope

This is Phase 0 planning documentation only.

This document does not implement:

- Admin dashboard runtime code.
- Backend runtime code.
- NestJS API code.
- FastAPI routes.
- Flutter Mobile code.
- React Web code.
- Database migrations.
- AIM Engine runtime code.
- AI Teacher Gateway runtime code.
- A separate Student Web App.

The admin journey describes internal operations only. It is not a learner journey, parent journey, or Student Web App journey.

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

The admin dashboard is an internal web surface for support, monitoring, content/review routing, reporting, and audit. It must not be confused with a learner-facing web app.

Admins are not AIM decision authorities. AIM outputs remain Python/backend-owned.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for AIM/client/credential guardrails. |
| P0-003 | `docs/product/roles-and-permissions.md` | Checked for admin access boundaries. |
| P0-004 | `docs/product/mvp-scope.md` | Checked for completed pilot and post-MVP scope. |
| P0-004 | `docs/product/out-of-scope.md` | Checked for out-of-scope boundaries. |
| P0-005 | `docs/journeys/student-journey.md` | Checked for learner support context. |
| P0-006 | `docs/journeys/parent-journey.md` | Checked for conditional parent-link boundaries. |
| P0-019 | `docs/admin/admin-dashboard-sitemap.md` | Checked for admin modules and surfaces. |
| P0-021 | `docs/analytics/reports-scope.md` | Checked for report/export boundaries. |
| P0-022 | `docs/security/ai-safety-privacy-rules.md` | Checked for safety/privacy rules. |

## Admin Role Summary

The admin is an internal operator who keeps AIM operations running safely.

The admin role supports learners, monitors progress, checks backend-produced AIM summaries, handles support issues, routes content/review issues, and reviews operational reports.

The admin role is not:

- a learner-facing role
- a parent-facing role
- an AIM Engine authority
- a content autopublishing authority by default
- a direct database operator from UI
- a secret manager from UI

AIM recommendations, mastery, retention, weakness, difficulty, and review schedules must remain backend-generated and aligned with AIM Engine rules.

## Admin Journey Summary

```text
Sign in
-> Review internal overview
-> Check learner progress
-> Inspect session and AIM summaries
-> Handle support issue
-> Route content / AIM / review issue
-> Review reports
-> Check audit trail
-> Prepare operational handoff
```

## Admin Goals

| Goal | Phase 1 Foundation Support |
|---|---|
| Know operational status | Overview, learner activity, completion, alerts, and blockers. |
| Support learners | Account/session support and safe learner progress visibility. |
| Monitor AIM behavior | Backend AIM summaries, recommendation distribution, and audit references. |
| Catch content issues | Question quality flags, repeated error clusters, and reviewer notes. |
| Route review work | Create or assign review items for content, AI Teacher, AIM, or disputed results. |
| Prepare analysis | View/export approved reports needed for product and learning review. |
| Preserve safety | Keep learner language educational and avoid raw sensitive exposure. |

## Journey Stages

| Stage | Admin Action | System Response | Boundary |
|---|---|---|---|
| Sign in | Admin logs in. | Backend verifies internal role. | No privileged access without backend authorization. |
| Internal overview | Reviews operational status. | Shows learner counts, completion, alerts, recent activity, and blockers. | Internal only, not public analytics. |
| Learner support | Opens learner summary. | Shows scoped progress, sessions, and safe adaptive summaries. | Access must be scoped and auditable. |
| Session inspection | Reviews a session result. | Shows attempt summary, AIM result, recommendation, and explanation reference. | No secret exposure or direct editing. |
| Content issue triage | Reviews flagged question or quality signal. | Routes item to content manager/reviewer workflow. | Admin does not silently rewrite content without process. |
| AIM issue triage | Reviews unusual recommendation or conflict output. | Creates review note or follow-up task. | Admin does not override runtime decision authority. |
| Report review | Checks approved metrics. | Shows completion, progress, review triggers, and recommendation outcomes. | Reports remain educational and non-diagnostic. |
| Audit review | Opens related audit events. | Shows trace of privileged actions. | Audit data is role-scoped and privacy-minimized. |
| Operational handoff | Summarizes notes and blockers. | Produces inputs for planning or support. | No broad scope changes without project owner approval. |

## Admin Dashboard Planning Scope

Admin Phase 1 foundation surfaces may include:

- internal overview
- learner list and learner summary
- lesson completion status
- session/adaptive result summary
- recommendation outcome summary
- question quality and content issue queue
- review queue
- audit/explanation log reference view
- reports/export area
- support blockers
- limited settings for approved operations

Admin surfaces should not become:

- a learner web app
- a parent dashboard
- a full production CMS
- a production school management system
- a billing/tenant management console
- a secret management console
- an AIM formula editor

## Learner Management Workflow

Admin may:

- View learner account status for support.
- Help with sign-in or session access issues.
- View learner progress and session summaries for support.
- Route learner-specific issues to review/support workflows.
- Link or revoke parent access only if parent feature is approved.
- Mark operational notes for review.
- View backend-approved learner-safe summaries.

Admin must not:

- Submit answers for learners.
- Change mastery, difficulty, retention, weakness, or AIM recommendations directly.
- Access data outside approved operational need.
- Use clinical, medical, psychological, or diagnostic language.
- Export private data beyond approved analysis/reporting needs.
- Expose raw behavior scores to students or parents.
- Access AI provider keys or backend secrets in UI.

## AIM Monitoring Workflow

Admin may review:

- adaptive result summaries
- recommendation action distribution
- decision conflict outputs
- weakness and prerequisite gap summaries
- retention review signals
- evidence quality and reliability summaries
- question quality flags
- safe explanation log IDs or references
- aggregate performance and progress summaries

Admin must not:

- Override the conflict resolver directly from the dashboard.
- Increase difficulty manually because a learner is fast.
- Treat response time as direct mastery evidence.
- Modify AIM Engine logic in an admin workflow.
- Expose raw sensitive audit details to students or parents.
- Make clinical, medical, psychological, or diagnostic claims.
- Recalculate AIM outputs client-side.

## Content Issue Workflow

When admin sees a content issue:

1. Identify the lesson, question, session, or report.
2. Record the issue type, such as unclear wording, metadata gap, repeated error cluster, poor question quality, or unsafe AI Teacher wording.
3. Route to content manager or human reviewer.
4. Mark whether the issue affects reporting or analysis.
5. Avoid changing live content without approved review path.
6. Preserve audit trail for privileged changes.

Admin should not silently patch learning content if content manager/reviewer workflow is required.

## Review Routing Workflow

Admin may route:

- disputed result
- flagged feedback
- AI Teacher safety/quality issue
- question quality issue
- repeated content confusion
- missing metadata
- abnormal AIM recommendation
- support blocker

Review routing should include:

- issue type
- severity
- linked learner/session/content record
- safe summary
- assigned role
- timestamp
- status
- resolution note when closed

Review routing must not include:

- raw secrets
- AI provider keys
- unnecessary learner identity data
- clinical labels
- raw hidden scoring weights
- cross-learner private data

## Settings Workflow

Phase 1 admin settings should be minimal.

Allowed settings may include:

- cohort visibility
- lesson publication status visibility
- internal role assignment visibility where authorized
- report export permissions
- review queue severity labels
- content publishing gates
- notification/report settings only if approved

Settings must not include:

- AI provider key display
- Supabase service role key display
- database credential display
- client-side secret management
- runtime AIM formula editing
- direct database editing
- production billing controls
- multi-tenant organization management
- unaudited role override

## Admin Data Boundaries

| Data Category | Admin Access | Rule |
|---|---|---|
| Learner profile | Support access | Use only for support and operations. |
| Attempts/session summaries | Scoped access | Prefer summaries and audit references. |
| AIM audit logs | Scoped internal access | Keep raw detail internal and secure. |
| Parent links | Conditional access | Only if parent feature is approved. |
| Content metadata | Review/triage access | Route changes through content workflow. |
| Reports | Approved internal access | Exports must be scoped and audited. |
| Secrets/provider keys | No UI access | Server-only environment. |
| Behavioral signals | Operational view only | Do not expose raw values to learners/parents. |

## Admin Safety Rules

Admin-facing surfaces must:

- use educational language
- avoid clinical labels
- avoid shame-based labels
- avoid raw private data where summary is enough
- avoid cross-learner comparisons unless explicitly approved in aggregate reports
- keep provider prompts and raw AI traces restricted
- keep secrets out of UI
- audit privileged actions
- preserve backend-owned AIM authority

## Non-Goals

This document does not:

- Implement an admin dashboard.
- Create backend runtime code.
- Create NestJS API code.
- Create FastAPI routes.
- Create database migrations.
- Create a Student Web App.
- Create Flutter Mobile code.
- Create React Web code.
- Move AIM Engine logic into a client or admin UI.
- Define a production-grade school admin system.
- Define final dashboard UI design.
- Define final export/legal policy.

## Assumptions

- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- Admin access is for support, monitoring, review, reporting, and operations.
- Backend authorization enforces admin scope.
- Admin surfaces can be functional and minimal for Phase 1 foundation.
- Deeper admin modules can be deferred until after foundation work.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.
- Phase 0 remains documentation/planning only.

## Open Questions

| Question | Current Handling |
|---|---|
| Which admin views are mandatory for first Phase 1 build? | Admin sitemap should define first module list. |
| Should admins be able to export identifiable data? | Security/privacy and analytics tasks should decide. |
| Can admin notes become part of audit logs? | Decide during data/entity planning. |
| Who approves live content changes? | Content manager and reviewer journeys should define approval path. |
| Should safe override workflows exist at all? | Conditional; must be backend-authorized and audit-logged if included. |
| Which admin dashboard technology stack should be used? | Implementation decision outside Phase 0. |
| Should reports be exportable as PDF/CSV/API only? | Analytics and security/privacy planning should decide. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/journeys/student-journey.md`
- `docs/journeys/parent-journey.md`
- `docs/journeys/content-manager-journey.md`
- `docs/journeys/human-reviewer-journey.md`
- `docs/admin/admin-dashboard-sitemap.md`
- `docs/analytics/reports-scope.md`
- `docs/security/ai-safety-privacy-rules.md`
- `docs/api/api-planning-baseline.md`
- `docs/data/initial-data-model.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-001, P0-003, P0-004, P0-005, P0-006, P0-019, P0-021, and P0-022.
- This document has a title, purpose, scope, current product direction, admin journey, workflows, boundaries, assumptions, non-goals, and open questions.
- Admin surfaces are internal only.
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
- No runtime source code, Student Web App, Flutter AIM logic, database migration, dashboard implementation, or backend implementation was added.
