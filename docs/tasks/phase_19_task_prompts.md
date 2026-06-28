# AIM Phase 19 Task Prompts

Phase 19: Placement Test — Production Readiness

Repository:
https://github.com/YousefAlgharasi/aim-platform

## Global Phase 19 Rules

- Work on one task only.
- Select a task from Notion first.
- Claim the task before editing files.
- Do not implement first and assign later.
- Use the exact branch from the task.
- Follow the exact task section in this file.
- Do not mark Done until the branch is pushed.
- All Flutter UI work must follow the approved AIM design system from `apps/mobile/lib/core/design_tokens/`.
- Backend owns all placement scoring, CEFR band assignment, level thresholds, skill signals, and retake policy decisions.
- Client/UI may display backend-approved placement results only. Clients must not compute scores, levels, bands, or skill signals locally.
- No scoring fields, raw weights, threshold values, or internal accuracy data may be exposed to any client.
- Admin CRUD for placement tests, sections, and questions must be guarded by `RoleGuard` requiring `ADMIN` or `SUPER_ADMIN`.
- Student-facing endpoints must use `SupabaseJwtAuthGuard` + `PlacementPermissionGuard`.
- No secrets may be committed.

## Stop Conditions

Stop immediately if:
- TEAM_MEMBER_NOTION_EMAIL is missing.
- The Notion task is already assigned.
- The task is not Undone.
- A dependency is incomplete.
- A dependency output is missing from GitHub.
- Working tree has unrelated changes.
- This prompt file or the exact task section is missing.
- A real secret is detected.
- UI work does not follow the AIM design system.
- Client/UI computes placement scores, levels, bands, or skill signals locally.
- Scoring fields, raw weights, threshold values, or internal accuracy data are exposed to any client.
- Admin placement endpoints are accessible without ADMIN/SUPER_ADMIN role.
- Student-facing placement endpoints skip auth guards.

---

#P19-001

You are an AI coding agent working on AIM Platform Phase 19 — Placement Test Production Readiness.

Work on task P19-001 only.

Task:
Backend Placement Data Safety Audit — Guard all `result.rows[0]` accesses

Branch:
phase19/P19-001-placement-rows-safety

Priority:
P0

Description:
Audit every `.service.ts` file in `services/backend-api/src/features/placement/` for unguarded `result.rows[0]` access after database queries. Any access without a prior `rowCount` or `result.rows.length` check is a crash-on-empty-result bug.

Goal:
Ensure every `result.rows[0]` access in placement services is guarded by a row-existence check, following the safe pattern already established in `placement-test-read.service.ts` (lines 80-88).

Expected output:
Modified `.service.ts` files in `services/backend-api/src/features/placement/` with safety guards added where missing.

Dependencies:
P18-090

Required workflow:
1. Open the Phase 19 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P19-001:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Implementation details:

1. Search all placement service files for `result.rows[0]`:
   ```
   grep -rn "result\.rows\[0\]" services/backend-api/src/features/placement/
   ```

2. For each match, check if the line is preceded by a guard like:
   ```typescript
   if ((result.rowCount ?? 0) === 0) {
     throw new AppError({ code: ApiErrorCode.NOT_FOUND, ... });
   }
   ```
   or:
   ```typescript
   if (!result.rows.length) { ... }
   ```

3. If no guard exists, add one using the same pattern from `placement-test-read.service.ts:80-86`:
   ```typescript
   if ((result.rowCount ?? 0) === 0) {
     throw new AppError({
       code: ApiErrorCode.NOT_FOUND,
       message: '<context-appropriate message>',
       statusCode: HttpStatus.NOT_FOUND,
     });
   }
   ```

4. Files to audit:
   - `placement-attempt.service.ts`
   - `placement-answer-submit.service.ts`
   - `placement-attempt-complete.service.ts`
   - `placement-scoring.service.ts`
   - `placement-result.service.ts`
   - `placement-result-read.service.ts`
   - `placement-initial-learning-path.service.ts`
   - `placement-sections.service.ts`
   - `placement-question-delivery.service.ts`
   - `placement-admin-test-read.service.ts`
   - `placement-retake-policy.service.ts`
   - `placement-audit.service.ts`
   - `placement-answer-validation.service.ts`

5. Do NOT change any query logic, return types, or controller code. Only add row-existence guards.

Scope limits:
- Do not change placement scoring logic, CEFR thresholds, or band assignment.
- Do not modify controller files or add/remove endpoints.
- Do not change query SQL or return types.
- Do not touch files outside `services/backend-api/src/features/placement/`.
- Do not commit secrets.

