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
| `CONDITIONAL` | Include only if the related feature (parent access, notifications) is confirmed in scope. |
| `INTERNAL` | Not student-facing. Admin or debug only — not in mobile. |

---

### Auth Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| AUTH-01 | Launch / Splash | `MVP` | App entry point. Checks session. Routes to sign-in or dashboard. |
| AUTH-02 | Sign In | `MVP` | Email/password login via Supabase Auth. No self-registration in MVP. Invite-only. |
| AUTH-03 | Forgot Password | `MVP` | Supabase Auth password reset email flow. |
| AUTH-04 | Reset Password | `MVP` | Token-confirmed password change screen after email link. |
| AUTH-05 | Invite-Only Notice | `MVP` | Shown when a user tries to self-register. Explains pilot-only access. |
| AUTH-06 | Single Sign-On (SSO) | `FUTURE` | Social login or institutional SSO. Not required for MVP pilot. |

**Navigation rule:** After successful sign-in, the app checks role and routes to the appropriate home screen. Students go to `DASH-01`. Parents go to `PAR-01`.

---

### Student — Onboarding Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| ONB-01 | Welcome / Pilot Intro | `MVP` | Brief welcome message explaining the AIM pilot and what the learner will do. One-time on first login. |
| ONB-02 | Profile Confirm | `MVP` | Confirms display name. Collects only data required for pilot. No unnecessary personal fields. |
| ONB-03 | Learning Goal Select | `FUTURE` | Learner selects broad learning goal. Deferred — AIM assigns focus based on placement evidence, not self-reported goal. |
| ONB-04 | Placement Entry | `MVP` | Explains the placement or diagnostic activity and gives the learner confidence before starting. Routes to `PLACE-01`. |

---

### Student — Placement / Diagnostic Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| PLACE-01 | Placement Question Session | `MVP` | Displays beginner-safe A1 questions one at a time. Captures answer, time, hint, and skip events. Sends attempts to backend. |
| PLACE-02 | Placement Result | `MVP` | Shows learner-safe summary of placement outcome and starting recommendation. Does not expose raw mastery scores. Routes to `DASH-01`. |

---

### Student — Dashboard Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| DASH-01 | Student Home / Dashboard | `MVP` | Main hub after sign-in. Shows: current recommended next action, assigned lessons, streak summary, and review alert if any. |
| DASH-02 | Progress Overview | `MVP` | Summary of completed lessons, active skills, and review needs. No raw internal AIM scores visible. |
| DASH-03 | Notifications Inbox | `CONDITIONAL` | Shows learning reminders and review alerts. Include only if notification feature is confirmed. See `docs/product/notification-scope.md`. |

---

### Student — Lesson Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| LES-01 | Lesson List / Library | `MVP` | Displays assigned A1 lessons for the learner. Shows completion status. Ordered by recommendation and assignment. |
| LES-02 | Lesson View | `MVP` | Presents lesson content: explanation blocks, examples, and media. Ends with a clear entry point to practice. Routes to `SES-01`. |
| LES-03 | Lesson Overview (Pre-session) | `MVP` | Brief summary of what the lesson covers before the learner starts practice. Sets expectations clearly. |

---

### Student — Practice Session Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| SES-01 | Session Start | `MVP` | Confirms session type and gives the learner a ready signal. Backend creates or continues the session. |
| SES-02 | Question Screen | `MVP` | Core interaction screen. Displays one question at a time. Supports: multiple choice, fill-in-the-blank, and matching in MVP. Captures answer, time, retries, hints, and skips. |
| SES-03 | Hint Display | `MVP` | Inline or overlaid hint content for the current question. Hint usage is captured as an attempt field. |
| SES-04 | Question Feedback | `MVP` | After each answer: shows correct/incorrect indication and brief educational explanation. Does not expose AIM internal scores. |
| SES-05 | Session Pause | `MVP` | Allows learner to pause and resume without losing progress. Backend persists session state. |
| SES-06 | Session Submission Confirmation | `MVP` | Confirms the learner wants to submit the session. Prevents accidental submission. |
| SES-07 | Session Result | `MVP` | Shows learner-safe summary after session submission: questions completed, highlights of what went well, and adaptive next step from backend. Routes to `FEED-01`. |
| SES-08 | Warm-up Question | `FUTURE` | AIM-directed easy opening question for frustrated or low-confidence learners. Flagged by backend. Implementation deferred to after core session loop is stable. |
| SES-09 | Timed Practice Mode | `FUTURE` | Special session mode for Type 3 pressure-error learners. Backend triggers. Deferred beyond MVP. |

