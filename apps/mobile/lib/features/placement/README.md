# placement feature

Phase 6 student-facing placement test flow.

## Structure

```
placement/
├── data/
│   ├── datasources/    # PlacementRemoteDatasource interface + Impl + barrel
│   ├── models/         # API response models (JSON ↔ entity mapping) + barrel
│   └── repository/
│       └── repo_impl/  # PlacementRepositoryImpl
├── logic/
│   ├── entity/         # Domain entities (PlacementTest, Question, Result, etc.) + barrel
│   ├── provider/       # placement_provider.dart (datasource/repository providers)
│   │                    # + one notifier per page: required/start/section/
│   │                    #   question/submit/result
│   └── repository/     # PlacementRepository abstract interface, 7 methods
└── ui/
    ├── pages/          # PlacementStartPage, SectionPage, QuestionPage,
    │                    # SubmitPage, ResultPage + barrel
    └── widgets/        # barrel placeholder — pages currently compose shared
                         # AIM Mobile Design System components directly
```

## Authority Rules

- Flutter never calculates answer correctness, scores, or mastery.
- All placement results come from the backend via `PlacementRepositoryImpl`.
- `is_correct` and `skill_code` are never sent or received in any
  student-facing payload.
- `student_id` is always resolved from the JWT on the backend.
  `PlacementAttemptModel` has no `student_id` field at all — there is
  nowhere in this feature for it to be stored, read, or forwarded even
  if a response included it.
- Outgoing answer submissions carry exactly three fields:
  `placement_attempt_id`, `placement_question_id`, `answer_value`.
- Bearer token is injected via `authenticatedBackendApiClientProvider`;
  never stored in the datasource.

## Backend Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /placement/active` | Active placement test definition |
| `GET /placement/active/sections` | Sections for the active test |
| `GET /placement/questions?sectionId=:id` | Questions for a section (no `correct_answer`) |
| `POST /placement/attempts` | Start an attempt (`student_id` resolved from JWT) |
| `POST /placement/attempts/:id/answers` | Submit one answer (no `is_correct` evaluated here) |
| `POST /placement/attempts/:id/complete` | Transition attempt active → submitted |
| `GET /placement/attempts/:id/result` | Backend-computed result (only after completion) |

## Key Providers

- `placementRequiredProvider` — whether placement is required for this student
- `placementStartProvider` — loads active test, starts attempt
- `placementSectionProvider` — fetches sections for an attempt, advancement
- `placementQuestionProvider` — fetches questions for a section, answer submit
- `placementSubmitProvider` — completes the attempt
- `placementResultProvider` — fetches result, retries while backend is still scoring

## Known follow-ups

- `data/models/models.dart` and `logic/entity/entity.dart` are narrow,
  unused barrels left over from an earlier model rewrite (P6-048) — they
  export only `PlacementQuestionModel`/`PlacementQuestion` and have no
  remaining importers anywhere in the app. `placement_models.dart` and
  `placement_entities.dart` (used throughout, and exported by this
  feature barrel) are the actual comprehensive barrels. Not removed
  here — out of this task's declared scope — but flagged for a future
  cleanup task.
