# AIM Roles and Permissions Matrix

## Purpose

This document defines AIM user roles, access boundaries, and permission rules so later product, backend, Flutter Mobile, admin/internal dashboard, security, and data planning can avoid guessing who may do what.

## Scope

This is Phase 0 planning documentation only.

This document does not implement:

- Authentication.
- Authorization middleware.
- Backend runtime code.
- NestJS API code.
- FastAPI routes.
- Flutter Mobile code.
- React Web code.
- Admin dashboard runtime code.
- Database migrations.
- Auth policies.
- AIM Engine runtime code.
- AI Teacher Gateway runtime code.
- A separate Student Web App.

This matrix covers post-MVP Phase 1 foundation roles, conditional roles, internal roles, and later expansion roles at a planning level.

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

This role matrix must not treat React Web as a new post-MVP Student Web App. React Web is historical completed pilot context unless a later documented decision creates a new web learner surface.

Flutter Mobile is the approved post-MVP Phase 1 learner client.

The admin dashboard is an internal operations surface only. It is not a learner app and not a parent app.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for role, AIM, client, and credential guardrails. |
| P0-005 | `docs/journeys/student-journey.md` | Checked for learner role behavior. |
| P0-006 | `docs/journeys/parent-journey.md` | Checked for conditional parent scope. |
| P0-007 | `docs/journeys/admin-journey.md` | Checked for admin role behavior. |
| P0-008 | `docs/journeys/content-manager-journey.md` | Checked for content manager role behavior. |
| P0-009 | `docs/journeys/human-reviewer-journey.md` | Checked for reviewer role behavior. |
| P0-017 | `docs/api/api-planning-baseline.md` | Checked for backend authorization rules. |
| P0-022 | `docs/security/ai-safety-privacy-rules.md` | Checked for privacy, safety, and credential restrictions. |

## Role Model

| Role | Phase 1 Status | Primary Purpose | Account Type |
|---|---|---|---|
| Student | Phase 1 Foundation | Complete lessons, answer questions, receive backend-approved feedback, and view own progress. | Authenticated learner account |
| Parent or Guardian | Conditional | View limited learner-safe progress if parent access is approved. | Authenticated linked account |
| Pilot Admin | Phase 1 Foundation | Operate support, monitor learner progress, inspect backend AIM summaries, and handle operational issues. | Internal authenticated account |
| Content Manager | Phase 1 Foundation | Manage lesson and question content, metadata readiness, review workflow, and publishing readiness. | Internal authenticated account |
| Human Reviewer | Conditional / Phase 1 Foundation where review workflow is enabled | Review flagged content, disputed results, AI Teacher behavior samples, and AIM recommendation audit samples. | Internal authenticated account |
| Project Owner | Phase 1 Foundation | Approve scope decisions, readiness gates, role assignment, reports, and final go/no-go decisions. | Internal authenticated account |
| System Service | Phase 1 Foundation | Execute backend-only automated operations such as AIM processing, audit logging, and scheduled jobs. | Server-side service identity |
| Public Visitor | Later / Out of Phase 1 Foundation | View marketing or invitation material only if public pages are later created. | Unauthenticated visitor |
| Teacher | Later Expansion | Support classroom/cohort-led learning if introduced later. | Internal or educator account |
| School Admin | Later Expansion | Manage institutional deployment if introduced later. | Organization account |

## Permission Principles

- Use least privilege: each role receives only the access required for its workflow.
- Backend authorization is final.
- Client apps must not enforce critical authorization without backend verification.
- Students can access only their own learner-safe data.
- Parents, if enabled, can access only linked learner-safe summaries.
- Internal roles can access learner data only for approved operations, review, support, quality, or audit workflows.
- AIM Engine decisions, mastery calculations, retention, difficulty, weakness, and recommendations remain backend-owned.
- Flutter Mobile, React Web, admin UI, and any other client must not calculate AIM outputs locally.
- AI Teacher Gateway remains backend-only.
- AI provider keys, Supabase service role keys, database credentials, and privileged backend credentials are server-only.
- Learner behavior labels must remain educational, non-clinical, non-medical, and non-diagnostic.
- Speed, response time, average response time, and speed score must not directly affect mastery, student level, or direct difficulty increase.
- Cross-learner access must be explicit, role-scoped, and audit-logged.
- No separate Student Web App is planned unless a later documented product decision changes this.

