# Progress Feature

Phase 6 — Student Mobile App MVP progress screens.

## Scope

Read-only display of backend-approved AIM outputs:
- Skill state summary (P6-099)
- Weakness summary (P6-100)
- Recommendation summary (P6-101)
- Review schedule (P6-102)
- Progress summary page (P6-098)

## Security Rules

- Flutter NEVER computes mastery, weakness, difficulty, recommendations,
  or review schedule.
- All AIM values displayed verbatim from backend APIs.
- studentId JWT-resolved by backend; sourced from authContextProvider only.
- No AIM Engine calls, AI Teacher, or AI provider calls from Flutter.
- No secrets, service-role keys, or privileged config anywhere here.

## Architecture

```
progress/
├── data/
│   ├── datasources/   — (P6-098+)
│   ├── models/        — (P6-098+)
│   └── repository/repo_impl/ — (P6-098+)
├── logic/
│   ├── entity/        — (P6-098+)
│   ├── provider/      — (P6-098+)
│   └── repository/    — (P6-098+)
└── ui/
    ├── pages/
    │   └── progress_page.dart  — placeholder (P6-097)
    └── widgets/       — (P6-098+)
```
