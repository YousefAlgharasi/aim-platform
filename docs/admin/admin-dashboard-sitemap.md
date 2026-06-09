# AIM Admin Dashboard Sitemap and Modules

## Purpose

This document defines the Phase 0 planning sitemap and module scope for the AIM internal admin dashboard.

It converts the admin journey, content manager journey, human reviewer journey, reports scope, and API planning baseline into an implementation-ready planning document for post-MVP Phase 1 foundation work.

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

The admin dashboard is an internal operations surface. It is not a learner application, not a parent application, and not a Student Web App.

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

Post-MVP Phase 1 uses Flutter Mobile for the learner client and NestJS + TypeScript for the Backend API.

The admin dashboard is a separate internal web surface for operations, support, content management, review, reporting, and audit. It must not be confused with the completed React Web learner pilot or with a new Student Web App.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for platform guardrails. |
| P0-003 | `docs/product/roles-and-permissions.md` | Checked for role access boundaries. |
| P0-007 | `docs/journeys/admin-journey.md` | Present. Defines admin monitoring, learner support, and reporting boundaries. |
| P0-008 | `docs/journeys/content-manager-journey.md` | Present. Defines content inventory, lesson/question metadata, review, and publishing workflow. |
| P0-009 | `docs/journeys/human-reviewer-journey.md` | Checked for review queue and human review boundaries. |
| P0-017 | `docs/api/api-planning-baseline.md` | Checked for backend API/admin scope. |
| P0-021 | `docs/analytics/reports-scope.md` | Checked for report and export boundaries. |
| P0-022 | `docs/security/ai-safety-privacy-rules.md` | Checked for safety, privacy, and credential boundaries. |

## Dashboard Principles

| Principle | Rule |
|---|---|
| Internal only | Dashboard access is limited to approved AIM operators and internal roles. |
| Backend-authorized | Every privileged action must be enforced by the Backend API. |
| Role-scoped | Navigation and data visibility depend on backend-approved role permissions. |
| Observation before intervention | Admins inspect summaries, route issues, and audit decisions before any override. |
| Educational safety | Analytics and AI summaries stay educational and behavioral, not clinical or medical. |
| No secrets in client | Provider keys, Supabase service role keys, database credentials, and backend secrets remain server-only. |
| No AIM logic in UI | The dashboard displays backend-produced AIM outputs only. |
| Auditability | Privileged actions must be audit-logged. |
| No Student Web App | The dashboard must not become a learner-facing web app. |

## Role Access Summary

| Role | Access Scope |
|---|---|
| Project Owner | Full internal overview, settings, reports, audit log, and approval workflows. |
| Pilot Admin | Learner support, monitoring, sessions, AIM summaries, operational reports, and blockers. |
| Content Manager | Content inventory, lesson/question readiness, metadata completeness, review, and publishing workflow. |
| Human Reviewer | Review queue, disputed results, flagged feedback, content issue notes, and review decisions. |
| Student | No admin dashboard access. |
| Parent / Guardian | No admin dashboard access. Parent views must remain separate from internal admin tooling. |
| System Service | No UI access. Backend service identity only. |

## Top-Level Navigation

```text
Admin Dashboard
├── Overview
├── Learners
├── Learning Sessions
├── AIM Monitoring
├── Content
├── Review Queue
├── Reports
├── Operations
├── Settings
└── Audit Log
```

## Module Map

| Module | Phase 1 Status | Primary Roles | Purpose |
|---|---|---|---|
| Overview | Phase 1 Foundation | Project Owner, Pilot Admin | Show product/pilot health, learner activity, alerts, open reviews, and blockers. |
| Learners | Phase 1 Foundation | Project Owner, Pilot Admin | Support learner accounts and inspect learner-safe progress summaries. |
| Learning Sessions | Phase 1 Foundation | Pilot Admin, Human Reviewer | Inspect session activity and backend adaptive summaries. |
| AIM Monitoring | Phase 1 Foundation | Project Owner, Pilot Admin, Human Reviewer | Observe AIM outputs and route unusual signals for review. |
| Content | Phase 1 Foundation | Content Manager, Project Owner | Track lessons, questions, metadata readiness, and review status. |
| Review Queue | Phase 1 Foundation | Human Reviewer, Content Manager, Pilot Admin | Resolve flagged results, feedback, content, support, and AIM issues. |
| Reports | Phase 1 Foundation | Project Owner, Pilot Admin | View analytics and approved export summaries. |
| Operations | Conditional | Project Owner, Pilot Admin | Track support issues, rollout blockers, and operational notes. |
| Settings | Limited Phase 1 | Project Owner | Manage approved configuration only. |
| Audit Log | Phase 1 Foundation | Project Owner, Pilot Admin | Trace privileged dashboard actions. |