Done test:
- Every `result.rows[0]` in placement services is preceded by a `rowCount` or `rows.length` guard.
- `grep -rn "result\.rows\[0\]" services/backend-api/src/features/placement/` returns only guarded accesses.
- Existing placement tests still pass: `npm run test -- --testPathPattern=placement` in `services/backend-api/`.
- No scoring logic, API surface, or return types changed.

Completion comment template:
Completed — P19-001

Files created/updated:
- ...

Branch:
phase19/P19-001-placement-rows-safety

Commits:
- <commit hash> — <message>

Checks:
- All `result.rows[0]` accesses guarded: yes/no
- Placement tests pass: yes/no
- No scoring/API changes: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


---

#P19-002

You are an AI coding agent working on AIM Platform Phase 19 — Placement Test Production Readiness.

Work on task P19-002 only.

Task:
Extract Placement Scoring Constants to Config

Branch:
phase19/P19-002-scoring-config

Priority:
P1

Description:
All scoring constants in `placement-scoring.service.ts` (section weights, signal thresholds, level thresholds) are hardcoded. Extract them to a dedicated config file so thresholds can be tuned without code deployment.

Goal:
Create `placement-scoring.config.ts` with all scoring constants. Import from config in `placement-scoring.service.ts`. Current values become defaults.

Expected output:
- `services/backend-api/src/features/placement/placement-scoring.config.ts` (new file)
- `services/backend-api/src/features/placement/placement-scoring.service.ts` (modified to import from config)

Dependencies:
P19-001

Required workflow:
1. Open the Phase 19 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P19-002:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Implementation details:

1. Read `services/backend-api/src/features/placement/placement-scoring.service.ts` (lines 48-74) to identify all hardcoded constants.

2. Create `placement-scoring.config.ts` with the following structure:
   ```typescript
   export const PlacementScoringConfig = {
     sectionWeights: {
       grammar: 0.30,
       vocabulary: 0.30,
       reading: 0.25,
       listening: 0.15,
     },
     signalThresholds: {
       strong: 0.75,
       developing: 0.40,
     },
     levelThresholds: {
       advanced: 0.85,
       upper_intermediate: 0.70,
       intermediate: 0.55,
       elementary: 0.40,
       beginner: 0.00,
     },
   } as const;
   ```

3. In `placement-scoring.service.ts`, replace all hardcoded values with references to `PlacementScoringConfig`.

4. Do NOT add environment variable overrides yet — that is out of scope for this task. Keep it simple: one config object, one import.

5. Update any placement scoring tests that reference the hardcoded values to import from the config file instead, if applicable.

Scope limits:
- Do not change scoring formulas or add new scoring features.
- Do not add environment variable parsing or runtime configuration loading.
- Do not change API contracts, response shapes, or controller logic.
- Do not touch files outside `services/backend-api/src/features/placement/`.
- Do not commit secrets.

Done test:
- `placement-scoring.config.ts` exists and exports all scoring constants.
- `placement-scoring.service.ts` imports and uses config values instead of hardcoded numbers.
- No hardcoded threshold numbers remain in `placement-scoring.service.ts`.
- Scoring behavior is identical — same inputs produce same outputs.
- Existing placement tests still pass.

Completion comment template:
Completed — P19-002

Files created/updated:
- ...

Branch:
phase19/P19-002-scoring-config

Commits:
- <commit hash> — <message>

Checks:
- Config file created with all constants: yes/no
- Service uses config imports: yes/no
- Placement tests pass: yes/no
- Scoring behavior unchanged: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


---

#P19-003

You are an AI coding agent working on AIM Platform Phase 19 — Placement Test Production Readiness.

Work on task P19-003 only.

Task:
Flutter Placement Pages — Design System Token Adoption

Branch:
phase19/P19-003-flutter-design-tokens

Priority:
P1

Description:
Three placement UI pages in the Flutter mobile app use hardcoded `EdgeInsets`, font sizes, and colors instead of AIM design system tokens. Replace them with the approved design tokens from `apps/mobile/lib/core/design_tokens/`.

Goal:
All placement pages use `AimSpacing`, `AimTypography`, `AimColors`, `AimRadius`, and `AimSizes` tokens instead of hardcoded values.

Expected output:
Modified files in `apps/mobile/lib/features/placement/ui/pages/`:
- `placement_start_page.dart`
- `placement_section_page.dart`
- `placement_submit_page.dart`

