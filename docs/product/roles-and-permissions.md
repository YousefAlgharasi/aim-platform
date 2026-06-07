# AIM Roles and Permissions Matrix

## Purpose

This document defines AIM user roles, access boundaries, and permission rules so later product, backend, frontend, and security planning can avoid guessing who may do what.

## Scope

This matrix covers MVP pilot roles and future expansion roles at a planning level. It is documentation only and does not implement authentication, authorization, backend APIs, admin dashboards, database migrations, Flutter code, or Student Web App code.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked locally and present. |
| P0-001 | `docs/product/non-negotiables.md` | Checked locally and present. |

## Role Model

| Role | MVP Status | Primary Purpose | Account Type |
|---|---|---|---|
| Student | In scope | Complete lessons, answer questions, receive feedback, and view own progress. | Authenticated learner account |
| Pilot Admin | In scope | Operate the two-week pilot, monitor learner progress, inspect AIM outputs, and handle support. | Internal authenticated account |
| Content Manager | In scope for planning | Manage lesson and question content before and during the pilot. | Internal authenticated account |
| Human Reviewer | In scope for planning | Review content quality, AI teacher behavior rules, and AIM recommendation audit samples. | Internal authenticated account |
| Parent or Guardian | Conditional MVP role | View limited learner progress if parent visibility is included in MVP. | Authenticated linked account |
| System Service | In scope | Execute backend-only automated operations such as AIM processing, audit logging, and scheduled review jobs. | Server-side service identity |
| Project Owner | In scope | Approve scope decisions, pilot readiness, and final Phase 0/Phase 1 gates. | Internal authenticated account |
| Public Visitor | Out of MVP runtime scope | View marketing or invitation material only if a public page is later created. | Unauthenticated visitor |

## Permission Principles

- Use least privilege: each role gets only the access needed for its workflow.
- Students can access only their own learning data and recommendations.
- Internal roles can access pilot data only for operations, review, support, and quality improvement.
- Parent or guardian access, if included, must be limited and learner-safe.
- AIM Engine decisions, mastery calculations, and recommendations remain backend-owned.
- Client apps must not enforce critical authorization without backend verification.
- AI provider keys, service credentials, and privileged database access are server-only.
- Learner behavior labels must remain educational and non-diagnostic.

## MVP Permission Matrix

| Capability | Student | Parent or Guardian | Pilot Admin | Content Manager | Human Reviewer | Project Owner | System Service |
|---|---|---|---|---|---|---|---|
| Register or sign in | Yes | Conditional | Yes | Yes | Yes | Yes | No |
| View own profile | Yes | No | Yes, for pilot support | No | No | Yes | Read as needed |
| Update own profile basics | Yes | No | Yes, for support | No | No | Yes | No |
| View own lessons | Yes | Limited child view if enabled | Yes | Yes | Yes | Yes | Read as needed |
| Start or resume lesson session | Yes | No | Support only | No | No | No | No |
| Submit lesson attempts | Yes | No | No | No | No | No | Backend processing only |
| View own adaptive result | Yes | Limited child summary if enabled | Yes | No | Yes, audit samples | Yes | Read/write as needed |
| View own progress | Yes | Limited child summary if enabled | Yes | No | No | Yes | Read as needed |
| View other students | No | Own linked learner only | Yes, pilot cohort only | No | Audit samples only | Yes | Read as needed |
| Manage learner accounts | No | No | Yes, pilot support only | No | No | Yes | No |
| Create or edit lesson content | No | No | Optional approval role | Yes | Suggest changes only | Yes | No |
| Publish lesson content | No | No | Yes, if delegated | Yes, if approved | No | Yes | No |
| Review content quality | No | No | Yes | Yes | Yes | Yes | No |
| View AIM audit logs | No | No | Yes | No | Yes, scoped samples | Yes | Write/read as needed |
| Override AIM recommendation | No | No | No for algorithm authority | No | No | No | No |
| Mark recommendation review notes | No | No | Yes | No | Yes | Yes | No |
| Access raw secrets or provider keys | No | No | No | No | No | No | Backend environment only |
| Export pilot reports | Own summary only | Child summary if enabled | Yes | No | Review exports only | Yes | Generated as needed |
| Change role assignments | No | No | No | No | No | Yes | No |

## Student Permissions

Students may:

- Sign in to their learner account.
- View assigned A1 lessons and questions.
- Start, pause, resume, and complete their own lesson sessions.
- Submit answers, hint usage, skips, retries, and answer changes.
- Receive backend-generated feedback, adaptive results, recommendations, and progress summaries.
- View their own progress history.

Students must not:

- View another learner's data.
- Edit lesson content or question metadata.
- Access AIM audit internals beyond learner-safe explanations.
- Modify mastery, difficulty, recommendation, or AIM Engine outputs.
- Access provider keys, backend credentials, or admin tools.

## Parent or Guardian Permissions

Parent or guardian access is conditional for MVP. If included, it must be limited to learner-safe progress visibility.

Parents or guardians may:

- View linked learner progress summaries.
- View lesson completion status.
- View high-level practice recommendations written in educational language.
- Receive notifications if notification scope includes parent communication.

Parents or guardians must not:

- Submit answers on behalf of the student.
- Change AIM recommendations or mastery state.
- View raw attempt logs unless explicitly approved by later privacy planning.
- View other learners.
- Access admin, content, or reviewer tools.

