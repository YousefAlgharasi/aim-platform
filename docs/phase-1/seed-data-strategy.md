# Seed Data Strategy

## Purpose

This document defines the safe seed-data strategy for AIM Platform Phase 1.

The goal is to support local development, smoke testing, and future CI setup without introducing real learner data, production secrets, or misleading production-like records.

This document is strategy-only. It does not create runtime seed scripts, Prisma schema, migrations, Supabase RLS policies, NestJS modules, Flutter models, Admin Dashboard code, or Student Web App scope.

## Scope

Seed data may be introduced later for:

- Development-only roles.
- Sample skills.
- Sample lessons.
- Sample courses.
- Sample quiz/question fixtures.
- Safe demo users if explicitly needed.
- Smoke-test data for backend and AIM Engine integration.

Seed data must remain safe, clearly fake, non-sensitive, and environment-scoped.

## Non-Scope

This strategy does not define:

- Full production schema.
- Real database migrations.
- Production learner records.
- Real parent records.
- Real admin credentials.
- Supabase Auth user creation automation.
- AI provider credentials.
- Payment/provider data.
- Student Web App fixtures.
- Runtime implementation.

## Core Safety Rules

Seed data must follow these rules:

1. Do not include real learner data.
2. Do not include real parent data.
3. Do not include real emails unless they use safe reserved domains.
4. Do not include phone numbers belonging to real people.
5. Do not include secrets.
6. Do not include access tokens.
7. Do not include refresh tokens.
8. Do not include Supabase service-role keys.
9. Do not include provider API keys.
10. Do not include real AI prompts containing private data.
11. Do not include production IDs.
12. Do not include copied data from real students, teachers, parents, or institutions.

## Allowed Fake Domains

Use reserved or clearly fake domains for seed users:

```text
example.com
example.test
aim.local
dev.local
```

Allowed examples:

```text
learner.demo@example.test
parent.demo@example.test
admin.demo@example.test
reviewer.demo@example.test
```

Do not use personal, customer, school, or production domains.

## Environment Boundary

Seed data is allowed only in non-production environments.

Allowed environments:

- Local development.
- Test.
- CI smoke-test environment.
- Ephemeral preview environments if explicitly approved.

Forbidden environments:

- Production.
- Customer production.
- Shared production-like datasets.
- Real learner onboarding data.

## Seed Categories

### Roles

Seeded roles may be used to test authorization boundaries.

Recommended role seed set:

```text
LEARNER
PARENT
INSTRUCTOR
CONTENT_MANAGER
REVIEWER
ADMIN
SUPER_ADMIN
```

Rules:

- Role names must align with `packages/shared-contracts/enums/common-enums.md`.
- Seed roles must not create real admin credentials.
- Elevated roles must be clearly dev-only.
- Role seed records must not override production role records.

### Sample Skills

Sample skills may be seeded for development and testing.

Recommended skill examples:

```text
english.grammar.present-simple
english.grammar.past-simple
english.vocabulary.daily-routines
english.reading.short-passage
english.listening.basic-dialogue
english.speaking.self-introduction
```

Rules:

- Skill IDs should be deterministic.
- Skill IDs should be stable across local environments.
- Skills must not imply production curriculum completeness.
- Skills must not include proprietary content unless approved.

### Sample Lessons

Sample lessons may be seeded for UI and API development.

Recommended sample lesson examples:

```text
lesson.present-simple-intro
lesson.daily-routines-vocabulary
lesson.short-reading-a1
lesson.basic-dialogue-listening
lesson.self-introduction-speaking
```

Rules:

- Lesson content must be fake or public-safe.
- Lesson content must not include customer-owned curriculum.
- Lesson content must not include copyrighted proprietary material unless licensed.
- Lessons should be minimal and development-oriented.

### Sample Questions

Sample questions may be seeded for quiz/assessment development.

Allowed examples:

```text
Question: Choose the correct sentence.
A) She go to school.
B) She goes to school.
Correct: B
```

Rules:

- Questions must be simple and artificial.
- Questions must not be copied from paid exams or proprietary materials.
- Questions must not be used as real placement-test content unless approved.
- Correct answers may be included for development fixtures.

### Dev-Only Users

Dev-only users may be used only if an implementation task explicitly requires them.

Allowed conceptual examples:

```text
dev-learner-001
dev-parent-001
dev-admin-001
dev-reviewer-001
```

Rules:

- Dev users must not be real people.
- Dev users must not use real emails.
- Dev users must not use real phone numbers.
- Dev users must not include real passwords in committed files.
- Dev users must not require committed Supabase Auth credentials.
- Dev users must be disabled or absent from production.

## Supabase Auth User Handling

Seed strategy must not assume that Supabase Auth users can be safely created from committed seed files.

Rules:

- Do not commit passwords.
- Do not commit Supabase Auth tokens.
- Do not commit service-role keys.
- Do not commit scripts that require production keys.
- If future dev Auth users are needed, create them through documented local-only or CI-only setup.
- Auth user setup must be separate from normal database fixture insertion unless an approved task defines the workflow.

## Backend User Mapping

Seeded backend users must follow the identity mapping plan.

Rules:

- `auth_user_id` values must be fake/local-only or created from local Supabase Auth.
- Seeded `users.auth_user_id` must be unique.
- Do not reuse production Supabase Auth UIDs.
- Do not manually invent production-like Auth UIDs.
- Do not treat seed users as production support accounts.
- Any seed user must clearly indicate its dev/test purpose.

## Parent Relationship Seed Data

Parent-child relationship seed data may be added only for development and test.

Allowed conceptual relation:

```text
parent.demo@example.test -> learner.demo@example.test
```

Rules:

- The relationship must be fake.
- The relationship must not represent real family data.
- Parent-safe exposure rules must be respected.
- Parent seed data must not include real child information.
- Parent access must still be tested through backend ownership logic.

## AIM Engine Seed Data

AIM-related seed data must not encode real learner behavior.

Allowed examples:

```text
sample mastery band: DEVELOPING
sample focus area: present simple
sample recommendation action: REVIEW_LESSON
```

Forbidden examples:

```text
real mastery score
real hesitation index
real frustration score
real retention schedule
real learner weakness history
real learner response timing
```

Rules:

- AIM seed data must be artificial.
- AIM seed data must not train or tune real learner models.
- AIM seed data must not be used as production analytics.
- AIM raw internal values should not be exposed to learner or parent fixtures.

## AI Teacher Seed Data

AI Teacher seed data should be limited to safe demonstration content.

Allowed examples:

```text
User: Explain present simple in one short paragraph.
Teacher: Present simple is used for habits and facts.
```

Forbidden examples:

```text
system prompts
developer prompts
provider responses with metadata
real conversation history
student private messages
provider API payloads
safety traces
```

Rules:

- Do not seed hidden prompts.
- Do not seed provider credentials.
- Do not seed real learner conversations.
- Do not seed raw provider traces.
- Any sample AI Teacher content must be clearly fake.

## Recommended File Placement

Future seed files should be placed under backend-controlled folders only.

Recommended future locations:

```text
services/backend-api/prisma/seeds/
services/backend-api/prisma/seeds/README.md
services/backend-api/prisma/seeds/dev/
services/backend-api/prisma/seeds/test/
```

Do not place seed scripts in:

```text
apps/mobile/
apps/admin/
packages/shared-contracts/
docs/phase-1/
```

Documentation may live in `docs/phase-1/`, but executable seed scripts should be backend-owned.

## Seed Data Format

Future seed data may use TypeScript or JSON depending on the backend implementation task.

Preferred direction for Prisma:

```text
services/backend-api/prisma/seeds/dev.seed.ts
services/backend-api/prisma/seeds/test.seed.ts
```

Rules:

- Seed files must be deterministic.
- Seed files must be idempotent where possible.
- Seed files must avoid environment-specific hardcoded values.
- Seed files must not contain secrets.
- Seed files must be clear about target environment.

## Idempotency Rules

Seed operations should be safe to rerun.

Recommended behavior:

