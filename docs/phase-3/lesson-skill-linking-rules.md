# Phase 3 — Lesson Skill Linking Rules

## Purpose

This document defines the mandatory Phase 3 rule that every publishable lesson must link to one or more skills.

The goal is to ensure later AIM Engine, recommendation, practice, retention, and progress systems can understand what each lesson is intended to develop without relying on display text, client guesses, or downstream inference.

This is a documentation-only task. It does not implement backend validation, migrations, admin UI, Flutter views, learner delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, progress reports, AI Teacher, or Student Web App behavior.

## Core Rule

```text
A lesson cannot be published unless it has at least one valid lesson-skill link.
```

Draft lessons may exist before skill links are complete. Review, approval, and publish workflows must enforce the required skill mapping before content becomes published.

## Source Documents

These rules build on:

```text
docs/phase-3/curriculum-content-system-charter.md
docs/phase-3/curriculum-source-of-truth.md
docs/phase-3/curriculum-api-map.md
docs/phase-3/curriculum-data-model-map.md
```

The backend and database remain the source of truth for lesson-skill mappings.

## Required Identifier Format

Lesson-skill links must use stable skill identifiers, not display labels.

Preferred identifier style:

```text
domain.topic.skill.variant
```

Examples:

```text
grammar.past_simple.forms
grammar.past_simple.negative_forms
vocabulary.travel.airport_checkin
listening.main_idea.short_dialogue
speaking.introductions.basic_greeting
reading.scanning.dates_and_times
```

Rules:

- Skill identifiers must be stable across display name changes.
- Skill identifiers should be lowercase.
- Skill identifiers should use dots for hierarchy.
- Skill identifiers should avoid spaces.
- Display labels such as `Past Simple`, `Airport check-in`, or `Basic greeting` must not be used as primary identifiers.
- Localized labels must not be used as primary identifiers.

## Skill Record Requirements

Each linked skill should have a backend-owned skill record.

Expected skill fields are defined by the data model map and should include:

| Field | Purpose |
|---|---|
| `id` | Stable database identifier |
| `key` | Stable machine-readable skill identifier |
| `name` | Human-readable display name |
| `description` | Optional skill definition |
| `status` | Lifecycle state |

The `key` is the stable identifier used for planning, documentation, imports, and admin selection. The database `id` is the persisted relation target. Display names are for humans only.

## Lesson Skill Link Requirements

Every lesson that moves toward publication must have at least one row or relationship equivalent to:

```text
lesson_skills
```

Minimum relationship fields:

| Field | Requirement |
|---|---|
| `lesson_id` | References the lesson being mapped |
| `skill_id` | References an existing backend-owned skill |
| `created_at` | Records when the link was created |
| `created_by_user_id` | References the internal AIM user when available |

Optional fields:

| Field | Purpose |
|---|---|
| `is_primary` | Marks the main skill developed by the lesson |
| `weight` | Future optional weighting, if explicitly defined by a later task |
| `notes` | Internal admin/reviewer mapping note, never learner-authoritative |

## Primary and Secondary Skills

A lesson may link to multiple skills.

Recommended interpretation:

- Primary skill: the main capability the lesson is designed to develop.
- Secondary skills: supporting or incidental skills practiced inside the lesson.

Rules:

- A lesson should have at least one primary skill when the model supports `is_primary`.
- If `is_primary` is not implemented yet, the first link must not be treated as authoritative by clients.
- Multiple skills are allowed only when each link describes a real content relationship.
- Skill links must not be added merely for search tagging if the lesson does not meaningfully develop that skill.

## Status and Publish Rules

| Lesson status | Skill link requirement |
|---|---|
| `draft` | Skill links recommended but not required |
| `in_review` | At least one valid skill link required before submission, unless a later workflow explicitly allows incomplete review |
| `approved` | At least one valid skill link required |
| `published` | At least one valid skill link required |
| `archived` | Existing skill links should be retained for traceability |

Hard rule:

```text
No backend path may set a lesson to published if zero valid skill links exist.
```

## Backend Validation Rules

Backend validation must check lesson-skill links before publication.

Required checks:

1. The lesson exists.
2. The lesson is in a status that may transition toward publish.
3. At least one linked skill exists.
4. Every linked skill ID references an existing skill.
5. Linked skills are active or otherwise allowed for publication.
6. Duplicate lesson-skill links are rejected or normalized.
7. If primary skills are supported, the primary-skill rule is satisfied.
8. The current user has backend permission to change mappings or publish the lesson.

Validation must run on:

- explicit lesson validation endpoints;
- submit-for-review flows when required;
- approve flows when required;
- publish flows always;
- bulk import or seed flows that create publishable lessons.

## API Expectations

The Phase 3 API map defines these lesson mapping endpoints:

```text
PUT /curriculum/lessons/:lessonId/skills
POST /curriculum/lessons/:lessonId/validate
POST /curriculum/lessons/:lessonId/publish
```

Rules:

- `PUT /curriculum/lessons/:lessonId/skills` must require backend auth and curriculum write permission.
- `POST /curriculum/lessons/:lessonId/validate` must report missing skill links as a blocking validation error for publish eligibility.
- `POST /curriculum/lessons/:lessonId/publish` must fail if no valid skill link exists.
- Admin Dashboard may display and edit selected skills only through protected backend APIs.
- Client-side validation may improve UX, but it must not replace backend validation.

## Admin UI Rules

Admin Dashboard may:

- show a skill selector using backend-provided skill records;
- show stable skill keys and human-readable names;
- warn when a lesson has no skill links;
- block the publish button in the UI as a convenience;
- display backend validation errors.

Admin Dashboard must not:

- publish a lesson directly without backend validation;
- treat local selected skill labels as authoritative;
- create new stable skill identifiers without backend-owned writes;
- bypass role or permission checks;
- expose service-role keys, database credentials, JWT secrets, AI provider keys, private storage credentials, or raw tokens.

## Import and Seed Rules

Any import, seed, fixture, or migration-like task that creates publishable lessons must include skill links.

Allowed incomplete content:

- draft-only lesson records;
- placeholder lessons explicitly marked as draft;
- content planning records that are not publishable.

Not allowed:

- published seed lessons with no skill link;
- import scripts that infer skills only from display labels;
- client-side-only skill mappings;
- skill links that point to nonexistent skill identifiers.

## Example Valid Mapping

Lesson:

```text
lesson.key = english.a1.travel.asking_for_directions
lesson.status = draft
```

Linked skills:

```text
speaking.travel.asking_for_directions
listening.directions.landmarks
vocabulary.travel.place_names
```

This lesson may become publishable after all other validation passes because it has stable skill links.

## Example Invalid Mapping

Lesson:

```text
lesson.key = english.a1.grammar.past_simple_intro
lesson.status = published
```

Invalid skill values:

```text
Past Simple
Grammar
A1 Skill
```

Why invalid:

- these are display labels, not stable identifiers;
- they may change by language or UI copy;
- they are too broad to support later skill-aware systems;
- the publish state is invalid unless persisted links reference real skill records.

## Error Handling

When validation fails because a lesson has no valid skill link, backend errors should be explicit and safe.

Recommended error shape:

```json
{
  "code": "LESSON_REQUIRES_SKILL_LINK",
  "message": "A lesson must link to at least one skill before it can be published.",
  "details": {
    "lessonId": "lesson_id",
    "requiredRelation": "lesson_skills"
  }
}
```

The error must not expose credentials, raw tokens, private storage references, or internal security implementation details.

## Relationship to Later AIM Work

Lesson-skill links are required so later systems can safely consume curriculum intent.

Later AIM Engine, practice, retention, recommendation, progress, and reporting systems may use backend-approved skill links, but Phase 3 does not implement those systems.

No Phase 3 client may calculate mastery, level, weakness, difficulty, retention, recommendations, or progress conclusions from lesson-skill links.

## Stop Conditions

Stop and report a blocker if any task introduces or discovers:

- a lesson publish path that allows zero skill links;
- skill mapping based only on display labels;
- skill links owned only by Admin Dashboard or Flutter local state;
- a content API that changes lesson-skill links without backend auth and permission checks;
- real secrets or privileged credentials;
- onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention workflows, progress reports, AI Teacher, or Student Web App work.

## Final Rule

Every published lesson must have at least one backend-owned, persisted link to a stable skill record.

If that rule cannot be enforced, the lesson must remain unpublished.