---

### Student — Feedback and Recommendation Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| FEED-01 | Adaptive Result Screen | `MVP` | Learner-safe feedback card generated from the backend AIM Engine result. Shows: session summary, encouragement, and the single recommended next action (e.g., continue skill, review, rest). |
| FEED-02 | Next Action Card | `MVP` | Clear call-to-action card. Derived from backend recommendation. Examples: "Practice again", "Try a review", "You are ready for the next topic". |
| FEED-03 | Micro-Goal Status | `MVP` | Shows the current active micro-goals (daily, weekly, monthly) and progress toward each. Goals are generated by the backend AIM Engine and stored server-side. |
| FEED-04 | Confidence Builder Screen | `FUTURE` | Special screen for learners in the Doubter state (high mastery, low confidence). AIM-triggered. Deferred beyond MVP. |
| FEED-05 | Easy Win Screen | `FUTURE` | Special screen for frustrated learners. Serves a guaranteed-success question first. AIM-triggered. Deferred beyond MVP. |

---

### Student — Review Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| REV-01 | Skills Due for Review | `MVP` | Lists skills where retention has dropped below the review threshold. Data comes from backend retention tracker. |
| REV-02 | Review Session | `MVP` | Practice session scoped to a skill flagged for review. Uses the standard `SES-02` question screen with review context. |
| REV-03 | Skill Progress Detail | `MVP` | Shows progress for a single skill: lesson completion, review status, and next recommendation. No raw mastery percentage shown unless safe to display. |

---

### Student — Profile and Settings Screens

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| SET-01 | Profile Screen | `MVP` | Shows display name, email, and pilot cohort. Learner can update display name. |
| SET-02 | Notification Settings | `CONDITIONAL` | Toggle notification types and frequency. Include only if notification feature is confirmed. |
| SET-03 | Language Display Setting | `FUTURE` | App display language preference. MVP uses a fixed display language. |
| SET-04 | Session History | `FUTURE` | Full history of completed sessions. Deferred beyond MVP. Dashboard progress overview covers MVP needs. |
| SET-05 | Sign Out | `MVP` | Clears session token and returns to `AUTH-02`. |
| SET-06 | Account Deletion Request | `FUTURE` | Learner-initiated data deletion request. Handled through admin/support flow initially. |

---

### Parent / Guardian Screens

All parent screens are `CONDITIONAL`. Include only if parent access is confirmed in MVP scope per `docs/journeys/parent-journey.md`.

| ID | Screen Name | Tag | Purpose |
|---|---|---|---|
| PAR-01 | Parent Home Dashboard | `CONDITIONAL` | Shows linked learner name, recent activity summary, and weekly report entry. |
| PAR-02 | Linked Learner Progress | `CONDITIONAL` | High-level view of linked learner's lesson completion, skill summary, and review needs. No raw AIM scores or attempt details. |
| PAR-03 | Weekly Progress Report | `CONDITIONAL` | Auto-generated backend report summary. Educational language only. No clinical or diagnostic framing. |
| PAR-04 | Practice Support Tips | `CONDITIONAL` | Backend-generated suggestions for how the parent can support practice at home. |
| PAR-05 | Link to Learner | `CONDITIONAL` | Flow for linking a parent account to a learner via admin-approved invite or secure token. No public self-linking. |
| PAR-06 | Contact Support | `CONDITIONAL` | Routes parent to pilot admin contact channel for help or questions. |

