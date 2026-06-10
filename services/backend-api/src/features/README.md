# Backend feature modules

This folder contains Phase 1 backend feature module skeletons.

Phase 1 rules:

- Keep backend architecture feature-based and simple.
- Do not add excessive clean-architecture layering.
- Do not implement full business logic in skeleton tasks.
- Keep AIM, mastery, weakness, difficulty, retention, and recommendation decisions backend-owned.
- Keep learner-sensitive data access behind backend authorization guards.

Feature boundaries:

- `auth` lives in `src/auth` because P1-021 and P1-022 added authentication and authorization guard foundations there.
- `students` owns student-facing backend endpoints and services once implementation tasks begin.
- `lessons` owns course, chapter, lesson, and content delivery backend boundaries once implementation tasks begin.
- `sessions` owns learning session orchestration boundaries once implementation tasks begin.
- `aim` owns backend integration boundaries to the Python AIM Engine; it must not calculate AIM logic in clients.
- `ai-teacher` owns AI teacher gateway boundaries and safety integration once scoped.
- `admin` owns admin-only backend boundaries.
- `reports` owns reporting and analytics read models once scoped.

These modules are intentionally minimal skeletons.
