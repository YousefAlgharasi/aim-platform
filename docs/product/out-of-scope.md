# AIM Out-of-Scope Boundary

## Purpose

> **Historical Baseline Note:** This document defines the out-of-scope boundary for the completed MVP pilot. The MVP pilot used a React Web interface and has been closed. This document remains as the historical baseline. Phase 1 post-MVP planning — including the Flutter Mobile App — is in scope for Phase 1 and is documented in the technical baseline files. Do not read this document as prohibiting Flutter in Phase 1; the Flutter exclusion listed below applied only to the completed MVP pilot.

This document defines what is not part of the AIM MVP so implementation planning can protect the first pilot from unnecessary expansion.

## Scope

This boundary applies to Phase 0 planning, Phase 1 task creation, and the first web/cloud pilot. It is documentation only and does not implement backend, frontend, database, Flutter, admin dashboard, or AIM Engine runtime code.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked locally and present. |
| P0-001 | `docs/product/non-negotiables.md` | Checked locally and present. |

## Out-of-Scope Summary

The MVP is not a full commercial learning platform. It is a focused web/cloud pilot to validate AIM adaptive learning behavior with a small A1 cohort.

Anything that does not support that validation should be deferred unless the project owner explicitly documents a change.

## Excluded Product Areas

| Area | Out of MVP | Reason |
|---|---|---|
| Flutter learner app | Excluded from first pilot (completed) | The first pilot used React Web for faster algorithm validation. Flutter Mobile is now part of Phase 1 post-MVP and is in scope for Phase 1 engineering. |
| Native mobile release | Excluded from MVP pilot | App store, device, and release work would have distracted from algorithm validation in the pilot. Phase 1 includes native mobile planning. |
| Full public marketing site | Excluded | Not needed for a five-learner pilot. |
| Payment or subscriptions | Excluded | Pilot is not a paid commercial launch. |
| Teacher classroom product | Excluded | MVP is individual pilot learning, not institution management. |
| School or organization admin | Excluded | Adds tenant and reporting complexity not needed for pilot. |
| Production-grade admin suite | Excluded | MVP needs internal pilot support only. |
| Social, chat, or community features | Excluded | Not needed to validate AIM adaptation. |
| Gamification economy | Excluded | Points, badges, coins, leaderboards, and stores are future product ideas. |
| Multi-language learner markets | Excluded | Pilot focuses on Arabic-speaking A1 English learners. |
| Advanced CEFR levels | Excluded | MVP focuses on A1 content and beginner evidence. |

## Excluded Technical Work

| Area | Out of MVP | Reason |
|---|---|---|
| Moving AIM Engine into Flutter | Forbidden | AIM algorithm logic must remain in Python/backend. |
| Client-side mastery or recommendation calculation | Forbidden | Backend is the source of truth for AIM outputs. |
| AI provider keys in clients | Forbidden | Credentials must remain server-only. |
| Large architecture rewrite | Excluded | Current structure should be extended safely. |
| Production-scale multi-tenant architecture | Excluded | Pilot cohort does not require it. |
| Complex billing infrastructure | Excluded | No paid product in MVP. |
| Offline-first learning mode | Excluded | Cloud web pilot can require connectivity. |
| Advanced analytics warehouse | Excluded | Pilot reporting can be focused and lightweight. |
| Fully automated content generation pipeline | Excluded | Content should be curated and reviewed. |

## Excluded AIM Behavior

The MVP must not include:

- Speed-based mastery increase or decrease.
- Speed-based student level changes.
- Direct difficulty increase based on fast answers.
- Clinical, medical, or diagnostic learner labels.
- Automated psychological claims about students.
- Recommendation actions that contradict the decision conflict resolver.
- Client-side overrides of backend AIM decisions.

## Deferred Features

These may be valuable later, but are not required for the first MVP pilot:

| Deferred Feature | Future Trigger |
|---|---|
| Flutter mobile app | After web/cloud pilot validates AIM behavior. |
| Parent or guardian portal | After privacy and MVP scope confirm the role is worth including. |
| Teacher dashboard | After individual learner pilot validates core learning loop. |
| Production content management system | After content model and review workflow stabilize. |
| Advanced learner reports | After pilot analysis identifies which reports matter. |
| Notifications and reminders | After notification scope confirms low-risk MVP value. |
| AI-generated lessons | After curated A1 content and safety review standards are mature. |
| Multi-level curriculum | After A1 pilot results are understood. |
| Organization accounts | After single-cohort pilot operations succeed. |
| Payment flows | After product value is validated. |

## Scope Change Rule

A deferred or excluded feature may enter MVP only if all of the following are true:

1. The project owner documents the scope change.
2. The change supports the first pilot validation goal.
3. Dependencies and risks are visible in Notion.
4. Safety, privacy, and credential boundaries remain intact.
5. The change does not move AIM Engine logic to a client.
6. The change does not delay algorithm validation without explicit approval.

## Non-Goals

- This document does not create a Student Web App.
- This document does not create backend runtime code.
- This document does not create database migrations.
- This document does not create Flutter code.
- This document does not move AIM Engine logic into any client.
- This document does not define the full future product roadmap.

## Assumptions

- MVP success depends on validating AIM adaptation, not on breadth of platform features.
- Internal pilot operators can tolerate lightweight tools if the adaptive learning loop is measurable.
- Some Phase 0 planning docs may mention future features, but mentioning a future feature does not make it MVP scope.
- Deferral is acceptable when it protects learner safety, algorithm validation, or delivery focus.

## Open Questions

| Question | Current Handling |
|---|---|
| Should parent visibility be excluded or included in the first pilot? | Keep conditional until parent journey and MVP scope decisions converge. |
| Should notifications be excluded from the first pilot? | Keep conditional until notification scope defines value and risk. |
| How much admin functionality is enough for pilot operations? | Keep internal and minimal until admin journey/sitemap define required views. |

## Related Documents

- `docs/product/mvp-scope.md`
- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/roles-and-permissions.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-001.
- This document has a title, purpose, scope, excluded areas, deferred features, scope change rules, assumptions, non-goals, and open questions.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.

