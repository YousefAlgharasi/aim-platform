# placement feature

Phase 6 student-facing placement test flow.

## Structure

```
placement/
├── data/
│   ├── datasources/    # PlacementDatasource interface + RemoteDatasourceImpl
│   ├── models/         # API response models (JSON ↔ entity mapping)
│   └── repository/
│       └── repo_impl/  # PlacementRepositoryImpl
├── logic/
│   ├── entity/         # Domain entities (PlacementTest, Question, Result, etc.)
│   ├── provider/       # Riverpod notifiers and providers
│   └── repository/     # PlacementRepository abstract interface
└── ui/
    ├── pages/          # PlacementStartPage, SectionPage, QuestionPage, SubmitPage, ResultPage
    └── widgets/        # Feature-local widgets (to be added per task)
```

## Authority Rules

- Flutter never calculates answer correctness, scores, or mastery.
- All placement results come from the backend via `PlacementRepositoryImpl`.
- `is_correct` and `overallScore` are never computed in Flutter.

## Key Providers

- `placementStartProvider` — loads active test, starts attempt
- `placementSectionProvider` — fetches sections for an attempt
- `placementQuestionProvider` — fetches questions for a section
- `placementSubmitProvider` — submits an answer to the backend
- `placementResultProvider` — fetches placement result after completion