---

## Navigation Structure

### Student App Navigation

```
AUTH-01 (Splash)
└── AUTH-02 (Sign In)
    ├── AUTH-03 / AUTH-04 (Forgot / Reset Password)
    └── ONB-01 (Welcome — first login only)
        ├── ONB-02 (Profile Confirm)
        └── ONB-04 (Placement Entry)
            ├── PLACE-01 (Placement Session)
            └── PLACE-02 (Placement Result)
                └── DASH-01 (Student Dashboard) ◄── Main Hub
                    │
                    ├── LES-01 (Lesson List)
                    │   └── LES-02 (Lesson View)
                    │       └── LES-03 (Pre-session)
                    │           └── SES-01 (Session Start)
                    │               ├── SES-02 (Question Screen)
                    │               │   ├── SES-03 (Hint)
                    │               │   └── SES-04 (Question Feedback)
                    │               ├── SES-05 (Pause)
                    │               ├── SES-06 (Submit Confirm)
                    │               └── SES-07 (Session Result)
                    │                   └── FEED-01 (Adaptive Result)
                    │                       └── FEED-02 (Next Action)
                    │
                    ├── DASH-02 (Progress Overview)
                    │   ├── REV-01 (Skills Due for Review)
                    │   │   └── REV-02 (Review Session) [flows like SES]
                    │   └── REV-03 (Skill Progress Detail)
                    │
                    ├── FEED-03 (Micro-Goal Status)
                    │
                    └── SET-01 (Profile / Settings)
                        └── SET-05 (Sign Out)
```

### Parent App Navigation

