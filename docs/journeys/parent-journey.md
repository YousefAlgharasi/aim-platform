# AIM Parent Journey and Weekly Report Scope

## Purpose

This document defines the optional parent or guardian journey for AIM, including child linking, progress visibility, weekly report scope, alerts, and privacy boundaries.

## Scope

This journey is planning documentation for the first AIM web/cloud pilot and future MVP decisions. Parent or guardian access is conditional in MVP and should be included only if it supports the pilot without adding unsafe privacy or implementation risk. This document does not implement backend, frontend, database, Flutter, admin dashboard, or AIM Engine runtime code.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-003 | `docs/product/roles-and-permissions.md` | Checked locally and present. |
| P0-004 | `docs/product/mvp-scope.md` | Checked locally and present. |
| P0-004 | `docs/product/out-of-scope.md` | Checked locally and present. |

## MVP Decision

Parent or guardian access is conditional for the first pilot.

| Decision Area | Current Position |
|---|---|
| First pilot requirement | Not required to validate the core AIM adaptive learning loop. |
| If included | Keep access limited to linked learner progress summaries and weekly reports. |
| If deferred | Student journey and pilot validation can continue without parent portal implementation. |
| Safety rule | Parent-facing language must stay educational, supportive, and non-diagnostic. |

## Parent Journey Summary

If parent access is included, the journey is:

```text
Invite -> Verify parent account -> Link to learner -> View limited dashboard
-> Receive weekly progress report -> Review safe recommendations
-> Support learner practice -> Contact pilot admin if needed
```

The parent experience should help support consistent learning without exposing raw AIM internals, sensitive learner evidence, or other students' data.

## Parent Goals

| Goal | MVP Support |
|---|---|
| Know whether the learner is participating | Weekly completion and practice summary. |
| Understand progress at a high level | Learner-safe skill and lesson progress summaries. |
| Support practice at home | Simple recommended support actions. |
| Notice when help is needed | Safe alerts for missed practice or repeated struggle. |
| Protect learner privacy | Limited data visibility and no raw audit access. |

## Journey Stages

| Stage | Parent Action | System Response | Boundary |
|---|---|---|---|
| Invitation | Receives parent access invite if MVP includes it. | Explains limited parent visibility. | No public self-linking without verification. |
| Account setup | Signs in or creates parent account. | Confirms identity and consent flow. | Backend verifies role and ownership. |
| Child linking | Links to learner through admin-approved or secure invite flow. | Shows linked learner summary. | Parent sees only linked learner data. |
| Dashboard | Views high-level progress. | Shows lessons completed, practice status, and next support suggestion. | No raw attempt logs by default. |
| Weekly report | Reads weekly summary. | Shows progress, practice pattern, review needs, and safe next steps. | Educational language only. |
| Alerts | Receives limited alerts if enabled. | Shows missed practice or support-needed notice. | Alerts must not shame or diagnose learner. |
| Support action | Encourages learner to practice or review. | Parent can see updated weekly progress later. | Parent does not submit attempts for learner. |
| Help request | Contacts pilot admin if needed. | Admin handles support. | Support access follows role permissions. |

## Child Linking Rules

Parent-child linking must be conservative:

- A parent can view only learners explicitly linked to that parent account.
- Linking should require a secure invite, admin approval, or equivalent verified flow.
- A learner must not become visible through email guessing or public search.
- Parent access should be revocable by pilot admin or project owner.
- Every linked relationship should have a clear source, timestamp, and status when implemented.
- Cross-learner access must be audit logged when implementation begins.

## Parent Dashboard Scope

Parent dashboard may show:

- Linked learner name or display name.
- Current lesson status.
- Lessons completed this week.
- Practice sessions completed this week.
- High-level skill progress summary.
- Current learner-safe recommendation.
- Suggested parent support action.
- Missed practice indicator if notifications are enabled.

Parent dashboard must not show:

- Other learners.
- Raw AIM audit logs.
- Raw behavioral evidence such as detailed response-time traces.
- Internal mastery formula internals.
- Admin controls.
- AI provider keys or backend credentials.
- Clinical, medical, or diagnostic labels.

## Weekly Report Scope

A weekly parent report should be short and supportive.

| Section | Included Content | Excluded Content |
|---|---|---|
| Practice summary | Sessions completed, lessons attempted, completion trend. | Full raw attempt table. |
| Learning progress | Skills practiced, simple improvement notes, review needs. | Internal scoring formulas or raw audit logs. |
| AIM recommendation | Learner-safe next step such as review, continue, or challenge. | Decision conflict internals. |
| Support suggestion | One or two practical ways to support practice. | Pressure, blame, or comparison to other learners. |
| Alerts | Missed practice or support-needed signal if enabled. | Clinical or diagnostic statements. |
| Privacy note | Reminder that report is limited to linked learner progress. | Sensitive internal system details. |

