# Course translations release checklist

Release: multilingual course content (`course_translations`) for the backend, Admin Dashboard and Student Web.
Flutter is not part of this release; the mobile app keeps receiving English course text until it is updated.

## How deploys work on this host

- `/opt/aim/deploy.sh` runs `git pull --ff-only`, then `docker compose build` and `up -d`. Only pushed commits are deployed.
- Student Web is not in compose. It is a static build copied to `/var/www/aim-student-web`.
- `.github/workflows/run-migrations.yml` uses a `DATABASE_URL` secret that may still point at the old hosted database. Do not rely on it for the self-hosted database.
- A fresh `prisma migrate deploy` fails on a few old migrations, so production migration history can differ from the repo. Check it before applying anything.

## Phase 0: Before touching anything

- [ ] Review the changes in `services/backend-api`, `apps/admin-dashboard` and `apps/student-web`.
- [ ] Commit and push to `origin/main` (requires explicit approval).
- [ ] Pick a quiet window. No downtime is expected, but watch the logs.

## Phase 1: Backup and read-only checks

- [ ] Back up production: `docker exec supabase-db pg_dump -U supabase_admin -Fc <db> > <backup dir>/pre-course-translations-$(date +%F).dump`. Check the file size and that `pg_restore --list` reads it.
- [ ] Read migration state: `SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at DESC LIMIT 5;` The last entry should be `20261030090000_create_course_billing_tables`, finished.
- [ ] Record the course count: `SELECT count(*) FROM courses;`
- [ ] Confirm the table does not exist yet: `SELECT to_regclass('public.course_translations');`

## Phase 2: Apply the migration (first, because new code reads the table)

Migration: `services/backend-api/prisma/migrations/20261031120000_create_course_translations/migration.sql`

- [ ] If migration history is clean: run `prisma migrate status`, then `prisma migrate deploy` from `services/backend-api` against the production `DATABASE_URL`.
- [ ] If it shows drift: do not run `migrate deploy`. Apply the SQL in one transaction (`psql ... -1 -f migration.sql`), then run `prisma migrate resolve --applied 20261031120000_create_course_translations`.
- [ ] Verify: `SELECT count(*) FROM course_translations WHERE locale = 'en';` equals the course count from Phase 1.
- [ ] Verify there are no `ar` rows yet and `courses.title` / `courses.description` are unchanged.
- [ ] The previous backend keeps working with the new table present, so this step is safe on its own.

## Phase 3: Backend

- [ ] `/opt/aim/deploy.sh backend-api`, then `docker compose ps`.
- [ ] `curl -H 'Accept-Language: ar' <api>/student/courses` returns 200 with a `locale` field (use a student token).
- [ ] `curl '<api>/curriculum/courses?locale=xx'` (admin token) returns English, not an error.
- [ ] Responses include `Vary: Accept-Language` and `Cache-Control: private`.
- [ ] Watch backend logs for SQL errors for a few minutes.

## Phase 4: Admin Dashboard

- [ ] `/opt/aim/deploy.sh admin-dashboard`. The public API URLs are baked in at build time, so keep the compose build args unchanged.
- [ ] Open a course: English and Arabic tabs are present, and the list shows an "Arabic missing" chip.
- [ ] Add an Arabic title and description, save, reopen, and confirm they load.

## Phase 5: Student Web

- [ ] Build `apps/student-web` (`npm run build`) and copy `build/*` to `/var/www/aim-student-web/`.
- [ ] Switch the app to Arabic: the translated course shows Arabic text, untranslated courses show English.
- [ ] Hard-refresh to avoid a cached bundle.

## Phase 6: Final verification

- [ ] Switch back to English and confirm English text.
- [ ] AI Teacher still works (it reads the legacy English columns, which are unchanged).
- [ ] Certificates, payments and enrollment show the translated title.

## Rollback

- Frontends: restore the previous student-web build in `/var/www`; redeploy admin from the previous commit.
- Backend: redeploy the previous commit. It ignores `course_translations`.
- Database (only if required): run `services/backend-api/prisma/migrations/20261031120000_create_course_translations/rollback.sql`. Export non-English rows first (the file explains how). English text is never lost because it still lives in `courses`.

## Not touched by this release

Nginx, SSL, DNS, AWS settings and Docker configuration.

## After release

- Seed migrations that insert courses must also insert an `en` row in `course_translations`.
- Flutter (locale persistence, `Accept-Language` header, locale-aware cache key) is still to do.
