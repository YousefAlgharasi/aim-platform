# AIM Notification Scope and Rules

## Purpose

This document defines AIM notification scope for Phase 0 planning.

It specifies notification types, triggers, delivery rules, user controls, parent or guardian notification boundaries, Phase 1 limits, assumptions, non-goals, and open questions so implementation tasks can be created without changing product intent.

## Scope

This is Phase 0 planning documentation only.

This document does not implement:

- Backend notification services.
- NestJS API code.
- FastAPI routes.
- Flutter Mobile notification handlers.
- React Web code.
- Database migrations.
- Admin dashboard runtime code.
- AIM Engine logic.
- AI Teacher Gateway logic.
- A separate Student Web App.

Notifications are used to support learning continuity, review timing, and optional parent visibility. They must remain educational, privacy-preserving, and non-diagnostic.

Notification content must never expose:

- AI provider keys.
- Backend credentials.
- Supabase service role keys.
- Raw AIM Engine internals.
- Raw attempt logs.
- Hidden scoring weights.
- Raw mastery, weakness, retention, frustration, or confidence scores.
- Clinical, medical, psychological, or diagnostic interpretations.

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

Notification planning in this document is for the post-MVP Phase 1 Flutter Mobile learner client unless otherwise stated.

React Web is completed pilot context only. No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for client/AIM/credential guardrails. |
| P0-005 | `docs/journeys/student-journey.md` | Checked. Student journey defines onboarding, lesson, practice, adaptive result, review, and progress touchpoints. |
| P0-006 | `docs/journeys/parent-journey.md` | Checked. Parent access is conditional and limited to linked learner summaries. |
| P0-017 | `docs/api/api-planning-baseline.md` | Checked. Notification APIs must remain backend-authorized. |
| P0-018 | `docs/mobile/mobile-sitemap.md` | Checked. Notification entry points map to Flutter Mobile screens. |
| P0-021 | `docs/analytics/reports-scope.md` | Checked. Report summaries must be learner-safe. |
| P0-022 | `docs/security/ai-safety-privacy-rules.md` | Checked. Payload privacy and safety boundaries apply. |

## Notification Principles

| Principle | Rule |
|---|---|
| Learner-safe language | Use supportive educational wording. Avoid shame, diagnosis, clinical claims, or labels. |
| Backend authority | Backend decides notification eligibility, timing source, and payload category. |
| Flutter renders only | Flutter Mobile renders notifications, handles local permissions, and opens backend-validated routes. |
| Minimal disclosure | Lock-screen payloads must not expose sensitive learner evidence or raw AIM internals. |
| Consent and control | Learners can control optional reminders. Parent notifications require verified linking and project approval. |
| No AIM logic in Flutter | Flutter Mobile does not calculate mastery, retention, frustration, review due dates, or recommendations. |
| No provider secrets | AI provider keys and privileged backend credentials must never appear in notification payloads or client configuration. |
| Auth validation | Deep links require authentication and backend ownership validation after opening. |
| No Student Web App | Notifications must not introduce or assume a separate post-MVP Student Web App. |

## Phase 1 Notification Types

| ID | Type | Audience | Phase 1 Status | Purpose |
|---|---|---|---|---|
| NTF-01 | Review Reminder | Student | Phase 1 Foundation | Reminds learner when backend retention tracking marks a skill as due for review. |
| NTF-02 | Practice Reminder | Student | Phase 1 Foundation | Encourages learner to return to planned or assigned learning activity. |
| NTF-03 | Session Resume Reminder | Student | Phase 1 Foundation | Reminds learner about an incomplete session if safe and useful to resume. |
| NTF-04 | Weekly Progress Summary | Student | Phase 1 Foundation | Provides high-level weekly summary and directs learner to progress view. |
| NTF-05 | Micro-Goal Update | Student | Phase 1 Foundation | Alerts learner when a daily/weekly/monthly micro-goal is completed or needs attention. |
| NTF-06 | Parent Weekly Report Ready | Parent/Guardian | Conditional | Notifies verified linked parent that a safe weekly report is available. |
| NTF-07 | Parent Support Needed Notice | Parent/Guardian | Conditional | Sends a safe support prompt if learner repeatedly misses practice or needs encouragement. |
| NTF-08 | Admin Broadcast / Support Message | Student or Parent | Future / Conditional | Allows approved admin to send limited operational support notices. |
| NTF-09 | Marketing or Promotional Push | Any | Out of Scope | Not part of AIM learning loop. |