## Overview Module

### Overview Page

| Area | Phase 1 Foundation Content |
|---|---|
| Summary cards | Active learners, enrolled learners, completed lessons, open review items, content issues, support blockers. |
| Recent activity | New sessions, review updates, content status changes, admin actions. |
| Alerts | Missing content, unusual AIM signals, failed sessions, learners needing support. |
| Entry links | Learners, Sessions, Review Queue, Reports. |

Filters:

- cohort
- date range
- learner status
- severity
- review state

Allowed actions:

- open related record
- add operational note
- route issue to review queue

Disallowed actions:

- editing learner mastery directly
- changing AIM recommendations directly
- exposing raw private logs outside approved internal roles
- running AIM Engine logic in the dashboard

## Learners Module

### Learner List Page

| Column | Purpose |
|---|---|
| Learner reference | Identify learner safely. |
| Account status | Active, blocked, inactive, needs support. |
| Current level | Backend/AIM placement-derived learning level. |
| Current lesson | Current or latest backend-approved lesson. |
| Completion | Learner-safe progress summary. |
| Last activity | Most recent session or interaction. |
| Alerts | Support, review, or content-related flags. |

Filters:

- cohort
- account status
- level
- last activity
- alert type

Allowed actions:

- view learner summary
- add internal note
- open related sessions
- open review items
- route support issue

Disallowed actions:

- submitting answers for learners
- modifying mastery directly
- changing grades outside review workflow
- overriding AIM state without approved backend workflow

### Learner Summary Page

| Section | Content |
|---|---|
| Profile summary | Safe profile fields, role, status, cohort, language support needs. |
| Progress summary | Completed lessons, active skill areas, recent progress trend. |
| AIM summary | Backend-produced mastery and recommendation summaries with safe explanation references. |
| Sessions | Recent sessions with outcome and review flags. |
| Reviews | Linked open and closed review items. |
| Notes | Internal support notes with audit trail. |

Rules:

- Raw AIM internals are shown only to approved roles.
- Learner-safe summaries must be used where data could be user-facing later.
- No clinical, medical, diagnostic, or shame-based language.

## Learning Sessions Module

### Session List Page

| Column | Purpose |
|---|---|
| Session reference | Stable reference for review and audit. |
| Learner | Linked learner summary. |
| Lesson | Lesson or practice context. |
| Status | Started, completed, abandoned, failed, under review. |
| Accuracy summary | Educational performance summary. |
| AIM result | Backend-produced next action summary. |
| Flags | Frustration signal, retry pattern, disputed result, content issue. |
| Timestamp | Session time and recency. |

Filters:

- date range
- learner
- lesson
- status
- flag type
- review state

### Session Detail Page

| Section | Phase 1 Foundation Requirement |
|---|---|
| Session timeline | Start/end, lesson, attempts count, submitted answer summary. |
| Performance summary | Accuracy, timing summary, retry and hesitation indicators where available. |
| AIM output | Mastery, recommendation, review, or difficulty result generated by backend AIM Engine. |
| Evidence references | Explanation or audit references, not raw secret traces. |
| Linked issues | Content flags, review requests, support notes. |

Allowed actions:

- route to review
- add admin note
- open learner
- open content item

Disallowed actions:

- recalculating AIM results
- editing AIM output directly
- using clinical labels
- exposing raw provider output or prompts

## AIM Monitoring Module

### AIM Output Monitor Page

| View | Content |
|---|---|
| Recommendation distribution | Counts of next lesson, review, remediation, or difficulty changes. |
| Weakness and prerequisite summary | Aggregated educational gaps only. |
| Decision conflict references | Cases where backend conflict resolver output needs review. |
| Quality flags | Low confidence, missing evidence, repeated content issue, unusual retry pattern. |
| Review schedule summary | Skills due for review and retention-related alerts. |

Filters:

- date range
- skill
- lesson
- cohort
- confidence
- severity
- review state

Allowed actions:

- create review item
- add operational note
- open session detail
- open related content item

Disallowed actions:

- overriding conflict resolver in the UI
- editing mastery manually
- running AIM Engine logic in dashboard
- exposing raw hidden formulas to unauthorized roles

## Content Module

