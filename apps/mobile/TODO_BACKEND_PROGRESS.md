# Backend work needed: real chapter/lesson progress

The Chapter List (`chapter_list_page.dart`) and Lesson List (`lesson_list_page.dart`)
screens were visually re-matched to
`docs/design/ui-for-all-system-mobile/screenshots/{light,dark}/07-screen.png` and
`08-screen.png`. The designs show **per-student progress** that the backend does not
currently expose:

- Chapter List: a header "XX% DONE" badge, "All chapters / In progress / Completed"
  filter tabs, a per-chapter progress bar + percentage, a per-chapter lesson count,
  and a per-chapter status chip ("Completed" / "In progress" / "Start").
- Lesson List: a chapter-level "N/M done" progress bar, a per-lesson type label
  (e.g. "Grammar", "Practice", "Listening"), a per-lesson duration, and a per-lesson
  completion indicator (checkmark / play button / upcoming).

None of this exists on `ChapterModel` / `LessonModel` today — both only carry the
lifecycle `status` field (`draft` / `published` / `archived`), which is **not**
per-student progress. See:

- `services/backend-api/src/features/curriculum/chapters`
- `services/backend-api/src/features/curriculum/lessons`

Until real endpoints exist, both screens render this data from a deterministic,
purely cosmetic placeholder —
`apps/mobile/lib/features/lessons/ui/widgets/curriculum_progress_mock.dart`
(`ChapterProgressMock`, `LessonProgressMock`). It is never read from or written to
any backend field, and must not be used for scoring, mastery, or AIM Engine logic.
It exists solely so the two screens aren't visually broken relative to the design
mockups while the backend work below is scoped and built.

## What to build

1. **Per-student chapter progress** — e.g. `GET /aim/students/:id/chapter-progress?levelId=`
   or an aggregate joined into the existing chapters endpoint, returning per chapter:
   - `lessonCount` (total lessons in the chapter)
   - `completedLessonCount` (lessons the student has finished)
   - `percentComplete` (0–100, presumably `completedLessonCount / lessonCount`)
   - a derived status (`not_started` / `in_progress` / `completed`) so Flutter never
     computes it locally, consistent with the existing "Flutter never computes
     status" rule already enforced elsewhere in this codebase.

2. **Per-student lesson progress** — e.g. `GET /aim/students/:id/lesson-progress?chapterId=`
   or joined into the existing lessons endpoint, returning per lesson:
   - `completed` (bool)
   - `isCurrent`/`isNextUp` (bool) — or let Flutter derive "current" as the first
     non-completed lesson, if the backend only returns `completed`.

3. **Lesson type + duration** (optional, cosmetic-only fields but referenced in the
   design) — e.g. a `type` enum (`lesson` / `grammar` / `practice` / `listening`)
   and `durationMinutes` on `LessonModel`. Lower priority than progress since the
   mock type-cycling is a reasonable placeholder; real progress is the important gap.

4. **Course/level display label** (optional) — the design's chapter-list header also
   shows a level badge (e.g. "A2 level"). Neither `CourseModel` nor the chapter-list
   route args currently carry a level label to the Flutter screen; if you want that
   in the final header, add a `levelLabel`/`levelCode` field to whatever endpoint the
   course/chapter list already calls, since `LevelModel.code` exists on the backend
   but isn't currently threaded through to `ChapterListPage`.

## What to change in Flutter once the endpoints exist

- Delete `curriculum_progress_mock.dart`.
- Extend `ChapterModel`/`LessonModel` (or add a paired progress model) with the new
  real fields.
- Wire `chapter_list_tile.dart` / `lesson_list_tile.dart` and the two page headers to
  the real fields instead of `ChapterProgressMock.forIndex` / `LessonProgressMock.forIndex`.
- Remove this file.
