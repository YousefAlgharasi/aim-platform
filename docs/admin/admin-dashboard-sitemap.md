# AIM Admin Dashboard Sitemap and Modules

## Purpose

This document defines the Phase 0 sitemap and module scope for the AIM internal admin dashboard. It converts the admin journey, content manager journey, and API planning baseline into an implementation-ready planning document for Phase 1.

The dashboard is for internal pilot operations only. It is not a Student Web App, does not run AIM Engine logic, and does not expose provider keys or backend secrets.

## Scope

This document defines admin dashboard modules, navigation, MVP pages, tables, filters, allowed actions, role boundaries, AIM monitoring surfaces, non-goals, assumptions, decisions, and open questions.

This is documentation only. It does not create runtime source code, backend routes, Flutter code, dashboard UI code, database migrations, or AIM Engine code.

## Dependency Check

| Dependency | Required Output | Status | Notes |
|---|---|---|---|
| P0-007 | `docs/journeys/admin-journey.md` | Present | Defines pilot admin journey, learner support, monitoring, review, and reporting boundaries. |
| P0-008 | `docs/journeys/content-manager-journey.md` | Present | Defines content inventory, lesson/question metadata, review, publishing, and issue workflow. |
| P0-017 | `docs/api/api-planning-baseline.md` | Present | Defines admin API planning groups, backend role enforcement, and admin dashboard API scope. |

## Dashboard Principles

| Principle | Rule |
|---|---|
| Internal only | Dashboard access is limited to approved AIM operators. |
| Backend-authorized | Every privileged action must be enforced by the backend. |
| Observation before intervention | Admins inspect summaries and route issues; they do not rewrite AIM state manually. |
| Educational safety | Analytics and AI summaries stay educational and behavioral, not clinical or medical. |
| No secrets in client | Provider keys and service secrets remain backend-only. |
| No AIM logic in UI | The dashboard displays backend-produced AIM outputs only. |

## Role Access Summary

| Role | Access Scope |
|---|---|
| Project Owner | Full pilot overview, settings, reports, audit log, and approval workflows. |
| Pilot Admin | Learner support, pilot monitoring, sessions, AIM summaries, operational reports, and blockers. |
| Content Manager | Content inventory, lesson/question readiness, metadata completeness, review and publishing workflow. |
| Human Reviewer | Review queue, disputed grades, flagged feedback, content issue notes, and reviewer decisions. |
| Student | No admin dashboard access. |
| Parent | No admin dashboard access. Parent views must remain separate from internal admin tooling. |

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

| Module | MVP Status | Primary Roles | Purpose |
|---|---|---|---|
| Overview | MVP | Project Owner, Pilot Admin | Show pilot health, learner activity, alerts, open reviews, and blockers. |
| Learners | MVP | Project Owner, Pilot Admin | Support learner accounts and inspect safe progress summaries. |
| Learning Sessions | MVP | Pilot Admin, Human Reviewer | Inspect session activity and backend adaptive summaries. |
| AIM Monitoring | MVP | Project Owner, Pilot Admin, Human Reviewer | Observe AIM outputs and route unusual signals for review. |
| Content | MVP | Content Manager, Project Owner | Track lessons, questions, metadata readiness, and review status. |
| Review Queue | MVP | Human Reviewer, Content Manager, Pilot Admin | Resolve flagged grades, feedback, content, support, and AIM issues. |
| Reports | MVP | Project Owner, Pilot Admin | View pilot analytics and approved export summaries. |
| Operations | Conditional MVP | Project Owner, Pilot Admin | Track support issues and pilot blockers. |
| Settings | Limited MVP | Project Owner | Manage approved pilot configuration only. |
| Audit Log | MVP | Project Owner, Pilot Admin | Trace privileged dashboard actions. |

## Overview Module

### Pilot Overview Page

| Area | MVP Content |
|---|---|
| Summary cards | Active learners, enrolled learners, completed lessons, open review items, content issues, support blockers. |
| Recent activity | New sessions, review updates, content status changes, admin actions. |
| Alerts | Missing content, unusual AIM signals, failed sessions, learners needing support. |
| Entry links | Learners, Sessions, Review Queue, Reports. |

**Filters:** cohort, date range, learner status, severity.

**Allowed actions:** open related record, add operational note, route issue.

**Disallowed actions:** editing learner mastery, changing AIM recommendations, exposing private raw logs outside approved internal roles.

## Learners Module

### Learner List Page