Dependencies:
P19-001

Required workflow:
1. Open the Phase 19 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P19-003:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Implementation details:

1. Read the design token files to understand available tokens:
   - `apps/mobile/lib/core/design_tokens/aim_spacing.dart` — `AimSpacing.space8`, `.space16`, `.screenPaddingMobile`, `.cardPadding`, `.sectionGap`, `.componentGap`, `.innerGap`, etc.
   - `apps/mobile/lib/core/design_tokens/aim_typography.dart` — text styles
   - `apps/mobile/lib/core/design_tokens/aim_colors.dart` — color palette
   - `apps/mobile/lib/core/design_tokens/aim_radius.dart` — border radius tokens
   - `apps/mobile/lib/core/design_tokens/aim_sizes.dart` — component sizes

2. Read the two placement pages that already use design tokens correctly for reference:
   - `apps/mobile/lib/features/placement/ui/pages/placement_question_page.dart`
   - `apps/mobile/lib/features/placement/ui/pages/placement_result_page.dart`

3. In each of the 3 target files, find and replace:
   - `EdgeInsets.all(16)` → `EdgeInsets.all(AimSpacing.screenPaddingMobile)` or `EdgeInsets.all(AimSpacing.space16)`
   - `EdgeInsets.symmetric(horizontal: 24, vertical: 16)` → use appropriate `AimSpacing` constants
   - Hardcoded `fontSize:` values → use `AimTypography` text styles
   - Hardcoded `Color(0xFF...)` or `Colors.xxx` → use `AimColors` tokens
   - Hardcoded `BorderRadius.circular(8)` → use `AimRadius` tokens
   - Hardcoded `SizedBox(height: 16)` → `SizedBox(height: AimSpacing.space16)`

4. Add the design token import at the top of each file:
   ```dart
   import 'package:aim/core/design_tokens/design_tokens.dart';
   ```

5. Run `flutter analyze` (or `dart analyze`) to verify no regressions.

Scope limits:
- Do not change page layout, widget structure, or navigation logic.
- Do not add new features or modify placement flow behavior.
- Do not change `placement_question_page.dart` or `placement_result_page.dart` (already compliant).
- Do not touch files outside `apps/mobile/lib/features/placement/ui/pages/`.
- Do not commit secrets.

Done test:
- All 3 target files import from `design_tokens.dart`.
- No hardcoded `EdgeInsets.all(N)`, `fontSize: N`, `Color(0xFF...)`, or `BorderRadius.circular(N)` remain in the 3 files.
- `flutter analyze` (or `dart analyze`) reports no new issues in the placement feature.
- Existing placement widget tests pass.
- Visual appearance is unchanged (same spacing/fonts/colors, just using tokens).

Completion comment template:
Completed — P19-003

Files created/updated:
- ...

Branch:
phase19/P19-003-flutter-design-tokens

Commits:
- <commit hash> — <message>

Checks:
- Design tokens imported: yes/no
- No hardcoded styles remain: yes/no
- `flutter analyze` clean: yes/no
- Widget tests pass: yes/no
- AIM design system followed: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


---

#P19-004

You are an AI coding agent working on AIM Platform Phase 19 — Placement Test Production Readiness.

Work on task P19-004 only.

Task:
Implement Admin Placement Write Endpoints (Backend)

Branch:
phase19/P19-004-admin-placement-write

Priority:
P1

Description:
The admin dashboard has API clients for CRUD operations on placement tests, sections, questions, and skills (`apps/admin-dashboard/lib/api/admin-placement-*.ts`), but the backend only has a read-only admin endpoint (`GET /admin/placement/tests` in `placement-admin.controller.ts`). Implement the missing write endpoints.

Goal:
Admin users (ADMIN, SUPER_ADMIN) can create, update, delete, publish, and archive placement tests, sections, questions, and question-skill links through the backend API.

Expected output:
- `services/backend-api/src/features/placement/placement-admin.controller.ts` (extended with write endpoints)
- `services/backend-api/src/features/placement/placement-admin-write.service.ts` (new file)
- Corresponding test file(s) if applicable

Dependencies:
P19-001

Required workflow:
1. Open the Phase 19 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P19-004:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Implementation details:

1. Read the admin dashboard API clients to understand the expected contract:
   - `apps/admin-dashboard/lib/api/admin-placement-tests.ts`
   - `apps/admin-dashboard/lib/api/admin-placement-sections.ts`
   - `apps/admin-dashboard/lib/api/admin-placement-questions.ts`
   - `apps/admin-dashboard/lib/api/admin-placement-skills.ts`