## Phase 1 Permission Matrix

| Capability | Student | Parent or Guardian | Pilot Admin | Content Manager | Human Reviewer | Project Owner | System Service |
|---|---|---|---|---|---|---|---|
| Register or sign in | Yes | Conditional | Yes | Yes | Yes | Yes | No UI login |
| View own profile | Yes | Own parent profile only | Support access | Own record | Own record | Full | Read as needed |
| Update own profile basics | Yes | Own parent profile only | Support access | Own record | Own record | Full | No |
| View own lessons | Yes | Linked learner summary if enabled | Cohort support | Content preview | Review samples | Full | Read as needed |
| Start or resume lesson session | Yes | No | Support only | No | No | No | No |
| Submit lesson attempts | Yes | No | No | No | No | No | Backend processing only |
| View own adaptive result | Learner-safe only | Linked learner summary if enabled | Role-scoped internal summary | No | Scoped samples | Full | Read/write as needed |
| View own progress | Yes | Linked learner summary if enabled | Cohort support | No | Scoped samples | Full | Read as needed |
| View other learners | No | Own linked learner only | Cohort only | No | Scoped samples only | Full | Workflow-limited |
| Manage learner accounts | No | No | Support-limited | No | No | Full | No |
| Create or edit lesson content | No | No | Optional delegated support | Yes | Suggest changes only | Full | No |
| Publish lesson content | No | No | If delegated | If approved | No | Full | No |
| Review content quality | No | No | Yes | Yes | Yes | Full | No |
| View AIM audit logs | No | No | Scoped | No | Scoped samples | Full | Write/read as needed |
| Override AIM recommendation | No | No | No direct algorithm authority | No | No | Only through approved backend workflow | No |
| Mark recommendation review notes | No | No | Yes | No | Yes | Full | No |
| Access raw secrets or provider keys | No | No | No | No | No | No client-visible access | Backend environment only |
| Export reports | Own summary only | Linked summary if enabled | Approved reports | No | Review exports only | Full | Generated as needed |
| Change role assignments | No | No | No | No | No | Yes | No |
| Access admin dashboard | No | No | Yes | Role-scoped | Role-scoped | Full | No UI access |
| Access Flutter Mobile learner app | Yes | Conditional if parent surface exists | No as admin role | No | No | No as owner role | No |

## Student Permissions

Students may:

- Sign in to their learner account.
- View assigned lessons and questions.
- Start, pause, resume, and complete their own learning sessions.
- Submit answers, hint usage, skips, retries, and answer changes.
- Receive backend-generated feedback, adaptive results, recommendations, and progress summaries.
- View their own learner-safe progress history.
- View review reminders and goals generated by backend/AIM outputs.

Students must not:

- View another learner's data.
- Edit lesson content or question metadata.
- Access AIM audit internals beyond learner-safe explanations.
- Modify mastery, difficulty, recommendation, retention, weakness, or AIM Engine outputs.
- Access provider keys, backend credentials, Supabase service keys, or admin tools.
- Calculate AIM state locally in the client.
- Receive clinical, medical, diagnostic, or shame-based labels.

## Parent or Guardian Permissions

Parent or guardian access is conditional.

If included, it must be limited to learner-safe visibility and must follow approved consent, linking, and privacy rules.

Parents or guardians may:

- View linked learner progress summaries.
- View linked learner lesson completion status.
- View high-level practice recommendations written in educational language.
- Receive notifications only if notification scope approves parent communication.
- Request support through approved channels if parent workflows are implemented.

Parents or guardians must not:

- Submit answers on behalf of the learner.
- Change AIM recommendations, mastery, difficulty, retention, weakness, or student level.
- View raw attempt logs unless explicitly approved by later privacy planning.
- View raw behavioral signals.
- View other learners.
- Access admin, content, reviewer, or internal tools.
- Receive clinical, medical, or diagnostic labels about the learner.

## Pilot Admin Permissions

Pilot admins may:

- Monitor cohort-level activity.
- View learner progress, session completion, and adaptive result summaries.
- Inspect AIM recommendation outcomes and audit logs needed for operations.
- Help resolve account or session support issues.
- Route content, review, support, and AIM issues to the right queue.
- Export approved operational reports.
- Add internal notes where audit rules allow.

Pilot admins must not:

