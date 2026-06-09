# AIM Flutter Mobile Sitemap

## Purpose

This document defines the post-MVP Phase 1 Flutter Mobile learner client sitemap for AIM. It describes the mobile app screens, navigation structure, learner flows, backend dependencies, and strict client boundaries.

## Scope

This is Phase 0 planning documentation only.

This document does not implement:

- Flutter Mobile code.
- Backend API code.
- React Web code.
- Database migrations.
- AIM Engine logic.
- AI Teacher Gateway logic.
- Admin dashboard runtime code.
- A separate Student Web App.

The Flutter Mobile app is a learner client only. It displays backend-approved lessons, progress, recommendations, and feedback. It must not run, duplicate, approximate, or reimplement AIM Engine logic.

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

React Web was the completed MVP pilot learner interface.

Flutter Mobile is the approved post-MVP Phase 1 learner client.

FastAPI was the completed MVP pilot backend API.

NestJS + TypeScript is the post-MVP Phase 1 Backend API.

The Flutter Mobile app consumes backend APIs and backend-approved AIM outputs only. It must not calculate mastery, student level, weakness, difficulty, retention, or recommendations locally.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for client/AIM boundary rules. |
| P0-005 | `docs/journeys/student-journey.md` | Checked for learner journey flow. |
| P0-014 | `docs/aim-engine/boundary-and-io-contract.md` | Checked for backend-owned AIM output rules. |
| P0-017 | `docs/api/api-planning-baseline.md` | Checked for mobile API surface. |
| P0-020 | `docs/product/notification-scope.md` | Checked for notification-related screens. |
| P0-021 | `docs/analytics/reports-scope.md` | Checked for learner-safe progress/reporting screens. |
| P0-022 | `docs/security/ai-safety-privacy-rules.md` | Checked for privacy and safety boundaries. |

## Mobile App Role

The Flutter Mobile app is responsible for:

- Authentication UI.
- Learner onboarding UI.
- Placement flow UI.
- Lesson and practice UI.
- Attempt submission UI.
- AI Teacher interaction UI.
- Learner-safe feedback UI.
- Progress and review UI.
- Notification and reminder settings UI.
- Profile/settings UI.

The Flutter Mobile app is not responsible for:

- AIM Engine calculation.
- Mastery calculation.
- Student level calculation.
- Weakness detection.
- Difficulty adaptation.
- Retention scheduling.
- Recommendation generation.
- AI provider calls.
- AI Teacher Gateway execution.
- Backend authorization decisions.
- Admin-only analytics.

## Navigation Overview

```text
App Root
├── Splash / Bootstrap
├── Auth
│   ├── Sign In
│   ├── Sign Up
│   ├── Forgot Password
│   └── Verify Account
├── Onboarding
│   ├── Welcome
│   ├── Learner Profile Setup
│   ├── Goal Setup
│   └── Placement Intro
├── Placement
│   ├── Placement Question Flow
│   ├── Placement Completion
│   └── Starting Level Result
├── Main Shell
│   ├── Home
│   ├── Learn
│   ├── Review
│   ├── Progress
│   └── Profile
├── Lesson Flow
│   ├── Lesson Overview
│   ├── Lesson Content
│   ├── Practice Question
│   ├── AI Teacher Help
│   ├── Session Summary
│   └── Next Recommendation
├── Notifications
│   ├── Notification Preferences
│   └── Reminder Settings
└── Error / Empty States
    ├── Offline State
    ├── Session Error
    ├── Content Unavailable
    └── Auth Expired
```

## Screen Inventory

