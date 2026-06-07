# AIM-023 Pilot Readiness

This task packages the first web cloud pilot into a concrete run plan that can be manually reviewed in Notion.

## Scope

- Cohort: 5 Arabic-speaking A1 English learners.
- Duration: 14 days.
- Platform: React web frontend, FastAPI backend, Supabase Auth, Supabase PostgreSQL.
- Content: 10 A1 lessons plus one shared pre-test/post-test assessment.
- Monitoring: admin pilot dashboard and backend audit events.

## Readiness Gates

1. Backend exposes the student lesson, session, adaptive result, recommendation, and admin overview routes.
2. React web pilot exposes login, dashboard, lesson, quiz session, result, and admin dashboard screens.
3. Lesson files validate against the AIM content schema.
4. The pre/post assessment validates against the AIM assessment schema.
5. Pilot plan validation passes.
6. Backend tests pass with `PYTHONPATH=services/api/src pytest`.
7. Frontend build passes with `npm run build` from `apps/web`.

## Measurement

The primary metric is pre-test to post-test score gain using `PRE_POST_TEST_A1_V1`.

Secondary metrics:
- lesson completion count
- attempt accuracy
- mastery change
- recommendation followed rate
- recommendation outcome success rate
- retention change
- weakness reduction

Speed is not a mastery signal. Any response-time evidence is limited to educational behavior signals such as hesitation, rushing, possible guessing, fatigue or distraction signal, and low confidence signal.

## Manual Notion Update

When this branch is reviewed and tests pass, update AIM-023 manually:

```text
AIM-023 -> Done
```

Use `Review` instead if the pilot owner wants to adjust the day-by-day schedule before running the cohort.
