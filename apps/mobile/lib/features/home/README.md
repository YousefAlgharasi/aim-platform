# Home Feature

Phase 6 — Student Mobile App MVP home screen.

## Scope

Learner dashboard that displays backend-approved AIM data:
skill state cards, weakness strip, review reminders, and recommendation cards.

## Architecture

```
home/
├── data/
│   ├── datasources/
│   │   ├── home_remote_datasource.dart       # abstract interface
│   │   ├── home_remote_datasource_impl.dart  # BackendApiClient impl
│   │   └── home_datasources.dart             # barrel
│   ├── models/
│   │   ├── home_skill_state_model.dart
│   │   ├── home_weakness_record_model.dart
│   │   ├── home_review_schedule_model.dart
│   │   ├── home_recommendation_model.dart
│   │   └── home_models.dart                 # barrel
│   └── repository/
│       └── repo_impl/
│           └── home_repository_impl.dart
├── logic/
│   ├── entity/
│   │   ├── home_skill_state.dart
│   │   ├── home_weakness_record.dart
│   │   ├── home_review_schedule.dart
│   │   ├── home_recommendation.dart
│   │   └── home_entities.dart               # barrel
│   ├── provider/
│   │   ├── home_provider.dart               # datasource + repository providers
│   │   └── home_notifier.dart               # HomeNotifier (P6-061)
│   └── repository/
│       └── home_repository.dart             # abstract interface
├── ui/
│   ├── pages/
│   │   ├── home_placeholder_page.dart       # placeholder (P6-020)
│   │   └── home_page.dart                   # MVP page (P6-062)
│   └── widgets/
│       └── home_widgets.dart                # barrel
└── home.dart                                # feature barrel
```

## Backend Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /auth/me` | Student identity (cached from auth gate) |
| `GET /profile/me` | Display name, avatar |
| `GET /aim/students/:studentId/skill-states` | Skill state cards |
| `GET /aim/students/:studentId/weakness-records` | Weakness strip |
| `GET /aim/students/:studentId/review-schedules` | Review reminders |
| `GET /aim/students/:studentId/recommendations` | Recommendation cards |

## Security Rules

- Flutter **never** calculates mastery, band, severity, priority, action, or reason.
- All AIM values are backend-computed and rendered verbatim.
- `studentId` is resolved from the JWT on the backend — sourced from
  `authContextProvider`; never constructed from user input or sent as a body param.
- Bearer token is injected via `authenticatedBackendApiClientProvider`.
- No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
- No secrets, service-role keys, or privileged config anywhere in this feature.