## Parent-Facing Language Rules

Parent-facing language should say:

- "Needs more practice with..."
- "A review activity is recommended."
- "AIM needs a few more answers before making a strong recommendation."
- "The learner may benefit from a short guided review."
- "This week included steady practice."

Parent-facing language must not say:

- The learner has a medical or psychological condition.
- The learner is lazy, bad, or incapable.
- Fast answers mean mastery.
- Slow answers mean low mastery.
- The parent should pressure the learner to move faster.

## Alerts and Notifications

Parent alerts are optional and should be minimal in MVP.

Allowed alert types:

- Missed practice reminder.
- Weekly report ready.
- Repeated review need.
- Lesson completion milestone.
- Pilot admin message if needed.

Disallowed alert types:

- Public ranking or comparison.
- Shame-based warnings.
- Clinical or diagnostic claims.
- High-frequency nudges that create pressure.
- Raw performance dumps.

Notification timing, channels, and opt-out rules should be finalized in the notification scope task.

## Privacy Boundaries

Parent access must preserve learner privacy:

- Show summaries instead of raw logs by default.
- Limit visibility to linked learners only.
- Keep sensitive AIM audit details internal.
- Avoid unnecessary personal data.
- Do not expose AI provider keys, backend secrets, or service credentials.
- Use backend authorization for every parent data request.
- Audit cross-account access where implementation supports it.

## Parent Actions

Parents may:

- View linked learner progress summaries.
- Read weekly reports.
- Receive limited notifications if enabled.
- Encourage learner practice.
- Contact pilot admin for support.

Parents must not:

- Submit answers for the learner.
- Change mastery, difficulty, or recommendations.
- Override AIM Engine decisions.
- View raw internal AIM audit logs.
- View other learners.
- Manage lesson content.
- Access admin tools.

## Error and Recovery States

| Situation | Parent Experience | System Handling |
|---|---|---|
| Link invite expired | Parent asks for a new invite. | Admin can resend or recreate link. |
| Wrong learner linked | Parent sees no sensitive details until verified. | Admin reviews and corrects relationship. |
| Learner data unavailable | Parent sees a simple unavailable message. | Backend avoids leaking details. |
| Report delayed | Parent sees last available report date. | System generates or retries report later. |
| Access revoked | Parent loses dashboard/report access. | Backend enforces link status. |

## MVP Acceptance Criteria

Parent journey planning is ready when:

- Parent access is clearly conditional for MVP.
- Child linking rules are documented.
- Weekly report scope is documented.
- Parent dashboard visibility is limited and learner-safe.
- Alert types and privacy boundaries are documented.
- Parent actions and restrictions align with `docs/product/roles-and-permissions.md`.
- Scope aligns with `docs/product/mvp-scope.md` and `docs/product/out-of-scope.md`.
- No runtime code or Student Web App is created by this planning task.

## Non-Goals

- This document does not require parent access in the first pilot.
- This document does not implement a parent portal.
- This document does not create a Student Web App.
- This document does not create backend runtime code.
- This document does not create database migrations.
- This document does not create Flutter code.
- This document does not move AIM Engine logic into any client.
- This document does not finalize notification delivery channels.

## Assumptions

- The first pilot can run without parent access if needed.
- If parent access is included, it is limited to linked learner summaries.
- Pilot admins or project owners control parent linking and revocation.
- Parent-facing reports support learning consistency, not surveillance or pressure.
- Backend authorization remains the source of truth for access.

## Open Questions

| Question | Current Handling |
|---|---|
| Is parent access included in the first pilot or deferred? | Keep conditional until final MVP scope review. |
| What proof is required to link a parent to a learner? | Define during auth/data planning before implementation. |
| Should weekly reports be in-app only, email, or both? | Defer to notification scope and security/privacy planning. |
| Can learners see the same weekly report parents see? | Prefer transparency, but finalize in reporting scope. |
| Are parent alerts enabled during the first two-week pilot? | Keep optional and minimal unless notification scope confirms value. |

## Related Documents

- `docs/product/roles-and-permissions.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/journeys/student-journey.md`
- `docs/product/non-negotiables.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-003 and P0-004.
- This document has a title, purpose, scope, parent journey, weekly report scope, privacy boundaries, assumptions, non-goals, and open questions.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.

