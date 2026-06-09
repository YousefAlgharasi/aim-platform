# AIM Student Journey and Learning Session Flow

## Purpose

This document defines the AIM student journey from onboarding through placement, lesson practice, AI Teacher support, AIM feedback, progress review, and continued study.

It is the learner-flow planning reference for post-MVP Phase 1 Flutter Mobile, Backend API, AIM Engine integration, data capture, reports, and notifications.

## Scope

This is Phase 0 planning documentation only.

This document does not implement:

- Backend runtime code.
- NestJS API code.
- FastAPI routes.
- Flutter Mobile code.
- React Web code.
- Database migrations.
- Admin dashboard runtime code.
- AIM Engine runtime code.
- AI Teacher Gateway runtime code.
- A separate Student Web App.

The completed MVP pilot used React Web. Post-MVP Phase 1 uses Flutter Mobile as the learner client.

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

React Web belongs to completed MVP pilot context.

Flutter Mobile is the approved post-MVP Phase 1 learner client.

NestJS + TypeScript is the approved post-MVP Phase 1 Backend API.

Python AIM Engine remains backend-owned.

This student journey must not be interpreted as a new Student Web App journey.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for AIM/client/safety guardrails. |
| P0-003 | `docs/product/roles-and-permissions.md` | Checked for student access boundaries. |
| P0-004 | `docs/product/mvp-scope.md` | Checked for completed pilot and post-MVP scope. |
| P0-004 | `docs/product/out-of-scope.md` | Checked for out-of-scope boundaries. |
| P0-014 | `docs/aim-engine/boundary-and-io-contract.md` | Checked for backend-owned AIM outputs. |
| P0-015 | `docs/data/session-data-capture.md` | Checked for session evidence captured during the journey. |
| P0-018 | `docs/mobile/mobile-sitemap.md` | Checked for Flutter Mobile screens and navigation. |
| P0-022 | `docs/security/ai-safety-privacy-rules.md` | Checked for learner-safe language and privacy rules. |

## Journey Summary

The student journey is a short, measurable learning loop.

```text
Invite / Sign in
-> Onboard
-> Placement or starting point
-> Flutter Mobile Dashboard
-> Lesson
-> Practice session
-> Submit attempts
-> Backend AIM processing
-> Learner-safe feedback and next step
-> Progress review
-> Continue, review, or remediate
```

The student experiences a simple learner client. The backend handles auth, persistence, AIM Engine orchestration, adaptive decisions, AI Teacher Gateway access, reporting, and audit logging.

## Student Goals

| Goal | Phase 1 Support |
|---|---|
| Understand what to do next | Flutter Mobile dashboard and backend recommendation-driven next step. |
| Practice beginner English safely | Short lessons with clear questions, examples, and explanations. |
| Get useful feedback | Learner-safe feedback and adaptive recommendation from backend AIM output. |
| Receive help during practice | AI Teacher support through backend-only AI Teacher Gateway. |
| See progress | Lesson completion, skill progress, review needs, and safe summaries. |
| Avoid discouraging jumps | Difficulty changes only when backend AIM rules allow it. |
| Continue learning consistently | Review reminders, micro-goals, and next-step recommendations. |

## Journey Stages

| Stage | Student Action | System Response | Backend / AIM Notes |
|---|---|---|---|
| Invitation / access | Receives access instructions or creates account if allowed. | Shows sign-in path. | Backend/Supabase Auth identity; invitation policy depends on rollout. |
| Sign-in | Logs in to Flutter Mobile. | Verifies identity and opens dashboard. | Backend enforces role and ownership. |
| Onboarding | Confirms display name and basic learner context. | Shows welcome and next step. | Collect only necessary data. |
| Placement or starting point | Completes initial questions if required. | Establishes starting skill evidence. | Backend records attempts and runs AIM where applicable. |
| Dashboard | Chooses assigned lesson, review, or recommendation. | Shows next action, progress, and safe reminders. | Recommendation comes from backend, not client logic. |
| Lesson view | Reads short lesson content. | Presents examples, explanation, and practice entry point. | Content metadata supports skill/concept mapping. |
| Practice session | Answers questions, uses hints, retries, skips, or asks AI Teacher. | Captures attempts and session events. | Evidence is saved for backend AIM analysis. |
| AI Teacher support | Requests explanation, example, or guided retry. | Shows backend-approved AI Teacher response. | AI provider keys stay backend-only. |
| Adaptive result | Reviews result after enough evidence. | Shows learner-safe feedback and next recommendation. | AIM Engine drives mastery, weakness, retention, difficulty, and recommendation. |
| Progress review | Checks completed lessons and skill progress. | Shows safe progress summary and review needs. | No raw AIM internals or diagnostic labels. |
| Continue learning | Starts next lesson, repeats current skill, or reviews prerequisite. | Routes learner to next safe step. | Conflict resolver / backend recommendation remains final authority. |

