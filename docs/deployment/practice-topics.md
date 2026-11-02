# Practice Speaking + Write a Paragraph: deploy runbook

What changed: new tables (`practice_topics`, `practice_topic_translations`, `practice_attempts`), a new
backend module (`/student/practice/*`, `/admin/practice/topics`), a small hook in the AI teacher for
`practice:` sessions, practice XP in the engagement totals, an admin page, student web pages and mobile
screens. Practice is only usable by a student with a started course they still have access to.

## 1. Database (before the new backend code runs)

```bash
# from services/backend-api, against the production DATABASE_URL
psql "$DATABASE_URL" -1 -f prisma/migrations/20261102230000_create_practice_topics/migration.sql
psql "$DATABASE_URL" -1 -f prisma/seeds/08_practice_topics.sql
```

- The migration only creates new tables; it does not touch existing ones.
- The seed adds 6 speaking + 6 writing topics (English + Arabic). It is safe to re-run.
- If `prisma migrate status` shows drift, apply with `psql` as above, then
  `prisma migrate resolve --applied 20261102230000_create_practice_topics`.

## 2. Backend, admin dashboard, student web

Deploy the backend first (the new tables must exist), then the admin dashboard and student web.

## 3. Mobile

Build and release a new app version. Older app versions simply do not show the new menu items.

## Rollback

Roll back the code first, then (only if you want the data gone) run
`prisma/migrations/20261102230000_create_practice_topics/rollback.sql`.
Practice XP already earned disappears from totals because it is derived from `practice_attempts`.

## Notes

- `ai_prompt` (the role the AI plays, or marking hints) is never returned to students.
- XP: speaking pays `xp_reward` once, after at least 2 spoken turns. Writing pays `xp_reward` for the
  first marked paragraph per topic per day. The 0-100 score is display-only.
- Manage topics, prompts, XP and time limits from the admin dashboard: Learning, Practice Topics.
