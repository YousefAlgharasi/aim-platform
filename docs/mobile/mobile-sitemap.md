# AIM Mobile App Sitemap and Navigation Scope

## Purpose

This document defines the AIM mobile application screen inventory, navigation flow, feature scope boundaries, and MVP versus non-MVP classification for every screen. It is the reference document for Phase 1 Flutter mobile planning so engineers know which screens to build, which to defer, and how they connect.

## Scope

Phase 0 planning documentation only. No Flutter code, Dart source, widget implementations, or backend runtime code is produced here. The mobile app is a Flutter application that communicates exclusively with the backend API layer. The AIM Engine, AI Teacher gateway, and all AI logic run entirely on the backend. This document does not create a Student Web App. The MVP pilot uses a React web interface; this mobile sitemap describes the future Flutter mobile experience that follows the pilot.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-005 | `docs/journeys/student-journey.md` | Present. Student screens, session flow, and learner journey stages are derived from this document. |
| P0-006 | `docs/journeys/parent-journey.md` | Present. Parent dashboard and weekly report screens are derived from this document. |
| P0-017 | `docs/api/api-planning-baseline.md` | Present. All mobile screens consume data from the API groups defined there. Screen feature boundaries follow the auth and role scope rules. |

---

## Architecture Constraints

The mobile app operates within strict boundaries defined by the AIM non-negotiables and architecture rules.

**Hard rules for all mobile screens:**

- Flutter consumes AIM Engine output only. It never runs adaptive logic, mastery calculation, or recommendation rules on-device.
- Flutter never holds or exposes AI provider API keys.
- All auth is handled via Supabase JWT validated by the backend. The mobile client never self-assigns roles.
- Learner behavior labels shown in the UI must be educational and non-diagnostic. No medical or psychological framing.
- AIM recommendation authority stays with the backend. The client renders, not decides.
- Parent screens show only the linked learner's summary data, never raw attempt logs or other students' data.

---

## User Role to App Entry Map

| Role | App Entry | Authentication | Notes |
|---|---|---|---|
| Student | Student app flows | Supabase Auth JWT with `student` role | Primary learner experience. |
| Parent or Guardian | Parent section in mobile app | Supabase Auth JWT with `parent` or `guardian` role | Conditional MVP. Linked child only. |
| Pilot Admin | Admin dashboard — web-only, not in mobile app | Internal admin scope | Mobile app does not include admin dashboard. |
| Content Manager | No mobile scope | — | Content management is admin/web only. |
| Human Reviewer | No mobile scope | — | Review workflow is admin/web only. |

---

## Screen Inventory

### Legend

| Tag | Meaning |
|---|---|
| `MVP` | Must be built for Phase 1 mobile release. |
| `FUTURE` | Planned but deferred beyond Phase 1 mobile. |
| `CONDITIONAL` | Include only if the related feature is confirmed in scope. |
| `INTERNAL` | Not student-facing. Admin or debug only — not in mobile. |

### Auth Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| AUTH-01 | Launch / Splash | `MVP` | App entry point. Checks session. Routes to sign-in or dashboard. |
| AUTH-02 | Sign In | `MVP` | Email/password login via Supabase Auth. No self-registration in MVP. Invite-only. |
| AUTH-03 | Forgot Password | `MVP` | Supabase Auth password reset email flow. |
| AUTH-04 | Reset Password | `MVP` | Token-confirmed password change screen after email link. |
| AUTH-05 | Invite-Only Notice | `MVP` | Shown when a user tries to self-register. Explains pilot-only access. |
| AUTH-06 | Single Sign-On | `FUTURE` | Social login or institutional SSO. Not required for MVP pilot. |

**Navigation rule:** After successful sign-in, the app checks role and routes to the appropriate home screen. Students go to `DASH-01`. Parents go to `PAR-01`.

### Student — Onboarding Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| ONB-01 | Welcome / Pilot Intro | `MVP` | Brief welcome message explaining the AIM pilot and what the learner will do. One-time on first login. |
| ONB-02 | Profile Confirm | `MVP` | Confirms display name. Collects only data required for pilot. |
| ONB-03 | Learning Goal Select | `FUTURE` | Learner selects broad learning goal. Deferred because AIM assigns focus based on placement evidence. |
| ONB-04 | Placement Entry | `MVP` | Explains diagnostic activity and routes to `PLACE-01`. |

### Student — Placement / Diagnostic Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| PLACE-01 | Placement Question Session | `MVP` | Displays beginner-safe A1 questions one at a time. Captures answer, time, hint, and skip events. |
| PLACE-02 | Placement Result | `MVP` | Shows learner-safe summary and starting recommendation without exposing raw mastery scores. |

### Student — Dashboard Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| DASH-01 | Student Home / Dashboard | `MVP` | Main hub showing current recommended next action, assigned lessons, streak summary, and review alert. |
| DASH-02 | Progress Overview | `MVP` | Summary of completed lessons, active skills, and review needs. |
| DASH-03 | Notifications Inbox | `CONDITIONAL` | Shows learning reminders and review alerts. Include only if notification feature is confirmed. |