- Change AIM algorithm logic.
- Override the decision conflict resolver from the UI.
- Edit learner mastery, difficulty, retention, or recommendations directly.
- Use speed as a mastery, student level, or direct difficulty-increase signal.
- Access raw secrets, provider keys, or privileged backend credentials.
- Use medical, clinical, diagnostic, or identity-based learner labels.
- Export raw private data without approved scope.

## Content Manager Permissions

Content managers may:

- Draft and edit lessons, questions, choices, explanations, and metadata.
- Manage skill, concept, difficulty, prerequisite, and common error tags.
- Submit content for review.
- Publish content only if the project owner or approved workflow delegates that authority.
- Review content quality flags and fix content issues.

Content managers must not:

- Access private learner data unless explicitly needed for content quality review and approved by privacy rules.
- Modify learner mastery, recommendations, AIM state, or AIM audit logs.
- Ship content that lacks required metadata.
- Use clinical or diagnostic learner labels in content or explanations.
- Access provider keys or backend secrets.

## Human Reviewer Permissions

Human reviewers may:

- Review content quality and metadata completeness.
- Review AI Teacher behavior examples.
- Review scoped AIM audit samples for educational safety and recommendation quality.
- Review disputed results where the workflow permits.
- Add review notes or requested changes.
- Escalate unsafe or unclear items.

Human reviewers must not:

- Access unnecessary learner identity data.
- Change production data directly unless a later approved workflow grants that authority.
- Override AIM Engine decisions in runtime.
- Diagnose learners or use clinical labels.
- Access provider keys, service credentials, or backend secrets.
- Use raw behavior values in learner-facing language.

## Project Owner Permissions

Project owners may:

- Approve product scope, readiness gates, and launch decisions.
- Assign or revoke internal roles.
- Approve final content publication rules.
- Approve reports and export scope.
- Decide whether conditional roles such as parent access are included.
- Approve changes to non-negotiables only through documented decision and risk review.
- Approve movement from Phase 0 planning to affected Phase 1 implementation.

Project owners must not:

- Expose provider keys or privileged credentials to clients.
- Bypass backend authorization rules.
- Change non-negotiables without documenting the decision and risk.
- Use admin power to create unaudited AIM overrides.
- Treat speed as a direct mastery or difficulty signal.

## System Service Permissions

System services may:

- Run backend-only AIM processing.
- Save attempts, adaptive results, audit logs, and recommendation outcome tracking.
- Execute scheduled or event-driven backend jobs.
- Read and write only the data needed for defined backend workflows.
- Interact with backend environment secrets where explicitly configured.

System services must not:

- Be used as a general user account.
- Have UI login access.
- Expose secrets to clients.
- Grant client-side access to privileged backend operations.
- Bypass audit logging for privileged operations.
- Write learner-facing messages without backend safety rules.

## Public Visitor Permissions

Public visitor access is out of Phase 1 foundation unless later approved.

Public visitors may only:

- View public invitation or marketing material if such pages are approved later.
- Submit no learner data unless an approved signup/onboarding path exists.

Public visitors must not:

- Access lessons.
- Access learner data.
- Access AI Teacher.
- Access admin/internal dashboard.
- Access reports.
- Trigger AIM Engine processing.

## Data Access Boundaries

| Data Category | Student | Parent or Guardian | Internal Roles | System Service |
|---|---|---|---|---|
| Own profile | Read/write basics | Own parent profile only | Support access by need | Read/write by workflow |
| Own attempts | Learner-safe view only | Usually no | Scoped operational or review access | Read/write by workflow |
| Other learners' attempts | No | No | Approved admin/review need only | Read/write by workflow |
| AIM mastery state | Own learner-safe summary | Linked summary if enabled | Scoped support/review access | Read/write by workflow |
| AIM recommendation | Own learner-safe message | Linked summary if enabled | Scoped support/review access | Read/write by workflow |
| AIM audit logs | No raw access | No raw access | Scoped access | Read/write by workflow |
| Behavioral signals | No raw access | No raw access | Operational labels/details by role | Read/write by workflow |
| AI Teacher logs | No raw provider traces | No | Scoped safety/review access | Read/write by workflow |
| Lesson content | Read published content | Summary only if enabled | Manage/review by role | Read as needed |
| Reports | Own report only | Linked learner summary if enabled | Role-scoped reports | Generate as needed |
| Secrets and keys | No | No | No client-visible access | Backend environment only |

