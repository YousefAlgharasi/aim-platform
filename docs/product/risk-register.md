# AIM Phase 0 Risk Register

## Purpose

This document records the key product, technical, AI, data, security, cost, workflow, and delivery risks identified during Phase 0 planning for AIM. It gives Phase 1 implementation a clear risk baseline, mitigation direction, and owner/decision follow-up path.

## Scope

This is Phase 0 planning documentation only. It does not implement backend code, Flutter code, admin dashboard code, database migrations, API runtime code, AIM Engine code, or a Student Web App.

The register covers risks discovered from Phase 0 documents P0-001 through P0-022, including product scope, user journeys, skill tree, placement, lesson/question standards, AI teacher rules, AIM Engine boundaries, data model, API planning, mobile/admin sitemap, notification scope, analytics/reporting scope, and privacy/safety rules.

## Dependency Check

| Dependency Range | Expected Outputs | Status |
|---|---|---|
| P0-001 to P0-004 | Product vision, readiness, roles, MVP/out-of-scope | Checked as Phase 0 baseline inputs. |
| P0-005 to P0-008 | Student, parent, admin/content manager, reviewer journeys | Checked as journey and workflow inputs. |
| P0-009 to P0-012 | Skill tree, placement strategy, lesson structure, question standards | Checked as learning-content inputs. |
| P0-013 to P0-015 | AI teacher behavior, AIM Engine IO boundary, session data capture | Checked as AI/backend boundary inputs. |
| P0-016 to P0-017 | Initial data model and API planning baseline | Checked as data/API planning inputs. |
| P0-018 to P0-020 | Mobile sitemap, admin sitemap, notification scope | Checked as interface and notification inputs. |
| P0-021 to P0-022 | Analytics/reporting scope and AI safety/privacy/data rules | Checked as reporting and safety inputs. |

## Risk Scoring

| Value | Likelihood | Impact |
|---|---|---|
| Low | Unlikely during MVP if controls are followed. | Limited delay or small rework. |
| Medium | Plausible during MVP delivery. | Meaningful rework, user impact, or security/privacy review. |
| High | Likely without active mitigation. | Blocks release, creates unsafe behavior, or breaks core product promise. |

## Risk Register

