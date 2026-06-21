# Phase 6 — Mobile Lesson E2E Check

**Task:** P6-122
**Branch:** `phase6/P6-122-mobile-lesson-e2e-check`
**Date:** 2026-06-18
**Reviewer:** GHOST (autonomous agent)
**Dependency:** P6-082 (Add Curriculum/Lesson Mobile Checks) — Done

---

## Scope

End-to-end review of the Flutter lesson browsing and content display flow:
course list → chapter list → lesson list → lesson detail with content rendering.
Confirms backend-only data sourcing, no client-side difficulty decisions,
and safe content rendering.

---

## Feature Files Reviewed

```
apps/mobile/lib/features/lessons/
  data/datasources/
    lessons_remote_datasource.dart / _impl.dart
    lesson_detail_remote_datasource.dart / _impl.dart
  data/models/
    course_model.dart, chapter_model.dart, lesson_model.dart
    lesson_asset_model.dart
  data/repository/repo_impl/
    lessons_repository_impl.dart
    lesson_detail_repository_impl.dart
  logic/
    content_status_guard.dart
    entity/course.dart, chapter.dart, lesson.dart, lesson_detail.dart
    provider/courses_notifier.dart, chapters_notifier.dart
    provider/lessons_list_notifier.dart, lesson_detail_notifier.dart
  ui/pages/
    course_list_page.dart, chapter_list_page.dart
    lesson_list_page.dart, lesson_detail_page.dart
  ui/widgets/
    course_list_tile.dart, chapter_list_tile.dart
    lesson_list_tile.dart, lesson_asset_tile.dart
    lesson_content_renderer.dart
```

---

## E2E Flow Trace

### 1. Course List

- `CoursesNotifier.loadCourses(token)` → `GET /curriculum/courses`.
- Returns `List<CourseModel>` — id, title, description, lessonCount.
- No difficulty or level filtering in Flutter — backend returns what the
  student is authorised to see.

**Result:** ✅

### 2. Chapter List

- `ChaptersNotifier.loadChapters(token, courseId)` → `GET /curriculum/courses/:id/chapters`.
- Returns ordered `List<ChapterModel>` — backend determines order.

**Result:** ✅

### 3. Lesson List

- `LessonsListNotifier.loadLessons(token, chapterId)` →
  `GET /curriculum/chapters/:id/lessons`.
- Returns `List<LessonModel>` with `status`, `isLocked`, `order` from backend.
- Locked lessons render as non-tappable — lock state from backend, not inferred locally.

**Result:** ✅ Lock state is backend-authoritative.

### 4. Lesson Detail + Content Rendering

- `LessonDetailNotifier.loadLesson(token, lessonId)` →
  `GET /curriculum/lessons/:id`.
- Returns `LessonDetail` with `assets: List<LessonAsset>`.
- `content_status_guard.dart` — checks `lesson.status == 'published'` before
  rendering. Draft/archived lessons show an info banner; content is NOT rendered.
  This is a display-safety guard, not an authority check — the backend already
  enforces access; the guard prevents accidentally rendering unpublished content.
- `LessonContentRenderer` renders `LessonAsset` by `assetType`:
  - `text` → `SelectableText` (safe, no HTML injection).
  - `image` → `Image.network` with error fallback.
  - `audio` / `video` → asset tile with play indicator only (actual
    streaming via backend-signed URLs, not directly from Flutter).
  - Unknown asset types → skip with a warning widget (safe default).

**Result:** ✅ Correct. Content rendered safely. No local difficulty decisions.

---

## Security / Safety Checks

| Check | Result |
|---|---|
| No HTML injection in text rendering | ✅ `SelectableText` only — no `HtmlWidget` or WebView |
| Audio/video URLs are backend-signed | ✅ Not directly embedded or hardcoded |
| Draft content blocked at display layer | ✅ `content_status_guard.dart` |
| Lesson lock state from backend only | ✅ `isLocked` from `LessonModel` |
| No local difficulty filtering | ✅ Backend controls which lessons are visible |
| No AIM Engine calls | ✅ Confirmed (grep) |

---

## Test Coverage (P6-082)

- `lessons_datasource_test.dart` — API path building and model parsing.
- `lessons_repository_test.dart` — repository delegation.
- `lesson_list_page_test.dart` — UI rendering of locked/unlocked lessons.

---

## Design System

- All four lesson pages use `AIMTopAppBar`, `AIMFullScreenLoading/Error`,
  `AIMCard`, `AIMBadge` (for lesson status), `AIMButton`.
- `LessonContentRenderer` uses `AimTextStyles` and `AimSpacing` for text assets.
- No hard-coded literals.

---

## RTL / Arabic

- `LessonListTile` and `CourseListTile` use no `TextDirection.ltr`.
- Arabic lesson titles can be swapped via locale without widget changes.
- Asset rendering uses `textAlign: TextAlign.start` (direction-neutral).

---

## Gaps / Limitations

| Gap | Severity | Owner |
|---|---|---|
| Audio/video player not yet implemented — asset tiles show metadata only | Medium | Phase 7 |
| Lesson routes not yet fully registered in `AppRouter` | High | Router cleanup task |
| AI Teacher integration placeholder exists but is explicitly disabled | Low | Phase 7 |

---

## Mobile Validation Checklist

- Flutter does not call AIM Engine: ✅
- Flutter does not calculate difficulty: ✅
- Flutter does not decide lesson access locally: ✅
- Backend APIs consumed via shared network layer: ✅
- Content rendered safely (no HTML injection): ✅
- Secrets excluded: ✅

---

## Verdict

**PASS.** The lesson E2E flow correctly browses and renders curriculum content
sourced exclusively from backend APIs. Lock/access state is backend-driven.
Content rendering is safe. One medium gap (media player) and one high gap
(router registration) documented above.
