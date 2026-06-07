# AIM Student Journey and Learning Session Flow

## Purpose

This document defines the MVP student journey from onboarding through placement, lesson practice, AIM feedback, progress review, and continued study.

## Scope

This journey covers the first React web/cloud pilot for Arabic-speaking A1 English learners. It is planning documentation only and does not implement backend, frontend, database, Flutter, admin dashboard, or AIM Engine runtime code.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-003 | `docs/product/roles-and-permissions.md` | Checked locally and present. |
| P0-004 | `docs/product/mvp-scope.md` | Checked locally and present. |
| P0-004 | `docs/product/out-of-scope.md` | Checked locally and present. |

## Journey Summary

The MVP student journey is a short, measurable learning loop:

```text
Invite -> Sign in -> Onboard -> Placement/diagnostic -> Dashboard
-> Lesson -> Practice session -> Submit attempts -> AIM adaptive result
-> Feedback and next step -> Progress review -> Continue or review
```

The student experiences a simple learning product. The backend handles auth, persistence, AIM Engine orchestration, adaptive decisions, and audit logging.

## Student Goals

| Goal | MVP Support |
|---|---|
| Understand what to do next | Dashboard and recommendation-driven next step. |
| Practice beginner English safely | Short A1 lessons with clear questions and explanations. |
| Get useful feedback | Learner-safe feedback and adaptive recommendation from backend AIM output. |
| See progress | Basic lesson completion, skill progress, and review status. |
| Avoid discouraging jumps | Difficulty increases only when mastery, reliability, retention, weakness, and frustration rules allow it. |

## Journey Stages

| Stage | Student Action | System Response | AIM/Backend Notes |
|---|---|---|---|
| Invitation | Receives pilot access instructions. | Shows sign-in path. | Pilot admin prepares account or invite. |
| Sign-in | Logs in with pilot account. | Verifies identity and opens dashboard. | Supabase Auth identity; backend enforces role and ownership. |
| Onboarding | Confirms profile basics and learning goal. | Shows simple welcome and next step. | Collect only data needed for pilot. |
| Placement or diagnostic | Completes initial questions if required. | Establishes starting skill evidence. | Backend records attempts and runs AIM where applicable. |
| Dashboard | Chooses assigned lesson or recommended review. | Shows available lesson, progress, and recommended next action. | Recommendation comes from backend result, not client logic. |
| Lesson view | Reads short A1 content. | Presents examples, explanations, and practice entry point. | Content metadata supports AIM skill/concept mapping. |
| Practice session | Answers questions, uses hints, retries, or skips. | Captures attempts and session events. | Attempt evidence is saved for AIM analysis. |
| Adaptive result | Reviews result after submission/session. | Shows learner-safe feedback and next recommendation. | AIM Engine result drives mastery, weakness, retention, and recommendation. |
| Review and progress | Checks completed lessons and skill progress. | Shows progress summary and review needs. | No clinical or diagnostic language. |
| Continue learning | Starts next lesson, repeats current skill, or reviews prerequisite. | Routes learner to next safe step. | Conflict resolver remains final action authority. |

## Onboarding Flow

The MVP onboarding flow should be short:

1. Student signs in.
2. Student sees pilot welcome and basic expectations.
3. Student confirms name or display name if needed.
4. Student sees assigned A1 starting point or diagnostic entry.
5. Student starts the first recommended activity.

Onboarding must not:

- Ask for unnecessary personal data.
- Diagnose the learner.
- Promise guaranteed learning outcomes.
- Let the client decide mastery, level, or recommendation authority.

## Placement and Diagnostic Flow

Placement or diagnostic activity should:

- Use beginner-friendly A1 questions.
- Capture enough evidence to initialize skill state safely.
- Prefer conservative decisions when reliability is low.
- Explain next steps in simple educational language.

Placement or diagnostic activity must not:

- Increase difficulty based on speed.
- Punish a slow correct learner through mastery.
- Use medical, clinical, or diagnostic terms.
- Skip prerequisite review when severe gaps are found.

## Lesson Flow

Each lesson should follow a predictable structure:

1. Lesson title and target concept.
2. Short explanation or example.
3. Guided practice question.
4. Independent practice questions.
5. Session result and adaptive next step.
6. Optional review path if AIM recommends support.

Lesson screens should expose only learner-safe information. Raw AIM audit details, internal scoring formulas, and sensitive behavioral evidence belong in internal/admin/review surfaces.

## Practice Session Evidence

During practice, the system may capture:

- Student answer.
- Correctness.
- Skill and concept.
- Question difficulty.
- Hint usage.
- Retry count.
- Skip status.
- Answer changes.
- Response time as behavioral evidence only.
- Question metadata and quality signals.
- Session context needed for retention and reliability.