| Area | Screen | Purpose | Backend Dependency |
|---|---|---|---|
| Bootstrap | Splash / Bootstrap | Check auth state, feature flags, and app readiness. | Auth/session API |
| Auth | Sign In | Authenticate learner with Supabase Auth. | Supabase Auth + Backend session validation |
| Auth | Sign Up | Create learner account. | Supabase Auth + Backend profile creation |
| Auth | Forgot Password | Recover account access. | Supabase Auth |
| Auth | Verify Account | Complete email/OTP verification if needed. | Supabase Auth |
| Onboarding | Welcome | Explain AIM learning experience safely. | None or config |
| Onboarding | Learner Profile Setup | Collect basic learner profile fields. | Student profile API |
| Onboarding | Goal Setup | Collect learner goals/preferences. | Goals/profile API |
| Onboarding | Placement Intro | Explain placement without overpromising level accuracy. | Placement config API |
| Placement | Placement Question Flow | Display placement questions and collect answers. | Placement/session API |
| Placement | Placement Completion | Submit placement and wait for backend result. | Backend API + AIM Engine |
| Placement | Starting Level Result | Show learner-safe starting level. | Backend-approved placement result |
| Main | Home | Show next recommended action, current lesson, and safe progress summary. | AIM next-action API |
| Main | Learn | Show assigned lessons and available learning path. | Lessons API |
| Main | Review | Show due reviews and retention practice. | Review API |
| Main | Progress | Show learner-safe progress and achievements. | Student progress API |
| Main | Profile | Show account, language, and settings entry points. | Profile/settings API |
| Lesson | Lesson Overview | Show lesson title, goals, estimated time, and prerequisites. | Lessons API |
| Lesson | Lesson Content | Render lesson blocks. | Lessons API |
| Lesson | Practice Question | Display question and collect attempt data. | Session attempts API |
| Lesson | AI Teacher Help | Ask for explanation/help through backend. | Backend AI Teacher endpoint |
| Lesson | Session Summary | Show safe summary after session completion. | Session complete API |
| Lesson | Next Recommendation | Show backend-selected next action. | AIM recommendation API |
| Notifications | Notification Preferences | Manage notification categories. | Notification preferences API |
| Notifications | Reminder Settings | Manage learning reminders. | Notification/reminder API |
| Error | Offline State | Explain limited connectivity safely. | Local app state |
| Error | Session Error | Recover from submission/session failure. | Session API |
| Error | Content Unavailable | Handle missing lesson/content safely. | Lessons API |
| Error | Auth Expired | Re-authenticate learner. | Auth API |

## Main Shell Tabs

| Tab | Purpose | Notes |
|---|---|---|
| Home | Give the learner one clear next action. | Must use backend recommendation, not local inference. |
| Learn | Show lessons and current path. | Lesson availability comes from backend. |
| Review | Show due review practice. | Review schedule comes from backend AIM/retention output. |
| Progress | Show learner-safe progress. | Avoid raw AIM internals and diagnostic wording. |
| Profile | Account, settings, language, notification preferences. | No privileged settings. |

## Home Screen

The Home screen should prioritize clarity and reduce cognitive load for A1 learners.

### Content

- Greeting.
- Current recommended lesson or review.
- Continue button.
- Short learner-safe progress summary.
- Due review card if applicable.
- Reminder card if enabled.
- Safe encouragement message.

### Backend Inputs

- `GET /auth/me`
- `GET /aim/students/me/next-action`
- `GET /students/me/progress`
- `GET /reviews/students/me/due`

### Rules

- Do not calculate the next lesson locally.
- Do not infer difficulty locally.
- Do not expose hidden AIM debug fields.
- Do not show clinical, medical, or diagnostic language.
- Do not show speed as a score that affects mastery.

## Learn Screen

The Learn screen shows available lessons and current path.

### Content

- Current assigned lesson.
- Completed lessons.
- Locked or future lessons if backend provides them.
- Simple lesson metadata:
  - title
  - skill
  - estimated duration
  - difficulty label
  - completion status

### Backend Inputs

- `GET /lessons`
- `GET /lessons/{lesson_id}`
- `GET /aim/students/me/next-action`

### Rules

- Lesson availability must come from backend rules.
- Flutter must not unlock lessons by local AIM calculations.
- Flutter may cache display data, but backend remains source of truth.

## Lesson Flow

```text
Lesson Overview
    ↓
Lesson Content
    ↓
Practice Question(s)
    ↓
Optional AI Teacher Help
    ↓
Submit Attempts
    ↓
Complete Session
    ↓
Backend AIM Processing
    ↓
Session Summary
    ↓
Next Recommendation
```