## Onboarding Flow

The onboarding flow should be short.

1. Student signs in.
2. Student sees welcome and basic expectations.
3. Student confirms display name if needed.
4. Student sees assigned starting point or placement entry.
5. Student starts first recommended activity.

Onboarding must not:

- Ask for unnecessary personal data.
- Diagnose the learner.
- Promise guaranteed learning outcomes.
- Let Flutter Mobile decide mastery, level, difficulty, or recommendation authority.
- Expose raw AIM internals.
- Expose AI provider keys or backend credentials.

## Placement Flow

Placement activity should:

- Use beginner-friendly questions.
- Capture enough evidence to initialize skill state safely.
- Prefer conservative decisions when reliability is low.
- Explain next steps in simple educational language.
- Send evidence to backend for processing.
- Receive placement result from backend/AIM output.

Placement activity must not:

- Increase difficulty based on speed alone.
- Punish a slow correct learner through mastery.
- Use medical, clinical, or diagnostic terms.
- Skip prerequisite review when severe gaps are found.
- Let the client assign level locally.

## Dashboard Flow

The Flutter Mobile dashboard should show:

- next recommended activity
- current lesson or review
- learner-safe progress summary
- review needs
- micro-goals if enabled
- notification entry point if enabled
- safe support messages

Dashboard must not show:

- raw AIM scores
- hidden weights
- raw behavior signals
- clinical labels
- admin controls
- other learners' data

## Lesson Flow

Each lesson should follow a predictable structure.

1. Lesson title and target concept.
2. Short explanation or example.
3. Guided practice question.
4. Independent practice questions.
5. Optional AI Teacher support.
6. Session result and adaptive next step.
7. Optional review path if AIM recommends support.

Lesson screens should expose only learner-safe information.

Raw AIM audit details, internal scoring formulas, sensitive behavior evidence, provider prompts, and backend secrets belong outside the learner client.

## Practice Session Evidence

During practice, the system may capture:

- submitted answer
- correctness
- skill and concept
- question difficulty
- hint usage
- retry count
- skip status
- answer changes
- response time as educational behavior evidence only
- question metadata and quality signals
- AI Teacher invocation metadata
- session context needed for retention and reliability

Response time can support educational behavior interpretation such as hesitation, rushing, possible guessing, fatigue, distraction, or low confidence.

Response time must not directly affect:

- mastery
- student level
- direct difficulty increase
- learner worth
- diagnostic labels

## AI Teacher Support Flow

The student may ask for:

- explain more
- give example
- explain step
- explain why
- retry with help

The system should:

1. Send request to the Backend API.
2. Backend validates session ownership and allowed context.
3. Backend calls AI Teacher Gateway if allowed.
4. Backend validates response for safety and lesson scope.
5. Flutter Mobile displays the approved response.

AI Teacher flow must not:

- expose provider keys to Flutter Mobile
- let Flutter Mobile call AI providers directly
- provide clinical advice
- ask private personal questions
- leak direct answers where guided retry is intended
- leave lesson scope
- maximize engagement at the cost of learning wellbeing

## Adaptive Result Flow

After enough attempts are submitted, the backend should return an adaptive result that may include:

- updated skill state
- performance summary
- mastery result
- weakness result
- error pattern
- safe emotional or behavior signal
- retention result
- evidence quality
- reliability
- question quality
- learning response pattern
- prerequisite gaps
- transfer learning when enough data exists
- fairness audit
- decision conflict result
- difficulty decision
- recommendation
- prompt adaptation instruction
- outcome tracking
- explanation log reference where available

The student-facing view should translate this into clear learning guidance.

| AIM Result Type | Learner-Safe Presentation |
|---|---|
| Collect more evidence | "Let's try a few more questions so AIM can understand what you need." |
| Review prerequisite | "Let's review a foundation skill first." |
| Target weakness | "Practice this concept with more support." |
| Retention review | "Refresh this skill before moving on." |
| Continue current skill | "Keep practicing this skill." |
| Increase difficulty | "You're ready for a slightly harder challenge." |
| Easier support | "Let's make this easier and build it step by step." |

## Feedback Rules

Student feedback should:

- Be short and actionable.
- Explain mistakes with examples.
- Encourage review without shame.
- Use educational terms only.
- Distinguish content difficulty from learner worth.
- Show next step clearly.
- Route the learner to the safest next action.

Student feedback must not:

- Use clinical labels.
- Diagnose attention, mental health, or personality.
- Expose raw internal audit details.
- Say the learner is "bad" at English.
- Reward speed as mastery.
- Punish slow correct responses.
- Compare learner publicly against others.

## Progress and Review Flow

Progress view should show:

- completed lessons
- current recommended next step
- skill progress summary
- review needs
- recent improvement signals
- safe reminders about consistent practice
- micro-goals if enabled

Progress view should not show:

- raw private audit logs
- other students' data
- clinical or diagnostic labels
- internal admin controls
- raw behavior signals
- hidden AIM scoring weights
- provider prompts or raw AI traces

## Notification Touchpoints

Notifications may support the student journey through:

- review reminders
- practice reminders
- session resume reminders
- weekly progress summaries
- micro-goal updates

Notification touchpoints must:

- be backend-authorized
- use safe templates
- avoid raw AIM internals
- avoid sensitive lock-screen details
- route through authenticated Flutter Mobile screens
- validate ownership after app open

## Error and Recovery States

| Situation | Student Experience | Backend / Operations Need |
|---|---|---|
| Auth expired | Student is asked to sign in again. | Preserve safe return path. |
| Session interrupted | Student can resume or restart current activity. | Avoid duplicate attempt corruption. |
| Low reliability | Student gets more practice instead of a strong judgment. | Recommendation should collect more evidence. |
| High frustration signal | Student gets easier support or review. | Avoid direct difficulty increase. |
| Poor question quality | Student is not strongly penalized by one bad item. | Flag item for review. |
| Prerequisite gap | Student is routed to prerequisite review. | Log gap and safe recommendation. |
| AI Teacher unavailable | Student gets safe fallback help. | Log provider/service failure. |
| Offline or weak connection | Student sees safe retry/reconnect state. | Avoid inconsistent submission state. |

## Student Data Boundaries

Students may view:

- their own lesson assignments
- their own session results
- their own progress summary
- learner-safe explanations and recommendations
- backend-approved notification history if enabled
- their own review needs

Students must not view:

- other students' data
- raw AIM audit internals
- provider keys or system credentials
- admin or content manager tools
- raw behavior scores
- raw AI provider traces
- parent/admin internal notes

## Phase 1 Acceptance Criteria

The student journey is ready for implementation planning when:

- Onboarding, placement, dashboard, lesson, practice, AI Teacher support, feedback, progress, and review stages are documented.
- Backend-owned AIM boundaries are explicit.
- Flutter Mobile is clearly the post-MVP Phase 1 learner client.
- React Web is only completed MVP pilot context.
- Response time is limited to educational behavior evidence.
- Learner-facing language is educational and non-diagnostic.
- Role and data boundaries align with `docs/product/roles-and-permissions.md`.
- Scope aligns with `docs/product/mvp-scope.md` and `docs/product/out-of-scope.md`.
- No separate Student Web App or runtime code is created by this planning task.
- No AIM logic is moved into Flutter Mobile or any client.

## Non-Goals

This document does not:

- Implement the React Web pilot app.
- Create a Student Web App.
- Create backend runtime code.
- Create NestJS API code.
- Create FastAPI routes.
- Create database migrations.
- Create Flutter Mobile code.
- Create AI Teacher Gateway code.
- Move AIM Engine logic into Flutter Mobile, React Web, admin UI, or any client.
- Define final UI design.
- Define final copywriting for every learner-facing message.

## Assumptions

- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- Students in early target scope are Arabic-speaking A1 English learners.
- Backend authorization enforces access and ownership.
- AIM Engine outputs are generated by Python/backend services only.
- Parent or guardian visibility is conditional and not required for this student flow.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.
- Phase 0 remains documentation/planning only.

## Open Questions

| Question | Current Handling |
|---|---|
| Is placement mandatory for every learner, or can some start from lesson 1? | Placement strategy should decide. |
| Should feedback appear after each question or after a session summary? | Lesson and UI planning should choose the interaction pattern. |
| How much progress detail is useful for A1 learners? | Keep simple in early Phase 1; reports can define deeper views. |
| Should students see recommendation history? | Defer unless progress/reporting scope includes it. |
| Should AI Teacher be available in every lesson block or only selected practice points? | Defer to lesson content structure and AI Teacher behavior rules. |
| Should offline session continuation be supported in first Flutter Mobile build? | Defer to implementation planning. |
| Should notification inbox be included in first Flutter Mobile build? | Conditional based on notification scope. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/product/notification-scope.md`
- `docs/mobile/mobile-sitemap.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/data/session-data-capture.md`
- `docs/data/initial-data-model.md`
- `docs/security/ai-safety-privacy-rules.md`
- `docs/analytics/reports-scope.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-001, P0-003, P0-004, P0-014, P0-015, P0-018, and P0-022.
- This document has a title, purpose, scope, journey stages, onboarding flow, placement flow, dashboard flow, lesson flow, practice evidence, AI Teacher support flow, adaptive result flow, feedback rules, progress/review flow, notification touchpoints, data boundaries, assumptions, non-goals, and open questions.
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