Response time can support behavioral interpretation such as hesitation, rushing, possible guessing, fatigue or distraction signal, or low confidence signal. It must not directly affect mastery, student level, or direct difficulty increase.

## Adaptive Result Flow

After enough attempts are submitted, the backend should return an adaptive result that may include:

- Updated skill state.
- Performance metrics.
- Mastery result.
- Weakness result.
- Error pattern.
- Safe emotional or behavioral signal.
- Retention result.
- Evidence quality.
- Reliability.
- Question quality.
- Learning response pattern.
- Prerequisite gaps.
- Transfer learning when enough data exists.
- Fairness audit.
- Decision conflict result.
- Difficulty decision.
- Recommendation.
- Prompt adaptation instruction.
- Outcome tracking.
- Explanation log reference where available.

The student-facing view should translate this into clear learning guidance:

| AIM Result Type | Learner-Safe Presentation |
|---|---|
| Collect more evidence | "Let's try a few more questions so AIM can understand what you need." |
| Review prerequisite | "Let's review a foundation skill first." |
| Target weakness | "Practice this concept with more support." |
| Retention review | "Refresh this skill before moving on." |
| Continue current skill | "Keep practicing this skill." |
| Increase difficulty | "You're ready for a slightly harder challenge." |

## Feedback Rules

Student feedback should:

- Be short and actionable.
- Explain mistakes with examples.
- Encourage review without shame.
- Use educational terms only.
- Distinguish content difficulty from learner worth.
- Show next step clearly.

Student feedback must not:

- Use clinical labels.
- Diagnose attention, mental health, or personality.
- Expose raw internal audit details.
- Say the learner is "bad" at English.
- Reward speed as mastery.

## Progress and Review Flow

Progress view should show:

- Completed lessons.
- Current recommended next step.
- Skill progress summary.
- Review needs.
- Recent improvement signals.
- Safe reminders about consistent practice.

Progress view should not show:

- Raw private audit logs.
- Other students' data.
- Clinical or diagnostic labels.
- Internal admin controls.

## Error and Recovery States

| Situation | Student Experience | Backend/Operations Need |
|---|---|---|
| Auth expired | Student is asked to sign in again. | Preserve safe return path. |
| Session interrupted | Student can resume or restart current activity. | Avoid duplicate attempt corruption. |
| Low reliability | Student gets more practice instead of a strong judgment. | Recommendation should collect more evidence. |
| High frustration signal | Student gets easier support or review. | Avoid difficulty increase. |
| Poor question quality | Student is not strongly penalized by one bad item. | Flag item for review. |
| Prerequisite gap | Student is routed to prerequisite review. | Log gap and safe recommendation. |

## Student Data Boundaries

Students may view:

- Their own lesson assignments.
- Their own session results.
- Their own progress summary.
- Learner-safe explanations and recommendations.

Students must not view:

- Other students' data.
- Raw AIM audit internals.
- Provider keys or system credentials.
- Admin or content manager tools.

## MVP Acceptance Criteria

The student journey is ready for implementation planning when:

- Onboarding, diagnostic, lesson, practice, feedback, progress, and review stages are documented.
- Backend-owned AIM boundaries are explicit.
- Response time is limited to behavioral evidence.
- Learner-facing language is educational and non-diagnostic.
- Role and data boundaries align with `docs/product/roles-and-permissions.md`.
- Scope aligns with `docs/product/mvp-scope.md` and `docs/product/out-of-scope.md`.
- No Student Web App or runtime code is created by this planning task.

## Non-Goals

- This document does not implement the React web app.
- This document does not create a Student Web App.
- This document does not create backend runtime code.
- This document does not create database migrations.
- This document does not create Flutter code.
- This document does not move AIM Engine logic into any client.

## Assumptions

- The first pilot uses five Arabic-speaking A1 English learners.
- Students use React web for the first pilot.
- Supabase Auth handles identity, while backend authorization enforces access.
- AIM Engine outputs are generated by Python/backend services only.
- Parent or guardian visibility is conditional and not required for this student flow.

## Open Questions

| Question | Current Handling |
|---|---|
| Is placement mandatory for every pilot learner, or can some start from lesson 1? | Placement/diagnostic rules task should decide. |
| Should feedback appear after each question or after a session summary? | Lesson and UI planning should choose the MVP interaction pattern. |
| How much progress detail is useful for A1 learners? | Keep simple for MVP; analytics/reporting tasks can define deeper views. |
| Should students see recommendation history? | Defer unless progress/reporting scope includes it. |

## Related Documents

- `docs/product/roles-and-permissions.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/product/non-negotiables.md`
- `docs/product/phase-0-readiness-checklist.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-003 and P0-004.
- This document has a title, purpose, scope, journey stages, session flow, adaptive result flow, data boundaries, assumptions, non-goals, and open questions.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.