## Practice Question Screen

### Captured Client Events

The Flutter app may capture and send:

- `question_id`
- `session_position`
- `attempt_number`
- `submitted_answer`
- `is_correct` if validated by backend or approved local question payload
- `response_time_seconds`
- `hint_used`
- `skip_flag`
- `answer_changed_flag`
- `ai_teacher_invoked_before_attempt`

### Rules

- Capturing `response_time_seconds` is allowed.
- Response time must not directly affect mastery, student level, or direct difficulty increase.
- Response time may only be used by backend as educational behavior evidence.
- Flutter must not turn speed into local mastery, level, or difficulty decisions.

## AI Teacher Help Screen

The AI Teacher Help screen allows the learner to request safe explanations.

### Allowed Help Types

- Explain more.
- Give example.
- Explain step.
- Explain why.
- Retry with help.

### Backend Dependency

Flutter calls the Backend API only. The Backend API calls the AI Teacher Gateway internally.

### Rules

- Flutter must never call AI providers directly.
- Flutter must never store AI provider keys.
- Flutter must never expose provider prompts or raw provider outputs.
- Explanations must be learner-safe, educational, non-clinical, non-medical, and non-diagnostic.
- AI Teacher output must not override AIM Engine recommendation authority.

## Session Summary Screen

### Content

- Completion message.
- Learner-safe feedback.
- Correct/incorrect count if safe and useful.
- Skill practiced.
- Backend-approved progress change.
- Backend-approved next recommendation.
- Continue action.

### Do Not Show

- Raw frustration score.
- Raw weakness score if it could be discouraging or unsafe.
- Hidden AIM debug fields.
- Diagnostic labels.
- Provider prompts.
- Secret scoring formulas.
- Speed as a mastery score.

## Progress Screen

The Progress screen shows learner-safe progress.

### Content

- Overall progress percentage.
- Skills practiced.
- Current learning band or level in safe language.
- Review due count.
- Streak or activity summary if implemented.
- Recent completed lessons.
- Encouraging educational insights.

### Backend Inputs

- `GET /students/me/progress`
- `GET /students/me/skill-states`
- `GET /reviews/students/me/schedule`

### Rules

- Progress values are backend-approved.
- Flutter must not calculate mastery locally.
- Flutter must not calculate student level locally.
- Flutter must not expose internal AIM diagnostic-like values.
- Language must remain educational and supportive.

## Review Screen

The Review screen shows skills due for spaced review.

### Content

- Due review list.
- Review lesson cards.
- Reason in learner-safe language, such as "Time to refresh this skill."
- Start review button.

### Backend Inputs

- `GET /reviews/students/me/due`
- `GET /reviews/students/me/schedule`

### Rules

- Retention schedule is backend-owned.
- Flutter must not calculate retention locally.
- Flutter must not create review tasks without backend approval.

## Profile and Settings

### Content

- Display name.
- Language preference.
- Notification preferences.
- Reminder settings.
- Account actions.
- Privacy/help links.

### Rules

- No privileged credentials.
- No admin-only data.
- No internal AIM state editing.
- No provider configuration.
- No debug controls for normal learners.

## Notification and Reminder Screens

### Notification Categories

- Learning reminders.
- Review reminders.
- Session continuation reminders.
- Progress summary reminders if approved.

### Rules

- Notification payloads must be privacy-safe.
- Lock-screen text must not expose sensitive learner evidence.
- Notification settings must respect user control.
- Notification content must not include raw AIM internals.
- Notification content must not use clinical, medical, or diagnostic wording.

## Empty and Error States

| State | Message Style | Rule |
|---|---|---|
| No assigned lesson | Calm and actionable. | Ask backend for next action; do not infer locally. |
| No reviews due | Positive and simple. | Do not fabricate retention status. |
| Offline | Explain that some features need connection. | Do not run AIM locally. |
| Session submit failed | Preserve local attempt payload and retry safely. | Do not complete session locally. |
| Auth expired | Ask learner to sign in again. | Do not expose token details. |
| Content unavailable | Show safe fallback. | Do not generate lesson content locally. |