2. Read the existing admin controller for patterns:
   - `services/backend-api/src/features/placement/placement-admin.controller.ts`
   - Uses `SupabaseJwtAuthGuard` + `RoleGuard` with `ADMIN`/`SUPER_ADMIN`

3. Read the placement-related shared contracts for API shapes:
   - `packages/shared-contracts/api/placement-*`

4. Implement these endpoints in the admin controller (extend existing file):

   **Tests:**
   - `POST /admin/placement/tests` — create a new placement test (draft status)
   - `PATCH /admin/placement/tests/:id` — update test metadata (title, estimated_minutes)
   - `DELETE /admin/placement/tests/:id` — delete a draft test (only if no attempts exist)
   - `POST /admin/placement/tests/:id/publish` — change status from draft → published
   - `POST /admin/placement/tests/:id/archive` — change status from published → archived

   **Sections:**
   - `POST /admin/placement/tests/:testId/sections` — add a section to a test
   - `PATCH /admin/placement/sections/:id` — update section metadata
   - `DELETE /admin/placement/sections/:id` — remove a section (only if no answers exist)

   **Questions:**
   - `POST /admin/placement/sections/:sectionId/questions` — add a question
   - `PATCH /admin/placement/questions/:id` — update question text/options
   - `DELETE /admin/placement/questions/:id` — remove a question (only if no answers exist)

   **Question-Skill links:**
   - `POST /admin/placement/questions/:questionId/skills` — link a skill to a question
   - `DELETE /admin/placement/questions/:questionId/skills/:skillId` — unlink a skill

5. Create `placement-admin-write.service.ts` with the database operations. Follow the same SQL query pattern as `placement-admin-test-read.service.ts`.

6. All write endpoints must:
   - Use `@UseGuards(SupabaseJwtAuthGuard, RoleGuard)`
   - Use `@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)`
   - Validate inputs with NestJS `ValidationPipe` (DTOs with `class-validator`)
   - Return appropriate HTTP status codes (201 Created, 200 OK, 204 No Content)
   - Guard all `result.rows[0]` accesses (per P19-001 pattern)

7. Register the new service in the placement module.

Scope limits:
- Do not modify student-facing placement endpoints or controllers.
- Do not change scoring logic, band assignment, or CEFR thresholds.
- Do not modify the admin dashboard frontend code — backend only.
- Do not commit secrets.

Done test:
- All listed admin endpoints respond correctly when called via curl/Postman.
- Endpoints are guarded by ADMIN/SUPER_ADMIN role — unauthenticated and student requests get 401/403.
- Draft test can be published; published test can be archived.
- Delete operations reject if attempts/answers reference the entity.
- Existing placement tests still pass.

Completion comment template:
Completed — P19-004

Files created/updated:
- ...

Branch:
phase19/P19-004-admin-placement-write

Commits:
- <commit hash> — <message>

Checks:
- All write endpoints implemented: yes/no
- RoleGuard on all endpoints: yes/no
- Input validation with DTOs: yes/no
- Delete guards against referenced data: yes/no
- Placement tests pass: yes/no
- No student-facing changes: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


---

#P19-005

You are an AI coding agent working on AIM Platform Phase 19 — Placement Test Production Readiness.

Work on task P19-005 only.

Task:
Student-Web Placement — Align API Paths With Backend Contract

Branch:
phase19/P19-005-student-web-api-alignment

Priority:
P0

Description:
The student-web placement pages (`apps/student-web/src/features/placement/`) call API paths that do not match the NestJS backend controller endpoints. The backend expects `/placement/attempts`, `/placement/attempts/:id/answers`, `/placement/attempts/:id/complete`, `/placement/attempts/:id/result`, but student-web calls `/placement/start`, `/placement/:id/answer`, `/placement/:id/next`, `/placement/:id/result`.

Goal:
All student-web placement API calls match the backend controller contract exactly.

Expected output:
Modified files:
- `apps/student-web/src/features/placement/PlacementEntryPage.tsx`
- `apps/student-web/src/features/placement/PlacementQuestionUI.tsx`
- `apps/student-web/src/features/placement/PlacementResultPage.tsx`

Dependencies:
P19-001

Required workflow:
1. Open the Phase 19 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P19-005:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Implementation details:

1. Read the backend placement controller to confirm the exact endpoint paths:
   - `services/backend-api/src/features/placement/placement.controller.ts`
   
   Backend endpoints (student-facing):
   - `GET /placement/active` — get the active published test
   - `GET /placement/active/sections` — get sections of the active test
   - `GET /placement/sections` — get sections for an attempt
   - `GET /placement/questions` — get questions for a section (query: `sectionId`, `attemptId`)
   - `POST /placement/attempts` — start a new attempt
   - `POST /placement/attempts/:id/answers` — submit an answer
   - `POST /placement/attempts/:id/complete` — complete the attempt
   - `GET /placement/attempts/:id/result` — get the result

2. Fix `PlacementEntryPage.tsx`:
   - Change `GET /placement/status` → `GET /placement/active` (check if active test exists; determine status from attempt history)
   - Change `POST /placement/start` → `POST /placement/attempts`
   - Update response type to match backend: the response returns `{ attemptId }`, not `{ sessionId }`
   - Update `navigate()` call to use `attemptId`

3. Fix `PlacementQuestionUI.tsx`:
   - Change `GET /placement/${id}/next` → `GET /placement/questions?sectionId=...&attemptId=${id}` (fetch questions per section)
   - Change `POST /placement/${id}/answer` → `POST /placement/attempts/${id}/answers`
   - Update request/response types to match backend DTOs
   - Add section-aware navigation: fetch sections first, iterate through them
   - Add explicit "complete" call: `POST /placement/attempts/${id}/complete` when all sections done

4. Fix `PlacementResultPage.tsx`:
   - Change `GET /placement/${id}/result` → `GET /placement/attempts/${id}/result`
   - Update the `PlacementResult` interface to match backend response shape (level → `estimated_level`, no `score` field exposed to client, `skill_signals` array)

5. Update route params in `apps/student-web/src/routes/AppRoutes.tsx` if the URL parameter name changes (e.g., `sessionId` → `attemptId`).

Scope limits:
- Do not change the backend controller or service files.
- Do not add new pages or routes — only fix existing API paths.
- Do not change the visual design or CSS.
- Do not commit secrets.
- Do not expose scoring fields to the client — only display what the backend returns.

Done test:
- All API calls in the 3 placement pages match backend controller endpoints exactly.
- No reference to old paths (`/placement/start`, `/placement/:id/next`, `/placement/:id/answer`) remains.
- `PlacementResultPage` does not display raw scores or weights — only `estimated_level` and `skill_signals`.
- TypeScript compiles without errors.

Completion comment template:
Completed — P19-005

Files created/updated:
- ...

Branch:
phase19/P19-005-student-web-api-alignment

Commits:
- <commit hash> — <message>

Checks:
- API paths match backend contract: yes/no
- No old API paths remain: yes/no
- No scoring fields exposed to client: yes/no
- TypeScript compiles: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


---

#P19-006

You are an AI coding agent working on AIM Platform Phase 19 — Placement Test Production Readiness.

Work on task P19-006 only.

Task:
Placement Retake Cooldown — Move to Environment Config

Branch:
phase19/P19-006-retake-cooldown-config

Priority:
P2

Description:
`RETAKE_COOLDOWN_HOURS = 24` is hardcoded in `placement-retake-policy.service.ts`. Move to environment configuration so different environments can use different cooldowns (e.g., shorter for testing/staging).

Goal:
Retake cooldown hours are read from environment variable `PLACEMENT_RETAKE_COOLDOWN_HOURS` with `24` as default.

Expected output:
- `services/backend-api/src/features/placement/placement-retake-policy.service.ts` (modified)
- `services/backend-api/src/config/backend-config.validation.ts` (add optional env var)
- `.env.example` (document the new variable)

Dependencies:
P19-001

Required workflow:
1. Open the Phase 19 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P19-006:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Implementation details:

1. Read `services/backend-api/src/features/placement/placement-retake-policy.service.ts` to find the hardcoded constant.

2. Read `services/backend-api/src/config/backend-config.validation.ts` and `services/backend-api/src/config/backend-config.service.ts` to understand how env vars are loaded and validated.

3. Add `PLACEMENT_RETAKE_COOLDOWN_HOURS` to the config:
   - Make it optional with default `24`
   - Validate it's a positive integer
   - Expose via `BackendConfigService`

4. In `placement-retake-policy.service.ts`:
   - Inject `BackendConfigService`
   - Replace `private readonly RETAKE_COOLDOWN_HOURS = 24` with `this.config.placementRetakeCooldownHours`

