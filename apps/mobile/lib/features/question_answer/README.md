# Question/Answer Feature

Phase 6 — Student Mobile App MVP question and answer session.

## Scope

In-lesson question/answer sessions that let students submit answers and receive
backend-computed feedback. Flutter never evaluates correctness locally.

## Architecture

```
question_answer/
├── data/
│   ├── datasources/
│   │   ├── question_answer_remote_datasource.dart        # abstract (P6-086)
│   │   ├── question_answer_remote_datasource_impl.dart   # impl (P6-086)
│   │   └── question_answer_datasources.dart              # barrel
│   ├── models/
│   │   ├── question_model.dart                           # (P6-084)
│   │   ├── answer_option_model.dart                      # (P6-084)
│   │   ├── attempt_submit_request_model.dart             # (P6-085)
│   │   ├── attempt_submit_response_model.dart            # (P6-085)
│   │   └── question_answer_models.dart                   # barrel
│   └── repository/
│       └── repo_impl/
│           └── question_answer_repository_impl.dart      # (P6-087)
├── logic/
│   ├── entity/
│   │   ├── question.dart                                 # (P6-084)
│   │   ├── answer_option.dart                            # (P6-084)
│   │   ├── attempt_result.dart                           # (P6-085)
│   │   └── question_answer_entities.dart                 # barrel
│   ├── provider/
│   │   ├── question_answer_notifier.dart                 # (P6-087)
│   │   └── question_answer_provider.dart                 # (P6-087)
│   └── repository/
│       └── question_answer_repository.dart               # abstract (P6-087)
├── ui/
│   ├── pages/
│   │   ├── question_answer_placeholder_page.dart         # placeholder (P6-083)
│   │   └── question_page.dart                           # (P6-088)
│   └── widgets/
│       └── question_answer_widgets.dart                  # barrel
└── question_answer.dart                                   # feature barrel
```

## Backend Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /sessions/start` | Start a question session for a lesson |
| `POST /sessions/:sessionId/attempt` | Submit an answer for a question |

## Security Rules

- Flutter **never** evaluates answer correctness locally.
- `is_correct` and `correct_answer` must **never** be returned to Flutter.
- All feedback (isCorrect, explanation) comes from the backend verbatim.
- `studentId` is resolved from the JWT on the backend; never from Flutter input.
- Bearer token injected via `authenticatedBackendApiClientProvider`.
- No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
- No secrets, service-role keys, or privileged config anywhere in this feature.