## Client-Side State Boundaries

Flutter Mobile may store temporary UI state, such as:

- selected tab
- current question index
- unsent attempt payload before retry
- theme/language preference
- cached lesson display data
- cached backend-approved progress summary

Flutter Mobile must not store or calculate authoritative AIM state, including:

- mastery
- student level
- weakness
- difficulty
- retention
- final recommendation authority
- AI provider prompts
- AI provider keys
- privileged backend credentials

## Feature-First Flutter Planning

Implementation planning should use feature-first Flutter organization.

Suggested top-level feature areas:

```text
lib/features/auth/
lib/features/onboarding/
lib/features/placement/
lib/features/home/
lib/features/lessons/
lib/features/practice/
lib/features/ai_teacher/
lib/features/reviews/
lib/features/progress/
lib/features/notifications/
lib/features/profile/
```

Each feature should follow the project-preferred structure where applicable:

```text
feature_name/
├── data/
│   ├── datasources/
│   ├── models/
│   └── repository/
│       └── repo_impl/
├── logic/
│   ├── entity/
│   ├── provider/
│   └── repository/
└── ui/
    ├── pages/
    └── widgets/
```

## Riverpod Planning

Flutter state management should use Riverpod with project-preferred StateNotifier-style providers unless a later implementation decision changes this.

State providers may manage:

- loading states
- current screen state
- form state
- cached response state
- retry/error state

State providers must not implement AIM Engine calculations.

## API Dependency Summary

| Mobile Area | Backend API Group |
|---|---|
| Auth | `/auth` |
| Profile | `/students/me` |
| Placement | Placement/session endpoints |
| Home | `/aim/students/me/next-action`, `/students/me/progress` |
| Lessons | `/lessons` |
| Practice | `/sessions` |
| AI Teacher Help | `/sessions/{id}/ai-teacher` or equivalent backend endpoint |
| Reviews | `/reviews` |
| Goals | `/goals` |
| Progress | `/students/me/progress`, `/students/me/skill-states` |
| Notifications | Notification preference/reminder endpoints |
| Settings | Profile/settings endpoints |

## Non-Goals

This document does not:

- Implement Flutter Mobile code.
- Implement backend API code.
- Implement React Web code.
- Create database migrations.
- Create AIM Engine code.
- Create AI Teacher Gateway code.
- Create a separate Student Web App.
- Define final visual UI design.
- Define final Flutter routing implementation.
- Move AIM Engine logic into Flutter Mobile.
- Allow Flutter to calculate mastery, student level, weakness, difficulty, retention, or recommendations locally.

## Assumptions

- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- The mobile app is online-first for AIM processing.
- Any offline retry behavior must not compute AIM decisions locally.
- Parent access is not included unless a later documented decision approves it with privacy controls.
- No separate Student Web App is planned for post-MVP unless a later documented decision changes this.

## Open Questions

| Question | Current Handling |
|---|---|
| Should the app include bottom navigation or a simpler home-first flow? | Bottom navigation is acceptable for Phase 1 planning, but final UX can be refined later. |
| Should lesson attempt submission happen per question or at session completion? | Align with API planning; session completion batch is acceptable for early Phase 1. |
| Should notifications be implemented in first Phase 1 build? | Depends on notification scope and privacy-safe payload approval. |
| Should parent visibility be included? | Conditional; do not implement unless approved with consent/linking/privacy rules. |
| How much progress detail should learners see? | Keep learner-safe and avoid raw AIM internals. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/api/api-planning-baseline.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/data/session-data-capture.md`
- `docs/analytics/reports-scope.md`
- `docs/security/ai-safety-privacy-rules.md`
- `docs/product/notification-scope.md`
- `docs/journeys/student-journey.md`

## Acceptance Notes

- This document has a title, purpose, scope, current product direction, phase clarification, navigation overview, screen inventory, client boundaries, API dependencies, assumptions, open questions, and related documents.
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
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.
