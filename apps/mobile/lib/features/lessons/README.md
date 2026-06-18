# Lessons Feature

Phase 6 — Student Mobile App MVP lessons browser.

## Scope

Course and lesson browser that displays backend-served curriculum data:
course list, chapter list, and lesson list pages.

## Architecture

```
lessons/
├── data/
│   ├── datasources/
│   │   ├── lessons_remote_datasource.dart       # abstract interface (P6-071)
│   │   ├── lessons_remote_datasource_impl.dart  # BackendApiClient impl (P6-071)
│   │   └── lessons_datasources.dart             # barrel
│   ├── models/
│   │   ├── course_model.dart                    # (P6-070)
│   │   ├── chapter_model.dart                   # (P6-070)
│   │   ├── lesson_model.dart                    # (P6-070)
│   │   └── lessons_models.dart                  # barrel
│   └── repository/
│       └── repo_impl/
│           └── lessons_repository_impl.dart     # (P6-072)
├── logic/
│   ├── entity/
│   │   ├── course.dart                          # (P6-070)
│   │   ├── chapter.dart                         # (P6-070)
│   │   ├── lesson.dart                          # (P6-070)
│   │   └── lessons_entities.dart                # barrel
│   ├── provider/
│   │   └── lessons_provider.dart                # (P6-072)
│   └── repository/
│       └── lessons_repository.dart              # abstract interface (P6-072)
├── ui/
│   ├── pages/
│   │   ├── lessons_placeholder_page.dart        # placeholder (P6-069)
│   │   ├── course_list_page.dart                # (P6-073)
│   │   ├── lesson_list_page.dart                # (P6-075)
│   │   └── ...
│   └── widgets/
│       └── lessons_widgets.dart                 # barrel
└── lessons.dart                                  # feature barrel
```

## Backend Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /curriculum/courses` | List all courses |
| `GET /curriculum/courses/:courseId/chapters` | Chapters for a course |
| `GET /curriculum/chapters/:chapterId/lessons` | Lessons for a chapter |

## Security Rules

- Flutter **never** calculates difficulty, progress, mastery, or ordering.
- All curriculum values are backend-computed and rendered verbatim.
- `studentId` is resolved from the JWT on the backend — sourced from
  `authContextProvider`; never constructed from user input.
- Bearer token is injected via `authenticatedBackendApiClientProvider`.
- No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
- No secrets, service-role keys, or privileged config anywhere in this feature.
