# Lesson Asset Contract

> Phase 3 — P3-013
> Scope: Curriculum & Content System only.

---

## 1. Overview

This document defines the shared contracts for lesson assets in the AIM platform. Assets are content items attached to a lesson — such as images, audio clips, video files, documents, and external references. All backend and admin implementations must conform to this contract.

This contract extends the lesson record defined in `packages/shared-contracts/api/lesson-contracts.md` (P3-010). Assets are always scoped to a parent lesson.

**Out-of-scope:** Learner delivery, onboarding, placement, practice attempts, sessions, AIM runtime, dashboard recommendations, progress reports, AI Teacher, and Student Web App are not covered here.

---

## 2. Asset Types

| Type | Description |
|---|---|
| `image` | Static image file (JPEG, PNG, SVG, WebP, GIF) |
| `audio` | Audio file (MP3, OGG, WAV, AAC, M4A) |
| `video` | Video file or streaming reference (MP4, WebM, or embed URL) |
| `document` | Downloadable document (PDF, DOCX, XLSX, PPTX) |
| `external_reference` | External URL (article, tool, website) not hosted by AIM |

---

## 3. Asset Record

### 3.1 Fields

| Field | Type | Writable | Required | Description |
|---|---|---|---|---|
| `id` | `uuid` | ❌ | — | Primary key, set by backend |
| `lesson_id` | `uuid` | ✅ (create only) | ✅ | Parent lesson reference |
| `type` | `enum` | ✅ (create only) | ✅ | One of: `image`, `audio`, `video`, `document`, `external_reference` |
| `title` | `string` | ✅ | ✅ | Human-readable label for the asset |
| `description` | `string` | ✅ | ❌ | Optional description or caption |
| `url` | `string` | ✅ | Conditional | Storage URL or embed URL. Required if `type` is not `document` with inline content |
| `mime_type` | `string` | ✅ | ❌ | MIME type of the asset (e.g. `image/png`, `video/mp4`) |
| `size_bytes` | `integer` | ✅ | ❌ | File size in bytes. Not required for `external_reference` |
| `duration_seconds` | `integer` | ✅ | ❌ | Duration for `audio` and `video` assets. Omit for all other types |
| `alt_text` | `string` | ✅ | ❌ | Accessibility alt text. Required for `image` type |
| `thumbnail_url` | `string` | ✅ | ❌ | Thumbnail preview URL. Applicable to `video`, `image`, `document` |
| `order` | `integer` | ✅ | ✅ | Display order within the lesson. Must be positive and unique within the lesson |
| `status` | `enum` | ❌ | — | Controlled by backend only: `draft`, `published`, `archived` |
| `metadata` | `object` | ✅ | ❌ | Type-specific metadata (see Section 4) |
| `created_at` | `timestamp` | ❌ | — | Set by backend on creation |
| `updated_at` | `timestamp` | ❌ | — | Updated by backend on any mutation |

### 3.2 Rules

- `id`, `status`, `created_at`, and `updated_at` are never writable by clients.
- `lesson_id` is set on creation and cannot be changed after.
- `type` is set on creation and cannot be changed after.
- `title` must be a non-empty string.
- `order` must be a positive integer, unique within the parent lesson.
- An `image` asset **must** include `alt_text` before it can be published.
- An `audio` or `video` asset **should** include `duration_seconds` if known.
- A `url` must be a valid absolute URL. Backend validates format.

---

## 4. Type-Specific Metadata

The `metadata` field is an optional JSON object whose allowed keys depend on `type`.

### 4.1 `image`

| Key | Type | Description |
|---|---|---|
| `width_px` | `integer` | Image width in pixels |
| `height_px` | `integer` | Image height in pixels |
| `format` | `string` | File format: `jpeg`, `png`, `svg`, `webp`, `gif` |

### 4.2 `audio`

| Key | Type | Description |
|---|---|---|
| `bitrate_kbps` | `integer` | Audio bitrate in kilobits per second |
| `format` | `string` | File format: `mp3`, `ogg`, `wav`, `aac`, `m4a` |
| `transcript_url` | `string` | Optional URL to a text transcript of the audio |

### 4.3 `video`

| Key | Type | Description |
|---|---|---|
| `width_px` | `integer` | Video width in pixels |
| `height_px` | `integer` | Video height in pixels |
| `format` | `string` | File format or embed type: `mp4`, `webm`, `youtube`, `vimeo` |
| `captions_url` | `string` | Optional URL to a WebVTT or SRT captions file |
| `transcript_url` | `string` | Optional URL to a text transcript of the video |

### 4.4 `document`

| Key | Type | Description |
|---|---|---|
| `format` | `string` | File format: `pdf`, `docx`, `xlsx`, `pptx` |
| `page_count` | `integer` | Number of pages in the document, if known |

### 4.5 `external_reference`

