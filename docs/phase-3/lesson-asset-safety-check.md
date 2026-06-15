# Lesson Asset Safety Check

> Phase 3 — P3-063  
> Scope: Curriculum & Content System only.

## Summary

Status: **MAJOR follow-up required**

This check reviewed lesson asset schema, backend service/API behavior, shared contract expectations, permission boundaries, and safe exposure rules. Lesson assets are managed through protected backend APIs and are stored as curriculum metadata only. No onboarding, placement, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App work was added.

The implementation has strong baseline protections around allowed asset types, immutable parent/type fields, draft-only mutation, soft archive behavior, positive ordering, and guarded admin endpoints. The main remaining safety gaps are URL validation and metadata shape validation.

## Files Reviewed

- `packages/shared-contracts/api/lesson-asset-contracts.md`
- `services/backend-api/prisma/migrations/20260614130000_create_lesson_assets_table/migration.sql`
- `services/backend-api/src/features/curriculum/lesson-assets/lesson-assets.types.ts`
- `services/backend-api/src/features/curriculum/lesson-assets/lesson-assets.service.ts`
- `services/backend-api/src/features/curriculum/lesson-assets/lesson-assets.controller.ts`
- `services/backend-api/src/features/curriculum/lesson-assets/lesson-assets.service.spec.ts`
- `docs/phase-3/content-publishing-permissions.md`
- `docs/phase-3/curriculum-permission-guards.md`
- `docs/phase-3/curriculum-source-of-truth.md`
- `docs/phase-3/curriculum-data-model-map.md`
- `docs/phase-3/content-status-lifecycle.md`

## Findings

| ID | Severity | Status | Finding | Evidence | Required follow-up |
|---|---|---:|---|---|---|
| LAS-001 | PASS | Closed | Lesson assets are stored as backend-owned curriculum records, not learner progress/runtime/session data. | Migration comments and table fields are limited to lesson asset metadata, status, ordering, timestamps, and parent lesson linkage. | None. |
| LAS-002 | PASS | Closed | Allowed asset types are constrained consistently. | Migration check and service/type constants allow only `image`, `audio`, `video`, `document`, and `external_reference`. | None. |
| LAS-003 | PASS | Closed | `lesson_id` and `type` are immutable after creation. | `UpdateLessonAssetInput` does not expose `lessonId` or `type`; service update logic never writes those columns. | None. |
| LAS-004 | PASS | Closed | Writes are protected by Phase 2 auth/permission guards. | Controller uses `SupabaseJwtAuthGuard`, `PermissionGuard`, and `CurriculumPermission.CONTENT_UPDATE` / `CONTENT_ARCHIVE`. | None. |
| LAS-005 | PASS | Closed | Draft-only mutation rule is enforced. | `updateAsset` rejects non-draft assets with `403 Forbidden`; tests cover published asset update rejection. | None. |
| LAS-006 | PASS | Closed | Hard delete is not exposed. | Controller exposes `POST /curriculum/lesson-assets/:id/archive`; no delete endpoint exists in code. | None. |
| LAS-007 | PASS | Closed | Ordering has backend checks. | Migration enforces positive order and unique `(lesson_id, order)`; service validates order and checks conflicts before insert/update. | None. |
| LAS-008 | MAJOR | Open | Asset URL fields are not validated as absolute or safe URLs in the service. | Contract says backend validates URL format. Service accepts `url`, `thumbnailUrl`, and URL-like metadata values without URL parsing, scheme checks, or host/path policy. | Add backend URL validation before create/update. Require absolute `https://` URLs where applicable, reject empty/relative/javascript/data URLs, and define storage/CDN/external-reference host policy. |
| LAS-009 | MAJOR | Open | Type-specific metadata shape is not validated. | Contract defines type-specific metadata keys, but service accepts arbitrary JSON for `metadata` and URL-like fields such as `captions_url`, `transcript_url`, and `domain`. | Add type-aware metadata validation or documented allowlist per asset type. Validate nested URL fields with the same safe URL policy. |
| LAS-010 | MINOR | Open | Service does not validate non-negative `sizeBytes` and `durationSeconds` before database write. | Migration has database checks; service passes values through. Tests do not cover negative values. | Add service-level validation for clearer API errors before database constraint failures. |
| LAS-011 | MINOR | Open | Image `alt_text` publish readiness is documented but not enforced by the lesson asset API itself. | Contract and migration comments require image `alt_text` before publish. The asset API has no publish endpoint; enforcement belongs in the backend publish workflow. | Ensure publish validation rejects image assets with blank `alt_text` before any asset or lesson publish path can mark them published. |
| LAS-012 | MINOR | Open | Documentation and implemented archive route differ. | `curriculum-permission-guards.md` lists `DELETE /curriculum/lesson-assets/:id` as soft-delete; implementation uses `POST /curriculum/lesson-assets/:id/archive`. | Update docs or add route alias in a dedicated API consistency task. |

## Safe Exposure Review

Admin lesson asset responses expose:

```text
id, lessonId, type, title, description, url, mimeType, sizeBytes,
durationSeconds, altText, thumbnailUrl, order, status, metadata,
createdAt, updatedAt
```

This matches the shared contract for authenticated admin/content clients. No service-role keys, storage upload credentials, CDN signing keys, database credentials, JWT secrets, or AI provider keys are returned by the lesson asset service.

The remaining exposure risk is not a secret leak in current code; it is insufficient validation of author-supplied URL and metadata fields before storage and later rendering by admin or future client surfaces.

## Checks Run

- Reviewed schema constraints for `lesson_assets`.
- Reviewed backend lesson asset service, controller, types, and tests.
- Reviewed shared lesson asset contract and content permission documentation.
- Ran secret-pattern scan over relevant lesson asset/backend curriculum files.
- Ran scope scan for prohibited Phase 3 areas.

## Required Follow-Up

1. Add backend validation for `url`, `thumbnail_url`, and metadata URL fields.
2. Add type-specific metadata allowlists or validators.
3. Add service-level tests for URL validation, metadata validation, negative size/duration rejection, and image `alt_text` publish readiness once publish validation owns asset publishing.
4. Align route documentation with the implemented archive endpoint.

## Final Status

P3-063 output exists and documents the safety review with classified findings. No runtime code was changed by this task.