## Pilot Admin Permissions

Pilot admins may:

- Monitor the pilot cohort.
- View learner progress, session completion, and adaptive result summaries.
- Inspect AIM recommendation outcomes and audit logs needed for pilot operations.
- Help resolve account or session support issues.
- Export pilot-level reports for review.

Pilot admins must not:

- Change AIM algorithm logic.
- Override the decision conflict resolver.
- Use speed as a mastery or direct difficulty-increase signal.
- Access raw secrets or provider keys.
- Use medical, clinical, or diagnostic learner labels.

## Content Manager Permissions

Content managers may:

- Draft and edit lessons, questions, choices, explanations, and metadata.
- Manage skill, concept, difficulty, prerequisite, and common error tags.
- Submit content for review.
- Publish content only if the project owner or pilot process delegates that authority.

Content managers must not:

- Access private learner data unless explicitly needed for content quality review and approved by privacy rules.
- Modify student mastery, recommendations, or AIM audit logs.
- Ship content that lacks required metadata.
- Use clinical or diagnostic learner labels in content or explanations.

## Human Reviewer Permissions

Human reviewers may:

- Review content quality and metadata completeness.
- Review AI teacher behavior examples.
- Review scoped AIM audit samples for educational safety and recommendation quality.
- Add review notes or requested changes.

Human reviewers must not:

- Access unnecessary learner identity data.
- Change production data directly unless a later workflow grants that authority.
- Override AIM Engine decisions in runtime.
- Diagnose learners or use clinical labels.

## Project Owner Permissions

Project owners may:

- Approve product scope, readiness gates, and pilot launch decisions.
- Assign or revoke internal roles.
- Approve final content publication and pilot reports.
- Decide whether conditional roles such as parent access are in MVP.

Project owners must not:

- Expose provider keys or privileged credentials to clients.
- Bypass backend authorization rules.
- Change non-negotiables without documenting the decision and risk.

## System Service Permissions

System services may:

- Run backend-only AIM processing.
- Save attempts, adaptive results, audit logs, and recommendation outcome tracking.
- Execute scheduled or event-driven backend jobs when implementation begins.
- Read and write only the data needed for defined backend workflows.

System services must not:

- Be used as a general user account.
- Expose secrets to clients.
- Grant client-side access to privileged backend operations.

## Data Access Boundaries

| Data Category | Student | Parent or Guardian | Internal Roles | System Service |
|---|---|---|---|---|
| Own profile | Read/write basics | No | Support access by need | Read/write by workflow |
| Own attempts | Learner-safe view only | Usually no | Scoped operational or review access | Read/write by workflow |
| Other learners' attempts | No | No | Pilot/admin/review need only | Read/write by workflow |
| AIM mastery state | Own summary | Linked summary if enabled | Scoped support/review access | Read/write by workflow |
| AIM audit logs | No raw audit access | No raw audit access | Scoped access | Read/write by workflow |
| Lesson content | Read published content | Read published summaries if enabled | Manage/review by role | Read as needed |
| Secrets and keys | No | No | No client-visible access | Backend environment only |

## Future Expansion Roles

| Future Role | When It May Be Added | Extra Planning Needed |
|---|---|---|
| Teacher | Classroom or cohort-led learning model | Classroom permissions, roster management, teacher reports, and learner visibility rules. |
| School Admin | Institutional deployment | Organization boundaries, school-level reporting, billing, and role delegation. |
| Support Agent | Larger support operations | Strict support tools, audit trails, impersonation limits, and privacy review. |
| Research Analyst | Formal learning study | De-identification, consent, export controls, and analysis protocol. |
| Billing Admin | Paid product | Payment provider access, invoice permissions, and financial data handling. |

## Authorization Planning Notes

- Supabase Auth may provide identity, but backend authorization must enforce role and data ownership.
- Role names in the database should be stable and explicit when implemented.
- Any cross-learner access must be audit logged.
- Internal users should have separate accounts from student learner accounts.
- Service identities should be configured outside client applications.
- Future impersonation, if ever added, must be explicit, audited, and disabled for MVP unless separately approved.

## Non-Goals

- This document does not implement role-based access control.
- This document does not create a Student Web App.
- This document does not create admin dashboard runtime code.
- This document does not create database migrations or auth policies.
- This document does not move AIM Engine logic into Flutter or any client.

## Assumptions

- The MVP pilot is small and internally operated.
- The first pilot uses React web, FastAPI, Supabase Auth, and Supabase PostgreSQL.
- Parent or guardian access may be deferred if it increases pilot privacy or implementation risk.
- Internal review workflows should favor learner privacy and scoped access.
- The backend remains the source of truth for authorization and AIM outputs.

## Open Questions

| Question | Current Handling |
|---|---|
| Is parent or guardian access included in the first MVP pilot? | Treat as conditional until MVP scope task makes the final call. |
| Can content managers publish directly, or is approval required? | Default to approval required unless the admin journey task delegates publishing. |
| Will human reviewers see identifiable learner data? | Default to de-identified or scoped samples unless safety/privacy planning approves more. |
| Are project owner and pilot admin separate people during the first pilot? | Keep the roles separate in planning even if one person holds both. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/phase-0-readiness-checklist.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-001.
- This document has a title, purpose, scope, role matrix, permission matrix, data boundaries, assumptions, non-goals, and open questions.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.

