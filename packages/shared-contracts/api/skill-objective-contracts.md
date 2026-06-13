# Phase 3 - Skill and Objective Contracts

## Purpose

This document defines the shared contracts for skills, skill keys, objectives, and skill/objective mappings in the Phase 3 Curriculum and Content System.

The goal is to make skill mapping machine-readable and safe for future AIM integration while keeping Phase 3 limited to curriculum and content foundations.

This is a documentation-only contract. It does not implement backend services, migrations, admin UI, Flutter views, learner delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, progress reports, AI Teacher, or Student Web App work.

## Source Documents

This contract follows:

```text
docs/phase-3/curriculum-source-of-truth.md
docs/phase-3/curriculum-data-model-map.md
docs/phase-3/lesson-skill-linking-rules.md
docs/phase-3/content-publishing-permissions.md
```

The Backend API and database remain the source of truth for skill records, objective records, and mappings.

## Stable Identifier Rule

Skill contracts must use stable machine-readable identifiers.

Valid examples:

```text
grammar.past_simple.forms
grammar.past_simple.negative_forms
vocabulary.travel.airport_checkin
listening.main_idea.short_dialogue
speaking.introductions.basic_greeting
reading.scanning.dates_and_times
```

Invalid primary identifiers:

```text
Past Simple
Airport check-in
Basic greeting
A1 Grammar
```

Display labels and localized labels may change. They must not be used as primary identifiers.

## Skill Contract

```ts
type SkillContract = {
  id: string;
  key: string;
  title: string;
  description: string | null;
  domain: SkillDomain;
  parentSkillId: string | null;
  status: CurriculumContentStatus;
  createdAt: string;
  updatedAt: string;
};
```

Field rules:

| Field | Rule |
|---|---|
| `id` | Backend UUID; required |
| `key` | Stable machine-readable identifier; unique |
| `title` | Human-readable display label |
| `description` | Optional admin-safe skill definition |
| `domain` | Shared enum value for the skill family |
| `parentSkillId` | Optional backend UUID for hierarchy/taxonomy grouping |
| `status` | Backend-owned lifecycle state |

Skill keys should be lowercase, dot-delimited, and specific enough to support lesson and question mapping.

## Skill Domain Values

Implementation tasks may refine enum names, but the shared domain vocabulary should include:

| Value | Meaning |
|---|---|
| `grammar` | Grammar forms, functions, and usage |
| `vocabulary` | Lexical knowledge and topic vocabulary |
| `reading` | Reading skills and strategies |
| `listening` | Listening skills and strategies |
| `speaking` | Spoken production or interaction |
| `writing` | Written production or interaction |
| `pronunciation` | Sounds, stress, rhythm, and intonation |
| `functional_language` | Communicative functions and routines |

Domains are grouping metadata only. They are not mastery, level, difficulty, or recommendation signals by themselves.

## Objective Contract

```ts
type ObjectiveContract = {
  id: string;
  key: string | null;
  title: string;
  description: string | null;
  linkedSkillIds: string[];
  status: CurriculumContentStatus;
  createdAt: string;
  updatedAt: string;
};
```

Field rules:

| Field | Rule |
|---|---|
| `id` | Backend UUID; required |
| `key` | Optional stable machine-readable objective key |
| `title` | Human-readable objective title |
| `description` | Optional objective detail |
| `linkedSkillIds` | Backend UUIDs for related skills |
| `status` | Backend-owned lifecycle state |

Objectives describe intended content outcomes. They must not store learner progress, mastery, placement, retention, or recommendation results.

## Lesson Skill Mapping Contract

```ts
type LessonSkillMappingContract = {
  lessonId: string;
  skillId: string;
  skillKey: string;
  isPrimary: boolean;
  createdAt: string;
  createdByUserId: string | null;
};
```

Rules:

- `lessonId` references a backend-owned lesson.
- `skillId` references a backend-owned skill.
- `skillKey` is included for safe display/debugging but `skillId` remains the persisted relation target.
- Published lessons must have at least one valid skill link.
- Admin Dashboard may display mappings but backend validation is final.

## Lesson Objective Mapping Contract

```ts
type LessonObjectiveMappingContract = {
  lessonId: string;
  objectiveId: string;
  objectiveKey: string | null;
  createdAt: string;
  createdByUserId: string | null;
};
```

Rules:

- `lessonId` references a backend-owned lesson.
- `objectiveId` references a backend-owned objective.
- Objective mappings support content planning and validation.
- Objective mappings do not replace mandatory lesson-skill links.

## Question Skill Mapping Contract

```ts
type QuestionSkillMappingContract = {
  questionId: string;
  skillId: string;
  skillKey: string;
  createdAt: string;
  createdByUserId: string | null;
};
```

Rules:

- `questionId` references a backend-owned question.
- `skillId` references a backend-owned skill.
- Question publish validation should require valid skill links when required by the question bank contract.
- Correctness and scoring remain backend-owned.

## Question Objective Mapping Contract

```ts
type QuestionObjectiveMappingContract = {
  questionId: string;
  objectiveId: string;
  objectiveKey: string | null;
  createdAt: string;
  createdByUserId: string | null;
};
```

Rules:

- Objective mappings may support review and coverage checks.
- They must not expose learner performance or progress data.

## Create Skill Request

```ts
type CreateSkillRequest = {
  key: string;
  title: string;
  description?: string | null;
  domain: SkillDomain;
  parentSkillId?: string | null;
};
```

Backend validation:

- `key` is required and unique.
- `key` must be stable and machine-readable.
- `title` is required.
- `domain` must be an allowed shared value.
- `parentSkillId`, when provided, must reference an existing skill.

## Update Skill Request

```ts
type UpdateSkillRequest = {
  title?: string;
  description?: string | null;
  domain?: SkillDomain;
  parentSkillId?: string | null;
  status?: CurriculumContentStatus;
};
```

Rules:

- Changing `key` should be restricted or handled by an explicit migration workflow.
- Status changes must not break published lesson or question mappings.
- Backend authorization is required.

## Create Objective Request

```ts
type CreateObjectiveRequest = {
  key?: string | null;
  title: string;
  description?: string | null;
  linkedSkillIds?: string[];
};
```

Backend validation:

- `title` is required.
- `key`, when provided, must be unique and stable.
- every linked skill must exist.

## Update Objective Request

```ts
type UpdateObjectiveRequest = {
  key?: string | null;
  title?: string;
  description?: string | null;
  linkedSkillIds?: string[];
  status?: CurriculumContentStatus;
};
```

Rules:

- Backend validation must preserve mapping integrity.
- Client local objective labels are not authoritative.

## Safe Field Rules

Skill and objective responses must not include:

- Supabase service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- private storage credentials;
- raw access or refresh tokens;
- learner mastery;
- level placement results;
- weakness records;
- retention schedules;
- recommendations.

## Stop Conditions

Stop and report a blocker if implementation discovers:

- skill identifiers based only on display labels;
- lesson publish paths without persisted skill links;
- Admin Dashboard or Flutter local state acting as the source of truth for skill/objective mappings;
- content APIs changing mappings without backend auth and permission checks;
- real secrets or privileged credentials;
- onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention workflows, progress reports, AI Teacher, or Student Web App work.

## Final Contract Decision

Skills and objectives are backend-owned curriculum records. Stable skill keys are required for durable lesson and question mapping, while display labels remain presentation-only.