| Column | Purpose |
|---|---|
| Learner reference | Identify the pilot learner safely. |
| Account status | Active, blocked, inactive, needs support. |
| Current level | Placement-derived learning level. |
| Current lesson | Current or latest lesson. |
| Completion | Progress summary. |
| Last activity | Most recent session or interaction. |
| Alerts | Support, review, or content-related flags. |

**Filters:** cohort, account status, level, last activity, alert type.

**Allowed actions:** view learner summary, add internal note, open related sessions, open review items.

**Disallowed actions:** submitting answers for learners, modifying mastery, changing grades without review workflow.

### Learner Summary Page

| Section | Content |
|---|---|
| Profile summary | Safe profile fields, role, status, cohort, language support needs. |
| Progress summary | Completed lessons, active skill areas, recent performance trend. |
| AIM summary | Backend-produced mastery and recommendation summaries with explanation references. |
| Sessions | Recent sessions with outcome and review flags. |
| Reviews | Linked open and closed review items. |
| Notes | Internal support notes with audit trail. |

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

**Filters:** date range, learner, lesson, status, flag type, review state.

### Session Detail Page

| Section | MVP Requirement |
|---|---|
| Session timeline | Start/end, lesson, attempts count, submitted answer summary. |
| Performance summary | Accuracy, timing summary, retry and hesitation indicators when available. |
| AIM output | Mastery, recommendation, or difficulty result generated by backend AIM Engine. |
| Evidence references | Explanation or audit references, not raw secret traces. |
| Linked issues | Content flags, review requests, support notes. |

**Allowed actions:** route to review, add admin note, open learner, open content item.

**Disallowed actions:** recalculating AIM results, editing AIM output directly, using clinical labels.

## AIM Monitoring Module

### AIM Output Monitor Page

| View | Content |
|---|---|
| Recommendation distribution | Counts of next lesson, review, remediation, or difficulty changes. |
| Weakness and prerequisite summary | Aggregated educational gaps only. |
| Decision conflict references | Cases where backend conflict resolver output needs review. |
| Quality flags | Low confidence, missing evidence, repeated content issue, unusual retry pattern. |

**Filters:** date range, skill, lesson, cohort, confidence, severity, review state.

**Allowed actions:** create review item, add operational note, open session detail.

**Disallowed actions:** overriding conflict resolver, editing mastery manually, running AIM Engine logic in the dashboard.

## Content Module

### Content Inventory Page

| Column | Purpose |
|---|---|
| Lesson reference | Stable lesson identifier. |
| Title | Human-readable lesson title. |
| Skill and concept | Skill tree mapping. |
| Difficulty | Beginner pilot difficulty marker. |
| Status | Draft, ready for review, approved, published, archived. |
| Metadata readiness | Required AIM metadata complete or missing. |
| Question count | Number of linked practice questions. |
| Issues | Open content flags. |

**Filters:** status, skill, concept, difficulty, reviewer, issue state, metadata completeness.

**Allowed actions:** open lesson detail, route to review, mark readiness state if authorized, create content issue note.

**Disallowed actions:** unreviewed live content changes during the pilot.

### Lesson Detail Page

| Section | MVP Requirement |
|---|---|
| Lesson metadata | Lesson ID, title, skill, concept, prerequisite, difficulty. |
| Content readiness | Required fields, examples, explanation, language support notes. |
| Questions | Linked practice questions and metadata. |
| Review state | Reviewer status, comments, approval trail. |
| Issue history | Content issues and resolutions. |

### Question Detail Page

| Section | MVP Requirement |
|---|---|
| Question metadata | Skill ID, concept, difficulty, prerequisites, common error tags. |
| Answer data | Correct answer and explanation. |
| Quality review | Review status, issue notes, clarity flags. |
| Usage signals | Aggregated pilot performance and error signals. |

## Review Queue Module

### Review Queue Page

| Queue Type | Description | Main Role |
|---|---|---|
| Disputed grade | Learner or system result needs human review. | Human Reviewer |
| Flagged feedback | AI feedback or explanation needs safety or quality review. | Human Reviewer |
| Content issue | Lesson or question quality issue needs content review. | Content Manager |
| AIM issue | Adaptive output needs investigation or owner decision. | Pilot Admin / Human Reviewer |
| Support blocker | Operational learner access issue. | Pilot Admin |

**Filters:** queue type, severity, age, role, status, learner, lesson.

**Allowed actions:** assign review, add reviewer note, set status, link resolution, escalate.

**Disallowed actions:** changing production logic, bypassing approval trail, deleting audit history.

