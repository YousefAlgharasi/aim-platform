# Phase 5 AIM Data Privacy Review

**Task:** P5-081  
**Branch:** `phase5/P5-081-aim-data-privacy-review`  
**Date:** 2026-06-18  
**Reviewer:** Akram Mayed (t7emonster0@gmail.com)  
**Dependencies reviewed:** P5-064 (AIM Audit Logging Service), P5-073 (AIM Result Permission Guards)  
**Scope:** AIM Engine Integration — Backend-to-AIM Engine pipeline only

---

## 1. Review Scope

This review covers all Phase 5 AIM Engine integration code for compliance with data privacy and safe-data-handling requirements. Specifically:

- What data enters the AIM pipeline
- What is persisted, and where
- What is logged (NestJS logger + audit table), and at what granularity
- How AIM results are exposed to clients
- Whether any PII, sensitive learning data, secrets, or raw payloads are at risk

Files reviewed span the following directories:

- `services/backend-api/src/features/aim/` (all non-spec `.ts` files)
- `services/backend-api/prisma/migrations/` (all Phase 5 AIM migration files)
- `apps/mobile/` (Flutter client — checked for any AIM Engine references)

---

## 2. Data Categories in Scope

| Category | Example fields | Sensitivity |
|---|---|---|
| Correlation IDs | `studentId`, `sessionId`, `attemptId`, `backendRequestId`, `requestId` | Low — UUIDs only, no names or contact info |
| AIM outputs | `mastery`, `level`, `severity`, `difficulty`, `recommendations`, `reviewSchedule` | Moderate — adaptive learning decisions |
| Audit metadata | `pipelineStage`, `outcome`, `durationMs`, `attemptNumber`, `integrationErrorCode` | Low — operational metadata only |
| Secrets | `serviceToken`, DB credentials, AI provider keys | Critical — must never appear in logs, code, or responses |
| Student answer content | Raw answer text, question text | High — user-generated content, not logged |
| Student profile data | Names, emails, phone numbers | High — not in AIM pipeline scope |

---

## 3. Findings by Privacy Domain

### 3.1 AIM Engine Service Token

**Finding: PASS**

The service token is loaded exclusively from `BackendConfigService` at runtime. It is used only to construct the `Authorization: Bearer <token>` header inside `AimEngineClientService.buildAuthHeaders()` and is never interpolated into log messages.

Log output on failure uses `toSafeErrorMessage()`, which returns only `error.name` (e.g. `"TimeoutError"`) — never the full error object or stack trace containing any context that could leak the token value.

```
// aim-engine-client.service.ts
private toSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.name;  // ← safe: name only, no message, no stack
  }
  return 'UnknownError';
}
```

**Confirmed:** `serviceToken` appears exactly once in the codebase, in the `buildAuthHeaders` private method. It does not appear in any logger call.

---

### 3.2 AIM Audit Log — Data Written

**Finding: PASS**

The `aim_audit_log` table (P5-041 migration) stores only:

- Correlation UUIDs: `request_id`, `backend_request_id`, `student_id`, `session_id`, `attempt_id`
- Operational metadata: `pipeline_stage`, `outcome`, `integration_error_code`, `attempt_number`, `duration_ms`
- A `metadata` JSONB column gated by a `jsonb_typeof(metadata) = 'object'` DB constraint

The `AimAuditService.record()` method enforces the `AimAuditEntry` type, which explicitly documents in its JSDoc that the `metadata` field must contain only "non-sensitive pipeline context (stage, duration, counts, etc.)" and prohibits request/response bodies, tokens, keys, credentials, and stack traces.

No raw AIM request body (which contains skill-level data and attempt answers) is written to the audit log. No raw AIM response body (which contains mastery computations) is written to the audit log.

**Schema-level protection:** The audit log has restrictive RLS policies (`aim_audit_log_deny_update`, `aim_audit_log_deny_delete`) applied in migration `20260617110000`. No permissive SELECT or INSERT policy exists for the `authenticated` or `anon` role — clients have zero direct access.

---

### 3.3 NestJS Application Logger — Log Volume and Sensitivity

**Finding: PASS (with one noted observation)**

Logger calls across the AIM feature module were reviewed. All calls log only:

- Correlation IDs: `studentId`, `sessionId`, `weaknessId`, `skillId` (UUIDs)
- AIM output enum/scalar values: `severity`, `status`, `count`, `rank`
- Operational flags: `budgetExhausted`, `attemptsMade`, `droppedCodes`
- HTTP-safe fields: `response.status`, `errorCode` (not error message body)

No logger call in the AIM module logs:

- Raw request payloads
- Raw AIM Engine response bodies
- Answer text or question text
- Student name, email, or contact information
- The service token, database credentials, or AI provider keys
- Full exception `.message` strings (only `.name` is used via `toSafeErrorMessage`)