| Key | Type | Description |
|---|---|---|
| `domain` | `string` | Domain of the external URL (e.g. `developer.mozilla.org`) |
| `opens_in_new_tab` | `boolean` | Whether the reference should open in a new browser tab |

---

## 5. Asset Status Lifecycle

```
draft → published → archived
  ↑           │
  └───────────┘ (re-draft not directly supported; archive only)
```

| Status | Meaning |
|---|---|
| `draft` | Created but not yet visible to learners |
| `published` | Active and available for curriculum use |
| `archived` | Hidden from curriculum; retained for audit |

- Only backend endpoints control `status` transitions.
- An asset cannot be published if its parent lesson is `draft`.
- Once `archived`, an asset cannot be re-published without backend intervention.

---

## 6. Asset–Lesson Relationship Rules

- Each asset belongs to exactly one lesson (`lesson_id` is immutable after creation).
- A lesson may have zero or more assets in `draft` state, but must have at least one `published` asset to be published itself.
- Deleting a lesson must cascade-archive all its assets (no hard delete).
- Assets are ordered by `order` ascending within their lesson.

---

## 7. Safe Client Fields

The following fields may be safely returned to authenticated admin and teacher clients:

```
id, lesson_id, type, title, description, url, mime_type, size_bytes,
duration_seconds, alt_text, thumbnail_url, order, status, metadata,
created_at, updated_at
```

**Never expose:** internal storage paths, CDN signing keys, upload credentials, or service-role tokens.

---

## 8. Admin API Shape (Reference)

> This section defines the expected JSON shape for API requests and responses. Actual endpoint paths are defined by the backend API contract.

### 8.1 Create Asset Request

```json
{
  "lesson_id": "uuid",
  "type": "video",
  "title": "Introduction to Algebra",
  "description": "A short video introducing algebraic thinking.",
  "url": "https://cdn.aim.example.com/lessons/abc123/intro.mp4",
  "mime_type": "video/mp4",
  "size_bytes": 52428800,
  "duration_seconds": 312,
  "thumbnail_url": "https://cdn.aim.example.com/lessons/abc123/intro-thumb.jpg",
  "order": 1,
  "metadata": {
    "format": "mp4",
    "width_px": 1920,
    "height_px": 1080,
    "captions_url": "https://cdn.aim.example.com/lessons/abc123/intro.vtt"
  }
}
```

### 8.2 Create Asset Response (201 Created)

```json
{
  "id": "uuid",
  "lesson_id": "uuid",
  "type": "video",
  "title": "Introduction to Algebra",
  "description": "A short video introducing algebraic thinking.",
  "url": "https://cdn.aim.example.com/lessons/abc123/intro.mp4",
  "mime_type": "video/mp4",
  "size_bytes": 52428800,
  "duration_seconds": 312,
  "alt_text": null,
  "thumbnail_url": "https://cdn.aim.example.com/lessons/abc123/intro-thumb.jpg",
  "order": 1,
  "status": "draft",
  "metadata": {
    "format": "mp4",
    "width_px": 1920,
    "height_px": 1080,
    "captions_url": "https://cdn.aim.example.com/lessons/abc123/intro.vtt"
  },
  "created_at": "2026-06-14T10:00:00Z",
  "updated_at": "2026-06-14T10:00:00Z"
}
```

### 8.3 Update Asset Request (PATCH — partial)

Only `title`, `description`, `url`, `mime_type`, `size_bytes`, `duration_seconds`, `alt_text`, `thumbnail_url`, `order`, and `metadata` are patchable.

```json
{
  "alt_text": "A teacher writing equations on a whiteboard",
  "order": 2
}
```

### 8.4 List Assets Response (200 OK)

```json
{
  "lesson_id": "uuid",
  "assets": [
    { "...": "asset object as in 8.2" }
  ]
}
```

---

## 9. Validation Errors

| Code | Trigger |
|---|---|
| `ASSET_LESSON_NOT_FOUND` | `lesson_id` does not reference an existing lesson |
| `ASSET_INVALID_TYPE` | `type` is not one of the allowed enum values |
| `ASSET_MISSING_URL` | `url` is absent or empty for a type that requires it |
| `ASSET_MISSING_ALT_TEXT` | Publishing an `image` asset without `alt_text` |
| `ASSET_INVALID_ORDER` | `order` is not a positive integer or conflicts with existing asset |
| `ASSET_LESSON_ARCHIVED` | Cannot add asset to an archived lesson |
| `ASSET_PUBLISH_BLOCKED` | Parent lesson is not in a publishable state |

---

## 10. Relation to Other Contracts

| Contract | Relation |
|---|---|
| `lesson-contracts.md` (P3-010) | Parent entity; lesson must exist before creating assets |
| `skill-contracts.md` (P3-005) | Lessons must be linked to skills; assets inherit this constraint indirectly |
| `role-permission-contracts.md` | Only admin/teacher roles may create or modify assets |
| `response-envelope.md` | All API responses wrap in the standard envelope |
| `errors.md` | All error codes follow the standard error shape |