5. Add to `.env.example` under the backend section:
   ```
   # Placement retake cooldown (hours, default: 24)
   # PLACEMENT_RETAKE_COOLDOWN_HOURS=24
   ```

Scope limits:
- Do not change retake policy logic beyond sourcing the constant from config.
- Do not modify other placement services.
- Do not commit secrets.

Done test:
- Service reads cooldown from config/environment.
- Default value is `24` when env var is not set.
- Existing placement tests still pass.
- `.env.example` documents the new variable.

Completion comment template:
Completed — P19-006

Files created/updated:
- ...

Branch:
phase19/P19-006-retake-cooldown-config

Commits:
- <commit hash> — <message>

Checks:
- Cooldown sourced from config: yes/no
- Default 24 preserved: yes/no
- Config validation added: yes/no
- `.env.example` updated: yes/no
- Placement tests pass: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


---

#P19-007

You are an AI coding agent working on AIM Platform Phase 19 — Placement Test Production Readiness.

Work on task P19-007 only.

Task:
Placement Error Codes for i18n Readiness

Branch:
phase19/P19-007-placement-error-codes

Priority:
P2

Description:
Placement service files throw `AppError` with hardcoded English messages (e.g., `'No published placement test found.'`). For Arabic-speaking users, the client must localize these messages. Replace human-readable messages with machine-readable error codes so clients can map codes to localized strings.

Goal:
All `AppError` throws in placement services use a structured `code` field that the client can localize. The `message` field remains for developer debugging but is not displayed to users.

Expected output:
- `services/backend-api/src/features/placement/placement-error-codes.ts` (new file — enum of all placement error codes)
- Modified `.service.ts` files in `services/backend-api/src/features/placement/` with error codes added

Dependencies:
P19-001

Required workflow:
1. Open the Phase 19 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P19-007:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Implementation details:

1. Grep all placement service files for `AppError` or `throw new` to identify every error message:
   ```
   grep -rn "AppError\|throw new" services/backend-api/src/features/placement/
   ```

2. Create `placement-error-codes.ts` with an enum:
   ```typescript
   export enum PlacementErrorCode {
     NO_PUBLISHED_TEST = 'PLACEMENT_NO_PUBLISHED_TEST',
     ATTEMPT_NOT_FOUND = 'PLACEMENT_ATTEMPT_NOT_FOUND',
     ATTEMPT_ALREADY_COMPLETED = 'PLACEMENT_ATTEMPT_ALREADY_COMPLETED',
     RETAKE_COOLDOWN_ACTIVE = 'PLACEMENT_RETAKE_COOLDOWN_ACTIVE',
     QUESTION_NOT_FOUND = 'PLACEMENT_QUESTION_NOT_FOUND',
     DUPLICATE_ANSWER = 'PLACEMENT_DUPLICATE_ANSWER',
     INVALID_OPTION = 'PLACEMENT_INVALID_OPTION',
     // ... add all discovered error cases
   }
   ```

3. In each `AppError` constructor, add the error code:
   ```typescript
   // Before:
   throw new AppError({
     code: ApiErrorCode.NOT_FOUND,
     message: 'No published placement test found.',
     statusCode: HttpStatus.NOT_FOUND,
   });
   
   // After:
   throw new AppError({
     code: ApiErrorCode.NOT_FOUND,
     message: 'No published placement test found.',
     statusCode: HttpStatus.NOT_FOUND,
     errorCode: PlacementErrorCode.NO_PUBLISHED_TEST,
   });
   ```

4. If `AppError` does not support an `errorCode` field, check the AppError class definition. If needed, add the field to AppError — but only if it's a simple addition (optional string field). If AppError is complex, use the existing `code` field with the placement-specific value instead.

Scope limits:
- Do not change error handling logic or control flow.
- Do not modify HTTP status codes.
- Do not add client-side localization — this task is backend-only.
- Do not commit secrets.

Done test:
- `placement-error-codes.ts` exists with an enum covering all placement error cases.
- Every `AppError` throw in placement services includes a placement-specific error code.
- Existing placement tests still pass.
- HTTP status codes unchanged.

Completion comment template:
Completed — P19-007

Files created/updated:
- ...

Branch:
phase19/P19-007-placement-error-codes

Commits:
- <commit hash> — <message>

Checks:
- Error codes enum created: yes/no
- All error throws include codes: yes/no
- Placement tests pass: yes/no
- HTTP status codes unchanged: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


---

#P19-008

You are an AI coding agent working on AIM Platform Phase 19 — Placement Test Production Readiness.

Work on task P19-008 only.

