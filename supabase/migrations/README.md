# Supabase Migrations

This folder stores versioned SQL migrations for the AIM database.

Recommended future migration order:

```txt
001_auth_profiles.sql
002_courses_skills_curriculum.sql
003_content_management.sql
004_placement_test.sql
005_learning_sessions.sql
006_aim_engine.sql
007_tutor_ai.sql
008_assessments.sql
009_progress_analytics.sql
010_study_plan_notifications.sql
011_reports_admin.sql
```

Rules:

* Never edit an applied migration directly.
* Add a new migration for each schema change.
* Keep migrations deterministic and reviewable.
