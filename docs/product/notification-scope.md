# AIM Notification Scope and Rules

## Purpose

This document defines the AIM notification scope for Phase 0 planning. It specifies notification types, triggers, delivery rules, user controls, parent or guardian notification boundaries, MVP limits, assumptions, non-goals, and open questions so Phase 1 implementation tasks can be created without changing product intent.

## Scope

This is documentation-only Phase 0 work. It does not implement backend services, Flutter code, database migrations, mobile notification handlers, admin dashboard code, AIM Engine logic, or API runtime code.

Notifications are used to support learning continuity, review timing, and optional parent visibility. They must remain educational, privacy-preserving, and non-diagnostic. Notification content must never expose AI provider keys, raw AIM Engine internals, raw attempt logs, hidden scoring weights, or clinical/medical interpretations.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-005 | `docs/journeys/student-journey.md` | Checked. Student journey defines onboarding, lesson, practice, adaptive result, review, and progress touchpoints. |
| P0-006 | `docs/journeys/parent-journey.md` | Checked. Parent access is conditional and limited to linked learner summaries and weekly support context. |
| P0-018 | `docs/mobile/mobile-sitemap.md` | Prepared as missing dependency output. Notification entry points map to mobile screens such as `DASH-03`, `REV-01`, `FEED-03`, `PAR-03`, and `SET-02`. |

## Notification Principles

| Principle | Rule |
|---|---|
| Learner-safe language | Use supportive educational wording. Avoid shame, diagnosis, or labels such as disorder, anxiety diagnosis, or clinical risk. |
| Backend authority | Backend decides notification eligibility, timing source, and payload. Flutter/mobile renders and schedules only what the backend permits. |
| Minimal disclosure | Notifications must not expose raw scores, attempt details, weakness classifications, or private learner evidence on the lock screen. |
| Consent and control | Students can control optional reminders. Parent notifications require verified linking and project approval. |
| No AIM logic in Flutter | The client does not calculate mastery, retention, frustration, review due dates, or recommendations. |
| No provider secrets | AI provider keys remain backend-only and must never appear in notification payloads or client configuration. |

## MVP Notification Types

| ID | Type | Audience | MVP Status | Purpose |
|---|---|---|---|---|
| NTF-01 | Review Reminder | Student | MVP | Reminds the learner when backend retention tracking marks a skill as due for review. |
| NTF-02 | Practice Reminder | Student | MVP | Encourages the learner to return to a planned or assigned learning activity. |
| NTF-03 | Session Resume Reminder | Student | MVP | Reminds the learner about an incomplete session if it is safe and useful to resume. |
| NTF-04 | Weekly Progress Summary | Student | MVP | Provides a high-level weekly summary and directs the learner to progress view. |
| NTF-05 | Micro-Goal Update | Student | MVP | Alerts the learner when a daily/weekly/monthly micro-goal is completed or needs attention. |
| NTF-06 | Parent Weekly Report Ready | Parent/Guardian | Conditional | Notifies a verified linked parent that a safe weekly report is available. |
| NTF-07 | Parent Support Needed Notice | Parent/Guardian | Conditional | Sends a safe support prompt if the learner repeatedly misses practice or needs encouragement. |
| NTF-08 | Admin Broadcast / Support Message | Student or Parent | Future/Conditional | Allows pilot admin to send limited operational support notices. |
| NTF-09 | Marketing or Promotional Push | Any | Out of Scope | Not part of the MVP learning loop. |

## Notification Triggers

| Notification | Trigger Source | Trigger Condition | Target Screen |
|---|---|---|---|
| Review Reminder | Backend retention tracker | A skill is due for review and learner has not reviewed it within configured window. | `REV-01` |
| Practice Reminder | Study schedule / assignment state | Learner has an assigned activity and no recent completion within configured window. | `DASH-01` or `LES-01` |
| Session Resume Reminder | Session state service | Session is started, incomplete, resumable, and not stale. | `SES-01` or last safe session route |
| Weekly Progress Summary | Reporting service | Weekly summary has been generated for the learner. | `DASH-02` |
| Micro-Goal Update | Goal service | Micro-goal completed, nearly missed, or reset. | `FEED-03` |
| Parent Weekly Report Ready | Reporting service | Linked parent exists and report is generated. | `PAR-03` |
| Parent Support Needed Notice | Reporting/support rules | Learner has missed practice or needs support, using safe non-diagnostic wording. | `PAR-04` |
| Admin Broadcast | Admin/support workflow | Pilot admin sends an operational notice. | `SET-01` or notification inbox |

## Student Notification Rules

### Review reminders

Review reminders are the most important MVP notification because they connect directly to retention and learning continuity.

Rules:

- Trigger only from backend review/retention state.
- Use the least sensitive message possible on lock screen.
- Do not display raw retention score, mastery percentage, weakness type, frustration score, or internal AIM label.
- Route to `REV-01` after auth validation.
- Suppress duplicates if a review reminder for the same skill was recently sent.
- Cancel or expire reminder when the learner completes the review session.

Example safe wording:

> Time for a quick review. A short practice is ready for you.

### Practice reminders

Practice reminders help maintain consistency but should not overwhelm the learner.

Rules:

- Trigger from assigned lesson, planned activity, or backend study schedule.
- Avoid guilt language such as "you failed" or "you are behind".
- Avoid high-frequency repeats.
- Route to `DASH-01` or `LES-01`.
- Respect user notification settings when optional reminders are disabled.

Example safe wording:

> Your next English practice is ready when you are.

### Session resume reminders

Session resume reminders are optional MVP notifications.

Rules:

- Send only if the backend marks a session as resumable.
- Do not resume directly into a question without user action.
- Route to a safe session entry or dashboard state first.
- Expire the reminder when the session is completed, cancelled, or stale.

Example safe wording:

> You have a practice session waiting. Continue when you are ready.

### Weekly progress summaries

Weekly student summaries should help reflection without exposing internals.

Rules:

- Summarize activity and next step at a high level.
- Do not reveal internal AIM scoring details in push payload.
- Route to `DASH-02`.
- Keep details inside authenticated app screens.

Example safe wording:

> Your weekly learning summary is ready.

### Micro-goal updates

Micro-goal notifications should encourage steady learning.

Rules:

- Trigger from backend goal state.
- Use positive language.
- Avoid competitive or leaderboard-style framing.
- Route to `FEED-03`.

Example safe wording:

> Nice work. You completed a learning goal today.

## Parent / Guardian Notification Rules

Parent notifications are conditional because parent access itself is conditional.

Rules:

- Send parent notifications only to verified linked parent or guardian accounts.
- A parent can receive notifications only for learners explicitly linked to that account.
- Parent notifications must not include raw attempt logs, internal AIM scores, weakness labels, or private learner evidence.
- Parent notifications must use supportive educational wording.
- Parent notifications should encourage support, not pressure or blame.
- Parent links must validate auth and ownership before opening `PAR-*` screens.

Allowed parent notification content:

| Allowed | Not Allowed |
|---|---|
| Weekly report is ready. | Raw answers or question-level attempt logs. |
| Learner completed practice this week. | Hidden AIM mastery weights or diagnostic labels. |
| Learner may benefit from a short review. | "Your child is weak/frustrated/anxious" wording. |
| Suggested support action is available. | Cross-learner comparison or rankings. |

Example safe wording:

> A weekly learning summary is ready for your linked learner.

## User Controls

| Control | Audience | MVP Status | Notes |
|---|---|---|---|
| Enable/disable practice reminders | Student | MVP | Optional reminders can be disabled. |
| Enable/disable review reminders | Student | MVP with caution | Product owner should decide whether critical review reminders can be fully disabled or only muted. |
| Reminder quiet hours | Student | MVP | Avoid sending notifications during learner-selected quiet hours. |
| Notification language | Student/Parent | Future | Initial MVP may use fixed language. |
| Parent report notifications | Parent | Conditional | Available only if parent journey is enabled. |
| Admin broadcast opt-out | Student/Parent | Future/Conditional | Operational messages may be required for pilot support. |

## Timing and Frequency Limits

| Rule | MVP Limit |
|---|---|
| Daily reminder cap | No more than 2 student reminders per day by default. |
| Review reminder frequency | At most 1 reminder per due review group per day. |
| Practice reminder frequency | At most 1 practice reminder per day. |
| Session resume reminder | At most 1 reminder for a resumable session unless user reopens the app. |
| Weekly summary | Once per week. |
| Parent weekly report | Once per linked learner per week. |
| Quiet hours | No non-critical reminders during quiet hours. |
| Duplicate suppression | Same notification type and same target should not repeat inside the configured cooldown. |

## Notification Payload Boundaries

Notification payloads should be minimal and safe.

Allowed payload fields:

- Notification ID.
- Notification type.
- Target route key.
- Entity reference ID if needed, such as lesson ID, review group ID, report ID, or session ID.
- Expiry timestamp.
- Localization key or safe message template key.

Not allowed in payload:

- AI provider keys or credentials.
- Raw attempts, answers, hints, retries, or timestamps.
- Raw mastery score, confidence score, retention score, weakness score, frustration score, or AIM weights.
- Prompt text used by the AI Teacher.
- Parent-child relationship details beyond the minimal linked learner reference needed by backend-validated screens.
- Medical, psychological, or diagnostic labels.

