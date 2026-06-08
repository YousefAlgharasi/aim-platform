# AIM Phase 0 Open Decisions Log

## Purpose

This document records unresolved AIM product, technical, AI, data, security, cost, and workflow decisions after Phase 0 planning. It gives the project owner and Phase 1 team a single place to track what must be decided before or during implementation.

## Scope

This is Phase 0 planning documentation only. It does not implement backend code, Flutter code, database migrations, admin dashboard code, AIM Engine logic, API runtime code, or a Student Web App.

The log aggregates open decisions discovered across Phase 0 tasks P0-001 through P0-022 and supports final Phase 0 review in P0-024.

## Dependency Check

| Dependency Range | Expected Inputs | Status |
|---|---|---|
| P0-001 to P0-004 | Vision, readiness, roles, MVP/out-of-scope | Checked. |
| P0-005 to P0-008 | User and operator journeys | Checked. |
| P0-009 to P0-012 | Skill tree, placement, lessons, questions | Checked. |
| P0-013 to P0-015 | AI teacher, AIM Engine boundary, session data | Checked. |
| P0-016 to P0-017 | Data model and API planning | Checked. |
| P0-018 to P0-020 | Mobile/admin/notification scope | Checked. |
| P0-021 to P0-022 | Analytics/reporting and safety/privacy/data rules | Checked. |

## Decision Status Values

| Status | Meaning |
|---|---|
| Open | No final decision yet. |
| Proposed | A likely direction exists but needs approval. |
| Decided | Decision has been approved and should be reflected in implementation tasks. |
| Deferred | Not required for MVP; revisit later. |

## Open Decisions

| ID | Area | Decision Needed | Current Position | Impact if Unresolved | Recommended Owner | Status |
|---|---|---|---|---|---|---|
| OD-001 | MVP Vehicle | Is the first pilot delivered as React web/cloud only, Flutter mobile, or both? | Mobile sitemap exists, but pilot scope references React web/cloud. | Affects frontend build plan, navigation, testing, and release tasks. | Product Owner | Open |
| OD-002 | Parent Access | Is parent/guardian access included in the first MVP? | Parent journey and notifications are conditional. | Affects auth roles, linking, reports, notifications, privacy review, and scope size. | Product Owner | Open |
| OD-003 | Authentication | Will MVP use invite-only accounts only, or allow self-registration? | Current direction favors invite-only MVP. | Affects onboarding, abuse prevention, admin workload, and auth UX. | Product / Backend Lead | Proposed |
| OD-004 | Display Language | Which UI languages are required for MVP? | Arabic-speaking learners are target users; English learning content is core. | Affects UX writing, notification templates, admin content, and localization. | Product Owner | Open |
| OD-005 | Placement Depth | How many placement/diagnostic questions are required before assigning a starting point? | Conservative placement is required, exact count not locked. | Affects reliability, session length, learner confidence, and AIM initialization. | Learning Design / AIM Lead | Open |
| OD-006 | Question Types | Which question types are in MVP? | Assumed: multiple choice, fill-in-the-blank, matching. Speaking/audio is not locked. | Affects content authoring, UI, grading, data capture, and AIM evidence. | Product / Learning Design | Proposed |
| OD-007 | Voice Features | Are voice tutor, STT, or TTS features in the first MVP? | AI voice is part of broad vision but not yet locked for initial MVP scope. | Affects AI cost, latency, mobile/web capability, privacy, and accessibility. | Product / AI Lead | Open |
| OD-008 | AIM Output Display | Should learners see any mastery percentage, or only safe summaries? | Current direction favors safe summaries and no raw internal weights. | Affects trust, motivation, and privacy/safety design. | Product / AIM Lead | Proposed |
| OD-009 | Review Reminder Control | Can students fully disable review reminders, or only mute/quiet them? | Notification scope leaves this open. | Affects retention strategy, user control, and notification settings. | Product Owner | Open |
| OD-010 | Notification Inbox | Is a notification inbox required in MVP? | Mobile sitemap marks it conditional. | Affects mobile/web navigation, backend storage, and notification history. | Product / Mobile Lead | Open |
| OD-011 | Dark Mode | Is dark mode required for the MVP app? | Mobile sitemap marks this unresolved. | Affects design tokens, QA, and frontend implementation effort. | Product / UX Lead | Open |
| OD-012 | Admin Dashboard Depth | Which admin dashboard modules are MVP-critical? | Admin sitemap should stay focused on pilot operations. | Affects admin implementation size and release schedule. | Product / Admin Lead | Open |
| OD-013 | Human Review Scope | Which submissions require human review in MVP? | Disputed grading/reviewer journey exists; exact trigger thresholds not locked. | Affects reviewer workload, queues, audit logs, and trust/safety. | Product / Reviewer Lead | Open |
| OD-014 | Analytics Detail | What level of analytics is shown to students, parents, admins, and reviewers? | Safe summaries are preferred; raw internals restricted. | Affects dashboards, privacy, and reporting implementation. | Product / Data Lead | Open |
| OD-015 | Data Retention | How long should attempts, session logs, AI outputs, and audit logs be retained? | Safety/privacy rules require limits, exact policy not locked. | Affects storage, compliance, deletion requests, and audit design. | Product / Security Lead | Open |
| OD-016 | Logging Redaction | Which fields must be redacted from logs by default? | Provider secrets and sensitive learner evidence must not leak. | Affects observability, debugging, privacy, and incident response. | Backend / Security Lead | Open |
| OD-017 | Cost Guardrails | What are the pilot usage limits for AI calls, notifications, analytics, and voice? | Cost risk is known; exact budgets/quotas not locked. | Affects provider choice, rate limits, and release safety. | Product / Backend Lead | Open |
| OD-018 | AI Provider Strategy | Which AI provider/model stack is approved for MVP? | Provider keys must remain backend-only; final provider not locked here. | Affects cost, latency, safety, deployment, and quality. | Product / AI Lead | Open |
| OD-019 | Content Review Process | Who approves lessons, questions, examples, and feedback templates? | Content standards exist; workflow approval roles need finalization. | Affects quality, consistency, and release readiness. | Content Lead | Open |
| OD-020 | Parent Consent | What consent/verification process is required before parent access? | Parent linking must be verified and conservative. | Affects legal/privacy risk and parent feature release. | Product / Policy Owner | Open |
| OD-021 | Deployment Environments | Which environments are required for Phase 1: local, staging, production? | Phase 0 has planning docs; environment policy is not fully locked. | Affects CI/CD, secrets, testing, and release flow. | Engineering Lead | Open |
| OD-022 | API Error UX | How should API errors be presented to learners and parents? | API planning exists; exact UX copy and retry rules need implementation choices. | Affects reliability perception and support load. | Product / Backend Lead | Open |
| OD-023 | Offline Behavior | Does MVP support any offline lesson viewing or session recovery? | Mobile sitemap excludes offline session mode from MVP. | Affects mobile architecture, data integrity, and AIM evidence quality. | Product / Mobile Lead | Proposed |
| OD-024 | Final Phase 0 Lock | Which open decisions must be resolved before Phase 0 is considered locked? | P0-024 should classify blockers vs deferrable decisions. | Affects final review readiness. | Project Lead | Open |