### Student — Lesson Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| LES-01 | Lesson List / Library | `MVP` | Displays assigned A1 lessons ordered by recommendation and assignment. |
| LES-02 | Lesson View | `MVP` | Presents explanation blocks, examples, and media. Routes to practice. |
| LES-03 | Lesson Overview | `MVP` | Summarizes lesson goals before the learner starts practice. |

### Student — Practice Session Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| SES-01 | Session Start | `MVP` | Confirms session type; backend creates or continues the session. |
| SES-02 | Question Screen | `MVP` | Core interaction screen. Captures answer, time, retries, hints, and skips. |
| SES-03 | Hint Display | `MVP` | Inline or overlaid hint content for the current question. |
| SES-04 | Question Feedback | `MVP` | Shows correct/incorrect indication and educational explanation. |
| SES-05 | Session Pause | `MVP` | Allows learner to pause and resume without losing progress. |
| SES-06 | Submission Confirmation | `MVP` | Prevents accidental submission. |
| SES-07 | Session Result | `MVP` | Shows learner-safe summary and adaptive next step from backend. |
| SES-08 | Warm-up Question | `FUTURE` | Backend-triggered easy opening question for low-confidence/frustrated learners. |
| SES-09 | Timed Practice Mode | `FUTURE` | Backend-triggered mode for pressure-error practice. |

### Student — Feedback and Recommendation Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| FEED-01 | Adaptive Result Screen | `MVP` | Shows backend-generated feedback card, encouragement, and next action. |
| FEED-02 | Next Action Card | `MVP` | Renders the backend recommendation as the primary call to action. |
| FEED-03 | Micro-Goal Status | `MVP` | Shows active micro-goals and progress. Goals are generated server-side. |
| FEED-04 | Confidence Builder Screen | `FUTURE` | Special screen for learners with high mastery and low confidence. |
| FEED-05 | Easy Win Screen | `FUTURE` | Special screen for frustrated learners. |

### Student — Review Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| REV-01 | Skills Due for Review | `MVP` | Lists skills flagged by backend retention tracker. |
| REV-02 | Review Session | `MVP` | Practice session scoped to a review skill. |
| REV-03 | Skill Progress Detail | `MVP` | Shows safe progress detail for one skill. |

### Student — Profile and Settings Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| SET-01 | Profile Screen | `MVP` | Shows display name, email, and pilot cohort. |
| SET-02 | Notification Settings | `CONDITIONAL` | Toggle notification types and frequency. |
| SET-03 | Language Display Setting | `FUTURE` | App display language preference. |
| SET-04 | Session History | `FUTURE` | Full history of completed sessions. |
| SET-05 | Sign Out | `MVP` | Clears session token and returns to sign-in. |
| SET-06 | Account Deletion Request | `FUTURE` | Learner-initiated data deletion request. |

### Parent / Guardian Screens

All parent screens are `CONDITIONAL`. Include only if parent access is confirmed in MVP scope.

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| PAR-01 | Parent Home Dashboard | `CONDITIONAL` | Shows linked learner, recent activity summary, and weekly report entry. |
| PAR-02 | Linked Learner Progress | `CONDITIONAL` | High-level lesson completion, skill summary, and review needs. |
| PAR-03 | Weekly Progress Report | `CONDITIONAL` | Backend-generated educational progress report. |
| PAR-04 | Practice Support Tips | `CONDITIONAL` | Backend-generated suggestions for supporting practice at home. |
| PAR-05 | Link to Learner | `CONDITIONAL` | Admin-approved or secure token child-linking flow. |
| PAR-06 | Contact Support | `CONDITIONAL` | Routes parent to pilot admin contact channel. |

---

## Navigation Structure

### Student App Navigation

```text
AUTH-01 (Splash)
└── AUTH-02 (Sign In)
    ├── AUTH-03 / AUTH-04 (Forgot / Reset Password)
    └── ONB-01 (Welcome — first login only)
        ├── ONB-02 (Profile Confirm)
        └── ONB-04 (Placement Entry)
            ├── PLACE-01 (Placement Session)
            └── PLACE-02 (Placement Result)
                └── DASH-01 (Student Dashboard)
                    ├── LES-01 (Lesson List)
                    │   └── LES-02 (Lesson View)
                    │       └── LES-03 (Pre-session)
                    │           └── SES-01 (Session Start)
                    │               ├── SES-02 (Question Screen)
                    │               ├── SES-03 (Hint)
                    │               ├── SES-04 (Question Feedback)
                    │               ├── SES-05 (Pause)
                    │               ├── SES-06 (Submit Confirm)
                    │               └── SES-07 (Session Result)
                    │                   └── FEED-01 (Adaptive Result)
                    │                       └── FEED-02 (Next Action)
                    ├── DASH-02 (Progress Overview)
                    │   ├── REV-01 (Skills Due for Review)
                    │   └── REV-03 (Skill Progress Detail)
                    ├── FEED-03 (Micro-Goal Status)
                    └── SET-01 (Profile / Settings)
                        └── SET-05 (Sign Out)
```