- Upsert roles by stable key.
- Upsert sample skills by stable key.
- Upsert sample lessons by stable slug.
- Avoid duplicate records on repeated runs.
- Never overwrite production records.
- Never delete production-like records.

## Naming Conventions

Recommended prefixes:

```text
dev-
test-
sample-
demo-
```

Examples:

```text
dev-learner-001
sample-skill-present-simple
sample-lesson-present-simple-intro
test-course-english-a1
```

Forbidden naming:

```text
real-user
production-admin
customer-student
actual-parent
```

## Data Volume

Phase 1 seed data should stay minimal.

Recommended initial limits:

| Category | Suggested Limit |
|---|---:|
| Roles | 5–8 |
| Sample skills | 5–10 |
| Sample lessons | 3–5 |
| Sample questions | 5–10 |
| Dev users | 0–4, only if required |
| Parent relationships | 0–2, only if required |

Do not create large fixture sets in Phase 1.

## Security Boundary

Seed data must not weaken security.

Rules:

- Do not disable auth checks for seed data.
- Do not bypass ownership checks using seed flags.
- Do not create permanent admin backdoors.
- Do not expose internal AIM fields to client-facing seed responses.
- Do not add service-role keys to seed scripts.
- Do not create public write paths for seed setup.

## CI Usage

CI may use seed data only if an explicit future task adds test setup.

CI seed data must be:

- Ephemeral.
- Non-secret.
- Fake.
- Small.
- Deterministic.
- Isolated from production.

CI must not use production Supabase projects unless explicitly approved by a deployment policy.

## Local Development Usage

Local developers may use safe seeds to verify:

- API startup.
- Role-based flows.
- Learner-safe response shape.
- Basic course/lesson display.
- Basic skill/recommendation fixtures.
- Parent relationship checks if enabled later.
- Admin/reviewer role surface checks if enabled later.

Local seeds must not become production data.

## Review Checklist Before Adding Seed Data

Before committing future seed data, verify:

```text
[ ] No real learner data.
[ ] No real parent data.
[ ] No real emails outside reserved domains.
[ ] No real phone numbers.
[ ] No passwords.
[ ] No access tokens.
[ ] No refresh tokens.
[ ] No service-role keys.
[ ] No provider API keys.
[ ] No production IDs.
[ ] No hidden AI prompts.
[ ] No real AI Teacher conversations.
[ ] No raw AIM learner analytics.
[ ] No production schema assumptions beyond approved docs.
[ ] No client-side seed execution.
[ ] No Student Web App scope.
```

## Implementation-Ready Direction

When a future task implements seed scripts, it should:

1. Read this strategy.
2. Confirm the environment is non-production.
3. Use backend-owned seed tooling.
4. Use Prisma-aligned structure.
5. Use idempotent operations.
6. Seed only safe roles, skills, lessons, and small fixtures.
7. Avoid real users and secrets.
8. Document how to run seeds locally.
9. Ensure seeds cannot run accidentally against production.

## Non-Goals

This strategy does not:

- Implement seed scripts.
- Create Prisma schema.
- Create migrations.
- Create Supabase Auth users.
- Create production admin accounts.
- Create sample learner progress records from real behavior.
- Create frontend seed logic.
- Create Student Web App fixtures.

## Acceptance Notes

- Roles are included in the seed strategy.
- Sample skills are included in the seed strategy.
- Sample lessons are included in the seed strategy.
- Dev-only user guidance is included.
- Real learner data is explicitly forbidden.
- Secrets are explicitly forbidden.
- Seed strategy is safe and implementation-ready.
- No runtime code was added.
- No database migration was added.
- No credentials were committed.
- No client AIM logic was added.
- No Student Web App work was added.

## Related Documents

- `docs/phase-1/database-implementation-strategy.md`
- `docs/phase-1/identity-mapping-plan.md`
- `docs/phase-1/safe-field-exposure-contract.md`
- `services/backend-api/prisma/README.md`
- `packages/shared-contracts/enums/common-enums.md`
- `docs/tasks/phase_1_task_prompts.md`