## Reports Module

### Pilot Reports Page

| Report | MVP Content |
|---|---|
| Learner progress | Completion, active learners, skill progress summaries. |
| Lesson performance | Completion, common errors, question quality signals. |
| AIM outcomes | Recommendation distribution, review triggers, adaptive result summaries. |
| Support operations | Access issues, unresolved blockers, review queue volume. |
| Safety and privacy checks | High-level audit and policy adherence indicators. |

**Filters:** date range, cohort, learner status, lesson, skill, issue severity.

**Allowed actions:** view report, export approved pilot summary, open source records.

**Disallowed actions:** exporting raw private data without approval, using reports for clinical diagnosis, exposing secrets.

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

## Settings Module

Limited MVP settings may include pilot cohort visibility, approved feature flags, report export permissions, review queue severity labels, and content publishing gates.

Settings must not include AI provider secrets, AIM formula editing, direct database editing, client-side role override, or production tenant management.

## Audit Log Module

| Column | Purpose |
|---|---|
| Timestamp | When the action occurred. |
| Actor role | Project owner, pilot admin, content manager, reviewer. |
| Action type | View, note, status change, export, review decision. |
| Target record | Learner, session, content, review, or report reference. |
| Result | Success, blocked, failed. |
| Reason or note | Human-readable trace where needed. |

Audit logging must support traceability for privileged actions while avoiding unnecessary exposure of sensitive raw data.

## MVP Boundaries

### Included

- Internal dashboard scope planning.
- Pilot overview and learner progress monitoring.
- Session and backend AIM output summaries.
- Content inventory and metadata readiness views.
- Review queue for grades, feedback, content, support, and AIM issues.
- Pilot reports and approved exports.
- Operational blockers and notes.
- Audit log for privileged actions.

### Not Included

- Public Student Web App.
- Parent dashboard inside admin tooling.
- Full production CMS.
- Billing, subscriptions, or tenant management.
- Runtime dashboard implementation.
- Backend API implementation.
- Database migrations.
- AIM Engine implementation or formula editing.
- Clinical, diagnostic, or medical learner analysis.
- Client-side AI provider integrations or exposed provider keys.

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
| Any privileged page | Audit Log | Project owner or pilot admin can inspect related audit entries. |

## Data and API Alignment Notes

The dashboard should consume backend-scoped API surfaces from the API planning baseline, especially auth context, admin learner summaries, content inventory, reporting, and any future approved override workflow.

Every state-changing dashboard action must use backend-side authorization and audit logging.

## Assumptions

- The admin dashboard is a separate internal web surface from the Flutter mobile app.
- Supabase Auth is used for identity, while role enforcement remains backend-side.
- Learner-facing experiences remain in Flutter/mobile scope unless changed by a future decision.
- AIM Engine outputs are generated in Python/backend and displayed as summaries in the dashboard.
- Content manager and human reviewer workflows may share the same internal dashboard shell with role-specific permissions.

## Decisions

| Decision | Rationale |
|---|---|
| Keep dashboard internal-only | Prevents confusion with student and parent surfaces. |
| Use role-scoped navigation | Reduces accidental access to privileged modules. |
| Show AIM summaries, not editable AIM internals | Preserves the backend-only AIM boundary. |
| Route issues through queues | Keeps content, review, and AIM concerns traceable. |
| Include audit log in MVP | Privileged actions require traceability from the pilot stage. |

## Open Questions

| Question | Impact | Suggested Owner Role |
|---|---|---|
| Should safe override workflows exist in MVP or be deferred? | Affects Phase 1 API and review workflow design. | Project Owner |
| Which report exports are allowed during the pilot? | Affects privacy, analytics, and audit requirements. | Project Owner / Pilot Admin |
| Should content publishing require one or two approvals? | Affects content manager and reviewer workflow. | Project Owner / Content Manager |
| What exact severity levels should review items use? | Affects review queue filtering and reporting. | Pilot Admin / Human Reviewer |
| Should parent-link operations be available to pilot admins in MVP? | Depends on final parent feature scope. | Project Owner |

## Acceptance-Ready Checklist

- Admin dashboard sitemap is defined.
- MVP and non-MVP modules are separated.
- Core pages, tables, filters, and actions are documented.
- Role-based access boundaries are documented.
- AIM Engine remains backend-only.
- Flutter consumes AIM outputs only.
- No Student Web App is created.
- No runtime code, database migration, API implementation, or dashboard implementation is included.
- Open questions are captured for later decision-making.