## Decisions Proposed for MVP Default

These are not final unless the project owner approves them, but they are the safest defaults for Phase 1 planning.

| Decision | Proposed Default | Reason |
|---|---|---|
| Student Web App | Do not create a separate Student Web App. | Explicit Phase 0 non-negotiable. |
| AIM logic in Flutter | Do not move AIM Engine logic into Flutter. | Backend/Python AIM Engine owns adaptive behavior. |
| Parent access | Keep conditional until consent/linking is approved. | Reduces privacy and scope risk. |
| Learner scoring display | Show safe summaries, not raw AIM internals. | Protects motivation, privacy, and interpretability. |
| Review reminders | Include, but keep wording safe and controls explicit. | Supports retention without exposing internals. |
| Question types | Start with multiple choice, fill-in-the-blank, and matching. | Supports A1 MVP without voice/audio complexity. |
| Admin scope | Keep pilot operations only. | Prevents MVP scope expansion. |
| Logs | Redact secrets and sensitive learner evidence by default. | Reduces security/privacy risk. |

## Decisions That Can Be Deferred

| Decision | Why It Can Be Deferred |
|---|---|
| Dark mode | Useful but not required to validate the learning loop unless product owner requires it. |
| Full voice tutor | High cost/complexity; can follow after text-based learning loop is stable. |
| Offline mode | Risks incomplete evidence and AIM inconsistency; can wait until backend sync model is mature. |
| Marketing notifications | Not needed for MVP learning validation. |
| Leaderboards/social features | Not aligned with personalized learning MVP and may harm learner safety. |
| Payment/subscription handling | Not in Phase 0 MVP scope. |

## Acceptance Criteria for Final Review

P0-024 should treat this log as ready if:

- Every open decision has an owner or recommended owner.
- Decisions that block implementation are separated from deferrable decisions.
- Explicit non-negotiables remain preserved:
  - no Student Web App,
  - no runtime implementation in Phase 0,
  - no AIM Engine logic in Flutter,
  - no provider keys in client apps,
  - educational/non-diagnostic AI behavior.
- P0-024 can reference this file when deciding whether Phase 0 is locked.

## Cross-References

| Document | Relationship |
|---|---|
| `docs/product/risk-register.md` | Companion risk list for the decisions in this file. |
| `docs/product/mvp-scope.md` | Defines MVP inclusion/exclusion baseline. |
| `docs/product/out-of-scope.md` | Confirms deferred work and non-goals. |
| `docs/product/roles-and-permissions.md` | Defines role and access assumptions. |
| `docs/journeys/student-journey.md` | Source for learner flow decisions. |
| `docs/journeys/parent-journey.md` | Source for parent conditionality and privacy decisions. |
| `docs/mobile/mobile-sitemap.md` | Source for mobile route and screen decisions. |
| `docs/admin/admin-dashboard-sitemap.md` | Source for admin workflow decisions. |
| `docs/product/notification-scope.md` | Source for notification controls and open notification decisions. |
| `docs/product/analytics-reports-scope.md` | Source for reporting and dashboard decisions. |
| `docs/product/ai-safety-privacy-data-rules.md` | Source for safety, privacy, and data decisions. |
