# Lesson Contract

> Phase 3 — P3-010
> Scope: Curriculum & Content System only.

---

## 1. Overview

This document defines the shared contract for lessons in the AIM platform. It covers lesson metadata, content blocks, hierarchy references, status fields, and safe fields exposed to clients. All backend and admin implementations must conform to this contract.

---

## 2. Lesson Record

### 2.1 Fields

| Field | Type | Writable | Description |
|---|---|---|---|
| `id` | `uuid` | ❌ | Primary key, set by backend |
| `chapter_id` | `uuid` | ✅ (create only) | Parent chapter reference |
| `title` | `string` | ✅ | Lesson title, non-empty |
| `description` | `string` | ✅ | Lesson description, non-empty |
| `order` | `integer` | ✅ | Display order within chapter |
| `status` | `enum` | ❌ | Controlled by backend only (`draft`, `published`, `archived`) |
| `created_at` | `timestamp` | ❌ | Set by backend on creation |
| `updated_at` | `timestamp` | ❌ | Updated by backend on mutation |

### 2.2 Rules

- `id`, `status`, `created_at`, and `updated_at` are never writable by clients.
- `chapter_id` may only be set on creation and cannot be changed after.
- `title` and `description` must be non-empty strings.
- `order` must be a positive integer and unique within the parent chapter.

---

## 3. Lesson Skills (Required Link)

Every lesson **must** be linked to one or more skills before it can be published.

| Field | Type | Description |
|---|---|---|
| `lesson_id` | `uuid` | Reference to the lesson |
| `skill_id` | `uuid` | Reference to the skill |

> **Critical rule:** A lesson cannot be published without at least one linked published skill. This is a hard stop enforced at the backend publish endpoint. See `docs/phase-3/lesson-skill-linking-rules.md` (P3-006).

---

## 4. Lesson Assets

A lesson may contain one or more assets (content blocks).

| Field | Type | Writable | Description |
|---|---|---|---|
| `id` | `uuid` | ❌ | Primary key |
| `lesson_id` | `uuid` | ✅ (create only) | Parent lesson reference |
| `type` | `enum` | ✅ | Asset type: `video`, `text`, `audio`, `image`, `document` |
| `url` | `string` | ✅ | Asset URL (required if no `content`) |
| `content` | `string` | ✅ | Inline content (required if no `url`) |
| `order` | `integer` | ✅ | Display order within lesson |
| `status` | `enum` | ❌ | Controlled by backend only |
| `created_at` | `timestamp` | ❌ | Set by backend |
| `updated_at` | `timestamp` | ❌ | Updated by backend |

### 4.1 Rules

- At least one of `url` or `content` must be non-empty.
- `lesson_id` is set on creation and cannot be changed.
- A lesson must have at least one published asset before it can be published.

---

## 5. Hierarchy Reference