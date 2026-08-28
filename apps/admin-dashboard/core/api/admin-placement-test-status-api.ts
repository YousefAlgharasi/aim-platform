// Phase 4 — P4-058
// Admin placement test status API client.
//
// Scope: Placement Test phase only — admin control of placement test draft/published status.
//
// Endpoints consumed (see PlacementAdminController):
//   POST /admin/placement/tests/:id/publish   — draft -> published
//   POST /admin/placement/tests/:id/archive   — published -> archived
//
// Valid status transitions (backend-enforced):
//   draft     → published   (activates the test; backend enforces PUBLISHED_TEST_EXISTS guard)
//   published → archived    (deactivates; this is a one-way transition — the backend has
//                             no endpoint to move a published test back to draft)
//
// Security rules:
// - Token is read server-side from the HTTP-only cookie; never sent to the browser.
// - Backend is the sole authority for status transitions and active-test enforcement.
// - No placement scoring, CEFR thresholds, skill maps, or weakness maps here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.
//
// Dependencies: P4-038 (placement test read API), P4-054 (admin tests list UI)

import { adminApiClient } from './index';
import { AdminApiClientError } from './admin-api-client-error';
import type { PlacementTestStatus, AdminPlacementTestSummary } from './admin-placement-tests-api';

// ---------------------------------------------------------------------------
// Decoder helpers — structural validation only, no business logic.
// ---------------------------------------------------------------------------

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeStatus(raw: unknown): PlacementTestStatus {
  if (raw === 'draft' || raw === 'published' || raw === 'archived') return raw;
  return 'draft';
}

function decodeTestSummary(raw: unknown): AdminPlacementTestSummary {
  if (!isObject(raw)) throw new Error('Invalid placement test summary shape.');
  return {
    id: typeof raw['id'] === 'string' ? raw['id'] : '',
    title: typeof raw['title'] === 'string' ? raw['title'] : '—',
    status: decodeStatus(raw['status']),
    estimatedMinutes: typeof raw['estimatedMinutes'] === 'number' ? raw['estimatedMinutes'] : 0,
    totalSections: typeof raw['totalSections'] === 'number' ? raw['totalSections'] : 0,
    createdAt: typeof raw['createdAt'] === 'string' ? raw['createdAt'] : '',
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Publish a draft placement test, making it the active placement test.
 * Requires admin token with placement:admin:tests:manage permission.
 *
 * Backend enforces:
 * - Only a test in 'draft' status can be published (409 TEST_NOT_DRAFT otherwise).
 * - Only one test may have status 'published' at a time (409 PUBLISHED_TEST_EXISTS).
 */
export async function publishPlacementTest(
  token: string,
  testId: string,
): Promise<AdminPlacementTestSummary> {
  const envelope = await adminApiClient.post(
    `/admin/placement/tests/${encodeURIComponent(testId)}/publish`,
    decodeTestSummary,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return envelope.data;
}

/**
 * Archive a published placement test, deactivating it.
 * Requires admin token with placement:admin:tests:manage permission.
 *
 * Backend enforces:
 * - Only a test in 'published' status can be archived (409 TEST_NOT_PUBLISHED otherwise).
 * - This transition is one-way — an archived test cannot be restored through this UI.
 */
export async function archivePlacementTest(
  token: string,
  testId: string,
): Promise<AdminPlacementTestSummary> {
  const envelope = await adminApiClient.post(
    `/admin/placement/tests/${encodeURIComponent(testId)}/archive`,
    decodeTestSummary,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return envelope.data;
}

// Re-export for convenience in pages
export { AdminApiClientError };
