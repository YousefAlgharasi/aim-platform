# assessments

Phase 10 — Quizzes, Exams & Deadlines: student-facing assessment feature.

## Folder Structure

```
assessments/
├── assessments.dart          # Barrel export (P10-049)
├── data/
│   ├── datasources/          # Remote data sources — call backend APIs only
│   ├── models/               # JSON ↔ entity mapping (no scoring logic)
│   └── repository/           # Data-layer repository implementation
├── logic/
│   ├── entity/               # Domain entities (immutable, backend-shaped)
│   ├── provider/             # Riverpod notifiers — display state only
│   └── repository/           # Repository interface
└── ui/
    ├── pages/                # Screen widgets
    └── widgets/              # Reusable UI components
```

## Authority Rules (non-negotiable)

Flutter code in this feature must never:

- Compute correctness for any submitted answer.
- Compute a score, total score, or section score.
- Compute pass/fail.
- Compute deadline status (open/closed/missed/late/expired) from raw timestamps.
- Compute attempt eligibility from local state.
- Write assessment results, skill states, or AIM outputs to any datastore.
- Call the AIM Engine or Python services directly.

All of the above are backend-authoritative. Flutter receives backend-approved
values via the REST API and renders them as-is.

## References

- `docs/phase-10/assessment-authority-rules.md` — binding authority rule set
- `docs/phase-10/mobile-assessment-flow-map.md` — screen-by-screen flow
- `docs/phase-10/assessment-api-contract-map.md` — API endpoint specifications