**Observation (informational, not a finding):** Persistence services log AIM output scalar values at `LOG` level on success (e.g. `severity`, `status` for weakness records). These are low-sensitivity enum values representing the AIM Engine's decision — not the raw student response data that produced them. This is acceptable for operational debuggability, but teams should confirm that their production log aggregation platform (e.g. Datadog, Supabase logs) applies appropriate access controls.

---

### 3.4 AIM Result API — Client Data Exposure

**Finding: PASS**

All five AIM result endpoints in `AimResultController` (P5-066 through P5-072) enforce:

1. `SupabaseJwtAuthGuard` — requires a valid Supabase JWT
2. `StudentOwnershipGuard` — validates the `:studentId` route parameter against the JWT's user identity
3. `RequireRoles(AuthorizedRole.STUDENT)` — restricts to student role
4. `RequireStudentOwnership({ paramName: 'studentId' })` — explicit ownership decorator

No endpoint allows cross-student data access. No endpoint returns raw AIM Engine payloads — all returned data is the backend-persisted, backend-validated result. The AIM Engine URL is never exposed in any API response.

---

### 3.5 Flutter / Client — No AIM Engine References

**Finding: PASS**

A search across `apps/mobile/` for AIM Engine references (`aim_engine`, `/aim/v1`, `AimEngine`, `aimEngine`) found only one file: `apps/mobile/docs/no-aim-logic.md`, which is a prohibition document explicitly forbidding the Flutter client from calling the AIM Engine or calculating AIM outputs locally.

No Dart source file in `apps/` contains any AIM Engine call or local AIM calculation.

---

### 3.6 AIM Pipeline — Unvalidated Response Persistence

**Finding: PASS**

The `AimPipelineOrchestratorService` only calls `AimPersistenceService.persist()` when `adapterResult.ok === true`. When the adapter returns `ok: false` (timeout, transport error, response mapping failure), the pipeline enters the fallback path and persistence is skipped entirely. The fallback records only a safe `AimFallbackProfileA` containing no AIM-computed values.

---

### 3.7 Database-Level Access Control

**Finding: PASS**

All 10 Phase 5 AIM and learning runtime tables have `ENABLE ROW LEVEL SECURITY` applied in migration `20260617110000`:

- `student_skill_states`
- `learning_sessions`
- `session_events`
- `lesson_attempts`
- `weakness_records`
- `difficulty_decisions`
- `recommendations`
- `review_schedules`
- `session_summaries`
- `aim_audit_log`

No permissive SELECT, INSERT, UPDATE, or DELETE policy is granted to `anon` or `authenticated` roles for any of these tables. All data access flows exclusively through the backend API's privileged connection.

---

### 3.8 Answers / Mistakes Tables — Content Privacy

**Finding: PASS**

The `answers` and `mistakes` tables (P5-033, P5-034 migrations) store student responses. These tables also have RLS enabled (covered by the Phase 5 migration set). The AIM pipeline reads from them to assemble state (`AimStateAssemblyService`) but does not log their content — only counts and IDs are passed as AIM request fields.

No answer text, question text, or mistake description is written to the audit log or returned via the AIM result API.

---

## 4. Open Items / Recommendations

| # | Severity | Item |
|---|---|---|
| 1 | Low | Application log access controls: confirm production log aggregation (Datadog/Supabase) restricts AIM persistence log entries (which include `studentId` + AIM decision scalars) to authorized operations staff. No code change required — operational configuration item. |
| 2 | Low | `aim_audit_log.metadata` JSONB column has no schema enforcement beyond "must be an object". Future callers should be guided by the `AimAuditEntry.metadata` JSDoc comment. Consider adding a lint rule or schema validator for audit call sites in Phase 6. |
| 3 | Info | `FrustrationSignalService` (P5-062) is registered in `aim.module.ts` but deliberately not called from `AimPersistenceService.persist()` (documented in P5-058 and P5-065). It poses no privacy risk in its current unused state but should be formally deprecated or removed in Phase 6 to eliminate dead code. |

---

## 5. Summary

| Privacy domain | Result |
|---|---|
| Service token not logged | ✅ PASS |
| Audit log: metadata only, no raw payloads | ✅ PASS |
| Audit log: RLS blocks direct client access | ✅ PASS |
| NestJS logger: no PII, no secrets, no answer content | ✅ PASS |
| AIM result API: ownership guards on all endpoints | ✅ PASS |
| Flutter client: zero AIM Engine calls or local AIM logic | ✅ PASS |
| Unvalidated AIM responses not persisted | ✅ PASS |
| All Phase 5 AIM tables behind RLS | ✅ PASS |
| Answer content not logged or exposed | ✅ PASS |

**Overall result: PASS.** No privacy violations or secret exposures were found in Phase 5 AIM Engine integration code. Three low/informational items are noted for Phase 6 follow-up.