## Notification Triggers

| Notification | Trigger Source | Trigger Condition | Target Surface |
|---|---|---|---|
| Review Reminder | Backend retention tracker | A skill is due for review and learner has not reviewed it within configured window. | Flutter Mobile review screen |
| Practice Reminder | Backend study schedule / assignment state | Learner has assigned activity and no recent completion within configured window. | Flutter Mobile dashboard or lesson list |
| Session Resume Reminder | Backend session state service | Session is started, incomplete, resumable, and not stale. | Flutter Mobile session entry |
| Weekly Progress Summary | Backend reporting service | Weekly summary has been generated for learner. | Flutter Mobile progress screen |
| Micro-Goal Update | Backend goal service | Micro-goal completed, nearly missed, or reset. | Flutter Mobile goals/feed screen |
| Parent Weekly Report Ready | Backend reporting service | Linked parent exists and report is generated. | Parent surface, only if approved |
| Parent Support Needed Notice | Backend reporting/support rules | Learner has missed practice or needs support, using safe non-diagnostic wording. | Parent surface, only if approved |
| Admin Broadcast | Admin/support workflow | Approved admin sends operational notice. | Flutter Mobile notification inbox or settings route if implemented |

## Student Notification Rules

### Review Reminders

Review reminders connect to retention and learning continuity.

Rules:

- Trigger only from backend review/retention state.
- Use the least sensitive lock-screen message possible.
- Do not display raw retention score, mastery percentage, weakness type, frustration score, or internal AIM label.
- Route to authenticated review screen after ownership validation.
- Suppress duplicates if a review reminder for the same review group was recently sent.
- Cancel or expire reminder when learner completes the review session.
- Do not compute due dates locally in Flutter Mobile.

Safe wording:

> Time for a quick review. A short practice is ready for you.

### Practice Reminders

Practice reminders help maintain consistency without pressure.

Rules:

- Trigger from assigned lesson, planned activity, or backend study schedule.
- Avoid guilt language such as "you failed" or "you are behind".
- Avoid high-frequency repeats.
- Respect learner notification settings when optional reminders are disabled.
- Route to authenticated dashboard or lesson list.

Safe wording:

> Your next English practice is ready when you are.

### Session Resume Reminders

Session resume reminders help learners continue incomplete work.

Rules:

- Send only if backend marks a session as resumable.
- Do not resume directly into a question without learner action.
- Route to safe session entry or dashboard state first.
- Expire reminder when session is completed, cancelled, or stale.
- Validate session ownership server-side after the app opens.

Safe wording:

> You have a practice session waiting. Continue when you are ready.

### Weekly Progress Summaries

Weekly summaries should encourage reflection without exposing internals.

Rules:

- Summarize activity and next step at high level only.
- Do not reveal internal AIM scoring details in push payload.
- Keep details inside authenticated Flutter Mobile screens.
- Do not include raw weaknesses, frustration, or hidden scoring.
- Route to backend-approved progress summary.

Safe wording:

> Your weekly learning summary is ready.

### Micro-Goal Updates

Micro-goal notifications should encourage steady learning.

Rules:

- Trigger from backend goal state.
- Use positive language.
- Avoid competitive, leaderboard-style, or shame-based framing.
- Do not create streak-loss pressure or manipulative urgency.
- Route to goals/feed screen if implemented.

Safe wording:

> Nice work. You completed a learning goal today.

## Parent / Guardian Notification Rules

Parent notifications are conditional because parent access itself is conditional.

Rules:

- Send parent notifications only to verified linked parent or guardian accounts.
- A parent can receive notifications only for learners explicitly linked to that account.
- Parent notifications must not include raw attempt logs, internal AIM scores, weakness labels, or private learner evidence.
- Parent notifications must use supportive educational wording.
- Parent notifications should encourage support, not pressure or blame.
- Parent links must validate auth and ownership before opening parent screens.
- Parent access must not be implemented until consent, linking, and visibility scope are approved.

Allowed and forbidden parent content:

| Allowed | Not Allowed |
|---|---|
| Weekly report is ready. | Raw answers or question-level attempt logs. |
| Learner completed practice this week. | Hidden AIM mastery weights or diagnostic labels. |
| Learner may benefit from a short review. | "Your child is weak/frustrated/anxious" wording. |
| Suggested support action is available. | Cross-learner comparison or rankings. |
| Safe activity summary. | Raw behavioral scores. |

Safe wording:

> A weekly learning summary is ready for your linked learner.

## User Controls

| Control | Audience | Phase 1 Status | Notes |
|---|---|---|---|
| Enable/disable practice reminders | Student | Phase 1 Foundation | Optional reminders can be disabled. |
| Enable/disable review reminders | Student | Phase 1 Foundation with caution | Product owner should decide whether critical review reminders can be fully disabled or only muted. |
| Reminder quiet hours | Student | Phase 1 Foundation | Avoid non-critical notifications during learner-selected quiet hours. |
| Notification language | Student/Parent | Future / Conditional | Initial Phase 1 may use fixed language. |
| Parent report notifications | Parent | Conditional | Available only if parent journey is enabled. |
| Admin broadcast opt-out | Student/Parent | Future / Conditional | Operational messages may be required for support. |
| Notification history/inbox | Student | Conditional | Useful but not mandatory for first Phase 1 foundation. |

## Timing and Frequency Limits

| Rule | Phase 1 Default |
|---|---|
| Daily reminder cap | No more than 2 student reminders per day by default. |
| Review reminder frequency | At most 1 reminder per due review group per day. |
| Practice reminder frequency | At most 1 practice reminder per day. |
| Session resume reminder | At most 1 reminder for a resumable session unless learner reopens app. |
| Weekly summary | Once per week. |
| Parent weekly report | Once per linked learner per week. |
| Quiet hours | No non-critical reminders during quiet hours. |
| Duplicate suppression | Same notification type and same target should not repeat inside configured cooldown. |

## Notification Payload Boundaries

Notification payloads should be minimal and safe.

Allowed payload fields:

- Notification ID.
- Notification type.
- Target route key.
- Entity reference ID if needed, such as lesson ID, review group ID, report ID, or session ID.
- Expiry timestamp.
- Localization key.
- Safe message template key.
- Backend-generated correlation ID for audit/debugging.

Not allowed in payload:

- AI provider keys or credentials.
- Supabase service role keys.
- Database credentials.
- Raw attempts, answers, hints, retries, or detailed timestamps.
- Raw mastery score.
- Raw confidence score.
- Raw retention score.
- Raw weakness score.
- Raw frustration score.
- AIM weights or hidden formulas.
- Prompt text used by AI Teacher.
- Raw AI provider response.
- Parent-child relationship details beyond minimal backend-validated reference.
- Medical, psychological, clinical, or diagnostic labels.
- Cross-learner comparison data.

## Deep Link Routing

| Notification Type | Route Target | Auth Required | Ownership Validation |
|---|---|---|---|
| Review Reminder | Flutter Mobile review screen | Yes | Learner owns review queue. |
| Practice Reminder | Flutter Mobile dashboard or lesson list | Yes | Learner owns assignment. |
| Session Resume Reminder | Flutter Mobile session entry | Yes | Learner owns session. |
| Weekly Progress Summary | Flutter Mobile progress screen | Yes | Learner owns report. |
| Micro-Goal Update | Flutter Mobile goals/feed screen | Yes | Learner owns goal. |
| Parent Weekly Report Ready | Parent report screen if approved | Yes | Parent is linked to learner. |
| Parent Support Needed Notice | Parent support screen if approved | Yes | Parent is linked to learner. |

If the user is unauthenticated, Flutter Mobile routes first to sign-in and then revalidates the destination after login.

The client must not trust the deep link alone.

Backend ownership validation is required before displaying data.

## Admin and Operational Notifications

Admin or support notifications are not core learning functionality.

Allowed only if explicitly included:

- Schedule changes.
- Support messages related to account access.
- System maintenance notices.
- Invitation or onboarding reminders.
- Review queue assignment notice for internal roles if admin tooling supports it.

Not allowed:

- Marketing campaigns.
- Ads.
- Unapproved promotional push messages.
- Sensitive learner data.
- Raw AIM internals.
- Secrets or provider keys.
- Clinical, medical, or diagnostic alerts.