### Parent App Navigation

```text
AUTH-02 (Sign In — parent role)
└── PAR-01 (Parent Home)
    ├── PAR-02 (Linked Learner Progress)
    │   └── PAR-03 (Weekly Report)
    ├── PAR-04 (Practice Support Tips)
    ├── PAR-05 (Link to Learner — if not linked)
    └── PAR-06 (Contact Support)
```

---

## Bottom Navigation Bar (Student — MVP)

| Tab | Screen | Notes |
|---|---|---|
| Home | `DASH-01` | Default tab after sign-in. |
| Lessons | `LES-01` | Lesson library. |
| Progress | `DASH-02` | Progress overview and review needs. |
| Profile | `SET-01` | Profile and settings. |

Micro-goals and review alerts appear as dashboard cards rather than a separate tab.

---

## Screen Transition Rules

- After session result (`SES-07`), the app always shows `FEED-01` before routing to the next step.
- The backend `next_action` field drives the primary call to action in `FEED-02`.
- The client never self-assigns the next lesson, skill, difficulty, review state, or recommendation.
- After a review session, route to `FEED-01` with review context.
- Warm-up/easy-win flows are backend-triggered when implemented.
- All deep links validate auth before opening a protected route.

---

## Deep Link and Push Notification Entry Points

| Trigger | Deep Link Target | Notes |
|---|---|---|
| Review reminder notification | `REV-01` | Routes to skills due for review. |
| Micro-goal achievement | `FEED-03` | Shows updated goal progress. |
| Parent weekly report | `PAR-03` | Parent-only deep link. |
| Admin-sent support message | `SET-01` / contact UI | Admin contact path if needed. |

---

## MVP Screen Count Summary

| Category | MVP Screens | Future/Conditional Screens |
|---|---:|---:|
| Auth | 5 | 1 |
| Onboarding | 3 | 1 |
| Placement | 2 | 0 |
| Dashboard | 2 | 1 |
| Lessons | 3 | 0 |
| Sessions | 7 | 2 |
| Feedback and Results | 3 | 2 |
| Review | 3 | 0 |
| Profile and Settings | 3 | 3 |
| Parent | 0 | 6 |
| **Total** | **31** | **16** |

---

## Feature Boundaries — What Is NOT in the Mobile App

| Excluded Feature | Reason |
|---|---|
| Admin dashboard | Web-only. Admin screens are not in the mobile app. |
| Content creation or editing | Content manager workflow is web-admin only. |
| AIM algorithm or adaptive logic | Runs in backend Python AIM Engine only. Never on-device. |
| AI provider key access | Backend-only. Mobile never holds provider keys. |
| Student Web App | The MVP pilot uses React web; this document covers future Flutter mobile. |
| Raw mastery scores or AIM weights | Not shown to learners. |
| Inter-student comparison or leaderboards | Not in MVP. AIM is personalized, not competitive. |
| Offline session mode | Not in MVP. Session evidence must be backend-persisted. |

---

## Open Questions

| # | Question | Status | Impact |
|---|---|---|---|
| OQ-01 | Will the MVP pilot use React web only or move directly to Flutter mobile? | Open | Determines whether this sitemap is Phase 1 or post-pilot. |
| OQ-02 | Is parent access included in Phase 1 mobile? | Open | If yes, parent screens become MVP. |
| OQ-03 | Which question types are in scope for MVP mobile sessions? | Assumed: multiple choice, fill-in-the-blank, matching. | Speaking/audio question types require separate design. |
| OQ-04 | Is dark mode required for MVP? | Open | Should be decided before design tokens. |

---

## Assumptions

- The Flutter mobile app is a single binary for student and parent roles.
- The app targets iOS and Android.
- All backend API calls use the API groups defined in `docs/api/api-planning-baseline.md`.
- Session state is backend-persisted.
- The app renders backend recommendations but does not calculate them.
- Content is served from the backend, not bundled in the app.

---

## Cross-References

| Document | Relationship |
|---|---|
| `docs/journeys/student-journey.md` | Source for student screen journey stages. |
| `docs/journeys/parent-journey.md` | Source for parent screen and privacy rules. |
| `docs/api/api-planning-baseline.md` | API groups consumed by mobile screens. |
| `docs/product/mvp-scope.md` | MVP boundary confirmation. |
| `docs/product/roles-and-permissions.md` | Role access rules enforced on screens. |
| `docs/aim-engine/boundary-and-io-contract.md` | AIM Engine output consumed by result screens. |
| `docs/product/notification-scope.md` | Notification trigger rules for push entry points. |
