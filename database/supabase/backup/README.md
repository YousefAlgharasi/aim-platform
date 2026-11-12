# Supabase backup (content only)

Exported 2026-11-12 from the self-hosted Supabase Postgres.

- `schema_public.sql` — schema of the `public` schema (no data).
- `curriculum_content_data.sql` — data for curriculum content tables only (levels, courses, chapters, lessons incl. `lessons.explanation`, assets, objectives, skills, questions, vocabulary, practice topics, xp_levels).

Deliberately NOT included: users, auth, payments, chats, progress and other personal data.

Restore: apply `schema_public.sql`, then `curriculum_content_data.sql` (`psql -f`).