## Deep Link Routing

| Notification Type | Route | Auth Required | Ownership Validation |
|---|---|---|---|
| Review Reminder | `REV-01` | Yes | Learner owns review queue. |
| Practice Reminder | `DASH-01` / `LES-01` | Yes | Learner owns assignment. |
| Session Resume Reminder | `SES-01` | Yes | Learner owns session. |
| Weekly Progress Summary | `DASH-02` | Yes | Learner owns report. |
| Micro-Goal Update | `FEED-03` | Yes | Learner owns goal. |
| Parent Weekly Report Ready | `PAR-03` | Yes | Parent is linked to learner. |
| Parent Support Needed Notice | `PAR-04` | Yes | Parent is linked to learner. |

If the user is unauthenticated, the app routes first to sign-in and then revalidates the destination after login. The client must not trust the deep link alone.

## Admin and Operational Notifications

Admin or support notifications are not core MVP learning functionality.

Allowed only if explicitly included:

- Pilot schedule changes.
- Support messages related to account access.
- System maintenance notices.
- Invitation or onboarding reminders.

Not allowed:

- Marketing campaigns.
- Ads.
- Unapproved promotional push messages.
- Any notification that exposes sensitive learner data.

## MVP Non-Goals

The MVP notification scope does not include:

- Marketing or promotional push campaigns.
- Social or community notifications.
- Leaderboard or competitive ranking alerts.
- Payment, billing, or subscription notifications.
- Clinical, psychological, medical, or diagnostic alerts.
- Parent access without verified linking.
- Notification decision logic running in Flutter.
- Offline-only notification logic that bypasses backend authority.
- Complex notification personalization beyond backend-provided schedule and type.
- AI provider key usage on client devices.

## Acceptance Criteria for Phase 1 Planning

A future implementation task can use this document as acceptance-ready scope if:

- Notification types are mapped to backend source systems.
- Each notification has a target app route and auth rule.
- Parent notifications are conditional and privacy-limited.
- Payload boundaries are enforced.
- User controls and frequency caps are defined.
- No client-side AIM logic is required.
- Notification language remains educational and non-diagnostic.

## Open Questions

| # | Question | Current Position | Impact |
|---|---|---|---|
| OQ-01 | Should review reminders be fully disableable or only muted/quieted? | Open | Affects learner control and retention strategy. |
| OQ-02 | Is parent access included in the first MVP release? | Conditional | Determines whether `NTF-06` and `NTF-07` are implemented. |
| OQ-03 | What exact quiet-hour defaults should be used? | Open | Affects notification scheduling UX. |
| OQ-04 | Will MVP support localized Arabic and English notification templates? | Open | Affects content and localization planning. |
| OQ-05 | Should admin broadcasts be included in MVP or deferred? | Open | Affects admin/support workflow scope. |
| OQ-06 | Should notification history/inbox be included on mobile? | Conditional | `DASH-03` depends on this decision. |

## Assumptions

- The backend owns reminder eligibility, review timing, and recommendation-driven notification decisions.
- Flutter/mobile only renders notifications, opens deep links, and respects local permission state.
- Parent accounts are optional and must be explicitly linked before any parent notifications are sent.
- The first MVP prioritizes review, practice, resume, and weekly summary notifications.
- Notification content is stored as safe templates rather than raw AI-generated lock-screen text.
- All notification destinations are protected by auth and server-side ownership checks.

## Cross-References

| Document | Relationship |
|---|---|
| `docs/journeys/student-journey.md` | Defines student learning stages where notifications can support continuity. |
| `docs/journeys/parent-journey.md` | Defines conditional parent visibility, weekly reports, and privacy rules. |
| `docs/mobile/mobile-sitemap.md` | Defines notification inbox, settings, deep link targets, and parent report routes. |
| `docs/api/api-planning-baseline.md` | Future notification APIs should align with backend API planning boundaries. |
| `docs/product/roles-and-permissions.md` | Defines role-based access and ownership checks for notification destinations. |
| `docs/aim-engine/boundary-and-io-contract.md` | Confirms AIM Engine output is backend-owned and client-rendered only. |

## Verification Report

| Check | Result |
|---|---|
| Required output exists | `docs/product/notification-scope.md` prepared. |
| Title, purpose, scope included | Yes. |
| Dependencies checked and noted | Yes: P0-005, P0-006, P0-018. |
| Runtime source code created | No. |
| Student Web App created | No. |
| AIM algorithm moved into Flutter | No. |
| Empty placeholder sections | No. |
| Ready to mark Done in Notion | Only after `docs/mobile/mobile-sitemap.md` and this file are committed to `main`. |