```
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

The primary navigation in the student app uses a bottom navigation bar with four tabs:

| Tab | Icon | Screen | Notes |
|---|---|---|---|
| Home | House icon | `DASH-01` | Default tab on launch after sign-in. |
| Lessons | Book icon | `LES-01` | Lesson library. |
| Progress | Chart icon | `DASH-02` | Progress overview and review needs. |
| Profile | Person icon | `SET-01` | Profile and settings. |

Micro-goals (`FEED-03`) and review alerts are accessible from the Home tab as cards, not as a separate bottom-navigation tab.

---

## Screen Transition Rules

- After session result (`SES-07`), the app always shows `FEED-01` before routing to the next step.
- The backend `next_action` field from the adaptive result drives the primary call to action in `FEED-02`. The client renders whichever action the backend recommends.
- After completing all lessons in a skill, the client routes back to `DASH-01` for a new recommendation. It does not self-assign the next skill.
- After a review session (`REV-02`), route to `FEED-01` with review context, then back to `REV-01` or `DASH-01` depending on remaining review queue.
- Easy-win and warm-up screens (`SES-08`, `FEED-05`) are triggered by a backend flag on the session start response. The mobile app must check this flag and branch accordingly when these screens are implemented.
- Placement result (`PLACE-02`) routes to `DASH-01` once placement is complete. If placement is not required for a cohort, the onboarding flow routes directly to `DASH-01`.

---

## Deep Link and Push Notification Entry Points

| Trigger | Deep Link Target | Notes |
|---|---|---|
| Review reminder notification | `REV-01` | Routes to skills due for review. |
| Micro-goal achievement | `FEED-03` | Shows updated goal progress. |
| Admin-sent support message | `SET-01` / contact UI | Admin contact path if needed. |
| Parent weekly report | `PAR-03` | Parent-only deep link. |

All deep links must validate auth state first. An unauthenticated deep link routes to `AUTH-02`.

---

## MVP Screen Count Summary

| Category | MVP Screens | Future/Conditional Screens |
|---|---|---|
| Auth | 5 | 1 |
| Onboarding | 3 | 1 |
| Placement | 2 | 0 |
| Dashboard | 2 | 1 |
| Lessons | 3 | 0 |
| Sessions | 7 | 2 |
| Feedback and Results | 3 | 2 |
| Review | 3 | 0 |
| Profile and Settings | 3 | 3 |
| Parent (Conditional) | 0 | 6 |
| **Total** | **31** | **16** |

---

## Feature Boundaries — What Is NOT in the Mobile App

| Excluded Feature | Reason |
|---|---|
| Admin dashboard | Web-only. Admin screens are not in the mobile app. |
| Content creation or editing | Content manager workflow is web-admin only. |
| AIM algorithm or adaptive logic | Runs in backend Python AIM Engine only. Never on-device. |
| AI provider key access | Backend-only. Mobile never holds or uses provider API keys. |
| Student Web App (separate from mobile) | The MVP pilot is a React web interface. This document covers the future Flutter mobile app only. |
| Raw mastery scores or internal AIM weights | Not shown to learners. Learner feedback uses educational language. |
| Inter-student comparison or leaderboards | Not in MVP. AIM is personalized, not competitive. |
| Offline session mode | Not in MVP. All session data flows to backend in real time. |
| Social features or learner communities | Future phase only. |
| Payment or subscription management | Not in MVP scope. |
| Teacher or classroom management | Future expansion. Not an MVP user role for mobile. |

---

## Open Questions

| # | Question | Status | Impact |
|---|---|---|---|
| OQ-01 | Will the MVP pilot use the React web app or move directly to Flutter mobile? | Open | If React web is the only pilot vehicle, the Flutter mobile sitemap describes the post-pilot product. Needs project owner decision. |
| OQ-02 | Is parent access included in the Phase 1 mobile release? | Open — see `docs/journeys/parent-journey.md` | If yes, the six `CONDITIONAL` parent screens become `MVP`. |
| OQ-03 | Which question types are in scope for MVP mobile sessions? | Assumed: multiple choice, fill-in-the-blank, matching. | Additional types (speaking, audio) require platform capability decisions. |
| OQ-04 | Is the bottom navigation bar the correct global navigation pattern? | Assumed: yes, four-tab bottom bar. | Tab structure may change if parent and student roles share the same app binary. |
| OQ-05 | How many questions per session in MVP? | Driven by AIM Engine configuration. | Affects session screen pacing and progress indicators. Needs AIM Engine team input. |
| OQ-06 | Will micro-goals appear as a dedicated tab or as home dashboard cards? | Assumed: home cards only. | If goals become prominent, a dedicated tab or screen may be needed. |
| OQ-07 | Is dark mode required for MVP? | Not specified. | Should be decided before Flutter design tokens are built. |

---

## Assumptions

- The Flutter mobile app is a single binary for student and parent roles. Role-based routing happens post-login.
- The app is iOS and Android. No web-embedded Flutter in MVP.
- All backend API calls use the endpoints defined in `docs/api/api-planning-baseline.md`.
- Session state is backend-persisted. If the app is interrupted, the learner can resume from where they left off.
- The app enforces no adaptive logic. It renders backend results faithfully.
- Content is served from the backend, not bundled in the app.

---

## Cross-References

| Document | Relationship |
|---|---|
| `docs/journeys/student-journey.md` | Source for all student screen journey stages and flow steps. |
| `docs/journeys/parent-journey.md` | Source for all parent screen stages and privacy rules. |
| `docs/api/api-planning-baseline.md` | API groups consumed by each screen group. |
| `docs/product/mvp-scope.md` | MVP boundary confirmation for included and excluded mobile features. |
| `docs/product/roles-and-permissions.md` | Role access rules enforced on each screen. |
| `docs/aim-engine/boundary-and-io-contract.md` | AIM Engine output shape consumed by session result and adaptive result screens. |
| `docs/product/notification-scope.md` | Notification trigger rules for push entry points. |