## Phase 1 Non-Goals

The Phase 1 notification scope does not include:

- Marketing or promotional push campaigns.
- Social or community notifications.
- Leaderboard or competitive ranking alerts.
- Payment, billing, or subscription notifications.
- Clinical, psychological, medical, or diagnostic alerts.
- Parent access without verified linking.
- Notification decision logic running in Flutter Mobile.
- Offline-only notification logic that bypasses backend authority.
- Complex notification personalization beyond backend-provided schedule and type.
- AI provider key usage on client devices.
- Separate Student Web App notification logic.
- Public web push notifications for a new student web surface.

## Acceptance Criteria for Phase 1 Planning

A future implementation task can use this document as acceptance-ready scope if:

- Notification types are mapped to backend source systems.
- Each notification has a target app route and auth rule.
- Parent notifications are conditional and privacy-limited.
- Payload boundaries are enforced.
- User controls and frequency caps are defined.
- No client-side AIM logic is required.
- Notification language remains educational and non-diagnostic.
- Flutter Mobile is the learner notification target for post-MVP Phase 1.
- React Web remains completed MVP pilot context only.
- No separate Student Web App is introduced.

## Open Questions

| # | Question | Current Position | Impact |
|---|---|---|---|
| OQ-01 | Should review reminders be fully disableable or only muted/quieted? | Open | Affects learner control and retention strategy. |
| OQ-02 | Is parent access included in first Phase 1 implementation? | Conditional | Determines whether NTF-06 and NTF-07 are implemented. |
| OQ-03 | What exact quiet-hour defaults should be used? | Open | Affects notification scheduling UX. |
| OQ-04 | Will Phase 1 support localized Arabic and English notification templates? | Open | Affects content and localization planning. |
| OQ-05 | Should admin broadcasts be included in Phase 1 foundation or deferred? | Open | Affects admin/support workflow scope. |
| OQ-06 | Should notification history/inbox be included in Flutter Mobile? | Conditional | Affects mobile sitemap and task sequencing. |
| OQ-07 | Should notifications be sent through FCM, local scheduling, or hybrid? | Implementation decision | Affects backend/mobile architecture. |

## Assumptions

- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- Backend owns reminder eligibility, review timing, and recommendation-driven notification decisions.
- Flutter Mobile renders notifications, opens deep links, and respects local permission state.
- Parent accounts are optional and must be explicitly linked before any parent notifications are sent.
- Notification content is stored as safe templates rather than raw AI-generated lock-screen text.
- All notification destinations are protected by auth and backend ownership checks.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.
- Phase 0 remains documentation/planning only.

## Cross-References

| Document | Relationship |
|---|---|
| `docs/product/vision.md` | Defines completed MVP pilot and post-MVP Phase 1 product direction. |
| `docs/product/non-negotiables.md` | Defines hard rules that notification implementation must preserve. |
| `docs/journeys/student-journey.md` | Defines student learning stages where notifications can support continuity. |
| `docs/journeys/parent-journey.md` | Defines conditional parent visibility, weekly reports, and privacy rules. |
| `docs/mobile/mobile-sitemap.md` | Defines Flutter Mobile notification inbox, settings, deep link targets, and parent report routes if approved. |
| `docs/api/api-planning-baseline.md` | Notification APIs should align with backend API planning boundaries. |
| `docs/product/roles-and-permissions.md` | Defines role-based access and ownership checks for notification destinations. |
| `docs/aim-engine/boundary-and-io-contract.md` | Confirms AIM Engine output is backend-owned and client-rendered only. |
| `docs/security/ai-safety-privacy-rules.md` | Defines payload privacy and learner-safe language rules. |
| `docs/analytics/reports-scope.md` | Defines safe progress/report content for summary notifications. |

## Acceptance Notes

- Dependencies checked: P0-001, P0-005, P0-006, P0-017, P0-018, P0-021, and P0-022.
- This document has a title, purpose, scope, current product direction, notification principles, notification types, triggers, student rules, parent rules, controls, frequency limits, payload boundaries, deep links, non-goals, assumptions, open questions, and cross-references.
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
- No runtime source code, Student Web App, Flutter AIM logic, notification service, database migration, or backend implementation was added.