| ID | Category | Risk | Likelihood | Impact | Mitigation / Control | Phase 1 Owner |
|---|---|---|---|---|---|---|
| R-001 | Product Scope | MVP scope expands into full institute/platform before the learning loop is validated. | Medium | High | Keep MVP limited to authenticated learner flow, placement, lesson/practice, AIM result, progress, and minimal admin support. Track extras in open decisions. | Product Owner |
| R-002 | Product Scope | Student Web App is accidentally introduced as a separate deliverable despite Phase 0 boundary. | Low | High | Preserve rule: do not create a Student Web App; pilot web experience must stay within approved MVP scope. | Product Owner / Engineering Lead |
| R-003 | Mobile Scope | Flutter mobile work starts before pilot web/cloud assumptions are resolved. | Medium | Medium | Treat mobile sitemap as future/Phase 1 planning unless product owner confirms direct mobile MVP. | Product Owner |
| R-004 | Backend Architecture | Backend becomes over-layered too early, slowing delivery. | Medium | Medium | Use simplified feature-based backend architecture unless complexity requires deeper layering. | Backend Lead |
| R-005 | Flutter Architecture | Flutter app places AIM Engine/adaptive logic on-device. | Low | High | Enforce rule: Flutter only consumes backend AIM outputs; no mastery, difficulty, weakness, or recommendation calculation in Flutter. | Mobile Lead |
| R-006 | AIM Engine Boundary | AIM Engine IO contract is bypassed by ad-hoc endpoint behavior. | Medium | High | All adaptive outputs should follow the documented backend-owned IO contract and be validated before client display. | Backend / AIM Engine Lead |
| R-007 | AI Safety | AI teacher output uses clinical, diagnostic, shame-based, or unsafe language. | Medium | High | Use AI teacher behavior rules, safe templates, human review for disputes, and explicit non-diagnostic wording. | AI / Product Lead |
| R-008 | Data Privacy | Parent sees raw attempts, internal scores, or another learner's data. | Medium | High | Enforce verified parent-child linking, server-side ownership checks, and summary-only parent reports. | Backend Lead |
| R-009 | Data Model | User identity mismatches between auth UID and app user records. | Medium | High | Enforce canonical identity mapping and backend ownership checks from the start. | Backend Lead |
| R-010 | Security | AI provider keys leak into Flutter, mobile config, frontend, logs, or notification payloads. | Low | High | Keep AI provider keys backend-only; scan config/log outputs; never send provider secrets to clients. | Security / Backend Lead |
| R-011 | Notifications | Notifications disclose sensitive learner evidence on lock screen. | Medium | Medium | Use safe generic notification text and route details into authenticated screens only. | Mobile / Backend Lead |
| R-012 | Analytics | Analytics dashboards expose raw AIM internals or misleading progress conclusions. | Medium | Medium | Show learner-safe summaries; restrict admin/reviewer access by role; avoid clinical interpretation. | Product / Data Lead |
| R-013 | Placement | Placement result overstates learner level from limited evidence. | Medium | High | Use conservative placement rules and communicate results as starting guidance, not definitive ability. | Learning Design / AIM Lead |
| R-014 | Content Quality | A1 English content does not align with the documented skill tree and question standards. | Medium | High | Require skill/concept mapping for lessons/questions and review content against P0-009 to P0-012. | Content Lead |
| R-015 | Question Bank | Questions are ambiguous, culturally inappropriate, or not beginner-safe. | Medium | Medium | Apply question bank standards, reviewer checks, and item metadata requirements. | Content / Reviewer Lead |
| R-016 | Session Evidence | Required attempt/session events are not captured, weakening AIM recommendations. | Medium | High | Implement session capture fields from P0-015 before adaptive decisions are trusted. | Backend / AIM Lead |
| R-017 | Human Review | Disputed grading/review flow is unclear, causing user trust issues. | Medium | Medium | Keep reviewer journey and admin review queues in scope for disputed grades or flagged feedback. | Admin / Reviewer Lead |
| R-018 | API Planning | API endpoints are built without role, ownership, and safe-output contracts. | Medium | High | Use API planning baseline; define auth, ownership, response shape, and error behavior for each feature. | Backend Lead |
| R-019 | Cost | AI/voice or analytics usage becomes too expensive for pilot constraints. | Medium | Medium | Start with limited usage, quotas, logs, model/provider selection, and cost monitoring. | Product / Backend Lead |
| R-020 | Delivery | Phase 0 documents diverge from implementation tasks and become stale. | Medium | Medium | Reference these docs in Phase 1 tasks; update open decisions when product choices change. | Project Lead |
| R-021 | Admin Scope | Admin dashboard attempts to include all future institute operations in MVP. | Medium | Medium | Keep admin MVP focused on pilot operations, learner/content visibility, review support, and basic reporting. | Product / Admin Lead |
| R-022 | Accessibility / UX | Learners with low confidence or low English level feel overwhelmed. | Medium | High | Use short sessions, simple language, safe feedback, clear next actions, and avoid raw score exposure. | Product / UX Lead |
| R-023 | Logging | Logs capture sensitive personal data, raw prompts, or provider secrets. | Medium | High | Define log redaction, limited retention, and role-restricted access before production. | Backend / Security Lead |
| R-024 | Compliance | Privacy and child/parent consent expectations are not resolved before parent features. | Medium | High | Keep parent features conditional until consent, linking, and data visibility rules are approved. | Product / Legal/Policy Owner |
| R-025 | Integration | Supabase/auth/API deployment assumptions fail late in implementation. | Medium | Medium | Validate environment, auth, database, and deployment path early in Phase 1 before feature buildout. | Backend / DevOps Lead |

## Priority Risks for Phase 1 Kickoff

| Priority | Risk IDs | Required Action |
|---|---|---|
| Critical | R-005, R-006, R-007, R-008, R-010 | Enforce AIM Engine/backend-only boundary, privacy rules, provider-key isolation, and safe AI wording. |
| High | R-001, R-009, R-013, R-016, R-018 | Lock MVP scope, identity model, placement conservatism, session evidence, and API contracts. |
| Medium | R-011, R-012, R-014, R-019, R-020 | Keep notification/reporting/content/cost/documentation controls visible in Phase 1 tasks. |

## Assumptions

- AIM remains an educational AI tutoring platform, not a clinical, diagnostic, or medical system.
- Flutter/mobile and any frontend clients consume backend-approved outputs only.
- The AIM Engine runs in backend/Python infrastructure only.
- Parent access remains conditional unless explicitly approved for MVP.
- Phase 1 implementation tasks will reference Phase 0 documents rather than redefining scope from scratch.

## Non-Goals

- No runtime implementation is added by this document.
- No database schema, API endpoint, Flutter widget, admin page, or AIM Engine module is created here.
- This document does not resolve open product decisions; it only records risk and mitigation direction.

## Open Follow-Ups

- Convert critical risks into Phase 1 acceptance criteria.
- Decide whether mobile is MVP or post-pilot.
- Decide whether parent access is in the first MVP.
- Add security/privacy review gates before production release.
- Add cost monitoring requirements before enabling AI-heavy flows.