## Backend Authorization Rules

- Supabase Auth may provide identity.
- Backend API must enforce role, ownership, and data visibility.
- Client-side role checks are UX hints only and must not be trusted.
- Every cross-learner access must be authorized server-side.
- Every privileged internal action must be audit-logged.
- Every export must record requester, scope, timestamp, and purpose.
- Internal users should use separate accounts from learner accounts.
- Service identities should be configured outside client applications.
- Impersonation, if ever added, must be explicit, audited, time-limited, and disabled by default.

## AIM and AI Permission Rules

| Rule | Applies To |
|---|---|
| AIM Engine logic remains Python/backend-owned. | All roles and clients |
| Clients consume backend-approved AIM outputs only. | Student, parent, admin UI, Flutter Mobile, any future client |
| Clients must not calculate mastery, level, weakness, difficulty, retention, or recommendations locally. | All clients |
| AI Teacher Gateway remains backend-only. | All roles and clients |
| AI provider keys remain backend/server-only. | All roles and clients |
| Speed is educational behavior evidence only. | AIM Engine, reports, admin, review |
| Learner behavior language must remain educational and non-diagnostic. | All user-facing and internal explanatory surfaces |

## Future Expansion Roles

| Future Role | When It May Be Added | Extra Planning Needed |
|---|---|---|
| Teacher | Classroom or cohort-led learning model | Classroom permissions, roster management, teacher reports, and learner visibility rules. |
| School Admin | Institutional deployment | Organization boundaries, school-level reporting, billing, and role delegation. |
| Support Agent | Larger support operations | Strict support tools, audit trails, impersonation limits, and privacy review. |
| Research Analyst | Formal learning study | De-identification, consent, export controls, and analysis protocol. |
| Billing Admin | Paid product | Payment provider access, invoice permissions, and financial data handling. |
| Organization Owner | Multi-tenant product | Tenant boundaries, delegated roles, and organization-level audit. |

## Non-Goals

This document does not:

- Implement role-based access control.
- Create a Student Web App.
- Create admin dashboard runtime code.
- Create Flutter Mobile code.
- Create React Web code.
- Create database migrations or auth policies.
- Move AIM Engine logic into Flutter Mobile, React Web, admin UI, or any client.
- Define final legal privacy policy.
- Define production incident response workflow.

## Assumptions

- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- Parent or guardian access may be deferred if it increases privacy or implementation risk.
- Internal review workflows should favor learner privacy and scoped access.
- Backend remains the source of truth for authorization and AIM outputs.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.
- Phase 0 remains documentation/planning only.

## Open Questions

| Question | Current Handling |
|---|---|
| Is parent or guardian access included in first Phase 1 implementation? | Treat as conditional until consent, linking, and visibility rules are approved. |
| Can content managers publish directly, or is approval required? | Default to approval required unless project owner delegates publishing. |
| Will human reviewers see identifiable learner data? | Default to de-identified or scoped samples unless safety/privacy planning approves more. |
| Are project owner and pilot admin separate people? | Keep roles separate in planning even if one person holds both. |
| Should admin override workflows exist in Phase 1 foundation? | Conditional. Must be backend-authorized and audit-logged if included. |
| Should future Teacher or School Admin roles be added soon? | Defer until classroom/institutional product scope is approved. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/phase-0-readiness-checklist.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/journeys/student-journey.md`
- `docs/journeys/parent-journey.md`
- `docs/journeys/admin-journey.md`
- `docs/journeys/content-manager-journey.md`
- `docs/journeys/human-reviewer-journey.md`
- `docs/admin/admin-dashboard-sitemap.md`
- `docs/mobile/mobile-sitemap.md`
- `docs/security/ai-safety-privacy-rules.md`
- `docs/api/api-planning-baseline.md`
- `docs/data/initial-data-model.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-001, P0-005, P0-006, P0-007, P0-008, P0-009, P0-017, and P0-022.
- This document has a title, purpose, scope, role model, permission principles, permission matrix, role-specific permissions, data boundaries, backend authorization rules, AIM/AI permission rules, future roles, assumptions, non-goals, and open questions.
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
- No runtime source code, Student Web App, Flutter AIM logic, database migration, auth policy, or backend implementation was added.