### Content Inventory Page

| Column | Purpose |
|---|---|
| Lesson reference | Stable lesson identifier. |
| Title | Human-readable lesson title. |
| Skill and concept | Skill tree mapping. |
| Difficulty | Beginner/skill difficulty marker. |
| Status | Draft, ready for review, approved, published, archived. |
| Metadata readiness | Required AIM metadata complete or missing. |
| Question count | Number of linked practice questions. |
| Issues | Open content flags. |

Filters:

- status
- skill
- concept
- difficulty
- reviewer
- issue state
- metadata completeness

Allowed actions:

- open lesson detail
- route to review
- mark readiness state if authorized
- create content issue note

Disallowed actions:

- unreviewed live content changes
- bypassing approval trail
- publishing unsafe content

### Lesson Detail Page

| Section | Phase 1 Foundation Requirement |
|---|---|
| Lesson metadata | Lesson ID, title, skill, concept, prerequisite, difficulty. |
| Content readiness | Required fields, examples, explanation, language support notes. |
| Questions | Linked practice questions and metadata. |
| Review state | Reviewer status, comments, approval trail. |
| Issue history | Content issues and resolutions. |

### Question Detail Page

| Section | Phase 1 Foundation Requirement |
|---|---|
| Question metadata | Skill ID, concept, difficulty, prerequisites, common error tags. |
| Answer data | Correct answer and explanation. |
| Quality review | Review status, issue notes, clarity flags. |
| Usage signals | Aggregated learning performance and error signals. |

## Review Queue Module

### Review Queue Page

| Queue Type | Description | Main Role |
|---|---|---|
| Disputed result | Learner or system result needs human review. | Human Reviewer |
| Flagged feedback | AI feedback or explanation needs safety/quality review. | Human Reviewer |
| Content issue | Lesson or question quality issue needs content review. | Content Manager |
| AIM issue | Adaptive output needs investigation or owner decision. | Pilot Admin / Human Reviewer |
| Support blocker | Operational learner access issue. | Pilot Admin |

Filters:

- queue type
- severity
- age
- role
- status
- learner
- lesson

Allowed actions:

- assign review
- add reviewer note
- set status
- link resolution
- escalate

Disallowed actions:

- changing production logic
- bypassing approval trail
- deleting audit history
- issuing clinical or diagnostic claims

## Reports Module

### Reports Page

| Report | Phase 1 Foundation Content |
|---|---|
| Learner progress | Completion, active learners, skill progress summaries. |
| Lesson performance | Completion, common errors, question quality signals. |
| AIM outcomes | Recommendation distribution, review triggers, adaptive result summaries. |
| Support operations | Access issues, unresolved blockers, review queue volume. |
| Safety and privacy checks | High-level audit and policy adherence indicators. |

Filters:

- date range
- cohort
- learner status
- lesson
- skill
- issue severity

Allowed actions:

- view report
- export approved summary
- open source records

Disallowed actions:

- exporting raw private data without approval
- using reports for clinical diagnosis
- exposing secrets
- exposing raw provider prompts or keys
- exposing one learner's data to another learner or parent

## Operations Module

### Support and Blockers Page

| Column | Purpose |
|---|---|
| Blocker reference | Stable operational reference. |
| Type | Account, session, content, AIM, review, technical. |
| Severity | Low, medium, high, blocking. |
| Linked record | Learner, session, content, or report reference. |
| Status | Open, investigating, waiting, resolved, deferred. |
| Responsible role | Role responsible, not hard-coded person ownership. |
| Last update | Timestamp of last operational update. |

Phase 1 status:

- Conditional.
- Useful for pilot/rollout operations.
- Should remain lightweight until operational scope is approved.

## Settings Module

Limited Phase 1 settings may include:

- cohort visibility
- approved feature flags
- report export permissions
- review queue severity labels
- content publishing gates
- notification category toggles if notification scope is approved

Settings must not include:

- AI provider secrets
- Supabase service role keys
- database credentials
- AIM formula editing
- direct database editing
- client-side role override
- production tenant management
- secret display or download

## Audit Log Module

| Column | Purpose |
|---|---|
| Timestamp | When the action occurred. |
| Actor role | Project owner, pilot admin, content manager, reviewer, system. |
| Action type | View, note, status change, export, review decision, override request. |
| Target record | Learner, session, content, review, report, or configuration reference. |
| Result | Success, blocked, failed. |
| Reason or note | Human-readable trace where needed. |

Audit logging must:

- support traceability for privileged actions
- avoid unnecessary sensitive raw data
- never expose secrets
- never be editable from normal admin UI
- be role-scoped

## Phase 1 Boundaries

### Included

- Internal dashboard scope planning.
- Overview and learner progress monitoring.
- Session and backend AIM output summaries.
- Content inventory and metadata readiness views.
- Review queue for results, feedback, content, support, and AIM issues.
- Approved reports and exports.
- Operational blockers and notes.
- Audit log for privileged actions.
- Role-scoped admin/internal navigation.

### Not Included

- Public Student Web App.
- Parent dashboard inside admin tooling.
- Learner-facing web client.
- Full production CMS.
- Billing, subscriptions, or tenant management.
- Runtime dashboard implementation.
- Backend API implementation.
- Database migrations.
- AIM Engine implementation or formula editing.
- Clinical, diagnostic, or medical learner analysis.
- Client-side AI provider integrations.
- Exposed provider keys or backend secrets.

## Screen Transition Rules

| From | To | Rule |
|---|---|---|
| Overview | Learner Summary | Open from learner alert, progress card, or activity feed. |
| Overview | Review Queue | Open from open review count or severity alert. |
| Learner Summary | Session Detail | Open recent or flagged session. |
| Session Detail | AIM Issue Detail | Open linked AIM flag or explanation reference. |
| Content Inventory | Lesson Detail | Open lesson row. |
| Lesson Detail | Question Detail | Open linked question row. |
| Review Queue | Review Item Detail | Open assigned or filtered review item. |
| Reports | Source Records | Drill down only if role has permission. |
| Any privileged page | Audit Log | Project owner or approved admin can inspect related audit entries. |

## Data and API Alignment Notes

The dashboard should consume backend-scoped API surfaces from `docs/api/api-planning-baseline.md`, especially:

- auth context
- admin learner summaries
- session summaries
- AIM output summaries
- content inventory
- review queue
- reports
- audit log
- approved override workflow if enabled

Every state-changing dashboard action must use backend-side authorization and audit logging.

The dashboard must not directly access the database from client-side code.

The dashboard must not call the AIM Engine directly.

The dashboard must not call the AI Teacher Gateway directly.

## Assumptions

- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- The admin dashboard is a separate internal web surface from Flutter Mobile.
- Learner-facing post-MVP Phase 1 experience remains Flutter Mobile unless changed by a later documented decision.
- Content manager and human reviewer workflows may share the same internal dashboard shell with role-specific permissions.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.

## Decisions

| Decision | Rationale |
|---|---|
| Keep dashboard internal-only | Prevents confusion with learner and parent surfaces. |
| Use role-scoped navigation | Reduces accidental access to privileged modules. |
| Show AIM summaries, not editable AIM internals | Preserves backend-owned AIM boundary. |
| Route issues through queues | Keeps content, review, support, and AIM concerns traceable. |
| Include audit log in Phase 1 foundation | Privileged actions require traceability from the start. |
| Keep settings limited | Prevents unsafe secret exposure or formula editing from UI. |

## Open Questions

| Question | Impact | Suggested Owner Role |
|---|---|---|
| Should safe override workflows exist in Phase 1 foundation or be deferred? | Affects Backend API and review workflow design. | Project Owner |
| Which report exports are allowed? | Affects privacy, analytics, and audit requirements. | Project Owner / Pilot Admin |
| Should content publishing require one or two approvals? | Affects content manager and reviewer workflow. | Project Owner / Content Manager |
| What exact severity levels should review items use? | Affects review queue filtering and reporting. | Pilot Admin / Human Reviewer |
| Should parent-link operations be available to admins? | Depends on final parent feature scope. | Project Owner |
| Which dashboard stack should be used? | Implementation decision; not defined in Phase 0. | Project Owner / Engineering |
| Which admin modules are required for first Phase 1 build? | Affects task sequencing. | Project Owner |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/roles-and-permissions.md`
- `docs/journeys/admin-journey.md`
- `docs/journeys/content-manager-journey.md`
- `docs/journeys/human-reviewer-journey.md`
- `docs/api/api-planning-baseline.md`
- `docs/analytics/reports-scope.md`
- `docs/security/ai-safety-privacy-rules.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/data/initial-data-model.md`

## Acceptance Notes

- Admin dashboard sitemap is defined.
- Phase 1 foundation and deferred/conditional modules are separated.
- Core pages, tables, filters, and actions are documented.
- Role-based access boundaries are documented.
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
