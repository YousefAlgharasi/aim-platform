# Objective Contracts

> Phase 3 — P3-012
> Scope: Curriculum & Content System only.

---

## 1. Purpose

This document defines the shared contracts for learning objectives in the AIM Platform Curriculum and Content System.

Objectives represent intended content outcomes at the lesson level. They are distinct from skills (which classify content capability) and from learner performance, mastery, placement, or recommendation records.

This is a documentation-only contract. It does not implement backend services, migrations, admin UI, Flutter views, learner delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, progress reports, AI Teacher, or Student Web App work.

---

## 2. Source Documents

This contract follows:

```text
docs/phase-3/curriculum-source-of-truth.md
docs/phase-3/curriculum-data-model-map.md
docs/phase-3/lesson-skill-linking-rules.md
docs/phase-3/content-publishing-permissions.md
```

The backend API and database remain the source of truth for objective records and mappings.

---

## 3. Objective Contract

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

### 3.1 Field Rules

| Field | Rule |
|---|---|
| `id` | Backend UUID; required; never client-writable |
| `key` | Optional stable machine-readable objective key; unique when provided |
| `title` | Required human-readable objective title; non-empty |
| `description` | Optional objective detail; may be null |
| `linkedSkillIds` | Backend UUIDs for related skills; may be empty at draft stage |
| `status` | Backend-owned lifecycle state; not client-writable |
| `createdAt` | Set by backend on creation; not client-writable |
| `updatedAt` | Updated by backend on mutation; not client-writable |

### 3.2 Relationship to Skills

- Objectives may be linked to one or more skills via `linkedSkillIds`.
- Linked skill references use backend UUIDs only.
- Objectives do not replace lesson-skill links. Lesson publish validation requires valid skill links regardless of objective mappings.
- Objectives must not store learner progress, mastery, placement, retention, or recommendation results.

### 3.3 Status Values

Objectives follow the shared `CurriculumContentStatus` lifecycle:

| Value | Meaning |
|---|---|
| `draft` | Not published; may be edited |
| `published` | Active and visible to authorized admin users |
| `archived` | Deactivated; no new mappings allowed |

Status transitions are backend-owned. Client requests to change status must be validated and authorized by backend permission guards.

---

## 4. Objective List Item Contract

```ts
type ObjectiveListItemContract = {
  id: string;
  key: string | null;
  title: string;
  status: CurriculumContentStatus;
  linkedSkillCount: number;
};
```

Used in list endpoints. Does not include full description or mapping arrays to keep list payloads small.

---

## 5. Lesson-Objective Mapping Contract

```ts
type LessonObjectiveMappingContract = {
  lessonId: string;
  objectiveId: string;
  objectiveKey: string | null;
  createdAt: string;
  createdByUserId: string | null;
};
```

### 5.1 Rules

- `lessonId` references a backend-owned lesson record.
- `objectiveId` references a backend-owned objective record.
- `objectiveKey` is included for display and debugging; `objectiveId` is the persisted relation target.
- Lesson-objective mappings are supplementary. They do not replace mandatory lesson-skill links.
- Backend validation must confirm referenced objective exists and is not archived before accepting a mapping.

---

## 6. Create Objective Request

```ts
type CreateObjectiveRequest = {
  key?: string | null;
  title: string;
  description?: string | null;
  linkedSkillIds?: string[];
};
```

### 6.1 Backend Validation

- `title` is required and must be non-empty.
- `key`, when provided, must be unique and follow stable identifier conventions.
- Every entry in `linkedSkillIds` must reference an existing, non-archived skill.
- Backend sets `status` to `draft` on creation.
- Client must not supply `id`, `status`, `createdAt`, or `updatedAt`.

---

## 7. Update Objective Request

```ts
type UpdateObjectiveRequest = {
  key?: string | null;
  title?: string;
  description?: string | null;
  linkedSkillIds?: string[];
  status?: CurriculumContentStatus;
};
```

### 7.1 Rules

- All fields are optional; omitted fields are left unchanged.
- `key` changes should be treated as migrations; backend should verify no active lesson mappings rely on the old key value.
- `linkedSkillIds`, when provided, replaces the existing set of skill links.
- `status` transitions are validated by backend publish/archive guards.
- Backend authorization is required for all update operations.

---

## 8. Objective Stable Key Conventions

Objective keys are optional but recommended for content planning, coverage review, and curriculum tooling.

Valid examples:

```text
objective.grammar.past_simple.recognize_forms
objective.vocabulary.travel.airport_phrases
objective.listening.short_dialogue.main_idea
objective.reading.scanning.find_dates
```

Invalid primary identifiers:

```text
Past Simple Forms
Airport vocabulary
Find the main idea
```

Display labels may change. They must not be used as primary objective identifiers.

---

## 9. Safe Field Rules

Objective responses must not include:

- Supabase service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- private storage credentials;
- raw access or refresh tokens;
- learner mastery records;
- level placement results;
- weakness or gap records;
- retention schedules;
- dashboard recommendation data.

---

## 10. Stop Conditions

Stop and report a blocker if implementation discovers:

- Objective records storing learner progress, mastery, or performance;
- Lesson publish paths that skip mandatory skill links because objective links are present;
- Admin Dashboard or Flutter local state acting as the source of truth for objective-lesson mappings;
- Content APIs changing objective records without backend auth and permission checks;
- Real secrets or privileged credentials present in objective payloads;
- Onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention workflows, progress reports, AI Teacher, or Student Web App work.

---

## 11. Final Contract Decision

Learning objectives are backend-owned curriculum records that describe intended content outcomes. They link to skills for coverage tracking but do not participate in learner mastery, placement, or recommendation pipelines. Stable objective keys are optional but encouraged for curriculum planning tooling.