Task:
Placement Analytics Service — Track Completion, Section Performance, and Drop-offs

Branch:
phase19/P19-008-placement-analytics

Priority:
P1

Description:
No metrics are collected on placement completion rates, average scores, section performance, or drop-off points. This data is critical for improving the placement test post-launch. Add placement-specific analytics events.

Goal:
Track placement analytics events at key lifecycle points. Expose an admin-only endpoint for basic placement analytics.

Expected output:
- `services/backend-api/src/features/placement/placement-analytics.service.ts` (new)
- `services/backend-api/src/features/placement/placement-admin.controller.ts` (add analytics endpoint)
- Modified service files that emit analytics events at the right points

Dependencies:
P19-004

Required workflow:
1. Open the Phase 19 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P19-008:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Implementation details:

1. Read the existing `placement-audit.service.ts` to understand the audit logging pattern already in place.

2. Create `placement-analytics.service.ts` that records analytics events to a `placement_analytics_events` table (or reuses the existing audit log table with event types). Events to track:

   - `placement_attempt_started` — when a student starts a new attempt (timestamp, student_id, test_id)
   - `placement_section_completed` — when all questions in a section are answered (section_id, accuracy, time_spent_seconds)
   - `placement_attempt_completed` — when attempt is completed (attempt_id, estimated_level, band, total_time_seconds)
   - `placement_attempt_abandoned` — when an attempt is not completed within a timeout or explicitly abandoned

3. Wire analytics events into existing services:
   - `placement-attempt.service.ts` → emit `placement_attempt_started` after creating attempt
   - `placement-attempt-complete.service.ts` → emit `placement_attempt_completed` after scoring
   - `placement-answer-submit.service.ts` → emit `placement_section_completed` when last question in a section is answered

4. Add admin analytics endpoint in `placement-admin.controller.ts`:
   ```
   GET /admin/placement/analytics
   ```
   Returns:
   - Total attempts, completion rate, average band distribution
   - Per-section average accuracy
   - Drop-off count (started but not completed)

5. The analytics endpoint must be guarded by `RoleGuard` (ADMIN/SUPER_ADMIN).

6. If a database migration is needed for an analytics table, create it under `services/backend-api/prisma/migrations/` following existing naming conventions.

Scope limits:
- Do not change scoring logic or band assignment.
- Do not expose analytics to students or parents — admin-only.
- Do not add real-time dashboards or charts — just the data endpoint.
- Analytics must not slow down the critical placement flow — use fire-and-forget pattern or async logging.
- Do not commit secrets.

Done test:
- Analytics service exists and is wired into the placement flow.
- `GET /admin/placement/analytics` returns aggregate placement data.
- Analytics endpoint is ADMIN/SUPER_ADMIN only.
- Existing placement tests still pass.
- No student-facing behavior changed.

Completion comment template:
Completed — P19-008

Files created/updated:
- ...

Branch:
phase19/P19-008-placement-analytics

Commits:
- <commit hash> — <message>

Checks:
- Analytics service created: yes/no
- Events wired into placement flow: yes/no
- Admin analytics endpoint works: yes/no
- Admin role guard on analytics: yes/no
- Placement tests pass: yes/no
- No student-facing changes: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


---

#P19-009

You are an AI coding agent working on AIM Platform Phase 19 — Placement Test Production Readiness.

Work on task P19-009 only.

Task:
Placement Integration Tests — E2E Flow and Edge Cases

Branch:
phase19/P19-009-placement-e2e-tests

Priority:
P1

Description:
Write backend integration tests covering the complete placement flow end-to-end and critical edge cases. Existing tests cover individual services but not the full lifecycle.

Goal:
A test suite that exercises: start attempt → answer questions → complete → verify result, plus edge cases (retake cooldown, duplicate answers, unauthorized access).

Expected output:
- `services/backend-api/test/features/placement/placement-e2e.spec.ts` (new)

Dependencies:
P19-001, P19-002

Required workflow:
1. Open the Phase 19 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P19-009:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Implementation details:

1. Read the existing placement test files to understand the testing patterns:
   ```
   ls services/backend-api/test/features/placement/
   ```

2. Read 1-2 existing test files to understand test setup, mocking, and assertion patterns.

3. Create `placement-e2e.spec.ts` with the following test cases:

   **Happy path:**
   - Start a new attempt → verify attempt ID returned with status `in_progress`
   - Submit answers for all sections → verify each answer accepted (201)
   - Complete the attempt → verify status changes to `completed`
   - Fetch result → verify `estimated_level` and `skill_signals` returned
   - Verify result does NOT include raw scores, weights, or threshold values

   **Retake policy:**
   - Complete an attempt → immediately try to start another → expect 409/429 with cooldown error
   - Verify cooldown message includes remaining time

   **Duplicate answers:**
   - Submit answer for a question → submit again for same question → expect 409 rejection

   **Authorization:**
   - Attempt to access another student's attempt → expect 403
   - Attempt to access placement without auth → expect 401

   **Edge cases:**
   - Complete an attempt that is already completed → expect 409
   - Submit answer for a question not in the current attempt's test → expect 400/404

4. Follow the existing test setup pattern (beforeAll/afterAll, database seeding, auth token setup).

5. Use the seed data from `database/supabase/seed/seed_06_placement_test.sql` if tests need placement test data.

Scope limits:
- Do not change any production code in this task — tests only.
- Do not add Flutter/mobile tests — backend only.
- Do not commit secrets or real credentials in test fixtures.

Done test:
- `placement-e2e.spec.ts` exists with all listed test cases.
- Tests pass when run with `npm run test -- --testPathPattern=placement-e2e`.
- Tests are isolated — each test cleans up after itself.
- No production code modified.

Completion comment template:
Completed — P19-009

Files created/updated:
- ...

Branch:
phase19/P19-009-placement-e2e-tests

Commits:
- <commit hash> — <message>

Checks:
- E2E happy path test: yes/no
- Retake policy test: yes/no
- Duplicate answer test: yes/no
- Authorization tests: yes/no
- Edge case tests: yes/no
- All tests pass: yes/no
- No production code changed: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


---

#P19-010

You are an AI coding agent working on AIM Platform Phase 19 — Placement Test Production Readiness.

Work on task P19-010 only.

Task:
Phase 19 Placement Production Sign-Off

Branch:
phase19/P19-010-placement-signoff

Priority:
P2

Description:
Create the Phase 19 production readiness sign-off document. Verify all P19 tasks are completed, all tests pass, all security rules are upheld, and the placement feature is production-ready.

Goal:
A checklist document confirming every P19 task output exists, tests pass, and no production blockers remain.

Expected output:
- `docs/phase-19/placement-production-signoff.md`

Dependencies:
P19-001, P19-002, P19-003, P19-004, P19-005, P19-006, P19-007, P19-008, P19-009

Required workflow:
1. Open the Phase 19 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P19-010:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Implementation details:

1. Create `docs/phase-19/placement-production-signoff.md` with the following sections:

   **Task Completion Matrix:**
   | Task | Title | Status | Branch | Output Exists |
   |---|---|---|---|---|
   | P19-001 | Rows Safety Audit | Done/Not Done | ... | yes/no |
   | P19-002 | Scoring Config | Done/Not Done | ... | yes/no |
   | ... | ... | ... | ... | ... |

2. **Test Results:**
   - Run `npm run test -- --testPathPattern=placement` and record pass/fail counts
   - Run `flutter test test/features/placement/` and record results
   - Run `placement-e2e.spec.ts` and record results

3. **Security Checklist:**
   - [ ] No scoring fields exposed to any client
   - [ ] All admin endpoints require ADMIN/SUPER_ADMIN role
   - [ ] All student endpoints require SupabaseJwtAuthGuard + PlacementPermissionGuard
   - [ ] No raw scores, weights, or thresholds in client responses
   - [ ] No secrets in any committed file
   - [ ] Students cannot access other students' attempts

4. **Remaining Known Limitations:**
   - List any deferred items from the plan (AIM Engine integration, adaptive branching, audio questions, multi-language)

5. **Production Deployment Notes:**
   - Required environment variables (new ones added in P19-006)
   - Database migration requirements (if any from P19-008)
   - Render.yaml updates (if any)

Scope limits:
- Do not write code — documentation only.
- Do not modify any source files.
- Do not commit secrets.

Done test:
- Sign-off document exists at `docs/phase-19/placement-production-signoff.md`.
- All tasks listed with verified status.
- Security checklist completed.

Completion comment template:
Completed — P19-010

Files created/updated:
- docs/phase-19/placement-production-signoff.md

Branch:
phase19/P19-010-placement-signoff

Commits:
- <commit hash> — <message>

Checks:
- All P19 tasks verified: yes/no
- Test results recorded: yes/no
- Security checklist completed: yes/no
- Limitations documented: yes/no
- Secrets excluded: yes/no

Limitations:
- ...
